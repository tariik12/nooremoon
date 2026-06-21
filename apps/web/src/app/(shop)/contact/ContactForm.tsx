'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

const COUNTRY_CODES = [
  { code: '+880', flag: '🇧🇩', label: 'BD' },
  { code: '+91',  flag: '🇮🇳', label: 'IN' },
  { code: '+44',  flag: '🇬🇧', label: 'UK' },
  { code: '+1',   flag: '🇺🇸', label: 'US' },
  { code: '+971', flag: '🇦🇪', label: 'AE' },
];

export default function ContactForm() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '', message: '', countryCode: '+880',
  });
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const [codeOpen, setCodeOpen] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim())  e.lastName  = 'Required';
    if (!form.phone.trim())     e.phone     = 'Required';
    if (!form.email.trim())     e.email     = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (form.message.trim().length < 10) e.message = 'Please write at least 10 characters';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    setServerError('');
    try {
      const res = await fetch(`${API}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName:   form.firstName.trim(),
          lastName:    form.lastName.trim(),
          phone:       `${form.countryCode}${form.phone.trim()}`,
          email:       form.email.trim(),
          message:     form.message.trim(),
          countryCode: form.countryCode,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setSuccess(true);
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function field(key: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  }

  const selectedCountry = COUNTRY_CODES.find(c => c.code === form.countryCode) ?? COUNTRY_CODES[0];

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[#111]">Message Sent!</h3>
        <p className="text-sm text-[#6b6b6b] max-w-[280px]">
          Thank you for reaching out. We will get back to you within 24 hours.
        </p>
        <button
          onClick={() => { setSuccess(false); setForm({ firstName: '', lastName: '', phone: '', email: '', message: '', countryCode: '+880' }); }}
          className="mt-2 text-sm text-[#111] underline underline-offset-2 hover:opacity-60 transition-opacity"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* Row 1: First / Last name */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <input
            type="text" placeholder="First Name*" value={form.firstName}
            onChange={e => field('firstName', e.target.value)}
            className={`w-full h-11 px-4 rounded-lg border text-sm outline-none transition-colors
              ${errors.firstName ? 'border-red-400 focus:border-red-500' : 'border-[#ddd] focus:border-[#111]'}`}
          />
          {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
        </div>
        <div>
          <input
            type="text" placeholder="Last Name*" value={form.lastName}
            onChange={e => field('lastName', e.target.value)}
            className={`w-full h-11 px-4 rounded-lg border text-sm outline-none transition-colors
              ${errors.lastName ? 'border-red-400 focus:border-red-500' : 'border-[#ddd] focus:border-[#111]'}`}
          />
          {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
        </div>
      </div>

      {/* Row 2: Phone + Email */}
      <div className="grid grid-cols-2 gap-3">
        {/* Phone with country code */}
        <div>
          <div className={`flex items-center h-11 rounded-lg border overflow-hidden transition-colors
            ${errors.phone ? 'border-red-400' : 'border-[#ddd] focus-within:border-[#111]'}`}>
            {/* Country code picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCodeOpen(o => !o)}
                className="flex items-center gap-1 px-2.5 h-full text-sm text-[#444] hover:bg-[#f7f7f7] border-r border-[#ddd] whitespace-nowrap"
              >
                <span className="text-base">{selectedCountry.flag}</span>
                <span className="text-xs font-medium">{selectedCountry.code.replace('+','')}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {codeOpen && (
                <div className="absolute top-full left-0 z-20 bg-white border border-[#ddd] rounded-lg shadow-lg mt-1 w-[130px]">
                  {COUNTRY_CODES.map(c => (
                    <button
                      key={c.code} type="button"
                      onClick={() => { field('countryCode', c.code); setCodeOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-[#f7f7f7] text-left"
                    >
                      <span>{c.flag}</span>
                      <span className="text-xs text-[#6b6b6b]">{c.code}</span>
                      <span className="text-xs text-[#111]">{c.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="tel" placeholder="Phone Number*" value={form.phone}
              onChange={e => field('phone', e.target.value)}
              className="flex-1 px-3 text-sm outline-none bg-transparent h-full"
            />
          </div>
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>

        <div>
          <input
            type="email" placeholder="Email*" value={form.email}
            onChange={e => field('email', e.target.value)}
            className={`w-full h-11 px-4 rounded-lg border text-sm outline-none transition-colors
              ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-[#ddd] focus:border-[#111]'}`}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
      </div>

      {/* Message */}
      <div>
        <textarea
          placeholder="Message*" value={form.message} rows={6}
          onChange={e => field('message', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border text-sm outline-none resize-y transition-colors
            ${errors.message ? 'border-red-400 focus:border-red-500' : 'border-[#ddd] focus:border-[#111]'}`}
        />
        {errors.message && <p className="text-xs text-red-500 -mt-2">{errors.message}</p>}
      </div>

      {serverError && (
        <p className="text-sm text-red-500 text-center">{serverError}</p>
      )}

      <button
        type="submit" disabled={submitting}
        className="h-11 px-8 rounded-lg bg-[#111] text-white text-sm font-medium tracking-wide
          hover:bg-[#333] transition-colors disabled:bg-[#ccc] disabled:cursor-not-allowed self-start"
      >
        {submitting ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}
