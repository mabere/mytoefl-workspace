"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import { appFetch as fetch } from "@/lib/appUrl";
import { useParams, useRouter } from "next/navigation";
import {
  Clock,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Grid,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  Volume2,
  VolumeX,
  Lock,
} from "lucide-react";
import { useExamStore } from "@/lib/examStore";
import { AudioPlayer } from "@/components/AudioPlayer";
import { WrittenExpressionText } from "@/components/WrittenExpressionText";
import { QuestionGridModal } from "@/components/QuestionGridModal";
import { SoundCheckModal } from "@/components/SoundCheckModal";
import { extractQuestionPrompt } from "@/lib/audioDialogue";

export default function ExamPage() {
  const { sessionId } = useParams();
  const router = useRouter();

  const {
    participantName,
    currentSectionType,
    sectionTitle,
    durationMinutes,
    timeRemaining,
    isTimeHidden,
    currentQuestionIndex,
    questions,
    passages,
    answers,
    playedAudioIds,
    completedAudioIds,
    violationCount,
    setExamData,
    setCurrentQuestionIndex,
    setAnswer,
    toggleMarkForReview,
    nextQuestion,
    prevQuestion,
    tickTimer,
    toggleTimeHidden,
    incrementViolation,
  } = useExamStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isGridOpen, setIsGridOpen] = useState(false);
  const [showSoundCheck, setShowSoundCheck] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [needsFullscreen, setNeedsFullscreen] = useState(false);
  const fullscreenCompletedRef = React.useRef(false);

  useEffect(() => {
    fullscreenCompletedRef.current = false;
  }, [sessionId]);

  // Continuous Streaming Audio state for Listening Section (Mode 3)
  const continuousAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isContinuousPlaying, setIsContinuousPlaying] = useState(false);
  const [isContinuousMuted, setIsContinuousMuted] = useState(false);
  const [continuousVolume, setContinuousVolume] = useState(1);

  const requestExamFullscreen = useCallback(async (): Promise<boolean> => {
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
    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (!active && !fullscreenCompletedRef.current && !isLoading) {
        setNeedsFullscreen(true);
        setWarningMessage("Fullscreen terhenti. Masuk fullscreen kembali untuk melanjutkan ujian.");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    if (!fullscreenCompletedRef.current) void requestExamFullscreen();
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [requestExamFullscreen, isLoading]);

  // 1. Fetch exam session data from API
  const fetchSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/exam/${sessionId}`);
      const data = await res.json();

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
        violationCount: data.violationCount,
      });

      // Show soundcheck only for Listening section if first time (at start of section)
      const storeState = useExamStore.getState();
      if (
        data.currentSectionType === "LISTENING" &&
        storeState.currentQuestionIndex === 0 &&
        storeState.playedAudioIds.length === 0
      ) {
        setShowSoundCheck(true);
      }
    } catch (err) {
      console.error("Failed to load exam session:", err);
      setWarningMessage("Sesi ujian gagal dimuat. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }, [exitExamFullscreen, sessionId, router, setExamData]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // 2. Timer countdown
  useEffect(() => {
    if (isLoading || showSoundCheck) return;

    const interval = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading, showSoundCheck, tickTimer]);

  // Handle timeout auto-transition
  useEffect(() => {
    if (!isLoading && timeRemaining === 0) {
      if (currentSectionType === "LISTENING") {
        handleTransitionSection("STRUCTURE");
      } else if (currentSectionType === "STRUCTURE") {
        handleTransitionSection("READING");
      } else if (currentSectionType === "READING") {
        handleFinalSubmit();
      }
    }
  }, [timeRemaining, currentSectionType, isLoading]);

  // Derived question and listening audio state
  const currentQ = questions[currentQuestionIndex];
  const currentPassage = currentQ?.passageId
    ? passages.find((p) => p.id === currentQ.passageId)
    : null;
  const currentAns = currentQ ? answers[currentQ.id] : null;

  const isListening = currentSectionType === "LISTENING";
  const hasPassage = Boolean(currentPassage);
  const isPassageFinished =
    !hasPassage ||
    !isListening ||
    completedAudioIds.includes(currentPassage!.id);
  const isLongConversationListening =
    isListening &&
    (currentQ?.partType === "PART_B" || currentQ?.partType === "PART_C") &&
    Boolean(currentPassage);
  const isLongConversationListeningPending =
    isLongConversationListening && !isPassageFinished;
  const isQuestionAudioStarted = currentQ
    ? playedAudioIds.includes(currentQ.id) || completedAudioIds.includes(currentQ.id)
    : false;
  const isQuestionAudioFinished = currentQ
    ? completedAudioIds.includes(currentQ.id)
    : false;

  const isAnsweringAllowed = !isListening || (isPassageFinished && isQuestionAudioStarted);
  const canProceedToNext = !isListening || isQuestionAudioFinished;

  // 3. Anti-cheat listeners: Tab switch & blur detection + Server recording
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        incrementViolation();
        const nextCount = violationCount + 1;
        setWarningMessage(
          `⚠️ Integrity warning (${nextCount}/5): You left the test tab or window. This activity has been recorded.`
        );

        try {
          await fetch("/api/exam/violation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              reason: "Tab switch or window blur detected",
            }),
          });
        } catch (e) {
          console.error("Failed to sync violation to server:", e);
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Shortcut prevention (F12, Ctrl+U, Ctrl+C, Ctrl+V, Ctrl+P, Ctrl+S, Alt+Tab, Win keys)
      if (
        e.key === "F12" ||
        (e.ctrlKey && ["u", "c", "v", "p", "s", "a"].includes(e.key.toLowerCase())) ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        return;
      }

      // Hotkey option answers: A, B, C, D
      if (!e.ctrlKey && !e.altKey && !e.metaKey) {
        const key = e.key.toUpperCase();
        if (["A", "B", "C", "D"].includes(key) && questions[currentQuestionIndex]) {
          if (isAnsweringAllowed) {
            handleSelectAnswer(questions[currentQuestionIndex].id, key);
          }
        }
      }
    };

    // Listen for reconnection to flush offline saved answers
    const handleOnline = async () => {
      try {
        const offlineQueueKey = `toefl_offline_answers_${sessionId}`;
        const rawQueue = localStorage.getItem(offlineQueueKey);
        if (rawQueue) {
          const queue = JSON.parse(rawQueue);
          for (const item of queue) {
            const response = await fetch("/api/exam/answer", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item),
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
    if (navigator.onLine) void handleOnline();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("online", handleOnline);
    };
  }, [currentQuestionIndex, questions, incrementViolation, isAnsweringAllowed, violationCount, sessionId]);

  // 4. Save answer handler with offline localStorage resilience
  const handleSelectAnswer = async (questionId: string, choice: string) => {
    if (isListening && !isAnsweringAllowed) {
      if (!isPassageFinished) {
        setWarningMessage("Complete the conversation audio before selecting an answer.");
      } else if (!isQuestionAudioStarted) {
        setWarningMessage("Play the question audio before selecting an answer.");
      }
      return;
    }

    setAnswer(questionId, choice);

    const payload = {
      sessionId,
      questionId,
      selectedAnswer: choice,
    };

    try {
      const res = await fetch("/api/exam/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Server responded with non-200");
      }
    } catch (err) {
      console.warn("Autosave failed, caching answer to localStorage:", err);
      // Store in offline fallback queue
      try {
        const offlineQueueKey = `toefl_offline_answers_${sessionId}`;
        const existing = JSON.parse(localStorage.getItem(offlineQueueKey) || "[]");
        const filtered = existing.filter((item: any) => item.questionId !== questionId);
        filtered.push(payload);
        localStorage.setItem(offlineQueueKey, JSON.stringify(filtered));
      } catch (e) {
        console.error("LocalStorage save error:", e);
      }
    }
  };

  const handleToggleReview = async (questionId: string) => {
    toggleMarkForReview(questionId);
    const updatedReviewState = !answers[questionId]?.isMarkedForReview;

    const payload = {
      sessionId,
      questionId,
      isMarkedForReview: updatedReviewState,
    };

    try {
      const res = await fetch("/api/exam/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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


  // 5. Section Transition (Lockdown)
  const handleTransitionSection = async (nextSection: string) => {
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/exam/transition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          nextSection,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowTransitionModal(false);
        // Refresh session to load the new section's questions
        await fetchSession();
      } else {
        setWarningMessage(data.error || "Section berikutnya belum dapat dibuka.");
      }
    } catch (err) {
      console.error("Transition error:", err);
      setWarningMessage("Koneksi terganggu saat berpindah section. Jawaban tersimpan, silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. Final Exam Submit
  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      const queueKey = `toefl_offline_answers_${sessionId}`;
      const queued = JSON.parse(localStorage.getItem(queueKey) || "[]");
      for (const item of queued) {
        const syncResponse = await fetch("/api/exam/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
        if (!syncResponse.ok) throw new Error(`Pending answer sync failed (${syncResponse.status})`);
      }
      if (queued.length) localStorage.removeItem(queueKey);
      const res = await fetch("/api/exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();
      if (data.success) {
        await exitExamFullscreen(true);
        router.push(`/result/${sessionId}`);
      } else {
        setWarningMessage(data.error || "Ujian belum dapat dikirim. Periksa koneksi lalu coba lagi.");
      }
    } catch (err) {
      console.error("Final submit error:", err);
      setWarningMessage("Koneksi terganggu saat mengirim ujian. Jawaban tetap disimpan dan dapat dikirim ulang.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      void requestExamFullscreen();
    } else {
      void exitExamFullscreen();
    }
  };

  const handleSoundCheckConfirm = async () => {
    await requestExamFullscreen();
    setShowSoundCheck(false);
  };

  // Format time MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder
      .toString()
      .padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-700 font-semibold">
          Loading your TOEFL ITP test...
        </p>
      </div>
    );
  }

  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isTimeCritical = timeRemaining < 300; // less than 5 minutes

  const handleNextExamAction = () => {
    if (!canProceedToNext) {
      setWarningMessage(
        !isLastQuestion
          ? "Wait for the question audio to finish before moving to the next question."
          : "Wait for the question audio to finish before completing this section."
      );
      return;
    }

    if (!isLastQuestion) {
      nextQuestion();
    } else if (currentSectionType !== "READING") {
      setShowTransitionModal(true);
    } else {
      setShowSubmitModal(true);
    }
  };

  const nextExamActionLabel = !isLastQuestion
    ? "Next"
    : currentSectionType !== "READING"
    ? "Complete Section"
    : "Submit Test";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 font-sans select-none">
      {/* Sound Check Modal before Section 1 starts */}
      <SoundCheckModal
        isOpen={showSoundCheck}
        onConfirm={handleSoundCheckConfirm}
      />

      {!showSoundCheck && needsFullscreen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-7 text-center text-white shadow-2xl">
            <Maximize className="mx-auto mb-4 h-10 w-10 text-blue-400" />
            <h2 className="mb-2 text-xl font-bold">Masuk Fullscreen untuk Ujian</h2>
            <p className="mb-6 text-sm leading-relaxed text-slate-300">
              Mode fullscreen membantu menjaga tampilan ujian tetap fokus. Tekan tombol di bawah jika browser belum mengaktifkannya otomatis.
            </p>
            <button
              type="button"
              onClick={() => void requestExamFullscreen()}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 font-bold transition hover:bg-blue-500"
            >
              Masuk Fullscreen
            </button>
          </div>
        </div>
      )}

      {/* Question Palette Navigation Modal */}
      {!isListening && (
        <QuestionGridModal
          isOpen={isGridOpen}
          onClose={() => setIsGridOpen(false)}
        />
      )}

      {/* Integrity Violation Toast Alert */}
      {warningMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 animate-in slide-in-from-top-4 duration-200">
          <div className="bg-rose-600 text-white p-4 rounded-xl shadow-2xl flex items-start justify-between gap-3 border border-rose-700">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm font-medium leading-tight">
                {warningMessage}
              </p>
            </div>
            <button
              onClick={() => setWarningMessage(null)}
              className="text-white/80 hover:text-white text-xs font-bold px-2 py-1 bg-rose-700 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* TOP HEADER (TOEFL ITP-style practice layout) */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white font-extrabold text-xs px-2.5 py-1 rounded tracking-widest shadow-inner">
              TOEFL ITP®
            </div>
            <div className="border-l border-slate-700 pl-3">
              <h1 className="text-sm sm:text-base font-bold text-slate-100 leading-tight">
                {sectionTitle}
              </h1>
              <p className="text-[11px] text-slate-400">
                Participant: <span className="text-slate-200 font-medium">{participantName}</span>
              </p>
            </div>
          </div>

          {/* TIMER & CONTROLS */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm sm:text-base transition-colors ${
                isTimeCritical
                  ? "bg-rose-950/70 border-rose-500 text-rose-300 animate-pulse"
                  : "bg-slate-800 border-slate-700 text-slate-100"
              }`}
            >
              <Clock className="w-4 h-4 text-blue-400" />
              <span>{isTimeHidden ? "--:--" : formatTime(timeRemaining)}</span>
            </div>

            <button
              onClick={toggleTimeHidden}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition flex items-center gap-1.5"
              title={isTimeHidden ? "Show time" : "Hide time"}
            >
              {isTimeHidden ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Show Time</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Hide Time</span>
                </>
              )}
            </button>

            <button
              onClick={toggleFullscreen}
              className="text-xs p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
              title="Full Screen"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN TEST CONTAINER */}
      <main
        className={`flex-1 ${currentSectionType === "READING" ? "max-w-[1600px]" : "max-w-7xl"} w-full mx-auto p-4 sm:p-6 flex flex-col`}
      >
        {!currentQ ? (
          <div className="bg-white p-8 rounded-2xl text-center shadow-sm">
            <p className="text-slate-600">No questions are available for this section.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Split screen for Section 3 (Reading Comprehension) */}
            {currentSectionType === "READING" && currentPassage ? (
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_220px] gap-6 flex-1 items-start">
                {/* Left: Reading Passage with Line Numbers */}
                <div className="lg:col-start-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
                  <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md">
                      Reading Passage
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mb-3">
                    {currentPassage.title}
                  </h2>
                  <div className="text-sm leading-relaxed text-slate-800 font-serif whitespace-pre-line space-y-4">
                    {currentPassage.content}
                  </div>
                </div>

                {/* Right: Question & Choices */}
                <div className="lg:col-start-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                      <button
                        onClick={prevQuestion}
                        disabled={currentQuestionIndex === 0}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-semibold text-xs transition shrink-0 ${
                          currentQuestionIndex === 0
                            ? "text-slate-300 cursor-not-allowed"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95"
                        }`}
                        title="Previous question"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden xl:inline">Previous</span>
                      </button>

                      <span className="text-sm font-bold text-slate-900 min-w-0 flex-1 truncate">
                        Question {currentQ.questionNumber} of {questions.length}
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setIsGridOpen(true)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition"
                          title="Open question numbers"
                        >
                          <Grid className="w-4 h-4" />
                          <span className="hidden xl:inline">Questions</span>
                        </button>
                        <button
                          onClick={handleNextExamAction}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition"
                        >
                          <span className="hidden xl:inline">{nextExamActionLabel}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end mb-4">
                      <button
                        onClick={() => handleToggleReview(currentQ.id)}
                        className={`text-xs font-semibold px-3 py-1 rounded-lg border transition flex items-center gap-1.5 ${
                          currentAns?.isMarkedForReview
                            ? "bg-amber-100 border-amber-300 text-amber-900"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>
                          {currentAns?.isMarkedForReview ? "Marked for review" : "Mark for review"}
                        </span>
                      </button>
                    </div>

                    <h3 className="text-base font-semibold text-slate-900 mb-6 leading-normal">
                      {currentQ.questionText}
                    </h3>

                    {/* Options A, B, C, D */}
                    <div className="space-y-3">
                      {[
                        { letter: "A", text: currentQ.optionA },
                        { letter: "B", text: currentQ.optionB },
                        { letter: "C", text: currentQ.optionC },
                        { letter: "D", text: currentQ.optionD },
                      ].map((opt) => {
                        const isSelected =
                          currentAns?.selectedAnswer === opt.letter;
                        return (
                          <button
                            key={opt.letter}
                            onClick={() => handleSelectAnswer(currentQ.id, opt.letter)}
                            className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 group ${
                              isSelected
                                ? "bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 shadow-xs"
                                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition ${
                                isSelected
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                              }`}
                            >
                              {opt.letter}
                            </span>
                            <span
                              className={`text-sm leading-relaxed ${
                                isSelected
                                  ? "font-semibold text-blue-950"
                                  : "text-slate-700"
                              }`}
                            >
                              {opt.text}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <aside className="lg:col-start-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm lg:sticky lg:top-24">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Questions
                    </span>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                      Reading
                    </span>
                  </div>
                  <div className="grid grid-cols-6 lg:grid-cols-5 gap-1.5">
                    {questions.map((question) => {
                      const isCurrent = question.id === currentQ.id;
                      const isAnswered = Boolean(answers[question.id]?.selectedAnswer);
                      const questionIndex = questions.findIndex((item) => item.id === question.id);

                      return (
                        <button
                          key={question.id}
                          type="button"
                          onClick={() => setCurrentQuestionIndex(questionIndex)}
                          className={`h-8 rounded-lg font-bold text-[11px] flex items-center justify-center transition ${
                            isCurrent
                              ? "bg-blue-600 text-white shadow-xs"
                              : isAnswered
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {question.questionNumber}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed mt-4">
                    Select a question number to review or change your answer.
                  </p>
                </aside>
              </div>
            ) : (
              /* Single column view for Section 1 (Listening) and Section 2 (Structure) */
              <div
                className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_250px] gap-6 w-full items-start"
              >
                <div
                  className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 w-full max-w-none lg:col-start-1 ${
                    isLongConversationListeningPending ? "lg:col-span-2" : ""
                  }`}
                >
                {isLongConversationListeningPending ? (
                  <div className="min-h-[320px] flex flex-col items-center justify-center text-center gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                      Listening {currentQ.partType === "PART_C" ? "Part C" : "Part B"} · Long Conversation
                    </span>
                    <h2 className="text-xl font-bold text-slate-900">
                      Listen to the complete conversation
                    </h2>
                    {currentPassage && (currentPassage.audioUrl || currentPassage.content) && (
                      <div className="w-full max-w-3xl">
                        <AudioPlayer
                          key={currentPassage.id}
                          id={currentPassage.id}
                          audioUrl={currentPassage.audioUrl}
                          textToSpeak={currentPassage.content || undefined}
                          label="Long conversation audio"
                          autoPlay={isListening && !showSoundCheck}
                          autoPlayDelayMs={2500}
                        />
                      </div>
                    )}
                    <p className="text-sm text-slate-500 max-w-md leading-relaxed">
                      The question and answer choices will appear after the audio ends.
                    </p>
                  </div>
                ) : (
                  <>
                <div className="mb-6 border-b border-slate-100 pb-4 space-y-3">
                  <div className="flex items-center gap-2">
                    {!isListening ? (
                      <button
                        onClick={prevQuestion}
                        disabled={currentQuestionIndex === 0}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-semibold text-xs transition shrink-0 ${
                          currentQuestionIndex === 0
                            ? "text-slate-300 cursor-not-allowed"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95"
                        }`}
                        title="Previous question"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Previous</span>
                      </button>
                    ) : (
                      <div className="w-9 shrink-0" aria-hidden="true" />
                    )}

                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-base font-bold text-slate-900 truncate">
                        Question {currentQ.questionNumber}
                      </span>
                      <span className="text-xs text-slate-400 font-medium whitespace-nowrap hidden sm:inline">
                        of {questions.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isListening && (
                        <button
                          onClick={() => setIsGridOpen(true)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition"
                          title="Open question numbers"
                        >
                          <Grid className="w-4 h-4" />
                          <span className="hidden sm:inline">Questions</span>
                        </button>
                      )}
                      <button
                        onClick={handleNextExamAction}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-white rounded-xl font-bold text-xs transition ${
                          isLastQuestion && currentSectionType === "READING"
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "bg-slate-900 hover:bg-slate-800"
                        }`}
                        title={nextExamActionLabel}
                      >
                        <span className="hidden sm:inline">{nextExamActionLabel}</span>
                        {isLastQuestion && currentSectionType === "READING" ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleToggleReview(currentQ.id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
                        currentAns?.isMarkedForReview
                          ? "bg-amber-100 border-amber-300 text-amber-900 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>
                        {currentAns?.isMarkedForReview ? "Marked for review" : "Mark for review"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Section 1: Listening Audio Engine */}
                {currentSectionType === "LISTENING" && (
                  <div className="mb-6 space-y-4">
                    {currentPassage && !isLongConversationListening && (
                      <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl">
                        <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block mb-1">
                          {currentPassage.title}
                        </span>
                        {(currentPassage.audioUrl || currentPassage.content) && (
                          <div className="my-2">
                            <AudioPlayer
                              key={currentPassage.id}
                              id={currentPassage.id}
                              audioUrl={currentPassage.audioUrl}
                              textToSpeak={currentPassage.content || undefined}
                              label="Conversation or lecture audio"
                              autoPlay={isListening && !showSoundCheck}
                              autoPlayDelayMs={2500}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    <AudioPlayer
                      key={currentQ.id}
                      id={currentQ.id}
                      audioUrl={currentQ.audioUrl}
                      textToSpeak={currentQ.questionText}
                      label={`Question ${currentQ.questionNumber} audio`}
                      disabled={!isPassageFinished}
                      disabledTooltip="Complete the conversation audio first."
                      autoPlay={isListening && !showSoundCheck && isPassageFinished}
                      autoPlayDelayMs={2500}
                    />
                  </div>
                )}

                {/* Section 2 Part 2: Written Expression (Underlined words) */}
                {currentSectionType === "STRUCTURE" &&
                currentQ.partType === "WRITTEN_EXPRESSION" &&
                currentQ.questionText ? (
                  <div className="mb-8">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Choose the underlined word or phrase that is grammatically incorrect:
                    </p>
                    <WrittenExpressionText text={currentQ.questionText} />
                  </div>
                ) : (
                  /* Standard Question Text (Completely hidden in Listening, shown in Structure) */
                  <div className="mb-6">
                    {currentSectionType === "LISTENING" ? (
                      <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 shadow-2xs">
                        <span className="text-xs font-bold uppercase tracking-wider">
                          {currentQ.partType === "PART_A"
                            ? "Listening Part A • Short Conversation"
                            : currentQ.partType === "PART_B"
                            ? "Listening Part B • Longer Conversation"
                            : "Listening Part C • Academic Talk"}
                        </span>
                        <span className="text-xs text-blue-700 font-medium">
                          Listen carefully and choose the best answer.
                        </span>
                      </div>
                    ) : (
                      <h2 className="text-lg font-serif leading-relaxed text-slate-900 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                        {currentQ.questionText}
                      </h2>
                    )}
                  </div>
                )}

                {/* Options A, B, C, D */}
                <div className="space-y-3" role="radiogroup" aria-label="Answer choices">
                  {isListening && !isAnsweringAllowed && (
                    <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold shadow-2xs animate-in fade-in duration-200">
                      <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        {!isPassageFinished
                          ? "Complete the conversation audio to unlock the answer choices."
                          : "Play the question audio to unlock the answer choices."}
                      </span>
                    </div>
                  )}

                  {[
                    { letter: "A", text: currentQ.optionA },
                    { letter: "B", text: currentQ.optionB },
                    { letter: "C", text: currentQ.optionC },
                    { letter: "D", text: currentQ.optionD },
                  ].map((opt) => {
                    const isSelected = currentAns?.selectedAnswer === opt.letter;
                    return (
                      <button
                        key={opt.letter}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`Option ${opt.letter}: ${opt.text}`}
                        disabled={!isAnsweringAllowed}
                        onClick={() => handleSelectAnswer(currentQ.id, opt.letter)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 group ${
                          !isAnsweringAllowed
                            ? "opacity-50 cursor-not-allowed bg-slate-50 border-slate-200"
                            : isSelected
                            ? "bg-blue-50/90 border-blue-600 ring-2 ring-blue-500/20 shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
                          }`}
                        >
                          {opt.letter}
                        </span>
                        <span
                          className={`text-sm sm:text-base leading-relaxed pt-0.5 ${
                            isSelected ? "font-semibold text-blue-950" : "text-slate-800"
                          }`}
                        >
                          {opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
                  </>
                )}
              </div>

              {!isLongConversationListeningPending && (
                <aside className="lg:col-start-2 lg:row-start-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm lg:sticky lg:top-24">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Questions
                    </span>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                      {currentSectionType === "LISTENING" ? "Listening" : "Structure"}
                    </span>
                  </div>
                  <div className="grid grid-cols-6 lg:grid-cols-5 gap-1.5">
                    {questions.map((question) => {
                      const isCurrent = question.id === currentQ.id;
                      const isCompleted = Boolean(answers[question.id]?.selectedAnswer);

                      if (isListening) {
                        return (
                          <div
                            key={question.id}
                            aria-current={isCurrent ? "step" : undefined}
                            className={`h-8 rounded-lg font-bold text-[11px] flex items-center justify-center border ${
                              isCurrent
                                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                : isCompleted
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-500 border-slate-200"
                            }`}
                          >
                            {question.questionNumber}
                          </div>
                        );
                      }

                      return (
                        <button
                          key={question.id}
                          type="button"
                          onClick={() =>
                            setCurrentQuestionIndex(
                              questions.findIndex((item) => item.id === question.id)
                            )
                          }
                          className={`h-8 rounded-lg font-bold text-[11px] flex items-center justify-center transition ${
                            isCurrent
                              ? "bg-blue-600 text-white shadow-xs"
                              : isCompleted
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {question.questionNumber}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed mt-4">
                    {isListening
                      ? "Listening questions follow a fixed sequence. Question numbers cannot be selected."
                      : "Select a question number to review or change your answer."}
                  </p>
                </aside>
              )}
            </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL: SECTION TRANSITION CONFIRMATION (LOCKDOWN) */}
      {showTransitionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" role="presentation">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center" role="dialog" aria-modal="true" aria-labelledby="transition-modal-title">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 id="transition-modal-title" className="text-lg font-bold text-slate-900 mb-2">
              Complete {sectionTitle}?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
              Once you continue, <strong>you cannot return to this section</strong>
              or change your answers.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTransitionModal(false)}
                className="flex-1 py-2.5 px-4 border border-slate-300 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
              >
                Cancel, Review Answers
              </button>
              <button
                onClick={() =>
                  handleTransitionSection(
                    currentSectionType === "LISTENING" ? "STRUCTURE" : "READING"
                  )
                }
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow transition disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FINAL SUBMIT CONFIRMATION */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" role="presentation">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center" role="dialog" aria-modal="true" aria-labelledby="submit-modal-title">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 id="submit-modal-title" className="text-lg font-bold text-slate-900 mb-2">
              Submit Test?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
              You have completed the final section. Your answers will be scored
              using the configured practice-test conversion table.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 px-4 border border-slate-300 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
              >
                Review Answers
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow transition disabled:opacity-50"
              >
                {isSubmitting ? "Scoring..." : "Submit & View Results"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
