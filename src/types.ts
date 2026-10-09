export type Genre = "Pop" | "Urbano" | "Electrónica" | "Rock" | "Latino";

export interface Song {
  id: string;
  title: string;
  artist: string;
  genre: Genre;
  votes: number;
  previousRank: number;
  currentRank: number;
  weeksOnChart: number;
  peakRank: number;
  albumCover: string;
  audioPreviewUrl?: string; // Real 30-sec official audio preview from official iTunes/Apple catalog
  duration: number; // in seconds
  bpm: number;
  musicalKey: string;
  synthStyle: "pop-dance" | "urban-reggaeton" | "electro-house" | "indie-rock" | "latin-groove";
  isCandidate?: boolean;
  badge?: "super-subida" | "record" | "nuevo" | "top-1";
  description: string;
}

export interface WeekEdition {
  id: string;
  number: number;
  year: number;
  label: string;
  dates: string;
  status: "voting" | "closed";
  winnerId: string;
  totalVotes: number;
  songs: Song[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "dj";
  text: string;
  timestamp: string;
}
