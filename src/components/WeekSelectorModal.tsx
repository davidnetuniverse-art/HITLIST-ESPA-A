import React from "react";
import { X, Calendar, Trophy, CheckCircle2, Play, Zap } from "lucide-react";
import { WeekEdition, Song } from "../types";

interface WeekSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  weeks: WeekEdition[];
  currentWeekId: string;
  onSelectWeek: (weekId: string) => void;
  onSimulateCloseWeek?: () => void;
  onSimulateAdvanceWeek?: () => void;
  onPlayWinner: (song: Song) => void;
}

export const WeekSelectorModal: React.FC<WeekSelectorModalProps> = ({
  isOpen,
  onClose,
  weeks,
  currentWeekId,
  onSelectWeek,
  onSimulateAdvanceWeek,
  onPlayWinner,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-100 text-[#e62b1e]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Histórico de La Lista de los Éxitos
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Selecciona una semana oficial o escucha su Número 1 proclamado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auto update banner inside modal */}
        {onSimulateAdvanceWeek && (
          <div className="px-5 py-3 bg-gradient-to-r from-red-50 to-amber-50 border-b border-red-100 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                <strong>Actualización Automática Activa:</strong> La lista evoluciona cada sábado.
              </span>
            </div>
            <button
              onClick={() => {
                onSimulateAdvanceWeek();
                onClose();
              }}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-xs shrink-0 transition"
            >
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>Avanzar semana</span>
            </button>
          </div>
        )}

        {/* Content list */}
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {weeks.map((week) => {
            const isSelected = week.id === currentWeekId;
            const winningSong =
              week.songs.find((s) => s.id === week.winnerId) || week.songs[0];

            return (
              <div
                key={week.id}
                className={`p-4 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-red-50/50 border-[#e62b1e]/40 shadow-xs"
                    : "bg-white hover:bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">
                      {week.label}
                    </span>
                    {week.status === "voting" ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-[#e62b1e] border border-red-200 uppercase">
                        VOTACIÓN EN CURSO
                      </span>
                    ) : (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                        FINALIZADA
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">
                    {week.dates}
                  </span>
                </div>

                {/* Winner snapshot card */}
                {winningSong && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={winningSong.albumCover}
                        alt={winningSong.title}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-md object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="font-bold text-xs text-slate-900">
                            {winningSong.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {winningSong.artist} • {winningSong.votes.toLocaleString()} votos
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onPlayWinner(winningSong)}
                      className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-[#e62b1e] transition"
                      title="Escuchar audio oficial"
                    >
                      <Play className="w-4 h-4 fill-[#e62b1e]" />
                    </button>
                  </div>
                )}

                {/* Select button */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-500 font-medium">
                    Total: {week.totalVotes.toLocaleString()} votos
                  </span>

                  <button
                    onClick={() => {
                      onSelectWeek(week.id);
                      onClose();
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition ${
                      isSelected
                        ? "bg-[#e62b1e] text-white"
                        : "bg-slate-200 hover:bg-slate-300 text-slate-800"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Semana Activa
                      </>
                    ) : (
                      "Cargar esta semana"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
