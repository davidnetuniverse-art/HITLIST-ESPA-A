import React from "react";
import {
  X,
  Calendar,
  Sparkles,
  Clock,
  RotateCcw,
  CheckCircle2,
  Info,
  Radio,
  TrendingUp,
  Zap,
} from "lucide-react";
import { WeekEdition } from "../types";

interface AutoUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoUpdateEnabled: boolean;
  onToggleAutoUpdate: () => void;
  onSimulateAdvanceWeek: () => void;
  onResetToDefault: () => void;
  currentWeek: WeekEdition;
  nextReleaseFormatted: string;
}

export const AutoUpdateModal: React.FC<AutoUpdateModalProps> = ({
  isOpen,
  onClose,
  autoUpdateEnabled,
  onToggleAutoUpdate,
  onSimulateAdvanceWeek,
  onResetToDefault,
  currentWeek,
  nextReleaseFormatted,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-100 text-[#e62b1e]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                Actualización Semanal Automática
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {autoUpdateEnabled ? "Activa" : "Pausada"}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Sincronización del ranking oficial de HITLIST España
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

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-sm max-h-[75vh] overflow-y-auto">
          {/* Status Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-950 text-white border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Edición en curso</span>
              <span className="text-xs font-bold text-amber-400">
                {currentWeek.label}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <Clock className="w-3.5 h-3.5 text-[#e62b1e]" />
                <span>Próxima renovación de lista:</span>
              </div>
              <span className="font-black text-xs text-white">
                {nextReleaseFormatted}
              </span>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Sincronizar automáticamente por fecha
              </h4>
              <p className="text-xs text-slate-500">
                Al llegar cada sábado, la app actualiza la lista a la nueva semana sin que tengas que hacer nada.
              </p>
            </div>
            <button
              onClick={onToggleAutoUpdate}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoUpdateEnabled ? "bg-emerald-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  autoUpdateEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* How it works info cards */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              ¿Cómo funciona la renovación semanal?
            </h4>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-slate-900 font-bold block">
                    1. Coronación del Nº 1 Oficial
                  </strong>
                  <span className="text-slate-600">
                    Al cerrar la semana, la canción más votada por los oyentes queda proclamada ganadora y guardada en el archivo histórico.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-slate-900 font-bold block">
                    2. Entrada de la Candidata Más Votada
                  </strong>
                  <span className="text-slate-600">
                    La canción candidata con mayor apoyo de los votos entra directamente al Top 40 con la insignia <span className="font-bold text-[#e62b1e]">NUEVO</span>.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-red-100 text-[#e62b1e] shrink-0 mt-0.5">
                  <Radio className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-slate-900 font-bold block">
                    3. Movimiento Dinámico de Puestos
                  </strong>
                  <span className="text-slate-600">
                    Se calculan las posiciones de toda la lista, actualizando semanas en lista, mejor puesto histórico y otorgando la <span className="font-bold text-amber-600">SUPER-SUBIDA</span>.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Test Simulation Controls */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
            <button
              onClick={() => {
                onSimulateAdvanceWeek();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#e62b1e] to-rose-600 hover:from-[#c92418] hover:to-rose-700 text-white font-bold text-sm shadow-md shadow-red-500/20 active:scale-98 transition cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Avanzar a la Siguiente Semana Ahora (Test)</span>
            </button>

            <button
              onClick={() => {
                onResetToDefault();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer lista a los valores oficiales por defecto</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
