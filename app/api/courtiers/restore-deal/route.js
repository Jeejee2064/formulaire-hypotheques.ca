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
      <h2>📂 Dossier rétabli</h2>
      <p>${intro}</p>
      <p><strong>Courtier:</strong> ${deal.broker_name}</p>
      <p><strong>Type:</strong> ${deal.type_demande} — Dossier ${deal.dossier_type}</p>
      <p><strong>Ville:</strong> ${deal.ville}</p>
      <p><strong>Montant:</strong> ${fmt(deal.loan_amount)}</p>
      ${deal.notes ? `<p><strong>Notes:</strong> ${deal.notes}</p>` : ''}
    </div>
  `
}

export async function POST(req) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    // Récupérer le profil pour vérifier si admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'
    const { dealId } = await req.json()

    // Récupérer le deal d'abord pour vérifier les permissions
    const { data: existingDeal } = await supabase
      .from('deals')
      .select('created_by, status')
      .eq('id', dealId)
      .single()

    if (!existingDeal) {
      return NextResponse.json({ error: 'Dossier non trouvé' }, { status: 404 })
    }

    if (existingDeal.status !== 'cancelled') {
      return NextResponse.json({ error: 'Le dossier n\'est pas annulé' }, { status: 400 })
    }

    // Vérifier permissions: admin OU créateur du dossier
    const isCreator = existingDeal.created_by === user.id
    if (!isAdmin && !isCreator) {
      return NextResponse.json({ error: 'Non autorisé à rétablir ce dossier' }, { status: 403 })
    }

    // Rétablir le dossier: cancelled -> open
    const { data: deal, error } = await supabase
      .from('deals')
      .update({
        status: 'open',
        // On garde taken_by et taken_at à null car le dossier redevient disponible
        taken_by: null,
        taken_at: null,
      })
      .eq('id', dealId)
      .select(`*, creator:profiles!deals_created_by_fkey(name,email)`)
      .single()

    if (error || !deal) {
      return NextResponse.json({ error: 'Impossible de rétablir ce dossier' }, { status: 400 })
    }

    const restorerName = user.email.split('@')[0]
    const creatorEmail = deal.creator?.email
    const adminEmail = process.env.ADMIN_EMAIL

    // Tous les courtiers sauf le créateur
    const { data: profiles } = await supabase.from('profiles').select('email')
    const otherBrokers = profiles
      ?.map(p => p.email)
      .filter(e => e && e !== creatorEmail && e !== adminEmail)

    const sends = []

    // 1. CRÉATEUR — notifié séparément
    if (creatorEmail) {
      sends.push(resend.emails.send({
        from: 'Plateforme <no-reply@hypotheques.info>',
        to: creatorEmail,
        subject: `📬 Votre dossier a été rétabli`,
        html: buildEmail({
          intro: `Votre dossier a été rétabli par ${restorerName} et est de nouveau disponible.`,
          deal,
        }),
      }))
    }

    // 2. AUTRES COURTIERS + ADMIN en BCC
    if (adminEmail || otherBrokers?.length) {
      const toAddress = adminEmail || otherBrokers[0]
      const bccAddresses = adminEmail
        ? otherBrokers
        : otherBrokers.slice(1)

      const emailPayload = {
        from: 'Plateforme <no-reply@hypotheques.info>',
        to: toAddress,
        subject: `🟢 Dossier rétabli — ${fmt(deal.loan_amount)}`,
        html: buildEmail({
          intro: `${restorerName} a rétabli un dossier annulé. Il est de nouveau disponible.`,
          deal,
        }),
      }
      if (bccAddresses?.length) emailPayload.bcc = bccAddresses

      sends.push(resend.emails.send(emailPayload))
    }

    await Promise.allSettled(sends)

    return NextResponse.json({ success: true, deal })

  } catch (err) {
    console.error('RESTORE DEAL ERROR:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}