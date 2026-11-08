"use client";

import React, { useEffect, useState, useRef } from "react";
import { appFetch as fetch, appUrl } from "@/lib/appUrl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Award,
  Clock,
  Key,
  Download,
  Plus,
  ArrowLeft,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  LogOut,
  Layers,
  FileJson,
  Upload,
  BookOpen,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  ShieldCheck,
  Edit,
  Settings,
  Globe,
  FileSpreadsheet,
  Calendar,
  Ticket,
  FileCheck,
  CreditCard,
  Banknote,
  Receipt,
  Eye,
  X,
  ZoomIn,
  MessageSquare,
  Menu,
  ChevronLeft,
  UserCheck,
  PhoneCall,
  Sparkles,
  RotateCcw,
} from "lucide-react";

import { PackagePreviewModal } from "@/components/PackagePreviewModal";
import { ValidationReport } from "@/lib/excelPackageParser";
import { AdminInstitutionSettings } from "@/components/AdminInstitutionSettings";
import {
  buildPaymentConfirmedWaUrl,
  buildCertificateReadyWaUrl,
  buildLeadGreetingWaUrl,
} from "@/lib/notifications";

interface AdminSessionUser {
  id: string;
  username: string;
  name: string;
}

interface AdminData {
  summary: {
    totalSessions: number;
    completedCount: number;
    inProgressCount: number;
    averageScore: number;
    totalTokens: number;
  };
  sessions: {
    id: string;
    participantName: string;
    tokenCode: string;
    currentSection: string;
    status: string;
    startedAt: string;
    completedAt: string | null;
    result: {
      listeningScaled: number;
      structureScaled: number;
      readingScaled: number;
      totalScore: number;
      cefrLevel: string;
    } | null;
  }[];
  tokens: {
    id: string;
    tokenCode: string;
    label: string;
    packageId?: string | null;
    isUsed: boolean;
    createdAt: string;
    package?: {
      title: string;
      code: string;
    } | null;
  }[];
}

interface ExamPackageItem {
  id: string;
  code: string;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  totalQuestions: number;
  totalSessions: number;
  totalTokens: number;
  sections: {
    id: string;
    sectionType: string;
    title: string;
    durationMinutes: number;
    questionCount: number;
  }[];
}

interface AdminScheduleItem {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  timezone: string;
  quota: number;
  price: number;
  isActive: boolean;
  package: { id: string; code: string; title: string };
  registrations: {
    id: string;
    registrationNumber: string;
    status: string;
    createdAt: string;
    user: { id: string; name: string; email: string; phoneNumber: string | null; idNumber: string | null };
    session?: {
      id: string;
      status: string;
      startedAt: string;
      completedAt: string | null;
      result?: { totalScore: number; cefrLevel: string } | null;
    } | null;
  }[];
}

interface AdminCertificateItem {
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
  user: { name: string; email: string; phoneNumber?: string | null; idNumber?: string | null };
  session: {
    id: string;
    tokenCode: string;
    package: { title: string; code: string };
  };
}

interface AdminPaymentItem {
  id: string;
  registrationNumber: string;
  amount: number;
  status: string;
  paymentMethod: string | null;
  paymentProofUrl: string | null;
  paymentNotes: string | null;
  rejectionReason: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string | null;
    idNumber: string | null;
  };
  schedule: {
    id: string;
    title: string;
    price: number;
    startTime: string;
    package: {
      code: string;
      title: string;
    };
  };
  session?: {
    id: string;
    status: string;
    startedAt: string;
    completedAt: string | null;
    result?: {
      totalScore: number;
      cefrLevel: string;
    } | null;
  } | null;
}

interface PaymentSummary {
  waitingCount: number;
  confirmedCount: number;
  pendingPaymentCount: number;
  rejectedCount: number;
  totalRevenue: number;
}

interface AdminLeadItem {
  id: string;
  name: string;
  phoneNumber?: string | null;
  listeningRaw: number;
  listeningScaled: number;
  structureRaw: number;
  structureScaled: number;
  readingRaw: number;
  readingScaled: number;
  totalScore: number;
  cefrLevel?: string | null;
  status: string;
  startedAt: string;
  completedAt?: string | null;
}

interface LeadSummary {
  totalLeads: number;
  completedCount: number;
  inProgressCount: number;
  withPhoneCount: number;
  averageScore: number;
}

export default function AdminPage() {
  const router = useRouter();

  // Auth & Admin state
  const [adminUser, setAdminUser] = useState<AdminSessionUser | null>(null);
  const [activeTab, setActiveTab] = useState<"results" | "schedules" | "payments" | "certificates" | "tokens" | "packages" | "settings" | "leads">("results");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [institutionLogoUrl, setInstitutionLogoUrl] = useState("/branding/institution-logo.svg");

  // Leads (Calon Peserta Demo) state
  const [leads, setLeads] = useState<AdminLeadItem[]>([]);
  const [leadSummary, setLeadSummary] = useState<LeadSummary | null>(null);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [leadSearch, setLeadSearch] = useState("");
  const [leadFilter, setLeadFilter] = useState<"ALL" | "COMPLETED" | "IN_PROGRESS">("ALL");
  const [isDeletingLeadId, setIsDeletingLeadId] = useState<string | null>(null);

  // Restore desktop sidebar collapsed preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_sidebar_collapsed");
      if (saved === "true") {
        setIsDesktopCollapsed(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleDesktopSidebar = () => {
    setIsDesktopCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("admin_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Platform Operating Mode state (COMMERCIAL vs INSTITUTION)
  const [operatingMode, setOperatingMode] = useState<"COMMERCIAL" | "INSTITUTION">("INSTITUTION");
  const [isUpdatingMode, setIsUpdatingMode] = useState(false);

  // Payments verification state
  const [payments, setPayments] = useState<AdminPaymentItem[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState<"ALL" | "WAITING_APPROVAL" | "CONFIRMED" | "PENDING_PAYMENT" | "REJECTED">("ALL");
  const [paymentSearch, setPaymentSearch] = useState("");
  const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null);
  const [previewPaymentItem, setPreviewPaymentItem] = useState<AdminPaymentItem | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminPaymentItem | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Schedules state
  const [schedules, setSchedules] = useState<AdminScheduleItem[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [newSchedTitle, setNewSchedTitle] = useState("");
  const [newSchedPkgId, setNewSchedPkgId] = useState("");
  const [newSchedStartTime, setNewSchedStartTime] = useState("");
  const [newSchedEndTime, setNewSchedEndTime] = useState("");
  const [newSchedQuota, setNewSchedQuota] = useState(50);
  const [newSchedPrice, setNewSchedPrice] = useState(0);

  // Certificates state
  const [certificates, setCertificates] = useState<AdminCertificateItem[]>([]);
  const [isLoadingCertificates, setIsLoadingCertificates] = useState(false);

  // Results & Tokens state
  const [data, setData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Packages state
  const [packages, setPackages] = useState<ExamPackageItem[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);

  // Token Generator state
  const [newLabel, setNewLabel] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Package import state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [pendingPackageData, setPendingPackageData] = useState<any>(null);

  // Check auth on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/auth/me");
        const json = await res.json();
        if (!json.authenticated) {
          router.push("/admin/login");
        } else {
          setAdminUser(json.admin);
          setIsLoadingAuth(false);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        router.push("/admin/login");
      }
    }
    checkAuth();
  }, [router]);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/sessions");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      setIsLoadingPackages(true);
      const res = await fetch("/api/admin/packages");
      const json = await res.json();
      if (json.packages) {
        setPackages(json.packages);
        if (json.packages.length > 0 && !selectedPackageId) {
          setSelectedPackageId(json.packages[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching packages:", err);
    } finally {
      setIsLoadingPackages(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (json.operatingMode) {
        setOperatingMode(json.operatingMode);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  const fetchInstitutionBranding = async () => {
    try {
      const res = await fetch("/api/admin/settings/institution");
      const json = await res.json();
      const logoUrl = json.settings?.INSTITUTION_LOGO_URL;
      if (logoUrl) {
        setInstitutionLogoUrl(logoUrl);
      }
    } catch (err) {
      console.error("Error fetching institution branding:", err);
    }
  };

  const handleUpdateOperatingMode = async (newMode: "COMMERCIAL" | "INSTITUTION") => {
    try {
      setIsUpdatingMode(true);
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operatingMode: newMode }),
      });
      const json = await res.json();
      if (json.success) {
        setOperatingMode(json.operatingMode);
      } else {
        alert(json.error || "Gagal mengubah mode.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsUpdatingMode(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      setIsLoadingSchedules(true);
      const res = await fetch("/api/admin/schedules");
      const json = await res.json();
      if (json.schedules) {
        setSchedules(json.schedules);
      }
    } catch (err) {
      console.error("Error fetching schedules:", err);
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  const fetchCertificates = async () => {
    try {
      setIsLoadingCertificates(true);
      const res = await fetch("/api/admin/certificates");
      const json = await res.json();
      if (json.certificates) {
        setCertificates(json.certificates);
      }
    } catch (err) {
      console.error("Error fetching certificates:", err);
    } finally {
      setIsLoadingCertificates(false);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchedTitle || !newSchedPkgId || !newSchedStartTime || !newSchedEndTime) {
      alert("Mohon lengkapi judul sesi, paket soal, dan waktu mulai serta selesai.");
      return;
    }

    try {
      setIsCreatingSchedule(true);
      const res = await fetch("/api/admin/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newSchedTitle,
          packageId: newSchedPkgId,
          startTime: newSchedStartTime,
          endTime: newSchedEndTime,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          quota: newSchedQuota,
          price: newSchedPrice,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Gagal membuat jadwal ujian.");
        return;
      }

      setNewSchedTitle("");
      setNewSchedStartTime("");
      setNewSchedEndTime("");
      setShowScheduleForm(false);
      await fetchSchedules();
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsCreatingSchedule(false);
    }
  };

  const handleToggleSchedule = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/schedules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchSchedules();
      } else {
        alert(json.error || "Gagal mengubah status jadwal.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus jadwal ujian ini? Data pendaftaran peserta pada sesi ini juga akan terhapus.")) return;
    try {
      const res = await fetch(`/api/admin/schedules?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        await fetchSchedules();
      } else {
        alert(json.error || "Gagal menghapus jadwal.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPayments = async () => {
    try {
      setIsLoadingPayments(true);
      const res = await fetch("/api/admin/payments");
      const json = await res.json();
      if (json.registrations) {
        setPayments(json.registrations);
        setPaymentSummary(json.summary);
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const handleApprovePayment = async (registrationId: string) => {
    if (!confirm("Konfirmasi dan setujui pembayaran ini sebagai Lunas? Tiket ujian peserta akan segera aktif.")) return;
    try {
      setIsProcessingPayment(true);
      const res = await fetch(`/api/admin/payments/${registrationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchPayments();
        if (previewPaymentItem?.id === registrationId) {
          setPreviewPaymentItem(null);
          setPreviewProofUrl(null);
        }
      } else {
        alert(json.error || "Gagal memproses verifikasi.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!rejectTarget) return;
    try {
      setIsProcessingPayment(true);
      const res = await fetch(`/api/admin/payments/${rejectTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REJECT",
          reason: rejectionReasonText || "Bukti pembayaran tidak sesuai atau dana belum masuk rekening.",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setRejectTarget(null);
        setRejectionReasonText("");
        await fetchPayments();
      } else {
        alert(json.error || "Gagal menolak verifikasi.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const fetchLeads = async () => {
    try {
      setIsLoadingLeads(true);
      const params = new URLSearchParams();
      if (leadSearch.trim()) params.set("search", leadSearch.trim());
      if (leadFilter !== "ALL") params.set("status", leadFilter);

      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      const json = await res.json();
      if (json.leads) {
        setLeads(json.leads);
        setLeadSummary(json.summary);
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Hapus data calon peserta demo ini?")) return;
    try {
      setIsDeletingLeadId(id);
      const res = await fetch(`/api/admin/leads?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchLeads();
      } else {
        alert("Gagal menghapus data calon peserta.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeletingLeadId(null);
    }
  };

  useEffect(() => {
    if (!isLoadingAuth) {
      fetchAdminData();
      fetchPackages();
      fetchSettings();
      fetchInstitutionBranding();
      fetchSchedules();
      fetchCertificates();
      fetchPayments();
      fetchLeads();
    }
  }, [isLoadingAuth]);

  useEffect(() => {
    if (!isLoadingAuth && activeTab === "leads") {
      fetchLeads();
    }
  }, [leadSearch, leadFilter, activeTab]);


  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsGenerating(true);
      const res = await fetch("/api/admin/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: newLabel,
          customCode: customCode,
          packageId: selectedPackageId || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setNewLabel("");
        setCustomCode("");
        await fetchAdminData();
      } else {
        alert(json.error || "Gagal membuat token.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Toggle package active state
  const handleTogglePackage = async (packageId: string) => {
    try {
      const res = await fetch(`/api/admin/packages/${packageId}/toggle`, {
        method: "PUT",
      });
      const json = await res.json();
      if (json.success) {
        await fetchPackages();
      } else {
        alert(json.error || "Gagal mengubah status paket.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete package
  const handleDeletePackage = async (packageId: string, title: string) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus paket "${title}"? Tindakan ini tidak dapat dibatalkan.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/packages/${packageId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        alert("Paket berhasil dihapus.");
        await fetchPackages();
      } else {
        alert(json.error || "Gagal menghapus paket.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghapus paket.");
    }
  };

  // Handle file upload (Excel / CSV / JSON) via validation parser
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/packages/parse-file", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error || "Gagal memproses file.");
        return;
      }

      setValidationReport(json.report);
      setPendingPackageData(json.packageData);
      setPreviewModalOpen(true);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Terjadi kesalahan saat memproses file.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Confirm save package into database from Preview Modal
  const handleConfirmSavePackage = async (packageData: any) => {
    try {
      const res = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: packageData.title,
          code: packageData.code,
          description: packageData.description,
          rawJson: packageData,
        }),
      });

      const json = await res.json();
      if (json.success) {
        alert(json.message || "Paket soal berhasil disimpan ke database!");
        setPreviewModalOpen(false);
        setValidationReport(null);
        setPendingPackageData(null);
        await fetchPackages();
      } else {
        alert(json.error || "Gagal menyimpan paket soal.");
      }
    } catch (err) {
      console.error("Save package error:", err);
      alert("Terjadi kesalahan saat menyimpan paket soal.");
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-400 text-sm font-medium">
          Memverifikasi izin akses administrator...
        </p>
      </div>
    );
  }

  const filteredSessions =
    data?.sessions.filter(
      (s) =>
        s.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.tokenCode.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? [];

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">
      {/* MOBILE BACKDROP */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* SIDEBAR (Desktop Fixed/Sticky Collapsible + Mobile Slide-over Drawer) */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen bg-slate-900 text-white flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 shrink-0 ${
          isMobileSidebarOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0"
        } ${isDesktopCollapsed ? "md:w-20" : "md:w-72"}`}
      >
        {/* Sidebar Brand Header */}
        <div className={`p-4 border-b border-slate-800 flex items-center relative transition-all duration-300 ${
          isDesktopCollapsed ? "md:justify-center md:px-3" : "justify-between"
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => { if (isDesktopCollapsed) toggleDesktopSidebar(); }}
              className={`w-10 h-10 rounded-xl bg-white border border-slate-700 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20 shrink-0 overflow-hidden ${
                isDesktopCollapsed ? "cursor-pointer hover:bg-blue-500 transition hover:scale-105" : ""
              }`}
              title={isDesktopCollapsed ? "Perluas Sidebar" : "TOEFL ITP Pro"}
            >
              <img
                src={appUrl(institutionLogoUrl)}
                alt="Logo institusi"
                className="w-full h-full object-contain p-1"
                onError={(event) => {
                  const fallback = appUrl("/branding/institution-logo.svg");
                  if (event.currentTarget.src !== fallback) {
                    event.currentTarget.src = fallback;
                  }
                }}
              />
            </button>
            <div className={`${isDesktopCollapsed ? "md:hidden" : "block"} min-w-0 overflow-hidden transition-opacity duration-200`}>
              <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                <span>TOEFL ITP®</span>
                <span className="text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.2 rounded font-mono">
                  PRO
                </span>
              </h1>
              <p className="text-[10.5px] text-slate-400 font-medium truncate">
                Panel Administrasi Pusat
              </p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg transition"
            title="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation Items (Grouped) */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {/* Group 1: Operasional Ujian */}
          <div>
            <div className={`${isDesktopCollapsed ? "md:hidden" : "block"} px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2`}>
              Operasional Ujian
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab("results");
                  setIsMobileSidebarOpen(false);
                }}
                title="Hasil Ujian Peserta"
                className={`w-full flex items-center ${
                  isDesktopCollapsed ? "md:justify-center md:px-0 px-3 justify-between" : "justify-between px-3"
                } py-2.5 rounded-xl text-xs font-bold transition group relative ${
                  activeTab === "results"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                }`}
              >
                <div className={`flex items-center ${isDesktopCollapsed ? "md:gap-0 gap-2.5" : "gap-2.5"}`}>
                  <Users className="w-4 h-4 shrink-0" />
                  <span className={isDesktopCollapsed ? "md:hidden" : "inline"}>
                    Hasil Ujian Peserta
                  </span>
                </div>
                <span
                  className={`${isDesktopCollapsed ? "md:hidden" : "inline-block"} text-[10.5px] font-mono px-2 py-0.5 rounded-full ${
                    activeTab === "results"
                      ? "bg-blue-500/50 text-white"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {data?.summary.totalSessions ?? 0}
                </span>

                {/* Floating Tooltip when Collapsed */}
                {isDesktopCollapsed && (
                  <div className="hidden group-hover:md:flex absolute left-full ml-3 px-3 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none items-center gap-2 border border-slate-800">
                    <span>Hasil Ujian Peserta</span>
                    <span className="text-[10px] bg-blue-600/60 px-1.5 py-0.2 rounded font-mono">
                      {data?.summary.totalSessions ?? 0}
                    </span>
                  </div>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab("schedules");
                  setIsMobileSidebarOpen(false);
                }}
                title="Jadwal Sesi Ujian"
                className={`w-full flex items-center ${
                  isDesktopCollapsed ? "md:justify-center md:px-0 px-3 justify-between" : "justify-between px-3"
                } py-2.5 rounded-xl text-xs font-bold transition group relative ${
                  activeTab === "schedules"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                }`}
              >
                <div className={`flex items-center ${isDesktopCollapsed ? "md:gap-0 gap-2.5" : "gap-2.5"}`}>
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span className={isDesktopCollapsed ? "md:hidden" : "inline"}>
                    Jadwal Sesi Ujian
                  </span>
                </div>
                <span
                  className={`${isDesktopCollapsed ? "md:hidden" : "inline-block"} text-[10.5px] font-mono px-2 py-0.5 rounded-full ${
                    activeTab === "schedules"
                      ? "bg-blue-500/50 text-white"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {schedules.length}
                </span>

                {/* Floating Tooltip when Collapsed */}
                {isDesktopCollapsed && (
                  <div className="hidden group-hover:md:flex absolute left-full ml-3 px-3 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none items-center gap-2 border border-slate-800">
                    <span>Jadwal Sesi Ujian</span>
                    <span className="text-[10px] bg-blue-600/60 px-1.5 py-0.2 rounded font-mono">
                      {schedules.length}
                    </span>
                  </div>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab("certificates");
                  setIsMobileSidebarOpen(false);
                }}
                title="Pangkalan E-Sertifikat"
                className={`w-full flex items-center ${
                  isDesktopCollapsed ? "md:justify-center md:px-0 px-3 justify-between" : "justify-between px-3"
                } py-2.5 rounded-xl text-xs font-bold transition group relative ${
                  activeTab === "certificates"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                }`}
              >
                <div className={`flex items-center ${isDesktopCollapsed ? "md:gap-0 gap-2.5" : "gap-2.5"}`}>
                  <Award className="w-4 h-4 shrink-0" />
                  <span className={isDesktopCollapsed ? "md:hidden" : "inline"}>
                    Pangkalan E-Sertifikat
                  </span>
                </div>
                <span
                  className={`${isDesktopCollapsed ? "md:hidden" : "inline-block"} text-[10.5px] font-mono px-2 py-0.5 rounded-full ${
                    activeTab === "certificates"
                      ? "bg-blue-500/50 text-white"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {certificates.length}
                </span>

                {/* Floating Tooltip when Collapsed */}
                {isDesktopCollapsed && (
                  <div className="hidden group-hover:md:flex absolute left-full ml-3 px-3 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none items-center gap-2 border border-slate-800">
                    <span>Pangkalan E-Sertifikat</span>
                    <span className="text-[10px] bg-blue-600/60 px-1.5 py-0.2 rounded font-mono">
                      {certificates.length}
                    </span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Group 2: Keuangan & Pendaftaran */}
          <div>
            <div className={`${isDesktopCollapsed ? "hidden md:block my-2 border-t border-slate-800/80 mx-1" : "hidden"}`} />
            <div className={`${isDesktopCollapsed ? "md:hidden" : "block"} px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2`}>
              Transaksi & Tiket
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab("payments");
                  setIsMobileSidebarOpen(false);
                }}
                title="Verifikasi Pembayaran Tiket"
                className={`w-full flex items-center ${
                  isDesktopCollapsed ? "md:justify-center md:px-0 px-3 justify-between" : "justify-between px-3"
                } py-2.5 rounded-xl text-xs font-bold transition group relative ${
                  activeTab === "payments"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                }`}
              >
                <div className={`flex items-center ${isDesktopCollapsed ? "md:gap-0 gap-2.5" : "gap-2.5"}`}>
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span className={isDesktopCollapsed ? "md:hidden" : "inline"}>
                    Verifikasi Pembayaran
                  </span>
                </div>

                {/* Expanded Badge */}
                {paymentSummary && paymentSummary.waitingCount > 0 ? (
                  <span className={`${isDesktopCollapsed ? "md:hidden" : "inline-block"} bg-amber-500 text-slate-950 font-bold font-mono text-[10.5px] px-2 py-0.5 rounded-full animate-pulse shadow-xs`}>
                    {paymentSummary.waitingCount} Menunggu
                  </span>
                ) : (
                  <span
                    className={`${isDesktopCollapsed ? "md:hidden" : "inline-block"} text-[10.5px] font-mono px-2 py-0.5 rounded-full ${
                      activeTab === "payments"
                        ? "bg-blue-500/50 text-white"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {payments.length}
                  </span>
                )}

                {/* Collapsed Glowing Notification Indicator */}
                {isDesktopCollapsed && paymentSummary && paymentSummary.waitingCount > 0 && (
                  <span className="hidden md:flex absolute top-1.5 right-2 w-2.5 h-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                )}

                {/* Floating Tooltip when Collapsed */}
                {isDesktopCollapsed && (
                  <div className="hidden group-hover:md:flex absolute left-full ml-3 px-3 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none items-center gap-2 border border-slate-800">
                    <span>Verifikasi Pembayaran</span>
                    {paymentSummary && paymentSummary.waitingCount > 0 ? (
                      <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded font-mono">
                        {paymentSummary.waitingCount} Baru
                      </span>
                    ) : (
                      <span className="text-[10px] bg-blue-600/60 px-1.5 py-0.2 rounded font-mono">
                        {payments.length}
                      </span>
                    )}
                  </div>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab("leads");
                  setIsMobileSidebarOpen(false);
                }}
                title="Calon Peserta (Simulasi Demo)"
                className={`w-full flex items-center ${
                  isDesktopCollapsed ? "md:justify-center md:px-0 px-3 justify-between" : "justify-between px-3"
                } py-2.5 rounded-xl text-xs font-bold transition group relative ${
                  activeTab === "leads"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                }`}
              >
                <div className={`flex items-center ${isDesktopCollapsed ? "md:gap-0 gap-2.5" : "gap-2.5"}`}>
                  <UserCheck className="w-4 h-4 shrink-0 text-amber-400" />
                  <span className={isDesktopCollapsed ? "md:hidden" : "inline"}>
                    Calon Peserta Demo
                  </span>
                </div>
                <span
                  className={`${isDesktopCollapsed ? "md:hidden" : "inline-block"} text-[10.5px] font-mono px-2 py-0.5 rounded-full ${
                    activeTab === "leads"
                      ? "bg-blue-500/50 text-white"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {leadSummary?.totalLeads ?? leads.length}
                </span>

                {/* Floating Tooltip when Collapsed */}
                {isDesktopCollapsed && (
                  <div className="hidden group-hover:md:flex absolute left-full ml-3 px-3 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none items-center gap-2 border border-slate-800">
                    <span>Calon Peserta Demo</span>
                    <span className="text-[10px] bg-blue-600/60 px-1.5 py-0.2 rounded font-mono">
                      {leadSummary?.totalLeads ?? leads.length}
                    </span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Group 3: Bank Soal & Akses */}
          <div>
            <div className={`${isDesktopCollapsed ? "hidden md:block my-2 border-t border-slate-800/80 mx-1" : "hidden"}`} />
            <div className={`${isDesktopCollapsed ? "md:hidden" : "block"} px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2`}>
              Bank Soal & Token
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab("packages");
                  setIsMobileSidebarOpen(false);
                }}
                title="Bank Soal TOEFL"
                className={`w-full flex items-center ${
                  isDesktopCollapsed ? "md:justify-center md:px-0 px-3 justify-between" : "justify-between px-3"
                } py-2.5 rounded-xl text-xs font-bold transition group relative ${
                  activeTab === "packages"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                }`}
              >
                <div className={`flex items-center ${isDesktopCollapsed ? "md:gap-0 gap-2.5" : "gap-2.5"}`}>
                  <Layers className="w-4 h-4 shrink-0" />
                  <span className={isDesktopCollapsed ? "md:hidden" : "inline"}>
                    Bank Soal TOEFL
                  </span>
                </div>
                <span
                  className={`${isDesktopCollapsed ? "md:hidden" : "inline-block"} text-[10.5px] font-mono px-2 py-0.5 rounded-full ${
                    activeTab === "packages"
                      ? "bg-blue-500/50 text-white"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {packages.length}
                </span>

                {/* Floating Tooltip when Collapsed */}
                {isDesktopCollapsed && (
                  <div className="hidden group-hover:md:flex absolute left-full ml-3 px-3 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none items-center gap-2 border border-slate-800">
                    <span>Bank Soal TOEFL</span>
                    <span className="text-[10px] bg-blue-600/60 px-1.5 py-0.2 rounded font-mono">
                      {packages.length}
                    </span>
                  </div>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab("tokens");
                  setIsMobileSidebarOpen(false);
                }}
                title="Manajemen Token Ujian"
                className={`w-full flex items-center ${
                  isDesktopCollapsed ? "md:justify-center md:px-0 px-3 justify-between" : "justify-between px-3"
                } py-2.5 rounded-xl text-xs font-bold transition group relative ${
                  activeTab === "tokens"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                }`}
              >
                <div className={`flex items-center ${isDesktopCollapsed ? "md:gap-0 gap-2.5" : "gap-2.5"}`}>
                  <Key className="w-4 h-4 shrink-0" />
                  <span className={isDesktopCollapsed ? "md:hidden" : "inline"}>
                    Manajemen Token
                  </span>
                </div>
                <span
                  className={`${isDesktopCollapsed ? "md:hidden" : "inline-block"} text-[10.5px] font-mono px-2 py-0.5 rounded-full ${
                    activeTab === "tokens"
                      ? "bg-blue-500/50 text-white"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {data?.summary.totalTokens ?? 0}
                </span>

                {/* Floating Tooltip when Collapsed */}
                {isDesktopCollapsed && (
                  <div className="hidden group-hover:md:flex absolute left-full ml-3 px-3 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none items-center gap-2 border border-slate-800">
                    <span>Manajemen Token</span>
                    <span className="text-[10px] bg-blue-600/60 px-1.5 py-0.2 rounded font-mono">
                      {data?.summary.totalTokens ?? 0}
                    </span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Group 4: Konfigurasi Sistem */}
          <div>
            <div className={`${isDesktopCollapsed ? "hidden md:block my-2 border-t border-slate-800/80 mx-1" : "hidden"}`} />
            <div className={`${isDesktopCollapsed ? "md:hidden" : "block"} px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2`}>
              Pengaturan & Identitas
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab("settings");
                  setIsMobileSidebarOpen(false);
                }}
                title="Identitas & Mode Sistem"
                className={`w-full flex items-center ${
                  isDesktopCollapsed ? "md:justify-center md:px-0 px-3 justify-between" : "justify-between px-3"
                } py-2.5 rounded-xl text-xs font-bold transition group relative ${
                  activeTab === "settings"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                }`}
              >
                <div className={`flex items-center ${isDesktopCollapsed ? "md:gap-0 gap-2.5" : "gap-2.5"}`}>
                  <Settings className="w-4 h-4 shrink-0" />
                  <span className={isDesktopCollapsed ? "md:hidden" : "inline"}>
                    Identitas & Mode Sistem
                  </span>
                </div>
                <span className={`${isDesktopCollapsed ? "md:hidden" : "inline-block"} text-[10px] font-semibold bg-slate-800 text-blue-400 px-2 py-0.5 rounded`}>
                  {operatingMode === "COMMERCIAL" ? "B2C" : "B2B"}
                </span>

                {/* Floating Tooltip when Collapsed */}
                {isDesktopCollapsed && (
                  <div className="hidden group-hover:md:flex absolute left-full ml-3 px-3 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none items-center gap-2 border border-slate-800">
                    <span>Pengaturan Identitas</span>
                    <span className="text-[10px] bg-blue-600/60 px-1.5 py-0.2 rounded font-mono">
                      {operatingMode === "COMMERCIAL" ? "B2C" : "B2B"}
                    </span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Collapse / Expand Bottom Bar
        <div className="hidden md:block px-3 py-2 border-t border-slate-800/60">
          <button
            onClick={toggleDesktopSidebar}
            className={`w-full flex items-center ${
              isDesktopCollapsed ? "justify-center px-0" : "justify-between px-3"
            } py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/70 transition`}
            title={isDesktopCollapsed ? "Perluas Sidebar" : "Perkecil Sidebar"}
          >
            <div className="flex items-center gap-2.5">
              {isDesktopCollapsed ? (
                <ChevronRight className="w-4 h-4 text-blue-400" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                  <span></span>
                </>
              )}
            </div>
            {!isDesktopCollapsed && (
              <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">

              </span>
            )}
          </button>
        </div> */}

        {/* Sidebar Footer User Info */}
        <div className={`p-3 border-t border-slate-800 bg-slate-950/50 ${isDesktopCollapsed ? "md:p-2" : "p-4"}`}>
          <div className={`flex items-center ${isDesktopCollapsed ? "md:flex-col md:gap-2 justify-center" : "justify-between gap-3"}`}>
            <div
              className={`flex items-center ${isDesktopCollapsed ? "md:justify-center" : "gap-2.5"} min-w-0`}
              title={`${adminUser?.name || "Administrator"} (@${adminUser?.username || "admin"})`}
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400 shrink-0">
                {adminUser?.name?.charAt(0) || "A"}
              </div>
              <div className={`min-w-0 ${isDesktopCollapsed ? "md:hidden" : "block"}`}>
                <div className="text-xs font-bold text-white truncate">
                  {adminUser?.name || "Administrator"}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  @{adminUser?.username || "admin"}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition shrink-0"
              title="Keluar dari Panel Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* TOP HEADER */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            {/* Unified Sidebar Toggle (Mobile Drawer & Desktop Collapse) */}
            <button
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth < 768) {
                  setIsMobileSidebarOpen((prev) => !prev);
                } else {
                  toggleDesktopSidebar();
                }
              }}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition flex items-center justify-center"
              title={isDesktopCollapsed ? "Perluas Sidebar" : "Perkecil Sidebar"}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 capitalize tracking-tight flex items-center gap-2">
                {activeTab === "results" && "Hasil Ujian Peserta"}
                {activeTab === "schedules" && "Jadwal Sesi Ujian"}
                {activeTab === "payments" && "Verifikasi Pembayaran Tiket"}
                {activeTab === "leads" && "Daftar Calon Peserta (Prospek Demo)"}
                {activeTab === "certificates" && "Pangkalan Data E-Sertifikat"}
                {activeTab === "tokens" && "Manajemen Token Ujian"}
                {activeTab === "packages" && "Bank Soal & Multi-Paket"}
                {activeTab === "settings" && "Pengaturan Identitas & Mode Sistem"}
              </h2>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                Panel Pengawas & Operasional Ujian TOEFL ITP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Home Link */}
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition"
              title="Buka Halaman Utama / Landing Page"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Lihat Web</span>
            </Link>

            {/* Operating mode badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mode:</span>
              <span>{operatingMode === "COMMERCIAL" ? "B2C Komersial" : "B2B Institusi"}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-600 rounded-xl font-bold text-xs transition"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 space-y-8">
        {/* TAB 1: HASIL UJIAN PESERTA */}
        {activeTab === "results" && (
          <div className="space-y-8">
            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
                    Total Sesi Peserta
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900">
                    {data?.summary.totalSessions ?? 0}
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
                    Ujian Selesai
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-700">
                    {data?.summary.completedCount ?? 0}
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
                    Rata-Rata Skor
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900">
                    {data?.summary.averageScore ?? 0}
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
                    Token Aktif
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900">
                    {data?.summary.totalTokens ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* PARTICIPANTS & EXAM SCORES TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Rekapitulasi Hasil Ujian Peserta
                  </h2>
                  <p className="text-xs text-slate-500">
                    Daftar nilai skala ETS (31–68), Total Skor (310–677), dan predikat CEFR.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative w-full sm:w-60">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari nama atau token..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <a
                    href={appUrl("/api/admin/export/results?format=xlsx")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition"
                    title="Unduh seluruh rekap nilai dalam format Microsoft Excel"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Ekspor Excel (.xlsx)</span>
                  </a>

                  <a
                    href={appUrl("/api/admin/export/results?format=csv")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                    title="Unduh rekap nilai format CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </a>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Nama Peserta</th>
                      <th className="py-3 px-4">Token</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-3 text-center">Listening</th>
                      <th className="py-3 px-3 text-center">Structure</th>
                      <th className="py-3 px-3 text-center">Reading</th>
                      <th className="py-3 px-4 text-center">Total Skor</th>
                      <th className="py-3 px-4 text-center">CEFR</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSessions.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400">
                          {searchQuery
                            ? "Tidak ada peserta yang cocok dengan pencarian."
                            : "Belum ada riwayat pengerjaan ujian."}
                        </td>
                      </tr>
                    ) : (
                      filteredSessions.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {s.participantName}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {s.tokenCode}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                s.status === "COMPLETED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {s.status === "COMPLETED" ? "Selesai" : "Sedang Ujian"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-semibold">
                            {s.result ? s.result.listeningScaled : "-"}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-semibold">
                            {s.result ? s.result.structureScaled : "-"}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-semibold">
                            {s.result ? s.result.readingScaled : "-"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {s.result ? (
                              <span className="font-mono font-black text-sm text-blue-700">
                                {s.result.totalScore}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {s.result ? (
                              <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 font-bold text-indigo-700 text-[11px]">
                                {s.result.cefrLevel}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {s.result ? (
                              <Link
                                href={`/result/${s.id}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                              >
                                <span>Sertifikat</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            ) : (
                              <span className="text-slate-400 text-[11px]">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAJEMEN TOKEN */}
        {activeTab === "tokens" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Token Generator Form */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-600" />
                <span>Buat Token Ujian Baru</span>
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Buat kode akses unik dan hubungkan ke paket ujian tertentu.
              </p>

              <form onSubmit={handleCreateToken} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Kelompok / Label Sesi
                  </label>
                  <input
                    type="text"
                    required
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Masukkan label sesi (misal: Seleksi Pegawai Batch 2)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Target Paket Ujian
                  </label>
                  <select
                    value={selectedPackageId}
                    onChange={(e) => setSelectedPackageId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                  >
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.title} ({pkg.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Kode Khusus (Opsional)
                  </label>
                  <input
                    type="text"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                    placeholder="Dikosongkan untuk acak otomatis sistem"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isGenerating ? "Membuat..." : "Generate Token"}</span>
                </button>
              </form>
            </div>

            {/* Active Tokens List */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col">
              <h2 className="text-base font-bold text-slate-900 mb-1">
                Daftar Token Siap Pakai
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Token aktif yang dapat langsung dibagikan kepada peserta.
              </p>

              <div className="flex-1 overflow-y-auto max-h-96 space-y-2.5 pr-1">
                {data?.tokens.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-blue-700 tracking-wider">
                          {t.tokenCode}
                        </span>
                        {t.package && (
                          <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded">
                            {t.package.code}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-600 block mt-0.5">
                        {t.label}
                      </span>
                    </div>

                    <button
                      onClick={() => copyToClipboard(t.tokenCode)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-95"
                    >
                      {copiedToken === t.tokenCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BANK SOAL & MULTI-PAKET */}
        {activeTab === "packages" && (
          <div className="space-y-6">
            {/* ACTION BAR: TEMPLATE DOWNLOAD & JSON IMPORT */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-300" />
                  <span>Manajemen Bank Soal & Multi-Paket</span>
                </h2>
                <p className="text-xs text-blue-200 max-w-xl">
                  Kelola paket ujian atau impor 140 soal baru secara instan
                  menggunakan file JSON terstruktur tanpa perlu input manual.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={appUrl("/api/admin/packages/template-excel")}
                  download
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
                  title="Unduh template format spreadsheet Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                  <span>Unduh Template Excel (.xlsx)</span>
                </a>

                <a
                  href={appUrl("/api/admin/packages/template")}
                  download
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold transition backdrop-blur-xs"
                >
                  <Download className="w-4 h-4 text-blue-300" />
                  <span>Template JSON</span>
                </a>

                {/* Hidden file input supporting Excel, CSV, and JSON */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx,.xls,.csv,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold transition shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isImporting ? "Memproses File..." : "Upload Paket (Excel / JSON)"}</span>
                </button>
              </div>
            </div>

            {/* PACKAGES LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="font-mono text-xs font-bold bg-slate-100 text-blue-700 px-2 py-0.5 rounded border border-slate-200">
                        {pkg.code}
                      </span>
                      <button
                        onClick={() => handleTogglePackage(pkg.id)}
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border transition ${
                          pkg.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-500 border-slate-300"
                        }`}
                        title="Klik untuk ubah status aktif/nonaktif"
                      >
                        {pkg.isActive ? "Aktif" : "Nonaktif"}
                      </button>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">
                      {pkg.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                      {pkg.description || "Tidak ada deskripsi."}
                    </p>

                    {/* Section breakdown pills */}
                    <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 text-xs">
                      {pkg.sections.map((sec) => (
                        <div
                          key={sec.id}
                          className="flex items-center justify-between text-slate-600"
                        >
                          <span className="font-medium text-[11px]">
                            {sec.sectionType === "LISTENING"
                              ? "Section 1: Listening"
                              : sec.sectionType === "STRUCTURE"
                              ? "Section 2: Structure"
                              : "Section 3: Reading"}
                          </span>
                          <span className="font-bold text-slate-900 font-mono text-[11px]">
                            {sec.questionCount} Soal • {sec.durationMinutes}m
                          </span>
                        </div>
                      ))}
                      <div className="border-t border-slate-200 pt-1.5 flex items-center justify-between text-slate-700 font-bold">
                        <span>Total Soal:</span>
                        <span className="text-blue-700 font-mono">
                          {pkg.totalQuestions} Soal
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2 text-xs">
                    <Link
                      href={`/admin/packages/${pkg.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Review & Edit Soal</span>
                    </Link>

                    <div className="flex items-center gap-2">
                      <a
                        href={appUrl(`/api/admin/packages/${pkg.id}/export`)}
                        className="flex items-center gap-1 text-slate-500 hover:text-blue-700 font-semibold p-1"
                        title="Ekspor JSON"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => handleDeletePackage(pkg.id, pkg.title)}
                        className="flex items-center gap-1 text-rose-500 hover:text-rose-700 font-semibold p-1"
                        title="Hapus paket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: MANAJEMEN JADWAL SESI UJIAN (KOMERSIAL/B2C) */}
        {activeTab === "schedules" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Manajemen Jadwal Sesi Ujian TOEFL ITP®
                </h2>
                <p className="text-xs text-slate-500">
                  Buka sesi jadwal ujian terikat waktu, tautkan ke bank soal, dan pantau peserta terdaftar.
                </p>
              </div>

              <button
                onClick={() => setShowScheduleForm(!showScheduleForm)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>{showScheduleForm ? "Tutup Form" : "Buka Sesi Ujian Baru"}</span>
              </button>
            </div>

            {/* FORM TAMBAH JADWAL BARU */}
            {showScheduleForm && (
              <div className="bg-white rounded-2xl border-2 border-blue-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-sm border-b border-slate-100 pb-3">
                  <Calendar className="w-5 h-5" />
                  <span>Formulir Pembukaan Sesi Ujian Baru</span>
                </div>

                <form onSubmit={handleCreateSchedule} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700">Judul Sesi Ujian</label>
                      <input
                        type="text"
                        required
                        value={newSchedTitle}
                        onChange={(e) => setNewSchedTitle(e.target.value)}
                        placeholder="Contoh: TOEFL ITP Prediction - Gelombang 1 Maret 2026"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Pilih Paket Bank Soal</label>
                      <select
                        required
                        value={newSchedPkgId}
                        onChange={(e) => setNewSchedPkgId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                      >
                        <option value="">-- Pilih Paket Soal --</option>
                        {packages.map((pkg) => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.code} - {pkg.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Kapasitas / Kuota Peserta</label>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={newSchedQuota}
                        onChange={(e) => setNewSchedQuota(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Waktu Mulai Ujian (zona lembaga)</label>
                      <input
                        type="datetime-local"
                        required
                        value={newSchedStartTime}
                        onChange={(e) => setNewSchedStartTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Waktu Selesai Ujian (Batas Masuk)</label>
                      <input
                        type="datetime-local"
                        required
                        value={newSchedEndTime}
                        onChange={(e) => setNewSchedEndTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Biaya Pendaftaran (Rp)</label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={newSchedPrice}
                        onChange={(e) => setNewSchedPrice(Number(e.target.value))}
                        placeholder="0 = Gratis / Free Pass"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400">Isi 0 jika pendaftaran gratis atau simulasi.</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowScheduleForm(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingSchedule}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50"
                    >
                      {isCreatingSchedule ? "Menyimpan..." : "Publikasikan Sesi Ujian"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* DAFTAR JADWAL UJIAN */}
            {schedules.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
                Belum ada jadwal sesi ujian yang dibuat. Klik tombol <strong>"Buka Sesi Ujian Baru"</strong> di atas.
              </div>
            ) : (
              <div className="space-y-6">
                {schedules.map((sched) => {
                  const startTime = new Date(sched.startTime);
                  const endTime = new Date(sched.endTime);
                  const startStr = startTime.toLocaleString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const endStr = endTime.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={sched.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
                    >
                      {/* Schedule Summary Bar */}
                      <div className="p-5 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                              {sched.package.code}
                            </span>
                            <span className="font-bold text-slate-900 text-base">
                              {sched.title}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                sched.isActive
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {sched.isActive ? "Sesi Aktif" : "Nonaktif"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Waktu: <strong>{startStr} - {endStr} WIB</strong> • Terdaftar: <strong>{sched.registrations.length}</strong> / {sched.quota} Kuota • Biaya: {sched.price > 0 ? `Rp ${sched.price.toLocaleString("id-ID")}` : "Gratis"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={appUrl(`/api/admin/export/results?scheduleId=${sched.id}&format=xlsx`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition"
                            title="Unduh Rekap Nilai Peserta Jadwal Sesi Ini (.xlsx)"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            <span>Rekap Sesi (.xlsx)</span>
                          </a>
                          <button
                            onClick={() => handleToggleSchedule(sched.id, sched.isActive)}
                            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 transition"
                          >
                            {sched.isActive ? "Tutup Pendaftaran" : "Buka Kembali"}
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(sched.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Jadwal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Registered Participants Table */}
                      <div className="p-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                          Peserta Terdaftar ({sched.registrations.length} Orang)
                        </h4>

                        {sched.registrations.length === 0 ? (
                          <p className="text-xs text-slate-400 italic py-2">
                            Belum ada peserta yang mendaftar pada sesi ujian ini.
                          </p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-100 text-slate-600 font-bold uppercase border-b border-slate-200">
                                <tr>
                                  <th className="py-2.5 px-3">No. Tiket</th>
                                  <th className="py-2.5 px-3">Nama Peserta</th>
                                  <th className="py-2.5 px-3">NIK / Identitas</th>
                                  <th className="py-2.5 px-3">Email</th>
                                  <th className="py-2.5 px-3 text-center">Status Ujian</th>
                                  <th className="py-2.5 px-3 text-center">Skor Akhir</th>
                                  <th className="py-2.5 px-3 text-right">Aksi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {sched.registrations.map((reg) => {
                                  const isDone = reg.session?.status === "COMPLETED";
                                  const isInProgress = reg.session?.status === "IN_PROGRESS";
                                  const totalScore = reg.session?.result?.totalScore;

                                  return (
                                    <tr key={reg.id} className="hover:bg-slate-50 transition">
                                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                                        {reg.registrationNumber}
                                      </td>
                                      <td className="py-2.5 px-3 font-bold text-slate-900">
                                        {reg.user.name}
                                      </td>
                                      <td className="py-2.5 px-3 text-slate-500 font-mono">
                                        {reg.user.idNumber || "-"}
                                      </td>
                                      <td className="py-2.5 px-3 text-slate-600">
                                        {reg.user.email}
                                      </td>
                                      <td className="py-2.5 px-3 text-center">
                                        {isDone ? (
                                          <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px]">
                                            Selesai
                                          </span>
                                        ) : isInProgress ? (
                                          <span className="text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[10px]">
                                            Sedang Mengerjakan
                                          </span>
                                        ) : (
                                          <span className="text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                                            Belum Mulai
                                          </span>
                                        )}
                                      </td>
                                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                                        {totalScore ? (
                                          <span className="text-blue-700 font-black">{totalScore}</span>
                                        ) : (
                                          "-"
                                        )}
                                      </td>
                                      <td className="py-2.5 px-3 text-right">
                                        {reg.session && isDone && (
                                          <Link
                                            href={`/result/${reg.session.id}`}
                                            target="_blank"
                                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                                          >
                                            <span>Skor</span>
                                            <ExternalLink className="w-3 h-3" />
                                          </Link>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
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

        {/* TAB: VERIFIKASI PEMBAYARAN (KOMERSIAL / B2C) */}
        {activeTab === "payments" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span>Verifikasi Pembayaran & Penerimaan Dana Ujian</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Verifikasi transfer bank online atau konfirmasi pembayaran tunai di loket. Tiket ujian peserta otomatis aktif begitu disetujui.
                </p>
              </div>

              <button
                onClick={fetchPayments}
                disabled={isLoadingPayments}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition"
              >
                <span>{isLoadingPayments ? "Menyinkronkan..." : "Perbarui Data"}</span>
              </button>
            </div>

            {/* FINANCIAL STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <Banknote className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
                    Total Dana Lunas
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-700 font-sans">
                    Rp {(paymentSummary?.totalRevenue || 0).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border shadow-xs flex items-center gap-4 transition ${
                (paymentSummary?.waitingCount || 0) > 0
                  ? "bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/30"
                  : "bg-white border-slate-200"
              }`}>
                <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
                    Menunggu Verifikasi
                  </span>
                  <span className="text-2xl font-extrabold text-amber-700">
                    {paymentSummary?.waitingCount ?? 0}
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
                    Tiket Lunas / Aktif
                  </span>
                  <span className="text-2xl font-extrabold text-blue-700">
                    {paymentSummary?.confirmedCount ?? 0}
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
                    Belum Melakukan Transfer
                  </span>
                  <span className="text-2xl font-extrabold text-slate-700">
                    {paymentSummary?.pendingPaymentCount ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* FILTERS & SEARCH */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  onClick={() => setPaymentFilter("ALL")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition ${
                    paymentFilter === "ALL"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Semua ({payments.length})
                </button>
                <button
                  onClick={() => setPaymentFilter("WAITING_APPROVAL")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                    paymentFilter === "WAITING_APPROVAL"
                      ? "bg-amber-500 text-white shadow-xs"
                      : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                  }`}
                >
                  <span>Menunggu Verifikasi</span>
                  <span className="font-mono bg-white/30 px-1 rounded text-[10px]">
                    {paymentSummary?.waitingCount ?? 0}
                  </span>
                </button>
                <button
                  onClick={() => setPaymentFilter("CONFIRMED")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition ${
                    paymentFilter === "CONFIRMED"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                  }`}
                >
                  Lunas ({paymentSummary?.confirmedCount ?? 0})
                </button>
                <button
                  onClick={() => setPaymentFilter("PENDING_PAYMENT")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition ${
                    paymentFilter === "PENDING_PAYMENT"
                      ? "bg-slate-800 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Belum Bayar ({paymentSummary?.pendingPaymentCount ?? 0})
                </button>
                <button
                  onClick={() => setPaymentFilter("REJECTED")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition ${
                    paymentFilter === "REJECTED"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
                  }`}
                >
                  Ditolak ({paymentSummary?.rejectedCount ?? 0})
                </button>
              </div>

              {/* Search input */}
              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  placeholder="Cari nama, NIK, tiket..."
                  className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>
            </div>

            {/* PAYMENTS TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {(() => {
                const filtered = payments
                  .filter((p) => {
                    if (paymentFilter === "WAITING_APPROVAL") return p.status === "WAITING_APPROVAL";
                    if (paymentFilter === "CONFIRMED") return p.status === "CONFIRMED" || p.status === "COMPLETED";
                    if (paymentFilter === "PENDING_PAYMENT") return p.status === "PENDING_PAYMENT";
                    if (paymentFilter === "REJECTED") return p.status === "REJECTED";
                    return true;
                  })
                  .filter((p) => {
                    if (!paymentSearch.trim()) return true;
                    const q = paymentSearch.toLowerCase();
                    return (
                      p.registrationNumber.toLowerCase().includes(q) ||
                      p.user.name.toLowerCase().includes(q) ||
                      p.user.email.toLowerCase().includes(q) ||
                      (p.user.idNumber && p.user.idNumber.toLowerCase().includes(q)) ||
                      p.schedule.title.toLowerCase().includes(q)
                    );
                  });

                if (filtered.length === 0) {
                  return (
                    <div className="p-10 text-center text-slate-400 text-xs">
                      Tidak ada data pendaftaran pembayaran yang cocok dengan filter saat ini.
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">No. Registrasi</th>
                          <th className="py-3 px-4">Peserta</th>
                          <th className="py-3 px-4">Sesi Ujian</th>
                          <th className="py-3 px-4">Metode & Tagihan</th>
                          <th className="py-3 px-4 text-center">Bukti Transfer</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Aksi Verifikasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filtered.map((item) => {
                          const isConfirmed = item.status === "CONFIRMED" || item.status === "COMPLETED";
                          const isWaiting = item.status === "WAITING_APPROVAL";
                          const isPending = item.status === "PENDING_PAYMENT";
                          const isRejected = item.status === "REJECTED";

                          return (
                            <tr
                              key={item.id}
                              className={`hover:bg-slate-50/80 transition ${
                                isWaiting ? "bg-amber-50/30 font-medium" : ""
                              }`}
                            >
                              {/* No Reg */}
                              <td className="py-3 px-4">
                                <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px] block w-fit">
                                  {item.registrationNumber}
                                </span>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {new Date(item.createdAt).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </td>

                              {/* Peserta */}
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-900">{item.user.name}</div>
                                <div className="text-[11px] text-slate-500 font-mono">
                                  {item.user.idNumber ? `NIK: ${item.user.idNumber}` : item.user.email}
                                </div>
                                {item.user.phoneNumber && (
                                  <div className="text-[10px] text-slate-400">
                                    WA: {item.user.phoneNumber}
                                  </div>
                                )}
                              </td>

                              {/* Sesi */}
                              <td className="py-3 px-4">
                                <div className="font-semibold text-slate-800">{item.schedule.title}</div>
                                <span className="font-mono text-[10.5px] text-slate-500">
                                  {item.schedule.package.code} • {new Date(item.schedule.startTime).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                                </span>
                              </td>

                              {/* Metode & Biaya */}
                              <td className="py-3 px-4">
                                <span className="font-bold text-slate-900 block">
                                  Rp {item.amount.toLocaleString("id-ID")}
                                </span>
                                <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                  {item.paymentMethod === "CASH" ? (
                                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 text-[10px]">
                                      Tunai di Loket
                                    </span>
                                  ) : (
                                    <span className="text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 text-[10px]">
                                      Transfer Bank
                                    </span>
                                  )}
                                </span>
                              </td>

                              {/* Bukti Transfer */}
                              <td className="py-3 px-4 text-center">
                                {item.paymentProofUrl ? (
                                  <button
                                    onClick={() => {
                                      setPreviewPaymentItem(item);
                                      setPreviewProofUrl(item.paymentProofUrl);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition border border-blue-200"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Lihat Struk</span>
                                  </button>
                                ) : item.paymentMethod === "CASH" ? (
                                  <span className="text-[11px] text-emerald-700 font-medium">
                                    Loket Fisik
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-slate-400 italic">
                                    Belum diunggah
                                  </span>
                                )}
                                {item.paymentNotes && (
                                  <span className="block text-[9.5px] text-slate-500 line-clamp-1 mt-0.5 max-w-[120px] mx-auto" title={item.paymentNotes}>
                                    {item.paymentNotes}
                                  </span>
                                )}
                              </td>

                              {/* Status */}
                              <td className="py-3 px-4 text-center">
                                {isWaiting && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                                    <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                                    <span>Menunggu Konfirmasi</span>
                                  </span>
                                )}
                                {isConfirmed && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Lunas Terverifikasi</span>
                                  </span>
                                )}
                                {isPending && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-600">
                                    <span>Belum Bayar</span>
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-800 border border-rose-300" title={item.rejectionReason || ""}>
                                    <AlertCircle className="w-3 h-3 text-rose-600" />
                                    <span>Ditolak</span>
                                  </span>
                                )}
                              </td>

                              {/* Aksi */}
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {!isConfirmed ? (
                                    <>
                                      <button
                                        onClick={() => handleApprovePayment(item.id)}
                                        disabled={isProcessingPayment}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1 disabled:opacity-50"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Setujui</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setRejectTarget(item);
                                          setRejectionReasonText("");
                                        }}
                                        disabled={isProcessingPayment}
                                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-xs border border-rose-200 transition disabled:opacity-50"
                                      >
                                        <span>Tolak</span>
                                      </button>
                                    </>
                                  ) : (
                                    <div className="flex items-center justify-end gap-1.5">
                                      <div className="text-[10px] text-slate-400 text-right">
                                        <span className="text-emerald-700 font-bold block">✓ Disetujui</span>
                                        {item.verifiedBy && <span>oleh {item.verifiedBy}</span>}
                                      </div>
                                      {item.user.phoneNumber && (
                                        <a
                                          href={buildPaymentConfirmedWaUrl({
                                            phoneNumber: item.user.phoneNumber,
                                            studentName: item.user.name,
                                            regNumber: item.registrationNumber,
                                            scheduleTitle: item.schedule.title,
                                            examDate:
                                              new Date(item.schedule.startTime).toLocaleString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                              }) + " WIB",
                                            startExamUrl:
                                              typeof window !== "undefined"
                                                ? `${window.location.origin}/student/dashboard`
                                                : "",
                                          })}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition"
                                          title="Kirim pesan konfirmasi tiket ke WhatsApp peserta"
                                        >
                                          <MessageSquare className="w-3 h-3" />
                                          <span>WA</span>
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB 3: PANGKALAN DATA E-SERTIFIKAT TERBIT */}
        {activeTab === "certificates" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Pangkalan Data E-Sertifikat TOEFL ITP® Terbit
                </h2>
                <p className="text-xs text-slate-500">
                  Seluruh sertifikat digital yang telah diterbitkan sistem dilengkapi nomor registrasi unik dan kode verifikasi.
                </p>
              </div>

              <a
                href={appUrl("/api/admin/export/results?format=xlsx")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition shrink-0"
                title="Unduh seluruh rekap data sertifikat dan skor peserta dalam format Microsoft Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Ekspor Rekap Sertifikat (.xlsx)</span>
              </a>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {certificates.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Belum ada sertifikat yang diterbitkan oleh sistem.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">No. Seri Sertifikat</th>
                        <th className="py-3 px-4">Nama Peserta</th>
                        <th className="py-3 px-4">Paket Ujian</th>
                        <th className="py-3 px-3 text-center">Listening</th>
                        <th className="py-3 px-3 text-center">Structure</th>
                        <th className="py-3 px-3 text-center">Reading</th>
                        <th className="py-3 px-4 text-center">Total Skor</th>
                        <th className="py-3 px-4 text-center">CEFR</th>
                        <th className="py-3 px-4 text-right">Aksi Dokumen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {certificates.map((cert) => (
                        <tr key={cert.id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-amber-800">
                            {cert.certificateNumber}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div>{cert.participantName}</div>
                            {cert.idNumber && (
                              <span className="text-[10px] text-slate-400 font-mono font-normal">
                                NIK: {cert.idNumber}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {cert.session.package.title}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono">{cert.listeningScore}</td>
                          <td className="py-3.5 px-3 text-center font-mono">{cert.structureScore}</td>
                          <td className="py-3.5 px-3 text-center font-mono">{cert.readingScore}</td>
                          <td className="py-3.5 px-4 text-center font-mono font-black text-blue-700 text-sm">
                            {cert.totalScore}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded font-bold text-[10px]">
                              {cert.cefrLevel}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/certificate/${cert.verificationCode}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 hover:bg-amber-100 font-bold rounded-lg transition"
                              >
                                <Award className="w-3 h-3" />
                                <span>PDF</span>
                              </Link>
                              <Link
                                href={`/verify/${cert.verificationCode}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-lg transition"
                                title="Cek Verifikasi QR Publik"
                              >
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                <span>QR</span>
                              </Link>
                              {cert.user.phoneNumber && (
                                <a
                                  href={buildCertificateReadyWaUrl({
                                    phoneNumber: cert.user.phoneNumber,
                                    studentName: cert.participantName,
                                    certNumber: cert.certificateNumber,
                                    testDate: new Date(cert.testDate).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    }),
                                    totalScore: cert.totalScore,
                                    listeningScore: cert.listeningScore,
                                    structureScore: cert.structureScore,
                                    readingScore: cert.readingScore,
                                    cefrLevel: cert.cefrLevel,
                                    certUrl:
                                      typeof window !== "undefined"
                                        ? `${window.location.origin}/certificate/${cert.verificationCode}`
                                        : "",
                                    verifyUrl:
                                      typeof window !== "undefined"
                                        ? `${window.location.origin}/verify/${cert.verificationCode}`
                                        : "",
                                  })}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg transition"
                                  title="Kirim Hasil Skor & Dokumen Sertifikat via WhatsApp"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  <span>WA</span>
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: CALON PESERTA (DEMO LEADS) */}
        {activeTab === "leads" && (
          <div className="space-y-8">
            {/* SUMMARY METRIC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
                    Total Calon Peserta
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900">
                    {leadSummary?.totalLeads ?? leads.length}
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
                    Selesai Uji Coba
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-700">
                    {leadSummary?.completedCount ?? 0}
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
                    Rata-Rata Skor Demo
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900">
                    {leadSummary?.averageScore ?? 0}
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
                    Leads Kontak WA
                  </span>
                  <span className="text-2xl font-extrabold text-indigo-700">
                    {leadSummary?.withPhoneCount ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* MAIN TABLE CONTAINER */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Table Toolbar */}
              <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50">
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={leadSearch}
                      onChange={(e) => setLeadSearch(e.target.value)}
                      placeholder="Cari nama atau nomor telepon..."
                      className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <select
                    value={leadFilter}
                    onChange={(e: any) => setLeadFilter(e.target.value)}
                    className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="COMPLETED">Selesai Demo</option>
                    <option value="IN_PROGRESS">Sedang Mengerjakan</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <a
                    href={appUrl("/api/admin/export/leads")}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Ekspor CSV / Excel</span>
                  </a>
                  <button
                    onClick={fetchLeads}
                    className="p-2 text-slate-600 hover:bg-slate-200 rounded-xl transition"
                    title="Muat Ulang"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Table */}
              {isLoadingLeads ? (
                <div className="p-12 text-center text-xs text-slate-400">
                  <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>Memuat data calon peserta demo...</span>
                </div>
              ) : leads.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <UserCheck className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-semibold text-slate-600">Belum ada data calon peserta</p>
                  <p className="text-xs">Calon peserta yang mencoba simulasi demo 30 soal di halaman depan akan otomatis tercatat di sini.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">No</th>
                        <th className="py-3 px-4">Nama Calon Peserta</th>
                        <th className="py-3 px-4">Kontak WhatsApp</th>
                        <th className="py-3 px-3 text-center">Listening</th>
                        <th className="py-3 px-3 text-center">Structure</th>
                        <th className="py-3 px-3 text-center">Reading</th>
                        <th className="py-3 px-4 text-center">Total Skor</th>
                        <th className="py-3 px-4 text-center">Level</th>
                        <th className="py-3 px-4">Waktu Pengerjaan</th>
                        <th className="py-3 px-4 text-right">Aksi & Follow Up</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {leads.map((lead, idx) => (
                        <tr key={lead.id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4 font-mono text-slate-400 font-semibold">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div>{lead.name}</div>
                            <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                              lead.status === "COMPLETED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              {lead.status === "COMPLETED" ? "Selesai Demo" : "Sedang Mengerjakan"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {lead.phoneNumber ? (
                              <div className="font-mono font-bold text-slate-800">
                                {lead.phoneNumber}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">- Tidak diisi -</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono">
                            {lead.status === "COMPLETED" ? (
                              <span title={`Benar: ${lead.listeningRaw}/10`}>{lead.listeningScaled}</span>
                            ) : "-"}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono">
                            {lead.status === "COMPLETED" ? (
                              <span title={`Benar: ${lead.structureRaw}/10`}>{lead.structureScaled}</span>
                            ) : "-"}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono">
                            {lead.status === "COMPLETED" ? (
                              <span title={`Benar: ${lead.readingRaw}/10`}>{lead.readingScaled}</span>
                            ) : "-"}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-black text-blue-700 text-sm">
                            {lead.status === "COMPLETED" ? lead.totalScore : "-"}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {lead.cefrLevel ? (
                              <span className="inline-block bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded font-bold text-[10px]">
                                {lead.cefrLevel}
                              </span>
                            ) : "-"}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                            <div>{new Date(lead.startedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(lead.startedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {lead.phoneNumber && (
                                <a
                                  href={buildLeadGreetingWaUrl({
                                    phoneNumber: lead.phoneNumber,
                                    leadName: lead.name,
                                    totalScore: lead.totalScore,
                                    cefrLevel: lead.cefrLevel || undefined,
                                    registerUrl: typeof window !== "undefined" ? `${window.location.origin}/register` : "",
                                  })}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg transition"
                                  title="Kirim Pesan Sapaan & Penawaran Jadwal Resmi via WhatsApp"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>Chat WA</span>
                                </a>
                              )}
                              <button
                                onClick={() => handleDeleteLead(lead.id)}
                                disabled={isDeletingLeadId === lead.id}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Hapus Data Lead"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PENGATURAN PLATFORM & IDENTITAS INSTITUSI */}
        {activeTab === "settings" && (
          <AdminInstitutionSettings
            operatingMode={operatingMode}
            onUpdateOperatingMode={handleUpdateOperatingMode}
            isUpdatingMode={isUpdatingMode}
            onLogoChange={(url) => setInstitutionLogoUrl(url)}
          />
        )}
      </main>
    </div>


      {/* MODAL PREVIEW & VALIDASI PAKET */}
      <PackagePreviewModal
        isOpen={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false);
          setValidationReport(null);
          setPendingPackageData(null);
        }}
        report={validationReport}
        packageData={pendingPackageData}
        onConfirmSave={handleConfirmSavePackage}
      />

      {/* MODAL 1: PREVIEW BUKTI TRANSFER */}
      {previewProofUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  <span>Struk Bukti Pembayaran</span>
                </h3>
                {previewPaymentItem && (
                  <span className="text-xs text-slate-500 font-mono">
                    {previewPaymentItem.registrationNumber} • {previewPaymentItem.user.name}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setPreviewProofUrl(null);
                  setPreviewPaymentItem(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image / PDF viewer */}
            <div className="flex-1 overflow-auto my-4 bg-slate-900 rounded-2xl flex items-center justify-center p-2 min-h-[300px]">
              {previewProofUrl.endsWith(".pdf") ? (
                <iframe
                  src={appUrl(previewProofUrl)}
                  className="w-full h-[450px] rounded-xl bg-white"
                  title="PDF Struk"
                />
              ) : (
                <img
                  src={appUrl(previewProofUrl)}
                  alt="Bukti Transfer"
                  className="max-h-[500px] w-auto max-w-full object-contain rounded-lg"
                />
              )}
            </div>

            {/* Details & Quick Action */}
            {previewPaymentItem && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-900">
                    Tagihan: Rp {previewPaymentItem.amount.toLocaleString("id-ID")}
                  </div>
                  {previewPaymentItem.paymentNotes && (
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Catatan Pengirim: {previewPaymentItem.paymentNotes}
                    </div>
                  )}
                </div>
                <a
                  href={appUrl(previewProofUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka di Tab Baru</span>
                </a>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setPreviewProofUrl(null);
                  setPreviewPaymentItem(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Tutup
              </button>

              {previewPaymentItem && previewPaymentItem.status !== "CONFIRMED" && (
                <button
                  onClick={() => handleApprovePayment(previewPaymentItem.id)}
                  disabled={isProcessingPayment}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Setujui Pembayaran (Lunas)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TOLAK PEMBAYARAN */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  Tolak Pembayaran Tiket
                </h3>
              </div>
              <button
                onClick={() => {
                  setRejectTarget(null);
                  setRejectionReasonText("");
                }}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Pendaftaran tiket atas nama <strong>{rejectTarget.user.name}</strong> ({rejectTarget.registrationNumber}) akan ditolak. Berikan alasan penolakan agar peserta dapat mengunggah bukti yang benar.
            </p>

            {/* Quick Reason Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 block">Pilihan Alasan Cepat:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Dana belum masuk ke mutasi rekening resmi",
                  "Nominal transfer tidak sesuai tagihan",
                  "Foto bukti transfer buram / tidak terbaca",
                  "Bukan bukti transfer resmi bank",
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectionReasonText(preset)}
                    className="text-[10px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Alasan Penolakan:
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReasonText}
                onChange={(e) => setRejectionReasonText(e.target.value)}
                placeholder="Tuliskan alasan penolakan..."
                className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectTarget(null);
                  setRejectionReasonText("");
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleRejectPayment}
                disabled={isProcessingPayment}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs transition disabled:opacity-50"
              >
                {isProcessingPayment ? "Memproses..." : "Konfirmasi Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
