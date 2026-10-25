import { checkS3Health } from '../services/s3Service.js';
import { checkSNSHealth } from '../services/snsService.js';
import { config } from '../config/index.js';

export async function getHealth(req, res) {
  // Check S3 accessibility if configured
  const s3Health = await checkS3Health();
  const snsHealth = checkSNSHealth();

  res.status(200).json({
    status: 'ok',
    service: 'CloudRescue API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    storage: {
      provider: 'AWS S3',
      configured: s3Health.configured,
      accessible: s3Health.accessible,
      bucket: s3Health.bucket || null,
      region: s3Health.region || null,
      // Never expose secrets or access keys
      status: s3Health.accessible ? 'healthy' : (s3Health.configured ? 'credentials_or_bucket_error' : 'unconfigured'),
    },
    notifications: {
      provider: 'AWS SNS',
      configured: snsHealth.configured,
      status: snsHealth.status,
      topic: snsHealth.topicArn,
    },
    limits: {
      maxUploadSizeBytes: config.upload.maxSizeBytes,
      allowedExtensions: config.upload.allowedExtensions,
    },
  });
}
