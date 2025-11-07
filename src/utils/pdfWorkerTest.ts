import {
  configurePDFWorkerAuto,
  testPDFWorker,
  checkPDFWorkerCompatibility,
} from './pdfWorkerSetup';

/**
 * Comprehensive test suite for PDF.js worker configuration
 */
export class PDFWorkerTester {
  /**
   * Run all PDF worker tests
   */
  static async runAllTests(): Promise<{
    success: boolean;
    results: Array<{ test: string; success: boolean; error?: string }>;
  }> {
    const results: Array<{ test: string; success: boolean; error?: string }> = [];

    // Test 1: Worker Configuration
    try {
      configurePDFWorkerAuto();
      results.push({ test: 'Worker Configuration', success: true });
    } catch (error) {
      results.push({
        test: 'Worker Configuration',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test 2: Compatibility Check
    try {
      checkPDFWorkerCompatibility();
      results.push({ test: 'Compatibility Check', success: true });
    } catch (error) {
      results.push({
        test: 'Compatibility Check',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test 3: Worker Function Test
    try {
      const workerTest = await testPDFWorker();
      results.push({ test: 'Worker Function Test', success: workerTest });
    } catch (error) {
      results.push({
        test: 'Worker Function Test',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test 4: Real PDF Processing
    try {
      const realPdfTest = await this.testRealPDFProcessing();
      results.push({ test: 'Real PDF Processing', success: realPdfTest });
    } catch (error) {
      results.push({
        test: 'Real PDF Processing',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    const allSuccessful = results.every(result => result.success);
    return { success: allSuccessful, results };
  }

  /**
   * Test with a real PDF processing operation
   */
  private static async testRealPDFProcessing(): Promise<boolean> {
    try {
      // Create a simple PDF blob for testing
      const testPDFBlob = this.createTestPDFBlob();
      const arrayBuffer = await testPDFBlob.arrayBuffer();

      const pdfjsLib = await import('pdfjs-dist');
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      // Try to get the first page
      const page = await pdf.getPage(1);
      const textContent = await page.getTextContent();

      console.log('✅ Successfully processed test PDF');
      console.log(`📄 PDF has ${pdf.numPages} pages`);
      console.log(`📝 First page has ${textContent.items.length} text items`);

      return true;
    } catch (error) {
      console.error('❌ Real PDF processing test failed:', error);
      return false;
    }
  }

  /**
   * Create a minimal test PDF blob
   */
  private static createTestPDFBlob(): Blob {
    // Minimal PDF structure that PDF.js can parse
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Test PDF) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000206 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
300
%%EOF`;

    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  /**
   * Test different worker sources
   */
  static async testWorkerSources(): Promise<void> {
    const pdfjsLib = await import('pdfjs-dist');

    console.log('🔧 Testing different worker sources...');

    const workerSources = [
      // Local file
      `${window.location.origin}/pdf.worker.min.js`,

      // CDN with version
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`,

      // Alternative CDN
      `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`,
    ];

    for (const workerSrc of workerSources) {
      try {
        console.log(`🔄 Testing worker source: ${workerSrc}`);

        // Test if URL is accessible
        const response = await fetch(workerSrc, { method: 'HEAD' });
        console.log(`📊 Worker source status: ${response.status} (${workerSrc})`);
      } catch (error) {
        console.log(`❌ Worker source failed: ${workerSrc}`, error);
      }
    }
  }

  /**
   * Generate test report
   */
  static generateTestReport(
    results: Array<{ test: string; success: boolean; error?: string }>
  ): string {
    let report = '📋 PDF.js Worker Test Report\n';
    report += '=' + '='.repeat(30) + '\n\n';

    results.forEach((result, index) => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      report += `${index + 1}. ${result.test}: ${status}\n`;
      if (result.error) {
        report += `   Error: ${result.error}\n`;
      }
      report += '\n';
    });

    const passCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    report += `Summary: ${passCount}/${totalCount} tests passed\n`;
    report += `Overall Status: ${passCount === totalCount ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}\n`;

    return report;
  }
}

/**
 * Quick test function for development
 */
export async function quickPDFTest(): Promise<void> {
  console.log('🚀 Running quick PDF.js worker test...');

  const testResults = await PDFWorkerTester.runAllTests();
  const report = PDFWorkerTester.generateTestReport(testResults.results);

  console.log(report);

  if (testResults.success) {
    console.log('🎉 All PDF.js tests passed! Your setup is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check the report above for details.');
  }
}
