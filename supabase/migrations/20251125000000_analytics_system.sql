-- Analytics System Migration
-- Tracks user behavior and feature usage for product insights

-- Create user_events table for detailed event tracking
CREATE TABLE IF NOT EXISTS public.user_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS user_events_user_id_idx ON public.user_events(user_id);
CREATE INDEX IF NOT EXISTS user_events_session_id_idx ON public.user_events(session_id);
CREATE INDEX IF NOT EXISTS user_events_event_type_idx ON public.user_events(event_type);
CREATE INDEX IF NOT EXISTS user_events_event_category_idx ON public.user_events(event_category);
CREATE INDEX IF NOT EXISTS user_events_created_at_idx ON public.user_events(created_at DESC);
CREATE INDEX IF NOT EXISTS user_events_user_created_idx ON public.user_events(user_id, created_at DESC);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS user_events_category_type_created_idx
  ON public.user_events(event_category, event_type, created_at DESC);

-- Enable RLS
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only read their own events
CREATE POLICY "Users can read own events" ON public.user_events
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert events (for server-side tracking)
CREATE POLICY "Service role can insert events" ON public.user_events
  FOR INSERT WITH CHECK (true);

-- Users can insert their own events
CREATE POLICY "Users can insert own events" ON public.user_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create analytics_summary table for aggregated daily metrics
CREATE TABLE IF NOT EXISTS public.analytics_summary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, metric_type, metric_name)
);

CREATE INDEX IF NOT EXISTS analytics_summary_date_idx ON public.analytics_summary(date DESC);
CREATE INDEX IF NOT EXISTS analytics_summary_metric_type_idx ON public.analytics_summary(metric_type);

-- Enable RLS for analytics summary
ALTER TABLE public.analytics_summary ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read summary (for admin dashboard)
CREATE POLICY "Authenticated users can read summary" ON public.analytics_summary
  FOR SELECT USING (auth.role() = 'authenticated');

-- Function to get event counts by category
CREATE OR REPLACE FUNCTION get_event_counts(
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  event_category TEXT,
  event_type TEXT,
  event_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.event_category,
    e.event_type,
    COUNT(*) as event_count
  FROM public.user_events e
  WHERE e.created_at >= p_start_date
    AND e.created_at <= p_end_date
  GROUP BY e.event_category, e.event_type
  ORDER BY event_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unique users by event type
CREATE OR REPLACE FUNCTION get_unique_users_by_event(
  p_event_type TEXT,
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS BIGINT AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT user_id)
    FROM public.user_events
    WHERE event_type = p_event_type
      AND created_at >= p_start_date
      AND created_at <= p_end_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user journey (events in chronological order)
CREATE OR REPLACE FUNCTION get_user_journey(
  p_user_id UUID,
  p_session_id TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  event_type TEXT,
  event_category TEXT,
  event_name TEXT,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.event_type,
    e.event_category,
    e.event_name,
    e.event_data,
    e.created_at
  FROM public.user_events e
  WHERE e.user_id = p_user_id
    AND (p_session_id IS NULL OR e.session_id = p_session_id)
  ORDER BY e.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get daily active users
CREATE OR REPLACE FUNCTION get_daily_active_users(
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS BIGINT AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT user_id)
    FROM public.user_events
    WHERE DATE(created_at) = p_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on tables for documentation
COMMENT ON TABLE public.user_events IS 'Tracks all user events for analytics and product insights';
COMMENT ON TABLE public.analytics_summary IS 'Daily aggregated metrics for fast reporting';

-- Comment on important columns
COMMENT ON COLUMN public.user_events.event_category IS 'High-level category: auth, feature, navigation, engagement';
COMMENT ON COLUMN public.user_events.event_type IS 'Specific event type: login_attempt, conversation_started, etc.';
COMMENT ON COLUMN public.user_events.event_data IS 'Additional event metadata in JSON format';
COMMENT ON COLUMN public.user_events.session_id IS 'Browser session ID for tracking user sessions';
