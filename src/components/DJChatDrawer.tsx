import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Radio,
  Sparkles,
  RotateCcw,
  Volume2,
  TrendingUp,
  Award,
} from "lucide-react";
import { Song, WeekEdition } from "../types";

interface ChatMessage {
  id: string;
  role: "user" | "dj";
  text: string;
  timestamp: string;
  suggestedAction?: {
    type: "play" | "vote";
    songId?: string;
    label: string;
  };
}

interface DJChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeek: WeekEdition;
  topSong: Song | null;
  top5: Song[];
  onPlaySong: (song: Song) => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "init-1",
    role: "dj",
    text: "¡Hola! Soy tu DJ y locutor oficial en directo de LA LISTA DE LOS ÉXITOS en HITLIST España. ¿Quieres saber cómo va la batalla por el Número 1, qué canciones son las mayores subidas de la semana o pedirme una recomendación musical?",
    timestamp: "Ahora",
  },
];

export const DJChatDrawer: React.FC<DJChatDrawerProps> = ({
  isOpen,
  onClose,
  currentWeek,
  topSong,
  top5,
  onPlaySong,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: "usr_" + Date.now(),
      role: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
          chartContext: {
            week: currentWeek.label,
            topSong: topSong
              ? { title: topSong.title, artist: topSong.artist, votes: topSong.votes }
              : null,
            top5: top5.map((s) => ({
              title: s.title,
              artist: s.artist,
              votes: s.votes,
            })),
          },
        }),
      });

      const data = await response.json();
      const replyText =
        data.reply ||
        data.fallbackReply ||
        "¡Vaya temazo! Sigue votando y apoyando a tus artistas favoritos en HITLIST España.";

      const djMsg: ChatMessage = {
        id: "dj_" + Date.now(),
        role: "dj",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, djMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: "dj_err_" + Date.now(),
        role: "dj",
        text: "¡Parece que tenemos una pequeña interferencia en la antena! Pero no pares: HITLIST España sigue sonando a tope y tus votos son los que deciden quién reinará.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-md bg-white border-l border-slate-200 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-[#e62b1e] flex items-center justify-center text-white shadow-xs">
                <Radio className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-900">DJ Locutor AI</h3>
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-red-100 text-[#e62b1e] border border-red-200 uppercase">
                  EN EL AIRE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                HITLIST España • Asistente musical interactivo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleResetChat}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
              title="Reiniciar conversación"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Top Song quick card */}
        {topSong && (
          <div className="bg-red-50/70 border-b border-red-100 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Award className="w-4 h-4 text-[#e62b1e] shrink-0" />
              <div className="truncate">
                <span className="font-black text-[#e62b1e] mr-1">Nº 1 Actual:</span>
                <span className="font-semibold text-slate-800">{topSong.title}</span>
                <span className="text-slate-500 text-[11px] ml-1">({topSong.artist})</span>
              </div>
            </div>
            <button
              onClick={() => onPlaySong(topSong)}
              className="text-[#e62b1e] hover:underline font-bold text-[11px] shrink-0 flex items-center gap-0.5 ml-2"
            >
              <Volume2 className="w-3 h-3" /> Escuchar
            </button>
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9fa]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[10px] font-bold text-slate-400">
                  {m.role === "user" ? "Tú" : "DJ HITLIST"}
                </span>
                <span className="text-[10px] text-slate-400">{m.timestamp}</span>
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  m.role === "user"
                    ? "bg-[#e62b1e] text-white rounded-br-none"
                    : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-none"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[10px] font-bold text-[#e62b1e]">DJ Locutor</span>
                <span className="text-[10px] text-slate-400">escribiendo...</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#e62b1e] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#e62b1e] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-[#e62b1e] animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() =>
              handleSendMessage("¿Quién lidera la lista oficial esta semana?")
            }
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 whitespace-nowrap transition border border-slate-200 font-medium"
          >
            👑 ¿Quién es el Nº 1?
          </button>
          <button
            onClick={() =>
              handleSendMessage("¿Cuáles son los temas más votados del momento?")
            }
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 whitespace-nowrap transition border border-slate-200 font-medium"
          >
            🔥 Top más votados
          </button>
          <button
            onClick={() =>
              handleSendMessage("Recomiéndame una canción para votar hoy")
            }
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 whitespace-nowrap transition border border-slate-200 font-medium"
          >
            🎧 Recomiéndame
          </button>
        </div>

        {/* Input form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Pregúntale al DJ sobre la lista o los artistas..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-100 border border-slate-200 rounded-full px-4 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#e62b1e] focus:bg-white transition"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="w-9 h-9 rounded-full bg-[#e62b1e] hover:bg-[#c92418] disabled:opacity-40 text-white flex items-center justify-center shrink-0 shadow-xs transition"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
