import React from "react";
import { Clock, Zap, Settings, RefreshCw, Calendar, Sparkles } from "lucide-react";
import { WeekEdition } from "../types";

interface WeeklyAutoUpdateBarProps {
  currentWeek: WeekEdition;
  countdownFormatted: string;
  isExpired: boolean;
  autoUpdateEnabled: boolean;
  onOpenOptions: () => void;
  onSimulateAdvanceWeek: () => void;
}

export const WeeklyAutoUpdateBar: React.FC<WeeklyAutoUpdateBarProps> = ({
  currentWeek,
  countdownFormatted,
  isExpired,
  autoUpdateEnabled,
  onOpenOptions,
  onSimulateAdvanceWeek,
}) => {
  return (
    <div className="bg-white border-y border-slate-200/90 py-2.5 px-4 sm:px-6 shadow-2xs mb-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Left: Status and current week */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-bold border border-slate-200">
            <span
              className={`w-2 h-2 rounded-full ${
                autoUpdateEnabled ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            <span className="text-[11px] uppercase tracking-wide">
              {autoUpdateEnabled ? "Auto-actualización Activa" : "Auto-actualización Pausada"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#e62b1e]" />
            <span className="font-bold text-slate-900">{currentWeek.label}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">{currentWeek.dates}</span>
          </div>
        </div>

        {/* Right: Countdown and quick actions */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 sm:gap-3">
          {/* Countdown chip */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#e62b1e] border border-red-200 font-bold text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-slate-600 font-medium text-[11px] hidden sm:inline">
              Próxima lista en:
            </span>
            <span className="font-mono font-extrabold text-[#e62b1e]">
              {isExpired ? "¡Cierre de semana en curso!" : countdownFormatted}
            </span>
          </div>

          {/* Quick Action: Advance to next week now (Simulation) */}
          <button
            onClick={onSimulateAdvanceWeek}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-xs hover:shadow-sm active:scale-95 transition cursor-pointer"
            title="Avanzar y simular el cierre de esta semana para crear la siguiente automáticamente"
          >
            <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="hidden sm:inline">Avanzar semana</span>
            <span className="sm:hidden">Avanzar</span>
          </button>

          {/* Options button */}
          <button
            onClick={onOpenOptions}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition cursor-pointer"
            title="Configuración de actualización semanal automática"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden lg:inline">Ajustes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
