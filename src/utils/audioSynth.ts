// Web Audio API Nepali Rap Beat Synthesizer
// Generates authentic Boom Bap, Trap 808s, Drill, Lo-fi, and Nepali Folk Fusion beats in real-time

import { BeatStyle } from '../types';

class BeatSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentStep = 0;
  private tempo = 90;
  private timerId: number | null = null;
  private nextNoteTime = 0;
  private lookahead = 25.0; // ms
  private scheduleAheadTime = 0.1; // sec
  private currentStyle: BeatStyle = 'boombap';
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private onStepCallback: ((step: number) => void) | null = null;

  // Channel volumes
  public kickVol = 0.9;
  public snareVol = 0.85;
  public hihatVol = 0.6;
  public bassVol = 0.8;
  public melodyVol = 0.65;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setOnStepCallback(cb: (step: number) => void) {
    this.onStepCallback = cb;
  }

  public setTempo(bpm: number) {
    this.tempo = Math.max(60, Math.min(180, bpm));
  }

  public getTempo(): number {
    return this.tempo;
  }

  public setStyle(style: BeatStyle) {
    this.currentStyle = style;
  }

  public getStyle(): BeatStyle {
    return this.currentStyle;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  // Instrument sound generators using Web Audio oscillators and noise buffers
  private playKick(time: number, isSub808 = false) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';

    if (isSub808) {
      // 808 Trap Sub Kick
      osc.frequency.setValueAtTime(140, time);
      osc.frequency.exponentialRampToValueAtTime(45, time + 0.08);
      osc.frequency.exponentialRampToValueAtTime(32, time + 0.35);

      gain.gain.setValueAtTime(this.kickVol * 1.1, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);
      osc.stop(time + 0.46);
    } else {
      // Punchy Boom Bap Kick
      osc.frequency.setValueAtTime(160, time);
      osc.frequency.exponentialRampToValueAtTime(50, time + 0.06);
      osc.frequency.exponentialRampToValueAtTime(30, time + 0.22);

      gain.gain.setValueAtTime(this.kickVol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
      osc.stop(time + 0.26);
    }

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
  }

  private playSnare(time: number, isClap = false) {
    if (!this.ctx || !this.masterGain) return;

    // Noise component
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = isClap ? 'bandpass' : 'highpass';
    filter.frequency.setValueAtTime(isClap ? 1200 : 900, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(this.snareVol * 0.9, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + (isClap ? 0.22 : 0.18));

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    // Tonal body
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(90, time + 0.09);

    oscGain.gain.setValueAtTime(this.snareVol * 0.6, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    noise.start(time);
    osc.start(time);
    noise.stop(time + 0.22);
    osc.stop(time + 0.13);
  }

  private playHiHat(time: number, isOpen = false) {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * (isOpen ? 0.25 : 0.05);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7500, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.hihatVol * (isOpen ? 0.7 : 0.5), time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (isOpen ? 0.24 : 0.05));

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + (isOpen ? 0.25 : 0.06));
  }

  private playBassNote(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.masterGain || freq <= 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, time);
    filter.frequency.exponentialRampToValueAtTime(100, time + duration);

    gain.gain.setValueAtTime(this.bassVol * 0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.frequency.setValueAtTime(freq, time);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  // Nepali Bansuri / Sarangi Synth flute pluck
  private playMelodyNote(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.masterGain || freq <= 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Warm sine + subtle vibrato for bamboo flute feel
    osc.type = this.currentStyle === 'nepalifolk' ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, time);

    // Subtle vibrato
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(5.5, time); // 5.5 Hz vibrato
    lfoGain.gain.setValueAtTime(3.5, time);
    lfo.connect(osc.frequency);
    lfo.start(time);
    lfo.stop(time + duration);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(this.melodyVol * 0.5, time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  // Schedule one step of 16-step grid
  private scheduleStep(step: number, time: number) {
    // Style patterns
    const isTrapOrDrill = this.currentStyle === 'trap' || this.currentStyle === 'drill';

    // Rhythms
    switch (this.currentStyle) {
      case 'boombap': {
        // Kick on 0, 6, 10
        if (step === 0 || step === 6 || step === 10) this.playKick(time);
        // Snare on 4, 12
        if (step === 4 || step === 12) this.playSnare(time);
        // Hihat on all even steps (8th notes), open on 14
        if (step % 2 === 0) this.playHiHat(time, step === 14);

        // Minor melodic hip hop flute notes (D Minor scale)
        const notes = [293.66, 0, 349.23, 0, 392.0, 0, 440.0, 392.0, 349.23, 0, 293.66, 0, 261.63, 0, 293.66, 0];
        if (notes[step]) this.playMelodyNote(time, notes[step], 0.2);

        // Bassline
        const bass = [73.42, 0, 0, 0, 87.31, 0, 0, 0, 98.0, 0, 0, 0, 65.41, 0, 73.42, 0];
        if (bass[step]) this.playBassNote(time, bass[step], 0.35);
        break;
      }
      case 'trap': {
        // Trap 808 kicks: 0, 7, 10, 13
        if (step === 0 || step === 7 || step === 10) this.playKick(time, true);
        // Snare/Clap on 8
        if (step === 8) this.playSnare(time, true);
        // Fast trap hi-hats with roll on steps 12-15
        if (step < 12) {
          if (step % 2 === 0) this.playHiHat(time);
        } else {
          this.playHiHat(time); // rapid roll
        }

        // Dark trap melody (C# Minor / Phrygian)
        const trapNotes = [277.18, 0, 293.66, 0, 329.63, 0, 277.18, 0, 369.99, 0, 329.63, 0, 293.66, 0, 277.18, 0];
        if (trapNotes[step]) this.playMelodyNote(time, trapNotes[step], 0.18);
        break;
      }
      case 'drill': {
        // Drill slide kick & syncopated snare on step 6 and 14
        if (step === 0 || step === 5 || step === 10) this.playKick(time, true);
        if (step === 6 || step === 14) this.playSnare(time, true);
        // Drill hi-hat bounce (triplet feel)
        if (step % 3 === 0 || step === 7 || step === 15) this.playHiHat(time);

        const drillMelody = [440.0, 0, 415.3, 0, 392.0, 0, 440.0, 0, 523.25, 0, 493.88, 0, 440.0, 0, 392.0, 0];
        if (drillMelody[step]) this.playMelodyNote(time, drillMelody[step], 0.15);
        break;
      }
      case 'lofi': {
        // Mellow soft kick on 0, 9
        if (step === 0 || step === 9) this.playKick(time);
        // Soft rimshot/snare on 4, 12
        if (step === 4 || step === 12) this.playSnare(time);
        // Lazy swung hi-hat on even steps
        if (step % 2 === 0) this.playHiHat(time, step === 10);

        // Jazzy Rhodes chords (Fmaj7 - Em7 - Dm7)
        const lofiNotes = [349.23, 0, 0, 0, 329.63, 0, 0, 0, 293.66, 0, 0, 0, 261.63, 0, 293.66, 0];
        if (lofiNotes[step]) this.playMelodyNote(time, lofiNotes[step], 0.4);
        break;
      }
      case 'nepalifolk': {
        // Nepali Madal-infused Hip Hop (Dha Hin Dha Tin bounce)
        if (step === 0 || step === 3 || step === 8 || step === 11) this.playKick(time);
        if (step === 4 || step === 12) this.playSnare(time);
        if (step % 2 === 0) this.playHiHat(time, step === 6 || step === 14);

        // Bansuri flute pentatonic scale (Pahadi raga vibes: Sa Re Ga Pa Dha Sa)
        const folkMelody = [523.25, 0, 587.33, 0, 659.25, 0, 783.99, 0, 880.0, 0, 783.99, 0, 659.25, 587.33, 523.25, 0];
        if (folkMelody[step]) this.playMelodyNote(time, folkMelody[step], 0.28);
        break;
      }
    }

    if (this.onStepCallback) {
      // trigger callback on UI thread
      setTimeout(() => {
        if (this.isPlaying && this.onStepCallback) {
          this.onStepCallback(step);
        }
      }, 0);
    }
  }

  private nextStep() {
    const secondsPerBeat = 60.0 / this.tempo;
    const secondsPer16th = secondsPerBeat / 4.0; // 16th note timing
    this.nextNoteTime += secondsPer16th;
    this.currentStep = (this.currentStep + 1) % 16;
  }

  private scheduler = () => {
    if (!this.ctx) return;
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleStep(this.currentStep, this.nextNoteTime);
      this.nextStep();
    }
    if (this.isPlaying) {
      this.timerId = window.setTimeout(this.scheduler, this.lookahead);
    }
  };

  public play() {
    this.initContext();
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.currentStep = 0;
    this.nextNoteTime = this.ctx!.currentTime + 0.05;
    this.scheduler();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.currentStep = 0;
    if (this.onStepCallback) {
      this.onStepCallback(0);
    }
  }

  public togglePlay(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play();
      return true;
    }
  }
}

export const beatSynth = new BeatSynthesizer();
