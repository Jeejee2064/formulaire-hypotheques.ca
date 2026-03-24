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

function buildEmail({ intro, deal }) {
  return `
    <div style="font-family: Arial; padding:20px;">
      <h2>📂 Dossier remis disponible</h2>
      <p>${intro}</p>
      <p><strong>Courtier:</strong> ${deal.broker_name}</p>
      <p><strong>Type:</strong> ${deal.type_demande} — Dossier ${deal.dossier_type}</p>
      <p><strong>Ville:</strong> ${deal.ville}</p>
      <p><strong>Montant:</strong> ${fmt(deal.loan_amount)}</p>
    </div>
  `
}

export async function POST(req) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { dealId } = await req.json()

    const { data: deal, error } = await supabase
      .from('deals')
      .update({
        status: 'open',
        taken_by: null,
        taken_at: null,
      })
      .eq('id', dealId)
      .eq('taken_by', user.id) // sécurité — seul celui qui a pris peut libérer
      .select(`*, creator:profiles!deals_created_by_fkey(name,email)`)
      .single()

    if (error || !deal) {
      return NextResponse.json({ error: 'Impossible de libérer ce dossier' }, { status: 400 })
    }

    const releaserName = user.email.split('@')[0]
    const creatorEmail = deal.creator?.email
    const adminEmail = process.env.ADMIN_EMAIL

    // Tous les courtiers sauf le créateur
    const { data: profiles } = await supabase.from('profiles').select('email')
    const otherBrokers = profiles
      ?.map(p => p.email)
      .filter(e => e && e !== creatorEmail && e !== adminEmail) // exclure admin ici aussi

    const sends = []

    // 1. CRÉATEUR — notifié séparément, message personnalisé
    if (creatorEmail) {
      sends.push(resend.emails.send({
        from: 'Plateforme <no-reply@hypotheques.info>',
        to: creatorEmail,
        subject: `📬 Votre dossier est de nouveau disponible`,
        html: buildEmail({
          intro: `Le dossier que vous avez proposé a été libéré par ${releaserName} et est de nouveau disponible.`,
          deal,
        }),
      }))
    }

    // 2. AUTRES COURTIERS + ADMIN en BCC dans un seul envoi
    //    L'admin reçoit l'email "to" principal, les autres en BCC
    //    → admin ne reçoit qu'un seul email au total
    if (adminEmail || otherBrokers?.length) {
      const toAddress = adminEmail || otherBrokers[0]
      const bccAddresses = adminEmail
        ? otherBrokers  // admin est "to", brokers en bcc
        : otherBrokers.slice(1) // pas d'admin, premier broker est "to", reste en bcc

      const emailPayload = {
        from: 'Plateforme <no-reply@hypotheques.info>',
        to: toAddress,
        subject: `🟢 Dossier de nouveau disponible — ${fmt(deal.loan_amount)}`,
        html: buildEmail({
          intro: `${releaserName} a libéré un dossier. Il est de nouveau disponible.`,
          deal,
        }),
      }
      if (bccAddresses?.length) emailPayload.bcc = bccAddresses

      sends.push(resend.emails.send(emailPayload))
    }

    await Promise.allSettled(sends)

    return NextResponse.json({ success: true, deal })

  } catch (err) {
    console.error('RELEASE DEAL ERROR:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}