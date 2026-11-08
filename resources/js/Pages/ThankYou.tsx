import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function ThankYouPage() {
  const params = useSearchParams();
  const type = params.get("type");
  const title = type === "payment" ? "Bukti pembayaran berhasil dikirim" : "Permintaan Anda sudah diterima";
  const description = type === "payment"
    ? "Tim penyelenggara akan memeriksa bukti pembayaran dan memperbarui status pendaftaran Anda."
    : "Terima kasih telah menggunakan platform TOEFL ITP. Anda dapat melanjutkan ke dashboard atau kembali ke beranda.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb] px-4 py-12 font-sans">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-9 w-9" aria-hidden="true" /></div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Berhasil</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-[#0b2a4a]">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
          <Link href="/student/dashboard" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0b2a4a] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#123f67]">Dashboard <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          <Link href="/" className="flex flex-1 items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">Beranda</Link>
        </div>
      </div>
    </div>
  );
}
