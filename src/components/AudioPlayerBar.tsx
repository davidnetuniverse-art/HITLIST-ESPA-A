import React, { useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Music2,
  Radio,
  ChevronUp,
} from "lucide-react";
import { Song } from "../types";

interface AudioPlayerBarProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onVolumeChange: (vol: number) => void;
  onVote: (songId: string) => void;
  isRadioLive?: boolean;
  currentStationName?: string | null;
  onToggleLiveRadio?: () => void;
  onOpenRadioStations?: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentSong,
  isPlaying,
  currentTime,
  volume,
  onPlay,
  onPause,
  onSeek,
  onNext,
  onPrev,
  onVolumeChange,
  onVote,
  isRadioLive = false,
  currentStationName = null,
  onToggleLiveRadio,
  onOpenRadioStations,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [prevVolume, setPrevVolume] = useState<number>(0.8);

  if (!currentSong) return null;

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      onVolumeChange(prevVolume);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      onVolumeChange(0);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const duration = currentSong.duration || 30;

  return (
    <aside
      aria-label="Reproductor Oficial HITLIST"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#16191f] text-white border-t border-slate-800 shadow-2xl transition-all"
    >
      {/* Top Red Thin Progress Bar */}
      <div className="relative w-full h-1 bg-slate-800 group cursor-pointer">
        <div
          className="h-full bg-[#e62b1e] relative transition-all"
          style={{
            width: `${Math.min(100, (currentTime / duration) * 100)}%`,
          }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow scale-0 group-hover:scale-100 transition-transform" />
        </div>
        <input
          type="range"
          min="0"
          max={duration}
          step="0.5"
          value={currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          title="Desplazarse por el audio"
        />
      </div>

      {/* Main Bar (Matches screenshot: Presenter avatar, 'En Directo HITLIST', Big Play Button, 'ELIGE TU EMISORA') */}
      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-between gap-3">
        {/* Left Side: Host / Song Info with Presenter Avatar */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden shrink-0 bg-slate-800 border border-slate-700">
            <img
              src={currentSong.albumCover}
              alt={currentSong.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Music2 className="w-4 h-4 text-amber-400 animate-bounce" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            {/* Live Indicator without 'los 40' */}
            <div className="flex items-center gap-1.5 text-[11px] font-bold">
              <span className={`w-2 h-2 rounded-full ${isRadioLive ? "bg-emerald-400 animate-ping" : "bg-[#e62b1e] animate-ping"}`} />
              <span className="text-slate-400">{isRadioLive ? "Emisión en Directo" : "En Directo"}</span>
              <span className="text-white font-black truncate max-w-[140px]">
                {isRadioLive ? (currentStationName || "HITLIST RADIO EN VIVO") : "HITLIST RADIO"}
              </span>
            </div>

            {/* Song title and artist */}
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-xs sm:text-sm text-white truncate max-w-[150px] sm:max-w-xs">
                {isRadioLive ? "Radio Online en Directo" : currentSong.title}
              </h4>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <p className="text-xs text-slate-400 truncate hidden sm:inline">
                {isRadioLive ? "Sintonizando señal en vivo" : currentSong.artist}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Big Red Circular Play / Pause Button with Next / Prev */}
        <div className="flex items-center gap-3 sm:gap-5">
          <button
            onClick={onPrev}
            className="text-slate-400 hover:text-white transition p-1"
            title="Canción anterior"
          >
            <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={() => (isPlaying ? onPause() : onPlay())}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#e62b1e] hover:bg-[#c92418] text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
            title={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white ml-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            className="text-slate-400 hover:text-white transition p-1"
            title="Siguiente canción"
          >
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <span className="hidden md:inline text-xs font-mono text-slate-400">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Right Side: Quick Vote & ELIGE TU EMISORA / Vol Controls */}
        <div className="flex items-center gap-3">
          {/* Quick Vote Button */}
          <button
            onClick={() => onVote(currentSong.id)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-bold text-rose-400 border border-slate-700 transition"
            title="Votar ahora"
          >
            <Heart className="w-3.5 h-3.5 fill-rose-500" />
            <span>Votar ({currentSong.votes.toLocaleString()})</span>
          </button>

          {/* Volume Control */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className="text-slate-400 hover:text-white transition p-1"
              title={isMuted ? "Activar sonido" : "Silenciar"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setIsMuted(val === 0);
                onVolumeChange(val);
              }}
              className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#e62b1e]"
              title="Volumen"
            />
          </div>

          {/* Red pill button: SINTONIZAR EMISORA / EN VIVO */}
          <button
            onClick={() => {
              if (onOpenRadioStations) {
                onOpenRadioStations();
              } else if (onToggleLiveRadio) {
                onToggleLiveRadio();
              }
            }}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-white text-[10px] sm:text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-xs transition active:scale-95 ${
              isRadioLive
                ? "bg-emerald-600 hover:bg-emerald-700 animate-pulse ring-2 ring-emerald-400"
                : "bg-[#e62b1e] hover:bg-[#c92418]"
            }`}
            title={isRadioLive ? "Cambiar o detener emisora en directo" : "Sintonizar radio en vivo"}
          >
            <Radio className="w-3 h-3" />
            <span className="hidden sm:inline">
              {isRadioLive ? "SINCRONIZADO" : "SINTONIZAR"}
            </span>
            <span className="sm:hidden">
              {isRadioLive ? "EN VIVO" : "RADIO"}
            </span>
            <ChevronUp className="w-3 h-3 ml-0.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
