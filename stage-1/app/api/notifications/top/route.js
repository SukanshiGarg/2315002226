import { getTopPriorityNotifications, formatNotification } from '../../../utils/notificationPriority';

const API_ENDPOINT = 'http://4.224.186.213/evaluation-service/notifications';

async function fetchNotificationsFromAPI() {
  const response = await fetch(API_ENDPOINT, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await response.json();
  return data.notifications || [];
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const topN = parseInt(searchParams.get('limit')) || 10;
  const notifications = await fetchNotificationsFromAPI();

  if (notifications.length === 0) {
    return new Response(
      JSON.stringify({ success: true, data: [], total: 0 }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const topNotifications = getTopPriorityNotifications(notifications, topN);
  const formattedNotifications = topNotifications.map((notif, index) => ({
    ...formatNotification(notif),
    rank: index + 1
  }));

  return new Response(
    JSON.stringify({
      success: true,
      totalNotifications: notifications.length,
      topNotificationsCount: topN,
      topNotifications: formattedNotifications
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
