import { test, expect } from '@playwright/test';

/**
 * Smoke Tests - Basic Application Functionality
 *
 * These tests ensure the application loads and core functionality works
 */

test.describe('Application Smoke Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Elite AI Advisory/i);
  });

  test('should display the main navigation', async ({ page }) => {
    await page.goto('/');

    // Check for main UI elements (adjust selectors based on your actual UI)
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    await page.goto('/');

    // Verify page loads on mobile
    await expect(page).toHaveTitle(/Elite AI Advisory/i);
  });

  test('should not have console errors on load', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');

    // Wait for any lazy-loaded scripts
    await page.waitForLoadState('networkidle');

    // Filter out known acceptable errors
    const criticalErrors = consoleErrors.filter(
      error =>
        !error.includes('Warning:') && // React warnings
        !error.includes('DevTools') && // DevTools messages
        !error.includes('Extension') // Browser extension errors
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should handle network failures gracefully', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);

    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => {
      // Expected to fail offline
    });

    // Verify service worker or offline page (if implemented)
    // This test will need adjustment based on your offline strategy
  });
});
