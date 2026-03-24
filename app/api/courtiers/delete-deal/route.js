import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { dealId } = await req.json()

    // Fetch the requester's role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'

    // Build the query:
    // - Admin can cancel any deal
    // - Broker can only cancel their own deal
    let query = supabase
      .from('deals')
      .update({ status: 'cancelled' })
      .eq('id', dealId)

    if (!isAdmin) {
      query = query.eq('created_by', user.id) // sécurité — courtier limité à ses propres dossiers
    }

    const { error } = await query

    if (error) {
      return NextResponse.json({ error: 'Impossible d\'annuler ce dossier' }, { status: 400 })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}