/**
 * FeedbackTemplate — dynamic form rendering from template structure
 */
import React from 'react'
import type { SkillRating, BehavioralEval } from '@appTypes/feedback'
import { RemarkOption } from '@appTypes/feedback'

const REMARK_OPTIONS = Object.values(RemarkOption)

interface FeedbackTemplateProps {
  technicalRatings: SkillRating[]
  behavioralRatings: BehavioralEval[]
  onTechnicalChange: (index: number, field: keyof SkillRating, value: string | number) => void
  onBehavioralChange: (index: number, field: keyof BehavioralEval, value: string | number) => void
  onAddTechnicalRow: () => void
  readOnly?: boolean
}

export const FeedbackTemplate: React.FC<FeedbackTemplateProps> = ({
  technicalRatings,
  behavioralRatings,
  onTechnicalChange,
  onBehavioralChange,
  onAddTechnicalRow,
  readOnly = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Technical Evaluation */}
      <section>
        <h3 className="text-base font-semibold text-gray-800 mb-3">Technical Evaluation</h3>
        <div className="space-y-3">
          {technicalRatings.map((rating, i) => (
            <div key={rating.skillId || i} className="grid grid-cols-12 gap-3 items-start">
              <div className="col-span-4">
                <label className="text-xs text-gray-500 block mb-1">Skill</label>
                <p className="text-sm font-medium text-gray-800 py-1.5">{rating.skillName || `Area ${i + 1}`}</p>
              </div>
              <div className="col-span-3">
                <label className="text-xs text-gray-500 block mb-1">Rating (1–5)</label>
                <select
                  value={rating.rating ?? ''}
                  onChange={(e) => onTechnicalChange(i, 'rating', Number(e.target.value))}
                  disabled={readOnly}
                  aria-label={`Rating for ${rating.skillName || 'skill'}`}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm disabled:bg-gray-50"
                >
                  <option value="">–</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-5">
                <label className="text-xs text-gray-500 block mb-1">Remark</label>
                <select
                  value={rating.remark}
                  onChange={(e) => onTechnicalChange(i, 'remark', e.target.value)}
                  disabled={readOnly}
                  aria-label={`Remark for ${rating.skillName || 'skill'}`}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm disabled:bg-gray-50"
                >
                  <option value="">Select remark</option>
                  {REMARK_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={onAddTechnicalRow}
            className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add Row
          </button>
        )}
      </section>

      {/* Behavioral Evaluation */}
      {behavioralRatings.length > 0 && (
        <section>
          <h3 className="text-base font-semibold text-gray-800 mb-3">Behavioral Evaluation</h3>
          <div className="space-y-3">
            {behavioralRatings.map((area, i) => (
              <div key={area.areaId || i} className="grid grid-cols-12 gap-3 items-start">
                <div className="col-span-4">
                  <p className="text-sm font-medium text-gray-800 py-1.5">{area.areaName}</p>
                </div>
                <div className="col-span-3">
                  <select
                    value={area.rating ?? ''}
                    onChange={(e) => onBehavioralChange(i, 'rating', Number(e.target.value))}
                    disabled={readOnly}
                    aria-label={`Behavioral rating for ${area.areaName}`}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm disabled:bg-gray-50"
                  >
                    <option value="">–</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-5">
                  <select
                    value={area.remark}
                    onChange={(e) => onBehavioralChange(i, 'remark', e.target.value)}
                    disabled={readOnly}
                    aria-label={`Behavioral remark for ${area.areaName}`}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm disabled:bg-gray-50"
                  >
                    <option value="">Select remark</option>
                    {REMARK_OPTIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
