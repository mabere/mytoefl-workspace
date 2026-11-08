import React from "react";
import { PublicPageShell } from "@/components/PublicPageShell";

export default function PrivacyPage() {
  return (
    <PublicPageShell eyebrow="Kepercayaan dan transparansi" title="Kebijakan Privasi">
      <p>Kebijakan ini menjelaskan bagaimana platform mengelola informasi saat Anda membuat akun, mengikuti simulasi, mendaftar ujian, mengunggah bukti pembayaran, dan melihat hasil.</p>
      <section><h2 className="text-lg font-black text-slate-900">Data yang digunakan</h2><p className="mt-2">Data dapat mencakup nama, email, nomor identitas, nomor telepon, institusi, data pendaftaran, jawaban, skor, informasi sertifikat, dan bukti pembayaran. Data tersebut digunakan untuk menjalankan layanan ujian, verifikasi, dukungan peserta, dan audit operasional.</p></section>
      <section><h2 className="text-lg font-black text-slate-900">Penyimpanan dan akses</h2><p className="mt-2">Akses data dibatasi berdasarkan peran. Data operasional disimpan selama diperlukan untuk penyelenggaraan, pelaporan, penyelesaian sengketa, dan kewajiban administrasi lembaga.</p></section>
      <section><h2 className="text-lg font-black text-slate-900">Cookie dan analitik</h2><p className="mt-2">Cookie sesi dan keamanan diperlukan agar login, CSRF, dan ujian berjalan. Analitik non-esensial hanya digunakan bila diaktifkan dan disetujui melalui preferensi cookie. Jawaban, skor, token, dan bukti pembayaran tidak dikirim ke layanan analitik.</p></section>
      <section><h2 className="text-lg font-black text-slate-900">Permintaan peserta</h2><p className="mt-2">Untuk pertanyaan, koreksi data, atau permintaan bantuan, gunakan kontak resmi yang ditampilkan pada halaman ini dan footer aplikasi.</p></section>
    </PublicPageShell>
  );
}
