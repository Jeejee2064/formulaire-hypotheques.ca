import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialisez Resend avec votre clé API
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { pdf, name, email } = await req.json();

    // Validation des données requises
    if (!pdf || !name || !email) {
      return NextResponse.json(
        { error: 'Données manquantes: pdf, name ou email' },
        { status: 400 }
      );
    }

    // Décodez le base64 si nécessaire
    const pdfBuffer = Buffer.from(pdf, 'base64');

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', // Vous pouvez aussi utiliser un domaine vérifié
      to: 'jeejee2064@gmail.com', // Remplacez par votre email
      reply_to: email, // Optionnel: permet de répondre au client
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
          filename: `Dossier_${name.replace(/\s/g, '_')}_${Date.now()}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (data.error) {
      console.error('Erreur Resend:', data.error);
      return NextResponse.json(
        { error: data.error.message || 'Erreur lors de l\'envoi de l\'email' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email envoyé avec succès',
      data 
    });
    
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}