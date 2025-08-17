'use client'

import { useState } from 'react'
import FoundStep1 from './steps/FoundStep1'
import FoundStep2 from './steps/FoundStep2'
import FoundStep3 from './steps/FoundStep3'
import FoundSuccessScreen from './steps/FoundSuccessScreen'
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
  const [feedback, setFeedback] = useState('')
  
  // Step 3 form fields
  const [has_lawyer, setHasLawyer] = useState<boolean | null>(null)
  const [visa, setVisa] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [showSuccessScreen, setShowSuccessScreen] = useState(false)

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

  // Handle step 2 continue
  const handleStep2Continue = async () => {
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
            feedback
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.field && errorData.message) {
          setError(`${errorData.field}: ${errorData.message}`)
        } else {
          throw new Error(errorData.error || 'Failed to save your feedback')
        }
        return
      }

      const data: ProgressResponse = await response.json()
      setCancellationId(data.cancellationId)
      setStep(3)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle step 3 continue
  const handleStep3Continue = async () => {
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
            has_lawyer,
            visa: visa.trim()
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.field && errorData.message) {
          setError(`${errorData.field}: ${errorData.message}`)
        } else {
          throw new Error(errorData.error || 'Failed to save your visa information')
        }
        return
      }

      const data: ProgressResponse = await response.json()
      setCancellationId(data.cancellationId)
      // Show success screen
      console.log('Setting showSuccessScreen to true')
      setShowSuccessScreen(true)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle finish button click
  const handleFinish = () => {
    onClose()
  }

  if (!isOpen) return null

  // Debug logging
  console.log('Modal state:', { flow, step, showSuccessScreen, has_lawyer })

  return (
    <>
      {/* Confetti Animation */}
      <Confetti isActive={showConfetti} />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center md:items-center">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        />
        
        {/* Modal */}
        <div className={`relative bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:mx-4 md:mt-0 mt-auto h-[85vh] md:h-auto flex flex-col overflow-hidden ${
          flow === 'found' && step === 1 ? 'md:max-w-6xl' : 'md:max-w-4xl'
        }`}>
          {/* Title and Close button */}
          <div className="relative pt-7 pb-4 md:pb-4 md:pt-7 border-b border-gray-300 flex-shrink-0">
            {/* Back button - show when in flow but not on success screen - Desktop only */}
            {flow && !showSuccessScreen && (
              <button
                onClick={() => {
                  if (step === 1) {
                    // Go back to initial screen
                    setFlow(null)
                    setStep(1)
                    setCancellationId(null)
                    setFoundWithMM(null)
                    setRolesAppliedBucket(null)
                    setCompaniesEmailedBucket(null)
                    setInterviewsBucket(null)
                    setFeedback('')
                    setHasLawyer(null)
                    setVisa('')
                    setError(null)
                  } else {
                    // Go back to previous step
                    setStep((step - 1) as 1 | 2 | 3)
                  }
                }}
                className="hidden md:flex absolute top-6 md:top-5 left-4 z-10 p-1 text-gray-600 hover:text-gray-800 transition-colors font-dm-sans items-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="ml-1">Back</span>
              </button>
            )}

            {/* Title and Progress - Different for success screen */}
            {showSuccessScreen ? (
              // Success Screen Header
              <div className="flex flex-col md:flex-row items-start md:items-center justify-start md:justify-center text-left md:text-center md:gap-4">
                <h1 className="text-gray-800 text-md ml-4 md:text-sm font-semibold font-dm-sans text-left md:text-center">
                  Subscription Cancelled
                </h1>
                
                {/* Progress indicator */}
                <div className="flex items-center gap-1.5 ml-4 md:ml-0">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-6 rounded-full bg-[#4ABF71]"></span>
                    <span className="h-2 w-6 rounded-full bg-[#4ABF71]"></span>
                    <span className="h-2 w-6 rounded-full bg-[#4ABF71]"></span>
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </div>
            ) : (
              // Regular Flow Header
              <div className="flex flex-col md:flex-row items-start md:items-center justify-start md:justify-center text-left md:text-center md:gap-4">
                <h1 className="text-gray-800 text-md ml-4 md:text-sm font-semibold font-dm-sans text-left md:text-center">
                  Subscription Cancellation
                </h1>
                
                {/* Progress indicator - show when in flow */}
                {flow && (
                  <div className="flex flex-row items-center gap-3 mt-3 md:mt-0 ml-4 md:ml-0">
                    <span className={`h-2 w-6 rounded-full ${step === 1 ? 'bg-stone-400' : step > 1 ? 'bg-[#4ABF71]' : 'bg-stone-200'}`} />
                    <span className={`h-2 w-6 rounded-full ${step === 2 ? 'bg-stone-400' : step > 2 ? 'bg-[#4ABF71]' : 'bg-stone-200'}`} />
                    <span className={`h-2 w-6 rounded-full ${step === 3 ? 'bg-stone-400' : step > 3 ? 'bg-[#4ABF71]' : 'bg-stone-200'}`} />
                    <span className="text-sm text-gray-600">Step {step} of 3</span>
                  </div>
                )}
              </div>
            )}

            {/* Close button - show when in flow but not on success screen */}
            {flow && !showSuccessScreen && (
              <button
                onClick={onClose}
                className="absolute top-6 md:top-5 right-4 z-10 p-1 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Close button for success screen */}
            {showSuccessScreen && (
              <button
                onClick={handleFinish}
                className="absolute top-6 md:top-5 right-4 z-10 p-1 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Error message below header */}
          {error && !showSuccessScreen && (
            <div className="px-4 py-2">
              <p className="text-red-600 text-sm font-medium text-center font-dm-sans">{error}</p>
            </div>
          )}

          {/* HR tag and Back button below title - Mobile only */}
          {flow && !showSuccessScreen && (
            <>
              <div className="block md:hidden p-4 pb-2 flex-shrink-0">
                <button
                  onClick={() => {
                    if (step === 1) {
                      // Go back to initial screen
                      setFlow(null)
                      setStep(1)
                      setCancellationId(null)
                      setFoundWithMM(null)
                      setRolesAppliedBucket(null)
                      setCompaniesEmailedBucket(null)
                      setInterviewsBucket(null)
                      setFeedback('')
                      setHasLawyer(null)
                      setVisa('')
                      setError(null)
                    } else {
                      // Go back to previous step
                      setStep((step - 1) as 1 | 2 | 3)
                    }
                  }}
                  className="flex items-center text-gray-600 hover:text-gray-800 transition-colors font-dm-sans"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back</span>
                </button>
              </div>
            </>
          )}

          {/* Content Section - Scrollable on mobile, fixed on desktop */}
          <div className="flex-1 overflow-y-auto">
            {/* Mobile Image Section - Top - Hidden for Found Flow Steps and Success Screen */}
            <div className={`${
              showSuccessScreen 
                ? 'hidden' 
                : flow === 'found' && (step === 1 || step === 2 || step === 3)
                ? 'hidden' 
                : 'block'
            } md:hidden w-full h-44 relative p-4`}>
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
              <div className="flex-1 p-4 md:p-4 md:pr-2">
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
                          className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-500 text-base md:text-sm font-semibold rounded-lg hover:bg-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-dm-sans"
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
                  ) : flow === 'found' && step === 2 ? (
                    // Found Flow - Step 2
                    <FoundStep2
                      feedback={feedback}
                      onChangeFeedback={setFeedback}
                      onContinue={handleStep2Continue}
                      saving={isSubmitting}
                      error={error}
                    />
                  ) : flow === 'found' && step === 3 && !showSuccessScreen ? (
                    // Found Flow - Step 3
                    <FoundStep3
                      found_through_mm={found_with_mm || false}
                      has_lawyer={has_lawyer}
                      onChangeHasLawyer={setHasLawyer}
                      visa={visa}
                      onChangeVisa={setVisa}
                      onContinue={handleStep3Continue}
                      saving={isSubmitting}
                      error={error}
                    />
                  ) : showSuccessScreen ? (
                    // Success Screen
                    <FoundSuccessScreen
                      has_lawyer={has_lawyer}
                      onFinish={handleFinish}
                    />
                  ) : (
                    // Placeholder for other steps
                    <div className="text-center py-8">
                      <p className="text-gray-600 font-dm-sans">Step {step} - Coming soon...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop Right section - Image - Hidden on mobile for Found Flow Steps, visible for success screen */}
              <div className={`${
                showSuccessScreen 
                  ? 'hidden md:block' 
                  : flow === 'found' && (step === 1 || step === 2 || step === 3)
                  ? 'hidden md:block' 
                  : 'hidden md:block'
              } flex-shrink-0 p-3 ${
                showSuccessScreen 
                  ? 'md:w-[350px]' : flow === 'found' && step === 1 
                  ? 'md:w-[450px]' : flow === 'found' && step === 2
                  ? 'md:w-[400px]'
                  : 'md:w-[350px]'
              }`}>
                <div className={`relative p-2 h-full ${
                  showSuccessScreen 
                    ? 'min-h-[350px] max-h-[400px]' : flow === 'found' && step === 1 
                    ? 'min-h-[500px] max-h-[625px]' : flow === 'found' && step === 2
                    ? 'min-h-[370px] max-h-[380px]'
                    : 'min-h-[325px] max-h-[325px]'
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
