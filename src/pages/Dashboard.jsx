import {
  Database, CheckCircle2, XCircle, HardDrive, TrendingUp,
  TrendingDown, Clock, Activity, ArrowUpRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import { chartData, recentActivity } from '../data/mockData';
import { StatusBadge } from '../components/ui';
import { formatDate } from '../data/mockData';

function StatCard({ label, value, icon: Icon, iconClass, trend, trendLabel }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        <div className={`stat-icon ${iconClass}`} aria-hidden="true">
          <Icon size={16} />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-meta">
        {trend === 'up' && <TrendingUp size={12} className="up" aria-hidden="true" />}
        {trend === 'down' && <TrendingDown size={12} className="down" aria-hidden="true" />}
        <span>{trendLabel}</span>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)', padding: '10px 14px', boxShadow: 'var(--shadow-md)',
        fontSize: 'var(--font-size-xs)',
      }}>
        <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--color-text-primary)' }}>{label}</div>
        {payload.map(p => (
          <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>
            {p.name}: <strong>{p.value}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { backups } = useApp();

  const totalBackups = backups.length;
  const successCount = backups.filter(b => b.status === 'success').length;
  const failedCount = backups.filter(b => b.status === 'error').length;
  const totalBytes = backups.reduce((s, b) => s + b.size, 0);
  const storageMaxGB = 50;
  const storageMaxBytes = storageMaxGB * 1024 ** 3;

  // Smart unit formatter: picks the best unit for the given byte count
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** i;
    return `${value < 10 ? value.toFixed(2) : value < 100 ? value.toFixed(1) : Math.round(value)} ${units[i]}`;
  };

  const storageLabel = formatBytes(totalBytes);
  const storagePct = ((totalBytes / storageMaxBytes) * 100).toFixed(0);

  const recentBackups = [...backups].slice(0, 5);

  return (
    <main className="page-content" id="main-content">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-desc">Welcome back! Here's your backup system overview.</p>
        </div>
        <div className="page-header-actions">
          <div style={{
            background: 'var(--color-green-light)', color: 'var(--color-green)',
            padding: '6px 14px', borderRadius: 20, fontSize: 'var(--font-size-xs)',
            fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #86efac'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-green)' }} />
            All Systems Operational
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards-grid" role="list" aria-label="Key metrics">
        <div role="listitem">
          <StatCard label="Total Backups" value={totalBackups} icon={Database} iconClass="blue"
            trend="up" trendLabel="7 this week" />
        </div>
        <div role="listitem">
          <StatCard label="Storage Used" value={storageLabel} icon={HardDrive} iconClass="purple"
            trend="up" trendLabel={`${storagePct}% of ${storageMaxGB} GB`} />
        </div>
        <div role="listitem">
          <StatCard label="Successful" value={successCount} icon={CheckCircle2} iconClass="green"
            trend="up" trendLabel="Last 7 days" />
        </div>
        <div role="listitem">
          <StatCard label="Failed" value={failedCount} icon={XCircle} iconClass="red"
            trend={failedCount > 0 ? 'down' : 'up'} trendLabel={failedCount > 0 ? 'Needs attention' : 'No failures'} />
        </div>
      </div>

      {/* Charts Row */}
      <div className="dashboard-grid-3">
        {/* Backup Activity Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title-lg">Backup Activity (7 Days)</span>
            <div style={{ display: 'flex', gap: 12, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-blue)', display: 'inline-block' }} />
                Successful
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-red)', display: 'inline-block' }} />
                Failed
              </span>
            </div>
          </div>
          <div className="chart-container" role="img" aria-label="Backup activity chart for the last 7 days">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={14} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="successful" name="Successful" fill="var(--color-blue)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="failed" name="Failed" fill="#fca5a5" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Storage Trend */}
        <div className="card">
          <div className="card-header">
            <span className="card-title-lg">Storage Trend</span>
          </div>
          <div className="chart-container" role="img" aria-label="Storage usage trend chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="storageFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-blue)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--color-blue)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} unit=" GB" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="storage" name="Storage (GB)" stroke="var(--color-blue)" strokeWidth={2} fill="url(#storageFill)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dashboard-grid-2">
        {/* Recent Backups */}
        <div className="card">
          <div className="card-header">
            <span className="card-title-lg">Recent Backups</span>
          </div>
          <div className="table-container">
            <table aria-label="Recent backups table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Size</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBackups.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {b.name}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{b.source}</div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{b.sizeLabel}</td>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                      {formatDate(b.date)}
                    </td>
                    <td><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <span className="card-title-lg">Recent Activity</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              <Activity size={13} aria-hidden="true" />
              Live feed
            </div>
          </div>
          <div className="activity-list" role="list" aria-label="Recent activity feed">
            {recentActivity.map(item => (
              <div className="activity-item" key={item.id} role="listitem">
                <div className={`activity-dot ${item.type}`} aria-hidden="true" />
                <div className="activity-content">
                  <div className="activity-text">{item.text}</div>
                  <div className="activity-time">
                    <Clock size={10} aria-hidden="true" style={{ marginRight: 3 }} />
                    {item.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="card" style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 2 }}>Success Rate</div>
          <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-green)' }}>
            {totalBackups > 0 ? ((successCount / totalBackups) * 100).toFixed(0) : 0}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 2 }}>Avg Backup Time</div>
          <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>3m 28s</div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 2 }}>Next Scheduled</div>
          <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>11:00 PM</div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 2 }}>Retention Policy</div>
          <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>30 Days</div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 2 }}>Simulated Region</div>
          <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>us-east-1</div>
        </div>
      </div>
    </main>
  );
}
