import { expect, test } from '@playwright/test';

test('editor smoke probe supports critical panel flows', async ({ page }) => {
  await page.goto('/editor-smoke-probe');

  await expect(page.getByText('INTERACTIVE_EDITOR_SHELL_READY')).toBeVisible();
  await expect(page.locator('input').first()).toHaveValue('Smoke Probe Diagram');

  await page.getByRole('button', { name: 'Assistant' }).click();
  await expect(page.getByRole('heading', { name: 'AI Architecture Assistant' })).toBeVisible();
  await page.getByLabel('Close AI architecture assistant').click();
  await expect(page.getByRole('heading', { name: 'AI Architecture Assistant' })).toBeHidden();

  await page.getByRole('button', { name: /Review/ }).click();
  await expect(page.getByRole('heading', { name: 'Architecture Review' })).toBeVisible();
  await page.getByRole('button', { name: 'Accept and connect' }).first().click();
  await expect(page.getByText('Redis Cache')).toBeHidden();
  await page.getByLabel('Close architecture review').click();

  await page.getByRole('button', { name: 'Library' }).click();
  await expect(page.getByRole('heading', { name: /modules/i })).toBeVisible();
  await page.getByLabel('Close tech library').click();
  await expect(page.getByRole('heading', { name: /modules/i })).toBeHidden();

  await page.getByRole('button', { name: 'Actions' }).click();
  await expect(page.getByText('Open history')).toBeVisible();
  await page.getByText('Open history').click();
  await expect(page.getByText('Open history')).toBeHidden();
  await expect(page.getByRole('heading', { name: /system history/i })).toBeVisible();
  await page.getByLabel('Close history').click();
  await expect(page.getByRole('heading', { name: /system history/i })).toBeHidden();
});
