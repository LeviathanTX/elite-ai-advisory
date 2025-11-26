/**
 * Analytics Service
 * Privacy-friendly, Supabase-based event tracking
 * No third-party analytics, no cookies, GDPR compliant
 */

import { supabase } from './supabase';

// Event Categories
export enum EventCategory {
  AUTH = 'auth',
  FEATURE = 'feature',
  NAVIGATION = 'navigation',
  ENGAGEMENT = 'engagement',
  ERROR = 'error',
}

// Event Types
export enum EventType {
  // Auth Events
  LOGIN_ATTEMPT = 'login_attempt',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  SIGNUP_ATTEMPT = 'signup_attempt',
  SIGNUP_SUCCESS = 'signup_success',
  SIGNUP_FAILED = 'signup_failed',
  LOGOUT = 'logout',
  AUTH_PAGE_ABANDONED = 'auth_page_abandoned',

  // Feature Events
  CONVERSATION_STARTED = 'conversation_started',
  CONVERSATION_MESSAGE_SENT = 'conversation_message_sent',
  CONVERSATION_COMPLETED = 'conversation_completed',
  DOCUMENT_UPLOADED = 'document_uploaded',
  DOCUMENT_ANALYZED = 'document_analyzed',
  PITCH_PRACTICE_STARTED = 'pitch_practice_started',
  PITCH_PRACTICE_COMPLETED = 'pitch_practice_completed',
  VOICE_PITCH_STARTED = 'voice_pitch_started',
  VOICE_PITCH_COMPLETED = 'voice_pitch_completed',
  ADVISOR_SELECTED = 'advisor_selected',
  CUSTOM_ADVISOR_CREATED = 'custom_advisor_created',

  // Navigation Events
  PAGE_VIEW = 'page_view',
  DASHBOARD_VIEW = 'dashboard_view',
  MODE_SELECTED = 'mode_selected',

  // Engagement Events
  SESSION_START = 'session_start',
  SESSION_END = 'session_end',
  FEATURE_DISCOVERED = 'feature_discovered',
}

interface EventData {
  [key: string]: any;
}

interface AnalyticsEvent {
  user_id?: string;
  session_id: string;
  event_type: EventType;
  event_category: EventCategory;
  event_name: string;
  event_data?: EventData;
  page_url?: string;
  referrer?: string;
  user_agent?: string;
}

class AnalyticsService {
  private sessionId: string;
  private isEnabled: boolean;
  private eventQueue: AnalyticsEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = this.checkIfEnabled();

    // Start session
    if (this.isEnabled) {
      this.trackEvent(EventType.SESSION_START, EventCategory.ENGAGEMENT, 'Session Started');

      // Flush events every 10 seconds
      this.flushInterval = setInterval(() => this.flushEvents(), 10000);

      // Track session end on page unload
      window.addEventListener('beforeunload', () => {
        this.trackEvent(EventType.SESSION_END, EventCategory.ENGAGEMENT, 'Session Ended');
        this.flushEvents();
      });
    }
  }

  /**
   * Generate a unique session ID for this browser session
   */
  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `session_${timestamp}_${random}`;
  }

  /**
   * Check if analytics is enabled (user hasn't opted out)
   */
  private checkIfEnabled(): boolean {
    try {
      const optOut = localStorage.getItem('analytics_opt_out');
      return optOut !== 'true';
    } catch {
      return true; // Default to enabled if localStorage is blocked
    }
  }

  /**
   * Track an analytics event
   */
  public trackEvent(
    eventType: EventType,
    eventCategory: EventCategory,
    eventName: string,
    eventData?: EventData
  ): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      session_id: this.sessionId,
      event_type: eventType,
      event_category: eventCategory,
      event_name: eventName,
      event_data: eventData || {},
      page_url: window.location.href,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
    };

    // Add to queue
    this.eventQueue.push(event);

    // Flush immediately for critical events
    if (this.isCriticalEvent(eventType)) {
      this.flushEvents();
    }
  }

  /**
   * Check if event should be flushed immediately
   */
  private isCriticalEvent(eventType: EventType): boolean {
    return [EventType.LOGIN_SUCCESS, EventType.SIGNUP_SUCCESS, EventType.SESSION_END].includes(
      eventType
    );
  }

  /**
   * Flush queued events to database
   */
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const eventsToFlush = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Get current user if authenticated (with timeout to prevent blocking)
      const userPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('getUser timeout')), 2000)
      );

      const {
        data: { user },
      } = (await Promise.race([userPromise, timeoutPromise]).catch(() => ({
        data: { user: null },
      }))) as any;

      // Add user_id to events if authenticated
      const eventsWithUser = eventsToFlush.map(event => ({
        ...event,
        user_id: user?.id || null,
      }));

      // Insert with timeout to prevent blocking
      const insertPromise = supabase.from('user_events').insert(eventsWithUser);
      const insertTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('insert timeout')), 3000)
      );

      const { error } = (await Promise.race([insertPromise, insertTimeoutPromise]).catch(err => {
        console.warn('Analytics insert timed out or failed:', err);
        return { error: err };
      })) as any;

      if (error) {
        console.warn('Analytics flush error (non-blocking):', error.message);
        // Don't re-queue on error to prevent blocking
      }
    } catch (err) {
      console.warn('Analytics flush exception (non-blocking):', err);
      // Never throw - analytics should never block the app
    }
  }

  /**
   * Track page view
   */
  public trackPageView(pageName: string, metadata?: EventData): void {
    this.trackEvent(EventType.PAGE_VIEW, EventCategory.NAVIGATION, `Page View: ${pageName}`, {
      page_name: pageName,
      ...metadata,
    });
  }

  /**
   * Track authentication events
   */
  public trackAuth = {
    loginAttempt: (email: string) => {
      this.trackEvent(EventType.LOGIN_ATTEMPT, EventCategory.AUTH, 'Login Attempt', {
        email_domain: email.split('@')[1],
      });
    },
    loginSuccess: (userId: string) => {
      this.trackEvent(EventType.LOGIN_SUCCESS, EventCategory.AUTH, 'Login Success', {
        user_id: userId,
      });
    },
    loginFailed: (reason: string) => {
      this.trackEvent(EventType.LOGIN_FAILED, EventCategory.AUTH, 'Login Failed', { reason });
    },
    signupAttempt: (email: string) => {
      this.trackEvent(EventType.SIGNUP_ATTEMPT, EventCategory.AUTH, 'Signup Attempt', {
        email_domain: email.split('@')[1],
      });
    },
    signupSuccess: (userId: string) => {
      this.trackEvent(EventType.SIGNUP_SUCCESS, EventCategory.AUTH, 'Signup Success', {
        user_id: userId,
      });
    },
    signupFailed: (reason: string) => {
      this.trackEvent(EventType.SIGNUP_FAILED, EventCategory.AUTH, 'Signup Failed', { reason });
    },
    logout: () => {
      this.trackEvent(EventType.LOGOUT, EventCategory.AUTH, 'Logout');
    },
    authPageAbandoned: (formType: 'login' | 'signup') => {
      this.trackEvent(EventType.AUTH_PAGE_ABANDONED, EventCategory.AUTH, 'Auth Page Abandoned', {
        form_type: formType,
      });
    },
  };

  /**
   * Track feature usage
   */
  public trackFeature = {
    conversationStarted: (advisorId: string, advisorType: string, mode: string) => {
      this.trackEvent(
        EventType.CONVERSATION_STARTED,
        EventCategory.FEATURE,
        'Conversation Started',
        { advisor_id: advisorId, advisor_type: advisorType, mode }
      );
    },
    conversationMessageSent: (conversationId: string, messageLength: number) => {
      this.trackEvent(EventType.CONVERSATION_MESSAGE_SENT, EventCategory.FEATURE, 'Message Sent', {
        conversation_id: conversationId,
        message_length: messageLength,
      });
    },
    conversationCompleted: (conversationId: string, messageCount: number, duration: number) => {
      this.trackEvent(
        EventType.CONVERSATION_COMPLETED,
        EventCategory.FEATURE,
        'Conversation Completed',
        { conversation_id: conversationId, message_count: messageCount, duration_seconds: duration }
      );
    },
    documentUploaded: (fileName: string, fileType: string, fileSize: number) => {
      this.trackEvent(EventType.DOCUMENT_UPLOADED, EventCategory.FEATURE, 'Document Uploaded', {
        file_type: fileType,
        file_size_kb: Math.round(fileSize / 1024),
      });
    },
    documentAnalyzed: (documentId: string, analysisType: string) => {
      this.trackEvent(EventType.DOCUMENT_ANALYZED, EventCategory.FEATURE, 'Document Analyzed', {
        document_id: documentId,
        analysis_type: analysisType,
      });
    },
    pitchPracticeStarted: (mode: string) => {
      this.trackEvent(
        EventType.PITCH_PRACTICE_STARTED,
        EventCategory.FEATURE,
        'Pitch Practice Started',
        { mode }
      );
    },
    pitchPracticeCompleted: (mode: string, duration: number, score?: number) => {
      this.trackEvent(
        EventType.PITCH_PRACTICE_COMPLETED,
        EventCategory.FEATURE,
        'Pitch Practice Completed',
        { mode, duration_seconds: duration, score }
      );
    },
    voicePitchStarted: () => {
      this.trackEvent(EventType.VOICE_PITCH_STARTED, EventCategory.FEATURE, 'Voice Pitch Started');
    },
    voicePitchCompleted: (duration: number) => {
      this.trackEvent(
        EventType.VOICE_PITCH_COMPLETED,
        EventCategory.FEATURE,
        'Voice Pitch Completed',
        { duration_seconds: duration }
      );
    },
    advisorSelected: (advisorId: string, advisorType: string, advisorName: string) => {
      this.trackEvent(EventType.ADVISOR_SELECTED, EventCategory.FEATURE, 'Advisor Selected', {
        advisor_id: advisorId,
        advisor_type: advisorType,
        advisor_name: advisorName,
      });
    },
    customAdvisorCreated: (advisorId: string) => {
      this.trackEvent(
        EventType.CUSTOM_ADVISOR_CREATED,
        EventCategory.FEATURE,
        'Custom Advisor Created',
        { advisor_id: advisorId }
      );
    },
  };

  /**
   * Track navigation events
   */
  public trackNavigation = {
    dashboardView: () => {
      this.trackEvent(EventType.DASHBOARD_VIEW, EventCategory.NAVIGATION, 'Dashboard Viewed');
    },
    modeSelected: (mode: string) => {
      this.trackEvent(EventType.MODE_SELECTED, EventCategory.NAVIGATION, 'Mode Selected', {
        mode,
      });
    },
  };

  /**
   * Opt out of analytics
   */
  public optOut(): void {
    this.isEnabled = false;
    try {
      localStorage.setItem('analytics_opt_out', 'true');
    } catch {
      // Ignore if localStorage is blocked
    }
    this.trackEvent(EventType.SESSION_END, EventCategory.ENGAGEMENT, 'Analytics Opt Out');
    this.flushEvents();

    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
  }

  /**
   * Opt back in to analytics
   */
  public optIn(): void {
    this.isEnabled = true;
    try {
      localStorage.removeItem('analytics_opt_out');
    } catch {
      // Ignore if localStorage is blocked
    }
    this.trackEvent(EventType.SESSION_START, EventCategory.ENGAGEMENT, 'Analytics Opt In');
  }

  /**
   * Get analytics opt-in status
   */
  public isOptedIn(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Export convenience functions
export const trackEvent = (
  eventType: EventType,
  eventCategory: EventCategory,
  eventName: string,
  eventData?: EventData
) => analytics.trackEvent(eventType, eventCategory, eventName, eventData);

export const trackPageView = (pageName: string, metadata?: EventData) =>
  analytics.trackPageView(pageName, metadata);
