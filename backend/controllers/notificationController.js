import { getNotificationHistory } from '../services/snsService.js';

export function getNotifications(req, res) {
  const { limit = 50 } = req.query;
  const history = getNotificationHistory({ limit: parseInt(limit, 10) || 50 });

  res.status(200).json({
    success: true,
    data: history.items,
    total: history.total,
    snsConfigured: history.snsConfigured,
    notice: history.snsConfigured
      ? 'Notifications indicate both local application audit log and AWS SNS topic delivery status.'
      : 'AWS SNS is not configured (SNS_TOPIC_ARN is unset). Showing local application audit history only.',
  });
}
