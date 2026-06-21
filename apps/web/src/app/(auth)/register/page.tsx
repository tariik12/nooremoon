'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRegister } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const data = await apiRegister({ email, password, firstName, lastName });
      setSuccess(data.message);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
        <p className="mt-1 text-[13px] text-[#6b6b6b]">Create your account</p>
      </div>

      <div className="bg-white border border-[#e5e5e5] rounded-sm p-8">
        {success ? (
          <div className="text-center space-y-3">
            <div className="text-2xl">&#10003;</div>
            <p className="text-[14px] text-[#111]">{success}</p>
            <p className="text-[12px] text-[#6b6b6b]">Redirecting to sign in…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-[11px] uppercase tracking-widest text-[#6b6b6b] mb-1.5">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Noore"
                  className="w-full border border-[#e5e5e5] rounded-sm px-3 py-2.5 text-[14px] text-[#111] placeholder-[#bbb] focus:outline-none focus:border-[#111] transition-colors"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-[11px] uppercase tracking-widest text-[#6b6b6b] mb-1.5">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Moon"
                  className="w-full border border-[#e5e5e5] rounded-sm px-3 py-2.5 text-[14px] text-[#111] placeholder-[#bbb] focus:outline-none focus:border-[#111] transition-colors"
                />
              </div>
            </div>

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

            <div>
              <label htmlFor="password" className="block text-[11px] uppercase tracking-widest text-[#6b6b6b] mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full border border-[#e5e5e5] rounded-sm px-3 py-2.5 text-[14px] text-[#111] placeholder-[#bbb] focus:outline-none focus:border-[#111] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="confirm" className="block text-[11px] uppercase tracking-widest text-[#6b6b6b] mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirm"
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
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
              disabled={loading}
              className="w-full bg-[#111] text-white text-[12px] uppercase tracking-widest py-3 rounded-sm hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>

            <p className="text-center text-[11px] text-[#999] leading-relaxed">
              By creating an account you agree to our{' '}
              <Link href="/terms" className="text-[#111] underline underline-offset-2">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-[#111] underline underline-offset-2">Privacy Policy</Link>.
            </p>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-[#e5e5e5] text-center">
          <p className="text-[13px] text-[#6b6b6b]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#111] underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
