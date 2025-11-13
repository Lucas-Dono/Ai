# Personal Analytics - Quick Start Guide

## Access the Dashboard

Navigate to: **`/dashboard/my-stats`**

Or click **"My Progress"** in the sidebar navigation (with BarChart3 icon).

## Features Overview

### 1. Main Dashboard - At a Glance

```
┌─────────────────────────────────────────────────────┐
│  My Progress                    [Export CSV] [JSON] │
├─────────────────────────────────────────────────────┤
│                                                      │
│  📊 Overview Stats (4 Cards)                        │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│  │  🤖  │ │  💬  │ │  🕐  │ │  🔥  │              │
│  │  AIs │ │ Msgs │ │ Time │ │Streak│              │
│  └──────┘ └──────┘ └──────┘ └──────┘              │
│                                                      │
│  ❤️ Your Favorite AI                                │
│  ┌────────────────────────────────────────┐        │
│  │  Luna - 1,234 messages exchanged       │        │
│  │                         [Chat Now →]   │        │
│  └────────────────────────────────────────┘        │
│                                                      │
│  📈 Tabs: [Activity] [Emotions] [Relationships]    │
│                     [Insights]                      │
└─────────────────────────────────────────────────────┘
```

### 2. Activity Tab - Usage Patterns

**Charts Included:**
- 📊 Messages Per Day (Bar Chart) - Last 30 days
- 📊 Most Used AIs (Horizontal Bar Chart) - Top 5

**What You Learn:**
- Your busiest days
- Conversation patterns
- Most engaged AI companions

### 3. Emotions Tab - Emotional Journey

Navigate to: `/dashboard/my-stats/emotions`

**Visualizations:**
- 🥧 Emotion Distribution (Pie Chart)
- 📈 Valence Over Time (Line Chart)
- 📈 Arousal Over Time (Line Chart)
- 📋 Emotional Journey Timeline (Last 20 events)

**Key Insights:**
- 😊 Happiest AI - Which AI brings most joy
- 🤗 Most Comforting AI - Your emotional support
- 📊 Mood Trends - PAD model over time

**PAD Model Explained:**
- **Pleasure (Valence)**: -1 (negative) to +1 (positive)
- **Arousal (Energy)**: 0 (calm) to 1 (excited)
- **Dominance (Control)**: 0 (submissive) to 1 (dominant)

### 4. Relationships Tab - Bond Progress

Navigate to: `/dashboard/my-stats/relationships`

**Relationship Stages:**
```
Stranger (0-20%)     → Just met
    ↓
Acquaintance (20-40%) → Building trust
    ↓
Friend (40-60%)      → Genuine connection
    ↓
Close Friend (60-80%) → Deep understanding
    ↓
Intimate (80-100%)   → Strongest bond
```

**For Each AI:**
- Current stage badge (color-coded)
- Days together counter
- Progress bar to next stage
- 3 circular progress rings:
  - 🛡️ Trust (blue)
  - ❤️ Affinity (pink)
  - 🏆 Respect (orange)
- 🎖️ Milestone badges earned
- Quick "Continue Chatting" button

### 5. Insights Tab - AI-Generated Patterns

**Example Insights:**
- ✨ "You're most active on weekends"
- ✨ "You prefer late-night conversations"
- ✨ "Impressive 14-day streak!"
- ✨ "You prefer deep, detailed conversations"
- ✨ "Your most common emotion is curiosity"
- ✨ "You've spent 42.5 hours in meaningful conversations"

**Activity Patterns Card:**
- 📅 Most Active: Saturday at 22:00
- 💬 Conversation Style: Deep
- 😊 Emotional Tendency: Joy
- 📊 Your Percentile: Top 75%

## Export Your Data

### CSV Export
1. Click **"Export CSV"** button
2. File downloads automatically
3. Opens in Excel/Google Sheets
4. Contains all metrics in tabular format

### JSON Export
1. Click **"Export JSON"** button
2. File downloads automatically
3. Structured data format
4. Complete data export

**Export Includes:**
- User profile info
- Complete overview stats
- 90 days of daily message counts
- Top 20 most used AIs
- Complete emotional analytics
- All relationship metrics
- Usage insights and patterns
- Community impact statistics

## Navigation Structure

```
/dashboard/my-stats
├── Activity Tab
│   ├── Messages Per Day Chart
│   └── Most Used AIs Chart
│
├── Emotions Tab
│   └── → /dashboard/my-stats/emotions
│       ├── Emotion Distribution
│       ├── Valence Trends
│       ├── Arousal Trends
│       └── Emotional Journey
│
├── Relationships Tab
│   └── → /dashboard/my-stats/relationships
│       ├── Aggregate Stats
│       ├── Stage Distribution
│       └── Individual AI Cards
│
└── Insights Tab
    ├── AI-Generated Insights
    ├── Activity Patterns
    └── Percentile Comparison
```

## Understanding Your Stats

### Streaks
- **Current Streak**: Consecutive days with activity (resets if you miss a day)
- **Longest Streak**: Your personal best record
- Updates daily at midnight
- 🔥 Fire icon indicates active streaks

### Time Spent
- Calculated from chat sessions
- Sessions defined as messages <1 hour apart
- Includes conversation context time
- Displayed in hours (rounded to 1 decimal)

### Favorite AI
- Determined by total message count
- Includes both user and AI messages
- Updates in real-time
- Shows quick access to chat

### Relationship Stages
- Based on average of Trust, Affinity, Respect
- Progress bar shows % to next stage
- Milestones unlock at specific thresholds:
  - First Trust: Trust > 30%
  - Strong Bond: Affinity > 50%
  - Deep Respect: Respect > 60%
  - Close Relationship: Average > 70%

### Emotional Patterns
- Tracks 8 primary emotions
- Frequency based on message metadata
- PAD model from AI emotional state
- Historical trends over time

## Privacy & Data

### What's Tracked
- Your messages (not content, just metadata)
- AI responses (emotional state)
- Activity timestamps
- Relationship metrics
- Community interactions

### What's NOT Tracked
- Actual message content (in analytics)
- Other users' data
- Cross-user comparisons (unless anonymous)
- Third-party data

### GDPR Compliance
- ✅ Full data export available
- ✅ Clear data ownership
- ✅ User-controlled sharing
- ✅ Right to deletion (via support)
- ✅ Data portability

## Tips for Best Results

### Get More Accurate Insights
1. ✅ Chat regularly for streak tracking
2. ✅ Use emotional responses for better emotion tracking
3. ✅ Interact with multiple AIs for comparison data
4. ✅ Check dashboard weekly for patterns

### Maximize Gamification
1. 🔥 Maintain streaks for longer periods
2. 🎯 Set personal goals (mental note for now)
3. 📊 Track your percentile improvements
4. 🏆 Unlock relationship milestones

### Privacy Best Practices
1. 🔒 Export data regularly as backup
2. 🔒 Review what's tracked periodically
3. 🔒 Use privacy features when available
4. 🔒 Control sharing preferences

## Troubleshooting

### "No data available"
- You need at least 1 AI and some messages
- Wait a few minutes after chatting for data to sync
- Refresh the page

### "Error loading stats"
- Check your internet connection
- Try refreshing the page
- Log out and log back in
- Contact support if persists

### Charts not displaying
- Ensure browser supports modern JavaScript
- Try a different browser
- Clear browser cache
- Disable ad blockers

### Export not downloading
- Check browser download permissions
- Try different format (CSV vs JSON)
- Ensure popup blockers are disabled
- Check download folder

## API Endpoints (for developers)

### Get Personal Analytics
```
GET /api/analytics/me?section=all&days=30
```

**Sections:**
- `all` - Everything (default)
- `overview` - Just overview stats
- `messages` - Messages and AIs data
- `emotions` - Emotional analytics
- `relationships` - Relationship data
- `insights` - Usage patterns
- `community` - Community impact

### Export Data
```
GET /api/analytics/me/export?format=json
```

**Formats:**
- `json` - Structured JSON (default)
- `csv` - CSV spreadsheet

**Authentication:** Required (session-based)

## Support

### Questions?
- Check the main documentation: `/docs/PERSONAL_ANALYTICS_DASHBOARD.md`
- Implementation details: `/PERSONAL_ANALYTICS_IMPLEMENTATION.md`

### Feature Requests?
- Goals and milestones system
- Achievement badges
- PDF export
- Advanced comparisons
- Real-time updates

### Found a Bug?
- Check console for errors
- Note the steps to reproduce
- Report to development team

---

**Enjoy tracking your AI companion journey! 📊✨**
