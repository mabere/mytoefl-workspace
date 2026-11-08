import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { appFetch as fetch, appUrl } from "@/lib/appUrl";

interface Branding {
  logoUrl: string;
  institutionName: string;
  institutionAddress?: string;
  institutionContact?: string;
}

export function PublicPageShell({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  const [branding, setBranding] = useState<Branding | null>(null);

  useEffect(() => {
    fetch("/api/branding")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => data && setBranding(data))
      .catch(() => undefined);
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f8fb] font-sans text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Kembali ke beranda">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
              <img src={appUrl(branding?.logoUrl || "/branding/institution-logo.svg")} alt={branding?.institutionName || "Logo institusi"} className="h-full w-full object-contain p-1" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-extrabold text-[#0b2a4a] sm:text-base">{branding?.institutionName || "TOEFL ITP Practice"}</span>
              <span className="block text-[11px] font-medium text-slate-500">TOEFL ITP Practice &amp; Test Portal</span>
            </span>
          </Link>
          <Link href="/" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Beranda
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0b2a4a] sm:text-4xl">{title}</h1>
          <div className="mt-8 space-y-7 text-sm leading-7 text-slate-600">{children}</div>
        </div>
      </main>
      <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center text-xs text-slate-500">
        {branding?.institutionName || "TOEFL ITP Practice"}{branding?.institutionAddress ? ` · ${branding.institutionAddress}` : ""}
        {branding?.institutionContact ? <span className="block mt-1">{branding.institutionContact}</span> : null}
      </footer>
    </div>
  );
}
