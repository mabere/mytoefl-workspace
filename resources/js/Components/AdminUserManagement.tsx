"use client";

import React, { useState, useEffect, useCallback } from "react";
import { appFetch as fetch } from "@/lib/appUrl";
import {
  Users,
  ShieldCheck,
  Search,
  Plus,
  Edit,
  Trash2,
  Key,
  CheckCircle2,
  Award,
  X,
  Save,
  Loader2,
  AlertCircle,
  MessageSquare,
  Building2,
  Mail,
  Phone,
  CreditCard,
  UserPlus,
} from "lucide-react";

export interface ManagedStudentUser {
  id: number;
  name: string;
  email: string;
  idNumber: string | null;
  phoneNumber: string | null;
  institution: string | null;
  registrationsCount: number;
  examSessionsCount: number;
  certificatesCount: number;
  createdAt: string;
}

export interface ManagedUserSummary {
  totalUsers: number;
  withExamCount: number;
  withCertificateCount: number;
}

export interface ManagedAdminUser {
  id: string;
  username: string;
  name: string;
  email?: string | null;
  photoUrl?: string | null;
  createdAt: string;
  isCurrent: boolean;
}

interface AdminUserManagementProps {
  onTotalUsersChange?: (count: number) => void;
  onCurrentAdminUpdated?: (admin: {
    id: string;
    username: string;
    name: string;
    email?: string | null;
    photoUrl?: string | null;
  }) => void;
}

export const AdminUserManagement: React.FC<AdminUserManagementProps> = ({
  onTotalUsersChange,
  onCurrentAdminUpdated,
}) => {
  const [subTab, setSubTab] = useState<"participants" | "admins">("participants");

  // Participants state
  const [users, setUsers] = useState<ManagedStudentUser[]>([]);
  const [summary, setSummary] = useState<ManagedUserSummary>({
    totalUsers: 0,
    withExamCount: 0,
    withCertificateCount: 0,
  });
  const [search, setSearch] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isDeletingUserId, setIsDeletingUserId] = useState<number | null>(null);

  // Participant Modal state (Create / Edit)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedStudentUser | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userIdNumber, setUserIdNumber] = useState("");
  const [userPhoneNumber, setUserPhoneNumber] = useState("");
  const [userInstitution, setUserInstitution] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [syncCertificates, setSyncCertificates] = useState(true);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [userModalError, setUserModalError] = useState<string | null>(null);

  // Admins state
  const [admins, setAdmins] = useState<ManagedAdminUser[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [isDeletingAdminId, setIsDeletingAdminId] = useState<string | null>(null);

  // Admin Modal state (Create / Edit)
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<ManagedAdminUser | null>(null);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isSavingAdmin, setIsSavingAdmin] = useState(false);
  const [adminModalError, setAdminModalError] = useState<string | null>(null);

  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showBanner = (type: "success" | "error", text: string) => {
    setFeedbackBanner({ type, text });
    setTimeout(() => {
      setFeedbackBanner((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const fetchUsers = useCallback(async (searchTerm: string) => {
    try {
      setIsLoadingUsers(true);
      const params = new URLSearchParams();
      if (searchTerm.trim()) {
        params.set("search", searchTerm.trim());
      }
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const json = await res.json();
      if (res.ok && json.users) {
        setUsers(json.users);
        if (json.summary) {
          setSummary(json.summary);
          onTotalUsersChange?.(json.summary.totalUsers);
        }
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [onTotalUsersChange]);

  const fetchAdmins = useCallback(async () => {
    try {
      setIsLoadingAdmins(true);
      const res = await fetch("/api/admin/admin-users");
      const json = await res.json();
      if (res.ok && json.admins) {
        setAdmins(json.admins);
      }
    } catch (err) {
      console.error("Failed to fetch admin users:", err);
    } finally {
      setIsLoadingAdmins(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, fetchUsers]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Open Create Participant Modal
  const openCreateUserModal = () => {
    setEditingUser(null);
    setUserName("");
    setUserEmail("");
    setUserIdNumber("");
    setUserPhoneNumber("");
    setUserInstitution("");
    setUserPassword("");
    setSyncCertificates(true);
    setUserModalError(null);
    setIsUserModalOpen(true);
  };

  // Open Edit Participant Modal
  const openEditUserModal = (user: ManagedStudentUser) => {
    setEditingUser(user);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserIdNumber(user.idNumber || "");
    setUserPhoneNumber(user.phoneNumber || "");
    setUserInstitution(user.institution || "");
    setUserPassword("");
    setSyncCertificates(true);
    setUserModalError(null);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserModalError(null);

    try {
      setIsSavingUser(true);
      const isEdit = Boolean(editingUser);
      const res = await fetch("/api/admin/users", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser?.id,
          name: userName,
          email: userEmail,
          idNumber: userIdNumber,
          phoneNumber: userPhoneNumber,
          institution: userInstitution,
          password: userPassword,
          syncCertificates,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setUserModalError(json.error || "Gagal menyimpan data peserta.");
        return;
      }

      setIsUserModalOpen(false);
      await fetchUsers(search);
      showBanner(
        "success",
        isEdit
          ? `Data peserta "${json.user.name}" berhasil diperbarui.`
          : `Akun peserta "${json.user.name}" berhasil ditambahkan.`
      );
    } catch (err) {
      console.error(err);
      setUserModalError("Terjadi kesalahan jaringan saat menyimpan data peserta.");
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleDeleteUser = async (user: ManagedStudentUser) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus akun peserta "${user.name}" (${user.email})?`
      )
    ) {
      return;
    }

    try {
      setIsDeletingUserId(user.id);
      const res = await fetch(`/api/admin/users?id=${user.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showBanner("error", json.error || "Gagal menghapus akun peserta.");
        return;
      }
      await fetchUsers(search);
      showBanner("success", `Akun peserta "${user.name}" telah dihapus.`);
    } catch (err) {
      console.error(err);
      showBanner("error", "Terjadi kesalahan jaringan saat menghapus peserta.");
    } finally {
      setIsDeletingUserId(null);
    }
  };

  // Open Create Admin Modal
  const openCreateAdminModal = () => {
    setEditingAdmin(null);
    setAdminUsername("");
    setAdminName("");
    setAdminEmail("");
    setAdminPassword("");
    setAdminModalError(null);
    setIsAdminModalOpen(true);
  };

  // Open Edit Admin Modal
  const openEditAdminModal = (admin: ManagedAdminUser) => {
    setEditingAdmin(admin);
    setAdminUsername(admin.username);
    setAdminName(admin.name);
    setAdminEmail(admin.email || "");
    setAdminPassword("");
    setAdminModalError(null);
    setIsAdminModalOpen(true);
  };

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminModalError(null);

    try {
      setIsSavingAdmin(true);
      const isEdit = Boolean(editingAdmin);
      const res = await fetch("/api/admin/admin-users", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingAdmin?.id,
          username: adminUsername,
          name: adminName,
          email: adminEmail,
          password: adminPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setAdminModalError(json.error || "Gagal menyimpan akun administrator.");
        return;
      }

      setIsAdminModalOpen(false);
      await fetchAdmins();
      if (json.admin?.isCurrent && onCurrentAdminUpdated) {
        onCurrentAdminUpdated({
          id: json.admin.id,
          username: json.admin.username,
          name: json.admin.name,
          email: json.admin.email,
          photoUrl: json.admin.photoUrl,
        });
      }
      showBanner(
        "success",
        isEdit
          ? `Akun administrator "@${json.admin.username}" berhasil diperbarui.`
          : `Administrator baru "@${json.admin.username}" berhasil ditambahkan.`
      );
    } catch (err) {
      console.error(err);
      setAdminModalError("Terjadi kesalahan jaringan saat menyimpan akun administrator.");
    } finally {
      setIsSavingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (admin: ManagedAdminUser) => {
    if (
      !confirm(
        `Hapus akun administrator "${admin.name}" (@${admin.username})?`
      )
    ) {
      return;
    }

    try {
      setIsDeletingAdminId(admin.id);
      const res = await fetch(`/api/admin/admin-users?id=${admin.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showBanner("error", json.error || "Gagal menghapus akun administrator.");
        return;
      }
      await fetchAdmins();
      showBanner("success", `Akun administrator "@${admin.username}" berhasil dihapus.`);
    } catch (err) {
      console.error(err);
      showBanner("error", "Terjadi kesalahan jaringan saat menghapus administrator.");
    } finally {
      setIsDeletingAdminId(null);
    }
  };

  const formatWaNumber = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("0")) {
      return "62" + digits.slice(1);
    }
    return digits;
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setSubTab("participants")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              subTab === "participants"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Akun Peserta Ujian</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-blue-50 text-blue-700">
              {summary.totalUsers}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("admins")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              subTab === "admins"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Pengawas & Administrator</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-200 text-slate-700">
              {admins.length}
            </span>
          </button>
        </div>

        <div>
          {subTab === "participants" ? (
            <button
              type="button"
              onClick={openCreateUserModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Peserta Baru</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={openCreateAdminModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Administrator</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackBanner && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
            feedbackBanner.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackBanner.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackBanner.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SUB-TAB 1: PARTICIPANTS (USERS) */}
      {subTab === "participants" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
                  Total Akun Peserta
                </span>
                <span className="text-2xl font-extrabold text-slate-900">
                  {summary.totalUsers}
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
                  Pernah Mengikuti Ujian
                </span>
                <span className="text-2xl font-extrabold text-emerald-700">
                  {summary.withExamCount}
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">
                  Memiliki E-Sertifikat
                </span>
                <span className="text-2xl font-extrabold text-amber-700">
                  {summary.withCertificateCount}
                </span>
              </div>
            </div>
          </div>

          {/* Search & Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Daftar Akun Peserta Terdaftar
                </h3>
                <p className="text-xs text-slate-500">
                  Kelola biodata sertifikat, koreksi nama/NIM, atau reset password peserta.
                </p>
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama, email, NIM/NIK, WA..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            {isLoadingUsers ? (
              <div className="p-12 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-xs">Memuat data akun peserta...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Users className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">
                  Tidak ada akun peserta ditemukan
                </p>
                <p className="text-xs">
                  Gunakan kata kunci pencarian lain atau tambahkan akun peserta baru.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Peserta & Institusi</th>
                      <th className="py-3 px-4">Email & Identitas (NIK/NIM)</th>
                      <th className="py-3 px-4">Kontak WhatsApp</th>
                      <th className="py-3 px-4 text-center">Riwayat</th>
                      <th className="py-3 px-4">Terdaftar</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => {
                      const hasProtectedHistory =
                        u.examSessionsCount > 0 || u.certificatesCount > 0;
                      return (
                        <tr key={u.id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{u.name}</div>
                            {u.institution ? (
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{u.institution}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">
                                Institusi belum diisi
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-800">{u.email}</div>
                            {u.idNumber ? (
                              <span className="inline-block mt-0.5 font-mono text-[10.5px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                                ID: {u.idNumber}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">
                                NIK/NIM belum diisi
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {u.phoneNumber ? (
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-semibold text-slate-800">
                                  {u.phoneNumber}
                                </span>
                                <a
                                  href={`https://wa.me/${formatWaNumber(u.phoneNumber)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold transition"
                                  title="Hubungi via WhatsApp"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  <span>WA</span>
                                </a>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">-</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5 flex-wrap justify-center">
                              <span
                                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200"
                                title="Jumlah Sesi Ujian"
                              >
                                {u.examSessionsCount} Ujian
                              </span>
                              {u.certificatesCount > 0 && (
                                <span
                                  className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200"
                                  title="Jumlah E-Sertifikat"
                                >
                                  {u.certificatesCount} Sertifikat
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-"}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditUserModal(u)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg font-bold transition"
                                title="Edit Biodata atau Reset Password Peserta"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit / Password</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u)}
                                disabled={
                                  isDeletingUserId === u.id || hasProtectedHistory
                                }
                                className={`p-1.5 rounded-lg transition ${
                                  hasProtectedHistory
                                    ? "text-slate-300 cursor-not-allowed"
                                    : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                }`}
                                title={
                                  hasProtectedHistory
                                    ? "Peserta memiliki riwayat ujian/sertifikat dan tidak dapat dihapus"
                                    : "Hapus Akun Peserta"
                                }
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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
      )}

      {/* SUB-TAB 2: ADMINISTRATORS (ADMIN_USERS) */}
      {subTab === "admins" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Daftar Akun Pengawas & Administrator (`admin_users`)
              </h3>
              <p className="text-xs text-slate-500">
                Akun khusus yang memiliki izin masuk ke portal `/admin/login` menggunakan Username dan Password.
              </p>
            </div>
          </div>

          {isLoadingAdmins ? (
            <div className="p-12 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-xs">Memuat daftar administrator...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Nama Lengkap</th>
                    <th className="py-3 px-4">Username & Email</th>
                    <th className="py-3 px-4">Status Sesi</th>
                    <th className="py-3 px-4">Tanggal Dibuat</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {admins.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                            {a.photoUrl ? (
                              <img src={a.photoUrl} alt={a.name} className="w-full h-full object-cover" />
                            ) : (
                              a.name.charAt(0) || "A"
                            )}
                          </div>
                          <span>{a.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-700 font-semibold">@{a.username}</div>
                        {a.email ? (
                          <div className="text-[11px] text-slate-500 font-sans flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{a.email}</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 font-sans italic">Belum ada email</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {a.isCurrent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Sedang Anda Gunakan</span>
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                            Pengawas Terdaftar
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {a.createdAt
                          ? new Date(a.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditAdminModal(a)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg font-bold transition"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>Ubah / Ganti Password</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteAdmin(a)}
                            disabled={
                              a.isCurrent ||
                              admins.length <= 1 ||
                              isDeletingAdminId === a.id
                            }
                            className={`p-1.5 rounded-lg transition ${
                              a.isCurrent || admins.length <= 1
                                ? "text-slate-300 cursor-not-allowed"
                                : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            }`}
                            title={
                              a.isCurrent
                                ? "Tidak dapat menghapus akun yang sedang aktif login"
                                : admins.length <= 1
                                ? "Minimal harus tersisa satu administrator"
                                : "Hapus Administrator"
                            }
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
      )}

      {/* MODAL 1: CREATE / EDIT PARTICIPANT USER */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingUser ? "Edit Biodata & Password Peserta" : "Tambah Akun Peserta Baru"}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingUser
                    ? "Perbarui identitas peserta untuk keperluan sertifikat atau reset password login."
                    : "Buat akun peserta baru agar dapat langsung login ke portal ujian."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {userModalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{userModalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap (Sesuai Sertifikat) *
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Contoh: Budi Santoso, S.Kom."
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Email Login *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="peserta@email.com"
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Identitas (NIM / NIK)
                  </label>
                  <div className="relative">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={userIdNumber}
                      onChange={(e) => setUserIdNumber(e.target.value)}
                      placeholder="NIM / NIK KTP"
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={userPhoneNumber}
                      onChange={(e) => setUserPhoneNumber(e.target.value)}
                      placeholder="0812xxxxxxxx"
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Asal Institusi / Kampus
                  </label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={userInstitution}
                      onChange={(e) => setUserInstitution(e.target.value)}
                      placeholder="Universitas / Instansi"
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {editingUser
                    ? "Reset Password Baru (Kosongkan jika tidak ingin mengubah password)"
                    : "Password Akun Peserta (Minimal 8 Karakter) *"}
                </label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required={!editingUser}
                    minLength={8}
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder={
                      editingUser
                        ? "Ketik password baru minimal 8 karakter untuk mereset..."
                        : "Minimal 8 karakter"
                    }
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              {editingUser && (
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncCertificates}
                    onChange={(e) => setSyncCertificates(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-[11px] text-slate-700 leading-relaxed">
                    <strong>Sinkronkan ke E-Sertifikat & Sesi Ujian:</strong> Perbarui juga nama peserta dan nomor identitas (NIM/NIK) pada riwayat ujian serta sertifikat yang sudah terbit untuk akun ini.
                  </span>
                </label>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50"
                >
                  {isSavingUser ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{isSavingUser ? "Menyimpan..." : "Simpan Data Peserta"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE / EDIT ADMIN USER */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingAdmin ? "Ubah Akun Administrator" : "Tambah Administrator Baru"}
                </h3>
                <p className="text-xs text-slate-500">
                  Akun Admin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAdminModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {adminModalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{adminModalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Pengawas / Admin *
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Contoh: Pengawas Utama"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username Login *
                </label>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Contoh: admin_proktor"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Administrator (Opsional)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="Contoh: proktor@lembaga.ac.id"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[10.5px] text-slate-500 mt-1">
                  Bisa digunakan sebagai identitas login alternatif ke portal admin.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {editingAdmin
                    ? "Password Baru (Kosongkan jika tidak ingin mengganti)"
                    : "Password Login (Minimal 8 Karakter) *"}
                </label>
                <input
                  type="password"
                  required={!editingAdmin}
                  minLength={8}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder={
                    editingAdmin
                      ? "Isi hanya jika ingin mengganti password..."
                      : "Minimal 8 karakter"
                  }
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingAdmin}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50"
                >
                  {isSavingAdmin ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{isSavingAdmin ? "Menyimpan..." : "Simpan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
