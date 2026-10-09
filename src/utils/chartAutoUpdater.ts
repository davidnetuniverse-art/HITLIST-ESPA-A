import { Song, WeekEdition, Genre } from "../types";

export const RESERVE_CANDIDATE_POOL: Song[] = [
  {
    id: "reserve-apt-rose-bruno",
    title: "APT.",
    artist: "ROSÉ & Bruno Mars",
    genre: "Pop",
    votes: 28410,
    previousRank: 0,
    currentRank: 0,
    weeksOnChart: 0,
    peakRank: 0,
    albumCover:
      "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/2d/1a/7d/2d1a7d91-587e-0ceb-d434-327bd66d9e86/075679628312.jpg/600x600bb.jpg",
    audioPreviewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/7a/15/38/7a1538f3-f41a-a2eb-0f24-8eb6712ee043/mzaf_7740628412097685267.plus.aac.p.m4a",
    duration: 30,
    bpm: 145,
    musicalKey: "C Major",
    synthStyle: "pop-dance",
    isCandidate: true,
    badge: "nuevo",
    description: "Fenómeno global y aspirante directa al Top 40 de HITLIST España. ¡Vota por ella!",
  },
  {
    id: "reserve-si-antes-te-hubiera-conocido",
    title: "Si Antes Te Hubiera Conocido",
    artist: "Karol G",
    genre: "Latino",
    votes: 31200,
    previousRank: 0,
    currentRank: 0,
    weeksOnChart: 0,
    peakRank: 0,
    albumCover:
      "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/a0/60/94/a060947c-54d8-0fad-c558-eed12600224c/24UMGIM62705.rgb.jpg/600x600bb.jpg",
    audioPreviewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/0f/07/33/0f0733c9-76b3-39f9-9115-9031acd75839/mzaf_249954100848422596.plus.aac.p.m4a",
    duration: 30,
    bpm: 128,
    musicalKey: "D Minor",
    synthStyle: "latin-groove",
    isCandidate: true,
    badge: "nuevo",
    description: "Éxito veraniego y merengue internacional candidato a la lista oficial.",
  },
  {
    id: "reserve-gata-only",
    title: "Gata Only",
    artist: "FloyyMenor & Cris Mj",
    genre: "Urbano",
    votes: 27950,
    previousRank: 0,
    currentRank: 0,
    weeksOnChart: 0,
    peakRank: 0,
    albumCover:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ff/1b/f4/ff1bf4af-9b8e-b616-2dce-8c41cd292d68/5063535181519_cover.jpg/600x600bb.jpg",
    audioPreviewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/50/18/a7/5018a78a-ee4a-301b-b844-ef38d21f3aa7/mzaf_1766887114284967318.plus.aac.p.m4a",
    duration: 30,
    bpm: 100,
    musicalKey: "F Minor",
    synthStyle: "urban-reggaeton",
    isCandidate: true,
    badge: "nuevo",
    description: "Himno urbano que arrasa en streaming en España y candidato a entrar al ranking.",
  },
  {
    id: "reserve-we-cant-be-friends",
    title: "We Can't Be Friends (Wait for Your Love)",
    artist: "Ariana Grande",
    genre: "Pop",
    votes: 26140,
    previousRank: 0,
    currentRank: 0,
    weeksOnChart: 0,
    peakRank: 0,
    albumCover:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/7e/e6/82/7ee682bd-1b17-6adc-be63-b5af1bdff369/26UMGIM51126.rgb.jpg/600x600bb.jpg",
    audioPreviewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/66/1b/41/661b41bb-9464-96fe-4f11-73934d40e945/mzaf_10012228551410667950.plus.aac.p.m4a",
    duration: 30,
    bpm: 116,
    musicalKey: "F Major",
    synthStyle: "pop-dance",
    isCandidate: true,
    badge: "nuevo",
    description: "Pop electrónico atmosférico candidato a entrar a la lista oficial.",
  },
];

const MONTH_NAMES_ES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

/**
 * Calculates start and end Saturday dates for a given week number in 2026.
 * Week 40 benchmark: Saturday 3 Oct 2026 10:00 to Saturday 10 Oct 2026 10:00.
 */
export function getWeekSchedule(weekNumber: number, year: number = 2026) {
  // Base: Week 40 in 2026 starts Saturday Oct 3 at 10:00:00 (Month 9 is October in 0-indexed Date)
  const baseWeek40Start = new Date(year, 9, 3, 10, 0, 0, 0);
  const weekDiffDays = (weekNumber - 40) * 7;

  const startDate = new Date(baseWeek40Start.getTime() + weekDiffDays * 24 * 60 * 60 * 1000);
  const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

  const startDay = String(startDate.getDate()).padStart(2, "0");
  const startMonth = MONTH_NAMES_ES[startDate.getMonth()];

  const endDay = String(endDate.getDate()).padStart(2, "0");
  const endMonth = MONTH_NAMES_ES[endDate.getMonth()];

  const dates = `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
  const label = `Semana ${weekNumber} (${startDay} ${startMonth} - ${endDay} ${endMonth})`;

  return {
    weekNumber,
    year,
    startDate,
    endDate,
    dates,
    label,
  };
}

/**
 * Checks if a week has expired compared to the given date (defaulting to current date).
 */
export function isWeekExpired(week: WeekEdition, compareDate: Date = new Date()): boolean {
  const schedule = getWeekSchedule(week.number, week.year);
  return compareDate.getTime() >= schedule.endDate.getTime();
}

/**
 * Formats countdown time remaining until next Saturday 10:00 AM release.
 */
export function getCountdownUntil(targetDate: Date, fromDate: Date = new Date()) {
  const diffMs = targetDate.getTime() - fromDate.getTime();
  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formatted: "¡Es hora de la nueva lista oficial!",
      isExpired: true,
    };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  let formatted = "";
  if (days > 0) {
    formatted = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  } else if (hours > 0) {
    formatted = `${hours}h ${minutes}m ${seconds}s`;
  } else {
    formatted = `${minutes}m ${seconds}s`;
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    formatted,
    isExpired: false,
  };
}

/**
 * Generates the next week edition from the current active week.
 * Simulates realistic music chart progression, crowning the winner,
 * entering the top voted candidate, calculating movements, and assigning badges.
 */
export function generateNextWeekEdition(
  currentWeek: WeekEdition,
  currentCandidates: Song[]
): {
  newWeek: WeekEdition;
  updatedCandidates: Song[];
  closedWeek: WeekEdition;
  winnerSong: Song;
} {
  const nextWeekNumber = currentWeek.number + 1;
  const nextSchedule = getWeekSchedule(nextWeekNumber, currentWeek.year);

  // 1. Identify the crowned winner of the closing week
  const sortedCurrentSongs = [...currentWeek.songs].sort((a, b) => b.votes - a.votes);
  const winnerSong = sortedCurrentSongs[0] || currentWeek.songs[0];

  const closedWeek: WeekEdition = {
    ...currentWeek,
    status: "closed",
    winnerId: winnerSong.id,
  };

  // 2. Select top candidate to enter the chart
  let promotedCandidate: Song | null = null;
  let remainingCandidates = [...currentCandidates];

  if (remainingCandidates.length > 0) {
    // Sort candidate by votes
    remainingCandidates.sort((a, b) => b.votes - a.votes);
    promotedCandidate = remainingCandidates[0];
    remainingCandidates = remainingCandidates.slice(1);

    // Replenish candidates pool from reserve pool if needed
    const usedIds = new Set([
      ...currentWeek.songs.map((s) => s.id),
      ...remainingCandidates.map((c) => c.id),
      promotedCandidate.id,
    ]);
    const reserveCandidate = RESERVE_CANDIDATE_POOL.find((r) => !usedIds.has(r.id));
    if (reserveCandidate) {
      remainingCandidates.push({
        ...reserveCandidate,
        votes: Math.floor(Math.random() * 5000) + 20000,
      });
    }
  }

  // 3. Evolve existing songs for the new week
  // The bottom song with high weeksOnChart exits to allow candidate entry
  let survivingSongs = [...currentWeek.songs].sort((a, b) => a.currentRank - b.currentRank);

  if (promotedCandidate && survivingSongs.length >= 40) {
    // Drop the song ranked 40th or lowest score
    survivingSongs = survivingSongs.slice(0, 39);
  }

  // Compute momentum score for surviving songs:
  // Songs with high votes or recent climbs gain momentum
  const scoredSongs = survivingSongs.map((song) => {
    // Random momentum variation between -3 and +4
    const momentum = Math.floor(Math.random() * 8) - 3;
    const baseRank = song.currentRank;
    const projectedRank = Math.max(1, Math.min(40, baseRank - momentum));

    return {
      song,
      projectedRank,
    };
  });

  // Sort by projected rank
  scoredSongs.sort((a, b) => a.projectedRank - b.projectedRank);

  // Re-index ranks 1 through 39 (or 40)
  const evolvedSongs: Song[] = scoredSongs.map((entry, index) => {
    const newRank = index + 1;
    const oldSong = entry.song;
    const climb = oldSong.currentRank - newRank;

    // Base votes scale realistically from ~82,000 (#1) down to ~35,000 (#40)
    const baseVotes = Math.max(
      32000,
      Math.floor(82000 - (newRank - 1) * 1150 + (Math.random() * 800 - 400))
    );

    return {
      ...oldSong,
      id: `official-${currentWeek.year}-w${nextWeekNumber}-${newRank}`,
      previousRank: oldSong.currentRank,
      currentRank: newRank,
      weeksOnChart: oldSong.weeksOnChart + 1,
      peakRank: Math.min(oldSong.peakRank || 40, newRank),
      votes: baseVotes,
      badge: undefined,
      description: `Posición #${newRank} en la lista oficial de HITLIST de España. ${oldSong.weeksOnChart + 1} semanas en lista con un pico en el #${Math.min(oldSong.peakRank || 40, newRank)}.`,
    };
  });

  // Add the promoted candidate at position 40 (or 39/40)
  if (promotedCandidate) {
    const candidateEntryRank = evolvedSongs.length + 1;
    const newEntrySong: Song = {
      ...promotedCandidate,
      id: `official-${currentWeek.year}-w${nextWeekNumber}-${candidateEntryRank}`,
      previousRank: 0,
      currentRank: candidateEntryRank,
      weeksOnChart: 1,
      peakRank: candidateEntryRank,
      votes: 31500 + Math.floor(Math.random() * 2000),
      isCandidate: false,
      badge: "nuevo",
      description: `¡Nueva entrada directa en el ranking oficial de HITLIST tras ganar los votos de los oyentes!`,
    };
    evolvedSongs.push(newEntrySong);
  }

  // 4. Assign badges:
  // - Top 1 badge
  if (evolvedSongs[0]) {
    evolvedSongs[0].badge = "top-1";
    evolvedSongs[0].description = `¡Nuevo Número 1 de la lista oficial de España! Conquistando la cima con el apoyo de los oyentes.`;
  }

  // - Super-subida badge: Find song with greatest positive climb
  let maxClimb = 0;
  let bestClimberIndex = -1;
  evolvedSongs.forEach((song, idx) => {
    if (song.previousRank > 0) {
      const climb = song.previousRank - song.currentRank;
      if (climb > maxClimb) {
        maxClimb = climb;
        bestClimberIndex = idx;
      }
    }
  });

  if (bestClimberIndex > 0 && maxClimb >= 2) {
    evolvedSongs[bestClimberIndex].badge = "super-subida";
    evolvedSongs[bestClimberIndex].description = `¡SUPER-SUBIDA de la semana! Sube ${maxClimb} puestos desde el #${evolvedSongs[bestClimberIndex].previousRank} hasta el #${evolvedSongs[bestClimberIndex].currentRank}.`;
  }

  const totalWeekVotes = evolvedSongs.reduce((sum, s) => sum + s.votes, 0);

  const newWeek: WeekEdition = {
    id: `week-${nextWeekNumber}`,
    number: nextWeekNumber,
    year: currentWeek.year,
    label: `Semana ${nextWeekNumber} (Actual - ${nextSchedule.dates.split(" - ")[0]})`,
    dates: nextSchedule.dates,
    status: "voting",
    winnerId: evolvedSongs[0]?.id || "",
    totalVotes: totalWeekVotes,
    songs: evolvedSongs,
  };

  return {
    newWeek,
    updatedCandidates: remainingCandidates,
    closedWeek,
    winnerSong,
  };
}

/**
 * Checks whether the chart needs automatic weekly synchronization.
 * If the current real-world date has passed the current week's end date,
 * automatically advances week-by-week up to the current date.
 */
export function checkAndSyncWeeks(
  existingWeeks: WeekEdition[],
  candidates: Song[],
  currentDate: Date = new Date(),
  autoUpdateEnabled: boolean = true
): {
  weeks: WeekEdition[];
  candidates: Song[];
  hasUpdated: boolean;
  newWeekId?: string;
  crownedSong?: Song;
} {
  if (!autoUpdateEnabled || existingWeeks.length === 0) {
    return {
      weeks: existingWeeks,
      candidates,
      hasUpdated: false,
    };
  }

  let currentWeeks = [...existingWeeks];
  let currentCandidates = [...candidates];
  let hasUpdated = false;
  let latestCrownedSong: Song | undefined = undefined;
  let latestNewWeekId: string | undefined = undefined;

  // Find latest week
  let latestWeek = currentWeeks[0];
  let safetyLoop = 0;

  // While current date is past latestWeek's schedule end date
  while (isWeekExpired(latestWeek, currentDate) && safetyLoop < 12) {
    safetyLoop++;
    const { newWeek, updatedCandidates, closedWeek, winnerSong } = generateNextWeekEdition(
      latestWeek,
      currentCandidates
    );

    // Replace previous active week with closed version and prepend new active week
    currentWeeks = [
      newWeek,
      closedWeek,
      ...currentWeeks.slice(1).map((w) => (w.id === closedWeek.id ? closedWeek : w)),
    ];

    // Remove duplicates if any
    const seen = new Set<string>();
    currentWeeks = currentWeeks.filter((w) => {
      if (seen.has(w.id)) return false;
      seen.add(w.id);
      return true;
    });

    currentCandidates = updatedCandidates;
    latestWeek = newWeek;
    hasUpdated = true;
    latestCrownedSong = winnerSong;
    latestNewWeekId = newWeek.id;
  }

  return {
    weeks: currentWeeks,
    candidates: currentCandidates,
    hasUpdated,
    newWeekId: latestNewWeekId,
    crownedSong: latestCrownedSong,
  };
}
