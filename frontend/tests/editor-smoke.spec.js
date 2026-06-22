import { expect, test } from '@playwright/test';

test('editor smoke probe supports critical panel flows', async ({ page }) => {
  await page.goto('/editor-smoke-probe');

  await expect(page.getByText('INTERACTIVE_EDITOR_SHELL_HYDRATED')).toBeVisible();
  await expect(page.locator('input').first()).toHaveValue('Smoke Probe Diagram');

  await page.getByRole('button', { name: 'Assistant' }).click();
  await expect(page.getByRole('heading', { name: 'AI Architecture Assistant' })).toBeVisible();
  await page.getByLabel('Close AI architecture assistant').click();
  await expect(page.getByRole('heading', { name: 'AI Architecture Assistant' })).toBeHidden();

  await page.getByRole('button', { name: /Review/ }).click();
  await expect(page.getByRole('heading', { name: 'Architecture Review' })).toBeVisible();
  await expect(page.getByText(/Click to highlight/i)).toBeVisible();
  await expect(page.getByText('Why It Matters')).toBeVisible();
  await expect(page.getByText('How To Fix')).toBeVisible();
  await page.getByRole('button', { name: /Why this architecture works/i }).click();
  await expect(page.getByText('System Walkthrough')).toBeVisible();
  await expect(page.getByText('Architecture Readout')).toBeVisible();
  await page.getByRole('button', { name: /Show score breakdown/i }).click();
  await expect(page.getByText('Final Score')).toBeVisible();
  await page.getByRole('button', { name: 'Accept and connect' }).first().click();
  await expect(page.getByText('Redis Cache')).toBeHidden();
  await page.getByLabel('Close architecture review').click();

  const canvas = page.getByText('INTERACTIVE_EDITOR_SHELL_HYDRATED').locator('..');
  const canvasWidthBeforeLibrary = (await canvas.boundingBox())?.width;
  await page.getByRole('button', { name: 'Library' }).click();
  await expect(page.getByRole('heading', { name: /technology library/i })).toBeVisible();
  await expect.poll(async () => (await canvas.boundingBox())?.width).toBe(canvasWidthBeforeLibrary);
  await expect(page.getByText(/technology vs responsibility/i)).toBeVisible();
  await expect(page.getByText('Community Modules')).toBeHidden();
  await expect(page.getByText('FastAPI', { exact: true })).toBeVisible();
  await page.getByLabel('Responsibility').fill('Data Layer');
  await expect(page.getByText('PostgreSQL', { exact: true })).toBeHidden();
  await page.getByRole('button', { name: /DATABASE UNIT/ }).click();
  await expect(page.getByText('PostgreSQL', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Use Node.js for Data Layer' }).click();
  await expect(page.getByText('CREATED_UNIT: Data Layer · Node.js')).toBeVisible();
  await page.getByLabel('Close tech library').click();
  await expect(page.getByRole('heading', { name: /technology library/i })).toBeHidden();

  await page.getByRole('button', { name: 'Actions' }).click();
  await expect(page.getByText('Open history')).toBeVisible();
  await page.getByText('Open history').click();
  await expect(page.getByText('Open history')).toBeHidden();
  await expect(page.getByRole('heading', { name: /system history/i })).toBeVisible();
  await page.getByLabel('Close history').click();
  await expect(page.getByRole('heading', { name: /system history/i })).toBeHidden();

  await page.getByLabel('Architecture template').selectOption('example:stripe');
  await expect(page.locator('input').last()).toHaveValue(/Design Stripe/i);
});
