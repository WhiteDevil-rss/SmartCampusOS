import { test, expect } from '@playwright/test';

test('1. Unauthenticated users are redirected from protected routes', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
});

test('2. Superadmin Auth Flow and Overview', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@nepscheduler.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/superadmin');
    await expect(page.getByText('Super Admin Dashboard')).toBeVisible();
});

test('3. Department Admin Flow and Timetable Generator', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin.cs@vnsgu.ac.in');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/department');
    await expect(page.getByText('Department Admin Dashboard')).toBeVisible();

    await page.goto('/department/timetables');
    await expect(page.getByText('Generate')).toBeVisible();
});

test('4. Faculty Personal Analytics Flow', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'dshah@vnsgu.ac.in');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/faculty-panel');
    await expect(page.getByText('Personal Analytics')).toBeVisible();

    await page.goto('/faculty-panel/schedule');
    await expect(page.getByText('My Personal Schedule')).toBeVisible();
});
