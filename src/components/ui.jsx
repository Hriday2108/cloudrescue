export function StatusBadge({ status }) {
  const map = {
    success: { label: 'Success', cls: 'success' },
    error: { label: 'Failed', cls: 'error' },
    warning: { label: 'Warning', cls: 'warning' },
    running: { label: 'Running', cls: 'running' },
    pending: { label: 'Pending', cls: 'pending' },
    info: { label: 'Info', cls: 'info' },
    uploading: { label: 'Uploading', cls: 'running' },
    restoring: { label: 'Restoring', cls: 'running' },
    completed: { label: 'Completed', cls: 'success' },
    failed: { label: 'Failed', cls: 'error' },
  };
  const s = map[status] || { label: status, cls: 'info' };
  return (
    <span className={`badge ${s.cls}`} aria-label={`Status: ${s.label}`}>
      <span className="badge-dot" aria-hidden="true" />
      {s.label}
    </span>
  );
}

export function FileIcon({ type }) {
  const typeClass = ['zip', 'sql', 'log', 'json', 'tar', 'csv'].includes(type) ? type : 'default';
  return (
    <div className={`file-icon ${typeClass}`} aria-hidden="true">
      {type?.toUpperCase().slice(0, 3) || 'FILE'}
    </div>
  );
}

export function Spinner({ dark }) {
  return <span className={`spinner ${dark ? 'dark' : ''}`} role="status" aria-label="Loading" />;
}

export function Toggle({ checked, onChange, label, id }) {
  return (
    <label className="toggle" htmlFor={id}>
      <input type="checkbox" id={id} checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-track">
        <span className="toggle-thumb" />
      </span>
      {label && <span className="toggle-label">{label}</span>}
    </label>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state" role="status">
      <div className="empty-state-icon" aria-hidden="true">
        <Icon size={24} color="var(--color-text-muted)" />
      </div>
      <div className="empty-state-title">{title}</div>
      <p className="empty-state-desc">{description}</p>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

export function ProgressBar({ value, max = 100, color = 'blue', label }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="progress-bar" role="progressbar" aria-valuenow={value} aria-valuemax={max} aria-label={label}>
        <div className={`progress-fill ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
