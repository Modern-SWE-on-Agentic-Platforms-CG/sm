/**
 * T141 - Referral Portal E2E tests (Playwright)
 */
import { test, expect } from '@playwright/test'

test.describe('Referral Portal — Registration', () => {
  test.beforeEach(async ({ page }) => {
    // Clear referral session before each test
    await page.goto('/referral-portal/referralRegister')
    await page.evaluate(() => {
      localStorage.removeItem('refrole')
      localStorage.removeItem('refname')
      localStorage.removeItem('refuser')
    })
  })

  test('should display the registration form', async ({ page }) => {
    await expect(page.getByText('Referral Portal')).toBeVisible()
    await expect(page.getByLabel(/employee id/i)).toBeVisible()
    await expect(page.getByLabel(/name/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
  })

  test('should show validation errors on empty submit', async ({ page }) => {
    await page.getByRole('button', { name: /register/i }).click()
    await expect(page.getByText('Employee ID is required')).toBeVisible()
  })

  test('should register and redirect to my referrals', async ({ page }) => {
    await page.getByLabel(/employee id/i).fill('E001')
    await page.getByLabel(/name/i).fill('Alice SPOC')
    await page.getByLabel(/email/i).fill('alice@test.com')
    await page.getByLabel(/bu/i).selectOption('Java')
    await page.getByRole('button', { name: /register/i }).click()

    // Should be redirected to ref-candidate-details
    await expect(page).toHaveURL(/ref-candidate-details/)
  })
})

test.describe('Referral Portal — Submit Referral', () => {
  test('should display the referral form', async ({ page }) => {
    await page.goto('/referral-portal/referral-form')
    await expect(page.getByText('Submit Referral')).toBeVisible()
  })

  test('should show form validation errors', async ({ page }) => {
    await page.goto('/referral-portal/referral-form')
    await page.getByRole('button', { name: /submit referral/i }).click()
    await expect(page.getByText('Name is required')).toBeVisible()
  })
})

test.describe('Referral Portal — Admin View', () => {
  test('should display all referrals', async ({ page }) => {
    await page.goto('/candidate-referral')
    await expect(page.getByText('All Referrals')).toBeVisible()
    await expect(page.getByRole('button', { name: /export excel/i })).toBeVisible()
  })

  test('should have filter inputs', async ({ page }) => {
    await page.goto('/candidate-referral')
    await expect(page.getByPlaceholder(/search name/i)).toBeVisible()
    await expect(page.getByPlaceholder(/bu filter/i)).toBeVisible()
  })
})
