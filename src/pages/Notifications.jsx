import { CheckCircle2, XCircle, AlertTriangle, Info, Bell, BellOff, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

const iconMap = {
  success: { icon: CheckCircle2, color: 'var(--color-green)', bg: 'var(--color-green-light)' },
  error: { icon: XCircle, color: 'var(--color-red)', bg: 'var(--color-red-light)' },
  warning: { icon: AlertTriangle, color: 'var(--color-yellow)', bg: 'var(--color-yellow-light)' },
  info: { icon: Info, color: 'var(--color-blue)', bg: 'var(--color-blue-light)' },
};

export default function Notifications() {
  const { notifications, markAllRead, markRead, unreadCount } = useApp();

  const unread = notifications.filter(n => !n.read);
  const read = notifications.filter(n => n.read);

  return (
    <main className="page-content" id="main-content">
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Notifications</h1>
          <p className="page-desc">Backup and recovery alerts for your system.</p>
        </div>
        <div className="page-header-actions">
          {unreadCount > 0 && (
            <button className="btn btn-secondary" onClick={markAllRead} aria-label="Mark all notifications as read">
              <Check size={14} /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Unread */}
      {unread.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title-lg">
              Unread
              <span style={{
                marginLeft: 8, background: 'var(--color-blue)', color: 'white',
                fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 12,
              }}>
                {unread.length}
              </span>
            </span>
          </div>
          <div role="list" aria-label="Unread notifications">
            {unread.map(n => {
              const cfg = iconMap[n.type] || iconMap.info;
              const Icon = cfg.icon;
              return (
                <div
                  className="notification-item unread"
                  key={n.id}
                  role="listitem"
                  onClick={() => markRead(n.id)}
                  aria-label={`${n.title} — ${n.time}. Click to mark as read.`}
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && markRead(n.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="notification-icon-wrap" style={{ background: cfg.bg }}>
                    <Icon size={18} color={cfg.color} aria-hidden="true" />
                  </div>
                  <div className="notification-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="notification-title">{n.title}</div>
                      {n.snsDelivered ? (
                        <span style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                          SNS Dispatched
                        </span>
                      ) : n.details ? (
                        <span style={{ fontSize: '0.65rem', background: 'var(--color-surface-2)', color: 'var(--color-text-muted)', padding: '1px 6px', borderRadius: 4, border: '1px solid var(--color-border)' }}>
                          App Audit Log
                        </span>
                      ) : null}
                    </div>
                    <div className="notification-desc">{n.description}</div>
                    <div className="notification-time">{n.time}</div>
                  </div>
                  <div className="notification-unread-dot" aria-label="Unread" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Read */}
      <div className="card">
        <div className="card-header">
          <span className="card-title-lg" style={{ color: 'var(--color-text-secondary)' }}>Earlier</span>
        </div>
        {read.length === 0 && notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
            <BellOff size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div style={{ fontWeight: 600 }}>No notifications</div>
            <div style={{ fontSize: 'var(--font-size-sm)', marginTop: 4 }}>You're all caught up!</div>
          </div>
        ) : read.length === 0 ? (
          <div style={{ padding: '16px 0', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            No earlier notifications.
          </div>
        ) : (
          <div role="list" aria-label="Read notifications">
            {read.map(n => {
              const cfg = iconMap[n.type] || iconMap.info;
              const Icon = cfg.icon;
              return (
                <div className="notification-item" key={n.id} role="listitem" style={{ opacity: 0.7 }}>
                  <div className="notification-icon-wrap" style={{ background: cfg.bg }}>
                    <Icon size={18} color={cfg.color} aria-hidden="true" />
                  </div>
                  <div className="notification-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="notification-title" style={{ fontWeight: 500 }}>{n.title}</div>
                      {n.snsDelivered ? (
                        <span style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                          SNS Dispatched
                        </span>
                      ) : n.details ? (
                        <span style={{ fontSize: '0.65rem', background: 'var(--color-surface-2)', color: 'var(--color-text-muted)', padding: '1px 6px', borderRadius: 4, border: '1px solid var(--color-border)' }}>
                          App Audit Log
                        </span>
                      ) : null}
                    </div>
                    <div className="notification-desc">{n.description}</div>
                    <div className="notification-time">{n.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
