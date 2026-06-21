import Image from 'next/image';
import Link from 'next/link';

export const revalidate = 3600;

export const metadata = {
  title: 'Store Locations',
  description: 'Find a store near you. Visit us in Dhaka, Chattogram, Sylhet and more.',
};

interface StoreLocation {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  businessHoursText: string | null;
  heroImageUrl: string | null;
  mapsUrl: string | null;
}

async function fetchStores(): Promise<StoreLocation[]> {
  const API = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
  try {
    const res = await fetch(`${API}/store-locations`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function StoresPage() {
  const stores = await fetchStores();

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-16 px-4">
      <h1 className="text-[2.25rem] font-bold text-center text-[#111] mb-12 tracking-tight">
        Store Locations
      </h1>

      {stores.length === 0 ? (
        <p className="text-center text-[#6b6b6b] text-sm">No store locations found.</p>
      ) : (
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map(store => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}
    </div>
  );
}

function StoreCard({ store }: { store: StoreLocation }) {
  const heroSrc = store.heroImageUrl ?? 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80';

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Hero image with store name overlay */}
      <div className="relative h-[220px] overflow-hidden">
        <Image
          src={heroSrc}
          alt={store.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        {/* Store name */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-white text-[15px] font-semibold leading-snug drop-shadow-sm">
            {store.name}
          </p>
        </div>
      </div>

      {/* Info section */}
      <div className="p-5 flex flex-col gap-3">
        {store.address && (
          <div className="flex gap-2.5">
            <svg className="shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="1.8">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <p className="text-xs text-[#4a6fa5] leading-snug">{store.address}</p>
          </div>
        )}

        {store.businessHoursText && (
          <div className="flex gap-2.5">
            <svg className="shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <p className="text-xs text-[#444] leading-snug">
              <span className="font-medium">Business Hours:</span>{' '}
              {store.businessHoursText}
            </p>
          </div>
        )}

        {store.phone && (
          <div className="flex gap-2.5">
            <svg className="shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="1.8">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <p className="text-xs text-[#444]">
              <span className="font-medium">Contact:</span>{' '}
              <a href={`tel:${store.phone}`} className="text-[#4a6fa5] hover:underline">{store.phone}</a>
            </p>
          </div>
        )}

        {store.mapsUrl && (
          <Link
            href={store.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#111] hover:opacity-60 transition-opacity mt-1"
          >
            Get Direction
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}
