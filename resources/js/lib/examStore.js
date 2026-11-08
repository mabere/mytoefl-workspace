import { create } from 'zustand';

const progressKey = (sessionId, sectionType) => `toefl_exam_progress_${sessionId}_${sectionType}`;

const readProgress = (sessionId, sectionType) => {
    if (typeof window === 'undefined' || !sessionId || !sectionType) return {};

    try {
        const value = window.localStorage.getItem(progressKey(sessionId, sectionType));
        const parsed = value ? JSON.parse(value) : {};
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
};

const writeProgress = (sessionId, sectionType, patch) => {
    if (typeof window === 'undefined' || !sessionId || !sectionType) return;

    try {
        const existing = readProgress(sessionId, sectionType);
        window.localStorage.setItem(
            progressKey(sessionId, sectionType),
            JSON.stringify({ ...existing, ...patch }),
        );
    } catch {
        // Browser storage may be unavailable in private or restricted modes.
    }
};

const clearProgress = (sessionId) => {
    if (typeof window === 'undefined' || !sessionId) return;

    for (const sectionType of ['LISTENING', 'STRUCTURE', 'READING']) {
        try {
            window.localStorage.removeItem(progressKey(sessionId, sectionType));
        } catch {
            // Ignore storage cleanup failures.
        }
    }
};

export const useExamStore = create((set, get) => ({
    sessionId: null,
    participantName: '',
    currentSectionType: 'LISTENING',
    sectionTitle: 'Section 1: Listening Comprehension',
    durationMinutes: 35,
    timeRemaining: 35 * 60,
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
        const questions = data.questions || [];
        const savedProgress = isNewSection ? readProgress(data.sessionId, data.currentSectionType) : {};
        const savedIndex = Number.isInteger(savedProgress.currentQuestionIndex)
            ? savedProgress.currentQuestionIndex
            : 0;
        const restoredIndex = isNewSection
            ? Math.min(Math.max(savedIndex, 0), Math.max(questions.length - 1, 0))
            : Math.min(Math.max(current.currentQuestionIndex, 0), Math.max(questions.length - 1, 0));

        set({
            sessionId: data.sessionId,
            participantName: data.participantName,
            currentSectionType: data.currentSectionType,
            sectionTitle: data.sectionTitle,
            durationMinutes: data.durationMinutes,
            timeRemaining: isNewSection ? (data.timeRemainingSeconds ?? data.durationMinutes * 60) : (data.timeRemainingSeconds ?? current.timeRemaining),
            currentQuestionIndex: restoredIndex,
            questions,
            passages: data.passages,
            answers: isNewSession ? data.savedAnswers : { ...data.savedAnswers, ...current.answers },
            playedAudioIds: isNewSection ? (Array.isArray(savedProgress.playedAudioIds) ? savedProgress.playedAudioIds : []) : current.playedAudioIds,
            completedAudioIds: isNewSection ? (Array.isArray(savedProgress.completedAudioIds) ? savedProgress.completedAudioIds : []) : current.completedAudioIds,
            currentlyPlayingId: null,
            violationCount: data.violationCount ?? (isNewSession ? 0 : current.violationCount),
        });

        writeProgress(data.sessionId, data.currentSectionType, {
            currentQuestionIndex: restoredIndex,
            playedAudioIds: isNewSection ? (Array.isArray(savedProgress.playedAudioIds) ? savedProgress.playedAudioIds : []) : current.playedAudioIds,
            completedAudioIds: isNewSection ? (Array.isArray(savedProgress.completedAudioIds) ? savedProgress.completedAudioIds : []) : current.completedAudioIds,
        });
    },
    setAnswer: (questionId, answer) => {
        const existing = get().answers[questionId] || { selectedAnswer: null, isMarkedForReview: false };
        set({ answers: { ...get().answers, [questionId]: { ...existing, selectedAnswer: answer } } });
    },
    toggleMarkForReview: (questionId) => {
        const existing = get().answers[questionId] || { selectedAnswer: null, isMarkedForReview: false };
        set({ answers: { ...get().answers, [questionId]: { ...existing, isMarkedForReview: !existing.isMarkedForReview } } });
    },
    setCurrentQuestionIndex: (index) => {
        const current = get();
        if (index < 0 || index >= current.questions.length) return;
        set({ currentQuestionIndex: index });
        writeProgress(current.sessionId, current.currentSectionType, { currentQuestionIndex: index });
    },
    nextQuestion: () => {
        const current = get();
        if (current.currentQuestionIndex < current.questions.length - 1) {
            current.setCurrentQuestionIndex(current.currentQuestionIndex + 1);
        }
    },
    prevQuestion: () => {
        const current = get();
        if (current.currentQuestionIndex > 0) {
            current.setCurrentQuestionIndex(current.currentQuestionIndex - 1);
        }
    },
    tickTimer: () => get().timeRemaining > 0 && set({ timeRemaining: get().timeRemaining - 1 }),
    toggleTimeHidden: () => set({ isTimeHidden: !get().isTimeHidden }),
    markAudioAsPlayed: (id) => {
        const current = get();
        if (current.playedAudioIds.includes(id)) return;
        const playedAudioIds = [...current.playedAudioIds, id];
        set({ playedAudioIds });
        writeProgress(current.sessionId, current.currentSectionType, { playedAudioIds });
    },
    markAudioAsCompleted: (id) => {
        const current = get();
        if (current.completedAudioIds.includes(id)) return;
        const completedAudioIds = [...current.completedAudioIds, id];
        set({ completedAudioIds });
        writeProgress(current.sessionId, current.currentSectionType, { completedAudioIds });
    },
    setCurrentlyPlayingAudio: (id) => set({ currentlyPlayingId: id }),
    incrementViolation: () => set({ violationCount: get().violationCount + 1 }),
    resetExam: () => {
        clearProgress(get().sessionId);
        set({ sessionId: null, participantName: '', currentSectionType: 'LISTENING', questions: [], passages: [], answers: {}, playedAudioIds: [], completedAudioIds: [], currentlyPlayingId: null, currentQuestionIndex: 0, timeRemaining: 0, violationCount: 0 });
    },
}));
