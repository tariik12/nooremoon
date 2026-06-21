import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </div>
      <footer className="text-center text-[11px] text-[#999] py-4">
        &copy; {new Date().getFullYear()} NOOREMOON. All rights reserved.
      </footer>
    </div>
  );
}
