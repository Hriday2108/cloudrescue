import { Bell, Search, Menu, RefreshCw, Beaker } from 'lucide-react';
import { useApp } from '../context/AppContext';

const pageTitles = {
  dashboard: { title: 'Dashboard', desc: 'Overview of your backup and recovery operations' },
  backups: { title: 'Backup Manager', desc: 'Upload and manage your backups' },
  recovery: { title: 'Recovery Center', desc: 'Restore from backup or run a disaster recovery drill' },
  notifications: { title: 'Notifications', desc: 'Backup and recovery alerts' },
  settings: { title: 'Settings', desc: 'Configure preferences and storage' },
};

export default function Topbar({ currentPage, onMenuToggle, onNavigate }) {
  const { unreadCount, isLiveBackend, backendHealth, fetchBackups, fetchNotifications, checkHealth } = useApp();
  const info = pageTitles[currentPage] || pageTitles.dashboard;

  const handleRefresh = async () => {
    await Promise.allSettled([checkHealth(), fetchBackups(), fetchNotifications()]);
  };

  return (
    <header className="topbar" role="banner">
      <button className="topbar-menu-btn icon-btn" onClick={onMenuToggle} aria-label="Toggle sidebar menu">
        <Menu size={18} />
      </button>

      <div>
        <div className="topbar-title">{info.title}</div>
      </div>

      <div className="topbar-spacer" />

      <div className="topbar-actions">
        {/* Backend & AWS Status Badge */}
        {isLiveBackend ? (
          <div
            className="demo-badge"
            style={{
              background: backendHealth?.storage?.accessible ? 'var(--color-green-light)' : 'var(--color-blue-light)',
              color: backendHealth?.storage?.accessible ? 'var(--color-green)' : 'var(--color-blue)',
              borderColor: backendHealth?.storage?.accessible ? '#bbf7d0' : '#bfdbfe',
            }}
            title={backendHealth?.storage?.accessible ? `Connected to S3: ${backendHealth.storage.bucket}` : 'Backend API Connected (S3 Config Ready)'}
          >
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: backendHealth?.storage?.accessible ? 'var(--color-green)' : 'var(--color-blue)',
              display: 'inline-block',
            }} />
            <span>
              {backendHealth?.storage?.accessible
                ? `AWS S3 Connected (${backendHealth.storage.bucket})`
                : 'API Online (Awaiting S3 Bucket)'}
            </span>
          </div>
        ) : (
          <div className="demo-badge" title="Backend not running. Start backend on port 5000 to connect AWS API.">
            <Beaker size={12} />
            <span>Demo Mode — Offline Mock</span>
          </div>
        )}

        {/* Search (desktop) */}
        <div className="topbar-search" role="search">
          <Search size={14} color="var(--color-text-muted)" aria-hidden="true" />
          <input type="search" placeholder="Search backups..." aria-label="Search backups" />
        </div>

        {/* Refresh */}
        <button className="icon-btn" onClick={handleRefresh} aria-label="Refresh data" title="Refresh backups & health">
          <RefreshCw size={15} />
        </button>

        {/* Notifications */}
        <button
          className="icon-btn"
          onClick={() => onNavigate('notifications')}
          aria-label={`Notifications — ${unreadCount} unread`}
        >
          <Bell size={15} />
          {unreadCount > 0 && (
            <span className="badge" aria-hidden="true">{unreadCount}</span>
          )}
        </button>
      </div>
    </header>
  );
}
