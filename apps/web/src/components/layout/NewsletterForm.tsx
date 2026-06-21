'use client';

import { useState } from 'react';

interface Props {
  dark?: boolean;
}

export default function NewsletterForm({ dark = false }: Props) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail('');
  }

  if (submitted) {
    return <p className={`text-xs ${dark ? 'text-[#888]' : 'text-[#6b6b6b]'}`}>Thank you for subscribing!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Your email"
        required
        className={`flex-1 min-w-0 text-xs px-3 py-2 focus:outline-none ${
          dark
            ? 'bg-transparent border border-[#333] text-[#ccc] placeholder-[#555] focus:border-[#666]'
            : 'border border-[#e5e5e5] text-[#111] placeholder-[#aaa] focus:border-[#111]'
        }`}
      />
      <button
        type="submit"
        className={`text-[10px] font-semibold tracking-widest uppercase px-4 py-2 transition-colors ${
          dark
            ? 'bg-white text-[#111] hover:bg-[#e5e5e5]'
            : 'bg-[#111] text-white hover:bg-[#333]'
        }`}
      >
        Join
      </button>
    </form>
  );
}
