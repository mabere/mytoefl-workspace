"use client";

import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { appFetch as fetch } from "@/lib/appUrl";
import { AuthShell } from "@/Components/AuthShell";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const response = await fetch("/api/auth/user-me", { cache: "no-store" });
        if (response.ok) {
          router.replace("/student/dashboard");
          return;
        }
      } catch {
        // The form remains available when the session check cannot reach the server.
      } finally {
        if (isMounted) setIsCheckingSession(false);
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");

    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/user-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Gagal masuk. Periksa email dan kata sandi Anda.");
        return;
      }

      router.push("/student/dashboard");
    } catch (error) {
      console.error(error);
      setErrorMessage("Terjadi gangguan koneksi saat masuk. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Akun peserta"
      title="Masuk ke portal Anda"
      description="Akses jadwal ujian, paket latihan, riwayat pengerjaan, dan laporan skor dalam satu tempat."
      panelTitle="Siapkan langkah berikutnya dengan tenang."
      panelDescription="Portal peserta membantu Anda mengikuti proses ujian dengan alur yang jelas dari persiapan hingga hasil."
      panelItems={["Riwayat dan hasil ujian tersimpan aman", "Akses jadwal serta pembayaran dalam satu portal", "Sesi ujian dilengkapi timer dan pemeriksaan audio"]}
      footer={
        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-slate-600">Belum memiliki akun?</span>
          <Link href="/register" className="inline-flex items-center justify-center rounded-lg bg-[#0b2a4a] px-4 py-2.5 font-extrabold text-white transition hover:bg-[#123f67]">Daftar akun peserta</Link>
        </div>
      }
    >
      {isCheckingSession ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-600" role="status">Memeriksa sesi peserta...</div>
      ) : (
        <>
      {errorMessage && (
        <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm font-medium leading-5 text-rose-700">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label htmlFor="login-email" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">Alamat email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input id="login-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100" />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">Kata sandi</label>
            <span className="text-xs text-slate-400">Minimal 12 karakter</span>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input id="login-password" type={showPassword ? "text" : "password"} required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan kata sandi" className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-10 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100" />
            <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b2a4a] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#0b2a4a]/15 transition hover:bg-[#123f67] disabled:cursor-not-allowed disabled:opacity-60">
          <span>{isLoading ? "Memverifikasi akun..." : "Masuk ke dashboard"}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <p className="mt-5 text-center text-xs leading-5 text-slate-500">Dengan masuk, Anda setuju menggunakan portal ini sesuai arahan penyelenggara ujian.</p>
        </>
      )}
    </AuthShell>
  );
}
