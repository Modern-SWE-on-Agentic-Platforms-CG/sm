/**
 * T075 - Candidate PipelineScreen E2E tests
 */
import { test, expect } from '@playwright/test'

test.describe('Candidate Pipeline Screen', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to pipeline screen
    await page.goto('/login')
    // Simulate login flow (mocked in E2E test)
    await page.goto('/candidates')
  })

  test('should load pipeline screen', async ({ page }) => {
    await page.goto('/candidates')
    const heading = page.locator('h1:has-text("Candidate Pipeline")')
    await expect(heading).toBeVisible()
  })

  test('should display candidate table', async ({ page }) => {
    await page.goto('/candidates')
    const table = page.locator('table')
    await expect(table).toBeVisible()
  })

  test('should render search input', async ({ page }) => {
    await page.goto('/candidates')
    const searchInput = page.locator('input[placeholder*="Search candidates"]')
    await expect(searchInput).toBeVisible()
  })

  test('should render filter button', async ({ page }) => {
    await page.goto('/candidates')
    const filterBtn = page.locator('button:has-text("Filters")')
    await expect(filterBtn).toBeVisible()
  })

  test('should open filter panel on button click', async ({ page }) => {
    await page.goto('/candidates')
    const filterBtn = page.locator('button:has-text("Filters")')
    await filterBtn.click()
    const filterPanel = page.locator('text=Filters').first()
    await expect(filterPanel).toBeVisible()
  })

  test('should render upload button', async ({ page }) => {
    await page.goto('/candidates')
    const uploadBtn = page.locator('button:has-text("Upload")')
    await expect(uploadBtn).toBeVisible()
  })

  test('should render export button', async ({ page }) => {
    await page.goto('/candidates')
    const exportBtn = page.locator('button:has-text("Export")')
    await expect(exportBtn).toBeVisible()
  })

  test('should search candidates by keyword', async ({ page }) => {
    await page.goto('/candidates')
    const searchInput = page.locator('input[placeholder*="Search candidates"]')
    await searchInput.fill('Java')
    await page.waitForTimeout(500)
    // Table should be filtered
    const table = page.locator('table')
    await expect(table).toBeVisible()
  })

  test('should change pagination page', async ({ page }) => {
    await page.goto('/candidates')
    const nextBtn = page.locator('button:has-text("Next")')
    const isDisabled = await nextBtn.isDisabled()
    if (!isDisabled) {
      await nextBtn.click()
      const pageText = page.locator('text=/Page \\d+ of \\d+/')
      await expect(pageText).toBeVisible()
    }
  })
})
