'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/authSlice';
import { apiLogin, storeTokens } from '@/lib/auth';

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      storeTokens(data.accessToken, data.refreshToken);
      dispatch(setCredentials({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      }));
      const isAdmin = data.user.role?.name === 'admin';
      router.push(isAdmin ? '/admin' : '/profile');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Brand */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-block text-[22px] font-semibold tracking-[0.12em] uppercase text-[#111]">
          NOOREMOON
        </Link>
        <p className="mt-1 text-[13px] text-[#6b6b6b]">Sign in to your account</p>
      </div>

      <div className="bg-white border border-[#e5e5e5] rounded-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-[#e5e5e5] rounded-sm px-3 py-2.5 text-[14px] text-[#111] placeholder-[#bbb] focus:outline-none focus:border-[#111] transition-colors"
            />
          </div>

          {error && (
            <p className="text-[13px] text-[#cc0000] bg-[#fff5f5] border border-[#fecaca] rounded-sm px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between">
            <Link href="/forgot-password" className="text-[12px] text-[#6b6b6b] hover:text-[#111] transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#111] text-white text-[12px] uppercase tracking-widest py-3 rounded-sm hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#e5e5e5] text-center">
          <p className="text-[13px] text-[#6b6b6b]">
            New to NOOREMOON?{' '}
            <Link href="/register" className="text-[#111] underline underline-offset-2">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
