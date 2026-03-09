import { test, expect } from '@playwright/test';

test('home page renders covenant copy', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Covenant' })).toBeVisible();
});
