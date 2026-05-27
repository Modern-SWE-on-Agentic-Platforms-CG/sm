/**
 * T176 - TodayInterviewsTable: Table of scheduled interviews for the day
 */
import React from 'react'

export interface TodayInterview {
  id: string
  candidateName: string
  contact: string
  time: string
  totalExperience: number
  skills: string[]
  interviewType: string
}

interface TodayInterviewsTableProps {
  interviews: TodayInterview[]
  isLoading?: boolean
}

export const TodayInterviewsTable: React.FC<TodayInterviewsTableProps> = ({
  interviews,
  isLoading,
}) => {
  if (isLoading) {
    return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>
  }

  if (interviews.length === 0) {
    return <div className="text-center py-8 text-sm text-gray-500">No interviews scheduled for today</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs">Time</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs">Candidate</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs">Contact</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs">Experience</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs">Skills</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs">Interview Type</th>
          </tr>
        </thead>
        <tbody>
          {interviews.map((interview) => (
            <tr key={interview.id} className="hover:bg-gray-50 border-b border-gray-200">
              <td className="px-4 py-3 font-semibold text-gray-900">{interview.time}</td>
              <td className="px-4 py-3 text-gray-900">{interview.candidateName}</td>
              <td className="px-4 py-3 text-gray-600">{interview.contact}</td>
              <td className="px-4 py-3 text-gray-600">{interview.totalExperience} yrs</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {interview.skills.map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                  {interview.interviewType}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
