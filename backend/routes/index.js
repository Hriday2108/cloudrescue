import { Router } from 'express';
import { getHealth } from '../controllers/healthController.js';
import {
  createBackup,
  getBackups,
  getBackupById,
  downloadBackup,
  restoreBackup,
} from '../controllers/backupController.js';
import { getNotifications } from '../controllers/notificationController.js';
import { uploadMiddleware } from '../middleware/upload.js';
import { validateBackupId } from '../middleware/validate.js';

const router = Router();

// 1. Health & Configuration diagnostics
router.get('/health', getHealth);

// 2. Backup management
router.post('/backups', uploadMiddleware.single('file'), createBackup);
router.get('/backups', getBackups);
router.get('/backups/:id', validateBackupId, getBackupById);
router.get('/backups/:id/download', validateBackupId, downloadBackup);
router.post('/backups/:id/restore', validateBackupId, restoreBackup);

// 3. Notifications history
router.get('/notifications', getNotifications);

export default router;
