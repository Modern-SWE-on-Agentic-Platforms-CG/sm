# SmartHire Web Platform - Developer Quick Start

**Last Updated**: May 26, 2026

**Version**: 1.0.0

Get up and running with SmartHire Web Platform in 15 minutes!

## 5-Minute Setup

### Prerequisites

- **Node.js 18+** (verify with `node -v`)
- **npm 8+** (verify with `npm -v`)
- **Git**
- Code editor (VS Code recommended)

### Clone & Install

```bash
# Clone repository
git clone https://github.com/your-org/smarthire-web.git
cd SmartHireUI

# Install dependencies
cd app
npm install

# Start development server
npm run dev
```

✓ **Open** `http://localhost:5173` in browser

## Project Structure

```
SmartHireUI/
├── app/                              # React + Vite application
│   ├── src/
│   │   ├── screens/                  # Full-page components (routes)
│   │   ├── components/               # Reusable UI components
│   │   ├── store/                    # Redux state management
│   │   ├── services/                 # API clients & utilities
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── types/                    # TypeScript types & interfaces
│   │   └── main.tsx                  # App entry point
│   ├── vite.config.ts                # Vite configuration
│   ├── tsconfig.app.json             # TypeScript configuration
│   └── package.json
├── docs/                             # Documentation
│   ├── API_CLIENT.md                 # API usage guide
│   ├── REDUX.md                      # State management guide
│   ├── HOOKS.md                      # Custom hooks reference
│   ├── COMPONENTS.md                 # Component library
│   ├── TESTING.md                    # Testing guide
│   └── DEPLOYMENT.md                 # Deployment instructions
└── specs/                            # Feature specifications
    └── 002-smarthire-web-platform/
        ├── spec.md                   # Feature specification
        ├── tasks.md                  # Implementation tasks
        └── plan.md                   # Technical architecture
```

## Key Commands

```bash
# Development
npm run dev              # Start dev server (hot reload)
npm run build           # Production build
npm run preview         # Preview production build locally
npm run lint            # ESLint check
npm run type-check      # TypeScript type checking

# Testing
npm run test            # Run unit/integration tests
npm run test:watch      # Watch mode for tests
npm run test -- --coverage  # Test coverage report
npm run test:e2e        # Run E2E tests (Playwright)

# Build Optimization
npm run analyze-bundle  # Bundle size analysis
npm run type-check      # Full type check
```

## First Time Walkthrough

### 1. Login Screen

Visit `http://localhost:5173/home` → Mock SSO login

Default credentials (mock):
- Email: `recruiter@example.com`
- Password: `password`

### 2. Candidate Pipeline

Navigate to `/pipeline` → View candidate table with filtering

**Try**: Filter by Technology = "Java", Status = "Applied"

### 3. Interview Calendar

Navigate to `/dashboard` → Month-view interview calendar

**Try**: Click a date to create interview slots

### 4. Feedback Form

Navigate to `/feedback` → Fill out feedback form

**Try**: Submit technical evaluation + behavioral scores

### 5. Reports

Navigate to `/select-reject` → View analytics dashboards

**Try**: Filter by date range, export to Excel

## File Naming Conventions

- **Components**: PascalCase (e.g., `CandidateTable.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useCandidates.ts`)
- **Services**: camelCase (e.g., `apiClient.ts`)
- **Types**: PascalCase (e.g., `candidate.ts` exports `Candidate` interface)
- **Tests**: `*.test.ts` or `*.spec.ts`

## Import Paths (Aliases)

```typescript
// Use path aliases instead of relative imports
import { Button } from '@components/common/Button'
import { useCandidates } from '@hooks/useCandidates'
import { getCandidates } from '@services/api/candidates'
import type { Candidate } from '@appTypes/candidate'

// Avoid
import { Button } from '../../../components/common/Button'
```

## Authentication

### SSO Setup

SmartHire uses Keycloak SSO. For local development:

```bash
# 1. Start Keycloak (Docker)
docker run -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  jboss/keycloak

# 2. Create realm "smarthire-dev" at http://localhost:8080
# 3. Create client "smarthire-client-dev"
# 4. Set valid redirect URI: http://localhost:5173/*

# 5. Add users (Roles tab)
# - recruiter@example.com → RECRUITER
# - interviewer@example.com → INTERVIEWER
# - admin@example.com → ADMIN
```

### JWT Token in Local Storage

After login, JWT token stored in `localStorage.token`:

```typescript
const token = localStorage.getItem('token')
// Token automatically added to API requests via interceptor
```

## State Management (Redux)

### Accessing State

```typescript
import { useAppSelector } from '@store/store'

function MyComponent() {
  const user = useAppSelector(state => state.auth.user)
  const candidates = useAppSelector(state => state.candidates.items)
  
  return <div>{user?.name}</div>
}
```

### Dispatching Actions

```typescript
import { useAppDispatch } from '@store/store'
import { fetchCandidates } from '@store/slices/candidatesSlice'

function MyComponent() {
  const dispatch = useAppDispatch()
  
  useEffect(() => {
    dispatch(fetchCandidates({ page: 1, pageSize: 50 }))
  }, [dispatch])
}
```

## API Calls

### Using API Client

```typescript
import { getCandidates, updateCandidateStatus } from '@services/api/candidates'

// GET request
const data = await getCandidates({
  page: 1,
  pageSize: 50,
  filters: { technology: 'Java' }
})

// PUT request
await updateCandidateStatus('c123', 'SHORTLISTED')
```

### Error Handling

Errors automatically shown as toastr notifications via interceptor. For custom handling:

```typescript
try {
  const result = await getCandidates()
} catch (error: any) {
  console.error(error.message)
  // Handle error
}
```

## Component Development

### Creating a Component

**File**: `src/components/candidate/MyComponent.tsx`

```typescript
import React from 'react'

interface MyComponentProps {
  title: string
  onAction?: () => void
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded border">
      <span>{title}</span>
      <button onClick={onAction}>Action</button>
    </div>
  )
}
```

### Using Component

```typescript
import { MyComponent } from '@components/candidate/MyComponent'

export function Dashboard() {
  return <MyComponent title="Hello" onAction={() => console.log('clicked')} />
}
```

## Styling (Tailwind CSS)

No separate CSS files needed - use Tailwind classes inline:

```typescript
export function Card() {
  return (
    <div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-900">Title</h2>
      <p className="text-gray-600">Content</p>
      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Action
      </button>
    </div>
  )
}
```

### Common Tailwind Patterns

```typescript
// Flexbox layouts
<div className="flex justify-between items-center">
<div className="flex flex-col gap-2">

// Grid layouts
<div className="grid grid-cols-3 gap-4">

// Responsive
<div className="w-full md:w-1/2 lg:w-1/3">

// Colors
className="text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100"

// Spacing
className="px-4 py-2 mb-4 mt-2"

// Typography
className="text-sm md:text-lg font-bold uppercase"
```

## Testing

### Running Tests

```bash
# All tests
npm run test

# Specific file
npm run test -- candidates.test.ts

# Watch mode
npm run test -- --watch

# Coverage
npm run test -- --coverage
```

### Writing a Test

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('should render with title', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('should call onAction when clicked', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    
    render(<MyComponent title="Test" onAction={onClick} />)
    await user.click(screen.getByText('Action'))
    
    expect(onClick).toHaveBeenCalled()
  })
})
```

## Debugging

### Browser DevTools

- **Redux DevTools Extension**: Inspect state, time-travel, replay actions
- **React DevTools**: Component hierarchy, prop inspection
- **Network Tab**: API request inspection

### VSCode Debugging

Add to `.vscode/launch.json`:

```json
{
  "type": "chrome",
  "request": "launch",
  "name": "Launch Chrome",
  "url": "http://localhost:5173",
  "webRoot": "${workspaceFolder}/app/src"
}
```

Press F5 to start debugging with breakpoints.

### Console Logging

```typescript
// Development only
if (import.meta.env.DEV) {
  console.log('Debug info:', data)
}
```

## Common Tasks

### Add a New Page

1. Create screen: `src/screens/MyScreen.tsx`
2. Add route in `src/App.tsx`:
   ```typescript
   import MyScreen from '@screens/MyScreen'
   
   <Route path="/mypath" element={<MyScreen />} />
   ```
3. Add navigation link in sidebar

### Fetch Data

1. Create API function in `src/services/api/`
2. Create Redux thunk/reducer in `src/store/slices/`
3. Use `useAppDispatch` + `useAppSelector` in component

### Add Form Validation

Use React Hook Form + Yup:

```typescript
import { useForm } from 'react-hook-form'
import * as Yup from 'yup'

const validationSchema = Yup.object({
  email: Yup.string().email().required(),
  password: Yup.string().min(8).required()
})

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema)
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  )
}
```

## Environment Setup

### .env Files

```bash
# .env.development
VITE_API_URL=http://localhost:3001/api
VITE_KEYCLOAK_URL=http://localhost:8080

# .env.production
VITE_API_URL=https://api.smarthire.com/api
VITE_KEYCLOAK_URL=https://auth.smarthire.com
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

## Performance Tips

1. **Code splitting**: Routes auto-split with lazy loading
2. **Memoization**: Use `React.memo` for expensive components
3. **Selectors**: Create memoized Redux selectors with `createSelector`
4. **Images**: Use SVG or WebP format
5. **Bundling**: Let Vite handle minification/tree-shaking

## Getting Help

1. **Documentation**: `/docs` folder (API_CLIENT.md, REDUX.md, etc.)
2. **Type definitions**: Hover over types in VS Code for IntelliSense
3. **Component examples**: Check existing screens for patterns
4. **Tests**: Look at `__tests__` folder for usage examples
5. **API Reference**: See `API_CLIENT.md` for endpoint documentation

## Next Steps

- [ ] Complete first login
- [ ] Explore candidate pipeline
- [ ] Try creating an interview slot
- [ ] Submit feedback form
- [ ] View analytics dashboard
- [ ] Read full docs in `/docs` folder
- [ ] Run tests: `npm run test`
- [ ] Build for production: `npm run build`

## Useful VS Code Extensions

- **ES7+ React/Redux/React-Native snippets**: dsznajder.es7-react-js-snippets
- **Tailwind CSS IntelliSense**: bradlc.vscode-tailwindcss
- **TypeScript Vue Plugin**: vue.volar
- **ESLint**: dbaeumer.vscode-eslint
- **Prettier**: esbenp.prettier-vscode
- **Redux DevTools Extension**: Chrome extension

## Common Issues & Solutions

**Issue**: `npm install` fails
```bash
# Solution: Clear npm cache
npm cache clean --force
npm install
```

**Issue**: Port 5173 already in use
```bash
# Solution: Use different port
npm run dev -- --port 5174
```

**Issue**: TypeScript errors in editor
```bash
# Solution: Restart TypeScript server
Cmd/Ctrl + Shift + P → TypeScript: Restart TS Server
```

**Issue**: `Cannot find module '@components/...'`
```bash
# Solution: Check vite.config.ts alias configuration
# Aliases defined: @/* → src/*, @components/* → src/components/*, etc.
```

## Support & Feedback

- **Documentation**: [See docs folder](./docs)
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Ask questions on GitHub Discussions
- **Contact**: dev-team@smarthire.com

---

**Ready to code?** Start with `npm run dev` and open `http://localhost:5173`! 🚀
