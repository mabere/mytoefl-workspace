"use client";

import React, { useEffect, useRef, useState } from "react";
import { Headphones, Volume2, VolumeX, CheckCircle2, ArrowRight } from "lucide-react";

interface SoundCheckModalProps {
  isOpen: boolean;
  onConfirm: () => void;
}

export const SoundCheckModal: React.FC<SoundCheckModalProps> = ({
  isOpen,
  onConfirm,
}) => {
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [hasTested, setHasTested] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const timersRef = useRef<number[]>([]);

  const stopSoundTest = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
    try {
      oscillatorRef.current?.stop();
    } catch {
      // The oscillator may already have completed.
    }
    oscillatorRef.current = null;
    void audioContextRef.current?.close();
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
      const AudioContextClass = window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();
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

  const handleVolumeChange = (nextVolume: number) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm" role="presentation">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="sound-check-title">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-inner">
          <Headphones className="h-8 w-8" />
        </div>

        <h2 id="sound-check-title" className="mb-2 text-xl font-bold text-slate-900">Audio Check</h2>
        <p className="mb-6 text-sm leading-relaxed text-slate-600">
          Before you begin <strong>Section 1: Listening Comprehension</strong>,
          make sure your headphones are connected and the audio is clear. Each
          recording can be played once.
        </p>

        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Headphone Test
            </span>
            {hasTested && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Tested
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={playSoundTest}
            disabled={isPlayingTest}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition ${
              isPlayingTest
                ? "animate-pulse bg-amber-500 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <Volume2 className="h-4 w-4" />
            <span>{isPlayingTest ? "Playing test sound..." : "Play test sound"}</span>
          </button>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute sound check" : "Mute sound check"}
              className="rounded-md p-1 text-slate-500 hover:text-slate-900"
            >
              {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(event) => handleVolumeChange(Number(event.target.value))}
              aria-label="Sound check volume"
              className="w-full accent-blue-600"
            />
            <span className="w-10 text-right text-[11px] font-semibold text-slate-500">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>
        </div>

        <div className="mb-6 space-y-1.5 rounded-lg border border-amber-200/80 bg-amber-50/70 p-3 text-left text-xs text-slate-500">
          <p className="font-semibold text-amber-900">Before you begin:</p>
          <p className="text-amber-800">• Set your device volume to a comfortable level.</p>
          <p className="text-amber-800">• Keep this browser tab active during the test.</p>
        </div>

        <button
          type="button"
          onClick={onConfirm}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-slate-800"
        >
          <span>I&apos;m Ready — Begin Section 1</span>
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};
