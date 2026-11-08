"use client";

import React, { useState, useEffect, useRef } from "react";
import { appFetch as fetch, appUrl } from "@/lib/appUrl";
import {
  Building2,
  PenTool,
  Globe,
  Upload,
  Check,
  Save,
  AlertCircle,
  ShieldCheck,
  Database,
  Download,
  RefreshCw,
  RotateCcw,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Award,
} from "lucide-react";

export interface InstitutionSettingsData {
  INSTITUTION_NAME: string;
  INSTITUTION_SUBTITLE: string;
  INSTITUTION_ADDRESS: string;
  INSTITUTION_CONTACT: string;
  INSTITUTION_CITY: string;
  INSTITUTION_LOGO_URL: string;
  DIRECTOR_NAME: string;
  DIRECTOR_TITLE: string;
  DIRECTOR_SIGNATURE_URL: string;
  INSTITUTION_STAMP_URL: string;
}

interface DatabaseBackupItem {
  filename: string;
  path: string;
  size: number;
  createdAt: string;
}

const DEFAULT_SETTINGS: InstitutionSettingsData = {
  INSTITUTION_NAME: "Lembaga Bahasa & Sertifikasi Internasional",
  INSTITUTION_SUBTITLE: "Center for Language Testing and Certification",
  INSTITUTION_ADDRESS: "Gedung Pusat Bahasa Lt. 2, Kampus Terpadu",
  INSTITUTION_CONTACT: "Telp: (021) 7890123 • Email: toefl@lembagabahasa.ac.id",
  INSTITUTION_CITY: "Jakarta",
  INSTITUTION_LOGO_URL: "/branding/institution-logo.svg",
  DIRECTOR_NAME: "Prof. Dr. H. Soedirman, M.Pd.",
  DIRECTOR_TITLE: "Academic Director of Certification",
  DIRECTOR_SIGNATURE_URL: "/branding/director-signature.svg",
  INSTITUTION_STAMP_URL: "/branding/institution-stamp.svg",
};

interface AdminInstitutionSettingsProps {
  operatingMode: "COMMERCIAL" | "INSTITUTION";
  onUpdateOperatingMode: (mode: "COMMERCIAL" | "INSTITUTION") => void;
  isUpdatingMode: boolean;
  onLogoChange?: (url: string) => void;
}

export const AdminInstitutionSettings: React.FC<AdminInstitutionSettingsProps> = ({
  operatingMode,
  onUpdateOperatingMode,
  isUpdatingMode,
  onLogoChange,
}) => {
  const [subTab, setSubTab] = useState<"profile" | "signature" | "mode" | "backup">("profile");
  const [settings, setSettings] = useState<InstitutionSettingsData>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [backups, setBackups] = useState<DatabaseBackupItem[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [restoringBackup, setRestoringBackup] = useState<string | null>(null);
  const [deletingBackup, setDeletingBackup] = useState<string | null>(null);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const sigInputRef = useRef<HTMLInputElement | null>(null);
  const stampInputRef = useRef<HTMLInputElement | null>(null);
  const restoreUploadInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/settings/institution");
        const json = await res.json();
        if (json.settings) {
          setSettings(json.settings);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const loadBackups = async () => {
    try {
      setIsLoadingBackups(true);
      setBackupError(null);
      const res = await fetch("/api/admin/backups");
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Daftar backup tidak dapat dimuat.");
      }
      setBackups(Array.isArray(json.backups) ? json.backups : []);
    } catch (err) {
      setBackupError(err instanceof Error ? err.message : "Daftar backup tidak dapat dimuat.");
    } finally {
      setIsLoadingBackups(false);
    }
  };

  useEffect(() => {
    if (subTab === "backup") {
      void loadBackups();
    }
  }, [subTab]);

  const createBackup = async () => {
    if (!window.confirm("Buat backup database sekarang? Proses ini tidak menghapus atau mengubah data ujian.")) {
      return;
    }

    try {
      setIsCreatingBackup(true);
      setBackupMessage(null);
      setBackupError(null);
      const res = await fetch("/api/admin/backups", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Backup database gagal dibuat.");
      }
      setBackupMessage(`Backup ${json.backup?.filename || "database"} berhasil dibuat.`);
      await loadBackups();
    } catch (err) {
      setBackupError(err instanceof Error ? err.message : "Backup database gagal dibuat.");
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const restoreBackup = async (filename: string) => {
    if (!window.confirm(`Restore ${filename} akan mengganti isi database aktif. Sistem akan membuat safety backup terlebih dahulu. Lanjutkan?`)) {
      return;
    }

    const confirmation = window.prompt('Ketik RESTORE untuk mengonfirmasi penggantian database aktif:');
    if (confirmation?.trim().toUpperCase() !== 'RESTORE') {
      setBackupError('Restore dibatalkan. Konfirmasi harus berisi RESTORE.');
      return;
    }

    try {
      setRestoringBackup(filename);
      setBackupMessage(null);
      setBackupError(null);
      const res = await fetch(`/api/admin/backups/${encodeURIComponent(filename)}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "RESTORE" }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Restore database gagal.");
      }
      const safetyBackup = json.restore?.safetyBackup?.filename;
      setBackupMessage(`Restore ${filename} berhasil. Safety backup: ${safetyBackup || "tersedia di daftar backup"}.`);
      await loadBackups();
    } catch (err) {
      setBackupError(err instanceof Error ? err.message : "Restore database gagal.");
    } finally {
      setRestoringBackup(null);
    }
  };

  const restoreUploadedBackup = async (file: File) => {
    if (!window.confirm(`Restore dari file ${file.name} akan mengganti isi database aktif. Sistem akan membuat safety backup terlebih dahulu. Lanjutkan?`)) {
      return;
    }

    const confirmation = window.prompt('Ketik RESTORE untuk mengonfirmasi penggantian database aktif:');
    if (confirmation?.trim().toUpperCase() !== 'RESTORE') {
      setBackupError('Restore dibatalkan. Konfirmasi harus berisi RESTORE.');
      return;
    }

    try {
      setRestoringBackup(file.name);
      setBackupMessage(null);
      setBackupError(null);
      const formData = new FormData();
      formData.append('backup', file);
      formData.append('confirmation', 'RESTORE');
      const res = await fetch('/api/admin/backups/restore-upload', { method: 'POST', body: formData });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Restore dari file gagal.');
      }
      const safetyBackup = json.restore?.safetyBackup?.filename;
      setBackupMessage(`Restore dari ${file.name} berhasil. Safety backup: ${safetyBackup || 'tersedia di daftar backup'}.`);
      await loadBackups();
    } catch (err) {
      setBackupError(err instanceof Error ? err.message : 'Restore dari file gagal.');
    } finally {
      setRestoringBackup(null);
      if (restoreUploadInputRef.current) {
        restoreUploadInputRef.current.value = '';
      }
    }
  };

  const deleteBackup = async (filename: string) => {
    if (!window.confirm(`Hapus arsip ${filename}? Arsip yang dihapus tidak dapat dipulihkan dari aplikasi.`)) {
      return;
    }

    const confirmation = window.prompt('Ketik DELETE untuk mengonfirmasi penghapusan arsip:');
    if (confirmation?.trim().toUpperCase() !== 'DELETE') {
      setBackupError('Penghapusan dibatalkan. Konfirmasi harus berisi DELETE.');
      return;
    }

    try {
      setDeletingBackup(filename);
      setBackupMessage(null);
      setBackupError(null);
      const res = await fetch(`/api/admin/backups/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: 'DELETE' }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Backup gagal dihapus.');
      }
      setBackupMessage(`Backup ${filename} berhasil dihapus.`);
      await loadBackups();
    } catch (err) {
      setBackupError(err instanceof Error ? err.message : 'Backup gagal dihapus.');
    } finally {
      setDeletingBackup(null);
    }
  };

  const formatBackupSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      const res = await fetch("/api/admin/settings/institution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Gagal menyimpan pengaturan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (file: File, type: "logo" | "signature" | "stamp") => {
    try {
      setUploadingType(type);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await fetch("/api/admin/settings/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.url) {
        if (type === "logo") {
          setSettings((prev) => ({ ...prev, INSTITUTION_LOGO_URL: json.url }));
          onLogoChange?.(json.url);
          window.dispatchEvent(new CustomEvent("institution-logo-updated", { detail: { url: json.url } }));
        } else if (type === "signature") {
          setSettings((prev) => ({ ...prev, DIRECTOR_SIGNATURE_URL: json.url }));
        } else if (type === "stamp") {
          setSettings((prev) => ({ ...prev, INSTITUTION_STAMP_URL: json.url }));
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Gagal mengunggah gambar.");
    } finally {
      setUploadingType(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
        <span>Memuat pengaturan institusi...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Sub-Tab Navigation Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex flex-wrap gap-1 shadow-xs">
        <button
          type="button"
          onClick={() => setSubTab("profile")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            subTab === "profile"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Profil & Logo Institusi</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("signature")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            subTab === "signature"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span>Penandatangan & Stempel Sertifikat</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("mode")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            subTab === "mode"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Mode Operasional Sistem</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("backup")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            subTab === "backup"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Backup Database</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl text-xs flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">
            Perubahan identitas dan pengaturan sertifikat berhasil disimpan! Dokumen cetak sertifikat kini menggunakan data terbaru.
          </span>
        </div>
      )}

      {/* SUB-TAB 1: PROFIL & LOGO INSTITUSI */}
      {subTab === "profile" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Identitas Resmi Lembaga Penguji</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Informasi ini akan tercetak pada kop sertifikat digital dan tampilan verifikasi publik.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Logo Upload & Preview */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-24 h-24 rounded-2xl bg-white border border-slate-300 flex items-center justify-center p-2 shadow-xs shrink-0 relative overflow-hidden">
                <img
                  src={appUrl(settings.INSTITUTION_LOGO_URL || "/branding/institution-logo.svg")}
                  alt="Logo Preview"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <span className="text-xs font-bold text-slate-800 block">
                  Logo Lambang Institusi (Emblem)
                </span>
                <p className="text-[11px] text-slate-500">
                  Format gambar transparan disarankan (PNG atau SVG). Ukuran ideal 200x200 piksel.
                </p>
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-1">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "logo");
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingType === "logo"}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition border border-blue-200"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingType === "logo" ? "Mengunggah..." : "Unggah Logo Baru"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const logoUrl = "/branding/institution-logo.svg";
                      setSettings((prev) => ({ ...prev, INSTITUTION_LOGO_URL: logoUrl }));
                      onLogoChange?.(logoUrl);
                      window.dispatchEvent(new CustomEvent("institution-logo-updated", { detail: { url: logoUrl } }));
                    }}
                    className="px-3 py-1.5 bg-slate-200/60 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                  >
                    Pakai Logo Standar
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-800">
                  Nama Lembaga / Pusat Bahasa (Baris Utama)
                </label>
                <input
                  type="text"
                  required
                  value={settings.INSTITUTION_NAME}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, INSTITUTION_NAME: e.target.value }))
                  }
                  placeholder="Contoh: Lembaga Bahasa & Sertifikasi Internasional"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-800">
                  Sub-judul Lembaga (Baris Kedua)
                </label>
                <input
                  type="text"
                  value={settings.INSTITUTION_SUBTITLE}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, INSTITUTION_SUBTITLE: e.target.value }))
                  }
                  placeholder="Contoh: Center for Language Testing and Certification"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  Kota Penerbitan Sertifikat
                </label>
                <input
                  type="text"
                  required
                  value={settings.INSTITUTION_CITY}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, INSTITUTION_CITY: e.target.value }))
                  }
                  placeholder="Contoh: Jakarta, Surabaya, Bandung"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  Kontak Layanan / Email
                </label>
                <input
                  type="text"
                  value={settings.INSTITUTION_CONTACT}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, INSTITUTION_CONTACT: e.target.value }))
                  }
                  placeholder="Contoh: toefl@lembagabahasa.ac.id | (021) 7890123"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-800">
                  Alamat Kantor Institusi
                </label>
                <input
                  type="text"
                  value={settings.INSTITUTION_ADDRESS}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, INSTITUTION_ADDRESS: e.target.value }))
                  }
                  placeholder="Contoh: Gedung Rektorat Lt. 2, Kampus Terpadu, Jl. Utama No. 10"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Menyimpan..." : "Simpan Profil Lembaga"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 2: PEJABAT & STEMPEL RESMI */}
      {subTab === "signature" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-blue-600" />
              <span>Pejabat Penandatangan & Stempel Dinas Sertifikat</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur tanda tangan digital direktur dan stempel resmi yang akan di-overlay secara realistis pada sertifikat.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  Nama Lengkap Pejabat Penandatangan
                </label>
                <input
                  type="text"
                  required
                  value={settings.DIRECTOR_NAME}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, DIRECTOR_NAME: e.target.value }))
                  }
                  placeholder="Contoh: Prof. Dr. H. Soedirman, M.Pd."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-serif"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  Jabatan Resmi Pejabat
                </label>
                <input
                  type="text"
                  required
                  value={settings.DIRECTOR_TITLE}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, DIRECTOR_TITLE: e.target.value }))
                  }
                  placeholder="Contoh: Academic Director of Certification"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Two Graphic Upload Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Signature */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Tanda Tangan Digital Direktur
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">PNG / SVG</span>
                </div>
                <div className="h-20 bg-white border border-slate-200 rounded-xl p-2 flex items-center justify-center relative overflow-hidden">
                  <img
                    src={appUrl(settings.DIRECTOR_SIGNATURE_URL || "/branding/director-signature.svg")}
                    alt="Signature"
                    className="max-h-full object-contain"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={sigInputRef}
                    type="file"
                    accept="image/png,image/svg+xml"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "signature");
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => sigInputRef.current?.click()}
                    disabled={uploadingType === "signature"}
                    className="flex-1 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs transition border border-blue-200 text-center"
                  >
                    {uploadingType === "signature" ? "Mengunggah..." : "Ganti Tanda Tangan"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        DIRECTOR_SIGNATURE_URL: "/branding/director-signature.svg",
                      }))
                    }
                    className="py-1.5 px-3 bg-slate-200/60 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition"
                  >
                    Default
                  </button>
                </div>
              </div>

              {/* Card 2: Stamp */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Stempel Resmi Dinas (Cap)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">PNG / SVG</span>
                </div>
                <div className="h-20 bg-white border border-slate-200 rounded-xl p-2 flex items-center justify-center relative overflow-hidden">
                  <img
                    src={appUrl(settings.INSTITUTION_STAMP_URL || "/branding/institution-stamp.svg")}
                    alt="Stamp"
                    className="max-h-full object-contain"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={stampInputRef}
                    type="file"
                    accept="image/png,image/svg+xml"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "stamp");
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => stampInputRef.current?.click()}
                    disabled={uploadingType === "stamp"}
                    className="flex-1 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition border border-indigo-200 text-center"
                  >
                    {uploadingType === "stamp" ? "Mengunggah..." : "Ganti Stempel"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        INSTITUTION_STAMP_URL: "/branding/institution-stamp.svg",
                      }))
                    }
                    className="py-1.5 px-3 bg-slate-200/60 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition"
                  >
                    Default
                  </button>
                </div>
              </div>
            </div>

            {/* LIVE PREVIEW BOX */}
            <div className="bg-[#fffdfa] border-2 border-dashed border-amber-300 p-6 rounded-2xl text-center space-y-2">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                Simulasi Live Tampilan Tanda Tangan & Stempel di Sertifikat:
              </span>

              <div className="inline-block text-center relative min-w-[220px] pt-3">
                <div className="text-xs text-slate-600 mb-1">
                  {settings.INSTITUTION_CITY || "Jakarta"},{" "}
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>

                <div className="relative h-20 w-52 mx-auto flex items-center justify-center my-1">
                  {/* Digital Signature */}
                  <img
                    src={appUrl(settings.DIRECTOR_SIGNATURE_URL || "/branding/director-signature.svg")}
                    alt="Signature Preview"
                    className="h-16 w-auto max-w-[180px] object-contain relative z-10 filter drop-shadow-xs"
                  />

                  {/* Stamp Overlay */}
                  <img
                    src={appUrl(settings.INSTITUTION_STAMP_URL || "/branding/institution-stamp.svg")}
                    alt="Stamp Preview"
                    className="absolute -left-3 -top-2 w-24 h-24 object-contain opacity-85 pointer-events-none mix-blend-multiply z-20"
                  />
                </div>

                <div className="font-serif text-sm font-bold text-slate-900 border-b-2 border-slate-700 pb-0.5 px-4 mt-1">
                  {settings.DIRECTOR_NAME || "Prof. Dr. H. Soedirman, M.Pd."}
                </div>
                <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mt-0.5">
                  {settings.DIRECTOR_TITLE || "Academic Director of Certification"}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Menyimpan..." : "Simpan Tanda Tangan & Stempel"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 3: MODE OPERASIONAL PLATFORM */}
      {subTab === "mode" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <div className="border-b border-slate-100 pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Konfigurasi Mode Operasional Sistem
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tentukan alur pendaftaran peserta dan antarmuka beranda platform Anda.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {/* Option 1: Institutional Mode (B2B) */}
            <div
              onClick={() => onUpdateOperatingMode("INSTITUTION")}
              className={`p-6 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                operatingMode === "INSTITUTION"
                  ? "border-blue-600 bg-blue-50/40 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-slate-900 text-sm">
                    Mode Institusi / Kampus (B2B)
                  </span>
                  {operatingMode === "INSTITUTION" && (
                    <span className="text-[10px] font-bold bg-blue-600 text-white px-2.5 py-0.5 rounded-full">
                      Aktif Sekarang
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Peserta ujian langsung masuk menggunakan <strong>Token Sesi</strong> yang dibagikan oleh panitia tanpa perlu membuat akun atau login.
                </p>
                <ul className="text-[11px] text-slate-500 space-y-1.5 border-t border-slate-200/60 pt-3">
                  <li>✓ Nol friksi, akses cepat di hari-H ujian</li>
                  <li>✓ Ideal untuk seleksi CPNS/BUMN & ujian massal kampus</li>
                  <li>✓ Kontrol token terpusat di dashboard admin</li>
                </ul>
              </div>

              <button
                type="button"
                disabled={isUpdatingMode || operatingMode === "INSTITUTION"}
                className={`mt-5 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition ${
                  operatingMode === "INSTITUTION"
                    ? "bg-blue-600 text-white cursor-default"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {operatingMode === "INSTITUTION" ? "Sedang Digunakan" : "Pilih Mode Institusi"}
              </button>
            </div>

            {/* Option 2: Commercial Mode (B2C) */}
            <div
              onClick={() => onUpdateOperatingMode("COMMERCIAL")}
              className={`p-6 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                operatingMode === "COMMERCIAL"
                  ? "border-blue-600 bg-blue-50/40 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-slate-900 text-sm">
                    Mode Komersial Terbuka (B2C)
                  </span>
                  {operatingMode === "COMMERCIAL" && (
                    <span className="text-[10px] font-bold bg-blue-600 text-white px-2.5 py-0.5 rounded-full">
                      Aktif Sekarang
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Portal publik dengan <strong>registrasi mandiri peserta</strong>, login akun siswa, verifikasi pembayaran struk transfer bank/loket, dan sertifikat otomatis.
                </p>
                <ul className="text-[11px] text-slate-500 space-y-1.5 border-t border-slate-200/60 pt-3">
                  <li>✓ Registrasi akun resmi (Nama, NIK, WhatsApp)</li>
                  <li>✓ Pembayaran transfer bank / loket verifikasi admin</li>
                  <li>✓ Dashboard siswa untuk tes & unduh sertifikat</li>
                </ul>
              </div>

              <button
                type="button"
                disabled={isUpdatingMode || operatingMode === "COMMERCIAL"}
                className={`mt-5 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition ${
                  operatingMode === "COMMERCIAL"
                    ? "bg-blue-600 text-white cursor-default"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {operatingMode === "COMMERCIAL" ? "Sedang Digunakan" : "Pilih Mode Komersial"}
              </button>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Catatan Arsitektur:</strong> Mengubah mode operasional tidak akan menghapus data soal, sesi ujian, maupun hasil skor yang sudah ada di database. Sistem mesin ujian (listening, scoring, dan lockdown) akan tetap bekerja identik di kedua mode.
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: BACKUP DATABASE */}
      {subTab === "backup" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Backup Database</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Buat salinan terkompresi database tanpa menghapus atau menjalankan migrasi apa pun.
                </p>
              </div>
            </div>
          </div>

          {backupMessage && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl text-xs flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{backupMessage}</span>
            </div>
          )}

          {backupError && (
            <div className="bg-rose-50 border border-rose-300 text-rose-800 p-4 rounded-2xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-semibold">{backupError}</span>
            </div>
          )}

          <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 text-xs text-slate-700 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Backup disimpan di area privat server dan hanya dapat dibuat, diunduh, atau dipulihkan oleh administrator yang sedang login. Arsip menggunakan format SQL gzip sehingga dapat disimpan di lokasi cadangan lain.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed">
            <strong>Restore mengganti database aktif.</strong> Sesi ujian yang sedang berlangsung akan memblokir restore. Sebelum restore dijalankan, sistem otomatis membuat safety backup terbaru.
            <span className="block mt-1">File yang didukung: .sql dan .sql.gz.</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cadangan Tersedia</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Simpan salinan di luar server secara berkala untuk perlindungan tambahan.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 justify-end">
              <input
                ref={restoreUploadInputRef}
                type="file"
                accept=".sql,.sql.gz,application/sql,application/gzip,application/x-gzip"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void restoreUploadedBackup(file);
                }}
              />
              <button
                type="button"
                onClick={() => void loadBackups()}
                disabled={isLoadingBackups || isCreatingBackup || restoringBackup !== null || deletingBackup !== null}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBackups ? "animate-spin" : ""}`} />
                <span>Segarkan</span>
              </button>
              <button
                type="button"
                onClick={() => void createBackup()}
                disabled={isCreatingBackup || isLoadingBackups || restoringBackup !== null || deletingBackup !== null}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition disabled:opacity-50"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{isCreatingBackup ? "Membuat Backup..." : "Buat Backup Sekarang"}</span>
              </button>
              <button
                type="button"
                onClick={() => restoreUploadInputRef.current?.click()}
                disabled={isCreatingBackup || isLoadingBackups || restoringBackup !== null || deletingBackup !== null}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold rounded-xl text-xs transition disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Restore dari File</span>
              </button>
            </div>
          </div>

          {isLoadingBackups ? (
            <div className="py-10 text-center text-xs text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
              Memuat daftar backup...
            </div>
          ) : backups.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500 border border-dashed border-slate-300 rounded-2xl">
              Belum ada backup database yang tersimpan.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-bold">Nama Berkas</th>
                    <th className="px-4 py-3 font-bold">Ukuran</th>
                    <th className="px-4 py-3 font-bold">Dibuat</th>
                    <th className="px-4 py-3 text-right font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {backups.map((backup) => (
                    <tr key={backup.filename} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-700 whitespace-nowrap">{backup.filename}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatBackupSize(backup.size)}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{new Date(backup.createdAt).toLocaleString("id-ID")}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <a
                            href={appUrl(`/api/admin/backups/${encodeURIComponent(backup.filename)}/download`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Unduh
                          </a>
                          <button
                            type="button"
                            onClick={() => void restoreBackup(backup.filename)}
                            disabled={isLoadingBackups || isCreatingBackup || restoringBackup !== null || deletingBackup !== null}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg transition disabled:opacity-50"
                          >
                            <RotateCcw className={`w-3.5 h-3.5 ${restoringBackup === backup.filename ? "animate-spin" : ""}`} />
                            {restoringBackup === backup.filename ? "Memulihkan..." : "Restore"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteBackup(backup.filename)}
                            disabled={isLoadingBackups || isCreatingBackup || restoringBackup !== null || deletingBackup !== null}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition disabled:opacity-50"
                          >
                            <Trash2 className={`w-3.5 h-3.5 ${deletingBackup === backup.filename ? "animate-pulse" : ""}`} />
                            {deletingBackup === backup.filename ? "Menghapus..." : "Hapus"}
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
      )}
    </div>
  );
};
