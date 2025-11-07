/**
 * Test Data Fixtures
 *
 * Centralized test data for consistent testing across the application
 */

export const testUsers = {
  demo: {
    email: 'test@eliteai.com',
    password: 'TestPassword123!',
    fullName: 'Test User',
  },
  founder: {
    email: 'founder@startup.com',
    password: 'FounderPass123!',
    fullName: 'Startup Founder',
  },
};

export const testDocuments = {
  samplePdf: {
    name: 'business-plan.pdf',
    type: 'application/pdf',
    size: 524288, // 512KB
  },
  sampleWord: {
    name: 'pitch-deck.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 102400, // 100KB
  },
  sampleExcel: {
    name: 'financials.xlsx',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 51200, // 50KB
  },
};

export const testAdvisors = {
  markCuban: {
    id: 'mark-cuban',
    name: 'Mark Cuban',
    type: 'celebrity',
  },
  barbaraCorcoran: {
    id: 'barbara-corcoran',
    name: 'Barbara Corcoran',
    type: 'celebrity',
  },
  custom: {
    name: 'Test Advisor',
    title: 'Chief Strategy Officer',
    company: 'Test Company',
    expertise: ['Strategy', 'Operations', 'Fundraising'],
    personality: 'Direct, analytical, and results-oriented',
    communicationStyle: 'Clear and concise with data-driven insights',
    background: 'Former Fortune 500 executive with 20 years experience',
  },
};

export const testMessages = {
  pitchPractice: 'I need help practicing my pitch for investors',
  strategicPlanning: 'Help me create a 5-year strategic plan for my SaaS startup',
  dueDiligence: 'Can you analyze this business plan and provide feedback?',
  quickConsultation: 'What are the key metrics I should track for a B2B SaaS?',
};

export const mockApiResponses = {
  successfulGeneration: {
    content: 'This is a mock AI response for testing purposes.',
    role: 'assistant',
  },
  error: {
    message: 'API request failed',
    code: 'api_error',
  },
};
