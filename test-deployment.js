const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Testing deployment at https://elite-ai-advisory.vercel.app\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Capture console messages
  const consoleMessages = [];
  const errorMessages = [];

  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    consoleMessages.push({ type, text });

    if (type === 'error') {
      errorMessages.push(text);
      console.log(`❌ [ERROR] ${text}`);
    } else if (text.includes('PGRST') || text.includes('uuid') || text.includes('custom_advisors')) {
      console.log(`⚠️  [${type.toUpperCase()}] ${text}`);
    }
  });

  // Capture page errors
  page.on('pageerror', error => {
    console.log(`❌ PAGE ERROR: ${error.message}`);
  });

  try {
    await page.goto('https://elite-ai-advisory.vercel.app', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for page to load
    await page.waitForTimeout(5000);

    // Check for dashboard
    const hasDashboard = await page.evaluate(() => {
      return document.body.textContent.includes('Dashboard') ||
             document.body.textContent.includes('Advisor Management');
    });

    // Check for specific error patterns
    const hasSupabaseTableError = consoleMessages.some(m =>
      m.text.includes('PGRST200') || m.text.includes('Could not find the table')
    );

    const hasUUIDError = consoleMessages.some(m =>
      m.text.includes('invalid input syntax for type uuid')
    );

    const hasBypassSuccess = consoleMessages.some(m =>
      m.text.includes('Auth bypass enabled') || m.text.includes('available (expected in bypass mode)')
    );

    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`✓ Page loaded: YES`);
    console.log(`✓ Dashboard visible: ${hasDashboard ? 'YES ✓' : 'NO ❌'}`);
    console.log(`✓ Bypass mode active: ${hasBypassSuccess ? 'YES ✓' : 'NO ❌'}`);
    console.log(`✓ Supabase table errors: ${hasSupabaseTableError ? 'STILL PRESENT ❌' : 'RESOLVED ✓'}`);
    console.log(`✓ UUID validation errors: ${hasUUIDError ? 'STILL PRESENT ❌' : 'RESOLVED ✓'}`);
    console.log(`✓ Total console errors: ${errorMessages.length}`);

    if (errorMessages.length > 0) {
      console.log('\n⚠️  Errors found:');
      errorMessages.forEach((err, i) => console.log(`  ${i+1}. ${err}`));
    }

    const allPassed = hasDashboard && !hasSupabaseTableError && !hasUUIDError;
    console.log('\n' + '='.repeat(50));
    console.log(allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();
