import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { invoiceId, paymentStatus } = await request.json()

    if (!invoiceId || !paymentStatus) {
      return NextResponse.json(
        { error: 'Invoice ID and payment status are required' },
        { status: 400 }
      )
    }

    // Update invoice payment status
    const { data, error } = await supabase
      .from('invoices')
      .update({ 
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId)
      .select()

    if (error) {
      console.error('Error updating invoice payment status:', error)
      return NextResponse.json(
        { error: 'Failed to update invoice payment status' },
        { status: 500 }
      )
    }

    if (paymentStatus === 'paid') {
      // Also update the related appointment payment status
      const invoice = data[0]
      if (invoice.appointment_id) {
        await supabase
          .from('appointments')
          .update({ payment_status: 'paid' })
          .eq('id', invoice.appointment_id)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Payment status updated successfully',
      invoice: data[0]
    })

  } catch (error) {
    console.error('Error in payment update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}