import multer from 'multer';
import path from 'path';
import { config } from '../config/index.js';

// Store files in memory buffer for direct streaming to S3
// Avoids writing unencrypted sensitive files to local disk
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  // Extract extension safely
  const original = file.originalname || '';
  const ext = path.extname(original).toLowerCase().replace(/^\./, '');

  // Handle double extensions like .sql.gz, .tar.gz
  const lowerName = original.toLowerCase();
  const isGzTarOrSql = lowerName.endsWith('.tar.gz') || lowerName.endsWith('.sql.gz') || lowerName.endsWith('.json.gz');

  if (config.upload.allowedExtensions.includes(ext) || isGzTarOrSql) {
    return cb(null, true);
  }

  const err = new Error(
    `Unsupported file type '.${ext}'. Allowed extensions: ${config.upload.allowedExtensions.join(', ')}`
  );
  err.code = 'INVALID_FILE_TYPE';
  return cb(err, false);
}

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: config.upload.maxSizeBytes,
    files: 1, // Strictly one file per upload
  },
  fileFilter,
});
