import React from "react";
import { Play, Pause, Trophy, Heart, Volume2, Flame, Disc, Sparkles } from "lucide-react";
import { Song } from "../types";

interface TopHeroBannerProps {
  song: Song | null;
  isPlaying: boolean;
  isCurrentTrack: boolean;
  totalWeekVotes: number;
  onPlay: (song: Song) => void;
  onPause: () => void;
  onVote: (songId: string) => void;
}

export const TopHeroBanner: React.FC<TopHeroBannerProps> = ({
  song,
  isPlaying,
  isCurrentTrack,
  totalWeekVotes,
  onPlay,
  onPause,
  onVote,
}) => {
  if (!song) return null;

  const isThisPlaying = isCurrentTrack && isPlaying;
  const votePercentage =
    totalWeekVotes > 0 ? Math.round((song.votes / totalWeekVotes) * 100) : 15;

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-amber-500/30 p-6 sm:p-8 shadow-2xl shadow-amber-500/5 mb-8">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* Album Cover & Vinyl Record Display */}
        <div className="lg:col-span-4 flex justify-center lg:justify-start">
          <div className="relative group">
            {/* Spinning Vinyl behind the sleeve */}
            <div
              className={`absolute top-0 right-0 w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-neutral-950 border-4 border-neutral-800 flex items-center justify-center transition-all duration-700 shadow-2xl ${
                isThisPlaying
                  ? "translate-x-12 sm:translate-x-16 rotate-180 animate-spin"
                  : "translate-x-3 group-hover:translate-x-8"
              }`}
              style={{ animationDuration: "4s" }}
            >
              {/* Vinyl grooves */}
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-neutral-700/40 flex items-center justify-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-neutral-700/60 flex items-center justify-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-slate-950 font-black text-xs">
                    <Disc className="w-5 h-5 text-slate-950" />
                  </div>
                </div>
              </div>
            </div>

            {/* Album Cover Card */}
            <div className="relative z-10 w-44 h-44 sm:w-56 sm:h-56 rounded-xl overflow-hidden shadow-2xl border border-amber-500/40 bg-slate-950">
              <img
                src={song.albumCover}
                alt={song.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Gold Crown Badge */}
              <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 px-2.5 py-1 rounded-full font-black text-xs flex items-center gap-1.5 shadow-lg">
                <Trophy className="w-3.5 h-3.5 fill-slate-950" />
                <span>NÚMERO 1</span>
              </div>

              {/* Sound wave icon when playing */}
              {isThisPlaying && (
                <div className="absolute bottom-3 right-3 bg-rose-500/90 text-white p-2 rounded-full animate-pulse shadow-md">
                  <Volume2 className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content details & Action Controls */}
        <div className="lg:col-span-8 flex flex-col justify-center text-left">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              <Sparkles className="w-3 h-3" />
              La canción más votada de la semana
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {song.genre}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {song.weeksOnChart} semanas en lista
            </span>
            {song.audioPreviewUrl && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                Audio Real
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-1">
            {song.title}
          </h2>
          <p className="text-lg sm:text-xl font-medium text-slate-300 mb-3">
            {song.artist}
          </p>

          <p className="text-sm text-slate-400 max-w-2xl mb-5 leading-relaxed">
            {song.description}
          </p>

          {/* Voting stats progress */}
          <div className="bg-slate-950/60 rounded-xl p-3 sm:p-4 border border-slate-800 mb-6 max-w-xl">
            <div className="flex items-center justify-between text-xs sm:text-sm mb-2 font-medium">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-500" />
                Votos de los oyentes esta semana
              </span>
              <span className="font-bold text-amber-400">
                {song.votes.toLocaleString()} votos ({votePercentage}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(10, votePercentage * 2))}%` }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Play/Pause #1 */}
            <button
              onClick={() => (isThisPlaying ? onPause() : onPlay(song))}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              {isThisPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-slate-950" />
                  <span>Pausar Canción #1</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Escuchar el #1 Ahora</span>
                </>
              )}
            </button>

            {/* Vote button */}
            <button
              onClick={() => onVote(song.id)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 hover:border-rose-500/60 transition-all active:scale-95"
            >
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span>Votar por esta canción</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
