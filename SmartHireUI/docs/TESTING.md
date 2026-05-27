# Testing Strategy & Patterns

**Last Updated**: May 26, 2026

## Overview

SmartHire uses a three-tier testing strategy: Unit Tests (Vitest), Integration Tests (React Testing Library), and E2E Tests (Playwright). This document describes testing patterns and best practices.

## Testing Stack

- **Unit/Integration**: Vitest + React Testing Library + jsdom
- **E2E**: Playwright (@playwright/test)
- **Mocking**: Vitest's `vi.mock()` + Mock Service Worker (MSW)
- **Coverage**: Vitest coverage reporter (nyc)

## Directory Structure

```
src/__tests__/
├── unit/                           # Unit tests for services, utils
│   ├── services/
│   │   ├── api/
│   │   │   ├── candidates.test.ts
│   │   │   ├── booking.test.ts
│   │   │   └── ...
│   │   └── utils/
│   │       └── fileUpload.test.ts
│   └── hooks/
│       └── useAuth.test.ts
├── integration/                    # Integration tests for components/screens
│   ├── components/
│   │   ├── forms/
│   │   │   └── BookingForm.test.tsx
│   │   └── tables/
│   │       └── CandidateTable.test.tsx
│   └── screens/
│       ├── login/
│       │   └── LoginScreen.test.tsx
│       └── candidate/
│           └── CandidateDetailsScreen.test.tsx
└── e2e/                            # E2E tests (Playwright)
    ├── auth.spec.ts
    ├── candidate-pipeline.spec.ts
    ├── booking.spec.ts
    ├── feedback.spec.ts
    ├── reports.spec.ts
    └── referral.spec.ts
```

## Unit Tests

### Testing Services

**File**: `src/__tests__/unit/services/api/candidates.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCandidates, updateCandidateStatus } from '@services/api/candidates'
import * as apiClient from '@services/api/client'

vi.mock('@services/api/client')

describe('Candidates API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch candidates with filters', async () => {
    const mockData = {
      items: [{ id: 'c1', name: 'John' }],
      total: 1,
      page: 1,
      pageSize: 50,
    }

    vi.spyOn(apiClient, 'apiClient').mockResolvedValueOnce({
      data: mockData,
    })

    const result = await getCandidates({
      page: 1,
      pageSize: 50,
      filters: { technology: 'Java' },
    })

    expect(result).toEqual(mockData)
  })

  it('should handle API errors gracefully', async () => {
    const error = new Error('API Error')
    vi.spyOn(apiClient, 'apiClient').mockRejectedValueOnce(error)

    await expect(getCandidates({})).rejects.toThrow('API Error')
  })

  it('should update candidate status', async () => {
    vi.spyOn(apiClient, 'apiClient').mockResolvedValueOnce({
      data: { id: 'c1', status: 'SHORTLISTED' },
    })

    const result = await updateCandidateStatus('c1', 'SHORTLISTED')

    expect(result.status).toBe('SHORTLISTED')
  })
})
```

### Testing Hooks

**File**: `src/__tests__/unit/hooks/useAuth.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '@hooks/useAuth'
import { useAppSelector } from '@store/store'

vi.mock('@store/store')

describe('useAuth Hook', () => {
  it('should return user data when authenticated', () => {
    vi.mocked(useAppSelector).mockImplementation((selector) =>
      selector({
        auth: {
          user: { id: 'u1', name: 'John', roles: ['RECRUITER'] },
          isAuthenticated: true,
        },
      })
    )

    const { result } = renderHook(() => useAuth())

    expect(result.current.user?.name).toBe('John')
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should have hasRole utility method', () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.hasRole('RECRUITER')).toBe(true)
    expect(result.current.hasRole('ADMIN')).toBe(false)
  })
})
```

## Integration Tests

### Testing Components

**File**: `src/__tests__/integration/components/forms/BookingForm.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { store } from '@store/store'
import { BookingForm } from '@components/forms/BookingForm'

vi.mock('@services/api/booking', () => ({
  createSlots: vi.fn().mockResolvedValue({ success: true }),
  bookSlot: vi.fn().mockResolvedValue({ id: 'b1', candidateId: 'c1' }),
}))

function renderComponent() {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <BookingForm candidateId="c1" onSubmit={vi.fn()} />
      </MemoryRouter>
    </Provider>
  )
}

describe('BookingForm Component', () => {
  it('should render booking form fields', () => {
    renderComponent()

    expect(screen.getByLabelText(/Interview Type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Time/i)).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()
    renderComponent()

    const submitButton = screen.getByText(/Submit/i)
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Interview Type is required/i)).toBeInTheDocument()
    })
  })

  it('should submit valid form data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    
    render(
      <Provider store={store}>
        <MemoryRouter>
          <BookingForm candidateId="c1" onSubmit={onSubmit} />
        </MemoryRouter>
      </Provider>
    )

    const interviewTypeSelect = screen.getByLabelText(/Interview Type/i)
    await user.selectOption(interviewTypeSelect, 'L1')

    const submitButton = screen.getByText(/Submit/i)
    await user.click(submitButton)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })
  })
})
```

### Testing Screens

**File**: `src/__tests__/integration/screens/candidate/CandidateDetailsScreen.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { store } from '@store/store'
import CandidateDetailsScreen from '@screens/candidate/CandidateDetailsScreen'

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useParams: () => ({ id: 'c1' }),
  }
})

vi.mock('@services/api/candidates', () => ({
  getCandidateById: vi.fn().mockResolvedValue({
    id: 'c1',
    name: 'John Doe',
    email: 'john@test.com',
    skillMatch: { matchPercentage: 80 },
    documents: [],
    lifecycleHistory: [],
  }),
}))

describe('CandidateDetailsScreen', () => {
  it('should display candidate information', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CandidateDetailsScreen />
        </MemoryRouter>
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@test.com')).toBeInTheDocument()
    })
  })

  it('should display skill match section', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CandidateDetailsScreen />
        </MemoryRouter>
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText(/Skill Match Analysis/i)).toBeInTheDocument()
      expect(screen.getByText(/80%/)).toBeInTheDocument()
    })
  })
})
```

## E2E Tests

### Authentication Flow

**File**: `src/__tests__/e2e/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should login and redirect to dashboard', async ({ page }) => {
    await page.goto('/')
    
    // Should redirect to login if not authenticated
    await expect(page).toHaveURL(/\/login/)

    // Fill login form (mock SSO flow)
    await page.fill('input[name="email"]', 'user@example.com')
    await page.fill('input[name="password"]', 'password123')
    
    // Submit form
    await page.click('button:has-text("Login")')

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)
    
    // JWT token should be stored
    const token = await page.evaluate(() => localStorage.getItem('token'))
    expect(token).toBeTruthy()
  })

  test('should logout and redirect to login', async ({ page }) => {
    // Setup: Login first
    await page.goto('/dashboard')
    
    // Click logout
    await page.click('button:has-text("Logout")')

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
    
    // Token should be cleared
    const token = await page.evaluate(() => localStorage.getItem('token'))
    expect(token).toBeNull()
  })

  test('should prevent access to protected routes without auth', async ({ page }) => {
    // Clear token
    await page.evaluate(() => localStorage.removeItem('token'))

    // Try to access protected route
    await page.goto('/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })
})
```

### Candidate Pipeline

**File**: `src/__tests__/e2e/candidate-pipeline.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Candidate Pipeline', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[name="email"]', 'recruiter@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button:has-text("Login")')
    await page.goto('/pipeline')
  })

  test('should display candidate table with filters', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table')

    // Check table has data
    const rows = await page.locator('table tbody tr')
    expect(await rows.count()).toBeGreaterThan(0)

    // Filter by technology
    await page.selectOption('select[name="technology"]', 'Java')

    // Table should update
    await page.waitForTimeout(500)
    const filteredRows = await page.locator('table tbody tr')
    expect(await filteredRows.count()).toBeLessThanOrEqual(
      await rows.count()
    )
  })

  test('should update candidate status', async ({ page }) => {
    // Find first candidate row
    const firstRow = page.locator('table tbody tr').first()

    // Click status dropdown
    const statusDropdown = firstRow.locator('select[name="status"]')
    await statusDropdown.selectOption('SHORTLISTED')

    // Verify update
    await page.waitForTimeout(500)
    const selectedValue = await statusDropdown.inputValue()
    expect(selectedValue).toBe('SHORTLISTED')
  })

  test('should export table to Excel', async ({ page, context }) => {
    // Listen for download
    const downloadPromise = context.waitForEvent('download')

    // Click export button
    await page.click('button:has-text("Export Excel")')

    // Wait for download
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('.xlsx')
  })
})
```

## Testing Best Practices

### 1. Arrange-Act-Assert Pattern

```typescript
it('should update status when button clicked', async () => {
  // Arrange
  const mockData = { id: 'c1', status: 'APPLIED' }
  vi.mocked(updateStatus).mockResolvedValue({ ...mockData, status: 'SHORTLISTED' })

  // Act
  render(<CandidateRow candidate={mockData} />)
  await userEvent.click(screen.getByText('Shortlist'))

  // Assert
  await waitFor(() => {
    expect(updateStatus).toHaveBeenCalledWith('c1', 'SHORTLISTED')
  })
})
```

### 2. Mock External Dependencies

```typescript
// ✓ Good: Mock API calls
vi.mock('@services/api/candidates', () => ({
  getCandidates: vi.fn().mockResolvedValue({ items: [] }),
}))

// ✗ Avoid: Making real API calls in tests
// await getCandidates() // This will hit real API!
```

### 3. Use Test Utils for Provider Setup

**File**: `src/__tests__/testUtils.tsx`

```typescript
import { render as rtlRender } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { store } from '@store/store'

export function render(ui: React.ReactElement) {
  return rtlRender(
    <Provider store={store}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </Provider>
  )
}
```

### 4. Test User Interactions

```typescript
import userEvent from '@testing-library/user-event'

it('should handle form submission', async () => {
  const user = userEvent.setup()
  render(<LoginForm />)

  await user.type(screen.getByLabelText('Email'), 'test@example.com')
  await user.type(screen.getByLabelText('Password'), 'password')
  await user.click(screen.getByText('Login'))

  // Assert results
})
```

### 5. Wait for Async Operations

```typescript
import { waitFor } from '@testing-library/react'

it('should load and display data', async () => {
  render(<DataComponent />)

  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument()
  })
})
```

## Running Tests

### Unit & Integration Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test -- --coverage

# Run specific file
npm run test -- src/__tests__/unit/services/api/candidates.test.ts

# Watch mode
npm run test -- --watch
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific spec file
npm run test:e2e -- auth.spec.ts

# Debug mode (opens browser)
npm run test:e2e -- --debug

# View test report
npm run test:e2e -- --reporter html
```

## Coverage Goals

- **Components**: 80% coverage
- **Services/APIs**: 90% coverage
- **Utilities**: 85% coverage
- **Overall**: 85% combined coverage

```bash
# Check coverage report
npm run test -- --coverage

# Output will show:
# ────────────────────────────────────────────────
# │ File                          │ % Stmts │ % Lines │
# ├───────────────────────────────┼─────────┼─────────┤
# │ candidates.test.ts            │   95    │    90   │
# └───────────────────────────────┴─────────┴─────────┘
```

## Debugging Tests

### Visual Debugging

```typescript
import { screen, debug } from '@testing-library/react'

it('should display data', () => {
  render(<Component />)
  
  // Print DOM to console
  debug()
  
  // Check specific element
  console.log(screen.getByText('Title'))
})
```

### Playwright Debugging

```bash
# Run with inspector
npm run test:e2e -- --debug

# Pause test execution
await page.pause()
```

## CI/CD Integration

Tests run in CI pipeline before deployment:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm run test -- --coverage
  
- name: Upload coverage
  uses: codecov/codecov-action@v3
```

---

For more examples, see test files in `src/__tests__/` directory.
