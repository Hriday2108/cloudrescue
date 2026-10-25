// In-memory registry to map validated backupId <-> objectKey and metadata
// This ensures object keys are always controlled server-side, preventing path traversal.

class BackupRegistry {
  constructor() {
    this.registry = new Map();
  }

  register({ id, objectKey, originalName, size, mimeType, uploadedAt = new Date().toISOString(), status = 'success' }) {
    const record = {
      id,
      objectKey,
      originalName,
      size,
      mimeType,
      uploadedAt,
      status,
      lastVerifiedAt: uploadedAt,
    };
    this.registry.set(id, record);
    return record;
  }

  get(id) {
    return this.registry.get(id) || null;
  }

  getByObjectKey(key) {
    for (const record of this.registry.values()) {
      if (record.objectKey === key) return record;
    }
    return null;
  }

  list() {
    return Array.from(this.registry.values());
  }

  delete(id) {
    return this.registry.delete(id);
  }

  /**
   * Syncs with S3 listed objects to ensure any objects already in S3 get a registered ID
   */
  syncFromS3(s3Items) {
    for (const item of s3Items) {
      if (!this.registry.has(item.id)) {
        this.register({
          id: item.id,
          objectKey: item.objectKey,
          originalName: item.originalName,
          size: item.size,
          mimeType: 'application/octet-stream',
          uploadedAt: item.lastModified ? new Date(item.lastModified).toISOString() : new Date().toISOString(),
          status: 'success',
        });
      }
    }
  }
}

export const backupRegistry = new BackupRegistry();
