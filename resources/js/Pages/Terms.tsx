import React from "react";
import { PublicPageShell } from "@/components/PublicPageShell";

export default function TermsPage() {
  return (
    <PublicPageShell eyebrow="Aturan penggunaan" title="Syarat dan Ketentuan">
      <p>Dengan menggunakan platform, peserta menyetujui aturan penggunaan layanan, ketentuan pendaftaran, dan tata tertib ujian berikut.</p>
      <section><h2 className="text-lg font-black text-slate-900">Akun dan identitas</h2><p className="mt-2">Peserta wajib memberikan informasi yang benar, menjaga kerahasiaan akun atau token, dan tidak memberikan akses ujian kepada orang lain.</p></section>
      <section><h2 className="text-lg font-black text-slate-900">Pelaksanaan ujian</h2><p className="mt-2">Peserta wajib mengikuti instruksi audio, timer, fullscreen, dan pengawasan sistem. Upaya menyalin, berbagi jawaban, memanipulasi sistem, atau mengganggu peserta lain dapat dicatat sebagai pelanggaran dan menyebabkan sesi dihentikan.</p></section>
      <section><h2 className="text-lg font-black text-slate-900">Pembayaran dan bukti transaksi</h2><p className="mt-2">Pendaftaran dan pembayaran mengikuti kebijakan lembaga penyelenggara. Bukti pembayaran harus benar dan dapat diverifikasi. Status pendaftaran baru berubah setelah proses pemeriksaan selesai.</p></section>
      <section><h2 className="text-lg font-black text-slate-900">Skor dan sertifikat</h2><p className="mt-2">Skor yang ditampilkan mengikuti paket dan metode penskoran aplikasi. Sertifikat hanya diterbitkan sesuai status dan kebijakan lembaga. Hasil prediction test tidak otomatis merupakan skor resmi ETS.</p></section>
      <section><h2 className="text-lg font-black text-slate-900">Perubahan layanan</h2><p className="mt-2">Lembaga dapat memperbarui jadwal, paket, kebijakan, atau sistem untuk menjaga keamanan dan kualitas layanan. Perubahan penting akan diinformasikan melalui kanal resmi.</p></section>
    </PublicPageShell>
  );
}
