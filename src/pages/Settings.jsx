import { useState } from 'react';
import { Bell, HardDrive, Shield, Clock, Globe, Database, Save, CheckCircle2, Info } from 'lucide-react';
import { Toggle, ProgressBar } from '../components/ui';
import { useApp } from '../context/AppContext';

const initialPrefs = {
  emailOnSuccess: true,
  emailOnFailure: true,
  emailOnWarning: false,
  smsOnFailure: false,
  weeklyDigest: true,
  storageAlerts: true,
  backupReminders: false,
  drAlerts: true,
};

const storageStats = {
  used: 9.3,
  total: 50,
  regions: [
    { name: 'us-east-1 (Simulated)', used: 6.1, color: 'var(--color-blue)' },
    { name: 'eu-west-1 (Simulated)', used: 2.1, color: 'var(--color-purple)' },
    { name: 'ap-southeast-1 (Simulated)', used: 1.1, color: 'var(--color-green)' },
  ],
};

export default function Settings() {
  const [prefs, setPrefs] = useState(initialPrefs);
  const [saved, setSaved] = useState(false);
  const [backupFreq, setBackupFreq] = useState('daily');
  const [retentionDays, setRetentionDays] = useState('30');
  const [region, setRegion] = useState('us-east-1');
  const { showToast, isLiveBackend, backendHealth, backendError } = useApp();

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const handleSave = () => {
    setSaved(true);
    showToast({ type: 'success', title: 'Settings saved', desc: 'Your preferences have been updated in this browser session.' });
    setTimeout(() => setSaved(false), 3000);
  };

  const storagePct = ((storageStats.used / storageStats.total) * 100).toFixed(0);

  return (
    <main className="page-content" id="main-content">
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Settings</h1>
          <p className="page-desc">Configure notification preferences and storage options.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={handleSave} aria-label="Save settings">
            {saved ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* Backend & AWS Integration Status Card */}
      <div className={`alert ${isLiveBackend ? 'success' : 'info'}`} role="note" style={{ marginBottom: 24 }}>
        <Info size={16} aria-hidden="true" />
        <div className="alert-text">
          <div className="alert-title">
            {isLiveBackend ? 'Backend API Connected' : 'Demo Mode (Offline Frontend)'}
          </div>
          <div className="alert-desc">
            {isLiveBackend ? (
              <div>
                Connected to Node.js backend on <code>http://localhost:5000</code>.
                {' '}S3 Storage: <strong>{backendHealth?.storage?.bucket ? `${backendHealth.storage.bucket} (${backendHealth.storage.region})` : 'Awaiting S3_BUCKET_NAME in backend .env'}</strong>
                {' '}• SNS: <strong>{backendHealth?.notifications?.status === 'enabled' ? 'Active' : 'Disabled (Local Audit Only)'}</strong>
              </div>
            ) : (
              <div>
                Backend server is currently offline ({backendError || 'waiting for connection'}).
                Run <code>npm start</code> in <code>backend/</code> to connect live S3 uploads and SNS notifications.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <section className="settings-section" aria-labelledby="notif-section-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Bell size={18} color="var(--color-blue)" aria-hidden="true" />
          <h2 className="settings-section-title" id="notif-section-title">Notification Preferences</h2>
        </div>
        <p className="settings-section-desc">Configure how and when you receive backup alerts.</p>

        {[
          { key: 'emailOnSuccess', label: 'Email on Backup Success', desc: 'Receive an email when each backup completes successfully' },
          { key: 'emailOnFailure', label: 'Email on Backup Failure', desc: 'Receive an urgent email when a backup fails' },
          { key: 'emailOnWarning', label: 'Email on Backup Warning', desc: 'Receive an email when a backup completes with warnings' },
          { key: 'smsOnFailure', label: 'SMS on Critical Failure', desc: 'Receive an SMS for critical backup failures (requires phone number)' },
          { key: 'weeklyDigest', label: 'Weekly Summary Digest', desc: 'Receive a weekly email summary of all backup activity' },
          { key: 'storageAlerts', label: 'Storage Usage Alerts', desc: 'Alert when storage usage exceeds 80%' },
          { key: 'backupReminders', label: 'Scheduled Backup Reminders', desc: 'Receive reminders 1 hour before each scheduled backup' },
          { key: 'drAlerts', label: 'DR Drill Alerts', desc: 'Notify when disaster recovery drills are scheduled or complete' },
        ].map(item => (
          <div className="settings-item" key={item.key}>
            <div className="settings-item-text">
              <div className="label">{item.label}</div>
              <div className="desc">{item.desc}</div>
            </div>
            <Toggle
              id={`toggle-${item.key}`}
              checked={prefs[item.key]}
              onChange={() => toggle(item.key)}
              aria-label={item.label}
            />
          </div>
        ))}
      </section>

      {/* Backup Configuration */}
      <section className="settings-section" aria-labelledby="backup-config-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Clock size={18} color="var(--color-blue)" aria-hidden="true" />
          <h2 className="settings-section-title" id="backup-config-title">Backup Configuration</h2>
        </div>
        <p className="settings-section-desc">Set your backup schedule and retention policy.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="backup-frequency">Backup Frequency</label>
            <select
              id="backup-frequency"
              className="form-select"
              value={backupFreq}
              onChange={e => setBackupFreq(e.target.value)}
            >
              <option value="hourly">Every Hour</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="retention-days">Retention Period</label>
            <select
              id="retention-days"
              className="form-select"
              value={retentionDays}
              onChange={e => setRetentionDays(e.target.value)}
            >
              <option value="7">7 Days</option>
              <option value="14">14 Days</option>
              <option value="30">30 Days</option>
              <option value="60">60 Days</option>
              <option value="90">90 Days</option>
              <option value="365">1 Year</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="backup-region">Simulated Primary Region</label>
            <select
              id="backup-region"
              className="form-select"
              value={region}
              onChange={e => setRegion(e.target.value)}
            >
              <option value="us-east-1">us-east-1 (N. Virginia)</option>
              <option value="us-west-2">us-west-2 (Oregon)</option>
              <option value="eu-west-1">eu-west-1 (Ireland)</option>
              <option value="ap-southeast-1">ap-southeast-1 (Singapore)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="encryption">Encryption</label>
            <select id="encryption" className="form-select" defaultValue="aes256">
              <option value="aes256">AES-256 (Recommended)</option>
              <option value="aes128">AES-128</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
      </section>

      {/* Storage Information */}
      <section className="settings-section" aria-labelledby="storage-section-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <HardDrive size={18} color="var(--color-blue)" aria-hidden="true" />
          <h2 className="settings-section-title" id="storage-section-title">Simulated Storage Usage</h2>
        </div>
        <p className="settings-section-desc">Overview of simulated storage allocation. Connect to AWS S3 for real data.</p>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
              {storageStats.used} GB used of {storageStats.total} GB
            </span>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              {storagePct}% used
            </span>
          </div>
          <div className="storage-bar">
            <div className="storage-bar-track">
              <div
                className="storage-bar-fill"
                style={{ width: `${storagePct}%`, background: storagePct > 80 ? 'var(--color-red)' : storagePct > 60 ? 'var(--color-yellow)' : 'var(--color-blue)' }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {storageStats.regions.map(r => (
            <div key={r.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 'var(--font-size-sm)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Globe size={12} color={r.color} aria-hidden="true" />
                  {r.name}
                </span>
                <span style={{ color: 'var(--color-text-muted)' }}>{r.used} GB</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(r.used / storageStats.total) * 100}%`, background: r.color }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 20, padding: '12px 16px', background: 'var(--color-surface-2)',
          borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
          fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Shield size={14} color="var(--color-blue)" aria-hidden="true" />
          Storage data is simulated for demo purposes. Real storage metrics will appear here after connecting to AWS S3. No credentials are required or stored in this frontend.
        </div>
      </section>

      {/* Account */}
      <section className="settings-section" aria-labelledby="account-section-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Database size={18} color="var(--color-blue)" aria-hidden="true" />
          <h2 className="settings-section-title" id="account-section-title">Account Information</h2>
        </div>
        <p className="settings-section-desc">Your account details (Demo Mode — read only).</p>
        {[
          { label: 'Full Name', value: 'Alex Rivera' },
          { label: 'Email', value: 'alex.rivera@company.com' },
          { label: 'Role', value: 'Administrator' },
          { label: 'Plan', value: 'Enterprise (Simulated)' },
          { label: 'MFA', value: 'Enabled (Simulated)' },
        ].map(row => (
          <div className="settings-item" key={row.label}>
            <div className="settings-item-text">
              <div className="label">{row.label}</div>
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {row.value}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
