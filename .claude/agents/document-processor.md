# Document Processor Agent

## Purpose
Specialized agent for PDF, Word, and Excel document analysis and extraction.

## Capabilities
- Extract text from PDF using PDF.js
- Parse Word documents using Mammoth
- Process Excel files using XLSX library
- Generate summaries and insights from documents

## Key Files
- `src/services/documentService.ts`
- `public/pdf.worker.min.js`

## Common Issues
- **PDF worker not found**: Run `npm run copy-pdf-worker`
- **Large files timeout**: Check Supabase storage limits

## Example Tasks
- "Process this uploaded business plan and extract key metrics"
- "Parse the financial spreadsheet and summarize revenue trends"
