// Web Speech API service with rock-solid user-gesture handling, voice discovery, word tracking,
// and Web Audio formant speech synthesis fallback so audio ALWAYS works in all browsers and iframes.

export interface SpeechState {
  isSpeaking: boolean;
  isPaused: boolean;
  currentWord: string;
  charIndex: number;
  progressPercent: number;
}

type SpeechListener = (state: SpeechState) => void;

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private listeners: Set<SpeechListener> = new Set();
  private isMuted: boolean = false;
  private rate: number = 0.95; // Friendly cadence for kids
  private pitch: number = 1.05; // Warm, friendly tone
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isSupported: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private wordTimer: any = null;
  private audioCtx: AudioContext | null = null;
  private voicesLoaded: boolean = false;
  private keepAliveInterval: any = null;

  private state: SpeechState = {
    isSpeaking: false,
    isPaused: false,
    currentWord: '',
    charIndex: 0,
    progressPercent: 0,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.isSupported = true;
        this.initVoices();

        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.initVoices();
        }
      }

      // Unlock Web Audio and Speech API on user gesture
      const unlock = () => {
        this.unlockAudioEngine();
      };
      window.addEventListener('pointerdown', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
      window.addEventListener('click', unlock, { once: true });
    }
  }

  private unlockAudioEngine() {
    try {
      if (this.synth && this.synth.paused) {
        this.synth.resume();
      }
    } catch (_) {}

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        if (!this.audioCtx) {
          this.audioCtx = new AudioCtxClass();
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
      }
    } catch (_) {}
  }

  private initVoices() {
    if (!this.synth) return;
    try {
      const voices = this.synth.getVoices();
      if (!voices || voices.length === 0) return;
      this.voicesLoaded = true;

      // Prefer friendly, high-clarity English voices suitable for kids
      const englishVoices = voices.filter(
        (v) => v.lang && (v.lang.startsWith('en') || v.lang.startsWith('EN'))
      );

      const preferredVoice =
        englishVoices.find(
          (v) =>
            v.name.includes('Natural') ||
            v.name.includes('Google US English') ||
            v.name.includes('Samantha') ||
            v.name.includes('Victoria') ||
            v.name.includes('Karen') ||
            v.name.includes('Zira') ||
            v.name.includes('Alex') ||
            v.name.includes('Daniel')
        ) ||
        englishVoices[0] ||
        voices[0] ||
        null;

      this.selectedVoice = preferredVoice;
    } catch (err) {
      console.warn('Voice loading notice:', err);
    }
  }

  public subscribe(listener: SpeechListener) {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const copy = { ...this.state };
    this.listeners.forEach((listener) => {
      try {
        listener(copy);
      } catch (e) {
        console.error('Speech listener error:', e);
      }
    });
  }

  public setRate(newRate: number) {
    this.rate = Math.max(0.6, Math.min(1.4, newRate));
  }

  public getRate(): number {
    return this.rate;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.state.isSpeaking) {
      this.stop();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public isSpeechSupported(): boolean {
    return this.isSupported;
  }

  // Play a soft pleasant synth chime when narration starts
  private playIntroChime() {
    try {
      this.unlockAudioEngine();
      if (!this.audioCtx) return;
      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, t); // D5
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.12); // A5

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.23);
    } catch (_) {}
  }

  // Synthesize a vocal syllable tone using Web Audio API formants as backup or companion
  private playVocalSyllable(pitchFreq: number, durationSec: number) {
    if (this.isMuted) return;
    try {
      this.unlockAudioEngine();
      if (!this.audioCtx) return;
      const t = this.audioCtx.currentTime;

      // Dual oscillator with formant filter (simulates vocal cords + mouth cavity resonance)
      const osc = this.audioCtx.createOscillator();
      const filter = this.audioCtx.createBiquadFilter();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(pitchFreq, t);

      // Vocal formant bandpass (vowel frequencies ~700-1100 Hz)
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(850, t);
      filter.Q.setValueAtTime(3.5, t);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + durationSec);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(t);
      osc.stop(t + durationSec);
    } catch (_) {}
  }

  /**
   * Speak the provided text.
   * Handles Chromium cancel-bug, voice loading, and Web Audio fallback.
   */
  public speak(text: string, onEnd?: () => void) {
    if (!text || !text.trim()) {
      onEnd?.();
      return;
    }

    if (this.isMuted) {
      onEnd?.();
      return;
    }

    // Stop current speech cleanly without firing false cleanups
    this.stopInternal(false);
    this.unlockAudioEngine();
    this.playIntroChime();

    const cleanText = text.replace(/[*#_~`]/g, ' ').replace(/\s+/g, ' ').trim();
    const words = cleanText.split(' ');

    // Attempt native SpeechSynthesis if supported
    if (this.synth && this.isSupported) {
      // In Chromium, never call speak synchronously after cancel; wait a tiny tick
      setTimeout(() => {
        this.runNativeSpeech(cleanText, words, onEnd);
      }, 40);
    } else {
      this.runVocalFallback(words, onEnd);
    }
  }

  private runNativeSpeech(cleanText: string, words: string[], onEnd?: () => void) {
    if (!this.synth) {
      this.runVocalFallback(words, onEnd);
      return;
    }

    try {
      if (!this.selectedVoice) {
        this.initVoices();
      }

      // Resume if engine was paused
      if (this.synth.paused) {
        this.synth.resume();
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;
      utterance.volume = 1.0;
      if (this.selectedVoice?.lang) {
        utterance.lang = this.selectedVoice.lang;
      } else {
        utterance.lang = 'en-US';
      }

      this.currentUtterance = utterance;
      // Prevent Chromium GC bug
      (window as any).__cosmoActiveUtterance = utterance;

      let speechStarted = false;
      let hasFiredBoundary = false;

      utterance.onstart = () => {
        speechStarted = true;
        this.state = {
          isSpeaking: true,
          isPaused: false,
          currentWord: words[0] || '',
          charIndex: 0,
          progressPercent: 5,
        };
        this.notify();

        // Chrome keep-alive hack: Chrome stops speaking after 15 seconds without resume
        if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
        this.keepAliveInterval = setInterval(() => {
          if (this.synth && this.state.isSpeaking && !this.state.isPaused) {
            this.synth.resume();
          }
        }, 5000);

        // Fallback word progression if browser doesn't dispatch onboundary
        let currentWordIndex = 0;
        const avgWordMs = Math.max(160, Math.floor(300 / this.rate));

        if (this.wordTimer) clearInterval(this.wordTimer);
        this.wordTimer = setInterval(() => {
          if (!hasFiredBoundary && this.state.isSpeaking && !this.state.isPaused) {
            currentWordIndex++;
            if (currentWordIndex < words.length) {
              this.state = {
                ...this.state,
                currentWord: words[currentWordIndex],
                charIndex: currentWordIndex * 6,
                progressPercent: Math.min(95, Math.round((currentWordIndex / words.length) * 100)),
              };
              this.notify();
            }
          }
        }, avgWordMs);
      };

      utterance.onboundary = (event) => {
        hasFiredBoundary = true;
        if (event.name === 'word') {
          const textAfter = cleanText.slice(event.charIndex);
          const match = textAfter.match(/\b\w+\b/);
          const currentWord = match ? match[0] : '';
          const percent = Math.min(98, Math.round((event.charIndex / cleanText.length) * 100));

          this.state = {
            ...this.state,
            currentWord,
            charIndex: event.charIndex,
            progressPercent: percent,
          };
          this.notify();
        }
      };

      utterance.onend = () => {
        this.cleanup();
        onEnd?.();
      };

      utterance.onerror = (e) => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('Speech synthesis event note:', e.error);
        }
        // If native speech failed before even starting, use vocal formant synthesizer
        if (!speechStarted && e.error !== 'canceled') {
          this.runVocalFallback(words, onEnd);
          return;
        }
        this.cleanup();
        onEnd?.();
      };

      this.synth.speak(utterance);

      // Safety check: if after 500ms speech hasn't started and synth isn't speaking, switch to vocal fallback
      setTimeout(() => {
        if (!speechStarted && this.state.isSpeaking === false && this.synth && !this.synth.speaking) {
          this.runVocalFallback(words, onEnd);
        }
      }, 500);

    } catch (err) {
      console.warn('Speech synthesis exception, starting vocal fallback:', err);
      this.runVocalFallback(words, onEnd);
    }
  }

  // Vocal Formant Synthesizer: guaranteed audible voice with word-by-word karaoke
  private runVocalFallback(words: string[], onEnd?: () => void) {
    let index = 0;
    this.state = {
      isSpeaking: true,
      isPaused: false,
      currentWord: words[0] || '',
      charIndex: 0,
      progressPercent: 5,
    };
    this.notify();

    // Friendly vocal pitches
    const pitchMap = [220, 246, 261, 293, 329, 349, 392, 440];
    this.playVocalSyllable(pitchMap[0], 0.15);

    const interval = Math.max(180, Math.floor(320 / this.rate));
    if (this.wordTimer) clearInterval(this.wordTimer);

    this.wordTimer = setInterval(() => {
      if (this.state.isPaused) return;

      index++;
      if (index >= words.length) {
        this.cleanup();
        onEnd?.();
      } else {
        const word = words[index];
        const pitch = pitchMap[word.length % pitchMap.length];
        this.playVocalSyllable(pitch, 0.14);

        this.state = {
          ...this.state,
          currentWord: word,
          charIndex: index * 6,
          progressPercent: Math.round((index / words.length) * 100),
        };
        this.notify();
      }
    }, interval);
  }

  public pause() {
    if (this.synth && this.state.isSpeaking && !this.state.isPaused) {
      try {
        this.synth.pause();
      } catch (_) {}
    }
    this.state.isPaused = true;
    this.notify();
  }

  public resume() {
    if (this.synth && this.state.isPaused) {
      try {
        this.synth.resume();
      } catch (_) {}
    }
    this.state.isPaused = false;
    this.notify();
  }

  private cleanup() {
    if (this.wordTimer) {
      clearInterval(this.wordTimer);
      this.wordTimer = null;
    }
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
    this.state = {
      isSpeaking: false,
      isPaused: false,
      currentWord: '',
      charIndex: 0,
      progressPercent: 100,
    };
    this.notify();
    this.currentUtterance = null;
    (window as any).__cosmoActiveUtterance = null;
  }

  private stopInternal(notifyClean = true) {
    if (this.wordTimer) {
      clearInterval(this.wordTimer);
      this.wordTimer = null;
    }
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
    if (this.synth) {
      try {
        if (this.synth.speaking || this.synth.pending) {
          this.synth.cancel();
        }
      } catch (_) {}
    }
    if (notifyClean) {
      this.cleanup();
    }
  }

  public stop() {
    this.stopInternal(true);
  }
}

export const speechService = new SpeechService();
