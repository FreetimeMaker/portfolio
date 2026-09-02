import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { name, email, message, company } = await request.json();

    // Honeypot-Check gegen Spam
    if (company && company.trim() !== '') {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Bitte alle Pflichtfelder ausfüllen.' }, { status: 400 });
    }

    // 1. In Supabase speichern
    const { error: dbError } = await supabase
      .from('contacts')
      .insert([{ name, email, message }]);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // 2. Benachrichtigung an deine Proton Mail senden
    await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: process.env.PROTON_EMAIL,
      replyTo: email,
      subject: `Neue Portfolio-Anfrage von ${name}`,
      html: `
        <h3>Neue Kontaktanfrage</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>E-Mail:</strong> ${email}</p>
        <p><strong>Nachricht:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    // 4. Bestätigungs-Mail an den Absender schicken
    await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: email, // Geht an die E-Mail des Besuchers
      replyTo: process.env.PROTON_EMAIL, // Antworten des Besuchers gehen an deine Proton Mail
      subject: 'Bestätigung deiner Kontaktanfrage',
      html: `
        <p>Hallo ${name},</p>
        <p>vielen Dank für deine Nachricht! Ich habe sie erhalten und werde mich so schnell wie möglich bei dir melden.</p>
        <br>
        <p>Viele Grüße,</p>
        <p>Dein Freetime Maker</p>
      `,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 });
  }
}