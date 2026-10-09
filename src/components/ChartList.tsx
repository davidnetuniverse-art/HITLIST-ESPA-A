import React, { useState } from "react";
import { Search, Radio, Filter } from "lucide-react";
import { Song, Genre } from "../types";
import { OfficialSongRow } from "./OfficialSongRow";

interface ChartListProps {
  songs: Song[];
  candidateSongs: Song[];
  currentPlayingId: string | null;
  isPlaying: boolean;
  totalVotes: number;
  userVotes: Record<string, number>;
  activeFilterTab: string;
  onSelectFilterTab: (tab: string) => void;
  onPlaySong: (song: Song) => void;
  onPauseSong: () => void;
  onVote: (songId: string) => void;
  currentWeekDates: string;
}

export const ChartList: React.FC<ChartListProps> = ({
  songs,
  candidateSongs,
  currentPlayingId,
  isPlaying,
  totalVotes,
  userVotes,
  activeFilterTab,
  onPlaySong,
  onPauseSong,
  onVote,
  currentWeekDates,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<Genre | "Todos">("Todos");

  // Determine active source list
  const isCandidatesView = activeFilterTab === "candidatas";
  const baseList = isCandidatesView ? candidateSongs : songs;

  // Filter logic based on subnav and search
  const filteredSongs = baseList.filter((song) => {
    const matchesSearch =
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Filter tab constraints
    if (activeFilterTab === "numeros-1") {
      return song.currentRank === 1 || song.peakRank === 1;
    }
    if (activeFilterTab === "mayores-subidas") {
      return (
        song.badge === "super-subida" ||
        (song.previousRank > 0 && song.currentRank < song.previousRank)
      );
    }
    if (activeFilterTab === "semanas-en-lista") {
      return song.weeksOnChart >= 15;
    }

    // Genre filter
    if (selectedGenre !== "Todos") {
      return song.genre === selectedGenre;
    }

    return true;
  });

  const genres: (Genre | "Todos")[] = [
    "Todos",
    "Pop",
    "Urbano",
    "Electrónica",
    "Rock",
    "Latino",
  ];

  return (
    <section className="space-y-4">
      {/* Title Header: Clean, professional header with custom branding */}
      <div className="bg-white p-4 sm:p-6 rounded-none border-b border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            <span className="text-[#e62b1e]">LA LISTA DE LOS ÉXITOS</span>{" "}
            <span className="font-bold text-slate-600">
              {currentWeekDates ? `${currentWeekDates} de 2026` : "Semana Actual"}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            {isCandidatesView
              ? "Vota por las canciones que quieres que entren en el ranking oficial de España."
              : "Ranking semanal oficial auditado por los votos de los oyentes en tiempo real."}
          </p>
        </div>

        {/* Search input with clean modern styling */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por canción o artista..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-[#e62b1e] focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-bold"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Genre Filter Pills row */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0 pl-1">
          <Filter className="w-3 h-3" /> Géneros:
        </span>
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedGenre === g
                ? "bg-[#111] text-white shadow-2xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Official Songs List Container (Stacked Rows without rounded corners, clean graphic layout) */}
      <div className="bg-white border border-slate-200/90 shadow-xs divide-y divide-slate-200">
        {filteredSongs.length === 0 ? (
          <div className="text-center py-16 bg-white">
            <Radio className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h4 className="text-slate-800 font-bold text-base">
              No se encontraron canciones
            </h4>
            <p className="text-slate-500 text-xs mt-1">
              Prueba a buscar otro término o selecciona "Todos" los géneros.
            </p>
          </div>
        ) : (
          filteredSongs.map((song) => (
            <OfficialSongRow
              key={song.id}
              song={song}
              isPlaying={isPlaying}
              isCurrentTrack={currentPlayingId === song.id}
              totalVotes={totalVotes}
              userVotesForSong={userVotes[song.id] || 0}
              onPlay={onPlaySong}
              onPause={onPauseSong}
              onVote={onVote}
            />
          ))
        )}
      </div>
    </section>
  );
};
