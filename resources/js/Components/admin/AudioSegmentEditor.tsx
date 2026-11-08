"use client";

import React, { useState, useRef, useEffect } from "react";
import { appUrl } from "@/lib/appUrl";
import { Play, Square, Volume2, Upload, Scissors, Clock, RotateCcw } from "lucide-react";

interface AudioSegmentEditorProps {
  audioUrl: string | null;
  onChange: (newUrl: string) => void;
  defaultBaseUrl?: string;
  label?: string;
  onUpload?: (file: File) => void;
  isUploading?: boolean;
}

// Helper: parse seconds to MM:SS.ss
function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00.0";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toFixed(1).padStart(4, "0")}`;
}

export const AudioSegmentEditor: React.FC<AudioSegmentEditorProps> = ({
  audioUrl,
  onChange,
  defaultBaseUrl = "/Toefl-test-3.mp3",
  label = "Audio & Segmentasi Waktu (Timestamp)",
  onUpload,
  isUploading = false,
}) => {
  // Parse incoming audioUrl: e.g. "/Toefl-test-3.mp3#t=35.5,52.0"
  const parseUrl = (raw: string | null) => {
    if (!raw) return { base: defaultBaseUrl, start: 0, end: 0, hasSegment: false };
    const hashIndex = raw.indexOf("#t=");
    if (hashIndex !== -1) {
      const base = raw.substring(0, hashIndex);
      const timePart = raw.substring(hashIndex + 3);
      const [s, e] = timePart.split(",");
      const startSec = parseFloat(s) || 0;
      const endSec = parseFloat(e) || 0;
      return { base: base || defaultBaseUrl, start: startSec, end: endSec, hasSegment: true };
    }
    return { base: raw, start: 0, end: 0, hasSegment: false };
  };

  const initial = parseUrl(audioUrl);
  const [baseUrl, setBaseUrl] = useState(initial.base);
  const [startTime, setStartTime] = useState<number>(initial.start);
  const [endTime, setEndTime] = useState<number>(initial.end);
  const [isSegmentMode, setIsSegmentMode] = useState<boolean>(initial.hasSegment || !!audioUrl);

  // Audio preview playback state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Sync internal state if audioUrl prop changes externally
  useEffect(() => {
    const parsed = parseUrl(audioUrl);
    setBaseUrl(parsed.base);
    setStartTime(parsed.start);
    setEndTime(parsed.end);
    if (parsed.hasSegment) {
      setIsSegmentMode(true);
    }
  }, [audioUrl]);

  // Emit change to parent
  const emitChange = (base: string, start: number, end: number, segMode: boolean) => {
    if (!base) {
      onChange("");
      return;
    }
    if (segMode && (start > 0 || end > 0)) {
      const validEnd = end > start ? end : start + 5;
      onChange(`${base}#t=${start.toFixed(2)},${validEnd.toFixed(2)}`);
    } else {
      onChange(base);
    }
  };

  const handleStartChange = (valSec: number) => {
    const safeVal = Math.max(0, parseFloat(valSec.toFixed(2)));
    setStartTime(safeVal);
    emitChange(baseUrl, safeVal, endTime, isSegmentMode);
  };

  const handleEndChange = (valSec: number) => {
    const safeVal = Math.max(0, parseFloat(valSec.toFixed(2)));
    setEndTime(safeVal);
    emitChange(baseUrl, startTime, safeVal, isSegmentMode);
  };

  const nudgeStart = (delta: number) => {
    handleStartChange(Math.max(0, startTime + delta));
  };

  const nudgeEnd = (delta: number) => {
    handleEndChange(Math.max(0, endTime + delta));
  };

  // Play preview of the segment
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

    // If segment mode is on and we reached endTime, stop preview
    if (isSegmentMode && endTime > startTime && cur >= endTime) {
      audioRef.current.pause();
      setIsPlaying(false);
      audioRef.current.currentTime = startTime;
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-3 shadow-2xs">
      {/* Hidden audio element for preview */}
      <audio
        ref={audioRef}
        src={appUrl(baseUrl)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />

      {/* Header & Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-slate-800 text-[11px]">{label}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const nextMode = !isSegmentMode;
              setIsSegmentMode(nextMode);
              emitChange(baseUrl, startTime, endTime, nextMode);
            }}
            className={`px-2.5 py-1 rounded-lg font-medium text-[10px] transition flex items-center gap-1.5 ${
              isSegmentMode
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            <Scissors className="w-3 h-3" />
            <span>{isSegmentMode ? "Mode Potongan (Aktif)" : "Mode File Utuh"}</span>
          </button>

          {onUpload && (
            <label className="cursor-pointer px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-[10px] font-bold text-slate-700 transition flex items-center gap-1 shadow-2xs">
              <Upload className="w-3 h-3" />
              <span>{isUploading ? "Mengunggah..." : "Upload MP3"}</span>
              <input
                type="file"
                accept=".mp3,.wav,.m4a"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUpload(file);
                }}
              />
            </label>
          )}
        </div>
      </div>

      {/* Base URL Input */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            File Audio Sumber:
          </label>
          {baseUrl !== defaultBaseUrl && (
            <button
              type="button"
              onClick={() => {
                setBaseUrl(defaultBaseUrl);
                emitChange(defaultBaseUrl, startTime, endTime, isSegmentMode);
              }}
              className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
            >
              <RotateCcw className="w-2.5 h-2.5" /> Gunakan Master ({defaultBaseUrl})
            </button>
          )}
        </div>
        <input
          type="text"
          value={baseUrl}
          onChange={(e) => {
            const val = e.target.value;
            setBaseUrl(val);
            emitChange(val, startTime, endTime, isSegmentMode);
          }}
          placeholder="/Toefl-test-3.mp3"
          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-[11px] text-slate-800 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Timestamp Segmentation Controls (if Segment Mode is active) */}
      {isSegmentMode && (
        <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Start Time Box */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-600" /> Detik Mulai:
                </span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  {formatTime(startTime)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={startTime}
                  onChange={(e) => handleStartChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 rounded border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-500 shrink-0">dtk</span>
              </div>
              {/* Nudge buttons for start */}
              <div className="flex items-center gap-1 pt-0.5">
                <button
                  type="button"
                  onClick={() => nudgeStart(-1)}
                  className="flex-1 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-[10px] font-mono text-slate-700 font-bold"
                  title="Kurang 1 detik"
                >
                  -1s
                </button>
                <button
                  type="button"
                  onClick={() => nudgeStart(-0.5)}
                  className="flex-1 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-[10px] font-mono text-slate-700 font-bold"
                  title="Kurang 0.5 detik"
                >
                  -0.5s
                </button>
                <button
                  type="button"
                  onClick={() => nudgeStart(0.5)}
                  className="flex-1 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-[10px] font-mono text-slate-700 font-bold"
                  title="Tambah 0.5 detik"
                >
                  +0.5s
                </button>
                <button
                  type="button"
                  onClick={() => nudgeStart(1)}
                  className="flex-1 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-[10px] font-mono text-slate-700 font-bold"
                  title="Tambah 1 detik"
                >
                  +1s
                </button>
              </div>
            </div>

            {/* End Time Box */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-red-600" /> Detik Selesai:
                </span>
                <span className="font-mono font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                  {formatTime(endTime)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={endTime}
                  onChange={(e) => handleEndChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 rounded border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <span className="text-[10px] text-slate-500 shrink-0">dtk</span>
              </div>
              {/* Nudge buttons for end */}
              <div className="flex items-center gap-1 pt-0.5">
                <button
                  type="button"
                  onClick={() => nudgeEnd(-1)}
                  className="flex-1 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-[10px] font-mono text-slate-700 font-bold"
                  title="Kurang 1 detik"
                >
                  -1s
                </button>
                <button
                  type="button"
                  onClick={() => nudgeEnd(-0.5)}
                  className="flex-1 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-[10px] font-mono text-slate-700 font-bold"
                  title="Kurang 0.5 detik"
                >
                  -0.5s
                </button>
                <button
                  type="button"
                  onClick={() => nudgeEnd(0.5)}
                  className="flex-1 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-[10px] font-mono text-slate-700 font-bold"
                  title="Tambah 0.5 detik"
                >
                  +0.5s
                </button>
                <button
                  type="button"
                  onClick={() => nudgeEnd(1)}
                  className="flex-1 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-[10px] font-mono text-slate-700 font-bold"
                  title="Tambah 1 detik"
                >
                  +1s
                </button>
              </div>
            </div>
          </div>

          {/* Scrubber / Player Controls for Segment Testing */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={togglePlayPreview}
              className={`w-full sm:w-auto px-3 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                isPlaying
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-2xs"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Preview</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Test Putar Potongan ({formatTime(startTime)} - {formatTime(endTime)})</span>
                </>
              )}
            </button>

            {/* Current playback position display */}
            <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
              <span>Posisi:</span>
              <span className="font-bold text-slate-800">{formatTime(currentTime)}</span>
              {duration > 0 && <span>/ {formatTime(duration)}</span>}
            </div>

            {/* Scrubber slider to find position easily */}
            <div className="flex-1 w-full flex items-center gap-2">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={(e) => {
                  const targetSec = parseFloat(e.target.value);
                  setCurrentTime(targetSec);
                  if (audioRef.current) {
                    audioRef.current.currentTime = targetSec;
                  }
                }}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <button
                type="button"
                onClick={() => handleStartChange(currentTime)}
                title="Gunakan posisi audio saat ini sebagai waktu mulai"
                className="shrink-0 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 rounded text-[10px] font-semibold"
              >
                📌 Set Mulai
              </button>
              <button
                type="button"
                onClick={() => handleEndChange(currentTime)}
                title="Gunakan posisi audio saat ini sebagai waktu selesai"
                className="shrink-0 px-2 py-0.5 bg-red-50 text-red-700 border border-red-300 hover:bg-red-100 rounded text-[10px] font-semibold"
              >
                📌 Set Selesai
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-2 rounded text-[10px] font-mono text-slate-600 border border-slate-100 flex items-center justify-between">
            <span>Hasil URL Tersimpan:</span>
            <span className="font-bold text-blue-700">
              {baseUrl}#t={startTime.toFixed(2)},{endTime.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioSegmentEditor;
