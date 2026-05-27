/**
 * T100 - FeedbackTemplate component tests
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FeedbackTemplate } from '@components/feedback/FeedbackTemplate'
import { RemarkOption } from '@appTypes/feedback'
import type { SkillRating, BehavioralEval } from '@appTypes/feedback'

const technicalRatings: SkillRating[] = [
  { skillId: 'ta1', skillName: 'Core Java', rating: null, remark: '' },
  { skillId: 'ta2', skillName: 'Spring Boot', rating: 4, remark: RemarkOption.GOOD },
]

const behavioralRatings: BehavioralEval[] = [
  { areaId: 'ba1', areaName: 'Communication', rating: null, remark: '' },
]

describe('FeedbackTemplate', () => {
  it('should render technical area names', () => {
    render(
      <FeedbackTemplate

        technicalRatings={technicalRatings}
        behavioralRatings={behavioralRatings}
        onTechnicalChange={vi.fn()}
        onBehavioralChange={vi.fn()}
        onAddTechnicalRow={vi.fn()}
      />
    )
    expect(screen.getByText('Core Java')).toBeInTheDocument()
    expect(screen.getByText('Spring Boot')).toBeInTheDocument()
  })

  it('should render behavioral area names', () => {
    render(
      <FeedbackTemplate

        technicalRatings={technicalRatings}
        behavioralRatings={behavioralRatings}
        onTechnicalChange={vi.fn()}
        onBehavioralChange={vi.fn()}
        onAddTechnicalRow={vi.fn()}
      />
    )
    expect(screen.getByText('Communication')).toBeInTheDocument()
  })

  it('should show rating selects', () => {
    render(
      <FeedbackTemplate

        technicalRatings={technicalRatings}
        behavioralRatings={behavioralRatings}
        onTechnicalChange={vi.fn()}
        onBehavioralChange={vi.fn()}
        onAddTechnicalRow={vi.fn()}
      />
    )
    const ratingSelects = screen.getAllByRole('combobox')
    expect(ratingSelects.length).toBeGreaterThan(0)
  })

  it('should call onTechnicalChange when rating is changed', () => {
    const onTechnicalChange = vi.fn()
    render(
      <FeedbackTemplate

        technicalRatings={technicalRatings}
        behavioralRatings={behavioralRatings}
        onTechnicalChange={onTechnicalChange}
        onBehavioralChange={vi.fn()}
        onAddTechnicalRow={vi.fn()}
      />
    )
    const ratingSelect = screen.getByLabelText('Rating for Core Java')
    fireEvent.change(ratingSelect, { target: { value: '3' } })
    expect(onTechnicalChange).toHaveBeenCalledWith(0, 'rating', 3)
  })

  it('should call onAddTechnicalRow when Add Row is clicked', () => {
    const onAddTechnicalRow = vi.fn()
    render(
      <FeedbackTemplate

        technicalRatings={technicalRatings}
        behavioralRatings={behavioralRatings}
        onTechnicalChange={vi.fn()}
        onBehavioralChange={vi.fn()}
        onAddTechnicalRow={onAddTechnicalRow}
      />
    )
    fireEvent.click(screen.getByText('+ Add Row'))
    expect(onAddTechnicalRow).toHaveBeenCalled()
  })

  it('should disable inputs in readOnly mode', () => {
    render(
      <FeedbackTemplate

        technicalRatings={technicalRatings}
        behavioralRatings={behavioralRatings}
        onTechnicalChange={vi.fn()}
        onBehavioralChange={vi.fn()}
        onAddTechnicalRow={vi.fn()}
        readOnly={true}
      />
    )
    // Add Row should be hidden in readOnly
    expect(screen.queryByText('+ Add Row')).not.toBeInTheDocument()
    // Selects should be disabled
    const selects = screen.getAllByRole('combobox')
    selects.forEach((s) => expect(s).toBeDisabled())
  })
})
