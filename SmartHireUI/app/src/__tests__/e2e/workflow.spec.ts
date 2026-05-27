/**
 * T115 - Workflow E2E tests
 */
import { test, expect } from '@playwright/test'

test.describe('Workflow Approvals', () => {
  test('should load workflow screen', async ({ page }) => {
    await page.goto('/work-flow')
    await expect(page.locator('h1:has-text("Approval Queue")')).toBeVisible()
  })

  test('should show Take Action button disabled initially', async ({ page }) => {
    await page.goto('/work-flow')
    const btn = page.locator('button:has-text("Take Action")')
    await expect(btn).toBeDisabled()
  })

  test('should enable Take Action when candidate is selected', async ({ page }) => {
    await page.goto('/work-flow')
    // If candidates loaded, select the first one
    const firstCheckbox = page.locator('tbody tr:first-child input[type="checkbox"]')
    if (await firstCheckbox.isVisible()) {
      await firstCheckbox.click()
      await expect(page.locator('button:has-text("Take Action (1)")')).toBeEnabled()
    }
  })

  test('should open action form modal on Take Action click', async ({ page }) => {
    await page.goto('/work-flow')
    const firstCheckbox = page.locator('tbody tr:first-child input[type="checkbox"]')
    if (await firstCheckbox.isVisible()) {
      await firstCheckbox.click()
      await page.locator('button:has-text("Take Action")').click()
      await expect(page.locator('[role="dialog"]')).toBeVisible()
    }
  })

  test('should require comments when rejecting', async ({ page }) => {
    await page.goto('/work-flow')
    const firstCheckbox = page.locator('tbody tr:first-child input[type="checkbox"]')
    if (await firstCheckbox.isVisible()) {
      await firstCheckbox.click()
      await page.locator('button:has-text("Take Action")').click()
      await page.locator('[role="dialog"]').waitFor()
      await page.locator('input[value="REJECTED"]').click()
      await page.locator('button[type="submit"]:has-text("Confirm")').click()
      await expect(page.locator('text=Comments are required when rejecting')).toBeVisible()
    }
  })

  test('should navigate to history screen', async ({ page }) => {
    await page.goto('/work-flow')
    const historyBtn = page.locator('tbody tr:first-child button:has-text("History")')
    if (await historyBtn.isVisible()) {
      await historyBtn.click()
      await expect(page.locator('h1:has-text("Approval History")')).toBeVisible()
    }
  })
})
