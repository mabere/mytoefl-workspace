import React from "react";
import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12 font-sans text-slate-900">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-12">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <SearchX className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">404</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Alamat yang Anda buka tidak tersedia atau sudah dipindahkan. Kembali ke beranda untuk melanjutkan.</p>
        <Link href="/" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#0b2a4a] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#123f67]">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
