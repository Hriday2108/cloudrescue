import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../server.js';
import http from 'http';

let server;
let baseUrl;

test.before(async () => {
  await new Promise(resolve => {
    // Start on ephemeral port for tests
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise(resolve => server.close(resolve));
});

test('GET /api/health returns 200 with service status and configuration diagnostics', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);

  const json = await res.json();
  assert.equal(json.status, 'ok');
  assert.equal(json.service, 'CloudRescue API');
  assert.ok(json.storage, 'Should include storage diagnostics');
  assert.ok(json.notifications, 'Should include notifications status');
  // Critical safety check: Ensure no secrets are leaked
  assert.equal(json.storage.secretAccessKey, undefined);
  assert.equal(json.storage.accessKeyId, undefined);
});

test('GET /api/backups returns 200 with items array', async () => {
  const res = await fetch(`${baseUrl}/api/backups`);
  assert.equal(res.status, 200);

  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.ok(json.pagination);
});

test('POST /api/backups rejects requests without a file', async () => {
  const res = await fetch(`${baseUrl}/api/backups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(res.status, 400);

  const json = await res.json();
  assert.equal(json.success, false);
});

test('GET /api/backups/:id rejects path traversal attempts with 400', async () => {
  // Try sending path traversal characters encoded or in param
  const res = await fetch(`${baseUrl}/api/backups/..%2F..%2Fetc%2Fpasswd`);
  assert.ok(res.status === 400 || res.status === 404);

  const res2 = await fetch(`${baseUrl}/api/backups/bad!id@#$`);
  assert.equal(res2.status, 400);
  const json2 = await res2.json();
  assert.equal(json2.error, 'InvalidIdentifier');
});

test('GET /api/backups/:id returns 404 for valid non-existent ID', async () => {
  const res = await fetch(`${baseUrl}/api/backups/bk_nonexistent_99999`);
  assert.equal(res.status, 404);

  const json = await res.json();
  assert.equal(json.success, false);
  assert.equal(json.error, 'NotFound');
});

test('POST /api/backups/:id/restore requires explicit confirmation', async () => {
  const res = await fetch(`${baseUrl}/api/backups/bk_test_123/restore`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirmed: false }),
  });
  assert.equal(res.status, 400);

  const json = await res.json();
  assert.equal(json.error, 'ConfirmationRequired');
});

test('GET /api/notifications returns notification audit trail and SNS state', async () => {
  const res = await fetch(`${baseUrl}/api/notifications`);
  assert.equal(res.status, 200);

  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.ok(typeof json.snsConfigured === 'boolean');
});
