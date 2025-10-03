import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { configurePDFWorkerAuto, checkPDFWorkerCompatibility } from '../utils/pdfWorkerSetup';

// Configure PDF.js worker with automatic fallback strategy
configurePDFWorkerAuto();

export interface ProcessedDocument {
  text: string;
  metadata: {
    title?: string;
    author?: string;
    pages?: number;
    wordCount: number;
    size: number;
    type: 'pdf' | 'docx' | 'xlsx' | 'txt' | 'md' | 'pptx' | 'ppt';
    slides?: number;
  };
  chunks: string[];
}

export class DocumentProcessor {
  /**
   * Process a file and extract text content
   */
  async processFile(file: File): Promise<ProcessedDocument> {
    const type = this.getFileType(file);
    let text = '';
    let metadata: ProcessedDocument['metadata'] = {
      size: file.size,
      type,
      wordCount: 0
    };

    try {
      switch (type) {
        case 'pdf':
          // Re-enable PDF processing with proper worker setup
          try {
            checkPDFWorkerCompatibility();
            const pdfResult = await this.extractPDFText(file);
            text = pdfResult.text;
            metadata.pages = pdfResult.pages;
          } catch (error) {
            console.error('PDF processing error:', error);
            text = `[PDF file: ${file.name}] - PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}. The file may be corrupted or contain only images.`;
            metadata.pages = 1;
          }
          break;
        case 'docx':
          text = await this.extractWordText(file);
          break;
        case 'xlsx':
          text = await this.extractExcelText(file);
          break;
        case 'pptx':
        case 'ppt':
          const pptResult = await this.extractPowerPointText(file);
          text = pptResult.text;
          metadata.slides = pptResult.slides;
          break;
        case 'txt':
        case 'md':
          text = await this.extractPlainText(file);
          break;
        default:
          throw new Error(`Unsupported file type: ${file.type}`);
      }

      // Calculate word count
      metadata.wordCount = text.split(/\s+/).filter(word => word.length > 0).length;

      // Extract title from filename
      metadata.title = file.name.replace(/\.[^/.]+$/, '');

      // Chunk the text
      const chunks = this.chunkText(text);

      return {
        text,
        metadata,
        chunks
      };
    } catch (error) {
      console.error('Error processing file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to process ${file.name}: ${errorMessage}`);
    }
  }

  /**
   * Extract text from PDF files
   */
  private async extractPDFText(file: File): Promise<{ text: string; pages: number }> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    const totalPages = pdf.numPages;

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }

    return {
      text: fullText.trim(),
      pages: totalPages
    };
  }

  /**
   * Extract text from PowerPoint files (PPTX only - browser-compatible)
   */
  private async extractPowerPointText(file: File): Promise<{ text: string; slides?: number }> {
    try {
      const arrayBuffer = await file.arrayBuffer();

      // Only process PPTX files (XML-based), not legacy PPT
      if (file.name.toLowerCase().endsWith('.ppt')) {
        return {
          text: `[Legacy PPT file: ${file.name}] - Legacy PowerPoint files (.ppt) are not supported in browser environments. Please convert to .pptx format for text extraction.`,
          slides: 1
        };
      }

      const zip = await JSZip.loadAsync(arrayBuffer);
      let extractedText = '';
      let slideCount = 0;

      // Extract text from slides
      const slideFiles = Object.keys(zip.files).filter(name =>
        name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
      );

      slideCount = slideFiles.length;

      for (const slideFile of slideFiles) {
        const slideXml = await zip.files[slideFile].async('string');
        const slideText = await this.extractTextFromSlideXml(slideXml);
        if (slideText.trim()) {
          extractedText += `\n\n--- Slide ${slideFiles.indexOf(slideFile) + 1} ---\n${slideText}`;
        }
      }

      // Extract speaker notes
      const notesFiles = Object.keys(zip.files).filter(name =>
        name.startsWith('ppt/notesSlides/notesSlide') && name.endsWith('.xml')
      );

      for (const notesFile of notesFiles) {
        const notesXml = await zip.files[notesFile].async('string');
        const notesText = await this.extractTextFromSlideXml(notesXml);
        if (notesText.trim()) {
          const slideNumber = notesFiles.indexOf(notesFile) + 1;
          extractedText += `\n\n--- Speaker Notes ${slideNumber} ---\n${notesText}`;
        }
      }

      return {
        text: extractedText.trim() || `[PowerPoint file: ${file.name}] - No text content could be extracted from slides.`,
        slides: slideCount
      };
    } catch (error) {
      throw new Error(`Failed to extract text from PowerPoint: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text content from PowerPoint slide XML using browser-native DOMParser
   */
  private async extractTextFromSlideXml(xmlContent: string): Promise<string> {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

      // Check for parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        console.warn('XML parsing error in slide content:', parserError.textContent);
        return '';
      }

      let extractedText = '';

      // Extract text from common PowerPoint XML text elements
      const textElements = [
        'a\\:t',  // Office Open XML text runs
        't',      // Simple text elements
        'text',   // Generic text elements
        'p',      // Paragraph elements
        'r'       // Run elements
      ];

      // Get all text nodes from the document
      const walker = document.createTreeWalker(
        xmlDoc,
        NodeFilter.SHOW_TEXT,
        null
      );

      let node;
      while (node = walker.nextNode()) {
        const text = node.textContent?.trim();
        if (text && text.length > 0) {
          extractedText += text + ' ';
        }
      }

      // Also try to get text content from specific PowerPoint XML elements
      const specificElements = xmlDoc.querySelectorAll('a\\:t, t');
      specificElements.forEach(element => {
        const text = element.textContent?.trim();
        if (text && !extractedText.includes(text)) {
          extractedText += text + ' ';
        }
      });

      return extractedText.trim();
    } catch (error) {
      console.warn('Error parsing slide XML:', error);
      return '';
    }
  }

  /**
   * Extract text from Word documents
   */
  private async extractWordText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    if (result.messages.length > 0) {
      console.warn('Word extraction warnings:', result.messages);
    }

    return result.value;
  }

  /**
   * Extract text from Excel files
   */
  private async extractExcelText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    let text = '';
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const sheetText = XLSX.utils.sheet_to_txt(worksheet);
      text += `Sheet: ${sheetName}\n${sheetText}\n\n`;
    });

    return text.trim();
  }

  /**
   * Extract text from plain text files
   */
  private async extractPlainText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Chunk text into smaller pieces for processing
   */
  private chunkText(text: string, maxChunkSize = 1000, overlap = 100): string[] {
    // Clean the text
    const cleanText = text.replace(/\s+/g, ' ').trim();

    if (cleanText.length <= maxChunkSize) {
      return [cleanText];
    }

    const chunks: string[] = [];
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);

    let currentChunk = '';

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      const potentialChunk = currentChunk + (currentChunk ? '. ' : '') + trimmedSentence;

      if (potentialChunk.length > maxChunkSize && currentChunk) {
        chunks.push(currentChunk + '.');

        // Keep overlap for context
        const words = currentChunk.split(' ');
        const overlapWords = Math.floor(overlap / 10);
        currentChunk = words.slice(-overlapWords).join(' ') + '. ' + trimmedSentence;
      } else {
        currentChunk = potentialChunk;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk + (currentChunk.endsWith('.') ? '' : '.'));
    }

    return chunks.filter(chunk => chunk.trim().length > 0);
  }

  /**
   * Determine file type from File object
   */
  private getFileType(file: File): ProcessedDocument['metadata']['type'] {
    const mimeType = file.type.toLowerCase();
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (mimeType === 'application/pdf' || extension === 'pdf') {
      return 'pdf';
    }
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || extension === 'docx') {
      return 'docx';
    }
    if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || extension === 'xlsx') {
      return 'xlsx';
    }
    if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || extension === 'pptx') {
      return 'pptx';
    }
    if (mimeType === 'application/vnd.ms-powerpoint' || extension === 'ppt') {
      return 'ppt';
    }
    if (mimeType === 'text/plain' || extension === 'txt') {
      return 'txt';
    }
    if (mimeType === 'text/markdown' || extension === 'md') {
      return 'md';
    }

    throw new Error(`Unsupported file type: ${file.type} (.${extension})`);
  }

  /**
   * Validate file before processing
   */
  validateFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ['pdf', 'docx', 'xlsx', 'pptx', 'ppt', 'txt', 'md'];

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size exceeds 50MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`
      };
    }

    try {
      const type = this.getFileType(file);
      if (!allowedTypes.includes(type)) {
        return {
          isValid: false,
          error: `File type not supported: ${type}`
        };
      }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    return { isValid: true };
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file icon emoji based on type
   */
  static getFileIcon(type: ProcessedDocument['metadata']['type']): string {
    const icons = {
      pdf: '📄',
      docx: '📝',
      xlsx: '📊',
      pptx: '📊',
      ppt: '📊',
      txt: '📄',
      md: '📋'
    };
    return icons[type] || '📄';
  }
}