/**
 * Validates that the backup ID conforms to expected format
 * Prevents directory traversal like ../../ or injection
 */
export function validateBackupId(req, res, next) {
  const { id } = req.params;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Backup identifier is required',
    });
  }

  // Allow standard alphanumeric, dashes, underscores, and dots (no slashes, backslashes, or null bytes)
  const idRegex = /^[a-zA-Z0-9_\-\.]+$/;
  if (!idRegex.test(id) || id.includes('..') || id.includes('/') || id.includes('\\')) {
    return res.status(400).json({
      success: false,
      error: 'InvalidIdentifier',
      message: 'Invalid backup identifier format. Path characters are not permitted.',
    });
  }

  next();
}

/**
 * Sanitizes original filenames before S3 key creation or download headers
 */
export function sanitizeFilename(filename) {
  if (!filename) return 'backup.bin';
  // Strip path traversal attempts and dangerous characters
  const basename = filename.replace(/^.*[\\\/]/, '');
  // Keep only alphanumeric, dot, underscore, dash
  return basename.replace(/[^a-zA-Z0-9._\-]/g, '_');
}
