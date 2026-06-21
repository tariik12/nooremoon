import Link from 'next/link';
import { fetchSettings } from '@/lib/api';
import ContactForm from './ContactForm';

export const revalidate = 600;

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with our team. We are here to help.',
};

export default async function ContactPage() {
  const settings = await fetchSettings();

  const phone   = settings.support_phone   ?? '09666774577';
  const email   = settings.support_email   ?? 'support@nooremoon.global';
  const hours   = settings.support_hours   ?? '09:00 AM – 06:00 PM';

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-16 px-4">
      <h1 className="text-[2.25rem] font-bold text-center text-[#111] mb-12 tracking-tight">
        Contact Us
      </h1>

      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm overflow-visible">
        <div className="grid md:grid-cols-[1fr_1.4fr]">

          {/* ── Left: contact info ─────────────────────────── */}
          <div className="p-8 md:p-10 md:border-r border-[#f0f0f0]">

            {/* Call Us */}
            <div className="mb-8 pb-8 border-b border-[#f0f0f0]">
              <div className="flex items-center gap-2.5 mb-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.8">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <h3 className="font-semibold text-[#111] text-[15px]">Call Us:</h3>
              </div>
              <p className="text-sm text-[#6b6b6b] mb-2">
                We&apos;re available from {hours}
              </p>
              <p className="font-bold text-[#111] text-[15px]">{phone}</p>
            </div>

            {/* Write to Us */}
            <div className="mb-8 pb-8 border-b border-[#f0f0f0]">
              <div className="flex items-center gap-2.5 mb-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.8">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <h3 className="font-semibold text-[#111] text-[15px]">Write to Us:</h3>
              </div>
              <p className="text-sm text-[#6b6b6b] mb-2">
                Submit the form, and we&apos;ll contact you soon.
              </p>
              <a
                href={`mailto:${email}`}
                className="font-bold text-[#111] text-[15px] hover:opacity-60 transition-opacity"
              >
                {email}
              </a>
            </div>

            {/* Find Us */}
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.8">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <h3 className="font-semibold text-[#111] text-[15px]">Find Us:</h3>
              </div>
              <p className="text-sm text-[#6b6b6b] mb-2">
                Want to visit our Store Locations?
              </p>
              <Link
                href="/stores"
                className="font-bold text-[#111] text-[15px] underline underline-offset-2 hover:opacity-60 transition-opacity"
              >
                Store Locator
              </Link>
            </div>
          </div>

          {/* ── Right: form ────────────────────────────────── */}
          <div className="p-8 md:p-10">
            <ContactForm />
          </div>

        </div>
      </div>
    </div>
  );
}
