'use client';

import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-[22px] font-semibold text-[#111] mb-1">Dashboard</h1>
      <p className="text-[13px] text-[#6b6b6b] mb-8">Welcome to the NOOREMOON admin panel.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/admin/products"
          className="bg-white border border-[#e5e5e5] rounded-sm p-6 hover:border-[#111] transition-colors group"
        >
          <div className="text-2xl mb-3">◫</div>
          <p className="text-[14px] font-medium text-[#111] group-hover:underline">Products</p>
          <p className="text-[12px] text-[#6b6b6b] mt-1">Manage catalogue, images, variants</p>
        </Link>
      </div>
    </div>
  );
}
