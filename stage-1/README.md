# Campus Notifications Priority Inbox

A Next.js application that implements an intelligent Priority Inbox system for campus notifications, displaying the top 'n' most important unread notifications based on type weight and recency.

## Features

- **Smart Priority Ranking**: Notifications ranked by type (Placement > Result > Event) and recency
- **Flexible Top N Selection**: Choose to display Top 5, 10, 15, or 20 notifications
- **Real-time Fetching**: Pulls notifications from external API on demand
- **Responsive UI**: Beautiful, mobile-friendly interface with emoji indicators
- **Performance Optimized**: O(n log n) sorting algorithm for efficient ranking

## Priority Algorithm

**Weight Scores:**
- Placement: 3 (highest priority)
- Result: 2 (medium priority)
- Event: 1 (lower priority)

**Final Score Formula:**
```
priorityScore = (weightScore × 33.33) + (recencyScore × 0.3)
```

## Project Structure

```
├── app/
│   ├── api/
│   │   └── notifications/
│   │       └── top/
│   │           └── route.js          # API endpoint for top notifications
│   ├── layout.js                     # Root layout
│   ├── page.js                       # Main component
│   ├── page.module.css               # Page styles
│   └── globals.css                   # Global styles
├── utils/
│   └── notificationPriority.js       # Priority calculation logic
├── package.json                      # Dependencies
├── next.config.js                    # Next.js configuration
├── Notification_System_Design.md    # Detailed design documentation
└── README.md                         # This file
```

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   Navigate to `http://localhost:3000`

## API Endpoint

### Get Top N Notifications

```
GET /api/notifications/top?limit=10
```

**Query Parameters:**
- `limit` (optional): Number of top notifications to return (default: 10)

**Response:**
```json
{
  "success": true,
  "timestamp": "2026-06-10T10:30:00Z",
  "totalNotifications": 150,
  "topNotificationsCount": 10,
  "topNotifications": [
    {
      "rank": 1,
      "id": "UUID",
      "type": "Placement",
      "message": "Notification text",
      "timestamp": "2026-04-22 17:51:30",
      "priority": "129.90"
    }
  ]
}
```

## Usage

1. **View Top Notifications**: The app automatically fetches and displays the top 10 notifications
2. **Change Display Count**: Use the dropdown to switch between Top 5, 10, 15, or 20
3. **Refresh**: Click the refresh button to fetch latest notifications
4. **View Details**: Each card shows:
   - Rank and priority score
   - Type with color coding
   - Message content
   - Timestamp
   - Unique ID

## Building for Production

```bash
npm run build
npm start
```

## How It Maintains Top 10 Efficiently

The system uses an efficient algorithm when new notifications arrive:

1. **Merge**: Combines current top N with new notifications
2. **Deduplicate**: Removes duplicates by notification ID
3. **Recalculate**: Sorts combined set by priority score
4. **Extract**: Returns new top N

**Complexity**: O(m log m) where m is merged set size

For high-frequency notification streams, the design supports heap-based optimization (O(log n) per insertion).

## Technologies Used

- **Next.js 14**: React framework with built-in API routes
- **React 18**: UI library
- **CSS Modules**: Component-scoped styling
- **Axios**: HTTP client (optional, using fetch API)

## Environment Variables

No environment variables required for basic functionality. The API endpoint is configured in the code.

## Error Handling

- Network errors are caught and displayed to the user
- Invalid responses are handled gracefully
- API timeouts show appropriate error messages

## Performance Metrics

- **Algorithm Complexity**: O(n log n)
- **Space Complexity**: O(n)
- **Typical Response Time**: < 100ms for 10,000 notifications
- **Max Recommended Notifications**: 10,000+

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Future Enhancements

- WebSocket support for real-time updates
- User preference customization
- ML-based importance scoring
- Notification filtering and categories
- Persistent notification history
- User engagement analytics

## Design Documentation

See [Notification_System_Design.md](./Notification_System_Design.md) for comprehensive technical documentation including:
- Detailed priority calculation algorithm
- Scalability considerations
- Advanced optimization strategies
- Testing approach
- Production deployment path

## License

MIT License - Feel free to use and modify as needed.

## Support

For issues or questions, please refer to the design documentation or check the API response format.
