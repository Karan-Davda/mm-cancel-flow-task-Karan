import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import crypto from 'crypto'

// Normalization mappings
const REASON_NORMALIZATION: Record<string, string> = {
  'Too expensive': 'too_expensive',
  'Platform not helpful': 'not_helpful',
  'Not enough relevant jobs': 'not_relevant',
  'Decided not to move': 'not_moving',
  'Other': 'other'
}

const BUCKET_NORMALIZATION: Record<string, string> = {
  // Roles applied buckets
  '0': '0',
  '1-5': '1-5',
  '6-20': '6-20',
  '20+': '20+',
  // Interview buckets
  '1-2': '1-2',
  '3-5': '3-5',
  '5+': '5+'
}

// Allowed canonical values
const ALLOWED_REASONS = ['too_expensive', 'not_helpful', 'not_relevant', 'not_moving', 'other']
const ALLOWED_BUCKETS = ['0', '1-5', '6-20', '20+', '1-2', '3-5', '5+']

// Normalization function
function normalizeReason(uiLabel: string): string | null {
  return REASON_NORMALIZATION[uiLabel] || null
}

function normalizeBucket(uiLabel: string): string | null {
  return BUCKET_NORMALIZATION[uiLabel] || null
}

// Validation function
function validateNormalizedValues(reason?: string | null, rolesBucket?: string | null, companiesBucket?: string | null, interviewsBucket?: string | null): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (reason && !ALLOWED_REASONS.includes(reason)) {
    errors.push(`Invalid reason: ${reason}`)
  }
  
  if (rolesBucket && !ALLOWED_BUCKETS.includes(rolesBucket)) {
    errors.push(`Invalid roles bucket: ${rolesBucket}`)
  }
  
  if (companiesBucket && !ALLOWED_BUCKETS.includes(companiesBucket)) {
    errors.push(`Invalid companies bucket: ${companiesBucket}`)
  }
  
  if (interviewsBucket && !ALLOWED_BUCKETS.includes(interviewsBucket)) {
    errors.push(`Invalid interviews bucket: ${interviewsBucket}`)
  }
  
  return { isValid: errors.length === 0, errors }
}

// Types for the request body
interface ProgressPatch {
  found_job?: boolean | null
  roles_applied_bucket?: '0' | '1-5' | '6-20' | '20+'
  companies_emailed_bucket?: '0' | '1-5' | '6-20' | '20+'
  interviews_bucket?: '0' | '1-2' | '3-5' | '5+'
  feedback?: string | null
  has_lawyer?: boolean
  visa?: string
  found_with_mm?: boolean
  accepted_downsell?: boolean | null
  downsell_variant?: 'A' | 'B'
  reason?: string | null
}

interface ProgressRequest {
  patch: ProgressPatch
}

// Types for the response
interface ProgressResponse {
  cancellationId: string
  saved: {
    found_job?: boolean | null
    roles_applied_bucket?: '0' | '1-5' | '6-20' | '20+'
    companies_emailed_bucket?: '0' | '1-5' | '6-20' | '20+'
    interviews_bucket?: '0' | '1-2' | '3-5' | '5+'
    feedback?: string
    has_lawyer?: boolean
    visa?: string
    found_with_mm?: boolean
    accepted_downsell?: boolean
    downsell_variant?: 'A' | 'B'
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: ProgressRequest = await request.json()
    
    // Normalize UI labels to canonical tokens
    const normalizedReason = body.patch.reason ? normalizeReason(body.patch.reason) : undefined
    const normalizedRolesBucket = body.patch.roles_applied_bucket ? normalizeBucket(body.patch.roles_applied_bucket) : undefined
    const normalizedCompaniesBucket = body.patch.companies_emailed_bucket ? normalizeBucket(body.patch.companies_emailed_bucket) : undefined
    const normalizedInterviewsBucket = body.patch.interviews_bucket ? normalizeBucket(body.patch.interviews_bucket) : undefined
    
    // Validate normalized values
    const validation = validateNormalizedValues(
      normalizedReason, 
      normalizedRolesBucket, 
      normalizedCompaniesBucket, 
      normalizedInterviewsBucket
    )
    
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }
    
    // Get mock user ID for development
    const mockUserId = process.env.MOCK_USER_ID
    if (!mockUserId) {
      return NextResponse.json(
        { error: 'MOCK_USER_ID not configured' },
        { status: 500 }
      )
    }

    // Check if user has an active cancellation
    const { data: activeCancellation, error: fetchError } = await supabaseServer()
      .from('cancellations')
      .select('*')
      .eq('user_id', mockUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching active cancellation:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch cancellation status' },
        { status: 500 }
      )
    }

    if (!activeCancellation) {
      // Create new cancellation
      const insertData: any = {
        user_id: mockUserId,
        accepted_downsell: body.patch.accepted_downsell || null,
        has_lawyer: body.patch.has_lawyer || null,
        roles_applied_bucket: normalizedRolesBucket || null,
        companies_emailed_bucket: normalizedCompaniesBucket || null,
        interviews_bucket: normalizedInterviewsBucket || null
      }

      // Add reason and feedback if provided
      if (normalizedReason !== null) insertData.reason = normalizedReason
      if (body.patch.feedback !== undefined) insertData.feedback = body.patch.feedback?.trim() || null

      // Assign downsell variant for new cancellations
      insertData.downsell_variant = crypto.randomInt(0, 2) === 0 ? 'A' : 'B'

      // Fetch user's subscription to get subscription_id
      const { data: userSubscription } = await supabaseServer()
        .from('subscriptions')
        .select('id')
        .eq('user_id', mockUserId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (userSubscription?.id) {
        insertData.subscription_id = userSubscription.id
        console.log('Setting subscription_id for new cancellation:', userSubscription.id)
      } else {
        console.log('No subscription found for user:', mockUserId)
      }

      const { data: newCancellation, error: insertError } = await supabaseServer()
        .from('cancellations')
        .insert(insertData)
        .select()
        .single()

      if (insertError) {
        console.error('Error inserting cancellation:', insertError)
        
        // Handle constraint violations
        if (insertError.code === '23514') {
          return NextResponse.json(
            { error: 'Constraint failed', detail: insertError.message },
            { status: 400 }
          )
        }
        
        return NextResponse.json(
          { error: 'Failed to create cancellation' },
          { status: 500 }
        )
      }

      // Update subscription price if downsell accepted
      if (body.patch.accepted_downsell === true) {
        const { data: latestSubscription } = await supabaseServer()
          .from('subscriptions')
          .select('id, monthly_price')
          .eq('user_id', mockUserId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (latestSubscription?.monthly_price) {
          const newPrice = latestSubscription.monthly_price - 1000 // $10 off (1000 cents)
          
          const { error: updateError } = await supabaseServer()
            .from('subscriptions')
            .update({ monthly_price: newPrice })
            .eq('id', latestSubscription.id)

          if (updateError) {
            console.error('Error updating subscription price:', updateError)
            // Don't fail the request, just log the error
          }
        }
      }

      return NextResponse.json({
        success: true,
        cancellationId: newCancellation.id,
        saved: {
          ...newCancellation,
          reason: normalizedReason,
          feedback: body.patch.feedback,
          roles_applied_bucket: normalizedRolesBucket,
          companies_emailed_bucket: normalizedCompaniesBucket,
          interviews_bucket: normalizedInterviewsBucket
        }
      })

    } else {
      // Update existing cancellation
      const updateData: any = {
        found_job: body.patch.found_job !== undefined ? body.patch.found_job : activeCancellation.found_job,
        accepted_downsell: body.patch.accepted_downsell !== undefined ? body.patch.accepted_downsell : activeCancellation.accepted_downsell,
        has_lawyer: body.patch.has_lawyer !== undefined ? body.patch.has_lawyer : activeCancellation.has_lawyer,
        roles_applied_bucket: normalizedRolesBucket !== undefined ? normalizedRolesBucket : activeCancellation.roles_applied_bucket,
        companies_emailed_bucket: normalizedCompaniesBucket !== undefined ? normalizedCompaniesBucket : activeCancellation.companies_emailed_bucket,
        interviews_bucket: normalizedInterviewsBucket !== undefined ? normalizedInterviewsBucket : activeCancellation.interviews_bucket
      }

      // Add reason and feedback if provided
      if (normalizedReason !== undefined) updateData.reason = normalizedReason
      if (body.patch.feedback !== undefined) updateData.feedback = body.patch.feedback?.trim() || null

      // Ensure subscription_id is set if not already present
      if (!activeCancellation.subscription_id) {
        const { data: userSubscription } = await supabaseServer()
          .from('subscriptions')
          .select('id')
          .eq('user_id', mockUserId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (userSubscription?.id) {
          updateData.subscription_id = userSubscription.id
          console.log('Setting subscription_id for existing cancellation:', userSubscription.id)
        }
      }

      const { data: updatedCancellation, error: updateError } = await supabaseServer()
        .from('cancellations')
        .update(updateData)
        .eq('id', activeCancellation.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating cancellation:', updateError)
        
        // Handle constraint violations
        if (updateError.code === '23514') {
          return NextResponse.json(
            { error: 'Constraint failed', detail: updateError.message },
            { status: 400 }
          )
        }
        
        return NextResponse.json(
          { error: 'Failed to update cancellation' },
          { status: 500 }
        )
      }

      // Update subscription price if downsell accepted
      if (body.patch.accepted_downsell === true && activeCancellation.subscription_id) {
        const { data: subscription } = await supabaseServer()
          .from('subscriptions')
          .select('monthly_price')
          .eq('id', activeCancellation.subscription_id)
          .single()

        if (subscription?.monthly_price) {
          const newPrice = subscription.monthly_price - 1000 // $10 off (1000 cents)
          
          const { error: priceUpdateError } = await supabaseServer()
            .from('subscriptions')
            .update({ monthly_price: newPrice })
            .eq('id', activeCancellation.subscription_id)

          if (priceUpdateError) {
            console.error('Error updating subscription price:', priceUpdateError)
            // Don't fail the request, just log the error
          }
        }
      }

      return NextResponse.json({
        success: true,
        cancellationId: updatedCancellation.id,
        saved: {
          ...updatedCancellation,
          reason: normalizedReason,
          feedback: body.patch.feedback,
          roles_applied_bucket: normalizedRolesBucket,
          companies_emailed_bucket: normalizedCompaniesBucket,
          interviews_bucket: normalizedInterviewsBucket
        }
      })
    }

  } catch (error) {
    console.error('Error in progress API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
