// Original Procedural Web Audio API Sound & Music Engine
// Zero copyrighted assets. 100% offline-capable real-time synthesized sound effects and Indian rhythmic background music.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled = true;
  private musicEnabled = true;
  private vibrationEnabled = true;
  private musicInterval: number | null = null;
  private isPlayingMusic = false;
  private stepIndex = 0;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public updateSettings(sound: boolean, music: boolean, vibration: boolean) {
    this.soundEnabled = sound;
    this.musicEnabled = music;
    this.vibrationEnabled = vibration;
    if (!music) {
      this.stopMusic();
    }
  }

  public vibrate(pattern: number | number[]) {
    if (this.vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore on unsupported devices
      }
    }
  }

  public playButtonTap() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.06);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  public playCoin() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.055); // E6

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.23);
  }

  public playJump() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.18);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playSlide() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(130, now + 0.16);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playLaneSwitch() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(310, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playPowerUp() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
    const now = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.2, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.24);
    });
    this.vibrate([40, 30, 60]);
  }

  public playShieldBreak() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.35);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.38);
    this.vibrate([80, 40, 80]);
  }

  public playCrash() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Low impact thud + descending synth
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.45);

    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.47);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.48);
    this.vibrate([180, 50, 120]);
  }

  public playFootstep() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.04);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Original energetic Indian pentatonic / Carnatic-inspired synth loop
  public startMusic() {
    if (!this.musicEnabled || this.isPlayingMusic) return;
    this.initContext();
    if (!this.ctx) return;

    this.isPlayingMusic = true;
    this.stepIndex = 0;

    // Original melody in D Major Pentatonic / Desh Raga feel
    const melody = [
      293.66, 329.63, 369.99, 440.0, 493.88, 440.0, 369.99, 329.63,
      293.66, 369.99, 440.0, 587.33, 554.37, 440.0, 369.99, 293.66,
    ];

    this.musicInterval = window.setInterval(() => {
      if (!this.musicEnabled || !this.isPlayingMusic || !this.ctx) return;
      if (this.ctx.state === 'suspended') return;

      const now = this.ctx.currentTime;
      const freq = melody[this.stepIndex % melody.length];

      // Plucked sitar/synth lead
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.21);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);

      // Dholak / Tabla bass pulse on beats 0, 3, 4, 6
      if (this.stepIndex % 4 === 0 || this.stepIndex % 8 === 3) {
        const drumOsc = this.ctx.createOscillator();
        const drumGain = this.ctx.createGain();
        drumOsc.type = 'sine';
        drumOsc.frequency.setValueAtTime(130, now);
        drumOsc.frequency.exponentialRampToValueAtTime(55, now + 0.11);

        drumGain.gain.setValueAtTime(0.07, now);
        drumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        drumOsc.connect(drumGain);
        drumGain.connect(this.ctx.destination);
        drumOsc.start(now);
        drumOsc.stop(now + 0.13);
      }

      this.stepIndex++;
    }, 220);
  }

  public stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();
