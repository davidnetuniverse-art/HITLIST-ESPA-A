import { Song } from "../types";

export interface RadioStation {
  id: string;
  name: string;
  description: string;
  frequency: string;
  streamUrl: string;
  fallbackUrl?: string;
}

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentSong: Song | null = null;
  private currentPlaybackTime: number = 0;
  private timerId: any = null;
  private intervalStepId: any = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private onTimeUpdateCallback: ((time: number) => void) | null = null;
  private onEndCallback: (() => void) | null = null;

  // Real HTML5 audio element for actual song playback
  private audioElement: HTMLAudioElement | null = null;
  private audioSourceNode: MediaElementAudioSourceNode | null = null;
  private volumeLevel: number = 0.8;

  // Active oscillators/nodes for stopping cleanly (fallback synth)
  private activeNodes: (AudioNode | { stop?: () => void })[] = [];

  // Live radio station streaming state
  private isRadioLive: boolean = false;
  private currentRadioStation: { id: string; name: string; url: string } | null = null;
  private onRadioStatusCallback: ((isLive: boolean, stationName: string | null) => void) | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volumeLevel, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public setVolume(volume: number) {
    this.volumeLevel = Math.max(0, Math.min(1, volume));
    if (this.audioElement) {
      this.audioElement.volume = this.volumeLevel;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volumeLevel, this.ctx.currentTime);
    }
  }

  public playSong(
    song: Song,
    startFrom: number = 0,
    onTimeUpdate?: (time: number) => void,
    onEnd?: () => void
  ) {
    this.stop();
    this.initContext();

    this.currentSong = song;
    this.currentPlaybackTime = startFrom;
    this.isPlaying = true;
    this.onTimeUpdateCallback = onTimeUpdate || null;
    this.onEndCallback = onEnd || null;

    // Check if song has real audio preview URL
    if (song.audioPreviewUrl) {
      try {
        if (!this.audioElement) {
          this.audioElement = new Audio();
          this.audioElement.crossOrigin = "anonymous";
          
          // Connect real audio element to Web Audio analyser if possible
          if (this.ctx && this.masterGain) {
            try {
              this.audioSourceNode = this.ctx.createMediaElementSource(this.audioElement);
              this.audioSourceNode.connect(this.masterGain);
            } catch {
              // Ignore if already connected or CORS fallback
            }
          }
        }

        this.audioElement.src = song.audioPreviewUrl;
        this.audioElement.volume = this.volumeLevel;
        this.audioElement.currentTime = startFrom;

        this.audioElement.ontimeupdate = () => {
          if (this.audioElement && this.isPlaying) {
            this.currentPlaybackTime = this.audioElement.currentTime;
            if (this.onTimeUpdateCallback) {
              this.onTimeUpdateCallback(this.currentPlaybackTime);
            }
          }
        };

        this.audioElement.onended = () => {
          this.stop();
          if (this.onEndCallback) {
            this.onEndCallback();
          }
        };

        this.audioElement.onerror = () => {
          console.warn("Real audio preview failed, falling back to Web Audio synth for:", song.title);
          this.fallbackToSynthesizer(song, startFrom);
        };

        const playPromise = this.audioElement.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Audio playback interrupted or blocked:", err.message);
            this.fallbackToSynthesizer(song, startFrom);
          });
        }
        return;
      } catch (err) {
        console.warn("Error playing audio element:", err);
      }
    }

    // Fallback: Web Audio synth if no preview URL or playback failed
    this.fallbackToSynthesizer(song, startFrom);
  }

  private fallbackToSynthesizer(song: Song, startFrom: number) {
    if (!this.ctx || !this.masterGain) return;
    this.startSynthesizerLoop(song);

    this.intervalStepId = setInterval(() => {
      if (this.isPlaying && this.currentSong) {
        this.currentPlaybackTime += 0.25;
        if (this.onTimeUpdateCallback) {
          this.onTimeUpdateCallback(this.currentPlaybackTime);
        }
        if (this.currentPlaybackTime >= (this.currentSong.duration || 30)) {
          this.stop();
          if (this.onEndCallback) {
            this.onEndCallback();
          }
        }
      }
    }, 250);
  }

  public pause() {
    this.isPlaying = false;
    if (this.audioElement) {
      try {
        this.audioElement.pause();
      } catch {}
    }
    this.cleanupActiveNodes();
    if (this.intervalStepId) clearInterval(this.intervalStepId);
    if (this.timerId) clearInterval(this.timerId);
  }

  public resume() {
    if (this.currentSong && !this.isPlaying) {
      if (this.audioElement && this.currentSong.audioPreviewUrl) {
        this.isPlaying = true;
        this.audioElement.play().catch(() => {
          this.playSong(this.currentSong!, this.currentPlaybackTime, this.onTimeUpdateCallback || undefined, this.onEndCallback || undefined);
        });
      } else {
        this.playSong(
          this.currentSong,
          this.currentPlaybackTime,
          this.onTimeUpdateCallback || undefined,
          this.onEndCallback || undefined
        );
      }
    }
  }

  public seek(newTime: number) {
    if (this.currentSong) {
      this.currentPlaybackTime = Math.max(
        0,
        Math.min(newTime, this.currentSong.duration || 30)
      );
      if (this.audioElement && this.currentSong.audioPreviewUrl) {
        this.audioElement.currentTime = this.currentPlaybackTime;
      }
      if (this.isPlaying) {
        if (!this.audioElement || !this.currentSong.audioPreviewUrl) {
          this.playSong(
            this.currentSong,
            this.currentPlaybackTime,
            this.onTimeUpdateCallback || undefined,
            this.onEndCallback || undefined
          );
        }
      } else if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.currentPlaybackTime);
      }
    }
  }

  public stop() {
    this.isPlaying = false;
    this.isRadioLive = false;
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch {}
    }
    this.cleanupActiveNodes();
    if (this.intervalStepId) clearInterval(this.intervalStepId);
    if (this.timerId) clearInterval(this.timerId);
    this.currentPlaybackTime = 0;
    if (this.onRadioStatusCallback) {
      this.onRadioStatusCallback(false, null);
    }
  }

  // Live Radio stations available for real-time online broadcast
  public static readonly RADIO_STATIONS: RadioStation[] = [
    {
      id: "hitlist-main",
      name: "HITLIST España Éxitos",
      description: "Los mayores éxitos del 40 al 1 sin interrupciones",
      frequency: "93.9 FM",
      streamUrl: "https://stream.zeno.fm/f3wvbbqmdg8uv", // High-reliability top 40 pop hits live stream
      fallbackUrl: "https://icecast.skyrock.net/s/natio_mp3_128k",
    },
    {
      id: "hitlist-urban",
      name: "HITLIST Urbano & Latino",
      description: "Reggaeton, perreo y música urbana número uno",
      frequency: "101.4 FM",
      streamUrl: "https://stream.zeno.fm/6rrsmvrmdg8uv",
    },
    {
      id: "hitlist-dance",
      name: "HITLIST Dance & EDM",
      description: "Electrónica de club, dance y remixes oficiales",
      frequency: "104.2 FM",
      streamUrl: "https://stream.zeno.fm/0r0xa792kwzuv",
    },
  ];

  public getIsRadioLive(): boolean {
    return this.isRadioLive;
  }

  public getCurrentRadioStation(): { id: string; name: string; url: string } | null {
    return this.currentRadioStation;
  }

  public setRadioStatusListener(callback: (isLive: boolean, stationName: string | null) => void) {
    this.onRadioStatusCallback = callback;
  }

  // Connects and starts streaming a real live radio station
  public playRadioStream(
    stationId?: string,
    onSuccess?: (stationName: string) => void,
    onError?: (err: any) => void
  ) {
    this.stop();
    this.initContext();

    const station = SoundEngine.RADIO_STATIONS.find((s) => s.id === stationId) || SoundEngine.RADIO_STATIONS[0];
    this.currentRadioStation = { id: station.id, name: station.name, url: station.streamUrl };
    this.isRadioLive = true;
    this.isPlaying = true;

    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = "anonymous";
    }

    try {
      this.audioElement.src = station.streamUrl;
      this.audioElement.volume = this.volumeLevel;

      if (this.onRadioStatusCallback) {
        this.onRadioStatusCallback(true, station.name);
      }

      this.audioElement.onerror = () => {
        console.warn("Live stream primary failed, trying fallback stream...", station.name);
        if (station.fallbackUrl && this.audioElement) {
          this.audioElement.src = station.fallbackUrl;
          this.audioElement.play().catch((e) => {
            console.error("Radio stream fallback failed:", e);
            if (onError) onError(e);
          });
        } else if (onError) {
          onError("Stream unreachable");
        }
      };

      const promise = this.audioElement.play();
      if (promise !== undefined) {
        promise
          .then(() => {
            if (onSuccess) onSuccess(station.name);
          })
          .catch((err) => {
            console.warn("Autoplay was prevented or stream delayed:", err);
            // Retry with user interaction
            if (onError) onError(err);
          });
      }
    } catch (e) {
      console.error("Error setting up radio stream:", e);
      if (onError) onError(e);
    }
  }

  public stopRadio() {
    if (this.isRadioLive) {
      this.stop();
    }
  }

  private cleanupActiveNodes() {
    for (const node of this.activeNodes) {
      try {
        if ("stop" in node && typeof node.stop === "function") {
          node.stop();
        }
        if ("disconnect" in node && typeof (node as any).disconnect === "function") {
          (node as any).disconnect();
        }
      } catch {
        // node already stopped
      }
    }
    this.activeNodes = [];
  }

  // Plays a joyful celebratory radio jingle sound effect for the #1 song
  public playJingle(onComplete?: () => void) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5]; // C major chord fanfare

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t + idx * 0.1);

      gain.gain.setValueAtTime(0.001, t + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.35, t + idx * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.1 + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t + idx * 0.1);
      osc.stop(t + idx * 0.1 + 0.7);
    });

    if (onComplete) {
      setTimeout(onComplete, 1400);
    }
  }

  // Plays a small pleasant click/chime on voting
  public playVoteChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, t); // D5
    osc.frequency.exponentialRampToValueAtTime(880.0, t + 0.15); // A5

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  // Musical generator for previews
  private startSynthesizerLoop(song: Song) {
    if (!this.ctx || !this.masterGain) return;

    const bpm = song.bpm || 110;
    const beatInterval = 60 / bpm;
    const sixteenth = beatInterval / 4;

    // Scale frequencies for each style
    let bassNotes = [65.41, 73.42, 82.41, 98.0]; // C2, D2, E2, G2
    let melodyNotes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]; // C4 major

    if (song.synthStyle === "urban-reggaeton") {
      bassNotes = [55.0, 65.41, 58.27, 49.0]; // A1, C2, Bb1, G1
      melodyNotes = [220.0, 261.63, 293.66, 349.23, 440.0]; // Minor feel
    } else if (song.synthStyle === "electro-house") {
      bassNotes = [65.41, 65.41, 77.78, 87.31];
      melodyNotes = [523.25, 659.25, 783.99, 1046.5];
    } else if (song.synthStyle === "indie-rock") {
      bassNotes = [73.42, 82.41, 98.0, 110.0];
      melodyNotes = [293.66, 329.63, 369.99, 440.0, 587.33];
    }

    let step = 0;

    const loop = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      // 1. Kick Drum
      const isKickStep =
        song.synthStyle === "urban-reggaeton"
          ? step % 8 === 0 || step % 8 === 6
          : step % 4 === 0; // 4-to-the-floor

      if (isKickStep) {
        this.triggerKick(now);
      }

      // 2. Snare / Dembow Clap
      const isSnareStep =
        song.synthStyle === "urban-reggaeton"
          ? step % 8 === 3 || step % 8 === 7 // signature reggaeton dembow snare
          : step % 8 === 4; // standard 2 & 4

      if (isSnareStep) {
        this.triggerSnare(now);
      }

      // 3. Hi-Hat
      if (step % 2 === 1) {
        this.triggerHiHat(now, step % 4 === 2);
      }

      // 4. Bassline
      if (step % 2 === 0) {
        const bassFreq = bassNotes[Math.floor(step / 4) % bassNotes.length];
        this.triggerBass(now, bassFreq, sixteenth * 1.8, song.synthStyle);
      }

      // 5. Melodic Lead Arp
      if (step % 4 === 0 || (step % 4 === 2 && Math.random() > 0.3)) {
        const melFreq =
          melodyNotes[
            (Math.floor(step / 2) + Math.floor(step / 8)) % melodyNotes.length
          ];
        this.triggerLead(now, melFreq, sixteenth * 1.5, song.synthStyle);
      }

      step = (step + 1) % 32;
    };

    // Run steps every sixteenth note
    this.timerId = setInterval(loop, sixteenth * 1000);
  }

  private triggerKick(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + 0.12);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.17);
  }

  private triggerSnare(time: number) {
    if (!this.ctx || !this.masterGain) return;

    // Noise buffer for snap
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(1000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.12);
  }

  private triggerHiHat(time: number, open: boolean = false) {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * (open ? 0.08 : 0.03);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.8;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(7000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(open ? 0.18 : 0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (open ? 0.07 : 0.025));

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + (open ? 0.08 : 0.03));
  }

  private triggerBass(
    time: number,
    freq: number,
    duration: number,
    style: string
  ) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = style === "electro-house" ? "sawtooth" : "triangle";
    osc.frequency.setValueAtTime(freq, time);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(style === "electro-house" ? 400 : 250, time);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private triggerLead(
    time: number,
    freq: number,
    duration: number,
    _style: string
  ) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.18, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }
}

export const soundEngine = new SoundEngine();
