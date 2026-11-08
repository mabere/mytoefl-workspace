"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileSpreadsheet,
  Headphones,
  BookOpen,
  FileText,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { ValidationReport } from "@/lib/excelPackageParser";

interface PackagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ValidationReport | null;
  packageData: any;
  onConfirmSave: (data: any) => Promise<void>;
}

export const PackagePreviewModal: React.FC<PackagePreviewModalProps> = ({
  isOpen,
  onClose,
  report,
  packageData,
  onConfirmSave,
}) => {
  const [activeTab, setActiveTab] = useState<"summary" | "listening" | "structure" | "reading">("summary");
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !report || !packageData) return null;

  const listeningQuestions = packageData.sections?.find((s: any) => s.sectionType === "LISTENING")?.questions || [];
  const structureQuestions = packageData.sections?.find((s: any) => s.sectionType === "STRUCTURE")?.questions || [];
  const readingQuestions = packageData.sections?.find((s: any) => s.sectionType === "READING")?.questions || [];

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onConfirmSave(packageData);
    } finally {
      setIsSaving(false);
    }
  };

  const errorIssues = report.issues.filter((i) => i.severity === "error");
  const warningIssues = report.issues.filter((i) => i.severity === "warning");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-none">
                Pratinjau & Validasi Paket Soal
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {packageData.title} • Kode: <strong className="font-mono text-blue-700">{packageData.code}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-slate-100 pt-3 pb-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab("summary")}
            className={`py-2 px-3 rounded-lg transition ${
              activeTab === "summary"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Ringkasan Integritas ({report.totalQuestions} Soal)
          </button>
          <button
            onClick={() => setActiveTab("listening")}
            className={`py-2 px-3 rounded-lg transition ${
              activeTab === "listening"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Listening ({listeningQuestions.length})
          </button>
          <button
            onClick={() => setActiveTab("structure")}
            className={`py-2 px-3 rounded-lg transition ${
              activeTab === "structure"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Structure ({structureQuestions.length})
          </button>
          <button
            onClick={() => setActiveTab("reading")}
            className={`py-2 px-3 rounded-lg transition ${
              activeTab === "reading"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Reading ({readingQuestions.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5">
          {/* TAB 1: SUMMARY & INTEGRITY CHECK */}
          {activeTab === "summary" && (
            <div className="space-y-5">
              {/* Section Count Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <Headphones className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Section 1: Listening
                    </span>
                    <span className="text-lg font-bold text-slate-900 font-mono">
                      {report.listeningCount} / 50 Soal
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Section 2: Structure
                    </span>
                    <span className="text-lg font-bold text-slate-900 font-mono">
                      {report.structureCount} / 40 Soal
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Section 3: Reading
                    </span>
                    <span className="text-lg font-bold text-slate-900 font-mono">
                      {report.readingCount} / 50 Soal
                    </span>
                  </div>
                </div>
              </div>

              {/* Integrity Status Box */}
              {report.isValid ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold">
                      Validasi Berhasil: Struktur File Sesuai Standar!
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Seluruh kunci jawaban valid (A, B, C, atau D) dan format soal siap disimpan ke database bank soal.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-900">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold">
                      Ditemukan Kesalahan Format / Kunci Jawaban
                    </h4>
                    <p className="text-xs text-rose-800 mt-0.5">
                      Harap perbaiki kesalahan di bawah ini pada file Anda sebelum menyimpan ke database.
                    </p>
                  </div>
                </div>
              )}

              {/* Error list */}
              {errorIssues.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">
                    Daftar Kesalahan Fatal ({errorIssues.length}):
                  </span>
                  <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-1.5 text-xs">
                    {errorIssues.map((err, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-rose-800">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <span>
                          [{err.section} {err.questionNumber ? `No. ${err.questionNumber}` : ""}]: {err.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warning list */}
              {warningIssues.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                    Peringatan ({warningIssues.length}):
                  </span>
                  <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 max-h-36 overflow-y-auto space-y-1 text-xs">
                    {warningIssues.map((warn, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-amber-900">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>[{warn.section}]: {warn.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2, 3, 4: QUESTION LIST PREVIEWS */}
          {activeTab !== "summary" && (
            <div className="space-y-3">
              {(activeTab === "listening"
                ? listeningQuestions
                : activeTab === "structure"
                ? structureQuestions
                : readingQuestions
              ).map((q: any) => (
                <div
                  key={q.questionNumber}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Soal No. {q.questionNumber} ({q.partType || "STANDARD"})
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 font-bold text-blue-800">
                      Kunci: {q.correctAnswer}
                    </span>
                  </div>
                  <p className="text-slate-700 font-serif line-clamp-2">
                    {q.questionText}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                    <span>A: {q.optionA}</span>
                    <span>B: {q.optionB}</span>
                    <span>C: {q.optionC}</span>
                    <span>D: {q.optionD}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-200 pt-4 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
          >
            Batal
          </button>

          <button
            onClick={handleSave}
            disabled={!report.isValid || isSaving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan ke Database...</span>
              </>
            ) : (
              <>
                <span>Simpan {report.totalQuestions} Soal ke Database</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
