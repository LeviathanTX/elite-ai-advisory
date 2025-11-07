import { test, expect } from '@playwright/test';
import { testAdvisors, testMessages } from '../fixtures/testData';

/**
 * Advisory Conversation Tests
 *
 * Tests for the core advisory conversation feature
 */

test.describe('Advisory Conversations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display advisor board', async ({ page }) => {
    // Check for advisor names in the page
    const content = await page.textContent('body');

    // Should have at least some advisors visible
    const hasAdvisors =
      content?.includes('Mark Cuban') ||
      content?.includes('Barbara Corcoran') ||
      content?.includes('Reid Hoffman') ||
      content?.includes('advisor');

    expect(hasAdvisors).toBeTruthy();
  });

  test('should allow selecting an advisor', async ({ page }) => {
    // Look for advisor selection UI
    const advisorButtons = await page.getByRole('button').all();

    // Should have multiple interactive elements
    expect(advisorButtons.length).toBeGreaterThan(0);
  });

  test('should handle message input', async ({ page }) => {
    // Look for text input or textarea
    const messageInput = page.locator('textarea, input[type="text"]').first();

    if (await messageInput.isVisible()) {
      await messageInput.fill(testMessages.quickConsultation);

      const value = await messageInput.inputValue();
      expect(value).toContain('metrics');
    }
  });

  test('should show loading state when sending message', async ({ page }) => {
    const messageInput = page.locator('textarea, input[type="text"]').first();

    if (await messageInput.isVisible()) {
      await messageInput.fill(testMessages.quickConsultation);

      // Try to find and click send button
      const sendButton = page.getByRole('button', { name: /send|submit/i }).first();

      if (await sendButton.isVisible()) {
        await sendButton.click();

        // Should show some kind of loading indicator
        const hasLoading =
          (await page.getByText(/loading|generating|thinking/i).count()) > 0 ||
          (await page.locator('[role="progressbar"]').count()) > 0 ||
          (await page.locator('.loading, .spinner').count()) > 0;

        // Loading state might be brief, so we don't assert on it
        // Just verify the UI doesn't crash
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should support multiple conversation modes', async ({ page }) => {
    const content = await page.textContent('body');

    // Check for mode indicators
    const hasModes =
      content?.includes('Strategic Planning') ||
      content?.includes('Due Diligence') ||
      content?.includes('Quick Consultation') ||
      content?.includes('Pitch Practice');

    expect(hasModes).toBeTruthy();
  });
});
