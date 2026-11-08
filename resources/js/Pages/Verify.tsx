"use client";

import React, { useEffect, useState } from "react";
import { appFetch as fetch } from "@/lib/appUrl";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  Award,
  Calendar,
  User,
  Hash,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Building,
} from "lucide-react";

interface VerifyData {
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
    isRevoked: boolean;
    issuedAt: string;
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
      registration?: {
        schedule?: {
          title: string;
        };
      } | null;
    };
  };
  verifyUrl: string;
}

export default function VerifyPage() {
  const { verificationCode } = useParams();
  const [data, setData] = useState<VerifyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/certificate/${verificationCode}`);
        const json = await res.json();
        if (!res.ok || json.error) {
          setError(json.error || "Sertifikat tidak valid atau tidak ditemukan.");
        } else {
          setData(json);
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError("Gagal menghubungi server verifikasi.");
      } finally {
        setIsLoading(false);
      }
    }
    verify();
  }, [verificationCode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-300 font-medium text-sm tracking-wide">
          Memverifikasi Keaslian Dokumen Sertifikat...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-rose-200">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-slate-900 mb-2">
            Dokumen Tidak Terverifikasi
          </h1>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            {error || "Kode verifikasi sertifikat ini tidak ditemukan di dalam pangkalan data resmi kami."}
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const { certificate } = data;
  if (certificate.isRevoked) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white text-slate-900 rounded-2xl p-8 text-center shadow-2xl">
          <AlertTriangle className="w-12 h-12 text-rose-600 mx-auto mb-4" />
          <h1 className="text-xl font-black mb-2">Sertifikat Dicabut</h1>
          <p className="text-sm text-slate-600">Dokumen ini tidak lagi berlaku. Hubungi lembaga penerbit untuk informasi lebih lanjut.</p>
        </div>
      </div>
    );
  }
  const testDateFormatted = new Date(certificate.testDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-10 px-4 font-sans">
      {/* Container */}
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Verification Banner */}
        <div className="bg-emerald-600 text-white px-6 py-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest bg-emerald-700/80 px-2 py-0.5 rounded text-emerald-100">
                Verification Successful
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight mt-0.5">
              Sertifikat Digital Terverifikasi
            </h1>
            <p className="text-xs text-emerald-100 opacity-90">
              Dokumen ini tercatat sah di pangkalan data evaluasi kompetensi bahasa.
            </p>
          </div>
        </div>

        {/* Certificate Overview Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Certificate Number & Series */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Nomor Registrasi Sertifikat
              </span>
              <span className="font-mono font-black text-amber-400 text-base sm:text-lg">
                {certificate.certificateNumber}
              </span>
            </div>
            <div className="sm:text-right">
              <span className="text-[11px] text-slate-500 block">Kode Verifikasi:</span>
              <span className="font-mono text-xs text-slate-300 font-semibold bg-slate-800 px-2.5 py-1 rounded">
                {certificate.verificationCode}
              </span>
            </div>
          </div>

          {/* Participant Details */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Identitas Pemegang Sertifikat
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/50">
                <span className="text-[11px] text-slate-400 block mb-1">Nama Lengkap</span>
                <span className="text-sm font-bold text-white block">
                  {certificate.participantName}
                </span>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/50">
                <span className="text-[11px] text-slate-400 block mb-1">NIK / No. Identitas</span>
                <span className="text-sm font-bold text-white block">
                  {certificate.idNumber || "-"}
                </span>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/50">
                <span className="text-[11px] text-slate-400 block mb-1">Tanggal Ujian</span>
                <span className="text-sm font-bold text-white block">
                  {testDateFormatted}
                </span>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/50">
                <span className="text-[11px] text-slate-400 block mb-1">Program Pengujian</span>
                <span className="text-sm font-bold text-white block">
                  TOEFL ITP® Prediction Test
                </span>
              </div>
            </div>
          </div>

          {/* Scores Breakdown */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Capaian Nilai Simulasi (Skala TOEFL ITP)
            </h2>
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-3">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Listening</span>
                <span className="text-xl font-black text-blue-400 font-mono mt-1 block">
                  {certificate.listeningScore}
                </span>
                <span className="text-[10px] text-slate-500">Skala 31-68</span>
              </div>
              <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-3">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Structure</span>
                <span className="text-xl font-black text-blue-400 font-mono mt-1 block">
                  {certificate.structureScore}
                </span>
                <span className="text-[10px] text-slate-500">Skala 31-68</span>
              </div>
              <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-3">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Reading</span>
                <span className="text-xl font-black text-blue-400 font-mono mt-1 block">
                  {certificate.readingScore}
                </span>
                <span className="text-[10px] text-slate-500">Skala 31-67</span>
              </div>
            </div>

            {/* Total Score & CEFR */}
            <div className="bg-gradient-to-r from-blue-900/60 to-indigo-950 border border-blue-800/60 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block">
                  Total Scaled Score
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-black text-white font-serif tracking-tight">
                    {certificate.totalScore}
                  </span>
                  <span className="text-xs text-blue-300">/ 677 Max</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-blue-300 uppercase block mb-1">
                  Kategori CEFR
                </span>
                <span className="inline-block bg-amber-400 text-slate-950 font-black text-lg px-3 py-0.5 rounded-lg shadow-sm">
                  Level {certificate.cefrLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href={`/certificate/${certificate.verificationCode}`}
              target="_blank"
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              <span>Buka Dokumen E-Sertifikat Lengkap</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/"
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs transition text-center"
            >
              Beranda
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-3 text-center text-[11px] text-slate-500">
          Center for Language Assessment & Certification • Validated Digital Document
        </div>
      </div>
    </div>
  );
}
