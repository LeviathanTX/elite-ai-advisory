# AI-BoD Document Processing & Analysis Architecture

## Overview
The AI Board of Directors (AI-BoD) has a sophisticated document processing and analysis system built on a multi-layered architecture supporting PDF, Word, Excel, and PowerPoint document processing with AI-powered analysis and context-aware conversations.

---

## 1. DOCUMENT PROCESSING PIPELINE

### 1.1 File Input & Extraction Layer
**Location:** `/home/user/AI-BoD/src/services/DocumentProcessor.ts`

#### Key Functions:
- **`processFile(file: File): Promise<ProcessedDocument>`**
  - Main entry point for document processing
  - Detects file type and routes to appropriate extractor
  - Handles PDF, DOCX, XLSX, PPTX, PPT, TXT, MD formats
  - Returns `ProcessedDocument` with text and metadata

- **Text Extraction Methods:**
  - `extractPDFText()` - Uses PDF.js library for page-by-page extraction
  - `extractWordText()` - Uses Mammoth library for DOCX parsing
  - `extractExcelText()` - Uses XLSX library for spreadsheet conversion
  - `extractPowerPointText()` - Uses JSZip to parse PPTX XML structure
  - `extractPlainText()` - FileReader API for TXT/MD files

#### Supported File Types:
```typescript
type FileType = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'ppt' | 'txt' | 'md'
```

#### Processing Output Structure:
```typescript
interface ProcessedDocument {
  text: string;                    // Full extracted text
  metadata: {
    title?: string;              // From filename
    author?: string;
    pages?: number;              // PDF only
    slides?: number;             // PowerPoint only
    wordCount: number;
    size: number;               // File size in bytes
    type: FileType;
  };
  chunks: string[];             // Segmented text for processing
}
```

#### PDF Processing Details:
- **Setup:** `configurePDFWorkerAuto()` in `/home/user/AI-BoD/src/utils/pdfWorkerSetup.ts`
- **Worker Sources (in priority order):**
  1. Local public file: `/public/pdf.worker.min.js`
  2. Modern URL constructor with local bundle
  3. CDN fallback: `cdnjs.cloudflare.com/pdf.js`
- **Extraction:** Page-by-page text extraction with OCR fallback

#### Validation:
- **Max file size:** 50MB
- **Validation function:** `validateFile(file: File)`
- **Returns:** `{ isValid: boolean; error?: string }`

### 1.2 Text Chunking & Segmentation
**Location:** `/home/user/AI-BoD/src/services/DocumentProcessor.ts` - `chunkText()` method

#### Chunking Strategy:
- **Default chunk size:** 1000 characters
- **Overlap:** 100 characters for context preservation
- **Strategy:** Sentence-based splitting with fallback to word-based
- **Purpose:** Enable semantic processing of large documents

#### Algorithm:
1. Split by sentence delimiters (. ! ?)
2. Build chunks respecting max size
3. Maintain overlap for context
4. Filter empty chunks

---

## 2. DOCUMENT STORAGE & RETRIEVAL

### 2.1 In-Memory Document Store
**Location:** `/home/user/AI-BoD/src/services/DocumentStorage.ts`

#### Core Class: `DocumentStorage` (Singleton Pattern)
```typescript
class DocumentStorage {
  private documents: Map<string, StoredDocument>;
  private documentChunks: Map<string, string[]>;
  static getInstance(): DocumentStorage
}
```

#### Stored Document Schema:
```typescript
interface StoredDocument {
  id: string;                           // Unique document ID
  filename: string;                     // Sanitized filename
  originalName: string;                 // Original filename
  filePath: string;                     // Virtual path: documents/{userId}/{advisorId}/{docId}/{name}
  contentType: string;                  // MIME type
  size: number;                         // File size in bytes
  advisorId: string;                    // Associated advisor
  userId: string;                       // Document owner
  extractedText: string;                // Full text content
  metadata: ProcessedDocument['metadata'];
  tags: string[];                       // User-defined tags
  category: DocumentCategory;           // Predefined categories
  confidentialityLevel: ConfidentialityLevel;
  uploadedAt: string;                   // ISO timestamp
  updatedAt: string;                    // ISO timestamp
  isTemporary?: boolean;                // For multi-document selection
}
```

#### Document Categories:
```typescript
type DocumentCategory = 
  | 'meeting-minutes'
  | 'proposal'
  | 'report'
  | 'legal'
  | 'financial'
  | 'strategic-plan'
  | 'presentation'
  | 'contract'
  | 'other'
```

#### Confidentiality Levels:
```typescript
type ConfidentialityLevel = 'public' | 'internal' | 'confidential' | 'restricted'
```

#### Key Methods:

**Storage Operations:**
- `storeDocument(file, processedDoc, advisorId, userId, options)` - Store processed document
- `getDocument(documentId)` - Retrieve by ID
- `getAllDocuments()` - List all documents (sorted by date DESC)
- `getAdvisorDocuments(advisorId)` - Get documents for specific advisor
- `getUserDocuments(userId)` - Get all user documents
- `deleteDocument(documentId)` - Remove document

**Search & Retrieval:**
- `searchDocuments(query, advisorId?, userId?, options?)` - Full-text search with filters
- `getDocumentsByCategory(category, advisorId?)` - Filter by category
- `getRecentDocuments(limit, advisorId?, userId?)` - Get most recent

**Metadata Operations:**
- `updateDocument(documentId, updates)` - Update tags, category, confidentiality
- `getDocumentStats(advisorId?, userId?)` - Aggregate statistics
- `getDocumentPreview(documentId, maxLength)` - Preview text

**Search Results:**
```typescript
interface DocumentSearchResult {
  document: StoredDocument;
  relevanceScore: number;         // 0-1 relevance score
  matchedChunks: string[];        // Up to 3 matching chunks
}
```

#### Data Persistence:
- **Current Implementation:** In-memory (requires persistent layer for production)
- **Export/Import Methods:**
  - `exportDocuments(advisorId?)` - Full data export
  - `importDocuments(data)` - Data restoration
- **Future Integration:** Supabase storage with bucket for file uploads

---

## 3. DOCUMENT CONTEXT FOR AI

### 3.1 Context Management Service
**Location:** `/home/user/AI-BoD/src/services/DocumentContext.ts`

#### Core Class: `DocumentContextService`
**Purpose:** Extract and optimize document context for AI conversation prompts

#### Key Responsibilities:
1. Identify relevant documents based on conversation
2. Extract matching chunks by relevance
3. Optimize for token limits
4. Format for AI system prompts

#### Main Methods:

**Context Generation:**
```typescript
async getDocumentContext(
  advisorId: string,
  conversationHistory: string[] = [],
  referencedDocuments: string[] = []
): Promise<DocumentContext>
```

**Returns:**
```typescript
interface DocumentContext {
  documents: StoredDocument[];      // Available documents
  relevantChunks: DocumentChunk[];  // Ranked by relevance
  totalTokens: number;              // Current token count
  maxTokens: number;                // Limit (8000)
}
```

**Chunk Structure:**
```typescript
interface DocumentChunk {
  documentId: string;
  documentName: string;
  chunkIndex: number;
  content: string;
  relevanceScore: number;           // 0-1 score
  tokens: number;                   // Estimated token count
}
```

#### Relevance Scoring Algorithm:
**Location:** `calculateRelevanceScore()` method

```
Score components:
1. Direct reference boost: +0.5 (if explicitly selected)
2. Keyword matching: (matches/total_keywords) * 0.4
3. Section importance: +0.1-0.2 (for keywords like "summary", "conclusion", "key")
4. Maximum normalized to 1.0
```

#### Token Estimation:
- **Formula:** `Math.ceil(wordCount / 0.75)`
- **Rationale:** Rough approximation (1 token ≈ 0.75 words)
- **Context Limit:** 8000 tokens (conservative for safety)

**Chunk Optimization:**
```typescript
optimizeChunksForTokenLimit(chunks): DocumentChunk[]
  - Filters chunks by relevance until token limit reached
  - Truncates last chunk if needed
  - Maintains minimum 100 token threshold
```

#### Document Parsing Features:

**Reference Detection:**
```typescript
parseDocumentReferences(messageText, advisorDocuments)
  - Matches @document-name or @"document name" patterns
  - Returns DocumentReference[] for direct references
```

**Suggestion System:**
```typescript
suggestRelevantDocuments(conversationText, advisorDocuments, limit=3)
  - Identifies relevant documents based on conversation context
  - Threshold: relevance score > 0.3
  - Returns top N suggestions sorted by relevance
```

#### AI Prompt Formatting:
```typescript
formatDocumentContextForAI(context: DocumentContext): string
  - Formats as markdown sections
  - Shows document category and confidentiality level
  - Displays relevance scores for each chunk
  - Includes token usage information
  - Instructs AI to reference documents when relevant
```

**Output Format:**
```
--- AVAILABLE DOCUMENTS ---
You have access to N documents in your knowledge base.

## Document Name
Category: financial | Confidentiality: confidential

### Excerpt 1 (Relevance: 95%)
[Chunk content...]

### Excerpt 2 (Relevance: 87%)
[Chunk content...]

--- END DOCUMENTS (2500/8000 tokens) ---
```

### 3.2 Document Context Hook
**Location:** `/home/user/AI-BoD/src/hooks/useDocumentContext.ts`

#### Hook Interface: `useDocumentContext()`
Provides React component access to DocumentContextService

#### Exported Functions:
```typescript
{
  getDocumentContext: (advisorId, history?, refs?) => Promise<DocumentContext>
  parseDocumentReferences: (text, docs) => DocumentReference[]
  suggestRelevantDocuments: (text, docs, limit?) => DocumentReference[]
  formatDocumentContextForAI: (context) => string
  getDocumentById: (id) => StoredDocument | undefined
  getDocumentPreview: (id, maxLength?) => string
  isLoading: boolean
  error: string | null
}
```

#### Usage in Conversations:
**Location:** `/home/user/AI-BoD/src/components/Conversations/AdvisoryConversation.tsx`

```typescript
// Line ~586: Document context integration
const documentContext = await getDocumentContext(
  advisorId,
  conversationHistory,
  referencedDocuments
);

if (documentContext) {
  documentContextString = formatDocumentContextForAI(documentContext);
  // Injected into system prompt at line ~649
}
```

---

## 4. AI ANALYSIS & ADVISOR LOGIC

### 4.1 Advisor AI Service
**Location:** `/home/user/AI-BoD/src/services/advisorAI.ts`

#### Core Class: `AdvisorAI`
Generates AI-powered advisor feedback on various topics

#### Key Methods:

**Pitch Analysis:**
```typescript
async generatePitchFeedback(
  advisor: CelebrityAdvisor,
  pitchText: string,
  analysisType?: string,
  voiceMetrics?: VoiceMetrics,
  audioFeatures?: AudioFeatures,
  vocalInsights?: VocalDeliveryInsights
): Promise<{
  feedback: string
  strengths: string[]
  improvements: string[]
  overallScore: number
  deliveryScore?: number
  contentScore?: number
}>
```

**Comprehensive Pitch Coaching:**
```typescript
async generateComprehensivePitchCoaching(
  advisor: CelebrityAdvisor,
  pitchText: string,
  audioFeatures: AudioFeatures,
  vocalInsights: VocalDeliveryInsights,
  timestampedMetrics: any[] = []
): Promise<{
  overall_feedback: string
  content_analysis: { score, strengths[], improvements[], recommendations[] }
  delivery_analysis: { score, vocal_strengths[], vocal_improvements[], ... }
  combined_score: number
  action_plan: string[]
  timeline_analysis?: { problematic_moments[], improvement_areas[] }
}>
```

**Strategic Response:**
```typescript
async generateStrategicResponse(
  advisor: CelebrityAdvisor,
  topic: string,
  userMessage: string,
  conversationHistory: string[] = []
): Promise<string>
```

**Due Diligence Analysis:**
```typescript
async generateDueDiligenceAnalysis(
  advisor: CelebrityAdvisor,
  documentType: string,
  documentSummary: string
): Promise<{
  insight: string
  recommendation: string
}>
```

**Quick Consultation:**
```typescript
async generateQuickConsultation(
  advisor: CelebrityAdvisor,
  category: string,
  question: string
): Promise<string>
```

#### System Prompt Building:
**Method:** `buildAdvisorSystemPrompt(advisor, mode)`

---

## 5. AI SERVICE LAYER

### 5.1 Secure AI Service Client
**Location:** `/home/user/AI-BoD/src/services/secureAIService.ts`

#### Core Class: `SecureAIServiceClient`
**Purpose:** Unified interface to multiple AI providers with fallback chain

#### Key Features:
1. **Multi-Provider Support:** Claude, OpenAI, Gemini, DeepSeek
2. **Fallback Strategy:**
   - Primary: Backend proxy (`/api/generate`)
   - Secondary: Direct API calls (if configured)
   - Tertiary: Intelligent mock responses
3. **Request Validation & Sanitization**
4. **Response Caching & Error Handling**

### 5.2 Backend API Proxy
**Location:** `/home/user/AI-BoD/api/generate.js` (Vercel Serverless)

---

## 6. DATABASE SCHEMA

### 6.1 Supabase Database
**Location:** `/home/user/AI-BoD/supabase/migrations/20241115000000_initial_schema.sql`

#### Core Tables:
- **users** - User accounts and subscriptions
- **documents** - Uploaded documents with analysis status
- **custom_advisors** - User-created advisor profiles
- **conversations** - Chat history with advisors
- **usage_stats** - Feature usage tracking

---

## 7. FRONTEND COMPONENTS

### 7.1 Document Management UI
**Location:** `/home/user/AI-BoD/src/components/Documents/`

#### DocumentDashboard Component
- Drag-and-drop file upload
- Full-text search
- Category & confidentiality filtering
- Grid and list view modes
- Upload progress tracking

#### DocumentSelector Component
- Multi-document selection
- Upload during selection
- Search across content
- Progress tracking
- Temporary document mode

### 7.2 Conversation Integration
**Location:** `/home/user/AI-BoD/src/components/Conversations/AdvisoryConversation.tsx`

Document context automatically injected into advisor conversations

---

## 8. KEY FILE STRUCTURE

```
/home/user/AI-BoD/
├── src/
│   ├── services/
│   │   ├── DocumentProcessor.ts          (Extract text from files)
│   │   ├── DocumentStorage.ts            (In-memory document cache)
│   │   ├── DocumentContext.ts            (Format documents for AI)
│   │   ├── advisorAI.ts                  (Advisor analysis logic)
│   │   ├── secureAIService.ts            (AI provider integration)
│   │   ├── AdvisorKnowledgeFramework.ts  (Expert knowledge)
│   │   └── supabase.ts                   (Database client)
│   ├── components/
│   │   ├── Documents/
│   │   │   ├── DocumentDashboard.tsx
│   │   │   └── DocumentSelector.tsx
│   │   ├── Conversations/
│   │   │   └── AdvisoryConversation.tsx
│   │   └── Debug/
│   │       └── DocumentDebugger.tsx
│   ├── hooks/
│   │   └── useDocumentContext.ts
│   ├── utils/
│   │   ├── pdfWorkerSetup.ts
│   │   └── pdfWorkerTest.ts
│   └── types/
│       └── index.ts
├── api/
│   └── generate.js                       (Backend API proxy)
├── supabase/
│   └── migrations/
│       └── 20241115000000_initial_schema.sql
├── public/
│   └── pdf.worker.min.js                 (PDF.js worker)
├── tests/
│   └── e2e/
│       └── document-upload.spec.ts
└── package.json
```

---

## 9. CURRENT CAPABILITIES

✓ Multi-format document processing (PDF, DOCX, XLSX, PPTX, PPT, TXT, MD)
✓ Full-text search with relevance scoring
✓ Smart chunk extraction & context optimization
✓ Document categorization & confidentiality levels
✓ Token-aware context formatting (8000 token limit)
✓ Reference detection (@document-name patterns)
✓ Automatic document suggestions
✓ Upload progress tracking
✓ Error handling & validation

---

## 10. KNOWN LIMITATIONS

✗ In-memory only (no persistence across restarts)
✗ No vector embeddings (keyword-based search only)
✗ No semantic similarity matching
✗ No document versioning
✗ No OCR for image-based PDFs
✗ No automatic summarization
✗ No cross-document analysis
✗ No real-time collaboration

---

## 11. PRODUCTION ROADMAP

### Short Term:
- Implement Supabase documents table persistence
- Add vector embeddings (OpenAI embeddings API)
- Set up semantic search with pgvector

### Medium Term:
- PDF OCR for image-based documents
- Document versioning & history
- Automatic summarization
- Cross-document analysis

### Long Term:
- Real-time collaboration
- Document workflows
- Advanced RAG scoring
- Custom knowledge base tuning

