const WEIGHT_SCORES = {
  'Placement': 3,
  'Result': 2,
  'Event': 1
};

function calculatePriorityScore(notification, maxTimestampMs) {
  const weightScore = WEIGHT_SCORES[notification.Type] || 0;
  const notificationTime = new Date(notification.Timestamp).getTime();
  const timeDifferenceMs = maxTimestampMs - notificationTime;
  const recencyScore = Math.max(0, 100 - (timeDifferenceMs / 1000));
  const combinedScore = (weightScore * 33.33) + (recencyScore * 0.3);
  return combinedScore;
}

function getTopPriorityNotifications(notifications, n = 10) {
  if (!notifications || notifications.length === 0) {
    return [];
  }
  const timestamps = notifications.map(notif => new Date(notif.Timestamp).getTime());
  const maxTimestamp = Math.max(...timestamps);
  const notificationsWithScores = notifications.map(notification => ({
    ...notification,
    priorityScore: calculatePriorityScore(notification, maxTimestamp)
  }));
  notificationsWithScores.sort((a, b) => b.priorityScore - a.priorityScore);
  return notificationsWithScores.slice(0, n);
}

function maintainTopNotifications(currentTopNotifications, newNotifications, n = 10) {
  if (!newNotifications || newNotifications.length === 0) {
    return currentTopNotifications;
  }
  const allNotifications = [...(currentTopNotifications || []), ...newNotifications];
  const uniqueNotifications = Array.from(
    new Map(allNotifications.map(notif => [notif.ID, notif])).values()
  );
  return getTopPriorityNotifications(uniqueNotifications, n);
}

function formatNotification(notification) {
  return {
    id: notification.ID,
    type: notification.Type,
    message: notification.Message,
    timestamp: notification.Timestamp,
    priority: notification.priorityScore ? notification.priorityScore.toFixed(2) : 'N/A',
    rank: notification.rank || 'N/A'
  };
}

module.exports = {
  calculatePriorityScore,
  getTopPriorityNotifications,
  maintainTopNotifications,
  formatNotification,
  WEIGHT_SCORES
};
