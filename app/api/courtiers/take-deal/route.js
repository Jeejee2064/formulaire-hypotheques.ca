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

function buildEmail({ intro, deal, takerName }) {
  return `
    <div style="font-family: Arial; padding:20px;">
      <h2>✅ Dossier pris</h2>

      <p>${intro}</p>

      <hr style="margin:20px 0;border:none;border-top:1px solid #eee;" />

      <p><strong>Courtier:</strong> ${deal.broker_name}</p>
      <p><strong>Type:</strong> ${deal.type_demande} — Dossier ${deal.dossier_type}</p>
      <p><strong>Ville:</strong> ${deal.ville}</p>
      <p><strong>Montant:</strong> ${fmt(deal.loan_amount)}</p>
      <p><strong>Repris par:</strong> ${takerName}</p>
    </div>
  `
}

export async function POST(req) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { dealId } = await req.json()

    if (!dealId) {
      return NextResponse.json({ error: 'dealId manquant' }, { status: 400 })
    }

    // 🔒 SAFE UPDATE
    const { data: deal, error } = await supabase
      .from('deals')
      .update({
        status: 'taken',
        taken_by: user.id,
        taken_at: new Date().toISOString(),
      })
      .eq('id', dealId)
      .eq('status', 'open')
      .select(`
        *,
        creator:profiles!deals_created_by_fkey(name,email),
        taker:profiles!deals_taken_by_fkey(name,email)
      `)
      .single()

    if (error || !deal) {
      return NextResponse.json({ error: 'Déjà pris' }, { status: 409 })
    }

    // 👤 Names
    const takerName =
      deal.taker?.name ||
      deal.taker?.email?.split('@')[0] ||
      'Courtier'

    const creatorName =
      deal.creator?.name ||
      deal.creator?.email?.split('@')[0] ||
      'Courtier'

    const adminEmail = process.env.ADMIN_EMAIL
    const creatorEmail = deal.creator?.email
    const takerEmail = deal.taker?.email

    const sends = []

    // ✅ ADMIN EMAIL
    if (adminEmail) {
      sends.push(
        resend.emails.send({
          from: 'Hypotheques Market <no-reply@hypotheques.info>',
          to: adminEmail,
          subject: `✅ Dossier pris — ${deal.type_demande} ${fmt(deal.loan_amount)} — ${deal.ville}`,
          html: buildEmail({
            intro: `<strong>${takerName}</strong> a pris un dossier de <strong>${creatorName}</strong>.`,
            deal,
            takerName,
          }),
        })
      )
    }

    // ✅ CREATOR EMAIL
    if (creatorEmail && creatorEmail !== takerEmail) {
      sends.push(
        resend.emails.send({
          from: 'Hypotheques Market <no-reply@hypotheques.info>',
          to: creatorEmail,
          subject: `📬 Ton dossier a été pris`,
          html: buildEmail({
            intro: `Ton dossier a été pris par <strong>${takerName}</strong>.`,
            deal,
            takerName,
          }),
        })
      )
    }

    // ✅ TAKER EMAIL
    if (takerEmail) {
      sends.push(
        resend.emails.send({
          from: 'Hypotheques Market <no-reply@hypotheques.info>',
          to: takerEmail,
          subject: `✅ Tu as pris un dossier`,
          html: buildEmail({
            intro: `Tu as pris ce dossier avec succès.`,
            deal,
            takerName,
          }),
        })
      )
    }

    const results = await Promise.allSettled(sends)

    console.log('RESEND TAKE:', results)

    return NextResponse.json({ success: true, deal })

  } catch (err) {
    console.error('TAKE DEAL ERROR:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}