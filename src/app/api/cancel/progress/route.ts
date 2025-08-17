import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

// Types for the API request and response
interface ProgressRequest {
  cancellation_id?: string
  patch: {
    found_job?: boolean
    found_with_mm?: boolean
    roles_applied_bucket?: '0' | '1-5' | '6-20' | '20+'
    companies_emailed_bucket?: '0' | '1-5' | '6-20' | '20+'
    interviews_bucket?: '0' | '1-2' | '3-5' | '5+'
    feedback?: string
    has_lawyer?: boolean
    visa?: string
  }
}

interface ProgressResponse {
  cancellationId: string
  saved: {
    found_job?: boolean
    found_with_mm?: boolean
    roles_applied_bucket?: '0' | '1-5' | '6-20' | '20+'
    companies_emailed_bucket?: '0' | '1-5' | '6-20' | '20+'
    interviews_bucket?: '0' | '1-2' | '3-5' | '5+'
    feedback?: string
    has_lawyer?: boolean
    visa?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    // Basic CSRF protection - check if csrf-token cookie exists and validate header
    const csrfToken = request.cookies.get('csrf-token')?.value
    if (csrfToken) {
      const headerToken = request.headers.get('x-csrf-token')
      if (!headerToken || headerToken !== csrfToken) {
        return NextResponse.json({ error: 'CSRF token mismatch' }, { status: 403 })
      }
    }

    const body: ProgressRequest = await request.json()
    
    // Validate required fields based on what's being updated
    if (body.patch.found_job !== undefined && typeof body.patch.found_job !== 'boolean') {
      return NextResponse.json(
        { field: 'found_job', message: 'found_job must be a boolean' }, 
        { status: 400 }
      )
    }
    
    if (body.patch.found_with_mm !== undefined && typeof body.patch.found_with_mm !== 'boolean') {
      return NextResponse.json(
        { field: 'found_with_mm', message: 'found_with_mm must be a boolean' }, 
        { status: 400 }
      )
    }
    
    if (body.patch.roles_applied_bucket !== undefined && !['0', '1-5', '6-20', '20+'].includes(body.patch.roles_applied_bucket)) {
      return NextResponse.json(
        { field: 'roles_applied_bucket', message: 'Invalid roles_applied_bucket value' }, 
        { status: 400 }
      )
    }
    
    if (body.patch.companies_emailed_bucket !== undefined && !['0', '1-5', '6-20', '20+'].includes(body.patch.companies_emailed_bucket)) {
      return NextResponse.json(
        { field: 'companies_emailed_bucket', message: 'Invalid companies_emailed_bucket value' }, 
        { status: 400 }
      )
    }
    
    if (body.patch.interviews_bucket !== undefined && !['0', '1-2', '3-5', '5+'].includes(body.patch.interviews_bucket)) {
      return NextResponse.json(
        { field: 'interviews_bucket', message: 'Invalid interviews_bucket value' }, 
        { status: 400 }
      )
    }
    
    if (body.patch.feedback !== undefined && typeof body.patch.feedback !== 'string') {
      return NextResponse.json(
        { field: 'feedback', message: 'feedback must be a string' }, 
        { status: 400 }
      )
    }
    
    if (body.patch.feedback !== undefined && body.patch.feedback.length < 25) {
      return NextResponse.json(
        { field: 'feedback', message: 'feedback must be at least 25 characters' }, 
        { status: 400 }
      )
    }
    
    if (body.patch.has_lawyer !== undefined && typeof body.patch.has_lawyer !== 'boolean') {
      return NextResponse.json(
        { field: 'has_lawyer', message: 'has_lawyer must be a boolean' }, 
        { status: 400 }
      )
    }
    
    if (body.patch.visa !== undefined && typeof body.patch.visa !== 'string') {
      return NextResponse.json(
        { field: 'visa', message: 'visa must be a string' }, 
        { status: 400 }
      )
    }
    
    if (body.patch.visa !== undefined && body.patch.visa.trim().length > 255) {
      return NextResponse.json(
        { field: 'visa', message: 'visa must be 255 characters or less' }, 
        { status: 400 }
      )
    }

    const mockUserId = process.env.MOCK_USER_ID
    if (!mockUserId) {
      return NextResponse.json(
        { error: 'MOCK_USER_ID not configured' }, 
        { status: 500 }
      )
    }

    let cancellationId: string

    if (body.cancellation_id) {
      // Update existing cancellation
      const { data: existingCancellation, error: fetchError } = await supabaseServer()
        .from('cancellations')
        .select('id')
        .eq('id', body.cancellation_id)
        .eq('user_id', mockUserId)
        .single()

      if (fetchError || !existingCancellation) {
        return NextResponse.json(
          { error: 'Cancellation not found or access denied' }, 
          { status: 404 }
        )
      }

      cancellationId = existingCancellation.id

      // Update the existing cancellation with all provided fields
      const updateData: any = {}
      if (body.patch.found_job !== undefined) updateData.found_job = body.patch.found_job
      if (body.patch.found_with_mm !== undefined) updateData.found_with_mm = body.patch.found_with_mm
      if (body.patch.roles_applied_bucket !== undefined) updateData.roles_applied_bucket = body.patch.roles_applied_bucket
      if (body.patch.companies_emailed_bucket !== undefined) updateData.companies_emailed_bucket = body.patch.companies_emailed_bucket
      if (body.patch.interviews_bucket !== undefined) updateData.interviews_bucket = body.patch.interviews_bucket
      if (body.patch.feedback !== undefined) updateData.feedback = body.patch.feedback.trim()
      if (body.patch.has_lawyer !== undefined) updateData.has_lawyer = body.patch.has_lawyer
      if (body.patch.visa !== undefined) updateData.visa = body.patch.visa.trim()

      const { error: updateError } = await supabaseServer()
        .from('cancellations')
        .update(updateData)
        .eq('id', cancellationId)

      if (updateError) {
        console.error('Error updating cancellation:', updateError)
        return NextResponse.json(
          { error: 'Failed to update cancellation' }, 
          { status: 500 }
        )
      }
    } else {
      // Get or create active cancellation
      let { data: activeCancellation } = await supabaseServer()
        .from('cancellations')
        .select('id')
        .eq('user_id', mockUserId)
        .is('accepted_downsell', null)
        .is('reason', null)
        .single()

      if (!activeCancellation) {
        // Get latest subscription for the user
        const { data: latestSubscription } = await supabaseServer()
          .from('subscriptions')
          .select('id')
          .eq('user_id', mockUserId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // Create new active cancellation with all provided fields
        const insertData: any = {
          user_id: mockUserId,
          subscription_id: latestSubscription?.id || null,
          downsell_variant: 'A'
        }
        if (body.patch.found_job !== undefined) insertData.found_job = body.patch.found_job
        if (body.patch.found_with_mm !== undefined) insertData.found_with_mm = body.patch.found_with_mm
        if (body.patch.roles_applied_bucket !== undefined) insertData.roles_applied_bucket = body.patch.roles_applied_bucket
        if (body.patch.companies_emailed_bucket !== undefined) insertData.companies_emailed_bucket = body.patch.companies_emailed_bucket
        if (body.patch.interviews_bucket !== undefined) insertData.interviews_bucket = body.patch.interviews_bucket
        if (body.patch.feedback !== undefined) insertData.feedback = body.patch.feedback.trim()
        if (body.patch.has_lawyer !== undefined) insertData.has_lawyer = body.patch.has_lawyer
        if (body.patch.visa !== undefined) insertData.visa = body.patch.visa.trim()

        const { data: newCancellation, error: createError } = await supabaseServer() 
          .from('cancellations')
          .insert(insertData)
          .select('id')
          .single()

        if (createError) {
          console.error('Error creating cancellation:', createError)
          return NextResponse.json(
            { error: 'Failed to create cancellation' }, 
            { status: 500 }
          )
        }

        cancellationId = newCancellation.id
      } else {
        // Update existing active cancellation with all provided fields
        cancellationId = activeCancellation.id
        
        const updateData: any = {}
        if (body.patch.found_job !== undefined) updateData.found_job = body.patch.found_job
        if (body.patch.found_with_mm !== undefined) updateData.found_with_mm = body.patch.found_with_mm
        if (body.patch.roles_applied_bucket !== undefined) updateData.roles_applied_bucket = body.patch.roles_applied_bucket
        if (body.patch.companies_emailed_bucket !== undefined) updateData.companies_emailed_bucket = body.patch.companies_emailed_bucket
        if (body.patch.interviews_bucket !== undefined) updateData.interviews_bucket = body.patch.interviews_bucket
        if (body.patch.feedback !== undefined) updateData.feedback = body.patch.feedback.trim()
        if (body.patch.has_lawyer !== undefined) updateData.has_lawyer = body.patch.has_lawyer
        if (body.patch.visa !== undefined) updateData.visa = body.patch.visa.trim()
        
        const { error: updateError } = await supabaseServer()
          .from('cancellations')
          .update(updateData)
          .eq('id', cancellationId)

        if (updateError) {
          console.error('Error updating cancellation:', updateError)
          return NextResponse.json(
            { error: 'Failed to update cancellation' }, 
            { status: 500 }
          )
        }
      }
    }

                    const response: ProgressResponse = {
                  cancellationId,
                  saved: {
                    ...(body.patch.found_job !== undefined && { found_job: body.patch.found_job }),
                    ...(body.patch.found_with_mm !== undefined && { found_with_mm: body.patch.found_with_mm }),
                    ...(body.patch.roles_applied_bucket !== undefined && { roles_applied_bucket: body.patch.roles_applied_bucket }),
                    ...(body.patch.companies_emailed_bucket !== undefined && { companies_emailed_bucket: body.patch.companies_emailed_bucket }),
                    ...(body.patch.interviews_bucket !== undefined && { interviews_bucket: body.patch.interviews_bucket }),
                    ...(body.patch.feedback !== undefined && { feedback: body.patch.feedback.trim() }),
                    ...(body.patch.has_lawyer !== undefined && { has_lawyer: body.patch.has_lawyer }),
                    ...(body.patch.visa !== undefined && { visa: body.patch.visa.trim() })
                  }
                }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in progress API:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
