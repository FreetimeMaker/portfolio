import express from 'express';
import { supabase } from './lib/supabase.js';
import { Resend } from 'resend';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/favicons', express.static(path.join(__dirname, 'favicons')));
app.use('/components', express.static(path.join(__dirname, 'components')));
app.use('/style.css', express.static(path.join(__dirname, 'style.css')));
app.use('/script.js', express.static(path.join(__dirname, 'script.js')));

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

app.post('/api/contact', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase ist nicht konfiguriert.' });
    }

    const { name, email, company } = req.body;
    const message = req.body.message || req.body.comment;

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

    if (resend && process.env.PROTON_EMAIL) {
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
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: 'Serverfehler' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get(['/geoweather.html', '/geoweather'], (req, res) => {
  res.sendFile(path.join(__dirname, 'geoweather.html'));
});

app.get(['/ssmpc.html', '/ssmpc'], (req, res) => {
  res.sendFile(path.join(__dirname, 'ssmpc.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});