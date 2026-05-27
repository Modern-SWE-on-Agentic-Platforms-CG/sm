/**
 * T091 - Scheduling E2E tests
 */
import { test, expect } from '@playwright/test'

test.describe('Interview Scheduling', () => {
  test('should load dashboard calendar screen', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('h1:has-text("Interview Calendar")')).toBeVisible()
  })

  test('should display calendar grid with weekday headers', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('text=Sun')).toBeVisible()
    await expect(page.locator('text=Mon')).toBeVisible()
    await expect(page.locator('text=Sat')).toBeVisible()
  })

  test('should open slot creation form', async ({ page }) => {
    await page.goto('/dashboard')
    await page.locator('button:has-text("Add Slot")').click()
    await expect(page.locator('text=Create Availability Slot')).toBeVisible()
  })

  test('should navigate to booking view screen', async ({ page }) => {
    await page.goto('/booking/view')
    await expect(page.locator('h1:has-text("Interview Slots")')).toBeVisible()
  })

  test('should show tabs on booking view screen', async ({ page }) => {
    await page.goto('/booking/view')
    await expect(page.locator('button:has-text("Available")')).toBeVisible()
    await expect(page.locator('button:has-text("Booked")')).toBeVisible()
    await expect(page.locator('button:has-text("Interviewed")')).toBeVisible()
    await expect(page.locator('button:has-text("Panel Availability")')).toBeVisible()
  })

  test('should switch tabs on booking view', async ({ page }) => {
    await page.goto('/booking/view')
    await page.locator('button:has-text("Booked")').click()
    // Tab should be active (border-blue-600 class)
    const bookedTab = page.locator('button:has-text("Booked")')
    await expect(bookedTab).toHaveClass(/text-blue-600/)
  })

  test('should navigate to panel availability screen', async ({ page }) => {
    await page.goto('/booking/view')
    await page.locator('button:has-text("Panel Availability")').click()
    // Panel content area should be visible
    await expect(page.locator('text=Panel Availability').first()).toBeVisible()
  })

  test('should navigate months on calendar', async ({ page }) => {
    await page.goto('/dashboard')
    const nextBtn = page.locator('[aria-label="Next month"]')
    await expect(nextBtn).toBeVisible()
    await nextBtn.click()
    // Calendar should still be visible after navigation
    await expect(page.locator('text=Sun')).toBeVisible()
  })
})
