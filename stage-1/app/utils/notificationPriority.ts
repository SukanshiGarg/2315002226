/**
 * Notification Priority Calculation Utility
 */

interface Notification {
  ID: string;
  Type: 'Placement' | 'Result' | 'Event';
  Message: string;
  Timestamp: string;
  priorityScore?: number;
  rank?: number;
}

interface FormattedNotification {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  priority: string;
  rank: number;
}

const WEIGHT_SCORES: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

/**
 * Calculate priority score for a single notification.
 */
export function calculatePriorityScore(
  notification: Notification,
  maxTimestampMs: number
): number {
  const weightScore = WEIGHT_SCORES[notification.Type] || 0;
  const notificationTime = new Date(notification.Timestamp).getTime();
  const timeDifferenceMs = maxTimestampMs - notificationTime;
  const recencyScore = Math.max(0, 100 - timeDifferenceMs / 1000);
  return weightScore * 33.33 + recencyScore * 0.3;
}

/**
 * Sort and return the top N notifications by priority score.
 */
export function getTopPriorityNotifications(
  notifications: Notification[],
  n: number = 10
): Notification[] {
  if (!notifications || notifications.length === 0) return [];

  const timestamps = notifications.map((n) =>
    new Date(n.Timestamp).getTime()
  );
  const maxTimestamp = Math.max(...timestamps);

  const scored = notifications.map((notification) => ({
    ...notification,
    priorityScore: calculatePriorityScore(notification, maxTimestamp),
  }));

  scored.sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0));

  return scored.slice(0, n);
}

/**
 * Merge new notifications with existing top set, deduplicate, and re-rank.
 */
export function maintainTopNotifications(
  currentTopNotifications: Notification[] | null | undefined,
  newNotifications: Notification[],
  n: number = 10
): Notification[] {
  if (!newNotifications || newNotifications.length === 0) {
    return currentTopNotifications || [];
  }

  const all = [...(currentTopNotifications || []), ...newNotifications];
  const unique = Array.from(
    new Map(all.map((notif) => [notif.ID, notif])).values()
  );

  return getTopPriorityNotifications(unique, n);
}

/**
 * Format a notification for the frontend display model.
 */
export function formatNotification(
  notification: Notification
): FormattedNotification {
  return {
    id: notification.ID,
    type: notification.Type,
    message: notification.Message,
    timestamp: notification.Timestamp,
    priority: notification.priorityScore
      ? notification.priorityScore.toFixed(2)
      : 'N/A',
    rank: notification.rank || 0,
  };
}
