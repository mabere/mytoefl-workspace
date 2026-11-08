import React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  panelTitle: string;
  panelDescription: string;
  panelItems: string[];
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AuthShell({
  eyebrow,
  title,
  description,
  panelTitle,
  panelDescription,
  panelItems,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[#f6f8fb] font-sans text-slate-900">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Kembali ke halaman utama TOEFL ITP Practice">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b2a4a] text-xs font-black tracking-tight text-white">ITP</span>
            <span>
              <span className="block text-sm font-extrabold tracking-tight text-[#0b2a4a] sm:text-base">TOEFL ITP Practice</span>
              <span className="hidden text-[11px] font-medium text-slate-500 sm:block">A focused digital test experience</span>
            </span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-[#0b2a4a]">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Kembali ke beranda</span>
            <span className="sm:hidden">Beranda</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl items-center px-4 py-8 sm:px-6 sm:py-12 lg:min-h-[calc(100vh-81px)] lg:px-8">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(11,42,74,0.10)] lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="relative overflow-hidden bg-[#0b2a4a] px-6 py-8 text-white sm:px-10 sm:py-10 lg:px-12 lg:py-14">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border-[24px] border-cyan-300/10" aria-hidden="true" />
            <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-cyan-300/10 blur-2xl" aria-hidden="true" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/25 bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-100">
                <ShieldCheck className="h-3.5 w-3.5" />
                Portal peserta resmi
              </span>
              <h2 className="mt-8 max-w-md text-3xl font-black leading-tight tracking-tight sm:text-4xl">{panelTitle}</h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-200 sm:text-base">{panelDescription}</p>
              <ul className="mt-8 space-y-4 text-sm text-slate-200">
                {panelItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-10 border-t border-white/15 pt-5 text-xs leading-5 text-slate-300">Gunakan perangkat dan koneksi yang stabil agar proses ujian berjalan lancar.</p>
            </div>
          </aside>

          <section className="px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-14" aria-labelledby="auth-page-title">
            <div className="mx-auto max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">{eyebrow}</p>
              <h1 id="auth-page-title" className="mt-3 text-3xl font-black tracking-tight text-[#0b2a4a] sm:text-4xl">{title}</h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
              <div className="mt-8">{children}</div>
              <div className="mt-8 border-t border-slate-200 pt-6">{footer}</div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-5 text-center text-xs text-slate-500 sm:px-6">
        <p>© 2026 TOEFL ITP Practice Portal · Platform latihan dan ujian digital yang terukur.</p>
        <div className="mt-2 flex items-center justify-center gap-3">
          <Link href="/privacy" className="transition hover:text-slate-800">Kebijakan Privasi</Link>
          <span aria-hidden="true">·</span>
          <Link href="/terms" className="transition hover:text-slate-800">Syarat dan Ketentuan</Link>
        </div>
      </footer>
    </div>
  );
}
