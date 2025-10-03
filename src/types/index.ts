// Core Types for Elite AI Advisory Platform

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  subscription_tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
}

export type SubscriptionTier = 'founder' | 'scale-up' | 'enterprise';

export interface SubscriptionLimits {
  ai_advisor_hours: number;
  document_analyses: number;
  pitch_practice_sessions: number;
  custom_advisors: number;
  api_access: boolean;
  white_label: boolean;
}

export interface UsageStats {
  ai_advisor_hours_used: number;
  document_analyses_used: number;
  pitch_practice_sessions_used: number;
  custom_advisors_created: number;
}

// Celebrity Advisors
export interface CelebrityAdvisor {
  id: string;
  name: string;
  title: string;
  company: string;
  expertise: string[];
  personality_traits: string[];
  communication_style: string;
  avatar_url?: string;
  avatar_image?: string; // URL or base64 data for custom uploaded image
  bio: string;
  investment_thesis?: string;
  system_prompt?: string; // Advanced AI system prompt for world-class advisory
  aiService?: AIService;
  // Additional properties for compatibility
  role?: AdvisorRole;
  avatar_emoji?: string;
  ai_service?: AIService;
  type?: 'celebrity';
}

// Custom Advisors
export interface CustomAdvisor {
  id: string;
  user_id: string;
  name: string;
  title: string;
  company?: string;
  expertise: string[];
  personality_description: string;
  communication_style: string;
  background_context: string;
  avatar_image?: string; // URL or base64 data for custom uploaded image
  created_at: string;
  // Additional properties for compatibility
  role?: AdvisorRole;
  avatar_emoji?: string;
  ai_service?: AIService;
  type?: 'custom';
}

// Voice Processing
export interface VoiceSession {
  id: string;
  user_id: string;
  type: 'pitch_practice' | 'advisor_conversation';
  duration: number;
  transcript: string;
  analysis?: PitchAnalysis;
  created_at: string;
}

export interface PitchMetrics {
  confidence_score: number;
  clarity_score: number;
  pace_score: number;
  engagement_score: number;
  overall_score: number;
  filler_words: number;
  speaking_pace: number; // words per minute
  pause_analysis: {
    total_pauses: number;
    average_pause_duration: number;
    strategic_pauses: number;
  };
}

export interface PitchAnalysis {
  metrics: PitchMetrics;
  key_strengths: string[];
  improvement_areas: string[];
  specific_feedback: string[];
  recommendations: string[];
  transcript_highlights: {
    strong_moments: string[];
    weak_moments: string[];
  };
}

// Document Processing
export interface Document {
  id: string;
  user_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  content_text?: string;
  upload_date: string;
  analysis_status: 'pending' | 'processing' | 'completed' | 'error';
  analysis_results?: DocumentAnalysis;
}

export interface DocumentAnalysis {
  summary: string;
  key_insights: string[];
  financial_metrics?: FinancialMetrics;
  risk_assessment: RiskAssessment;
  due_diligence_score: number;
  investment_recommendation?: 'strong_buy' | 'buy' | 'hold' | 'pass';
  generated_at: string;
}

export interface FinancialMetrics {
  revenue_growth: number;
  profit_margins: number;
  burn_rate?: number;
  runway_months?: number;
  valuation?: number;
  key_ratios: Record<string, number>;
}

export interface RiskAssessment {
  overall_risk: 'low' | 'medium' | 'high';
  risk_factors: string[];
  mitigation_strategies: string[];
}

// Conversations and Sessions
export interface AdvisorConversation {
  id: string;
  user_id: string;
  advisor_id: string;
  advisor_type: 'celebrity' | 'custom';
  mode: ApplicationMode;
  messages: ConversationMessage[];
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'advisor';
  content: string;
  timestamp: string;
  voice_url?: string;
}

export type ApplicationMode = 'pitch_practice' | 'advisory_conversation' | 'advisor_management' | 'strategic_planning' | 'due_diligence' | 'quick_consultation' | 'test_document';

export type AIService = 'claude' | 'gemini' | 'chatgpt' | 'deepseek' | 'groq';

// Unified Advisor Types
export type AdvisorRole =
  // Platform Roles
  | 'Platform Host & Guide' | 'Startup Advisor'
  // Tier 1: Core Strategic Advisors
  | 'Chief Strategy Advisor' | 'Due Diligence Director' | 'Market Intelligence Advisor' | 'Financial Architecture Advisor' | 'Operational Excellence Advisor'
  // Tier 2: Functional Specialists
  | 'Technology & Innovation Advisor' | 'Human Capital Advisor' | 'Legal & Regulatory Advisor' | 'ESG & Sustainability Advisor' | 'Customer Experience Advisor' | 'Supply Chain & Procurement Advisor' | 'Data & Analytics Advisor' | 'International & Expansion Advisor'
  // Tier 3: Industry Specialists
  | 'Technology/SaaS Specialist' | 'Healthcare/Biotech Specialist' | 'Financial Services Specialist' | 'Manufacturing/Industrial Specialist' | 'Consumer/Retail Specialist' | 'Energy/Sustainability Specialist'
  // Traditional Roles (Legacy Support)
  | 'CEO' | 'CFO' | 'CTO' | 'CMO' | 'COO' | 'VP Strategy' | 'VP Finance' | 'VP Marketing' | 'VP Operations' | 'VP Technology' | 'Managing Partner' | 'Investment Partner' | 'Board Member' | 'Strategic Advisor' | 'Consultant';

export type AdvisorExpertise =
  // Strategic & Financial
  | 'Corporate Strategy' | 'M&A Strategy' | 'Transformation' | 'Board Governance' | 'Financial Modeling' | 'Valuation' | 'Capital Structure' | 'Transaction Structuring' | 'Risk Assessment' | 'Due Diligence'
  // Market & Competitive Intelligence
  | 'Market Sizing' | 'Competitive Analysis' | 'Trend Forecasting' | 'Customer Insights' | 'Industry Research' | 'Business Intelligence'
  // Operational Excellence
  | 'Process Optimization' | 'Technology Implementation' | 'Scaling Operations' | 'Performance Management' | 'Supply Chain' | 'Procurement'
  // Technology & Innovation
  | 'Digital Transformation' | 'AI/ML Implementation' | 'Cybersecurity' | 'Tech Due Diligence' | 'Innovation Pipeline' | 'Technology Architecture'
  // Human Capital & Organization
  | 'Executive Assessment' | 'Organizational Design' | 'Culture Evaluation' | 'Talent Acquisition' | 'Leadership Development' | 'Succession Planning'
  // Legal & Regulatory
  | 'Corporate Law' | 'Regulatory Compliance' | 'Intellectual Property' | 'Litigation Risk' | 'Contract Analysis' | 'Legal Structure'
  // ESG & Sustainability
  | 'Environmental Compliance' | 'Social Impact' | 'Governance Frameworks' | 'Sustainability Strategy' | 'ESG Risk Assessment'
  // Customer & Market
  | 'Customer Research' | 'Brand Strategy' | 'Digital Marketing' | 'Customer Experience' | 'Market Positioning' | 'Growth Strategy'
  // Data & Analytics
  | 'Data Strategy' | 'Analytics Implementation' | 'Business Intelligence' | 'Data Governance' | 'Insights Generation'
  // International & Expansion
  | 'Global Markets' | 'International Business' | 'Cross-Border Risk' | 'Cultural Considerations' | 'Regulatory Environments'
  // Industry Specializations
  | 'SaaS Metrics' | 'Healthcare Economics' | 'Banking Regulations' | 'Manufacturing Processes' | 'Consumer Behavior' | 'Energy Markets'
  // Legacy Support
  | 'Strategy' | 'Finance' | 'Marketing' | 'Operations' | 'Technology' | 'Sales' | 'Product Development' | 'Legal' | 'HR' | 'International Business' | 'Venture Capital' | 'Private Equity' | 'Investment Banking' | 'Startups' | 'Manufacturing' | 'Healthcare' | 'Fintech' | 'E-commerce' | 'Real Estate' | 'Cybersecurity' | 'SaaS' | 'AI/ML';

export interface Advisor {
  id: string;
  name: string;
  role: AdvisorRole;
  expertise: AdvisorExpertise[];
  personality: string;
  avatar_emoji: string;
  avatar_image?: string; // URL or base64 data for custom uploaded image
  background: string;
  ai_service: AIService;
  system_prompt: string;
  mcp_folder_path?: string; // Path to MCP documents folder for this advisor
  mcp_enabled?: boolean; // Whether MCP functionality is enabled for this advisor
  created_at: string;
  updated_at: string;
  // Legacy compatibility
  title?: string;
  company?: string;
}

export interface MCPDocument {
  id: string;
  filename: string;
  path: string;
  content: string;
  type: 'text' | 'pdf' | 'docx' | 'markdown';
  size: number;
  uploaded_at: string;
  advisor_id: string;
}

export interface MCPFolder {
  id: string;
  name: string;
  path: string;
  advisor_id: string;
  documents: MCPDocument[];
  created_at: string;
  updated_at: string;
}

export interface AIServiceConfig {
  id: AIService;
  name: string;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface AppSettings {
  aiServices: Record<AIService, AIServiceConfig>;
  defaultAIService?: AIService;
}

// Collaboration
export interface SharedItem {
  id: string;
  user_id: string;
  item_type: 'conversation' | 'document' | 'analysis';
  item_id: string;
  shared_with_email?: string;
  access_level: 'view' | 'comment' | 'edit';
  share_link?: string;
  expires_at?: string;
  created_at: string;
}

export interface Comment {
  id: string;
  item_id: string;
  user_email: string;
  content: string;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}