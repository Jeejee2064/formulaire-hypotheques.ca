import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { pdf, name, email } = await req.json();

    if (!pdf || !name || !email) {
      return NextResponse.json(
        { error: 'Données manquantes: pdf, name ou email' },
        { status: 400 }
      );
    }

    const pdfBuffer = Buffer.from(pdf, 'base64');

    const data = await resend.emails.send({
      // MUST be a verified domain
      from: 'Hypothèques Info <no-reply@hypotheques.info>',

      // Final recipient
      to: ['vlesaux@hypotheques.ca'],

      // Allows replying directly to the client
      reply_to: email,

      subject: `NOUVEAU DOSSIER: ${name}`,

      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Nouvelle demande hypothécaire reçue</h2>
          <p><strong>Nom:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-CA')}</p>
          <br/>
          <p>Le dossier PDF est joint à cet email.</p>
        </div>
      `,

      attachments: [
        {
          filename: `Dossier_${name.replace(/\s+/g, '_')}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: 'Email envoyé avec succès',
      data,
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
