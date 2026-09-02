import express from 'express';
import { supabase } from './lib/supabase.';
import { Resend } from 'resend';

const app = express();
app.use(express.json()); // Wichtig: Parst JSON-Anfragen im Body

const resend = new Resend(process.env.RESEND_API_KEY);

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message, company } = req.body;

    // 1. Honeypot-Check gegen Spam (Silent Fail für Bots)
    if (company && company.trim() !== '') {
      return res.status(200).json({ success: true });
    }

    // Validierung
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Bitte alle Pflichtfelder ausfüllen.' });
    }

    // 2. In Supabase speichern
    const { error: dbError } = await supabase
      .from('contacts')
      .insert([{ name, email, message }]);

    if (dbError) {
      return res.status(500).json({ error: dbError.message });
    }

    // 3. Benachrichtigung an deine Proton Mail senden
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
      to: email,
      replyTo: process.env.PROTON_EMAIL,
      subject: 'Bestätigung deiner Kontaktanfrage',
      html: `
        <p>Hallo ${name},</p>
        <p>vielen Dank für deine Nachricht! Ich habe sie erhalten und werde mich so schnell wie möglich bei dir melden.</p>
        <br>
        <p>Viele Grüße,</p>
        <p>Dein Portfolio-Team</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: 'Serverfehler' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});