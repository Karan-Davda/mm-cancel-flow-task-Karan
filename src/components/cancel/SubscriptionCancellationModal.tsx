'use client'

import { useState } from 'react'
import FoundStep1 from './steps/FoundStep1'
import Confetti from './parts/Confetti'
import { ActivityBuckets } from './parts/ActivityBuckets'

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
  
  // Confetti animation state
  const [showConfetti, setShowConfetti] = useState(false)

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
      
      // Trigger confetti if user found a job
      if (foundJob) {
        setShowConfetti(true)
        // Hide confetti after animation
        setTimeout(() => setShowConfetti(false), 4000)
      }
      
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
      // Ensure we send canonical tokens that match DB CHECKS
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
        // Handle field-specific errors
        if (errorData.field && errorData.message) {
          setError(`${errorData.field}: ${errorData.message}`)
        } else {
          throw new Error(errorData.error || 'Failed to save your answers')
        }
        return
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
    <>
      {/* Confetti Animation */}
      <Confetti isActive={showConfetti} />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center md:items-center">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className={`relative bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:mx-4 overflow-hidden md:mt-0 mt-auto h-[85vh] md:h-auto ${
          flow === 'found' && step === 1 ? 'md:max-w-6xl' : 'md:max-w-4xl'
        }`}>
          {/* Title and Close button */}
          <div className="relative pt-7 pb-4 md:pb-4 md:pt-7 border-b border-gray-300">
            {/* Back button - show when in flow */}
            {flow && (
              <button
                onClick={() => setStep((step - 1) as 1 | 2 | 3)}
                className="absolute top-6 md:top-5 left-4 z-10 p-1 text-gray-600 hover:text-gray-800 transition-colors font-dm-sans flex items-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="ml-1">Back</span>
              </button>
            )}
            
            {/* Title and Progress indicator side by side */}
            <div className="flex items-center justify-between md:justify-center md:gap-7">
              <h1 className="text-gray-800 text-md ml-4 md:text-sm font-semibold font-dm-sans">Subscription Cancellation</h1>
              
              {/* Progress indicator */}
              {flow && (
                <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-6 rounded-full bg-stone-400" />
                  <span className="h-2 w-6 rounded-full bg-stone-200" />
                  <span className="h-2 w-6 rounded-full bg-stone-200" />
                </div>
                <div className="text-sm text-gray-600">Step 1 of 3</div>
              </div>
              )}
            </div>
            
            {/* Error message below title */}
            {error && (
              <p className="text-red-600 text-sm font-medium text-center mt-2 font-dm-sans">{error}</p>
            )}
            
            <button
              onClick={onClose}
              className="absolute top-6 md:top-5 right-4 z-10 p-1 text-gray-400 hover:text-gray-600 transition-colors"
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
                style={{
                  boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3)'
                }}
              />
            </div>

            {/* Content Section */}
            <div className="flex flex-col md:flex-row overflow-hidden">
              {/* Left section - Content and buttons */}
              <div className="flex-1 p-4 md:p-4 md:pr-6">
                <div className="w-full max-w-none">
                  {!flow ? (
                    // Initial choice screen
                    <>
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
                    </>
                  ) : flow === 'found' && step === 1 ? (
                    // Found Flow - Step 1
                    <FoundStep1
                      found_with_mm={found_with_mm}
                      onChangeFoundWithMM={setFoundWithMM}
                      roles_applied_bucket={roles_applied_bucket}
                      companies_emailed_bucket={companies_emailed_bucket}
                      interviews_bucket={interviews_bucket}
                      onChangeRolesApplied={setRolesAppliedBucket}
                      onChangeCompaniesEmailed={setCompaniesEmailedBucket}
                      onChangeInterviews={setInterviewsBucket}
                      onContinue={handleStep1Continue}
                      saving={isSubmitting}
                      error={error}
                    />
                  ) : (
                    // Placeholder for other steps
                    <div className="text-center py-8">
                      <p className="text-gray-600 font-dm-sans">Step {step} - Coming soon...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop Right section - Image */}
              <div className={`hidden md:block flex-shrink-0 p-3 ${
                flow === 'found' && step === 1 
                  ? 'md:w-[450px]' 
                  : 'md:w-[350px]'
              }`}>
                <div className={`relative p-2 h-full ${
                  flow === 'found' && step === 1 ? 'min-h-[500px] max-h-[625px]' : 'min-h-[325px] max-h-[325px]'
                }`}>
                  <img
                    src="/image/empire-state-compressed.jpg"
                    alt="New York City skyline with Empire State Building"
                    className="w-full h-full object-cover rounded-lg shadow-2xl"
                    style={{
                      boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3)'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
