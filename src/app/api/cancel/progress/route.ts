import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

// Types for the API request and response
interface ProgressRequest {
  cancellation_id?: string
  patch: {
    found_job: boolean
  }
}

interface ProgressResponse {
  cancellationId: string
  saved: {
    found_job: boolean
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
    
    // Validate required fields
    if (typeof body.patch.found_job !== 'boolean') {
      return NextResponse.json(
        { error: 'found_job must be a boolean' }, 
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
      const { data: existingCancellation, error: fetchError } = await supabaseServer
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

      // Update the existing cancellation
      const { error: updateError } = await supabaseServer
        .from('cancellations')
        .update({ found_job: body.patch.found_job })
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
      let { data: activeCancellation } = await supabaseServer
        .from('cancellations')
        .select('id')
        .eq('user_id', mockUserId)
        .is('accepted_downsell', null)
        .is('reason', null)
        .single()

      if (!activeCancellation) {
        // Get latest subscription for the user
        const { data: latestSubscription } = await supabaseServer
          .from('subscriptions')
          .select('id')
          .eq('user_id', mockUserId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // Create new active cancellation
        const { data: newCancellation, error: createError } = await supabaseServer
          .from('cancellations')
          .insert({
            user_id: mockUserId,
            subscription_id: latestSubscription?.id || null,
            downsell_variant: 'A',
            found_job: body.patch.found_job
          })
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
        // Update existing active cancellation
        cancellationId = activeCancellation.id
        
        const { error: updateError } = await supabaseServer
          .from('cancellations')
          .update({ found_job: body.patch.found_job })
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
        found_job: body.patch.found_job
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
