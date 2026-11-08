import React, { createElement, use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { AlertCircle, AlertTriangle, ArrowLeft, ArrowRight, Award, Banknote, BookOpen, Bookmark, Building2, Calendar, Check, CheckCircle, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock, Copy, CreditCard, Download, Edit, ExternalLink, Eye, EyeOff, FileCheck, FileEdit, FileSpreadsheet, FileText, Globe, Grid, Hash, Headphones, HelpCircle, Image, Info, Key, Layers, Loader2, Lock, LogIn, LogOut, Mail, Maximize, Menu, MessageSquare, Minimize, PenTool, Phone, PhoneCall, Play, Plus, Printer, Radio, Receipt, RotateCcw, Save, Scissors, Search, SearchX, Settings, ShieldAlert, ShieldCheck, Sparkles, Square, Ticket, Trash2, Upload, User, UserCheck, UserPlus, Users, Volume2, VolumeX, X, XCircle } from "lucide-react";
import { create } from "zustand";
import { createInertiaApp } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import { renderToString } from "react-dom/server";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region resources/js/lib/api.js
async function apiFetch(input, options = {}) {
	const meta = document.querySelector("meta[name=\"csrf-token\"]");
	const headers = new Headers(options.headers || {});
	headers.set("Accept", "application/json");
	headers.set("X-Requested-With", "XMLHttpRequest");
	if (meta?.content) headers.set("X-CSRF-TOKEN", meta.content);
	if (options.body && !(options.body instanceof FormData) && typeof options.body !== "string") {
		headers.set("Content-Type", "application/json");
		options = {
			...options,
			body: JSON.stringify(options.body)
		};
	}
	return fetch(input, {
		...options,
		headers,
		credentials: "same-origin"
	});
}
function appUrl(path = "") {
	if (/^(https?:)?\/\//i.test(path)) {
		try {
			const parsed = new URL(path, window.location.origin);
			if (parsed.pathname.startsWith("/storage/")) return new URL(`${parsed.pathname}${parsed.search}${parsed.hash}`, window.location.origin).toString();
		} catch {}
		return path;
	}
	return new URL(path, window.location.origin).toString();
}
//#endregion
//#region resources/js/lib/next-navigation.jsx
function useRouter() {
	return useMemo(() => ({
		push: (url) => window.location.assign(url),
		replace: (url) => window.location.replace(url),
		back: () => window.history.back(),
		refresh: () => window.location.reload()
	}), []);
}
function useParams() {
	const parts = window.location.pathname.split("/").filter(Boolean);
	return useMemo(() => {
		if (parts[0] === "exam") return { sessionId: parts[1] };
		if (parts[0] === "result") return { sessionId: parts[1] };
		if (parts[0] === "demo" && parts[1] === "result") return { demoId: parts[2] };
		if (parts[0] === "demo") return { demoId: parts[1] };
		if (parts[0] === "certificate" || parts[0] === "verify") return { verificationCode: parts[1] };
		if (parts[0] === "admin" && parts[1] === "packages") return { packageId: parts[2] };
		return {};
	}, [parts.join("/")]);
}
function useSearchParams() {
	return useMemo(() => new URLSearchParams(window.location.search), []);
}
//#endregion
//#region resources/js/lib/next-link.jsx
function Link({ href, children, ...props }) {
	return /* @__PURE__ */ jsx("a", {
		href: typeof href === "string" ? href : href?.pathname || "#",
		...props,
		children
	});
}
//#endregion
//#region resources/js/components/PackagePreviewModal.tsx
var PackagePreviewModal = ({ isOpen, onClose, report, packageData, onConfirmSave }) => {
	const [activeTab, setActiveTab] = useState("summary");
	const [isSaving, setIsSaving] = useState(false);
	if (!isOpen || !report || !packageData) return null;
	const listeningQuestions = packageData.sections?.find((s) => s.sectionType === "LISTENING")?.questions || [];
	const structureQuestions = packageData.sections?.find((s) => s.sectionType === "STRUCTURE")?.questions || [];
	const readingQuestions = packageData.sections?.find((s) => s.sectionType === "READING")?.questions || [];
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
	return /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150",
		children: /* @__PURE__ */ jsxs("div", {
			className: "bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between border-b border-slate-200 pb-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ jsx("div", {
							className: "w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold",
							children: /* @__PURE__ */ jsx(FileSpreadsheet, { className: "w-5 h-5" })
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
							className: "text-lg font-bold text-slate-900 leading-none",
							children: "Pratinjau & Validasi Paket Soal"
						}), /* @__PURE__ */ jsxs("p", {
							className: "text-xs text-slate-500 mt-1",
							children: [
								packageData.title,
								" • Kode: ",
								/* @__PURE__ */ jsx("strong", {
									className: "font-mono text-blue-700",
									children: packageData.code
								})
							]
						})] })]
					}), /* @__PURE__ */ jsx("button", {
						onClick: onClose,
						className: "text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition",
						children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2 border-b border-slate-100 pt-3 pb-1 text-xs font-bold",
					children: [
						/* @__PURE__ */ jsxs("button", {
							onClick: () => setActiveTab("summary"),
							className: `py-2 px-3 rounded-lg transition ${activeTab === "summary" ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-slate-500 hover:text-slate-800"}`,
							children: [
								"Ringkasan Integritas (",
								report.totalQuestions,
								" Soal)"
							]
						}),
						/* @__PURE__ */ jsxs("button", {
							onClick: () => setActiveTab("listening"),
							className: `py-2 px-3 rounded-lg transition ${activeTab === "listening" ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-slate-500 hover:text-slate-800"}`,
							children: [
								"Listening (",
								listeningQuestions.length,
								")"
							]
						}),
						/* @__PURE__ */ jsxs("button", {
							onClick: () => setActiveTab("structure"),
							className: `py-2 px-3 rounded-lg transition ${activeTab === "structure" ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-slate-500 hover:text-slate-800"}`,
							children: [
								"Structure (",
								structureQuestions.length,
								")"
							]
						}),
						/* @__PURE__ */ jsxs("button", {
							onClick: () => setActiveTab("reading"),
							className: `py-2 px-3 rounded-lg transition ${activeTab === "reading" ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-slate-500 hover:text-slate-800"}`,
							children: [
								"Reading (",
								readingQuestions.length,
								")"
							]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex-1 overflow-y-auto py-5 space-y-5",
					children: [activeTab === "summary" && /* @__PURE__ */ jsxs("div", {
						className: "space-y-5",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-1 sm:grid-cols-3 gap-3",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3",
										children: [/* @__PURE__ */ jsx(Headphones, { className: "w-5 h-5 text-blue-600" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
											className: "text-[11px] font-semibold text-slate-500 uppercase tracking-wider block",
											children: "Section 1: Listening"
										}), /* @__PURE__ */ jsxs("span", {
											className: "text-lg font-bold text-slate-900 font-mono",
											children: [report.listeningCount, " / 50 Soal"]
										})] })]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3",
										children: [/* @__PURE__ */ jsx(BookOpen, { className: "w-5 h-5 text-indigo-600" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
											className: "text-[11px] font-semibold text-slate-500 uppercase tracking-wider block",
											children: "Section 2: Structure"
										}), /* @__PURE__ */ jsxs("span", {
											className: "text-lg font-bold text-slate-900 font-mono",
											children: [report.structureCount, " / 40 Soal"]
										})] })]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3",
										children: [/* @__PURE__ */ jsx(FileText, { className: "w-5 h-5 text-emerald-600" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
											className: "text-[11px] font-semibold text-slate-500 uppercase tracking-wider block",
											children: "Section 3: Reading"
										}), /* @__PURE__ */ jsxs("span", {
											className: "text-lg font-bold text-slate-900 font-mono",
											children: [report.readingCount, " / 50 Soal"]
										})] })]
									})
								]
							}),
							report.isValid ? /* @__PURE__ */ jsxs("div", {
								className: "p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-900",
								children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "w-5 h-5 text-emerald-600 shrink-0 mt-0.5" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h4", {
									className: "text-sm font-bold",
									children: "Validasi Berhasil: Struktur File Sesuai Standar!"
								}), /* @__PURE__ */ jsx("p", {
									className: "text-xs text-emerald-800 mt-0.5",
									children: "Seluruh kunci jawaban valid (A, B, C, atau D) dan format soal siap disimpan ke database bank soal."
								})] })]
							}) : /* @__PURE__ */ jsxs("div", {
								className: "p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-900",
								children: [/* @__PURE__ */ jsx(AlertCircle, { className: "w-5 h-5 text-rose-600 shrink-0 mt-0.5" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h4", {
									className: "text-sm font-bold",
									children: "Ditemukan Kesalahan Format / Kunci Jawaban"
								}), /* @__PURE__ */ jsx("p", {
									className: "text-xs text-rose-800 mt-0.5",
									children: "Harap perbaiki kesalahan di bawah ini pada file Anda sebelum menyimpan ke database."
								})] })]
							}),
							errorIssues.length > 0 && /* @__PURE__ */ jsxs("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ jsxs("span", {
									className: "text-xs font-bold text-rose-700 uppercase tracking-wider block",
									children: [
										"Daftar Kesalahan Fatal (",
										errorIssues.length,
										"):"
									]
								}), /* @__PURE__ */ jsx("div", {
									className: "bg-rose-50/50 border border-rose-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-1.5 text-xs",
									children: errorIssues.map((err, idx) => /* @__PURE__ */ jsxs("div", {
										className: "flex items-start gap-2 text-rose-800",
										children: [/* @__PURE__ */ jsx(AlertCircle, { className: "w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" }), /* @__PURE__ */ jsxs("span", { children: [
											"[",
											err.section,
											" ",
											err.questionNumber ? `No. ${err.questionNumber}` : "",
											"]: ",
											err.message
										] })]
									}, idx))
								})]
							}),
							warningIssues.length > 0 && /* @__PURE__ */ jsxs("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ jsxs("span", {
									className: "text-xs font-bold text-amber-800 uppercase tracking-wider block",
									children: [
										"Peringatan (",
										warningIssues.length,
										"):"
									]
								}), /* @__PURE__ */ jsx("div", {
									className: "bg-amber-50/60 border border-amber-200 rounded-xl p-3 max-h-36 overflow-y-auto space-y-1 text-xs",
									children: warningIssues.map((warn, idx) => /* @__PURE__ */ jsxs("div", {
										className: "flex items-start gap-2 text-amber-900",
										children: [/* @__PURE__ */ jsx(AlertTriangle, { className: "w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" }), /* @__PURE__ */ jsxs("span", { children: [
											"[",
											warn.section,
											"]: ",
											warn.message
										] })]
									}, idx))
								})]
							})
						]
					}), activeTab !== "summary" && /* @__PURE__ */ jsx("div", {
						className: "space-y-3",
						children: (activeTab === "listening" ? listeningQuestions : activeTab === "structure" ? structureQuestions : readingQuestions).map((q) => /* @__PURE__ */ jsxs("div", {
							className: "p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ jsxs("span", {
										className: "font-bold text-slate-800",
										children: [
											"Soal No. ",
											q.questionNumber,
											" (",
											q.partType || "STANDARD",
											")"
										]
									}), /* @__PURE__ */ jsxs("span", {
										className: "px-2 py-0.5 rounded bg-blue-100 font-bold text-blue-800",
										children: ["Kunci: ", q.correctAnswer]
									})]
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-slate-700 font-serif line-clamp-2",
									children: q.questionText
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-2 text-slate-600 pt-1",
									children: [
										/* @__PURE__ */ jsxs("span", { children: ["A: ", q.optionA] }),
										/* @__PURE__ */ jsxs("span", { children: ["B: ", q.optionB] }),
										/* @__PURE__ */ jsxs("span", { children: ["C: ", q.optionC] }),
										/* @__PURE__ */ jsxs("span", { children: ["D: ", q.optionD] })
									]
								})
							]
						}, q.questionNumber))
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "border-t border-slate-200 pt-4 flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ jsx("button", {
						onClick: onClose,
						className: "px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition",
						children: "Batal"
					}), /* @__PURE__ */ jsx("button", {
						onClick: handleSave,
						disabled: !report.isValid || isSaving,
						className: "px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 disabled:opacity-50",
						children: isSaving ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }), /* @__PURE__ */ jsx("span", { children: "Menyimpan ke Database..." })] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("span", { children: [
							"Simpan ",
							report.totalQuestions,
							" Soal ke Database"
						] }), /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })] })
					})]
				})
			]
		})
	});
};
//#endregion
//#region resources/js/components/AdminInstitutionSettings.tsx
var DEFAULT_SETTINGS = {
	INSTITUTION_NAME: "Lembaga Bahasa & Sertifikasi Internasional",
	INSTITUTION_SUBTITLE: "Center for Language Testing and Certification",
	INSTITUTION_ADDRESS: "Gedung Pusat Bahasa Lt. 2, Kampus Terpadu",
	INSTITUTION_CONTACT: "Telp: (021) 7890123 • Email: toefl@lembagabahasa.ac.id",
	INSTITUTION_CITY: "Jakarta",
	INSTITUTION_LOGO_URL: "/branding/institution-logo.svg",
	DIRECTOR_NAME: "Prof. Dr. H. Soedirman, M.Pd.",
	DIRECTOR_TITLE: "Academic Director of Certification",
	DIRECTOR_SIGNATURE_URL: "/branding/director-signature.svg",
	INSTITUTION_STAMP_URL: "/branding/institution-stamp.svg"
};
var AdminInstitutionSettings = ({ operatingMode, onUpdateOperatingMode, isUpdatingMode, onLogoChange }) => {
	const [subTab, setSubTab] = useState("profile");
	const [settings, setSettings] = useState(DEFAULT_SETTINGS);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [uploadingType, setUploadingType] = useState(null);
	const logoInputRef = useRef(null);
	const sigInputRef = useRef(null);
	const stampInputRef = useRef(null);
	useEffect(() => {
		async function loadSettings() {
			try {
				setIsLoading(true);
				const json = await (await apiFetch("/api/admin/settings/institution")).json();
				if (json.settings) setSettings(json.settings);
			} catch (err) {
				console.error("Failed to load settings:", err);
			} finally {
				setIsLoading(false);
			}
		}
		loadSettings();
	}, []);
	const handleSave = async (e) => {
		if (e) e.preventDefault();
		try {
			setIsSaving(true);
			setSaveSuccess(false);
			if ((await (await apiFetch("/api/admin/settings/institution", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(settings)
			})).json()).success) {
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
	const handleFileUpload = async (file, type) => {
		try {
			setUploadingType(type);
			const formData = new FormData();
			formData.append("file", file);
			formData.append("type", type);
			const json = await (await apiFetch("/api/admin/settings/upload", {
				method: "POST",
				body: formData
			})).json();
			if (json.url) {
				if (type === "logo") {
					setSettings((prev) => ({
						...prev,
						INSTITUTION_LOGO_URL: json.url
					}));
					onLogoChange?.(json.url);
					window.dispatchEvent(new CustomEvent("institution-logo-updated", { detail: { url: json.url } }));
				} else if (type === "signature") setSettings((prev) => ({
					...prev,
					DIRECTOR_SIGNATURE_URL: json.url
				}));
				else if (type === "stamp") setSettings((prev) => ({
					...prev,
					INSTITUTION_STAMP_URL: json.url
				}));
			}
		} catch (err) {
			console.error("Upload error:", err);
			alert("Gagal mengunggah gambar.");
		} finally {
			setUploadingType(null);
		}
	};
	if (isLoading) return /* @__PURE__ */ jsxs("div", {
		className: "bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 text-xs",
		children: [/* @__PURE__ */ jsx(Loader2, { className: "w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" }), /* @__PURE__ */ jsx("span", { children: "Memuat pengaturan institusi..." })]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-5xl mx-auto space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "bg-white rounded-2xl border border-slate-200 p-1.5 flex flex-wrap gap-1 shadow-xs",
				children: [
					/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => setSubTab("profile"),
						className: `flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${subTab === "profile" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`,
						children: [/* @__PURE__ */ jsx(Building2, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Profil & Logo Institusi" })]
					}),
					/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => setSubTab("signature"),
						className: `flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${subTab === "signature" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`,
						children: [/* @__PURE__ */ jsx(PenTool, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Penandatangan & Stempel Sertifikat" })]
					}),
					/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => setSubTab("mode"),
						className: `flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${subTab === "mode" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`,
						children: [/* @__PURE__ */ jsx(Globe, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Mode Operasional Sistem" })]
					})
				]
			}),
			saveSuccess && /* @__PURE__ */ jsxs("div", {
				className: "bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl text-xs flex items-center gap-2.5 shadow-xs animate-in fade-in",
				children: [/* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-emerald-600 shrink-0" }), /* @__PURE__ */ jsx("span", {
					className: "font-semibold",
					children: "Perubahan identitas dan pengaturan sertifikat berhasil disimpan! Dokumen cetak sertifikat kini menggunakan data terbaru."
				})]
			}),
			subTab === "profile" && /* @__PURE__ */ jsxs("div", {
				className: "bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "border-b border-slate-100 pb-4",
					children: [/* @__PURE__ */ jsxs("h3", {
						className: "text-base font-bold text-slate-900 flex items-center gap-2",
						children: [/* @__PURE__ */ jsx(Building2, { className: "w-5 h-5 text-blue-600" }), /* @__PURE__ */ jsx("span", { children: "Identitas Resmi Lembaga Penguji" })]
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-slate-500 mt-0.5",
						children: "Informasi ini akan tercetak pada kop sertifikat digital dan tampilan verifikasi publik."
					})]
				}), /* @__PURE__ */ jsxs("form", {
					onSubmit: handleSave,
					className: "space-y-5",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5",
							children: [/* @__PURE__ */ jsx("div", {
								className: "w-24 h-24 rounded-2xl bg-white border border-slate-300 flex items-center justify-center p-2 shadow-xs shrink-0 relative overflow-hidden",
								children: /* @__PURE__ */ jsx("img", {
									src: appUrl(settings.INSTITUTION_LOGO_URL || "/branding/institution-logo.svg"),
									alt: "Logo Preview",
									className: "w-full h-full object-contain"
								})
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex-1 text-center sm:text-left space-y-2",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "text-xs font-bold text-slate-800 block",
										children: "Logo Lambang Institusi (Emblem)"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-[11px] text-slate-500",
										children: "Format gambar transparan disarankan (PNG atau SVG). Ukuran ideal 200x200 piksel."
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-1",
										children: [
											/* @__PURE__ */ jsx("input", {
												ref: logoInputRef,
												type: "file",
												accept: "image/png,image/jpeg,image/svg+xml,image/webp",
												className: "hidden",
												onChange: (e) => {
													const file = e.target.files?.[0];
													if (file) handleFileUpload(file, "logo");
												}
											}),
											/* @__PURE__ */ jsxs("button", {
												type: "button",
												onClick: () => logoInputRef.current?.click(),
												disabled: uploadingType === "logo",
												className: "inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition border border-blue-200",
												children: [/* @__PURE__ */ jsx(Upload, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: uploadingType === "logo" ? "Mengunggah..." : "Unggah Logo Baru" })]
											}),
											/* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => {
													const logoUrl = "/branding/institution-logo.svg";
													setSettings((prev) => ({
														...prev,
														INSTITUTION_LOGO_URL: logoUrl
													}));
													onLogoChange?.(logoUrl);
													window.dispatchEvent(new CustomEvent("institution-logo-updated", { detail: { url: logoUrl } }));
												},
												className: "px-3 py-1.5 bg-slate-200/60 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition",
												children: "Pakai Logo Standar"
											})
										]
									})
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "space-y-1 sm:col-span-2",
									children: [/* @__PURE__ */ jsx("label", {
										className: "text-xs font-bold text-slate-800",
										children: "Nama Lembaga / Pusat Bahasa (Baris Utama)"
									}), /* @__PURE__ */ jsx("input", {
										type: "text",
										required: true,
										value: settings.INSTITUTION_NAME,
										onChange: (e) => setSettings((prev) => ({
											...prev,
											INSTITUTION_NAME: e.target.value
										})),
										placeholder: "Contoh: Lembaga Bahasa & Sertifikasi Internasional",
										className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "space-y-1 sm:col-span-2",
									children: [/* @__PURE__ */ jsx("label", {
										className: "text-xs font-bold text-slate-800",
										children: "Sub-judul Lembaga (Baris Kedua)"
									}), /* @__PURE__ */ jsx("input", {
										type: "text",
										value: settings.INSTITUTION_SUBTITLE,
										onChange: (e) => setSettings((prev) => ({
											...prev,
											INSTITUTION_SUBTITLE: e.target.value
										})),
										placeholder: "Contoh: Center for Language Testing and Certification",
										className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ jsx("label", {
										className: "text-xs font-bold text-slate-800",
										children: "Kota Penerbitan Sertifikat"
									}), /* @__PURE__ */ jsx("input", {
										type: "text",
										required: true,
										value: settings.INSTITUTION_CITY,
										onChange: (e) => setSettings((prev) => ({
											...prev,
											INSTITUTION_CITY: e.target.value
										})),
										placeholder: "Contoh: Jakarta, Surabaya, Bandung",
										className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ jsx("label", {
										className: "text-xs font-bold text-slate-800",
										children: "Kontak Layanan / Email"
									}), /* @__PURE__ */ jsx("input", {
										type: "text",
										value: settings.INSTITUTION_CONTACT,
										onChange: (e) => setSettings((prev) => ({
											...prev,
											INSTITUTION_CONTACT: e.target.value
										})),
										placeholder: "Contoh: toefl@lembagabahasa.ac.id | (021) 7890123",
										className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "space-y-1 sm:col-span-2",
									children: [/* @__PURE__ */ jsx("label", {
										className: "text-xs font-bold text-slate-800",
										children: "Alamat Kantor Institusi"
									}), /* @__PURE__ */ jsx("input", {
										type: "text",
										value: settings.INSTITUTION_ADDRESS,
										onChange: (e) => setSettings((prev) => ({
											...prev,
											INSTITUTION_ADDRESS: e.target.value
										})),
										placeholder: "Contoh: Gedung Rektorat Lt. 2, Kampus Terpadu, Jl. Utama No. 10",
										className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
									})]
								})
							]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "pt-4 border-t border-slate-100 flex justify-end",
							children: /* @__PURE__ */ jsxs("button", {
								type: "submit",
								disabled: isSaving,
								className: "inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50",
								children: [/* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: isSaving ? "Menyimpan..." : "Simpan Profil Lembaga" })]
							})
						})
					]
				})]
			}),
			subTab === "signature" && /* @__PURE__ */ jsxs("div", {
				className: "bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "border-b border-slate-100 pb-4",
					children: [/* @__PURE__ */ jsxs("h3", {
						className: "text-base font-bold text-slate-900 flex items-center gap-2",
						children: [/* @__PURE__ */ jsx(PenTool, { className: "w-5 h-5 text-blue-600" }), /* @__PURE__ */ jsx("span", { children: "Pejabat Penandatangan & Stempel Dinas Sertifikat" })]
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-slate-500 mt-0.5",
						children: "Atur tanda tangan digital direktur dan stempel resmi yang akan di-overlay secara realistis pada sertifikat."
					})]
				}), /* @__PURE__ */ jsxs("form", {
					onSubmit: handleSave,
					className: "space-y-6",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ jsx("label", {
									className: "text-xs font-bold text-slate-800",
									children: "Nama Lengkap Pejabat Penandatangan"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									required: true,
									value: settings.DIRECTOR_NAME,
									onChange: (e) => setSettings((prev) => ({
										...prev,
										DIRECTOR_NAME: e.target.value
									})),
									placeholder: "Contoh: Prof. Dr. H. Soedirman, M.Pd.",
									className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-serif"
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ jsx("label", {
									className: "text-xs font-bold text-slate-800",
									children: "Jabatan Resmi Pejabat"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									required: true,
									value: settings.DIRECTOR_TITLE,
									onChange: (e) => setSettings((prev) => ({
										...prev,
										DIRECTOR_TITLE: e.target.value
									})),
									placeholder: "Contoh: Academic Director of Certification",
									className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
								})]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-xs font-bold text-slate-800",
											children: "Tanda Tangan Digital Direktur"
										}), /* @__PURE__ */ jsx("span", {
											className: "text-[10px] text-slate-400 font-mono",
											children: "PNG / SVG"
										})]
									}),
									/* @__PURE__ */ jsx("div", {
										className: "h-20 bg-white border border-slate-200 rounded-xl p-2 flex items-center justify-center relative overflow-hidden",
										children: /* @__PURE__ */ jsx("img", {
											src: appUrl(settings.DIRECTOR_SIGNATURE_URL || "/branding/director-signature.svg"),
											alt: "Signature",
											className: "max-h-full object-contain"
										})
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2",
										children: [
											/* @__PURE__ */ jsx("input", {
												ref: sigInputRef,
												type: "file",
												accept: "image/png,image/svg+xml",
												className: "hidden",
												onChange: (e) => {
													const file = e.target.files?.[0];
													if (file) handleFileUpload(file, "signature");
												}
											}),
											/* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => sigInputRef.current?.click(),
												disabled: uploadingType === "signature",
												className: "flex-1 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs transition border border-blue-200 text-center",
												children: uploadingType === "signature" ? "Mengunggah..." : "Ganti Tanda Tangan"
											}),
											/* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => setSettings((prev) => ({
													...prev,
													DIRECTOR_SIGNATURE_URL: "/branding/director-signature.svg"
												})),
												className: "py-1.5 px-3 bg-slate-200/60 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition",
												children: "Default"
											})
										]
									})
								]
							}), /* @__PURE__ */ jsxs("div", {
								className: "p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-xs font-bold text-slate-800",
											children: "Stempel Resmi Dinas (Cap)"
										}), /* @__PURE__ */ jsx("span", {
											className: "text-[10px] text-slate-400 font-mono",
											children: "PNG / SVG"
										})]
									}),
									/* @__PURE__ */ jsx("div", {
										className: "h-20 bg-white border border-slate-200 rounded-xl p-2 flex items-center justify-center relative overflow-hidden",
										children: /* @__PURE__ */ jsx("img", {
											src: appUrl(settings.INSTITUTION_STAMP_URL || "/branding/institution-stamp.svg"),
											alt: "Stamp",
											className: "max-h-full object-contain"
										})
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2",
										children: [
											/* @__PURE__ */ jsx("input", {
												ref: stampInputRef,
												type: "file",
												accept: "image/png,image/svg+xml",
												className: "hidden",
												onChange: (e) => {
													const file = e.target.files?.[0];
													if (file) handleFileUpload(file, "stamp");
												}
											}),
											/* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => stampInputRef.current?.click(),
												disabled: uploadingType === "stamp",
												className: "flex-1 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition border border-indigo-200 text-center",
												children: uploadingType === "stamp" ? "Mengunggah..." : "Ganti Stempel"
											}),
											/* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => setSettings((prev) => ({
													...prev,
													INSTITUTION_STAMP_URL: "/branding/institution-stamp.svg"
												})),
												className: "py-1.5 px-3 bg-slate-200/60 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition",
												children: "Default"
											})
										]
									})
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "bg-[#fffdfa] border-2 border-dashed border-amber-300 p-6 rounded-2xl text-center space-y-2",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-[11px] font-bold text-amber-800 uppercase tracking-wider block",
								children: "Simulasi Live Tampilan Tanda Tangan & Stempel di Sertifikat:"
							}), /* @__PURE__ */ jsxs("div", {
								className: "inline-block text-center relative min-w-[220px] pt-3",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "text-xs text-slate-600 mb-1",
										children: [
											settings.INSTITUTION_CITY || "Jakarta",
											",",
											" ",
											(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
												month: "long",
												day: "numeric",
												year: "numeric"
											})
										]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "relative h-20 w-52 mx-auto flex items-center justify-center my-1",
										children: [/* @__PURE__ */ jsx("img", {
											src: appUrl(settings.DIRECTOR_SIGNATURE_URL || "/branding/director-signature.svg"),
											alt: "Signature Preview",
											className: "h-16 w-auto max-w-[180px] object-contain relative z-10 filter drop-shadow-xs"
										}), /* @__PURE__ */ jsx("img", {
											src: appUrl(settings.INSTITUTION_STAMP_URL || "/branding/institution-stamp.svg"),
											alt: "Stamp Preview",
											className: "absolute -left-3 -top-2 w-24 h-24 object-contain opacity-85 pointer-events-none mix-blend-multiply z-20"
										})]
									}),
									/* @__PURE__ */ jsx("div", {
										className: "font-serif text-sm font-bold text-slate-900 border-b-2 border-slate-700 pb-0.5 px-4 mt-1",
										children: settings.DIRECTOR_NAME || "Prof. Dr. H. Soedirman, M.Pd."
									}),
									/* @__PURE__ */ jsx("div", {
										className: "text-[10px] font-semibold text-slate-600 uppercase tracking-wider mt-0.5",
										children: settings.DIRECTOR_TITLE || "Academic Director of Certification"
									})
								]
							})]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "pt-4 border-t border-slate-100 flex justify-end",
							children: /* @__PURE__ */ jsxs("button", {
								type: "submit",
								disabled: isSaving,
								className: "inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50",
								children: [/* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: isSaving ? "Menyimpan..." : "Simpan Tanda Tangan & Stempel" })]
							})
						})
					]
				})]
			}),
			subTab === "mode" && /* @__PURE__ */ jsxs("div", {
				className: "bg-white rounded-3xl border border-slate-200 p-8 shadow-xs",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "border-b border-slate-100 pb-5 mb-6",
						children: /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("div", {
								className: "w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold",
								children: /* @__PURE__ */ jsx(Globe, { className: "w-5 h-5" })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
								className: "text-lg font-bold text-slate-900",
								children: "Konfigurasi Mode Operasional Sistem"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-xs text-slate-500 mt-0.5",
								children: "Tentukan alur pendaftaran peserta dan antarmuka beranda platform Anda."
							})] })]
						})
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 md:grid-cols-2 gap-5 mb-8",
						children: [/* @__PURE__ */ jsxs("div", {
							onClick: () => onUpdateOperatingMode("INSTITUTION"),
							className: `p-6 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${operatingMode === "INSTITUTION" ? "border-blue-600 bg-blue-50/40 shadow-xs" : "border-slate-200 hover:border-slate-300 bg-white"}`,
							children: [/* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between mb-3",
									children: [/* @__PURE__ */ jsx("span", {
										className: "font-bold text-slate-900 text-sm",
										children: "Mode Institusi / Kampus (B2B)"
									}), operatingMode === "INSTITUTION" && /* @__PURE__ */ jsx("span", {
										className: "text-[10px] font-bold bg-blue-600 text-white px-2.5 py-0.5 rounded-full",
										children: "Aktif Sekarang"
									})]
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "text-xs text-slate-600 leading-relaxed mb-4",
									children: [
										"Peserta ujian langsung masuk menggunakan ",
										/* @__PURE__ */ jsx("strong", { children: "Token Sesi" }),
										" yang dibagikan oleh panitia tanpa perlu membuat akun atau login."
									]
								}),
								/* @__PURE__ */ jsxs("ul", {
									className: "text-[11px] text-slate-500 space-y-1.5 border-t border-slate-200/60 pt-3",
									children: [
										/* @__PURE__ */ jsx("li", { children: "✓ Nol friksi, akses cepat di hari-H ujian" }),
										/* @__PURE__ */ jsx("li", { children: "✓ Ideal untuk seleksi CPNS/BUMN & ujian massal kampus" }),
										/* @__PURE__ */ jsx("li", { children: "✓ Kontrol token terpusat di dashboard admin" })
									]
								})
							] }), /* @__PURE__ */ jsx("button", {
								type: "button",
								disabled: isUpdatingMode || operatingMode === "INSTITUTION",
								className: `mt-5 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition ${operatingMode === "INSTITUTION" ? "bg-blue-600 text-white cursor-default" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`,
								children: operatingMode === "INSTITUTION" ? "Sedang Digunakan" : "Pilih Mode Institusi"
							})]
						}), /* @__PURE__ */ jsxs("div", {
							onClick: () => onUpdateOperatingMode("COMMERCIAL"),
							className: `p-6 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${operatingMode === "COMMERCIAL" ? "border-blue-600 bg-blue-50/40 shadow-xs" : "border-slate-200 hover:border-slate-300 bg-white"}`,
							children: [/* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between mb-3",
									children: [/* @__PURE__ */ jsx("span", {
										className: "font-bold text-slate-900 text-sm",
										children: "Mode Komersial Terbuka (B2C)"
									}), operatingMode === "COMMERCIAL" && /* @__PURE__ */ jsx("span", {
										className: "text-[10px] font-bold bg-blue-600 text-white px-2.5 py-0.5 rounded-full",
										children: "Aktif Sekarang"
									})]
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "text-xs text-slate-600 leading-relaxed mb-4",
									children: [
										"Portal publik dengan ",
										/* @__PURE__ */ jsx("strong", { children: "registrasi mandiri peserta" }),
										", login akun siswa, verifikasi pembayaran struk transfer bank/loket, dan sertifikat otomatis."
									]
								}),
								/* @__PURE__ */ jsxs("ul", {
									className: "text-[11px] text-slate-500 space-y-1.5 border-t border-slate-200/60 pt-3",
									children: [
										/* @__PURE__ */ jsx("li", { children: "✓ Registrasi akun resmi (Nama, NIK, WhatsApp)" }),
										/* @__PURE__ */ jsx("li", { children: "✓ Pembayaran transfer bank / loket verifikasi admin" }),
										/* @__PURE__ */ jsx("li", { children: "✓ Dashboard siswa untuk tes & unduh sertifikat" })
									]
								})
							] }), /* @__PURE__ */ jsx("button", {
								type: "button",
								disabled: isUpdatingMode || operatingMode === "COMMERCIAL",
								className: `mt-5 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition ${operatingMode === "COMMERCIAL" ? "bg-blue-600 text-white cursor-default" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`,
								children: operatingMode === "COMMERCIAL" ? "Sedang Digunakan" : "Pilih Mode Komersial"
							})]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex items-start gap-3",
						children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "w-5 h-5 text-blue-600 shrink-0 mt-0.5" }), /* @__PURE__ */ jsxs("p", {
							className: "leading-relaxed",
							children: [/* @__PURE__ */ jsx("strong", { children: "Catatan Arsitektur:" }), " Mengubah mode operasional tidak akan menghapus data soal, sesi ujian, maupun hasil skor yang sudah ada di database. Sistem mesin ujian (listening, scoring, dan lockdown) akan tetap bekerja identik di kedua mode."]
						})]
					})
				]
			})
		]
	});
};
//#endregion
//#region resources/js/lib/notifications.ts
/**
* Notification Service for WhatsApp & Email
*/
function cleanPhoneNumber(phone) {
	if (!phone) return "";
	let digits = phone.replace(/\D/g, "");
	if (digits.startsWith("0")) digits = "62" + digits.slice(1);
	else if (digits.startsWith("8")) digits = "62" + digits;
	return digits;
}
function buildPaymentConfirmedWaUrl(params) {
	const phone = cleanPhoneNumber(params.phoneNumber);
	const inst = params.institutionName || "Lembaga Bahasa & Sertifikasi Internasional";
	const message = `Halo Sdr/i *${params.studentName}*,

Pembayaran pendaftaran ujian TOEFL ITP Anda telah *BERHASIL DIVERIFIKASI* dan tiket ujian Anda telah *AKTIF*.

📋 *Rincian Tiket Ujian:*
• No. Registrasi: *${params.regNumber}*
• Jadwal Sesi: *${params.scheduleTitle}*
• Tanggal / Waktu: *${params.examDate}*

🔗 *Akses Masuk Ruang Ujian:*
${params.startExamUrl}

💡 *Petunjuk Ujian:*
1. Pastikan perangkat komputer/laptop Anda memiliki koneksi internet stabil.
2. Siapkan earphone/headphone untuk sesi Listening Comprehension.
3. Masuk ke ruang ujian 10 menit sebelum jadwal dimulai.

Salam hangat dan sukses,
*${inst}*`;
	return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
function buildCertificateReadyWaUrl(params) {
	const phone = cleanPhoneNumber(params.phoneNumber);
	const inst = params.institutionName || "Lembaga Bahasa & Sertifikasi Internasional";
	const message = `Selamat Sdr/i *${params.studentName}*! 🎉

Sertifikat Resmi *TOEFL ITP® Standard Assessment* Anda telah selesai diterbitkan oleh ${inst}.

📊 *Rekap Hasil Nilai Resmi:*
• Section 1 (Listening): *${params.listeningScore}*
• Section 2 (Structure): *${params.structureScore}*
• Section 3 (Reading): *${params.readingScore}*
⭐ *TOTAL SCALED SCORE: ${params.totalScore}* (CEFR: *${params.cefrLevel}*)

📜 *Identitas Sertifikat:*
• No. Seri: *${params.certNumber}*
• Tanggal Tes: *${params.testDate}*

📄 *Download Sertifikat Digital (PDF/Cetak):*
${params.certUrl}

🔍 *Link Verifikasi Keaslian Dokumen:*
${params.verifyUrl}

Semoga sertifikat ini bermanfaat untuk kelulusan studi, beasiswa, maupun promosi karir Anda!

Salam sukses selalu,
*${inst}*`;
	return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
function buildLeadGreetingWaUrl(params) {
	const phone = cleanPhoneNumber(params.phoneNumber);
	const inst = params.institutionName || "Lembaga Bahasa & Sertifikasi Internasional";
	const registerUrl = params.registerUrl || "https://toefl.testing.ac.id/student/dashboard";
	const scoreText = params.totalScore && params.totalScore > 0 ? `\n\n📊 *Hasil Simulasi Demo Anda:*\n• Prediksi Skor: *${params.totalScore}* (Skala 310–677)\n• Level CEFR: *${params.cefrLevel || "B1/B2"}*` : "";
	const message = `Halo Sdr/i *${params.leadName}*, 👋

Terima kasih telah mencoba simulasi demo ujian TOEFL ITP di platform kami.${scoreText}

Apakah Anda berencana mengikuti *Ujian TOEFL ITP Resmi Bersertifikat* untuk keperluan:
✅ Syarat kelulusan / sidang skripsi/tesis
✅ Persyaratan beasiswa LPDP / luar negeri
✅ Rekrutmen BUMN / CPNS / kenaikan karir

Kami memiliki jadwal sesi resmi terdekat yang dapat Anda ikuti secara daring. Sertifikat resmi dilengkapi stempel dinas dan QR Code validasi keaslian.

🔗 *Informasi & Pendaftaran Jadwal Resmi:*
${registerUrl}

Jika ada pertanyaan seputar format ujian, pembayaran, atau jadwal, jangan ragu untuk membalas pesan ini. Kami siap membantu! 😊

Salam sukses,
*Panitia Layanan TOEFL ITP - ${inst}*`;
	return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
//#endregion
//#region resources/js/Pages/Admin/Dashboard.tsx
var Dashboard_exports$1 = /* @__PURE__ */ __exportAll({ default: () => AdminPage });
function AdminPage() {
	const router = useRouter();
	const [adminUser, setAdminUser] = useState(null);
	const [activeTab, setActiveTab] = useState("results");
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
	const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
	const [isLoadingAuth, setIsLoadingAuth] = useState(true);
	const [institutionLogoUrl, setInstitutionLogoUrl] = useState("/branding/institution-logo.svg");
	const [leads, setLeads] = useState([]);
	const [leadSummary, setLeadSummary] = useState(null);
	const [isLoadingLeads, setIsLoadingLeads] = useState(false);
	const [leadSearch, setLeadSearch] = useState("");
	const [leadFilter, setLeadFilter] = useState("ALL");
	const [isDeletingLeadId, setIsDeletingLeadId] = useState(null);
	useEffect(() => {
		try {
			if (localStorage.getItem("admin_sidebar_collapsed") === "true") setIsDesktopCollapsed(true);
		} catch {}
	}, []);
	const toggleDesktopSidebar = () => {
		setIsDesktopCollapsed((prev) => {
			const next = !prev;
			try {
				localStorage.setItem("admin_sidebar_collapsed", String(next));
			} catch {}
			return next;
		});
	};
	const [operatingMode, setOperatingMode] = useState("INSTITUTION");
	const [isUpdatingMode, setIsUpdatingMode] = useState(false);
	const [payments, setPayments] = useState([]);
	const [paymentSummary, setPaymentSummary] = useState(null);
	const [isLoadingPayments, setIsLoadingPayments] = useState(false);
	const [paymentFilter, setPaymentFilter] = useState("ALL");
	const [paymentSearch, setPaymentSearch] = useState("");
	const [previewProofUrl, setPreviewProofUrl] = useState(null);
	const [previewPaymentItem, setPreviewPaymentItem] = useState(null);
	const [rejectTarget, setRejectTarget] = useState(null);
	const [rejectionReasonText, setRejectionReasonText] = useState("");
	const [isProcessingPayment, setIsProcessingPayment] = useState(false);
	const [schedules, setSchedules] = useState([]);
	const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
	const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
	const [showScheduleForm, setShowScheduleForm] = useState(false);
	const [newSchedTitle, setNewSchedTitle] = useState("");
	const [newSchedPkgId, setNewSchedPkgId] = useState("");
	const [newSchedStartTime, setNewSchedStartTime] = useState("");
	const [newSchedEndTime, setNewSchedEndTime] = useState("");
	const [newSchedQuota, setNewSchedQuota] = useState(50);
	const [newSchedPrice, setNewSchedPrice] = useState(0);
	const [certificates, setCertificates] = useState([]);
	const [isLoadingCertificates, setIsLoadingCertificates] = useState(false);
	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [packages, setPackages] = useState([]);
	const [isLoadingPackages, setIsLoadingPackages] = useState(false);
	const [newLabel, setNewLabel] = useState("");
	const [customCode, setCustomCode] = useState("");
	const [selectedPackageId, setSelectedPackageId] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [copiedToken, setCopiedToken] = useState(null);
	const fileInputRef = useRef(null);
	const [isImporting, setIsImporting] = useState(false);
	const [previewModalOpen, setPreviewModalOpen] = useState(false);
	const [validationReport, setValidationReport] = useState(null);
	const [pendingPackageData, setPendingPackageData] = useState(null);
	useEffect(() => {
		async function checkAuth() {
			try {
				const json = await (await apiFetch("/api/admin/auth/me")).json();
				if (!json.authenticated) router.push("/admin/login");
				else {
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
			setData(await (await apiFetch("/api/admin/sessions")).json());
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};
	const fetchPackages = async () => {
		try {
			setIsLoadingPackages(true);
			const json = await (await apiFetch("/api/admin/packages")).json();
			if (json.packages) {
				setPackages(json.packages);
				if (json.packages.length > 0 && !selectedPackageId) setSelectedPackageId(json.packages[0].id);
			}
		} catch (err) {
			console.error("Error fetching packages:", err);
		} finally {
			setIsLoadingPackages(false);
		}
	};
	const fetchSettings = async () => {
		try {
			const json = await (await apiFetch("/api/admin/settings")).json();
			if (json.operatingMode) setOperatingMode(json.operatingMode);
		} catch (err) {
			console.error("Error fetching settings:", err);
		}
	};
	const fetchInstitutionBranding = async () => {
		try {
			const logoUrl = (await (await apiFetch("/api/admin/settings/institution")).json()).settings?.INSTITUTION_LOGO_URL;
			if (logoUrl) setInstitutionLogoUrl(logoUrl);
		} catch (err) {
			console.error("Error fetching institution branding:", err);
		}
	};
	const handleUpdateOperatingMode = async (newMode) => {
		try {
			setIsUpdatingMode(true);
			const json = await (await apiFetch("/api/admin/settings", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ operatingMode: newMode })
			})).json();
			if (json.success) setOperatingMode(json.operatingMode);
			else alert(json.error || "Gagal mengubah mode.");
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
			const json = await (await apiFetch("/api/admin/schedules")).json();
			if (json.schedules) setSchedules(json.schedules);
		} catch (err) {
			console.error("Error fetching schedules:", err);
		} finally {
			setIsLoadingSchedules(false);
		}
	};
	const fetchCertificates = async () => {
		try {
			setIsLoadingCertificates(true);
			const json = await (await apiFetch("/api/admin/certificates")).json();
			if (json.certificates) setCertificates(json.certificates);
		} catch (err) {
			console.error("Error fetching certificates:", err);
		} finally {
			setIsLoadingCertificates(false);
		}
	};
	const handleCreateSchedule = async (e) => {
		e.preventDefault();
		if (!newSchedTitle || !newSchedPkgId || !newSchedStartTime || !newSchedEndTime) {
			alert("Mohon lengkapi judul sesi, paket soal, dan waktu mulai serta selesai.");
			return;
		}
		try {
			setIsCreatingSchedule(true);
			const res = await apiFetch("/api/admin/schedules", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: newSchedTitle,
					packageId: newSchedPkgId,
					startTime: newSchedStartTime,
					endTime: newSchedEndTime,
					timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
					quota: newSchedQuota,
					price: newSchedPrice
				})
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
	const handleToggleSchedule = async (id, currentStatus) => {
		try {
			const json = await (await apiFetch("/api/admin/schedules", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id,
					isActive: !currentStatus
				})
			})).json();
			if (json.success) await fetchSchedules();
			else alert(json.error || "Gagal mengubah status jadwal.");
		} catch (err) {
			console.error(err);
		}
	};
	const handleDeleteSchedule = async (id) => {
		if (!confirm("Apakah Anda yakin ingin menghapus jadwal ujian ini? Data pendaftaran peserta pada sesi ini juga akan terhapus.")) return;
		try {
			const json = await (await apiFetch(`/api/admin/schedules?id=${id}`, { method: "DELETE" })).json();
			if (json.success) await fetchSchedules();
			else alert(json.error || "Gagal menghapus jadwal.");
		} catch (err) {
			console.error(err);
		}
	};
	const fetchPayments = async () => {
		try {
			setIsLoadingPayments(true);
			const json = await (await apiFetch("/api/admin/payments")).json();
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
	const handleApprovePayment = async (registrationId) => {
		if (!confirm("Konfirmasi dan setujui pembayaran ini sebagai Lunas? Tiket ujian peserta akan segera aktif.")) return;
		try {
			setIsProcessingPayment(true);
			const json = await (await apiFetch(`/api/admin/payments/${registrationId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "APPROVE" })
			})).json();
			if (json.success) {
				await fetchPayments();
				if (previewPaymentItem?.id === registrationId) {
					setPreviewPaymentItem(null);
					setPreviewProofUrl(null);
				}
			} else alert(json.error || "Gagal memproses verifikasi.");
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
			const json = await (await apiFetch(`/api/admin/payments/${rejectTarget.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "REJECT",
					reason: rejectionReasonText || "Bukti pembayaran tidak sesuai atau dana belum masuk rekening."
				})
			})).json();
			if (json.success) {
				setRejectTarget(null);
				setRejectionReasonText("");
				await fetchPayments();
			} else alert(json.error || "Gagal menolak verifikasi.");
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
			const json = await (await apiFetch(`/api/admin/leads?${params.toString()}`)).json();
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
	const handleDeleteLead = async (id) => {
		if (!confirm("Hapus data calon peserta demo ini?")) return;
		try {
			setIsDeletingLeadId(id);
			if ((await apiFetch(`/api/admin/leads?id=${id}`, { method: "DELETE" })).ok) await fetchLeads();
			else alert("Gagal menghapus data calon peserta.");
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
		if (!isLoadingAuth && activeTab === "leads") fetchLeads();
	}, [
		leadSearch,
		leadFilter,
		activeTab
	]);
	const handleLogout = async () => {
		try {
			await apiFetch("/api/admin/auth/logout", { method: "POST" });
			router.push("/admin/login");
		} catch (err) {
			console.error(err);
		}
	};
	const handleCreateToken = async (e) => {
		e.preventDefault();
		try {
			setIsGenerating(true);
			const json = await (await apiFetch("/api/admin/tokens", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					label: newLabel,
					customCode,
					packageId: selectedPackageId || null
				})
			})).json();
			if (json.success) {
				setNewLabel("");
				setCustomCode("");
				await fetchAdminData();
			} else alert(json.error || "Gagal membuat token.");
		} catch (err) {
			console.error(err);
			alert("Terjadi kesalahan.");
		} finally {
			setIsGenerating(false);
		}
	};
	const copyToClipboard = (token) => {
		navigator.clipboard.writeText(token);
		setCopiedToken(token);
		setTimeout(() => setCopiedToken(null), 2e3);
	};
	const handleTogglePackage = async (packageId) => {
		try {
			const json = await (await apiFetch(`/api/admin/packages/${packageId}/toggle`, { method: "PUT" })).json();
			if (json.success) await fetchPackages();
			else alert(json.error || "Gagal mengubah status paket.");
		} catch (err) {
			console.error(err);
		}
	};
	const handleDeletePackage = async (packageId, title) => {
		if (!confirm(`Apakah Anda yakin ingin menghapus paket "${title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
		try {
			const json = await (await apiFetch(`/api/admin/packages/${packageId}`, { method: "DELETE" })).json();
			if (json.success) {
				alert("Paket berhasil dihapus.");
				await fetchPackages();
			} else alert(json.error || "Gagal menghapus paket.");
		} catch (err) {
			console.error(err);
			alert("Terjadi kesalahan saat menghapus paket.");
		}
	};
	const handleFileUpload = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		try {
			setIsImporting(true);
			const formData = new FormData();
			formData.append("file", file);
			const res = await apiFetch("/api/admin/packages/parse-file", {
				method: "POST",
				body: formData
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
	const handleConfirmSavePackage = async (packageData) => {
		try {
			const json = await (await apiFetch("/api/admin/packages", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: packageData.title,
					code: packageData.code,
					description: packageData.description,
					rawJson: packageData
				})
			})).json();
			if (json.success) {
				alert(json.message || "Paket soal berhasil disimpan ke database!");
				setPreviewModalOpen(false);
				setValidationReport(null);
				setPendingPackageData(null);
				await fetchPackages();
			} else alert(json.error || "Gagal menyimpan paket soal.");
		} catch (err) {
			console.error("Save package error:", err);
			alert("Terjadi kesalahan saat menyimpan paket soal.");
		}
	};
	if (isLoadingAuth) return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4",
		children: [/* @__PURE__ */ jsx("div", { className: "w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" }), /* @__PURE__ */ jsx("p", {
			className: "text-slate-400 text-sm font-medium",
			children: "Memverifikasi izin akses administrator..."
		})]
	});
	const filteredSessions = data?.sessions.filter((s) => s.participantName.toLowerCase().includes(searchQuery.toLowerCase()) || s.tokenCode.toLowerCase().includes(searchQuery.toLowerCase())) ?? [];
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-100 flex font-sans text-slate-800",
		children: [
			isMobileSidebarOpen && /* @__PURE__ */ jsx("div", {
				onClick: () => setIsMobileSidebarOpen(false),
				className: "fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
			}),
			/* @__PURE__ */ jsxs("aside", {
				className: `fixed md:sticky top-0 left-0 z-50 h-screen bg-slate-900 text-white flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 shrink-0 ${isMobileSidebarOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0"} ${isDesktopCollapsed ? "md:w-20" : "md:w-72"}`,
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: `p-4 border-b border-slate-800 flex items-center relative transition-all duration-300 ${isDesktopCollapsed ? "md:justify-center md:px-3" : "justify-between"}`,
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3 min-w-0",
							children: [/* @__PURE__ */ jsx("button", {
								onClick: () => {
									if (isDesktopCollapsed) toggleDesktopSidebar();
								},
								className: `w-10 h-10 rounded-xl bg-white border border-slate-700 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20 shrink-0 overflow-hidden ${isDesktopCollapsed ? "cursor-pointer hover:bg-blue-500 transition hover:scale-105" : ""}`,
								title: isDesktopCollapsed ? "Perluas Sidebar" : "TOEFL ITP Pro",
								children: /* @__PURE__ */ jsx("img", {
									src: appUrl(institutionLogoUrl),
									alt: "Logo institusi",
									className: "w-full h-full object-contain p-1",
									onError: (event) => {
										const fallback = appUrl("/branding/institution-logo.svg");
										if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
									}
								})
							}), /* @__PURE__ */ jsxs("div", {
								className: `${isDesktopCollapsed ? "md:hidden" : "block"} min-w-0 overflow-hidden transition-opacity duration-200`,
								children: [/* @__PURE__ */ jsxs("h1", {
									className: "font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5",
									children: [/* @__PURE__ */ jsx("span", { children: "TOEFL ITP®" }), /* @__PURE__ */ jsx("span", {
										className: "text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.2 rounded font-mono",
										children: "PRO"
									})]
								}), /* @__PURE__ */ jsx("p", {
									className: "text-[10.5px] text-slate-400 font-medium truncate",
									children: "Panel Administrasi Pusat"
								})]
							})]
						}), /* @__PURE__ */ jsx("button", {
							onClick: () => setIsMobileSidebarOpen(false),
							className: "md:hidden text-slate-400 hover:text-white p-1 rounded-lg transition",
							title: "Tutup Menu",
							children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex-1 overflow-y-auto py-4 px-3 space-y-5",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
								className: `${isDesktopCollapsed ? "md:hidden" : "block"} px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2`,
								children: "Operasional Ujian"
							}), /* @__PURE__ */ jsxs("div", {
								className: "space-y-1",
								children: [
									/* @__PURE__ */ jsxs("button", {
										onClick: () => {
											setActiveTab("results");
											setIsMobileSidebarOpen(false);
										},
										title: "Hasil Ujian Peserta",
										className: `w-full flex items-center ${isDesktopCollapsed ? "md:justify-center md:px-0 px-3 justify-between" : "justify-between px-3"} py-2.5 rounded-xl text-xs font-bold transition group relative ${activeTab === "results" ? "bg-blue-600 text-white shadow-xs" : "text-slate-300 hover:bg-slate-800/70 hover:text-white"}`,
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: `flex items-center ${isDesktopCollapsed ? "md:gap-0 gap-2.5" : "gap-2.5"}`,
												children: [/* @__PURE__ */ jsx(Users, { className: "w-4 h-4 shrink-0" }), /* @__PURE__ */ jsx("span", {
													className: isDesktopCollapsed ? "md:hidden" : "inline",
													children: "Hasil Ujian Peserta"
												})]
											}),
											/* @__PURE__ */ jsx("span", {
												className: `${isDesktopCollapsed ? "md:hidden" : "inline-block"} text-[10.5px] font-mono px-2 py-0.5 rounded-full ${activeTab === "results" ? "bg-blue-500/50 text-white" : "bg-slate-800 text-slate-400"}`,
												children: data?.summary.totalSessions ?? 0
											}),
											isDesktopCollapsed && /* @__PURE__ */ jsxs("div", {
												className: "hidden group-hover:md:flex absolute left-full ml-3 px-3 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none items-center gap-2 border border-slate-800",
												children: [/* @__PURE__ */ jsx("span", { children: "Hasil Ujian Peserta" }), /* @__PURE__ */ jsx("span", {
													className: "text-[10px] bg-blue-600/60 px-1.5 py-0.2 rounded font-mono",
													children: data?.summary.totalSessions ?? 0
												})]
											})
										]
									}),
									/* @__PURE__ */ jsxs("button", {
										onClick: () => {
											setActiveTab("schedules");
											setIsMobileSidebarOpen(false);
										},
										title: "Jadwal Sesi Ujian",
										className: `w-full flex items-center ${isDesktopCollapsed ? "md:justify-center md:px-0 px-3 justify-between" : "justify-between px-3"} py-2.5 rounded-xl text-xs font-bold transition group relative ${activeTab === "schedules" ? "bg-blue-600 text-white shadow-xs" : "text-slate-300 hover:bg-slate-800/70 hover:text-white"}`,
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: `flex items-center ${isDesktopCollapsed ? "md:gap-0 gap-2.5" : "gap-2.5"}`,
												children: [/* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4 shrink-0" }), /* @__PURE__ */ jsx("span", {
													className: isDesktopCollapsed ? "md:hidden" : "inline",
													children: "Jadwal Sesi Ujian"
												})]
											}),
											/* @__PURE__ */ jsx("span", {
												className: `${isDesktopCollapsed ? "md:hidden" : "inline-block"} text-[10.5px] font-mono px-2 py-0.5 rounded-full ${activeTab === "schedules" ? "bg-blue-500/50 text-white" : "bg-slate-800 text-slate-400"}`,
												children: schedules.length
											}),
											isDesktopCollapsed && /* @__PURE__ */ jsxs("div", {
												className: "hidden group-hover:md:flex absolute left-full ml-3 px-3 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none items-center gap-2 border border-slate-800",
												children: [/* @__PURE__ */ jsx("span", { children: "Jadwal Sesi Ujian" }), /* @__PURE__ */ jsx("span", {
													className: "text-[10px] bg-blue-600/60 px-1.5 py-0.2 rounded font-mono",
													children: schedules.length
												})]
											})
										]
									}),
									/* @__PURE__ */ jsxs("button", {
										onClick: () => {
											setActiveTab("certificates");
											setIsMobileSidebarOpen(false);
										},
										title: "Pangkalan E-Sertifikat",
										className: `w-full flex items-center ${isDesktopCollapsed ? "md:justify-center md:px-0 px-3 justify-between" : "justify-between px-3"} py-2.5 rounded-xl text-xs font-bold transition group relative ${activeTab === "certificates" ? "bg-blue-600 text-white shadow-xs" : "text-slate-300 hover:bg-slate-800/70 hover:text-white"}`,
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: `flex items-center ${isDesktopCollapsed ? "md:gap-0 gap-2.5" : "gap-2.5"}`,
												children: [/* @__PURE__ */ jsx(Award, { className: "w-4 h-4 shrink-0" }), /* @__PURE__ */ jsx("span", {
													className: isDesktopCollapsed ? "md:hidden" : "inline",
													children: "Pangkalan E-Sertifikat"
												})]
											}),
											/* @__PURE__ */ jsx("span", {
												className: `${isDesktopCollapsed ? "md:hidden" : "inline-block"} text-[10.5px] font-mono px-2 py-0.5 rounded-full ${activeTab === "certificates" ? "bg-blue-500/50 text-white" : "bg-slate-800 text-slate-400"}`,
												children: certificates.length
											}),
											isDesktopCollapsed && /* @__PURE__ */ jsxs("div", {
												className: "hidden group-hover:md:flex absolute left-full ml-3 px-3 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none items-center gap-2 border border-slate-800",
												children: [/* @__PURE__ */ jsx("span", { children: "Pangkalan E-Sertifikat" }), /* @__PURE__ */ jsx("span", {
													className: "text-[10px] bg-blue-600/60 px-1.5 py-0.2 rounded font-mono",
													children: certificates.length
												})]
											})
										]
									})
								]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsx("div", { className: `${isDesktopCollapsed ? "hidden md:block my-2 border-t border-slate-800/80 mx-1" : "hidden"}` }),
								/* @__PURE__ */ jsx("div", {
									className: `${isDesktopCollapsed ? "md:hidden" : "block"} px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2`,
									children: "Transaksi & Tiket"
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ jsxs("button", {
										onClick: () => {
											setActiveTab("payments");
											setIsMobileSidebarOpen(false);
										},
										title: "Verifikasi Pembayaran Tiket",
										className: `w-full flex items-center ${isDesktopCollapsed ? "md:justify-center md:px-0 px-3 justify-between" : "justify-between px-3"} py-2.5 rounded-xl text-xs font-bold transition group relative ${activeTab === "payments" ? "bg-blue-600 text-white shadow-xs" : "text-slate-300 hover:bg-slate-800/70 hover:text-white"}`,
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: `flex items-center ${isDesktopCollapsed ? "md:gap-0 gap-2.5" : "gap-2.5"}`,
												children: [/* @__PURE__ */ jsx(CreditCard, { className: "w-4 h-4 shrink-0" }), /* @__PURE__ */ jsx("span", {
													className: isDesktopCollapsed ? "md:hidden" : "inline",
													children: "Verifikasi Pembayaran"
												})]
											}),
											paymentSummary && paymentSummary.waitingCount > 0 ? /* @__PURE__ */ jsxs("span", {
												className: `${isDesktopCollapsed ? "md:hidden" : "inline-block"} bg-amber-500 text-slate-950 font-bold font-mono text-[10.5px] px-2 py-0.5 rounded-full animate-pulse shadow-xs`,
												children: [paymentSummary.waitingCount, " Menunggu"]
											}) : /* @__PURE__ */ jsx("span", {
												className: `${isDesktopCollapsed ? "md:hidden" : "inline-block"} text-[10.5px] font-mono px-2 py-0.5 rounded-full ${activeTab === "payments" ? "bg-blue-500/50 text-white" : "bg-slate-800 text-slate-400"}`,
												children: payments.length
											}),
											isDesktopCollapsed && paymentSummary && paymentSummary.waitingCount > 0 && /* @__PURE__ */ jsxs("span", {
												className: "hidden md:flex absolute top-1.5 right-2 w-2.5 h-2.5",
												children: [/* @__PURE__ */ jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" }), /* @__PURE__ */ jsx("span", { className: "relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" })]
											}),
											isDesktopCollapsed && /* @__PURE__ */ jsxs("div", {
												className: "hidden group-hover:md:flex absolute left-full ml-3 px-3 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none items-center gap-2 border border-slate-800",
												children: [/* @__PURE__ */ jsx("span", { children: "Verifikasi Pembayaran" }), paymentSummary && paymentSummary.waitingCount > 0 ? /* @__PURE__ */ jsxs("span", {
													className: "text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded font-mono",
													children: [paymentSummary.waitingCount, " Baru"]
												}) : /* @__PURE__ */ jsx("span", {
													className: "text-[10px] bg-blue-600/60 px-1.5 py-0.2 rounded font-mono",
													children: payments.length
												})]
											})
										]
									}), /* @__PURE__ */ jsxs("button", {
										onClick: () => {
											setActiveTab("leads");
											setIsMobileSidebarOpen(false);
										},
										title: "Calon Peserta (Simulasi Demo)",
										className: `w-full flex items-center ${isDesktopCollapsed ? "md:justify-center md:px-0 px-3 justify-between" : "justify-between px-3"} py-2.5 rounded-xl text-xs font-bold transition group relative ${activeTab === "leads" ? "bg-blue-600 text-white shadow-xs" : "text-slate-300 hover:bg-slate-800/70 hover:text-white"}`,
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: `flex items-center ${isDesktopCollapsed ? "md:gap-0 gap-2.5" : "gap-2.5"}`,
												children: [/* @__PURE__ */ jsx(UserCheck, { className: "w-4 h-4 shrink-0 text-amber-400" }), /* @__PURE__ */ jsx("span", {
													className: isDesktopCollapsed ? "md:hidden" : "inline",
													children: "Calon Peserta Demo"
												})]
											}),
											/* @__PURE__ */ jsx("span", {
												className: `${isDesktopCollapsed ? "md:hidden" : "inline-block"} text-[10.5px] font-mono px-2 py-0.5 rounded-full ${activeTab === "leads" ? "bg-blue-500/50 text-white" : "bg-slate-800 text-slate-400"}`,
												children: leadSummary?.totalLeads ?? leads.length
											}),
											isDesktopCollapsed && /* @__PURE__ */ jsxs("div", {
												className: "hidden group-hover:md:flex absolute left-full ml-3 px-3 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none items-center gap-2 border border-slate-800",
												children: [/* @__PURE__ */ jsx("span", { children: "Calon Peserta Demo" }), /* @__PURE__ */ jsx("span", {
													className: "text-[10px] bg-blue-600/60 px-1.5 py-0.2 rounded font-mono",
													children: leadSummary?.totalLeads ?? leads.length
												})]
											})
										]
									})]
								})
							] }),
							/* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsx("div", { className: `${isDesktopCollapsed ? "hidden md:block my-2 border-t border-slate-800/80 mx-1" : "hidden"}` }),
								/* @__PURE__ */ jsx("div", {
									className: `${isDesktopCollapsed ? "md:hidden" : "block"} px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2`,
									children: "Bank Soal & Token"
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ jsxs("button", {
										onClick: () => {
											setActiveTab("packages");
											setIsMobileSidebarOpen(false);
										},
										title: "Bank Soal TOEFL",
										className: `w-full flex items-center ${isDesktopCollapsed ? "md:justify-center md:px-0 px-3 justify-between" : "justify-between px-3"} py-2.5 rounded-xl text-xs font-bold transition group relative ${activeTab === "packages" ? "bg-blue-600 text-white shadow-xs" : "text-slate-300 hover:bg-slate-800/70 hover:text-white"}`,
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: `flex items-center ${isDesktopCollapsed ? "md:gap-0 gap-2.5" : "gap-2.5"}`,
												children: [/* @__PURE__ */ jsx(Layers, { className: "w-4 h-4 shrink-0" }), /* @__PURE__ */ jsx("span", {
													className: isDesktopCollapsed ? "md:hidden" : "inline",
													children: "Bank Soal TOEFL"
												})]
											}),
											/* @__PURE__ */ jsx("span", {
												className: `${isDesktopCollapsed ? "md:hidden" : "inline-block"} text-[10.5px] font-mono px-2 py-0.5 rounded-full ${activeTab === "packages" ? "bg-blue-500/50 text-white" : "bg-slate-800 text-slate-400"}`,
												children: packages.length
											}),
											isDesktopCollapsed && /* @__PURE__ */ jsxs("div", {
												className: "hidden group-hover:md:flex absolute left-full ml-3 px-3 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none items-center gap-2 border border-slate-800",
												children: [/* @__PURE__ */ jsx("span", { children: "Bank Soal TOEFL" }), /* @__PURE__ */ jsx("span", {
													className: "text-[10px] bg-blue-600/60 px-1.5 py-0.2 rounded font-mono",
													children: packages.length
												})]
											})
										]
									}), /* @__PURE__ */ jsxs("button", {
										onClick: () => {
											setActiveTab("tokens");
											setIsMobileSidebarOpen(false);
										},
										title: "Manajemen Token Ujian",
										className: `w-full flex items-center ${isDesktopCollapsed ? "md:justify-center md:px-0 px-3 justify-between" : "justify-between px-3"} py-2.5 rounded-xl text-xs font-bold transition group relative ${activeTab === "tokens" ? "bg-blue-600 text-white shadow-xs" : "text-slate-300 hover:bg-slate-800/70 hover:text-white"}`,
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: `flex items-center ${isDesktopCollapsed ? "md:gap-0 gap-2.5" : "gap-2.5"}`,
												children: [/* @__PURE__ */ jsx(Key, { className: "w-4 h-4 shrink-0" }), /* @__PURE__ */ jsx("span", {
													className: isDesktopCollapsed ? "md:hidden" : "inline",
													children: "Manajemen Token"
												})]
											}),
											/* @__PURE__ */ jsx("span", {
												className: `${isDesktopCollapsed ? "md:hidden" : "inline-block"} text-[10.5px] font-mono px-2 py-0.5 rounded-full ${activeTab === "tokens" ? "bg-blue-500/50 text-white" : "bg-slate-800 text-slate-400"}`,
												children: data?.summary.totalTokens ?? 0
											}),
											isDesktopCollapsed && /* @__PURE__ */ jsxs("div", {
												className: "hidden group-hover:md:flex absolute left-full ml-3 px-3 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none items-center gap-2 border border-slate-800",
												children: [/* @__PURE__ */ jsx("span", { children: "Manajemen Token" }), /* @__PURE__ */ jsx("span", {
													className: "text-[10px] bg-blue-600/60 px-1.5 py-0.2 rounded font-mono",
													children: data?.summary.totalTokens ?? 0
												})]
											})
										]
									})]
								})
							] }),
							/* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsx("div", { className: `${isDesktopCollapsed ? "hidden md:block my-2 border-t border-slate-800/80 mx-1" : "hidden"}` }),
								/* @__PURE__ */ jsx("div", {
									className: `${isDesktopCollapsed ? "md:hidden" : "block"} px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2`,
									children: "Pengaturan & Identitas"
								}),
								/* @__PURE__ */ jsx("div", {
									className: "space-y-1",
									children: /* @__PURE__ */ jsxs("button", {
										onClick: () => {
											setActiveTab("settings");
											setIsMobileSidebarOpen(false);
										},
										title: "Identitas & Mode Sistem",
										className: `w-full flex items-center ${isDesktopCollapsed ? "md:justify-center md:px-0 px-3 justify-between" : "justify-between px-3"} py-2.5 rounded-xl text-xs font-bold transition group relative ${activeTab === "settings" ? "bg-blue-600 text-white shadow-xs" : "text-slate-300 hover:bg-slate-800/70 hover:text-white"}`,
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: `flex items-center ${isDesktopCollapsed ? "md:gap-0 gap-2.5" : "gap-2.5"}`,
												children: [/* @__PURE__ */ jsx(Settings, { className: "w-4 h-4 shrink-0" }), /* @__PURE__ */ jsx("span", {
													className: isDesktopCollapsed ? "md:hidden" : "inline",
													children: "Identitas & Mode Sistem"
												})]
											}),
											/* @__PURE__ */ jsx("span", {
												className: `${isDesktopCollapsed ? "md:hidden" : "inline-block"} text-[10px] font-semibold bg-slate-800 text-blue-400 px-2 py-0.5 rounded`,
												children: operatingMode === "COMMERCIAL" ? "B2C" : "B2B"
											}),
											isDesktopCollapsed && /* @__PURE__ */ jsxs("div", {
												className: "hidden group-hover:md:flex absolute left-full ml-3 px-3 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none items-center gap-2 border border-slate-800",
												children: [/* @__PURE__ */ jsx("span", { children: "Pengaturan Identitas" }), /* @__PURE__ */ jsx("span", {
													className: "text-[10px] bg-blue-600/60 px-1.5 py-0.2 rounded font-mono",
													children: operatingMode === "COMMERCIAL" ? "B2C" : "B2B"
												})]
											})
										]
									})
								})
							] })
						]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "hidden md:block px-3 py-2 border-t border-slate-800/60",
						children: /* @__PURE__ */ jsxs("button", {
							onClick: toggleDesktopSidebar,
							className: `w-full flex items-center ${isDesktopCollapsed ? "justify-center px-0" : "justify-between px-3"} py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/70 transition`,
							title: isDesktopCollapsed ? "Perluas Sidebar" : "Perkecil Sidebar",
							children: [/* @__PURE__ */ jsx("div", {
								className: "flex items-center gap-2.5",
								children: isDesktopCollapsed ? /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 text-blue-400" }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4 text-slate-400" }), /* @__PURE__ */ jsx("span", { children: "Kecilkan Menu" })] })
							}), !isDesktopCollapsed && /* @__PURE__ */ jsx("span", {
								className: "text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono",
								children: "Collapse"
							})]
						})
					}),
					/* @__PURE__ */ jsx("div", {
						className: `p-3 border-t border-slate-800 bg-slate-950/50 ${isDesktopCollapsed ? "md:p-2" : "p-4"}`,
						children: /* @__PURE__ */ jsxs("div", {
							className: `flex items-center ${isDesktopCollapsed ? "md:flex-col md:gap-2 justify-center" : "justify-between gap-3"}`,
							children: [/* @__PURE__ */ jsxs("div", {
								className: `flex items-center ${isDesktopCollapsed ? "md:justify-center" : "gap-2.5"} min-w-0`,
								title: `${adminUser?.name || "Administrator"} (@${adminUser?.username || "admin"})`,
								children: [/* @__PURE__ */ jsx("div", {
									className: "w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400 shrink-0",
									children: adminUser?.name?.charAt(0) || "A"
								}), /* @__PURE__ */ jsxs("div", {
									className: `min-w-0 ${isDesktopCollapsed ? "md:hidden" : "block"}`,
									children: [/* @__PURE__ */ jsx("div", {
										className: "text-xs font-bold text-white truncate",
										children: adminUser?.name || "Administrator"
									}), /* @__PURE__ */ jsxs("div", {
										className: "text-[10px] text-slate-400 truncate",
										children: ["@", adminUser?.username || "admin"]
									})]
								})]
							}), /* @__PURE__ */ jsx("button", {
								onClick: handleLogout,
								className: "p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition shrink-0",
								title: "Keluar dari Panel Admin",
								children: /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" })
							})]
						})
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden",
				children: [/* @__PURE__ */ jsxs("header", {
					className: "bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between gap-4 shadow-xs",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ jsx("button", {
							onClick: () => {
								if (typeof window !== "undefined" && window.innerWidth < 768) setIsMobileSidebarOpen((prev) => !prev);
								else toggleDesktopSidebar();
							},
							className: "p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition flex items-center justify-center",
							title: isDesktopCollapsed ? "Perluas Sidebar" : "Perkecil Sidebar",
							children: /* @__PURE__ */ jsx(Menu, { className: "w-5 h-5" })
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h2", {
							className: "text-sm sm:text-base font-extrabold text-slate-900 capitalize tracking-tight flex items-center gap-2",
							children: [
								activeTab === "results" && "Hasil Ujian Peserta",
								activeTab === "schedules" && "Jadwal Sesi Ujian",
								activeTab === "payments" && "Verifikasi Pembayaran Tiket",
								activeTab === "leads" && "Daftar Calon Peserta (Prospek Demo)",
								activeTab === "certificates" && "Pangkalan Data E-Sertifikat",
								activeTab === "tokens" && "Manajemen Token Ujian",
								activeTab === "packages" && "Bank Soal & Multi-Paket",
								activeTab === "settings" && "Pengaturan Identitas & Mode Sistem"
							]
						}), /* @__PURE__ */ jsx("span", {
							className: "text-[11px] text-slate-500 font-medium hidden sm:inline",
							children: "Panel Pengawas & Operasional Ujian TOEFL ITP"
						})] })]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2 sm:gap-3",
						children: [
							/* @__PURE__ */ jsxs(Link, {
								href: "/",
								target: "_blank",
								className: "hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition",
								title: "Buka Halaman Utama / Landing Page",
								children: [/* @__PURE__ */ jsx(ExternalLink, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "Lihat Web" })]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold",
								children: [
									/* @__PURE__ */ jsx(Globe, { className: "w-3.5 h-3.5" }),
									/* @__PURE__ */ jsx("span", {
										className: "hidden sm:inline",
										children: "Mode:"
									}),
									/* @__PURE__ */ jsx("span", { children: operatingMode === "COMMERCIAL" ? "B2C Komersial" : "B2B Institusi" })
								]
							}),
							/* @__PURE__ */ jsxs("button", {
								onClick: handleLogout,
								className: "flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-600 rounded-xl font-bold text-xs transition",
								title: "Logout",
								children: [/* @__PURE__ */ jsx(LogOut, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", {
									className: "hidden sm:inline",
									children: "Logout"
								})]
							})
						]
					})]
				}), /* @__PURE__ */ jsxs("main", {
					className: "flex-1 w-full p-4 sm:p-6 lg:p-8 space-y-8",
					children: [
						activeTab === "results" && /* @__PURE__ */ jsxs("div", {
							className: "space-y-8",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4",
										children: [/* @__PURE__ */ jsx("div", {
											className: "w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0",
											children: /* @__PURE__ */ jsx(Users, { className: "w-6 h-6" })
										}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
											className: "text-xs text-slate-500 font-medium uppercase tracking-wider block",
											children: "Total Sesi Peserta"
										}), /* @__PURE__ */ jsx("span", {
											className: "text-2xl font-extrabold text-slate-900",
											children: data?.summary.totalSessions ?? 0
										})] })]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4",
										children: [/* @__PURE__ */ jsx("div", {
											className: "w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0",
											children: /* @__PURE__ */ jsx(CheckCircle2, { className: "w-6 h-6" })
										}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
											className: "text-xs text-slate-500 font-medium uppercase tracking-wider block",
											children: "Ujian Selesai"
										}), /* @__PURE__ */ jsx("span", {
											className: "text-2xl font-extrabold text-emerald-700",
											children: data?.summary.completedCount ?? 0
										})] })]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4",
										children: [/* @__PURE__ */ jsx("div", {
											className: "w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0",
											children: /* @__PURE__ */ jsx(Award, { className: "w-6 h-6" })
										}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
											className: "text-xs text-slate-500 font-medium uppercase tracking-wider block",
											children: "Rata-Rata Skor"
										}), /* @__PURE__ */ jsx("span", {
											className: "text-2xl font-extrabold text-slate-900",
											children: data?.summary.averageScore ?? 0
										})] })]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4",
										children: [/* @__PURE__ */ jsx("div", {
											className: "w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0",
											children: /* @__PURE__ */ jsx(Key, { className: "w-6 h-6" })
										}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
											className: "text-xs text-slate-500 font-medium uppercase tracking-wider block",
											children: "Token Aktif"
										}), /* @__PURE__ */ jsx("span", {
											className: "text-2xl font-extrabold text-slate-900",
											children: data?.summary.totalTokens ?? 0
										})] })]
									})
								]
							}), /* @__PURE__ */ jsxs("div", {
								className: "bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4",
									children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
										className: "text-base font-bold text-slate-900",
										children: "Rekapitulasi Hasil Ujian Peserta"
									}), /* @__PURE__ */ jsx("p", {
										className: "text-xs text-slate-500",
										children: "Daftar nilai skala ETS (31–68), Total Skor (310–677), dan predikat CEFR."
									})] }), /* @__PURE__ */ jsxs("div", {
										className: "flex flex-wrap items-center gap-2.5",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "relative w-full sm:w-60",
												children: [/* @__PURE__ */ jsx(Search, { className: "w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ jsx("input", {
													type: "text",
													value: searchQuery,
													onChange: (e) => setSearchQuery(e.target.value),
													placeholder: "Cari nama atau token...",
													className: "w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
												})]
											}),
											/* @__PURE__ */ jsxs("a", {
												href: appUrl("/api/admin/export/results?format=xlsx"),
												className: "inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition",
												title: "Unduh seluruh rekap nilai dalam format Microsoft Excel",
												children: [/* @__PURE__ */ jsx(FileSpreadsheet, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "Ekspor Excel (.xlsx)" })]
											}),
											/* @__PURE__ */ jsxs("a", {
												href: appUrl("/api/admin/export/results?format=csv"),
												className: "inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition",
												title: "Unduh rekap nilai format CSV",
												children: [/* @__PURE__ */ jsx(Download, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "CSV" })]
											})
										]
									})]
								}), /* @__PURE__ */ jsx("div", {
									className: "overflow-x-auto",
									children: /* @__PURE__ */ jsxs("table", {
										className: "w-full text-left text-xs",
										children: [/* @__PURE__ */ jsx("thead", {
											className: "bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200",
											children: /* @__PURE__ */ jsxs("tr", { children: [
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-4",
													children: "Nama Peserta"
												}),
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-4",
													children: "Token"
												}),
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-4 text-center",
													children: "Status"
												}),
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-3 text-center",
													children: "Listening"
												}),
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-3 text-center",
													children: "Structure"
												}),
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-3 text-center",
													children: "Reading"
												}),
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-4 text-center",
													children: "Total Skor"
												}),
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-4 text-center",
													children: "CEFR"
												}),
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-4 text-right",
													children: "Aksi"
												})
											] })
										}), /* @__PURE__ */ jsx("tbody", {
											className: "divide-y divide-slate-100",
											children: filteredSessions.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
												colSpan: 9,
												className: "py-8 text-center text-slate-400",
												children: searchQuery ? "Tidak ada peserta yang cocok dengan pencarian." : "Belum ada riwayat pengerjaan ujian."
											}) }) : filteredSessions.map((s) => /* @__PURE__ */ jsxs("tr", {
												className: "hover:bg-slate-50/80 transition",
												children: [
													/* @__PURE__ */ jsx("td", {
														className: "py-3 px-4 font-semibold text-slate-800",
														children: s.participantName
													}),
													/* @__PURE__ */ jsx("td", {
														className: "py-3 px-4",
														children: /* @__PURE__ */ jsx("span", {
															className: "font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200",
															children: s.tokenCode
														})
													}),
													/* @__PURE__ */ jsx("td", {
														className: "py-3 px-4 text-center",
														children: /* @__PURE__ */ jsx("span", {
															className: `inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${s.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`,
															children: s.status === "COMPLETED" ? "Selesai" : "Sedang Ujian"
														})
													}),
													/* @__PURE__ */ jsx("td", {
														className: "py-3 px-3 text-center font-mono font-semibold",
														children: s.result ? s.result.listeningScaled : "-"
													}),
													/* @__PURE__ */ jsx("td", {
														className: "py-3 px-3 text-center font-mono font-semibold",
														children: s.result ? s.result.structureScaled : "-"
													}),
													/* @__PURE__ */ jsx("td", {
														className: "py-3 px-3 text-center font-mono font-semibold",
														children: s.result ? s.result.readingScaled : "-"
													}),
													/* @__PURE__ */ jsx("td", {
														className: "py-3 px-4 text-center",
														children: s.result ? /* @__PURE__ */ jsx("span", {
															className: "font-mono font-black text-sm text-blue-700",
															children: s.result.totalScore
														}) : "-"
													}),
													/* @__PURE__ */ jsx("td", {
														className: "py-3 px-4 text-center",
														children: s.result ? /* @__PURE__ */ jsx("span", {
															className: "inline-block px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 font-bold text-indigo-700 text-[11px]",
															children: s.result.cefrLevel
														}) : "-"
													}),
													/* @__PURE__ */ jsx("td", {
														className: "py-3 px-4 text-right",
														children: s.result ? /* @__PURE__ */ jsxs(Link, {
															href: `/result/${s.id}`,
															target: "_blank",
															className: "inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition",
															children: [/* @__PURE__ */ jsx("span", { children: "Sertifikat" }), /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3" })]
														}) : /* @__PURE__ */ jsx("span", {
															className: "text-slate-400 text-[11px]",
															children: "-"
														})
													})
												]
											}, s.id))
										})]
									})
								})]
							})]
						}),
						activeTab === "tokens" && /* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "bg-white rounded-2xl border border-slate-200 shadow-xs p-6",
								children: [
									/* @__PURE__ */ jsxs("h2", {
										className: "text-base font-bold text-slate-900 mb-1 flex items-center gap-2",
										children: [/* @__PURE__ */ jsx(Key, { className: "w-4 h-4 text-blue-600" }), /* @__PURE__ */ jsx("span", { children: "Buat Token Ujian Baru" })]
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-xs text-slate-500 mb-4",
										children: "Buat kode akses unik dan hubungkan ke paket ujian tertentu."
									}),
									/* @__PURE__ */ jsxs("form", {
										onSubmit: handleCreateToken,
										className: "space-y-3.5",
										children: [
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
												className: "block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1",
												children: "Nama Kelompok / Label Sesi"
											}), /* @__PURE__ */ jsx("input", {
												type: "text",
												required: true,
												value: newLabel,
												onChange: (e) => setNewLabel(e.target.value),
												placeholder: "Masukkan label sesi (misal: Seleksi Pegawai Batch 2)",
												className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
											})] }),
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
												className: "block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1",
												children: "Target Paket Ujian"
											}), /* @__PURE__ */ jsx("select", {
												value: selectedPackageId,
												onChange: (e) => setSelectedPackageId(e.target.value),
												className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium",
												children: packages.map((pkg) => /* @__PURE__ */ jsxs("option", {
													value: pkg.id,
													children: [
														pkg.title,
														" (",
														pkg.code,
														")"
													]
												}, pkg.id))
											})] }),
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
												className: "block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1",
												children: "Kode Khusus (Opsional)"
											}), /* @__PURE__ */ jsx("input", {
												type: "text",
												value: customCode,
												onChange: (e) => setCustomCode(e.target.value.toUpperCase()),
												placeholder: "Dikosongkan untuk acak otomatis sistem",
												className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
											})] }),
											/* @__PURE__ */ jsxs("button", {
												type: "submit",
												disabled: isGenerating,
												className: "w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50",
												children: [/* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: isGenerating ? "Membuat..." : "Generate Token" })]
											})
										]
									})
								]
							}), /* @__PURE__ */ jsxs("div", {
								className: "lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col",
								children: [
									/* @__PURE__ */ jsx("h2", {
										className: "text-base font-bold text-slate-900 mb-1",
										children: "Daftar Token Siap Pakai"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-xs text-slate-500 mb-4",
										children: "Token aktif yang dapat langsung dibagikan kepada peserta."
									}),
									/* @__PURE__ */ jsx("div", {
										className: "flex-1 overflow-y-auto max-h-96 space-y-2.5 pr-1",
										children: data?.tokens.map((t) => /* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition",
											children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ jsx("span", {
													className: "font-mono font-bold text-sm text-blue-700 tracking-wider",
													children: t.tokenCode
												}), t.package && /* @__PURE__ */ jsx("span", {
													className: "text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded",
													children: t.package.code
												})]
											}), /* @__PURE__ */ jsx("span", {
												className: "text-xs text-slate-600 block mt-0.5",
												children: t.label
											})] }), /* @__PURE__ */ jsx("button", {
												onClick: () => copyToClipboard(t.tokenCode),
												className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-95",
												children: copiedToken === t.tokenCode ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Check, { className: "w-3.5 h-3.5 text-emerald-600" }), /* @__PURE__ */ jsx("span", {
													className: "text-emerald-600",
													children: "Tersalin!"
												})] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Copy, { className: "w-3.5 h-3.5 text-slate-500" }), /* @__PURE__ */ jsx("span", { children: "Salin" })] })
											})]
										}, t.id))
									})
								]
							})]
						}),
						activeTab === "packages" && /* @__PURE__ */ jsxs("div", {
							className: "space-y-6",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h2", {
									className: "text-lg font-bold text-white mb-1 flex items-center gap-2",
									children: [/* @__PURE__ */ jsx(Layers, { className: "w-5 h-5 text-blue-300" }), /* @__PURE__ */ jsx("span", { children: "Manajemen Bank Soal & Multi-Paket" })]
								}), /* @__PURE__ */ jsx("p", {
									className: "text-xs text-blue-200 max-w-xl",
									children: "Kelola paket ujian atau impor 140 soal baru secara instan menggunakan file JSON terstruktur tanpa perlu input manual."
								})] }), /* @__PURE__ */ jsxs("div", {
									className: "flex flex-wrap items-center gap-3",
									children: [
										/* @__PURE__ */ jsxs("a", {
											href: appUrl("/api/admin/packages/template-excel"),
											download: true,
											className: "flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95",
											title: "Unduh template format spreadsheet Excel (.xlsx)",
											children: [/* @__PURE__ */ jsx(FileSpreadsheet, { className: "w-4 h-4 text-emerald-200" }), /* @__PURE__ */ jsx("span", { children: "Unduh Template Excel (.xlsx)" })]
										}),
										/* @__PURE__ */ jsxs("a", {
											href: appUrl("/api/admin/packages/template"),
											download: true,
											className: "flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold transition backdrop-blur-xs",
											children: [/* @__PURE__ */ jsx(Download, { className: "w-4 h-4 text-blue-300" }), /* @__PURE__ */ jsx("span", { children: "Template JSON" })]
										}),
										/* @__PURE__ */ jsx("input", {
											type: "file",
											ref: fileInputRef,
											accept: ".xlsx,.xls,.csv,.json",
											onChange: handleFileUpload,
											className: "hidden"
										}),
										/* @__PURE__ */ jsxs("button", {
											onClick: () => fileInputRef.current?.click(),
											disabled: isImporting,
											className: "flex items-center gap-1.5 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold transition shadow-sm active:scale-95 disabled:opacity-50",
											children: [/* @__PURE__ */ jsx(Upload, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: isImporting ? "Memproses File..." : "Upload Paket (Excel / JSON)" })]
										})
									]
								})]
							}), /* @__PURE__ */ jsx("div", {
								className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5",
								children: packages.map((pkg) => /* @__PURE__ */ jsxs("div", {
									className: "bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition",
									children: [/* @__PURE__ */ jsxs("div", { children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-start justify-between gap-2 mb-3",
											children: [/* @__PURE__ */ jsx("span", {
												className: "font-mono text-xs font-bold bg-slate-100 text-blue-700 px-2 py-0.5 rounded border border-slate-200",
												children: pkg.code
											}), /* @__PURE__ */ jsx("button", {
												onClick: () => handleTogglePackage(pkg.id),
												className: `inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border transition ${pkg.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-300"}`,
												title: "Klik untuk ubah status aktif/nonaktif",
												children: pkg.isActive ? "Aktif" : "Nonaktif"
											})]
										}),
										/* @__PURE__ */ jsx("h3", {
											className: "text-base font-bold text-slate-900 mb-1 leading-snug",
											children: pkg.title
										}),
										/* @__PURE__ */ jsx("p", {
											className: "text-xs text-slate-500 mb-4 line-clamp-2",
											children: pkg.description || "Tidak ada deskripsi."
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 text-xs",
											children: [pkg.sections.map((sec) => /* @__PURE__ */ jsxs("div", {
												className: "flex items-center justify-between text-slate-600",
												children: [/* @__PURE__ */ jsx("span", {
													className: "font-medium text-[11px]",
													children: sec.sectionType === "LISTENING" ? "Section 1: Listening" : sec.sectionType === "STRUCTURE" ? "Section 2: Structure" : "Section 3: Reading"
												}), /* @__PURE__ */ jsxs("span", {
													className: "font-bold text-slate-900 font-mono text-[11px]",
													children: [
														sec.questionCount,
														" Soal • ",
														sec.durationMinutes,
														"m"
													]
												})]
											}, sec.id)), /* @__PURE__ */ jsxs("div", {
												className: "border-t border-slate-200 pt-1.5 flex items-center justify-between text-slate-700 font-bold",
												children: [/* @__PURE__ */ jsx("span", { children: "Total Soal:" }), /* @__PURE__ */ jsxs("span", {
													className: "text-blue-700 font-mono",
													children: [pkg.totalQuestions, " Soal"]
												})]
											})]
										})
									] }), /* @__PURE__ */ jsxs("div", {
										className: "border-t border-slate-100 pt-3 flex items-center justify-between gap-2 text-xs",
										children: [/* @__PURE__ */ jsxs(Link, {
											href: `/admin/packages/${pkg.id}`,
											className: "inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition",
											children: [/* @__PURE__ */ jsx(Edit, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "Review & Edit Soal" })]
										}), /* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ jsx("a", {
												href: appUrl(`/api/admin/packages/${pkg.id}/export`),
												className: "flex items-center gap-1 text-slate-500 hover:text-blue-700 font-semibold p-1",
												title: "Ekspor JSON",
												children: /* @__PURE__ */ jsx(Download, { className: "w-3.5 h-3.5" })
											}), /* @__PURE__ */ jsx("button", {
												onClick: () => handleDeletePackage(pkg.id, pkg.title),
												className: "flex items-center gap-1 text-rose-500 hover:text-rose-700 font-semibold p-1",
												title: "Hapus paket",
												children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
											})]
										})]
									})]
								}, pkg.id))
							})]
						}),
						activeTab === "schedules" && /* @__PURE__ */ jsxs("div", {
							className: "space-y-8",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
									children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
										className: "text-base sm:text-lg font-bold text-slate-900",
										children: "Manajemen Jadwal Sesi Ujian TOEFL ITP®"
									}), /* @__PURE__ */ jsx("p", {
										className: "text-xs text-slate-500",
										children: "Buka sesi jadwal ujian terikat waktu, tautkan ke bank soal, dan pantau peserta terdaftar."
									})] }), /* @__PURE__ */ jsxs("button", {
										onClick: () => setShowScheduleForm(!showScheduleForm),
										className: "inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition",
										children: [/* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: showScheduleForm ? "Tutup Form" : "Buka Sesi Ujian Baru" })]
									})]
								}),
								showScheduleForm && /* @__PURE__ */ jsxs("div", {
									className: "bg-white rounded-2xl border-2 border-blue-200 p-6 shadow-sm space-y-4",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2 text-blue-700 font-bold text-sm border-b border-slate-100 pb-3",
										children: [/* @__PURE__ */ jsx(Calendar, { className: "w-5 h-5" }), /* @__PURE__ */ jsx("span", { children: "Formulir Pembukaan Sesi Ujian Baru" })]
									}), /* @__PURE__ */ jsxs("form", {
										onSubmit: handleCreateSchedule,
										className: "space-y-4",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
											children: [
												/* @__PURE__ */ jsxs("div", {
													className: "space-y-1 sm:col-span-2",
													children: [/* @__PURE__ */ jsx("label", {
														className: "text-xs font-bold text-slate-700",
														children: "Judul Sesi Ujian"
													}), /* @__PURE__ */ jsx("input", {
														type: "text",
														required: true,
														value: newSchedTitle,
														onChange: (e) => setNewSchedTitle(e.target.value),
														placeholder: "Contoh: TOEFL ITP Prediction - Gelombang 1 Maret 2026",
														className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
													})]
												}),
												/* @__PURE__ */ jsxs("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ jsx("label", {
														className: "text-xs font-bold text-slate-700",
														children: "Pilih Paket Bank Soal"
													}), /* @__PURE__ */ jsxs("select", {
														required: true,
														value: newSchedPkgId,
														onChange: (e) => setNewSchedPkgId(e.target.value),
														className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white",
														children: [/* @__PURE__ */ jsx("option", {
															value: "",
															children: "-- Pilih Paket Soal --"
														}), packages.map((pkg) => /* @__PURE__ */ jsxs("option", {
															value: pkg.id,
															children: [
																pkg.code,
																" - ",
																pkg.title
															]
														}, pkg.id))]
													})]
												}),
												/* @__PURE__ */ jsxs("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ jsx("label", {
														className: "text-xs font-bold text-slate-700",
														children: "Kapasitas / Kuota Peserta"
													}), /* @__PURE__ */ jsx("input", {
														type: "number",
														min: "1",
														max: "500",
														value: newSchedQuota,
														onChange: (e) => setNewSchedQuota(Number(e.target.value)),
														className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
													})]
												}),
												/* @__PURE__ */ jsxs("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ jsx("label", {
														className: "text-xs font-bold text-slate-700",
														children: "Waktu Mulai Ujian (zona lembaga)"
													}), /* @__PURE__ */ jsx("input", {
														type: "datetime-local",
														required: true,
														value: newSchedStartTime,
														onChange: (e) => setNewSchedStartTime(e.target.value),
														className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
													})]
												}),
												/* @__PURE__ */ jsxs("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ jsx("label", {
														className: "text-xs font-bold text-slate-700",
														children: "Waktu Selesai Ujian (Batas Masuk)"
													}), /* @__PURE__ */ jsx("input", {
														type: "datetime-local",
														required: true,
														value: newSchedEndTime,
														onChange: (e) => setNewSchedEndTime(e.target.value),
														className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
													})]
												}),
												/* @__PURE__ */ jsxs("div", {
													className: "space-y-1",
													children: [
														/* @__PURE__ */ jsx("label", {
															className: "text-xs font-bold text-slate-700",
															children: "Biaya Pendaftaran (Rp)"
														}),
														/* @__PURE__ */ jsx("input", {
															type: "number",
															min: "0",
															step: "1000",
															value: newSchedPrice,
															onChange: (e) => setNewSchedPrice(Number(e.target.value)),
															placeholder: "0 = Gratis / Free Pass",
															className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
														}),
														/* @__PURE__ */ jsx("span", {
															className: "text-[10px] text-slate-400",
															children: "Isi 0 jika pendaftaran gratis atau simulasi."
														})
													]
												})
											]
										}), /* @__PURE__ */ jsxs("div", {
											className: "pt-3 border-t border-slate-100 flex items-center justify-end gap-3",
											children: [/* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => setShowScheduleForm(false),
												className: "px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold",
												children: "Batal"
											}), /* @__PURE__ */ jsx("button", {
												type: "submit",
												disabled: isCreatingSchedule,
												className: "px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50",
												children: isCreatingSchedule ? "Menyimpan..." : "Publikasikan Sesi Ujian"
											})]
										})]
									})]
								}),
								schedules.length === 0 ? /* @__PURE__ */ jsxs("div", {
									className: "bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs",
									children: [
										"Belum ada jadwal sesi ujian yang dibuat. Klik tombol ",
										/* @__PURE__ */ jsx("strong", { children: "\"Buka Sesi Ujian Baru\"" }),
										" di atas."
									]
								}) : /* @__PURE__ */ jsx("div", {
									className: "space-y-6",
									children: schedules.map((sched) => {
										const startTime = new Date(sched.startTime);
										const endTime = new Date(sched.endTime);
										const startStr = startTime.toLocaleString("id-ID", {
											day: "numeric",
											month: "short",
											year: "numeric",
											hour: "2-digit",
											minute: "2-digit"
										});
										const endStr = endTime.toLocaleTimeString("id-ID", {
											hour: "2-digit",
											minute: "2-digit"
										});
										return /* @__PURE__ */ jsxs("div", {
											className: "bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "p-5 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4",
												children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
													className: "flex items-center gap-2 mb-1",
													children: [
														/* @__PURE__ */ jsx("span", {
															className: "font-mono text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded",
															children: sched.package.code
														}),
														/* @__PURE__ */ jsx("span", {
															className: "font-bold text-slate-900 text-base",
															children: sched.title
														}),
														/* @__PURE__ */ jsx("span", {
															className: `text-[10px] font-bold px-2 py-0.5 rounded ${sched.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-200 text-slate-600"}`,
															children: sched.isActive ? "Sesi Aktif" : "Nonaktif"
														})
													]
												}), /* @__PURE__ */ jsxs("p", {
													className: "text-xs text-slate-500",
													children: [
														"Waktu: ",
														/* @__PURE__ */ jsxs("strong", { children: [
															startStr,
															" - ",
															endStr,
															" WIB"
														] }),
														" • Terdaftar: ",
														/* @__PURE__ */ jsx("strong", { children: sched.registrations.length }),
														" / ",
														sched.quota,
														" Kuota • Biaya: ",
														sched.price > 0 ? `Rp ${sched.price.toLocaleString("id-ID")}` : "Gratis"
													]
												})] }), /* @__PURE__ */ jsxs("div", {
													className: "flex items-center gap-2",
													children: [
														/* @__PURE__ */ jsxs("a", {
															href: appUrl(`/api/admin/export/results?scheduleId=${sched.id}&format=xlsx`),
															className: "inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition",
															title: "Unduh Rekap Nilai Peserta Jadwal Sesi Ini (.xlsx)",
															children: [/* @__PURE__ */ jsx(FileSpreadsheet, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "Rekap Sesi (.xlsx)" })]
														}),
														/* @__PURE__ */ jsx("button", {
															onClick: () => handleToggleSchedule(sched.id, sched.isActive),
															className: "px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 transition",
															children: sched.isActive ? "Tutup Pendaftaran" : "Buka Kembali"
														}),
														/* @__PURE__ */ jsx("button", {
															onClick: () => handleDeleteSchedule(sched.id),
															className: "p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition",
															title: "Hapus Jadwal",
															children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
														})
													]
												})]
											}), /* @__PURE__ */ jsxs("div", {
												className: "p-4",
												children: [/* @__PURE__ */ jsxs("h4", {
													className: "text-xs font-bold uppercase tracking-wider text-slate-600 mb-3",
													children: [
														"Peserta Terdaftar (",
														sched.registrations.length,
														" Orang)"
													]
												}), sched.registrations.length === 0 ? /* @__PURE__ */ jsx("p", {
													className: "text-xs text-slate-400 italic py-2",
													children: "Belum ada peserta yang mendaftar pada sesi ujian ini."
												}) : /* @__PURE__ */ jsx("div", {
													className: "overflow-x-auto",
													children: /* @__PURE__ */ jsxs("table", {
														className: "w-full text-left text-xs",
														children: [/* @__PURE__ */ jsx("thead", {
															className: "bg-slate-100 text-slate-600 font-bold uppercase border-b border-slate-200",
															children: /* @__PURE__ */ jsxs("tr", { children: [
																/* @__PURE__ */ jsx("th", {
																	className: "py-2.5 px-3",
																	children: "No. Tiket"
																}),
																/* @__PURE__ */ jsx("th", {
																	className: "py-2.5 px-3",
																	children: "Nama Peserta"
																}),
																/* @__PURE__ */ jsx("th", {
																	className: "py-2.5 px-3",
																	children: "NIK / Identitas"
																}),
																/* @__PURE__ */ jsx("th", {
																	className: "py-2.5 px-3",
																	children: "Email"
																}),
																/* @__PURE__ */ jsx("th", {
																	className: "py-2.5 px-3 text-center",
																	children: "Status Ujian"
																}),
																/* @__PURE__ */ jsx("th", {
																	className: "py-2.5 px-3 text-center",
																	children: "Skor Akhir"
																}),
																/* @__PURE__ */ jsx("th", {
																	className: "py-2.5 px-3 text-right",
																	children: "Aksi"
																})
															] })
														}), /* @__PURE__ */ jsx("tbody", {
															className: "divide-y divide-slate-100",
															children: sched.registrations.map((reg) => {
																const isDone = reg.session?.status === "COMPLETED";
																const isInProgress = reg.session?.status === "IN_PROGRESS";
																const totalScore = reg.session?.result?.totalScore;
																return /* @__PURE__ */ jsxs("tr", {
																	className: "hover:bg-slate-50 transition",
																	children: [
																		/* @__PURE__ */ jsx("td", {
																			className: "py-2.5 px-3 font-mono font-bold text-blue-700",
																			children: reg.registrationNumber
																		}),
																		/* @__PURE__ */ jsx("td", {
																			className: "py-2.5 px-3 font-bold text-slate-900",
																			children: reg.user.name
																		}),
																		/* @__PURE__ */ jsx("td", {
																			className: "py-2.5 px-3 text-slate-500 font-mono",
																			children: reg.user.idNumber || "-"
																		}),
																		/* @__PURE__ */ jsx("td", {
																			className: "py-2.5 px-3 text-slate-600",
																			children: reg.user.email
																		}),
																		/* @__PURE__ */ jsx("td", {
																			className: "py-2.5 px-3 text-center",
																			children: isDone ? /* @__PURE__ */ jsx("span", {
																				className: "text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px]",
																				children: "Selesai"
																			}) : isInProgress ? /* @__PURE__ */ jsx("span", {
																				className: "text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[10px]",
																				children: "Sedang Mengerjakan"
																			}) : /* @__PURE__ */ jsx("span", {
																				className: "text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded text-[10px]",
																				children: "Belum Mulai"
																			})
																		}),
																		/* @__PURE__ */ jsx("td", {
																			className: "py-2.5 px-3 text-center font-mono font-bold",
																			children: totalScore ? /* @__PURE__ */ jsx("span", {
																				className: "text-blue-700 font-black",
																				children: totalScore
																			}) : "-"
																		}),
																		/* @__PURE__ */ jsx("td", {
																			className: "py-2.5 px-3 text-right",
																			children: reg.session && isDone && /* @__PURE__ */ jsxs(Link, {
																				href: `/result/${reg.session.id}`,
																				target: "_blank",
																				className: "inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold",
																				children: [/* @__PURE__ */ jsx("span", { children: "Skor" }), /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3" })]
																			})
																		})
																	]
																}, reg.id);
															})
														})]
													})
												})]
											})]
										}, sched.id);
									})
								})
							]
						}),
						activeTab === "payments" && /* @__PURE__ */ jsxs("div", {
							className: "space-y-6",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
									children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h2", {
										className: "text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2",
										children: [/* @__PURE__ */ jsx(CreditCard, { className: "w-5 h-5 text-blue-600" }), /* @__PURE__ */ jsx("span", { children: "Verifikasi Pembayaran & Penerimaan Dana Ujian" })]
									}), /* @__PURE__ */ jsx("p", {
										className: "text-xs text-slate-500",
										children: "Verifikasi transfer bank online atau konfirmasi pembayaran tunai di loket. Tiket ujian peserta otomatis aktif begitu disetujui."
									})] }), /* @__PURE__ */ jsx("button", {
										onClick: fetchPayments,
										disabled: isLoadingPayments,
										className: "inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition",
										children: /* @__PURE__ */ jsx("span", { children: isLoadingPayments ? "Menyinkronkan..." : "Perbarui Data" })
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4",
											children: [/* @__PURE__ */ jsx("div", {
												className: "w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0",
												children: /* @__PURE__ */ jsx(Banknote, { className: "w-6 h-6" })
											}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
												className: "text-xs text-slate-500 font-medium uppercase tracking-wider block",
												children: "Total Dana Lunas"
											}), /* @__PURE__ */ jsxs("span", {
												className: "text-2xl font-extrabold text-emerald-700 font-sans",
												children: ["Rp ", (paymentSummary?.totalRevenue || 0).toLocaleString("id-ID")]
											})] })]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: `p-5 rounded-2xl border shadow-xs flex items-center gap-4 transition ${(paymentSummary?.waitingCount || 0) > 0 ? "bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/30" : "bg-white border-slate-200"}`,
											children: [/* @__PURE__ */ jsx("div", {
												className: "w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0",
												children: /* @__PURE__ */ jsx(Clock, { className: "w-6 h-6" })
											}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
												className: "text-xs text-slate-500 font-medium uppercase tracking-wider block",
												children: "Menunggu Verifikasi"
											}), /* @__PURE__ */ jsx("span", {
												className: "text-2xl font-extrabold text-amber-700",
												children: paymentSummary?.waitingCount ?? 0
											})] })]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4",
											children: [/* @__PURE__ */ jsx("div", {
												className: "w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0",
												children: /* @__PURE__ */ jsx(CheckCircle2, { className: "w-6 h-6" })
											}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
												className: "text-xs text-slate-500 font-medium uppercase tracking-wider block",
												children: "Tiket Lunas / Aktif"
											}), /* @__PURE__ */ jsx("span", {
												className: "text-2xl font-extrabold text-blue-700",
												children: paymentSummary?.confirmedCount ?? 0
											})] })]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4",
											children: [/* @__PURE__ */ jsx("div", {
												className: "w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center shrink-0",
												children: /* @__PURE__ */ jsx(CreditCard, { className: "w-6 h-6" })
											}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
												className: "text-xs text-slate-500 font-medium uppercase tracking-wider block",
												children: "Belum Melakukan Transfer"
											}), /* @__PURE__ */ jsx("span", {
												className: "text-2xl font-extrabold text-slate-700",
												children: paymentSummary?.pendingPaymentCount ?? 0
											})] })]
										})
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex flex-wrap items-center gap-1.5 text-xs",
										children: [
											/* @__PURE__ */ jsxs("button", {
												onClick: () => setPaymentFilter("ALL"),
												className: `px-3 py-1.5 rounded-xl font-bold transition ${paymentFilter === "ALL" ? "bg-blue-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`,
												children: [
													"Semua (",
													payments.length,
													")"
												]
											}),
											/* @__PURE__ */ jsxs("button", {
												onClick: () => setPaymentFilter("WAITING_APPROVAL"),
												className: `px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${paymentFilter === "WAITING_APPROVAL" ? "bg-amber-500 text-white shadow-xs" : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"}`,
												children: [/* @__PURE__ */ jsx("span", { children: "Menunggu Verifikasi" }), /* @__PURE__ */ jsx("span", {
													className: "font-mono bg-white/30 px-1 rounded text-[10px]",
													children: paymentSummary?.waitingCount ?? 0
												})]
											}),
											/* @__PURE__ */ jsxs("button", {
												onClick: () => setPaymentFilter("CONFIRMED"),
												className: `px-3 py-1.5 rounded-xl font-bold transition ${paymentFilter === "CONFIRMED" ? "bg-emerald-600 text-white shadow-xs" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"}`,
												children: [
													"Lunas (",
													paymentSummary?.confirmedCount ?? 0,
													")"
												]
											}),
											/* @__PURE__ */ jsxs("button", {
												onClick: () => setPaymentFilter("PENDING_PAYMENT"),
												className: `px-3 py-1.5 rounded-xl font-bold transition ${paymentFilter === "PENDING_PAYMENT" ? "bg-slate-800 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`,
												children: [
													"Belum Bayar (",
													paymentSummary?.pendingPaymentCount ?? 0,
													")"
												]
											}),
											/* @__PURE__ */ jsxs("button", {
												onClick: () => setPaymentFilter("REJECTED"),
												className: `px-3 py-1.5 rounded-xl font-bold transition ${paymentFilter === "REJECTED" ? "bg-rose-600 text-white shadow-xs" : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"}`,
												children: [
													"Ditolak (",
													paymentSummary?.rejectedCount ?? 0,
													")"
												]
											})
										]
									}), /* @__PURE__ */ jsxs("div", {
										className: "relative min-w-[240px]",
										children: [/* @__PURE__ */ jsx(Search, { className: "w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ jsx("input", {
											type: "text",
											value: paymentSearch,
											onChange: (e) => setPaymentSearch(e.target.value),
											placeholder: "Cari nama, NIK, tiket...",
											className: "w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
										})]
									})]
								}),
								/* @__PURE__ */ jsx("div", {
									className: "bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden",
									children: (() => {
										const filtered = payments.filter((p) => {
											if (paymentFilter === "WAITING_APPROVAL") return p.status === "WAITING_APPROVAL";
											if (paymentFilter === "CONFIRMED") return p.status === "CONFIRMED" || p.status === "COMPLETED";
											if (paymentFilter === "PENDING_PAYMENT") return p.status === "PENDING_PAYMENT";
											if (paymentFilter === "REJECTED") return p.status === "REJECTED";
											return true;
										}).filter((p) => {
											if (!paymentSearch.trim()) return true;
											const q = paymentSearch.toLowerCase();
											return p.registrationNumber.toLowerCase().includes(q) || p.user.name.toLowerCase().includes(q) || p.user.email.toLowerCase().includes(q) || p.user.idNumber && p.user.idNumber.toLowerCase().includes(q) || p.schedule.title.toLowerCase().includes(q);
										});
										if (filtered.length === 0) return /* @__PURE__ */ jsx("div", {
											className: "p-10 text-center text-slate-400 text-xs",
											children: "Tidak ada data pendaftaran pembayaran yang cocok dengan filter saat ini."
										});
										return /* @__PURE__ */ jsx("div", {
											className: "overflow-x-auto",
											children: /* @__PURE__ */ jsxs("table", {
												className: "w-full text-left text-xs",
												children: [/* @__PURE__ */ jsx("thead", {
													className: "bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200",
													children: /* @__PURE__ */ jsxs("tr", { children: [
														/* @__PURE__ */ jsx("th", {
															className: "py-3 px-4",
															children: "No. Registrasi"
														}),
														/* @__PURE__ */ jsx("th", {
															className: "py-3 px-4",
															children: "Peserta"
														}),
														/* @__PURE__ */ jsx("th", {
															className: "py-3 px-4",
															children: "Sesi Ujian"
														}),
														/* @__PURE__ */ jsx("th", {
															className: "py-3 px-4",
															children: "Metode & Tagihan"
														}),
														/* @__PURE__ */ jsx("th", {
															className: "py-3 px-4 text-center",
															children: "Bukti Transfer"
														}),
														/* @__PURE__ */ jsx("th", {
															className: "py-3 px-4 text-center",
															children: "Status"
														}),
														/* @__PURE__ */ jsx("th", {
															className: "py-3 px-4 text-right",
															children: "Aksi Verifikasi"
														})
													] })
												}), /* @__PURE__ */ jsx("tbody", {
													className: "divide-y divide-slate-100",
													children: filtered.map((item) => {
														const isConfirmed = item.status === "CONFIRMED" || item.status === "COMPLETED";
														const isWaiting = item.status === "WAITING_APPROVAL";
														const isPending = item.status === "PENDING_PAYMENT";
														const isRejected = item.status === "REJECTED";
														return /* @__PURE__ */ jsxs("tr", {
															className: `hover:bg-slate-50/80 transition ${isWaiting ? "bg-amber-50/30 font-medium" : ""}`,
															children: [
																/* @__PURE__ */ jsxs("td", {
																	className: "py-3 px-4",
																	children: [/* @__PURE__ */ jsx("span", {
																		className: "font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px] block w-fit",
																		children: item.registrationNumber
																	}), /* @__PURE__ */ jsx("span", {
																		className: "text-[10px] text-slate-400 mt-1 block",
																		children: new Date(item.createdAt).toLocaleDateString("id-ID", {
																			day: "numeric",
																			month: "short",
																			year: "numeric",
																			hour: "2-digit",
																			minute: "2-digit"
																		})
																	})]
																}),
																/* @__PURE__ */ jsxs("td", {
																	className: "py-3 px-4",
																	children: [
																		/* @__PURE__ */ jsx("div", {
																			className: "font-bold text-slate-900",
																			children: item.user.name
																		}),
																		/* @__PURE__ */ jsx("div", {
																			className: "text-[11px] text-slate-500 font-mono",
																			children: item.user.idNumber ? `NIK: ${item.user.idNumber}` : item.user.email
																		}),
																		item.user.phoneNumber && /* @__PURE__ */ jsxs("div", {
																			className: "text-[10px] text-slate-400",
																			children: ["WA: ", item.user.phoneNumber]
																		})
																	]
																}),
																/* @__PURE__ */ jsxs("td", {
																	className: "py-3 px-4",
																	children: [/* @__PURE__ */ jsx("div", {
																		className: "font-semibold text-slate-800",
																		children: item.schedule.title
																	}), /* @__PURE__ */ jsxs("span", {
																		className: "font-mono text-[10.5px] text-slate-500",
																		children: [
																			item.schedule.package.code,
																			" • ",
																			new Date(item.schedule.startTime).toLocaleDateString("id-ID", {
																				day: "numeric",
																				month: "short"
																			})
																		]
																	})]
																}),
																/* @__PURE__ */ jsxs("td", {
																	className: "py-3 px-4",
																	children: [/* @__PURE__ */ jsxs("span", {
																		className: "font-bold text-slate-900 block",
																		children: ["Rp ", item.amount.toLocaleString("id-ID")]
																	}), /* @__PURE__ */ jsx("span", {
																		className: "text-[11px] text-slate-500 flex items-center gap-1 mt-0.5",
																		children: item.paymentMethod === "CASH" ? /* @__PURE__ */ jsx("span", {
																			className: "text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 text-[10px]",
																			children: "Tunai di Loket"
																		}) : /* @__PURE__ */ jsx("span", {
																			className: "text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 text-[10px]",
																			children: "Transfer Bank"
																		})
																	})]
																}),
																/* @__PURE__ */ jsxs("td", {
																	className: "py-3 px-4 text-center",
																	children: [item.paymentProofUrl ? /* @__PURE__ */ jsxs("button", {
																		onClick: () => {
																			setPreviewPaymentItem(item);
																			setPreviewProofUrl(item.paymentProofUrl);
																		},
																		className: "inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition border border-blue-200",
																		children: [/* @__PURE__ */ jsx(Eye, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "Lihat Struk" })]
																	}) : item.paymentMethod === "CASH" ? /* @__PURE__ */ jsx("span", {
																		className: "text-[11px] text-emerald-700 font-medium",
																		children: "Loket Fisik"
																	}) : /* @__PURE__ */ jsx("span", {
																		className: "text-[11px] text-slate-400 italic",
																		children: "Belum diunggah"
																	}), item.paymentNotes && /* @__PURE__ */ jsx("span", {
																		className: "block text-[9.5px] text-slate-500 line-clamp-1 mt-0.5 max-w-[120px] mx-auto",
																		title: item.paymentNotes,
																		children: item.paymentNotes
																	})]
																}),
																/* @__PURE__ */ jsxs("td", {
																	className: "py-3 px-4 text-center",
																	children: [
																		isWaiting && /* @__PURE__ */ jsxs("span", {
																			className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-300",
																			children: [/* @__PURE__ */ jsx(Clock, { className: "w-3 h-3 text-amber-600 animate-pulse" }), /* @__PURE__ */ jsx("span", { children: "Menunggu Konfirmasi" })]
																		}),
																		isConfirmed && /* @__PURE__ */ jsxs("span", {
																			className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300",
																			children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "w-3 h-3 text-emerald-600" }), /* @__PURE__ */ jsx("span", { children: "Lunas Terverifikasi" })]
																		}),
																		isPending && /* @__PURE__ */ jsx("span", {
																			className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-600",
																			children: /* @__PURE__ */ jsx("span", { children: "Belum Bayar" })
																		}),
																		isRejected && /* @__PURE__ */ jsxs("span", {
																			className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-800 border border-rose-300",
																			title: item.rejectionReason || "",
																			children: [/* @__PURE__ */ jsx(AlertCircle, { className: "w-3 h-3 text-rose-600" }), /* @__PURE__ */ jsx("span", { children: "Ditolak" })]
																		})
																	]
																}),
																/* @__PURE__ */ jsx("td", {
																	className: "py-3 px-4 text-right",
																	children: /* @__PURE__ */ jsx("div", {
																		className: "flex items-center justify-end gap-1.5",
																		children: !isConfirmed ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("button", {
																			onClick: () => handleApprovePayment(item.id),
																			disabled: isProcessingPayment,
																			className: "px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1 disabled:opacity-50",
																			children: [/* @__PURE__ */ jsx(Check, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "Setujui" })]
																		}), /* @__PURE__ */ jsx("button", {
																			onClick: () => {
																				setRejectTarget(item);
																				setRejectionReasonText("");
																			},
																			disabled: isProcessingPayment,
																			className: "px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-xs border border-rose-200 transition disabled:opacity-50",
																			children: /* @__PURE__ */ jsx("span", { children: "Tolak" })
																		})] }) : /* @__PURE__ */ jsxs("div", {
																			className: "flex items-center justify-end gap-1.5",
																			children: [/* @__PURE__ */ jsxs("div", {
																				className: "text-[10px] text-slate-400 text-right",
																				children: [/* @__PURE__ */ jsx("span", {
																					className: "text-emerald-700 font-bold block",
																					children: "✓ Disetujui"
																				}), item.verifiedBy && /* @__PURE__ */ jsxs("span", { children: ["oleh ", item.verifiedBy] })]
																			}), item.user.phoneNumber && /* @__PURE__ */ jsxs("a", {
																				href: buildPaymentConfirmedWaUrl({
																					phoneNumber: item.user.phoneNumber,
																					studentName: item.user.name,
																					regNumber: item.registrationNumber,
																					scheduleTitle: item.schedule.title,
																					examDate: new Date(item.schedule.startTime).toLocaleString("id-ID", {
																						day: "numeric",
																						month: "short",
																						year: "numeric",
																						hour: "2-digit",
																						minute: "2-digit"
																					}) + " WIB",
																					startExamUrl: typeof window !== "undefined" ? `${window.location.origin}/student/dashboard` : ""
																				}),
																				target: "_blank",
																				rel: "noopener noreferrer",
																				className: "inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition",
																				title: "Kirim pesan konfirmasi tiket ke WhatsApp peserta",
																				children: [/* @__PURE__ */ jsx(MessageSquare, { className: "w-3 h-3" }), /* @__PURE__ */ jsx("span", { children: "WA" })]
																			})]
																		})
																	})
																})
															]
														}, item.id);
													})
												})]
											})
										});
									})()
								})
							]
						}),
						activeTab === "certificates" && /* @__PURE__ */ jsxs("div", {
							className: "space-y-6",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
									className: "text-base sm:text-lg font-bold text-slate-900",
									children: "Pangkalan Data E-Sertifikat TOEFL ITP® Terbit"
								}), /* @__PURE__ */ jsx("p", {
									className: "text-xs text-slate-500",
									children: "Seluruh sertifikat digital yang telah diterbitkan sistem dilengkapi nomor registrasi unik dan kode verifikasi."
								})] }), /* @__PURE__ */ jsxs("a", {
									href: appUrl("/api/admin/export/results?format=xlsx"),
									className: "inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition shrink-0",
									title: "Unduh seluruh rekap data sertifikat dan skor peserta dalam format Microsoft Excel",
									children: [/* @__PURE__ */ jsx(FileSpreadsheet, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "Ekspor Rekap Sertifikat (.xlsx)" })]
								})]
							}), /* @__PURE__ */ jsx("div", {
								className: "bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden",
								children: certificates.length === 0 ? /* @__PURE__ */ jsx("div", {
									className: "p-8 text-center text-slate-400 text-xs",
									children: "Belum ada sertifikat yang diterbitkan oleh sistem."
								}) : /* @__PURE__ */ jsx("div", {
									className: "overflow-x-auto",
									children: /* @__PURE__ */ jsxs("table", {
										className: "w-full text-left text-xs",
										children: [/* @__PURE__ */ jsx("thead", {
											className: "bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200",
											children: /* @__PURE__ */ jsxs("tr", { children: [
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-4",
													children: "No. Seri Sertifikat"
												}),
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-4",
													children: "Nama Peserta"
												}),
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-4",
													children: "Paket Ujian"
												}),
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-3 text-center",
													children: "Listening"
												}),
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-3 text-center",
													children: "Structure"
												}),
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-3 text-center",
													children: "Reading"
												}),
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-4 text-center",
													children: "Total Skor"
												}),
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-4 text-center",
													children: "CEFR"
												}),
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-4 text-right",
													children: "Aksi Dokumen"
												})
											] })
										}), /* @__PURE__ */ jsx("tbody", {
											className: "divide-y divide-slate-100",
											children: certificates.map((cert) => /* @__PURE__ */ jsxs("tr", {
												className: "hover:bg-slate-50 transition",
												children: [
													/* @__PURE__ */ jsx("td", {
														className: "py-3.5 px-4 font-mono font-bold text-amber-800",
														children: cert.certificateNumber
													}),
													/* @__PURE__ */ jsxs("td", {
														className: "py-3.5 px-4 font-bold text-slate-900",
														children: [/* @__PURE__ */ jsx("div", { children: cert.participantName }), cert.idNumber && /* @__PURE__ */ jsxs("span", {
															className: "text-[10px] text-slate-400 font-mono font-normal",
															children: ["NIK: ", cert.idNumber]
														})]
													}),
													/* @__PURE__ */ jsx("td", {
														className: "py-3.5 px-4 text-slate-600",
														children: cert.session.package.title
													}),
													/* @__PURE__ */ jsx("td", {
														className: "py-3.5 px-3 text-center font-mono",
														children: cert.listeningScore
													}),
													/* @__PURE__ */ jsx("td", {
														className: "py-3.5 px-3 text-center font-mono",
														children: cert.structureScore
													}),
													/* @__PURE__ */ jsx("td", {
														className: "py-3.5 px-3 text-center font-mono",
														children: cert.readingScore
													}),
													/* @__PURE__ */ jsx("td", {
														className: "py-3.5 px-4 text-center font-mono font-black text-blue-700 text-sm",
														children: cert.totalScore
													}),
													/* @__PURE__ */ jsx("td", {
														className: "py-3.5 px-4 text-center",
														children: /* @__PURE__ */ jsx("span", {
															className: "inline-block bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded font-bold text-[10px]",
															children: cert.cefrLevel
														})
													}),
													/* @__PURE__ */ jsx("td", {
														className: "py-3.5 px-4 text-right",
														children: /* @__PURE__ */ jsxs("div", {
															className: "flex items-center justify-end gap-1.5",
															children: [
																/* @__PURE__ */ jsxs(Link, {
																	href: `/certificate/${cert.verificationCode}`,
																	target: "_blank",
																	className: "inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 hover:bg-amber-100 font-bold rounded-lg transition",
																	children: [/* @__PURE__ */ jsx(Award, { className: "w-3 h-3" }), /* @__PURE__ */ jsx("span", { children: "PDF" })]
																}),
																/* @__PURE__ */ jsxs(Link, {
																	href: `/verify/${cert.verificationCode}`,
																	target: "_blank",
																	className: "inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-lg transition",
																	title: "Cek Verifikasi QR Publik",
																	children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "w-3 h-3 text-emerald-600" }), /* @__PURE__ */ jsx("span", { children: "QR" })]
																}),
																cert.user.phoneNumber && /* @__PURE__ */ jsxs("a", {
																	href: buildCertificateReadyWaUrl({
																		phoneNumber: cert.user.phoneNumber,
																		studentName: cert.participantName,
																		certNumber: cert.certificateNumber,
																		testDate: new Date(cert.testDate).toLocaleDateString("id-ID", {
																			day: "numeric",
																			month: "long",
																			year: "numeric"
																		}),
																		totalScore: cert.totalScore,
																		listeningScore: cert.listeningScore,
																		structureScore: cert.structureScore,
																		readingScore: cert.readingScore,
																		cefrLevel: cert.cefrLevel,
																		certUrl: typeof window !== "undefined" ? `${window.location.origin}/certificate/${cert.verificationCode}` : "",
																		verifyUrl: typeof window !== "undefined" ? `${window.location.origin}/verify/${cert.verificationCode}` : ""
																	}),
																	target: "_blank",
																	rel: "noopener noreferrer",
																	className: "inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg transition",
																	title: "Kirim Hasil Skor & Dokumen Sertifikat via WhatsApp",
																	children: [/* @__PURE__ */ jsx(MessageSquare, { className: "w-3 h-3" }), /* @__PURE__ */ jsx("span", { children: "WA" })]
																})
															]
														})
													})
												]
											}, cert.id))
										})]
									})
								})
							})]
						}),
						activeTab === "leads" && /* @__PURE__ */ jsxs("div", {
							className: "space-y-8",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4",
										children: [/* @__PURE__ */ jsx("div", {
											className: "w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0",
											children: /* @__PURE__ */ jsx(UserCheck, { className: "w-6 h-6" })
										}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
											className: "text-xs text-slate-500 font-medium uppercase tracking-wider block",
											children: "Total Calon Peserta"
										}), /* @__PURE__ */ jsx("span", {
											className: "text-2xl font-extrabold text-slate-900",
											children: leadSummary?.totalLeads ?? leads.length
										})] })]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4",
										children: [/* @__PURE__ */ jsx("div", {
											className: "w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0",
											children: /* @__PURE__ */ jsx(CheckCircle2, { className: "w-6 h-6" })
										}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
											className: "text-xs text-slate-500 font-medium uppercase tracking-wider block",
											children: "Selesai Uji Coba"
										}), /* @__PURE__ */ jsx("span", {
											className: "text-2xl font-extrabold text-emerald-700",
											children: leadSummary?.completedCount ?? 0
										})] })]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4",
										children: [/* @__PURE__ */ jsx("div", {
											className: "w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0",
											children: /* @__PURE__ */ jsx(Award, { className: "w-6 h-6" })
										}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
											className: "text-xs text-slate-500 font-medium uppercase tracking-wider block",
											children: "Rata-Rata Skor Demo"
										}), /* @__PURE__ */ jsx("span", {
											className: "text-2xl font-extrabold text-slate-900",
											children: leadSummary?.averageScore ?? 0
										})] })]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4",
										children: [/* @__PURE__ */ jsx("div", {
											className: "w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0",
											children: /* @__PURE__ */ jsx(PhoneCall, { className: "w-6 h-6" })
										}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
											className: "text-xs text-slate-500 font-medium uppercase tracking-wider block",
											children: "Leads Kontak WA"
										}), /* @__PURE__ */ jsx("span", {
											className: "text-2xl font-extrabold text-indigo-700",
											children: leadSummary?.withPhoneCount ?? 0
										})] })]
									})
								]
							}), /* @__PURE__ */ jsxs("div", {
								className: "bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2 w-full md:w-auto",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "relative flex-1 md:w-80",
											children: [/* @__PURE__ */ jsx(Search, { className: "w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ jsx("input", {
												type: "text",
												value: leadSearch,
												onChange: (e) => setLeadSearch(e.target.value),
												placeholder: "Cari nama atau nomor telepon...",
												className: "w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
											})]
										}), /* @__PURE__ */ jsxs("select", {
											value: leadFilter,
											onChange: (e) => setLeadFilter(e.target.value),
											className: "px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500",
											children: [
												/* @__PURE__ */ jsx("option", {
													value: "ALL",
													children: "Semua Status"
												}),
												/* @__PURE__ */ jsx("option", {
													value: "COMPLETED",
													children: "Selesai Demo"
												}),
												/* @__PURE__ */ jsx("option", {
													value: "IN_PROGRESS",
													children: "Sedang Mengerjakan"
												})
											]
										})]
									}), /* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2 w-full md:w-auto justify-end",
										children: [/* @__PURE__ */ jsxs("a", {
											href: appUrl("/api/admin/export/leads"),
											className: "inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition",
											children: [/* @__PURE__ */ jsx(FileSpreadsheet, { className: "w-4 h-4 text-emerald-600" }), /* @__PURE__ */ jsx("span", { children: "Ekspor CSV / Excel" })]
										}), /* @__PURE__ */ jsx("button", {
											onClick: fetchLeads,
											className: "p-2 text-slate-600 hover:bg-slate-200 rounded-xl transition",
											title: "Muat Ulang",
											children: /* @__PURE__ */ jsx(RotateCcw, { className: "w-4 h-4" })
										})]
									})]
								}), isLoadingLeads ? /* @__PURE__ */ jsxs("div", {
									className: "p-12 text-center text-xs text-slate-400",
									children: [/* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" }), /* @__PURE__ */ jsx("span", { children: "Memuat data calon peserta demo..." })]
								}) : leads.length === 0 ? /* @__PURE__ */ jsxs("div", {
									className: "p-12 text-center text-slate-400 space-y-2",
									children: [
										/* @__PURE__ */ jsx(UserCheck, { className: "w-10 h-10 mx-auto text-slate-300" }),
										/* @__PURE__ */ jsx("p", {
											className: "text-sm font-semibold text-slate-600",
											children: "Belum ada data calon peserta"
										}),
										/* @__PURE__ */ jsx("p", {
											className: "text-xs",
											children: "Calon peserta yang mencoba simulasi demo 30 soal di halaman depan akan otomatis tercatat di sini."
										})
									]
								}) : /* @__PURE__ */ jsx("div", {
									className: "overflow-x-auto",
									children: /* @__PURE__ */ jsxs("table", {
										className: "w-full text-left text-xs",
										children: [/* @__PURE__ */ jsx("thead", {
											className: "bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200",
											children: /* @__PURE__ */ jsxs("tr", { children: [
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-4",
													children: "No"
												}),
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-4",
													children: "Nama Calon Peserta"
												}),
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-4",
													children: "Kontak WhatsApp"
												}),
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-3 text-center",
													children: "Listening"
												}),
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-3 text-center",
													children: "Structure"
												}),
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-3 text-center",
													children: "Reading"
												}),
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-4 text-center",
													children: "Total Skor"
												}),
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-4 text-center",
													children: "Level"
												}),
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-4",
													children: "Waktu Pengerjaan"
												}),
												/* @__PURE__ */ jsx("th", {
													className: "py-3 px-4 text-right",
													children: "Aksi & Follow Up"
												})
											] })
										}), /* @__PURE__ */ jsx("tbody", {
											className: "divide-y divide-slate-100",
											children: leads.map((lead, idx) => /* @__PURE__ */ jsxs("tr", {
												className: "hover:bg-slate-50 transition",
												children: [
													/* @__PURE__ */ jsx("td", {
														className: "py-3.5 px-4 font-mono text-slate-400 font-semibold",
														children: idx + 1
													}),
													/* @__PURE__ */ jsxs("td", {
														className: "py-3.5 px-4 font-bold text-slate-900",
														children: [/* @__PURE__ */ jsx("div", { children: lead.name }), /* @__PURE__ */ jsx("span", {
															className: `inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold ${lead.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`,
															children: lead.status === "COMPLETED" ? "Selesai Demo" : "Sedang Mengerjakan"
														})]
													}),
													/* @__PURE__ */ jsx("td", {
														className: "py-3.5 px-4",
														children: lead.phoneNumber ? /* @__PURE__ */ jsx("div", {
															className: "font-mono font-bold text-slate-800",
															children: lead.phoneNumber
														}) : /* @__PURE__ */ jsx("span", {
															className: "text-slate-400 italic text-[11px]",
															children: "- Tidak diisi -"
														})
													}),
													/* @__PURE__ */ jsx("td", {
														className: "py-3.5 px-3 text-center font-mono",
														children: lead.status === "COMPLETED" ? /* @__PURE__ */ jsx("span", {
															title: `Benar: ${lead.listeningRaw}/10`,
															children: lead.listeningScaled
														}) : "-"
													}),
													/* @__PURE__ */ jsx("td", {
														className: "py-3.5 px-3 text-center font-mono",
														children: lead.status === "COMPLETED" ? /* @__PURE__ */ jsx("span", {
															title: `Benar: ${lead.structureRaw}/10`,
															children: lead.structureScaled
														}) : "-"
													}),
													/* @__PURE__ */ jsx("td", {
														className: "py-3.5 px-3 text-center font-mono",
														children: lead.status === "COMPLETED" ? /* @__PURE__ */ jsx("span", {
															title: `Benar: ${lead.readingRaw}/10`,
															children: lead.readingScaled
														}) : "-"
													}),
													/* @__PURE__ */ jsx("td", {
														className: "py-3.5 px-4 text-center font-mono font-black text-blue-700 text-sm",
														children: lead.status === "COMPLETED" ? lead.totalScore : "-"
													}),
													/* @__PURE__ */ jsx("td", {
														className: "py-3.5 px-4 text-center",
														children: lead.cefrLevel ? /* @__PURE__ */ jsx("span", {
															className: "inline-block bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded font-bold text-[10px]",
															children: lead.cefrLevel
														}) : "-"
													}),
													/* @__PURE__ */ jsxs("td", {
														className: "py-3.5 px-4 text-slate-500 text-[11px]",
														children: [/* @__PURE__ */ jsx("div", { children: new Date(lead.startedAt).toLocaleDateString("id-ID", {
															day: "numeric",
															month: "short",
															year: "numeric"
														}) }), /* @__PURE__ */ jsx("span", {
															className: "text-[10px] text-slate-400 font-mono",
															children: new Date(lead.startedAt).toLocaleTimeString("id-ID", {
																hour: "2-digit",
																minute: "2-digit"
															})
														})]
													}),
													/* @__PURE__ */ jsx("td", {
														className: "py-3.5 px-4 text-right",
														children: /* @__PURE__ */ jsxs("div", {
															className: "flex items-center justify-end gap-1.5",
															children: [lead.phoneNumber && /* @__PURE__ */ jsxs("a", {
																href: buildLeadGreetingWaUrl({
																	phoneNumber: lead.phoneNumber,
																	leadName: lead.name,
																	totalScore: lead.totalScore,
																	cefrLevel: lead.cefrLevel || void 0,
																	registerUrl: typeof window !== "undefined" ? `${window.location.origin}/register` : ""
																}),
																target: "_blank",
																rel: "noopener noreferrer",
																className: "inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg transition",
																title: "Kirim Pesan Sapaan & Penawaran Jadwal Resmi via WhatsApp",
																children: [/* @__PURE__ */ jsx(MessageSquare, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "Chat WA" })]
															}), /* @__PURE__ */ jsx("button", {
																onClick: () => handleDeleteLead(lead.id),
																disabled: isDeletingLeadId === lead.id,
																className: "p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition",
																title: "Hapus Data Lead",
																children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
															})]
														})
													})
												]
											}, lead.id))
										})]
									})
								})]
							})]
						}),
						activeTab === "settings" && /* @__PURE__ */ jsx(AdminInstitutionSettings, {
							operatingMode,
							onUpdateOperatingMode: handleUpdateOperatingMode,
							isUpdatingMode,
							onLogoChange: (url) => setInstitutionLogoUrl(url)
						})
					]
				})]
			}),
			/* @__PURE__ */ jsx(PackagePreviewModal, {
				isOpen: previewModalOpen,
				onClose: () => {
					setPreviewModalOpen(false);
					setValidationReport(null);
					setPendingPackageData(null);
				},
				report: validationReport,
				packageData: pendingPackageData,
				onConfirmSave: handleConfirmSavePackage
			}),
			previewProofUrl && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-white rounded-3xl p-6 max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between pb-3 border-b border-slate-100",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h3", {
								className: "text-base font-bold text-slate-900 flex items-center gap-2",
								children: [/* @__PURE__ */ jsx(Receipt, { className: "w-5 h-5 text-blue-600" }), /* @__PURE__ */ jsx("span", { children: "Struk Bukti Pembayaran" })]
							}), previewPaymentItem && /* @__PURE__ */ jsxs("span", {
								className: "text-xs text-slate-500 font-mono",
								children: [
									previewPaymentItem.registrationNumber,
									" • ",
									previewPaymentItem.user.name
								]
							})] }), /* @__PURE__ */ jsx("button", {
								onClick: () => {
									setPreviewProofUrl(null);
									setPreviewPaymentItem(null);
								},
								className: "text-slate-400 hover:text-slate-700 p-1",
								children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
							})]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "flex-1 overflow-auto my-4 bg-slate-900 rounded-2xl flex items-center justify-center p-2 min-h-[300px]",
							children: previewProofUrl.endsWith(".pdf") ? /* @__PURE__ */ jsx("iframe", {
								src: appUrl(previewProofUrl),
								className: "w-full h-[450px] rounded-xl bg-white",
								title: "PDF Struk"
							}) : /* @__PURE__ */ jsx("img", {
								src: appUrl(previewProofUrl),
								alt: "Bukti Transfer",
								className: "max-h-[500px] w-auto max-w-full object-contain rounded-lg"
							})
						}),
						previewPaymentItem && /* @__PURE__ */ jsxs("div", {
							className: "bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
								className: "font-bold text-slate-900",
								children: ["Tagihan: Rp ", previewPaymentItem.amount.toLocaleString("id-ID")]
							}), previewPaymentItem.paymentNotes && /* @__PURE__ */ jsxs("div", {
								className: "text-slate-500 text-[11px] mt-0.5",
								children: ["Catatan Pengirim: ", previewPaymentItem.paymentNotes]
							})] }), /* @__PURE__ */ jsxs("a", {
								href: appUrl(previewProofUrl),
								target: "_blank",
								rel: "noopener noreferrer",
								className: "text-blue-600 hover:underline flex items-center gap-1 font-semibold",
								children: [/* @__PURE__ */ jsx(ExternalLink, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "Buka di Tab Baru" })]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-end gap-2 pt-2 border-t border-slate-100",
							children: [/* @__PURE__ */ jsx("button", {
								onClick: () => {
									setPreviewProofUrl(null);
									setPreviewPaymentItem(null);
								},
								className: "px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition",
								children: "Tutup"
							}), previewPaymentItem && previewPaymentItem.status !== "CONFIRMED" && /* @__PURE__ */ jsxs("button", {
								onClick: () => handleApprovePayment(previewPaymentItem.id),
								disabled: isProcessingPayment,
								className: "px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5",
								children: [/* @__PURE__ */ jsx(Check, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "Setujui Pembayaran (Lunas)" })]
							})]
						})
					]
				})
			}),
			rejectTarget && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2 text-rose-600",
								children: [/* @__PURE__ */ jsx(AlertCircle, { className: "w-5 h-5" }), /* @__PURE__ */ jsx("h3", {
									className: "text-base font-bold text-slate-900",
									children: "Tolak Pembayaran Tiket"
								})]
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => {
									setRejectTarget(null);
									setRejectionReasonText("");
								},
								className: "text-slate-400 hover:text-slate-700 p-1",
								children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
							})]
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "text-xs text-slate-600",
							children: [
								"Pendaftaran tiket atas nama ",
								/* @__PURE__ */ jsx("strong", { children: rejectTarget.user.name }),
								" (",
								rejectTarget.registrationNumber,
								") akan ditolak. Berikan alasan penolakan agar peserta dapat mengunggah bukti yang benar."
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-[11px] font-bold text-slate-500 block",
								children: "Pilihan Alasan Cepat:"
							}), /* @__PURE__ */ jsx("div", {
								className: "flex flex-wrap gap-1.5",
								children: [
									"Dana belum masuk ke mutasi rekening resmi",
									"Nominal transfer tidak sesuai tagihan",
									"Foto bukti transfer buram / tidak terbaca",
									"Bukan bukti transfer resmi bank"
								].map((preset) => /* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setRejectionReasonText(preset),
									className: "text-[10px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition",
									children: preset
								}, preset))
							})]
						}),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-bold text-slate-800 mb-1",
							children: "Alasan Penolakan:"
						}), /* @__PURE__ */ jsx("textarea", {
							rows: 3,
							required: true,
							value: rejectionReasonText,
							onChange: (e) => setRejectionReasonText(e.target.value),
							placeholder: "Tuliskan alasan penolakan...",
							className: "w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
						})] }),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2 pt-2",
							children: [/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => {
									setRejectTarget(null);
									setRejectionReasonText("");
								},
								className: "flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition",
								children: "Batal"
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: handleRejectPayment,
								disabled: isProcessingPayment,
								className: "flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs transition disabled:opacity-50",
								children: isProcessingPayment ? "Memproses..." : "Konfirmasi Tolak"
							})]
						})
					]
				})
			})
		]
	});
}
//#endregion
//#region resources/js/Pages/Admin/Login.tsx
var Login_exports$1 = /* @__PURE__ */ __exportAll({ default: () => AdminLoginPage });
function AdminLoginPage() {
	const router = useRouter();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const handleLogin = async (e) => {
		e.preventDefault();
		setErrorMessage("");
		try {
			setIsLoading(true);
			const res = await apiFetch("/api/admin/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username,
					password
				})
			});
			const data = await res.json();
			if (!res.ok) {
				setErrorMessage(data.error || "Gagal masuk. Periksa username dan password.");
				return;
			}
			router.push("/admin");
		} catch (err) {
			console.error(err);
			setErrorMessage("Terjadi kesalahan jaringan saat login.");
		} finally {
			setIsLoading(false);
		}
	};
	return /* @__PURE__ */ jsx("div", {
		className: "min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans text-slate-100",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md w-full bg-slate-800/90 border border-slate-700 rounded-3xl p-8 shadow-2xl backdrop-blur-md",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "text-center mb-8",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "w-14 h-14 bg-blue-600/20 border border-blue-500/40 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner",
							children: /* @__PURE__ */ jsx(ShieldCheck, { className: "w-7 h-7" })
						}),
						/* @__PURE__ */ jsx("h1", {
							className: "text-2xl font-bold text-white tracking-tight",
							children: "Portal Administrator"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-xs text-slate-400 mt-1",
							children: "Masuk untuk mengelola bank soal, token ujian, dan rekapitulasi nilai."
						})
					]
				}),
				errorMessage && /* @__PURE__ */ jsx("div", {
					className: "mb-5 p-3 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-300 text-xs font-medium text-center",
					children: errorMessage
				}),
				/* @__PURE__ */ jsxs("form", {
					onSubmit: handleLogin,
					className: "space-y-4",
					children: [
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5",
							children: "Username"
						}), /* @__PURE__ */ jsxs("div", {
							className: "relative",
							children: [/* @__PURE__ */ jsx(User, { className: "w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ jsx("input", {
								type: "text",
								required: true,
								value: username,
								onChange: (e) => setUsername(e.target.value),
								placeholder: "Masukkan ID / Username Administrator",
								className: "w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
							})]
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5",
							children: "Password"
						}), /* @__PURE__ */ jsxs("div", {
							className: "relative",
							children: [/* @__PURE__ */ jsx(Lock, { className: "w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ jsx("input", {
								type: "password",
								required: true,
								value: password,
								onChange: (e) => setPassword(e.target.value),
								placeholder: "Masukkan kata sandi akses",
								className: "w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
							})]
						})] }),
						/* @__PURE__ */ jsxs("div", {
							className: "bg-slate-900/60 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-400 space-y-1",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "font-semibold text-slate-300 block flex items-center justify-between",
								children: [/* @__PURE__ */ jsx("span", { children: "Akses Khusus Administrator:" }), /* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-emerald-400 font-mono",
									children: "Sistem Terenkripsi"
								})]
							}), /* @__PURE__ */ jsx("p", {
								className: "text-[11px] text-slate-400",
								children: "Gunakan akun resmi pengawas/administrator lembaga yang telah terdaftar."
							})]
						}),
						/* @__PURE__ */ jsxs("button", {
							type: "submit",
							disabled: isLoading,
							className: "w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white rounded-xl font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 group disabled:opacity-50",
							children: [/* @__PURE__ */ jsx("span", { children: isLoading ? "Memverifikasi..." : "Masuk ke Panel Admin" }), /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 group-hover:translate-x-1 transition" })]
						})
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-6 pt-6 border-t border-slate-700 text-center",
					children: /* @__PURE__ */ jsxs(Link, {
						href: "/",
						className: "inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition font-medium",
						children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "Kembali ke Halaman Peserta Ujian" })]
					})
				})
			]
		})
	});
}
//#endregion
//#region resources/js/components/admin/AudioSegmentEditor.tsx
function formatTime(seconds) {
	if (isNaN(seconds) || seconds < 0) return "00:00.0";
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m.toString().padStart(2, "0")}:${s.toFixed(1).padStart(4, "0")}`;
}
var AudioSegmentEditor = ({ audioUrl, onChange, defaultBaseUrl = "/Toefl-test-3.mp3", label = "Audio & Segmentasi Waktu (Timestamp)", onUpload, isUploading = false }) => {
	const parseUrl = (raw) => {
		if (!raw) return {
			base: defaultBaseUrl,
			start: 0,
			end: 0,
			hasSegment: false
		};
		const hashIndex = raw.indexOf("#t=");
		if (hashIndex !== -1) {
			const base = raw.substring(0, hashIndex);
			const [s, e] = raw.substring(hashIndex + 3).split(",");
			return {
				base: base || defaultBaseUrl,
				start: parseFloat(s) || 0,
				end: parseFloat(e) || 0,
				hasSegment: true
			};
		}
		return {
			base: raw,
			start: 0,
			end: 0,
			hasSegment: false
		};
	};
	const initial = parseUrl(audioUrl);
	const [baseUrl, setBaseUrl] = useState(initial.base);
	const [startTime, setStartTime] = useState(initial.start);
	const [endTime, setEndTime] = useState(initial.end);
	const [isSegmentMode, setIsSegmentMode] = useState(initial.hasSegment || !!audioUrl);
	const audioRef = useRef(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	useEffect(() => {
		const parsed = parseUrl(audioUrl);
		setBaseUrl(parsed.base);
		setStartTime(parsed.start);
		setEndTime(parsed.end);
		if (parsed.hasSegment) setIsSegmentMode(true);
	}, [audioUrl]);
	const emitChange = (base, start, end, segMode) => {
		if (!base) {
			onChange("");
			return;
		}
		if (segMode && (start > 0 || end > 0)) {
			const validEnd = end > start ? end : start + 5;
			onChange(`${base}#t=${start.toFixed(2)},${validEnd.toFixed(2)}`);
		} else onChange(base);
	};
	const handleStartChange = (valSec) => {
		const safeVal = Math.max(0, parseFloat(valSec.toFixed(2)));
		setStartTime(safeVal);
		emitChange(baseUrl, safeVal, endTime, isSegmentMode);
	};
	const handleEndChange = (valSec) => {
		const safeVal = Math.max(0, parseFloat(valSec.toFixed(2)));
		setEndTime(safeVal);
		emitChange(baseUrl, startTime, safeVal, isSegmentMode);
	};
	const nudgeStart = (delta) => {
		handleStartChange(Math.max(0, startTime + delta));
	};
	const nudgeEnd = (delta) => {
		handleEndChange(Math.max(0, endTime + delta));
	};
	const togglePlayPreview = () => {
		if (!audioRef.current) return;
		const audio = audioRef.current;
		if (isPlaying) {
			audio.pause();
			setIsPlaying(false);
		} else {
			audio.currentTime = startTime;
			audio.play().catch((e) => console.error("Playback failed:", e));
			setIsPlaying(true);
		}
	};
	const handleTimeUpdate = () => {
		if (!audioRef.current) return;
		const cur = audioRef.current.currentTime;
		setCurrentTime(cur);
		if (isSegmentMode && endTime > startTime && cur >= endTime) {
			audioRef.current.pause();
			setIsPlaying(false);
			audioRef.current.currentTime = startTime;
		}
	};
	const handleLoadedMetadata = () => {
		if (audioRef.current) setDuration(audioRef.current.duration);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-3 shadow-2xs",
		children: [
			/* @__PURE__ */ jsx("audio", {
				ref: audioRef,
				src: appUrl(baseUrl),
				onTimeUpdate: handleTimeUpdate,
				onLoadedMetadata: handleLoadedMetadata,
				onEnded: () => setIsPlaying(false),
				preload: "metadata"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(Volume2, { className: "w-4 h-4 text-blue-600" }), /* @__PURE__ */ jsx("span", {
						className: "font-bold text-slate-800 text-[11px]",
						children: label
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => {
							const nextMode = !isSegmentMode;
							setIsSegmentMode(nextMode);
							emitChange(baseUrl, startTime, endTime, nextMode);
						},
						className: `px-2.5 py-1 rounded-lg font-medium text-[10px] transition flex items-center gap-1.5 ${isSegmentMode ? "bg-blue-600 text-white shadow-2xs" : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`,
						children: [/* @__PURE__ */ jsx(Scissors, { className: "w-3 h-3" }), /* @__PURE__ */ jsx("span", { children: isSegmentMode ? "Mode Potongan (Aktif)" : "Mode File Utuh" })]
					}), onUpload && /* @__PURE__ */ jsxs("label", {
						className: "cursor-pointer px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-[10px] font-bold text-slate-700 transition flex items-center gap-1 shadow-2xs",
						children: [
							/* @__PURE__ */ jsx(Upload, { className: "w-3 h-3" }),
							/* @__PURE__ */ jsx("span", { children: isUploading ? "Mengunggah..." : "Upload MP3" }),
							/* @__PURE__ */ jsx("input", {
								type: "file",
								accept: ".mp3,.wav,.m4a",
								className: "hidden",
								onChange: (e) => {
									const file = e.target.files?.[0];
									if (file) onUpload(file);
								}
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
				className: "flex justify-between items-center mb-1",
				children: [/* @__PURE__ */ jsx("label", {
					className: "text-[10px] font-semibold text-slate-500 uppercase tracking-wider",
					children: "File Audio Sumber:"
				}), baseUrl !== defaultBaseUrl && /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => {
						setBaseUrl(defaultBaseUrl);
						emitChange(defaultBaseUrl, startTime, endTime, isSegmentMode);
					},
					className: "text-[10px] text-blue-600 hover:underline flex items-center gap-0.5",
					children: [
						/* @__PURE__ */ jsx(RotateCcw, { className: "w-2.5 h-2.5" }),
						" Gunakan Master (",
						defaultBaseUrl,
						")"
					]
				})]
			}), /* @__PURE__ */ jsx("input", {
				type: "text",
				value: baseUrl,
				onChange: (e) => {
					const val = e.target.value;
					setBaseUrl(val);
					emitChange(val, startTime, endTime, isSegmentMode);
				},
				placeholder: "/Toefl-test-3.mp3",
				className: "w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-[11px] text-slate-800 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
			})] }),
			isSegmentMode && /* @__PURE__ */ jsxs("div", {
				className: "bg-white p-3 rounded-lg border border-slate-200 space-y-3",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between text-[11px]",
									children: [/* @__PURE__ */ jsxs("span", {
										className: "font-bold text-slate-700 flex items-center gap-1",
										children: [/* @__PURE__ */ jsx(Clock, { className: "w-3 h-3 text-emerald-600" }), " Detik Mulai:"]
									}), /* @__PURE__ */ jsx("span", {
										className: "font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200",
										children: formatTime(startTime)
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ jsx("input", {
										type: "number",
										step: "0.1",
										min: "0",
										value: startTime,
										onChange: (e) => handleStartChange(parseFloat(e.target.value) || 0),
										className: "w-full px-2 py-1 rounded border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
									}), /* @__PURE__ */ jsx("span", {
										className: "text-[10px] text-slate-500 shrink-0",
										children: "dtk"
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-1 pt-0.5",
									children: [
										/* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => nudgeStart(-1),
											className: "flex-1 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-[10px] font-mono text-slate-700 font-bold",
											title: "Kurang 1 detik",
											children: "-1s"
										}),
										/* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => nudgeStart(-.5),
											className: "flex-1 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-[10px] font-mono text-slate-700 font-bold",
											title: "Kurang 0.5 detik",
											children: "-0.5s"
										}),
										/* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => nudgeStart(.5),
											className: "flex-1 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-[10px] font-mono text-slate-700 font-bold",
											title: "Tambah 0.5 detik",
											children: "+0.5s"
										}),
										/* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => nudgeStart(1),
											className: "flex-1 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-[10px] font-mono text-slate-700 font-bold",
											title: "Tambah 1 detik",
											children: "+1s"
										})
									]
								})
							]
						}), /* @__PURE__ */ jsxs("div", {
							className: "bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between text-[11px]",
									children: [/* @__PURE__ */ jsxs("span", {
										className: "font-bold text-slate-700 flex items-center gap-1",
										children: [/* @__PURE__ */ jsx(Clock, { className: "w-3 h-3 text-red-600" }), " Detik Selesai:"]
									}), /* @__PURE__ */ jsx("span", {
										className: "font-mono font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200",
										children: formatTime(endTime)
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ jsx("input", {
										type: "number",
										step: "0.1",
										min: "0",
										value: endTime,
										onChange: (e) => handleEndChange(parseFloat(e.target.value) || 0),
										className: "w-full px-2 py-1 rounded border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
									}), /* @__PURE__ */ jsx("span", {
										className: "text-[10px] text-slate-500 shrink-0",
										children: "dtk"
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-1 pt-0.5",
									children: [
										/* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => nudgeEnd(-1),
											className: "flex-1 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-[10px] font-mono text-slate-700 font-bold",
											title: "Kurang 1 detik",
											children: "-1s"
										}),
										/* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => nudgeEnd(-.5),
											className: "flex-1 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-[10px] font-mono text-slate-700 font-bold",
											title: "Kurang 0.5 detik",
											children: "-0.5s"
										}),
										/* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => nudgeEnd(.5),
											className: "flex-1 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-[10px] font-mono text-slate-700 font-bold",
											title: "Tambah 0.5 detik",
											children: "+0.5s"
										}),
										/* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => nudgeEnd(1),
											className: "flex-1 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-[10px] font-mono text-slate-700 font-bold",
											title: "Tambah 1 detik",
											children: "+1s"
										})
									]
								})
							]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-col sm:flex-row items-center gap-2 pt-1 border-t border-slate-100",
						children: [
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: togglePlayPreview,
								className: `w-full sm:w-auto px-3 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition ${isPlaying ? "bg-red-600 hover:bg-red-700 text-white shadow-2xs" : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"}`,
								children: isPlaying ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Square, { className: "w-3.5 h-3.5 fill-current" }), /* @__PURE__ */ jsx("span", { children: "Stop Preview" })] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Play, { className: "w-3.5 h-3.5 fill-current" }), /* @__PURE__ */ jsxs("span", { children: [
									"Test Putar Potongan (",
									formatTime(startTime),
									" - ",
									formatTime(endTime),
									")"
								] })] })
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "text-[11px] font-mono text-slate-500 flex items-center gap-1",
								children: [
									/* @__PURE__ */ jsx("span", { children: "Posisi:" }),
									/* @__PURE__ */ jsx("span", {
										className: "font-bold text-slate-800",
										children: formatTime(currentTime)
									}),
									duration > 0 && /* @__PURE__ */ jsxs("span", { children: ["/ ", formatTime(duration)] })
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex-1 w-full flex items-center gap-2",
								children: [
									/* @__PURE__ */ jsx("input", {
										type: "range",
										min: "0",
										max: duration || 100,
										step: "0.1",
										value: currentTime,
										onChange: (e) => {
											const targetSec = parseFloat(e.target.value);
											setCurrentTime(targetSec);
											if (audioRef.current) audioRef.current.currentTime = targetSec;
										},
										className: "w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
									}),
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => handleStartChange(currentTime),
										title: "Gunakan posisi audio saat ini sebagai waktu mulai",
										className: "shrink-0 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 rounded text-[10px] font-semibold",
										children: "📌 Set Mulai"
									}),
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => handleEndChange(currentTime),
										title: "Gunakan posisi audio saat ini sebagai waktu selesai",
										className: "shrink-0 px-2 py-0.5 bg-red-50 text-red-700 border border-red-300 hover:bg-red-100 rounded text-[10px] font-semibold",
										children: "📌 Set Selesai"
									})
								]
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bg-slate-50 p-2 rounded text-[10px] font-mono text-slate-600 border border-slate-100 flex items-center justify-between",
						children: [/* @__PURE__ */ jsx("span", { children: "Hasil URL Tersimpan:" }), /* @__PURE__ */ jsxs("span", {
							className: "font-bold text-blue-700",
							children: [
								baseUrl,
								"#t=",
								startTime.toFixed(2),
								",",
								endTime.toFixed(2)
							]
						})]
					})
				]
			})
		]
	});
};
//#endregion
//#region resources/js/Pages/Admin/Package.tsx
var Package_exports = /* @__PURE__ */ __exportAll({ default: () => PackageEditorPage });
function PackageEditorPage({ params }) {
	const { packageId } = use(params);
	const router = useRouter();
	const [pkg, setPkg] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [activeSection, setActiveSection] = useState("LISTENING");
	const [saveStatus, setSaveStatus] = useState({});
	const [isUploadingAudio, setIsUploadingAudio] = useState({});
	useEffect(() => {
		async function loadPackage() {
			try {
				setIsLoading(true);
				const json = await (await apiFetch(`/api/admin/packages/${packageId}/detail`)).json();
				if (json.package) setPkg(json.package);
				else {
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
	const handleSaveQuestion = async (q) => {
		try {
			setSaveStatus((prev) => ({
				...prev,
				[q.id]: true
			}));
			if (!(await (await apiFetch(`/api/admin/questions/${q.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(q)
			})).json()).success) alert("Gagal menyimpan perubahan soal.");
		} catch (err) {
			console.error(err);
			alert("Terjadi kesalahan.");
		} finally {
			setTimeout(() => {
				setSaveStatus((prev) => ({
					...prev,
					[q.id]: false
				}));
			}, 1500);
		}
	};
	const handleSavePassage = async (p) => {
		try {
			setSaveStatus((prev) => ({
				...prev,
				[p.id]: true
			}));
			if (!(await (await apiFetch(`/api/admin/passages/${p.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(p)
			})).json()).success) alert("Gagal menyimpan teks bacaan.");
		} catch (err) {
			console.error(err);
			alert("Terjadi kesalahan.");
		} finally {
			setTimeout(() => {
				setSaveStatus((prev) => ({
					...prev,
					[p.id]: false
				}));
			}, 1500);
		}
	};
	const handleAudioUpload = async (targetId, file, isPassage = false) => {
		try {
			setIsUploadingAudio((prev) => ({
				...prev,
				[targetId]: true
			}));
			const formData = new FormData();
			formData.append("audio", file);
			const json = await (await apiFetch("/api/admin/upload-audio", {
				method: "POST",
				body: formData
			})).json();
			if (json.success && json.url) {
				if (isPassage) {
					setPkg((prev) => {
						if (!prev) return null;
						return {
							...prev,
							sections: prev.sections.map((sec) => ({
								...sec,
								passages: sec.passages.map((p) => p.id === targetId ? {
									...p,
									audioUrl: json.url
								} : p)
							}))
						};
					});
					await apiFetch(`/api/admin/passages/${targetId}`, {
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ audioUrl: json.url })
					});
				} else {
					setPkg((prev) => {
						if (!prev) return null;
						return {
							...prev,
							sections: prev.sections.map((sec) => ({
								...sec,
								questions: sec.questions.map((q) => q.id === targetId ? {
									...q,
									audioUrl: json.url
								} : q)
							}))
						};
					});
					await apiFetch(`/api/admin/questions/${targetId}`, {
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ audioUrl: json.url })
					});
				}
				alert("Audio berhasil diunggah!");
			} else alert(json.error || "Gagal mengunggah audio.");
		} catch (err) {
			console.error(err);
			alert("Terjadi gangguan jaringan saat mengunggah audio.");
		} finally {
			setIsUploadingAudio((prev) => ({
				...prev,
				[targetId]: false
			}));
		}
	};
	const updateQuestionField = (sectionType, qId, field, value) => {
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
							return {
								...q,
								[field]: value
							};
						})
					};
				})
			};
		});
	};
	const updatePassageField = (sectionType, pId, field, value) => {
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
							return {
								...p,
								[field]: value
							};
						})
					};
				})
			};
		});
	};
	if (isLoading || !pkg) return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4",
		children: [/* @__PURE__ */ jsx(Loader2, { className: "w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" }), /* @__PURE__ */ jsx("p", {
			className: "text-slate-600 font-semibold text-sm",
			children: "Memuat seluruh bank soal paket..."
		})]
	});
	const currentSec = pkg.sections.find((s) => s.sectionType === activeSection);
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800",
		children: [/* @__PURE__ */ jsxs("header", {
			className: "bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ jsx(Link, {
						href: "/admin",
						className: "p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition",
						title: "Kembali ke Dashboard Admin",
						children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" })
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ jsx("h1", {
							className: "text-base sm:text-lg font-bold text-slate-900 leading-none",
							children: pkg.title
						}), /* @__PURE__ */ jsx("span", {
							className: "text-[10px] font-mono font-bold bg-slate-100 text-blue-700 border border-slate-200 px-2 py-0.5 rounded",
							children: pkg.code
						})]
					}), /* @__PURE__ */ jsx("p", {
						className: "text-[11px] text-slate-500 font-medium mt-0.5",
						children: "Editor Bank Soal Interaktif (Kunci Jawaban, Teks, & Audio)"
					})] })]
				}), /* @__PURE__ */ jsxs("a", {
					href: appUrl(`/api/admin/packages/${pkg.id}/export`),
					className: "flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs shadow-xs transition active:scale-95",
					children: [/* @__PURE__ */ jsx(Download, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "Ekspor JSON" })]
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 border-t border-slate-100",
				children: [
					/* @__PURE__ */ jsxs("button", {
						onClick: () => setActiveSection("LISTENING"),
						className: `py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${activeSection === "LISTENING" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`,
						children: [/* @__PURE__ */ jsx(Headphones, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Section 1: Listening (50 Soal)" })]
					}),
					/* @__PURE__ */ jsxs("button", {
						onClick: () => setActiveSection("STRUCTURE"),
						className: `py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${activeSection === "STRUCTURE" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`,
						children: [/* @__PURE__ */ jsx(BookOpen, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Section 2: Structure (40 Soal)" })]
					}),
					/* @__PURE__ */ jsxs("button", {
						onClick: () => setActiveSection("READING"),
						className: `py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${activeSection === "READING" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-800"}`,
						children: [/* @__PURE__ */ jsx(FileText, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Section 3: Reading (50 Soal • 5 Passage)" })]
					})
				]
			})]
		}), /* @__PURE__ */ jsxs("main", {
			className: "flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6",
			children: [currentSec?.passages && currentSec.passages.length > 0 && /* @__PURE__ */ jsxs("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ jsxs("h2", {
					className: "text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(FileEdit, { className: "w-4 h-4 text-blue-600" }), /* @__PURE__ */ jsxs("span", { children: [
						"Naskah Bacaan / Passage (",
						currentSec.passages.length,
						" Teks)"
					] })]
				}), /* @__PURE__ */ jsx("div", {
					className: "grid grid-cols-1 gap-4",
					children: currentSec.passages.map((p) => /* @__PURE__ */ jsxs("div", {
						className: "bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ jsxs("span", {
									className: "text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md",
									children: ["Passage #", p.orderIndex]
								}), /* @__PURE__ */ jsx("button", {
									onClick: () => handleSavePassage(p),
									className: "flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-xs",
									children: saveStatus[p.id] ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Check, { className: "w-3.5 h-3.5 text-emerald-400" }), /* @__PURE__ */ jsx("span", { children: "Tersimpan!" })] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Save, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "Simpan Passage" })] })
								})]
							}),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-[11px] font-semibold text-slate-500 uppercase mb-1",
								children: "Judul Passage"
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								value: p.title || "",
								onChange: (e) => updatePassageField(currentSec.sectionType, p.id, "title", e.target.value),
								className: "w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-[11px] font-semibold text-slate-500 uppercase mb-1",
								children: "Isi Teks / Naskah Dialog Passage"
							}), /* @__PURE__ */ jsx("textarea", {
								rows: 4,
								value: p.content || "",
								onChange: (e) => updatePassageField(currentSec.sectionType, p.id, "content", e.target.value),
								className: "w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-serif leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
							})] }),
							currentSec.sectionType === "LISTENING" && /* @__PURE__ */ jsx(AudioSegmentEditor, {
								label: "Audio Percakapan / Monolog (Passage):",
								audioUrl: p.audioUrl,
								onChange: (newUrl) => updatePassageField(currentSec.sectionType, p.id, "audioUrl", newUrl),
								onUpload: (file) => handleAudioUpload(p.id, file, true),
								isUploading: isUploadingAudio[p.id],
								defaultBaseUrl: "/Toefl-test-3.mp3"
							})
						]
					}, p.id))
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ jsxs("h2", {
					className: "text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(BookOpen, { className: "w-4 h-4 text-blue-600" }), /* @__PURE__ */ jsxs("span", { children: [
						"Daftar Pertanyaan (",
						currentSec?.questions.length ?? 0,
						" Soal)"
					] })]
				}), /* @__PURE__ */ jsx("div", {
					className: "space-y-4",
					children: currentSec?.questions.map((q) => /* @__PURE__ */ jsxs("div", {
						className: "bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-slate-300 transition",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between border-b border-slate-100 pb-3",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ jsxs("span", {
										className: "font-bold text-sm text-slate-900",
										children: ["Soal No. ", q.questionNumber]
									}), /* @__PURE__ */ jsx("span", {
										className: "text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border",
										children: q.partType || "STANDARD"
									})]
								}), /* @__PURE__ */ jsx("button", {
									onClick: () => handleSaveQuestion(q),
									className: "flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs",
									children: saveStatus[q.id] ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Check, { className: "w-3.5 h-3.5 text-emerald-300" }), /* @__PURE__ */ jsx("span", { children: "Tersimpan!" })] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Save, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "Simpan Soal" })] })
								})]
							}),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1",
								children: activeSection === "LISTENING" ? "Naskah Audio / Dialog Soal (Dibacakan Narator & Pembicara)" : activeSection === "STRUCTURE" && q.partType === "WRITTEN_EXPRESSION" ? "Kalimat Bergaris Bawah (Format: {A:kata} ... {B:kata} ...)" : "Teks Pertanyaan"
							}), /* @__PURE__ */ jsx("textarea", {
								rows: activeSection === "LISTENING" ? 3 : 2,
								value: q.questionText || "",
								onChange: (e) => updateQuestionField(currentSec.sectionType, q.id, "questionText", e.target.value),
								className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-serif leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
							})] }),
							activeSection === "LISTENING" && /* @__PURE__ */ jsx(AudioSegmentEditor, {
								label: `Audio Soal #${q.questionNumber}:`,
								audioUrl: q.audioUrl,
								onChange: (newUrl) => updateQuestionField(currentSec.sectionType, q.id, "audioUrl", newUrl),
								onUpload: (file) => handleAudioUpload(q.id, file, false),
								isUploading: isUploadingAudio[q.id],
								defaultBaseUrl: "/Toefl-test-3.mp3"
							}),
							/* @__PURE__ */ jsx("div", {
								className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
								children: [
									"optionA",
									"optionB",
									"optionC",
									"optionD"
								].map((optKey, idx) => {
									const letter = String.fromCharCode(65 + idx);
									const isCorrect = q.correctAnswer === letter;
									return /* @__PURE__ */ jsxs("div", {
										className: `p-2.5 rounded-xl border transition flex items-center gap-2 ${isCorrect ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400" : "bg-slate-50/50 border-slate-200"}`,
										children: [/* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => updateQuestionField(currentSec.sectionType, q.id, "correctAnswer", letter),
											className: `w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition ${isCorrect ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`,
											title: `Jadikan (${letter}) sebagai kunci jawaban`,
											children: letter
										}), /* @__PURE__ */ jsx("input", {
											type: "text",
											value: q[optKey] || "",
											onChange: (e) => updateQuestionField(currentSec.sectionType, q.id, optKey, e.target.value),
											placeholder: `Teks pilihan jawaban (${letter})`,
											className: "w-full bg-transparent text-xs text-slate-800 focus:outline-none"
										})]
									}, optKey);
								})
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between text-[11px] text-slate-500 pt-1",
								children: [/* @__PURE__ */ jsxs("span", { children: [
									"Kunci Jawaban Aktif:",
									" ",
									/* @__PURE__ */ jsxs("strong", {
										className: "text-emerald-700 font-mono font-bold text-xs",
										children: [
											"Pilihan (",
											q.correctAnswer,
											")"
										]
									})
								] }), /* @__PURE__ */ jsx("span", {
									className: "text-slate-400",
									children: "Klik huruf lingkaran di samping opsi untuk mengubah kunci jawaban."
								})]
							})
						]
					}, q.id))
				})]
			})]
		})]
	});
}
//#endregion
//#region resources/js/Pages/Certificate.tsx
var Certificate_exports = /* @__PURE__ */ __exportAll({ default: () => CertificatePage });
function CertificatePage() {
	const { verificationCode } = useParams();
	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	useEffect(() => {
		async function loadCert() {
			try {
				setIsLoading(true);
				const json = await (await apiFetch(`/api/certificate/${verificationCode}`)).json();
				if (json.certificate) setData(json);
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
	if (isLoading) return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white",
		children: [/* @__PURE__ */ jsx("div", { className: "w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" }), /* @__PURE__ */ jsx("p", {
			className: "text-slate-300 font-semibold text-sm",
			children: "Membuat Dokumen Sertifikat Digital..."
		})]
	});
	if (!data) return /* @__PURE__ */ jsx("div", {
		className: "min-h-screen bg-slate-900 flex items-center justify-center p-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center",
			children: [/* @__PURE__ */ jsx("p", {
				className: "text-slate-800 font-bold mb-4",
				children: "Sertifikat tidak ditemukan atau kode verifikasi tidak valid."
			}), /* @__PURE__ */ jsxs(Link, {
				href: "/",
				className: "inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs",
				children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }), " Kembali ke Beranda"]
			})]
		})
	});
	const { certificate, qrDataUrl, verifyUrl } = data;
	if (certificate.isRevoked) return /* @__PURE__ */ jsx("div", {
		className: "min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md w-full bg-white text-slate-900 rounded-2xl p-8 text-center shadow-2xl",
			children: [
				/* @__PURE__ */ jsx(ShieldCheck, { className: "w-12 h-12 text-rose-600 mx-auto mb-4" }),
				/* @__PURE__ */ jsx("h1", {
					className: "text-xl font-black mb-2",
					children: "Sertifikat Dicabut"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-sm text-slate-600",
					children: "Dokumen ini tidak lagi berlaku."
				})
			]
		})
	});
	const testDateFormatted = new Date(certificate.testDate).toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric"
	});
	const issueDateFormatted = new Date(certificate.issuedAt).toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric"
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-900 py-8 px-4 font-sans text-slate-800 flex flex-col items-center print:bg-white print:p-0 print:m-0",
		children: [
			/* @__PURE__ */ jsx("style", {
				jsx: true,
				global: true,
				children: `
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
      `
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "max-w-4xl w-full mb-6 flex items-center justify-between print:hidden",
				children: [/* @__PURE__ */ jsxs(Link, {
					href: "/student/dashboard",
					className: "inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition",
					children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Kembali ke Portal" })]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ jsxs(Link, {
						href: `/verify/${certificate.verificationCode}`,
						target: "_blank",
						className: "inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition",
						children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "w-4 h-4 text-emerald-400" }), /* @__PURE__ */ jsx("span", { children: "Halaman Verifikasi Publik" })]
					}), /* @__PURE__ */ jsxs("button", {
						onClick: handlePrint,
						className: "inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition",
						children: [/* @__PURE__ */ jsx(Printer, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Cetak / Simpan PDF" })]
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				id: "certificate-container",
				className: "w-full max-w-4xl bg-[#fffdfa] border-[12px] border-double border-slate-900 rounded-2xl shadow-2xl p-8 sm:p-12 relative overflow-hidden print:border-none print:shadow-none print:p-6 print:max-w-none print:w-full",
				children: [/* @__PURE__ */ jsx("div", {
					className: "absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none",
					children: /* @__PURE__ */ jsxs("div", {
						className: "text-center",
						children: [/* @__PURE__ */ jsx("span", {
							className: "font-serif font-black text-9xl tracking-tighter text-slate-900 block",
							children: "TOEFL ITP"
						}), /* @__PURE__ */ jsx("span", {
							className: "font-serif text-6xl tracking-widest text-slate-800",
							children: "DIGITAL ASSESSMENT"
						})]
					})
				}), /* @__PURE__ */ jsxs("div", {
					className: "border border-amber-600/40 p-6 sm:p-8 rounded-lg relative z-10",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "text-center space-y-2 mb-6",
							children: [
								/* @__PURE__ */ jsx("div", {
									className: "flex items-center justify-center gap-3 mb-2",
									children: /* @__PURE__ */ jsx("img", {
										src: appUrl(data.institution?.logoUrl || "/branding/institution-logo.svg"),
										alt: "Logo Institusi",
										className: "w-16 h-16 object-contain drop-shadow-xs",
										onError: (e) => {
											e.target.src = appUrl("/branding/institution-logo.svg");
										}
									})
								}),
								/* @__PURE__ */ jsx("div", {
									className: "font-serif tracking-wider uppercase text-xs font-black text-slate-900",
									children: data.institution?.name || "Lembaga Bahasa & Sertifikasi Internasional"
								}),
								/* @__PURE__ */ jsx("div", {
									className: "text-[11px] font-semibold text-slate-500 uppercase tracking-widest",
									children: data.institution?.subtitle || "Center for Language Testing and Certification"
								}),
								/* @__PURE__ */ jsx("h1", {
									className: "text-2xl sm:text-4xl font-serif font-black tracking-tight text-slate-950 uppercase pt-1",
									children: "Certificate of English Proficiency"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-xs font-semibold text-amber-700 tracking-wider uppercase",
									children: "TOEFL ITP® Standard Assessment Format"
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "text-center space-y-2 my-8",
							children: [
								/* @__PURE__ */ jsx("p", {
									className: "text-xs font-serif italic text-slate-600",
									children: "This digital certificate is issued to:"
								}),
								/* @__PURE__ */ jsx("h2", {
									className: "text-2xl sm:text-4xl font-serif font-black text-slate-900 border-b-2 border-slate-300 inline-block px-8 pb-1 tracking-wide",
									children: certificate.participantName
								}),
								certificate.idNumber && /* @__PURE__ */ jsxs("p", {
									className: "text-xs font-mono text-slate-500",
									children: ["National ID / Passport: ", /* @__PURE__ */ jsx("strong", { children: certificate.idNumber })]
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "text-xs text-slate-600 max-w-xl mx-auto leading-relaxed pt-2",
									children: [
										"for having successfully taken the standardized evaluation of English proficiency on",
										" ",
										/* @__PURE__ */ jsx("strong", { children: testDateFormatted }),
										", demonstrating the following certified competencies:"
									]
								})
							]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "max-w-2xl mx-auto my-6 border border-slate-300 rounded-xl overflow-hidden shadow-xs",
							children: /* @__PURE__ */ jsxs("table", {
								className: "w-full text-center text-xs",
								children: [/* @__PURE__ */ jsx("thead", {
									className: "bg-slate-900 text-white font-serif uppercase tracking-wider text-[11px]",
									children: /* @__PURE__ */ jsxs("tr", { children: [
										/* @__PURE__ */ jsx("th", {
											className: "py-2.5 px-3 text-left",
											children: "Section Area"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "py-2.5 px-3",
											children: "Score Scale"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "py-2.5 px-3 text-right",
											children: "Scaled Score"
										})
									] })
								}), /* @__PURE__ */ jsxs("tbody", {
									className: "divide-y divide-slate-200 text-slate-800 bg-white font-medium",
									children: [
										/* @__PURE__ */ jsxs("tr", { children: [
											/* @__PURE__ */ jsx("td", {
												className: "py-2 px-3 text-left font-semibold",
												children: "Section 1: Listening Comprehension"
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-2 px-3 text-slate-500",
												children: "31 - 68"
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-2 px-3 text-right font-mono font-bold text-slate-900 text-sm",
												children: certificate.listeningScore
											})
										] }),
										/* @__PURE__ */ jsxs("tr", { children: [
											/* @__PURE__ */ jsx("td", {
												className: "py-2 px-3 text-left font-semibold",
												children: "Section 2: Structure & Written Expression"
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-2 px-3 text-slate-500",
												children: "31 - 68"
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-2 px-3 text-right font-mono font-bold text-slate-900 text-sm",
												children: certificate.structureScore
											})
										] }),
										/* @__PURE__ */ jsxs("tr", { children: [
											/* @__PURE__ */ jsx("td", {
												className: "py-2 px-3 text-left font-semibold",
												children: "Section 3: Reading Comprehension"
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-2 px-3 text-slate-500",
												children: "31 - 67"
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-2 px-3 text-right font-mono font-bold text-slate-900 text-sm",
												children: certificate.readingScore
											})
										] }),
										/* @__PURE__ */ jsxs("tr", {
											className: "bg-amber-50/70 font-bold border-t-2 border-slate-900",
											children: [
												/* @__PURE__ */ jsx("td", {
													className: "py-3 px-3 text-left font-serif text-slate-950 text-sm",
													children: "TOTAL SCALED SCORE"
												}),
												/* @__PURE__ */ jsxs("td", {
													className: "py-3 px-3 text-amber-900 font-semibold",
													children: ["CEFR Level: ", /* @__PURE__ */ jsx("span", {
														className: "bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-bold",
														children: certificate.cefrLevel
													})]
												}),
												/* @__PURE__ */ jsx("td", {
													className: "py-3 px-3 text-right font-mono font-black text-xl text-slate-950",
													children: certificate.totalScore
												})
											]
										})
									]
								})]
							})
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-3 items-end gap-4 pt-8 border-t border-slate-200",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-3",
									children: [qrDataUrl && /* @__PURE__ */ jsx("img", {
										src: qrDataUrl,
										alt: "QR Code Verification",
										className: "w-20 h-20 border border-slate-300 rounded p-1 bg-white"
									}), /* @__PURE__ */ jsxs("div", {
										className: "text-[10px] text-slate-500 leading-tight",
										children: [
											/* @__PURE__ */ jsx("span", {
												className: "font-bold text-slate-800 block mb-0.5",
												children: "Online Verification"
											}),
											"Scan QR code to verify this certificate authentic record.",
											/* @__PURE__ */ jsx("span", {
												className: "font-mono text-[9px] block text-slate-400 mt-1 truncate max-w-[120px]",
												children: certificate.verificationCode
											})
										]
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "text-center text-[10px] text-slate-500",
									children: [/* @__PURE__ */ jsx("span", {
										className: "font-mono font-bold text-slate-800 block text-xs",
										children: certificate.certificateNumber
									}), /* @__PURE__ */ jsxs("span", { children: ["Issued on: ", issueDateFormatted] })]
								}),
								/* @__PURE__ */ jsx("div", {
									className: "text-right",
									children: /* @__PURE__ */ jsxs("div", {
										className: "inline-block text-center relative min-w-[190px]",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "text-[10px] text-slate-500 mb-1",
												children: [
													data.institution?.city || "Jakarta",
													", ",
													issueDateFormatted
												]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "relative h-16 w-44 mx-auto flex items-center justify-center my-0.5",
												children: [/* @__PURE__ */ jsx("img", {
													src: appUrl(data.institution?.signatureUrl || "/branding/director-signature.svg"),
													alt: "Signature",
													className: "h-14 w-auto max-w-[160px] object-contain relative z-10 filter drop-shadow-xs",
													onError: (e) => {
														e.target.src = appUrl("/branding/director-signature.svg");
													}
												}), /* @__PURE__ */ jsx("img", {
													src: appUrl(data.institution?.stampUrl || "/branding/institution-stamp.svg"),
													alt: "Institution stamp",
													className: "absolute -left-4 -top-3 w-22 h-22 object-contain opacity-85 pointer-events-none mix-blend-multiply z-20",
													onError: (e) => {
														e.target.src = appUrl("/branding/institution-stamp.svg");
													}
												})]
											}),
											/* @__PURE__ */ jsx("div", {
												className: "font-serif text-sm font-bold text-slate-900 border-b-2 border-slate-700 pb-0.5 px-3",
												children: data.institution?.directorName || "Prof. Dr. H. Soedirman, M.Pd."
											}),
											/* @__PURE__ */ jsx("div", {
												className: "text-[10px] font-semibold text-slate-600 uppercase tracking-wider mt-0.5",
												children: data.institution?.directorTitle || "Academic Director of Certification"
											})
										]
									})
								})
							]
						})
					]
				})]
			})
		]
	});
}
//#endregion
//#region resources/js/lib/examStore.js
var useExamStore = create((set, get) => ({
	sessionId: null,
	participantName: "",
	currentSectionType: "LISTENING",
	sectionTitle: "Section 1: Listening Comprehension",
	durationMinutes: 35,
	timeRemaining: 2100,
	isTimeHidden: false,
	currentQuestionIndex: 0,
	questions: [],
	passages: [],
	answers: {},
	playedAudioIds: [],
	completedAudioIds: [],
	currentlyPlayingId: null,
	violationCount: 0,
	setExamData: (data) => {
		const current = get();
		const isNewSession = current.sessionId !== data.sessionId;
		const isNewSection = isNewSession || current.currentSectionType !== data.currentSectionType;
		set({
			sessionId: data.sessionId,
			participantName: data.participantName,
			currentSectionType: data.currentSectionType,
			sectionTitle: data.sectionTitle,
			durationMinutes: data.durationMinutes,
			timeRemaining: isNewSection ? data.timeRemainingSeconds ?? data.durationMinutes * 60 : data.timeRemainingSeconds ?? current.timeRemaining,
			currentQuestionIndex: isNewSection ? 0 : current.currentQuestionIndex,
			questions: data.questions,
			passages: data.passages,
			answers: isNewSession ? data.savedAnswers : {
				...data.savedAnswers,
				...current.answers
			},
			playedAudioIds: isNewSession ? [] : current.playedAudioIds,
			completedAudioIds: isNewSession ? [] : current.completedAudioIds,
			currentlyPlayingId: null,
			violationCount: data.violationCount ?? (isNewSession ? 0 : current.violationCount)
		});
	},
	setAnswer: (questionId, answer) => {
		const existing = get().answers[questionId] || {
			selectedAnswer: null,
			isMarkedForReview: false
		};
		set({ answers: {
			...get().answers,
			[questionId]: {
				...existing,
				selectedAnswer: answer
			}
		} });
	},
	toggleMarkForReview: (questionId) => {
		const existing = get().answers[questionId] || {
			selectedAnswer: null,
			isMarkedForReview: false
		};
		set({ answers: {
			...get().answers,
			[questionId]: {
				...existing,
				isMarkedForReview: !existing.isMarkedForReview
			}
		} });
	},
	setCurrentQuestionIndex: (index) => index >= 0 && index < get().questions.length && set({ currentQuestionIndex: index }),
	nextQuestion: () => get().currentQuestionIndex < get().questions.length - 1 && set({ currentQuestionIndex: get().currentQuestionIndex + 1 }),
	prevQuestion: () => get().currentQuestionIndex > 0 && set({ currentQuestionIndex: get().currentQuestionIndex - 1 }),
	tickTimer: () => get().timeRemaining > 0 && set({ timeRemaining: get().timeRemaining - 1 }),
	toggleTimeHidden: () => set({ isTimeHidden: !get().isTimeHidden }),
	markAudioAsPlayed: (id) => !get().playedAudioIds.includes(id) && set({ playedAudioIds: [...get().playedAudioIds, id] }),
	markAudioAsCompleted: (id) => !get().completedAudioIds.includes(id) && set({ completedAudioIds: [...get().completedAudioIds, id] }),
	setCurrentlyPlayingAudio: (id) => set({ currentlyPlayingId: id }),
	incrementViolation: () => set({ violationCount: get().violationCount + 1 }),
	resetExam: () => set({
		sessionId: null,
		participantName: "",
		currentSectionType: "LISTENING",
		questions: [],
		passages: [],
		answers: {},
		playedAudioIds: [],
		completedAudioIds: [],
		currentlyPlayingId: null,
		currentQuestionIndex: 0,
		timeRemaining: 0,
		violationCount: 0
	})
}));
//#endregion
//#region resources/js/lib/audioDialogue.ts
/**
* Parses script containing speaker markers like (Man), (Woman), (Narrator), etc.
* and returns clean speech turns without the speaker labels.
*/
function parseDialogueTurns(rawScript) {
	if (!rawScript) return [];
	const turns = [];
	const lines = rawScript.split("\n");
	let currentSpeaker = "general";
	let currentText = "";
	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) continue;
		const match = trimmed.match(/^\((Man|Woman|Narrator|Professor|Advisor|Student)\)\s*(.*)$/i) || trimmed.match(/^(Man|Woman|Narrator|Professor|Advisor|Student):\s*(.*)$/i);
		if (match) {
			if (currentText.trim()) turns.push({
				speaker: currentSpeaker,
				text: currentText.trim()
			});
			currentSpeaker = match[1].toLowerCase();
			currentText = match[2] ?? "";
		} else currentText += (currentText ? " " : "") + trimmed;
	}
	if (currentText.trim()) turns.push({
		speaker: currentSpeaker,
		text: currentText.trim()
	});
	return turns.length > 0 ? turns : [{
		speaker: "narrator",
		text: rawScript
	}];
}
//#endregion
//#region resources/js/components/AudioPlayer.tsx
var AudioPlayer = ({ id, audioUrl, textToSpeak, label = "Audio", disabled = false, disabledTooltip, autoPlay = false, autoPlayDelayMs = 2500, allowReplay = false, playedAudioIds: propPlayedAudioIds, completedAudioIds: propCompletedAudioIds, onAudioPlayed, onAudioCompleted, currentlyPlayingId: propCurrentlyPlayingId, onCurrentlyPlayingChange }) => {
	const storePlayedAudioIds = useExamStore((state) => state.playedAudioIds);
	const storeCompletedAudioIds = useExamStore((state) => state.completedAudioIds);
	const storeCurrentlyPlayingId = useExamStore((state) => state.currentlyPlayingId);
	const markAudioAsPlayedInStore = useExamStore((state) => state.markAudioAsPlayed);
	const markAudioAsCompletedInStore = useExamStore((state) => state.markAudioAsCompleted);
	const setCurrentlyPlayingAudioInStore = useExamStore((state) => state.setCurrentlyPlayingAudio);
	const playedAudioIds = propPlayedAudioIds ?? storePlayedAudioIds;
	const completedAudioIds = propCompletedAudioIds ?? storeCompletedAudioIds;
	const currentlyPlayingId = propCurrentlyPlayingId !== void 0 ? propCurrentlyPlayingId : storeCurrentlyPlayingId;
	const markAudioAsPlayed = (audioId) => {
		if (onAudioPlayed) onAudioPlayed(audioId);
		else markAudioAsPlayedInStore(audioId);
	};
	const markAudioAsCompleted = (audioId) => {
		if (onAudioCompleted) onAudioCompleted(audioId);
		else markAudioAsCompletedInStore(audioId);
	};
	const setCurrentlyPlayingAudio = React.useCallback((audioId) => {
		if (onCurrentlyPlayingChange) onCurrentlyPlayingChange(audioId);
		else setCurrentlyPlayingAudioInStore(audioId);
	}, [onCurrentlyPlayingChange, setCurrentlyPlayingAudioInStore]);
	const isCompleted = (completedAudioIds || []).includes(id);
	const isStarted = (playedAudioIds || []).includes(id);
	const isInterrupted = isStarted && !isCompleted;
	const isAlreadyPlayed = isCompleted;
	const isOtherPlaying = currentlyPlayingId !== null && currentlyPlayingId !== id;
	const [isPlaying, setIsPlaying] = useState(false);
	const [volume, setVolume] = useState(1);
	const [isMuted, setIsMuted] = useState(false);
	const [progress, setProgress] = useState(isCompleted ? 100 : 0);
	const [isAutoPlayPending, setIsAutoPlayPending] = useState(false);
	const audioRef = useRef(null);
	const activePlaybackIdRef = useRef(0);
	const autoPlayTimerRef = useRef(null);
	const volumeRef = useRef(volume);
	const mutedRef = useRef(isMuted);
	const speechPlaybackRef = useRef(null);
	const speechUtteranceRef = useRef(null);
	volumeRef.current = volume;
	mutedRef.current = isMuted;
	useEffect(() => {
		setIsPlaying(false);
		setProgress(isCompleted ? 100 : 0);
		setIsAutoPlayPending(false);
		return () => {
			activePlaybackIdRef.current++;
			if (autoPlayTimerRef.current !== null) {
				window.clearTimeout(autoPlayTimerRef.current);
				autoPlayTimerRef.current = null;
			}
			if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
			speechUtteranceRef.current = null;
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current.src = "";
				audioRef.current.load();
				audioRef.current = null;
			}
			setCurrentlyPlayingAudio(null);
		};
	}, [
		id,
		isCompleted,
		setCurrentlyPlayingAudio
	]);
	useEffect(() => {
		if (!autoPlay || disabled || isCompleted || isStarted || isPlaying || isOtherPlaying) return;
		setIsAutoPlayPending(true);
		autoPlayTimerRef.current = window.setTimeout(() => {
			autoPlayTimerRef.current = null;
			setIsAutoPlayPending(false);
			handlePlay();
		}, autoPlayDelayMs);
		return () => {
			if (autoPlayTimerRef.current !== null) {
				window.clearTimeout(autoPlayTimerRef.current);
				autoPlayTimerRef.current = null;
			}
			setIsAutoPlayPending(false);
		};
	}, [
		autoPlay,
		autoPlayDelayMs,
		disabled,
		isCompleted,
		isStarted,
		isPlaying,
		isOtherPlaying,
		id
	]);
	const finishAudio = (playbackId) => {
		if (activePlaybackIdRef.current !== playbackId) return;
		setIsPlaying(false);
		setProgress(100);
		markAudioAsCompleted(id);
		setCurrentlyPlayingAudio(null);
		speechPlaybackRef.current = null;
		speechUtteranceRef.current = null;
		audioRef.current = null;
	};
	const handlePlay = () => {
		if (disabled || isOtherPlaying || !allowReplay && isAlreadyPlayed || isPlaying) return;
		if (autoPlayTimerRef.current !== null) {
			window.clearTimeout(autoPlayTimerRef.current);
			autoPlayTimerRef.current = null;
		}
		setIsAutoPlayPending(false);
		const playbackId = ++activePlaybackIdRef.current;
		markAudioAsPlayed(id);
		setCurrentlyPlayingAudio(id);
		setIsPlaying(true);
		setProgress(0);
		if (audioUrl) {
			let actualUrl = audioUrl;
			let startTime = 0;
			let endTime = null;
			const hashMatch = audioUrl.match(/[#?]t=([0-9.]+)(?:,([0-9.]+))?/i);
			if (hashMatch) {
				startTime = parseFloat(hashMatch[1]) || 0;
				if (hashMatch[2]) endTime = parseFloat(hashMatch[2]);
				actualUrl = audioUrl.split(/[#?]/)[0];
			}
			const audio = new Audio(appUrl(actualUrl));
			audioRef.current = audio;
			audio.volume = isMuted ? 0 : volume;
			let fallbackStarted = false;
			const startSpeechFallback = () => {
				if (fallbackStarted || activePlaybackIdRef.current !== playbackId) return;
				fallbackStarted = true;
				audioRef.current = null;
				playMultiSpeakerDialogue(playbackId);
			};
			let hasStarted = false;
			const startPlayback = () => {
				if (hasStarted || activePlaybackIdRef.current !== playbackId) return;
				hasStarted = true;
				audio.play().catch(startSpeechFallback);
			};
			const prepareAndPlay = () => {
				if (hasStarted || activePlaybackIdRef.current !== playbackId) return;
				if (startTime > 0) {
					const onSeeked = () => {
						audio.removeEventListener("seeked", onSeeked);
						startPlayback();
					};
					audio.addEventListener("seeked", onSeeked);
					audio.currentTime = startTime;
					setTimeout(() => {
						if (!hasStarted && activePlaybackIdRef.current === playbackId) startPlayback();
					}, 350);
				} else startPlayback();
			};
			audio.ontimeupdate = () => {
				if (activePlaybackIdRef.current !== playbackId) return;
				const current = audio.currentTime;
				if (endTime !== null && current >= endTime) {
					audio.pause();
					finishAudio(playbackId);
					return;
				}
				if (endTime !== null && endTime > startTime) {
					const playedPortion = Math.max(0, current - startTime);
					const totalPortion = endTime - startTime;
					setProgress(Math.min(100, playedPortion / totalPortion * 100));
				} else if (audio.duration) setProgress(current / audio.duration * 100);
			};
			audio.onended = () => {
				if (activePlaybackIdRef.current === playbackId) finishAudio(playbackId);
			};
			audio.onerror = () => {
				startSpeechFallback();
			};
			if (audio.readyState >= 2) prepareAndPlay();
			else {
				const onCanPlay = () => {
					audio.removeEventListener("canplay", onCanPlay);
					prepareAndPlay();
				};
				audio.addEventListener("canplay", onCanPlay);
			}
		} else playMultiSpeakerDialogue(playbackId);
	};
	const playMultiSpeakerDialogue = async (playbackId) => {
		if (typeof window === "undefined" || !window.speechSynthesis) {
			setIsPlaying(false);
			return;
		}
		window.speechSynthesis.cancel();
		await new Promise((res) => setTimeout(res, 50));
		if (activePlaybackIdRef.current !== playbackId) return;
		const turns = parseDialogueTurns(textToSpeak ?? "");
		const englishVoices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en"));
		const femaleVoice = englishVoices.find((v) => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("samantha") || v.name.toLowerCase().includes("jenny") || v.name.toLowerCase().includes("victoria")) || englishVoices[1] || englishVoices[0];
		const maleVoice = englishVoices.find((v) => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("guy") || v.name.toLowerCase().includes("mark") || v.name.toLowerCase().includes("george")) || englishVoices[0];
		const narratorVoice = englishVoices.find((v) => v.name.toLowerCase().includes("natural")) || englishVoices[0];
		const totalTurns = turns.length;
		const voiceSet = {
			maleVoice,
			femaleVoice,
			narratorVoice
		};
		speechPlaybackRef.current = {
			playbackId,
			turns,
			voiceSet,
			index: 0
		};
		for (let i = 0; i < totalTurns; i++) {
			if (activePlaybackIdRef.current !== playbackId) return;
			const turn = turns[i];
			speechPlaybackRef.current.index = i;
			setProgress(Math.round(i / totalTurns * 100));
			await speakTurn(turn, voiceSet, playbackId);
			if (activePlaybackIdRef.current !== playbackId) return;
			const pauseDuration = turn.speaker === "narrator" ? 800 : turn.speaker === "man" || turn.speaker === "woman" ? 500 : 400;
			await new Promise((res) => setTimeout(res, pauseDuration));
			if (activePlaybackIdRef.current !== playbackId) return;
		}
		if (activePlaybackIdRef.current === playbackId) finishAudio(playbackId);
	};
	const speakTurn = (turn, voiceSet, playbackId) => {
		return new Promise((resolve) => {
			if (activePlaybackIdRef.current !== playbackId) {
				resolve();
				return;
			}
			const utterance = new SpeechSynthesisUtterance(turn.text);
			speechUtteranceRef.current = utterance;
			utterance.volume = mutedRef.current ? 0 : volumeRef.current;
			if (turn.speaker === "man" || turn.speaker === "student") {
				if (voiceSet.maleVoice) utterance.voice = voiceSet.maleVoice;
				utterance.pitch = .85;
				utterance.rate = .95;
			} else if (turn.speaker === "woman" || turn.speaker === "advisor") {
				if (voiceSet.femaleVoice) utterance.voice = voiceSet.femaleVoice;
				utterance.pitch = 1.18;
				utterance.rate = .96;
			} else if (turn.speaker === "professor") {
				if (voiceSet.maleVoice) utterance.voice = voiceSet.maleVoice;
				utterance.pitch = .92;
				utterance.rate = .93;
			} else {
				if (voiceSet.narratorVoice) utterance.voice = voiceSet.narratorVoice;
				utterance.pitch = 1;
				utterance.rate = .92;
			}
			utterance.onend = () => {
				if (speechUtteranceRef.current === utterance) speechUtteranceRef.current = null;
				resolve();
			};
			utterance.onerror = () => {
				if (speechUtteranceRef.current === utterance) speechUtteranceRef.current = null;
				resolve();
			};
			window.speechSynthesis.speak(utterance);
		});
	};
	const handleVolumeChange = (newVolume) => {
		const nextMuted = newVolume === 0;
		setVolume(newVolume);
		setIsMuted(nextMuted);
		volumeRef.current = newVolume;
		mutedRef.current = nextMuted;
		if (audioRef.current) audioRef.current.volume = nextMuted ? 0 : newVolume;
		else {
			if (speechUtteranceRef.current) speechUtteranceRef.current.volume = nextMuted ? 0 : newVolume;
			if (isPlaying && typeof window !== "undefined" && window.speechSynthesis) if (nextMuted) window.speechSynthesis.pause();
			else {
				window.speechSynthesis.pause();
				window.speechSynthesis.resume();
			}
		}
	};
	const toggleMute = () => {
		const nextMuted = !isMuted;
		setIsMuted(nextMuted);
		mutedRef.current = nextMuted;
		if (audioRef.current) audioRef.current.volume = nextMuted ? 0 : volume;
		else {
			if (speechUtteranceRef.current) speechUtteranceRef.current.volume = nextMuted ? 0 : volume;
			if (isPlaying && typeof window !== "undefined" && window.speechSynthesis) if (nextMuted) window.speechSynthesis.pause();
			else window.speechSynthesis.resume();
		}
	};
	const canStartPlayback = !disabled && !isOtherPlaying && !isPlaying && (!isCompleted || allowReplay);
	const statusLabel = disabled ? "Locked" : isPlaying ? "Playing" : isCompleted ? "Completed" : isOtherPlaying ? "Another audio is playing" : isInterrupted ? "Audio interrupted" : isAutoPlayPending ? "Starting soon" : "Ready";
	return /* @__PURE__ */ jsx("div", {
		className: "rounded-2xl border border-slate-800 bg-slate-950 p-4 text-white shadow-lg",
		children: /* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-3",
			children: [
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: handlePlay,
					disabled: !canStartPlayback,
					"aria-label": `${statusLabel}: ${label}`,
					title: disabledTooltip || `${statusLabel}: ${label}`,
					className: `flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-950 ${disabled ? "cursor-not-allowed bg-slate-800 text-slate-500" : isCompleted && !allowReplay ? "cursor-not-allowed bg-emerald-950 text-emerald-400" : isPlaying ? "cursor-not-allowed bg-amber-400 text-slate-950" : "bg-blue-600 text-white hover:bg-blue-500 active:scale-95"}`,
					children: disabled ? /* @__PURE__ */ jsx(Lock, { className: "h-4 w-4" }) : isCompleted && !allowReplay ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5" }) : isPlaying ? /* @__PURE__ */ jsx(Radio, { className: "h-5 w-5 animate-pulse" }) : isInterrupted || isCompleted && allowReplay ? /* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Play, { className: "ml-0.5 h-5 w-5 fill-current" })
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ jsx("p", {
								className: "truncate text-sm font-semibold text-white",
								children: statusLabel
							}), isAutoPlayPending && /* @__PURE__ */ jsx("p", {
								className: "text-[11px] text-slate-400",
								children: "Select Play Audio to start now"
							})]
						}), /* @__PURE__ */ jsx("span", {
							className: "shrink-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500",
							children: allowReplay ? "Practice" : "One play"
						})]
					}), /* @__PURE__ */ jsx("div", {
						className: "mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800",
						role: "progressbar",
						"aria-label": `${label} progress`,
						"aria-valuemin": 0,
						"aria-valuemax": 100,
						"aria-valuenow": Math.round(progress),
						children: /* @__PURE__ */ jsx("div", {
							className: `h-full rounded-full transition-all duration-300 ease-linear ${isCompleted ? "bg-emerald-400" : "bg-blue-500"}`,
							style: { width: `${Math.max(0, progress)}%` }
						})
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1.5",
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: toggleMute,
						"aria-label": isMuted ? "Unmute audio" : "Mute audio",
						title: isMuted ? "Unmute" : "Mute",
						className: "rounded-md p-1 text-slate-400 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400",
						children: isMuted || volume === 0 ? /* @__PURE__ */ jsx(VolumeX, { className: "h-4 w-4 text-rose-400" }) : /* @__PURE__ */ jsx(Volume2, { className: "h-4 w-4" })
					}), /* @__PURE__ */ jsx("input", {
						type: "range",
						min: "0",
						max: "1",
						step: "0.05",
						value: isMuted ? 0 : volume,
						onChange: (e) => handleVolumeChange(parseFloat(e.target.value)),
						"aria-label": "Audio volume",
						className: "w-16 cursor-pointer accent-blue-500"
					})]
				})
			]
		})
	});
};
//#endregion
//#region resources/js/components/WrittenExpressionText.tsx
var WrittenExpressionText = ({ text }) => {
	const renderMarker = (letter, key) => /* @__PURE__ */ jsxs("span", {
		className: "inline-flex items-center ml-1 mr-0.5 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded leading-none shadow-xs align-middle",
		children: [
			"(",
			letter,
			")"
		]
	}, key);
	const renderParenthesizedOptions = () => {
		const renderedElements = [];
		const markerPattern = /\(([A-D])\)/g;
		let cursor = 0;
		let match;
		let markerIndex = 0;
		while ((match = markerPattern.exec(text)) !== null) {
			const beforeMarker = text.slice(cursor, match.index);
			const targetMatch = beforeMarker.match(/(\S+)(\s*)$/);
			if (targetMatch && targetMatch.index !== void 0) {
				const targetStart = targetMatch.index;
				renderedElements.push(/* @__PURE__ */ jsxs(React.Fragment, { children: [
					beforeMarker.slice(0, targetStart),
					/* @__PURE__ */ jsx("span", {
						className: "font-extrabold text-slate-950 underline decoration-2 underline-offset-2",
						children: targetMatch[1]
					}),
					targetMatch[2]
				] }, `segment-${markerIndex}`));
			} else renderedElements.push(/* @__PURE__ */ jsx(React.Fragment, { children: beforeMarker }, `segment-${markerIndex}`));
			renderedElements.push(renderMarker(match[1], `marker-${markerIndex}`));
			cursor = match.index + match[0].length;
			markerIndex += 1;
		}
		renderedElements.push(/* @__PURE__ */ jsx(React.Fragment, { children: text.slice(cursor) }, "remaining-text"));
		return renderedElements;
	};
	const renderBraceOptions = () => {
		text.split(/(\{([A-D]):([^}]+)\})/g);
		const renderedElements = [];
		const markerPattern = /\{([A-D]):([^}]+)\}/g;
		let cursor = 0;
		let match;
		let markerIndex = 0;
		while ((match = markerPattern.exec(text)) !== null) {
			renderedElements.push(/* @__PURE__ */ jsx(React.Fragment, { children: text.slice(cursor, match.index) }, `brace-text-${markerIndex}`));
			renderedElements.push(/* @__PURE__ */ jsxs(React.Fragment, { children: [/* @__PURE__ */ jsx("span", {
				className: "font-extrabold text-slate-950 underline decoration-2 underline-offset-2",
				children: match[2]
			}), renderMarker(match[1], `brace-marker-${markerIndex}`)] }, `brace-${match[1]}-${markerIndex}`));
			cursor = match.index + match[0].length;
			markerIndex += 1;
		}
		renderedElements.push(/* @__PURE__ */ jsx(React.Fragment, { children: text.slice(cursor) }, "brace-tail"));
		return renderedElements;
	};
	return /* @__PURE__ */ jsx("div", {
		className: "text-lg leading-loose font-serif tracking-normal text-slate-900 bg-slate-50/70 p-5 rounded-xl border border-slate-200 shadow-xs select-none",
		children: /\{[A-D]:[^}]+\}/.test(text) ? renderBraceOptions() : renderParenthesizedOptions()
	});
};
//#endregion
//#region resources/js/Pages/Demo.tsx
var Demo_exports = /* @__PURE__ */ __exportAll({ default: () => DemoExamPage });
function DemoExamPage() {
	const params = useParams();
	const router = useRouter();
	const demoId = params.demoId;
	const [isLoading, setIsLoading] = useState(true);
	const [participantName, setParticipantName] = useState("");
	const [questions, setQuestions] = useState([]);
	const [passages, setPassages] = useState({});
	const [answers, setAnswers] = useState({});
	const [currentSection, setCurrentSection] = useState("LISTENING");
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [playedAudioIds, setPlayedAudioIds] = useState([]);
	const [completedAudioIds, setCompletedAudioIds] = useState([]);
	const [currentlyPlayingAudioId, setCurrentlyPlayingAudioId] = useState(null);
	useEffect(() => {
		if (!demoId) return;
		try {
			const saved = sessionStorage.getItem(`demo_audio_${demoId}`);
			if (saved) {
				const parsed = JSON.parse(saved);
				if (Array.isArray(parsed.played)) setPlayedAudioIds(parsed.played);
				if (Array.isArray(parsed.completed)) setCompletedAudioIds(parsed.completed);
			}
		} catch (e) {
			console.warn("Failed to load demo audio state:", e);
		}
	}, [demoId]);
	const handleAudioPlayed = (audioId) => {
		setPlayedAudioIds((prev) => {
			if (prev.includes(audioId)) return prev;
			const next = [...prev, audioId];
			try {
				const saved = sessionStorage.getItem(`demo_audio_${demoId}`);
				const parsed = saved ? JSON.parse(saved) : {};
				sessionStorage.setItem(`demo_audio_${demoId}`, JSON.stringify({
					...parsed,
					played: next
				}));
			} catch (e) {}
			return next;
		});
	};
	const handleAudioCompleted = (audioId) => {
		setCompletedAudioIds((prev) => {
			if (prev.includes(audioId)) return prev;
			const next = [...prev, audioId];
			try {
				const saved = sessionStorage.getItem(`demo_audio_${demoId}`);
				const parsed = saved ? JSON.parse(saved) : {};
				sessionStorage.setItem(`demo_audio_${demoId}`, JSON.stringify({
					...parsed,
					completed: next
				}));
			} catch (e) {}
			return next;
		});
	};
	const handleNavigateQuestion = (newIndex) => {
		if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
		setCurrentlyPlayingAudioId(null);
		setCurrentQuestionIndex(newIndex);
	};
	const [hasCheckedAudio, setHasCheckedAudio] = useState(false);
	const [isPlayingTestSound, setIsPlayingTestSound] = useState(false);
	const testAudioRef = useRef(null);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [needsFullscreen, setNeedsFullscreen] = useState(false);
	const fullscreenCompletedRef = useRef(false);
	const requestDemoFullscreen = useCallback(async () => {
		if (typeof document === "undefined") return false;
		if (document.fullscreenElement) {
			setIsFullscreen(true);
			setNeedsFullscreen(false);
			return true;
		}
		if (!document.fullscreenEnabled) {
			setNeedsFullscreen(false);
			return false;
		}
		try {
			await document.documentElement.requestFullscreen({ navigationUI: "hide" });
			setIsFullscreen(true);
			setNeedsFullscreen(false);
			return true;
		} catch {
			setIsFullscreen(false);
			setNeedsFullscreen(true);
			return false;
		}
	}, []);
	const exitDemoFullscreen = useCallback(async (completed = false) => {
		if (completed) fullscreenCompletedRef.current = true;
		if (typeof document !== "undefined" && document.fullscreenElement) try {
			await document.exitFullscreen();
		} catch {}
		setIsFullscreen(false);
		setNeedsFullscreen(false);
	}, []);
	useEffect(() => {
		fullscreenCompletedRef.current = false;
	}, [demoId]);
	useEffect(() => {
		const handleFullscreenChange = () => {
			const active = Boolean(document.fullscreenElement);
			setIsFullscreen(active);
			if (!active && !fullscreenCompletedRef.current && !isLoading && hasCheckedAudio) setNeedsFullscreen(true);
		};
		document.addEventListener("fullscreenchange", handleFullscreenChange);
		if (!fullscreenCompletedRef.current) requestDemoFullscreen();
		return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
	}, [
		requestDemoFullscreen,
		isLoading,
		hasCheckedAudio
	]);
	useEffect(() => {
		return () => {
			if (testAudioRef.current) {
				testAudioRef.current.pause();
				testAudioRef.current.currentTime = 0;
			}
			if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
			setCurrentlyPlayingAudioId(null);
		};
	}, []);
	useEffect(() => {
		const handleContextMenu = (e) => {
			e.preventDefault();
		};
		const handleKeyDown = (e) => {
			if (e.key === "F12" || e.ctrlKey && [
				"u",
				"c",
				"v",
				"p",
				"s",
				"a"
			].includes(e.key.toLowerCase()) || e.ctrlKey && e.shiftKey && [
				"i",
				"j",
				"c"
			].includes(e.key.toLowerCase())) {
				e.preventDefault();
				return;
			}
		};
		document.addEventListener("contextmenu", handleContextMenu);
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("contextmenu", handleContextMenu);
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, []);
	const [timeLeft, setTimeLeft] = useState(600);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showSectionTransitionModal, setShowSectionTransitionModal] = useState(false);
	const [showSubmitModal, setShowSubmitModal] = useState(false);
	useEffect(() => {
		async function loadDemoData() {
			try {
				setIsLoading(true);
				const res = await apiFetch(`/api/demo/result/${demoId}`);
				const data = await res.json();
				if (res.ok && data.questions) {
					setParticipantName(data.lead?.name || "Peserta Demo");
					setQuestions(data.questions);
					setPassages(data.passages || {});
					if (data.userAnswers) setAnswers(data.userAnswers);
					if (data.lead?.status === "COMPLETED") {
						await exitDemoFullscreen(true);
						router.replace(`/demo/result/${demoId}`);
						return;
					}
				} else {
					const fbData = await (await apiFetch("/api/demo/start", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ name: "Peserta Demo" })
					})).json();
					if (fbData.questions) {
						setQuestions(fbData.questions);
						setPassages(fbData.passages || {});
					}
				}
			} catch (err) {
				console.error("Failed to load demo questions:", err);
			} finally {
				setIsLoading(false);
			}
		}
		loadDemoData();
	}, [
		demoId,
		exitDemoFullscreen,
		router
	]);
	useEffect(() => {
		if (!hasCheckedAudio || isSubmitting) return;
		const timer = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					handleSectionTimeOut();
					return 0;
				}
				return prev - 1;
			});
		}, 1e3);
		return () => clearInterval(timer);
	}, [
		hasCheckedAudio,
		currentSection,
		isSubmitting
	]);
	const handleSectionTimeOut = () => {
		if (currentSection === "LISTENING") transitionToSection("STRUCTURE");
		else if (currentSection === "STRUCTURE") transitionToSection("READING");
		else if (currentSection === "READING") submitExam();
	};
	const transitionToSection = (nextSection) => {
		if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
		setCurrentlyPlayingAudioId(null);
		setCurrentSection(nextSection);
		if (nextSection === "STRUCTURE") {
			setTimeLeft(480);
			const firstIdx = questions.findIndex((q) => q.section === "STRUCTURE");
			setCurrentQuestionIndex(firstIdx >= 0 ? firstIdx : 10);
		} else if (nextSection === "READING") {
			setTimeLeft(720);
			const firstIdx = questions.findIndex((q) => q.section === "READING");
			setCurrentQuestionIndex(firstIdx >= 0 ? firstIdx : 20);
		}
		setShowSectionTransitionModal(false);
	};
	const stopTestAudio = () => {
		if (testAudioRef.current) {
			testAudioRef.current.pause();
			testAudioRef.current.currentTime = 0;
		}
		if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
		setIsPlayingTestSound(false);
	};
	const toggleTestAudio = async () => {
		if (isPlayingTestSound) {
			stopTestAudio();
			return;
		}
		try {
			setIsPlayingTestSound(true);
			if (testAudioRef.current) {
				testAudioRef.current.currentTime = 0;
				testAudioRef.current.onended = () => {
					setIsPlayingTestSound(false);
				};
				testAudioRef.current.onerror = () => {
					if (typeof window !== "undefined" && "speechSynthesis" in window) {
						window.speechSynthesis.cancel();
						const u = new SpeechSynthesisUtterance("This is a sound check for your headphones. If you can hear this clearly, your audio is working properly.");
						u.lang = "en-US";
						u.rate = .95;
						u.onend = () => setIsPlayingTestSound(false);
						u.onerror = () => setIsPlayingTestSound(false);
						window.speechSynthesis.speak(u);
					} else setIsPlayingTestSound(false);
				};
				await testAudioRef.current.play().catch(() => {
					setIsPlayingTestSound(false);
				});
			}
		} catch {
			setIsPlayingTestSound(false);
		}
	};
	const handleAudioReady = async () => {
		await requestDemoFullscreen();
		stopTestAudio();
		setHasCheckedAudio(true);
	};
	const handleSelectAnswer = (qNumber, optionKey) => {
		setAnswers((prev) => ({
			...prev,
			[String(qNumber)]: optionKey
		}));
	};
	const submitExam = async () => {
		try {
			setIsSubmitting(true);
			if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
			setCurrentlyPlayingAudioId(null);
			if (!(await apiFetch("/api/demo/submit", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					demoId,
					answers
				})
			})).ok) throw new Error("Failed to submit the demo test.");
			await exitDemoFullscreen(true);
			router.replace(`/demo/result/${demoId}`);
		} catch (err) {
			console.error(err);
			alert("An error occurred while submitting your answers. Please try again.");
			setIsSubmitting(false);
		}
	};
	const sectionQuestions = questions.filter((q) => q.section === currentSection);
	const currentQ = questions[currentQuestionIndex] || sectionQuestions[0];
	const activePassage = currentQ?.passageId ? passages[currentQ.passageId] : null;
	const isPassageFinished = !activePassage || activePassage.section !== "LISTENING" || completedAudioIds.includes(activePassage.id);
	const isListeningPassageLocked = !isPassageFinished;
	const isListeningSection = currentQ?.section === "LISTENING";
	const isReadingSection = currentQ?.section === "READING";
	const isLongConversationListening = isListeningSection && (currentQ?.partType === "PART_B" || currentQ?.partType === "PART_C") && Boolean(activePassage);
	const isLongConversationListeningPending = isLongConversationListening && !isPassageFinished;
	const showPassageCard = Boolean(activePassage) && (!isLongConversationListening || isLongConversationListeningPending);
	const mainGridClass = activePassage && !isListeningSection ? "grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_220px] items-start" : "grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_250px] items-start";
	const questionColumnClass = activePassage && !isListeningSection ? "lg:col-start-2" : "lg:col-start-1";
	const sidebarColumnClass = activePassage && !isListeningSection ? "lg:col-start-3" : "lg:col-start-2";
	const isDemoSectionEnd = currentQuestionIndex < questions.length - 1 && (currentSection === "LISTENING" && currentQ?.number === 10 || currentSection === "STRUCTURE" && currentQ?.number === 20);
	const isDemoTestComplete = currentQuestionIndex === questions.length - 1;
	const handleNextDemoAction = () => {
		if (isDemoSectionEnd) {
			setShowSectionTransitionModal(true);
			return;
		}
		if (isDemoTestComplete) {
			setShowSubmitModal(true);
			return;
		}
		handleNavigateQuestion(Math.min(questions.length - 1, currentQuestionIndex + 1));
	};
	const formatTimer = (sec) => {
		const m = Math.floor(sec / 60);
		const s = sec % 60;
		return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
	};
	if (isLoading || !currentQ) return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4",
		children: [/* @__PURE__ */ jsx("div", { className: "w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" }), /* @__PURE__ */ jsx("p", {
			className: "text-sm text-slate-400 font-medium",
			children: "Preparing your practice session..."
		})]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 select-none",
		onContextMenu: (e) => e.preventDefault(),
		children: [
			!hasCheckedAudio && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95",
					children: [
						/* @__PURE__ */ jsx("audio", {
							ref: testAudioRef,
							preload: "auto",
							src: appUrl("/audio/headphone-test.wav")
						}),
						/* @__PURE__ */ jsx("div", {
							className: "w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner",
							children: /* @__PURE__ */ jsx(Headphones, { className: "w-8 h-8" })
						}),
						/* @__PURE__ */ jsx("h2", {
							className: "text-xl sm:text-2xl font-black text-slate-900 mb-2",
							children: "Audio Check"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed",
							children: "Test your headphones before starting the Listening section. Make sure the sample sound is clear and balanced in both ears."
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 flex flex-col items-center gap-3",
							children: [
								isPlayingTestSound && /* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-center gap-1.5 h-8",
									children: [
										/* @__PURE__ */ jsx("span", { className: "w-1.5 h-3 bg-blue-600 rounded-full animate-pulse" }),
										/* @__PURE__ */ jsx("span", { className: "w-1.5 h-6 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" }),
										/* @__PURE__ */ jsx("span", { className: "w-1.5 h-8 bg-blue-700 rounded-full animate-bounce [animation-delay:-0.3s]" }),
										/* @__PURE__ */ jsx("span", { className: "w-1.5 h-5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.1s]" }),
										/* @__PURE__ */ jsx("span", { className: "w-1.5 h-2.5 bg-blue-600 rounded-full animate-pulse" })
									]
								}),
								/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: toggleTestAudio,
									className: `w-full flex items-center justify-center gap-2 py-3 px-5 font-bold rounded-xl text-sm transition shadow-xs ${isPlayingTestSound ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200" : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"}`,
									children: isPlayingTestSound ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(VolumeX, { className: "w-4 h-4 text-rose-600" }), /* @__PURE__ */ jsx("span", { children: "Stop test sound" })] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Play, { className: "w-4 h-4 fill-current text-blue-600" }), /* @__PURE__ */ jsx("span", { children: "Play test sound" })] })
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-[11px] text-slate-400",
									children: isPlayingTestSound ? "Test sound is playing. Adjust your volume if needed." : "Play the sample to check your headphones."
								})
							]
						}),
						/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: handleAudioReady,
							className: "w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-sm shadow-md shadow-blue-500/20 transition hover:scale-[1.01]",
							children: "I Can Hear Clearly — Start Demo"
						})
					]
				})
			}),
			hasCheckedAudio && needsFullscreen && !isFullscreen && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-40 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-slate-900 rounded-2xl max-w-md w-full p-7 text-center text-white shadow-2xl border border-slate-700",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "w-12 h-12 bg-blue-500/15 text-blue-300 rounded-xl flex items-center justify-center mx-auto mb-4",
							children: /* @__PURE__ */ jsx(Lock, { className: "w-6 h-6" })
						}),
						/* @__PURE__ */ jsx("h2", {
							className: "text-xl font-black mb-2",
							children: "Masuk Fullscreen untuk Demo"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-sm text-slate-300 leading-relaxed mb-6",
							children: "Browser belum mengaktifkan fullscreen secara otomatis. Tekan tombol di bawah untuk melanjutkan demo."
						}),
						/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => void requestDemoFullscreen(),
							className: "w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition",
							children: "Masuk Fullscreen"
						})
					]
				})
			}),
			showSectionTransitionModal && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4",
							children: /* @__PURE__ */ jsx(ArrowRight, { className: "w-6 h-6" })
						}),
						/* @__PURE__ */ jsx("h3", {
							className: "text-lg font-black text-slate-900 mb-2",
							children: "Continue to the next section?"
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "text-xs text-slate-600 mb-5 leading-relaxed",
							children: [currentSection === "LISTENING" && /* @__PURE__ */ jsxs(Fragment, { children: [
								"You are about to leave ",
								/* @__PURE__ */ jsx("strong", { children: "Section 1: Listening" }),
								" and continue to ",
								/* @__PURE__ */ jsx("strong", { children: "Section 2: Structure & Written Expression" }),
								" (10 questions — 8 minutes). You will not be able to return to Listening."
							] }), currentSection === "STRUCTURE" && /* @__PURE__ */ jsxs(Fragment, { children: [
								"You are about to continue to ",
								/* @__PURE__ */ jsx("strong", { children: "Section 3: Reading Comprehension" }),
								" (10 questions — 12 minutes). Review your Structure answers before continuing."
							] })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setShowSectionTransitionModal(false),
								className: "flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition",
								children: "Review Answers"
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => {
									if (currentSection === "LISTENING") transitionToSection("STRUCTURE");
									else if (currentSection === "STRUCTURE") transitionToSection("READING");
								},
								className: "flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-sm",
								children: "Continue"
							})]
						})
					]
				})
			}),
			showSubmitModal && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4",
							children: /* @__PURE__ */ jsx(CheckCircle2, { className: "w-6 h-6" })
						}),
						/* @__PURE__ */ jsx("h3", {
							className: "text-lg font-black text-slate-900 mb-2",
							children: "Complete Demo Test?"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-xs text-slate-600 mb-5 leading-relaxed",
							children: "All 30 questions are ready to submit. Your estimated TOEFL ITP score and brief explanations will be shown."
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setShowSubmitModal(false),
								className: "flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition",
								children: "Review Answers"
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								disabled: isSubmitting,
								onClick: submitExam,
								className: "flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm disabled:opacity-50",
								children: isSubmitting ? "Calculating Score..." : "Submit & View Score"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ jsxs("header", {
				className: "bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ jsx("div", {
						className: "w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs",
						children: "DEMO"
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "text-xs sm:text-sm font-extrabold text-slate-900",
							children: [
								currentSection === "LISTENING" && "Section 1: Listening Comprehension",
								currentSection === "STRUCTURE" && "Section 2: Structure & Written Expression",
								currentSection === "READING" && "Section 3: Reading Comprehension"
							]
						}), /* @__PURE__ */ jsx("span", {
							className: "hidden sm:inline-block text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-mono",
							children: "30 QUESTIONS"
						})]
					}), /* @__PURE__ */ jsxs("p", {
						className: "text-[11px] text-slate-500 font-medium",
						children: ["Participant: ", /* @__PURE__ */ jsx("strong", {
							className: "text-slate-700",
							children: participantName
						})]
					})] })]
				}), /* @__PURE__ */ jsx("div", {
					className: "flex items-center gap-3",
					children: /* @__PURE__ */ jsxs("div", {
						className: `flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-black shadow-xs border ${timeLeft < 60 ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse" : "bg-slate-900 border-slate-800 text-white"}`,
						children: [/* @__PURE__ */ jsx(Clock, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: formatTimer(timeLeft) })]
					})
				})]
			}),
			/* @__PURE__ */ jsxs("main", {
				className: `flex-1 ${isReadingSection ? "max-w-[1600px]" : "max-w-7xl"} w-full mx-auto p-4 sm:p-6 gap-6 ${mainGridClass}`,
				children: [
					showPassageCard && activePassage && /* @__PURE__ */ jsxs("div", {
						className: `bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col w-full max-w-none lg:col-start-1 ${isLongConversationListeningPending ? "lg:col-span-2" : isReadingSection ? "lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto" : ""}`,
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "border-b border-slate-100 pb-3 mb-4",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-[10.5px] font-bold text-blue-600 uppercase tracking-wider block mb-1",
									children: activePassage.section === "LISTENING" ? `Listening Stimulus (${currentQ?.partType === "PART_C" ? "Part C" : "Part B"})` : "Reading Passage (Academic Text)"
								}), /* @__PURE__ */ jsx("h3", {
									className: "text-base font-extrabold text-slate-900",
									children: activePassage.title
								})]
							}),
							activePassage.section === "LISTENING" && activePassage.audioScript && /* @__PURE__ */ jsx("div", {
								className: "mb-4",
								children: /* @__PURE__ */ jsx(AudioPlayer, {
									id: activePassage.id,
									audioUrl: null,
									textToSpeak: activePassage.audioScript,
									label: `${currentQ?.partType === "PART_C" ? "Part C" : "Part B"} conversation audio`,
									autoPlay: hasCheckedAudio,
									autoPlayDelayMs: 2500,
									allowReplay: true,
									playedAudioIds,
									completedAudioIds,
									onAudioPlayed: handleAudioPlayed,
									onAudioCompleted: handleAudioCompleted,
									currentlyPlayingId: currentlyPlayingAudioId,
									onCurrentlyPlayingChange: setCurrentlyPlayingAudioId
								}, activePassage.id)
							}),
							activePassage.content && /* @__PURE__ */ jsx("div", {
								className: "text-xs sm:text-sm text-slate-700 font-serif leading-relaxed whitespace-pre-line space-y-4",
								children: activePassage.content
							})
						]
					}),
					!isLongConversationListeningPending && /* @__PURE__ */ jsx("div", {
						className: `flex-1 flex flex-col w-full max-w-none ${questionColumnClass}`,
						children: /* @__PURE__ */ jsxs("div", {
							className: "bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs flex-1 flex flex-col",
							children: [
								/* @__PURE__ */ jsx("div", {
									className: "border-b border-slate-100 pb-4 mb-4 space-y-4",
									children: /* @__PURE__ */ jsxs("div", {
										className: "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3",
										children: [
											/* @__PURE__ */ jsxs("button", {
												type: "button",
												disabled: currentQuestionIndex === 0,
												onClick: () => handleNavigateQuestion(Math.max(0, currentQuestionIndex - 1)),
												className: "flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition disabled:opacity-35 disabled:cursor-not-allowed",
												title: "Previous question",
												children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", {
													className: "hidden sm:inline",
													children: "Previous"
												})]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "flex items-center gap-2 min-w-0",
												children: [/* @__PURE__ */ jsx("span", {
													className: "w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs shrink-0",
													children: currentQ.number
												}), /* @__PURE__ */ jsxs("span", {
													className: "text-xs font-bold text-slate-500 uppercase tracking-wider truncate",
													children: [
														"Question ",
														currentQ.number,
														" of 30"
													]
												})]
											}),
											isDemoTestComplete ? /* @__PURE__ */ jsxs("button", {
												type: "button",
												onClick: handleNextDemoAction,
												className: "flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition shadow-xs",
												children: [/* @__PURE__ */ jsx("span", {
													className: "hidden sm:inline",
													children: "Submit"
												}), /* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4" })]
											}) : /* @__PURE__ */ jsxs("button", {
												type: "button",
												onClick: handleNextDemoAction,
												className: "flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition shadow-xs",
												children: [/* @__PURE__ */ jsx("span", {
													className: "hidden sm:inline",
													children: isDemoSectionEnd ? "Next section" : "Next"
												}), /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })]
											})
										]
									})
								}),
								currentQ.section === "LISTENING" && currentQ.audioScript && /* @__PURE__ */ jsx("div", {
									className: "mb-6",
									children: /* @__PURE__ */ jsx(AudioPlayer, {
										id: currentQ.id,
										audioUrl: null,
										textToSpeak: currentQ.audioScript,
										label: `Question ${currentQ.number} audio`,
										disabled: !isPassageFinished,
										disabledTooltip: "Complete the conversation audio first.",
										autoPlay: hasCheckedAudio && isPassageFinished,
										autoPlayDelayMs: 2500,
										allowReplay: true,
										playedAudioIds,
										completedAudioIds,
										onAudioPlayed: handleAudioPlayed,
										onAudioCompleted: handleAudioCompleted,
										currentlyPlayingId: currentlyPlayingAudioId,
										onCurrentlyPlayingChange: setCurrentlyPlayingAudioId
									}, currentQ.id)
								}),
								isListeningPassageLocked ? /* @__PURE__ */ jsxs("div", {
									className: "flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/80 border border-dashed border-amber-200 rounded-2xl text-center my-4 space-y-3",
									children: [
										/* @__PURE__ */ jsx("div", {
											className: "w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner",
											children: /* @__PURE__ */ jsx(Lock, { className: "w-6 h-6" })
										}),
										/* @__PURE__ */ jsx("h4", {
											className: "text-sm font-bold text-slate-900",
											children: "Questions & Answer Choices Locked"
										}),
										/* @__PURE__ */ jsxs("p", {
											className: "text-xs text-slate-500 max-w-sm leading-relaxed",
											children: [
												"Complete the ",
												/* @__PURE__ */ jsxs("strong", { children: [currentQ.partType === "PART_C" ? "Part C" : "Part B", " listening audio"] }),
												" above to unlock the question and answer choices."
											]
										})
									]
								}) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
									className: "mb-6",
									children: currentQ.partType === "WRITTEN_EXPRESSION" ? /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
										className: "text-[11.5px] font-semibold text-slate-500 mb-2",
										children: "Choose the underlined word or phrase that is grammatically incorrect:"
									}), /* @__PURE__ */ jsx(WrittenExpressionText, { text: currentQ.questionText })] }) : /* @__PURE__ */ jsx("p", {
										className: "text-sm sm:text-base font-semibold text-slate-900 leading-relaxed",
										children: currentQ.questionText
									})
								}), /* @__PURE__ */ jsx("div", {
									className: "space-y-3 flex-1",
									role: "radiogroup",
									"aria-label": "Answer choices",
									children: [
										"A",
										"B",
										"C",
										"D"
									].map((key) => {
										const isSelected = answers[String(currentQ.number)] === key;
										return /* @__PURE__ */ jsxs("button", {
											type: "button",
											role: "radio",
											"aria-checked": isSelected,
											"aria-label": `Option ${key}: ${currentQ.options[key]}`,
											onClick: () => handleSelectAnswer(currentQ.number, key),
											className: `w-full flex items-start text-left p-3.5 sm:p-4 rounded-xl border transition ${isSelected ? "bg-blue-50 border-blue-600 text-blue-900 shadow-xs ring-1 ring-blue-600" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800"}`,
											children: [/* @__PURE__ */ jsx("div", {
												className: `w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mr-3 transition ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 border border-slate-200"}`,
												children: key
											}), /* @__PURE__ */ jsx("span", {
												className: "text-xs sm:text-sm font-medium pt-0.5 leading-relaxed",
												children: currentQ.options[key]
											})]
										}, key);
									})
								})] })
							]
						})
					}),
					!isLongConversationListeningPending && /* @__PURE__ */ jsxs("aside", {
						className: `lg:row-start-1 lg:row-span-2 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs lg:sticky lg:top-24 ${sidebarColumnClass}`,
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between gap-2 mb-3",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-[10px] font-bold uppercase tracking-wider text-slate-500",
									children: "Questions"
								}), /* @__PURE__ */ jsx("span", {
									className: "text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg",
									children: currentSection === "LISTENING" ? "Listening" : currentSection === "STRUCTURE" ? "Structure" : "Reading"
								})]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "grid grid-cols-6 lg:grid-cols-5 gap-1.5",
								children: sectionQuestions.map((q) => {
									const qIndex = questions.findIndex((item) => item.number === q.number);
									const isAnswered = !!answers[String(q.number)];
									return /* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => handleNavigateQuestion(qIndex),
										className: `h-8 rounded-lg font-bold text-[11px] flex items-center justify-center transition ${qIndex === currentQuestionIndex ? "bg-blue-600 text-white shadow-xs" : isAnswered ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"}`,
										children: q.number
									}, q.id);
								})
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-[10px] text-slate-400 leading-relaxed mt-4",
								children: "Practice mode: select a question number to review it."
							})
						]
					})
				]
			})
		]
	});
}
//#endregion
//#region resources/js/data/demoQuestions.ts
var DEMO_QUESTIONS = [
	{
		id: "demo-q1",
		number: 1,
		section: "LISTENING",
		partType: "PART_A",
		audioScript: `(Man) Did you manage to find the reference book Professor Miller recommended?
(Woman) The bookstore was sold out, but the campus library had a few copies on reserve.
(Narrator) What does the woman imply?`,
		questionText: "What does the woman imply?",
		options: {
			A: "She bought the last copy at the bookstore.",
			B: "The book is available for use at the campus library.",
			C: "Professor Miller kept the reference books for himself.",
			D: "She could not find the book anywhere on campus."
		},
		correctAnswer: "B",
		explanation: "Wanita menyatakan bahwa toko buku kehabisan stok, tetapi perpustakaan kampus memiliki beberapa eksemplar di bagian cadangan ('on reserve'). Jadi buku tersebut tersedia di perpustakaan."
	},
	{
		id: "demo-q2",
		number: 2,
		section: "LISTENING",
		partType: "PART_A",
		audioScript: `(Woman) I'm really worried about tomorrow's presentation in organic chemistry.
(Man) Don't stress too much. You've practiced thoroughly and you know the material inside out.
(Narrator) What does the man mean?`,
		questionText: "What does the man mean?",
		options: {
			A: "The woman should practice her presentation again.",
			B: "Organic chemistry is a very difficult subject.",
			C: "The woman is well prepared and should feel confident.",
			D: "He wants to take the presentation for her."
		},
		correctAnswer: "C",
		explanation: "Pria menenangkan wanita dengan berkata 'You know the material inside out' (menguasai materi luar dalam), yang bermakna wanita tersebut sudah sangat siap dan percaya diri."
	},
	{
		id: "demo-q3",
		number: 3,
		section: "LISTENING",
		partType: "PART_A",
		audioScript: `(Man) Are you planning to drive to the conference in Chicago this weekend?
(Woman) With gas prices so high and parking scarce, I'd rather take the morning express train.
(Narrator) What will the woman probably do?`,
		questionText: "What will the woman probably do?",
		options: {
			A: "Drive her car to Chicago early in the morning.",
			B: "Travel to the conference by train instead of driving.",
			C: "Cancel her trip because of high gas prices.",
			D: "Look for a free parking space near the conference venue."
		},
		correctAnswer: "B",
		explanation: "Frasa 'I'd rather take the morning express train' menunjukkan wanita lebih memilih naik kereta api cepat pagi daripada mengendarai mobil."
	},
	{
		id: "demo-q4",
		number: 4,
		section: "LISTENING",
		partType: "PART_A",
		audioScript: `(Woman) The registrar's office said the deadline for course withdrawal was yesterday afternoon.
(Man) If you speak directly with Academic Advising, they might grant an emergency exception.
(Narrator) What does the man suggest the woman do?`,
		questionText: "What does the man suggest the woman do?",
		options: {
			A: "Accept that she cannot drop the course.",
			B: "Consult with Academic Advising about an exception.",
			C: "Visit the registrar's office again this afternoon.",
			D: "Register for a new course immediately."
		},
		correctAnswer: "B",
		explanation: "Pria menyarankan: 'If you speak directly with Academic Advising, they might grant an emergency exception.' Intinya adalah berkonsultasi ke Bagian Penasihat Akademik."
	},
	{
		id: "demo-q5",
		number: 5,
		section: "LISTENING",
		partType: "PART_A",
		audioScript: `(Man) I heard the university is renovating the main dining hall next month.
(Woman) It's about time! The kitchen facilities haven't been updated in over twenty years.
(Narrator) What does the woman mean?`,
		questionText: "What does the woman mean?",
		options: {
			A: "The dining hall does not need any renovations.",
			B: "The renovation has been delayed for twenty years.",
			C: "She thinks the renovation is overdue and much needed.",
			D: "She will not eat at the dining hall next month."
		},
		correctAnswer: "C",
		explanation: "Idiom 'It's about time!' bermakna bahwa suatu tindakan sudah seharusnya dilakukan sejak dulu karena sudah sangat dibutuhkan atau terlambat."
	},
	{
		id: "demo-q6",
		number: 6,
		section: "LISTENING",
		partType: "PART_A",
		audioScript: `(Woman) Do you know if David finished typing up the team's lab report?
(Man) Hardly had he sat down at his computer when the power went out across the dorm.
(Narrator) What happened to David?`,
		questionText: "What happened to David?",
		options: {
			A: "He was unable to finish the report due to a power outage.",
			B: "He decided to study in the dark dormitory.",
			C: "He completed the lab report before the power cut.",
			D: "He forgot to save the report on his computer."
		},
		correctAnswer: "A",
		explanation: "Pola inversi 'Hardly had he sat down... when the power went out' bermakna baru saja ia duduk, listrik padam. Akibatnya ia belum sempat menyelesaikan laporan laboratoriumnya."
	},
	{
		id: "demo-q7",
		number: 7,
		section: "LISTENING",
		partType: "PART_B",
		passageId: "listening-part-b",
		audioScript: `(Narrator) Question number 7. What is the main topic of the conversation?`,
		questionText: "What is the main topic of the conversation?",
		options: {
			A: "Installing a modern water filtration system in the campus library.",
			B: "Accessing historical blueprints preserved in the campus archives.",
			C: "Registering for Professor Vance's nineteenth-century history class.",
			D: "Purchasing flatbed scanner equipment for student research."
		},
		correctAnswer: "B",
		explanation: "Topik utama percakapan adalah mahasiswa yang ingin memeriksa dan mengakses cetak biru bersejarah abad ke-19 yang tersimpan di arsip khusus kampus."
	},
	{
		id: "demo-q8",
		number: 8,
		section: "LISTENING",
		partType: "PART_B",
		passageId: "listening-part-b",
		audioScript: `(Narrator) Question number 8. Why are the blueprints stored in a climate-controlled basement vault?`,
		questionText: "Why are the blueprints stored in a climate-controlled basement vault?",
		options: {
			A: "To keep them hidden from unauthorized visitors.",
			B: "Because there is no room available on the second floor.",
			C: "To protect and preserve the delicate historical paper.",
			D: "Because the blueprints are contaminated with chemicals."
		},
		correctAnswer: "C",
		explanation: "Pustakawan menyatakan: 'They're kept in a climate-controlled vault in the basement to preserve the paper' (untuk melindungi dan mengawetkan kertas bersejarah yang rapuh)."
	},
	{
		id: "demo-q9",
		number: 9,
		section: "LISTENING",
		partType: "PART_B",
		passageId: "listening-part-b",
		audioScript: `(Narrator) Question number 9. What rule applies to documents from the Special Collection?`,
		questionText: "What rule applies to documents from the Special Collection?",
		options: {
			A: "Students may borrow them for up to three business days.",
			B: "They can only be examined inside the library's designated reading room.",
			C: "Only graduate students and faculty members may view them.",
			D: "They cannot be scanned or photographed under any condition."
		},
		correctAnswer: "B",
		explanation: "Pustakawan menegaskan bahwa dokumen tidak boleh keluar gedung ('cannot leave the library building') dan hanya boleh dipelajari di ruang baca khusus berpenyelia di lantai dua."
	},
	{
		id: "demo-q10",
		number: 10,
		section: "LISTENING",
		partType: "PART_B",
		passageId: "listening-part-b",
		audioScript: `(Narrator) Question number 10. What must the student do before he can examine the blueprints?`,
		questionText: "What must the student do before he can examine the blueprints?",
		options: {
			A: "Pay a security deposit at the cashier desk.",
			B: "Obtain a physical signature from Professor Vance.",
			C: "Submit an online request at least twenty-four hours in advance.",
			D: "Pass an examination on proper handling of historical documents."
		},
		correctAnswer: "C",
		explanation: "Mahasiswa harus mengisi formulir digital minimal 24 jam sebelum kedatangan ('submit a digital request form... at least twenty-four hours ahead') agar staf sempat menyiapkannya."
	},
	{
		id: "demo-q11",
		number: 11,
		section: "STRUCTURE",
		partType: "STRUCTURE",
		questionText: "Rarely _______ such extensive coral bleaching events as those recorded in the Pacific Ocean over the past decade.",
		options: {
			A: "marine biologists have documented",
			B: "have marine biologists documented",
			C: "documenting marine biologists",
			D: "marine biologists are documenting"
		},
		correctAnswer: "B",
		explanation: "Kalimat diawali kata keterangan negatif 'Rarely', sehingga wajib mengalami pola inversi: Auxiliary verb + Subject + Main verb ('have marine biologists documented')."
	},
	{
		id: "demo-q12",
		number: 12,
		section: "STRUCTURE",
		partType: "STRUCTURE",
		questionText: "_______ by glaciers thousands of years ago, the Great Lakes contain roughly twenty percent of the world's surface freshwater.",
		options: {
			A: "Formed",
			B: "They were formed",
			C: "That were formed",
			D: "Forming them"
		},
		correctAnswer: "A",
		explanation: "Kalimat ini membutuhkan participial phrase pasif ('Formed by glaciers...') yang berfungsi sebagai penjelas subjek utama 'the Great Lakes'."
	},
	{
		id: "demo-q13",
		number: 13,
		section: "STRUCTURE",
		partType: "STRUCTURE",
		questionText: "Not only _______ an exceptional conductor of heat, but diamond is also renowned for its remarkable hardness.",
		options: {
			A: "is diamond",
			B: "diamond is",
			C: "diamond being",
			D: "it is diamond"
		},
		correctAnswer: "A",
		explanation: "Penghubung korelatif 'Not only' di awal klausa menuntut inversi subjek dan to be/auxiliary: 'Not only is diamond...'."
	},
	{
		id: "demo-q14",
		number: 14,
		section: "STRUCTURE",
		partType: "STRUCTURE",
		questionText: "The Federal Reserve Board adjusts interest rates _______ inflationary pressures and stabilize national economic growth.",
		options: {
			A: "to curb",
			B: "curbing",
			C: "it curbs",
			D: "for curb"
		},
		correctAnswer: "A",
		explanation: "Dibutuhkan Infinitive of Purpose ('to curb' = untuk meredam) yang berpasangan paralel dengan kata kerja 'and [to] stabilize'."
	},
	{
		id: "demo-q15",
		number: 15,
		section: "STRUCTURE",
		partType: "STRUCTURE",
		questionText: "Geologists speculate that tectonic plate collisions in prehistoric eras _______ mountain ranges worldwide.",
		options: {
			A: "producing",
			B: "were produced",
			C: "produced",
			D: "to produce"
		},
		correctAnswer: "C",
		explanation: "Klausa noun clause membutuhkan kata kerja utama (finite verb) dalam bentuk Simple Past ('produced') karena mengacu pada masa lampau 'prehistoric eras'."
	},
	{
		id: "demo-q16",
		number: 16,
		section: "STRUCTURE",
		partType: "WRITTEN_EXPRESSION",
		questionText: "The hummingbird is capable (A) of flying backward and hovering in place, making it differently (B) from almost (C) all other avian (D) species.",
		options: {
			A: "capable",
			B: "differently",
			C: "almost",
			D: "avian"
		},
		correctAnswer: "B",
		explanation: "Pilihan (B) salah. Pola 'making it + [object complement]' memerlukan kata sifat (adjective) 'different', bukan kata keterangan (adverb) 'differently'."
	},
	{
		id: "demo-q17",
		number: 17,
		section: "STRUCTURE",
		partType: "WRITTEN_EXPRESSION",
		questionText: "Although (A) photosynthesis occurs primary (B) in the green leaves of plants, some cacti utilize their fleshy stems to capture (C) sunlight and produce (D) energy.",
		options: {
			A: "Although",
			B: "primary",
			C: "to capture",
			D: "produce"
		},
		correctAnswer: "B",
		explanation: "Pilihan (B) salah. Kata tersebut menerangkan kata kerja 'occurs', sehingga harus berbentuk kata keterangan (adverb) 'primarily', bukan 'primary'."
	},
	{
		id: "demo-q18",
		number: 18,
		section: "STRUCTURE",
		partType: "WRITTEN_EXPRESSION",
		questionText: "Neither the executive director nor (A) the department supervisors was (B) aware of the newly revised (C) safety protocols issued (D) by the state committee.",
		options: {
			A: "nor",
			B: "was",
			C: "revised",
			D: "issued"
		},
		correctAnswer: "B",
		explanation: "Pilihan (B) salah. Pada konstruksi 'Neither... nor...', kata kerja harus sesuai dengan subjek yang terdekat ('the department supervisors' = jamak), sehingga harus menggunakan 'were', bukan 'was'."
	},
	{
		id: "demo-q19",
		number: 19,
		section: "STRUCTURE",
		partType: "WRITTEN_EXPRESSION",
		questionText: "Modern satellites provide accurately (A) weather forecasts, assist in global navigation, and monitor (B) environmental changes (C) across the Earth's surface (D).",
		options: {
			A: "accurately",
			B: "monitor",
			C: "changes",
			D: "surface"
		},
		correctAnswer: "A",
		explanation: "Pilihan (A) salah. Kata tersebut menerangkan frasa benda 'weather forecasts', sehingga harus menggunakan kata sifat 'accurate', bukan kata keterangan 'accurately'."
	},
	{
		id: "demo-q20",
		number: 20,
		section: "STRUCTURE",
		partType: "WRITTEN_EXPRESSION",
		questionText: "Every year, thousands of migratory birds travels (A) across continents along established (B) flyways to reach their seasonal (C) breeding grounds (D).",
		options: {
			A: "travels",
			B: "established",
			C: "seasonal",
			D: "grounds"
		},
		correctAnswer: "A",
		explanation: "Pilihan (A) salah. Subjek kalimat adalah 'thousands of migratory birds' (jamak), sehingga kata kerja yang benar adalah 'travel', bukan 'travels'."
	},
	{
		id: "demo-q21",
		number: 21,
		section: "READING",
		partType: "READING",
		passageId: "reading-passage-1",
		questionText: "What is the primary topic of the passage?",
		options: {
			A: "The chemical synthesis of artificial incandescent lighting.",
			B: "The biological functions and mechanisms of light generation in deep-sea life.",
			C: "The commercial cultivation of symbiotic marine bacteria.",
			D: "The territorial hunting habits of predatory anglerfish."
		},
		correctAnswer: "B",
		explanation: "Teks secara keseluruhan mengulas mekanisme biokimia (luciferin & luciferase) serta berbagai fungsi biologis bioluminesensi bagi makhluk laut dalam."
	},
	{
		id: "demo-q22",
		number: 22,
		section: "READING",
		partType: "READING",
		passageId: "reading-passage-1",
		questionText: "The word \"teems\" in Line 3 is closest in meaning to:",
		options: {
			A: "contends",
			B: "abounds",
			C: "struggles",
			D: "fluctuates"
		},
		correctAnswer: "B",
		explanation: "Kata 'teems with life' berarti berlimpah ruah atau dipenuhi kehidupan, sepadan maknanya dengan 'abounds'."
	},
	{
		id: "demo-q23",
		number: 23,
		section: "READING",
		partType: "READING",
		passageId: "reading-passage-1",
		questionText: "According to paragraph 2, why is bioluminescence classified as \"cold light\"?",
		options: {
			A: "It can only occur in sub-zero seawater temperatures.",
			B: "It is produced with virtually no wasted heat energy.",
			C: "It requires ice crystals to catalyze the oxidation reaction.",
			D: "It emits exclusively infrared radiation."
		},
		correctAnswer: "B",
		explanation: "Disebut 'cold light' karena reaksi kimianya menghasilkan cahaya dengan pelepasan energi panas yang sangat kecil ('negligible thermal dissipation')."
	},
	{
		id: "demo-q24",
		number: 24,
		section: "READING",
		partType: "READING",
		passageId: "reading-passage-1",
		questionText: "Why is the light emitted by most deep-sea creatures blue-green in color?",
		options: {
			A: "Luciferin reacts solely with copper compounds found in seawater.",
			B: "Deep-sea predators are biologically blind to other light spectra.",
			C: "Blue-green wavelengths travel the farthest through seawater.",
			D: "Oxygen levels in the bathypelagic zone absorb red photons."
		},
		correctAnswer: "C",
		explanation: "Di baris 14-15 dijelaskan bahwa cahaya biru-hijau (~470 nm) merambat paling efektif menembus air laut dibandingkan spektrum lainnya."
	},
	{
		id: "demo-q25",
		number: 25,
		section: "READING",
		partType: "READING",
		passageId: "reading-passage-1",
		questionText: "According to the passage, all of the following are involved in the biochemical generation of bioluminescence EXCEPT:",
		options: {
			A: "luciferase",
			B: "luciferin",
			C: "oxygen",
			D: "chlorophyll"
		},
		correctAnswer: "D",
		explanation: "Paragraf 2 menyebutkan luciferin, luciferase, ATP, dan oksigen. Klorofil (chlorophyll) merupakan pigmen tumbuhan dan tidak terlibat dalam bioluminesensi laut dalam."
	},
	{
		id: "demo-q26",
		number: 26,
		section: "READING",
		partType: "READING",
		passageId: "reading-passage-1",
		questionText: "The word \"modulating\" in Line 19 is closest in meaning to:",
		options: {
			A: "magnifying",
			B: "adjusting",
			C: "resisting",
			D: "concealing"
		},
		correctAnswer: "B",
		explanation: "Kata 'modulating' dalam konteks mengatur intensitas cahaya bermakna menyetel atau menyesuaikan ('adjusting')."
	},
	{
		id: "demo-q27",
		number: 27,
		section: "READING",
		partType: "READING",
		passageId: "reading-passage-1",
		questionText: "The word \"their\" in Line 20 refers to:",
		options: {
			A: "photophores",
			B: "layers",
			C: "predators",
			D: "these creatures"
		},
		correctAnswer: "D",
		explanation: "Frasa 'these creatures... eliminate their silhouettes' mengacu pada makhluk-makhluk laut yang disebutkan sebelumnya (hatchetfish dan cumi-cumi)."
	},
	{
		id: "demo-q28",
		number: 28,
		section: "READING",
		partType: "READING",
		passageId: "reading-passage-1",
		questionText: "What can be inferred from paragraph 3 about a fish that does NOT utilize counterillumination?",
		options: {
			A: "It would cast a noticeable dark shadow when viewed from underneath.",
			B: "It cannot produce any enzymatic chemical reactions.",
			C: "It is immune to attacks from large deep-sea squids.",
			D: "It must migrate to surface waters to feed during the daytime."
		},
		correctAnswer: "A",
		explanation: "Counterillumination berfungsi menyamarkan bayangan/siluet terhadap predator di bawahnya. Ikan tanpa mekanisme ini akan terlihat jelas sebagai siluet gelap dari arah bawah."
	},
	{
		id: "demo-q29",
		number: 29,
		section: "READING",
		partType: "READING",
		passageId: "reading-passage-1",
		questionText: "How does the female anglerfish produce light in its esca?",
		options: {
			A: "By absorbing ambient sunlight stored during the day.",
			B: "By hosting symbiotic bioluminescent bacteria.",
			C: "By rapidly rubbing its dorsal spines together.",
			D: "By releasing electrical discharges through its modified fins."
		},
		correctAnswer: "B",
		explanation: "Baris 25-26 menyatakan bahwa esca menampung miliaran bakteri bioluminesen yang bersimbiosis ('harbors billions of symbiotic bioluminescent bacteria')."
	},
	{
		id: "demo-q30",
		number: 30,
		section: "READING",
		partType: "READING",
		passageId: "reading-passage-1",
		questionText: "In the final sentence of the passage, the author mentions intraspecific communication in order to:",
		options: {
			A: "illustrate that bioluminescence serves purposes beyond predator-prey dynamics.",
			B: "argue that deep-sea animals have developed sophisticated vocal cords.",
			C: "prove that deep-sea creatures prefer living in solitary isolation.",
			D: "emphasize that mating rituals require sunlight to be successful."
		},
		correctAnswer: "A",
		explanation: "Penulis menyebutkan komunikasi antar sesama spesies untuk memperlihatkan bahwa fungsi cahaya bioluminesensi melampaui sekadar urusan mangsa dan pemangsa (menarik pasangan & pertahanan teritorial)."
	}
];
//#endregion
//#region resources/js/Pages/DemoResult.tsx
var DemoResult_exports = /* @__PURE__ */ __exportAll({ default: () => DemoResultPage });
function DemoResultPage() {
	const params = useParams();
	useRouter();
	const demoId = params.demoId;
	const [isLoading, setIsLoading] = useState(true);
	const [data, setData] = useState(null);
	const [filterType, setFilterType] = useState("ALL");
	const [filterSection, setFilterSection] = useState("ALL");
	const [expandedQuestions, setExpandedQuestions] = useState({});
	useEffect(() => {
		async function loadResult() {
			try {
				setIsLoading(true);
				const res = await apiFetch(`/api/demo/result/${demoId}`);
				if (!res.ok) throw new Error("Gagal mengambil data");
				setData(await res.json());
			} catch (err) {
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		}
		loadResult();
	}, [demoId]);
	const toggleExpand = (num) => {
		setExpandedQuestions((prev) => ({
			...prev,
			[num]: !prev[num]
		}));
	};
	const expandAll = () => {
		const all = {};
		(data?.questions || DEMO_QUESTIONS).forEach((q) => {
			all[q.number] = true;
		});
		setExpandedQuestions(all);
	};
	if (isLoading || !data) return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4",
		children: [/* @__PURE__ */ jsx("div", { className: "w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" }), /* @__PURE__ */ jsx("p", {
			className: "text-sm text-slate-400 font-medium",
			children: "Memuat Hasil Evaluasi Demo..."
		})]
	});
	const { lead, result, userAnswers } = data;
	const questionsList = data.questions || DEMO_QUESTIONS;
	const filteredQuestions = questionsList.filter((q) => {
		const isCorrect = (userAnswers[String(q.number)] || "").toUpperCase() === q.correctAnswer;
		if (filterType === "CORRECT" && !isCorrect) return false;
		if (filterType === "INCORRECT" && isCorrect) return false;
		if (filterSection !== "ALL" && q.section !== filterSection) return false;
		return true;
	});
	const correctCount = questionsList.filter((q) => (userAnswers[String(q.number)] || "").toUpperCase() === q.correctAnswer).length;
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800",
		children: [/* @__PURE__ */ jsxs("header", {
			className: "bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs",
					children: "ITP"
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-sm sm:text-base font-extrabold text-slate-900",
					children: "Hasil Evaluasi Simulasi Demo TOEFL ITP®"
				}), /* @__PURE__ */ jsxs("p", {
					className: "text-[11px] text-slate-500 font-medium",
					children: ["Peserta: ", /* @__PURE__ */ jsx("strong", {
						className: "text-slate-700",
						children: lead.name
					})]
				})] })]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsx(Link, {
					href: "/",
					className: "px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition",
					children: "Beranda"
				}), /* @__PURE__ */ jsx(Link, {
					href: "/student/dashboard",
					className: "px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs transition shadow-xs",
					children: "Lihat Jadwal Ujian"
				})]
			})]
		}), /* @__PURE__ */ jsxs("main", {
			className: "flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-8",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "bg-amber-500 text-slate-950 font-black text-[11px] tracking-wider uppercase py-1 px-4 text-center shadow-xs",
							children: "⚠️ SIMULASI DEMO (30 SOAL) — BUKAN SERTIFIKAT"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "space-y-3 text-center lg:text-left",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold",
										children: [/* @__PURE__ */ jsx(Sparkles, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "Simulasi Mandiri 30 Menit Selesai" })]
									}),
									/* @__PURE__ */ jsxs("h2", {
										className: "text-2xl sm:text-3xl font-black text-slate-900 tracking-tight",
										children: [
											"Selamat, ",
											lead.name,
											"!"
										]
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed",
										children: "Anda telah menyelesaikan simulasi 30 soal TOEFL ITP. Berikut adalah estimasi prediksi skor dan tingkat kemahiran bahasa Inggris Anda:"
									})
								]
							}), /* @__PURE__ */ jsxs("div", {
								className: "bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white text-center shadow-2xl min-w-[260px] border border-blue-500/20",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "text-xs font-bold uppercase tracking-widest text-blue-200 block mb-1",
										children: "Estimasi Skor TOEFL ITP®"
									}),
									/* @__PURE__ */ jsx("div", {
										className: "text-5xl sm:text-6xl font-black tracking-tight my-2 text-white",
										children: result.totalScore
									}),
									/* @__PURE__ */ jsx("div", {
										className: "text-xs text-blue-200 font-mono mb-4",
										children: "Skala Simulasi: 310 – 677"
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "inline-block px-3 py-1 bg-white/15 border border-white/20 rounded-full font-bold text-xs backdrop-blur-xs",
										children: ["CEFR: ", result.cefrLevel]
									})
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-1 sm:grid-cols-3 border-t border-slate-100 bg-slate-50 divide-y sm:divide-y-0 sm:divide-x divide-slate-200",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "p-5 sm:p-6 text-center",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-center gap-2 text-slate-500 mb-1",
											children: [/* @__PURE__ */ jsx(Headphones, { className: "w-4 h-4 text-blue-600" }), /* @__PURE__ */ jsx("span", {
												className: "text-xs font-bold uppercase",
												children: "Section 1: Listening"
											})]
										}),
										/* @__PURE__ */ jsx("div", {
											className: "text-2xl sm:text-3xl font-black text-slate-900 my-1",
											children: result.listeningScaled
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "text-[11px] text-slate-500 font-medium",
											children: [
												"Benar: ",
												/* @__PURE__ */ jsx("strong", {
													className: "text-slate-800",
													children: result.listeningRaw
												}),
												" / 10 Soal"
											]
										})
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "p-5 sm:p-6 text-center",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-center gap-2 text-slate-500 mb-1",
											children: [/* @__PURE__ */ jsx(FileText, { className: "w-4 h-4 text-emerald-600" }), /* @__PURE__ */ jsx("span", {
												className: "text-xs font-bold uppercase",
												children: "Section 2: Structure"
											})]
										}),
										/* @__PURE__ */ jsx("div", {
											className: "text-2xl sm:text-3xl font-black text-slate-900 my-1",
											children: result.structureScaled
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "text-[11px] text-slate-500 font-medium",
											children: [
												"Benar: ",
												/* @__PURE__ */ jsx("strong", {
													className: "text-slate-800",
													children: result.structureRaw
												}),
												" / 10 Soal"
											]
										})
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "p-5 sm:p-6 text-center",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-center gap-2 text-slate-500 mb-1",
											children: [/* @__PURE__ */ jsx(BookOpen, { className: "w-4 h-4 text-amber-600" }), /* @__PURE__ */ jsx("span", {
												className: "text-xs font-bold uppercase",
												children: "Section 3: Reading"
											})]
										}),
										/* @__PURE__ */ jsx("div", {
											className: "text-2xl sm:text-3xl font-black text-slate-900 my-1",
											children: result.readingScaled
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "text-[11px] text-slate-500 font-medium",
											children: [
												"Benar: ",
												/* @__PURE__ */ jsx("strong", {
													className: "text-slate-800",
													children: result.readingRaw
												}),
												" / 10 Soal"
											]
										})
									]
								})
							]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800 flex flex-col sm:flex-row items-center justify-between gap-6",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "space-y-2 text-center sm:text-left",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2 justify-center sm:justify-start",
							children: /* @__PURE__ */ jsx("span", { children: "Butuh Sertifikat Digital TOEFL ITP® Ber-kode Verifikasi?" })
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xs sm:text-sm text-blue-200 max-w-xl leading-relaxed",
							children: "Daftarkan diri Anda untuk sesi ujian berjadwal (140 soal). Dapatkan laporan skor dan sertifikat digital dengan kode verifikasi; penerimaan dokumen mengikuti kebijakan institusi tujuan."
						})]
					}), /* @__PURE__ */ jsx(Link, {
						href: "/student/dashboard",
						className: "py-3 px-6 bg-blue-500 hover:bg-blue-400 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-lg transition hover:scale-105 shrink-0 whitespace-nowrap",
						children: "Lihat Jadwal Ujian →"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h3", {
								className: "text-lg font-black text-slate-900 flex items-center gap-2",
								children: [/* @__PURE__ */ jsx("span", { children: "Evaluasi Soal & Pembahasan Singkat" }), /* @__PURE__ */ jsxs("span", {
									className: "text-xs font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full",
									children: [correctCount, " / 30 Benar"]
								})]
							}), /* @__PURE__ */ jsx("p", {
								className: "text-xs text-slate-500",
								children: "Klik kartu nomor soal di bawah ini untuk melihat ulasan dan penjelasan singkat."
							})] }), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2 flex-wrap",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "inline-flex rounded-xl bg-slate-200 p-1 text-xs font-bold",
									children: [
										/* @__PURE__ */ jsxs("button", {
											type: "button",
											onClick: () => setFilterType("ALL"),
											className: `px-3 py-1 rounded-lg transition ${filterType === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"}`,
											children: [
												"Semua (",
												questionsList.length,
												")"
											]
										}),
										/* @__PURE__ */ jsxs("button", {
											type: "button",
											onClick: () => setFilterType("CORRECT"),
											className: `px-3 py-1 rounded-lg transition ${filterType === "CORRECT" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`,
											children: [
												"Benar (",
												correctCount,
												")"
											]
										}),
										/* @__PURE__ */ jsxs("button", {
											type: "button",
											onClick: () => setFilterType("INCORRECT"),
											className: `px-3 py-1 rounded-lg transition ${filterType === "INCORRECT" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`,
											children: [
												"Salah (",
												questionsList.length - correctCount,
												")"
											]
										})
									]
								}), /* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: expandAll,
									className: "px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition",
									children: "Buka Semua"
								})]
							})]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "flex items-center gap-2 overflow-x-auto pb-2",
							children: [
								"ALL",
								"LISTENING",
								"STRUCTURE",
								"READING"
							].map((sec) => /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => setFilterSection(sec),
								className: `px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${filterSection === sec ? "bg-slate-900 text-white shadow-xs" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`,
								children: [
									sec === "ALL" && "Semua Bagian",
									sec === "LISTENING" && "Listening (1-10)",
									sec === "STRUCTURE" && "Structure (11-20)",
									sec === "READING" && "Reading (21-30)"
								]
							}, sec))
						}),
						/* @__PURE__ */ jsx("div", {
							className: "space-y-3",
							children: filteredQuestions.map((q) => {
								const userAns = userAnswers[String(q.number)] || "-";
								const isCorrect = userAns.toUpperCase() === q.correctAnswer;
								const isExpanded = !!expandedQuestions[q.number];
								return /* @__PURE__ */ jsxs("div", {
									className: "bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition",
									children: [/* @__PURE__ */ jsxs("div", {
										onClick: () => toggleExpand(q.number),
										className: "p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-3 min-w-0",
											children: [/* @__PURE__ */ jsx("div", {
												className: `w-8 h-8 rounded-xl font-extrabold text-xs flex items-center justify-center shrink-0 ${isCorrect ? "bg-emerald-100 text-emerald-700 border border-emerald-300" : "bg-rose-100 text-rose-700 border border-rose-300"}`,
												children: isCorrect ? /* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(XCircle, { className: "w-4 h-4" })
											}), /* @__PURE__ */ jsxs("div", {
												className: "min-w-0",
												children: [/* @__PURE__ */ jsxs("div", {
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ jsxs("span", {
														className: "font-extrabold text-sm text-slate-900",
														children: ["Soal No. ", q.number]
													}), /* @__PURE__ */ jsx("span", {
														className: "text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded",
														children: q.section
													})]
												}), /* @__PURE__ */ jsx("p", {
													className: "text-xs text-slate-500 truncate mt-0.5 max-w-lg",
													children: q.questionText
												})]
											})]
										}), /* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-3 shrink-0",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "text-right",
												children: [/* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-slate-400 block font-medium",
													children: "Jawaban Anda"
												}), /* @__PURE__ */ jsxs("span", {
													className: `font-mono font-bold text-xs ${isCorrect ? "text-emerald-600" : "text-rose-600"}`,
													children: [
														userAns,
														" ",
														isCorrect ? "(Tepat)" : `(Kunci: ${q.correctAnswer})`
													]
												})]
											}), isExpanded ? /* @__PURE__ */ jsx(ChevronUp, { className: "w-4 h-4 text-slate-400" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4 text-slate-400" })]
										})]
									}), isExpanded && /* @__PURE__ */ jsxs("div", {
										className: "p-4 sm:p-6 border-t border-slate-100 bg-slate-50/60 space-y-4 text-xs sm:text-sm animate-in fade-in",
										children: [
											q.audioScript && /* @__PURE__ */ jsxs("div", {
												className: "bg-slate-100 p-3.5 rounded-xl border border-slate-200",
												children: [/* @__PURE__ */ jsx("span", {
													className: "text-[10.5px] font-bold text-slate-500 uppercase block mb-1",
													children: "🎧 Transkrip Audio Soal:"
												}), /* @__PURE__ */ jsx("p", {
													className: "text-xs font-serif text-slate-700 whitespace-pre-line leading-relaxed",
													children: q.audioScript
												})]
											}),
											/* @__PURE__ */ jsx("p", {
												className: "font-bold text-slate-900",
												children: q.questionText
											}),
											/* @__PURE__ */ jsx("div", {
												className: "grid grid-cols-1 sm:grid-cols-2 gap-2",
												children: [
													"A",
													"B",
													"C",
													"D"
												].map((optKey) => {
													const isKey = q.correctAnswer === optKey;
													const isUserPicked = userAns.toUpperCase() === optKey;
													return /* @__PURE__ */ jsxs("div", {
														className: `p-3 rounded-xl border text-xs flex items-start gap-2.5 ${isKey ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold" : isUserPicked ? "bg-rose-50 border-rose-300 text-rose-900" : "bg-white border-slate-200 text-slate-600"}`,
														children: [/* @__PURE__ */ jsx("span", {
															className: `w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10.5px] shrink-0 ${isKey ? "bg-emerald-600 text-white" : isUserPicked ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-500"}`,
															children: optKey
														}), /* @__PURE__ */ jsx("span", { children: q.options[optKey] })]
													}, optKey);
												})
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "bg-blue-50 border border-blue-200 p-4 rounded-xl",
												children: [/* @__PURE__ */ jsxs("div", {
													className: "flex items-center gap-1.5 text-blue-800 font-extrabold text-xs mb-1",
													children: [/* @__PURE__ */ jsx(HelpCircle, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "Pembahasan Singkat:" })]
												}), /* @__PURE__ */ jsx("p", {
													className: "text-xs text-blue-900 font-medium leading-relaxed",
													children: q.explanation
												})]
											})
										]
									})]
								}, q.id);
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "p-6 bg-white rounded-2xl border border-slate-200 text-center space-y-3",
					children: [/* @__PURE__ */ jsx("h4", {
						className: "text-sm font-bold text-slate-900",
						children: "Ingin Menguji Ulang Kemampuan Anda?"
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-center gap-3",
						children: [/* @__PURE__ */ jsx(Link, {
							href: "/",
							className: "py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition",
							children: "Kembali ke Halaman Utama"
						}), /* @__PURE__ */ jsx(Link, {
							href: "/student/dashboard",
							className: "py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition shadow-sm",
							children: "Lihat Jadwal Ujian"
						})]
					})]
				})
			]
		})]
	});
}
//#endregion
//#region resources/js/Pages/Errors/NotFound.tsx
var NotFound_exports = /* @__PURE__ */ __exportAll({ default: () => NotFoundPage });
function NotFoundPage() {
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12 font-sans text-slate-900",
		children: /* @__PURE__ */ jsxs("div", {
			className: "w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-12",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700",
					children: /* @__PURE__ */ jsx(SearchX, {
						className: "h-8 w-8",
						"aria-hidden": "true"
					})
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-xs font-black uppercase tracking-[0.2em] text-blue-700",
					children: "404"
				}),
				/* @__PURE__ */ jsx("h1", {
					className: "mt-2 text-2xl font-black tracking-tight text-slate-900",
					children: "Halaman tidak ditemukan"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-3 text-sm leading-6 text-slate-600",
					children: "Alamat yang Anda buka tidak tersedia atau sudah dipindahkan. Kembali ke beranda untuk melanjutkan."
				}),
				/* @__PURE__ */ jsxs(Link, {
					href: "/",
					className: "mt-7 inline-flex items-center gap-2 rounded-xl bg-[#0b2a4a] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#123f67]",
					children: [/* @__PURE__ */ jsx(ArrowLeft, {
						className: "h-4 w-4",
						"aria-hidden": "true"
					}), " Kembali ke beranda"]
				})
			]
		})
	});
}
//#endregion
//#region resources/js/components/QuestionGridModal.tsx
var QuestionGridModal = ({ isOpen, onClose }) => {
	const { questions, answers, currentQuestionIndex, setCurrentQuestionIndex } = useExamStore();
	if (!isOpen) return null;
	return /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150",
		children: /* @__PURE__ */ jsxs("div", {
			className: "bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between border-b border-slate-200 pb-4",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
						className: "text-lg font-bold text-slate-900",
						children: "Question Navigation"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-slate-500 mt-0.5",
						children: "Select a number to jump to a question."
					})] }), /* @__PURE__ */ jsx("button", {
						onClick: onClose,
						className: "text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition",
						children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center gap-4 py-3 border-b border-slate-100 text-xs font-medium text-slate-600",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ jsx("span", {
								className: "w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold",
								children: "✓"
							}), /* @__PURE__ */ jsx("span", { children: "Answered" })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ jsx("span", {
								className: "w-4 h-4 rounded bg-amber-400 text-amber-900 flex items-center justify-center text-[10px] font-bold",
								children: "★"
							}), /* @__PURE__ */ jsx("span", { children: "Marked for Review" })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ jsx("span", {
								className: "w-4 h-4 rounded bg-slate-100 border border-slate-300 text-slate-600 flex items-center justify-center text-[10px] font-bold",
								children: "-"
							}), /* @__PURE__ */ jsx("span", { children: "Unanswered" })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ jsx("span", { className: "w-4 h-4 rounded ring-2 ring-blue-500 ring-offset-1 bg-white border border-slate-300" }), /* @__PURE__ */ jsx("span", { children: "Current Question" })]
						})
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "overflow-y-auto py-4 flex-1",
					children: /* @__PURE__ */ jsx("div", {
						className: "grid grid-cols-5 sm:grid-cols-10 gap-2.5",
						children: questions.map((q, idx) => {
							const ans = answers[q.id];
							const isAnswered = ans && ans.selectedAnswer !== null;
							const isFlagged = ans && ans.isMarkedForReview;
							const isCurrent = idx === currentQuestionIndex;
							let btnClass = "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300";
							if (isFlagged) btnClass = "bg-amber-400 text-amber-950 hover:bg-amber-500 font-bold border border-amber-500 shadow-xs";
							else if (isAnswered) btnClass = "bg-blue-600 text-white hover:bg-blue-700 font-bold shadow-xs";
							if (isCurrent) btnClass += " ring-3 ring-blue-500 ring-offset-2 scale-105 z-10";
							return /* @__PURE__ */ jsxs("button", {
								onClick: () => {
									setCurrentQuestionIndex(idx);
									onClose();
								},
								className: `h-11 rounded-xl flex flex-col items-center justify-center text-sm font-semibold transition-all relative ${btnClass}`,
								children: [/* @__PURE__ */ jsx("span", { children: q.questionNumber }), ans?.selectedAnswer && /* @__PURE__ */ jsx("span", {
									className: "text-[10px] opacity-90 uppercase leading-none",
									children: ans.selectedAnswer
								})]
							}, q.id);
						})
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "border-t border-slate-200 pt-4 flex justify-end",
					children: /* @__PURE__ */ jsx("button", {
						onClick: onClose,
						className: "px-5 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-900 transition",
						children: "Close"
					})
				})
			]
		})
	});
};
//#endregion
//#region resources/js/components/SoundCheckModal.tsx
var SoundCheckModal = ({ isOpen, onConfirm }) => {
	const [isPlayingTest, setIsPlayingTest] = useState(false);
	const [hasTested, setHasTested] = useState(false);
	const [volume, setVolume] = useState(.8);
	const [isMuted, setIsMuted] = useState(false);
	const audioContextRef = useRef(null);
	const gainNodeRef = useRef(null);
	const oscillatorRef = useRef(null);
	const timersRef = useRef([]);
	const stopSoundTest = () => {
		timersRef.current.forEach((timer) => window.clearTimeout(timer));
		timersRef.current = [];
		try {
			oscillatorRef.current?.stop();
		} catch {}
		oscillatorRef.current = null;
		audioContextRef.current?.close();
		audioContextRef.current = null;
		gainNodeRef.current = null;
		setIsPlayingTest(false);
	};
	useEffect(() => () => {
		stopSoundTest();
	}, []);
	if (!isOpen) return null;
	const playSoundTest = async () => {
		stopSoundTest();
		setIsPlayingTest(true);
		try {
			const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
			await audioCtx.resume();
			audioContextRef.current = audioCtx;
			const osc = audioCtx.createOscillator();
			const gain = audioCtx.createGain();
			gain.gain.value = isMuted ? 0 : volume;
			osc.connect(gain);
			gain.connect(audioCtx.destination);
			osc.frequency.value = 587.33;
			osc.start();
			oscillatorRef.current = osc;
			gainNodeRef.current = gain;
			timersRef.current.push(window.setTimeout(() => {
				osc.frequency.value = 880;
			}, 300));
			timersRef.current.push(window.setTimeout(() => {
				stopSoundTest();
				setHasTested(true);
			}, 700));
		} catch {
			stopSoundTest();
		}
	};
	const handleVolumeChange = (nextVolume) => {
		const nextMuted = nextVolume === 0;
		setVolume(nextVolume);
		setIsMuted(nextMuted);
		if (gainNodeRef.current) gainNodeRef.current.gain.value = nextMuted ? 0 : nextVolume;
	};
	const toggleMute = () => {
		const nextMuted = !isMuted;
		setIsMuted(nextMuted);
		if (gainNodeRef.current) gainNodeRef.current.gain.value = nextMuted ? 0 : volume;
	};
	return /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm",
		role: "presentation",
		children: /* @__PURE__ */ jsxs("div", {
			className: "w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl sm:p-8",
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": "sound-check-title",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-inner",
					children: /* @__PURE__ */ jsx(Headphones, { className: "h-8 w-8" })
				}),
				/* @__PURE__ */ jsx("h2", {
					id: "sound-check-title",
					className: "mb-2 text-xl font-bold text-slate-900",
					children: "Audio Check"
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "mb-6 text-sm leading-relaxed text-slate-600",
					children: [
						"Before you begin ",
						/* @__PURE__ */ jsx("strong", { children: "Section 1: Listening Comprehension" }),
						", make sure your headphones are connected and the audio is clear. Each recording can be played once."
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "mb-3 flex items-center justify-between",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs font-semibold uppercase tracking-wider text-slate-700",
								children: "Headphone Test"
							}), hasTested && /* @__PURE__ */ jsxs("span", {
								className: "flex items-center gap-1 text-xs font-semibold text-emerald-600",
								children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" }), " Tested"]
							})]
						}),
						/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: playSoundTest,
							disabled: isPlayingTest,
							className: `flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition ${isPlayingTest ? "animate-pulse bg-amber-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`,
							children: [/* @__PURE__ */ jsx(Volume2, { className: "h-4 w-4" }), /* @__PURE__ */ jsx("span", { children: isPlayingTest ? "Playing test sound..." : "Play test sound" })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-3 flex items-center gap-2",
							children: [
								/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: toggleMute,
									"aria-label": isMuted ? "Unmute sound check" : "Mute sound check",
									className: "rounded-md p-1 text-slate-500 hover:text-slate-900",
									children: isMuted || volume === 0 ? /* @__PURE__ */ jsx(VolumeX, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Volume2, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ jsx("input", {
									type: "range",
									min: "0",
									max: "1",
									step: "0.05",
									value: isMuted ? 0 : volume,
									onChange: (event) => handleVolumeChange(Number(event.target.value)),
									"aria-label": "Sound check volume",
									className: "w-full accent-blue-600"
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "w-10 text-right text-[11px] font-semibold text-slate-500",
									children: [Math.round((isMuted ? 0 : volume) * 100), "%"]
								})
							]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mb-6 space-y-1.5 rounded-lg border border-amber-200/80 bg-amber-50/70 p-3 text-left text-xs text-slate-500",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "font-semibold text-amber-900",
							children: "Before you begin:"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-amber-800",
							children: "• Set your device volume to a comfortable level."
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-amber-800",
							children: "• Keep this browser tab active during the test."
						})
					]
				}),
				/* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: onConfirm,
					className: "group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-slate-800",
					children: [/* @__PURE__ */ jsx("span", { children: "I'm Ready — Begin Section 1" }), /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 transition group-hover:translate-x-1" })]
				})
			]
		})
	});
};
//#endregion
//#region resources/js/Pages/Exam.tsx
var Exam_exports = /* @__PURE__ */ __exportAll({ default: () => ExamPage });
function ExamPage() {
	const { sessionId } = useParams();
	const router = useRouter();
	const { participantName, currentSectionType, sectionTitle, durationMinutes, timeRemaining, isTimeHidden, currentQuestionIndex, questions, passages, answers, playedAudioIds, completedAudioIds, violationCount, setExamData, setCurrentQuestionIndex, setAnswer, toggleMarkForReview, nextQuestion, prevQuestion, tickTimer, toggleTimeHidden, incrementViolation } = useExamStore();
	const [isLoading, setIsLoading] = useState(true);
	const [isGridOpen, setIsGridOpen] = useState(false);
	const [showSoundCheck, setShowSoundCheck] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [showTransitionModal, setShowTransitionModal] = useState(false);
	const [showSubmitModal, setShowSubmitModal] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [warningMessage, setWarningMessage] = useState(null);
	const [needsFullscreen, setNeedsFullscreen] = useState(false);
	const fullscreenCompletedRef = React.useRef(false);
	useEffect(() => {
		fullscreenCompletedRef.current = false;
	}, [sessionId]);
	React.useRef(null);
	const [isContinuousPlaying, setIsContinuousPlaying] = useState(false);
	const [isContinuousMuted, setIsContinuousMuted] = useState(false);
	const [continuousVolume, setContinuousVolume] = useState(1);
	const requestExamFullscreen = useCallback(async () => {
		if (typeof document === "undefined") return false;
		if (document.fullscreenElement) {
			setIsFullscreen(true);
			setNeedsFullscreen(false);
			return true;
		}
		if (!document.fullscreenEnabled) {
			setWarningMessage("Fullscreen tidak tersedia di browser ini. Gunakan browser desktop terbaru untuk pengerjaan ujian.");
			setNeedsFullscreen(false);
			return false;
		}
		try {
			await document.documentElement.requestFullscreen({ navigationUI: "hide" });
			setIsFullscreen(true);
			setNeedsFullscreen(false);
			return true;
		} catch {
			setIsFullscreen(false);
			setNeedsFullscreen(true);
			setWarningMessage("Klik tombol masuk fullscreen untuk melanjutkan pengerjaan ujian.");
			return false;
		}
	}, []);
	const exitExamFullscreen = useCallback(async (completed = false) => {
		if (completed) fullscreenCompletedRef.current = true;
		if (typeof document !== "undefined" && document.fullscreenElement) try {
			await document.exitFullscreen();
		} catch {}
		setIsFullscreen(false);
		setNeedsFullscreen(false);
	}, []);
	useEffect(() => {
		const handleFullscreenChange = () => {
			const active = Boolean(document.fullscreenElement);
			setIsFullscreen(active);
			if (!active && !fullscreenCompletedRef.current && !isLoading) {
				setNeedsFullscreen(true);
				setWarningMessage("Fullscreen terhenti. Masuk fullscreen kembali untuk melanjutkan ujian.");
			}
		};
		document.addEventListener("fullscreenchange", handleFullscreenChange);
		if (!fullscreenCompletedRef.current) requestExamFullscreen();
		return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
	}, [requestExamFullscreen, isLoading]);
	const fetchSession = useCallback(async () => {
		try {
			setIsLoading(true);
			const data = await (await apiFetch(`/api/exam/${sessionId}`)).json();
			if (data.isCompleted) {
				await exitExamFullscreen(true);
				router.push(`/result/${sessionId}`);
				return;
			}
			if (data.error) {
				alert(data.error);
				router.push("/");
				return;
			}
			setExamData({
				sessionId: data.sessionId,
				participantName: data.participantName,
				currentSectionType: data.currentSectionType,
				sectionTitle: data.sectionTitle,
				durationMinutes: data.durationMinutes,
				timeRemainingSeconds: data.timeRemainingSeconds,
				questions: data.questions,
				passages: data.passages,
				savedAnswers: data.savedAnswers,
				violationCount: data.violationCount
			});
			const storeState = useExamStore.getState();
			if (data.currentSectionType === "LISTENING" && storeState.currentQuestionIndex === 0 && storeState.playedAudioIds.length === 0) setShowSoundCheck(true);
		} catch (err) {
			console.error("Failed to load exam session:", err);
			setWarningMessage("Sesi ujian gagal dimuat. Periksa koneksi Anda lalu coba lagi.");
		} finally {
			setIsLoading(false);
		}
	}, [
		exitExamFullscreen,
		sessionId,
		router,
		setExamData
	]);
	useEffect(() => {
		fetchSession();
	}, [fetchSession]);
	useEffect(() => {
		if (isLoading || showSoundCheck) return;
		const interval = setInterval(() => {
			tickTimer();
		}, 1e3);
		return () => clearInterval(interval);
	}, [
		isLoading,
		showSoundCheck,
		tickTimer
	]);
	useEffect(() => {
		if (!isLoading && timeRemaining === 0) {
			if (currentSectionType === "LISTENING") handleTransitionSection("STRUCTURE");
			else if (currentSectionType === "STRUCTURE") handleTransitionSection("READING");
			else if (currentSectionType === "READING") handleFinalSubmit();
		}
	}, [
		timeRemaining,
		currentSectionType,
		isLoading
	]);
	const currentQ = questions[currentQuestionIndex];
	const currentPassage = currentQ?.passageId ? passages.find((p) => p.id === currentQ.passageId) : null;
	const currentAns = currentQ ? answers[currentQ.id] : null;
	const isListening = currentSectionType === "LISTENING";
	const isPassageFinished = !Boolean(currentPassage) || !isListening || completedAudioIds.includes(currentPassage.id);
	const isLongConversationListening = isListening && (currentQ?.partType === "PART_B" || currentQ?.partType === "PART_C") && Boolean(currentPassage);
	const isLongConversationListeningPending = isLongConversationListening && !isPassageFinished;
	const isQuestionAudioStarted = currentQ ? playedAudioIds.includes(currentQ.id) || completedAudioIds.includes(currentQ.id) : false;
	const isQuestionAudioFinished = currentQ ? completedAudioIds.includes(currentQ.id) : false;
	const isAnsweringAllowed = !isListening || isPassageFinished && isQuestionAudioStarted;
	const canProceedToNext = !isListening || isQuestionAudioFinished;
	useEffect(() => {
		const handleVisibilityChange = async () => {
			if (document.hidden) {
				incrementViolation();
				setWarningMessage(`⚠️ Integrity warning (${violationCount + 1}/5): You left the test tab or window. This activity has been recorded.`);
				try {
					await apiFetch("/api/exam/violation", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							sessionId,
							reason: "Tab switch or window blur detected"
						})
					});
				} catch (e) {
					console.error("Failed to sync violation to server:", e);
				}
			}
		};
		const handleContextMenu = (e) => {
			e.preventDefault();
		};
		const handleKeyDown = (e) => {
			if (e.key === "F12" || e.ctrlKey && [
				"u",
				"c",
				"v",
				"p",
				"s",
				"a"
			].includes(e.key.toLowerCase()) || e.ctrlKey && e.shiftKey && [
				"i",
				"j",
				"c"
			].includes(e.key.toLowerCase())) {
				e.preventDefault();
				return;
			}
			if (!e.ctrlKey && !e.altKey && !e.metaKey) {
				const key = e.key.toUpperCase();
				if ([
					"A",
					"B",
					"C",
					"D"
				].includes(key) && questions[currentQuestionIndex]) {
					if (isAnsweringAllowed) handleSelectAnswer(questions[currentQuestionIndex].id, key);
				}
			}
		};
		const handleOnline = async () => {
			try {
				const offlineQueueKey = `toefl_offline_answers_${sessionId}`;
				const rawQueue = localStorage.getItem(offlineQueueKey);
				if (rawQueue) {
					const queue = JSON.parse(rawQueue);
					for (const item of queue) {
						const response = await apiFetch("/api/exam/answer", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(item)
						});
						if (!response.ok) throw new Error(`Answer sync failed (${response.status})`);
					}
					localStorage.removeItem(offlineQueueKey);
					console.log("Successfully synced offline answers to server.");
				}
			} catch (err) {
				console.error("Failed to sync offline answers:", err);
			}
		};
		document.addEventListener("visibilitychange", handleVisibilityChange);
		document.addEventListener("contextmenu", handleContextMenu);
		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("online", handleOnline);
		if (navigator.onLine) handleOnline();
		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			document.removeEventListener("contextmenu", handleContextMenu);
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("online", handleOnline);
		};
	}, [
		currentQuestionIndex,
		questions,
		incrementViolation,
		isAnsweringAllowed,
		violationCount,
		sessionId
	]);
	const handleSelectAnswer = async (questionId, choice) => {
		if (isListening && !isAnsweringAllowed) {
			if (!isPassageFinished) setWarningMessage("Complete the conversation audio before selecting an answer.");
			else if (!isQuestionAudioStarted) setWarningMessage("Play the question audio before selecting an answer.");
			return;
		}
		setAnswer(questionId, choice);
		const payload = {
			sessionId,
			questionId,
			selectedAnswer: choice
		};
		try {
			if (!(await apiFetch("/api/exam/answer", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload)
			})).ok) throw new Error("Server responded with non-200");
		} catch (err) {
			console.warn("Autosave failed, caching answer to localStorage:", err);
			try {
				const offlineQueueKey = `toefl_offline_answers_${sessionId}`;
				const filtered = JSON.parse(localStorage.getItem(offlineQueueKey) || "[]").filter((item) => item.questionId !== questionId);
				filtered.push(payload);
				localStorage.setItem(offlineQueueKey, JSON.stringify(filtered));
			} catch (e) {
				console.error("LocalStorage save error:", e);
			}
		}
	};
	const handleToggleReview = async (questionId) => {
		toggleMarkForReview(questionId);
		const payload = {
			sessionId,
			questionId,
			isMarkedForReview: !answers[questionId]?.isMarkedForReview
		};
		try {
			const res = await apiFetch("/api/exam/answer", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload)
			});
			if (!res.ok) throw new Error(`Review sync failed (${res.status})`);
		} catch (err) {
			console.error("Autosave review flag error:", err);
			try {
				const offlineQueueKey = `toefl_offline_answers_${sessionId}`;
				const existing = JSON.parse(localStorage.getItem(offlineQueueKey) || "[]");
				existing.push(payload);
				localStorage.setItem(offlineQueueKey, JSON.stringify(existing));
			} catch (e) {}
		}
	};
	const handleTransitionSection = async (nextSection) => {
		try {
			setIsSubmitting(true);
			const data = await (await apiFetch("/api/exam/transition", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					sessionId,
					nextSection
				})
			})).json();
			if (data.success) {
				setShowTransitionModal(false);
				await fetchSession();
			} else setWarningMessage(data.error || "Section berikutnya belum dapat dibuka.");
		} catch (err) {
			console.error("Transition error:", err);
			setWarningMessage("Koneksi terganggu saat berpindah section. Jawaban tersimpan, silakan coba lagi.");
		} finally {
			setIsSubmitting(false);
		}
	};
	const handleFinalSubmit = async () => {
		try {
			setIsSubmitting(true);
			const queueKey = `toefl_offline_answers_${sessionId}`;
			const queued = JSON.parse(localStorage.getItem(queueKey) || "[]");
			for (const item of queued) {
				const syncResponse = await apiFetch("/api/exam/answer", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(item)
				});
				if (!syncResponse.ok) throw new Error(`Pending answer sync failed (${syncResponse.status})`);
			}
			if (queued.length) localStorage.removeItem(queueKey);
			const data = await (await apiFetch("/api/exam/submit", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ sessionId })
			})).json();
			if (data.success) {
				await exitExamFullscreen(true);
				router.push(`/result/${sessionId}`);
			} else setWarningMessage(data.error || "Ujian belum dapat dikirim. Periksa koneksi lalu coba lagi.");
		} catch (err) {
			console.error("Final submit error:", err);
			setWarningMessage("Koneksi terganggu saat mengirim ujian. Jawaban tetap disimpan dan dapat dikirim ulang.");
		} finally {
			setIsSubmitting(false);
		}
	};
	const toggleFullscreen = () => {
		if (!document.fullscreenElement) requestExamFullscreen();
		else exitExamFullscreen();
	};
	const handleSoundCheckConfirm = async () => {
		await requestExamFullscreen();
		setShowSoundCheck(false);
	};
	const formatTime = (secs) => {
		const mins = Math.floor(secs / 60);
		const remainder = secs % 60;
		return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
	};
	if (isLoading) return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4",
		children: [/* @__PURE__ */ jsx("div", { className: "w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" }), /* @__PURE__ */ jsx("p", {
			className: "text-slate-700 font-semibold",
			children: "Loading your TOEFL ITP test..."
		})]
	});
	const isLastQuestion = currentQuestionIndex === questions.length - 1;
	const isTimeCritical = timeRemaining < 300;
	const handleNextExamAction = () => {
		if (!canProceedToNext) {
			setWarningMessage(!isLastQuestion ? "Wait for the question audio to finish before moving to the next question." : "Wait for the question audio to finish before completing this section.");
			return;
		}
		if (!isLastQuestion) nextQuestion();
		else if (currentSectionType !== "READING") setShowTransitionModal(true);
		else setShowSubmitModal(true);
	};
	const nextExamActionLabel = !isLastQuestion ? "Next" : currentSectionType !== "READING" ? "Complete Section" : "Submit Test";
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-100 flex flex-col text-slate-800 font-sans select-none",
		children: [
			/* @__PURE__ */ jsx(SoundCheckModal, {
				isOpen: showSoundCheck,
				onConfirm: handleSoundCheckConfirm
			}),
			!showSoundCheck && needsFullscreen && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-40 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm",
				children: /* @__PURE__ */ jsxs("div", {
					className: "w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-7 text-center text-white shadow-2xl",
					children: [
						/* @__PURE__ */ jsx(Maximize, { className: "mx-auto mb-4 h-10 w-10 text-blue-400" }),
						/* @__PURE__ */ jsx("h2", {
							className: "mb-2 text-xl font-bold",
							children: "Masuk Fullscreen untuk Ujian"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mb-6 text-sm leading-relaxed text-slate-300",
							children: "Mode fullscreen membantu menjaga tampilan ujian tetap fokus. Tekan tombol di bawah jika browser belum mengaktifkannya otomatis."
						}),
						/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => void requestExamFullscreen(),
							className: "w-full rounded-xl bg-blue-600 px-5 py-3 font-bold transition hover:bg-blue-500",
							children: "Masuk Fullscreen"
						})
					]
				})
			}),
			!isListening && /* @__PURE__ */ jsx(QuestionGridModal, {
				isOpen: isGridOpen,
				onClose: () => setIsGridOpen(false)
			}),
			warningMessage && /* @__PURE__ */ jsx("div", {
				className: "fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 animate-in slide-in-from-top-4 duration-200",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-rose-600 text-white p-4 rounded-xl shadow-2xl flex items-start justify-between gap-3 border border-rose-700",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ jsx(ShieldAlert, { className: "w-5 h-5 shrink-0 mt-0.5" }), /* @__PURE__ */ jsx("p", {
							className: "text-xs sm:text-sm font-medium leading-tight",
							children: warningMessage
						})]
					}), /* @__PURE__ */ jsx("button", {
						onClick: () => setWarningMessage(null),
						className: "text-white/80 hover:text-white text-xs font-bold px-2 py-1 bg-rose-700 rounded-md",
						children: "Close"
					})]
				})
			}),
			/* @__PURE__ */ jsx("header", {
				className: "bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md",
				children: /* @__PURE__ */ jsxs("div", {
					className: "max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ jsx("div", {
							className: "bg-blue-600 text-white font-extrabold text-xs px-2.5 py-1 rounded tracking-widest shadow-inner",
							children: "TOEFL ITP®"
						}), /* @__PURE__ */ jsxs("div", {
							className: "border-l border-slate-700 pl-3",
							children: [/* @__PURE__ */ jsx("h1", {
								className: "text-sm sm:text-base font-bold text-slate-100 leading-tight",
								children: sectionTitle
							}), /* @__PURE__ */ jsxs("p", {
								className: "text-[11px] text-slate-400",
								children: ["Participant: ", /* @__PURE__ */ jsx("span", {
									className: "text-slate-200 font-medium",
									children: participantName
								})]
							})]
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2 sm:gap-4",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: `flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm sm:text-base transition-colors ${isTimeCritical ? "bg-rose-950/70 border-rose-500 text-rose-300 animate-pulse" : "bg-slate-800 border-slate-700 text-slate-100"}`,
								children: [/* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 text-blue-400" }), /* @__PURE__ */ jsx("span", { children: isTimeHidden ? "--:--" : formatTime(timeRemaining) })]
							}),
							/* @__PURE__ */ jsx("button", {
								onClick: toggleTimeHidden,
								className: "text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition flex items-center gap-1.5",
								title: isTimeHidden ? "Show time" : "Hide time",
								children: isTimeHidden ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Eye, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", {
									className: "hidden sm:inline",
									children: "Show Time"
								})] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(EyeOff, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", {
									className: "hidden sm:inline",
									children: "Hide Time"
								})] })
							}),
							/* @__PURE__ */ jsx("button", {
								onClick: toggleFullscreen,
								className: "text-xs p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition",
								title: "Full Screen",
								children: isFullscreen ? /* @__PURE__ */ jsx(Minimize, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Maximize, { className: "w-4 h-4" })
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ jsx("main", {
				className: `flex-1 ${currentSectionType === "READING" ? "max-w-[1600px]" : "max-w-7xl"} w-full mx-auto p-4 sm:p-6 flex flex-col`,
				children: !currentQ ? /* @__PURE__ */ jsx("div", {
					className: "bg-white p-8 rounded-2xl text-center shadow-sm",
					children: /* @__PURE__ */ jsx("p", {
						className: "text-slate-600",
						children: "No questions are available for this section."
					})
				}) : /* @__PURE__ */ jsx("div", {
					className: "flex-1 flex flex-col",
					children: currentSectionType === "READING" && currentPassage ? /* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_220px] gap-6 flex-1 items-start",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "lg:col-start-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto",
								children: [
									/* @__PURE__ */ jsx("div", {
										className: "border-b border-slate-100 pb-3 mb-4 flex items-center justify-between",
										children: /* @__PURE__ */ jsx("span", {
											className: "text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md",
											children: "Reading Passage"
										})
									}),
									/* @__PURE__ */ jsx("h2", {
										className: "text-base font-bold text-slate-900 mb-3",
										children: currentPassage.title
									}),
									/* @__PURE__ */ jsx("div", {
										className: "text-sm leading-relaxed text-slate-800 font-serif whitespace-pre-line space-y-4",
										children: currentPassage.content
									})
								]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "lg:col-start-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between",
								children: /* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2 mb-4 border-b border-slate-100 pb-3",
										children: [
											/* @__PURE__ */ jsxs("button", {
												onClick: prevQuestion,
												disabled: currentQuestionIndex === 0,
												className: `flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-semibold text-xs transition shrink-0 ${currentQuestionIndex === 0 ? "text-slate-300 cursor-not-allowed" : "bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95"}`,
												title: "Previous question",
												children: [/* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", {
													className: "hidden xl:inline",
													children: "Previous"
												})]
											}),
											/* @__PURE__ */ jsxs("span", {
												className: "text-sm font-bold text-slate-900 min-w-0 flex-1 truncate",
												children: [
													"Question ",
													currentQ.questionNumber,
													" of ",
													questions.length
												]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "flex items-center gap-1.5 shrink-0",
												children: [/* @__PURE__ */ jsxs("button", {
													onClick: () => setIsGridOpen(true),
													className: "flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition",
													title: "Open question numbers",
													children: [/* @__PURE__ */ jsx(Grid, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", {
														className: "hidden xl:inline",
														children: "Questions"
													})]
												}), /* @__PURE__ */ jsxs("button", {
													onClick: handleNextExamAction,
													className: "flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition",
													children: [/* @__PURE__ */ jsx("span", {
														className: "hidden xl:inline",
														children: nextExamActionLabel
													}), /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })]
												})]
											})
										]
									}),
									/* @__PURE__ */ jsx("div", {
										className: "flex justify-end mb-4",
										children: /* @__PURE__ */ jsxs("button", {
											onClick: () => handleToggleReview(currentQ.id),
											className: `text-xs font-semibold px-3 py-1 rounded-lg border transition flex items-center gap-1.5 ${currentAns?.isMarkedForReview ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"}`,
											children: [/* @__PURE__ */ jsx(Bookmark, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: currentAns?.isMarkedForReview ? "Marked for review" : "Mark for review" })]
										})
									}),
									/* @__PURE__ */ jsx("h3", {
										className: "text-base font-semibold text-slate-900 mb-6 leading-normal",
										children: currentQ.questionText
									}),
									/* @__PURE__ */ jsx("div", {
										className: "space-y-3",
										children: [
											{
												letter: "A",
												text: currentQ.optionA
											},
											{
												letter: "B",
												text: currentQ.optionB
											},
											{
												letter: "C",
												text: currentQ.optionC
											},
											{
												letter: "D",
												text: currentQ.optionD
											}
										].map((opt) => {
											const isSelected = currentAns?.selectedAnswer === opt.letter;
											return /* @__PURE__ */ jsxs("button", {
												onClick: () => handleSelectAnswer(currentQ.id, opt.letter),
												className: `w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 group ${isSelected ? "bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 shadow-xs" : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"}`,
												children: [/* @__PURE__ */ jsx("span", {
													className: `w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"}`,
													children: opt.letter
												}), /* @__PURE__ */ jsx("span", {
													className: `text-sm leading-relaxed ${isSelected ? "font-semibold text-blue-950" : "text-slate-700"}`,
													children: opt.text
												})]
											}, opt.letter);
										})
									})
								] })
							}),
							/* @__PURE__ */ jsxs("aside", {
								className: "lg:col-start-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm lg:sticky lg:top-24",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between gap-2 mb-3",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-[10px] font-bold uppercase tracking-wider text-slate-500",
											children: "Questions"
										}), /* @__PURE__ */ jsx("span", {
											className: "text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg",
											children: "Reading"
										})]
									}),
									/* @__PURE__ */ jsx("div", {
										className: "grid grid-cols-6 lg:grid-cols-5 gap-1.5",
										children: questions.map((question) => {
											const isCurrent = question.id === currentQ.id;
											const isAnswered = Boolean(answers[question.id]?.selectedAnswer);
											const questionIndex = questions.findIndex((item) => item.id === question.id);
											return /* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: () => setCurrentQuestionIndex(questionIndex),
												className: `h-8 rounded-lg font-bold text-[11px] flex items-center justify-center transition ${isCurrent ? "bg-blue-600 text-white shadow-xs" : isAnswered ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"}`,
												children: question.questionNumber
											}, question.id);
										})
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-[10px] text-slate-400 leading-relaxed mt-4",
										children: "Select a question number to review or change your answer."
									})
								]
							})
						]
					}) : /* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_250px] gap-6 w-full items-start",
						children: [/* @__PURE__ */ jsx("div", {
							className: `bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 w-full max-w-none lg:col-start-1 ${isLongConversationListeningPending ? "lg:col-span-2" : ""}`,
							children: isLongConversationListeningPending ? /* @__PURE__ */ jsxs("div", {
								className: "min-h-[320px] flex flex-col items-center justify-center text-center gap-4",
								children: [
									/* @__PURE__ */ jsxs("span", {
										className: "text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md",
										children: [
											"Listening ",
											currentQ.partType === "PART_C" ? "Part C" : "Part B",
											" · Long Conversation"
										]
									}),
									/* @__PURE__ */ jsx("h2", {
										className: "text-xl font-bold text-slate-900",
										children: "Listen to the complete conversation"
									}),
									currentPassage && (currentPassage.audioUrl || currentPassage.content) && /* @__PURE__ */ jsx("div", {
										className: "w-full max-w-3xl",
										children: /* @__PURE__ */ jsx(AudioPlayer, {
											id: currentPassage.id,
											audioUrl: currentPassage.audioUrl,
											textToSpeak: currentPassage.content || void 0,
											label: "Long conversation audio",
											autoPlay: isListening && !showSoundCheck,
											autoPlayDelayMs: 2500
										}, currentPassage.id)
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-sm text-slate-500 max-w-md leading-relaxed",
										children: "The question and answer choices will appear after the audio ends."
									})
								]
							}) : /* @__PURE__ */ jsxs(Fragment, { children: [
								/* @__PURE__ */ jsxs("div", {
									className: "mb-6 border-b border-slate-100 pb-4 space-y-3",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2",
										children: [
											!isListening ? /* @__PURE__ */ jsxs("button", {
												onClick: prevQuestion,
												disabled: currentQuestionIndex === 0,
												className: `flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-semibold text-xs transition shrink-0 ${currentQuestionIndex === 0 ? "text-slate-300 cursor-not-allowed" : "bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95"}`,
												title: "Previous question",
												children: [/* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", {
													className: "hidden sm:inline",
													children: "Previous"
												})]
											}) : /* @__PURE__ */ jsx("div", {
												className: "w-9 shrink-0",
												"aria-hidden": "true"
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "flex items-center gap-2 min-w-0 flex-1",
												children: [/* @__PURE__ */ jsxs("span", {
													className: "text-base font-bold text-slate-900 truncate",
													children: ["Question ", currentQ.questionNumber]
												}), /* @__PURE__ */ jsxs("span", {
													className: "text-xs text-slate-400 font-medium whitespace-nowrap hidden sm:inline",
													children: ["of ", questions.length]
												})]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "flex items-center gap-1.5 shrink-0",
												children: [!isListening && /* @__PURE__ */ jsxs("button", {
													onClick: () => setIsGridOpen(true),
													className: "flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition",
													title: "Open question numbers",
													children: [/* @__PURE__ */ jsx(Grid, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", {
														className: "hidden sm:inline",
														children: "Questions"
													})]
												}), /* @__PURE__ */ jsxs("button", {
													onClick: handleNextExamAction,
													className: `flex items-center gap-1.5 px-2.5 py-1.5 text-white rounded-xl font-bold text-xs transition ${isLastQuestion && currentSectionType === "READING" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-900 hover:bg-slate-800"}`,
													title: nextExamActionLabel,
													children: [/* @__PURE__ */ jsx("span", {
														className: "hidden sm:inline",
														children: nextExamActionLabel
													}), isLastQuestion && currentSectionType === "READING" ? /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })]
												})]
											})
										]
									}), /* @__PURE__ */ jsx("div", {
										className: "flex justify-end",
										children: /* @__PURE__ */ jsxs("button", {
											onClick: () => handleToggleReview(currentQ.id),
											className: `text-xs font-semibold px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${currentAns?.isMarkedForReview ? "bg-amber-100 border-amber-300 text-amber-900 font-bold" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"}`,
											children: [/* @__PURE__ */ jsx(Bookmark, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: currentAns?.isMarkedForReview ? "Marked for review" : "Mark for review" })]
										})
									})]
								}),
								currentSectionType === "LISTENING" && /* @__PURE__ */ jsxs("div", {
									className: "mb-6 space-y-4",
									children: [currentPassage && !isLongConversationListening && /* @__PURE__ */ jsxs("div", {
										className: "bg-blue-50/60 border border-blue-100 p-4 rounded-xl",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-xs font-bold text-blue-800 uppercase tracking-wider block mb-1",
											children: currentPassage.title
										}), (currentPassage.audioUrl || currentPassage.content) && /* @__PURE__ */ jsx("div", {
											className: "my-2",
											children: /* @__PURE__ */ jsx(AudioPlayer, {
												id: currentPassage.id,
												audioUrl: currentPassage.audioUrl,
												textToSpeak: currentPassage.content || void 0,
												label: "Conversation or lecture audio",
												autoPlay: isListening && !showSoundCheck,
												autoPlayDelayMs: 2500
											}, currentPassage.id)
										})]
									}), /* @__PURE__ */ jsx(AudioPlayer, {
										id: currentQ.id,
										audioUrl: currentQ.audioUrl,
										textToSpeak: currentQ.questionText,
										label: `Question ${currentQ.questionNumber} audio`,
										disabled: !isPassageFinished,
										disabledTooltip: "Complete the conversation audio first.",
										autoPlay: isListening && !showSoundCheck && isPassageFinished,
										autoPlayDelayMs: 2500
									}, currentQ.id)]
								}),
								currentSectionType === "STRUCTURE" && currentQ.partType === "WRITTEN_EXPRESSION" && currentQ.questionText ? /* @__PURE__ */ jsxs("div", {
									className: "mb-8",
									children: [/* @__PURE__ */ jsx("p", {
										className: "text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2",
										children: "Choose the underlined word or phrase that is grammatically incorrect:"
									}), /* @__PURE__ */ jsx(WrittenExpressionText, { text: currentQ.questionText })]
								}) : /* @__PURE__ */ jsx("div", {
									className: "mb-6",
									children: currentSectionType === "LISTENING" ? /* @__PURE__ */ jsxs("div", {
										className: "flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 shadow-2xs",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-xs font-bold uppercase tracking-wider",
											children: currentQ.partType === "PART_A" ? "Listening Part A • Short Conversation" : currentQ.partType === "PART_B" ? "Listening Part B • Longer Conversation" : "Listening Part C • Academic Talk"
										}), /* @__PURE__ */ jsx("span", {
											className: "text-xs text-blue-700 font-medium",
											children: "Listen carefully and choose the best answer."
										})]
									}) : /* @__PURE__ */ jsx("h2", {
										className: "text-lg font-serif leading-relaxed text-slate-900 bg-slate-50/50 p-4 rounded-xl border border-slate-200",
										children: currentQ.questionText
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "space-y-3",
									role: "radiogroup",
									"aria-label": "Answer choices",
									children: [isListening && !isAnsweringAllowed && /* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold shadow-2xs animate-in fade-in duration-200",
										children: [/* @__PURE__ */ jsx(Lock, { className: "w-4 h-4 text-amber-600 shrink-0" }), /* @__PURE__ */ jsx("span", { children: !isPassageFinished ? "Complete the conversation audio to unlock the answer choices." : "Play the question audio to unlock the answer choices." })]
									}), [
										{
											letter: "A",
											text: currentQ.optionA
										},
										{
											letter: "B",
											text: currentQ.optionB
										},
										{
											letter: "C",
											text: currentQ.optionC
										},
										{
											letter: "D",
											text: currentQ.optionD
										}
									].map((opt) => {
										const isSelected = currentAns?.selectedAnswer === opt.letter;
										return /* @__PURE__ */ jsxs("button", {
											type: "button",
											role: "radio",
											"aria-checked": isSelected,
											"aria-label": `Option ${opt.letter}: ${opt.text}`,
											disabled: !isAnsweringAllowed,
											onClick: () => handleSelectAnswer(currentQ.id, opt.letter),
											className: `w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 group ${!isAnsweringAllowed ? "opacity-50 cursor-not-allowed bg-slate-50 border-slate-200" : isSelected ? "bg-blue-50/90 border-blue-600 ring-2 ring-blue-500/20 shadow-xs" : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"}`,
											children: [/* @__PURE__ */ jsx("span", {
												className: `w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"}`,
												children: opt.letter
											}), /* @__PURE__ */ jsx("span", {
												className: `text-sm sm:text-base leading-relaxed pt-0.5 ${isSelected ? "font-semibold text-blue-950" : "text-slate-800"}`,
												children: opt.text
											})]
										}, opt.letter);
									})]
								})
							] })
						}), !isLongConversationListeningPending && /* @__PURE__ */ jsxs("aside", {
							className: "lg:col-start-2 lg:row-start-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm lg:sticky lg:top-24",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between gap-2 mb-3",
									children: [/* @__PURE__ */ jsx("span", {
										className: "text-[10px] font-bold uppercase tracking-wider text-slate-500",
										children: "Questions"
									}), /* @__PURE__ */ jsx("span", {
										className: "text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg",
										children: currentSectionType === "LISTENING" ? "Listening" : "Structure"
									})]
								}),
								/* @__PURE__ */ jsx("div", {
									className: "grid grid-cols-6 lg:grid-cols-5 gap-1.5",
									children: questions.map((question) => {
										const isCurrent = question.id === currentQ.id;
										const isCompleted = Boolean(answers[question.id]?.selectedAnswer);
										if (isListening) return /* @__PURE__ */ jsx("div", {
											"aria-current": isCurrent ? "step" : void 0,
											className: `h-8 rounded-lg font-bold text-[11px] flex items-center justify-center border ${isCurrent ? "bg-blue-600 text-white border-blue-600 shadow-xs" : isCompleted ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`,
											children: question.questionNumber
										}, question.id);
										return /* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => setCurrentQuestionIndex(questions.findIndex((item) => item.id === question.id)),
											className: `h-8 rounded-lg font-bold text-[11px] flex items-center justify-center transition ${isCurrent ? "bg-blue-600 text-white shadow-xs" : isCompleted ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"}`,
											children: question.questionNumber
										}, question.id);
									})
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-[10px] text-slate-400 leading-relaxed mt-4",
									children: isListening ? "Listening questions follow a fixed sequence. Question numbers cannot be selected." : "Select a question number to review or change your answer."
								})
							]
						})]
					})
				})
			}),
			showTransitionModal && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4",
				role: "presentation",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center",
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "transition-modal-title",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4",
							children: /* @__PURE__ */ jsx(AlertTriangle, { className: "w-7 h-7" })
						}),
						/* @__PURE__ */ jsxs("h3", {
							id: "transition-modal-title",
							className: "text-lg font-bold text-slate-900 mb-2",
							children: [
								"Complete ",
								sectionTitle,
								"?"
							]
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed",
							children: [
								"Once you continue, ",
								/* @__PURE__ */ jsx("strong", { children: "you cannot return to this section" }),
								"or change your answers."
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex gap-3",
							children: [/* @__PURE__ */ jsx("button", {
								onClick: () => setShowTransitionModal(false),
								className: "flex-1 py-2.5 px-4 border border-slate-300 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50 transition",
								children: "Cancel, Review Answers"
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => handleTransitionSection(currentSectionType === "LISTENING" ? "STRUCTURE" : "READING"),
								disabled: isSubmitting,
								className: "flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow transition disabled:opacity-50",
								children: isSubmitting ? "Processing..." : "Continue"
							})]
						})
					]
				})
			}),
			showSubmitModal && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4",
				role: "presentation",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center",
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "submit-modal-title",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4",
							children: /* @__PURE__ */ jsx(CheckCircle, { className: "w-7 h-7" })
						}),
						/* @__PURE__ */ jsx("h3", {
							id: "submit-modal-title",
							className: "text-lg font-bold text-slate-900 mb-2",
							children: "Submit Test?"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed",
							children: "You have completed the final section. Your answers will be scored using the configured practice-test conversion table."
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex gap-3",
							children: [/* @__PURE__ */ jsx("button", {
								onClick: () => setShowSubmitModal(false),
								className: "flex-1 py-2.5 px-4 border border-slate-300 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50 transition",
								children: "Review Answers"
							}), /* @__PURE__ */ jsx("button", {
								onClick: handleFinalSubmit,
								disabled: isSubmitting,
								className: "flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow transition disabled:opacity-50",
								children: isSubmitting ? "Scoring..." : "Submit & View Results"
							})]
						})
					]
				})
			})
		]
	});
}
//#endregion
//#region resources/js/Pages/Home.tsx
var Home_exports = /* @__PURE__ */ __exportAll({ default: () => HomePage });
var DEFAULT_LOGO_URL = "/branding/institution-logo.svg";
function HomePage() {
	const router = useRouter();
	const [operatingMode, setOperatingMode] = useState("INSTITUTION");
	const [authState, setAuthState] = useState("checking");
	const [authenticatedName, setAuthenticatedName] = useState("");
	const [participantName, setParticipantName] = useState("");
	const [tokenCode, setTokenCode] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [institutionBranding, setInstitutionBranding] = useState({});
	const [showDemoModal, setShowDemoModal] = useState(false);
	const [demoName, setDemoName] = useState("");
	const [demoPhone, setDemoPhone] = useState("");
	const [isStartingDemo, setIsStartingDemo] = useState(false);
	const [demoError, setDemoError] = useState("");
	const requestFullscreenFromLaunch = () => {
		if (typeof document !== "undefined" && !document.fullscreenElement && document.fullscreenEnabled) document.documentElement.requestFullscreen({ navigationUI: "hide" }).catch(() => void 0);
	};
	const handleStartDemo = async (e) => {
		e.preventDefault();
		setDemoError("");
		if (!demoName.trim()) {
			setDemoError("Silakan masukkan nama lengkap Anda.");
			return;
		}
		try {
			setIsStartingDemo(true);
			requestFullscreenFromLaunch();
			const res = await apiFetch("/api/demo/start", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: demoName.trim(),
					phoneNumber: demoPhone.trim() || void 0
				})
			});
			const data = await res.json();
			if (!res.ok) {
				setDemoError(data.error || "Gagal memulai simulasi demo.");
				return;
			}
			router.push(`/demo/${data.demoId}`);
		} catch (err) {
			console.error(err);
			setDemoError("Terjadi gangguan jaringan saat memulai demo.");
		} finally {
			setIsStartingDemo(false);
		}
	};
	React.useEffect(() => {
		async function loadSetting() {
			try {
				const json = await (await apiFetch("/api/settings", { cache: "no-store" })).json();
				if (json.operatingMode) setOperatingMode(json.operatingMode);
			} catch (e) {
				console.error("Failed to load operating mode:", e);
			}
		}
		loadSetting();
	}, []);
	React.useEffect(() => {
		apiFetch("/api/branding", { cache: "no-store" }).then((res) => res.ok ? res.json() : null).then((data) => data && setInstitutionBranding(data)).catch(() => void 0);
	}, []);
	React.useEffect(() => {
		let isMounted = true;
		async function loadAuthState() {
			try {
				const res = await apiFetch("/api/auth/user-me", { cache: "no-store" });
				if (!isMounted) return;
				if (!res.ok) {
					setAuthState("guest");
					return;
				}
				const json = await res.json();
				setAuthenticatedName(json.user?.name || "");
				setAuthState(json.authenticated ? "authenticated" : "guest");
			} catch {
				if (isMounted) setAuthState("guest");
			}
		}
		loadAuthState();
		return () => {
			isMounted = false;
		};
	}, []);
	const handleStartExam = async (e) => {
		e.preventDefault();
		setErrorMessage("");
		if (!participantName.trim()) {
			setErrorMessage("Silakan masukkan nama lengkap Anda.");
			return;
		}
		if (!tokenCode.trim()) {
			setErrorMessage("Silakan masukkan token ujian.");
			return;
		}
		try {
			setIsLoading(true);
			requestFullscreenFromLaunch();
			const res = await apiFetch("/api/auth/token", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					participantName: participantName.trim(),
					tokenCode: tokenCode.trim()
				})
			});
			const data = await res.json();
			if (!res.ok) {
				setErrorMessage(data.error || "Gagal memvalidasi token ujian.");
				return;
			}
			useExamStore.getState().resetExam();
			router.push(`/exam/${data.sessionId}`);
		} catch (err) {
			console.error(err);
			setErrorMessage("Terjadi kesalahan jaringan saat memulai ujian.");
		} finally {
			setIsLoading(false);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-[#f6f8fb] font-sans text-slate-900",
		children: [
			/* @__PURE__ */ jsx("header", {
				className: "sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur",
				children: /* @__PURE__ */ jsxs("div", {
					className: "mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-4 sm:px-6 lg:px-8",
					children: [
						/* @__PURE__ */ jsxs(Link, {
							href: "/",
							className: "flex min-w-0 items-center gap-3",
							"aria-label": "TOEFL ITP Practice Portal home",
							children: [/* @__PURE__ */ jsx("span", {
								className: "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
								children: /* @__PURE__ */ jsx("img", {
									src: appUrl(institutionBranding.logoUrl || DEFAULT_LOGO_URL),
									alt: institutionBranding.institutionName || "Logo institusi",
									className: "h-full w-full object-contain p-1",
									onError: (event) => {
										const fallback = appUrl(DEFAULT_LOGO_URL);
										if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
									}
								})
							}), /* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
								className: "block max-w-[190px] truncate text-sm font-extrabold tracking-tight text-[#0b2a4a] sm:max-w-[260px] sm:text-base",
								children: institutionBranding.institutionName || "TOEFL ITP Practice"
							}), /* @__PURE__ */ jsx("span", {
								className: "hidden text-[11px] font-medium text-slate-500 sm:block",
								children: "Pengalaman ujian digital yang fokus dan terarah"
							})] })]
						}),
						/* @__PURE__ */ jsxs("nav", {
							className: "hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex",
							"aria-label": "Navigasi utama",
							children: [
								/* @__PURE__ */ jsx("a", {
									href: "#format",
									className: "transition hover:text-[#0b2a4a]",
									children: "Format tes"
								}),
								/* @__PURE__ */ jsx("a", {
									href: "#how-it-works",
									className: "transition hover:text-[#0b2a4a]",
									children: "Cara kerja"
								}),
								/* @__PURE__ */ jsx("a", {
									href: "#help",
									className: "transition hover:text-[#0b2a4a]",
									children: "Bantuan"
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2.5",
							children: [authState === "checking" ? /* @__PURE__ */ jsx("span", {
								className: "hidden h-9 w-20 animate-pulse rounded-lg bg-slate-100 sm:inline-flex",
								"aria-label": "Memeriksa sesi"
							}) : /* @__PURE__ */ jsx(Link, {
								href: authState === "authenticated" ? "/student/dashboard" : "/login",
								className: "hidden max-w-[180px] items-center gap-2 truncate rounded-lg px-3 py-2 text-sm font-bold text-[#0b2a4a] transition hover:bg-slate-100 sm:inline-flex",
								title: authState === "authenticated" ? `Buka dashboard${authenticatedName ? ` — ${authenticatedName}` : ""}` : "Masuk ke akun peserta",
								children: authState === "authenticated" ? authenticatedName ? `Dashboard · ${authenticatedName}` : "Dashboard" : "Masuk"
							}), /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => setShowDemoModal(true),
								className: "inline-flex items-center gap-2 rounded-lg bg-[#0b2a4a] px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#123f67] sm:px-4 sm:text-sm",
								children: [/* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-cyan-200" }), /* @__PURE__ */ jsx("span", { children: "Coba demo" })]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ jsxs("main", {
				className: "pb-20 md:pb-0",
				children: [
					/* @__PURE__ */ jsx("section", {
						className: "overflow-hidden bg-[#0b2a4a] text-white",
						children: /* @__PURE__ */ jsxs("div", {
							className: "mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "max-w-2xl",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-100",
										children: [/* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-cyan-300" }), "Simulasi berbasis TOEFL ITP Level 1"]
									}),
									/* @__PURE__ */ jsx("h1", {
										className: "max-w-xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl",
										children: "Uji kemampuan bahasa Inggris dengan tenang dan terarah."
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-6 max-w-xl text-base leading-7 text-slate-200 sm:text-lg",
										children: "Satu portal untuk simulasi, ujian terjadwal, dan laporan skor. Ikuti tiga section dengan alur yang jelas, audio yang terkontrol, serta waktu yang terukur."
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "mt-8 flex flex-col gap-3 sm:flex-row",
										children: [/* @__PURE__ */ jsxs("button", {
											type: "button",
											onClick: () => setShowDemoModal(true),
											className: "inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3.5 text-sm font-extrabold text-[#0b2a4a] shadow-lg transition hover:bg-cyan-50",
											children: ["Mulai demo gratis ", /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })]
										}), /* @__PURE__ */ jsx("a", {
											href: "#test-access",
											className: "inline-flex items-center justify-center rounded-lg border border-white/30 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/10",
											children: "Masuk ke ujian terjadwal"
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-slate-300",
										children: [
											/* @__PURE__ */ jsxs("span", {
												className: "inline-flex items-center gap-2",
												children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4 text-cyan-300" }), " Sesi terlindungi"]
											}),
											/* @__PURE__ */ jsxs("span", {
												className: "inline-flex items-center gap-2",
												children: [/* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-cyan-300" }), " Durasi terukur"]
											}),
											/* @__PURE__ */ jsxs("span", {
												className: "inline-flex items-center gap-2",
												children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-cyan-300" }), " Hasil tersimpan"]
											})
										]
									})
								]
							}), /* @__PURE__ */ jsx("div", {
								id: "test-access",
								className: "rounded-2xl bg-white p-6 text-slate-900 shadow-2xl sm:p-8",
								children: operatingMode === "COMMERCIAL" ? /* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsxs("div", {
										className: "mb-6 flex items-start gap-3",
										children: [/* @__PURE__ */ jsx("span", {
											className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[#0b2a4a]",
											children: /* @__PURE__ */ jsx(User, { className: "h-5 w-5" })
										}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
											className: "text-xs font-bold uppercase tracking-[0.14em] text-cyan-700",
											children: "Peserta terdaftar"
										}), /* @__PURE__ */ jsx("h2", {
											className: "mt-1 text-2xl font-black tracking-tight text-[#0b2a4a]",
											children: "Mulai perjalanan belajar"
										})] })]
									}),
									authState === "authenticated" ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("p", {
										className: "mb-6 text-sm leading-6 text-slate-600",
										children: [
											"Anda sudah masuk",
											authenticatedName ? ` sebagai ${authenticatedName}` : "",
											". Lanjutkan ke dashboard untuk memilih jadwal atau melihat hasil ujian."
										]
									}), /* @__PURE__ */ jsxs(Link, {
										href: "/student/dashboard",
										className: "flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b2a4a] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#123f67]",
										children: [
											/* @__PURE__ */ jsx(LogIn, { className: "h-4 w-4" }),
											" Buka dashboard ",
											/* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
										]
									})] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("p", {
										className: "mb-6 text-sm leading-6 text-slate-600",
										children: "Buat akun untuk memilih paket, mengikuti jadwal ujian, dan menyimpan laporan skor Anda."
									}), /* @__PURE__ */ jsxs("div", {
										className: "space-y-3",
										children: [/* @__PURE__ */ jsxs(Link, {
											href: "/register",
											className: "flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b2a4a] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#123f67]",
											children: [
												/* @__PURE__ */ jsx(UserPlus, { className: "h-4 w-4" }),
												" Daftar akun peserta ",
												/* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
											]
										}), /* @__PURE__ */ jsxs(Link, {
											href: "/login",
											className: "flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50",
											children: [/* @__PURE__ */ jsx(LogIn, { className: "h-4 w-4" }), " Masuk ke akun"]
										})]
									})] }),
									/* @__PURE__ */ jsxs("div", {
										className: "mt-6 grid gap-2 border-t border-slate-100 pt-5 text-xs text-slate-600 sm:grid-cols-2",
										children: [/* @__PURE__ */ jsxs("span", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-600" }), " Riwayat tersimpan"]
										}), /* @__PURE__ */ jsxs("span", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-emerald-600" }), " Sertifikat digital"]
										})]
									})
								] }) : /* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsxs("div", {
										className: "mb-6 flex items-start gap-3",
										children: [/* @__PURE__ */ jsx("span", {
											className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[#0b2a4a]",
											children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-5 w-5" })
										}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
											className: "text-xs font-bold uppercase tracking-[0.14em] text-cyan-700",
											children: "Sesi institusional"
										}), /* @__PURE__ */ jsx("h2", {
											className: "mt-1 text-2xl font-black tracking-tight text-[#0b2a4a]",
											children: "Masuk ke ruang ujian"
										})] })]
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mb-6 text-sm leading-6 text-slate-600",
										children: "Masukkan nama sesuai identitas dan token yang diberikan oleh penyelenggara ujian."
									}),
									authState === "authenticated" && /* @__PURE__ */ jsxs("div", {
										className: "mb-5 flex items-center justify-between gap-3 rounded-xl border border-cyan-100 bg-cyan-50 p-3.5 text-xs text-cyan-900",
										children: [/* @__PURE__ */ jsxs("span", { children: [
											"Anda sudah masuk",
											authenticatedName ? ` sebagai ${authenticatedName}` : "",
											"."
										] }), /* @__PURE__ */ jsx(Link, {
											href: "/student/dashboard",
											className: "shrink-0 font-extrabold text-[#0b2a4a] hover:underline",
											children: "Buka dashboard"
										})]
									}),
									errorMessage && /* @__PURE__ */ jsx("div", {
										role: "alert",
										className: "mb-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700",
										children: errorMessage
									}),
									/* @__PURE__ */ jsxs("form", {
										onSubmit: handleStartExam,
										className: "space-y-4",
										children: [
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
												className: "mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700",
												htmlFor: "participant-name",
												children: "Nama lengkap"
											}), /* @__PURE__ */ jsx("input", {
												id: "participant-name",
												type: "text",
												required: true,
												value: participantName,
												onChange: (e) => setParticipantName(e.target.value),
												placeholder: "Nama sesuai identitas",
												className: "w-full rounded-lg border border-slate-300 px-4 py-3 text-sm transition focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100"
											})] }),
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
												className: "mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700",
												htmlFor: "exam-token",
												children: "Token ujian"
											}), /* @__PURE__ */ jsx("input", {
												id: "exam-token",
												type: "text",
												required: true,
												value: tokenCode,
												onChange: (e) => setTokenCode(e.target.value.toUpperCase()),
												placeholder: "Masukkan token ujian",
												className: "w-full rounded-lg border border-slate-300 px-4 py-3 font-mono text-sm font-bold tracking-wider transition focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100"
											})] }),
											/* @__PURE__ */ jsxs("button", {
												type: "submit",
												disabled: isLoading,
												className: "flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b2a4a] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#123f67] disabled:cursor-not-allowed disabled:opacity-60",
												children: [/* @__PURE__ */ jsx("span", { children: isLoading ? "Memvalidasi sesi..." : "Mulai ujian" }), /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })]
											})
										]
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-4 text-center text-xs text-slate-500",
										children: "Belum memiliki token? Hubungi penyelenggara ujian Anda."
									})
								] })
							})]
						})
					}),
					/* @__PURE__ */ jsxs("section", {
						id: "format",
						className: "mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "max-w-2xl",
								children: [
									/* @__PURE__ */ jsx("p", {
										className: "text-xs font-bold uppercase tracking-[0.16em] text-cyan-700",
										children: "Format tes"
									}),
									/* @__PURE__ */ jsx("h2", {
										className: "mt-3 text-3xl font-black tracking-tight text-[#0b2a4a] sm:text-4xl",
										children: "Tiga section. Satu alur yang jelas."
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-4 text-base leading-7 text-slate-600",
										children: "Kenali struktur tes sebelum mulai agar Anda dapat mengatur waktu dan fokus pada setiap bagian."
									})
								]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "mt-10 grid gap-4 md:grid-cols-3",
								children: [
									{
										icon: Headphones,
										number: "01",
										title: "Listening Comprehension",
										detail: "50 soal · 35 menit",
										text: "Dengarkan setiap percakapan dan jawab dengan fokus.",
										color: "bg-cyan-50 text-cyan-700"
									},
									{
										icon: BookOpen,
										number: "02",
										title: "Structure & Written Expression",
										detail: "40 soal · 25 menit",
										text: "Uji pemahaman tata bahasa dan penggunaan bahasa.",
										color: "bg-indigo-50 text-indigo-700"
									},
									{
										icon: FileText,
										number: "03",
										title: "Reading Comprehension",
										detail: "50 soal · 55 menit",
										text: "Baca teks akademik dan temukan informasi penting.",
										color: "bg-emerald-50 text-emerald-700"
									}
								].map(({ icon: Icon, number, title, detail, text, color }) => /* @__PURE__ */ jsxs("article", {
									className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ jsx("span", {
												className: `flex h-11 w-11 items-center justify-center rounded-xl ${color}`,
												children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" })
											}), /* @__PURE__ */ jsx("span", {
												className: "text-xs font-black tracking-[0.2em] text-slate-300",
												children: number
											})]
										}),
										/* @__PURE__ */ jsx("h3", {
											className: "mt-6 text-lg font-extrabold text-[#0b2a4a]",
											children: title
										}),
										/* @__PURE__ */ jsx("p", {
											className: "mt-2 text-sm font-bold text-slate-700",
											children: detail
										}),
										/* @__PURE__ */ jsx("p", {
											className: "mt-3 text-sm leading-6 text-slate-500",
											children: text
										})
									]
								}, number))
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6",
								children: [/* @__PURE__ */ jsx("span", {
									className: "font-bold text-[#0b2a4a]",
									children: "Total Level 1"
								}), /* @__PURE__ */ jsx("span", {
									className: "text-slate-600",
									children: "140 soal · sekitar 115 menit · skala latihan 310–677"
								})]
							})
						]
					}),
					/* @__PURE__ */ jsx("section", {
						id: "how-it-works",
						className: "border-y border-slate-200 bg-white",
						children: /* @__PURE__ */ jsx("div", {
							className: "mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8",
							children: /* @__PURE__ */ jsxs("div", {
								className: "grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start",
								children: [/* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsx("p", {
										className: "text-xs font-bold uppercase tracking-[0.16em] text-cyan-700",
										children: "Cara kerja"
									}),
									/* @__PURE__ */ jsx("h2", {
										className: "mt-3 text-3xl font-black tracking-tight text-[#0b2a4a]",
										children: "Siap dalam beberapa langkah sederhana."
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-4 text-base leading-7 text-slate-600",
										children: "Kami menjaga setiap langkah tetap singkat agar Anda bisa berkonsentrasi pada tes."
									})
								] }), /* @__PURE__ */ jsx("div", {
									className: "grid gap-8 sm:grid-cols-3",
									children: [
										{
											icon: User,
											title: "Siapkan akses",
											text: "Gunakan demo atau masukkan token ujian Anda."
										},
										{
											icon: Headphones,
											title: "Cek perangkat",
											text: "Pastikan headphone, koneksi, dan ruang Anda siap."
										},
										{
											icon: CheckCircle2,
											title: "Kerjakan & lihat hasil",
											text: "Ikuti waktu per section dan tinjau hasil setelah selesai."
										}
									].map(({ icon: Icon, title, text }, index) => /* @__PURE__ */ jsxs("div", {
										className: "relative",
										children: [
											/* @__PURE__ */ jsx("span", {
												className: "flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b2a4a] text-white",
												children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" })
											}),
											/* @__PURE__ */ jsxs("span", {
												className: "mt-4 block text-xs font-bold uppercase tracking-wider text-cyan-700",
												children: ["Langkah ", index + 1]
											}),
											/* @__PURE__ */ jsx("h3", {
												className: "mt-2 text-base font-extrabold text-[#0b2a4a]",
												children: title
											}),
											/* @__PURE__ */ jsx("p", {
												className: "mt-2 text-sm leading-6 text-slate-500",
												children: text
											})
										]
									}, title))
								})]
							})
						})
					}),
					/* @__PURE__ */ jsx("section", {
						id: "help",
						className: "mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8",
						children: /* @__PURE__ */ jsxs("div", {
							className: "grid gap-5 md:grid-cols-2",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "rounded-2xl bg-[#e9f7f8] p-7 sm:p-8",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ jsx("span", {
										className: "flex h-10 w-10 items-center justify-center rounded-xl bg-white text-cyan-700",
										children: /* @__PURE__ */ jsx(HelpCircle, { className: "h-5 w-5" })
									}), /* @__PURE__ */ jsx("h2", {
										className: "text-xl font-black text-[#0b2a4a]",
										children: "Sebelum mulai"
									})]
								}), /* @__PURE__ */ jsxs("ul", {
									className: "mt-5 space-y-3 text-sm leading-6 text-slate-700",
									children: [
										/* @__PURE__ */ jsxs("li", {
											className: "flex gap-2",
											children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "mt-1 h-4 w-4 shrink-0 text-cyan-700" }), "Gunakan laptop atau desktop dengan browser terbaru."]
										}),
										/* @__PURE__ */ jsxs("li", {
											className: "flex gap-2",
											children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "mt-1 h-4 w-4 shrink-0 text-cyan-700" }), "Siapkan headphone untuk section Listening."]
										}),
										/* @__PURE__ */ jsxs("li", {
											className: "flex gap-2",
											children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "mt-1 h-4 w-4 shrink-0 text-cyan-700" }), "Selesaikan tes di ruang yang tenang tanpa berpindah tab."]
										})
									]
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "rounded-2xl bg-[#0b2a4a] p-7 text-white sm:p-8",
								children: [
									/* @__PURE__ */ jsx("p", {
										className: "text-xs font-bold uppercase tracking-[0.16em] text-cyan-200",
										children: "Perlu bantuan?"
									}),
									/* @__PURE__ */ jsx("h2", {
										className: "mt-3 text-2xl font-black",
										children: "Kami siap membantu Anda memulai."
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-3 max-w-md text-sm leading-6 text-slate-200",
										children: "Untuk token, jadwal, atau kendala teknis, hubungi penyelenggara ujian atau tim administrasi Anda."
									}),
									/* @__PURE__ */ jsxs(Link, {
										href: authState === "authenticated" ? "/student/dashboard" : "/login",
										className: "mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-extrabold text-[#0b2a4a] transition hover:bg-cyan-50",
										children: [
											authState === "authenticated" ? "Buka dashboard" : "Buka portal peserta",
											" ",
											/* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
										]
									})
								]
							})]
						})
					})
				]
			}),
			showDemoModal && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95",
					children: [
						/* @__PURE__ */ jsx("button", {
							onClick: () => setShowDemoModal(false),
							className: "absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition",
							title: "Tutup",
							children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
						}),
						/* @__PURE__ */ jsx("div", {
							className: "w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 shadow-inner",
							children: /* @__PURE__ */ jsx(Sparkles, { className: "w-6 h-6" })
						}),
						/* @__PURE__ */ jsx("h3", {
							className: "text-xl font-black text-slate-900 mb-1 tracking-tight",
							children: "Mulai Simulasi Demo Gratis"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-xs text-slate-500 mb-6 leading-relaxed",
							children: "Uji kemampuan TOEFL ITP Anda dengan 30 soal terpilih (10 Listening, 10 Structure, 10 Reading) tanpa perlu registrasi akun."
						}),
						demoError && /* @__PURE__ */ jsx("div", {
							className: "mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium",
							children: demoError
						}),
						/* @__PURE__ */ jsxs("form", {
							onSubmit: handleStartDemo,
							className: "space-y-4",
							children: [
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("label", {
									className: "block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider",
									children: ["Nama Lengkap ", /* @__PURE__ */ jsx("span", {
										className: "text-rose-500",
										children: "*"
									})]
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									required: true,
									value: demoName,
									onChange: (e) => setDemoName(e.target.value),
									placeholder: "Contoh: Budi Santoso",
									className: "w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition"
								})] }),
								/* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between mb-1.5",
										children: [/* @__PURE__ */ jsx("label", {
											className: "block text-xs font-bold text-slate-700 uppercase tracking-wider",
											children: "Nomor WhatsApp"
										}), /* @__PURE__ */ jsx("span", {
											className: "text-[10px] text-slate-400 font-medium",
											children: "Opsional"
										})]
									}),
									/* @__PURE__ */ jsx("input", {
										type: "tel",
										value: demoPhone,
										onChange: (e) => setDemoPhone(e.target.value),
										placeholder: "Contoh: 081234567890",
										className: "w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-[10.5px] text-slate-400 mt-1",
										children: "Opsional — untuk menerima ringkasan hasil skor dan informasi pendaftaran."
									})
								] }),
								/* @__PURE__ */ jsxs("div", {
									className: "bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-[11px] text-slate-600 space-y-1",
									children: [
										/* @__PURE__ */ jsx("span", {
											className: "font-bold text-slate-800 block text-[11.5px]",
											children: "Rincian Simulasi Demo:"
										}),
										/* @__PURE__ */ jsx("p", {
											className: "flex items-center gap-1.5",
											children: "• 10 Soal Listening (Audio Narasi Berurutan)"
										}),
										/* @__PURE__ */ jsx("p", {
											className: "flex items-center gap-1.5",
											children: "• 10 Soal Structure (Kalimat Rumpang & Error)"
										}),
										/* @__PURE__ */ jsx("p", {
											className: "flex items-center gap-1.5",
											children: "• 10 Soal Reading (Teks Akademik Utuh)"
										}),
										/* @__PURE__ */ jsx("p", {
											className: "flex items-center gap-1.5",
											children: "• Prediksi Skor Latihan (310–677) & Pembahasan Singkat"
										})
									]
								}),
								/* @__PURE__ */ jsxs("button", {
									type: "submit",
									disabled: isStartingDemo,
									className: "w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-sm shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 group disabled:opacity-50",
									children: [/* @__PURE__ */ jsx("span", { children: isStartingDemo ? "Menyiapkan Ruang Demo..." : "Mulai Ujian Demo Sekarang" }), /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 group-hover:translate-x-1 transition" })]
								})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur md:hidden",
				role: "navigation",
				"aria-label": "Aksi cepat",
				children: /* @__PURE__ */ jsxs("div", {
					className: "mx-auto flex max-w-lg gap-2",
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => setShowDemoModal(true),
						className: "flex-1 rounded-xl bg-[#0b2a4a] px-3 py-3 text-xs font-extrabold text-white shadow-sm",
						children: "Mulai demo"
					}), /* @__PURE__ */ jsx("a", {
						href: "#test-access",
						className: "flex flex-1 items-center justify-center rounded-xl border border-slate-300 px-3 py-3 text-xs font-extrabold text-[#0b2a4a]",
						children: "Gunakan token"
					})]
				})
			}),
			/* @__PURE__ */ jsx("footer", {
				className: "bg-white border-t border-slate-200 py-6 text-xs text-slate-500",
				children: /* @__PURE__ */ jsxs("div", {
					className: "max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left",
					children: [/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx("p", {
							className: "font-semibold text-slate-700",
							children: institutionBranding.institutionName || "TOEFL ITP Practice Portal"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-[11px] text-slate-400 mt-0.5",
							children: "Platform latihan dan pelaksanaan ujian digital dengan alur yang terukur."
						}),
						institutionBranding.institutionAddress && /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-[11px] text-slate-400",
							children: institutionBranding.institutionAddress
						}),
						institutionBranding.institutionContact && /* @__PURE__ */ jsx("p", {
							className: "text-[11px] text-slate-400",
							children: institutionBranding.institutionContact
						})
					] }), /* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center justify-center gap-3 text-[11px] sm:justify-end",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-slate-400",
								children: "© 2026 TOEFL ITP Practice Portal"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-slate-300",
								children: "•"
							}),
							/* @__PURE__ */ jsx(Link, {
								href: "/privacy",
								className: "text-slate-500 transition hover:text-slate-800",
								children: "Privasi"
							}),
							/* @__PURE__ */ jsx(Link, {
								href: "/terms",
								className: "text-slate-500 transition hover:text-slate-800",
								children: "Ketentuan"
							}),
							/* @__PURE__ */ jsxs(Link, {
								href: "/admin/login",
								className: "text-slate-400 hover:text-slate-600 transition flex items-center gap-1 font-medium",
								title: "Akses terbatas khusus staf pengawas dan administrator ujian",
								children: [/* @__PURE__ */ jsx(Settings, { className: "w-3 h-3" }), /* @__PURE__ */ jsx("span", { children: "Portal Pengawas & Staf" })]
							})
						]
					})]
				})
			})
		]
	});
}
//#endregion
//#region resources/js/Components/AuthShell.tsx
function AuthShell({ eyebrow, title, description, panelTitle, panelDescription, panelItems, children, footer }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-[#f6f8fb] font-sans text-slate-900",
		children: [
			/* @__PURE__ */ jsx("header", {
				className: "border-b border-slate-200/80 bg-white",
				children: /* @__PURE__ */ jsxs("div", {
					className: "mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8",
					children: [/* @__PURE__ */ jsxs(Link, {
						href: "/",
						className: "flex items-center gap-3",
						"aria-label": "Kembali ke halaman utama TOEFL ITP Practice",
						children: [/* @__PURE__ */ jsx("span", {
							className: "flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b2a4a] text-xs font-black tracking-tight text-white",
							children: "ITP"
						}), /* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
							className: "block text-sm font-extrabold tracking-tight text-[#0b2a4a] sm:text-base",
							children: "TOEFL ITP Practice"
						}), /* @__PURE__ */ jsx("span", {
							className: "hidden text-[11px] font-medium text-slate-500 sm:block",
							children: "A focused digital test experience"
						})] })]
					}), /* @__PURE__ */ jsxs(Link, {
						href: "/",
						className: "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-[#0b2a4a]",
						children: [
							/* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
							/* @__PURE__ */ jsx("span", {
								className: "hidden sm:inline",
								children: "Kembali ke beranda"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "sm:hidden",
								children: "Beranda"
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ jsx("main", {
				className: "mx-auto flex w-full max-w-7xl items-center px-4 py-8 sm:px-6 sm:py-12 lg:min-h-[calc(100vh-81px)] lg:px-8",
				children: /* @__PURE__ */ jsxs("div", {
					className: "grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(11,42,74,0.10)] lg:grid-cols-[0.9fr_1.1fr]",
					children: [/* @__PURE__ */ jsxs("aside", {
						className: "relative overflow-hidden bg-[#0b2a4a] px-6 py-8 text-white sm:px-10 sm:py-10 lg:px-12 lg:py-14",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "absolute -right-20 -top-20 h-56 w-56 rounded-full border-[24px] border-cyan-300/10",
								"aria-hidden": "true"
							}),
							/* @__PURE__ */ jsx("div", {
								className: "absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-cyan-300/10 blur-2xl",
								"aria-hidden": "true"
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "relative",
								children: [
									/* @__PURE__ */ jsxs("span", {
										className: "inline-flex items-center gap-2 rounded-full border border-cyan-200/25 bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-100",
										children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "h-3.5 w-3.5" }), "Portal peserta resmi"]
									}),
									/* @__PURE__ */ jsx("h2", {
										className: "mt-8 max-w-md text-3xl font-black leading-tight tracking-tight sm:text-4xl",
										children: panelTitle
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-4 max-w-md text-sm leading-6 text-slate-200 sm:text-base",
										children: panelDescription
									}),
									/* @__PURE__ */ jsx("ul", {
										className: "mt-8 space-y-4 text-sm text-slate-200",
										children: panelItems.map((item) => /* @__PURE__ */ jsxs("li", {
											className: "flex items-start gap-3",
											children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "mt-0.5 h-4 w-4 shrink-0 text-cyan-300" }), /* @__PURE__ */ jsx("span", { children: item })]
										}, item))
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-10 border-t border-white/15 pt-5 text-xs leading-5 text-slate-300",
										children: "Gunakan perangkat dan koneksi yang stabil agar proses ujian berjalan lancar."
									})
								]
							})
						]
					}), /* @__PURE__ */ jsx("section", {
						className: "px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-14",
						"aria-labelledby": "auth-page-title",
						children: /* @__PURE__ */ jsxs("div", {
							className: "mx-auto max-w-xl",
							children: [
								/* @__PURE__ */ jsx("p", {
									className: "text-xs font-bold uppercase tracking-[0.16em] text-cyan-700",
									children: eyebrow
								}),
								/* @__PURE__ */ jsx("h1", {
									id: "auth-page-title",
									className: "mt-3 text-3xl font-black tracking-tight text-[#0b2a4a] sm:text-4xl",
									children: title
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-3 max-w-lg text-sm leading-6 text-slate-600 sm:text-base",
									children: description
								}),
								/* @__PURE__ */ jsx("div", {
									className: "mt-8",
									children
								}),
								/* @__PURE__ */ jsx("div", {
									className: "mt-8 border-t border-slate-200 pt-6",
									children: footer
								})
							]
						})
					})]
				})
			}),
			/* @__PURE__ */ jsxs("footer", {
				className: "border-t border-slate-200 bg-white px-4 py-5 text-center text-xs text-slate-500 sm:px-6",
				children: [/* @__PURE__ */ jsx("p", { children: "© 2026 TOEFL ITP Practice Portal · Platform latihan dan ujian digital yang terukur." }), /* @__PURE__ */ jsxs("div", {
					className: "mt-2 flex items-center justify-center gap-3",
					children: [
						/* @__PURE__ */ jsx(Link, {
							href: "/privacy",
							className: "transition hover:text-slate-800",
							children: "Kebijakan Privasi"
						}),
						/* @__PURE__ */ jsx("span", {
							"aria-hidden": "true",
							children: "·"
						}),
						/* @__PURE__ */ jsx(Link, {
							href: "/terms",
							className: "transition hover:text-slate-800",
							children: "Syarat dan Ketentuan"
						})
					]
				})]
			})
		]
	});
}
//#endregion
//#region resources/js/Pages/Login.tsx
var Login_exports = /* @__PURE__ */ __exportAll({ default: () => LoginPage });
function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isCheckingSession, setIsCheckingSession] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	useEffect(() => {
		let isMounted = true;
		async function checkSession() {
			try {
				if ((await apiFetch("/api/auth/user-me", { cache: "no-store" })).ok) {
					router.replace("/student/dashboard");
					return;
				}
			} catch {} finally {
				if (isMounted) setIsCheckingSession(false);
			}
		}
		checkSession();
		return () => {
			isMounted = false;
		};
	}, [router]);
	const handleLogin = async (event) => {
		event.preventDefault();
		setErrorMessage("");
		try {
			setIsLoading(true);
			const response = await apiFetch("/api/auth/user-login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: email.trim(),
					password
				})
			});
			const data = await response.json();
			if (!response.ok) {
				setErrorMessage(data.error || "Gagal masuk. Periksa email dan kata sandi Anda.");
				return;
			}
			router.push("/student/dashboard");
		} catch (error) {
			console.error(error);
			setErrorMessage("Terjadi gangguan koneksi saat masuk. Silakan coba lagi.");
		} finally {
			setIsLoading(false);
		}
	};
	return /* @__PURE__ */ jsx(AuthShell, {
		eyebrow: "Akun peserta",
		title: "Masuk ke portal Anda",
		description: "Akses jadwal ujian, paket latihan, riwayat pengerjaan, dan laporan skor dalam satu tempat.",
		panelTitle: "Siapkan langkah berikutnya dengan tenang.",
		panelDescription: "Portal peserta membantu Anda mengikuti proses ujian dengan alur yang jelas dari persiapan hingga hasil.",
		panelItems: [
			"Riwayat dan hasil ujian tersimpan aman",
			"Akses jadwal serta pembayaran dalam satu portal",
			"Sesi ujian dilengkapi timer dan pemeriksaan audio"
		],
		footer: /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ jsx("span", {
				className: "text-slate-600",
				children: "Belum memiliki akun?"
			}), /* @__PURE__ */ jsx(Link, {
				href: "/register",
				className: "inline-flex items-center justify-center rounded-lg bg-[#0b2a4a] px-4 py-2.5 font-extrabold text-white transition hover:bg-[#123f67]",
				children: "Daftar akun peserta"
			})]
		}),
		children: isCheckingSession ? /* @__PURE__ */ jsx("div", {
			className: "rounded-xl border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-600",
			role: "status",
			children: "Memeriksa sesi peserta..."
		}) : /* @__PURE__ */ jsxs(Fragment, { children: [
			errorMessage && /* @__PURE__ */ jsx("div", {
				role: "alert",
				className: "mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm font-medium leading-5 text-rose-700",
				children: errorMessage
			}),
			/* @__PURE__ */ jsxs("form", {
				onSubmit: handleLogin,
				className: "space-y-5",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						htmlFor: "login-email",
						className: "mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700",
						children: "Alamat email"
					}), /* @__PURE__ */ jsxs("div", {
						className: "relative",
						children: [/* @__PURE__ */ jsx(Mail, {
							className: "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400",
							"aria-hidden": "true"
						}), /* @__PURE__ */ jsx("input", {
							id: "login-email",
							type: "email",
							required: true,
							autoComplete: "email",
							value: email,
							onChange: (event) => setEmail(event.target.value),
							placeholder: "nama@email.com",
							className: "w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
						})]
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
						className: "mb-2 flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ jsx("label", {
							htmlFor: "login-password",
							className: "block text-xs font-bold uppercase tracking-wider text-slate-700",
							children: "Kata sandi"
						}), /* @__PURE__ */ jsx("span", {
							className: "text-xs text-slate-400",
							children: "Minimal 12 karakter"
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "relative",
						children: [
							/* @__PURE__ */ jsx(Lock, {
								className: "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400",
								"aria-hidden": "true"
							}),
							/* @__PURE__ */ jsx("input", {
								id: "login-password",
								type: showPassword ? "text" : "password",
								required: true,
								autoComplete: "current-password",
								value: password,
								onChange: (event) => setPassword(event.target.value),
								placeholder: "Masukkan kata sandi",
								className: "w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-10 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setShowPassword((current) => !current),
								className: "absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700",
								"aria-label": showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi",
								children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
							})
						]
					})] }),
					/* @__PURE__ */ jsxs("button", {
						type: "submit",
						disabled: isLoading,
						className: "flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b2a4a] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#0b2a4a]/15 transition hover:bg-[#123f67] disabled:cursor-not-allowed disabled:opacity-60",
						children: [/* @__PURE__ */ jsx("span", { children: isLoading ? "Memverifikasi akun..." : "Masuk ke dashboard" }), /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })]
					})
				]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-5 text-center text-xs leading-5 text-slate-500",
				children: "Dengan masuk, Anda setuju menggunakan portal ini sesuai arahan penyelenggara ujian."
			})
		] })
	});
}
//#endregion
//#region resources/js/components/PublicPageShell.tsx
function PublicPageShell({ title, eyebrow, children }) {
	const [branding, setBranding] = useState(null);
	useEffect(() => {
		apiFetch("/api/branding").then((response) => response.ok ? response.json() : null).then((data) => data && setBranding(data)).catch(() => void 0);
	}, []);
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-[#f6f8fb] font-sans text-slate-900",
		children: [
			/* @__PURE__ */ jsx("header", {
				className: "border-b border-slate-200 bg-white",
				children: /* @__PURE__ */ jsxs("div", {
					className: "mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8",
					children: [/* @__PURE__ */ jsxs(Link, {
						href: "/",
						className: "flex min-w-0 items-center gap-3",
						"aria-label": "Kembali ke beranda",
						children: [/* @__PURE__ */ jsx("span", {
							className: "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white",
							children: /* @__PURE__ */ jsx("img", {
								src: appUrl(branding?.logoUrl || "/branding/institution-logo.svg"),
								alt: branding?.institutionName || "Logo institusi",
								className: "h-full w-full object-contain p-1"
							})
						}), /* @__PURE__ */ jsxs("span", {
							className: "min-w-0",
							children: [/* @__PURE__ */ jsx("span", {
								className: "block truncate text-sm font-extrabold text-[#0b2a4a] sm:text-base",
								children: branding?.institutionName || "TOEFL ITP Practice"
							}), /* @__PURE__ */ jsx("span", {
								className: "block text-[11px] font-medium text-slate-500",
								children: "TOEFL ITP Practice & Test Portal"
							})]
						})]
					}), /* @__PURE__ */ jsxs(Link, {
						href: "/",
						className: "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900",
						children: [/* @__PURE__ */ jsx(ArrowLeft, {
							className: "h-3.5 w-3.5",
							"aria-hidden": "true"
						}), " Beranda"]
					})]
				})
			}),
			/* @__PURE__ */ jsx("main", {
				className: "mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8",
				children: /* @__PURE__ */ jsxs("div", {
					className: "max-w-3xl",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "text-xs font-black uppercase tracking-[0.18em] text-cyan-700",
							children: eyebrow
						}),
						/* @__PURE__ */ jsx("h1", {
							className: "mt-3 text-3xl font-black tracking-tight text-[#0b2a4a] sm:text-4xl",
							children: title
						}),
						/* @__PURE__ */ jsx("div", {
							className: "mt-8 space-y-7 text-sm leading-7 text-slate-600",
							children
						})
					]
				})
			}),
			/* @__PURE__ */ jsxs("footer", {
				className: "border-t border-slate-200 bg-white px-4 py-6 text-center text-xs text-slate-500",
				children: [
					branding?.institutionName || "TOEFL ITP Practice",
					branding?.institutionAddress ? ` · ${branding.institutionAddress}` : "",
					branding?.institutionContact ? /* @__PURE__ */ jsx("span", {
						className: "block mt-1",
						children: branding.institutionContact
					}) : null
				]
			})
		]
	});
}
//#endregion
//#region resources/js/Pages/Privacy.tsx
var Privacy_exports = /* @__PURE__ */ __exportAll({ default: () => PrivacyPage });
function PrivacyPage() {
	return /* @__PURE__ */ jsxs(PublicPageShell, {
		eyebrow: "Kepercayaan dan transparansi",
		title: "Kebijakan Privasi",
		children: [
			/* @__PURE__ */ jsx("p", { children: "Kebijakan ini menjelaskan bagaimana platform mengelola informasi saat Anda membuat akun, mengikuti simulasi, mendaftar ujian, mengunggah bukti pembayaran, dan melihat hasil." }),
			/* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsx("h2", {
				className: "text-lg font-black text-slate-900",
				children: "Data yang digunakan"
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-2",
				children: "Data dapat mencakup nama, email, nomor identitas, nomor telepon, institusi, data pendaftaran, jawaban, skor, informasi sertifikat, dan bukti pembayaran. Data tersebut digunakan untuk menjalankan layanan ujian, verifikasi, dukungan peserta, dan audit operasional."
			})] }),
			/* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsx("h2", {
				className: "text-lg font-black text-slate-900",
				children: "Penyimpanan dan akses"
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-2",
				children: "Akses data dibatasi berdasarkan peran. Data operasional disimpan selama diperlukan untuk penyelenggaraan, pelaporan, penyelesaian sengketa, dan kewajiban administrasi lembaga."
			})] }),
			/* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsx("h2", {
				className: "text-lg font-black text-slate-900",
				children: "Cookie dan analitik"
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-2",
				children: "Cookie sesi dan keamanan diperlukan agar login, CSRF, dan ujian berjalan. Analitik non-esensial hanya digunakan bila diaktifkan dan disetujui melalui preferensi cookie. Jawaban, skor, token, dan bukti pembayaran tidak dikirim ke layanan analitik."
			})] }),
			/* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsx("h2", {
				className: "text-lg font-black text-slate-900",
				children: "Permintaan peserta"
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-2",
				children: "Untuk pertanyaan, koreksi data, atau permintaan bantuan, gunakan kontak resmi yang ditampilkan pada halaman ini dan footer aplikasi."
			})] })
		]
	});
}
//#endregion
//#region resources/js/Pages/Register.tsx
var Register_exports = /* @__PURE__ */ __exportAll({ default: () => RegisterPage });
function RegisterPage() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [idNumber, setIdNumber] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isCheckingSession, setIsCheckingSession] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	useEffect(() => {
		let isMounted = true;
		async function checkSession() {
			try {
				if ((await apiFetch("/api/auth/user-me", { cache: "no-store" })).ok) {
					router.replace("/student/dashboard");
					return;
				}
			} catch {} finally {
				if (isMounted) setIsCheckingSession(false);
			}
		}
		checkSession();
		return () => {
			isMounted = false;
		};
	}, [router]);
	const handleRegister = async (event) => {
		event.preventDefault();
		setErrorMessage("");
		try {
			setIsLoading(true);
			const response = await apiFetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: name.trim(),
					email: email.trim(),
					password,
					idNumber: idNumber.trim(),
					phoneNumber: phoneNumber.trim()
				})
			});
			const data = await response.json();
			if (!response.ok) {
				setErrorMessage(data.error || "Pendaftaran gagal. Silakan periksa kembali data Anda.");
				return;
			}
			router.push("/student/dashboard");
		} catch (error) {
			console.error(error);
			setErrorMessage("Terjadi gangguan koneksi saat mendaftar. Silakan coba lagi.");
		} finally {
			setIsLoading(false);
		}
	};
	return /* @__PURE__ */ jsx(AuthShell, {
		eyebrow: "Registrasi peserta",
		title: "Buat akun peserta",
		description: "Lengkapi data identitas dengan benar agar laporan skor dan sertifikat digital dapat diterbitkan sesuai dokumen resmi Anda.",
		panelTitle: "Satu akun untuk seluruh perjalanan ujian.",
		panelDescription: "Setelah terdaftar, Anda dapat memilih jadwal, mengunggah bukti pembayaran, dan melihat hasil secara terpusat.",
		panelItems: [
			"Nama dan identitas tercantum pada laporan resmi",
			"Pendaftaran jadwal dan status pembayaran mudah dipantau",
			"Hasil ujian serta sertifikat tersimpan di akun Anda"
		],
		footer: /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ jsx("span", {
				className: "text-slate-600",
				children: "Sudah memiliki akun?"
			}), /* @__PURE__ */ jsx(Link, {
				href: "/login",
				className: "inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 font-extrabold text-[#0b2a4a] transition hover:bg-slate-50",
				children: "Masuk ke akun"
			})]
		}),
		children: isCheckingSession ? /* @__PURE__ */ jsx("div", {
			className: "rounded-xl border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-600",
			role: "status",
			children: "Memeriksa sesi peserta..."
		}) : /* @__PURE__ */ jsxs(Fragment, { children: [
			errorMessage && /* @__PURE__ */ jsx("div", {
				role: "alert",
				className: "mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm font-medium leading-5 text-rose-700",
				children: errorMessage
			}),
			/* @__PURE__ */ jsxs("form", {
				onSubmit: handleRegister,
				className: "space-y-5",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx("label", {
							htmlFor: "register-name",
							className: "mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700",
							children: "Nama lengkap resmi"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "relative",
							children: [/* @__PURE__ */ jsx(User, {
								className: "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400",
								"aria-hidden": "true"
							}), /* @__PURE__ */ jsx("input", {
								id: "register-name",
								type: "text",
								required: true,
								autoComplete: "name",
								value: name,
								onChange: (event) => setName(event.target.value),
								placeholder: "Sesuai KTP atau paspor",
								className: "w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
							})]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1.5 text-xs leading-5 text-slate-500",
							children: "Gunakan nama yang sama dengan dokumen identitas Anda."
						})
					] }),
					/* @__PURE__ */ jsxs("div", {
						className: "grid gap-5 sm:grid-cols-2",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							htmlFor: "register-id",
							className: "mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700",
							children: "NIK / nomor paspor"
						}), /* @__PURE__ */ jsxs("div", {
							className: "relative",
							children: [/* @__PURE__ */ jsx(CreditCard, {
								className: "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400",
								"aria-hidden": "true"
							}), /* @__PURE__ */ jsx("input", {
								id: "register-id",
								type: "text",
								required: true,
								autoComplete: "off",
								value: idNumber,
								onChange: (event) => setIdNumber(event.target.value),
								placeholder: "Nomor identitas",
								className: "w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-10 pr-4 font-mono text-sm text-slate-900 outline-none transition placeholder:font-sans placeholder:text-slate-400 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
							})]
						})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							htmlFor: "register-phone",
							className: "mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700",
							children: "Nomor WhatsApp"
						}), /* @__PURE__ */ jsxs("div", {
							className: "relative",
							children: [/* @__PURE__ */ jsx(Phone, {
								className: "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400",
								"aria-hidden": "true"
							}), /* @__PURE__ */ jsx("input", {
								id: "register-phone",
								type: "tel",
								required: true,
								autoComplete: "tel",
								value: phoneNumber,
								onChange: (event) => setPhoneNumber(event.target.value),
								placeholder: "08xxxxxxxxxx",
								className: "w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
							})]
						})] })]
					}),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						htmlFor: "register-email",
						className: "mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700",
						children: "Alamat email aktif"
					}), /* @__PURE__ */ jsxs("div", {
						className: "relative",
						children: [/* @__PURE__ */ jsx(Mail, {
							className: "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400",
							"aria-hidden": "true"
						}), /* @__PURE__ */ jsx("input", {
							id: "register-email",
							type: "email",
							required: true,
							autoComplete: "email",
							value: email,
							onChange: (event) => setEmail(event.target.value),
							placeholder: "nama@email.com",
							className: "w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
						})]
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
						className: "mb-2 flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ jsx("label", {
							htmlFor: "register-password",
							className: "block text-xs font-bold uppercase tracking-wider text-slate-700",
							children: "Kata sandi"
						}), /* @__PURE__ */ jsx("span", {
							className: "text-xs text-slate-400",
							children: "Minimal 12 karakter"
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "relative",
						children: [
							/* @__PURE__ */ jsx(Lock, {
								className: "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400",
								"aria-hidden": "true"
							}),
							/* @__PURE__ */ jsx("input", {
								id: "register-password",
								type: showPassword ? "text" : "password",
								required: true,
								minLength: 12,
								autoComplete: "new-password",
								value: password,
								onChange: (event) => setPassword(event.target.value),
								placeholder: "Buat kata sandi yang kuat",
								className: "w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-10 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setShowPassword((current) => !current),
								className: "absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700",
								"aria-label": showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi",
								children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
							})
						]
					})] }),
					/* @__PURE__ */ jsxs("button", {
						type: "submit",
						disabled: isLoading,
						className: "flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b2a4a] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#0b2a4a]/15 transition hover:bg-[#123f67] disabled:cursor-not-allowed disabled:opacity-60",
						children: [/* @__PURE__ */ jsx("span", { children: isLoading ? "Membuat akun..." : "Daftar akun peserta" }), /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })]
					})
				]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-5 text-center text-xs leading-5 text-slate-500",
				children: "Pastikan data identitas sudah benar sebelum melanjutkan pendaftaran."
			})
		] })
	});
}
//#endregion
//#region resources/js/Pages/Result.tsx
var Result_exports = /* @__PURE__ */ __exportAll({ default: () => ResultPage });
function ResultPage() {
	const { sessionId } = useParams();
	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	useEffect(() => {
		async function loadResult() {
			try {
				const json = await (await apiFetch(`/api/result/${sessionId}`)).json();
				if (json.error) alert(json.error);
				else setData(json);
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
	if (isLoading) return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4",
		children: [/* @__PURE__ */ jsx("div", { className: "w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" }), /* @__PURE__ */ jsx("p", {
			className: "text-slate-700 font-semibold",
			children: "Membuat Laporan Skor Simulasi TOEFL ITP..."
		})]
	});
	if (!data || !data.result) return /* @__PURE__ */ jsx("div", {
		className: "min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "bg-white p-8 rounded-2xl shadow-md max-w-md w-full text-center",
			children: [/* @__PURE__ */ jsx("p", {
				className: "text-slate-700 mb-4",
				children: "Data hasil ujian belum tersedia atau sedang diproses."
			}), /* @__PURE__ */ jsxs(Link, {
				href: "/",
				className: "inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm",
				children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }), " Kembali ke Beranda"]
			})]
		})
	});
	const { result } = data;
	const testDate = new Date(data.completedAt).toLocaleDateString("id-ID", {
		day: "numeric",
		month: "long",
		year: "numeric"
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-100 py-8 px-4 sm:px-6 print:bg-white print:py-0 print:px-0",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden",
			children: [/* @__PURE__ */ jsxs(Link, {
				href: "/",
				className: "flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl shadow-xs border border-slate-200 transition",
				children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Selesai & Ke Halaman Awal" })]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-3",
				children: [data.certificate && /* @__PURE__ */ jsxs(Link, {
					href: `/certificate/${data.certificate.verificationCode}`,
					target: "_blank",
					className: "flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-sm shadow-md transition active:scale-95",
					children: [/* @__PURE__ */ jsx(Award, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Lihat Sertifikat Digital" })]
				}), /* @__PURE__ */ jsxs("button", {
					onClick: handlePrint,
					className: "flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition active:scale-95",
					children: [/* @__PURE__ */ jsx(Printer, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Cetak Hasil Skor" })]
				})]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border-4 border-slate-300 print:border-2 print:border-slate-400 p-8 sm:p-12 relative overflow-hidden print:shadow-none print:rounded-none",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "absolute right-[-40px] bottom-[-40px] opacity-[0.03] select-none pointer-events-none",
					children: /* @__PURE__ */ jsx(Award, { className: "w-96 h-96 text-slate-900" })
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "border-b-2 border-slate-900 pb-6 mb-8 text-center relative",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "inline-block bg-slate-900 text-white font-extrabold text-xs px-4 py-1.5 rounded tracking-widest uppercase mb-3",
							children: "Institutional Testing Program"
						}),
						/* @__PURE__ */ jsx("h1", {
							className: "text-2xl sm:text-3xl font-serif font-black tracking-tight text-slate-900 uppercase",
							children: "TOEFL ITP® Prediction Score Report"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-xs sm:text-sm text-slate-500 font-serif mt-1",
							children: "Laporan Hasil Simulasi Bahasa Inggris Institusional"
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8 text-sm",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2 text-slate-600",
								children: [/* @__PURE__ */ jsx(User, { className: "w-4 h-4 text-blue-600" }), /* @__PURE__ */ jsx("span", {
									className: "font-semibold text-slate-500 text-xs uppercase tracking-wider",
									children: "Nama Peserta:"
								})]
							}), /* @__PURE__ */ jsx("p", {
								className: "text-lg font-bold text-slate-900 pl-6",
								children: data.participantName
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2 text-slate-600",
								children: [/* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4 text-blue-600" }), /* @__PURE__ */ jsx("span", {
									className: "font-semibold text-slate-500 text-xs uppercase tracking-wider",
									children: "Tanggal Ujian:"
								})]
							}), /* @__PURE__ */ jsx("p", {
								className: "text-base font-bold text-slate-900 pl-6",
								children: testDate
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2 text-slate-600",
								children: [/* @__PURE__ */ jsx(Hash, { className: "w-4 h-4 text-blue-600" }), /* @__PURE__ */ jsx("span", {
									className: "font-semibold text-slate-500 text-xs uppercase tracking-wider",
									children: "Token / Sesi Ujian:"
								})]
							}), /* @__PURE__ */ jsx("p", {
								className: "text-sm font-mono font-bold text-slate-800 pl-6",
								children: data.tokenCode
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2 text-slate-600",
								children: [/* @__PURE__ */ jsx(FileText, { className: "w-4 h-4 text-blue-600" }), /* @__PURE__ */ jsx("span", {
									className: "font-semibold text-slate-500 text-xs uppercase tracking-wider",
									children: "Paket Ujian:"
								})]
							}), /* @__PURE__ */ jsx("p", {
								className: "text-sm font-medium text-slate-800 pl-6 line-clamp-1",
								children: data.packageTitle
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mb-8",
					children: [/* @__PURE__ */ jsxs("h2", {
						className: "text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2",
						children: [/* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4 text-emerald-600" }), /* @__PURE__ */ jsx("span", { children: "Rincian Skor Per Seksi (Skala Simulasi TOEFL ITP)" })]
					}), /* @__PURE__ */ jsx("div", {
						className: "border border-slate-300 rounded-xl overflow-hidden shadow-xs",
						children: /* @__PURE__ */ jsxs("table", {
							className: "w-full text-left text-sm",
							children: [/* @__PURE__ */ jsx("thead", {
								className: "bg-slate-900 text-white text-xs uppercase font-bold tracking-wider",
								children: /* @__PURE__ */ jsxs("tr", { children: [
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4 sm:px-6",
										children: "Seksi Ujian"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4 text-center",
										children: "Jumlah Soal"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4 text-center",
										children: "Jawaban Benar"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4 sm:px-6 text-right",
										children: "Nilai Skala (31 - 68)"
									})
								] })
							}), /* @__PURE__ */ jsxs("tbody", {
								className: "divide-y divide-slate-200 font-medium text-slate-800",
								children: [
									/* @__PURE__ */ jsxs("tr", {
										className: "hover:bg-slate-50/70",
										children: [
											/* @__PURE__ */ jsx("td", {
												className: "py-3 px-4 sm:px-6 font-semibold",
												children: "Section 1: Listening Comprehension"
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3 px-4 text-center text-slate-500",
												children: "50"
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3 px-4 text-center text-slate-700 font-semibold",
												children: result.listeningRaw
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3 px-4 sm:px-6 text-right font-mono font-bold text-blue-700 text-base",
												children: result.listeningScaled
											})
										]
									}),
									/* @__PURE__ */ jsxs("tr", {
										className: "hover:bg-slate-50/70",
										children: [
											/* @__PURE__ */ jsx("td", {
												className: "py-3 px-4 sm:px-6 font-semibold",
												children: "Section 2: Structure & Written Expression"
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3 px-4 text-center text-slate-500",
												children: "40"
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3 px-4 text-center text-slate-700 font-semibold",
												children: result.structureRaw
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3 px-4 sm:px-6 text-right font-mono font-bold text-blue-700 text-base",
												children: result.structureScaled
											})
										]
									}),
									/* @__PURE__ */ jsxs("tr", {
										className: "hover:bg-slate-50/70",
										children: [
											/* @__PURE__ */ jsx("td", {
												className: "py-3 px-4 sm:px-6 font-semibold",
												children: "Section 3: Reading Comprehension"
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3 px-4 text-center text-slate-500",
												children: "50"
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3 px-4 text-center text-slate-700 font-semibold",
												children: result.readingRaw
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3 px-4 sm:px-6 text-right font-mono font-bold text-blue-700 text-base",
												children: result.readingScaled
											})
										]
									})
								]
							})]
						})
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6",
					children: [/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx("span", {
							className: "text-xs font-bold text-blue-200 uppercase tracking-widest block mb-1",
							children: "Skor Akhir Simulasi TOEFL ITP® (Skala 310 - 677)"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-baseline gap-3",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-5xl sm:text-6xl font-black font-serif tracking-tight",
								children: result.totalScore
							}), /* @__PURE__ */ jsx("span", {
								className: "text-xs text-blue-200",
								children: "/ 677 Max"
							})]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-xs text-blue-200/90 mt-2",
							children: "Dihitung dengan rumus konversi yang dikonfigurasi lembaga: ((L + S + R) × 10) / 3"
						})
					] }), /* @__PURE__ */ jsxs("div", {
						className: "bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center sm:text-right min-w-[200px]",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-[11px] font-semibold text-blue-200 uppercase tracking-wider block mb-1",
								children: "Standar Kecakapan CEFR"
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "inline-block bg-amber-400 text-slate-950 font-black text-2xl px-3 py-0.5 rounded-lg shadow-sm mb-1",
								children: ["Level ", result.cefrLevel]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-xs text-blue-100 font-medium",
								children: result.cefrDescription
							})
						]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "w-5 h-5 text-emerald-600" }), /* @__PURE__ */ jsx("span", { children: "Dokumen ini dihasilkan secara otomatis oleh sistem simulasi TOEFL ITP lembaga." })]
					}), /* @__PURE__ */ jsxs("div", {
						className: "text-slate-400 font-mono text-[11px]",
						children: [
							"ID Sesi: ",
							sessionId.slice(0, 16),
							"..."
						]
					})]
				})
			]
		})]
	});
}
//#endregion
//#region resources/js/Pages/Student/Dashboard.tsx
var Dashboard_exports = /* @__PURE__ */ __exportAll({ default: () => StudentDashboardPage });
function getInitialStudentTab() {
	if (typeof window === "undefined") return "tickets";
	const tab = new URLSearchParams(window.location.search).get("tab");
	return tab === "catalog" || tab === "certificates" ? tab : "tickets";
}
function StudentDashboardPage() {
	const router = useRouter();
	const [student, setStudent] = useState(null);
	const [registrations, setRegistrations] = useState([]);
	const [availableSchedules, setAvailableSchedules] = useState([]);
	const [certificates, setCertificates] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState(null);
	const [activeTab, setActiveTab] = useState(getInitialStudentTab);
	const [audioModalOpen, setAudioModalOpen] = useState(false);
	const [rulesModalOpen, setRulesModalOpen] = useState(false);
	const [confirmEnrollSchedule, setConfirmEnrollSchedule] = useState(null);
	const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("TRANSFER");
	const [enrollPaymentNotes, setEnrollPaymentNotes] = useState("");
	const [uploadModalReg, setUploadModalReg] = useState(null);
	const [proofFile, setProofFile] = useState(null);
	const [proofNotes, setProofNotes] = useState("");
	const [isUploadingProof, setIsUploadingProof] = useState(false);
	const [isEnrolling, setIsEnrolling] = useState(false);
	const [isStartingId, setIsStartingId] = useState(null);
	const audioRef = useRef(null);
	const audioTestTimerRef = useRef(null);
	const [isPlayingAudio, setIsPlayingAudio] = useState(false);
	const [audioTestVolume, setAudioTestVolume] = useState(.8);
	const [isAudioTestMuted, setIsAudioTestMuted] = useState(false);
	const fetchDashboardData = async () => {
		try {
			setIsLoading(true);
			setLoadError(null);
			const res = await apiFetch("/api/student/dashboard");
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
	useEffect(() => {
		const url = new URL(window.location.href);
		if (activeTab === "tickets") url.searchParams.delete("tab");
		else url.searchParams.set("tab", activeTab);
		if (url.toString() !== window.location.href) window.history.replaceState({}, "", url);
	}, [activeTab]);
	const handleLogout = async () => {
		try {
			await apiFetch("/api/auth/user-logout", { method: "POST" });
			router.push("/login");
		} catch (err) {
			console.error(err);
		}
	};
	const handleEnroll = async () => {
		if (!confirmEnrollSchedule) return;
		try {
			setIsEnrolling(true);
			const res = await apiFetch("/api/student/enroll", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					scheduleId: confirmEnrollSchedule.id,
					paymentMethod: selectedPaymentMethod,
					paymentNotes: enrollPaymentNotes
				})
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
	const handleUploadProof = async (e) => {
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
			const res = await apiFetch("/api/student/payment-proof", {
				method: "POST",
				body: formData
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
	const handleStartExam = async (registrationId) => {
		try {
			setIsStartingId(registrationId);
			if (typeof document !== "undefined" && !document.fullscreenElement && document.fullscreenEnabled) document.documentElement.requestFullscreen({ navigationUI: "hide" }).catch(() => void 0);
			const res = await apiFetch("/api/student/start-exam", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ registrationId })
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
		if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
		setIsPlayingAudio(false);
	};
	const handleAudioTestVolumeChange = (nextVolume) => {
		const nextMuted = nextVolume === 0;
		setAudioTestVolume(nextVolume);
		setIsAudioTestMuted(nextMuted);
		if (audioRef.current) audioRef.current.volume = nextMuted ? 0 : nextVolume;
	};
	const toggleAudioTestMute = () => {
		const nextMuted = !isAudioTestMuted;
		setIsAudioTestMuted(nextMuted);
		if (audioRef.current) audioRef.current.volume = nextMuted ? 0 : audioTestVolume;
		if (isPlayingAudio && typeof window !== "undefined" && "speechSynthesis" in window) if (nextMuted) window.speechSynthesis.pause();
		else window.speechSynthesis.resume();
	};
	const toggleTestAudio = async () => {
		if (isPlayingAudio) {
			stopAudioTest();
			return;
		}
		try {
			setIsPlayingAudio(true);
			if (audioRef.current) {
				audioRef.current.volume = isAudioTestMuted ? 0 : audioTestVolume;
				audioRef.current.currentTime = 0;
				await audioRef.current.play().catch(() => {});
			}
			if (typeof window !== "undefined" && "speechSynthesis" in window) {
				window.speechSynthesis.cancel();
				const utterance = new SpeechSynthesisUtterance("This is a sound check for your headphones. Please adjust your volume to a comfortable level. If you can hear this audio clearly in both ears, your headphones are working properly for the TOEFL ITP exam.");
				utterance.lang = "en-US";
				utterance.rate = .95;
				utterance.volume = isAudioTestMuted ? 0 : audioTestVolume;
				utterance.onend = () => setIsPlayingAudio(false);
				utterance.onerror = () => setIsPlayingAudio(false);
				audioTestTimerRef.current = window.setTimeout(() => {
					audioTestTimerRef.current = null;
					window.speechSynthesis.speak(utterance);
				}, 1200);
			} else audioTestTimerRef.current = window.setTimeout(() => {
				audioTestTimerRef.current = null;
				setIsPlayingAudio(false);
			}, 3500);
		} catch (err) {
			console.warn("Audio test playback error:", err);
			setIsPlayingAudio(false);
		}
	};
	if (isLoading) return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4",
		children: [/* @__PURE__ */ jsx("div", { className: "w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" }), /* @__PURE__ */ jsx("p", {
			className: "text-slate-400 text-sm font-medium",
			children: "Memuat portal peserta ujian..."
		})]
	});
	if (loadError) return /* @__PURE__ */ jsx("div", {
		className: "min-h-screen bg-slate-100 flex items-center justify-center p-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "bg-white rounded-2xl border border-rose-200 shadow-sm p-8 max-w-md w-full text-center",
			children: [
				/* @__PURE__ */ jsx(AlertCircle, { className: "w-10 h-10 text-rose-500 mx-auto mb-3" }),
				/* @__PURE__ */ jsx("h2", {
					className: "text-base font-bold text-slate-900 mb-2",
					children: "Portal peserta belum dapat dimuat"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-xs text-slate-500 mb-5",
					children: loadError
				}),
				/* @__PURE__ */ jsx("button", {
					onClick: fetchDashboardData,
					className: "px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition",
					children: "Coba Lagi"
				})
			]
		})
	});
	if (!student) return null;
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800",
		children: [
			/* @__PURE__ */ jsx("header", {
				className: "bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs",
				children: /* @__PURE__ */ jsxs("div", {
					className: "max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ jsx("div", {
							className: "w-9 h-9 bg-blue-700 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-sm",
							children: "ITP"
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
							className: "font-extrabold text-slate-900 tracking-tight text-base sm:text-lg block leading-none",
							children: "Portal Peserta Ujian"
						}), /* @__PURE__ */ jsx("span", {
							className: "text-[11px] text-slate-500 font-medium",
							children: "TOEFL ITP® Online Certification"
						})] })]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ jsxs("button", {
							onClick: () => setAudioModalOpen(true),
							className: "hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition",
							children: [/* @__PURE__ */ jsx(Headphones, { className: "w-3.5 h-3.5 text-blue-600" }), /* @__PURE__ */ jsx("span", { children: "Uji Audio" })]
						}), /* @__PURE__ */ jsxs("button", {
							onClick: handleLogout,
							className: "flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-300 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 text-slate-700 rounded-xl font-semibold text-xs transition",
							children: [/* @__PURE__ */ jsx(LogOut, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "Keluar" })]
						})]
					})]
				})
			}),
			/* @__PURE__ */ jsxs("main", {
				className: "flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-4",
							children: [/* @__PURE__ */ jsx("div", {
								className: "w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xl",
								children: /* @__PURE__ */ jsx(User, { className: "w-7 h-7" })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ jsx("h2", {
									className: "text-lg font-bold text-slate-900 leading-tight",
									children: student.name
								}), /* @__PURE__ */ jsx("span", {
									className: "bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold",
									children: "Akun Terverifikasi"
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1",
								children: [
									/* @__PURE__ */ jsxs("span", { children: ["Email: ", /* @__PURE__ */ jsx("strong", { children: student.email })] }),
									student.idNumber && /* @__PURE__ */ jsxs("span", { children: ["• NIK/Paspor: ", /* @__PURE__ */ jsx("strong", { children: student.idNumber })] }),
									student.phoneNumber && /* @__PURE__ */ jsxs("span", { children: ["• WA: ", /* @__PURE__ */ jsx("strong", { children: student.phoneNumber })] })
								]
							})] })]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ jsxs("button", {
								onClick: () => setRulesModalOpen(true),
								className: "px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition",
								children: [/* @__PURE__ */ jsx(Info, { className: "w-3.5 h-3.5 text-amber-600" }), /* @__PURE__ */ jsx("span", { children: "Tata Tertib Ujian" })]
							}), /* @__PURE__ */ jsxs("button", {
								onClick: () => setAudioModalOpen(true),
								className: "px-3.5 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition",
								children: [/* @__PURE__ */ jsx(Headphones, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "Cek Headphone" })]
							})]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex border-b border-slate-200 gap-2",
						children: [
							/* @__PURE__ */ jsxs("button", {
								onClick: () => setActiveTab("tickets"),
								className: `pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition ${activeTab === "tickets" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`,
								children: [
									/* @__PURE__ */ jsx(Ticket, { className: "w-4 h-4" }),
									/* @__PURE__ */ jsx("span", { children: "Tiket Ujian Saya" }),
									registrations.length > 0 && /* @__PURE__ */ jsx("span", {
										className: "bg-blue-100 text-blue-800 text-[11px] font-mono px-2 py-0.2 rounded-full",
										children: registrations.length
									})
								]
							}),
							/* @__PURE__ */ jsxs("button", {
								onClick: () => setActiveTab("catalog"),
								className: `pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition ${activeTab === "catalog" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`,
								children: [
									/* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4" }),
									/* @__PURE__ */ jsx("span", { children: "Katalog Jadwal Ujian" }),
									availableSchedules.length > 0 && /* @__PURE__ */ jsx("span", {
										className: "bg-emerald-100 text-emerald-800 text-[11px] font-mono px-2 py-0.2 rounded-full",
										children: availableSchedules.length
									})
								]
							}),
							/* @__PURE__ */ jsxs("button", {
								onClick: () => setActiveTab("certificates"),
								className: `pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition ${activeTab === "certificates" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`,
								children: [
									/* @__PURE__ */ jsx(Award, { className: "w-4 h-4" }),
									/* @__PURE__ */ jsx("span", { children: "E-Sertifikat Terbit" }),
									certificates.length > 0 && /* @__PURE__ */ jsx("span", {
										className: "bg-amber-100 text-amber-800 text-[11px] font-mono px-2 py-0.2 rounded-full",
										children: certificates.length
									})
								]
							})
						]
					}),
					activeTab === "tickets" && /* @__PURE__ */ jsx("div", {
						className: "space-y-4",
						children: registrations.length === 0 ? /* @__PURE__ */ jsxs("div", {
							className: "bg-white rounded-2xl border border-slate-200 p-10 text-center",
							children: [
								/* @__PURE__ */ jsx(Ticket, { className: "w-12 h-12 text-slate-300 mx-auto mb-3" }),
								/* @__PURE__ */ jsx("h3", {
									className: "text-base font-bold text-slate-900 mb-1",
									children: "Anda Belum Memiliki Tiket Ujian"
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "text-xs text-slate-500 max-w-md mx-auto mb-6",
									children: [
										"Silakan buka tab ",
										/* @__PURE__ */ jsx("strong", { children: "\"Katalog Jadwal Ujian\"" }),
										" untuk memilih tanggal dan mendaftarkan diri pada sesi simulasi TOEFL ITP yang tersedia."
									]
								}),
								/* @__PURE__ */ jsxs("button", {
									onClick: () => setActiveTab("catalog"),
									className: "inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition",
									children: [/* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Pilih Jadwal Ujian Sekarang" })]
								})
							]
						}) : /* @__PURE__ */ jsx("div", {
							className: "grid grid-cols-1 gap-5",
							children: registrations.map((reg) => {
								const startTime = new Date(reg.schedule.startTime);
								const endTime = new Date(reg.schedule.endTime);
								const now = /* @__PURE__ */ new Date();
								const isWithinWindow = now >= startTime && now <= endTime;
								const isFinished = reg.session?.status === "COMPLETED";
								const isInProgress = reg.session?.status === "IN_PROGRESS";
								const dateFormatted = startTime.toLocaleDateString("id-ID", {
									weekday: "long",
									day: "numeric",
									month: "long",
									year: "numeric"
								});
								const timeFormatted = `${startTime.toLocaleTimeString("id-ID", {
									hour: "2-digit",
									minute: "2-digit"
								})} - ${endTime.toLocaleTimeString("id-ID", {
									hour: "2-digit",
									minute: "2-digit"
								})} WIB`;
								const isPaymentConfirmed = reg.status === "CONFIRMED" || reg.status === "COMPLETED";
								const isPendingPayment = reg.status === "PENDING_PAYMENT";
								const isWaitingApproval = reg.status === "WAITING_APPROVAL";
								const isRejected = reg.status === "REJECTED";
								return /* @__PURE__ */ jsxs("div", {
									className: "bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-6 hover:shadow-md transition",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "space-y-3.5 flex-1",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "flex flex-wrap items-center gap-2",
												children: [
													/* @__PURE__ */ jsx("span", {
														className: "font-mono text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded",
														children: reg.registrationNumber
													}),
													/* @__PURE__ */ jsx("span", {
														className: "font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded",
														children: reg.schedule.package.code
													}),
													isPendingPayment && /* @__PURE__ */ jsxs("span", {
														className: "text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded flex items-center gap-1",
														children: [/* @__PURE__ */ jsx(CreditCard, { className: "w-3 h-3 text-amber-600" }), " Belum Bayar"]
													}),
													isWaitingApproval && /* @__PURE__ */ jsxs("span", {
														className: "text-xs font-bold text-blue-800 bg-blue-50 border border-blue-300 px-2.5 py-0.5 rounded flex items-center gap-1",
														children: [/* @__PURE__ */ jsx(Clock, { className: "w-3 h-3 text-blue-600 animate-pulse" }), " Menunggu Verifikasi Admin"]
													}),
													isRejected && /* @__PURE__ */ jsxs("span", {
														className: "text-xs font-bold text-rose-800 bg-rose-50 border border-rose-300 px-2.5 py-0.5 rounded flex items-center gap-1",
														children: [/* @__PURE__ */ jsx(AlertCircle, { className: "w-3 h-3 text-rose-600" }), " Pembayaran Ditolak"]
													}),
													isPaymentConfirmed && /* @__PURE__ */ jsxs("span", {
														className: "text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded flex items-center gap-1",
														children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "w-3 h-3 text-emerald-600" }), " Lunas Terverifikasi"]
													}),
													isPaymentConfirmed && /* @__PURE__ */ jsx(Fragment, { children: isFinished ? /* @__PURE__ */ jsxs("span", {
														className: "text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded flex items-center gap-1",
														children: [/* @__PURE__ */ jsx(CheckCircle, { className: "w-3 h-3" }), " Ujian Selesai"]
													}) : isInProgress ? /* @__PURE__ */ jsxs("span", {
														className: "text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded flex items-center gap-1",
														children: [/* @__PURE__ */ jsx(Clock, { className: "w-3 h-3 animate-pulse" }), " Sedang Dikerjakan"]
													}) : isWithinWindow ? /* @__PURE__ */ jsxs("span", {
														className: "text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded flex items-center gap-1",
														children: [/* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-500 animate-ping" }), "Ruang Ujian Terbuka"]
													}) : /* @__PURE__ */ jsxs("span", {
														className: "text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded flex items-center gap-1",
														children: [/* @__PURE__ */ jsx(Lock, { className: "w-3 h-3" }), " Menunggu Jam Ujian"]
													}) })
												]
											}),
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
												className: "text-base font-bold text-slate-900 leading-snug",
												children: reg.schedule.title
											}), /* @__PURE__ */ jsx("p", {
												className: "text-xs text-slate-500 mt-0.5",
												children: reg.schedule.package.title
											})] }),
											/* @__PURE__ */ jsxs("div", {
												className: "flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100",
												children: [
													/* @__PURE__ */ jsxs("div", {
														className: "flex items-center gap-1.5",
														children: [/* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4 text-blue-600" }), /* @__PURE__ */ jsx("span", { children: dateFormatted })]
													}),
													/* @__PURE__ */ jsxs("div", {
														className: "flex items-center gap-1.5",
														children: [/* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 text-blue-600" }), /* @__PURE__ */ jsx("span", { children: timeFormatted })]
													}),
													/* @__PURE__ */ jsxs("div", {
														className: "flex items-center gap-1.5",
														children: [/* @__PURE__ */ jsx(Banknote, { className: "w-4 h-4 text-emerald-600" }), /* @__PURE__ */ jsxs("span", { children: ["Biaya: ", /* @__PURE__ */ jsx("strong", { children: reg.amount > 0 ? `Rp ${reg.amount.toLocaleString("id-ID")}` : "Gratis" })] })]
													})
												]
											}),
											isPendingPayment && /* @__PURE__ */ jsxs("div", {
												className: "bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-2",
												children: [/* @__PURE__ */ jsxs("div", {
													className: "flex items-center justify-between font-bold",
													children: [/* @__PURE__ */ jsxs("span", {
														className: "flex items-center gap-1.5",
														children: [/* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4 text-amber-600" }), reg.paymentMethod === "CASH" ? "Metode: Tunai di Loket / Kasir Panitia" : "Metode: Transfer Bank Resmi"]
													}), /* @__PURE__ */ jsxs("span", {
														className: "text-amber-800 text-[11px] font-mono",
														children: ["Tagihan: Rp ", reg.amount.toLocaleString("id-ID")]
													})]
												}), reg.paymentMethod === "CASH" ? /* @__PURE__ */ jsxs("p", {
													className: "text-[11px] text-amber-800 leading-relaxed",
													children: [
														"Silakan lakukan pembayaran tunai di loket pendaftaran/keuangan panitia dengan menyebutkan ",
														/* @__PURE__ */ jsxs("strong", { children: ["No. Registrasi: ", reg.registrationNumber] }),
														". Petugas akan memvalidasi dan mengaktifkan tiket Anda."
													]
												}) : /* @__PURE__ */ jsxs("div", {
													className: "space-y-1 text-[11px] text-amber-800 leading-relaxed",
													children: [
														/* @__PURE__ */ jsxs("p", { children: [
															"Silakan transfer tepat sebesar ",
															/* @__PURE__ */ jsxs("strong", { children: ["Rp ", reg.amount.toLocaleString("id-ID")] }),
															" ke rekening resmi:"
														] }),
														/* @__PURE__ */ jsxs("div", {
															className: "grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[10.5px]",
															children: [/* @__PURE__ */ jsxs("div", {
																className: "bg-white/80 p-2 rounded-lg border border-amber-200",
																children: [
																	/* @__PURE__ */ jsx("span", {
																		className: "text-slate-500 font-sans block text-[10px]",
																		children: "BCA (Bank Central Asia)"
																	}),
																	/* @__PURE__ */ jsx("strong", {
																		className: "text-slate-900 select-all",
																		children: "8720-9988-1234"
																	}),
																	/* @__PURE__ */ jsx("span", {
																		className: "text-slate-500 block text-[9.5px]",
																		children: "a.n. Lembaga Bahasa ITP"
																	})
																]
															}), /* @__PURE__ */ jsxs("div", {
																className: "bg-white/80 p-2 rounded-lg border border-amber-200",
																children: [
																	/* @__PURE__ */ jsx("span", {
																		className: "text-slate-500 font-sans block text-[10px]",
																		children: "Bank Mandiri"
																	}),
																	/* @__PURE__ */ jsx("strong", {
																		className: "text-slate-900 select-all",
																		children: "137-00-1928-4821"
																	}),
																	/* @__PURE__ */ jsx("span", {
																		className: "text-slate-500 block text-[9.5px]",
																		children: "a.n. Yayasan TOEFL Testing"
																	})
																]
															})]
														}),
														/* @__PURE__ */ jsxs("p", {
															className: "pt-1 text-[10.5px]",
															children: [
																"Setelah transfer, tekan tombol ",
																/* @__PURE__ */ jsx("strong", { children: "\"Unggah Bukti Transfer\"" }),
																" di sebelah kanan untuk mempercepat verifikasi tiket."
															]
														})
													]
												})]
											}),
											isWaitingApproval && /* @__PURE__ */ jsxs("div", {
												className: "bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 space-y-1.5",
												children: [
													/* @__PURE__ */ jsxs("div", {
														className: "flex items-center justify-between font-bold",
														children: [/* @__PURE__ */ jsxs("span", {
															className: "flex items-center gap-1.5",
															children: [/* @__PURE__ */ jsx(Receipt, { className: "w-4 h-4 text-blue-600" }), "Bukti Pembayaran Berhasil Dikirim"]
														}), reg.paymentProofUrl && /* @__PURE__ */ jsxs("a", {
															href: appUrl(reg.paymentProofUrl),
															target: "_blank",
															rel: "noopener noreferrer",
															className: "text-[11px] text-blue-700 hover:underline flex items-center gap-1",
															children: [/* @__PURE__ */ jsx(Image, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "Lihat Struk" })]
														})]
													}),
													/* @__PURE__ */ jsx("p", {
														className: "text-[11px] text-blue-800 leading-relaxed",
														children: "Struk pembayaran Anda sedang dalam antrean verifikasi petugas admin keuangan. Tiket ujian Anda akan aktif secara otomatis begitu status disetujui."
													}),
													reg.paymentNotes && /* @__PURE__ */ jsxs("p", {
														className: "text-[10px] text-blue-600 bg-white/70 px-2 py-1 rounded border border-blue-100",
														children: ["Catatan Pengirim: ", reg.paymentNotes]
													})
												]
											}),
											isRejected && /* @__PURE__ */ jsxs("div", {
												className: "bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-900 space-y-1.5",
												children: [
													/* @__PURE__ */ jsxs("div", {
														className: "flex items-center gap-1.5 font-bold",
														children: [/* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4 text-rose-600" }), /* @__PURE__ */ jsx("span", { children: "Verifikasi Pembayaran Ditolak" })]
													}),
													/* @__PURE__ */ jsxs("p", {
														className: "text-[11px] text-rose-800",
														children: [
															/* @__PURE__ */ jsx("strong", { children: "Alasan Admin:" }),
															" ",
															reg.rejectionReason || "Bukti transfer tidak valid atau dana belum masuk ke mutasi bank."
														]
													}),
													/* @__PURE__ */ jsx("p", {
														className: "text-[10.5px] text-rose-700",
														children: "Silakan periksa kembali transfer Anda dan unggah bukti struk yang benar melalui tombol di bawah."
													})
												]
											})
										]
									}), /* @__PURE__ */ jsx("div", {
										className: "shrink-0 flex flex-col items-stretch md:items-end gap-2.5 min-w-[210px]",
										children: !isPaymentConfirmed ? /* @__PURE__ */ jsxs("div", {
											className: "space-y-2 w-full text-center md:text-right",
											children: [
												/* @__PURE__ */ jsxs("div", {
													className: "p-3 bg-slate-50 border border-slate-200 rounded-xl",
													children: [/* @__PURE__ */ jsxs("span", {
														className: "text-[11px] text-slate-500 font-semibold block flex items-center justify-center md:justify-end gap-1",
														children: [/* @__PURE__ */ jsx(Lock, { className: "w-3.5 h-3.5 text-slate-400" }), "Ruang Ujian Terkunci"]
													}), /* @__PURE__ */ jsx("span", {
														className: "text-[10px] text-slate-400 block mt-0.5",
														children: "Aktif setelah pembayaran diverifikasi"
													})]
												}),
												(isPendingPayment || isRejected) && /* @__PURE__ */ jsxs("button", {
													onClick: () => setUploadModalReg(reg),
													className: "w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5",
													children: [/* @__PURE__ */ jsx(Upload, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: isRejected ? "Unggah Bukti Ulang" : "Unggah Bukti Transfer" })]
												}),
												isWaitingApproval && /* @__PURE__ */ jsxs("button", {
													onClick: () => setUploadModalReg(reg),
													className: "w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-[11px] transition flex items-center justify-center gap-1",
													children: [/* @__PURE__ */ jsx(Upload, { className: "w-3 h-3 text-slate-500" }), /* @__PURE__ */ jsx("span", { children: "Perbarui / Ganti Bukti" })]
												})
											]
										}) : isFinished && reg.session?.result ? /* @__PURE__ */ jsxs("div", {
											className: "text-center md:text-right space-y-2",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "bg-slate-900 text-white p-3 rounded-xl",
												children: [
													/* @__PURE__ */ jsx("span", {
														className: "text-[10px] text-blue-300 uppercase block font-bold",
														children: "Skor Latihan TOEFL ITP"
													}),
													/* @__PURE__ */ jsx("span", {
														className: "text-2xl font-black font-serif text-white block",
														children: reg.session.result.totalScore
													}),
													/* @__PURE__ */ jsxs("span", {
														className: "text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded inline-block",
														children: ["CEFR ", reg.session.result.cefrLevel]
													})
												]
											}), /* @__PURE__ */ jsxs("div", {
												className: "flex items-center gap-2",
												children: [reg.session.certificate && /* @__PURE__ */ jsxs(Link, {
													href: `/certificate/${reg.session.certificate.verificationCode}`,
													target: "_blank",
													className: "flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow-xs",
													children: [/* @__PURE__ */ jsx(Award, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "E-Sertifikat" })]
												}), /* @__PURE__ */ jsxs(Link, {
													href: `/result/${reg.session.id}`,
													target: "_blank",
													className: "flex-1 py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1",
													children: [/* @__PURE__ */ jsx("span", { children: "Hasil" }), /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3" })]
												})]
											})]
										}) : isInProgress ? /* @__PURE__ */ jsxs("button", {
											onClick: () => handleStartExam(reg.id),
											disabled: isStartingId === reg.id,
											className: "py-3 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs shadow-sm transition flex items-center justify-center gap-2",
											children: [/* @__PURE__ */ jsx(Play, { className: "w-4 h-4 fill-current" }), /* @__PURE__ */ jsx("span", { children: "Lanjutkan Pengerjaan Ujian" })]
										}) : isWithinWindow ? /* @__PURE__ */ jsxs("button", {
											onClick: () => handleStartExam(reg.id),
											disabled: isStartingId === reg.id,
											className: "py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2",
											children: [/* @__PURE__ */ jsx(Play, { className: "w-4 h-4 fill-current" }), /* @__PURE__ */ jsx("span", { children: isStartingId === reg.id ? "Menyiapkan Lembar Soal..." : "Masuk Ruang Ujian Sekarang" })]
										}) : /* @__PURE__ */ jsxs("div", {
											className: "space-y-2 text-right w-full",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "p-3 bg-slate-50 border border-slate-200 rounded-xl text-center",
												children: [/* @__PURE__ */ jsx("span", {
													className: "text-[11px] text-slate-500 font-semibold block",
													children: "Ruang Ujian Terkunci"
												}), /* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-slate-400 block mt-0.5",
													children: "Terbuka otomatis saat jam mulai"
												})]
											}), /* @__PURE__ */ jsxs("button", {
												onClick: () => handleStartExam(reg.id),
												disabled: isStartingId === reg.id,
												className: "w-full py-1.5 px-3 bg-slate-200 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1",
												title: "Bypass jam jadwal untuk uji coba langsung",
												children: [/* @__PURE__ */ jsx(Sparkles, { className: "w-3 h-3 text-amber-500" }), /* @__PURE__ */ jsx("span", { children: "Uji Coba Langsung (Bypass Waktu)" })]
											})]
										})
									})]
								}, reg.id);
							})
						})
					}),
					activeTab === "catalog" && /* @__PURE__ */ jsxs("div", {
						className: "space-y-4",
						children: [/* @__PURE__ */ jsx("div", {
							className: "flex items-center justify-between",
							children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
								className: "text-base font-bold text-slate-900",
								children: "Jadwal Sesi Ujian TOEFL ITP® Terbuka"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-xs text-slate-500",
								children: "Pilih tanggal & sesi yang sesuai dengan jadwal luang Anda."
							})] })
						}), availableSchedules.length === 0 ? /* @__PURE__ */ jsx("div", {
							className: "bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs",
							children: "Belum ada jadwal sesi baru yang dibuka oleh administrator. Silakan hubungi admin atau periksa kembali secara berkala."
						}) : /* @__PURE__ */ jsx("div", {
							className: "grid grid-cols-1 md:grid-cols-2 gap-5",
							children: availableSchedules.map((item) => {
								const startTime = new Date(item.startTime);
								const endTime = new Date(item.endTime);
								const sisaKuota = Math.max(0, item.quota - (item.registrationsCount || 0));
								const dateFormatted = startTime.toLocaleDateString("id-ID", {
									weekday: "short",
									day: "numeric",
									month: "short",
									year: "numeric"
								});
								const timeFormatted = `${startTime.toLocaleTimeString("id-ID", {
									hour: "2-digit",
									minute: "2-digit"
								})} - ${endTime.toLocaleTimeString("id-ID", {
									hour: "2-digit",
									minute: "2-digit"
								})} WIB`;
								return /* @__PURE__ */ jsxs("div", {
									className: "bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition",
									children: [/* @__PURE__ */ jsxs("div", { children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-between gap-2 mb-2",
											children: [/* @__PURE__ */ jsx("span", {
												className: "font-mono text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded",
												children: item.package.code
											}), /* @__PURE__ */ jsxs("span", {
												className: "text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded",
												children: ["Sisa Kuota: ", /* @__PURE__ */ jsx("strong", { children: sisaKuota })]
											})]
										}),
										/* @__PURE__ */ jsx("h4", {
											className: "text-base font-bold text-slate-900 mb-1",
											children: item.title
										}),
										/* @__PURE__ */ jsx("p", {
											className: "text-xs text-slate-500 mb-4 leading-relaxed",
											children: item.description || "Sesi ujian terstandar TOEFL ITP Prediction dengan evaluasi 3 seksi lengkap."
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2 mb-4 text-xs text-slate-700",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4 text-blue-600" }), /* @__PURE__ */ jsxs("span", { children: [
													/* @__PURE__ */ jsx("strong", { children: "Tanggal:" }),
													" ",
													dateFormatted
												] })]
											}), /* @__PURE__ */ jsxs("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 text-blue-600" }), /* @__PURE__ */ jsxs("span", { children: [
													/* @__PURE__ */ jsx("strong", { children: "Pukul:" }),
													" ",
													timeFormatted
												] })]
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center mb-4",
											children: [
												/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
													className: "block text-[10px] text-slate-400",
													children: "Listening"
												}), /* @__PURE__ */ jsx("strong", {
													className: "text-xs text-slate-800",
													children: "50 Soal"
												})] }),
												/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
													className: "block text-[10px] text-slate-400",
													children: "Structure"
												}), /* @__PURE__ */ jsx("strong", {
													className: "text-xs text-slate-800",
													children: "40 Soal"
												})] }),
												/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
													className: "block text-[10px] text-slate-400",
													children: "Reading"
												}), /* @__PURE__ */ jsx("strong", {
													className: "text-xs text-slate-800",
													children: "50 Soal"
												})] })
											]
										})
									] }), /* @__PURE__ */ jsxs("div", {
										className: "pt-2 flex items-center justify-between gap-3 border-t border-slate-100",
										children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
											className: "text-[10px] text-slate-400 block font-semibold",
											children: "Biaya Tes"
										}), /* @__PURE__ */ jsx("span", {
											className: "text-sm font-black text-emerald-700",
											children: item.price > 0 ? `Rp ${item.price.toLocaleString("id-ID")}` : "GRATIS (FREE PASS)"
										})] }), /* @__PURE__ */ jsxs("button", {
											onClick: () => setConfirmEnrollSchedule(item),
											className: "py-2.5 px-5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-1.5",
											children: [/* @__PURE__ */ jsx(Ticket, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "Daftar Sesi Ini" })]
										})]
									})]
								}, item.id);
							})
						})]
					}),
					activeTab === "certificates" && /* @__PURE__ */ jsxs("div", {
						className: "space-y-4",
						children: [/* @__PURE__ */ jsx("div", {
							className: "flex items-center justify-between",
							children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
								className: "text-base font-bold text-slate-900",
								children: "Daftar Sertifikat Digital TOEFL ITP® Anda"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-xs text-slate-500",
								children: "Setiap sertifikat digital dilengkapi nomor seri unik dan kode verifikasi."
							})] })
						}), certificates.length === 0 ? /* @__PURE__ */ jsx("div", {
							className: "bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs",
							children: "Anda belum memiliki sertifikat yang diterbitkan. Ikuti dan selesaikan ujian untuk mendapatkan sertifikat digital."
						}) : /* @__PURE__ */ jsx("div", {
							className: "grid grid-cols-1 md:grid-cols-2 gap-5",
							children: certificates.map((cert) => {
								const dateStr = new Date(cert.testDate).toLocaleDateString("id-ID", {
									day: "numeric",
									month: "long",
									year: "numeric"
								});
								return /* @__PURE__ */ jsxs("div", {
									className: "bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition",
									children: [/* @__PURE__ */ jsxs("div", { children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-between gap-2 mb-2",
											children: [/* @__PURE__ */ jsx("span", {
												className: "font-mono text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded",
												children: cert.certificateNumber
											}), /* @__PURE__ */ jsxs("span", {
												className: "text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded",
												children: ["CEFR ", cert.cefrLevel]
											})]
										}),
										/* @__PURE__ */ jsx("h4", {
											className: "text-base font-bold text-slate-900 mb-1",
											children: cert.session?.package?.title || "TOEFL ITP Prediction Test"
										}),
										/* @__PURE__ */ jsxs("p", {
											className: "text-xs text-slate-500 mb-4",
											children: ["Tanggal Ujian: ", /* @__PURE__ */ jsx("strong", { children: dateStr })]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-center mb-4",
											children: [
												/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-slate-400 block font-semibold",
													children: "Listening"
												}), /* @__PURE__ */ jsx("span", {
													className: "font-mono font-bold text-slate-900 text-sm",
													children: cert.listeningScore
												})] }),
												/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-slate-400 block font-semibold",
													children: "Structure"
												}), /* @__PURE__ */ jsx("span", {
													className: "font-mono font-bold text-slate-900 text-sm",
													children: cert.structureScore
												})] }),
												/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-slate-400 block font-semibold",
													children: "Reading"
												}), /* @__PURE__ */ jsx("span", {
													className: "font-mono font-bold text-slate-900 text-sm",
													children: cert.readingScore
												})] })
											]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-baseline justify-between py-2 border-t border-slate-100 mb-2",
											children: [/* @__PURE__ */ jsx("span", {
												className: "text-xs text-slate-600 font-bold uppercase",
												children: "Total Scaled Score:"
											}), /* @__PURE__ */ jsxs("span", {
												className: "font-serif font-black text-2xl text-blue-700",
												children: [cert.totalScore, /* @__PURE__ */ jsx("span", {
													className: "text-xs font-sans text-slate-400 font-normal ml-1",
													children: "/ 677"
												})]
											})]
										})
									] }), /* @__PURE__ */ jsxs("div", {
										className: "pt-3 border-t border-slate-100 flex items-center gap-2",
										children: [/* @__PURE__ */ jsxs(Link, {
											href: `/certificate/${cert.verificationCode}`,
											target: "_blank",
											className: "flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition",
											children: [/* @__PURE__ */ jsx(Award, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "Unduh E-Sertifikat PDF" })]
										}), /* @__PURE__ */ jsxs(Link, {
											href: `/verify/${cert.verificationCode}`,
											target: "_blank",
											className: "py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1 transition",
											title: "Halaman Verifikasi Publik QR",
											children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "w-3.5 h-3.5 text-emerald-600" }), /* @__PURE__ */ jsx("span", { children: "Cek QR" })]
										})]
									})]
								}, cert.id);
							})
						})]
					})
				]
			}),
			audioModalOpen && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2 text-blue-700",
								children: [/* @__PURE__ */ jsx(Headphones, { className: "w-6 h-6" }), /* @__PURE__ */ jsx("h3", {
									className: "text-base font-bold text-slate-900",
									children: "Uji Kesiapan Audio Headphone"
								})]
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => {
									stopAudioTest();
									setAudioModalOpen(false);
								},
								className: "text-slate-400 hover:text-slate-700 p-1",
								children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
							})]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-xs text-slate-600 leading-relaxed",
							children: "Dengarkan audio sampel uji coba di bawah ini. Pastikan nada lonceng dan narasi suara berbahasa Inggris terdengar jelas dan seimbang di kedua sisi earphone/headphone Anda."
						}),
						/* @__PURE__ */ jsx("audio", {
							ref: audioRef,
							preload: "auto",
							src: appUrl("/audio/headphone-test.wav")
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-4",
							children: [
								isPlayingAudio && /* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-center gap-1.5 h-10",
									children: [
										/* @__PURE__ */ jsx("span", { className: "w-1.5 h-4 bg-blue-600 rounded-full animate-pulse" }),
										/* @__PURE__ */ jsx("span", { className: "w-1.5 h-8 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" }),
										/* @__PURE__ */ jsx("span", { className: "w-1.5 h-10 bg-blue-700 rounded-full animate-bounce [animation-delay:-0.3s]" }),
										/* @__PURE__ */ jsx("span", { className: "w-1.5 h-6 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.1s]" }),
										/* @__PURE__ */ jsx("span", { className: "w-1.5 h-3 bg-blue-600 rounded-full animate-pulse" })
									]
								}),
								/* @__PURE__ */ jsx("button", {
									onClick: toggleTestAudio,
									className: `py-3 px-6 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 mx-auto shadow-sm ${isPlayingAudio ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`,
									children: isPlayingAudio ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(VolumeX, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Hentikan Audio" })] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Volume2, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Putar Suara Uji Coba" })] })
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-[11px] text-slate-500 block",
									children: isPlayingAudio ? "Audio sound-check sedang diputar... Atur volume secukupnya." : "Tekan tombol di atas untuk menguji fungsi headset."
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2 pt-1",
									children: [
										/* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: toggleAudioTestMute,
											"aria-label": isAudioTestMuted ? "Nyalakan suara uji coba" : "Mute suara uji coba",
											className: "rounded-md p-1 text-slate-500 transition hover:text-slate-900",
											children: isAudioTestMuted || audioTestVolume === 0 ? /* @__PURE__ */ jsx(VolumeX, { className: "h-4 w-4 text-rose-500" }) : /* @__PURE__ */ jsx(Volume2, { className: "h-4 w-4" })
										}),
										/* @__PURE__ */ jsx("input", {
											type: "range",
											min: "0",
											max: "1",
											step: "0.05",
											value: isAudioTestMuted ? 0 : audioTestVolume,
											onChange: (event) => handleAudioTestVolumeChange(Number(event.target.value)),
											"aria-label": "Volume suara uji coba",
											className: "w-full accent-blue-600"
										}),
										/* @__PURE__ */ jsxs("span", {
											className: "w-10 text-right text-[11px] font-semibold text-slate-500",
											children: [Math.round((isAudioTestMuted ? 0 : audioTestVolume) * 100), "%"]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ jsx("button", {
							onClick: () => {
								stopAudioTest();
								setAudioModalOpen(false);
							},
							className: "w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition",
							children: "Saya Dapat Mendengar dengan Jelas"
						})
					]
				})
			}),
			rulesModalOpen && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2 text-amber-600",
								children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "w-6 h-6" }), /* @__PURE__ */ jsx("h3", {
									className: "text-base font-bold text-slate-900",
									children: "Tata Tertib Ujian TOEFL ITP®"
								})]
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => setRulesModalOpen(false),
								className: "text-slate-400 hover:text-slate-700 p-1",
								children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-3 text-xs text-slate-600 leading-relaxed divide-y divide-slate-100",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "pt-2",
									children: [/* @__PURE__ */ jsx("strong", {
										className: "text-slate-900 block mb-0.5",
										children: "1. Larangan Pindah Tab / Jendela (Anti-Fraud)"
									}), "Sistem dilengkapi deteksi otomatis saat Anda berpindah tab atau meminimalkan browser. Pelanggaran berulang dapat membatalkan sesi ujian."]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "pt-2",
									children: [/* @__PURE__ */ jsx("strong", {
										className: "text-slate-900 block mb-0.5",
										children: "2. Durasi & Alur Waktu Otomatis"
									}), "Seksi 1 Listening (~35 mnt), Seksi 2 Structure (25 mnt), Seksi 3 Reading (55 mnt). Timer berjalan terus dan jawaban otomatis tersimpan ke server."]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "pt-2",
									children: [/* @__PURE__ */ jsx("strong", {
										className: "text-slate-900 block mb-0.5",
										children: "3. Audio Listening Hanya Berputar Sekali"
									}), "Sesuai aturan simulasi ini, audio percakapan Listening Comprehension hanya diputar 1 kali dan tidak dapat diulang."]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "pt-2",
									children: [/* @__PURE__ */ jsx("strong", {
										className: "text-slate-900 block mb-0.5",
										children: "4. Koneksi & Perangkat"
									}), "Gunakan laptop/PC dengan browser Google Chrome atau Microsoft Edge terkini dan pastikan koneksi internet stabil."]
								})
							]
						}),
						/* @__PURE__ */ jsx("button", {
							onClick: () => setRulesModalOpen(false),
							className: "w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition",
							children: "Saya Mengerti & Siap Mematuhi"
						})
					]
				})
			}),
			confirmEnrollSchedule && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 my-8",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
								className: "text-base font-bold text-slate-900",
								children: "Konfirmasi Pendaftaran Sesi Ujian"
							}), /* @__PURE__ */ jsx("span", {
								className: "text-[11px] text-slate-500",
								children: confirmEnrollSchedule.price > 0 ? "Pilih saluran pembayaran resmi" : "Pendaftaran sesi gratis"
							})] }), /* @__PURE__ */ jsx("button", {
								onClick: () => setConfirmEnrollSchedule(null),
								className: "text-slate-400 hover:text-slate-700 p-1",
								children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-blue-700 font-bold uppercase tracking-wider block",
									children: "Detail Sesi Ujian"
								}),
								/* @__PURE__ */ jsx("h4", {
									className: "text-sm font-bold text-slate-900",
									children: confirmEnrollSchedule.title
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "text-slate-500",
									children: [
										"Paket Soal: ",
										/* @__PURE__ */ jsx("strong", { children: confirmEnrollSchedule.package.title }),
										" (",
										confirmEnrollSchedule.package.code,
										")"
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "pt-2 border-t border-slate-200 flex items-center justify-between text-slate-700",
									children: [/* @__PURE__ */ jsxs("span", { children: [
										"Jadwal: ",
										new Date(confirmEnrollSchedule.startTime).toLocaleString("id-ID", {
											dateStyle: "medium",
											timeStyle: "short"
										}),
										" WIB"
									] }), /* @__PURE__ */ jsx("span", {
										className: "font-bold text-sm text-emerald-700",
										children: confirmEnrollSchedule.price > 0 ? `Rp ${confirmEnrollSchedule.price.toLocaleString("id-ID")}` : "GRATIS"
									})]
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "font-bold block",
									children: "Validasi Identitas Sertifikat:"
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex flex-wrap gap-x-4 gap-y-0.5 text-slate-700",
									children: [/* @__PURE__ */ jsxs("span", { children: ["Nama: ", /* @__PURE__ */ jsx("strong", {
										className: "text-slate-900",
										children: student.name
									})] }), student.idNumber && /* @__PURE__ */ jsxs("span", { children: ["NIK: ", /* @__PURE__ */ jsx("strong", {
										className: "text-slate-900",
										children: student.idNumber
									})] })]
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-[10px] text-amber-800 pt-0.5",
									children: "Nama & NIK di atas akan tercetak permanen di sertifikat digital setelah ujian diselesaikan."
								})
							]
						}),
						confirmEnrollSchedule.price > 0 ? /* @__PURE__ */ jsxs("div", {
							className: "space-y-3",
							children: [
								/* @__PURE__ */ jsx("label", {
									className: "block text-xs font-bold text-slate-900",
									children: "Pilih Saluran Pembayaran:"
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsxs("button", {
										type: "button",
										onClick: () => setSelectedPaymentMethod("TRANSFER"),
										className: `p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2 ${selectedPaymentMethod === "TRANSFER" ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20" : "border-slate-200 hover:border-slate-300 bg-white"}`,
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ jsx(CreditCard, { className: `w-5 h-5 ${selectedPaymentMethod === "TRANSFER" ? "text-blue-600" : "text-slate-400"}` }), /* @__PURE__ */ jsx("span", {
												className: `w-4 h-4 rounded-full border flex items-center justify-center ${selectedPaymentMethod === "TRANSFER" ? "border-blue-600 bg-blue-600" : "border-slate-300"}`,
												children: selectedPaymentMethod === "TRANSFER" && /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-white" })
											})]
										}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("strong", {
											className: "text-xs text-slate-900 block",
											children: "Transfer Bank"
										}), /* @__PURE__ */ jsx("span", {
											className: "text-[10.5px] text-slate-500 leading-tight block mt-0.5",
											children: "BCA / Mandiri (Unggah struk)"
										})] })]
									}), /* @__PURE__ */ jsxs("button", {
										type: "button",
										onClick: () => setSelectedPaymentMethod("CASH"),
										className: `p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2 ${selectedPaymentMethod === "CASH" ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20" : "border-slate-200 hover:border-slate-300 bg-white"}`,
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ jsx(Banknote, { className: `w-5 h-5 ${selectedPaymentMethod === "CASH" ? "text-emerald-600" : "text-slate-400"}` }), /* @__PURE__ */ jsx("span", {
												className: `w-4 h-4 rounded-full border flex items-center justify-center ${selectedPaymentMethod === "CASH" ? "border-emerald-600 bg-emerald-600" : "border-slate-300"}`,
												children: selectedPaymentMethod === "CASH" && /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-white" })
											})]
										}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("strong", {
											className: "text-xs text-slate-900 block",
											children: "Tunai di Loket"
										}), /* @__PURE__ */ jsx("span", {
											className: "text-[10.5px] text-slate-500 leading-tight block mt-0.5",
											children: "Kasir Kampus / Panitia"
										})] })]
									})]
								}),
								selectedPaymentMethod === "TRANSFER" ? /* @__PURE__ */ jsxs("div", {
									className: "bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs",
									children: [
										/* @__PURE__ */ jsx("span", {
											className: "text-[11px] font-bold text-slate-800 block",
											children: "Rekening Tujuan Pembayaran Resmi:"
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "bg-white p-2.5 rounded-xl border border-slate-200",
												children: [
													/* @__PURE__ */ jsx("span", {
														className: "text-[10px] font-sans text-slate-500 block",
														children: "BCA (Bank Central Asia)"
													}),
													/* @__PURE__ */ jsx("strong", {
														className: "text-slate-900 text-xs",
														children: "8720-9988-1234"
													}),
													/* @__PURE__ */ jsx("span", {
														className: "text-[10px] text-slate-500 block font-sans",
														children: "a.n. Lembaga Bahasa ITP"
													})
												]
											}), /* @__PURE__ */ jsxs("div", {
												className: "bg-white p-2.5 rounded-xl border border-slate-200",
												children: [
													/* @__PURE__ */ jsx("span", {
														className: "text-[10px] font-sans text-slate-500 block",
														children: "Bank Mandiri"
													}),
													/* @__PURE__ */ jsx("strong", {
														className: "text-slate-900 text-xs",
														children: "137-00-1928-4821"
													}),
													/* @__PURE__ */ jsx("span", {
														className: "text-[10px] text-slate-500 block font-sans",
														children: "a.n. Yayasan TOEFL Testing"
													})
												]
											})]
										}),
										/* @__PURE__ */ jsx("p", {
											className: "text-[10.5px] text-slate-500",
											children: "Setelah mendaftar, tiket akan terbit dan Anda dapat mengunggah foto struk transfer di tab \"Tiket Ujian Saya\"."
										})
									]
								}) : /* @__PURE__ */ jsxs("div", {
									className: "bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-900 space-y-1",
									children: [/* @__PURE__ */ jsx("strong", {
										className: "block",
										children: "Alur Pembayaran Tunai:"
									}), /* @__PURE__ */ jsxs("p", {
										className: "text-[11px] text-emerald-800 leading-relaxed",
										children: [
											"Setelah klik konfirmasi di bawah, Anda akan memperoleh ",
											/* @__PURE__ */ jsx("strong", { children: "Nomor Registrasi" }),
											". Datangi loket panitia/kasir lembaga dan bayar tunai sebesar ",
											/* @__PURE__ */ jsxs("strong", { children: ["Rp ", confirmEnrollSchedule.price.toLocaleString("id-ID")] }),
											" untuk aktivasi tiket."
										]
									})]
								}),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "block text-[11px] font-medium text-slate-600 mb-1",
									children: "Catatan Pembayaran / Nama Pengirim (Opsional):"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									value: enrollPaymentNotes,
									onChange: (e) => setEnrollPaymentNotes(e.target.value),
									placeholder: "Contoh: Transfer BCA a.n. Budi Santoso",
									className: "w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
								})] })
							]
						}) : /* @__PURE__ */ jsxs("div", {
							className: "bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 flex items-center gap-2",
							children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "w-5 h-5 text-emerald-600 shrink-0" }), /* @__PURE__ */ jsxs("span", { children: [
								"Sesi ini berstatus ",
								/* @__PURE__ */ jsx("strong", { children: "Free Pass" }),
								". Tiket Anda akan otomatis aktif dan siap digunakan saat jam ujian dimulai tanpa pembayaran."
							] })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3 pt-2",
							children: [/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setConfirmEnrollSchedule(null),
								className: "flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition",
								children: "Batal"
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: handleEnroll,
								disabled: isEnrolling,
								className: "flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50",
								children: isEnrolling ? "Mendaftarkan..." : "Konfirmasi & Dapatkan Tiket"
							})]
						})
					]
				})
			}),
			uploadModalReg && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 my-8",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2 text-blue-700",
								children: [/* @__PURE__ */ jsx(Receipt, { className: "w-5 h-5" }), /* @__PURE__ */ jsx("h3", {
									className: "text-base font-bold text-slate-900",
									children: "Unggah Bukti Transfer"
								})]
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => {
									setUploadModalReg(null);
									setProofFile(null);
									setProofNotes("");
								},
								className: "text-slate-400 hover:text-slate-700 p-1",
								children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-1.5",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ jsx("span", {
										className: "text-slate-500",
										children: "No. Registrasi:"
									}), /* @__PURE__ */ jsx("span", {
										className: "font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200",
										children: uploadModalReg.registrationNumber
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ jsx("span", {
										className: "text-slate-500",
										children: "Sesi Ujian:"
									}), /* @__PURE__ */ jsx("span", {
										className: "font-bold text-slate-800 text-right",
										children: uploadModalReg.schedule.title
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between pt-1 border-t border-slate-200",
									children: [/* @__PURE__ */ jsx("span", {
										className: "font-semibold text-slate-700",
										children: "Total Tagihan:"
									}), /* @__PURE__ */ jsxs("span", {
										className: "font-bold text-sm text-emerald-700",
										children: ["Rp ", uploadModalReg.amount.toLocaleString("id-ID")]
									})]
								})
							]
						}),
						/* @__PURE__ */ jsxs("form", {
							onSubmit: handleUploadProof,
							className: "space-y-4",
							children: [
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("label", {
									className: "block text-xs font-bold text-slate-900 mb-1.5",
									children: ["Foto / Tangkapan Layar Struk Transfer ", /* @__PURE__ */ jsx("span", {
										className: "text-rose-600",
										children: "*"
									})]
								}), /* @__PURE__ */ jsxs("div", {
									className: "border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-4 text-center cursor-pointer transition bg-slate-50/50 relative",
									children: [/* @__PURE__ */ jsx("input", {
										type: "file",
										accept: "image/jpeg,image/png,image/webp,application/pdf",
										required: true,
										onChange: (e) => {
											if (e.target.files && e.target.files[0]) setProofFile(e.target.files[0]);
										},
										className: "absolute inset-0 opacity-0 cursor-pointer w-full h-full"
									}), /* @__PURE__ */ jsxs("div", {
										className: "flex flex-col items-center gap-1.5 pointer-events-none",
										children: [/* @__PURE__ */ jsx(Upload, { className: "w-7 h-7 text-blue-600" }), proofFile ? /* @__PURE__ */ jsxs("span", {
											className: "text-xs font-bold text-blue-700 break-all px-2",
											children: [
												proofFile.name,
												" (",
												(proofFile.size / 1024).toFixed(0),
												" KB)"
											]
										}) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
											className: "text-xs font-bold text-slate-700",
											children: "Klik untuk memilih file bukti transfer"
										}), /* @__PURE__ */ jsx("span", {
											className: "text-[10.5px] text-slate-400",
											children: "Format: JPG, PNG, WEBP, PDF (Maks. 5MB)"
										})] })]
									})]
								})] }),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "block text-xs font-bold text-slate-900 mb-1",
									children: "Catatan Pengirim / Bank Asal (Opsional):"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									value: proofNotes,
									onChange: (e) => setProofNotes(e.target.value),
									placeholder: "Contoh: Transfer BCA a.n. Budi Santoso",
									className: "w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
								})] }),
								/* @__PURE__ */ jsx("div", {
									className: "bg-blue-50/80 border border-blue-200 rounded-xl p-3 text-[11px] text-blue-800 leading-relaxed",
									children: "Pastikan nama pengirim, nominal transfer, dan waktu transaksi tampak jelas agar verifikasi dapat segera disetujui oleh admin."
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-3 pt-2",
									children: [/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => {
											setUploadModalReg(null);
											setProofFile(null);
											setProofNotes("");
										},
										className: "flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition",
										children: "Batal"
									}), /* @__PURE__ */ jsxs("button", {
										type: "submit",
										disabled: isUploadingProof || !proofFile,
										className: "flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-1.5",
										children: [/* @__PURE__ */ jsx(Upload, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: isUploadingProof ? "Mengunggah..." : "Kirim Bukti Pembayaran" })]
									})]
								})
							]
						})
					]
				})
			})
		]
	});
}
//#endregion
//#region resources/js/Pages/Terms.tsx
var Terms_exports = /* @__PURE__ */ __exportAll({ default: () => TermsPage });
function TermsPage() {
	return /* @__PURE__ */ jsxs(PublicPageShell, {
		eyebrow: "Aturan penggunaan",
		title: "Syarat dan Ketentuan",
		children: [
			/* @__PURE__ */ jsx("p", { children: "Dengan menggunakan platform, peserta menyetujui aturan penggunaan layanan, ketentuan pendaftaran, dan tata tertib ujian berikut." }),
			/* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsx("h2", {
				className: "text-lg font-black text-slate-900",
				children: "Akun dan identitas"
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-2",
				children: "Peserta wajib memberikan informasi yang benar, menjaga kerahasiaan akun atau token, dan tidak memberikan akses ujian kepada orang lain."
			})] }),
			/* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsx("h2", {
				className: "text-lg font-black text-slate-900",
				children: "Pelaksanaan ujian"
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-2",
				children: "Peserta wajib mengikuti instruksi audio, timer, fullscreen, dan pengawasan sistem. Upaya menyalin, berbagi jawaban, memanipulasi sistem, atau mengganggu peserta lain dapat dicatat sebagai pelanggaran dan menyebabkan sesi dihentikan."
			})] }),
			/* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsx("h2", {
				className: "text-lg font-black text-slate-900",
				children: "Pembayaran dan bukti transaksi"
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-2",
				children: "Pendaftaran dan pembayaran mengikuti kebijakan lembaga penyelenggara. Bukti pembayaran harus benar dan dapat diverifikasi. Status pendaftaran baru berubah setelah proses pemeriksaan selesai."
			})] }),
			/* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsx("h2", {
				className: "text-lg font-black text-slate-900",
				children: "Skor dan sertifikat"
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-2",
				children: "Skor yang ditampilkan mengikuti paket dan metode penskoran aplikasi. Sertifikat hanya diterbitkan sesuai status dan kebijakan lembaga. Hasil prediction test tidak otomatis merupakan skor resmi ETS."
			})] }),
			/* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsx("h2", {
				className: "text-lg font-black text-slate-900",
				children: "Perubahan layanan"
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-2",
				children: "Lembaga dapat memperbarui jadwal, paket, kebijakan, atau sistem untuk menjaga keamanan dan kualitas layanan. Perubahan penting akan diinformasikan melalui kanal resmi."
			})] })
		]
	});
}
//#endregion
//#region resources/js/Pages/ThankYou.tsx
var ThankYou_exports = /* @__PURE__ */ __exportAll({ default: () => ThankYouPage });
function ThankYouPage() {
	const type = useSearchParams().get("type");
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-[#f6f8fb] px-4 py-12 font-sans",
		children: /* @__PURE__ */ jsxs("div", {
			className: "w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-10",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600",
					children: /* @__PURE__ */ jsx(CheckCircle2, {
						className: "h-9 w-9",
						"aria-hidden": "true"
					})
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-6 text-xs font-black uppercase tracking-[0.18em] text-emerald-700",
					children: "Berhasil"
				}),
				/* @__PURE__ */ jsx("h1", {
					className: "mt-2 text-2xl font-black tracking-tight text-[#0b2a4a]",
					children: type === "payment" ? "Bukti pembayaran berhasil dikirim" : "Permintaan Anda sudah diterima"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-3 text-sm leading-6 text-slate-600",
					children: type === "payment" ? "Tim penyelenggara akan memeriksa bukti pembayaran dan memperbarui status pendaftaran Anda." : "Terima kasih telah menggunakan platform TOEFL ITP. Anda dapat melanjutkan ke dashboard atau kembali ke beranda."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-7 flex flex-col gap-2.5 sm:flex-row",
					children: [/* @__PURE__ */ jsxs(Link, {
						href: "/student/dashboard",
						className: "flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0b2a4a] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#123f67]",
						children: ["Dashboard ", /* @__PURE__ */ jsx(ArrowRight, {
							className: "h-4 w-4",
							"aria-hidden": "true"
						})]
					}), /* @__PURE__ */ jsx(Link, {
						href: "/",
						className: "flex flex-1 items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50",
						children: "Beranda"
					})]
				})
			]
		})
	});
}
//#endregion
//#region resources/js/Pages/Verify.tsx
var Verify_exports = /* @__PURE__ */ __exportAll({ default: () => VerifyPage });
function VerifyPage() {
	const { verificationCode } = useParams();
	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	useEffect(() => {
		async function verify() {
			try {
				setIsLoading(true);
				const res = await apiFetch(`/api/certificate/${verificationCode}`);
				const json = await res.json();
				if (!res.ok || json.error) setError(json.error || "Sertifikat tidak valid atau tidak ditemukan.");
				else setData(json);
			} catch (err) {
				console.error("Verification error:", err);
				setError("Gagal menghubungi server verifikasi.");
			} finally {
				setIsLoading(false);
			}
		}
		verify();
	}, [verificationCode]);
	if (isLoading) return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white",
		children: [/* @__PURE__ */ jsx("div", { className: "w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" }), /* @__PURE__ */ jsx("p", {
			className: "text-slate-300 font-medium text-sm tracking-wide",
			children: "Memverifikasi Keaslian Dokumen Sertifikat..."
		})]
	});
	if (error || !data) return /* @__PURE__ */ jsx("div", {
		className: "min-h-screen bg-slate-900 flex items-center justify-center p-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-rose-200",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4",
					children: /* @__PURE__ */ jsx(AlertTriangle, { className: "w-8 h-8" })
				}),
				/* @__PURE__ */ jsx("h1", {
					className: "text-xl font-black text-slate-900 mb-2",
					children: "Dokumen Tidak Terverifikasi"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-xs text-slate-600 mb-6 leading-relaxed",
					children: error || "Kode verifikasi sertifikat ini tidak ditemukan di dalam pangkalan data resmi kami."
				}),
				/* @__PURE__ */ jsx(Link, {
					href: "/",
					className: "inline-block px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition",
					children: "Kembali ke Beranda"
				})
			]
		})
	});
	const { certificate } = data;
	if (certificate.isRevoked) return /* @__PURE__ */ jsx("div", {
		className: "min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md w-full bg-white text-slate-900 rounded-2xl p-8 text-center shadow-2xl",
			children: [
				/* @__PURE__ */ jsx(AlertTriangle, { className: "w-12 h-12 text-rose-600 mx-auto mb-4" }),
				/* @__PURE__ */ jsx("h1", {
					className: "text-xl font-black mb-2",
					children: "Sertifikat Dicabut"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-sm text-slate-600",
					children: "Dokumen ini tidak lagi berlaku. Hubungi lembaga penerbit untuk informasi lebih lanjut."
				})
			]
		})
	});
	const testDateFormatted = new Date(certificate.testDate).toLocaleDateString("id-ID", {
		day: "numeric",
		month: "long",
		year: "numeric"
	});
	return /* @__PURE__ */ jsx("div", {
		className: "min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-10 px-4 font-sans",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "bg-emerald-600 text-white px-6 py-5 flex items-center gap-4",
					children: [/* @__PURE__ */ jsx("div", {
						className: "w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0",
						children: /* @__PURE__ */ jsx(ShieldCheck, { className: "w-7 h-7 text-white" })
					}), /* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs font-black uppercase tracking-widest bg-emerald-700/80 px-2 py-0.5 rounded text-emerald-100",
								children: "Verification Successful"
							}), /* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4 text-emerald-200" })]
						}),
						/* @__PURE__ */ jsx("h1", {
							className: "text-lg sm:text-xl font-extrabold tracking-tight mt-0.5",
							children: "Sertifikat Digital Terverifikasi"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-xs text-emerald-100 opacity-90",
							children: "Dokumen ini tercatat sah di pangkalan data evaluasi kompetensi bahasa."
						})
					] })]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "p-6 sm:p-8 space-y-6",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-[11px] font-bold text-slate-400 uppercase tracking-wider block",
								children: "Nomor Registrasi Sertifikat"
							}), /* @__PURE__ */ jsx("span", {
								className: "font-mono font-black text-amber-400 text-base sm:text-lg",
								children: certificate.certificateNumber
							})] }), /* @__PURE__ */ jsxs("div", {
								className: "sm:text-right",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-[11px] text-slate-500 block",
									children: "Kode Verifikasi:"
								}), /* @__PURE__ */ jsx("span", {
									className: "font-mono text-xs text-slate-300 font-semibold bg-slate-800 px-2.5 py-1 rounded",
									children: certificate.verificationCode
								})]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-3",
							children: [/* @__PURE__ */ jsx("h2", {
								className: "text-xs font-bold uppercase tracking-wider text-slate-400",
								children: "Identitas Pemegang Sertifikat"
							}), /* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/50",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-[11px] text-slate-400 block mb-1",
											children: "Nama Lengkap"
										}), /* @__PURE__ */ jsx("span", {
											className: "text-sm font-bold text-white block",
											children: certificate.participantName
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/50",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-[11px] text-slate-400 block mb-1",
											children: "NIK / No. Identitas"
										}), /* @__PURE__ */ jsx("span", {
											className: "text-sm font-bold text-white block",
											children: certificate.idNumber || "-"
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/50",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-[11px] text-slate-400 block mb-1",
											children: "Tanggal Ujian"
										}), /* @__PURE__ */ jsx("span", {
											className: "text-sm font-bold text-white block",
											children: testDateFormatted
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/50",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-[11px] text-slate-400 block mb-1",
											children: "Program Pengujian"
										}), /* @__PURE__ */ jsx("span", {
											className: "text-sm font-bold text-white block",
											children: "TOEFL ITP® Prediction Test"
										})]
									})
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-3",
							children: [
								/* @__PURE__ */ jsx("h2", {
									className: "text-xs font-bold uppercase tracking-wider text-slate-400",
									children: "Capaian Nilai Simulasi (Skala TOEFL ITP)"
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-3 gap-2.5 text-center",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "bg-slate-800/70 border border-slate-700/60 rounded-2xl p-3",
											children: [
												/* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-slate-400 block uppercase font-semibold",
													children: "Listening"
												}),
												/* @__PURE__ */ jsx("span", {
													className: "text-xl font-black text-blue-400 font-mono mt-1 block",
													children: certificate.listeningScore
												}),
												/* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-slate-500",
													children: "Skala 31-68"
												})
											]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "bg-slate-800/70 border border-slate-700/60 rounded-2xl p-3",
											children: [
												/* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-slate-400 block uppercase font-semibold",
													children: "Structure"
												}),
												/* @__PURE__ */ jsx("span", {
													className: "text-xl font-black text-blue-400 font-mono mt-1 block",
													children: certificate.structureScore
												}),
												/* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-slate-500",
													children: "Skala 31-68"
												})
											]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "bg-slate-800/70 border border-slate-700/60 rounded-2xl p-3",
											children: [
												/* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-slate-400 block uppercase font-semibold",
													children: "Reading"
												}),
												/* @__PURE__ */ jsx("span", {
													className: "text-xl font-black text-blue-400 font-mono mt-1 block",
													children: certificate.readingScore
												}),
												/* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-slate-500",
													children: "Skala 31-67"
												})
											]
										})
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "bg-gradient-to-r from-blue-900/60 to-indigo-950 border border-blue-800/60 rounded-2xl p-5 flex items-center justify-between",
									children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
										className: "text-[11px] font-bold text-blue-300 uppercase tracking-wider block",
										children: "Total Scaled Score"
									}), /* @__PURE__ */ jsxs("div", {
										className: "flex items-baseline gap-2 mt-1",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-4xl font-black text-white font-serif tracking-tight",
											children: certificate.totalScore
										}), /* @__PURE__ */ jsx("span", {
											className: "text-xs text-blue-300",
											children: "/ 677 Max"
										})]
									})] }), /* @__PURE__ */ jsxs("div", {
										className: "text-right",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-[11px] font-semibold text-blue-300 uppercase block mb-1",
											children: "Kategori CEFR"
										}), /* @__PURE__ */ jsxs("span", {
											className: "inline-block bg-amber-400 text-slate-950 font-black text-lg px-3 py-0.5 rounded-lg shadow-sm",
											children: ["Level ", certificate.cefrLevel]
										})]
									})]
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "pt-2 flex flex-col sm:flex-row gap-3",
							children: [/* @__PURE__ */ jsxs(Link, {
								href: `/certificate/${certificate.verificationCode}`,
								target: "_blank",
								className: "flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2",
								children: [
									/* @__PURE__ */ jsx(FileCheck, { className: "w-4 h-4" }),
									/* @__PURE__ */ jsx("span", { children: "Buka Dokumen E-Sertifikat Lengkap" }),
									/* @__PURE__ */ jsx(ExternalLink, { className: "w-3.5 h-3.5" })
								]
							}), /* @__PURE__ */ jsx(Link, {
								href: "/",
								className: "py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs transition text-center",
								children: "Beranda"
							})]
						})
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "bg-slate-950 border-t border-slate-800 px-6 py-3 text-center text-[11px] text-slate-500",
					children: "Center for Language Assessment & Certification • Validated Digital Document"
				})
			]
		})
	});
}
//#endregion
//#region resources/js/ssr.jsx
var pages = /* #__PURE__ */ Object.assign({
	"./Pages/Admin/Dashboard.tsx": Dashboard_exports$1,
	"./Pages/Admin/Login.tsx": Login_exports$1,
	"./Pages/Admin/Package.tsx": Package_exports,
	"./Pages/Certificate.tsx": Certificate_exports,
	"./Pages/Demo.tsx": Demo_exports,
	"./Pages/DemoResult.tsx": DemoResult_exports,
	"./Pages/Errors/NotFound.tsx": NotFound_exports,
	"./Pages/Exam.tsx": Exam_exports,
	"./Pages/Home.tsx": Home_exports,
	"./Pages/Login.tsx": Login_exports,
	"./Pages/Privacy.tsx": Privacy_exports,
	"./Pages/Register.tsx": Register_exports,
	"./Pages/Result.tsx": Result_exports,
	"./Pages/Student/Dashboard.tsx": Dashboard_exports,
	"./Pages/Terms.tsx": Terms_exports,
	"./Pages/ThankYou.tsx": ThankYou_exports,
	"./Pages/Verify.tsx": Verify_exports
});
function resolvePage(name) {
	const module = pages[`./Pages/${name}.jsx`] || pages[`./Pages/${name}.tsx`];
	if (!module) throw new Error(`Inertia page not found: ${name}`);
	return module.default || module;
}
createServer((page) => createInertiaApp({
	page,
	render: renderToString,
	resolve: resolvePage,
	setup: ({ App, props }) => /* @__PURE__ */ jsx(App, {
		...props,
		children: ({ Component, props: pageProps, key }) => /* @__PURE__ */ createElement(Component, {
			...pageProps,
			key
		})
	})
}));
//#endregion
export {};
