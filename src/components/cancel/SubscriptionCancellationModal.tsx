'use client'

import { useState, useEffect } from 'react'
import FoundStep1 from './steps/FoundStep1'
import FoundStep2 from './steps/FoundStep2'
import FoundStep3 from './steps/FoundStep3'
import FoundSuccessScreen from './steps/FoundSuccessScreen'
import NotFoundStep1 from './steps/NotFoundStep1'
import NotFoundStep2 from './steps/NotFoundStep2'
import NotFoundStep3 from './steps/NotFoundStep3'
import NotFoundSuccessScreen from './steps/NotFoundSuccessScreen'
import DownSellAccepted from './steps/DownSellAccepted'
import SuggestedDreamRoles from './steps/SuggestedDreamRoles';
import { ActivityBuckets } from './parts/ActivityBuckets'
import Confetti from './parts/Confetti'
import { useCancellationAPI } from '@/hooks/useCancellationAPI'
import { useCancellationState } from '@/hooks/useCancellationState'
import { getFlowStep, getModalWidth, getImageVisibility, getDesktopImageWidth } from '@/utils/flowNavigation'
import { SUBSCRIPTION_PRICE } from '@/constants/cancellation'

interface SubscriptionCancellationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SubscriptionCancellationModal({
  isOpen,
  onClose
}: SubscriptionCancellationModalProps) {
  const {
    isSubmitting,
    error,
    updateProgress,
    fetchActiveCancellation,
    clearError
  } = useCancellationAPI()

  const {
    flow,
    step,
    found_with_mm,
    roles_applied_bucket,
    companies_emailed_bucket,
    interviews_bucket,
    feedback,
    has_lawyer,
    visa,
    showConfetti,
    showSuccessScreen,
    downsell_variant,
    accepted_downsell,
    showSuggestedDreamRoles,
    subscriptionPrice,
    notFoundStep,
    showNotFoundSuccess,
    cancellationId,
    setFlow,
    setStep,
    setFoundWithMm,
    setRolesAppliedBucket,
    setCompaniesEmailedBucket,
    setInterviewsBucket,
    setFeedback,
    setHasLawyer,
    setVisa,
    setShowConfetti,
    setShowSuccessScreen,
    setDownsellVariant,
    setAcceptedDownsell,
    setShowSuggestedDreamRoles,
    setSubscriptionPrice,
    setNotFoundStep,
    setShowNotFoundSuccess,
    setCancellationId,
    resetFoundFlowState,
    resetNotFoundFlowState
  } = useCancellationState()

  // Fetch subscription data when NotFound flow starts
  useEffect(() => {
    if (flow === 'still' && !downsell_variant) {
      const fetchSubscriptionData = async () => {
        try {
          // Mock subscription data for now - in production this would fetch from API
          setSubscriptionPrice(SUBSCRIPTION_PRICE.DEFAULT)
        } catch (error) {
          console.error('Error fetching subscription data:', error)
          // Fallback to default values
          setSubscriptionPrice(SUBSCRIPTION_PRICE.DEFAULT)
        }
      }
      
      fetchSubscriptionData()
    }
  }, [flow, downsell_variant, setSubscriptionPrice])

  // Resume and prefill functionality - fetch active cancellation on mount
  useEffect(() => {
    if (isOpen && !flow && !cancellationId) {
      // Add a small delay to prevent rapid state changes
      const timeoutId = setTimeout(() => {
        const resumeActiveCancellation = async () => {
          try {
            const activeCancellation = await fetchActiveCancellation()
            
            if (!activeCancellation) {
              return
            }
            
            // Store cancellation ID and downsell variant
            setCancellationId(activeCancellation.id)
            setDownsellVariant(activeCancellation.downsell_variant)
            
            // Prefill all the fields from the database
            if (activeCancellation.found_with_mm !== null) {
              setFoundWithMm(activeCancellation.found_with_mm)
            }
            if (activeCancellation.roles_applied_bucket) {
              setRolesAppliedBucket(activeCancellation.roles_applied_bucket as any)
            }
            if (activeCancellation.companies_emailed_bucket) {
              setCompaniesEmailedBucket(activeCancellation.companies_emailed_bucket as any)
            }
            if (activeCancellation.interviews_bucket) {
              setInterviewsBucket(activeCancellation.interviews_bucket as any)
            }
            if (activeCancellation.feedback) setFeedback(activeCancellation.feedback)
            if (activeCancellation.has_lawyer !== null) setHasLawyer(activeCancellation.has_lawyer)
            if (activeCancellation.visa) setVisa(activeCancellation.visa)
            
            // Automatically set flow and step based on found_job - skip initial choice screen
            const flowStep = getFlowStep(
              activeCancellation.found_job,
              activeCancellation.downsell_variant,
              activeCancellation.accepted_downsell
            )
            
            if (flowStep.flow) {
              setFlow(flowStep.flow)
              if (flowStep.step) setStep(flowStep.step as 1 | 2 | 3)
              if (flowStep.notFoundStep) setNotFoundStep(flowStep.notFoundStep as 1 | 2 | 3)
            }
            
            if (activeCancellation.accepted_downsell !== null) {
              setAcceptedDownsell(activeCancellation.accepted_downsell)
            }
            
          } catch (error) {
            console.error('Error resuming active cancellation:', error)
          }
        }
        
        resumeActiveCancellation()
      }, 100); // Small delay to prevent rapid state changes
      
      // Cleanup timeout if component unmounts or dependencies change
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, flow, cancellationId, fetchActiveCancellation, setCancellationId, setDownsellVariant, setFoundWithMm, setRolesAppliedBucket, setCompaniesEmailedBucket, setInterviewsBucket, setFeedback, setHasLawyer, setVisa, setFlow, setStep, setNotFoundStep, setAcceptedDownsell])

  // Handle user choice submission
  const handleChoice = async (foundJob: boolean) => {
    try {
      // Always make API call to update found_job, whether creating new or updating existing
      const data = await updateProgress({
        found_job: foundJob,
        // Clear irrelevant fields when switching to Found Job flow
        ...(foundJob && {
          reason: null,
          feedback: null,
          accepted_downsell: null
        })
      })

      if (!data) return

      setCancellationId(data.cancellationId)
      
      // Extract downsell variant if it exists in the response
      if (data.saved?.downsell_variant) {
        setDownsellVariant(data.saved.downsell_variant as 'A' | 'B')
      }
      
      // Set flow and move to step 1
      setFlow(foundJob ? 'found' : 'still')
      if (foundJob) {
        setStep(1)
        // Clear irrelevant fields for Found Job flow
        setFeedback('')
        setAcceptedDownsell(null)
        // Note: reason is not stored in local state, only in database
      } else {
        setNotFoundStep(1)
      }
      clearError()
      
      // Trigger confetti if user found a job
      if (foundJob) {
        setShowConfetti(true)
        // Hide confetti after animation
        setTimeout(() => setShowConfetti(false), 4000)
      }
      
    } catch (err) {
      console.error('Error in handleChoice:', err)
    }
  }

  // Handle step 1 continue
  const handleStep1Continue = async () => {
    if (!cancellationId) return
    
    try {
      // Only send the fields relevant to step 1
      const patchData: any = {}
      
      if (found_with_mm !== null) patchData.found_with_mm = found_with_mm
      if (roles_applied_bucket) patchData.roles_applied_bucket = roles_applied_bucket
      if (companies_emailed_bucket) patchData.companies_emailed_bucket = companies_emailed_bucket
      if (interviews_bucket) patchData.interviews_bucket = interviews_bucket

      console.log('=== STEP 1 DEBUG ===')
      console.log('cancellationId:', cancellationId)
      console.log('found_with_mm type:', typeof found_with_mm)
      console.log('found_with_mm value:', found_with_mm)
      console.log('Step 1 data being sent:', patchData)
      console.log('Current found_with_mm state:', found_with_mm)
      console.log('All current state:', {
        found_with_mm,
        roles_applied_bucket,
        companies_emailed_bucket,
        interviews_bucket
      })

      const data = await updateProgress(patchData)

      if (!data) return

      console.log('=== API RESPONSE ===')
      console.log('Full API response:', data)
      console.log('Saved data:', data.saved)
      console.log('found_with_mm in response:', data.saved?.found_with_mm)
      
      if (data.cancellationId) {
        setCancellationId(data.cancellationId)
      }

      // Update local state with the saved data from API response
      if (data.saved) {
        console.log('Updating local state with saved data...')
        if (data.saved.found_with_mm !== undefined) {
          console.log('Setting found_with_mm to:', data.saved.found_with_mm)
          setFoundWithMm(data.saved.found_with_mm)
        }
        if (data.saved.roles_applied_bucket !== undefined) {
          console.log('Setting roles_applied_bucket to:', data.saved.roles_applied_bucket)
          setRolesAppliedBucket(data.saved.roles_applied_bucket as any)
        }
        if (data.saved.companies_emailed_bucket !== undefined) {
          console.log('Setting companies_emailed_bucket to:', data.saved.companies_emailed_bucket)
          setCompaniesEmailedBucket(data.saved.companies_emailed_bucket as any)
        }
        if (data.saved.interviews_bucket !== undefined) {
          console.log('Setting interviews_bucket to:', data.saved.interviews_bucket)
          setInterviewsBucket(data.saved.interviews_bucket as any)
        }
      }

      console.log('State after update:', {
        found_with_mm,
        roles_applied_bucket,
        companies_emailed_bucket,
        interviews_bucket
      })

      // Move to step 2
      setStep(2)
      clearError()
      
    } catch (err) {
      console.error('Error in handleStep1Continue:', err)
    }
  }

  // Handle step 2 continue
  const handleStep2Continue = async () => {
    if (!cancellationId) return
    
    try {
      // Only send the fields relevant to step 2
      const patchData: any = {}
      
      if (feedback.trim()) patchData.feedback = feedback.trim()
      if (has_lawyer !== null) patchData.has_lawyer = has_lawyer

      const data = await updateProgress(patchData)

      if (!data) return

      if (data.cancellationId) {
        setCancellationId(data.cancellationId)
      }

      // Move to step 3
      setStep(3)
      clearError()
      
    } catch (err) {
      console.error('Error in handleStep2Continue:', err)
    }
  }

  // Handle step 3 continue
  const handleStep3Continue = async () => {
    if (!cancellationId) return
    
    try {
      // Only send the fields relevant to step 3
      const patchData: any = {}
      
      if (has_lawyer !== null) patchData.has_lawyer = has_lawyer
      if (visa.trim()) patchData.visa = visa.trim()

      const data = await updateProgress(patchData)

      if (!data) return

      if (data.cancellationId) {
        setCancellationId(data.cancellationId)
      }

      // Show success screen
      setShowSuccessScreen(true)
      clearError()
      
    } catch (err) {
      console.error('Error in handleStep3Continue:', err)
    }
  }

  // NotFound Flow Handlers
  const handleAcceptDownsell = async () => {
    try {
      const data = await updateProgress({
        accepted_downsell: true
      })

      if (!data) return

      if (data.cancellationId) {
        setCancellationId(data.cancellationId)
      }
      
      setAcceptedDownsell(true)
      // Don't change notFoundStep here, just set accepted_downsell
    } catch (error) {
      console.error('Error accepting downsell:', error)
    }
  }

  const handleDeclineDownsell = async () => {
    try {
      const data = await updateProgress({
        accepted_downsell: false
      })

      if (!data) return

      if (data.cancellationId) {
        setCancellationId(data.cancellationId)
      }
      
      setAcceptedDownsell(false)
      setNotFoundStep(2)
    } catch (error) {
      console.error('Error declining downsell:', error)
    }
  }

  const handleNotFoundContinue = async () => {
    if (!cancellationId) return
    
    try {
      // Only send the fields relevant to this step
      const patchData: any = {}
      
      if (roles_applied_bucket) patchData.roles_applied_bucket = roles_applied_bucket
      if (companies_emailed_bucket) patchData.companies_emailed_bucket = companies_emailed_bucket
      if (interviews_bucket) patchData.interviews_bucket = interviews_bucket

      const data = await updateProgress(patchData)

      if (!data) return

      if (data.cancellationId) {
        setCancellationId(data.cancellationId)
      }

      // Move to step 3
      setNotFoundStep(3)
      clearError()
      
    } catch (err) {
      console.error('Error in handleNotFoundContinue:', err)
    }
  }

  const handleNotFoundStep2Continue = () => {
    setShowSuggestedDreamRoles(true);
  }

  const handleNotFoundStep3Continue = async (reason: string, feedback: string) => {
    if (!cancellationId) {
      return;
    }
    
    try {
      const data = await updateProgress({
        reason,
        feedback
      })

      if (!data) return

      // Show success screen instead of closing modal
      setShowNotFoundSuccess(true)
      
    } catch (err) {
      console.error('API call error:', err)
    }
  }

  const handleFinish = () => {
    onClose()
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
        />
        
        {/* Modal */}
        <div className={`relative bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:mx-4 md:mt-0 mt-auto flex flex-col overflow-hidden ${
          showSuggestedDreamRoles ? 'h-screen md:h-auto' : 'h-[85vh] md:h-auto'
        } ${getModalWidth(flow, step, notFoundStep, showSuccessScreen, showNotFoundSuccess, Boolean(accepted_downsell), showSuggestedDreamRoles)} ${showSuggestedDreamRoles ? 'md:max-h-[90vh]' : ''}`}>
          {/* Title and Close button */}
          <div className="relative pt-7 pb-4 md:pb-4 md:pt-7 border-b border-gray-300 flex-shrink-0">
            {/* Back button - show when in flow but not on success screen - Desktop only */}
            {flow && !showSuccessScreen && !showNotFoundSuccess && !Boolean(accepted_downsell) && !showSuggestedDreamRoles && (
              <button
                onClick={async () => {
                  if (flow === 'found' && step === 1) {
                    // Found Flow Step-1: Set found_job to null and go back to initial screen
                    try {
                      const data = await updateProgress({
                        found_job: null
                      })

                      if (data) {
                        // Reset to initial choice screen
                        resetFoundFlowState()
                      }
                    } catch (error) {
                      console.error('Error updating found_job:', error)
                      // Still reset to initial screen even if API call fails
                      resetFoundFlowState()
                    }
                  } else if (flow === 'still' && notFoundStep === 1) {
                    // NotFound Flow Step-1: Set found_job to null and go back to initial screen
                    try {
                      const data = await updateProgress({
                        found_job: null
                      })

                      if (data) {
                        // Reset to initial choice screen
                        resetNotFoundFlowState()
                      }
                    } catch (error) {
                      console.error('Error updating found_job:', error)
                      // Still reset to initial screen even if API call fails
                      resetNotFoundFlowState()
                    }
                  } else if (flow === 'found' && step > 1) {
                    setStep((step - 1) as 1 | 2 | 3)
                  } else if (flow === 'still' && notFoundStep > 1) {
                    // Go back to previous step for all variants
                    setNotFoundStep((notFoundStep - 1) as 1 | 2 | 3)
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
            {showSuccessScreen || showNotFoundSuccess ? (
              // Success Screen Header
              <div className="flex flex-col md:flex-row items-start md:items-center justify-start md:justify-center text-left md:text-center">
                <h1 className="text-gray-800 text-md ml-4 md:text-sm font-semibold font-dm-sans text-left md:text-center">
                  {showNotFoundSuccess ? 'Subscription Cancelled' : 'Subscription Cancelled'}
                </h1>
                
                {/* Progress indicator */}
                <div className="flex items-center gap-1.5 ml-4 md:ml-4">
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
              <div className="flex flex-col md:flex-row items-start md:items-center justify-start md:justify-center text-left md:text-center ml-4">
                {/* Title */}
                <h1 className={`font-bold text-gray-900 font-dm-sans text-sm text-left`}>
                  {flow === 'still' && (notFoundStep > 1 || Boolean(accepted_downsell)) ? 'Subscription' : 'Subscription Cancellation'}
                </h1>
                
                {/* Progress indicator - show when in flow */}
                {flow && (
                  <div className="flex flex-row items-center gap-3 mt-3 md:mt-0 md:ml-4 md:ml-0">
                    {flow === 'found' ? (
                      // Found Flow Progress
                      <>
                        <span className={`h-2 w-6 rounded-full ${step === 1 ? 'bg-stone-400' : step > 1 ? 'bg-[#4ABF71]' : 'bg-stone-200'}`} />
                        <span className={`h-2 w-6 rounded-full ${step === 2 ? 'bg-stone-400' : step > 2 ? 'bg-[#4ABF71]' : 'bg-stone-200'}`} />
                        <span className={`h-2 w-6 rounded-full ${step === 3 ? 'bg-stone-400' : step > 3 ? 'bg-[#4ABF71]' : 'bg-stone-200'}`} />
                        <span className="text-sm text-gray-600">Step {step} of 3</span>
                      </>
                    ) : (
                      // NotFound Flow Progress - hide when accepted_downsell is true
                      !Boolean(accepted_downsell) && (
                        <>
                          <span className={`h-2 w-6 rounded-full ${notFoundStep === 1 ? 'bg-stone-400' : notFoundStep > 1 ? 'bg-[#4ABF71]' : 'bg-stone-200'}`} />
                          <span className={`h-2 w-6 rounded-full ${notFoundStep === 2 ? 'bg-stone-400' : notFoundStep > 2 ? 'bg-[#4ABF71]' : 'bg-stone-200'}`} />
                          <span className={`h-2 w-6 rounded-full ${notFoundStep === 3 ? 'bg-stone-400' : notFoundStep > 3 ? 'bg-[#4ABF71]' : 'bg-stone-200'}`} />
                          <span className="text-sm text-gray-600">
                            {`Step ${notFoundStep} of 3`}
                          </span>
                        </>
                      )
                    )}
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
            {(showSuccessScreen || showNotFoundSuccess) && (
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
          {error && !showSuccessScreen && !showNotFoundSuccess && (
            <div className="px-4 py-2">
              <p className="text-red-600 text-sm font-medium text-center font-dm-sans">{error}</p>
            </div>
          )}

          {/* HR tag and Back button below title - Mobile only */}
          {flow && !showSuccessScreen && !showNotFoundSuccess && !Boolean(accepted_downsell) && !showSuggestedDreamRoles && (
            <>
              <div className="block md:hidden p-4 pb-2 flex-shrink-0">
                <button
                  onClick={async () => {
                    if (flow === 'found') {
                      if (step === 1) {
                        // Found Flow Step-1: Set found_job to null and go back to initial screen
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
                              patch: {
                                found_job: null
                              }
                            })
                          })

                          if (response.ok) {
                            // Reset to initial choice screen
                            setFlow(null)
                            setStep(1)
                            setCancellationId(null)
                            setFoundWithMm(null)
                            setRolesAppliedBucket(null)
                            setCompaniesEmailedBucket(null)
                            setInterviewsBucket(null)
                            setFeedback('')
                            setHasLawyer(null)
                            setVisa('')
                            clearError()
                          }
                        } catch (error) {
                          console.error('Error updating found_job:', error)
                          // Still reset to initial screen even if API call fails
                          resetFoundFlowState()
                        }
                      } else {
                        // Go back to previous step
                        setStep((step - 1) as 1 | 2 | 3)
                      }
                    } else if (flow === 'still') {
                      if (Boolean(accepted_downsell)) {
                        // Go back to offer screen
                        setAcceptedDownsell(null)
                      } else if (notFoundStep === 1) {
                        // NotFound Flow Step-1: Set found_job to null and go back to initial screen
                        try {
                          const data = await updateProgress({
                            found_job: null
                          })

                          if (data) {
                            // Reset to initial choice screen
                            resetNotFoundFlowState()
                          }
                        } catch (error) {
                          console.error('Error updating found_job:', error)
                          // Still reset to initial screen even if API call fails
                          resetNotFoundFlowState()
                        }
                      } else if (notFoundStep === 2 && downsell_variant === 'A') {
                        // For variant A, going back from Step-2 should go to initial screen, not Step-1
                        resetNotFoundFlowState()
                      } else {
                        // Go back to previous step
                        setNotFoundStep((notFoundStep - 1) as 1 | 2 | 3)
                      }
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
              getImageVisibility(flow, step, notFoundStep, showSuccessScreen, accepted_downsell, showSuggestedDreamRoles, showNotFoundSuccess)
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
              <div className={`flex-1 p-4 md:p-4 md:pr-2 ${
                showSuggestedDreamRoles ? 'h-full flex flex-col' : ''
              }`}>
                <div className={`w-full max-w-none ${
                  showSuggestedDreamRoles ? 'h-full flex flex-col' : ''
                }`}>
                  
                  {!flow ? (
                    // Initial choice screen - show when no flow set (regardless of cancellationId)
                    (() => {
                      return (
                        <>
                          {/* Close button for initial modal */}
                          <div className="absolute top-6 md:top-5 right-4 z-10">
                            <button
                              onClick={onClose}
                              className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          
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
                          <div className="space-y-2 md:static fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4 md:p-0 md:shadow-none md:border-none">
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
                      );
                    })()
                  ) : flow === 'found' && step === 1 ? (
                    // Found Flow - Step 1
                    (() => {
                      
                      return (
                        <FoundStep1
                          found_with_mm={found_with_mm}
                          onChangeFoundWithMM={setFoundWithMm}
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
                      );
                    })()
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
                      found_with_mm={found_with_mm || false}
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
                  ) : flow === 'still' ? (
                    // NotFound Flow - Render based on state
                    (() => {
                      
                      if (showNotFoundSuccess) {
                        return (
                          <NotFoundSuccessScreen
                            onBackToJobs={onClose}
                          />
                        );
                      } else if (showSuggestedDreamRoles) {
                        return (
                          <SuggestedDreamRoles
                            onContinue={() => handleNotFoundStep3Continue('', '')}
                            onClose={onClose}
                          />
                        );
                      } else if (Boolean(accepted_downsell)) {
                        return (
                          <DownSellAccepted
                            onContinue={handleNotFoundStep2Continue}
                            daysLeft={30} // Placeholder, as daysLeft is removed
                            nextBillingDate={''} // Placeholder, as nextBillingDate is removed
                          />
                        );
                      } else if (notFoundStep === 1) {
                        return (
                          <NotFoundStep1
                            onAcceptDownsell={handleAcceptDownsell}
                            onDeclineDownsell={handleDeclineDownsell}
                            saving={isSubmitting}
                          />
                        );
                      } else if (notFoundStep === 2) {
                        return (
                          <NotFoundStep2
                            roles_applied_bucket={roles_applied_bucket}
                            companies_emailed_bucket={companies_emailed_bucket}
                            interviews_bucket={interviews_bucket}
                            onChangeRolesApplied={setRolesAppliedBucket}
                            onChangeCompaniesEmailed={setCompaniesEmailedBucket}
                            onChangeInterviews={setInterviewsBucket}
                            onContinue={handleNotFoundContinue}
                            onGetDiscount={handleAcceptDownsell}
                            saving={isSubmitting}
                            error={error}
                          />
                        );
                      } else if (notFoundStep === 3) {
                        return (
                          <NotFoundStep3
                            onContinue={handleNotFoundStep3Continue}
                            onGetDiscount={handleAcceptDownsell}
                            saving={isSubmitting}
                          />
                        );
                      } else {
                        return (
                          <div className="space-y-6 bg-red-100 p-6 rounded-lg border-2 border-red-400">
                            <h3 className="text-lg font-bold text-red-800">Error: Invalid NotFound Flow State</h3>
                            <p className="text-sm text-red-700">Please refresh the page and try again.</p>
                          </div>
                        );
                      }
                    })()
                  ) : null}
                </div>
              </div>

              {/* Desktop Right section - Image - Hidden on mobile for Found Flow Steps, visible for success screen */}
              <div className={`hidden md:block ${
                getDesktopImageWidth(flow, step, notFoundStep, showSuccessScreen, accepted_downsell, showSuggestedDreamRoles, showNotFoundSuccess)
              } flex-shrink-0 p-3`}>
                <div className="h-full flex flex-col">
                  <div className="flex-1 relative">
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
      </div>
    </>
  )
}
