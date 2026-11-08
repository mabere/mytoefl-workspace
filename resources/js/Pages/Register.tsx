"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, CreditCard, Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { appFetch as fetch } from "@/lib/appUrl";
import { AuthShell } from "@/Components/AuthShell";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
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

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");

    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, idNumber: idNumber.trim(), phoneNumber: phoneNumber.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Pendaftaran gagal. Silakan periksa kembali data Anda.");
        return;
      }

      router.push("/student/dashboard");
    } catch (error) {
      console.error(error);
      setErrorMessage("Terjadi gangguan koneksi saat mendaftar. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Registrasi peserta"
      title="Buat akun peserta"
      description="Lengkapi data identitas dengan benar agar laporan skor dan sertifikat digital dapat diterbitkan sesuai dokumen resmi Anda."
      panelTitle="Satu akun untuk seluruh perjalanan ujian."
      panelDescription="Setelah terdaftar, Anda dapat memilih jadwal, mengunggah bukti pembayaran, dan melihat hasil secara terpusat."
      panelItems={["Nama dan identitas tercantum pada laporan resmi", "Pendaftaran jadwal dan status pembayaran mudah dipantau", "Hasil ujian serta sertifikat tersimpan di akun Anda"]}
      footer={
        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-slate-600">Sudah memiliki akun?</span>
          <Link href="/login" className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 font-extrabold text-[#0b2a4a] transition hover:bg-slate-50">Masuk ke akun</Link>
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

      <form onSubmit={handleRegister} className="space-y-5">
        <div>
          <label htmlFor="register-name" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">Nama lengkap resmi</label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input id="register-name" type="text" required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Sesuai KTP atau paspor" className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100" />
          </div>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">Gunakan nama yang sama dengan dokumen identitas Anda.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="register-id" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">NIK / nomor paspor</label>
            <div className="relative">
              <CreditCard className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input id="register-id" type="text" required autoComplete="off" value={idNumber} onChange={(event) => setIdNumber(event.target.value)} placeholder="Nomor identitas" className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-10 pr-4 font-mono text-sm text-slate-900 outline-none transition placeholder:font-sans placeholder:text-slate-400 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100" />
            </div>
          </div>
          <div>
            <label htmlFor="register-phone" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">Nomor WhatsApp</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input id="register-phone" type="tel" required autoComplete="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="08xxxxxxxxxx" className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="register-email" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">Alamat email aktif</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input id="register-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100" />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor="register-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">Kata sandi</label>
            <span className="text-xs text-slate-400">Minimal 12 karakter</span>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input id="register-password" type={showPassword ? "text" : "password"} required minLength={12} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Buat kata sandi yang kuat" className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-10 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100" />
            <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b2a4a] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#0b2a4a]/15 transition hover:bg-[#123f67] disabled:cursor-not-allowed disabled:opacity-60">
          <span>{isLoading ? "Membuat akun..." : "Daftar akun peserta"}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <p className="mt-5 text-center text-xs leading-5 text-slate-500">Pastikan data identitas sudah benar sebelum melanjutkan pendaftaran.</p>
        </>
      )}
    </AuthShell>
  );
}
