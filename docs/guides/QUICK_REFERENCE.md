# Document System Quick Reference Guide

## Key Files at a Glance

### Document Processing (Stage 1: File → Text)
```
DocumentProcessor.ts
├── processFile()           → Detect type & extract
├── extractPDFText()        → PDF.js extraction
├── extractWordText()       → Mammoth DOCX parsing
├── extractExcelText()      → XLSX conversion
├── extractPowerPointText() → JSZip XML parsing
├── chunkText()            → 1000 char chunks
└── validateFile()         → 50MB max size
```
Location: `/home/user/AI-BoD/src/services/DocumentProcessor.ts`

### Document Storage (Stage 2: Text → Cache)
```
DocumentStorage.ts
├── storeDocument()        → Save to memory
├── getDocument()          → Retrieve by ID
├── searchDocuments()      → Full-text search
├── getAdvisorDocuments()  → Advisor-scoped search
└── getDocumentStats()     → Aggregate stats
```
Location: `/home/user/AI-BoD/src/services/DocumentStorage.ts`

### Document Context (Stage 3: Cache → AI Prompt)
```
DocumentContext.ts
├── getDocumentContext()          → Relevant chunks
├── calculateRelevanceScore()     → 0-1 scoring
├── optimizeChunksForTokenLimit() → 8000 token cap
├── parseDocumentReferences()     → @doc patterns
├── suggestRelevantDocuments()    → Auto-suggest
└── formatDocumentContextForAI()  → Markdown format
```
Location: `/home/user/AI-BoD/src/services/DocumentContext.ts`

### AI Integration (Stage 4: Prompt → Response)
```
advisorAI.ts
├── generatePitchFeedback()           → Pitch analysis
├── generateComprehensivePitchCoaching() → Combined feedback
├── generateStrategicResponse()       → Advice
├── generateDueDiligenceAnalysis()    → Document analysis
└── buildAdvisorSystemPrompt()        → Prompt engineering
```
Location: `/home/user/AI-BoD/src/services/advisorAI.ts`

### AI Provider Layer (Stage 5: API Call)
```
secureAIService.ts
├── generateResponse()        → Unified interface
├── makeSecureAPICall()       → Backend proxy
├── makeDirectAPICall()       → Direct to provider
├── makeClaudeDirectCall()    → Anthropic
├── makeOpenAIDirectCall()    → OpenAI
└── generateSecureMockResponse() → Fallback
```
Location: `/home/user/AI-BoD/src/services/secureAIService.ts`

---

## Data Flow Visualization

### Processing Path (Upload → AI Response)
```
1. User uploads file
   ↓ DocumentSelector.tsx
2. File validation & processing
   ↓ DocumentProcessor.ts
3. Text extraction + chunking
   ↓ DocumentStorage.ts (in-memory Map)
4. User sends message with context
   ↓ DocumentContextService.ts
5. Relevant chunks ranked by relevance
   ↓ formatDocumentContextForAI()
6. Markdown context → system prompt
   ↓ AdvisoryConversation.tsx
7. AdvisorAI.ts → system prompt
   ↓ secureAIService.ts
8. API call (Proxy → Direct → Mock)
   ↓
9. AI response with document awareness
```

---

## Key Interfaces

### Input: File
```typescript
File {
  name: string
  type: string (MIME)
  size: number
  lastModified: number
}
```

### Output: ProcessedDocument
```typescript
{
  text: string                    // Full extracted text
  metadata: {
    title: string
    pages?: number               // PDF only
    slides?: number              // PPTX only
    wordCount: number
    size: number
    type: 'pdf'|'docx'|'xlsx'|'pptx'|'ppt'|'txt'|'md'
  }
  chunks: string[]               // 1000 char segments
}
```

### Storage: StoredDocument
```typescript
{
  id: string                     // doc-{timestamp}-{random}
  filename: string               // sanitized
  originalName: string
  filePath: string               // documents/{userId}/{advisorId}/{docId}
  contentType: string            // MIME type
  size: number
  advisorId: string              // Associated advisor
  userId: string                 // Document owner
  extractedText: string          // Full text
  metadata: ProcessedDocument['metadata']
  tags: string[]
  category: DocumentCategory     // 8 predefined types
  confidentialityLevel: ConfidentialityLevel  // 4 levels
  uploadedAt: ISO8601           // Timestamp
  updatedAt: ISO8601            // Timestamp
}
```

### Context: DocumentChunk
```typescript
{
  documentId: string
  documentName: string
  chunkIndex: number
  content: string                // Up to 1000 chars
  relevanceScore: number         // 0-1 (keyword match)
  tokens: number                 // ~wordCount / 0.75
}
```

---

## Component Locations

### Document UI
- **DocumentDashboard**: `/src/components/Documents/DocumentDashboard.tsx`
  - Manage all documents
  - Upload, search, filter, categorize
  
- **DocumentSelector**: `/src/components/Documents/DocumentSelector.tsx`
  - Multi-select documents
  - Upload during selection
  - Progress tracking

### Conversation Integration
- **AdvisoryConversation**: `/src/components/Conversations/AdvisoryConversation.tsx`
  - Lines ~23, ~76-80: Import/hook setup
  - Lines ~586-593: Get document context
  - Lines ~649: Inject into prompt
  - Lines ~684-735: Document context usage

### Hooks
- **useDocumentContext**: `/src/hooks/useDocumentContext.ts`
  - React wrapper for DocumentContextService

---

## Configuration Files

### Dependencies
**Package File**: `/home/user/AI-BoD/package.json`

Key document packages:
- `pdfjs-dist` ^5.4.149 - PDF extraction
- `mammoth` ^1.10.0 - Word documents
- `xlsx` ^0.18.5 - Excel/spreadsheets
- `jszip` ^3.10.1 - PowerPoint files

### PDF Worker
**Setup File**: `/home/user/AI-BoD/src/utils/pdfWorkerSetup.ts`

Fallback chain:
1. Local: `/public/pdf.worker.min.js` (built by `npm run copy-pdf-worker`)
2. Import: `pdfjs-dist/build/pdf.worker.min.mjs`
3. CDN: `cdnjs.cloudflare.com/ajax/libs/pdf.js/`

### Database Schema
**Location**: `/home/user/AI-BoD/supabase/migrations/20241115000000_initial_schema.sql`

Tables:
- users - User accounts
- documents - Uploaded documents (not yet integrated)
- custom_advisors - User advisor profiles
- conversations - Chat history
- usage_stats - Feature usage

### Backend API
**Location**: `/home/user/AI-BoD/api/generate.js`

Endpoints:
- POST `/api/generate` - AI API proxy
- Supports: Claude, OpenAI
- Environment: CLAUDE_API_KEY, OPENAI_API_KEY

---

## Search & Filtering

### Full-Text Search
```typescript
searchDocuments(query, advisorId?, userId?, options?)
// Returns: DocumentSearchResult[]
// - Searches: filename, extractedText, tags, title
// - Scoring: keyword frequency + filename matches
// - Result limit: 3 matched chunks per document
```

### Relevance Scoring (0-1)
```
Base formula:
1. Direct reference? +0.5
2. Keyword matches? (count/total) * 0.4
3. Important sections? +0.1-0.2
   (summary, conclusion, key, important)
4. Normalize to [0, 1]
```

### Document Suggestions
```typescript
suggestRelevantDocuments(conversationText, advisorDocuments, limit=3)
// Threshold: relevance > 0.3
// Returns: Top N by relevance
```

---

## Token Management

### Estimation Formula
```
tokens = Math.ceil(wordCount / 0.75)
```

### Context Limits
```
Max context: 8000 tokens
Minimum chunk: 100 tokens
Current usage: Sum of selected chunks
```

### Optimization Strategy
1. Rank all chunks by relevance
2. Add chunks until token limit
3. Truncate last chunk if needed
4. Maintain min 100 token threshold

---

## Error Handling

### File Validation
```typescript
validateFile(file)
// Returns: { isValid: boolean, error?: string }
// Checks:
// - Size <= 50MB
// - Type in: pdf, docx, xlsx, pptx, ppt, txt, md
```

### Processing Errors
- PDF extraction failure → Fallback message
- DOCX parsing failure → Error bubbles up
- Excel conversion → UTF-8 conversion attempt
- PPTX XML parsing → No text extracted fallback

### API Fallback Chain
```
Try: Backend Proxy (/api/generate)
└─ Fail → Try: Direct API (Claude/OpenAI)
   └─ Fail → Use: Intelligent Mock Response
```

---

## Production Checklist

### Persistence
- [ ] Enable Supabase documents table storage
- [ ] Migrate in-memory store to database
- [ ] Set up S3/bucket for file uploads
- [ ] Implement cleanup for old documents

### Search Enhancement
- [ ] Add vector embeddings (OpenAI API)
- [ ] Set up pgvector in Supabase
- [ ] Implement semantic search
- [ ] Add embedding refresh logic

### Performance
- [ ] Add caching layer (Redis)
- [ ] Implement async document processing
- [ ] Add document compression
- [ ] Monitor token usage

### Monitoring
- [ ] Track document upload metrics
- [ ] Monitor search performance
- [ ] Log AI prompt injections
- [ ] Alert on extraction failures

---

## Common Tasks

### Add Document Metadata Field
1. Update `StoredDocument` interface in DocumentStorage.ts
2. Update `storeDocument()` method
3. Update database schema migration
4. Update UI component (DocumentDashboard/Selector)

### Change Chunking Strategy
1. Edit `chunkText()` in DocumentProcessor.ts
2. Update chunk size: default 1000
3. Update overlap: default 100
4. Regenerate chunks for existing documents

### Modify Relevance Scoring
1. Edit `calculateRelevanceScore()` in DocumentContext.ts
2. Adjust component weights
3. Update threshold in `suggestRelevantDocuments()`
4. Test with sample conversations

### Add New File Type
1. Add to `ProcessedDocument['metadata']['type']` in DocumentProcessor.ts
2. Create `extractXxxText()` method
3. Add case to `processFile()` switch statement
4. Update `getFileType()` detection logic
5. Update file validation in `validateFile()`
6. Update package.json dependencies

---

## Debugging

### Log Document Processing
```typescript
// In DocumentProcessor.ts
console.log('Processing:', file.name);
console.log('Type:', type);
console.log('Chunks:', chunks.length);
console.log('Metadata:', metadata);
```

### Check Document Storage
```typescript
const storage = DocumentStorage.getInstance();
console.log('All docs:', storage.getAllDocuments());
console.log('Advisor docs:', storage.getAdvisorDocuments(advisorId));
console.log('User docs:', storage.getUserDocuments(userId));
```

### Trace Context Building
```typescript
// In AdvisoryConversation.tsx around line 586
console.log('Getting context for:', advisorId);
console.log('History length:', conversationHistory.length);
console.log('Context tokens:', documentContext?.totalTokens);
console.log('Chunks:', documentContext?.relevantChunks.length);
```

### Test AI Integration
```typescript
// In secureAIService.ts
console.log('AI Service:', this.config.id);
console.log('Model:', this.config.model);
console.log('API Key configured:', !!this.config.apiKey);
console.log('Message count:', messages.length);
```

