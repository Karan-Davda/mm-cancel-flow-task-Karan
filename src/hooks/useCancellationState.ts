import { useState, useCallback } from 'react'

export const useCancellationState = () => {
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
  const [showSuggestedDreamRoles, setShowSuggestedDreamRoles] = useState(false)
  const [subscriptionPrice, setSubscriptionPrice] = useState<number>(25)
  const [notFoundStep, setNotFoundStep] = useState<1 | 2 | 3>(1)
  const [showNotFoundSuccess, setShowNotFoundSuccess] = useState(false)

  // General State
  const [cancellationId, setCancellationId] = useState<string | null>(null)

  // Reset functions
  const resetFoundFlowState = useCallback(() => {
    setFlow(null)
    setStep(1)
    setFoundWithMm(null)
    setRolesAppliedBucket(null)
    setCompaniesEmailedBucket(null)
    setInterviewsBucket(null)
    setFeedback('')
    setHasLawyer(null)
    setVisa('')
    setShowConfetti(false)
    setShowSuccessScreen(false)
  }, [])

  const resetNotFoundFlowState = useCallback(() => {
    setFlow(null)
    setNotFoundStep(1)
    setCancellationId(null)
    setDownsellVariant(null)
    setAcceptedDownsell(null)
    setRolesAppliedBucket(null)
    setCompaniesEmailedBucket(null)
    setInterviewsBucket(null)
    setShowSuggestedDreamRoles(false)
    setShowNotFoundSuccess(false)
  }, [])

  const resetAllState = useCallback(() => {
    resetFoundFlowState()
    resetNotFoundFlowState()
  }, [resetFoundFlowState, resetNotFoundFlowState])

  // State setters with validation
  const setFlowWithValidation = useCallback((newFlow: 'found' | 'still' | null) => {
    setFlow(newFlow)
    if (newFlow === 'found') {
      setStep(1)
    } else if (newFlow === 'still') {
      setNotFoundStep(1)
    }
  }, [])

  const setStepWithValidation = useCallback((newStep: 1 | 2 | 3) => {
    if (newStep >= 1 && newStep <= 3) {
      setStep(newStep)
    }
  }, [])

  const setNotFoundStepWithValidation = useCallback((newStep: 1 | 2 | 3) => {
    if (newStep >= 1 && newStep <= 3) {
      setNotFoundStep(newStep)
    }
  }, [])

  return {
    // State
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

    // Setters
    setFlow: setFlowWithValidation,
    setStep: setStepWithValidation,
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
    setNotFoundStep: setNotFoundStepWithValidation,
    setShowNotFoundSuccess,
    setCancellationId,

    // Reset functions
    resetFoundFlowState,
    resetNotFoundFlowState,
    resetAllState
  }
}
