export const getFlowStep = (
  foundJob: boolean | null,
  downsellVariant: string | null,
  acceptedDownsell: boolean | null
): { flow: 'found' | 'still' | null; step: number | null; notFoundStep: number | null } => {
  if (foundJob === true) {
    return { flow: 'found', step: 1, notFoundStep: null }
  } else if (foundJob === false) {
    if (downsellVariant === 'B' && acceptedDownsell === null) {
      return { flow: 'still', step: null, notFoundStep: 1 }
    } else if (downsellVariant === 'A') {
      return { flow: 'still', step: null, notFoundStep: 1 }
    } else if (acceptedDownsell !== null) {
      return { flow: 'still', step: null, notFoundStep: 2 }
    } else {
      return { flow: 'still', step: null, notFoundStep: 1 }
    }
  }
  return { flow: null, step: null, notFoundStep: null }
}

export const getModalWidth = (
  flow: string | null,
  step: number | null,
  notFoundStep: number | null,
  showSuccessScreen: boolean,
  showNotFoundSuccess: boolean,
  acceptedDownsell: boolean | null,
  showSuggestedDreamRoles: boolean
): string => {
  // Check for SuggestedDreamRoles FIRST - highest priority
  if (showSuggestedDreamRoles) {
    return 'md:max-w-6xl'
  }
  
  // Then check other conditions
  if (showSuccessScreen) {
    return 'md:max-w-4xl'
  }
  if (showNotFoundSuccess) {
    return 'md:max-w-5xl'
  }
  
  if (flow === 'found') {
    if (step === 1) return 'md:max-w-6xl'
    if (step === 2) return 'md:max-w-4xl'
    if (step === 3) return 'md:max-w-4xl'
  }
  
  if (flow === 'still') {
    if (notFoundStep === 1) return 'md:max-w-5xl'
    if (notFoundStep === 2) return 'md:max-w-6xl'
    if (notFoundStep === 3) return 'md:max-w-4xl'
    if (acceptedDownsell) return 'md:max-w-5xl'
  }
  
  return 'md:max-w-4xl'
}

export const getImageVisibility = (
  flow: string | null,
  step: number | null,
  notFoundStep: number | null,
  showSuccessScreen: boolean,
  acceptedDownsell: boolean | null,
  showSuggestedDreamRoles: boolean,
  showNotFoundSuccess: boolean
): string => {
  // Check success screens FIRST - highest priority
  if (showNotFoundSuccess) return 'block'
  if (showSuccessScreen) return 'hidden'
  
  if (flow === 'found' && [1, 2, 3].includes(step || 0)) return 'hidden'
  if (flow === 'still' && [1, 2, 3].includes(notFoundStep || 0)) return 'hidden'
  if (flow === 'still' && acceptedDownsell) return 'hidden'
  if (flow === 'still' && showSuggestedDreamRoles) return 'hidden'
  return 'block'
}

export const getDesktopImageWidth = (
  flow: string | null,
  step: number | null,
  notFoundStep: number | null,
  showSuccessScreen: boolean,
  acceptedDownsell: boolean | null,
  showSuggestedDreamRoles: boolean,
  showNotFoundSuccess: boolean
): string => {
  if (showSuccessScreen) return 'md:w-[350px]'
  if (showNotFoundSuccess) return 'md:w-[400px]'
  
  if (flow === 'found') {
    if (step === 1) return 'md:w-[450px]'
    if (step === 2) return 'md:w-[400px]'
    if (step === 3) return 'md:w-[400px]'
  }
  
  if (flow === 'still') {
    if (notFoundStep === 1) return 'md:w-[400px]'
    if (notFoundStep === 2) return 'md:w-[400px]'
    if (notFoundStep === 3) return 'md:w-[400px]'
    if (acceptedDownsell) return 'md:w-[400px]'
    if (showSuggestedDreamRoles) return 'md:w-[500px]'
  }
  
  return 'md:w-[350px]'
}
