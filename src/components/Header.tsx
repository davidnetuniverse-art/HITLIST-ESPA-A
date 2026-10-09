import React from "react";
import {
  Radio,
  Calendar,
  Sparkles,
  RotateCcw,
  Headphones,
  ChevronDown,
} from "lucide-react";
import { WeekEdition, Song } from "../types";
import brandLogo from "../assets/images/hitlist_official_logo_1790078192221.jpg";

interface HeaderProps {
  currentWeek: WeekEdition;
  topSong: Song | null;
  totalVotes: number;
  userVotesRemaining: number;
  isChatOpen: boolean;
  onToggleChat: () => void;
  onOpenWeekSelector: () => void;
  onSimulateCloseWeek: () => void;
  onResetVotes: () => void;
  activeFilterTab: string;
  onSelectFilterTab: (tab: string) => void;
  isRadioLive?: boolean;
  onToggleLiveRadio?: () => void;
  onOpenRadioStations?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentWeek,
  topSong,
  userVotesRemaining,
  isChatOpen,
  onToggleChat,
  onOpenWeekSelector,
  onSimulateCloseWeek,
  onResetVotes,
  activeFilterTab,
  onSelectFilterTab,
  isRadioLive = false,
  onToggleLiveRadio,
  onOpenRadioStations,
}) => {
  const navPills = [
    { id: "del-40-al-1", label: "Top 40 al 1", icon: Headphones },
    { id: "lista-completa", label: "La Lista de los Éxitos", isMain: true },
    { id: "numeros-1", label: "Números 1" },
    { id: "listas-anteriores", label: "Listas anteriores" },
    { id: "mayores-subidas", label: "Mayores subidas" },
    { id: "semanas-en-lista", label: "Semanas en lista" },
    { id: "candidatas", label: "Candidatas a Entrar" },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs text-slate-800">
      {/* Top Navbar: Brand logo & Directo bar */}
      <div className="border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left: Custom Brand Identity with Graphic Design Logo */}
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2.5 cursor-pointer">
                {/* Generated High-End Graphic Design Logo */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden shadow-xs border border-slate-200 shrink-0 bg-white p-0.5">
                  <img
                    src={brandLogo}
                    alt="HITLIST España Logo"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-[10px]"
                  />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-[#1a1a1a]">
                      HIT<span className="text-[#e62b1e]">LIST</span>
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] font-black tracking-wider text-[#e62b1e] border border-[#e62b1e]/30 rounded bg-red-50 uppercase">
                      ESPAÑA
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                    Ranking Oficial
                  </span>
                </div>
              </div>

              {/* Sub-nav breadcrumbs */}
              <nav className="hidden lg:flex items-center gap-5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <span className="text-[#e62b1e] cursor-pointer hover:underline">
                  LA LISTA DE LOS ÉXITOS
                </span>
                <span className="text-slate-400">•</span>
                <span className="hover:text-slate-900 cursor-pointer">MÚSICA</span>
                <span className="hover:text-slate-900 cursor-pointer">NOVEDADES</span>
                <span className="hover:text-slate-900 cursor-pointer">RANKING</span>
              </nav>
            </div>

            {/* Right Tools: Votos, DJ Bot, Directo */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Votos restantes chip */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                <span className="text-slate-500 text-[11px]">Tus votos:</span>
                <span className="font-extrabold text-[#e62b1e] text-xs">
                  {userVotesRemaining}
                </span>
                <button
                  onClick={onResetVotes}
                  title="Recargar votos"
                  className="text-slate-400 hover:text-slate-700 transition ml-0.5"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>

              {/* Simulate close week */}
              <button
                onClick={onSimulateCloseWeek}
                className="hidden xl:flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition"
                title="Simular recuento y proclamar el Nº 1"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Coronar Nº 1</span>
              </button>

              {/* Week switcher button */}
              <button
                onClick={onOpenWeekSelector}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition"
              >
                <Calendar className="w-3.5 h-3.5 text-[#e62b1e]" />
                <span className="hidden sm:inline">{currentWeek.label}</span>
                <span className="sm:hidden">Semana</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {/* DJ HITLIST AI Chat Drawer Button */}
              <button
                onClick={onToggleChat}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-xs ${
                  isChatOpen
                    ? "bg-[#111] text-white"
                    : "bg-[#e62b1e] hover:bg-[#c92418] text-white"
                }`}
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>DJ Locutor AI</span>
              </button>

              {/* EN DIRECTO Button with interactive live indicator */}
              <button
                onClick={() => {
                  if (onToggleLiveRadio) {
                    onToggleLiveRadio();
                  } else if (onOpenRadioStations) {
                    onOpenRadioStations();
                  }
                }}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-black tracking-wider uppercase shadow-xs transition active:scale-95 cursor-pointer ${
                  isRadioLive
                    ? "bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-300"
                    : "bg-[#e62b1e] hover:bg-[#c92418]"
                }`}
                title={isRadioLive ? "Radio en vivo sintonizada (clic para pausar o cambiar)" : "Escuchar la radio en directo"}
              >
                <span className={`w-2 h-2 rounded-full ${isRadioLive ? "bg-white animate-ping" : "bg-white animate-pulse"}`} />
                <span>{isRadioLive ? "RADIO EN VIVO" : "EN VIVO"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Big Brand Title with custom logo watermark and clean typography */}
      <div className="bg-white py-3 sm:py-4 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-3 justify-center mb-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#e62b1e] uppercase">
              LA LISTA DE LOS ÉXITOS
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-500">
            HITLIST ESPAÑA • El ranking musical de mayor impacto del 40 al 1
          </p>
        </div>
      </div>

      {/* Subnav Pills Bar (Top 40 al 1 | La Lista de los Éxitos | Números 1 | Listas anteriores | Mayores subidas...) */}
      <div className="bg-white overflow-x-auto scrollbar-none py-2.5 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 sm:gap-2.5">
          {navPills.map((pill) => {
            const Icon = pill.icon;
            const isSelected = activeFilterTab === pill.id;

            return (
              <button
                key={pill.id}
                onClick={() => {
                  if (pill.id === "listas-anteriores") {
                    onOpenWeekSelector();
                  } else {
                    onSelectFilterTab(pill.id);
                  }
                }}
                className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#e62b1e] text-white shadow-xs"
                    : "bg-[#f4f5f7] hover:bg-[#e9ebef] text-slate-700"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
