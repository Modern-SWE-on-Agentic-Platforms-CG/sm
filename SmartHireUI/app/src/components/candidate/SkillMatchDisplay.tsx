/**
 * T168 - SkillMatchDisplay: Shows matching vs lagging skills with visualization
 */
import React from 'react'
import type { SkillMatch } from '@appTypes/candidate'

interface SkillMatchDisplayProps {
  skillMatch: SkillMatch | null | undefined
}

export const SkillMatchDisplay: React.FC<SkillMatchDisplayProps> = ({ skillMatch }) => {
  if (!skillMatch) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Skill Match Analysis</h3>
        <p className="text-sm text-gray-500">No skill match data available.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Match Analysis</h3>

      {/* Match Percentage */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Match</span>
          <span className="text-lg font-bold text-blue-600">{skillMatch.matchPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${skillMatch.matchPercentage}%` }}
          />
        </div>
      </div>

      {/* Three Columns */}
      <div className="grid grid-cols-3 gap-4">
        {/* Matching Skills */}
        <div>
          <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-600 rounded-full" />
            Matching Skills ({skillMatch.matchingSkills.length})
          </h4>
          <div className="space-y-2">
            {skillMatch.matchingSkills.length === 0 ? (
              <p className="text-xs text-gray-500">No matching skills</p>
            ) : (
              skillMatch.matchingSkills.map((skill) => (
                <span key={skill} className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs rounded-lg border border-green-200">
                  {skill}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Lagging Skills */}
        <div>
          <h4 className="text-sm font-semibold text-orange-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-600 rounded-full" />
            Lagging Skills ({skillMatch.laggingSkills.length})
          </h4>
          <div className="space-y-2">
            {skillMatch.laggingSkills.length === 0 ? (
              <p className="text-xs text-gray-500">No lagging skills</p>
            ) : (
              skillMatch.laggingSkills.map((skill) => (
                <span key={skill} className="inline-block px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-lg border border-orange-200">
                  {skill}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Resume Extracted Skills */}
        <div>
          <h4 className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full" />
            Resume Skills ({skillMatch.resumeExtractedSkills.length})
          </h4>
          <div className="space-y-2">
            {skillMatch.resumeExtractedSkills.length === 0 ? (
              <p className="text-xs text-gray-500">No skills extracted</p>
            ) : (
              skillMatch.resumeExtractedSkills.map((skill) => (
                <span key={skill} className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-200">
                  {skill}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
