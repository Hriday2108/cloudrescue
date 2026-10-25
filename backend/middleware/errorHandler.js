import multer from 'multer';

export function errorHandler(err, req, res, next) {
  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'FileTooLarge',
        message: 'File exceeds maximum upload size limit.',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'UnexpectedField',
        message: 'File must be submitted in the multipart field named "file".',
      });
    }
    return res.status(400).json({
      success: false,
      error: 'UploadError',
      message: err.message,
    });
  }

  // Custom validation / file type errors
  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      error: 'InvalidFileType',
      message: err.message,
    });
  }

  // Missing AWS configuration
  if (err.code === 'CONFIG_MISSING') {
    return res.status(503).json({
      success: false,
      error: 'ServiceUnavailable',
      message: err.message,
    });
  }

  // S3 / AWS SDK specific errors
  if (err.name === 'NoSuchKey' || err.name === 'NotFound') {
    return res.status(404).json({
      success: false,
      error: 'NotFound',
      message: 'Requested backup was not found in storage.',
    });
  }

  if (err.name === 'AccessDenied' || err.name === 'InvalidAccessKeyId' || err.name === 'SignatureDoesNotMatch') {
    return res.status(502).json({
      success: false,
      error: 'StorageAccessDenied',
      message: 'Storage credentials or IAM permissions are invalid.',
    });
  }

  console.error('[CloudRescue API Error]', {
    method: req.method,
    url: req.originalUrl,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  return res.status(err.status || 500).json({
    success: false,
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected server error occurred.',
  });
}
