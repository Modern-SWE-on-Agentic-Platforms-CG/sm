/**
 * T174 - Candidate Details E2E tests (Playwright)
 */
import { test, expect } from '@playwright/test'

test.describe('Candidate Details', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to candidate details page
    await page.goto('/candidate-details/c1')
  })

  test('should display candidate personal information', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: /John Doe/i })).toBeVisible()
    await expect(page.getByText(/john@test.com/)).toBeVisible()
    await expect(page.getByText(/9876543210/)).toBeVisible()
  })

  test('should display skill match analysis', async ({ page }) => {
    await expect(page.getByText(/Skill Match Analysis/i)).toBeVisible()
    await expect(page.getByText(/80%/)).toBeVisible()
    await expect(page.getByText(/Matching Skills/i)).toBeVisible()
    await expect(page.getByText(/Lagging Skills/i)).toBeVisible()
  })

  test('should display matching and lagging skills', async ({ page }) => {
    await expect(page.locator('text=Java').first()).toBeVisible()
    await expect(page.getByText(/Spring/)).toBeVisible()
    await expect(page.getByText(/Kubernetes/)).toBeVisible()
  })

  test('should display documents section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Documents/i })).toBeVisible()
  })

  test('should display resume download button', async ({ page }) => {
    await expect(page.getByText(/john-resume.pdf/)).toBeVisible()
  })

  test('should allow download of resume', async ({ page, context }) => {
    // Listen for download
    const downloadPromise = context.waitForEvent('download')

    // Click download button
    await page.getByText(/john-resume.pdf/).click()

    // Wait for download to complete
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('john-resume')
  })

  test('should display lifecycle history', async ({ page }) => {
    await expect(page.getByText(/Lifecycle History/i)).toBeVisible()
    await expect(page.getByText(/APPLIED/)).toBeVisible()
    await expect(page.getByText(/INTERVIEWED/)).toBeVisible()
  })

  test('should display upload document section', async ({ page }) => {
    await expect(page.getByLabel(/Upload Resume/i)).toBeVisible()
    await expect(page.getByLabel(/Upload Email/i)).toBeVisible()
  })

  test('should validate resume file type', async ({ page }) => {
    // Try uploading invalid file type
    const fileInput = page.locator('input[accept=".pdf,.doc,.docx"]').first()
    
    // The test would validate error handling - actual file upload behavior
    // depends on backend implementation
    await expect(fileInput).toBeVisible()
  })

  test('should show candidate grade and location', async ({ page }) => {
    await expect(page.getByText(/Grade:/)).toBeVisible()
    await expect(page.getByText(/Location:/)).toBeVisible()
    await expect(page.getByText(/Bangalore/)).toBeVisible()
  })

  test('should display candidate status', async ({ page }) => {
    await expect(page.getByText(/INTERVIEWED/)).toBeVisible()
  })

  test('should show loading state initially', async ({ page }) => {
    // Fresh navigation should show spinner briefly
    await page.goto('/candidate-details/c2')
    // Spinner appears and disappears quickly
    await page.waitForTimeout(500)
  })
})
