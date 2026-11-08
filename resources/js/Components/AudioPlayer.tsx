"use client";

import React, { useState, useEffect, useRef } from "react";
import { appUrl } from "@/lib/appUrl";
import {
  Volume2,
  VolumeX,
  Play,
  CheckCircle2,
  Radio,
  Lock,
  RotateCcw,
} from "lucide-react";
import { useExamStore } from "@/lib/examStore";
import { parseDialogueTurns, DialogueTurn } from "@/lib/audioDialogue";

interface AudioPlayerProps {
  id: string; // questionId or passageId
  audioUrl: string | null;
  textToSpeak?: string | null;
  label?: string;
  disabled?: boolean;
  disabledTooltip?: string;
  autoPlay?: boolean;
  autoPlayDelayMs?: number;
  allowReplay?: boolean;
  // Optional isolated state tracking for demo / custom exams
  playedAudioIds?: string[];
  completedAudioIds?: string[];
  onAudioPlayed?: (id: string) => void;
  onAudioCompleted?: (id: string) => void;
  currentlyPlayingId?: string | null;
  onCurrentlyPlayingChange?: (id: string | null) => void;
}

type VoiceSet = {
  maleVoice?: SpeechSynthesisVoice;
  femaleVoice?: SpeechSynthesisVoice;
  narratorVoice?: SpeechSynthesisVoice;
};

type SpeechPlaybackState = {
  playbackId: number;
  turns: DialogueTurn[];
  voiceSet: VoiceSet;
  index: number;
};

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  id,
  audioUrl,
  textToSpeak,
  label = "Audio",
  disabled = false,
  disabledTooltip,
  autoPlay = false,
  autoPlayDelayMs = 2500,
  allowReplay = false,
  playedAudioIds: propPlayedAudioIds,
  completedAudioIds: propCompletedAudioIds,
  onAudioPlayed,
  onAudioCompleted,
  currentlyPlayingId: propCurrentlyPlayingId,
  onCurrentlyPlayingChange,
}) => {
  const storePlayedAudioIds = useExamStore((state) => state.playedAudioIds);
  const storeCompletedAudioIds = useExamStore((state) => state.completedAudioIds);
  const storeCurrentlyPlayingId = useExamStore(
    (state) => state.currentlyPlayingId
  );
  const markAudioAsPlayedInStore = useExamStore(
    (state) => state.markAudioAsPlayed
  );
  const markAudioAsCompletedInStore = useExamStore(
    (state) => state.markAudioAsCompleted
  );
  const setCurrentlyPlayingAudioInStore = useExamStore(
    (state) => state.setCurrentlyPlayingAudio
  );

  const playedAudioIds = propPlayedAudioIds ?? storePlayedAudioIds;
  const completedAudioIds = propCompletedAudioIds ?? storeCompletedAudioIds;
  const currentlyPlayingId =
    propCurrentlyPlayingId !== undefined
      ? propCurrentlyPlayingId
      : storeCurrentlyPlayingId;

  const markAudioAsPlayed = (audioId: string) => {
    if (onAudioPlayed) onAudioPlayed(audioId);
    else markAudioAsPlayedInStore(audioId);
  };

  const markAudioAsCompleted = (audioId: string) => {
    if (onAudioCompleted) onAudioCompleted(audioId);
    else markAudioAsCompletedInStore(audioId);
  };

  const setCurrentlyPlayingAudio = React.useCallback(
    (audioId: string | null) => {
      if (onCurrentlyPlayingChange) onCurrentlyPlayingChange(audioId);
      else setCurrentlyPlayingAudioInStore(audioId);
    },
    [onCurrentlyPlayingChange, setCurrentlyPlayingAudioInStore]
  );

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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activePlaybackIdRef = useRef<number>(0);
  const autoPlayTimerRef = useRef<number | null>(null);
  const volumeRef = useRef(volume);
  const mutedRef = useRef(isMuted);
  const speechPlaybackRef = useRef<SpeechPlaybackState | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  volumeRef.current = volume;
  mutedRef.current = isMuted;

  // Stop speech and reset state when component unmounts or ID changes
  useEffect(() => {
    setIsPlaying(false);
    setProgress(isCompleted ? 100 : 0);
    setIsAutoPlayPending(false);

    return () => {
      // Invalidate current playback session immediately
      activePlaybackIdRef.current++;
      if (autoPlayTimerRef.current !== null) {
        window.clearTimeout(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      speechUtteranceRef.current = null;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
        audioRef.current = null;
      }
      setCurrentlyPlayingAudio(null);
    };
  }, [id, isCompleted, setCurrentlyPlayingAudio]);

  useEffect(() => {
    if (
      !autoPlay ||
      disabled ||
      isCompleted ||
      isStarted ||
      isPlaying ||
      isOtherPlaying
    ) {
      return;
    }

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
  }, [autoPlay, autoPlayDelayMs, disabled, isCompleted, isStarted, isPlaying, isOtherPlaying, id]);

  const finishAudio = (playbackId: number) => {
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
    if (
      disabled ||
      isOtherPlaying ||
      (!allowReplay && isAlreadyPlayed) ||
      isPlaying
    ) {
      return;
    }

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

    // If external audio URL exists, play via HTML5 Audio
    if (audioUrl) {
      // Parse optional timestamp fragment, e.g. /Toefl-test-3.mp3#t=35,52 or ?t=35,52
      let actualUrl = audioUrl;
      let startTime = 0;
      let endTime: number | null = null;

      const hashMatch = audioUrl.match(/[#?]t=([0-9.]+)(?:,([0-9.]+))?/i);
      if (hashMatch) {
        startTime = parseFloat(hashMatch[1]) || 0;
        if (hashMatch[2]) {
          endTime = parseFloat(hashMatch[2]);
        }
        // Use clean base URL for audio source to avoid browser cache/request issues
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
          // Safety timeout fallback in case seeked is delayed
          setTimeout(() => {
            if (!hasStarted && activePlaybackIdRef.current === playbackId) startPlayback();
          }, 350);
        } else {
          startPlayback();
        }
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
          setProgress(Math.min(100, (playedPortion / totalPortion) * 100));
        } else if (audio.duration) {
          setProgress((current / audio.duration) * 100);
        }
      };

      audio.onended = () => {
        if (activePlaybackIdRef.current === playbackId) {
          finishAudio(playbackId);
        }
      };

      audio.onerror = () => {
        startSpeechFallback();
      };

      // Ensure metadata/buffer is ready before seeking and playing
      if (audio.readyState >= 2) {
        prepareAndPlay();
      } else {
        const onCanPlay = () => {
          audio.removeEventListener("canplay", onCanPlay);
          prepareAndPlay();
        };
        audio.addEventListener("canplay", onCanPlay);
      }
    } else {
      playMultiSpeakerDialogue(playbackId);
    }
  };

  const playMultiSpeakerDialogue = async (playbackId: number) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    // Small buffer delay to allow speech cancellation to flush
    await new Promise((res) => setTimeout(res, 50));
    if (activePlaybackIdRef.current !== playbackId) return;

    const turns = parseDialogueTurns(textToSpeak ?? "");
    const voices = window.speechSynthesis.getVoices();

    // Voice selection matching
    const englishVoices = voices.filter((v) =>
      v.lang.toLowerCase().startsWith("en")
    );

    const femaleVoice =
      englishVoices.find(
        (v) =>
          v.name.toLowerCase().includes("female") ||
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("jenny") ||
          v.name.toLowerCase().includes("victoria")
      ) || englishVoices[1] || englishVoices[0];

    const maleVoice =
      englishVoices.find(
        (v) =>
          v.name.toLowerCase().includes("male") ||
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("guy") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("george")
      ) || englishVoices[0];

    const narratorVoice =
      englishVoices.find((v) => v.name.toLowerCase().includes("natural")) ||
      englishVoices[0];

    const totalTurns = turns.length;
    const voiceSet: VoiceSet = {
      maleVoice,
      femaleVoice,
      narratorVoice,
    };
    speechPlaybackRef.current = {
      playbackId,
      turns,
      voiceSet,
      index: 0,
    };

    for (let i = 0; i < totalTurns; i++) {
      if (activePlaybackIdRef.current !== playbackId) return;

      const turn = turns[i];
      speechPlaybackRef.current.index = i;

      // Update approximate progress
      setProgress(Math.round(((i) / totalTurns) * 100));

      await speakTurn(
        turn,
        voiceSet,
        playbackId
      );

      if (activePlaybackIdRef.current !== playbackId) return;

      // Realistic conversational pause between speakers
      const pauseDuration =
        turn.speaker === "narrator"
          ? 800
          : turn.speaker === "man" || turn.speaker === "woman"
          ? 500
          : 400;

      await new Promise((res) => setTimeout(res, pauseDuration));
      if (activePlaybackIdRef.current !== playbackId) return;
    }

    if (activePlaybackIdRef.current === playbackId) {
      finishAudio(playbackId);
    }
  };

  const speakTurn = (
    turn: DialogueTurn,
    voiceSet: VoiceSet,
    playbackId: number
  ): Promise<void> => {
    return new Promise((resolve) => {
      if (activePlaybackIdRef.current !== playbackId) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(turn.text);
      speechUtteranceRef.current = utterance;
      utterance.volume = mutedRef.current ? 0 : volumeRef.current;

      // Assign voice and pitch characteristics based on speaker role
      if (turn.speaker === "man" || turn.speaker === "student") {
        if (voiceSet.maleVoice) utterance.voice = voiceSet.maleVoice;
        utterance.pitch = 0.85; // Natural deeper male pitch
        utterance.rate = 0.95;
      } else if (turn.speaker === "woman" || turn.speaker === "advisor") {
        if (voiceSet.femaleVoice) utterance.voice = voiceSet.femaleVoice;
        utterance.pitch = 1.18; // Natural distinct female pitch
        utterance.rate = 0.96;
      } else if (turn.speaker === "professor") {
        if (voiceSet.maleVoice) utterance.voice = voiceSet.maleVoice;
        utterance.pitch = 0.92;
        utterance.rate = 0.93; // Deliberate lecture pace
      } else {
        // Narrator
        if (voiceSet.narratorVoice) utterance.voice = voiceSet.narratorVoice;
        utterance.pitch = 1.0;
        utterance.rate = 0.92; // Practice fallback narrator pace
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

  const handleVolumeChange = (newVolume: number) => {
    const nextMuted = newVolume === 0;
    setVolume(newVolume);
    setIsMuted(nextMuted);
    volumeRef.current = newVolume;
    mutedRef.current = nextMuted;
    if (audioRef.current) {
      audioRef.current.volume = nextMuted ? 0 : newVolume;
    } else {
      if (speechUtteranceRef.current) {
        speechUtteranceRef.current.volume = nextMuted ? 0 : newVolume;
      }
      if (isPlaying && typeof window !== "undefined" && window.speechSynthesis) {
        if (nextMuted) {
          window.speechSynthesis.pause();
        } else {
          // Pause/resume lets browsers re-read the utterance volume without
          // cancelling the turn and replaying it from the beginning.
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    mutedRef.current = nextMuted;
    if (audioRef.current) {
      audioRef.current.volume = nextMuted ? 0 : volume;
    } else {
      if (speechUtteranceRef.current) {
        speechUtteranceRef.current.volume = nextMuted ? 0 : volume;
      }
      if (isPlaying && typeof window !== "undefined" && window.speechSynthesis) {
        if (nextMuted) window.speechSynthesis.pause();
        else window.speechSynthesis.resume();
      }
    }
  };

  const canStartPlayback =
    !disabled &&
    !isOtherPlaying &&
    !isPlaying &&
    (!isCompleted || allowReplay);

  const statusLabel = disabled
    ? "Locked"
    : isPlaying
    ? "Playing"
    : isCompleted
    ? "Completed"
    : isOtherPlaying
    ? "Another audio is playing"
    : isInterrupted
    ? "Audio interrupted"
    : isAutoPlayPending
    ? "Starting soon"
    : "Ready";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-white shadow-lg">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handlePlay}
          disabled={!canStartPlayback}
          aria-label={`${statusLabel}: ${label}`}
          title={disabledTooltip || `${statusLabel}: ${label}`}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-950 ${
            disabled
              ? "cursor-not-allowed bg-slate-800 text-slate-500"
              : isCompleted && !allowReplay
              ? "cursor-not-allowed bg-emerald-950 text-emerald-400"
              : isPlaying
              ? "cursor-not-allowed bg-amber-400 text-slate-950"
              : "bg-blue-600 text-white hover:bg-blue-500 active:scale-95"
          }`}
        >
          {disabled ? (
            <Lock className="h-4 w-4" />
          ) : isCompleted && !allowReplay ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : isPlaying ? (
            <Radio className="h-5 w-5 animate-pulse" />
          ) : isInterrupted || (isCompleted && allowReplay) ? (
            <RotateCcw className="h-4 w-4" />
          ) : (
            <Play className="ml-0.5 h-5 w-5 fill-current" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{statusLabel}</p>
              {isAutoPlayPending && (
                <p className="text-[11px] text-slate-400">Select Play Audio to start now</p>
              )}
            </div>
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {allowReplay ? "Practice" : "One play"}
            </span>
          </div>

          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800"
            role="progressbar"
            aria-label={`${label} progress`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ease-linear ${
                isCompleted ? "bg-emerald-400" : "bg-blue-500"
              }`}
              style={{ width: `${Math.max(0, progress)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1.5">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            title={isMuted ? "Unmute" : "Mute"}
            className="rounded-md p-1 text-slate-400 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4 text-rose-400" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            aria-label="Audio volume"
            className="w-16 cursor-pointer accent-blue-500"
          />
        </div>
      </div>
    </div>
  );
};
