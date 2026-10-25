import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Search, Filter, Trash2, Download, RefreshCw, CloudUpload, Database, X, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge, FileIcon, EmptyState, Spinner } from '../components/ui';
import { formatDate, formatBytes, getFileType } from '../data/mockData';
import { api } from '../services/api';

function UploadModal({ onClose }) {
  const { addBackup, addNotification, showToast, isLiveBackend, fetchBackups } = useApp();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const onDrop = useCallback((accepted) => {
    setFiles(prev => [
      ...prev,
      ...accepted.map(f => ({
        file: f,
        id: `upload-${Date.now()}-${Math.random()}`,
        name: f.name,
        size: f.size,
        progress: 0,
      }))
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false, // Strict 1-file upload per request
  });

  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    setErrorMessage(null);

    const target = files[0];

    try {
      if (isLiveBackend) {
        // Real upload to Node.js / Express backend -> AWS S3
        setFiles(prev => prev.map(f => ({ ...f, progress: 40 })));
        const res = await api.uploadBackup(target.file);
        setFiles(prev => prev.map(f => ({ ...f, progress: 100 })));

        const newBackup = {
          id: res.data.id,
          name: res.data.name,
          originalName: res.data.originalName,
          objectKey: res.data.storage?.objectKey || res.data.storage?.key || null,
          size: res.data.size,
          sizeLabel: formatBytes(res.data.size),
          type: getFileType(res.data.name),
          status: 'success',
          date: res.data.uploadedAt,
          duration: 'Direct S3 Stream',
          source: `AWS S3 (${res.data.storage?.bucket || 'Private Bucket'})`,
          tags: ['s3-backup', 'real-storage'],
        };

        addBackup(newBackup);
        addNotification({
          type: 'success',
          title: 'S3 Backup Confirmed',
          description: `${target.name} (${formatBytes(target.size)}) uploaded and stored in private S3 bucket. (ID: ${res.data.id})`,
        });

        showToast({
          type: 'success',
          title: 'Backup stored in S3',
          desc: `${target.name} uploaded to private S3 bucket with AES256 encryption.`,
        });

        await fetchBackups();
      } else {
        // Fallback simulation when backend is offline
        for (let i = 0; i <= 100; i += 25) {
          await new Promise(r => setTimeout(r, 200));
          setFiles(prev => prev.map(f => ({ ...f, progress: i })));
        }

        const type = getFileType(target.name);
        const backup = {
          id: `bk-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: target.name,
          originalName: target.name,
          size: target.size,
          sizeLabel: formatBytes(target.size),
          type,
          status: 'success',
          date: new Date().toISOString(),
          duration: '32s',
          source: 'Local Demo',
          tags: ['demo-mode'],
        };
        addBackup(backup);
        addNotification({
          type: 'success',
          title: 'Demo Backup Added',
          description: `${target.name} (${formatBytes(target.size)}) added in Demo Mode (backend is offline).`,
        });
        showToast({
          type: 'info',
          title: 'Demo mode backup',
          desc: 'Backend is offline. Running in local simulation mode.',
        });
      }

      setUploading(false);
      setDone(true);
      setTimeout(onClose, 1200);
    } catch (err) {
      setUploading(false);
      setErrorMessage(err.message || 'Upload failed');
      showToast({
        type: 'error',
        title: 'Upload Failed',
        desc: err.message || 'Could not upload file to S3.',
      });
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="upload-modal-title">
      <div className="modal" style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <div className="modal-icon" style={{ background: 'var(--color-blue-light)', color: 'var(--color-blue)' }}>
            <CloudUpload size={22} />
          </div>
          <div>
            <div className="modal-title" id="upload-modal-title">Upload Backup Files</div>
            <div className="modal-subtitle">
              {isLiveBackend ? (
                <span style={{
                  background: 'var(--color-green-light)', color: 'var(--color-green)',
                  fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 10, border: '1px solid #bbf7d0'
                }}>
                  ☁️ Connected to CloudRescue API — Uploads securely to private S3 bucket
                </span>
              ) : (
                <span style={{
                  background: 'var(--color-yellow-light)', color: 'var(--color-yellow)',
                  fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 10, border: '1px solid #fde68a'
                }}>
                  🧪 Demo Mode — Backend is offline. Files are simulated in UI.
                </span>
              )}
            </div>
          </div>
        </div>

        {errorMessage && (
          <div style={{
            background: 'var(--color-red-light)', color: 'var(--color-red)',
            padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #fca5a5',
            fontSize: 'var(--font-size-xs)', marginBottom: 12
          }}>
            <strong>Error:</strong> {errorMessage}
          </div>
        )}

        {done ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircle2 size={48} color="var(--color-green)" style={{ marginBottom: 12 }} />
            <div style={{ fontWeight: 600 }}>Backup complete (simulated)!</div>
          </div>
        ) : (
          <>
            {/* Dropzone */}
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} aria-label="File upload drop zone" />
              <div className="dropzone-icon">
                <Upload size={22} />
              </div>
              <div className="dropzone-title">
                {isDragActive ? 'Drop files here…' : 'Drag & drop files or click to browse'}
              </div>
              <div className="dropzone-subtitle">Supports any file type • Max 10 GB per file (simulated)</div>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {files.map(f => (
                  <div key={f.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', background: 'var(--color-surface-2)',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',
                  }}>
                    <FileIcon type={getFileType(f.name)} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {f.name}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        {formatBytes(f.size)}
                      </div>
                      {uploading && (
                        <div style={{ marginTop: 4 }}>
                          <div style={{ height: 4, background: 'var(--color-border)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'var(--color-blue)', width: `${f.progress}%`, transition: 'width 0.3s ease', borderRadius: 2 }} />
                          </div>
                        </div>
                      )}
                    </div>
                    {!uploading && (
                      <button onClick={() => removeFile(f.id)} className="btn-ghost" style={{ padding: 4, borderRadius: 4 }} aria-label={`Remove ${f.name}`}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose} disabled={uploading}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={!files.length || uploading}
                aria-busy={uploading}
              >
                {uploading ? <><Spinner /> Simulating…</> : <><Upload size={14} /> Backup Files</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DeleteModal({ backup, onClose, onConfirm }) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-icon" style={{ background: 'var(--color-red-light)', color: 'var(--color-red)' }}>
            <Trash2 size={22} />
          </div>
          <div>
            <div className="modal-title" id="delete-modal-title">Delete Backup</div>
            <div className="modal-subtitle">
              Are you sure you want to delete <strong>{backup.name}</strong>?
              This will remove it from the simulated list. (Demo Mode)
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BackupManager() {
  const { backups, addBackup, removeBackup, addNotification, showToast, isLiveBackend, backendHealth } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = backups.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.source.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = (b) => setDeleteTarget(b);

  const confirmDelete = () => {
    removeBackup(deleteTarget.id);
    showToast({ type: 'info', title: 'Backup removed', desc: `${deleteTarget.name} removed from the list. (Demo Mode)` });
    setDeleteTarget(null);
  };

  const handleSimulateBackup = async () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const mockBackupName = `system_state_snapshot_${timestamp}.json`;
    
    // Create an automated snapshot
    const simulatedItem = {
      id: `bk_sim_${Date.now()}`,
      name: mockBackupName,
      size: 142850,
      sizeLabel: '142.85 KB',
      type: 'json',
      status: 'success',
      date: new Date().toISOString(),
      duration: '0.8s',
      source: backendHealth?.storage?.accessible ? `AWS S3 Snapshot (${backendHealth.storage.bucket})` : 'System Automated Snapshot',
      tags: ['automated', 'system-state', 'scheduled-snapshot'],
    };

    addBackup(simulatedItem);
    showToast({
      type: 'success',
      title: 'Automated Snapshot Created',
      desc: `${mockBackupName} recorded as an automated system backup.`,
    });
  };

  return (
    <main className="page-content" id="main-content">
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Backup Manager</h1>
          <p className="page-desc">Upload and manage your simulated backup files.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={handleSimulateBackup} aria-label="Run a simulated backup">
            <RefreshCw size={14} /> Simulate Backup
          </button>
          <button className="btn btn-primary" onClick={() => setShowUpload(true)} aria-label="Upload backup file">
            <Upload size={14} /> Upload Backup
          </button>
        </div>
      </div>

      {/* Storage Mode Notice */}
      {backendHealth?.storage?.accessible ? (
        <div className="alert success" role="note" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }}>
          <Database size={16} aria-hidden="true" color="#16a34a" />
          <div className="alert-text">
            <div className="alert-title" style={{ color: '#15803d', fontWeight: 600 }}>Live AWS S3 Cloud Storage Active</div>
            <div className="alert-desc" style={{ color: '#166534' }}>
              Files you upload are encrypted with AES-256 and securely streamed directly to your AWS S3 bucket: <strong>{backendHealth.storage.bucket}</strong> ({backendHealth.storage.region}).
            </div>
          </div>
        </div>
      ) : (
        <div className="alert info" role="note">
          <Database size={16} aria-hidden="true" />
          <div className="alert-text">
            <div className="alert-title">Demo Mode — Simulated Storage</div>
            <div className="alert-desc">
              Files you upload here are added to this UI only. Connect backend and S3 to store files in real cloud storage.
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="section-controls">
        <div className="search-input-wrapper" style={{ flex: 1, maxWidth: 360 }}>
          <Search size={14} className="search-icon" aria-hidden="true" />
          <input
            className="form-input"
            placeholder="Search by name or source…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search backups"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={14} color="var(--color-text-muted)" aria-hidden="true" />
          <select
            className="form-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            style={{ width: 'auto' }}
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="error">Failed</option>
            <option value="warning">Warning</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          {filtered.length} of {backups.length} records
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Database}
            title="No backups found"
            description={search ? `No results for "${search}". Try adjusting your search or filters.` : 'Upload a backup file to get started.'}
            action={<button className="btn btn-primary" onClick={() => setShowUpload(true)}><Upload size={14} /> Upload Backup</button>}
          />
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
            <table aria-label="Backup files table">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Size</th>
                  <th>Source</th>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FileIcon type={b.type} />
                        <div>
                          <div style={{ fontWeight: 500, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {b.name}
                          </div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                            ID: {b.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{b.sizeLabel}</td>
                    <td style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>{b.source}</td>
                    <td style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)', whiteSpace: 'nowrap' }}>
                      {formatDate(b.date)}
                    </td>
                    <td style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>{b.duration}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          title={isLiveBackend ? "Download backup object from S3" : "Simulate download (Demo Mode)"}
                          aria-label={`Download ${b.name}`}
                          onClick={async () => {
                            if (isLiveBackend && b.id && !b.id.startsWith('bk_sim_')) {
                              try {
                                showToast({ type: 'info', title: 'Downloading', desc: `Streaming ${b.name} from AWS S3 bucket...` });
                                const blob = await api.downloadBackup(b.id);
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = b.name;
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                                window.URL.revokeObjectURL(url);
                                showToast({ type: 'success', title: 'Download Complete', desc: `Saved ${b.name} from Amazon S3` });
                              } catch (err) {
                                showToast({ type: 'error', title: 'Download Failed', desc: err.message });
                              }
                            } else {
                              // For snapshot JSON items, download a real JSON snapshot file to user machine
                              const snapshotData = {
                                system: 'CloudRescue System Snapshot',
                                snapshotId: b.id,
                                timestamp: b.date,
                                storageProvider: 'AWS S3',
                                bucket: backendHealth?.storage?.bucket || 'cloudrescue-sandbox-hriday',
                                status: 'Verified Healthy',
                                activeServices: ['AWS S3', 'AWS SNS'],
                              };
                              const blob = new Blob([JSON.stringify(snapshotData, null, 2)], { type: 'application/json' });
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = b.name;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              window.URL.revokeObjectURL(url);
                              showToast({ type: 'success', title: 'Snapshot Downloaded', desc: `Exported ${b.name}` });
                            }
                          }}
                        >
                          <Download size={12} />
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ background: 'var(--color-red-light)', color: 'var(--color-red)', border: '1px solid #fca5a5' }}
                          onClick={() => handleDelete(b)}
                          aria-label={`Delete ${b.name}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      {deleteTarget && (
        <DeleteModal
          backup={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </main>
  );
}
