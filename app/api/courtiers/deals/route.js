import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function fmt(n) {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(n)
}

function buildEmail({ broker_name, type_demande, dossier_type, ville, loan_amount, notes }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  return `
    <div style="font-family: Arial; padding:20px;">
      <h2>📂 Nouveau dossier disponible</h2>

      <p><strong>Courtier:</strong> ${broker_name}</p>
      <p><strong>Type:</strong> ${type_demande} — Dossier ${dossier_type}</p>
      <p><strong>Ville:</strong> ${ville}</p>
      <p><strong>Montant:</strong> ${fmt(loan_amount)}</p>

      ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}

      <br/>
      <a href="${appUrl}/courtiers/dashboard">Voir le dossier</a>
    </div>
  `
}

export async function POST(req) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await req.json()
    const { broker_name, type_demande, dossier_type, ville, loan_amount, notes } = body

    if (!broker_name || !type_demande || !dossier_type || !ville || !loan_amount) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    // INSERT
    const { data: deal, error } = await supabase
      .from('deals')
      .insert({
        created_by: user.id,
        broker_name,
        type_demande,
        dossier_type,
        ville,
        loan_amount,
        notes,
        status: 'open',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // GET ALL COURTIERS
    const { data: profiles } = await supabase.from('profiles').select('email')

    const bccRecipients = profiles
      ?.map(p => p.email)
      .filter(e => e && e !== user.email && e !== process.env.ADMIN_EMAIL)

    // ✅ SINGLE EMAIL
    const res = await resend.emails.send({
      from: 'Hypotheques Market <no-reply@hypotheques.info>',
      to: process.env.ADMIN_EMAIL,
      bcc: bccRecipients,
      subject: `📂 Nouveau dossier — ${fmt(loan_amount)} — ${ville}`,
      html: buildEmail({ broker_name, type_demande, dossier_type, ville, loan_amount, notes }),
    })

    console.log('RESEND CREATE:', res)

    return NextResponse.json({ success: true, deal })

  } catch (err) {
    console.error('CREATE DEAL ERROR:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}