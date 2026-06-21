'use client';

import { useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message ?? 'Something went wrong. Please try again.');
        return;
      }
      setSent(true);
    } catch {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block text-[22px] font-semibold tracking-[0.12em] uppercase text-[#111]">
          NOOREMOON
        </Link>
        <p className="mt-1 text-[13px] text-[#6b6b6b]">Reset your password</p>
      </div>

      <div className="bg-white border border-[#e5e5e5] rounded-sm p-8">
        {sent ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-[#e8f5e9] flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a5c4a" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-[15px] font-semibold text-[#111] mb-2">Check your email</h2>
            <p className="text-[13px] text-[#6b6b6b] leading-relaxed">
              If <span className="font-medium text-[#111]">{email}</span> is registered, we&apos;ve
              sent a password reset link. Check your inbox (and spam folder).
            </p>
            <p className="text-[12px] text-[#999] mt-4">The link expires in 1 hour.</p>
            <Link
              href="/login"
              className="mt-6 inline-block text-[12px] uppercase tracking-widest text-[#6b6b6b] hover:text-[#111] transition-colors underline underline-offset-2"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-[13px] text-[#6b6b6b] leading-relaxed">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            <div>
              <label htmlFor="email" className="block text-[11px] uppercase tracking-widest text-[#6b6b6b] mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-[#e5e5e5] rounded-sm px-3 py-2.5 text-[14px] text-[#111] placeholder-[#bbb] focus:outline-none focus:border-[#111] transition-colors"
              />
            </div>

            {error && (
              <p className="text-[13px] text-[#cc0000] bg-[#fff5f5] border border-[#fecaca] rounded-sm px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-[#111] text-white text-[12px] uppercase tracking-widest py-3 rounded-sm hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>

            <p className="text-center text-[12px] text-[#6b6b6b]">
              Remember your password?{' '}
              <Link href="/login" className="text-[#111] hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
