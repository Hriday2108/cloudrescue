import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { config } from '../config/index.js';

let snsClientInstance = null;

// In-memory application notification history store
// Clearly distinguishes local app notification records from SNS deliveries
const notificationHistory = [
  {
    id: 'notif-init-1',
    type: 'info',
    title: 'CloudRescue System Initialized',
    message: 'Backend API service started. S3 & SNS integrations initialized.',
    timestamp: new Date().toISOString(),
    snsDelivered: false,
    snsMessageId: null,
    details: 'System startup event',
  },
];

export function getSNSClient() {
  if (!snsClientInstance) {
    const clientConfig = {
      region: config.aws.region,
    };
    if (config.aws.credentials) {
      clientConfig.credentials = config.aws.credentials;
    }
    snsClientInstance = new SNSClient(clientConfig);
  }
  return snsClientInstance;
}

/**
 * Checks SNS configuration state
 */
export function checkSNSHealth() {
  return {
    configured: config.isSnsConfigured,
    topicArn: config.aws.snsTopicArn ? maskTopicArn(config.aws.snsTopicArn) : null,
    status: config.isSnsConfigured ? 'enabled' : 'disabled',
  };
}

function maskTopicArn(arn) {
  if (!arn) return null;
  const parts = arn.split(':');
  if (parts.length >= 6) {
    // Mask account number
    parts[4] = '********' + parts[4].slice(-4);
    return parts.join(':');
  }
  return arn;
}

/**
 * Publishes an alert to the configured AWS SNS topic.
 * Safe fallback: If SNS is not configured or publish fails, records local event
 * and returns status without throwing an unhandled exception or breaking S3 operations.
 */
export async function sendNotification({ subject, message, type = 'info', metadata = {} }) {
  const notifRecord = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    title: subject,
    message,
    timestamp: new Date().toISOString(),
    snsConfigured: config.isSnsConfigured,
    snsDelivered: false,
    snsMessageId: null,
    snsError: null,
    metadata,
  };

  if (!config.isSnsConfigured) {
    notifRecord.details = 'SNS not configured — notification recorded in local application history only';
    notificationHistory.unshift(notifRecord);
    return {
      delivered: false,
      reason: 'SNS_TOPIC_ARN_NOT_CONFIGURED',
      notification: notifRecord,
    };
  }

  try {
    const client = getSNSClient();
    const command = new PublishCommand({
      TopicArn: config.aws.snsTopicArn,
      Subject: subject.slice(0, 100), // SNS subject max 100 characters
      Message: typeof message === 'string' ? message : JSON.stringify(message, null, 2),
    });

    const response = await client.send(command);
    notifRecord.snsDelivered = true;
    notifRecord.snsMessageId = response.MessageId;
    notifRecord.details = `SNS published successfully (MessageId: ${response.MessageId})`;
    notificationHistory.unshift(notifRecord);

    return {
      delivered: true,
      messageId: response.MessageId,
      notification: notifRecord,
    };
  } catch (err) {
    notifRecord.snsDelivered = false;
    notifRecord.snsError = err.message;
    notifRecord.details = `SNS publish failed: ${err.message}`;
    notificationHistory.unshift(notifRecord);

    // Return failure details rather than crashing caller
    return {
      delivered: false,
      reason: 'SNS_PUBLISH_FAILED',
      error: err.message,
      notification: notifRecord,
    };
  }
}

/**
 * Returns recorded application notifications history
 */
export function getNotificationHistory({ limit = 50 } = {}) {
  return {
    items: notificationHistory.slice(0, limit),
    total: notificationHistory.length,
    snsConfigured: config.isSnsConfigured,
  };
}
