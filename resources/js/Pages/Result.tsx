"use client";

import React, { useEffect, useState } from "react";
import { appFetch as fetch } from "@/lib/appUrl";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Printer,
  Award,
  CheckCircle,
  FileText,
  Calendar,
  User,
  Hash,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

interface ResultData {
  participantName: string;
  tokenCode: string;
  packageTitle: string;
  completedAt: string;
  result: {
    id: string;
    listeningRaw: number;
    listeningScaled: number;
    structureRaw: number;
    structureScaled: number;
    readingRaw: number;
    readingScaled: number;
    totalScore: number;
    cefrLevel: string;
    cefrDescription: string;
  };
  certificate?: {
    id: string;
    certificateNumber: string;
    verificationCode: string;
  } | null;
}

export default function ResultPage() {
  const { sessionId } = useParams();
  const [data, setData] = useState<ResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadResult() {
      try {
        const res = await fetch(`/api/result/${sessionId}`);
        const json = await res.json();
        if (json.error) {
          alert(json.error);
        } else {
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load result:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadResult();
  }, [sessionId]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-700 font-semibold">
          Membuat Laporan Skor Simulasi TOEFL ITP...
        </p>
      </div>
    );
  }

  if (!data || !data.result) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-md max-w-md w-full text-center">
          <p className="text-slate-700 mb-4">
            Data hasil ujian belum tersedia atau sedang diproses.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const { result } = data;
  const testDate = new Date(data.completedAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 print:bg-white print:py-0 print:px-0">
      {/* Action Bar (Hidden on Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl shadow-xs border border-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Selesai & Ke Halaman Awal</span>
        </Link>

        <div className="flex items-center gap-3">
          {data.certificate && (
            <Link
              href={`/certificate/${data.certificate.verificationCode}`}
              target="_blank"
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-sm shadow-md transition active:scale-95"
            >
              <Award className="w-4 h-4" />
              <span>Lihat Sertifikat Digital</span>
            </Link>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Hasil Skor</span>
          </button>
        </div>
      </div>

      {/* DIGITAL SCORE REPORT CARD */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border-4 border-slate-300 print:border-2 print:border-slate-400 p-8 sm:p-12 relative overflow-hidden print:shadow-none print:rounded-none">
        {/* Subtle Watermark Stamp */}
        <div className="absolute right-[-40px] bottom-[-40px] opacity-[0.03] select-none pointer-events-none">
          <Award className="w-96 h-96 text-slate-900" />
        </div>

        {/* Certificate Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-8 text-center relative">
          <div className="inline-block bg-slate-900 text-white font-extrabold text-xs px-4 py-1.5 rounded tracking-widest uppercase mb-3">
            Institutional Testing Program
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-slate-900 uppercase">
            TOEFL ITP® Prediction Score Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-serif mt-1">
            Laporan Hasil Simulasi Bahasa Inggris Institusional
          </p>
        </div>

        {/* Candidate Information Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-600">
              <User className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider">
                Nama Peserta:
              </span>
            </div>
            <p className="text-lg font-bold text-slate-900 pl-6">
              {data.participantName}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider">
                Tanggal Ujian:
              </span>
            </div>
            <p className="text-base font-bold text-slate-900 pl-6">
              {testDate}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-600">
              <Hash className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider">
                Token / Sesi Ujian:
              </span>
            </div>
            <p className="text-sm font-mono font-bold text-slate-800 pl-6">
              {data.tokenCode}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-600">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider">
                Paket Ujian:
              </span>
            </div>
            <p className="text-sm font-medium text-slate-800 pl-6 line-clamp-1">
              {data.packageTitle}
            </p>
          </div>
        </div>

        {/* SECTION SCORES BREAKDOWN TABLE */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Rincian Skor Per Seksi (Skala Simulasi TOEFL ITP)</span>
          </h2>

          <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-white text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Seksi Ujian</th>
                  <th className="py-3.5 px-4 text-center">Jumlah Soal</th>
                  <th className="py-3.5 px-4 text-center">Jawaban Benar</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">
                    Nilai Skala (31 - 68)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                <tr className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 sm:px-6 font-semibold">
                    Section 1: Listening Comprehension
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500">50</td>
                  <td className="py-3 px-4 text-center text-slate-700 font-semibold">
                    {result.listeningRaw}
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-right font-mono font-bold text-blue-700 text-base">
                    {result.listeningScaled}
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 sm:px-6 font-semibold">
                    Section 2: Structure & Written Expression
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500">40</td>
                  <td className="py-3 px-4 text-center text-slate-700 font-semibold">
                    {result.structureRaw}
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-right font-mono font-bold text-blue-700 text-base">
                    {result.structureScaled}
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 sm:px-6 font-semibold">
                    Section 3: Reading Comprehension
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500">50</td>
                  <td className="py-3 px-4 text-center text-slate-700 font-semibold">
                    {result.readingRaw}
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-right font-mono font-bold text-blue-700 text-base">
                    {result.readingScaled}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* TOTAL SCORE & CEFR BADGE */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold text-blue-200 uppercase tracking-widest block mb-1">
              Skor Akhir Simulasi TOEFL ITP® (Skala 310 - 677)
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl sm:text-6xl font-black font-serif tracking-tight">
                {result.totalScore}
              </span>
              <span className="text-xs text-blue-200">/ 677 Max</span>
            </div>
            <p className="text-xs text-blue-200/90 mt-2">
              Dihitung dengan rumus konversi yang dikonfigurasi lembaga: ((L + S + R) × 10) / 3
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center sm:text-right min-w-[200px]">
            <span className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider block mb-1">
              Standar Kecakapan CEFR
            </span>
            <div className="inline-block bg-amber-400 text-slate-950 font-black text-2xl px-3 py-0.5 rounded-lg shadow-sm mb-1">
              Level {result.cefrLevel}
            </div>
            <p className="text-xs text-blue-100 font-medium">
              {result.cefrDescription}
            </p>
          </div>
        </div>

        {/* Institutional Verification Footer */}
        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>
              Dokumen ini dihasilkan secara otomatis oleh sistem simulasi TOEFL ITP
              lembaga.
            </span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            ID Sesi: {sessionId.slice(0, 16)}...
          </div>
        </div>
      </div>
    </div>
  );
}
