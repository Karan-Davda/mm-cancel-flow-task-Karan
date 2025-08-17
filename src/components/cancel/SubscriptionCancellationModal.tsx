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

interface SubscriptionCancellationModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ProgressResponse {
  success: boolean
  cancellationId: string
  saved: {
    id: string
    user_id: string
    subscription_id?: string
    downsell_variant?: 'A' | 'B'
    found_job?: boolean
    found_with_mm?: boolean
    roles_applied_bucket?: string
    companies_emailed_bucket?: string
    interviews_bucket?: string
    feedback?: string
    has_lawyer?: boolean
    visa?: string
    reason?: string
    accepted_downsell?: boolean
    created_at?: string
  }
}

export default function SubscriptionCancellationModal({
  isOpen,
  onClose
}: SubscriptionCancellationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cancellationId, setCancellationId] = useState<string | null>(null)
  
  // Found Job Flow State
  const [flow, setFlow] = useState<'found' | 'still' | null>(null)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [found_with_mm, setFoundWithMm] = useState<boolean | null>(null)
  const [roles_applied_bucket, setRolesAppliedBucket] = useState<'0' | '1-5' | '6-20' | '20+' | null>(null)
  const [companies_emailed_bucket, setCompaniesEmailedBucket] = useState<'0' | '1-5' | '6-20' | '20+' | null>(null)
  const [interviews_bucket, setInterviewsBucket] = useState<'0' | '1-2' | '3-5' | '5+' | null>(null)
  const [feedback, setFeedback] = useState('')
  const [has_lawyer, setHasLawyer] = useState<boolean | null>(null)
  const [visa, setVisa] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [showSuccessScreen, setShowSuccessScreen] = useState(false)

  // NotFound Flow State
  const [downsell_variant, setDownsellVariant] = useState<'A' | 'B' | null>(null)
  const [accepted_downsell, setAcceptedDownsell] = useState<boolean | null>(null)
  const [showSuggestedDreamRoles, setShowSuggestedDreamRoles] = useState(false);
  const [subscriptionPrice, setSubscriptionPrice] = useState<number>(25)
  const [notFoundStep, setNotFoundStep] = useState<1 | 2 | 3>(1)
  const [showNotFoundSuccess, setShowNotFoundSuccess] = useState(false)

  // Debug state changes for activity buckets and found_with_mm
  useEffect(() => {
    console.log('State changed - Activity buckets and found_with_mm:', {
      found_with_mm,
      roles_applied_bucket,
      companies_emailed_bucket,
      interviews_bucket,
      flow,
      step
    });
  }, [found_with_mm, roles_applied_bucket, companies_emailed_bucket, interviews_bucket, flow, step]);

  // Fetch subscription data when NotFound flow starts
  useEffect(() => {
    if (flow === 'still' && !downsell_variant) {
      const fetchSubscriptionData = async () => {
        try {
          // Mock subscription data for now - in production this would fetch from API
          setSubscriptionPrice(25) // $25/month
        } catch (error) {
          console.error('Error fetching subscription data:', error)
          // Fallback to default values
          setSubscriptionPrice(25)
        }
      }
      
      fetchSubscriptionData()
    }
  }, [flow, downsell_variant])

  // Resume and prefill functionality - fetch active cancellation on mount
  useEffect(() => {
    console.log('useEffect triggered - isOpen:', isOpen, 'flow:', flow);
    
    if (isOpen && !flow) {
      console.log('Modal is open and no flow set, fetching active cancellation...');
      const resumeActiveCancellation = async () => {
        try {
          console.log('Fetching active cancellation to resume...')
          const response = await fetch('/api/cancel/active')
          
          if (response.status === 204) {
            console.log('No active cancellation found, showing initial choice screen')
            return
          }
          
          if (!response.ok) {
            console.error('Failed to fetch active cancellation:', response.status)
            return
          }
          
          const activeCancellation = await response.json()
          console.log('Active cancellation found:', activeCancellation)
          console.log('found_job value from database:', activeCancellation.found_job)
          console.log('found_job type:', typeof activeCancellation.found_job)
          
          // Store cancellation ID and downsell variant
          setCancellationId(activeCancellation.id)
          setDownsellVariant(activeCancellation.downsell_variant)
          
          // Prefill all the fields from the database
          if (activeCancellation.found_with_mm !== null) {
            console.log('Prefilling found_with_mm:', activeCancellation.found_with_mm)
            setFoundWithMm(activeCancellation.found_with_mm)
          }
          if (activeCancellation.roles_applied_bucket) {
            console.log('Prefilling roles_applied_bucket:', activeCancellation.roles_applied_bucket)
            setRolesAppliedBucket(activeCancellation.roles_applied_bucket as any)
          }
          if (activeCancellation.companies_emailed_bucket) {
            console.log('Prefilling companies_emailed_bucket:', activeCancellation.companies_emailed_bucket)
            setCompaniesEmailedBucket(activeCancellation.companies_emailed_bucket as any)
          }
          if (activeCancellation.interviews_bucket) {
            console.log('Prefilling interviews_bucket:', activeCancellation.interviews_bucket)
            setInterviewsBucket(activeCancellation.interviews_bucket as any)
          }
          if (activeCancellation.feedback) setFeedback(activeCancellation.feedback)
          if (activeCancellation.has_lawyer !== null) setHasLawyer(activeCancellation.has_lawyer)
          if (activeCancellation.visa) setVisa(activeCancellation.visa)
          
          // Automatically set flow and step based on found_job - skip initial choice screen
          if (activeCancellation.found_job === true) {
            // Found Job Flow - go directly to Step-1
            console.log('Found Job: going directly to Found Step-1')
            console.log('Setting flow to "found" and step to 1')
            setFlow('found')
            setStep(1)
          } else if (activeCancellation.found_job === false) {
            // NotFound Flow - go directly to appropriate step
            console.log('NotFound Job: going directly to appropriate step')
            console.log('Setting flow to "still"')
            setFlow('still')
            
            if (activeCancellation.downsell_variant === 'B' && activeCancellation.accepted_downsell === null) {
              // Variant B: Show offer step (Step-1)
              console.log('Variant B: going to offer step (Step-1)')
              console.log('Setting notFoundStep to 1')
              setNotFoundStep(1)
            } else {
              // Variant A or already decided: Skip to step 2 (Usage Survey)
              console.log('Variant A or decided: going to step 2 (Usage Survey)')
              console.log('Setting notFoundStep to 2')
              setNotFoundStep(2)
              if (activeCancellation.accepted_downsell !== null) {
                console.log('Setting acceptedDownsell to:', activeCancellation.accepted_downsell)
                setAcceptedDownsell(activeCancellation.accepted_downsell)
              }
            }
          } else {
            console.log('found_job is null or undefined, will show initial choice screen')
            console.log('found_job value:', activeCancellation.found_job)
            console.log('found_job === true:', activeCancellation.found_job === true)
            console.log('found_job === false:', activeCancellation.found_job === false)
          }
          
        } catch (error) {
          console.error('Error resuming active cancellation:', error)
        }
      }
      
      resumeActiveCancellation()
    } else {
      console.log('useEffect condition not met - isOpen:', isOpen, 'flow:', flow);
    }
  }, [isOpen, flow])

  // Additional useEffect to ensure flow navigation runs when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('Modal opened - checking if we need to navigate to specific flow');
      
      // Only run this if we don't already have a flow set
      if (!flow) {
        console.log('No flow set yet, will let the other useEffect handle it');
      } else {
        console.log('Flow already set to:', flow, 'step:', step, 'notFoundStep:', notFoundStep);
      }
    }
  }, [isOpen])

  // Handle user choice submission
  const handleChoice = async (foundJob: boolean) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Always make API call to update found_job, whether creating new or updating existing
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
            found_job: foundJob,
            // Clear irrelevant fields when switching to Found Job flow
            ...(foundJob && {
              reason: null,
              feedback: null,
              accepted_downsell: null
            })
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save your choice')
      }

      const data: ProgressResponse = await response.json()
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
      // Only send the fields relevant to step 1
      const patchData: any = {}
      
      if (found_with_mm !== null) patchData.found_with_mm = found_with_mm
      if (roles_applied_bucket) patchData.roles_applied_bucket = roles_applied_bucket
      if (companies_emailed_bucket) patchData.companies_emailed_bucket = companies_emailed_bucket
      if (interviews_bucket) patchData.interviews_bucket = interviews_bucket

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
          patch: patchData
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        // Handle field-specific errors
        if (errorData.field && errorData.message) {
          setError(`${errorData.field}: ${errorData.message}`)
        } else {
          throw new Error(errorData.message || 'Failed to save your answers')
        }
        return
      }

      const data = await response.json()
      if (data.cancellationId) {
        setCancellationId(data.cancellationId)
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
      // Only send the fields relevant to step 2
      const patchData: any = {}
      
      if (feedback.trim()) patchData.feedback = feedback.trim()
      if (has_lawyer !== null) patchData.has_lawyer = has_lawyer

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
          patch: patchData
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        // Handle field-specific errors
        if (errorData.field && errorData.message) {
          setError(`${errorData.field}: ${errorData.message}`)
        } else {
          throw new Error(errorData.message || 'Failed to save your answers')
        }
        return
      }

      const data = await response.json()
      if (data.cancellationId) {
        setCancellationId(data.cancellationId)
      }

      // Move to step 3
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
      // Only send the fields relevant to step 3
      const patchData: any = {}
      
      if (visa.trim()) patchData.visa = visa.trim()
      if (found_with_mm !== null) patchData.found_with_mm = found_with_mm

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
          patch: patchData
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        // Handle field-specific errors
        if (errorData.field && errorData.message) {
          setError(`${errorData.field}: ${errorData.message}`)
        } else {
          throw new Error(errorData.message || 'Failed to save your answers')
        }
        return
      }

      const data = await response.json()
      if (data.cancellationId) {
        setCancellationId(data.cancellationId)
      }

      // Show success screen
      setShowSuccessScreen(true)
      setError(null)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // NotFound Flow Handlers
  const handleAcceptDownsell = async () => {
    console.log('handleAcceptDownsell called');
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
            accepted_downsell: true
          }
        })
      })

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error:', errorData);
        setError(errorData.message || 'Failed to save data')
        return
      }

      const data = await response.json()
      console.log('API response data:', data);
      
      if (data.cancellationId) {
        setCancellationId(data.cancellationId)
      }
      
      console.log('Setting accepted_downsell to true');
      setAcceptedDownsell(true)
      console.log('accepted_downsell state after set:', accepted_downsell);
      // Don't change notFoundStep here, just set accepted_downsell
    } catch (error) {
      console.error('Error accepting downsell:', error)
      setError('Failed to save data. Please try again.')
    }
  }

  const handleDeclineDownsell = async () => {
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
            accepted_downsell: false
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to save data')
        return
      }

      const data = await response.json()
      if (data.cancellationId) {
        setCancellationId(data.cancellationId)
      }
      
      setAcceptedDownsell(false)
      setNotFoundStep(2) // Go directly to usage survey
    } catch (error) {
      console.error('Error declining downsell:', error)
      setError('Failed to save data. Please try again.')
    }
  }

  const handleNotFoundContinue = async () => {
    try {
      // Only send the fields relevant to this step
      const patchData: any = {}
      
      if (roles_applied_bucket) patchData.roles_applied_bucket = roles_applied_bucket
      if (companies_emailed_bucket) patchData.companies_emailed_bucket = companies_emailed_bucket
      if (interviews_bucket) patchData.interviews_bucket = interviews_bucket

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
          patch: patchData
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to save data')
        return
      }

      const data = await response.json()
      if (data.cancellationId) {
        setCancellationId(data.cancellationId)
      }
      
      setNotFoundStep(3)
    } catch (error) {
      console.error('Error saving usage data:', error)
      setError('Failed to save data. Please try again.')
    }
  }

  const handleNotFoundStep2Continue = () => {
    console.log('handleNotFoundStep2Continue called - showing SuggestedDreamRoles');
    setShowSuggestedDreamRoles(true);
  }

  const handleNotFoundStep3Continue = async (reason: string, feedback: string) => {
    console.log('handleNotFoundStep3Continue called with:', { reason, feedback, cancellationId });
    
    if (!cancellationId) {
      console.log('No cancellationId, returning early');
      return;
    }
    
    setIsSubmitting(true)
    setError(null)

    try {
      console.log('Making API call to /api/cancel/progress');
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
            reason,
            feedback
          }
        })
      })

      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json()
        console.log('API error:', errorData);
        setError(errorData.message || 'Failed to save cancellation reason')
        return
      }

      const responseData = await response.json()
      console.log('API success response:', responseData);

      // Show success screen instead of closing modal
      console.log('Setting showNotFoundSuccess to true');
      setShowNotFoundSuccess(true)
      
    } catch (err) {
      console.error('API call error:', err);
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

  // Debug logging for modal state
  console.log('Modal render state:', { 
    flow, 
    step, 
    notFoundStep,
    accepted_downsell,
    showSuccessScreen,
    showNotFoundSuccess,
    has_lawyer,
    found_with_mm,
    roles_applied_bucket,
    companies_emailed_bucket,
    interviews_bucket
  })

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
          flow === 'found' && step === 1 ? 'md:max-w-6xl' : 
          flow === 'still' && step === 1 ? 'md:max-w-5xl' : 
          flow === 'still' && showSuggestedDreamRoles ? 'md:max-w-7xl' :
          flow === 'still' && showNotFoundSuccess ? 'md:max-w-5xl' :
          'md:max-w-4xl'
        }`}>
          {/* Title and Close button */}
          <div className="relative pt-7 pb-4 md:pb-4 md:pt-7 border-b border-gray-300 flex-shrink-0">
            {/* Back button - show when in flow but not on success screen - Desktop only */}
            {flow && !showSuccessScreen && !showNotFoundSuccess && !Boolean(accepted_downsell) && !showSuggestedDreamRoles && (
              <button
                onClick={async () => {
                  if (flow === 'found' && step === 1) {
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
                        setError(null)
                      }
                    } catch (error) {
                      console.error('Error updating found_job:', error)
                      // Still reset to initial screen even if API call fails
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
                      setError(null)
                    }
                  } else if (flow === 'still' && notFoundStep === 1) {
                    // NotFound Flow Step-1: Set found_job to null and go back to initial screen
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
                        setNotFoundStep(1)
                        setCancellationId(null)
                        setDownsellVariant(null)
                        setAcceptedDownsell(null)
                        setRolesAppliedBucket(null)
                        setCompaniesEmailedBucket(null)
                        setInterviewsBucket(null)
                        setError(null)
                      }
                    } catch (error) {
                      console.error('Error updating found_job:', error)
                      // Still reset to initial screen even if API call fails
                      setFlow(null)
                      setNotFoundStep(1)
                      setCancellationId(null)
                      setDownsellVariant(null)
                      setAcceptedDownsell(null)
                      setRolesAppliedBucket(null)
                      setCompaniesEmailedBucket(null)
                      setInterviewsBucket(null)
                      setError(null)
                    }
                  } else if (flow === 'found' && step > 1) {
                    // Go back to previous step
                    setStep((step - 1) as 1 | 2 | 3)
                  } else if (flow === 'still' && notFoundStep > 1) {
                    // Go back to previous step
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
                            setError(null)
                          }
                        } catch (error) {
                          console.error('Error updating found_job:', error)
                          // Still reset to initial screen even if API call fails
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
                          setError(null)
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
                            setNotFoundStep(1)
                            setCancellationId(null)
                            setDownsellVariant(null)
                            setAcceptedDownsell(null)
                            setRolesAppliedBucket(null)
                            setCompaniesEmailedBucket(null)
                            setInterviewsBucket(null)
                            setError(null)
                          }
                        } catch (error) {
                          console.error('Error updating found_job:', error)
                          // Still reset to initial screen even if API call fails
                          setFlow(null)
                          setNotFoundStep(1)
                          setCancellationId(null)
                          setDownsellVariant(null)
                          setAcceptedDownsell(null)
                          setRolesAppliedBucket(null)
                          setCompaniesEmailedBucket(null)
                          setInterviewsBucket(null)
                          setError(null)
                        }
                      } else if (notFoundStep === 2 && downsell_variant === 'A') {
                        // For variant A, going back from Step-2 should go to initial screen, not Step-1
                        setFlow(null)
                        setNotFoundStep(1)
                        setCancellationId(null)
                        setDownsellVariant(null)
                        setAcceptedDownsell(null)
                        setRolesAppliedBucket(null)
                        setCompaniesEmailedBucket(null)
                        setInterviewsBucket(null)
                        setError(null)
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
              showSuccessScreen
                ? 'hidden' 
                : flow === 'found' && (step === 1 || step === 2 || step === 3)
                ? 'hidden' 
                : flow === 'still' && (notFoundStep === 1 || notFoundStep === 2 || notFoundStep === 3 || Boolean(accepted_downsell))
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

            {/* Mobile Image Section for NotFoundSuccessScreen */}
            {showNotFoundSuccess && (
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
            )}

            {/* Content Section */}
            <div className="flex flex-col md:flex-row overflow-hidden">
              {/* Left section - Content and buttons */}
              <div className="flex-1 p-4 md:p-4 md:pr-2">
                <div className="w-full max-w-none">
                  {!flow ? (
                    // Initial choice screen
                    (() => {
                      console.log('Rendering initial choice screen - no flow set yet');
                      return (
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
                      );
                    })()
                  ) : flow === 'found' && step === 1 ? (
                    // Found Flow - Step 1
                    (() => {
                      console.log('Rendering FoundStep1 with prefilled values:', {
                        found_with_mm,
                        roles_applied_bucket,
                        companies_emailed_bucket,
                        interviews_bucket
                      });
                      
                      // Debug: Check if state values are properly set
                      console.log('FoundStep1 state check:', {
                        'found_with_mm type': typeof found_with_mm,
                        'found_with_mm value': found_with_mm,
                        'roles_applied_bucket type': typeof roles_applied_bucket,
                        'roles_applied_bucket value': roles_applied_bucket,
                        'companies_emailed_bucket type': typeof companies_emailed_bucket,
                        'companies_emailed_bucket value': companies_emailed_bucket,
                        'interviews_bucket type': typeof interviews_bucket,
                        'interviews_bucket value': interviews_bucket
                      });
                      
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
                      console.log('Rendering NotFound flow with:', { 
                        notFoundStep, 
                        accepted_downsell, 
                        flow 
                      });
                      
                      if (showNotFoundSuccess) {
                        console.log('Rendering NotFoundSuccessScreen');
                        return (
                          <NotFoundSuccessScreen
                            onBackToJobs={onClose}
                          />
                        );
                      } else if (Boolean(accepted_downsell) && notFoundStep === 3) {
                        console.log('Rendering NotFoundStep3 (Cancellation Reason)');
                        return (
                          <NotFoundStep3
                            onContinue={handleNotFoundStep3Continue}
                            saving={isSubmitting}
                          />
                        );
                      } else if (showSuggestedDreamRoles) {
                        console.log('Rendering SuggestedDreamRoles');
                        return (
                          <SuggestedDreamRoles
                            onContinue={() => handleNotFoundStep3Continue('', '')}
                            onClose={onClose}
                          />
                        );
                      } else if (Boolean(accepted_downsell)) {
                        console.log('Rendering DownSellAccepted');
                        return (
                          <DownSellAccepted
                            onContinue={handleNotFoundStep2Continue}
                            daysLeft={30} // Placeholder, as daysLeft is removed
                            nextBillingDate={''} // Placeholder, as nextBillingDate is removed
                          />
                        );
                      } else if (notFoundStep === 1) {
                        console.log('Rendering NotFoundStep1');
                        return (
                          <NotFoundStep1
                            onAcceptDownsell={handleAcceptDownsell}
                            onDeclineDownsell={handleDeclineDownsell}
                            saving={isSubmitting}
                          />
                        );
                      } else if (notFoundStep === 2) {
                        console.log('Rendering NotFoundStep2');
                        console.log('NotFoundStep2 prefilled values:', {
                          roles_applied_bucket,
                          companies_emailed_bucket,
                          interviews_bucket
                        });
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
                        console.log('Rendering NotFoundStep3');
                        return (
                          <NotFoundStep3
                            onContinue={handleNotFoundStep3Continue}
                            saving={isSubmitting}
                          />
                        );
                      } else {
                        console.log('No NotFound step matched, showing debug');
                        return (
                          <div className="space-y-6 bg-yellow-100 p-6 rounded-lg border-2 border-yellow-400">
                            <h3 className="text-lg font-bold text-yellow-800">Debug: NotFound Flow State</h3>
                            <div className="text-sm text-yellow-700 space-y-2">
                              <p>Flow: {flow}</p>
                              <p>NotFoundStep: {notFoundStep}</p>
                              <p>Accepted Downsell: {String(accepted_downsell)}</p>
                              <p>Flow === 'still': {String(flow === 'still')}</p>
                              <p>notFoundStep === 1: {String(notFoundStep === 1)}</p>
                              <p>accepted_downsell === true: {String(Boolean(accepted_downsell))}</p>
                              <p>Condition for NotFoundStep1: {String(flow === 'still' && notFoundStep === 1)}</p>
                              <p>Condition for DownSellAccepted: {String(flow === 'still' && Boolean(accepted_downsell))}</p>
                              <p>Condition for NotFoundStep2: {String(flow === 'still' && notFoundStep === 2)}</p>
                              <p>Condition for NotFoundStep3: {String(flow === 'still' && notFoundStep === 3)}</p>
                            </div>
                          </div>
                        );
                      }
                    })()
                  ) : null}
                </div>
              </div>

              {/* Desktop Right section - Image - Hidden on mobile for Found Flow Steps, visible for success screen */}
              <div className={`${
                showSuccessScreen 
                  ? 'hidden md:block' 
                  : flow === 'found' && (step === 1 || step === 2 || step === 3)
                  ? 'hidden md:block' 
                  : flow === 'still' && (notFoundStep === 1 || notFoundStep === 2 || notFoundStep === 3 || Boolean(accepted_downsell) || showSuggestedDreamRoles || showNotFoundSuccess)
                  ? 'hidden md:block'
                  : 'hidden md:block'
              } flex-shrink-0 p-3 ${
                showSuccessScreen 
                  ? 'md:w-[350px]' : flow === 'found' && step === 1 
                  ? 'md:w-[450px]' : flow === 'found' && step === 2
                  ? 'md:w-[400px]'
                  : flow === 'still' && notFoundStep === 1
                  ? 'md:w-[400px]'
                  : flow === 'still' && Boolean(accepted_downsell)
                  ? 'md:w-[400px]'
                  : flow === 'still' && showSuggestedDreamRoles
                  ? 'md:w-[500px]'
                  : flow === 'still' && showNotFoundSuccess
                  ? 'md:w-[400px]'
                  : flow === 'still' && notFoundStep === 2
                  ? 'md:w-[400px]'
                  : flow === 'still' && notFoundStep === 3
                  ? 'md:w-[400px]'
                  : 'md:w-[350px]'
              }`}>
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
