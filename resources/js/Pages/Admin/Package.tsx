"use client";

import React, { useEffect, useState, use } from "react";
import { appFetch as fetch, appUrl } from "@/lib/appUrl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Headphones,
  BookOpen,
  FileText,
  Upload,
  Play,
  Volume2,
  Download,
  Loader2,
  Check,
  AlertCircle,
  FileEdit,
} from "lucide-react";
import AudioSegmentEditor from "@/components/admin/AudioSegmentEditor";

interface QuestionItem {
  id: string;
  questionNumber: number;
  passageId: string | null;
  questionText: string | null;
  audioUrl: string | null;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  partType: string | null;
}

interface PassageItem {
  id: string;
  title: string | null;
  content: string | null;
  audioUrl: string | null;
  orderIndex: number;
}

interface SectionItem {
  id: string;
  sectionType: string;
  title: string;
  durationMinutes: number;
  orderIndex: number;
  passages: PassageItem[];
  questions: QuestionItem[];
}

interface PackageDetail {
  id: string;
  code: string;
  title: string;
  description: string | null;
  isActive: boolean;
  sections: SectionItem[];
}

export default function PackageEditorPage({
  params,
}: {
  params: Promise<{ packageId: string }>;
}) {
  const { packageId } = use(params);
  const router = useRouter();

  const [pkg, setPkg] = useState<PackageDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"LISTENING" | "STRUCTURE" | "READING">("LISTENING");
  const [saveStatus, setSaveStatus] = useState<Record<string, boolean>>({});
  const [isUploadingAudio, setIsUploadingAudio] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadPackage() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/admin/packages/${packageId}/detail`);
        const json = await res.json();
        if (json.package) {
          setPkg(json.package);
        } else {
          alert(json.error || "Gagal memuat paket.");
          router.push("/admin");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPackage();
  }, [packageId, router]);

  // Handle Question update
  const handleSaveQuestion = async (q: QuestionItem) => {
    try {
      setSaveStatus((prev) => ({ ...prev, [q.id]: true }));
      const res = await fetch(`/api/admin/questions/${q.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(q),
      });
      const json = await res.json();
      if (!json.success) {
        alert("Gagal menyimpan perubahan soal.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    } finally {
      setTimeout(() => {
        setSaveStatus((prev) => ({ ...prev, [q.id]: false }));
      }, 1500);
    }
  };

  // Handle Passage update
  const handleSavePassage = async (p: PassageItem) => {
    try {
      setSaveStatus((prev) => ({ ...prev, [p.id]: true }));
      const res = await fetch(`/api/admin/passages/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      const json = await res.json();
      if (!json.success) {
        alert("Gagal menyimpan teks bacaan.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    } finally {
      setTimeout(() => {
        setSaveStatus((prev) => ({ ...prev, [p.id]: false }));
      }, 1500);
    }
  };

  // Handle Audio MP3 Upload
  const handleAudioUpload = async (
    targetId: string,
    file: File,
    isPassage: boolean = false
  ) => {
    try {
      setIsUploadingAudio((prev) => ({ ...prev, [targetId]: true }));
      const formData = new FormData();
      formData.append("audio", file);

      const res = await fetch("/api/admin/upload-audio", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (json.success && json.url) {
        if (isPassage) {
          // Update passage audioUrl in local state and db
          setPkg((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              sections: prev.sections.map((sec) => ({
                ...sec,
                passages: sec.passages.map((p) =>
                  p.id === targetId ? { ...p, audioUrl: json.url } : p
                ),
              })),
            };
          });
          await fetch(`/api/admin/passages/${targetId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audioUrl: json.url }),
          });
        } else {
          // Update question audioUrl in local state and db
          setPkg((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              sections: prev.sections.map((sec) => ({
                ...sec,
                questions: sec.questions.map((q) =>
                  q.id === targetId ? { ...q, audioUrl: json.url } : q
                ),
              })),
            };
          });
          await fetch(`/api/admin/questions/${targetId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audioUrl: json.url }),
          });
        }
        alert("Audio berhasil diunggah!");
      } else {
        alert(json.error || "Gagal mengunggah audio.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi gangguan jaringan saat mengunggah audio.");
    } finally {
      setIsUploadingAudio((prev) => ({ ...prev, [targetId]: false }));
    }
  };

  const updateQuestionField = (
    sectionType: string,
    qId: string,
    field: keyof QuestionItem,
    value: any
  ) => {
    setPkg((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        sections: prev.sections.map((sec) => {
          if (sec.sectionType !== sectionType) return sec;
          return {
            ...sec,
            questions: sec.questions.map((q) => {
              if (q.id !== qId) return q;
              return { ...q, [field]: value };
            }),
          };
        }),
      };
    });
  };

  const updatePassageField = (
    sectionType: string,
    pId: string,
    field: keyof PassageItem,
    value: any
  ) => {
    setPkg((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        sections: prev.sections.map((sec) => {
          if (sec.sectionType !== sectionType) return sec;
          return {
            ...sec,
            passages: sec.passages.map((p) => {
              if (p.id !== pId) return p;
              return { ...p, [field]: value };
            }),
          };
        }),
      };
    });
  };

  if (isLoading || !pkg) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-600 font-semibold text-sm">
          Memuat seluruh bank soal paket...
        </p>
      </div>
    );
  }

  const currentSec = pkg.sections.find((s) => s.sectionType === activeSection);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
              title="Kembali ke Dashboard Admin"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-none">
                  {pkg.title}
                </h1>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-blue-700 border border-slate-200 px-2 py-0.5 rounded">
                  {pkg.code}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Editor Bank Soal Interaktif (Kunci Jawaban, Teks, & Audio)
              </p>
            </div>
          </div>

          <a
            href={appUrl(`/api/admin/packages/${pkg.id}/export`)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs shadow-xs transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor JSON</span>
          </a>
        </div>

        {/* SECTION SELECTOR TABS */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 border-t border-slate-100">
          <button
            onClick={() => setActiveSection("LISTENING")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeSection === "LISTENING"
                ? "border-blue-600 text-blue-700 bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>Section 1: Listening (50 Soal)</span>
          </button>

          <button
            onClick={() => setActiveSection("STRUCTURE")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeSection === "STRUCTURE"
                ? "border-blue-600 text-blue-700 bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Section 2: Structure (40 Soal)</span>
          </button>

          <button
            onClick={() => setActiveSection("READING")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeSection === "READING"
                ? "border-blue-600 text-blue-700 bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Section 3: Reading (50 Soal • 5 Passage)</span>
          </button>
        </div>
      </header>

      {/* MAIN EDITOR CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* PASSAGES FOR READING OR LISTENING PART B/C */}
        {currentSec?.passages && currentSec.passages.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <FileEdit className="w-4 h-4 text-blue-600" />
              <span>Naskah Bacaan / Passage ({currentSec.passages.length} Teks)</span>
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {currentSec.passages.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md">
                      Passage #{p.orderIndex}
                    </span>
                    <button
                      onClick={() => handleSavePassage(p)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-xs"
                    >
                      {saveStatus[p.id] ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Tersimpan!</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Simpan Passage</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                      Judul Passage
                    </label>
                    <input
                      type="text"
                      value={p.title || ""}
                      onChange={(e) =>
                        updatePassageField(currentSec.sectionType, p.id, "title", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                      Isi Teks / Naskah Dialog Passage
                    </label>
                    <textarea
                      rows={4}
                      value={p.content || ""}
                      onChange={(e) =>
                        updatePassageField(currentSec.sectionType, p.id, "content", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-serif leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Audio upload & timestamp editor for Listening passage */}
                  {currentSec.sectionType === "LISTENING" && (
                    <AudioSegmentEditor
                      label="Audio Percakapan / Monolog (Passage):"
                      audioUrl={p.audioUrl}
                      onChange={(newUrl) =>
                        updatePassageField(currentSec.sectionType, p.id, "audioUrl", newUrl)
                      }
                      onUpload={(file) => handleAudioUpload(p.id, file, true)}
                      isUploading={isUploadingAudio[p.id]}
                      defaultBaseUrl="/Toefl-test-3.mp3"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QUESTIONS LIST */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Daftar Pertanyaan ({currentSec?.questions.length ?? 0} Soal)</span>
          </h2>

          <div className="space-y-4">
            {currentSec?.questions.map((q) => (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-slate-300 transition"
              >
                {/* Question Header & Save Button */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      Soal No. {q.questionNumber}
                    </span>
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border">
                      {q.partType || "STANDARD"}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSaveQuestion(q)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    {saveStatus[q.id] ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Tersimpan!</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Simpan Soal</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Question Text / Script */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    {activeSection === "LISTENING"
                      ? "Naskah Audio / Dialog Soal (Dibacakan Narator & Pembicara)"
                      : activeSection === "STRUCTURE" && q.partType === "WRITTEN_EXPRESSION"
                      ? "Kalimat Bergaris Bawah (Format: {A:kata} ... {B:kata} ...)"
                      : "Teks Pertanyaan"}
                  </label>
                  <textarea
                    rows={activeSection === "LISTENING" ? 3 : 2}
                    value={q.questionText || ""}
                    onChange={(e) =>
                      updateQuestionField(currentSec.sectionType, q.id, "questionText", e.target.value)
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-serif leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Audio Upload & Timestamp Setting for Section 1 */}
                {activeSection === "LISTENING" && (
                  <AudioSegmentEditor
                    label={`Audio Soal #${q.questionNumber}:`}
                    audioUrl={q.audioUrl}
                    onChange={(newUrl) =>
                      updateQuestionField(currentSec.sectionType, q.id, "audioUrl", newUrl)
                    }
                    onUpload={(file) => handleAudioUpload(q.id, file, false)}
                    isUploading={isUploadingAudio[q.id]}
                    defaultBaseUrl="/Toefl-test-3.mp3"
                  />
                )}

                {/* Options A, B, C, D */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(["optionA", "optionB", "optionC", "optionD"] as const).map((optKey, idx) => {
                    const letter = String.fromCharCode(65 + idx); // A, B, C, D
                    const isCorrect = q.correctAnswer === letter;
                    return (
                      <div
                        key={optKey}
                        className={`p-2.5 rounded-xl border transition flex items-center gap-2 ${
                          isCorrect
                            ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400"
                            : "bg-slate-50/50 border-slate-200"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            updateQuestionField(currentSec.sectionType, q.id, "correctAnswer", letter)
                          }
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition ${
                            isCorrect
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                          }`}
                          title={`Jadikan (${letter}) sebagai kunci jawaban`}
                        >
                          {letter}
                        </button>
                        <input
                          type="text"
                          value={q[optKey] || ""}
                          onChange={(e) =>
                            updateQuestionField(currentSec.sectionType, q.id, optKey, e.target.value)
                          }
                          placeholder={`Teks pilihan jawaban (${letter})`}
                          className="w-full bg-transparent text-xs text-slate-800 focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>
                    Kunci Jawaban Aktif:{" "}
                    <strong className="text-emerald-700 font-mono font-bold text-xs">
                      Pilihan ({q.correctAnswer})
                    </strong>
                  </span>
                  <span className="text-slate-400">
                    Klik huruf lingkaran di samping opsi untuk mengubah kunci jawaban.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
