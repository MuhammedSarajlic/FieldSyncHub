import { expect, test } from '@playwright/test';

const live = process.env.E2E_LIVE === 'true';
const email = process.env.E2E_EMAIL ?? 'qa@example.test';
const password = process.env.E2E_PASSWORD ?? 'TestPassword123!';

test.describe('critical product flows', () => {
  test.beforeEach(() => {
    test.skip(!live, 'Set E2E_LIVE=true to run mutating smoke tests.');
  });

  test('sign up', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
    await page.getByLabel('First name').fill('QA');
    await page.getByLabel('Last name').fill('Tester');
    await page.getByLabel('Email address').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: /create account|sign up/i }).click();
    await expect(page).toHaveURL(/workspace|home/);
  });

  test('create customer', async ({ page }) => {
    await page.goto('/customers');
    await expect(page.getByRole('heading', { name: /customers/i })).toBeVisible();
    await page.getByRole('button', { name: /add customer/i }).click();
    await expect(page.getByRole('heading', { name: /new customer|create customer/i })).toBeVisible();
  });

  test('quote to job', async ({ page }) => {
    await page.goto('/quotes');
    await expect(page.getByRole('heading', { name: /quotes/i })).toBeVisible();
    await expect(page.getByText(/approved|convert to job/i).first()).toBeVisible();
  });

  test('job to invoice', async ({ page }) => {
    await page.goto('/jobs');
    await expect(page.getByRole('heading', { name: /jobs/i })).toBeVisible();
    await expect(page.getByText(/invoice/i).first()).toBeVisible();
  });

  test('send invoice', async ({ page }) => {
    await page.goto('/invoices');
    await expect(page.getByRole('heading', { name: /invoices/i })).toBeVisible();
    await expect(page.getByText(/send/i).first()).toBeVisible();
  });
});
