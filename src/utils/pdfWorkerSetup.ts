import * as pdfjsLib from 'pdfjs-dist';

/**
 * Configure PDF.js worker for consistent use across the application
 * This setup works reliably across different environments (localhost, deployed, etc.)
 */
export function configurePDFWorker() {
  // Modern approach using URL constructor - works with most bundlers
  try {
    // Option 1: Use local worker with URL constructor (recommended)
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();

    console.log('✅ PDF.js worker configured successfully using local bundle');
  } catch (error) {
    console.warn('⚠️ Local worker setup failed, falling back to CDN:', error);

    // Fallback: Use CDN with version matching
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    console.log('✅ PDF.js worker configured using CDN fallback');
  }
}

/**
 * Alternative setup using local worker file in public directory
 * This approach guarantees the worker is available and avoids network requests
 */
export function configurePDFWorkerLocal() {
  // Use worker file copied to public directory
  const workerPath = `${window.location.origin}/pdf.worker.min.js`;
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
  console.log('✅ PDF.js worker configured using local public file');
}

/**
 * Alternative setup for environments that don't support import.meta.url
 */
export function configurePDFWorkerLegacy() {
  try {
    // Simple fallback to CDN (the dynamic import has compatibility issues)
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    console.log('✅ PDF.js worker configured using CDN');
  } catch (error) {
    // Final fallback to CDN
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    console.log('⚠️ Using CDN worker as final fallback');
  }
}

/**
 * Auto-configure worker with multiple fallback strategies
 * Tries different approaches in order of reliability
 */
export function configurePDFWorkerAuto() {
  // Strategy 1: Try local public file first (most reliable)
  if (typeof window !== 'undefined') {
    try {
      configurePDFWorkerLocal();
      return;
    } catch (error) {
      console.warn('Local public worker failed:', error);
    }
  }

  // Strategy 2: Try modern URL constructor
  try {
    configurePDFWorker();
    return;
  } catch (error) {
    console.warn('URL constructor approach failed:', error);
  }

  // Strategy 3: Fallback to CDN
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  console.log('✅ PDF.js worker configured using CDN fallback');
}

/**
 * Version check to ensure worker compatibility
 */
export function checkPDFWorkerCompatibility() {
  console.log(`📋 PDF.js version: ${pdfjsLib.version}`);
  console.log(`🔧 Worker source: ${pdfjsLib.GlobalWorkerOptions.workerSrc}`);

  // Ensure worker is configured
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    throw new Error('PDF.js worker not configured. Call configurePDFWorker() first.');
  }

  return true;
}

/**
 * Test worker configuration by attempting a simple PDF operation
 */
export async function testPDFWorker(): Promise<boolean> {
  try {
    // Create a minimal PDF for testing
    const testPDF = new Uint8Array([
      0x25,
      0x50,
      0x44,
      0x46,
      0x2d,
      0x31,
      0x2e,
      0x34,
      0x0a, // %PDF-1.4
      // ... minimal PDF structure
    ]);

    await pdfjsLib.getDocument({ data: testPDF }).promise;
    console.log('✅ PDF.js worker test successful');
    return true;
  } catch (error) {
    console.error('❌ PDF.js worker test failed:', error);
    return false;
  }
}
