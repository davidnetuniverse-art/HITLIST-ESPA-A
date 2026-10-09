import React from "react";
import { Trophy, Sparkles, Disc, Play, Volume2, X } from "lucide-react";
import { Song } from "../types";

interface CrowningModalProps {
  isOpen: boolean;
  onClose: () => void;
  winnerSong: Song | null;
  weekLabel: string;
  onListenNow: (song: Song) => void;
}

export const CrowningModal: React.FC<CrowningModalProps> = ({
  isOpen,
  onClose,
  winnerSong,
  weekLabel,
  onListenNow,
}) => {
  if (!isOpen || !winnerSong) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
      <div className="relative max-w-lg w-full bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-amber-500/20 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900/80 border border-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Trophy icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 shadow-xl shadow-amber-500/30 mb-4 animate-bounce">
          <Trophy className="w-8 h-8 fill-slate-950" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>¡PROCLAMADO EL NÚMERO 1 OFICIAL!</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1">
          {weekLabel}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mb-6">
          Tras el recuento oficial de todos los votos de los oyentes, esta es la canción más votada de la semana:
        </p>

        {/* Winner Card */}
        <div className="relative bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-center gap-4 text-left">
          <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border-2 border-amber-500/60 shadow-lg">
            <img
              src={winnerSong.albumCover}
              alt={winnerSong.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center p-1.5">
              <span className="text-[10px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                #1 DE LA SEMANA
              </span>
            </div>
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1">
              <Disc className="w-4 h-4 text-amber-400 animate-spin" />
              <span className="text-xs font-semibold text-amber-400">
                Líder Absoluto
              </span>
            </div>
            <h4 className="font-extrabold text-lg sm:text-xl text-white truncate">
              {winnerSong.title}
            </h4>
            <p className="text-sm font-medium text-slate-300 truncate">
              {winnerSong.artist}
            </p>
            <p className="text-xs text-rose-400 font-bold mt-1">
              {winnerSong.votes.toLocaleString()} votos de los fans
            </p>
          </div>
        </div>

        {/* Listen button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              onListenNow(winnerSong);
              onClose();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Escuchar en Directo Ahora</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition"
          >
            Ver la Lista Completa
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <Volume2 className="w-3.5 h-3.5 text-amber-500" />
          <span>Sintonizando en directo en el reproductor de la app</span>
        </div>
      </div>
    </div>
  );
};
