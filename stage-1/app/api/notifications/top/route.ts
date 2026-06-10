
import { NextRequest, NextResponse } from 'next/server';
import {
  getTopPriorityNotifications,
  formatNotification,
} from '@/app/utils/notificationPriority';

/**
 * Fetch raw notifications from external evaluation service.
 */
async function fetchNotificationsFromAPI(): Promise<any[]> {
  const endpoint = process.env.NOTIFICATIONS_API_URL;

  if (!endpoint) {
    console.warn('[notifications/top] NOTIFICATIONS_API_URL not configured');
    return [];
  }

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.notifications || [];
  } catch {
    return [];
  }
}

/**
 * GET /api/notifications/top?limit=10
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const topN = parseInt(searchParams.get('limit') || '10', 10);

    const notifications = await fetchNotificationsFromAPI();

    if (notifications.length === 0) {
      return NextResponse.json(
        {
          success: true,
          totalNotifications: 0,
          topNotificationsCount: 0,
          topNotifications: [],
        },
        { status: 200 }
      );
    }

    const topNotifications = getTopPriorityNotifications(notifications, topN);

    const formattedNotifications = topNotifications.map((notif, index) => ({
      ...formatNotification(notif),
      rank: index + 1,
    }));

    return NextResponse.json(
      {
        success: true,
        totalNotifications: notifications.length,
        topNotificationsCount: topN,
        topNotifications: formattedNotifications,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
