"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { appFetch as fetch, appUrl } from "@/lib/appUrl";
import { useParams, useRouter } from "next/navigation";
import {
  Volume2,
  VolumeX,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Headphones,
  Sparkles,
  BookOpen,
  Send,
  HelpCircle,
  Lock,
} from "lucide-react";
import { AudioPlayer } from "@/components/AudioPlayer";
import { WrittenExpressionText } from "@/components/WrittenExpressionText";

interface DemoQuestionItem {
  id: string;
  number: number;
  section: "LISTENING" | "STRUCTURE" | "READING";
  partType: "PART_A" | "PART_B" | "PART_C" | "STRUCTURE" | "WRITTEN_EXPRESSION" | "READING";
  audioScript?: string;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  passageId?: string;
}

interface DemoPassageItem {
  id: string;
  section: "LISTENING" | "READING";
  title: string;
  content?: string;
  audioScript?: string;
}

export default function DemoExamPage() {
  const params = useParams();
  const router = useRouter();
  const demoId = params.demoId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [participantName, setParticipantName] = useState("");
  const [questions, setQuestions] = useState<DemoQuestionItem[]>([]);
  const [passages, setPassages] = useState<Record<string, DemoPassageItem>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Exam Section & Question state
  const [currentSection, setCurrentSection] = useState<"LISTENING" | "STRUCTURE" | "READING">("LISTENING");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Isolated Audio tracking for this demo session
  const [playedAudioIds, setPlayedAudioIds] = useState<string[]>([]);
  const [completedAudioIds, setCompletedAudioIds] = useState<string[]>([]);
  const [currentlyPlayingAudioId, setCurrentlyPlayingAudioId] = useState<string | null>(null);

  // Restore audio state specific to this demoId from sessionStorage
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

  const handleAudioPlayed = (audioId: string) => {
    setPlayedAudioIds((prev) => {
      if (prev.includes(audioId)) return prev;
      const next = [...prev, audioId];
      try {
        const saved = sessionStorage.getItem(`demo_audio_${demoId}`);
        const parsed = saved ? JSON.parse(saved) : {};
        sessionStorage.setItem(
          `demo_audio_${demoId}`,
          JSON.stringify({
            ...parsed,
            played: next,
          })
        );
      } catch (e) {}
      return next;
    });
  };

  const handleAudioCompleted = (audioId: string) => {
    setCompletedAudioIds((prev) => {
      if (prev.includes(audioId)) return prev;
      const next = [...prev, audioId];
      try {
        const saved = sessionStorage.getItem(`demo_audio_${demoId}`);
        const parsed = saved ? JSON.parse(saved) : {};
        sessionStorage.setItem(
          `demo_audio_${demoId}`,
          JSON.stringify({
            ...parsed,
            completed: next,
          })
        );
      } catch (e) {}
      return next;
    });
  };

  const handleNavigateQuestion = (newIndex: number) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setCurrentlyPlayingAudioId(null);
    setCurrentQuestionIndex(newIndex);
  };

  // Audio readiness modal
  const [hasCheckedAudio, setHasCheckedAudio] = useState(false);
  const [isPlayingTestSound, setIsPlayingTestSound] = useState(false);
  const testAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [needsFullscreen, setNeedsFullscreen] = useState(false);
  const fullscreenCompletedRef = useRef(false);

  const requestDemoFullscreen = useCallback(async (): Promise<boolean> => {
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
    if (typeof document !== "undefined" && document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // The browser may already have exited fullscreen.
      }
    }
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
      if (!active && !fullscreenCompletedRef.current && !isLoading && hasCheckedAudio) {
        setNeedsFullscreen(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    if (!fullscreenCompletedRef.current) void requestDemoFullscreen();
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [requestDemoFullscreen, isLoading, hasCheckedAudio]);

  // Stop test audio and cancel speech on component unmount
  useEffect(() => {
    return () => {
      if (testAudioRef.current) {
        testAudioRef.current.pause();
        testAudioRef.current.currentTime = 0;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setCurrentlyPlayingAudioId(null);
    };
  }, []);

  // Anti-cheat: Disable context menu (right-click) & inspection shortcuts
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Shortcut prevention (F12, Ctrl+U, Ctrl+C, Ctrl+V, Ctrl+P, Ctrl+S, Ctrl+Shift+I/J/C)
      if (
        e.key === "F12" ||
        (e.ctrlKey && ["u", "c", "v", "p", "s", "a"].includes(e.key.toLowerCase())) ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase()))
      ) {
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

  // Section Timers (in seconds)
  // Listening: 10 mins (600s), Structure: 8 mins (480s), Reading: 12 mins (720s)
  const [timeLeft, setTimeLeft] = useState(600);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSectionTransitionModal, setShowSectionTransitionModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Load demo data
  useEffect(() => {
    async function loadDemoData() {
      try {
        setIsLoading(true);
        // Load from server or cached session
        const res = await fetch(`/api/demo/result/${demoId}`);
        const data = await res.json();

        if (res.ok && data.questions) {
          setParticipantName(data.lead?.name || "Peserta Demo");
          setQuestions(data.questions);
          setPassages(data.passages || {});
          if (data.userAnswers) {
            setAnswers(data.userAnswers);
          }
          if (data.lead?.status === "COMPLETED") {
            await exitDemoFullscreen(true);
            router.replace(`/demo/result/${demoId}`);
            return;
          }
        } else {
          // Fallback to direct questions API if needed
          const fallbackRes = await fetch("/api/demo/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Peserta Demo" }),
          });
          const fbData = await fallbackRes.json();
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
  }, [demoId, exitDemoFullscreen, router]);

  // Timer countdown
  useEffect(() => {
    if (!hasCheckedAudio || isSubmitting) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto advance section when time runs out
          handleSectionTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasCheckedAudio, currentSection, isSubmitting]);

  const handleSectionTimeOut = () => {
    if (currentSection === "LISTENING") {
      transitionToSection("STRUCTURE");
    } else if (currentSection === "STRUCTURE") {
      transitionToSection("READING");
    } else if (currentSection === "READING") {
      submitExam();
    }
  };

  const transitionToSection = (nextSection: "STRUCTURE" | "READING") => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setCurrentlyPlayingAudioId(null);
    setCurrentSection(nextSection);
    if (nextSection === "STRUCTURE") {
      setTimeLeft(480); // 8 mins
      // Find first question of Structure (number 11)
      const firstIdx = questions.findIndex((q) => q.section === "STRUCTURE");
      setCurrentQuestionIndex(firstIdx >= 0 ? firstIdx : 10);
    } else if (nextSection === "READING") {
      setTimeLeft(720); // 12 mins
      // Find first question of Reading (number 21)
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
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
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
          // Fallback speech synthesis if audio file fails
          if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance("This is a sound check for your headphones. If you can hear this clearly, your audio is working properly.");
            u.lang = "en-US";
            u.rate = 0.95;
            u.onend = () => setIsPlayingTestSound(false);
            u.onerror = () => setIsPlayingTestSound(false);
            window.speechSynthesis.speak(u);
          } else {
            setIsPlayingTestSound(false);
          }
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

  const handleSelectAnswer = (qNumber: number, optionKey: string) => {
    setAnswers((prev) => ({
      ...prev,
      [String(qNumber)]: optionKey,
    }));
  };

  const submitExam = async () => {
    try {
      setIsSubmitting(true);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setCurrentlyPlayingAudioId(null);
      const res = await fetch("/api/demo/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demoId,
          answers,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit the demo test.");
      }

      await exitDemoFullscreen(true);
      router.replace(`/demo/result/${demoId}`);
    } catch (err) {
      console.error(err);
      alert("An error occurred while submitting your answers. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Filter questions for active section
  const sectionQuestions = questions.filter((q) => q.section === currentSection);
  const currentQ = questions[currentQuestionIndex] || sectionQuestions[0];
  const activePassage = currentQ?.passageId ? passages[currentQ.passageId] : null;
  const isPassageFinished =
    !activePassage ||
    activePassage.section !== "LISTENING" ||
    completedAudioIds.includes(activePassage.id);
  const isListeningPassageLocked = !isPassageFinished;
  const isListeningSection = currentQ?.section === "LISTENING";
  const isReadingSection = currentQ?.section === "READING";
  const isLongConversationListening =
    isListeningSection &&
    (currentQ?.partType === "PART_B" || currentQ?.partType === "PART_C") &&
    Boolean(activePassage);
  const isLongConversationListeningPending =
    isLongConversationListening && !isPassageFinished;
  const showPassageCard =
    Boolean(activePassage) &&
    (!isLongConversationListening || isLongConversationListeningPending);
  const mainGridClass =
    activePassage && !isListeningSection
      ? "grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_220px] items-start"
      : "grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_250px] items-start";
  const questionColumnClass =
    activePassage && !isListeningSection ? "lg:col-start-2" : "lg:col-start-1";
  const sidebarColumnClass =
    activePassage && !isListeningSection ? "lg:col-start-3" : "lg:col-start-2";
  const isDemoSectionEnd =
    currentQuestionIndex < questions.length - 1 &&
    ((currentSection === "LISTENING" && currentQ?.number === 10) ||
      (currentSection === "STRUCTURE" && currentQ?.number === 20));
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

  // Format timer MM:SS
  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (isLoading || !currentQ) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400 font-medium">Preparing your practice session...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 1. AUDIO READINESS MODAL */}
      {!hasCheckedAudio && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95">
            {/* Audio element for headphone sound check */}
            <audio
              ref={testAudioRef}
              preload="auto"
              src={appUrl("/audio/headphone-test.wav")}
            />

            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Headphones className="w-8 h-8" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
              Audio Check
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
              Test your headphones before starting the Listening section. Make
              sure the sample sound is clear and balanced in both ears.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 flex flex-col items-center gap-3">
              {/* Animated Equalizer Wave when playing */}
              {isPlayingTestSound && (
                <div className="flex items-center justify-center gap-1.5 h-8">
                  <span className="w-1.5 h-3 bg-blue-600 rounded-full animate-pulse" />
                  <span className="w-1.5 h-6 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-8 bg-blue-700 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.1s]" />
                  <span className="w-1.5 h-2.5 bg-blue-600 rounded-full animate-pulse" />
                </div>
              )}

              <button
                type="button"
                onClick={toggleTestAudio}
                className={`w-full flex items-center justify-center gap-2 py-3 px-5 font-bold rounded-xl text-sm transition shadow-xs ${
                  isPlayingTestSound
                    ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                    : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                }`}
              >
                {isPlayingTestSound ? (
                  <>
                    <VolumeX className="w-4 h-4 text-rose-600" />
                    <span>Stop test sound</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current text-blue-600" />
                    <span>Play test sound</span>
                  </>
                )}
              </button>
              <span className="text-[11px] text-slate-400">
                {isPlayingTestSound
                  ? "Test sound is playing. Adjust your volume if needed."
                  : "Play the sample to check your headphones."}
              </span>
            </div>

            <button
              type="button"
              onClick={handleAudioReady}
              className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-sm shadow-md shadow-blue-500/20 transition hover:scale-[1.01]"
            >
              I Can Hear Clearly — Start Demo
            </button>
          </div>
        </div>
      )}

      {hasCheckedAudio && needsFullscreen && !isFullscreen && (
        <div className="fixed inset-0 z-40 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-7 text-center text-white shadow-2xl border border-slate-700">
            <div className="w-12 h-12 bg-blue-500/15 text-blue-300 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black mb-2">Masuk Fullscreen untuk Demo</h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Browser belum mengaktifkan fullscreen secara otomatis. Tekan tombol di bawah untuk melanjutkan demo.
            </p>
            <button
              type="button"
              onClick={() => void requestDemoFullscreen()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition"
            >
              Masuk Fullscreen
            </button>
          </div>
        </div>
      )}

      {/* 2. SECTION TRANSITION MODAL */}
      {showSectionTransitionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ArrowRight className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">
              Continue to the next section?
            </h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              {currentSection === "LISTENING" && (
                <>You are about to leave <strong>Section 1: Listening</strong> and continue to <strong>Section 2: Structure &amp; Written Expression</strong> (10 questions — 8 minutes). You will not be able to return to Listening.</>
              )}
              {currentSection === "STRUCTURE" && (
                <>You are about to continue to <strong>Section 3: Reading Comprehension</strong> (10 questions — 12 minutes). Review your Structure answers before continuing.</>
              )}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSectionTransitionModal(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Review Answers
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentSection === "LISTENING") transitionToSection("STRUCTURE");
                  else if (currentSection === "STRUCTURE") transitionToSection("READING");
                }}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUBMIT FINAL MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">
              Complete Demo Test?
            </h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              All 30 questions are ready to submit. Your estimated TOEFL ITP score and brief explanations will be shown.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Review Answers
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={submitExam}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? "Calculating Score..." : "Submit & View Score"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP HEADER NAV */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
            DEMO
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                {currentSection === "LISTENING" && "Section 1: Listening Comprehension"}
                {currentSection === "STRUCTURE" && "Section 2: Structure & Written Expression"}
                {currentSection === "READING" && "Section 3: Reading Comprehension"}
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-mono">
                30 QUESTIONS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Participant: <strong className="text-slate-700">{participantName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Section Timer Countdown */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-black shadow-xs border ${
            timeLeft < 60
              ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse"
              : "bg-slate-900 border-slate-800 text-white"
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(timeLeft)}</span>
          </div>
        </div>
      </header>

      {/* MAIN EXAM BODY */}
      <main
        className={`flex-1 ${isReadingSection ? "max-w-[1600px]" : "max-w-7xl"} w-full mx-auto p-4 sm:p-6 gap-6 ${mainGridClass}`}
      >
        {/* LEFT COLUMN: PASSAGE (If Reading or Listening Part B) */}
        {showPassageCard && activePassage && (
          <div
            className={`bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col w-full max-w-none lg:col-start-1 ${
              isLongConversationListeningPending
                ? "lg:col-span-2"
                : isReadingSection
                ? "lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto"
                : ""
            }`}
          >
            <div className="border-b border-slate-100 pb-3 mb-4">
              <span className="text-[10.5px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
                {activePassage.section === "LISTENING"
                  ? `Listening Stimulus (${currentQ?.partType === "PART_C" ? "Part C" : "Part B"})`
                  : "Reading Passage (Academic Text)"}
              </span>
              <h3 className="text-base font-extrabold text-slate-900">
                {activePassage.title}
              </h3>
            </div>

            {/* Audio Stimulus for Listening Part B */}
            {activePassage.section === "LISTENING" && activePassage.audioScript && (
              <div className="mb-4">
                <AudioPlayer
                  key={activePassage.id}
                  id={activePassage.id}
                  audioUrl={null}
                  textToSpeak={activePassage.audioScript}
                  label={`${currentQ?.partType === "PART_C" ? "Part C" : "Part B"} conversation audio`}
                  autoPlay={hasCheckedAudio}
                  autoPlayDelayMs={2500}
                  allowReplay
                  playedAudioIds={playedAudioIds}
                  completedAudioIds={completedAudioIds}
                  onAudioPlayed={handleAudioPlayed}
                  onAudioCompleted={handleAudioCompleted}
                  currentlyPlayingId={currentlyPlayingAudioId}
                  onCurrentlyPlayingChange={setCurrentlyPlayingAudioId}
                />
              </div>
            )}

            {/* Reading Content */}
            {activePassage.content && (
              <div className="text-xs sm:text-sm text-slate-700 font-serif leading-relaxed whitespace-pre-line space-y-4">
                {activePassage.content}
              </div>
            )}
          </div>
        )}

        {/* RIGHT COLUMN: QUESTION & OPTIONS */}
        {!isLongConversationListeningPending && (
        <div className={`flex-1 flex flex-col w-full max-w-none ${questionColumnClass}`}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs flex-1 flex flex-col">
            {/* Question Header and Inline Navigation */}
            <div className="border-b border-slate-100 pb-4 mb-4 space-y-4">
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => handleNavigateQuestion(Math.max(0, currentQuestionIndex - 1))}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition disabled:opacity-35 disabled:cursor-not-allowed"
                  title="Previous question"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs shrink-0">
                    {currentQ.number}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
                    Question {currentQ.number} of 30
                  </span>
                </div>

                {isDemoTestComplete ? (
                  <button
                    type="button"
                    onClick={handleNextDemoAction}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition shadow-xs"
                  >
                    <span className="hidden sm:inline">Submit</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextDemoAction}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition shadow-xs"
                  >
                    <span className="hidden sm:inline">{isDemoSectionEnd ? "Next section" : "Next"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>

            {/* Audio Player for Listening Part A & Part B */}
            {currentQ.section === "LISTENING" && currentQ.audioScript && (
              <div className="mb-6">
                <AudioPlayer
                  key={currentQ.id}
                  id={currentQ.id}
                  audioUrl={null}
                  textToSpeak={currentQ.audioScript}
                  label={`Question ${currentQ.number} audio`}
                  disabled={!isPassageFinished}
                  disabledTooltip="Complete the conversation audio first."
                  autoPlay={hasCheckedAudio && isPassageFinished}
                  autoPlayDelayMs={2500}
                  allowReplay
                  playedAudioIds={playedAudioIds}
                  completedAudioIds={completedAudioIds}
                  onAudioPlayed={handleAudioPlayed}
                  onAudioCompleted={handleAudioCompleted}
                  currentlyPlayingId={currentlyPlayingAudioId}
                  onCurrentlyPlayingChange={setCurrentlyPlayingAudioId}
                />
              </div>
            )}

            {isListeningPassageLocked ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/80 border border-dashed border-amber-200 rounded-2xl text-center my-4 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Questions &amp; Answer Choices Locked
                </h4>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  Complete the <strong>{currentQ.partType === "PART_C" ? "Part C" : "Part B"} listening audio</strong> above to unlock the question and answer choices.
                </p>
              </div>
            ) : (
              <>
                {/* Question Text */}
                <div className="mb-6">
                  {currentQ.partType === "WRITTEN_EXPRESSION" ? (
                    <div>
                      <p className="text-[11.5px] font-semibold text-slate-500 mb-2">
                        Choose the underlined word or phrase that is grammatically incorrect:
                      </p>
                      <WrittenExpressionText text={currentQ.questionText} />
                    </div>
                  ) : (
                    <p className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                      {currentQ.questionText}
                    </p>
                  )}
                </div>

                {/* Options A, B, C, D */}
                <div className="space-y-3 flex-1" role="radiogroup" aria-label="Answer choices">
                  {(["A", "B", "C", "D"] as const).map((key) => {
                    const isSelected = answers[String(currentQ.number)] === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`Option ${key}: ${currentQ.options[key]}`}
                        onClick={() => handleSelectAnswer(currentQ.number, key)}
                        className={`w-full flex items-start text-left p-3.5 sm:p-4 rounded-xl border transition ${
                          isSelected
                            ? "bg-blue-50 border-blue-600 text-blue-900 shadow-xs ring-1 ring-blue-600"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mr-3 transition ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}>
                          {key}
                        </div>
                        <span className="text-xs sm:text-sm font-medium pt-0.5 leading-relaxed">
                          {currentQ.options[key]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
        )}

        {!isLongConversationListeningPending && (
          <aside className={`lg:row-start-1 lg:row-span-2 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs lg:sticky lg:top-24 ${sidebarColumnClass}`}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Questions
              </span>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                {currentSection === "LISTENING"
                  ? "Listening"
                  : currentSection === "STRUCTURE"
                  ? "Structure"
                  : "Reading"}
              </span>
            </div>
            <div className="grid grid-cols-6 lg:grid-cols-5 gap-1.5">
              {sectionQuestions.map((q) => {
                const qIndex = questions.findIndex((item) => item.number === q.number);
                const isAnswered = !!answers[String(q.number)];
                const isActive = qIndex === currentQuestionIndex;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleNavigateQuestion(qIndex)}
                    className={`h-8 rounded-lg font-bold text-[11px] flex items-center justify-center transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow-xs"
                        : isAnswered
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {q.number}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed mt-4">
              Practice mode: select a question number to review it.
            </p>
          </aside>
        )}
      </main>

    </div>
  );
}
