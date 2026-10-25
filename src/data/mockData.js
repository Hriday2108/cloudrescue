// ============================================================
// CloudRescue Mock Data Store
// Simulated data only — no backend or AWS connection
// ============================================================

export const mockUser = {
  name: 'Alex Rivera',
  email: 'alex.rivera@company.com',
  role: 'Admin',
  initials: 'AR',
};

export const initialBackups = [
  {
    id: 'bk-001',
    name: 'database_prod_20241025.sql.gz',
    originalName: 'database_prod_20241025.sql.gz',
    size: 2147483648,  // 2 GB
    sizeLabel: '2.00 GB',
    type: 'sql',
    status: 'success',
    date: '2024-10-25T08:00:00Z',
    duration: '4m 12s',
    source: 'Production DB',
    tags: ['database', 'production'],
  },
  {
    id: 'bk-002',
    name: 'media_assets_backup.tar.gz',
    originalName: 'media_assets_backup.tar.gz',
    size: 5368709120,  // 5 GB
    sizeLabel: '5.00 GB',
    type: 'tar',
    status: 'success',
    date: '2024-10-25T06:30:00Z',
    duration: '9m 47s',
    source: 'Media Server',
    tags: ['media', 'assets'],
  },
  {
    id: 'bk-003',
    name: 'user_data_export.json.gz',
    originalName: 'user_data_export.json.gz',
    size: 524288000,  // 500 MB
    sizeLabel: '500 MB',
    type: 'json',
    status: 'error',
    date: '2024-10-24T22:15:00Z',
    duration: '1m 03s',
    source: 'User Service',
    tags: ['users'],
  },
  {
    id: 'bk-004',
    name: 'logs_archive_oct2024.tar',
    originalName: 'logs_archive_oct2024.tar',
    size: 1073741824,  // 1 GB
    sizeLabel: '1.00 GB',
    type: 'tar',
    status: 'success',
    date: '2024-10-24T18:00:00Z',
    duration: '2m 28s',
    source: 'Log Aggregator',
    tags: ['logs'],
  },
  {
    id: 'bk-005',
    name: 'app_config_snapshot.zip',
    originalName: 'app_config_snapshot.zip',
    size: 10485760,  // 10 MB
    sizeLabel: '10 MB',
    type: 'zip',
    status: 'success',
    date: '2024-10-24T12:00:00Z',
    duration: '0m 08s',
    source: 'Config Service',
    tags: ['config'],
  },
  {
    id: 'bk-006',
    name: 'analytics_data_oct.csv.gz',
    originalName: 'analytics_data_oct.csv.gz',
    size: 314572800,  // 300 MB
    sizeLabel: '300 MB',
    type: 'csv',
    status: 'success',
    date: '2024-10-23T09:00:00Z',
    duration: '1m 45s',
    source: 'Analytics Service',
    tags: ['analytics'],
  },
  {
    id: 'bk-007',
    name: 'auth_service_db.sql.gz',
    originalName: 'auth_service_db.sql.gz',
    size: 268435456,  // 256 MB
    sizeLabel: '256 MB',
    type: 'sql',
    status: 'warning',
    date: '2024-10-23T03:00:00Z',
    duration: '3m 21s',
    source: 'Auth DB',
    tags: ['database', 'auth'],
  },
];

export const initialNotifications = [
  {
    id: 'n-001',
    type: 'success',
    title: 'Backup Completed Successfully',
    description: 'database_prod_20241025.sql.gz (2.00 GB) backed up to simulated storage.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 'n-002',
    type: 'error',
    title: 'Backup Failed — Requires Attention',
    description: 'user_data_export.json.gz failed due to a simulated network timeout error.',
    time: '5 hours ago',
    read: false,
  },
  {
    id: 'n-003',
    type: 'success',
    title: 'Backup Completed Successfully',
    description: 'media_assets_backup.tar.gz (5.00 GB) backed up successfully.',
    time: '7 hours ago',
    read: true,
  },
  {
    id: 'n-004',
    type: 'warning',
    title: 'Storage Usage Warning',
    description: 'Simulated storage usage is at 74%. Consider archiving older backups.',
    time: '1 day ago',
    read: true,
  },
  {
    id: 'n-005',
    type: 'info',
    title: 'Scheduled Backup Reminder',
    description: 'Next scheduled backup will run today at 11:00 PM UTC.',
    time: '1 day ago',
    read: true,
  },
  {
    id: 'n-006',
    type: 'success',
    title: 'Recovery Test Successful',
    description: 'Disaster recovery simulation completed successfully in 3m 14s.',
    time: '2 days ago',
    read: true,
  },
  {
    id: 'n-007',
    type: 'warning',
    title: 'Backup Completed with Warnings',
    description: 'auth_service_db.sql.gz completed but checksum verification was skipped.',
    time: '2 days ago',
    read: true,
  },
];

export const chartData = [
  { day: 'Oct 19', successful: 5, failed: 0, storage: 7.8 },
  { day: 'Oct 20', successful: 6, failed: 1, storage: 8.1 },
  { day: 'Oct 21', successful: 4, failed: 0, storage: 8.4 },
  { day: 'Oct 22', successful: 7, failed: 0, storage: 8.6 },
  { day: 'Oct 23', successful: 6, failed: 1, storage: 8.9 },
  { day: 'Oct 24', successful: 5, failed: 1, storage: 9.1 },
  { day: 'Oct 25', successful: 4, failed: 1, storage: 9.3 },
];

export const recentActivity = [
  { id: 'a-001', type: 'success', text: 'Backup database_prod_20241025.sql.gz completed (2.00 GB)', time: '2h ago' },
  { id: 'a-002', type: 'success', text: 'Backup media_assets_backup.tar.gz completed (5.00 GB)', time: '4h ago' },
  { id: 'a-003', type: 'error', text: 'Backup user_data_export.json.gz failed — network timeout', time: '6h ago' },
  { id: 'a-004', type: 'success', text: 'Backup logs_archive_oct2024.tar completed (1.00 GB)', time: '10h ago' },
  { id: 'a-005', type: 'info', text: 'Scheduled backup job started for Config Service', time: '12h ago' },
  { id: 'a-006', type: 'success', text: 'Backup app_config_snapshot.zip completed (10 MB)', time: '16h ago' },
];

export function formatBytes(bytes) {
  if (!bytes || bytes === 0 || isNaN(bytes)) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  if (i < 0 || i >= sizes.length) return `${bytes} B`;
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return 'Just now';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return 'Recently';
  }
}

export function getFileType(name) {
  if (!name || typeof name !== 'string') return 'file';
  const ext = name.split('.').pop().toLowerCase();
  if (['sql', 'db'].includes(ext)) return 'sql';
  if (['zip'].includes(ext)) return 'zip';
  if (['log'].includes(ext)) return 'log';
  if (['json'].includes(ext)) return 'json';
  if (['tar', 'gz', 'tgz'].includes(ext)) return 'tar';
  if (['csv'].includes(ext)) return 'csv';
  if (['doc', 'docx'].includes(ext)) return 'doc';
  if (['pdf'].includes(ext)) return 'pdf';
  return 'file';
}
