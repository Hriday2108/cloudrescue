import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend folder or root
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const allowedExtensions = (process.env.ALLOWED_FILE_EXTENSIONS || 'sql,tar,gz,zip,json,csv,log,bak,dump,txt,docx,pdf,xlsx,pptx,png,jpg')
  .split(',')
  .map(ext => ext.trim().toLowerCase().replace(/^\./, ''))
  .filter(Boolean);

const frontendOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendOrigins,
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    bucketName: process.env.S3_BUCKET_NAME || '',
    snsTopicArn: process.env.SNS_TOPIC_ARN || '',
    credentials: (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) ? {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      ...(process.env.AWS_SESSION_TOKEN ? { sessionToken: process.env.AWS_SESSION_TOKEN } : {}),
    } : undefined,
  },
  upload: {
    maxSizeBytes: parseInt(process.env.MAX_FILE_SIZE_BYTES || '52428800', 10), // 50MB default
    allowedExtensions,
  },
  restore: {
    stagePath: process.env.RESTORE_STAGE_PATH || './restore_stage',
  },
  // Diagnostics
  isS3Configured: Boolean(process.env.S3_BUCKET_NAME && process.env.AWS_REGION),
  isSnsConfigured: Boolean(process.env.SNS_TOPIC_ARN),
};
