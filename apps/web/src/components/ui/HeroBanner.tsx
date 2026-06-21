'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { Banner } from '@/lib/api';

interface Props {
  banners: Banner[];
}

export default function HeroBanner({ banners }: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!banners.length) return null;
  const banner = banners[current];

  return (
    <div className="relative w-full h-[60vh] min-h-[460px] max-h-[720px] overflow-hidden bg-[#1a1a1a]">
      <Image
        key={banner.id}
        src={banner.imageUrl}
        alt={banner.title}
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-70 transition-opacity duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 via-[#0a0a0a]/20 to-transparent" />

      {/* Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <h1 className="font-heading font-bold text-4xl md:text-6xl text-white tracking-tight leading-tight max-w-2xl drop-shadow">
          {banner.title}
        </h1>
        {banner.subtitle && (
          <p className="mt-4 text-base md:text-lg text-white/85 max-w-lg leading-relaxed">
            {banner.subtitle}
          </p>
        )}
        {banner.linkUrl && (
          <Link
            href={banner.linkUrl}
            className="mt-8 inline-block bg-[#fafafa] text-[#0a0a0a] text-xs font-semibold tracking-widest uppercase px-8 py-3.5 hover:bg-[#b8972e] hover:text-white transition-colors"
          >
            Shop Now
          </Link>
        )}
      </div>

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white scale-125' : 'bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
