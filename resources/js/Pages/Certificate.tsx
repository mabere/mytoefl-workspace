"use client";

import React, { useEffect, useState } from "react";
import { appFetch as fetch, appUrl } from "@/lib/appUrl";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Printer,
  ShieldCheck,
  Award,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  Share2,
} from "lucide-react";

interface CertificateDetail {
  certificate: {
    id: string;
    certificateNumber: string;
    participantName: string;
    idNumber: string | null;
    testDate: string;
    listeningScore: number;
    structureScore: number;
    readingScore: number;
    totalScore: number;
    cefrLevel: string;
    verificationCode: string;
    issuedAt: string;
    isRevoked?: boolean;
    user?: {
      name: string;
      email: string;
      idNumber: string | null;
      institution: string | null;
    };
    session?: {
      package: {
        title: string;
        code: string;
      };
    };
  };
  verifyUrl: string;
  qrDataUrl: string;
  institution?: {
    name: string;
    subtitle: string;
    address: string;
    contact: string;
    city: string;
    logoUrl: string;
    directorName: string;
    directorTitle: string;
    signatureUrl: string;
    stampUrl: string;
  };
}

export default function CertificatePage() {
  const { verificationCode } = useParams();
  const [data, setData] = useState<CertificateDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCert() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/certificate/${verificationCode}`);
        const json = await res.json();
        if (json.certificate) {
          setData(json);
        }
      } catch (err) {
        console.error("Load certificate error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCert();
  }, [verificationCode]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-300 font-semibold text-sm">
          Membuat Dokumen Sertifikat Digital...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <p className="text-slate-800 font-bold mb-4">
            Sertifikat tidak ditemukan atau kode verifikasi tidak valid.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const { certificate, qrDataUrl, verifyUrl } = data;
  if (certificate.isRevoked) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white text-slate-900 rounded-2xl p-8 text-center shadow-2xl">
          <ShieldCheck className="w-12 h-12 text-rose-600 mx-auto mb-4" />
          <h1 className="text-xl font-black mb-2">Sertifikat Dicabut</h1>
          <p className="text-sm text-slate-600">Dokumen ini tidak lagi berlaku.</p>
        </div>
      </div>
    );
  }
  const testDateFormatted = new Date(certificate.testDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const issueDateFormatted = new Date(certificate.issuedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4 font-sans text-slate-800 flex flex-col items-center print:bg-white print:p-0 print:m-0">
      {/* Print stylesheet specifically tailored for A4 landscape */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 6mm;
          }
          body {
            background-color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          #certificate-container {
            width: 100% !important;
            max-width: 100% !important;
            border: 8px double #0f172a !important;
            box-shadow: none !important;
            padding: 1.5rem !important;
            margin: 0 !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Action Bar (Hidden during Print) */}
      <div className="max-w-4xl w-full mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Portal</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/verify/${certificate.verificationCode}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Halaman Verifikasi Publik</span>
          </Link>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* CERTIFICATE SHEET (A4 Landscape aspect ratio) */}
      <div
        id="certificate-container"
        className="w-full max-w-4xl bg-[#fffdfa] border-[12px] border-double border-slate-900 rounded-2xl shadow-2xl p-8 sm:p-12 relative overflow-hidden print:border-none print:shadow-none print:p-6 print:max-w-none print:w-full"
      >
        {/* Decorative Watermark Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <div className="text-center">
            <span className="font-serif font-black text-9xl tracking-tighter text-slate-900 block">
              TOEFL ITP
            </span>
            <span className="font-serif text-6xl tracking-widest text-slate-800">
            DIGITAL ASSESSMENT
            </span>
          </div>
        </div>

        {/* Certificate Inner Border */}
        <div className="border border-amber-600/40 p-6 sm:p-8 rounded-lg relative z-10">
          {/* Header Section */}
          <div className="text-center space-y-2 mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <img
                src={appUrl(data.institution?.logoUrl || "/branding/institution-logo.svg")}
                alt="Logo Institusi"
                className="w-16 h-16 object-contain drop-shadow-xs"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = appUrl("/branding/institution-logo.svg");
                }}
              />
            </div>
            <div className="font-serif tracking-wider uppercase text-xs font-black text-slate-900">
              {data.institution?.name || "Lembaga Bahasa & Sertifikasi Internasional"}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
              {data.institution?.subtitle || "Center for Language Testing and Certification"}
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-slate-950 uppercase pt-1">
              Certificate of English Proficiency
            </h1>
            <p className="text-xs font-semibold text-amber-700 tracking-wider uppercase">
              TOEFL ITP® Standard Assessment Format
            </p>
          </div>

          {/* Recipient Statement */}
          <div className="text-center space-y-2 my-8">
            <p className="text-xs font-serif italic text-slate-600">
                  This digital certificate is issued to:
            </p>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 border-b-2 border-slate-300 inline-block px-8 pb-1 tracking-wide">
              {certificate.participantName}
            </h2>
            {certificate.idNumber && (
              <p className="text-xs font-mono text-slate-500">
                National ID / Passport: <strong>{certificate.idNumber}</strong>
              </p>
            )}
            <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed pt-2">
              for having successfully taken the standardized evaluation of English proficiency on{" "}
              <strong>{testDateFormatted}</strong>, demonstrating the following certified competencies:
            </p>
          </div>

          {/* Scores Matrix */}
          <div className="max-w-2xl mx-auto my-6 border border-slate-300 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-center text-xs">
              <thead className="bg-slate-900 text-white font-serif uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 text-left">Section Area</th>
                  <th className="py-2.5 px-3">Score Scale</th>
                  <th className="py-2.5 px-3 text-right">Scaled Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 bg-white font-medium">
                <tr>
                  <td className="py-2 px-3 text-left font-semibold">Section 1: Listening Comprehension</td>
                  <td className="py-2 px-3 text-slate-500">31 - 68</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                    {certificate.listeningScore}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-left font-semibold">Section 2: Structure & Written Expression</td>
                  <td className="py-2 px-3 text-slate-500">31 - 68</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                    {certificate.structureScore}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-left font-semibold">Section 3: Reading Comprehension</td>
                  <td className="py-2 px-3 text-slate-500">31 - 67</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                    {certificate.readingScore}
                  </td>
                </tr>
                <tr className="bg-amber-50/70 font-bold border-t-2 border-slate-900">
                  <td className="py-3 px-3 text-left font-serif text-slate-950 text-sm">
                    TOTAL SCALED SCORE
                  </td>
                  <td className="py-3 px-3 text-amber-900 font-semibold">
                    CEFR Level: <span className="bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-bold">{certificate.cefrLevel}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-xl text-slate-950">
                    {certificate.totalScore}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Validation & Signatures */}
          <div className="grid grid-cols-3 items-end gap-4 pt-8 border-t border-slate-200">
            {/* Left: QR Code & Verification */}
            <div className="flex items-center gap-3">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="QR Code Verification"
                  className="w-20 h-20 border border-slate-300 rounded p-1 bg-white"
                />
              )}
              <div className="text-[10px] text-slate-500 leading-tight">
                <span className="font-bold text-slate-800 block mb-0.5">Online Verification</span>
                Scan QR code to verify this certificate authentic record.
                <span className="font-mono text-[9px] block text-slate-400 mt-1 truncate max-w-[120px]">
                  {certificate.verificationCode}
                </span>
              </div>
            </div>

            {/* Center: Certificate Serial */}
            <div className="text-center text-[10px] text-slate-500">
              <span className="font-mono font-bold text-slate-800 block text-xs">
                {certificate.certificateNumber}
              </span>
              <span>Issued on: {issueDateFormatted}</span>
            </div>

            {/* Right: Signature & Seal Overlay */}
            <div className="text-right">
              <div className="inline-block text-center relative min-w-[190px]">
                <div className="text-[10px] text-slate-500 mb-1">
                  {data.institution?.city || "Jakarta"}, {issueDateFormatted}
                </div>

                {/* Layered Signature + Stamp */}
                <div className="relative h-16 w-44 mx-auto flex items-center justify-center my-0.5">
                  {/* Digital Signature */}
                  <img
                    src={appUrl(data.institution?.signatureUrl || "/branding/director-signature.svg")}
                    alt="Signature"
                    className="h-14 w-auto max-w-[160px] object-contain relative z-10 filter drop-shadow-xs"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = appUrl("/branding/director-signature.svg");
                    }}
                  />

                  {/* Institutional stamp */}
                  <img
                    src={appUrl(data.institution?.stampUrl || "/branding/institution-stamp.svg")}
                    alt="Institution stamp"
                    className="absolute -left-4 -top-3 w-22 h-22 object-contain opacity-85 pointer-events-none mix-blend-multiply z-20"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = appUrl("/branding/institution-stamp.svg");
                    }}
                  />
                </div>

                <div className="font-serif text-sm font-bold text-slate-900 border-b-2 border-slate-700 pb-0.5 px-3">
                  {data.institution?.directorName || "Prof. Dr. H. Soedirman, M.Pd."}
                </div>
                <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mt-0.5">
                  {data.institution?.directorTitle || "Academic Director of Certification"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
