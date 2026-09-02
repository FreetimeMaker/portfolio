import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    company: '', // Honeypot-Feld gegen Spam
  });

  const [status, setStatus] = useState({ loading: false, message: '', error: false });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: '', error: false });

    try {
      // Sendet die Daten an deinen Express-Server
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Fehler beim Senden der Nachricht.');
      }

      setStatus({
        loading: false,
        message: 'Nachricht erfolgreich gesendet! Eine Bestätigung wurde verschickt.',
        error: false,
      });

      // Formular zurücksetzen
      setFormData({ name: '', email: '', message: '', company: '' });
    } catch (err) {
      setStatus({
        loading: false,
        message: err.message || 'Etwas ist schiefgelaufen.',
        error: true,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      {/* HONEYPOT FELD: Versteckt für Menschen, Bots füllen es aus */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          type="text"
          id="company"
          name="company"
          tabIndex="-1"
          autoComplete="off"
          value={formData.company}
          onChange={handleChange}
        />
      </div>

      {/* NORMALE FELDER */}
      <div className="form-group">
        <input
          type="text"
          name="name"
          placeholder="Dein Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <input
          type="email"
          name="email"
          placeholder="Deine E-Mail-Adresse"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <textarea
          name="message"
          placeholder="Deine Nachricht"
          value={formData.message}
          onChange={handleChange}
          required
          rows="5"
        />
      </div>

      <button type="submit" disabled={status.loading}>
        {status.loading ? 'Wird gesendet...' : 'Nachricht senden'}
      </button>

      {status.message && (
        <p className={`status-message ${status.error ? 'error' : 'success'}`}>
          {status.message}
        </p>
      )}
    </form>
  );
}