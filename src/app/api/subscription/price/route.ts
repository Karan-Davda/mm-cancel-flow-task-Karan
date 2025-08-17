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

    // Get latest subscription for the user
    const { data: subscription, error } = await supabaseServer()
      .from('subscriptions')
      .select('monthly_price')
      .eq('user_id', mockUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching subscription:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subscription' },
        { status: 500 }
      )
    }

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      priceCents: subscription.monthly_price
    })

  } catch (error) {
    console.error('Error in subscription price API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
