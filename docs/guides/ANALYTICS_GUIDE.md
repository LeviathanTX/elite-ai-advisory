# Analytics System Guide

## Overview

We've implemented a privacy-friendly, Supabase-based analytics system that tracks user behavior without using cookies or third-party services. All data stays in your database and is GDPR compliant.

## What We Track

### Authentication Events
- ✅ Login attempts (with email domain only, not full email)
- ✅ Login success/failure
- ✅ Signup attempts
- ✅ Signup success/failure
- ✅ Auth page abandonment (user starts form but closes without completing)
- ✅ Logout

### Feature Usage
- ✅ Conversations started (with advisor info and mode)
- ✅ Messages sent
- ✅ Documents uploaded (file type and size)
- ✅ Pitch practice sessions
- ✅ Voice pitch analysis
- ✅ Advisor selection
- ✅ Custom advisor creation

### Navigation Events
- ✅ Dashboard views
- ✅ Mode selection (Pitch Practice, Advisory Board, etc.)
- ✅ Page views

### Session Tracking
- ✅ Session start/end
- ✅ Session duration
- ✅ Feature discovery

## Database Schema

The analytics system uses two main tables:

### `user_events`
Stores individual user events with full context:
- `user_id` - User who triggered the event (null for anonymous)
- `session_id` - Browser session identifier
- `event_type` - Specific event (login_attempt, conversation_started, etc.)
- `event_category` - High-level category (auth, feature, navigation, engagement)
- `event_name` - Human-readable event name
- `event_data` - JSON metadata specific to the event
- `page_url`, `referrer`, `user_agent` - Context information
- `created_at` - Timestamp

### `analytics_summary`
Aggregated daily metrics for fast reporting:
- `date` - Aggregation date
- `metric_type` - Type of metric
- `metric_name` - Metric identifier
- `metric_value` - Numeric value
- `metadata` - Additional JSON data

## SQL Helper Functions

Several functions are available for querying analytics:

```sql
-- Get event counts by category for a date range
SELECT * FROM get_event_counts('2025-01-01', '2025-01-31');

-- Get unique users for a specific event type
SELECT get_unique_users_by_event('login_success', '2025-01-01', NOW());

-- Get user journey (all events for a user)
SELECT * FROM get_user_journey('user-uuid-here');

-- Get daily active users
SELECT get_daily_active_users('2025-01-15');
```

## Useful Analytics Queries

### Login Funnel
```sql
SELECT
  event_type,
  COUNT(*) as count,
  COUNT(DISTINCT user_id) as unique_users
FROM user_events
WHERE event_category = 'auth'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY event_type
ORDER BY count DESC;
```

### Most Popular Features
```sql
SELECT
  event_type,
  COUNT(*) as usage_count
FROM user_events
WHERE event_category = 'feature'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY event_type
ORDER BY usage_count DESC;
```

### Daily Active Users Trend
```sql
SELECT
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as dau
FROM user_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### User Retention (7-day)
```sql
WITH cohort AS (
  SELECT
    user_id,
    MIN(DATE(created_at)) as first_seen
  FROM user_events
  GROUP BY user_id
)
SELECT
  cohort.first_seen,
  COUNT(DISTINCT cohort.user_id) as cohort_size,
  COUNT(DISTINCT CASE
    WHEN DATE(events.created_at) >= cohort.first_seen + INTERVAL '7 days'
    THEN events.user_id
  END) as retained_users
FROM cohort
LEFT JOIN user_events events ON cohort.user_id = events.user_id
WHERE cohort.first_seen >= NOW() - INTERVAL '30 days'
GROUP BY cohort.first_seen
ORDER BY cohort.first_seen DESC;
```

### Feature Adoption by User
```sql
SELECT
  user_id,
  COUNT(DISTINCT CASE WHEN event_type = 'conversation_started' THEN 1 END) > 0 as used_conversations,
  COUNT(DISTINCT CASE WHEN event_type = 'document_uploaded' THEN 1 END) > 0 as used_documents,
  COUNT(DISTINCT CASE WHEN event_type = 'pitch_practice_started' THEN 1 END) > 0 as used_pitch_practice,
  COUNT(DISTINCT CASE WHEN event_type = 'voice_pitch_started' THEN 1 END) > 0 as used_voice_pitch
FROM user_events
WHERE event_category = 'feature'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY user_id;
```

### Auth Page Abandonment Rate
```sql
WITH auth_events AS (
  SELECT
    DATE(created_at) as date,
    SUM(CASE WHEN event_type IN ('login_attempt', 'signup_attempt') THEN 1 ELSE 0 END) as attempts,
    SUM(CASE WHEN event_type = 'auth_page_abandoned' THEN 1 ELSE 0 END) as abandoned
  FROM user_events
  WHERE event_category = 'auth'
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY DATE(created_at)
)
SELECT
  date,
  attempts,
  abandoned,
  ROUND(100.0 * abandoned / NULLIF(attempts, 0), 2) as abandonment_rate_pct
FROM auth_events
ORDER BY date DESC;
```

## Applying the Migration

To enable analytics tracking, apply the migration to your Supabase database:

### Option 1: Via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20251125000000_analytics_system.sql`
4. Paste and run the SQL

### Option 2: Via CLI (if migration sync is working)
```bash
supabase db push
```

### Option 3: Manual SQL
Run the SQL file directly against your database:
```bash
psql $DATABASE_URL < supabase/migrations/20251125000000_analytics_system.sql
```

## Privacy & GDPR Compliance

✅ **No cookies used** - Only localStorage for session IDs
✅ **No third-party tracking** - All data stays in your database
✅ **User can opt out** - `analytics.optOut()` function available
✅ **PII protection** - Only email domains tracked, not full emails
✅ **Data ownership** - You own all analytics data
✅ **RLS enabled** - Users can only see their own events

## Adding New Event Tracking

To track a new event:

1. **Add event type** to `EventType` enum in `src/services/analytics.ts`
2. **Add tracking method** to the analytics service
3. **Call the method** from your component

Example:
```typescript
// In analytics.ts
export enum EventType {
  // ... existing types
  NEW_FEATURE_USED = 'new_feature_used',
}

// Add to trackFeature object
trackFeature = {
  // ... existing methods
  newFeatureUsed: (metadata: any) => {
    this.trackEvent(
      EventType.NEW_FEATURE_USED,
      EventCategory.FEATURE,
      'New Feature Used',
      metadata
    );
  },
};

// In your component
import { analytics } from '../../services/analytics';

const handleFeatureClick = () => {
  analytics.trackFeature.newFeatureUsed({ version: '1.0' });
  // ... your feature code
};
```

## Analytics Dashboard (Future Enhancement)

Consider building an admin dashboard to visualize:
- Daily/weekly/monthly active users
- Feature adoption rates
- Conversion funnels
- User retention cohorts
- Most popular features
- Auth abandonment rates

Tools you could use:
- **Metabase** (open source, connects to Postgres)
- **Grafana** (with Postgres datasource)
- **Superset** (Apache open source)
- **Custom React dashboard** (using the SQL queries above)

## Notes

- Events are batched and flushed every 10 seconds for performance
- Critical events (login success, session end) are flushed immediately
- Session IDs are browser-specific and reset on each page load
- User IDs are added automatically when user is authenticated
- All timestamps are stored in UTC
