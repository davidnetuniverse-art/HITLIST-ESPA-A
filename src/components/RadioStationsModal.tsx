import React from "react";
import { Radio, X, Check, Volume2, Sparkles } from "lucide-react";
import { SoundEngine, RadioStation } from "../audio/soundEngine";

interface RadioStationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRadioLive: boolean;
  currentStationId: string | null;
  onSelectStation: (stationId: string) => void;
  onStopRadio: () => void;
}

export const RadioStationsModal: React.FC<RadioStationsModalProps> = ({
  isOpen,
  onClose,
  isRadioLive,
  currentStationId,
  onSelectStation,
  onStopRadio,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e62b1e] flex items-center justify-center text-white">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">Sintonizar Emisora en Vivo</h3>
              <p className="text-[11px] text-slate-400">HITLIST España • Streaming oficial en directo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status banner */}
        {isRadioLive ? (
          <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold text-emerald-800">Sincronizado y sonando en vivo</span>
            </div>
            <button
              onClick={() => {
                onStopRadio();
              }}
              className="text-xs font-bold text-red-600 hover:underline"
            >
              Detener radio
            </button>
          </div>
        ) : (
          <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center gap-2 text-xs text-amber-800">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Selecciona una emisora para conectar el audio en vivo al instante.</span>
          </div>
        )}

        {/* Stations List */}
        <div className="p-4 space-y-2.5 max-h-80 overflow-y-auto">
          {SoundEngine.RADIO_STATIONS.map((station: RadioStation) => {
            const isCurrent = isRadioLive && currentStationId === station.id;

            return (
              <div
                key={station.id}
                onClick={() => onSelectStation(station.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  isCurrent
                    ? "bg-red-50/70 border-[#e62b1e] shadow-xs"
                    : "bg-white hover:bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isCurrent ? "bg-[#e62b1e] text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {isCurrent ? (
                      <Volume2 className="w-5 h-5 animate-bounce" />
                    ) : (
                      <Radio className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900 truncate">
                        {station.name}
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {station.frequency}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {station.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 ml-2">
                  {isCurrent ? (
                    <span className="px-2.5 py-1 rounded-full bg-[#e62b1e] text-white text-[11px] font-black tracking-wider flex items-center gap-1">
                      <Check className="w-3 h-3" /> EN VIVO
                    </span>
                  ) : (
                    <button
                      className="px-3 py-1 rounded-full bg-slate-100 hover:bg-[#e62b1e] hover:text-white text-slate-700 text-xs font-bold transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStation(station.id);
                      }}
                    >
                      Sintonizar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            Transmisión directa de radio por streaming en tiempo real y audio HD.
          </p>
        </div>
      </div>
    </div>
  );
};
