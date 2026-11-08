/**
 * Notification Service for WhatsApp & Email
 */

export function cleanPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return "";
  // Strip non-digit characters
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    digits = "62" + digits.slice(1);
  } else if (digits.startsWith("8")) {
    digits = "62" + digits;
  }
  return digits;
}

export interface PaymentConfirmedWaParams {
  phoneNumber: string;
  studentName: string;
  regNumber: string;
  scheduleTitle: string;
  examDate: string;
  startExamUrl: string;
  institutionName?: string;
}

export function buildPaymentConfirmedWaUrl(params: PaymentConfirmedWaParams): string {
  const phone = cleanPhoneNumber(params.phoneNumber);
  const inst = params.institutionName || "Lembaga Bahasa & Sertifikasi Internasional";

  const message = 
`Halo Sdr/i *${params.studentName}*,

Pembayaran pendaftaran ujian TOEFL ITP Anda telah *BERHASIL DIVERIFIKASI* dan tiket ujian Anda telah *AKTIF*.

📋 *Rincian Tiket Ujian:*
• No. Registrasi: *${params.regNumber}*
• Jadwal Sesi: *${params.scheduleTitle}*
• Tanggal / Waktu: *${params.examDate}*

🔗 *Akses Masuk Ruang Ujian:*
${params.startExamUrl}

💡 *Petunjuk Ujian:*
1. Pastikan perangkat komputer/laptop Anda memiliki koneksi internet stabil.
2. Siapkan earphone/headphone untuk sesi Listening Comprehension.
3. Masuk ke ruang ujian 10 menit sebelum jadwal dimulai.

Salam hangat dan sukses,
*${inst}*`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export interface CertificateReadyWaParams {
  phoneNumber: string;
  studentName: string;
  certNumber: string;
  testDate: string;
  listeningScore: number;
  structureScore: number;
  readingScore: number;
  totalScore: number;
  cefrLevel: string;
  certUrl: string;
  verifyUrl: string;
  institutionName?: string;
}

export function buildCertificateReadyWaUrl(params: CertificateReadyWaParams): string {
  const phone = cleanPhoneNumber(params.phoneNumber);
  const inst = params.institutionName || "Lembaga Bahasa & Sertifikasi Internasional";

  const message =
`Selamat Sdr/i *${params.studentName}*! 🎉

Sertifikat Resmi *TOEFL ITP® Standard Assessment* Anda telah selesai diterbitkan oleh ${inst}.

📊 *Rekap Hasil Nilai Resmi:*
• Section 1 (Listening): *${params.listeningScore}*
• Section 2 (Structure): *${params.structureScore}*
• Section 3 (Reading): *${params.readingScore}*
⭐ *TOTAL SCALED SCORE: ${params.totalScore}* (CEFR: *${params.cefrLevel}*)

📜 *Identitas Sertifikat:*
• No. Seri: *${params.certNumber}*
• Tanggal Tes: *${params.testDate}*

📄 *Download Sertifikat Digital (PDF/Cetak):*
${params.certUrl}

🔍 *Link Verifikasi Keaslian Dokumen:*
${params.verifyUrl}

Semoga sertifikat ini bermanfaat untuk kelulusan studi, beasiswa, maupun promosi karir Anda!

Salam sukses selalu,
*${inst}*`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export interface LeadGreetingWaParams {
  phoneNumber: string;
  leadName: string;
  totalScore?: number;
  cefrLevel?: string;
  institutionName?: string;
  registerUrl?: string;
}

export function buildLeadGreetingWaUrl(params: LeadGreetingWaParams): string {
  const phone = cleanPhoneNumber(params.phoneNumber);
  const inst = params.institutionName || "Lembaga Bahasa & Sertifikasi Internasional";
  const registerUrl = params.registerUrl || "https://toefl.testing.ac.id/student/dashboard";

  const scoreText =
    params.totalScore && params.totalScore > 0
      ? `\n\n📊 *Hasil Simulasi Demo Anda:*\n• Prediksi Skor: *${params.totalScore}* (Skala 310–677)\n• Level CEFR: *${params.cefrLevel || "B1/B2"}*`
      : "";

  const message = `Halo Sdr/i *${params.leadName}*, 👋

Terima kasih telah mencoba simulasi demo ujian TOEFL ITP di platform kami.${scoreText}

Apakah Anda berencana mengikuti *Ujian TOEFL ITP Resmi Bersertifikat* untuk keperluan:
✅ Syarat kelulusan / sidang skripsi/tesis
✅ Persyaratan beasiswa LPDP / luar negeri
✅ Rekrutmen BUMN / CPNS / kenaikan karir

Kami memiliki jadwal sesi resmi terdekat yang dapat Anda ikuti secara daring. Sertifikat resmi dilengkapi stempel dinas dan QR Code validasi keaslian.

🔗 *Informasi & Pendaftaran Jadwal Resmi:*
${registerUrl}

Jika ada pertanyaan seputar format ujian, pembayaran, atau jadwal, jangan ragu untuk membalas pesan ini. Kami siap membantu! 😊

Salam sukses,
*Panitia Layanan TOEFL ITP - ${inst}*`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

