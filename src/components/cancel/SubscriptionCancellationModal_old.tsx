'use client'

import { useState } from 'react'
import FoundStep1 from './steps/FoundStep1'

interface SubscriptionCancellationModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ProgressResponse {
  cancellationId: string
  saved: {
    found_job: boolean
  }
}

export default function SubscriptionCancellationModal({
  isOpen,
  onClose
}: SubscriptionCancellationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cancellationId, setCancellationId] = useState<string | null>(null)
  
  // Flow state management
  const [flow, setFlow] = useState<'found' | 'still' | null>(null)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  
  // Step 1 form fields
  const [found_with_mm, setFoundWithMM] = useState<boolean | null>(null)
  const [roles_applied_bucket, setRolesAppliedBucket] = useState<'0' | '1-5' | '6-20' | '20+' | null>(null)
  const [companies_emailed_bucket, setCompaniesEmailedBucket] = useState<'0' | '1-5' | '6-20' | '20+' | null>(null)
  const [interviews_bucket, setInterviewsBucket] = useState<'0' | '1-2' | '3-5' | '5+' | null>(null)

  // Handle user choice submission
  const handleChoice = async (foundJob: boolean) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/cancel/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add CSRF token if available
          ...(document.cookie.includes('csrf-token') && {
            'x-csrf-token': document.cookie
              .split('; ')
              .find(row => row.startsWith('csrf-token='))
              ?.split('=')[1] || ''
          })
        },
        body: JSON.stringify({
          cancellation_id: cancellationId,
          patch: {
            found_job: foundJob
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save your choice')
      }

      const data: ProgressResponse = await response.json()
      setCancellationId(data.cancellationId)
      
      // Set flow and move to step 1
      setFlow(foundJob ? 'found' : 'still')
      setStep(1)
      setError(null)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle step 1 continue
  const handleStep1Continue = async () => {
    if (!cancellationId) return
    
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/cancel/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(document.cookie.includes('csrf-token') && {
            'x-csrf-token': document.cookie
              .split('; ')
              .find(row => row.startsWith('csrf-token='))
              ?.split('=')[1] || ''
          })
        },
        body: JSON.stringify({
          cancellation_id: cancellationId,
          patch: {
            found_with_mm,
            roles_applied_bucket,
            companies_emailed_bucket,
            interviews_bucket
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save your answers')
      }

      // Move to step 2
      setStep(2)
      setError(null)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:items-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:max-w-5xl md:mx-4 overflow-hidden md:mt-0 mt-auto h-[85vh] md:h-auto">
                {/* Title and Close button */}
        <div className="relative pt-7 pb-5 md:pt-4 md:pb-2 border-b border-gray-300">
          {/* Back button (only show in steps) */}
          {step > 1 && (
            <button
              onClick={() => setStep((step - 1) as 1 | 2 | 3)}
              className="absolute top-6 md:top-3 left-4 z-10 p-1 text-gray-600 hover:text-gray-800 transition-colors font-dm-sans"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="ml-1">Back</span>
            </button>
          )}
          
          <h1 className="text-gray-800 text-md ml-4 md:text-sm font-semibold font-dm-sans md:text-center">Subscription Cancellation</h1>
          
          {/* Error message below title */}
          {error && (
            <p className="text-red-600 text-sm font-medium text-center mt-2 font-dm-sans">{error}</p>
          )}
          
          {/* Progress indicator */}
          {flow && (
            <div className="absolute top-6 md:top-3 left-1/2 transform -translate-x-1/2 text-center">
              <p className="text-xs text-gray-600 font-dm-sans">Step {step} of 3</p>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3].map((stepNum) => (
                  <div
                    key={stepNum}
                    className={`w-2 h-2 rounded-full ${
                      stepNum <= step ? 'bg-gray-800' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
          
          <button
            onClick={onClose}
            className="absolute top-6 md:top-3 right-4 z-10 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col overflow-hidden p-0 md:p-1">
          {/* Mobile Image Section - Top */}
          <div className="block md:hidden w-full h-44 relative p-4">
            <img
              src="/image/empire-state-compressed.jpg"
              alt="New York City skyline with Empire State Building"
              className="w-full h-full object-cover rounded-lg shadow-2xl"
            />
          </div>

          {/* Content Section */}
          <div className="flex flex-col md:flex-row overflow-hidden">
            {/* Left section - Content and buttons */}
            <div className="flex-1 p-3 md:p-4">
              <div className="max-w-2xl md:max-w-xl">
              {/* Headline */}
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 font-dm-sans">
                Hey mate,
              </h2>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5 font-dm-sans">
                Quick one before you go.
              </h3>

              {/* Question */}
              <p className="text-2xl md:text-3xl font-bold italic text-gray-900 mb-6 font-dm-sans">
                Have you found a job yet?
              </p>

              {/* Description */}
              <p className="text-gray-600 text-sm md:text-sm font-semibold mb-4 leading-relaxed font-dm-sans">
                Whatever your answer, we just want to help you take the next step. With visa support, or by hearing how we can do better.
              </p>

              {/* Divider */}
              <hr className="border-gray-300 mb-4" />

              {/* Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => handleChoice(true)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-500 text-base md:text-sm font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-dm-sans"
                >
                  {isSubmitting ? 'Saving...' : 'Yes, I\'ve found a job'}
                </button>
                
                <button
                  onClick={() => handleChoice(false)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-500 text-base md:text-sm font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-dm-sans"
                >
                  {isSubmitting ? 'Saving...' : 'Not yet - I\'m still looking'}
                </button>
              </div>

            </div>
          </div>

            {/* Desktop Right section - Image */}
            <div className="hidden md:block flex-shrink md:w-[400px] md:max-w-[40%] md:min-w-[200px] self-stretch">
              <div className="h-[350px] relative p-4">
                <img
                  src="/image/empire-state-compressed.jpg"
                  alt="New York City skyline with Empire State Building"
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
