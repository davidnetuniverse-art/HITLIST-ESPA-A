import React, { useState } from "react";
import {
  Play,
  Pause,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Volume2,
  Share2,
  Calendar,
  Award,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Song } from "../types";

interface OfficialSongRowProps {
  song: Song;
  isPlaying: boolean;
  isCurrentTrack: boolean;
  totalVotes: number;
  userVotesForSong: number;
  onPlay: (song: Song) => void;
  onPause: () => void;
  onVote: (songId: string) => void;
}

export const OfficialSongRow: React.FC<OfficialSongRowProps> = ({
  song,
  isPlaying,
  isCurrentTrack,
  totalVotes,
  userVotesForSong,
  onPlay,
  onPause,
  onVote,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [justVoted, setJustVoted] = useState<boolean>(false);

  const isNo1 = song.currentRank === 1;
  const isCandidate = !!song.isCandidate;
  const diff = song.previousRank > 0 ? song.previousRank - song.currentRank : 0;
  const isPlayingThis = isCurrentTrack && isPlaying;

  const handleVoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onVote(song.id);
    setJustVoted(true);
    setTimeout(() => setJustVoted(false), 800);
  };

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingThis) {
      onPause();
    } else {
      onPlay(song);
    }
  };

  return (
    <article
      id={`song-card-${song.id}`}
      className={`bg-white rounded-none border-b border-slate-200/90 transition-all ${
        isNo1 ? "border-l-4 sm:border-l-8 border-l-[#e62b1e]" : ""
      }`}
    >
      {/* Main card row container */}
      <div className="flex flex-col sm:flex-row items-stretch min-h-[96px] sm:min-h-[128px]">
        {/* Left Column: Number Box + Trend Arrow (Matches screenshots exactly) */}
        <div
          className={`flex sm:flex-col items-center justify-between sm:justify-center p-3 sm:p-4 w-full sm:w-20 md:w-24 shrink-0 border-b sm:border-b-0 sm:border-r border-slate-100 ${
            isNo1
              ? "bg-[#e62b1e] text-white"
              : "bg-[#1f242c] text-white"
          }`}
        >
          {/* Position Number */}
          <span className="font-black text-2xl sm:text-3xl md:text-4xl tracking-tighter leading-none">
            {isCandidate ? "CAND" : song.currentRank}
          </span>

          {/* Trend circle arrow */}
          {!isCandidate && (
            <div className="mt-0 sm:mt-2">
              {song.previousRank === 0 ? (
                <span className="text-[10px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-500 text-white">
                  NUEVO
                </span>
              ) : diff > 0 ? (
                <div
                  className="w-6 h-6 rounded-full bg-[#10b981] text-white flex items-center justify-center font-bold text-xs shadow-xs"
                  title={`Subió ${diff} puestos`}
                >
                  <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              ) : diff < 0 ? (
                <div
                  className="w-6 h-6 rounded-full bg-[#e62b1e] text-white flex items-center justify-center font-bold text-xs shadow-xs"
                  title={`Bajó ${Math.abs(diff)} puestos`}
                >
                  <ArrowDown className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              ) : (
                <div
                  className="w-6 h-6 rounded-full bg-slate-600 text-white flex items-center justify-center"
                  title="Mantiene puesto"
                >
                  <Minus className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Middle-Left: Album Cover Image */}
        <div className="relative w-full sm:w-36 md:w-44 h-48 sm:h-auto shrink-0 bg-slate-900 group cursor-pointer overflow-hidden"
             onClick={handlePlayToggle}>
          <img
            src={song.albumCover}
            alt={`${song.title} - ${song.artist}`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Play/Pause hover / active overlay */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity ${
              isPlayingThis
                ? "bg-black/40 opacity-100"
                : "bg-black/30 opacity-0 group-hover:opacity-100"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-[#e62b1e] text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
              {isPlayingThis ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white ml-0.5" />
              )}
            </div>
          </div>
        </div>

        {/* Center Content: Song Title, Artist, Badges */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col justify-center min-w-0 bg-white">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {isNo1 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                <Trophy className="w-3 h-3 fill-slate-950" />
                Número 1 Oficial
              </span>
            )}
            {song.badge === "super-subida" && (
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                Super Subida
              </span>
            )}
            {song.badge === "record" && (
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-300">
                Récord en Lista
              </span>
            )}
            {song.badge === "nuevo" && (
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300">
                Entrada en Lista
              </span>
            )}
          </div>

          {/* Song Title (Big, bold font as in screenshot) */}
          <h3
            onClick={handlePlayToggle}
            className="text-lg sm:text-2xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight cursor-pointer hover:text-[#e62b1e] transition-colors truncate"
            title={song.title}
          >
            {song.title}
          </h3>

          {/* Artist Name */}
          <p className="text-sm sm:text-base font-semibold text-slate-600 mt-0.5 truncate">
            {song.artist}
          </p>

          {/* Mobile metrics preview */}
          <div className="flex sm:hidden items-center gap-4 text-xs text-slate-500 mt-2">
            <span>
              <strong>{song.weeksOnChart}</strong> sem.
            </span>
            <span>
              Pico: <strong>#{song.peakRank}</strong>
            </span>
            <span>
              Votos: <strong>{song.votes.toLocaleString()}</strong>
            </span>
          </div>
        </div>

        {/* Right Action: Red ¡VOTA! Button & Chevron Dropdown */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 p-4 sm:p-6 bg-white sm:bg-transparent border-t sm:border-t-0 border-slate-100 shrink-0">
          {/* Official styled Red Pill ¡VOTA! Button */}
          <button
            id={`vote-btn-${song.id}`}
            onClick={handleVoteClick}
            className={`px-6 sm:px-8 py-2.5 rounded-full font-black text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 shadow-sm ${
              justVoted
                ? "bg-emerald-600 text-white scale-95"
                : "bg-[#e62b1e] hover:bg-[#c92418] active:scale-95 text-white"
            }`}
          >
            {justVoted ? "¡VOTADO!" : "¡VOTA!"}
          </button>

          {/* Accordion Expand Chevron */}
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
            title={isExpanded ? "Ocultar detalles" : "Ver estadísticas"}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Details Drawer (Shows Semanas en lista, Mejor Posición, Anterior Posición as seen in Screenshot 1) */}
      {isExpanded && (
        <div className="p-4 sm:p-6 bg-[#fafafa] border-t border-slate-200/80 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left mb-4">
            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Semanas en lista
              </span>
              <span className="text-xl font-black text-slate-900">
                {song.weeksOnChart}
              </span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Mejor Posición
              </span>
              <span className="text-xl font-black text-slate-900">
                #{song.peakRank}
              </span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Anterior Posición
              </span>
              <span className="text-xl font-black text-slate-900">
                {song.previousRank === 0 ? "—" : `#${song.previousRank}`}
              </span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Votos de los Oyentes
              </span>
              <span className="text-xl font-black text-[#e62b1e]">
                {song.votes.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-600">
            <p className="italic">{song.description}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePlayToggle}
                className="px-3 py-1.5 rounded-full bg-slate-200 hover:bg-slate-300 font-bold text-slate-800 flex items-center gap-1.5 transition"
              >
                {isPlayingThis ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Reproducir canción
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
