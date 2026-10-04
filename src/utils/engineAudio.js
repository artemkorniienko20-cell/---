// Continuous interactive dynamic engine and tire screech audio engine
import { isSoundMuted } from './audioSynthesizer';

class DynamicEngineAudio {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.engineOsc1 = null;
    this.engineOsc2 = null;
    this.engineGain = null;
    this.engineFilter = null;
    this.tireNoise = null;
    this.tireGain = null;
    this.modelId = 'bmw';
  }

  init(modelId = 'bmw') {
    this.modelId = modelId;
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!this.ctx) {
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  start(modelId = 'bmw') {
    if (isSoundMuted()) return;
    this.init(modelId);
    if (!this.ctx || this.isPlaying) return;

    const now = this.ctx.currentTime;
    const isTesla = modelId === 'tesla' || modelId === 'cybertruck' || modelId === 'zeekr';
    const isZaporozhets = modelId === 'zaporozhets';

    // 1. Engine Main Tone
    this.engineOsc1 = this.ctx.createOscillator();
    this.engineOsc2 = this.ctx.createOscillator();
    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineGain = this.ctx.createGain();

    if (isTesla) {
      this.engineOsc1.type = 'sine';
      this.engineOsc2.type = 'triangle';
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(800, now);
      this.engineGain.gain.setValueAtTime(0.04, now);
    } else if (isZaporozhets) {
      this.engineOsc1.type = 'sawtooth';
      this.engineOsc2.type = 'triangle';
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(380, now);
      this.engineFilter.Q.value = 2.5;
      this.engineGain.gain.setValueAtTime(0.09, now);
    } else {
      this.engineOsc1.type = 'sawtooth';
      this.engineOsc2.type = 'sawtooth';
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(450, now);
      this.engineFilter.Q.value = 3;
      this.engineGain.gain.setValueAtTime(0.08, now);
    }

    this.engineOsc1.frequency.setValueAtTime(50, now);
    this.engineOsc2.frequency.setValueAtTime(75, now);

    this.engineOsc1.connect(this.engineFilter);
    this.engineOsc2.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.ctx.destination);

    this.engineOsc1.start(now);
    this.engineOsc2.start(now);

    // 2. Tire Screech Noise Generator
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.tireNoise = this.ctx.createBufferSource();
    this.tireNoise.buffer = buffer;
    this.tireNoise.loop = true;

    const tireFilter = this.ctx.createBiquadFilter();
    tireFilter.type = 'bandpass';
    tireFilter.frequency.setValueAtTime(2400, now);
    tireFilter.Q.value = 4.5;

    this.tireGain = this.ctx.createGain();
    this.tireGain.gain.setValueAtTime(0, now);

    this.tireNoise.connect(tireFilter);
    tireFilter.connect(this.tireGain);
    this.tireGain.connect(this.ctx.destination);

    this.tireNoise.start(now);

    this.isPlaying = true;
  }

  update(rpm = 1000, speed = 0, throttle = false, isDrifting = false) {
    if (!this.isPlaying || !this.ctx || isSoundMuted()) return;

    const now = this.ctx.currentTime;
    const isTesla = this.modelId === 'tesla' || this.modelId === 'cybertruck' || this.modelId === 'zeekr';
    const isZaporozhets = this.modelId === 'zaporozhets';

    if (isTesla) {
      // Electric warp motor sound based on vehicle speed
      const baseFreq = 90 + Math.abs(speed) * 8.5;
      this.engineOsc1.frequency.setTargetAtTime(baseFreq, now, 0.05);
      this.engineOsc2.frequency.setTargetAtTime(baseFreq * 1.5, now, 0.05);
      this.engineFilter.frequency.setTargetAtTime(800 + Math.abs(speed) * 20, now, 0.05);
      this.engineGain.gain.setTargetAtTime(throttle ? 0.12 : 0.03, now, 0.05);
    } else if (isZaporozhets) {
      // Characteristic air-cooled MeMZ V4 engine chug & fan whine
      const baseFreq = 26 + (rpm / 4800) * 85;
      this.engineOsc1.frequency.setTargetAtTime(baseFreq, now, 0.04);
      this.engineOsc2.frequency.setTargetAtTime(baseFreq * 2.0, now, 0.04);

      const filterCutoff = 320 + (rpm / 4800) * 1100 + (throttle ? 420 : 0);
      this.engineFilter.frequency.setTargetAtTime(filterCutoff, now, 0.04);

      const targetGain = throttle ? 0.15 : 0.07;
      this.engineGain.gain.setTargetAtTime(targetGain, now, 0.04);
    } else {
      // Internal Combustion Engine (BMW S58 / Bulli / Supercar / etc)
      const baseFreq = 38 + (rpm / 8000) * (this.modelId === 'supercar' ? 180 : 130);
      this.engineOsc1.frequency.setTargetAtTime(baseFreq, now, 0.04);
      this.engineOsc2.frequency.setTargetAtTime(baseFreq * 1.5, now, 0.04);

      const filterCutoff = 350 + (rpm / 8000) * 1600 + (throttle ? 500 : 0);
      this.engineFilter.frequency.setTargetAtTime(filterCutoff, now, 0.04);

      const targetGain = throttle ? 0.14 : 0.06;
      this.engineGain.gain.setTargetAtTime(targetGain, now, 0.04);
    }

    // Tire Screech Volume when drifting or turning hard
    if (this.tireGain) {
      const tireVol = isDrifting ? 0.18 : 0;
      this.tireGain.gain.setTargetAtTime(tireVol, now, 0.03);
    }
  }

  stop() {
    if (!this.isPlaying) return;
    try {
      if (this.engineOsc1) this.engineOsc1.stop();
      if (this.engineOsc2) this.engineOsc2.stop();
      if (this.tireNoise) this.tireNoise.stop();
    } catch (e) {
      // Already stopped
    }
    this.isPlaying = false;
  }
}

export const dynamicAudio = new DynamicEngineAudio();
