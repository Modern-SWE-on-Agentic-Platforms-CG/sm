/**
 * T158 - Reports E2E tests (Playwright)
 */
import { test, expect } from '@playwright/test'

test.describe('Reports — Selection / Rejection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/select-reject')
  })

  test('should display the report heading', async ({ page }) => {
    await expect(page.getByText(/selection.*rejection/i)).toBeVisible()
  })

  test('should show the pie chart', async ({ page }) => {
    await expect(page.locator('svg')).toBeVisible()
  })

  test('should have export button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /export excel/i })).toBeVisible()
  })

  test('should show quick navigation links', async ({ page }) => {
    await expect(page.getByText('Panel Performance')).toBeVisible()
    await expect(page.getByText('Trends')).toBeVisible()
  })
})

test.describe('Reports — Panel Insights', () => {
  test('should display panel performance chart', async ({ page }) => {
    await page.goto('/panel-insights')
    await expect(page.getByText(/panel performance/i)).toBeVisible()
  })
})

test.describe('Reports — Trend Chart', () => {
  test('should display trend chart', async ({ page }) => {
    await page.goto('/trend-chart')
    await expect(page.getByText(/hiring trend/i)).toBeVisible()
  })
})

test.describe('Reports — L2 Aging', () => {
  test('should display L2 aging table', async ({ page }) => {
    await page.goto('/l2-aging')
    await expect(page.getByText(/l2 aging/i)).toBeVisible()
  })
})

test.describe('Reports — Dashboard', () => {
  test('should display dashboard overview', async ({ page }) => {
    await page.goto('/reports-dashboard')
    await expect(page.getByText(/reports dashboard/i)).toBeVisible()
  })

  test('should show key metrics', async ({ page }) => {
    await page.goto('/reports-dashboard')
    await expect(page.getByText(/total candidates/i)).toBeVisible()
    await expect(page.getByText(/rejection rate/i)).toBeVisible()
  })

  test('should have links to all reports', async ({ page }) => {
    await page.goto('/reports-dashboard')
    await expect(page.getByText('Selection Ratio')).toBeVisible()
    await expect(page.getByText('Panel Performance')).toBeVisible()
    await expect(page.getByText('Trends')).toBeVisible()
  })
})
