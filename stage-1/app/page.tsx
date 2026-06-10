'use client';

/**
 * Home Page — Priority Inbox Dashboard
 * Displays the top N highest-priority unread notifications.
 */

import { useState, useEffect } from 'react';
import { Log } from '@/lib/logger';
import styles from './page.module.css';

interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  priority: string;
  rank: number;
}

export default function Home(): JSX.Element {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [topN, setTopN] = useState<number>(10);
  const [totalNotifications, setTotalNotifications] = useState<number>(0);

  // Log page load (once)
  useEffect(() => {
    Log('frontend', 'info', 'page', 'Home page loaded');
  }, []);

  /**
   * Fetch top notifications from the internal API route.
   */
  const fetchTopNotifications = async (limit: number): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      Log('frontend', 'info', 'api', `Fetching top ${limit} notifications`);

      const response = await fetch(`/api/notifications/top?limit=${limit}`);

      if (!response.ok) {
        Log('frontend', 'error', 'api', `API error: ${response.status}`);
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();

      Log(
        'frontend',
        'info',
        'api',
        `Successfully fetched ${data.topNotifications?.length ?? 0} notifications`
      );

      setNotifications(data.topNotifications ?? []);
      setTotalNotifications(data.totalNotifications ?? 0);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch notifications';

      Log('frontend', 'error', 'api', `Notification fetch failed: ${errorMessage}`);
      setError('Failed to fetch notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when topN changes
  useEffect(() => {
    fetchTopNotifications(topN);
  }, [topN]);

  /**
   * Handle user changing the notification limit.
   */
  const handleLimitChange = (newLimit: number): void => {
    Log('frontend', 'info', 'page', `User changed notification limit to ${newLimit}`);
    setTopN(newLimit);
  };

  /**
   * Get the appropriate icon for a notification type.
   */
  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'Placement':
        return '💼';
      case 'Result':
        return '📊';
      case 'Event':
        return '📅';
      default:
        return '📌';
    }
  };

  /**
   * Get the CSS module class for a notification type badge.
   */
  const getTypeBadgeClass = (type: string): string => {
    switch (type) {
      case 'Placement':
        return styles.typePlacement;
      case 'Result':
        return styles.typeResult;
      case 'Event':
        return styles.typeEvent;
      default:
        return styles.typeDefault;
    }
  };

  /**
   * Get the CSS module class for a rank badge (gold/silver/bronze for top 3).
   */
  const getRankClass = (rank: number): string => {
    switch (rank) {
      case 1:
        return styles.rankGold;
      case 2:
        return styles.rankSilver;
      case 3:
        return styles.rankBronze;
      default:
        return styles.rank;
    }
  };

  return (
    <div className={styles.container}>
      {/* ── Header ────────────────────────────────── */}
      <header className={styles.header}>
        <span className={styles.headerIcon}>🔔</span>
        <h1>Priority Inbox</h1>
        <p>
          Top {topN} highest-priority unread notifications
        </p>
      </header>

      {/* ── Controls ──────────────────────────────── */}
      <div className={styles.controls}>
        <label htmlFor="notification-limit">Show top:</label>
        <select
          id="notification-limit"
          value={topN}
          onChange={(e) => handleLimitChange(parseInt(e.target.value, 10))}
          className={styles.select}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <span className={styles.total}>
          {totalNotifications} total notification{totalNotifications !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Loading State ─────────────────────────── */}
      {loading && (
        <div className={styles.loading}>Loading notifications…</div>
      )}

      {/* ── Error State ───────────────────────────── */}
      {error && <div className={styles.error}>{error}</div>}

      {/* ── Empty State ───────────────────────────── */}
      {!loading && notifications.length === 0 && !error && (
        <div className={styles.empty}>No notifications found</div>
      )}

      {/* ── Notification Cards ────────────────────── */}
      {!loading && notifications.length > 0 && (
        <div className={styles.notificationsList}>
          {notifications.map((notification) => (
            <div key={notification.id} className={styles.notificationCard}>
              <div className={styles.notificationHeader}>
                <span className={getRankClass(notification.rank)}>
                  {notification.rank}
                </span>
                <span className={styles.icon}>
                  {getTypeIcon(notification.type)}
                </span>
                <span className={getTypeBadgeClass(notification.type)}>
                  {notification.type}
                </span>
                <span className={styles.priority}>
                  Score {notification.priority}
                </span>
              </div>
              <div className={styles.notificationBody}>
                <p className={styles.message}>{notification.message}</p>
                <time className={styles.timestamp}>
                  {new Date(notification.timestamp).toLocaleString()}
                </time>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
