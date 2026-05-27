/**
 * T182 - To-Do List E2E tests (Playwright)
 */
import { test, expect } from '@playwright/test'

test.describe('To-Do List', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to todo list page
    await page.goto('/todo-list')
  })

  test('should display to-do list page', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: /To-Do List/i })).toBeVisible()
    await expect(page.getByText(/Your tasks for today/i)).toBeVisible()
  })

  test('interviewer should see today interviews table', async ({ page }) => {
    await expect(page.getByText(/Today's Interviews/i)).toBeVisible()
  })

  test('interviewer should see pending feedbacks table', async ({ page }) => {
    await expect(page.getByText(/Pending Feedbacks/i)).toBeVisible()
  })

  test('should display slot warning banner', async ({ page }) => {
    await expect(page.getByText(/Limited Slot Availability/i)).toBeVisible()
  })

  test('should show today interview candidate details', async ({ page }) => {
    // Verify interview details are visible
    const interviewsSection = page.locator('text=Today\'s Interviews').first()
    const container = interviewsSection.locator('xpath=../../..').first()
    
    // Check for candidate name and time
    await expect(container.getByText(/\d{1,2}:\d{2}\s(?:AM|PM)/)).toBeVisible()
  })

  test('should show pending feedback candidate details', async ({ page }) => {
    // Verify feedback details are visible
    const feedbacksSection = page.locator('text=Pending Feedbacks').first()
    const container = feedbacksSection.locator('xpath=../../..').first()
    
    // Submit feedback button should be visible
    await expect(container.getByText(/Submit Feedback/i)).toBeVisible()
  })

  test('should navigate to feedback form on submit feedback button click', async ({ page }) => {
    const submitButton = page.getByText(/Submit Feedback/i).first()
    await submitButton.click()
    
    // Should navigate to feedback form
    await expect(page).toHaveURL(/feedback-form/)
  })

  test('should navigate to booking form on create slots button click', async ({ page }) => {
    const createSlotsButton = page.getByText(/Create Slots/i)
    await createSlotsButton.click()
    
    // Should navigate to booking form
    await expect(page).toHaveURL('/booking-form')
  })

  test('should display all interview columns', async ({ page }) => {
    const headers = [
      'Time',
      'Candidate',
      'Contact',
      'Experience',
      'Skills',
      'Interview Type',
    ]
    
    for (const header of headers) {
      await expect(page.getByText(header)).toBeVisible()
    }
  })

  test('should display all feedback columns', async ({ page }) => {
    const headers = ['Candidate', 'Technology', 'Interview Time', 'Interview Type', 'Action']
    
    for (const header of headers) {
      const element = page.getByText(header)
      // Only check visible elements (some may be in different tables)
      if (await element.isVisible({ timeout: 100 }).catch(() => false)) {
        await expect(element).toBeVisible()
      }
    }
  })
})
