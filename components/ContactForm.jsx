'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    company: '', // Honeypot-Feld
  });
  const [status, setStatus] = useState({ loading: false, message: '', error: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: '', error: false });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Fehler beim Senden.');
      }

      setStatus({ loading: false, message: 'Nachricht erfolgreich gesendet!', error: false });
      setFormData({ name: '', email: '', message: '', company: '' });
    } catch (err) {
      setStatus({ loading: false, message: err.message, error: true });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto">
      {/* --- HONEYPOT FIELD (Versteckt für echte User) --- */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          type="text"
          id="company"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        />
      </div>

      {/* --- NORMALE FORMULARFELDER --- */}
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="p-2 border rounded"
        required
      />
      <input
        type="email"
        placeholder="E-Mail"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className="p-2 border rounded"
        required
      />
      <textarea
        placeholder="Deine Nachricht"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        className="p-2 border rounded h-32"
        required
      />
      <button
        type="submit"
        disabled={status.loading}
        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {status.loading ? 'Senden...' : 'Abschicken'}
      </button>

      {status.message && (
        <p className={status.error ? 'text-red-500' : 'text-green-500'}>
          {status.message}
        </p>
      )}
    </form>
  );
}