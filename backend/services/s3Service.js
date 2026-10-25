import { S3Client, ListObjectsV2Command, HeadObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { config } from '../config/index.js';

let s3ClientInstance = null;

/**
 * Returns a configured S3 client using the AWS SDK v3 default credential provider chain.
 * Credentials come from environment variables (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY),
 * AWS credentials file (~/.aws/credentials), or IAM roles for EC2/ECS.
 */
export function getS3Client() {
  if (!s3ClientInstance) {
    const clientConfig = {
      region: config.aws.region,
    };
    if (config.aws.credentials) {
      clientConfig.credentials = config.aws.credentials;
    }
    s3ClientInstance = new S3Client(clientConfig);
  }
  return s3ClientInstance;
}

/**
 * Check if the S3 bucket is configured and reachable.
 */
export async function checkS3Health() {
  if (!config.aws.bucketName) {
    return { configured: false, accessible: false, message: 'S3_BUCKET_NAME is not set' };
  }
  try {
    const client = getS3Client();
    await client.send(new ListObjectsV2Command({
      Bucket: config.aws.bucketName,
      MaxKeys: 1,
    }));
    return { configured: true, accessible: true, bucket: config.aws.bucketName, region: config.aws.region };
  } catch (err) {
    return {
      configured: true,
      accessible: false,
      bucket: config.aws.bucketName,
      region: config.aws.region,
      error: err.name || 'S3AccessError',
      message: err.message,
    };
  }
}

/**
 * Uploads a file stream/buffer to S3 under backups/ prefix with server-side encryption.
 * Bucket remains private (no public ACLs).
 */
export async function uploadObject({ key, body, contentType, metadata = {} }) {
  if (!config.aws.bucketName) {
    const err = new Error('AWS S3 bucket is not configured. Set S3_BUCKET_NAME in backend .env.');
    err.code = 'CONFIG_MISSING';
    throw err;
  }

  const client = getS3Client();
  const parallelUpload = new Upload({
    client,
    params: {
      Bucket: config.aws.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
      ServerSideEncryption: 'AES256',
      Metadata: metadata,
    },
  });

  return await parallelUpload.done();
}

/**
 * Lists objects in the S3 bucket under the backups/ prefix.
 */
export async function listBackupObjects({ maxKeys = 50, continuationToken, prefix = 'backups/' } = {}) {
  if (!config.aws.bucketName) {
    const err = new Error('AWS S3 bucket is not configured. Set S3_BUCKET_NAME in backend .env.');
    err.code = 'CONFIG_MISSING';
    throw err;
  }

  const client = getS3Client();
  const command = new ListObjectsV2Command({
    Bucket: config.aws.bucketName,
    Prefix: prefix,
    MaxKeys: Math.min(Math.max(1, maxKeys), 100),
    ContinuationToken: continuationToken,
  });

  const response = await client.send(command);

  const objects = (response.Contents || [])
    // Exclude folder placeholder itself
    .filter(item => item.Key !== prefix && item.Key && !item.Key.endsWith('/'))
    .map(item => {
      const parts = item.Key.split('/');
      const filenameWithId = parts[parts.length - 1];
      // Object key format: backups/bk_<timestamp>_<uuid>/filename.ext OR backups/bk_<timestamp>_<uuid>_filename.ext
      const match = filenameWithId.match(/^(bk_\d+_[a-z0-9]+)_(.+)$/);
      const backupId = match ? match[1] : item.Key.replace(/\//g, '_');
      const originalName = match ? match[2] : filenameWithId;

      return {
        id: backupId,
        objectKey: item.Key,
        name: originalName,
        originalName: originalName,
        size: item.Size,
        lastModified: item.LastModified,
        storageClass: item.StorageClass || 'STANDARD',
        etag: item.ETag ? item.ETag.replace(/"/g, '') : null,
      };
    });

  return {
    items: objects,
    isTruncated: Boolean(response.IsTruncated),
    nextContinuationToken: response.NextContinuationToken || null,
    totalReturned: objects.length,
    bucket: config.aws.bucketName,
  };
}

/**
 * Retrieves metadata for a specific S3 object key.
 */
export async function getObjectMetadata(key) {
  if (!config.aws.bucketName) {
    const err = new Error('AWS S3 bucket is not configured. Set S3_BUCKET_NAME in backend .env.');
    err.code = 'CONFIG_MISSING';
    throw err;
  }

  const client = getS3Client();
  const command = new HeadObjectCommand({
    Bucket: config.aws.bucketName,
    Key: key,
  });

  return await client.send(command);
}

/**
 * Streams an object directly from S3.
 */
export async function getObjectStream(key) {
  if (!config.aws.bucketName) {
    const err = new Error('AWS S3 bucket is not configured. Set S3_BUCKET_NAME in backend .env.');
    err.code = 'CONFIG_MISSING';
    throw err;
  }

  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: config.aws.bucketName,
    Key: key,
  });

  return await client.send(command);
}
