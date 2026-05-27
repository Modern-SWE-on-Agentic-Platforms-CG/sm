# Component Library Documentation

**Last Updated**: May 26, 2026

## Overview

SmartHire's component library provides reusable UI elements organized by feature area. This document catalogs all components, their props, and usage examples.

## Component Structure

```
src/components/
├── common/              # Shared UI components
│   ├── Spinner.tsx
│   ├── Modal.tsx
│   ├── Card.tsx
│   ├── SlotWarningBanner.tsx
│   └── ...
├── forms/               # Form components
│   ├── BookingForm.tsx
│   ├── FeedbackForm.tsx
│   ├── WeekendDriveForm.tsx
│   └── ...
├── tables/              # Data table components
│   ├── CandidateTable.tsx
│   ├── TodayInterviewsTable.tsx
│   ├── PendingFeedbacksTable.tsx
│   └── ...
├── charts/              # Visualization components
│   ├── RejectionRatioPie.tsx
│   ├── TrendLineChart.tsx
│   ├── PanelPerformanceBar.tsx
│   └── ...
├── calendar/            # Calendar component
│   └── Calendar.tsx
├── candidate/           # Candidate-specific components
│   ├── SkillMatchDisplay.tsx
│   ├── DocumentDownloadSection.tsx
│   ├── DocumentUploadSection.tsx
│   └── ...
└── navigation/          # Navigation components
    └── Sidebar.tsx
```

## Common Components

### Spinner

Loading indicator component.

```typescript
import { Spinner } from '@components/common/Spinner'

export function MyComponent() {
  const [isLoading, setIsLoading] = useState(false)
  
  return (
    <>
      {isLoading && <Spinner />}
      <div>Content</div>
    </>
  )
}
```

**Props**:
```typescript
{
  size?: 'sm' | 'md' | 'lg'        // Default: 'md'
  className?: string                // Additional CSS classes
}
```

### Modal

Modal dialog component with title, content, and actions.

```typescript
import { Modal } from '@components/common/Modal'
import { useState } from 'react'

export function ConfirmDelete() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Delete</button>
      <Modal
        isOpen={isOpen}
        title="Confirm Delete"
        onClose={() => setIsOpen(false)}
      >
        <div>Are you sure?</div>
        <div className="flex gap-2 mt-4">
          <button onClick={() => setIsOpen(false)}>Cancel</button>
          <button onClick={() => { deleteItem(); setIsOpen(false) }}>Delete</button>
        </div>
      </Modal>
    </>
  )
}
```

**Props**:
```typescript
{
  isOpen: boolean
  title: string
  onClose: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}
```

### Card

Container card component.

```typescript
import { Card } from '@components/common/Card'

export function Component() {
  return (
    <Card title="Candidate Information" className="p-4">
      <div>Card content here</div>
    </Card>
  )
}
```

**Props**:
```typescript
{
  title?: string
  children: ReactNode
  className?: string
  variant?: 'default' | 'highlighted' | 'error'
}
```

### SlotWarningBanner

Warning banner for low slot availability.

```typescript
import { SlotWarningBanner } from '@components/common/SlotWarningBanner'

export function Dashboard() {
  return <SlotWarningBanner availableSlots={3} threshold={5} />
}
```

**Props**:
```typescript
{
  availableSlots: number
  threshold?: number              // Default: 5
}
```

## Form Components

### BookingForm

Interview booking form with slot selection.

```typescript
import { BookingForm } from '@components/forms/BookingForm'

export function BookingPage() {
  return (
    <BookingForm
      candidateId="c123"
      onSubmit={(data) => console.log('Booking:', data)}
    />
  )
}
```

**Props**:
```typescript
{
  candidateId?: string
  interviewerId?: string
  onSubmit: (data: Booking) => Promise<void>
  className?: string
}
```

### FeedbackForm

Dynamic feedback submission form.

```typescript
import { FeedbackForm } from '@components/forms/FeedbackForm'

export function FeedbackPage() {
  return (
    <FeedbackForm
      candidateId="c123"
      bookingId="b123"
      onSuccess={() => navigate('/dashboard')}
    />
  )
}
```

**Props**:
```typescript
{
  candidateId: string
  bookingId: string
  onSuccess?: () => void
  onError?: (error: string) => void
}
```

### WeekendDriveForm

Walk-in candidate entry form with BU-specific fields.

```typescript
import { WeekendDriveForm } from '@components/forms/WeekendDriveForm'

export function WeekendDrivePage() {
  return (
    <WeekendDriveForm
      onSubmit={(data) => console.log('New candidate:', data)}
    />
  )
}
```

**Props**:
```typescript
{
  onSubmit: (data: InstantCandidate) => Promise<void>
  className?: string
}
```

## Table Components

### CandidateTable

Paginated candidate pipeline table.

```typescript
import { CandidateTable } from '@components/tables/CandidateTable'

export function Pipeline() {
  const [candidates, setCandidates] = useState([])
  const [page, setPage] = useState(1)

  return (
    <CandidateTable
      candidates={candidates}
      page={page}
      totalCount={1000}
      onPageChange={setPage}
      onStatusChange={(id, status) => updateStatus(id, status)}
    />
  )
}
```

**Props**:
```typescript
{
  candidates: Candidate[]
  page: number
  totalCount: number
  isLoading?: boolean
  onPageChange: (page: number) => void
  onStatusChange?: (id: string, status: string) => void
  onViewDetails?: (id: string) => void
}
```

### TodayInterviewsTable

Table of scheduled interviews for the day.

```typescript
import { TodayInterviewsTable } from '@components/tables/TodayInterviewsTable'

export function TodoList() {
  return (
    <TodayInterviewsTable
      interviews={interviews}
      isLoading={isLoading}
    />
  )
}
```

**Props**:
```typescript
{
  interviews: TodayInterview[]
  isLoading?: boolean
}
```

### PendingFeedbacksTable

Table of interviews needing feedback with submit action.

```typescript
import { PendingFeedbacksTable } from '@components/tables/PendingFeedbacksTable'

export function TodoList() {
  return (
    <PendingFeedbacksTable
      feedbacks={feedbacks}
      onSubmit={(id) => navigate(`/feedback-form?feedback=${id}`)}
    />
  )
}
```

**Props**:
```typescript
{
  feedbacks: PendingFeedback[]
  isLoading?: boolean
  onSubmit?: (feedbackId: string) => void
}
```

## Chart Components

### RejectionRatioPie

Pie chart showing selection/rejection/hold ratios.

```typescript
import { RejectionRatioPie } from '@components/charts/RejectionRatioPie'

export function SelectRejectReport() {
  return (
    <RejectionRatioPie
      data={rejectionRatioData}
      isLoading={isLoading}
    />
  )
}
```

**Props**:
```typescript
{
  data: ChartDataPoint[]
  isLoading?: boolean
  className?: string
}
```

### TrendLineChart

Line chart showing hiring trends over time.

```typescript
import { TrendLineChart } from '@components/charts/TrendLineChart'

export function TrendReport() {
  return (
    <TrendLineChart
      data={trendData}
      isLoading={isLoading}
    />
  )
}
```

**Props**:
```typescript
{
  data: TrendDataPoint[]
  isLoading?: boolean
  className?: string
}
```

### PanelPerformanceBar

Bar chart of interviews per panel member.

```typescript
import { PanelPerformanceBar } from '@components/charts/PanelPerformanceBar'

export function PanelInsights() {
  return (
    <PanelPerformanceBar
      data={panelData}
      isLoading={isLoading}
    />
  )
}
```

**Props**:
```typescript
{
  data: PanelPerformanceData[]
  isLoading?: boolean
  className?: string
}
```

## Candidate Components

### SkillMatchDisplay

Three-column skill visualization with match percentage.

```typescript
import { SkillMatchDisplay } from '@components/candidate/SkillMatchDisplay'

export function CandidateDetails() {
  return (
    <SkillMatchDisplay
      skillMatch={candidate.skillMatch}
    />
  )
}
```

**Props**:
```typescript
{
  skillMatch: SkillMatch
  className?: string
}
```

### DocumentDownloadSection

Download buttons for uploaded documents.

```typescript
import { DocumentDownloadSection } from '@components/candidate/DocumentDownloadSection'

export function CandidateDetails() {
  return (
    <DocumentDownloadSection
      documents={candidate.documents}
      isLoading={isLoading}
    />
  )
}
```

**Props**:
```typescript
{
  documents: CandidateDocument[]
  isLoading?: boolean
  onError?: (error: string) => void
}
```

### DocumentUploadSection

Drag-drop file upload for resume and email.

```typescript
import { DocumentUploadSection } from '@components/candidate/DocumentUploadSection'

export function CandidateDetails() {
  return (
    <DocumentUploadSection
      candidateId={candidate.id}
      onUploadSuccess={() => refetchCandidate()}
    />
  )
}
```

**Props**:
```typescript
{
  candidateId: string
  onUploadSuccess?: () => void
  onError?: (error: string) => void
}
```

### LifecycleTimeline

Timeline visualization of status transitions.

```typescript
import { LifecycleTimeline } from '@components/candidate/LifecycleTimeline'

export function CandidateDetails() {
  return (
    <LifecycleTimeline
      events={candidate.lifecycleHistory}
    />
  )
}
```

**Props**:
```typescript
{
  events: LifecycleEvent[]
  className?: string
}
```

## Calendar Component

### Calendar

Month-view interview slot calendar with color-coding.

```typescript
import { Calendar } from '@components/calendar/Calendar'

export function InterviewerCalendar() {
  return (
    <Calendar
      month={5}
      year={2026}
      events={slotEvents}
      onDateClick={(date) => openBookingForm(date)}
    />
  )
}
```

**Props**:
```typescript
{
  month: number
  year: number
  events: CalendarEvent[]
  onDateClick?: (date: string) => void
  onEventClick?: (event: CalendarEvent) => void
  className?: string
}
```

## Component Patterns

### Loading State

```typescript
import { Spinner } from '@components/common/Spinner'

export function DataComponent() {
  const [isLoading, setIsLoading] = useState(false)

  if (isLoading) return <Spinner />
  return <div>Data</div>
}
```

### Error Handling

```typescript
export function SafeComponent() {
  const [error, setError] = useState<string | null>(null)

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      <div>Content</div>
    </>
  )
}
```

### Conditional Rendering

```typescript
export function ConditionalComponent() {
  const { user } = useAuth()

  return (
    <>
      {user?.roles?.includes('ADMIN') && (
        <div>Admin-only content</div>
      )}
      <div>Universal content</div>
    </>
  )
}
```

## Styling

All components use Tailwind CSS with inline classes. No external CSS files needed.

```typescript
// Good: Tailwind inline
<div className="flex justify-between items-center p-4 bg-blue-50 rounded">
  Content
</div>

// Avoid: External CSS
<div className="my-custom-class">Content</div>
```

## Accessibility

All components include:
- ARIA labels for interactive elements
- Keyboard navigation support (Tab, Enter, Escape)
- Screen reader support
- Color-blind friendly color schemes

```typescript
<button
  aria-label="Close dialog"
  className="text-gray-500 hover:text-gray-700"
  onClick={onClose}
>
  ✕
</button>
```

## Best Practices

1. **Keep components pure**: Props-only, no side effects
   ```typescript
   // Good: Pure component
   export const Card = ({ title, children }) => (
     <div>{title}{children}</div>
   )
   ```

2. **Use composition**: Build complex UIs from simple components
   ```typescript
   <Modal>
     <Card>
       <Form onSubmit={handleSubmit} />
     </Card>
   </Modal>
   ```

3. **Memoize expensive components**: Use React.memo for large lists
   ```typescript
   export const CandidateRow = React.memo(({ candidate }) => (
     <tr>{candidate.name}</tr>
   ))
   ```

4. **Provide TypeScript interfaces**: Always type props
   ```typescript
   interface ButtonProps {
     variant: 'primary' | 'secondary'
     disabled?: boolean
     onClick: () => void
   }
   ```

---

For more components, browse `src/components/` directory. For component examples, see Storybook stories in `src/components/**/*.stories.tsx`.
