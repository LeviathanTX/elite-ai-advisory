import { supabase } from './supabase';
import { Message, DocumentReference } from '../types';

export interface ConversationData {
  id: string;
  user_id: string;
  mode:
    | 'pitch_practice'
    | 'strategic_planning'
    | 'due_diligence'
    | 'quick_consultation'
    | 'general';
  advisors: Array<{
    id: string;
    type: 'celebrity' | 'custom';
    name?: string;
  }>;
  messages: Message[];
  files?: Array<{
    name: string;
    type: string;
    size: number;
    content?: string;
  }>;
  selectedDocuments?: DocumentReference[];
  conversationDocuments?: Array<{
    id: string;
    filename: string;
    content: string;
    metadata?: any;
  }>;
  title?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SavedConversationRow {
  id: string;
  user_id: string;
  advisor_id: string;
  advisor_type: 'celebrity' | 'custom';
  mode:
    | 'pitch_practice'
    | 'strategic_planning'
    | 'due_diligence'
    | 'quick_consultation'
    | 'general';
  messages: any;
  metadata: any;
  created_at: string;
  updated_at: string;
}

/**
 * Save or update a conversation to Supabase
 * Also saves to localStorage as cache
 */
export async function saveConversation(
  conversation: ConversationData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Save to localStorage first (cache)
    try {
      localStorage.setItem(`conversation-${conversation.id}`, JSON.stringify(conversation));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }

    // Don't save to database in demo mode
    const isDemoMode =
      !process.env.REACT_APP_SUPABASE_URL || process.env.REACT_APP_BYPASS_AUTH === 'true';
    if (isDemoMode) {
      console.log('Demo mode - conversation saved to localStorage only');
      return { success: true };
    }

    // Prepare metadata (everything except messages)
    const metadata = {
      mode: conversation.mode,
      advisors: conversation.advisors,
      files: conversation.files || [],
      selectedDocuments: conversation.selectedDocuments || [],
      conversationDocuments: conversation.conversationDocuments || [],
      title: conversation.title || 'Untitled Conversation',
    };

    // Primary advisor (first in list) for database schema compatibility
    const primaryAdvisor = conversation.advisors[0];
    if (!primaryAdvisor) {
      throw new Error('Conversation must have at least one advisor');
    }

    // Check if conversation exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversation.id)
      .single();

    if (existing) {
      // Update existing conversation
      const { error } = await supabase
        .from('conversations')
        .update({
          messages: conversation.messages,
          metadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversation.id);

      if (error) throw error;
    } else {
      // Insert new conversation
      const { error } = await supabase.from('conversations').insert({
        id: conversation.id,
        user_id: conversation.user_id,
        advisor_id: primaryAdvisor.id,
        advisor_type: primaryAdvisor.type,
        mode: conversation.mode,
        messages: conversation.messages,
        metadata,
      });

      if (error) throw error;
    }

    console.log('✅ Conversation saved to database:', conversation.id);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Failed to save conversation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Load all conversations for the current user from Supabase
 * Falls back to localStorage if database fails
 */
export async function loadConversations(userId: string): Promise<ConversationData[]> {
  const conversations: ConversationData[] = [];

  try {
    // Don't query database in demo mode
    const isDemoMode =
      !process.env.REACT_APP_SUPABASE_URL || process.env.REACT_APP_BYPASS_AUTH === 'true';

    if (!isDemoMode && userId) {
      // Fetch from Supabase
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        console.log(`✅ Loaded ${data.length} conversations from database`);

        // Transform database rows to ConversationData
        for (const row of data as SavedConversationRow[]) {
          const metadata = row.metadata || {};
          conversations.push({
            id: row.id,
            user_id: row.user_id,
            mode: row.mode,
            advisors: metadata.advisors || [{ id: row.advisor_id, type: row.advisor_type }],
            messages: row.messages || [],
            files: metadata.files || [],
            selectedDocuments: metadata.selectedDocuments || [],
            conversationDocuments: metadata.conversationDocuments || [],
            title: metadata.title || 'Untitled Conversation',
            created_at: row.created_at,
            updated_at: row.updated_at,
          });
        }

        // Also save to localStorage as cache
        try {
          conversations.forEach(conv => {
            localStorage.setItem(`conversation-${conv.id}`, JSON.stringify(conv));
          });
        } catch (e) {
          console.warn('Failed to cache conversations in localStorage:', e);
        }

        return conversations;
      }
    }

    // Fallback to localStorage (or primary source in demo mode)
    console.log('Loading conversations from localStorage...');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('conversation-')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '');
          // Filter by userId in case of shared device
          if (data.user_id === userId || isDemoMode) {
            conversations.push(data);
          }
        } catch (error) {
          console.error('Error loading conversation from localStorage:', error);
        }
      }
    }

    console.log(`📦 Loaded ${conversations.length} conversations from localStorage`);
    return conversations.sort(
      (a, b) =>
        new Date(b.updated_at || b.created_at || 0).getTime() -
        new Date(a.updated_at || a.created_at || 0).getTime()
    );
  } catch (error: any) {
    console.error('❌ Failed to load conversations from database, using localStorage:', error);

    // Fallback to localStorage on error
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('conversation-')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '');
          if (data.user_id === userId) {
            conversations.push(data);
          }
        } catch (error) {
          console.error('Error loading conversation from localStorage:', error);
        }
      }
    }

    return conversations.sort(
      (a, b) =>
        new Date(b.updated_at || b.created_at || 0).getTime() -
        new Date(a.updated_at || a.created_at || 0).getTime()
    );
  }
}

/**
 * Delete a conversation from both database and localStorage
 */
export async function deleteConversation(
  conversationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete from localStorage
    try {
      localStorage.removeItem(`conversation-${conversationId}`);
    } catch (e) {
      console.warn('Failed to delete from localStorage:', e);
    }

    // Delete from database
    const isDemoMode =
      !process.env.REACT_APP_SUPABASE_URL || process.env.REACT_APP_BYPASS_AUTH === 'true';
    if (!isDemoMode) {
      const { error } = await supabase.from('conversations').delete().eq('id', conversationId);

      if (error) throw error;
    }

    console.log('✅ Conversation deleted:', conversationId);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Failed to delete conversation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Load a single conversation by ID
 */
export async function loadConversation(
  conversationId: string,
  userId: string
): Promise<ConversationData | null> {
  try {
    // Try database first
    const isDemoMode =
      !process.env.REACT_APP_SUPABASE_URL || process.env.REACT_APP_BYPASS_AUTH === 'true';

    if (!isDemoMode) {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        const row = data as SavedConversationRow;
        const metadata = row.metadata || {};

        return {
          id: row.id,
          user_id: row.user_id,
          mode: row.mode,
          advisors: metadata.advisors || [{ id: row.advisor_id, type: row.advisor_type }],
          messages: row.messages || [],
          files: metadata.files || [],
          selectedDocuments: metadata.selectedDocuments || [],
          conversationDocuments: metadata.conversationDocuments || [],
          title: metadata.title || 'Untitled Conversation',
          created_at: row.created_at,
          updated_at: row.updated_at,
        };
      }
    }

    // Fallback to localStorage
    const stored = localStorage.getItem(`conversation-${conversationId}`);
    if (stored) {
      const data = JSON.parse(stored);
      if (data.user_id === userId || isDemoMode) {
        return data;
      }
    }

    return null;
  } catch (error) {
    console.error('Error loading conversation:', error);
    return null;
  }
}
