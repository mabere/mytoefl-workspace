"use client";

import React, { useEffect, useState, useRef } from "react";
import { appFetch as fetch, appUrl } from "@/lib/appUrl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  BookOpen,
  Award,
  Clock,
  CheckCircle,
  Play,
  LogOut,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Headphones,
  FileText,
  AlertCircle,
  CheckCircle2,
  Volume2,
  VolumeX,
  Lock,
  Sparkles,
  Ticket,
  ChevronRight,
  Info,
  X,
  CreditCard,
  Banknote,
  Upload,
  Receipt,
  Image as ImageIcon,
} from "lucide-react";
import { useExamStore } from "@/lib/examStore";

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  idNumber: string | null;
  phoneNumber: string | null;
  institution: string | null;
}

interface RegistrationItem {
  id: string;
  registrationNumber: string;
  amount: number;
  status: string;
  paymentMethod: string | null;
  paymentProofUrl: string | null;
  paymentNotes: string | null;
  rejectionReason: string | null;
  createdAt: string;
  schedule: {
    id: string;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string;
    price: number;
    package: {
      id: string;
      code: string;
      title: string;
      sections: {
        sectionType: string;
        title: string;
        durationMinutes: number;
        _count: { questions: number };
      }[];
    };
  };
  session?: {
    id: string;
    status: string;
    result?: {
      listeningScaled: number;
      structureScaled: number;
      readingScaled: number;
      totalScore: number;
      cefrLevel: string;
    } | null;
    certificate?: {
      id: string;
      certificateNumber: string;
      verificationCode: string;
      issuedAt: string;
    } | null;
  } | null;
}

interface AvailableSchedule {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  price: number;
  quota: number;
  registrationsCount: number;
  package: {
    id: string;
    code: string;
    title: string;
    description: string | null;
    sections: {
      sectionType: string;
      title: string;
      durationMinutes: number;
      _count: { questions: number };
    }[];
  };
}

interface CertificateItem {
  id: string;
  certificateNumber: string;
  participantName: string;
  testDate: string;
  listeningScore: number;
  structureScore: number;
  readingScore: number;
  totalScore: number;
  cefrLevel: string;
  verificationCode: string;
  issuedAt: string;
  session?: {
    id: string;
    package?: {
      code: string;
      title: string;
    };
  };
}

type StudentTab = "tickets" | "catalog" | "certificates";

function getInitialStudentTab(): StudentTab {
  if (typeof window === "undefined") return "tickets";

  const tab = new URLSearchParams(window.location.search).get("tab");
  return tab === "catalog" || tab === "certificates" ? tab : "tickets";
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [availableSchedules, setAvailableSchedules] = useState<AvailableSchedule[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Tabs: "tickets" | "catalog" | "certificates"
  const [activeTab, setActiveTab] = useState<StudentTab>(getInitialStudentTab);

  // Modals state
  const [audioModalOpen, setAudioModalOpen] = useState(false);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [confirmEnrollSchedule, setConfirmEnrollSchedule] = useState<AvailableSchedule | null>(null);

  // Payment states
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"TRANSFER" | "CASH">("TRANSFER");
  const [enrollPaymentNotes, setEnrollPaymentNotes] = useState("");
  const [uploadModalReg, setUploadModalReg] = useState<RegistrationItem | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofNotes, setProofNotes] = useState("");
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  // Action loaders
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isStartingId, setIsStartingId] = useState<string | null>(null);

  // Audio player ref for Audio Check
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioTestTimerRef = useRef<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioTestVolume, setAudioTestVolume] = useState(0.8);
  const [isAudioTestMuted, setIsAudioTestMuted] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const res = await fetch("/api/student/dashboard");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        const errorPayload = await res.json().catch(() => ({}));
        throw new Error(errorPayload.error || "Data portal peserta gagal dimuat.");
      }
      const json = await res.json();
      if (!json.student) throw new Error("Sesi peserta tidak valid.");
      setStudent(json.student);
      setRegistrations(json.registrations || []);
      setAvailableSchedules(json.availableSchedules || []);
      setCertificates(json.certificates || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setLoadError(err instanceof Error ? err.message : "Data portal peserta gagal dimuat.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Keep the selected student area after a hard refresh.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (activeTab === "tickets") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", activeTab);
    }

    const nextUrl = url.toString();
    if (nextUrl !== window.location.href) {
      window.history.replaceState({}, "", url);
    }
  }, [activeTab]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/user-logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnroll = async () => {
    if (!confirmEnrollSchedule) return;
    try {
      setIsEnrolling(true);
      const res = await fetch("/api/student/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId: confirmEnrollSchedule.id,
          paymentMethod: selectedPaymentMethod,
          paymentNotes: enrollPaymentNotes,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Pendaftaran sesi gagal.");
        return;
      }
      setConfirmEnrollSchedule(null);
      setEnrollPaymentNotes("");
      await fetchDashboardData();
      setActiveTab("tickets");
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem saat mendaftar.");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadModalReg || !proofFile) {
      alert("Silakan pilih file bukti transfer.");
      return;
    }

    try {
      setIsUploadingProof(true);
      const formData = new FormData();
      formData.append("registrationId", uploadModalReg.id);
      formData.append("proof", proofFile);
      formData.append("paymentNotes", proofNotes);

      const res = await fetch("/api/student/payment-proof", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Gagal mengunggah bukti pembayaran.");
        return;
      }

      setUploadModalReg(null);
      setProofFile(null);
      setProofNotes("");
      await fetchDashboardData();
      router.push("/thank-you?type=payment");
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan saat mengunggah.");
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleStartExam = async (registrationId: string) => {
    try {
      setIsStartingId(registrationId);
      // Request fullscreen while the launch button still has a user gesture.
      // The exam page retries this request and shows a blocking prompt when
      // the browser does not allow it automatically.
      if (
        typeof document !== "undefined" &&
        !document.fullscreenElement &&
        document.fullscreenEnabled
      ) {
        void document.documentElement
          .requestFullscreen({ navigationUI: "hide" })
          .catch(() => undefined);
      }
      const res = await fetch("/api/student/start-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Gagal masuk ruang ujian.");
        return;
      }

      useExamStore.getState().resetExam();
      router.push(`/exam/${json.sessionId}`);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsStartingId(null);
    }
  };

  const stopAudioTest = () => {
    if (audioTestTimerRef.current !== null) {
      window.clearTimeout(audioTestTimerRef.current);
      audioTestTimerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  const handleAudioTestVolumeChange = (nextVolume: number) => {
    const nextMuted = nextVolume === 0;
    setAudioTestVolume(nextVolume);
    setIsAudioTestMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.volume = nextMuted ? 0 : nextVolume;
    }
  };

  const toggleAudioTestMute = () => {
    const nextMuted = !isAudioTestMuted;
    setIsAudioTestMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.volume = nextMuted ? 0 : audioTestVolume;
    }
    if (isPlayingAudio && typeof window !== "undefined" && "speechSynthesis" in window) {
      if (nextMuted) window.speechSynthesis.pause();
      else window.speechSynthesis.resume();
    }
  };

  const toggleTestAudio = async () => {
    if (isPlayingAudio) {
      stopAudioTest();
      return;
    }

    try {
      setIsPlayingAudio(true);

      // 1. Play dedicated headphone bell chime
      if (audioRef.current) {
        audioRef.current.volume = isAudioTestMuted ? 0 : audioTestVolume;
        audioRef.current.currentTime = 0;
        await audioRef.current.play().catch(() => {});
      }

      // 2. Clear native English sound check narration
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(
          "This is a sound check for your headphones. Please adjust your volume to a comfortable level. If you can hear this audio clearly in both ears, your headphones are working properly for the TOEFL ITP exam."
        );
        utterance.lang = "en-US";
        utterance.rate = 0.95;
        utterance.volume = isAudioTestMuted ? 0 : audioTestVolume;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);

        audioTestTimerRef.current = window.setTimeout(() => {
          audioTestTimerRef.current = null;
          window.speechSynthesis.speak(utterance);
        }, 1200);
      } else {
        audioTestTimerRef.current = window.setTimeout(() => {
          audioTestTimerRef.current = null;
          setIsPlayingAudio(false);
        }, 3500);
      }
    } catch (err) {
      console.warn("Audio test playback error:", err);
      setIsPlayingAudio(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-400 text-sm font-medium">Memuat portal peserta ujian...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-rose-200 shadow-sm p-8 max-w-md w-full text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900 mb-2">Portal peserta belum dapat dimuat</h2>
          <p className="text-xs text-slate-500 mb-5">{loadError}</p>
          <button
            onClick={fetchDashboardData}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-700 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-sm">
              ITP
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg block leading-none">
                Portal Peserta Ujian
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                TOEFL ITP® Online Certification
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAudioModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
            >
              <Headphones className="w-3.5 h-3.5 text-blue-600" />
              <span>Uji Audio</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-300 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 text-slate-700 rounded-xl font-semibold text-xs transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xl">
              <User className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                  {student.name}
                </h2>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  Akun Terverifikasi
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span>Email: <strong>{student.email}</strong></span>
                {student.idNumber && (
                  <span>• NIK/Paspor: <strong>{student.idNumber}</strong></span>
                )}
                {student.phoneNumber && (
                  <span>• WA: <strong>{student.phoneNumber}</strong></span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRulesModalOpen(true)}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span>Tata Tertib Ujian</span>
            </button>
            <button
              onClick={() => setAudioModalOpen(true)}
              className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Cek Headphone</span>
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab("tickets")}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === "tickets"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Tiket Ujian Saya</span>
            {registrations.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-[11px] font-mono px-2 py-0.2 rounded-full">
                {registrations.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("catalog")}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === "catalog"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Katalog Jadwal Ujian</span>
            {availableSchedules.length > 0 && (
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-mono px-2 py-0.2 rounded-full">
                {availableSchedules.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("certificates")}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === "certificates"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>E-Sertifikat Terbit</span>
            {certificates.length > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[11px] font-mono px-2 py-0.2 rounded-full">
                {certificates.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: TIKET UJIAN SAYA (WAITING ROOM) */}
        {activeTab === "tickets" && (
          <div className="space-y-4">
            {registrations.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Anda Belum Memiliki Tiket Ujian
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                  Silakan buka tab <strong>"Katalog Jadwal Ujian"</strong> untuk memilih tanggal dan mendaftarkan diri pada sesi simulasi TOEFL ITP yang tersedia.
                </p>
                <button
                  onClick={() => setActiveTab("catalog")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Pilih Jadwal Ujian Sekarang</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {registrations.map((reg) => {
                  const startTime = new Date(reg.schedule.startTime);
                  const endTime = new Date(reg.schedule.endTime);
                  const now = new Date();

                  const isWithinWindow = now >= startTime && now <= endTime;
                  const isFinished = reg.session?.status === "COMPLETED";
                  const isInProgress = reg.session?.status === "IN_PROGRESS";
                  const isFuture = now < startTime;

                  const dateFormatted = startTime.toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });
                  const timeFormatted = `${startTime.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })} - ${endTime.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })} WIB`;

                  const isPaymentConfirmed = reg.status === "CONFIRMED" || reg.status === "COMPLETED";
                  const isPendingPayment = reg.status === "PENDING_PAYMENT";
                  const isWaitingApproval = reg.status === "WAITING_APPROVAL";
                  const isRejected = reg.status === "REJECTED";

                  return (
                    <div
                      key={reg.id}
                      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-6 hover:shadow-md transition"
                    >
                      <div className="space-y-3.5 flex-1">
                        {/* Status Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded">
                            {reg.registrationNumber}
                          </span>
                          <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {reg.schedule.package.code}
                          </span>

                          {/* Payment status badge */}
                          {isPendingPayment && (
                            <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded flex items-center gap-1">
                              <CreditCard className="w-3 h-3 text-amber-600" /> Belum Bayar
                            </span>
                          )}
                          {isWaitingApproval && (
                            <span className="text-xs font-bold text-blue-800 bg-blue-50 border border-blue-300 px-2.5 py-0.5 rounded flex items-center gap-1">
                              <Clock className="w-3 h-3 text-blue-600 animate-pulse" /> Menunggu Verifikasi Admin
                            </span>
                          )}
                          {isRejected && (
                            <span className="text-xs font-bold text-rose-800 bg-rose-50 border border-rose-300 px-2.5 py-0.5 rounded flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-rose-600" /> Pembayaran Ditolak
                            </span>
                          )}
                          {isPaymentConfirmed && (
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Lunas Terverifikasi
                            </span>
                          )}

                          {/* Exam session status badge (only when payment is confirmed) */}
                          {isPaymentConfirmed && (
                            <>
                              {isFinished ? (
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> Ujian Selesai
                                </span>
                              ) : isInProgress ? (
                                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded flex items-center gap-1">
                                  <Clock className="w-3 h-3 animate-pulse" /> Sedang Dikerjakan
                                </span>
                              ) : isWithinWindow ? (
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                  Ruang Ujian Terbuka
                                </span>
                              ) : (
                                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded flex items-center gap-1">
                                  <Lock className="w-3 h-3" /> Menunggu Jam Ujian
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-slate-900 leading-snug">
                            {reg.schedule.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {reg.schedule.package.title}
                          </p>
                        </div>

                        {/* Schedule details */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span>{dateFormatted}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span>{timeFormatted}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Banknote className="w-4 h-4 text-emerald-600" />
                            <span>
                              Biaya: <strong>{reg.amount > 0 ? `Rp ${reg.amount.toLocaleString("id-ID")}` : "Gratis"}</strong>
                            </span>
                          </div>
                        </div>

                        {/* PAYMENT GUIDANCE BOX (If not confirmed) */}
                        {isPendingPayment && (
                          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-2">
                            <div className="flex items-center justify-between font-bold">
                              <span className="flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4 text-amber-600" />
                                {reg.paymentMethod === "CASH" ? "Metode: Tunai di Loket / Kasir Panitia" : "Metode: Transfer Bank Resmi"}
                              </span>
                              <span className="text-amber-800 text-[11px] font-mono">
                                Tagihan: Rp {reg.amount.toLocaleString("id-ID")}
                              </span>
                            </div>

                            {reg.paymentMethod === "CASH" ? (
                              <p className="text-[11px] text-amber-800 leading-relaxed">
                                Silakan lakukan pembayaran tunai di loket pendaftaran/keuangan panitia dengan menyebutkan <strong>No. Registrasi: {reg.registrationNumber}</strong>. Petugas akan memvalidasi dan mengaktifkan tiket Anda.
                              </p>
                            ) : (
                              <div className="space-y-1 text-[11px] text-amber-800 leading-relaxed">
                                <p>Silakan transfer tepat sebesar <strong>Rp {reg.amount.toLocaleString("id-ID")}</strong> ke rekening resmi:</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[10.5px]">
                                  <div className="bg-white/80 p-2 rounded-lg border border-amber-200">
                                    <span className="text-slate-500 font-sans block text-[10px]">BCA (Bank Central Asia)</span>
                                    <strong className="text-slate-900 select-all">8720-9988-1234</strong>
                                    <span className="text-slate-500 block text-[9.5px]">a.n. Lembaga Bahasa ITP</span>
                                  </div>
                                  <div className="bg-white/80 p-2 rounded-lg border border-amber-200">
                                    <span className="text-slate-500 font-sans block text-[10px]">Bank Mandiri</span>
                                    <strong className="text-slate-900 select-all">137-00-1928-4821</strong>
                                    <span className="text-slate-500 block text-[9.5px]">a.n. Yayasan TOEFL Testing</span>
                                  </div>
                                </div>
                                <p className="pt-1 text-[10.5px]">
                                  Setelah transfer, tekan tombol <strong>"Unggah Bukti Transfer"</strong> di sebelah kanan untuk mempercepat verifikasi tiket.
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {isWaitingApproval && (
                          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 space-y-1.5">
                            <div className="flex items-center justify-between font-bold">
                              <span className="flex items-center gap-1.5">
                                <Receipt className="w-4 h-4 text-blue-600" />
                                Bukti Pembayaran Berhasil Dikirim
                              </span>
                              {reg.paymentProofUrl && (
                                <a
                                  href={appUrl(reg.paymentProofUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-blue-700 hover:underline flex items-center gap-1"
                                >
                                  <ImageIcon className="w-3.5 h-3.5" />
                                  <span>Lihat Struk</span>
                                </a>
                              )}
                            </div>
                            <p className="text-[11px] text-blue-800 leading-relaxed">
                              Struk pembayaran Anda sedang dalam antrean verifikasi petugas admin keuangan. Tiket ujian Anda akan aktif secara otomatis begitu status disetujui.
                            </p>
                            {reg.paymentNotes && (
                              <p className="text-[10px] text-blue-600 bg-white/70 px-2 py-1 rounded border border-blue-100">
                                Catatan Pengirim: {reg.paymentNotes}
                              </p>
                            )}
                          </div>
                        )}

                        {isRejected && (
                          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-900 space-y-1.5">
                            <div className="flex items-center gap-1.5 font-bold">
                              <AlertCircle className="w-4 h-4 text-rose-600" />
                              <span>Verifikasi Pembayaran Ditolak</span>
                            </div>
                            <p className="text-[11px] text-rose-800">
                              <strong>Alasan Admin:</strong> {reg.rejectionReason || "Bukti transfer tidak valid atau dana belum masuk ke mutasi bank."}
                            </p>
                            <p className="text-[10.5px] text-rose-700">
                              Silakan periksa kembali transfer Anda dan unggah bukti struk yang benar melalui tombol di bawah.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* ACTION CONTROLS / RESULT */}
                      <div className="shrink-0 flex flex-col items-stretch md:items-end gap-2.5 min-w-[210px]">
                        {!isPaymentConfirmed ? (
                          /* PAYMENT NOT YET CONFIRMED: Actions to Upload Proof or Instructions */
                          <div className="space-y-2 w-full text-center md:text-right">
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                              <span className="text-[11px] text-slate-500 font-semibold block flex items-center justify-center md:justify-end gap-1">
                                <Lock className="w-3.5 h-3.5 text-slate-400" />
                                Ruang Ujian Terkunci
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                Aktif setelah pembayaran diverifikasi
                              </span>
                            </div>

                            {/* Action to upload proof */}
                            {(isPendingPayment || isRejected) && (
                              <button
                                onClick={() => setUploadModalReg(reg)}
                                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>{isRejected ? "Unggah Bukti Ulang" : "Unggah Bukti Transfer"}</span>
                              </button>
                            )}

                            {isWaitingApproval && (
                              <button
                                onClick={() => setUploadModalReg(reg)}
                                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-[11px] transition flex items-center justify-center gap-1"
                              >
                                <Upload className="w-3 h-3 text-slate-500" />
                                <span>Perbarui / Ganti Bukti</span>
                              </button>
                            )}
                          </div>
                        ) : isFinished && reg.session?.result ? (
                          <div className="text-center md:text-right space-y-2">
                            <div className="bg-slate-900 text-white p-3 rounded-xl">
                              <span className="text-[10px] text-blue-300 uppercase block font-bold">
                                Skor Latihan TOEFL ITP
                              </span>
                              <span className="text-2xl font-black font-serif text-white block">
                                {reg.session.result.totalScore}
                              </span>
                              <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded inline-block">
                                CEFR {reg.session.result.cefrLevel}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {reg.session.certificate && (
                                <Link
                                  href={`/certificate/${reg.session.certificate.verificationCode}`}
                                  target="_blank"
                                  className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow-xs"
                                >
                                  <Award className="w-3.5 h-3.5" />
                                  <span>E-Sertifikat</span>
                                </Link>
                              )}
                              <Link
                                href={`/result/${reg.session.id}`}
                                target="_blank"
                                className="flex-1 py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1"
                              >
                                <span>Hasil</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        ) : isInProgress ? (
                          <button
                            onClick={() => handleStartExam(reg.id)}
                            disabled={isStartingId === reg.id}
                            className="py-3 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            <span>Lanjutkan Pengerjaan Ujian</span>
                          </button>
                        ) : isWithinWindow ? (
                          <button
                            onClick={() => handleStartExam(reg.id)}
                            disabled={isStartingId === reg.id}
                            className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            <span>{isStartingId === reg.id ? "Menyiapkan Lembar Soal..." : "Masuk Ruang Ujian Sekarang"}</span>
                          </button>
                        ) : (
                          <div className="space-y-2 text-right w-full">
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                              <span className="text-[11px] text-slate-500 font-semibold block">
                                Ruang Ujian Terkunci
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                Terbuka otomatis saat jam mulai
                              </span>
                            </div>

                            {/* Testing Bypass Option */}
                            <button
                              onClick={() => handleStartExam(reg.id)}
                              disabled={isStartingId === reg.id}
                              className="w-full py-1.5 px-3 bg-slate-200 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1"
                              title="Bypass jam jadwal untuk uji coba langsung"
                            >
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>Uji Coba Langsung (Bypass Waktu)</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: KATALOG JADWAL UJIAN */}
        {activeTab === "catalog" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Jadwal Sesi Ujian TOEFL ITP® Terbuka
                </h3>
                <p className="text-xs text-slate-500">
                  Pilih tanggal & sesi yang sesuai dengan jadwal luang Anda.
                </p>
              </div>
            </div>

            {availableSchedules.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                Belum ada jadwal sesi baru yang dibuka oleh administrator. Silakan hubungi admin atau periksa kembali secara berkala.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {availableSchedules.map((item) => {
                  const startTime = new Date(item.startTime);
                  const endTime = new Date(item.endTime);
                  const sisaKuota = Math.max(0, item.quota - (item.registrationsCount || 0));

                  const dateFormatted = startTime.toLocaleDateString("id-ID", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });
                  const timeFormatted = `${startTime.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })} - ${endTime.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })} WIB`;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                            {item.package.code}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            Sisa Kuota: <strong>{sisaKuota}</strong>
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-slate-900 mb-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                          {item.description || "Sesi ujian terstandar TOEFL ITP Prediction dengan evaluasi 3 seksi lengkap."}
                        </p>

                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2 mb-4 text-xs text-slate-700">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span><strong>Tanggal:</strong> {dateFormatted}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span><strong>Pukul:</strong> {timeFormatted}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center mb-4">
                          <div>
                            <span className="block text-[10px] text-slate-400">Listening</span>
                            <strong className="text-xs text-slate-800">50 Soal</strong>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400">Structure</span>
                            <strong className="text-xs text-slate-800">40 Soal</strong>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400">Reading</span>
                            <strong className="text-xs text-slate-800">50 Soal</strong>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">Biaya Tes</span>
                          <span className="text-sm font-black text-emerald-700">
                            {item.price > 0 ? `Rp ${item.price.toLocaleString("id-ID")}` : "GRATIS (FREE PASS)"}
                          </span>
                        </div>

                        <button
                          onClick={() => setConfirmEnrollSchedule(item)}
                          className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>Daftar Sesi Ini</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: E-SERTIFIKAT & RIWAYAT */}
        {activeTab === "certificates" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Daftar Sertifikat Digital TOEFL ITP® Anda
                </h3>
                <p className="text-xs text-slate-500">
                  Setiap sertifikat digital dilengkapi nomor seri unik dan kode verifikasi.
                </p>
              </div>
            </div>

            {certificates.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
                Anda belum memiliki sertifikat yang diterbitkan. Ikuti dan selesaikan ujian untuk mendapatkan sertifikat digital.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {certificates.map((cert) => {
                  const dateStr = new Date(cert.testDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });

                  return (
                    <div
                      key={cert.id}
                      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded">
                            {cert.certificateNumber}
                          </span>
                          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                            CEFR {cert.cefrLevel}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-slate-900 mb-1">
                          {cert.session?.package?.title || "TOEFL ITP Prediction Test"}
                        </h4>
                        <p className="text-xs text-slate-500 mb-4">
                          Tanggal Ujian: <strong>{dateStr}</strong>
                        </p>

                        {/* Scores grid */}
                        <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-center mb-4">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">Listening</span>
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {cert.listeningScore}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">Structure</span>
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {cert.structureScore}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">Reading</span>
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {cert.readingScore}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-baseline justify-between py-2 border-t border-slate-100 mb-2">
                          <span className="text-xs text-slate-600 font-bold uppercase">Total Scaled Score:</span>
                          <span className="font-serif font-black text-2xl text-blue-700">
                            {cert.totalScore}
                            <span className="text-xs font-sans text-slate-400 font-normal ml-1">/ 677</span>
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                        <Link
                          href={`/certificate/${cert.verificationCode}`}
                          target="_blank"
                          className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Unduh E-Sertifikat PDF</span>
                        </Link>

                        <Link
                          href={`/verify/${cert.verificationCode}`}
                          target="_blank"
                          className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1 transition"
                          title="Halaman Verifikasi Publik QR"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Cek QR</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL 1: AUDIO TEST HEADPHONE */}
      {audioModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-700">
                <Headphones className="w-6 h-6" />
                <h3 className="text-base font-bold text-slate-900">
                  Uji Kesiapan Audio Headphone
                </h3>
              </div>
              <button
                onClick={() => {
                  stopAudioTest();
                  setAudioModalOpen(false);
                }}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Dengarkan audio sampel uji coba di bawah ini. Pastikan nada lonceng dan narasi suara berbahasa Inggris terdengar jelas dan seimbang di kedua sisi earphone/headphone Anda.
            </p>

            <audio
              ref={audioRef}
              preload="auto"
              src={appUrl("/audio/headphone-test.wav")}
            />

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-4">
              {/* Animated Equalizer Wave when playing */}
              {isPlayingAudio && (
                <div className="flex items-center justify-center gap-1.5 h-10">
                  <span className="w-1.5 h-4 bg-blue-600 rounded-full animate-pulse" />
                  <span className="w-1.5 h-8 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-10 bg-blue-700 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-6 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.1s]" />
                  <span className="w-1.5 h-3 bg-blue-600 rounded-full animate-pulse" />
                </div>
              )}

              <button
                onClick={toggleTestAudio}
                className={`py-3 px-6 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 mx-auto shadow-sm ${
                  isPlayingAudio
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>Hentikan Audio</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Putar Suara Uji Coba</span>
                  </>
                )}
              </button>
              <span className="text-[11px] text-slate-500 block">
                {isPlayingAudio ? "Audio sound-check sedang diputar... Atur volume secukupnya." : "Tekan tombol di atas untuk menguji fungsi headset."}
              </span>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={toggleAudioTestMute}
                  aria-label={isAudioTestMuted ? "Nyalakan suara uji coba" : "Mute suara uji coba"}
                  className="rounded-md p-1 text-slate-500 transition hover:text-slate-900"
                >
                  {isAudioTestMuted || audioTestVolume === 0 ? (
                    <VolumeX className="h-4 w-4 text-rose-500" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isAudioTestMuted ? 0 : audioTestVolume}
                  onChange={(event) => handleAudioTestVolumeChange(Number(event.target.value))}
                  aria-label="Volume suara uji coba"
                  className="w-full accent-blue-600"
                />
                <span className="w-10 text-right text-[11px] font-semibold text-slate-500">
                  {Math.round((isAudioTestMuted ? 0 : audioTestVolume) * 100)}%
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                stopAudioTest();
                setAudioModalOpen(false);
              }}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition"
            >
              Saya Dapat Mendengar dengan Jelas
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: TATA TERTIB UJIAN */}
      {rulesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-600">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="text-base font-bold text-slate-900">
                  Tata Tertib Ujian TOEFL ITP®
                </h3>
              </div>
              <button
                onClick={() => setRulesModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed divide-y divide-slate-100">
              <div className="pt-2">
                <strong className="text-slate-900 block mb-0.5">1. Larangan Pindah Tab / Jendela (Anti-Fraud)</strong>
                Sistem dilengkapi deteksi otomatis saat Anda berpindah tab atau meminimalkan browser. Pelanggaran berulang dapat membatalkan sesi ujian.
              </div>
              <div className="pt-2">
                <strong className="text-slate-900 block mb-0.5">2. Durasi & Alur Waktu Otomatis</strong>
                Seksi 1 Listening (~35 mnt), Seksi 2 Structure (25 mnt), Seksi 3 Reading (55 mnt). Timer berjalan terus dan jawaban otomatis tersimpan ke server.
              </div>
              <div className="pt-2">
                <strong className="text-slate-900 block mb-0.5">3. Audio Listening Hanya Berputar Sekali</strong>
                Sesuai aturan simulasi ini, audio percakapan Listening Comprehension hanya diputar 1 kali dan tidak dapat diulang.
              </div>
              <div className="pt-2">
                <strong className="text-slate-900 block mb-0.5">4. Koneksi & Perangkat</strong>
                Gunakan laptop/PC dengan browser Google Chrome atau Microsoft Edge terkini dan pastikan koneksi internet stabil.
              </div>
            </div>

            <button
              onClick={() => setRulesModalOpen(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition"
            >
              Saya Mengerti & Siap Mematuhi
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: KONFIRMASI PENDAFTARAN & PEMBAYARAN JADWAL */}
      {confirmEnrollSchedule && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Konfirmasi Pendaftaran Sesi Ujian
                </h3>
                <span className="text-[11px] text-slate-500">
                  {confirmEnrollSchedule.price > 0 ? "Pilih saluran pembayaran resmi" : "Pendaftaran sesi gratis"}
                </span>
              </div>
              <button
                onClick={() => setConfirmEnrollSchedule(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Session Info */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
              <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider block">
                Detail Sesi Ujian
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                {confirmEnrollSchedule.title}
              </h4>
              <p className="text-slate-500">
                Paket Soal: <strong>{confirmEnrollSchedule.package.title}</strong> ({confirmEnrollSchedule.package.code})
              </p>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-700">
                <span>Jadwal: {new Date(confirmEnrollSchedule.startTime).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })} WIB</span>
                <span className="font-bold text-sm text-emerald-700">
                  {confirmEnrollSchedule.price > 0 ? `Rp ${confirmEnrollSchedule.price.toLocaleString("id-ID")}` : "GRATIS"}
                </span>
              </div>
            </div>

            {/* Candidate Identity Confirmation */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1">
              <span className="font-bold block">Validasi Identitas Sertifikat:</span>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-slate-700">
                <span>Nama: <strong className="text-slate-900">{student.name}</strong></span>
                {student.idNumber && (
                  <span>NIK: <strong className="text-slate-900">{student.idNumber}</strong></span>
                )}
              </div>
              <p className="text-[10px] text-amber-800 pt-0.5">
                Nama & NIK di atas akan tercetak permanen di sertifikat digital setelah ujian diselesaikan.
              </p>
            </div>

            {/* PAYMENT METHOD SELECTION (If Price > 0) */}
            {confirmEnrollSchedule.price > 0 ? (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-900">
                  Pilih Saluran Pembayaran:
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod("TRANSFER")}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2 ${
                      selectedPaymentMethod === "TRANSFER"
                        ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <CreditCard className={`w-5 h-5 ${selectedPaymentMethod === "TRANSFER" ? "text-blue-600" : "text-slate-400"}`} />
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPaymentMethod === "TRANSFER" ? "border-blue-600 bg-blue-600" : "border-slate-300"}`}>
                        {selectedPaymentMethod === "TRANSFER" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </div>
                    <div>
                      <strong className="text-xs text-slate-900 block">Transfer Bank</strong>
                      <span className="text-[10.5px] text-slate-500 leading-tight block mt-0.5">
                        BCA / Mandiri (Unggah struk)
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod("CASH")}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2 ${
                      selectedPaymentMethod === "CASH"
                        ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Banknote className={`w-5 h-5 ${selectedPaymentMethod === "CASH" ? "text-emerald-600" : "text-slate-400"}`} />
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPaymentMethod === "CASH" ? "border-emerald-600 bg-emerald-600" : "border-slate-300"}`}>
                        {selectedPaymentMethod === "CASH" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </div>
                    <div>
                      <strong className="text-xs text-slate-900 block">Tunai di Loket</strong>
                      <span className="text-[10.5px] text-slate-500 leading-tight block mt-0.5">
                        Kasir Kampus / Panitia
                      </span>
                    </div>
                  </button>
                </div>

                {/* Account details or cash instructions */}
                {selectedPaymentMethod === "TRANSFER" ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs">
                    <span className="text-[11px] font-bold text-slate-800 block">
                      Rekening Tujuan Pembayaran Resmi:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-sans text-slate-500 block">BCA (Bank Central Asia)</span>
                        <strong className="text-slate-900 text-xs">8720-9988-1234</strong>
                        <span className="text-[10px] text-slate-500 block font-sans">a.n. Lembaga Bahasa ITP</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-sans text-slate-500 block">Bank Mandiri</span>
                        <strong className="text-slate-900 text-xs">137-00-1928-4821</strong>
                        <span className="text-[10px] text-slate-500 block font-sans">a.n. Yayasan TOEFL Testing</span>
                      </div>
                    </div>
                    <p className="text-[10.5px] text-slate-500">
                      Setelah mendaftar, tiket akan terbit dan Anda dapat mengunggah foto struk transfer di tab "Tiket Ujian Saya".
                    </p>
                  </div>
                ) : (
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-900 space-y-1">
                    <strong className="block">Alur Pembayaran Tunai:</strong>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Setelah klik konfirmasi di bawah, Anda akan memperoleh <strong>Nomor Registrasi</strong>. Datangi loket panitia/kasir lembaga dan bayar tunai sebesar <strong>Rp {confirmEnrollSchedule.price.toLocaleString("id-ID")}</strong> untuk aktivasi tiket.
                    </p>
                  </div>
                )}

                {/* Optional Note */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Catatan Pembayaran / Nama Pengirim (Opsional):
                  </label>
                  <input
                    type="text"
                    value={enrollPaymentNotes}
                    onChange={(e) => setEnrollPaymentNotes(e.target.value)}
                    placeholder="Contoh: Transfer BCA a.n. Budi Santoso"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  Sesi ini berstatus <strong>Free Pass</strong>. Tiket Anda akan otomatis aktif dan siap digunakan saat jam ujian dimulai tanpa pembayaran.
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmEnrollSchedule(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleEnroll}
                disabled={isEnrolling}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                {isEnrolling ? "Mendaftarkan..." : "Konfirmasi & Dapatkan Tiket"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: UNGGAH BUKTI PEMBAYARAN TRANSFER */}
      {uploadModalReg && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-700">
                <Receipt className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  Unggah Bukti Transfer
                </h3>
              </div>
              <button
                onClick={() => {
                  setUploadModalReg(null);
                  setProofFile(null);
                  setProofNotes("");
                }}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket & Bill Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">No. Registrasi:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {uploadModalReg.registrationNumber}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Sesi Ujian:</span>
                <span className="font-bold text-slate-800 text-right">{uploadModalReg.schedule.title}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="font-semibold text-slate-700">Total Tagihan:</span>
                <span className="font-bold text-sm text-emerald-700">
                  Rp {uploadModalReg.amount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleUploadProof} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Foto / Tangkapan Layar Struk Transfer <span className="text-rose-600">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-4 text-center cursor-pointer transition bg-slate-50/50 relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    required
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setProofFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                    <Upload className="w-7 h-7 text-blue-600" />
                    {proofFile ? (
                      <span className="text-xs font-bold text-blue-700 break-all px-2">
                        {proofFile.name} ({(proofFile.size / 1024).toFixed(0)} KB)
                      </span>
                    ) : (
                      <>
                        <span className="text-xs font-bold text-slate-700">
                          Klik untuk memilih file bukti transfer
                        </span>
                        <span className="text-[10.5px] text-slate-400">
                          Format: JPG, PNG, WEBP, PDF (Maks. 5MB)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Catatan Pengirim / Bank Asal (Opsional):
                </label>
                <input
                  type="text"
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                  placeholder="Contoh: Transfer BCA a.n. Budi Santoso"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 text-[11px] text-blue-800 leading-relaxed">
                Pastikan nama pengirim, nominal transfer, dan waktu transaksi tampak jelas agar verifikasi dapat segera disetujui oleh admin.
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUploadModalReg(null);
                    setProofFile(null);
                    setProofNotes("");
                  }}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploadingProof || !proofFile}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingProof ? "Mengunggah..." : "Kirim Bukti Pembayaran"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
