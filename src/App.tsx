import { useState, useEffect, useMemo, useCallback } from "react";
import { Header } from "./components/Header";
import { ChartList } from "./components/ChartList";
import { AudioPlayerBar } from "./components/AudioPlayerBar";
import { DJChatDrawer } from "./components/DJChatDrawer";
import { WeekSelectorModal } from "./components/WeekSelectorModal";
import { CrowningModal } from "./components/CrowningModal";
import { RadioStationsModal } from "./components/RadioStationsModal";
import { WeeklyAutoUpdateBar } from "./components/WeeklyAutoUpdateBar";
import { AutoUpdateModal } from "./components/AutoUpdateModal";
import { INITIAL_WEEKS, CANDIDATE_SONGS } from "./data/initialData";
import { Song, WeekEdition } from "./types";
import { soundEngine, SoundEngine, RadioStation } from "./audio/soundEngine";
import {
  checkAndSyncWeeks,
  generateNextWeekEdition,
  getWeekSchedule,
  getCountdownUntil,
} from "./utils/chartAutoUpdater";
import { HeartHandshake } from "lucide-react";

const STORAGE_KEYS = {
  WEEKS: "hitlist_weeks_v2",
  CURRENT_WEEK: "hitlist_current_week_id_v2",
  CANDIDATES: "hitlist_candidates_v2",
  AUTO_UPDATE: "hitlist_auto_update_enabled_v2",
};

export default function App() {
  // Weeks with LocalStorage persistence
  const [weeks, setWeeks] = useState<WeekEdition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WEEKS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Storage error reading weeks:", e);
    }
    return INITIAL_WEEKS;
  });

  const [currentWeekId, setCurrentWeekId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_WEEK);
      if (saved) return saved;
    } catch (e) {}
    return "week-40";
  });

  const [candidateSongs, setCandidateSongs] = useState<Song[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return CANDIDATE_SONGS;
  });

  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTO_UPDATE);
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return true;
  });

  const [activeFilterTab, setActiveFilterTab] = useState<string>("lista-completa");

  // Playback state
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);

  // Live Radio state
  const [isRadioLive, setIsRadioLive] = useState<boolean>(false);
  const [currentStationName, setCurrentStationName] = useState<string | null>(null);
  const [currentStationId, setCurrentStationId] = useState<string>("hitlist-main");
  const [isRadioModalOpen, setIsRadioModalOpen] = useState<boolean>(false);

  // Voting state
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [userVotesRemaining, setUserVotesRemaining] = useState<number>(10);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals & Chat state
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isWeekModalOpen, setIsWeekModalOpen] = useState<boolean>(false);
  const [isCrowningModalOpen, setIsCrowningModalOpen] = useState<boolean>(false);
  const [isAutoUpdateModalOpen, setIsAutoUpdateModalOpen] = useState<boolean>(false);
  const [crownedSong, setCrownedSong] = useState<Song | null>(null);

  // Active week object
  const currentWeek = useMemo(() => {
    return weeks.find((w) => w.id === currentWeekId) || weeks[0];
  }, [weeks, currentWeekId]);

  // Current songs sorted by rank
  const activeSongs = useMemo(() => {
    return [...currentWeek.songs].sort((a, b) => a.currentRank - b.currentRank);
  }, [currentWeek]);

  // The official #1 song
  const topSong = useMemo(() => {
    return activeSongs.find((s) => s.currentRank === 1) || activeSongs[0] || null;
  }, [activeSongs]);

  // Top 5 songs for DJ context
  const top5Songs = useMemo(() => {
    return activeSongs.slice(0, 5);
  }, [activeSongs]);

  // Total votes in the active week
  const totalWeekVotes = useMemo(() => {
    return activeSongs.reduce((acc, curr) => acc + curr.votes, 0);
  }, [activeSongs]);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WEEKS, JSON.stringify(weeks));
      localStorage.setItem(STORAGE_KEYS.CURRENT_WEEK, currentWeekId);
      localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidateSongs));
      localStorage.setItem(STORAGE_KEYS.AUTO_UPDATE, JSON.stringify(autoUpdateEnabled));
    } catch (e) {
      console.warn("Error saving to localStorage:", e);
    }
  }, [weeks, currentWeekId, candidateSongs, autoUpdateEnabled]);

  // Notification Toast Helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  // Schedule and live countdown calculation
  const latestWeek = weeks[0] || INITIAL_WEEKS[0];
  const targetSchedule = useMemo(() => {
    return getWeekSchedule(latestWeek.number, latestWeek.year);
  }, [latestWeek]);

  const [countdown, setCountdown] = useState(() => getCountdownUntil(targetSchedule.endDate));

  // Advance week handler
  const handleSimulateAdvanceWeek = useCallback(
    (isAutomatic: boolean = false) => {
      const activeW = weeks.find((w) => w.id === currentWeekId) || weeks[0];
      const { newWeek, updatedCandidates, closedWeek, winnerSong } = generateNextWeekEdition(
        activeW,
        candidateSongs
      );

      const updatedWeeks = [
        newWeek,
        closedWeek,
        ...weeks.slice(1).map((w) => (w.id === closedWeek.id ? closedWeek : w)),
      ];

      const seen = new Set<string>();
      const cleanWeeks = updatedWeeks.filter((w) => {
        if (seen.has(w.id)) return false;
        seen.add(w.id);
        return true;
      });

      setWeeks(cleanWeeks);
      setCandidateSongs(updatedCandidates);
      setCurrentWeekId(newWeek.id);
      setCrownedSong(winnerSong);
      setIsCrowningModalOpen(true);

      soundEngine.playJingle(() => {
        const nextTopSong = newWeek.songs[0];
        if (nextTopSong) {
          handlePlaySong(nextTopSong);
        }
      });

      if (isAutomatic) {
        showToast(`🎉 ¡Lista renovada automáticamente! Ahora en la ${newWeek.label}`);
      } else {
        showToast(`⚡ ¡Semana avanzada! Bienvenido a la ${newWeek.label}`);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weeks, currentWeekId, candidateSongs, showToast]
  );

  // Auto-sync on mount with real calendar date
  useEffect(() => {
    if (!autoUpdateEnabled) return;
    const syncResult = checkAndSyncWeeks(weeks, candidateSongs, new Date(), true);
    if (syncResult.hasUpdated) {
      setWeeks(syncResult.weeks);
      setCandidateSongs(syncResult.candidates);
      if (syncResult.newWeekId) {
        setCurrentWeekId(syncResult.newWeekId);
      }
      showToast("🎉 ¡Lista oficial actualizada automáticamente para la nueva semana! 📻");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ticking countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const updated = getCountdownUntil(targetSchedule.endDate);
      setCountdown(updated);

      if (updated.isExpired && autoUpdateEnabled && latestWeek.status === "voting") {
        handleSimulateAdvanceWeek(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetSchedule, autoUpdateEnabled, latestWeek, handleSimulateAdvanceWeek]);

  // Reset to default official data
  const handleResetToDefault = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.WEEKS);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_WEEK);
      localStorage.removeItem(STORAGE_KEYS.CANDIDATES);
    } catch (e) {}
    setWeeks(INITIAL_WEEKS);
    setCandidateSongs(CANDIDATE_SONGS);
    setCurrentWeekId("week-40");
    showToast("Lista restablecida a los valores oficiales por defecto");
  }, [showToast]);

  // Subscribe to live radio changes
  useEffect(() => {
    soundEngine.setRadioStatusListener((isLive, stationName) => {
      setIsRadioLive(isLive);
      setCurrentStationName(stationName);
      if (isLive) {
        setIsPlaying(true);
      }
    });
  }, []);

  // Audio Playback Handlers
  const handlePlaySong = useCallback(
    (song: Song) => {
      setIsRadioLive(false);
      setCurrentSong(song);
      setIsPlaying(true);
      soundEngine.playSong(
        song,
        0,
        (time) => setCurrentTime(time),
        () => {
          handleNextSong();
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeSongs]
  );

  const handlePauseSong = useCallback(() => {
    setIsPlaying(false);
    if (isRadioLive) {
      soundEngine.stopRadio();
      setIsRadioLive(false);
    } else {
      soundEngine.pause();
    }
  }, [isRadioLive]);

  const handleResumeSong = useCallback(() => {
    if (isRadioLive) {
      soundEngine.playRadioStream(currentStationId);
      setIsPlaying(true);
    } else if (currentSong) {
      setIsPlaying(true);
      soundEngine.resume();
    }
  }, [isRadioLive, currentStationId, currentSong]);

  // Live Radio Streaming Handlers
  const handleStartRadio = useCallback(
    (stationId: string = "hitlist-main") => {
      setCurrentStationId(stationId);
      const station =
        SoundEngine.RADIO_STATIONS.find((s: RadioStation) => s.id === stationId) ||
        SoundEngine.RADIO_STATIONS[0];

      showToast(`Sintonizando ${station.name}...`);

      soundEngine.playRadioStream(
        stationId,
        (name) => {
          setIsRadioLive(true);
          setIsPlaying(true);
          setCurrentStationName(name);
          showToast(`¡Conectado en directo a ${name}! 📻`);
        },
        (err) => {
          console.warn("Radio stream error:", err);
          showToast("Conectando con señal alternativa en directo...");
        }
      );
    },
    [showToast]
  );

  const handleToggleLiveRadio = useCallback(() => {
    if (isRadioLive && isPlaying) {
      soundEngine.stopRadio();
      setIsRadioLive(false);
      setIsPlaying(false);
      showToast("Emisión de radio en pausa");
    } else {
      handleStartRadio(currentStationId);
    }
  }, [isRadioLive, isPlaying, currentStationId, handleStartRadio, showToast]);

  const handleSeek = useCallback((newTime: number) => {
    setCurrentTime(newTime);
    soundEngine.seek(newTime);
  }, []);

  const handleVolumeChange = useCallback((newVol: number) => {
    setVolume(newVol);
    soundEngine.setVolume(newVol);
  }, []);

  const handleNextSong = useCallback(() => {
    if (!currentSong || activeSongs.length === 0) return;
    const currentIndex = activeSongs.findIndex((s) => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % activeSongs.length;
    handlePlaySong(activeSongs[nextIndex]);
  }, [currentSong, activeSongs, handlePlaySong]);

  const handlePrevSong = useCallback(() => {
    if (!currentSong || activeSongs.length === 0) return;
    const currentIndex = activeSongs.findIndex((s) => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + activeSongs.length) % activeSongs.length;
    handlePlaySong(activeSongs[prevIndex]);
  }, [currentSong, activeSongs, handlePlaySong]);

  // Voting Handler
  const handleVote = useCallback(
    (songId: string) => {
      soundEngine.playVoteChime();

      const isCandidate = candidateSongs.some((s) => s.id === songId);

      if (isCandidate) {
        setCandidateSongs((prev) =>
          prev.map((c) => (c.id === songId ? { ...c, votes: c.votes + 1 } : c))
        );
        setUserVotes((prev) => ({ ...prev, [songId]: (prev[songId] || 0) + 1 }));
        setUserVotesRemaining((prev) => Math.max(0, prev - 1));
        showToast("¡Voto registrado para la canción candidata!");
        return;
      }

      // Chart vote
      setWeeks((prevWeeks) =>
        prevWeeks.map((week) => {
          if (week.id !== currentWeekId) return week;

          const updatedSongs = week.songs.map((song) => {
            if (song.id === songId) {
              return { ...song, votes: song.votes + 1 };
            }
            return song;
          });

          // Sort by votes to recalculate positions dynamically
          const sorted = [...updatedSongs].sort((a, b) => b.votes - a.votes);
          const reRanked = sorted.map((song, idx) => {
            const newRank = idx + 1;
            return {
              ...song,
              currentRank: newRank,
              badge:
                newRank === 1
                  ? ("top-1" as const)
                  : song.badge === "top-1"
                  ? undefined
                  : song.badge,
            };
          });

          return {
            ...week,
            totalVotes: week.totalVotes + 1,
            winnerId: reRanked[0]?.id || week.winnerId,
            songs: reRanked,
          };
        })
      );

      setUserVotes((prev) => ({ ...prev, [songId]: (prev[songId] || 0) + 1 }));
      setUserVotesRemaining((prev) => (prev > 0 ? prev - 1 : 10));

      const targetSong = activeSongs.find((s) => s.id === songId);
      if (targetSong) {
        showToast(`¡Votaste por "${targetSong.title}"! (+1 Voto)`);
      }
    },
    [candidateSongs, currentWeekId, activeSongs, showToast]
  );

  // Simulate Week Closing Ceremony
  const handleSimulateCloseWeek = useCallback(() => {
    const winner = activeSongs.reduce(
      (prev, curr) => (curr.votes > prev.votes ? curr : prev),
      activeSongs[0]
    );

    setCrownedSong(winner);
    setIsCrowningModalOpen(true);

    soundEngine.playJingle(() => {
      handlePlaySong(winner);
    });

    showToast(`¡Semana cerrada! "${winner.title}" proclamada como el Número 1.`);
  }, [activeSongs, handlePlaySong, showToast]);

  // Reset user votes
  const handleResetVotes = useCallback(() => {
    setUserVotesRemaining(10);
    showToast("¡Has recargado 10 votos nuevos!");
  }, [showToast]);

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-slate-900 flex flex-col font-sans selection:bg-[#e62b1e] selection:text-white pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 text-white text-xs sm:text-sm font-semibold shadow-2xl animate-in fade-in slide-in-from-top-2">
          <HeartHandshake className="w-4 h-4 text-[#e62b1e]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Official Header */}
      <Header
        currentWeek={currentWeek}
        topSong={topSong}
        totalVotes={totalWeekVotes}
        userVotesRemaining={userVotesRemaining}
        isChatOpen={isChatOpen}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        onOpenWeekSelector={() => setIsWeekModalOpen(true)}
        onSimulateCloseWeek={handleSimulateCloseWeek}
        onResetVotes={handleResetVotes}
        activeFilterTab={activeFilterTab}
        onSelectFilterTab={setActiveFilterTab}
        isRadioLive={isRadioLive}
        onToggleLiveRadio={handleToggleLiveRadio}
        onOpenRadioStations={() => setIsRadioModalOpen(true)}
      />

      {/* Weekly Auto-Update & Real-Time Countdown Bar */}
      <WeeklyAutoUpdateBar
        currentWeek={currentWeek}
        countdownFormatted={countdown.formatted}
        isExpired={countdown.isExpired}
        autoUpdateEnabled={autoUpdateEnabled}
        onOpenOptions={() => setIsAutoUpdateModalOpen(true)}
        onSimulateAdvanceWeek={() => handleSimulateAdvanceWeek(false)}
      />

      {/* Main Broadcast Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Official Chart List Table matching screenshot */}
        <ChartList
          songs={activeSongs}
          candidateSongs={candidateSongs}
          currentPlayingId={currentSong?.id || null}
          isPlaying={isPlaying}
          totalVotes={totalWeekVotes}
          userVotes={userVotes}
          activeFilterTab={activeFilterTab}
          onSelectFilterTab={setActiveFilterTab}
          onPlaySong={handlePlaySong}
          onPauseSong={handlePauseSong}
          onVote={handleVote}
          currentWeekDates={currentWeek.dates}
        />
      </main>

      {/* Bottom Sticky Player Bar matching official broadcast player */}
      <AudioPlayerBar
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        volume={volume}
        onPlay={handleResumeSong}
        onPause={handlePauseSong}
        onSeek={handleSeek}
        onNext={handleNextSong}
        onPrev={handlePrevSong}
        onVolumeChange={handleVolumeChange}
        onVote={handleVote}
        isRadioLive={isRadioLive}
        currentStationName={currentStationName}
        onToggleLiveRadio={handleToggleLiveRadio}
        onOpenRadioStations={() => setIsRadioModalOpen(true)}
      />

      {/* Radio Stations Selector Modal */}
      <RadioStationsModal
        isOpen={isRadioModalOpen}
        onClose={() => setIsRadioModalOpen(false)}
        isRadioLive={isRadioLive}
        currentStationId={currentStationId}
        onSelectStation={(stationId) => {
          handleStartRadio(stationId);
          setIsRadioModalOpen(false);
        }}
        onStopRadio={() => {
          soundEngine.stopRadio();
          setIsRadioLive(false);
          setIsPlaying(false);
          showToast("Radio en vivo detenida");
        }}
      />

      {/* DJ 40 Chatbot Drawer */}
      <DJChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentWeek={currentWeek}
        topSong={topSong}
        top5={top5Songs}
        onPlaySong={handlePlaySong}
      />

      {/* Week Selector Modal */}
      <WeekSelectorModal
        isOpen={isWeekModalOpen}
        onClose={() => setIsWeekModalOpen(false)}
        weeks={weeks}
        currentWeekId={currentWeekId}
        onSelectWeek={(wId) => {
          setCurrentWeekId(wId);
          const wObj = weeks.find((w) => w.id === wId);
          if (wObj) {
            const sortedW = [...wObj.songs].sort((a, b) => a.currentRank - b.currentRank);
            if (sortedW[0]) {
              handlePlaySong(sortedW[0]);
            }
          }
        }}
        onSimulateCloseWeek={handleSimulateCloseWeek}
        onSimulateAdvanceWeek={() => handleSimulateAdvanceWeek(false)}
        onPlayWinner={handlePlaySong}
      />

      {/* Crowning Winner Modal */}
      <CrowningModal
        isOpen={isCrowningModalOpen}
        onClose={() => setIsCrowningModalOpen(false)}
        winnerSong={crownedSong}
        weekLabel={currentWeek.label}
        onListenNow={handlePlaySong}
      />

      {/* Weekly Auto-Update Settings Modal */}
      <AutoUpdateModal
        isOpen={isAutoUpdateModalOpen}
        onClose={() => setIsAutoUpdateModalOpen(false)}
        autoUpdateEnabled={autoUpdateEnabled}
        onToggleAutoUpdate={() => {
          setAutoUpdateEnabled((prev) => {
            const next = !prev;
            showToast(
              next
                ? "Sincronización semanal automática activada"
                : "Sincronización semanal automática pausada"
            );
            return next;
          });
        }}
        onSimulateAdvanceWeek={() => handleSimulateAdvanceWeek(false)}
        onResetToDefault={handleResetToDefault}
        currentWeek={currentWeek}
        nextReleaseFormatted={targetSchedule.endDate.toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        })}
      />
    </div>
  );
}
