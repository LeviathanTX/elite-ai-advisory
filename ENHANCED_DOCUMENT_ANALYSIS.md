# Enhanced Document Analysis System

## Overview

The AI-BoD platform now features **VC-level multi-document analysis capabilities** that enable cross-referencing, financial analysis, and deep insights across multiple documents—just like a top-tier VC partner or financial analyst would perform.

## New Capabilities

### 1. **Vector-Based Semantic Search**
- Find relevant information across all documents using natural language queries
- Powered by OpenAI embeddings (text-embedding-ada-002)
- pgvector integration for fast similarity search
- Supports cross-document discovery and citation

### 2. **Financial Metrics Extraction & Analysis**
- Automatically extracts key financial metrics from documents
- Supports: Revenue, ARR, MRR, CAC, LTV, burn rate, runway, growth rates, valuations
- AI-powered extraction with regex fallback
- Compare metrics across multiple documents and time periods
- Trend analysis and growth trajectory forecasting

### 3. **Cross-Document Comparison**
- Compare multiple pitch decks, business plans, or financial reports
- Identify strengths, weaknesses, opportunities, and threats
- Side-by-side competitive analysis
- Detect contradictions and inconsistencies across documents

### 4. **Document Relationship Tracking**
- Automatically discover relationships between documents
- Relationship types: references, supplements, contradicts, updates, supports
- Build document networks to visualize connections
- Track document versions and updates

### 5. **VC Framework Analysis**
- Apply proven VC frameworks to evaluate startups:
  - **Sequoia Capital Framework**: Market, Product, Team, Business Model
  - **Andreessen Horowitz (a16z)**: Founder-Market Fit, Product Vision, Disruption Potential
  - **Y Combinator**: Founders, Idea, Product, Growth Potential
  - **First Round Capital**: Team DNA, Market Opportunity, Early Evidence
  - **Comprehensive Due Diligence Scorecard**

### 6. **Advanced Query Engine**
- Natural language queries across document collections
- Cached results for common queries
- Support for complex multi-document questions
- Citation tracking for all insights

## Architecture

### Core Services

```
EnhancedDocumentAnalyzer (Main Entry Point)
├── VectorEmbeddingsService
│   └── OpenAI API (text-embedding-ada-002)
│   └── Supabase pgvector
├── FinancialMetricsExtractor
│   └── AI-powered extraction
│   └── Regex-based fallback
├── CrossDocumentAnalysisEngine
│   └── Multi-document comparison
│   └── Trend analysis
│   └── Due diligence
├── DocumentRelationshipTracker
│   └── Automatic relationship discovery
│   └── Network visualization
└── VCAnalysisFramework
    └── Proven VC frameworks
    └── Systematic evaluation
```

### Database Schema

New tables added:
- `document_chunks` - Text chunks with vector embeddings
- `document_relationships` - Connections between documents
- `financial_metrics` - Extracted financial data
- `document_citations` - Cross-references
- `document_collections` - Grouped documents (e.g., all docs for a company)
- `analysis_queries` - Cached multi-document analyses

## Usage Examples

### Initialize the Enhanced Analyzer

```typescript
import { initializeEnhancedAnalyzer } from './services/EnhancedDocumentAnalyzer';

const analyzer = await initializeEnhancedAnalyzer();
```

### 1. Process a New Document

```typescript
// After uploading and extracting text
const result = await analyzer.processAndAnalyzeDocument(
  documentId,
  fullText,
  chunks
);

console.log('Extracted metrics:', result.extractedMetrics);
console.log('Suggested relationships:', result.suggestedRelationships);
```

### 2. Semantic Search

```typescript
const results = await analyzer.semanticSearch(
  "What is the customer acquisition cost?",
  {
    documentIds: ['doc-1', 'doc-2'], // Optional filter
    limit: 10,
    threshold: 0.7
  }
);
```

### 3. Compare Financial Metrics

```typescript
const comparison = await analyzer.compareFinancialMetrics(
  ['doc-1', 'doc-2', 'doc-3'],
  ['revenue', 'arr', 'burn-rate']
);

// Returns trend analysis, growth rates, and insights
```

### 4. Multi-Document Analysis

```typescript
const analysis = await analyzer.analyzeMultipleDocuments({
  documentIds: ['pitch-deck-1', 'financials-1', 'market-research-1'],
  analysisType: 'due-diligence',
  framework: 'sequoia' // Optional: apply specific VC framework
});

console.log(analysis.summary);
console.log(analysis.insights);
console.log(analysis.recommendations);
```

### 5. Compare Across Documents

```typescript
const comparison = await analyzer.compareDocuments(
  ['startup-a-deck', 'startup-b-deck', 'startup-c-deck'],
  ['Market Opportunity', 'Team Strength', 'Traction', 'Unit Economics']
);

console.log(comparison.rankings); // Ranked by overall score
```

### 6. Trend Analysis

```typescript
const trends = await analyzer.analyzeTrends(
  ['q1-2023-report', 'q2-2023-report', 'q3-2023-report', 'q4-2023-report'],
  ['Revenue Growth', 'Customer Acquisition', 'Burn Rate']
);

console.log(trends.forecast);
console.log(trends.recommendations);
```

### 7. Due Diligence

```typescript
// Create a collection first
const collection = await analyzer.createDocumentCollection(
  'Acme Corp Due Diligence',
  ['pitch-deck', 'financials', 'cap-table', 'team-bios'],
  'due-diligence'
);

// Conduct comprehensive analysis
const ddReport = await analyzer.conductDueDiligence(collection.id);

console.log(ddReport.executiveSummary);
console.log(ddReport.investmentRecommendation);
console.log(ddReport.keyQuestions);
console.log(ddReport.redFlags);
```

### 8. Find Contradictions

```typescript
const contradictions = await analyzer.findContradictions(
  ['pitch-deck', 'financial-statements', 'investor-update']
);

console.log(`Consistency Score: ${contradictions.consistencyScore}%`);
contradictions.contradictions.forEach(c => {
  console.log(`⚠️ ${c.aspect}: ${c.explanation}`);
});
```

### 9. Use VC Frameworks

```typescript
const frameworks = analyzer.getAvailableFrameworks();

// Analyze using Sequoia framework
const sequoiaAnalysis = await analyzer.analyzeWithFramework(
  'sequoia',
  ['pitch-deck', 'financials']
);

console.log(`Overall Score: ${sequoiaAnalysis.analysis.overallScore}/100`);
console.log('Category Scores:', sequoiaAnalysis.analysis.categoryScores);
console.log('Recommendation:', sequoiaAnalysis.analysis.recommendation);
```

### 10. Document Network

```typescript
const network = await analyzer.getDocumentNetwork('root-document-id', 2);

console.log('Root:', network.rootDocument.filename);
console.log('Connected documents:');
network.relationships.forEach(rel => {
  console.log(`- ${rel.document.filename} (${rel.relationshipType})`);
});
console.log('Network insights:', network.insights);
```

### 11. Executive Summary

```typescript
const summary = await analyzer.generateExecutiveSummary([
  'pitch-deck',
  'financial-projections',
  'market-analysis',
  'competitive-landscape'
]);

console.log(summary.summary);
console.log('Key Findings:', summary.keyFindings);
console.log('Recommendations:', summary.recommendations);
```

## VC Frameworks Reference

### Sequoia Capital Framework
- **Market** (25%): Size, growth, dynamics, timing
- **Product** (25%): Problem-solution fit, differentiation, defensibility
- **Team** (30%): Domain expertise, completeness, track record
- **Business Model** (20%): Unit economics, go-to-market, profitability path

### Andreessen Horowitz (a16z) Framework
- **Founder-Market Fit** (35%): Unique positioning, unfair advantages
- **Product Vision & Execution** (25%): Product-market fit, velocity
- **Market Disruption Potential** (25%): Zero-to-one opportunity
- **Metrics & Traction** (15%): Growth metrics, unit economics

### Y Combinator Framework
- **Founders** (40%): Determination, resourcefulness, execution
- **Idea** (25%): Problem clarity, market size, timing
- **Product** (20%): User love, retention, iteration speed
- **Growth Potential** (15%): Growth rate, scalability

### First Round Capital Framework
- **Founding Team DNA** (35%): Unique insights, technical depth
- **Market Opportunity** (25%): Underserved market, timing
- **Early Product Evidence** (25%): Passionate users, retention
- **Capital Efficiency** (15%): Burn rate, milestone achievability

## Financial Metrics Supported

### Revenue Metrics
- ARR (Annual Recurring Revenue)
- MRR (Monthly Recurring Revenue)
- Total Revenue
- Revenue Growth Rate (MoM, YoY)

### Profitability Metrics
- Gross Margin
- Net Margin
- EBITDA
- Rule of 40 (Growth + Profit Margin)

### Customer Metrics
- CAC (Customer Acquisition Cost)
- LTV (Lifetime Value)
- LTV/CAC Ratio
- Customer Count
- Churn Rate
- NRR (Net Revenue Retention)

### Cash Metrics
- Burn Rate
- Runway (months)
- Cash Balance

### Market Metrics
- TAM (Total Addressable Market)
- SAM (Serviceable Addressable Market)
- SOM (Serviceable Obtainable Market)
- Market Share

### Growth Metrics
- User Growth Rate
- Revenue Growth Rate
- CAGR (Compound Annual Growth Rate)

## Best Practices

### 1. Document Organization
```typescript
// Create collections for better organization
await analyzer.createDocumentCollection(
  'Q4 2023 Portfolio Review',
  documentIds,
  'portfolio'
);
```

### 2. Relationship Discovery
```typescript
// Run periodically to discover new relationships
const relationships = await analyzer.discoverRelationships(allDocumentIds);
```

### 3. Caching
```typescript
// Check cache before running expensive analysis
const cached = await analyzer.getCachedAnalysis(query, documentIds);
if (cached) {
  return cached.results;
}
```

### 4. Progressive Analysis
```typescript
// Start with quick analysis, then go deeper
const quickAnalysis = await analyzer.compareFinancialMetrics(documentIds);
if (quickAnalysis.metricComparisons.some(m => m.trend === 'declining')) {
  const deepAnalysis = await analyzer.conductDueDiligence(collectionId);
}
```

## Database Setup

Run the migration to add enhanced schema:

```sql
-- Run in Supabase SQL Editor
\i supabase/migrations/20241116000000_enhanced_document_system.sql
```

This adds:
- pgvector extension for semantic search
- Enhanced documents table with metadata
- Document chunks with embeddings
- Relationship tracking
- Financial metrics storage
- Citation management
- Document collections

## Environment Variables

Add to your `.env` file:

```bash
# Required for vector embeddings
VITE_OPENAI_API_KEY=sk-...

# Supabase (should already exist)
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

## Performance Considerations

### Vector Search
- Embeddings are generated once per document chunk
- Search operations use pgvector's HNSW index
- Typical query time: <100ms for 10k chunks

### Caching
- Analysis results cached for 7 days
- Reduces redundant AI calls
- Automatic cache invalidation

### Batch Processing
- Documents processed in parallel where possible
- Embedding generation batched (100 chunks at a time)
- Financial extraction can handle large documents (up to 50MB)

## Roadmap

### Short Term
- [ ] Real-time collaboration on document analysis
- [ ] Export analysis reports to PDF
- [ ] Custom framework builder
- [ ] OCR support for image-based PDFs

### Medium Term
- [ ] Multi-language support
- [ ] Document versioning and diff
- [ ] Automated periodic analysis
- [ ] Integration with data rooms

### Long Term
- [ ] Graph visualization of document networks
- [ ] Predictive analytics based on historical patterns
- [ ] Integration with external data sources (Crunchbase, PitchBook)
- [ ] Natural language query interface

## Support

For questions or issues with the enhanced document analysis system:
1. Check the documentation in this file
2. Review code examples in `/src/services/`
3. Consult the existing `DOCUMENT_SYSTEM_ARCHITECTURE.md`

## Migration Guide

### From Basic Document Storage

```typescript
// Old approach
const doc = await documentStorage.storeDocument(file, processedDoc, advisorId, userId);

// New enhanced approach
const doc = await documentStorage.storeDocument(file, processedDoc, advisorId, userId);
const analyzer = await initializeEnhancedAnalyzer();
await analyzer.processAndAnalyzeDocument(doc.id, processedDoc.text, processedDoc.chunks);
```

### Integration with Existing Advisory

```typescript
// In advisory conversation
const analyzer = await initializeEnhancedAnalyzer();

// Get relevant content using semantic search
const relevantContent = await analyzer.semanticSearch(userMessage, {
  documentIds: advisorDocuments.map(d => d.id),
  limit: 5
});

// Use in context
const context = relevantContent.map(r => r.content).join('\n\n');
```

## Examples: Real-World Use Cases

### Use Case 1: Portfolio Company Analysis
```typescript
// Analyze quarterly performance across portfolio
const portfolioCompanies = ['company-a', 'company-b', 'company-c'];
const q4Reports = await getQuarterlyReports('Q4-2023', portfolioCompanies);

const trends = await analyzer.analyzeTrends(
  q4Reports.map(r => r.id),
  ['Revenue Growth', 'Burn Rate', 'Customer Growth']
);

const topPerformers = trends.trends
  .filter(t => t.direction === 'improving')
  .map(t => t.area);
```

### Use Case 2: Due Diligence for New Investment
```typescript
// Create due diligence collection
const ddDocs = [
  pitchDeckId,
  financialProjectionsId,
  capTableId,
  marketResearchId,
  competitiveAnalysisId
];

const collection = await analyzer.createDocumentCollection(
  'Acme Corp Series A DD',
  ddDocs,
  'due-diligence'
);

// Run comprehensive analysis using Sequoia framework
const analysis = await analyzer.analyzeWithFramework('sequoia', ddDocs);

// Check for red flags
const contradictions = await analyzer.findContradictions(ddDocs);

// Generate investment memo
const summary = await analyzer.generateExecutiveSummary(ddDocs);
```

### Use Case 3: Competitive Benchmarking
```typescript
// Compare similar-stage companies
const seriesACompanies = await getCompaniesAtStage('Series A');
const pitchDecks = seriesACompanies.map(c => c.latestPitchDeck);

const comparison = await analyzer.compareDocuments(
  pitchDecks,
  [
    'Market Size',
    'Revenue Traction',
    'Team Experience',
    'Product Differentiation',
    'Unit Economics'
  ]
);

// See ranking
console.log('Top performers:', comparison.rankings.slice(0, 3));
```

## API Reference

See individual service files for detailed API documentation:
- `VectorEmbeddingsService.ts` - Semantic search
- `FinancialMetricsExtractor.ts` - Financial analysis
- `CrossDocumentAnalysisEngine.ts` - Multi-document comparison
- `DocumentRelationshipTracker.ts` - Relationship management
- `VCAnalysisFramework.ts` - VC frameworks
- `EnhancedDocumentAnalyzer.ts` - Unified API (main entry point)

## License

Part of the AI-BoD platform. All rights reserved.
