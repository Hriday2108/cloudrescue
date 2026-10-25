// ==============================================================
// CloudRescue API Client Utility
// Centralizes all requests to the Node.js/Express backend.
// Reads backend URL from VITE_API_BASE_URL (defaults to http://localhost:5000/api)
// ==============================================================

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  /**
   * Safe fetch wrapper with JSON parsing and standardized error handling
   */
  async request(path, options = {}) {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const headers = { ...options.headers };

    // Do not set Content-Type if FormData is used (browser sets multipart/form-data with boundary)
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const res = await fetch(url, {
        ...options,
        headers,
      });

      // Special handling for file download streams
      if (options.asBlob) {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Download failed: ${res.status} ${res.statusText}`);
        }
        return await res.blob();
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const error = new Error(data.message || `Request failed with status ${res.status}`);
        error.status = res.status;
        error.code = data.error || 'API_ERROR';
        error.details = data;
        throw error;
      }

      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        const connError = new Error('Backend server is unreachable. Check if the Node.js backend is running on port 5000.');
        connError.code = 'BACKEND_OFFLINE';
        throw connError;
      }
      throw err;
    }
  }

  // 1. Health & Diagnostics
  async getHealth() {
    return this.request('/health');
  }

  // 2. List backups
  async getBackups(limit = 50) {
    return this.request(`/backups?limit=${limit}`);
  }

  // 3. Get backup details
  async getBackup(id) {
    return this.request(`/backups/${encodeURIComponent(id)}`);
  }

  // 4. Upload backup (multipart/form-data)
  async uploadBackup(file) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/backups', {
      method: 'POST',
      body: formData,
    });
  }

  // 5. Download backup binary
  async downloadBackup(id) {
    const blob = await this.request(`/backups/${encodeURIComponent(id)}/download`, {
      asBlob: true,
    });
    return blob;
  }

  // 6. Restore backup
  async restoreBackup(id, { confirmed = true, targetEnvironment = 'staging-sandbox' } = {}) {
    return this.request(`/backups/${encodeURIComponent(id)}/restore`, {
      method: 'POST',
      body: JSON.stringify({ confirmed, targetEnvironment }),
    });
  }

  // 7. Get notification history
  async getNotifications(limit = 50) {
    return this.request(`/notifications?limit=${limit}`);
  }
}

export const api = new ApiClient(API_BASE);
