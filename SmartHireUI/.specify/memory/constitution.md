# SmartHireUI Constitution
<!-- React Native Hiring Platform - Core Development Principles -->

## Core Principles

### I. Component-Driven Architecture
Every UI feature must be built as reusable, self-contained components. Components must:
- Be functional and stateless by default (hooks-based)
- Have a single, well-defined responsibility
- Accept props for configuration; export for consumption by other screens
- Include PropTypes or TypeScript interfaces for type safety
- Be independently testable with comprehensive unit tests

**Rationale**: Component-driven design ensures scalability, maintainability, and enables code reuse across multiple screens and features. It reduces duplication and makes the codebase easier to navigate and modify.

### II. Native Performance First (NON-NEGOTIABLE)
Optimize relentlessly for mobile performance. Team enforces:
- Flat component hierarchies; avoid unnecessary nesting (max 3-4 levels)
- `React.memo()` for expensive components; proper dependency arrays in hooks
- FlatList/SectionList for long lists (never ScrollView for large datasets)
- Image optimization: use `Image` component with `resizeMode`, consider `FastImage` for external URLs
- No synchronous operations on the main thread; all async work deferred to useEffect or background tasks
- Navigation patterns follow React Navigation best practices: native stack navigation for iOS/Android

**Rationale**: Mobile devices have limited CPU, memory, and battery. Poor performance degrades user experience and causes churn. Native-first optimization is a competitive advantage.

### III. Test-Driven Development (TDD Mandatory)
Tests written → Reviewed by team → Tests fail → Implementation → Tests pass. Cycle applies to:
- All new features require unit tests (Jest + React Native Testing Library)
- Screen-level integration tests for major user flows
- Critical business logic: 100% coverage; UI components: ≥80% coverage
- PR checklist: Must include test updates or additions

**Rationale**: TDD catches regressions early, documents expected behavior, and reduces technical debt. Mobile apps benefit from automated testing given the complexity of OS-level integrations.

### IV. Type Safety & Code Quality
TypeScript is mandatory throughout:
- Strict mode enabled (`strict: true` in tsconfig)
- No `any` types without documented exception and team approval
- ESLint + Prettier configured; CI blocks PRs with linting errors
- Code reviews verify compliance; team enforces naming conventions and patterns

**Rationale**: Strong typing prevents runtime errors common in dynamically typed mobile codebases. Consistent formatting and linting reduce review friction and cognitive load.

### V. Cross-Platform Consistency
iOS and Android must deliver parity:
- Test on both platforms before marking PR as done; use BrowserStack/EAS Build
- Platform-specific code isolated in `Platform`-suffixed files (e.g., `Button.ios.ts`, `Button.android.ts`)
- No hardcoded colors, dimensions, or fonts; use centralized theme/design tokens
- Handle OS-specific permissions, UI patterns (e.g., back gesture, notch, tab bar) explicitly

**Rationale**: React Native's "learn once, write anywhere" only works with intentional design. Cross-platform testing prevents post-launch surprises and ensures consistent user experience.

### VI. API Integration & State Management
Standardized patterns for backend communication and state:
- All API calls through centralized service layer (e.g., `services/api.ts`)
- Error handling consistent: typed error responses, user-facing messages, logging
- State management: Redux Toolkit for app-wide state; local component state with `useState` for UI-only
- Offline support: Implement caching and conflict resolution for critical data
- Authentication: Token stored securely (react-native-keychain); refresh logic centralized

**Rationale**: Centralized API and state patterns reduce bugs, enable better error tracking, and simplify maintenance. Offline support is critical for mobile where connectivity is unreliable.

### VII. Security & Data Protection
Non-negotiable security practices:
- Sensitive data (tokens, PII) never logged or stored in plain text
- Use react-native-keychain for secure credential storage
- All network traffic over HTTPS; certificate pinning for sensitive endpoints
- Validate and sanitize user input; prevent injection attacks
- Comply with platform-specific security guidelines (iOS App Transport Security, Android Network Security)

**Rationale**: Mobile apps often handle sensitive hiring/recruitment data. Security breaches erode user trust and create legal/compliance risks.

## Code Organization & Patterns

### Directory Structure
```
src/
  screens/        # Screen components (feature-based)
  components/     # Reusable UI components
  services/       # API, analytics, logging, device services
  store/          # Redux slices, selectors, middleware
  hooks/          # Custom hooks
  utils/          # Helper functions, constants, formatters
  navigation/     # Navigation stacks and linking
  theme/          # Colors, typography, spacing (design tokens)
  types/          # Shared TypeScript interfaces
  __tests__/      # Unit and integration tests
```

### Naming & File Conventions
- PascalCase for components: `UserProfileCard.tsx`
- camelCase for utilities/services: `parseUserResponse.ts`
- UPPER_SNAKE_CASE for constants: `MAX_RETRY_ATTEMPTS`
- Test files colocated: `Button.tsx` → `Button.test.tsx`
- Platform-specific variants: `Form.ios.tsx`, `Form.android.tsx`

## Quality Gates

All pull requests must pass:
1. **Automated tests**: Jest coverage ≥80% (UI), ≥95% (business logic)
2. **Linting**: ESLint and Prettier without errors or warnings
3. **TypeScript**: Strict compilation; no type errors
4. **Code review**: At least one team member approval
5. **Platform testing**: Verified on iOS and Android simulators/devices (or EAS)
6. **Performance**: No new console warnings; navigation performance ≥60fps

Exceptions require team consensus and explicit documentation in PR description.

## Governance

This constitution supersedes all other practices and guidelines. It represents the team's commitment to shipping high-quality, performant, maintainable mobile software.

**Amendment Procedure**:
- Proposed changes must document rationale and impact on existing features
- Discussion and approval required from team leads
- Migration plan provided if change affects existing code
- Version number incremented; all team members notified

**Compliance Review**:
- Monthly: Team retrospective to discuss compliance challenges
- Quarterly: Constitution review to assess relevance and effectiveness
- Ad-hoc: Technical debt review if compliance becomes unsustainable

**Runtime Guidance**: See `.github/copilot-instructions.md` for AI-assisted development practices and SpecKit workflows.

---

**Version**: 1.0.0 | **Ratified**: 2026-05-22 | **Last Amended**: 2026-05-22
