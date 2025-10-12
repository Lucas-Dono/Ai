# Analytics System Documentation

Comprehensive analytics and insights system for monitoring agent performance, usage patterns, and user engagement.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Analytics Service](#analytics-service)
4. [API Endpoints](#api-endpoints)
5. [Dashboard Components](#dashboard-components)
6. [Metrics Explained](#metrics-explained)
7. [Data Export](#data-export)
8. [Best Practices](#best-practices)

## Overview

The analytics system provides deep insights into:
- **Usage Patterns**: Message counts, token usage, peak hours
- **Agent Performance**: Top agents, response quality, engagement
- **Emotional Intelligence**: Trust, affinity, respect trends
- **Revenue Metrics**: MRR, ARR, lifetime value
- **Time Series Data**: Historical trends and patterns

All analytics are calculated in real-time from the usage tracking data collected throughout the application.

## Features

### ✅ Comprehensive Metrics
- Overview statistics (messages, agents, users, revenue)
- Usage analytics (daily averages, peak times)
- Emotional intelligence tracking
- Agent performance rankings
- Revenue and subscription analytics

### ✅ Time Range Selection
- Last 24 hours
- Last 7 days
- Last 30 days (default)
- Last 90 days
- Last year
- All time

### ✅ Interactive Visualizations
- Line charts for time series data
- Pie charts for distributions
- Progress bars for metrics
- Animated statistics cards

### ✅ Data Export
- Export to CSV format
- Include all metrics and top agents
- Timestamped filenames

## Analytics Service

**Location**: `lib/analytics/service.ts`

### Core Functions

#### getDashboardStats

Get complete dashboard statistics for a user.

```typescript
import { getDashboardStats } from "@/lib/analytics/service";

const stats = await getDashboardStats(userId, "30d");

console.log(stats);
// {
//   overview: { totalMessages, totalAgents, totalUsers, activeToday },
//   usage: { totalMessages, totalTokens, avgMessagesPerDay, ... },
//   users: { totalUsers, activeUsers, churnRate, ... },
//   revenue: { mrr, arr, lifetimeValue, ... },
//   emotional: { avgTrust, avgAffinity, avgRespect, ... },
//   topAgents: [...],
//   timeSeries: { messages: [...], tokens: [...], users: [...] }
// }
```

#### getUsageStats

Get usage statistics for a specific time range.

```typescript
import { getUsageStats } from "@/lib/analytics/service";

const usage = await getUsageStats(userId, "7d");

console.log(usage);
// {
//   totalMessages: 247,
//   totalTokens: 125000,
//   totalAgents: 5,
//   avgMessagesPerDay: 35.3,
//   peakHour: 14,
//   peakDay: "2025-01-20"
// }
```

#### getEmotionalStats

Get emotional intelligence statistics.

```typescript
import { getEmotionalStats } from "@/lib/analytics/service";

const emotional = await getEmotionalStats(userId, "30d");

console.log(emotional);
// {
//   avgTrust: 0.75,
//   avgAffinity: 0.82,
//   avgRespect: 0.78,
//   emotionDistribution: { happy: 45, curious: 32, neutral: 23 },
//   relationshipLevels: { close: 12, friendly: 8, neutral: 5 }
// }
```

#### getAgentStats

Get performance statistics for agents.

```typescript
import { getAgentStats } from "@/lib/analytics/service";

const agents = await getAgentStats(userId, "30d", 10);

console.log(agents);
// [
//   {
//     agentId: "agent_123",
//     agentName: "Assistant Bot",
//     messageCount: 450,
//     tokenCount: 85000,
//     avgResponseLength: 320,
//     avgSentiment: 0.82,
//     uniqueUsers: 15
//   },
//   ...
// ]
```

#### getTimeSeriesData

Get time series data for a metric.

```typescript
import { getTimeSeriesData } from "@/lib/analytics/service";

const timeSeries = await getTimeSeriesData(userId, "messages", "30d");

console.log(timeSeries);
// [
//   { timestamp: Date, value: 45, label: "2025-01-01" },
//   { timestamp: Date, value: 52, label: "2025-01-02" },
//   ...
// ]
```

#### exportAnalyticsCSV

Export analytics data as CSV string.

```typescript
import { exportAnalyticsCSV } from "@/lib/analytics/service";

const csv = await exportAnalyticsCSV(userId, "30d");

// Save to file or send to client
fs.writeFileSync("analytics.csv", csv);
```

## API Endpoints

### GET /api/analytics/dashboard

Get complete dashboard analytics.

**Query Parameters**:
- `range` (optional): Time range - `24h`, `7d`, `30d`, `90d`, `1y`, `all` (default: `30d`)

**Response**:
```json
{
  "overview": {
    "totalMessages": 1234,
    "totalAgents": 8,
    "totalUsers": 1,
    "activeToday": 45
  },
  "usage": {
    "totalMessages": 1234,
    "totalTokens": 567890,
    "totalAgents": 8,
    "avgMessagesPerDay": 41.1,
    "peakHour": 14,
    "peakDay": "2025-01-20"
  },
  "revenue": {
    "totalRevenue": 29.00,
    "mrr": 29,
    "arr": 348,
    "avgRevenuePerUser": 29.00,
    "lifetimeValue": 58.00,
    "subscriptionsByPlan": {
      "free": 0,
      "pro": 1,
      "enterprise": 0
    }
  },
  "emotional": {
    "avgTrust": 0.75,
    "avgAffinity": 0.82,
    "avgRespect": 0.78,
    "emotionDistribution": { "happy": 45, "curious": 32 },
    "relationshipLevels": { "close": 12, "friendly": 8 }
  },
  "topAgents": [
    {
      "agentId": "agent_123",
      "agentName": "Assistant Bot",
      "messageCount": 450,
      "tokenCount": 85000,
      "avgResponseLength": 320,
      "avgSentiment": 0.82,
      "uniqueUsers": 1
    }
  ],
  "timeSeries": {
    "messages": [...],
    "tokens": [...],
    "users": [...]
  }
}
```

### GET /api/analytics/export

Export analytics data as CSV file.

**Query Parameters**:
- `range` (optional): Time range (default: `30d`)

**Response**:
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="analytics-30d-2025-01-22.csv"`

**CSV Format**:
```csv
Metric,Value
Total Messages,1234
Total Agents,8
Total Tokens,567890
...

Top Agents
Agent Name,Messages,Tokens,Avg Response Length,Sentiment,Unique Users
Assistant Bot,450,85000,320,82.0%,1
...
```

## Dashboard Components

### StatCard

Display a single metric with icon and optional trend.

**Location**: `components/analytics/StatCard.tsx`

```tsx
<StatCard
  title="Total Messages"
  value={1234}
  icon={MessageSquare}
  color="blue"
  trend={{ value: 15, isPositive: true }}
  subtitle="This month"
/>
```

**Props**:
- `title`: Metric name
- `value`: Metric value (string or number)
- `icon`: Lucide icon component
- `color`: Color theme - `blue`, `green`, `purple`, `orange`, `red`
- `trend`: Optional trend indicator `{ value: number, isPositive: boolean }`
- `subtitle`: Optional subtitle text

### TimeSeriesChart

Line chart for displaying metrics over time.

**Location**: `components/analytics/TimeSeriesChart.tsx`

```tsx
<TimeSeriesChart
  title="Messages Over Time"
  data={timeSeriesData}
  color="#3b82f6"
  height={300}
/>
```

**Props**:
- `title`: Chart title
- `data`: Array of `TimeSeriesPoint` `{ timestamp: Date, value: number, label: string }`
- `color`: Line color (hex)
- `height`: Chart height in pixels (default: 300)
- `showLegend`: Show legend (default: false)

### PieChartCard

Pie chart for displaying distribution data.

**Location**: `components/analytics/PieChartCard.tsx`

```tsx
<PieChartCard
  title="Emotion Distribution"
  data={{ happy: 45, curious: 32, neutral: 23 }}
  colors={["#3b82f6", "#10b981", "#f59e0b"]}
/>
```

**Props**:
- `title`: Chart title
- `data`: Object with category counts `{ [key: string]: number }`
- `colors`: Array of hex colors (optional)
- `height`: Chart height in pixels (default: 300)

### ProgressBar

Progress bar for displaying percentage metrics.

**Location**: `components/analytics/ProgressBar.tsx`

```tsx
<ProgressBar
  label="Trust"
  value={0.75}
  color="blue"
  showPercentage={true}
/>
```

**Props**:
- `label`: Metric label
- `value`: Value between 0-1
- `color`: Bar color - `blue`, `green`, `purple`, `orange`, `red`
- `showPercentage`: Show percentage label (default: true)

## Metrics Explained

### Overview Metrics

**Total Messages**: Total number of messages sent/received in the time range.

**Total Agents**: Number of agents created by the user.

**Total Tokens**: Sum of all tokens consumed by LLM operations.

**Active Today**: Number of messages sent today.

### Usage Metrics

**Average Messages Per Day**: `totalMessages / days in range`

**Peak Hour**: Hour of day (0-23) with most messages.

**Peak Day**: Calendar day with most messages.

### Emotional Metrics

**Average Trust**: Mean trust score across all agent relationships (0-1).

**Average Affinity**: Mean affinity score across all relationships (0-1).

**Average Respect**: Mean respect score across all relationships (0-1).

**Emotion Distribution**: Count of each emotion type from agent responses.

**Relationship Levels**: Distribution of relationship categories (stranger, acquaintance, friendly, close, etc.)

### Revenue Metrics

**MRR** (Monthly Recurring Revenue): Current monthly subscription value.

**ARR** (Annual Recurring Revenue): `MRR * 12`

**Lifetime Value**: `MRR * account age in months`

**Subscriptions by Plan**: Count of subscriptions per plan tier.

### Agent Performance

**Message Count**: Total messages for this agent.

**Token Count**: Total tokens used by this agent.

**Average Response Length**: Mean character count of agent responses.

**Average Sentiment**: Mean of (trust + affinity + respect) / 3 for this agent's relationships.

**Unique Users**: Number of distinct users who interacted with this agent.

## Data Export

### Using the API

```typescript
const response = await fetch("/api/analytics/export?range=30d");
const blob = await response.blob();

// Create download link
const url = window.URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "analytics.csv";
a.click();
```

### Using the Dashboard

1. Navigate to `/dashboard/analytics`
2. Select desired time range
3. Click "Export CSV" button
4. File downloads automatically with timestamp

### CSV Structure

The exported CSV contains:
- Overview metrics
- Usage statistics
- Emotional metrics
- Revenue data
- Top 5 agents with detailed stats

Perfect for:
- External analysis in Excel/Google Sheets
- Integration with BI tools
- Reporting to stakeholders
- Long-term trend analysis

## Best Practices

### Performance Optimization

1. **Use appropriate time ranges**: Shorter ranges = faster queries
2. **Cache dashboard data**: Consider caching for frequently accessed data
3. **Limit top agents**: Default to top 5-10 agents to reduce query time
4. **Aggregate old data**: Consider monthly rollups for historical data

### Data Accuracy

1. **Usage tracking**: Ensure all message operations call `trackUsage()`
2. **Relationship updates**: Update relations after each interaction
3. **Metadata consistency**: Always include emotions and relation levels in message metadata

### User Experience

1. **Loading states**: Always show loading indicators during data fetch
2. **Error handling**: Gracefully handle API failures
3. **Empty states**: Show helpful messages when no data exists
4. **Responsive design**: Ensure charts work on all screen sizes

### Analytics Insights

1. **Peak hours**: Schedule important agent updates during low-usage hours
2. **Agent performance**: Focus on improving top performing agents
3. **Emotional trends**: Monitor trust/affinity/respect over time
4. **Usage patterns**: Adjust rate limits based on actual usage
5. **Revenue metrics**: Track MRR/ARR trends for business decisions

## Future Enhancements

- [ ] **Cohort Analysis**: Group users by signup date and track retention
- [ ] **A/B Testing**: Compare agent performance with different configurations
- [ ] **Predictive Analytics**: Forecast future usage and churn
- [ ] **Custom Dashboards**: Allow users to create custom metric views
- [ ] **Real-Time Alerts**: Notify on anomalies or threshold breaches
- [ ] **Comparative Analysis**: Compare time periods (this month vs last month)
- [ ] **Goal Tracking**: Set and track KPI goals
- [ ] **Funnel Analysis**: Track user journey through app features
- [ ] **Heatmaps**: Visualize usage patterns by hour/day
- [ ] **Advanced Filters**: Filter by agent, plan, date range combinations
