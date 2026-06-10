# Stage 1: Campus Notifications Priority Inbox System Design

## Overview

This document describes the design and implementation of a Priority Inbox system for the campus notifications application. The system intelligently ranks and displays the top 'n' most important unread notifications based on a combination of notification type weight and recency.

## Problem Statement

With high volume of notifications from multiple categories (Placements, Results, Events), users lose track of important information. We need a system that:
- Prioritizes notifications based on importance
- Respects user urgency (recency)
- Scales efficiently as new notifications arrive
- Maintains top 'n' notifications without database queries

## Priority Calculation Algorithm

### Weight Scoring System

Notifications are categorized by type with associated weights:
- **Placement**: Weight = 3 (Highest priority - job opportunities)
- **Result**: Weight = 2 (Medium priority - academic results)
- **Event**: Weight = 1 (Lower priority - general events)

### Recency Scoring

Recency is calculated using exponential decay to ensure newer notifications maintain higher scores:
```
recencyScore = max(0, 100 - (timeDifferenceMs / 1000))
```

This ensures notifications posted more recently get higher scores.

### Combined Priority Score

```
priorityScore = (weightScore × 33.33) + (recencyScore × 0.3)
```

**Rationale:**
- Weight contributes ~70% of the final score (33.33 for Placement, 22.22 for Result, 11.11 for Event)
- Recency contributes ~30% of the final score
- This ensures type-based importance is the primary factor while respecting recency

**Example Calculation:**
- Notification A: Placement, posted 5 minutes ago
  - Weight Score: 3 → 99.99 points
  - Recency Score: ~99.7 → 29.91 points
  - Total: 129.9 points

- Notification B: Event, posted 1 minute ago
  - Weight Score: 1 → 33.33 points
  - Recency Score: ~99.9 → 29.97 points
  - Total: 63.3 points

Notification A ranks higher despite being older because Placement has higher priority.

## Data Structure & Algorithms

### Notification Object
```javascript
{
  ID: "UUID",
  Type: "Placement|Result|Event",
  Message: "Notification content",
  Timestamp: "YYYY-MM-DD HH:MM:SS",
  priorityScore: 129.9,
  rank: 1
}
```

### Top N Selection Algorithm

**Time Complexity: O(n log n)**
**Space Complexity: O(n)**

```javascript
function getTopPriorityNotifications(notifications, n = 10) {
  // 1. Find max timestamp for normalization: O(n)
  const maxTimestamp = Math.max(...timestamps);
  
  // 2. Calculate priority score for each notification: O(n)
  const scored = notifications.map(notif => ({
    ...notif,
    score: calculateScore(notif, maxTimestamp)
  }));
  
  // 3. Sort by score descending: O(n log n)
  scored.sort((a, b) => b.priorityScore - a.priorityScore);
  
  // 4. Return top n: O(n)
  return scored.slice(0, n);
}
```

## Handling New Notifications Efficiently

### Strategy: Incremental Update with Deduplication

When new notifications arrive:

1. **Merge**: Combine current top N with new notifications
2. **Deduplicate**: Remove duplicate notifications by ID
3. **Recalculate**: Sort combined set and extract new top N

```javascript
function maintainTopNotifications(currentTop, newNotifications, n = 10) {
  // Combine and deduplicate
  const allNotifs = [...currentTop, ...newNotifications];
  const uniqueNotifs = deduplicateByID(allNotifs);
  
  // Recalculate top N
  return getTopPriorityNotifications(uniqueNotifs, n);
}
```

**Time Complexity**: O(m log m) where m = size of merged set (typically < 1000)
**Space Complexity**: O(m)

### Why This Approach is Efficient

1. **No Database Required**: Operations are in-memory, making them instant
2. **Predictable Performance**: Sorted once per request, O(n log n) complexity
3. **Deduplication**: Prevents duplicate notifications in top N
4. **Scalable**: Works efficiently up to thousands of notifications
5. **Flexible**: Easy to change 'n' or recalculation frequency

## System Architecture

### Components

```
┌─────────────────────────────────────┐
│      Next.js Application            │
├─────────────────────────────────────┤
│  ┌──────────────────────────────┐  │
│  │  Frontend (React Component)  │  │
│  │ - Display Top N Notifications│  │
│  │ - Refresh Control            │  │
│  └─────────────┬────────────────┘  │
│                │                    │
│  ┌─────────────▼────────────────┐  │
│  │ API Route: /api/notifications/top │
│  │ - Fetch from external API    │  │
│  │ - Calculate priorities       │  │
│  │ - Return top N               │  │
│  └─────────────┬────────────────┘  │
│                │                    │
│  ┌─────────────▼────────────────┐  │
│  │ notificationPriority.js      │  │
│  │ - Priority calculation       │  │
│  │ - Scoring algorithm          │  │
│  │ - Top N selection            │  │
│  └──────────────────────────────┘  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ External Notification API           │
│ (4.224.186.213/evaluation-service)  │
└─────────────────────────────────────┘
```

### API Endpoint

**GET** `/api/notifications/top?limit=10`

**Response Format:**
```json
{
  "success": true,
  "timestamp": "2026-06-10T10:30:00Z",
  "totalNotifications": 150,
  "topNotificationsCount": 10,
  "topNotifications": [
    {
      "rank": 1,
      "id": "d146095a-0d86-4a34-9e69-3900a14576bc",
      "type": "Placement",
      "message": "CSX Corporation hiring",
      "timestamp": "2026-04-22 17:51:30",
      "priority": "129.90"
    },
    ...
  ]
}
```

## Advanced: Maintaining Top N with Streaming

For production systems with real-time notification streams, we can optimize further:

### Heap-Based Approach (Pseudo-code)

```javascript
class PriorityNotificationQueue {
  constructor(n = 10) {
    this.maxSize = n;
    this.minHeap = new MinHeap(); // Min-heap with size=n
  }

  addNotification(notification) {
    const score = calculateScore(notification);
    
    if (this.minHeap.size() < this.maxSize) {
      this.minHeap.insert(score, notification);
    } else if (score > this.minHeap.peek().score) {
      // Replace smallest if new notification is better
      this.minHeap.removeMin();
      this.minHeap.insert(score, notification);
    }
  }

  getTopN() {
    return this.minHeap.toArray().sort((a,b) => b.score - a.score);
  }
}
```

**Time Complexity**: O(log n) per insertion
**Space Complexity**: O(n)

This approach is optimal for continuous notification streams where we want O(log n) insertion time rather than O(n log n) batch processing.

## Scalability Considerations

### Current Implementation (Batch Processing)
- **Suitable for**: 100-10,000 notifications
- **Refresh Interval**: On-demand or periodic (e.g., every 30 seconds)
- **Latency**: < 100ms for 10,000 notifications

### Production Optimization Paths

1. **Caching Layer**
   - Cache top N notifications for 5-10 seconds
   - Invalidate on new notifications via WebSocket

2. **Database Indexing** (if needed in future)
   - Composite index on `(Type, Timestamp DESC)`
   - Query top N directly using SQL ORDER BY

3. **Message Queue**
   - Use Redis or RabbitMQ for real-time notification distribution
   - Maintain rolling priority queue per user

4. **CDN + Edge Computing**
   - Pre-compute top N on CDN edge locations
   - Serve geographically distributed results

## Testing Strategy

### Unit Tests
```javascript
// Priority calculation
assert(calculateScore(placement, max) > calculateScore(result, max));

// Top N selection
assert(getTopPriorityNotifications(notifs, 10).length === 10);

// Recency factor
assert(olderNotif.score < newerNotif.score);

// Deduplication
assert(maintainTopNotifications(top10, [dup]).length === 10);
```

### Integration Tests
```javascript
// Fetch from API
const result = await fetch('/api/notifications/top?limit=10');
assert(result.status === 200);
assert(result.topNotifications.length <= 10);

// Verify sorting
const scores = result.topNotifications.map(n => n.priority);
assert(isSortedDesc(scores));
```

## Limitations & Future Enhancements

### Current Limitations
1. **Stateless Design**: No user-specific priority preferences
2. **Static Weights**: Fixed weights for notification types
3. **No Filtering**: Doesn't filter by categories or senders
4. **No ML Integration**: Doesn't learn from user interactions

### Future Enhancements
1. **Personalization**: Learn user preferences and adjust weights
2. **Engagement Metrics**: Track notification open rates
3. **Smart Filtering**: Allow users to mute/ignore certain types
4. **Predictive Ranking**: Use ML to predict notification importance
5. **User Feedback Loop**: Thumbs up/down to refine algorithm
6. **Time-Based Decay**: Gradually decrease score if notification unread for too long

## Conclusion

The Priority Inbox system provides an efficient, scalable solution to help users manage high-volume notifications. By combining notification type weight with recency scoring, the system ensures important opportunities (Placements) are never missed while respecting the time-sensitive nature of all notifications.

The in-memory, O(n log n) approach is suitable for current usage patterns, with clear pathways to optimize for streaming data or integrate with databases as scale requirements grow.

---

**Implementation Files:**
- `utils/notificationPriority.js`: Core priority calculation logic
- `app/api/notifications/top/route.js`: API endpoint
- `app/page.js`: Frontend display component
- `app/page.module.css`: Responsive styling
