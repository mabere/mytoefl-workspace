"use client";

import React, { useState, useEffect } from "react";
import { appFetch as fetch } from "@/lib/appUrl";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ExternalLink,
  BookOpen,
  Headphones,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DEMO_QUESTIONS, DEMO_PASSAGES, DemoQuestion } from "@/data/demoQuestions";

interface DemoResultData {
  lead: {
    id: string;
    name: string;
    phoneNumber?: string;
    startedAt: string;
    completedAt?: string;
  };
  result: {
    listeningRaw: number;
    listeningScaled: number;
    structureRaw: number;
    structureScaled: number;
    readingRaw: number;
    readingScaled: number;
    totalScore: number;
    cefrLevel: string;
  };
  questions: DemoQuestion[];
  userAnswers: Record<string, string>;
}

export default function DemoResultPage() {
  const params = useParams();
  const router = useRouter();
  const demoId = params.demoId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DemoResultData | null>(null);

  // Review filters
  const [filterType, setFilterType] = useState<"ALL" | "CORRECT" | "INCORRECT">("ALL");
  const [filterSection, setFilterSection] = useState<"ALL" | "LISTENING" | "STRUCTURE" | "READING">("ALL");
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function loadResult() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/demo/result/${demoId}`);
        if (!res.ok) throw new Error("Gagal mengambil data");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadResult();
  }, [demoId]);

  const toggleExpand = (num: number) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [num]: !prev[num],
    }));
  };

  const expandAll = () => {
    const all: Record<number, boolean> = {};
    (data?.questions || DEMO_QUESTIONS).forEach((q) => {
      all[q.number] = true;
    });
    setExpandedQuestions(all);
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400 font-medium">Memuat Hasil Evaluasi Demo...</p>
      </div>
    );
  }

  const { lead, result, userAnswers } = data;
  const questionsList = data.questions || DEMO_QUESTIONS;

  // Filtered list
  const filteredQuestions = questionsList.filter((q) => {
    const userAns = userAnswers[String(q.number)] || "";
    const isCorrect = userAns.toUpperCase() === q.correctAnswer;

    if (filterType === "CORRECT" && !isCorrect) return false;
    if (filterType === "INCORRECT" && isCorrect) return false;
    if (filterSection !== "ALL" && q.section !== filterSection) return false;

    return true;
  });

  const correctCount = questionsList.filter(
    (q) => (userAnswers[String(q.number)] || "").toUpperCase() === q.correctAnswer
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* TOP HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
            ITP
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900">
              Hasil Evaluasi Simulasi Demo TOEFL ITP®
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Peserta: <strong className="text-slate-700">{lead.name}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
          >
            Beranda
          </Link>
          <Link
            href="/student/dashboard"
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs transition shadow-xs"
          >
            Lihat Jadwal Ujian
          </Link>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* 1. SCORE SUMMARY HERO CARD */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative">
          {/* Watermark Ribbon */}
          <div className="bg-amber-500 text-slate-950 font-black text-[11px] tracking-wider uppercase py-1 px-4 text-center shadow-xs">
            ⚠️ SIMULASI DEMO (30 SOAL) — BUKAN SERTIFIKAT
          </div>

          <div className="p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulasi Mandiri 30 Menit Selesai</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Selamat, {lead.name}!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed">
                Anda telah menyelesaikan simulasi 30 soal TOEFL ITP. Berikut adalah estimasi prediksi skor dan tingkat kemahiran bahasa Inggris Anda:
              </p>
            </div>

            {/* Big Total Score Badge */}
            <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white text-center shadow-2xl min-w-[260px] border border-blue-500/20">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-200 block mb-1">
                Estimasi Skor TOEFL ITP®
              </span>
              <div className="text-5xl sm:text-6xl font-black tracking-tight my-2 text-white">
                {result.totalScore}
              </div>
              <div className="text-xs text-blue-200 font-mono mb-4">
                Skala Simulasi: 310 – 677
              </div>
              <div className="inline-block px-3 py-1 bg-white/15 border border-white/20 rounded-full font-bold text-xs backdrop-blur-xs">
                CEFR: {result.cefrLevel}
              </div>
            </div>
          </div>

          {/* 3 Section Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-slate-100 bg-slate-50 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            {/* Listening */}
            <div className="p-5 sm:p-6 text-center">
              <div className="flex items-center justify-center gap-2 text-slate-500 mb-1">
                <Headphones className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase">Section 1: Listening</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 my-1">
                {result.listeningScaled}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Benar: <strong className="text-slate-800">{result.listeningRaw}</strong> / 10 Soal
              </div>
            </div>

            {/* Structure */}
            <div className="p-5 sm:p-6 text-center">
              <div className="flex items-center justify-center gap-2 text-slate-500 mb-1">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase">Section 2: Structure</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 my-1">
                {result.structureScaled}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Benar: <strong className="text-slate-800">{result.structureRaw}</strong> / 10 Soal
              </div>
            </div>

            {/* Reading */}
            <div className="p-5 sm:p-6 text-center">
              <div className="flex items-center justify-center gap-2 text-slate-500 mb-1">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold uppercase">Section 3: Reading</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 my-1">
                {result.readingScaled}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Benar: <strong className="text-slate-800">{result.readingRaw}</strong> / 10 Soal
              </div>
            </div>
          </div>
        </div>

        {/* 2. CALL-TO-ACTION (LEAD CONVERSION) BANNER */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2 justify-center sm:justify-start">
              <span>Butuh Sertifikat Digital TOEFL ITP® Ber-kode Verifikasi?</span>
            </h3>
            <p className="text-xs sm:text-sm text-blue-200 max-w-xl leading-relaxed">
              Daftarkan diri Anda untuk sesi ujian berjadwal (140 soal). Dapatkan laporan skor dan sertifikat digital dengan kode verifikasi; penerimaan dokumen mengikuti kebijakan institusi tujuan.
            </p>
          </div>
          <Link
            href="/student/dashboard"
            className="py-3 px-6 bg-blue-500 hover:bg-blue-400 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-lg transition hover:scale-105 shrink-0 whitespace-nowrap"
          >
            Lihat Jadwal Ujian &rarr;
          </Link>
        </div>

        {/* 3. REVIEW KUNCI JAWABAN & PEMBAHASAN SINGKAT */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Evaluasi Soal & Pembahasan Singkat</span>
                <span className="text-xs font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                  {correctCount} / 30 Benar
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Klik kartu nomor soal di bawah ini untuk melihat ulasan dan penjelasan singkat.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex rounded-xl bg-slate-200 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFilterType("ALL")}
                  className={`px-3 py-1 rounded-lg transition ${
                    filterType === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Semua ({questionsList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("CORRECT")}
                  className={`px-3 py-1 rounded-lg transition ${
                    filterType === "CORRECT" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Benar ({correctCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("INCORRECT")}
                  className={`px-3 py-1 rounded-lg transition ${
                    filterType === "INCORRECT" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Salah ({questionsList.length - correctCount})
                </button>
              </div>

              <button
                type="button"
                onClick={expandAll}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Buka Semua
              </button>
            </div>
          </div>

          {/* Section Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {(["ALL", "LISTENING", "STRUCTURE", "READING"] as const).map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setFilterSection(sec)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  filterSection === sec
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {sec === "ALL" && "Semua Bagian"}
                {sec === "LISTENING" && "Listening (1-10)"}
                {sec === "STRUCTURE" && "Structure (11-20)"}
                {sec === "READING" && "Reading (21-30)"}
              </button>
            ))}
          </div>

          {/* Questions Accordion List */}
          <div className="space-y-3">
            {filteredQuestions.map((q) => {
              const userAns = userAnswers[String(q.number)] || "-";
              const isCorrect = userAns.toUpperCase() === q.correctAnswer;
              const isExpanded = !!expandedQuestions[q.number];

              return (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition"
                >
                  {/* Accordion Bar */}
                  <div
                    onClick={() => toggleExpand(q.number)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl font-extrabold text-xs flex items-center justify-center shrink-0 ${
                        isCorrect
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                          : "bg-rose-100 text-rose-700 border border-rose-300"
                      }`}>
                        {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">
                            Soal No. {q.number}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                            {q.section}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5 max-w-lg">
                          {q.questionText}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-medium">Jawaban Anda</span>
                        <span className={`font-mono font-bold text-xs ${
                          isCorrect ? "text-emerald-600" : "text-rose-600"
                        }`}>
                          {userAns} {isCorrect ? "(Tepat)" : `(Kunci: ${q.correctAnswer})`}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/60 space-y-4 text-xs sm:text-sm animate-in fade-in">
                      {/* Audio Script for Listening */}
                      {q.audioScript && (
                        <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200">
                          <span className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">
                            🎧 Transkrip Audio Soal:
                          </span>
                          <p className="text-xs font-serif text-slate-700 whitespace-pre-line leading-relaxed">
                            {q.audioScript}
                          </p>
                        </div>
                      )}

                      {/* Question Text */}
                      <p className="font-bold text-slate-900">
                        {q.questionText}
                      </p>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(["A", "B", "C", "D"] as const).map((optKey) => {
                          const isKey = q.correctAnswer === optKey;
                          const isUserPicked = userAns.toUpperCase() === optKey;

                          return (
                            <div
                              key={optKey}
                              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                                isKey
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold"
                                  : isUserPicked
                                  ? "bg-rose-50 border-rose-300 text-rose-900"
                                  : "bg-white border-slate-200 text-slate-600"
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10.5px] shrink-0 ${
                                isKey
                                  ? "bg-emerald-600 text-white"
                                  : isUserPicked
                                  ? "bg-rose-600 text-white"
                                  : "bg-slate-100 text-slate-500"
                              }`}>
                                {optKey}
                              </span>
                              <span>{q.options[optKey]}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation Box */}
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                        <div className="flex items-center gap-1.5 text-blue-800 font-extrabold text-xs mb-1">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Pembahasan Singkat:</span>
                        </div>
                        <p className="text-xs text-blue-900 font-medium leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM ACTION */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <h4 className="text-sm font-bold text-slate-900">
            Ingin Menguji Ulang Kemampuan Anda?
          </h4>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/"
              className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
            >
              Kembali ke Halaman Utama
            </Link>
            <Link
              href="/student/dashboard"
              className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition shadow-sm"
            >
              Lihat Jadwal Ujian
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
