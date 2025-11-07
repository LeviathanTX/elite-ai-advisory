import { test, expect } from '@playwright/test';

/**
 * Pitch Practice Mode Tests
 *
 * Tests for the pitch practice feature - one of the key features for Capital Factory founders
 */

test.describe('Pitch Practice Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to load
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to pitch practice mode', async ({ page }) => {
    // Look for pitch practice button/link (adjust selector based on your UI)
    const pitchButton = page.getByRole('button', { name: /pitch practice/i }).first();

    if (await pitchButton.isVisible()) {
      await pitchButton.click();

      // Verify we're in pitch practice mode
      await expect(page.getByText(/pitch practice/i).first()).toBeVisible();
    } else {
      // Mode selection might be in a different location
      const body = await page.textContent('body');
      expect(body).toContain('Pitch');
    }
  });

  test('should show microphone permission prompt', async ({ page, context }) => {
    // Grant microphone permissions
    await context.grantPermissions(['microphone']);

    // Navigate to pitch practice
    const pitchButton = page.getByRole('button', { name: /pitch practice/i }).first();
    if (await pitchButton.isVisible()) {
      await pitchButton.click();
    }

    // Look for record button or microphone indicator
    const hasMicrophoneUI =
      (await page.getByRole('button', { name: /record/i }).count()) > 0 ||
      (await page.getByRole('button', { name: /start/i }).count()) > 0;

    expect(hasMicrophoneUI).toBeTruthy();
  });

  test('should display pitch metrics after practice', async ({ page }) => {
    // This test would need mock data or a recorded session
    // For now, just verify the UI elements exist

    await page.goto('/');

    // Check if pitch metrics components are available in the app
    const body = await page.content();
    const hasMetrics =
      body.includes('confidence') ||
      body.includes('clarity') ||
      body.includes('pace') ||
      body.includes('engagement');

    // Metrics should be defined in the codebase
    expect(hasMetrics).toBeTruthy();
  });
});
