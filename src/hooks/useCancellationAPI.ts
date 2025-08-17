import { useState } from 'react'

interface ProgressPatch {
  found_job?: boolean | null
  found_with_mm?: boolean
  roles_applied_bucket?: '0' | '1-5' | '6-20' | '20+'
  companies_emailed_bucket?: '0' | '1-5' | '6-20' | '20+'
  interviews_bucket?: '0' | '1-2' | '3-5' | '5+'
  feedback?: string | null
  has_lawyer?: boolean
  visa?: string
  accepted_downsell?: boolean | null
  reason?: string | null
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

export const useCancellationAPI = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getCsrfToken = () => {
    if (document.cookie.includes('csrf-token')) {
      return document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf-token='))
        ?.split('=')[1] || ''
    }
    return ''
  }

  const makeAPICall = async (endpoint: string, data: any): Promise<any> => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getCsrfToken() && { 'x-csrf-token': getCsrfToken() })
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.field && errorData.message) {
          setError(`${errorData.field}: ${errorData.message}`)
        } else {
          throw new Error(errorData.message || 'API request failed')
        }
        return null
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateProgress = async (patch: ProgressPatch): Promise<ProgressResponse | null> => {
    return makeAPICall('/api/cancel/progress', { patch })
  }

  const fetchActiveCancellation = async (): Promise<any> => {
    try {
      const response = await fetch('/api/cancel/active')
      
      if (response.status === 204) {
        return null
      }
      
      if (!response.ok) {
        console.error('Failed to fetch active cancellation:', response.status)
        return null
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching active cancellation:', error)
      return null
    }
  }

  const clearError = () => setError(null)

  return {
    isSubmitting,
    error,
    updateProgress,
    fetchActiveCancellation,
    clearError
  }
}
