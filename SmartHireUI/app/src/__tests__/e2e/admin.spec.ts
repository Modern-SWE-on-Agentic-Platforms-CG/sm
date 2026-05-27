/**
 * T129 - Admin E2E tests (Playwright)
 */
import { test, expect } from '@playwright/test'

test.describe('Admin - Master Data', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/master-data')
  })

  test('should display the sidebar and heading', async ({ page }) => {
    await expect(page.getByText('Master Data')).toBeVisible()
    await expect(page.getByText('Tower')).toBeVisible()
  })

  test('should load records when category selected', async ({ page }) => {
    await page.getByText('Tower').click()
    await expect(page.getByRole('table')).toBeVisible()
  })

  test('should open add record form', async ({ page }) => {
    await page.getByText('Tower').click()
    await page.getByText('+ Add').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('Add Record')).toBeVisible()
  })

  test('should close form on cancel', async ({ page }) => {
    await page.getByText('Tower').click()
    await page.getByText('+ Add').click()
    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })
})

test.describe('Admin - Demand & Supply', () => {
  test('should display demand supply screen', async ({ page }) => {
    await page.goto('/demand-supply')
    await expect(page.getByText('Demand & Supply')).toBeVisible()
  })
})

test.describe('Admin - Change Roles', () => {
  test('should display the change roles screen', async ({ page }) => {
    await page.goto('/changeroles')
    await expect(page.getByText('Change Roles')).toBeVisible()
    await expect(page.getByPlaceholder(/search by email/i)).toBeVisible()
  })
})
