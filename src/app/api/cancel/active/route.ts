import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Mock user ID for development
    const mockUserId = process.env.MOCK_USER_ID
    if (!mockUserId) {
      return NextResponse.json(
        { error: 'MOCK_USER_ID not configured' },
        { status: 500 }
      )
    }

    // Get the single active cancellation row for the user
    // Active means: accepted_downsell IS NULL AND reason IS NULL
    const { data: activeCancellation, error } = await supabaseServer()
      .from('cancellations')
      .select('*')
      .eq('user_id', mockUserId)
      .is('accepted_downsell', null)
      .is('reason', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No active cancellation found
        return new NextResponse(null, { status: 204 })
      }
      
      console.error('Error fetching active cancellation:', error)
      return NextResponse.json(
        { error: 'Failed to fetch cancellation status' },
        { status: 500 }
      )
    }

    if (!activeCancellation) {
      return new NextResponse(null, { status: 204 })
    }

    // Return the active cancellation with all needed fields
    return NextResponse.json({
      id: activeCancellation.id,
      found_job: activeCancellation.found_job,
      downsell_variant: activeCancellation.downsell_variant,
      accepted_downsell: activeCancellation.accepted_downsell,
      found_with_mm: activeCancellation.found_with_mm,
      roles_applied_bucket: activeCancellation.roles_applied_bucket,
      companies_emailed_bucket: activeCancellation.companies_emailed_bucket,
      interviews_bucket: activeCancellation.interviews_bucket,
      feedback: activeCancellation.feedback,
      has_lawyer: activeCancellation.has_lawyer,
      visa: activeCancellation.visa,
      created_at: activeCancellation.created_at
    })

  } catch (error) {
    console.error('Error in active cancellation API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
