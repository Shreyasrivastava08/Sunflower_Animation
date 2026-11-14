// Procedural Web Audio API Botanical Sound Effects Synthesizer

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = true; // Muted by default as per requirements

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (!muted) {
      this.initContext();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /**
   * Water Droplet Splash:
   * Rapid descending pitch sine drop followed by gentle ripple resonance
   */
  public playWaterSplash() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Descend from 900Hz to 320Hz in 0.12s
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);

      // Secondary droplet ripple
      setTimeout(() => {
        if (!this.ctx || this.muted) return;
        const now2 = this.ctx.currentTime;
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(680, now2);
        osc2.frequency.exponentialRampToValueAtTime(400, now2 + 0.15);
        gain2.gain.setValueAtTime(0.18, now2);
        gain2.gain.exponentialRampToValueAtTime(0.001, now2 + 0.2);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now2);
        osc2.stop(now2 + 0.22);
      }, 70);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  /**
   * Sun Shimmer:
   * Warm shimmering harmonic triad (E5, G#5, B5) with soft vibrato
   */
  public playSunShimmer() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const frequencies = [659.25, 830.61, 987.77]; // E5, G#5, B5

      frequencies.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        const startTime = now + idx * 0.04;
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.12 / (idx + 1), startTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.7);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.75);
      });
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  /**
   * Fertilize Nutrient Chime:
   * Ascending organic pentatonic arpeggio
   */
  public playFertilizeChime() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        const t = now + idx * 0.07;
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.5);
      });
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  /**
   * Milestone Bloom Chime:
   * 50% = Budding chime
   * 100% = Celebratory radiant major chord with shimmering overtones
   */
  public playBloomChime(milestone: 50 | 100) {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      if (milestone === 50) {
        // Two-note budding chime (G5 -> C6)
        [783.99, 1046.5].forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          const t = now + idx * 0.12;
          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.22, t + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.65);
        });
      } else {
        // 100% Full Bloom Grand Golden Chime
        const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
        chord.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);

          const t = now + idx * 0.06;
          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.25 / (idx * 0.4 + 1), t + 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 1.25);
        });
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }
}

export const soundEffects = new SoundEffectsEngine();
