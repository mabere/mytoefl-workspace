"use client";

import React, { useState } from "react";
import { appFetch as fetch, appUrl } from "@/lib/appUrl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Headphones,
  FileText,
  Clock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Settings,
  HelpCircle,
  User,
  LogIn,
  UserPlus,
  CheckCircle2,
  X,
} from "lucide-react";
import { useExamStore } from "@/lib/examStore";

const DEFAULT_LOGO_URL = "/branding/institution-logo.svg";

interface InstitutionBranding {
  logoUrl?: string;
  institutionName?: string;
  institutionAddress?: string;
  institutionContact?: string;
}

export default function HomePage() {
  const router = useRouter();
  const [operatingMode, setOperatingMode] = useState<"COMMERCIAL" | "INSTITUTION">("INSTITUTION");
  const [authState, setAuthState] = useState<"checking" | "guest" | "authenticated">("checking");
  const [authenticatedName, setAuthenticatedName] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [tokenCode, setTokenCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [institutionBranding, setInstitutionBranding] = useState<InstitutionBranding>({});

  // Demo modal state
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoName, setDemoName] = useState("");
  const [demoPhone, setDemoPhone] = useState("");
  const [isStartingDemo, setIsStartingDemo] = useState(false);
  const [demoError, setDemoError] = useState("");

  const requestFullscreenFromLaunch = () => {
    if (
      typeof document !== "undefined" &&
      !document.fullscreenElement &&
      document.fullscreenEnabled
    ) {
      void document.documentElement
        .requestFullscreen({ navigationUI: "hide" })
        .catch(() => undefined);
    }
  };

  const handleStartDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    setDemoError("");
    if (!demoName.trim()) {
      setDemoError("Silakan masukkan nama lengkap Anda.");
      return;
    }

    try {
      setIsStartingDemo(true);
      requestFullscreenFromLaunch();
      const res = await fetch("/api/demo/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: demoName.trim(),
          phoneNumber: demoPhone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDemoError(data.error || "Gagal memulai simulasi demo.");
        return;
      }
      router.push(`/demo/${data.demoId}`);
    } catch (err) {
      console.error(err);
      setDemoError("Terjadi gangguan jaringan saat memulai demo.");
    } finally {
      setIsStartingDemo(false);
    }
  };

  // Fetch current platform operating mode
  React.useEffect(() => {
    async function loadSetting() {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        const json = await res.json();
        if (json.operatingMode) {
          setOperatingMode(json.operatingMode);
        }
      } catch (e) {
        console.error("Failed to load operating mode:", e);
      }
    }
    loadSetting();
  }, []);

  React.useEffect(() => {
    fetch("/api/branding", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setInstitutionBranding(data))
      .catch(() => undefined);
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    async function loadAuthState() {
      try {
        const res = await fetch("/api/auth/user-me", { cache: "no-store" });
        if (!isMounted) return;
        if (!res.ok) {
          setAuthState("guest");
          return;
        }
        const json = await res.json();
        setAuthenticatedName(json.user?.name || "");
        setAuthState(json.authenticated ? "authenticated" : "guest");
      } catch {
        if (isMounted) setAuthState("guest");
      }
    }

    loadAuthState();

    return () => {
      isMounted = false;
    };
  }, []);



  const handleStartExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!participantName.trim()) {
      setErrorMessage("Silakan masukkan nama lengkap Anda.");
      return;
    }
    if (!tokenCode.trim()) {
      setErrorMessage("Silakan masukkan token ujian.");
      return;
    }

    try {
      setIsLoading(true);
      requestFullscreenFromLaunch();
      const res = await fetch("/api/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantName: participantName.trim(),
          tokenCode: tokenCode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Gagal memvalidasi token ujian.");
        return;
      }

      // Clear any previous session leftovers and route to exam room
      useExamStore.getState().resetExam();
      router.push(`/exam/${data.sessionId}`);
    } catch (err) {
      console.error(err);
      setErrorMessage("Terjadi kesalahan jaringan saat memulai ujian.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] font-sans text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="TOEFL ITP Practice Portal home">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <img
                src={appUrl(institutionBranding.logoUrl || DEFAULT_LOGO_URL)}
                alt={institutionBranding.institutionName || "Logo institusi"}
                className="h-full w-full object-contain p-1"
                onError={(event) => {
                  const fallback = appUrl(DEFAULT_LOGO_URL);
                  if (event.currentTarget.src !== fallback) {
                    event.currentTarget.src = fallback;
                  }
                }}
              />
            </span>
            <span>
              <span className="block max-w-[190px] truncate text-sm font-extrabold tracking-tight text-[#0b2a4a] sm:max-w-[260px] sm:text-base">{institutionBranding.institutionName || "TOEFL ITP Practice"}</span>
              <span className="hidden text-[11px] font-medium text-slate-500 sm:block">Pengalaman ujian digital yang fokus dan terarah</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex" aria-label="Navigasi utama">
            <a href="#format" className="transition hover:text-[#0b2a4a]">Format tes</a>
            <a href="#how-it-works" className="transition hover:text-[#0b2a4a]">Cara kerja</a>
            <a href="#help" className="transition hover:text-[#0b2a4a]">Bantuan</a>
          </nav>

          <div className="flex items-center gap-2.5">
            {authState === "checking" ? (
              <span className="hidden h-9 w-20 animate-pulse rounded-lg bg-slate-100 sm:inline-flex" aria-label="Memeriksa sesi" />
            ) : (
              <Link href={authState === "authenticated" ? "/student/dashboard" : "/login"} className="hidden max-w-[180px] items-center gap-2 truncate rounded-lg px-3 py-2 text-sm font-bold text-[#0b2a4a] transition hover:bg-slate-100 sm:inline-flex" title={authState === "authenticated" ? `Buka dashboard${authenticatedName ? ` — ${authenticatedName}` : ""}` : "Masuk ke akun peserta"}>
                {authState === "authenticated" ? (authenticatedName ? `Dashboard · ${authenticatedName}` : "Dashboard") : "Masuk"}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setShowDemoModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0b2a4a] px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#123f67] sm:px-4 sm:text-sm"
            >
              <Sparkles className="h-4 w-4 text-cyan-200" />
              <span>Coba demo</span>
            </button>
          </div>
        </div>
      </header>

      <main className="pb-20 md:pb-0">
        <section className="overflow-hidden bg-[#0b2a4a] text-white">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-100">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Simulasi berbasis TOEFL ITP Level 1
              </div>
              <h1 className="max-w-xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">Uji kemampuan bahasa Inggris dengan tenang dan terarah.</h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">Satu portal untuk simulasi, ujian terjadwal, dan laporan skor. Ikuti tiga section dengan alur yang jelas, audio yang terkontrol, serta waktu yang terukur.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowDemoModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3.5 text-sm font-extrabold text-[#0b2a4a] shadow-lg transition hover:bg-cyan-50"
                >
                  Mulai demo gratis <ArrowRight className="h-4 w-4" />
                </button>
                <a href="#test-access" className="inline-flex items-center justify-center rounded-lg border border-white/30 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">Masuk ke ujian terjadwal</a>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-slate-300">
                <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-cyan-300" /> Sesi terlindungi</span>
                <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-cyan-300" /> Durasi terukur</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-300" /> Hasil tersimpan</span>
              </div>
            </div>

            <div id="test-access" className="rounded-2xl bg-white p-6 text-slate-900 shadow-2xl sm:p-8">
              {operatingMode === "COMMERCIAL" ? (
                <div>
                  <div className="mb-6 flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[#0b2a4a]"><User className="h-5 w-5" /></span>
                    <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-700">Peserta terdaftar</p><h2 className="mt-1 text-2xl font-black tracking-tight text-[#0b2a4a]">Mulai perjalanan belajar</h2></div>
                  </div>
                  {authState === "authenticated" ? (
                    <>
                      <p className="mb-6 text-sm leading-6 text-slate-600">Anda sudah masuk{authenticatedName ? ` sebagai ${authenticatedName}` : ""}. Lanjutkan ke dashboard untuk memilih jadwal atau melihat hasil ujian.</p>
                      <Link href="/student/dashboard" className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b2a4a] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#123f67]"><LogIn className="h-4 w-4" /> Buka dashboard <ArrowRight className="h-4 w-4" /></Link>
                    </>
                  ) : (
                    <>
                      <p className="mb-6 text-sm leading-6 text-slate-600">Buat akun untuk memilih paket, mengikuti jadwal ujian, dan menyimpan laporan skor Anda.</p>
                      <div className="space-y-3">
                        <Link href="/register" className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b2a4a] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#123f67]"><UserPlus className="h-4 w-4" /> Daftar akun peserta <ArrowRight className="h-4 w-4" /></Link>
                        <Link href="/login" className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"><LogIn className="h-4 w-4" /> Masuk ke akun</Link>
                      </div>
                    </>
                  )}
                  <div className="mt-6 grid gap-2 border-t border-slate-100 pt-5 text-xs text-slate-600 sm:grid-cols-2">
                    <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Riwayat tersimpan</span>
                    <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Sertifikat digital</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-6 flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[#0b2a4a]"><ShieldCheck className="h-5 w-5" /></span>
                    <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-700">Sesi institusional</p><h2 className="mt-1 text-2xl font-black tracking-tight text-[#0b2a4a]">Masuk ke ruang ujian</h2></div>
                  </div>
                  <p className="mb-6 text-sm leading-6 text-slate-600">Masukkan nama sesuai identitas dan token yang diberikan oleh penyelenggara ujian.</p>
                  {authState === "authenticated" && (
                    <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-cyan-100 bg-cyan-50 p-3.5 text-xs text-cyan-900">
                      <span>Anda sudah masuk{authenticatedName ? ` sebagai ${authenticatedName}` : ""}.</span>
                      <Link href="/student/dashboard" className="shrink-0 font-extrabold text-[#0b2a4a] hover:underline">Buka dashboard</Link>
                    </div>
                  )}
                  {errorMessage && <div role="alert" className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">{errorMessage}</div>}
                  <form onSubmit={handleStartExam} className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="participant-name">Nama lengkap</label>
                      <input id="participant-name" type="text" required value={participantName} onChange={(e) => setParticipantName(e.target.value)} placeholder="Nama sesuai identitas" className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm transition focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="exam-token">Token ujian</label>
                      <input id="exam-token" type="text" required value={tokenCode} onChange={(e) => setTokenCode(e.target.value.toUpperCase())} placeholder="Masukkan token ujian" className="w-full rounded-lg border border-slate-300 px-4 py-3 font-mono text-sm font-bold tracking-wider transition focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100" />
                    </div>
                    <button type="submit" disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b2a4a] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#123f67] disabled:cursor-not-allowed disabled:opacity-60"><span>{isLoading ? "Memvalidasi sesi..." : "Mulai ujian"}</span><ArrowRight className="h-4 w-4" /></button>
                  </form>
                  <p className="mt-4 text-center text-xs text-slate-500">Belum memiliki token? Hubungi penyelenggara ujian Anda.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="format" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">Format tes</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0b2a4a] sm:text-4xl">Tiga section. Satu alur yang jelas.</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">Kenali struktur tes sebelum mulai agar Anda dapat mengatur waktu dan fokus pada setiap bagian.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { icon: Headphones, number: "01", title: "Listening Comprehension", detail: "50 soal · 35 menit", text: "Dengarkan setiap percakapan dan jawab dengan fokus.", color: "bg-cyan-50 text-cyan-700" },
              { icon: BookOpen, number: "02", title: "Structure & Written Expression", detail: "40 soal · 25 menit", text: "Uji pemahaman tata bahasa dan penggunaan bahasa.", color: "bg-indigo-50 text-indigo-700" },
              { icon: FileText, number: "03", title: "Reading Comprehension", detail: "50 soal · 55 menit", text: "Baca teks akademik dan temukan informasi penting.", color: "bg-emerald-50 text-emerald-700" },
            ].map(({ icon: Icon, number, title, detail, text, color }) => (
              <article key={number} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center justify-between"><span className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></span><span className="text-xs font-black tracking-[0.2em] text-slate-300">{number}</span></div>
                <h3 className="mt-6 text-lg font-extrabold text-[#0b2a4a]">{title}</h3>
                <p className="mt-2 text-sm font-bold text-slate-700">{detail}</p>
                <p className="mt-3 text-sm leading-6 text-slate-500">{text}</p>
              </article>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6"><span className="font-bold text-[#0b2a4a]">Total Level 1</span><span className="text-slate-600">140 soal · sekitar 115 menit · skala latihan 310–677</span></div>
        </section>

        <section id="how-it-works" className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">Cara kerja</p><h2 className="mt-3 text-3xl font-black tracking-tight text-[#0b2a4a]">Siap dalam beberapa langkah sederhana.</h2><p className="mt-4 text-base leading-7 text-slate-600">Kami menjaga setiap langkah tetap singkat agar Anda bisa berkonsentrasi pada tes.</p></div>
              <div className="grid gap-8 sm:grid-cols-3">
                {[{ icon: User, title: "Siapkan akses", text: "Gunakan demo atau masukkan token ujian Anda." }, { icon: Headphones, title: "Cek perangkat", text: "Pastikan headphone, koneksi, dan ruang Anda siap." }, { icon: CheckCircle2, title: "Kerjakan & lihat hasil", text: "Ikuti waktu per section dan tinjau hasil setelah selesai." }].map(({ icon: Icon, title, text }, index) => <div key={title} className="relative"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b2a4a] text-white"><Icon className="h-5 w-5" /></span><span className="mt-4 block text-xs font-bold uppercase tracking-wider text-cyan-700">Langkah {index + 1}</span><h3 className="mt-2 text-base font-extrabold text-[#0b2a4a]">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></div>)}
              </div>
            </div>
          </div>
        </section>

        <section id="help" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-[#e9f7f8] p-7 sm:p-8"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-cyan-700"><HelpCircle className="h-5 w-5" /></span><h2 className="text-xl font-black text-[#0b2a4a]">Sebelum mulai</h2></div><ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700"><li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-cyan-700" />Gunakan laptop atau desktop dengan browser terbaru.</li><li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-cyan-700" />Siapkan headphone untuk section Listening.</li><li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-cyan-700" />Selesaikan tes di ruang yang tenang tanpa berpindah tab.</li></ul></div>
            <div className="rounded-2xl bg-[#0b2a4a] p-7 text-white sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">Perlu bantuan?</p><h2 className="mt-3 text-2xl font-black">Kami siap membantu Anda memulai.</h2><p className="mt-3 max-w-md text-sm leading-6 text-slate-200">Untuk token, jadwal, atau kendala teknis, hubungi penyelenggara ujian atau tim administrasi Anda.</p><Link href={authState === "authenticated" ? "/student/dashboard" : "/login"} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-extrabold text-[#0b2a4a] transition hover:bg-cyan-50">{authState === "authenticated" ? "Buka dashboard" : "Buka portal peserta"} <ArrowRight className="h-4 w-4" /></Link></div>
          </div>
        </section>
      </main>


      {/* DEMO ONBOARDING MODAL */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-1 tracking-tight">
              Mulai Simulasi Demo Gratis
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Uji kemampuan TOEFL ITP Anda dengan 30 soal terpilih (10 Listening, 10 Structure, 10 Reading) tanpa perlu registrasi akun.
            </p>

            {demoError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {demoError}
              </div>
            )}

            <form onSubmit={handleStartDemo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={demoName}
                  onChange={(e) => setDemoName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Nomor WhatsApp
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Opsional</span>
                </div>
                <input
                  type="tel"
                  value={demoPhone}
                  onChange={(e) => setDemoPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition"
                />
                <p className="text-[10.5px] text-slate-400 mt-1">
                  Opsional — untuk menerima ringkasan hasil skor dan informasi pendaftaran.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block text-[11.5px]">Rincian Simulasi Demo:</span>
                <p className="flex items-center gap-1.5">• 10 Soal Listening (Audio Narasi Berurutan)</p>
                <p className="flex items-center gap-1.5">• 10 Soal Structure (Kalimat Rumpang & Error)</p>
                <p className="flex items-center gap-1.5">• 10 Soal Reading (Teks Akademik Utuh)</p>
                <p className="flex items-center gap-1.5">• Prediksi Skor Latihan (310–677) & Pembahasan Singkat</p>
              </div>

              <button
                type="submit"
                disabled={isStartingDemo}
                className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-sm shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                <span>{isStartingDemo ? "Menyiapkan Ruang Demo..." : "Mulai Ujian Demo Sekarang"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur md:hidden" role="navigation" aria-label="Aksi cepat">
        <div className="mx-auto flex max-w-lg gap-2">
          <button type="button" onClick={() => setShowDemoModal(true)} className="flex-1 rounded-xl bg-[#0b2a4a] px-3 py-3 text-xs font-extrabold text-white shadow-sm">Mulai demo</button>
          <a href="#test-access" className="flex flex-1 items-center justify-center rounded-xl border border-slate-300 px-3 py-3 text-xs font-extrabold text-[#0b2a4a]">Gunakan token</a>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-700">
              {institutionBranding.institutionName || "TOEFL ITP Practice Portal"}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Platform latihan dan pelaksanaan ujian digital dengan alur yang terukur.
            </p>
            {institutionBranding.institutionAddress && <p className="mt-1 text-[11px] text-slate-400">{institutionBranding.institutionAddress}</p>}
            {institutionBranding.institutionContact && <p className="text-[11px] text-slate-400">{institutionBranding.institutionContact}</p>}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] sm:justify-end">
            <span className="text-slate-400">© 2026 TOEFL ITP Practice Portal</span>
            <span className="text-slate-300">•</span>
            <Link href="/privacy" className="text-slate-500 transition hover:text-slate-800">Privasi</Link>
            <Link href="/terms" className="text-slate-500 transition hover:text-slate-800">Ketentuan</Link>
            <Link
              href="/admin/login"
              className="text-slate-400 hover:text-slate-600 transition flex items-center gap-1 font-medium"
              title="Akses terbatas khusus staf pengawas dan administrator ujian"
            >
              <Settings className="w-3 h-3" />
              <span>Portal Pengawas & Staf</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
