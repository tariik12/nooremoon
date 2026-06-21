'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (!token) setError('Invalid or missing reset token. Please request a new link.');
  }, [token]);

  const mismatch = confirm.length > 0 && password !== confirm;
  const weak = password.length > 0 && password.length < 8;

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!token || password !== confirm || password.length < 8) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.message ?? 'Reset failed. The link may have expired.');
        return;
      }
      setDone(true);
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
        <p className="mt-1 text-[13px] text-[#6b6b6b]">Set a new password</p>
      </div>

      <div className="bg-white border border-[#e5e5e5] rounded-sm p-8">
        {done ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-[#e8f5e9] flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a5c4a" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-[15px] font-semibold text-[#111] mb-2">Password updated!</h2>
            <p className="text-[13px] text-[#6b6b6b]">
              Your password has been changed. You can now sign in with your new password.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block w-full bg-[#111] text-white text-[12px] uppercase tracking-widest py-3 rounded-sm hover:bg-[#333] transition-colors text-center"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {!token && (
              <p className="text-[13px] text-[#cc0000] bg-[#fff5f5] border border-[#fecaca] rounded-sm px-3 py-2">
                Invalid or missing reset token. Please{' '}
                <Link href="/forgot-password" className="underline">request a new link</Link>.
              </p>
            )}

            <div>
              <label htmlFor="password" className="block text-[11px] uppercase tracking-widest text-[#6b6b6b] mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className={`w-full border rounded-sm px-3 py-2.5 pr-10 text-[14px] text-[#111] placeholder-[#bbb] focus:outline-none transition-colors ${weak ? 'border-[#f59e0b] focus:border-[#f59e0b]' : 'border-[#e5e5e5] focus:border-[#111]'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#111] transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {weak && (
                <p className="text-[11px] text-[#f59e0b] mt-1">Password must be at least 8 characters</p>
              )}
            </div>

            <div>
              <label htmlFor="confirm" className="block text-[11px] uppercase tracking-widest text-[#6b6b6b] mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirm"
                type={showPass ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                className={`w-full border rounded-sm px-3 py-2.5 text-[14px] text-[#111] placeholder-[#bbb] focus:outline-none transition-colors ${mismatch ? 'border-[#cc0000] focus:border-[#cc0000]' : 'border-[#e5e5e5] focus:border-[#111]'}`}
              />
              {mismatch && (
                <p className="text-[11px] text-[#cc0000] mt-1">Passwords do not match</p>
              )}
            </div>

            {error && (
              <p className="text-[13px] text-[#cc0000] bg-[#fff5f5] border border-[#fecaca] rounded-sm px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !token || password.length < 8 || password !== confirm}
              className="w-full bg-[#111] text-white text-[12px] uppercase tracking-widest py-3 rounded-sm hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md text-center text-[#6b6b6b] text-sm">Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
