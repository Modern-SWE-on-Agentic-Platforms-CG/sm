/**
 * T102 - Feedback E2E tests
 */
import { test, expect } from '@playwright/test'

test.describe('Feedback Form', () => {
  test('should navigate to feedback form screen', async ({ page }) => {
    await page.goto('/feedback?candidateId=c1&slotId=s1&technology=Java&candidateName=Test+Candidate')
    await expect(page.locator('h1:has-text("Interview Feedback")')).toBeVisible()
  })

  test('should show candidate info section', async ({ page }) => {
    await page.goto('/feedback?candidateId=c1&slotId=s1&technology=Java&candidateName=John+Doe')
    await expect(page.locator('text=Candidate Info')).toBeVisible()
    await expect(page.locator('text=John Doe')).toBeVisible()
  })

  test('should show feedback status dropdown', async ({ page }) => {
    await page.goto('/feedback?candidateId=c1&slotId=s1&technology=Java')
    await expect(page.locator('#feedbackStatus')).toBeVisible()
  })

  test('should show overall remark dropdown', async ({ page }) => {
    await page.goto('/feedback?candidateId=c1&slotId=s1&technology=Java')
    await expect(page.locator('#overallRemark')).toBeVisible()
  })

  test('should have submit button disabled initially', async ({ page }) => {
    await page.goto('/feedback?candidateId=c1&slotId=s1&technology=Java')
    // Submit button should be disabled when form is not filled
    const submitBtn = page.locator('button[type="submit"]')
    await expect(submitBtn).toBeDisabled()
  })

  test('should load technical evaluation fields from template', async ({ page }) => {
    await page.goto('/feedback?candidateId=c1&slotId=s1&technology=Java')
    // Should eventually show technical section (after API load)
    await expect(page.locator('text=Technical Evaluation')).toBeVisible({ timeout: 5000 })
  })
})
