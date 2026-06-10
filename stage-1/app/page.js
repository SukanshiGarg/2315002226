'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topN, setTopN] = useState(10);
  const [totalNotifications, setTotalNotifications] = useState(0);

  const fetchTopNotifications = async (limit) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/notifications/top?limit=${limit}`);
      const data = await response.json();
      setNotifications(data.topNotifications);
      setTotalNotifications(data.totalNotifications);
    } catch (err) {
      setError('Failed to fetch notifications');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTopNotifications(topN);
  }, [topN]);

  const getTypeColor = (type) => {
    if (type === 'Placement') return '#e74c3c';
    if (type === 'Result') return '#3498db';
    if (type === 'Event') return '#2ecc71';
    return '#95a5a6';
  };

  const getTypeIcon = (type) => {
    if (type === 'Placement') return '💼';
    if (type === 'Result') return '📊';
    if (type === 'Event') return '📅';
    return '📌';
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Campus Notifications - Priority Inbox</h1>
        <p>Top {topN} Most Important Unread Notifications</p>
      </header>

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label htmlFor="topN">Display Top:</label>
          <select
            id="topN"
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
            className={styles.select}
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={15}>Top 15</option>
            <option value={20}>Top 20</option>
          </select>
        </div>
        <button
          onClick={() => fetchTopNotifications(topN)}
          className={styles.refreshBtn}
        >
          🔄 Refresh
        </button>
      </div>

      {error && <div className={styles.error}>⚠️ Error: {error}</div>}

      {loading && <div className={styles.loading}>⏳ Loading notifications...</div>}

      {!loading && notifications.length === 0 && !error && (
        <div className={styles.empty}> No notifications available</div>
      )}

      {!loading && notifications.length > 0 && (
        <div className={styles.stats}>
          <span>Total Notifications: {totalNotifications}</span>
          <span>Displaying: {notifications.length}</span>
        </div>
      )}

      <div className={styles.notificationsList}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={styles.notificationCard}
            style={{ borderLeftColor: getTypeColor(notification.type) }}
          >
            <div className={styles.rankBadge}>#{notification.rank}</div>

            <div className={styles.cardHeader}>
              <div className={styles.typeContainer}>
                <span className={styles.icon}>{getTypeIcon(notification.type)}</span>
                <span
                  className={styles.type}
                  style={{ backgroundColor: getTypeColor(notification.type) }}
                >
                  {notification.type}
                </span>
              </div>
              <span className={styles.priority}>
                Priority Score: {notification.priority}
              </span>
            </div>

            <div className={styles.message}>
              <strong>Message:</strong> {notification.message}
            </div>

            <div className={styles.timestamp}>
              <strong>Time:</strong> {new Date(notification.timestamp).toLocaleString()}
            </div>

            <div className={styles.id}>
              <strong>ID:</strong> {notification.id}
            </div>
          </div>
        ))}
      </div>

      <footer className={styles.footer}>
        <p>
          <strong>Priority System:</strong> Weighted by Type (Placement: 3 points, Result: 2 points, Event: 1 point) +
          Recency Score
        </p>
        <p>Last updated: {new Date().toLocaleString()}</p>
      </footer>
    </div>
  );
}
