// Web Audio API procedural sound engine for car sounds
let audioCtx = null;
let isMuted = false;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundMuted(muted) {
  isMuted = muted;
}

export function isSoundMuted() {
  return isMuted;
}

// Interface click sound
export function playClickSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);

  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.04);
}

// Car Horn (Beep)
export function playHornSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sawtooth';
  osc2.type = 'sawtooth';

  osc1.frequency.setValueAtTime(430, now);
  osc2.frequency.setValueAtTime(515, now);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.15, now + 0.03);
  gain.gain.setValueAtTime(0.15, now + 0.35);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1400, now);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(filter);
  filter.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.45);
  osc2.stop(now + 0.45);
}

// Door latch / pneumatic mechanism sound
export function playDoorSound(doorType = 'standard', isOpen = true) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (doorType === 'scissor' || doorType === 'falcon') {
    // Pneumatic lift swoosh
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isOpen ? 600 : 1200, now);
    filter.frequency.exponentialRampToValueAtTime(isOpen ? 1800 : 400, now + 0.35);
    filter.Q.value = 3;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  } else {
    // Solid metal / luxury click
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isOpen ? 120 : 180, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }
}

// Engine start / rev sound based on car model
export function playEngineRev(modelId = 'bmw') {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (modelId === 'tesla' || modelId === 'cybertruck') {
    // Electric hypercar warp acceleration
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(140, now);
    osc1.frequency.exponentialRampToValueAtTime(950, now + 1.2);
    osc1.frequency.exponentialRampToValueAtTime(450, now + 1.9);

    osc2.frequency.setValueAtTime(70, now);
    osc2.frequency.exponentialRampToValueAtTime(475, now + 1.2);
    osc2.frequency.exponentialRampToValueAtTime(225, now + 1.9);

    gain.gain.setValueAtTime(0.02, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 2.0);
    osc2.stop(now + 2.0);
  } else if (modelId === 'bus') {
    // Diesel camper chug / rumble
    const osc = ctx.createOscillator();
    const sub = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    sub.type = 'square';

    osc.frequency.setValueAtTime(55, now);
    osc.frequency.linearRampToValueAtTime(160, now + 0.7);
    osc.frequency.linearRampToValueAtTime(75, now + 1.6);

    sub.frequency.setValueAtTime(28, now);
    sub.frequency.linearRampToValueAtTime(80, now + 0.7);
    sub.frequency.linearRampToValueAtTime(38, now + 1.6);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, now);
    filter.frequency.linearRampToValueAtTime(900, now + 0.7);
    filter.frequency.linearRampToValueAtTime(450, now + 1.6);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    osc.connect(gain);
    sub.connect(gain);
    gain.connect(filter);
    filter.connect(ctx.destination);

    osc.start(now);
    sub.start(now);
    osc.stop(now + 1.8);
    sub.stop(now + 1.8);
  } else if (modelId === 'gwagon') {
    // AMG 4.0L V8 Biturbo throaty bass burble
    const osc1 = ctx.createOscillator();
    const sub = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    sub.type = 'sine';

    osc1.frequency.setValueAtTime(48, now);
    osc1.frequency.exponentialRampToValueAtTime(260, now + 0.5);
    osc1.frequency.exponentialRampToValueAtTime(90, now + 1.3);

    sub.frequency.setValueAtTime(32, now);
    sub.frequency.exponentialRampToValueAtTime(130, now + 0.5);
    sub.frequency.exponentialRampToValueAtTime(45, now + 1.3);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(550, now);
    filter.frequency.exponentialRampToValueAtTime(1800, now + 0.5);
    filter.frequency.exponentialRampToValueAtTime(600, now + 1.4);
    filter.Q.value = 3.5;

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.linearRampToValueAtTime(0.32, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    osc1.connect(gain);
    sub.connect(gain);
    gain.connect(filter);
    filter.connect(ctx.destination);

    osc1.start(now);
    sub.start(now);
    osc1.stop(now + 2.0);
    sub.stop(now + 2.0);
  } else if (modelId === 'lambo') {
    // Atmospheric 6.5L V12 screaming rev up to 9500 RPM
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc3.type = 'triangle';

    osc1.frequency.setValueAtTime(140, now);
    osc1.frequency.exponentialRampToValueAtTime(620, now + 0.55);
    osc1.frequency.exponentialRampToValueAtTime(180, now + 1.4);

    osc2.frequency.setValueAtTime(280, now);
    osc2.frequency.exponentialRampToValueAtTime(1240, now + 0.55);
    osc2.frequency.exponentialRampToValueAtTime(360, now + 1.4);

    osc3.frequency.setValueAtTime(70, now);
    osc3.frequency.exponentialRampToValueAtTime(310, now + 0.55);
    osc3.frequency.exponentialRampToValueAtTime(90, now + 1.4);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(5500, now + 0.55);
    filter.frequency.exponentialRampToValueAtTime(1400, now + 1.4);
    filter.Q.value = 5.0;

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.1);

    osc1.connect(gain);
    osc2.connect(gain);
    osc3.connect(gain);
    gain.connect(filter);
    filter.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    osc1.stop(now + 2.1);
    osc2.stop(now + 2.1);
    osc3.stop(now + 2.1);
  } else if (modelId === 'porsche') {
    // Naturally aspirated 4.0L Flat-6 Boxer screaming rev
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';

    osc1.frequency.setValueAtTime(110, now);
    osc1.frequency.exponentialRampToValueAtTime(520, now + 0.5);
    osc1.frequency.exponentialRampToValueAtTime(140, now + 1.3);

    osc2.frequency.setValueAtTime(165, now);
    osc2.frequency.exponentialRampToValueAtTime(780, now + 0.5);
    osc2.frequency.exponentialRampToValueAtTime(210, now + 1.3);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(4200, now + 0.5);
    filter.frequency.exponentialRampToValueAtTime(1100, now + 1.4);
    filter.Q.value = 4.2;

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(filter);
    filter.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 2.0);
    osc2.stop(now + 2.0);
  } else if (modelId === 'bugatti') {
    // 8.0L W16 Quad-Turbo thunderous roar
    const osc1 = ctx.createOscillator();
    const sub = ctx.createOscillator();
    const turbo = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    sub.type = 'sine';
    turbo.type = 'sine';

    osc1.frequency.setValueAtTime(50, now);
    osc1.frequency.exponentialRampToValueAtTime(320, now + 0.6);
    osc1.frequency.exponentialRampToValueAtTime(95, now + 1.4);

    sub.frequency.setValueAtTime(25, now);
    sub.frequency.exponentialRampToValueAtTime(160, now + 0.6);
    sub.frequency.exponentialRampToValueAtTime(45, now + 1.4);

    // Quad-Turbo whistling spool
    turbo.frequency.setValueAtTime(800, now);
    turbo.frequency.exponentialRampToValueAtTime(3800, now + 0.6);
    turbo.frequency.exponentialRampToValueAtTime(900, now + 1.4);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.6);
    filter.frequency.exponentialRampToValueAtTime(700, now + 1.5);
    filter.Q.value = 4.0;

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.22);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

    osc1.connect(gain);
    sub.connect(gain);
    turbo.connect(gain);
    gain.connect(filter);
    filter.connect(ctx.destination);

    osc1.start(now);
    sub.start(now);
    turbo.start(now);
    osc1.stop(now + 2.2);
    sub.stop(now + 2.2);
    turbo.stop(now + 2.2);
  } else if (modelId === 'ferrari') {
    // High-revving flat-plane crank 4.0L V8 Ferrari scream
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';

    osc1.frequency.setValueAtTime(130, now);
    osc1.frequency.exponentialRampToValueAtTime(580, now + 0.5);
    osc1.frequency.exponentialRampToValueAtTime(160, now + 1.3);

    osc2.frequency.setValueAtTime(195, now);
    osc2.frequency.exponentialRampToValueAtTime(870, now + 0.5);
    osc2.frequency.exponentialRampToValueAtTime(240, now + 1.3);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, now);
    filter.frequency.exponentialRampToValueAtTime(5000, now + 0.5);
    filter.frequency.exponentialRampToValueAtTime(1300, now + 1.4);
    filter.Q.value = 4.8;

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(filter);
    filter.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 2.0);
    osc2.stop(now + 2.0);
  } else if (modelId === 'gtr') {
    // Nissan GT-R VR38DETT twin-turbo V6
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(90, now);
    osc1.frequency.exponentialRampToValueAtTime(450, now + 0.5);
    osc1.frequency.exponentialRampToValueAtTime(120, now + 1.3);

    osc2.frequency.setValueAtTime(180, now);
    osc2.frequency.exponentialRampToValueAtTime(900, now + 0.5);
    osc2.frequency.exponentialRampToValueAtTime(240, now + 1.3);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(3800, now + 0.5);
    filter.frequency.exponentialRampToValueAtTime(1000, now + 1.4);
    filter.Q.value = 4.0;

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(filter);
    filter.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 2.0);
    osc2.stop(now + 2.0);
  } else if (modelId === 'mustang') {
    // Ford 5.2L Supercharged V8 "Predator" + supercharger whine
    const osc1 = ctx.createOscillator();
    const whine = ctx.createOscillator();
    const sub = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    whine.type = 'sine';
    sub.type = 'square';

    osc1.frequency.setValueAtTime(58, now);
    osc1.frequency.exponentialRampToValueAtTime(340, now + 0.52);
    osc1.frequency.exponentialRampToValueAtTime(85, now + 1.3);

    whine.frequency.setValueAtTime(950, now);
    whine.frequency.exponentialRampToValueAtTime(2600, now + 0.52);
    whine.frequency.exponentialRampToValueAtTime(1100, now + 1.3);

    sub.frequency.setValueAtTime(29, now);
    sub.frequency.exponentialRampToValueAtTime(170, now + 0.52);
    sub.frequency.exponentialRampToValueAtTime(42, now + 1.3);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + 0.52);
    filter.frequency.exponentialRampToValueAtTime(750, now + 1.4);
    filter.Q.value = 3.6;

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.linearRampToValueAtTime(0.33, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.1);

    osc1.connect(gain);
    whine.connect(gain);
    sub.connect(gain);
    gain.connect(filter);
    filter.connect(ctx.destination);

    osc1.start(now);
    whine.start(now);
    sub.start(now);
    osc1.stop(now + 2.1);
    whine.stop(now + 2.1);
    sub.stop(now + 2.1);
  } else if (modelId === 'zeekr') {
    // Zeekr 001 FR 1300HP Quad-Motor futuristic high-voltage warp
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const sub = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';
    sub.type = 'sine';

    osc1.frequency.setValueAtTime(180, now);
    osc1.frequency.exponentialRampToValueAtTime(1300, now + 1.1);
    osc1.frequency.exponentialRampToValueAtTime(500, now + 1.8);

    osc2.frequency.setValueAtTime(360, now);
    osc2.frequency.exponentialRampToValueAtTime(2600, now + 1.1);
    osc2.frequency.exponentialRampToValueAtTime(1000, now + 1.8);

    sub.frequency.setValueAtTime(50, now);
    sub.frequency.exponentialRampToValueAtTime(210, now + 0.9);
    sub.frequency.exponentialRampToValueAtTime(65, now + 1.8);

    gain.gain.setValueAtTime(0.02, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    osc1.connect(gain);
    osc2.connect(gain);
    sub.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    sub.start(now);
    osc1.stop(now + 2.0);
    osc2.stop(now + 2.0);
    sub.stop(now + 2.0);
  } else if (modelId === 'zaporozhets') {
    // Air-cooled MeMZ-968 V4: characteristic rapid rhythmic chug, cooling fan turbine whistle & raspy exhaust
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';

    const baseFreq = 58;
    const peakFreq = 230;

    osc1.frequency.setValueAtTime(baseFreq, now);
    osc1.frequency.exponentialRampToValueAtTime(peakFreq, now + 0.6);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.1, now + 1.4);

    osc2.frequency.setValueAtTime(baseFreq * 2.0, now);
    osc2.frequency.exponentialRampToValueAtTime(peakFreq * 2.0, now + 0.6);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 1.4);

    // Air cooling fan turbine whir
    const fanOsc = ctx.createOscillator();
    const fanGain = ctx.createGain();
    fanOsc.type = 'sine';
    fanOsc.frequency.setValueAtTime(320, now);
    fanOsc.frequency.exponentialRampToValueAtTime(880, now + 0.6);
    fanOsc.frequency.exponentialRampToValueAtTime(340, now + 1.4);
    fanGain.gain.setValueAtTime(0.04, now);
    fanGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
    fanOsc.connect(fanGain);
    fanGain.connect(ctx.destination);
    fanOsc.start(now);
    fanOsc.stop(now + 1.6);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, now);
    filter.frequency.exponentialRampToValueAtTime(2200, now + 0.6);
    filter.frequency.exponentialRampToValueAtTime(700, now + 1.4);
    filter.Q.value = 3;

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.7);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(filter);
    filter.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.7);
    osc2.stop(now + 1.7);
  } else {
    // BMW Twin-Turbo / Audi RS6 TFSI roaring rev
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';

    const baseFreq = modelId === 'audi_rs6' ? 72 : 85;
    const peakFreq = modelId === 'audi_rs6' ? 410 : 360;

    osc1.frequency.setValueAtTime(baseFreq, now);
    osc1.frequency.exponentialRampToValueAtTime(peakFreq, now + 0.5);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.2, now + 1.2);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 1.8);

    osc2.frequency.setValueAtTime(baseFreq * 1.5, now);
    osc2.frequency.exponentialRampToValueAtTime(peakFreq * 1.5, now + 0.5);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + 1.2);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(700, now);
    filter.frequency.exponentialRampToValueAtTime(3500, now + 0.5);
    filter.frequency.exponentialRampToValueAtTime(800, now + 1.5);
    filter.Q.value = 4;

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(filter);
    filter.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.9);
    osc2.stop(now + 1.9);
  }
}

// Success chime
export function playCelebrationSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + index * 0.12;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.12, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + 0.6);
  });
}

// Crash & Collision Sound (Metal crumple, impact thump, glass shatter)
export function playCrashSound(force = 20) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const intensity = Math.min(1.0, Math.max(0.2, force / 50));

  // 1. Heavy Body Thump (Low frequency shockwave)
  const thump = ctx.createOscillator();
  const thumpGain = ctx.createGain();

  thump.type = 'triangle';
  thump.frequency.setValueAtTime(160, now);
  thump.frequency.exponentialRampToValueAtTime(25, now + 0.25);

  thumpGain.gain.setValueAtTime(0.55 * intensity, now);
  thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  thump.connect(thumpGain);
  thumpGain.connect(ctx.destination);
  thump.start(now);
  thump.stop(now + 0.35);

  // 2. Metal Crumple & Tearing Sheet Noise
  const bufferSize = ctx.sampleRate * 0.45;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.4);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(950, now);
  filter.frequency.linearRampToValueAtTime(200, now + 0.35);
  filter.Q.value = 4.0;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.48 * intensity, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now);

  // 3. Glass shatter burst & sharp debris shards
  const shardCount = force > 25 ? 6 : 3;
  for (let i = 0; i < shardCount; i++) {
    const gOsc = ctx.createOscillator();
    const gGain = ctx.createGain();
    gOsc.type = 'sawtooth';
    gOsc.frequency.setValueAtTime(2800 + Math.random() * 3200, now + 0.03 + i * 0.025);
    gGain.gain.setValueAtTime(0.12 * intensity, now + 0.03 + i * 0.025);
    gGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22 + i * 0.025);
    gOsc.connect(gGain);
    gGain.connect(ctx.destination);
    gOsc.start(now + 0.03 + i * 0.025);
    gOsc.stop(now + 0.25 + i * 0.025);
  }
}

// Total Wreck Catastrophic Explosion & Engine Fire sound
export function playTotalWreckSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Massive Explosion Thud
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(160, now);
  osc.frequency.exponentialRampToValueAtTime(20, now + 0.8);
  gain.gain.setValueAtTime(0.7, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.9);

  // 2. High frequency metal screech tearing
  const screech = ctx.createOscillator();
  const sGain = ctx.createGain();
  screech.type = 'sawtooth';
  screech.frequency.setValueAtTime(1400, now);
  screech.frequency.exponentialRampToValueAtTime(320, now + 0.5);
  sGain.gain.setValueAtTime(0.3, now);
  sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  screech.connect(sGain);
  sGain.connect(ctx.destination);
  screech.start(now);
  screech.stop(now + 0.5);

  // 3. Siren alarm pulses
  for (let i = 0; i < 3; i++) {
    const aOsc = ctx.createOscillator();
    const aGain = ctx.createGain();
    const t = now + 0.4 + i * 0.25;
    aOsc.type = 'sine';
    aOsc.frequency.setValueAtTime(880, t);
    aOsc.frequency.linearRampToValueAtTime(1200, t + 0.12);
    aGain.gain.setValueAtTime(0.15, t);
    aGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    aOsc.connect(aGain);
    aGain.connect(ctx.destination);
    aOsc.start(t);
    aOsc.stop(t + 0.22);
  }
}

// Repair sound (Pneumatic wrench + restore chime)
export function playRepairSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Pneumatic wrench zip
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(250, now);
  osc.frequency.exponentialRampToValueAtTime(900, now + 0.15);
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.2);

  // Restore chime
  const notes = [440, 554.37, 659.25, 880];
  notes.forEach((freq, idx) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const t = now + 0.2 + idx * 0.08;
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.35);
  });
}

// Tesla Autopilot Chime (Two-tone engagement / disengagement chime)
export function playTeslaAutopilotSound(enabled = true) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  if (enabled) {
    // Engaging: Crisp rising double chime (C6 -> G6)
    const tones = [1046.5, 1567.98];
    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.11;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.18);
    });
  } else {
    // Disengaging: Descending tone (G6 -> C6)
    const tones = [1567.98, 1046.5];
    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.11;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.18);
    });
  }
}

// Eating food sound (Crunch / munching)
export function playEatingSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  for (let i = 0; i < 3; i++) {
    const t = now + i * 0.08;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320 + Math.random() * 180, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.06);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  }
}

// Drinking sound (Gulp / sip)
export function playDrinkingSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(450, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.16);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.18);
}

// Cash register purchase chime (Coins clinking)
export function playCashSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const coins = [987.77, 1318.51, 1975.53]; // B5, E6, B6
  coins.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = now + idx * 0.07;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  });
}

// Footstep sound when walking on foot
let lastFootstepTime = 0;
export function playFootstepSound() {
  if (isMuted) return;
  const now = performance.now();
  if (now - lastFootstepTime < 280) return; // Debounce footsteps
  lastFootstepTime = now;

  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(140 + Math.random() * 30, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.04);

  gain.gain.setValueAtTime(0.06, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.04);
}

// Punch swing whoosh in air
export function playPunchSwingSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(320, t);
  osc.frequency.exponentialRampToValueAtTime(90, t + 0.12);

  gain.gain.setValueAtTime(0.18, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.12);
}

// Punch impact hit sound (heavy meat impact)
export function playPunchImpactSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;

  // 1. Low frequency thud
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, t);
  osc.frequency.exponentialRampToValueAtTime(35, t + 0.14);

  gain.gain.setValueAtTime(0.35, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.14);

  // 2. High snap noise
  const bufferSize = ctx.sampleRate * 0.06;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(900, t);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.25, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(t);
}

// NPC hurt grunt
export function playNpcHurtSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  const baseFreq = 160 + Math.random() * 40;
  osc.frequency.setValueAtTime(baseFreq, t);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, t + 0.16);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(650, t);

  gain.gain.setValueAtTime(0.18, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.16);
}

// NPC knockout sound
export function playNpcKnockoutSound() {
  if (isMuted) return;
  playPunchImpactSound();
  setTimeout(() => playCashSound(), 200);
}

// TV channel switch click & static
export function playTvClickSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(600, t);
  osc.frequency.exponentialRampToValueAtTime(120, t + 0.08);

  gain.gain.setValueAtTime(0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.08);
}

// Police Taser electrical discharge crackle
export function playTaserSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  for (let i = 0; i < 5; i++) {
    const burstTime = t + i * 0.038;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1600 + Math.random() * 800, burstTime);
    osc.frequency.exponentialRampToValueAtTime(120, burstTime + 0.032);

    gain.gain.setValueAtTime(0.22, burstTime);
    gain.gain.exponentialRampToValueAtTime(0.001, burstTime + 0.032);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(burstTime);
    osc.stop(burstTime + 0.032);
  }

  const hum = ctx.createOscillator();
  const humGain = ctx.createGain();
  hum.type = 'square';
  hum.frequency.setValueAtTime(55, t);
  humGain.gain.setValueAtTime(0.12, t);
  humGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
  hum.connect(humGain);
  humGain.connect(ctx.destination);
  hum.start(t);
  hum.stop(t + 0.22);
}

// Police 9mm Pistol gunshot
export function playGunshotSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  const bufferSize = ctx.sampleRate * 0.18;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(3400, t);
  filter.frequency.exponentialRampToValueAtTime(250, t + 0.18);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.65, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(t);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(140, t);
  osc.frequency.exponentialRampToValueAtTime(30, t + 0.14);

  gain.gain.setValueAtTime(0.48, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.14);
}

// Police Handcuffs metallic ratcheting click
export function playHandcuffsSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  [0, 0.08].forEach(delay => {
    const clickTime = t + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(2200, clickTime);
    osc.frequency.exponentialRampToValueAtTime(750, clickTime + 0.038);

    gain.gain.setValueAtTime(0.24, clickTime);
    gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.038);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(clickTime);
    osc.stop(clickTime + 0.038);
  });
}

// Police Siren loop controller
let policeSirenNodes = null;

export function startPoliceSiren() {
  if (isMuted) return;
  if (policeSirenNodes) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  const now = ctx.currentTime;

  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.setValueAtTime(0.68, now); // Wailing frequency cycle
  lfoGain.gain.setValueAtTime(280, now);   // Swing +/- 280 Hz

  osc.frequency.setValueAtTime(820, now);
  lfo.connect(osc.frequency);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2200, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.15);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  lfo.start(now);
  osc.start(now);

  policeSirenNodes = { osc, lfo, gain, filter };
}

export function stopPoliceSiren() {
  if (!policeSirenNodes) return;
  const ctx = getAudioContext();
  if (!ctx) {
    policeSirenNodes = null;
    return;
  }
  const now = ctx.currentTime;
  try {
    policeSirenNodes.gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
    setTimeout(() => {
      try {
        policeSirenNodes?.osc?.stop();
        policeSirenNodes?.lfo?.stop();
      } catch {}
      policeSirenNodes = null;
    }, 200);
  } catch {
    policeSirenNodes = null;
  }
}

export function isPoliceSirenActive() {
  return !!policeSirenNodes;
}

// Police radio beep
export function playPoliceRadioSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1150, t);
  osc.frequency.setValueAtTime(820, t + 0.05);

  gain.gain.setValueAtTime(0.12, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.12);
}

// Access denied buzzer (e.g. civilian trying to drive police cruiser)
export function playAccessDeniedSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  [0, 0.11].forEach(delay => {
    const bt = t + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, bt);

    gain.gain.setValueAtTime(0.2, bt);
    gain.gain.exponentialRampToValueAtTime(0.001, bt + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(bt);
    osc.stop(bt + 0.08);
  });
}

// Phone dial tone / calling ringtone
export function playPhoneRingtone() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Dual tone European ringback tone (425 Hz + 450 Hz)
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc2.type = 'sine';
  osc1.frequency.setValueAtTime(425, now);
  osc2.frequency.setValueAtTime(450, now);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.setValueAtTime(0.08, now + 0.45);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.55);
  osc2.stop(now + 0.55);
}

// Phone incoming SMS message notification chime
export function playPhoneMessageSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [659.25, 880, 1046.5]; // E5, A5, C6 sweet tri-tone chime
  notes.forEach((freq, idx) => {
    const t = now + idx * 0.09;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.22);
  });
}

// DSNS (State Emergency Service) Two-tone horn / siren
export function playDsnsSirenSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.setValueAtTime(440, now + 0.25);
  osc.frequency.setValueAtTime(587.33, now + 0.26);
  osc.frequency.setValueAtTime(587.33, now + 0.55);
  osc.frequency.setValueAtTime(440, now + 0.56);
  osc.frequency.setValueAtTime(440, now + 0.85);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1200, now);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.setValueAtTime(0.15, now + 0.85);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.95);
}

// Fire Extinguisher foam spray sound (hissing white noise)
export function playExtinguisherSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const duration = 0.8;
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.7));
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1600, now);
  filter.Q.setValueAtTime(2.0, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
}

// Gun cocking mechanical metallic sound
export function playGunCockSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  [0, 0.12].forEach((delay, idx) => {
    const t = now + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(idx === 0 ? 1200 : 900, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.06);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);
  });
}

// ================= AIR RAID SIREN (ПОВІТРЯНА ТРИВОГА) =================
let airRaidOsc = null;
let airRaidLfo = null;
let airRaidGain = null;

export function startAirRaidSiren() {
  if (isMuted || airRaidOsc) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Carrier oscillator: warbling siren tone
  airRaidOsc = ctx.createOscillator();
  airRaidOsc.type = 'sawtooth';
  airRaidOsc.frequency.setValueAtTime(450, now);

  // LFO: Slow undulating frequency modulation (2.4s cycle: rises and falls like civil defense sirens)
  airRaidLfo = ctx.createOscillator();
  airRaidLfo.type = 'sine';
  airRaidLfo.frequency.setValueAtTime(0.35, now); // ~2.8s period

  const lfoGain = ctx.createGain();
  lfoGain.gain.setValueAtTime(140, now); // modulates between 310Hz and 590Hz

  airRaidLfo.connect(lfoGain);
  lfoGain.connect(airRaidOsc.frequency);

  // Filter to soften harshness and simulate distance
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(950, now);

  airRaidGain = ctx.createGain();
  airRaidGain.gain.setValueAtTime(0.001, now);
  airRaidGain.gain.linearRampToValueAtTime(0.22, now + 1.5);

  airRaidOsc.connect(filter);
  filter.connect(airRaidGain);
  airRaidGain.connect(ctx.destination);

  airRaidOsc.start(now);
  airRaidLfo.start(now);
}

export function stopAirRaidSiren() {
  if (!airRaidOsc) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  if (airRaidGain) {
    airRaidGain.gain.linearRampToValueAtTime(0.001, now + 1.2);
  }

  const osc = airRaidOsc;
  const lfo = airRaidLfo;
  airRaidOsc = null;
  airRaidLfo = null;
  airRaidGain = null;

  setTimeout(() => {
    try {
      osc.stop();
      lfo.stop();
    } catch {}
  }, 1300);
}

export function isAirRaidSirenActive() {
  return !!airRaidOsc;
}

// ================= SHAHED-136 MOPED DRONE ENGINE SOUND (ГУЛ МОПЕДА) =================
let shahedOsc1 = null;
let shahedOsc2 = null;
let shahedGain = null;

export function startShahedMotorSound() {
  if (isMuted || shahedOsc1) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Buzzy 2-stroke small lawnmower/moped piston drone sound (MD-550 engine ~110Hz)
  shahedOsc1 = ctx.createOscillator();
  shahedOsc1.type = 'sawtooth';
  shahedOsc1.frequency.setValueAtTime(115, now);

  shahedOsc2 = ctx.createOscillator();
  shahedOsc2.type = 'square';
  shahedOsc2.frequency.setValueAtTime(116.5, now); // slight detune for mechanical buzz

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(650, now);
  filter.Q.setValueAtTime(2.5, now);

  shahedGain = ctx.createGain();
  shahedGain.gain.setValueAtTime(0.001, now);
  shahedGain.gain.linearRampToValueAtTime(0.18, now + 0.8);

  shahedOsc1.connect(filter);
  shahedOsc2.connect(filter);
  filter.connect(shahedGain);
  shahedGain.connect(ctx.destination);

  shahedOsc1.start(now);
  shahedOsc2.start(now);
}

export function stopShahedMotorSound() {
  if (!shahedOsc1) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  if (shahedGain) {
    shahedGain.gain.linearRampToValueAtTime(0.001, now + 0.5);
  }

  const o1 = shahedOsc1;
  const o2 = shahedOsc2;
  shahedOsc1 = null;
  shahedOsc2 = null;
  shahedGain = null;

  setTimeout(() => {
    try {
      o1.stop();
      o2.stop();
    } catch {}
  }, 600);
}

// ================= AK-74 ASSAULT RIFLE BURST (АВТОМАТ КАЛАШНИКОВА) =================
export function playAk47BurstSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const shots = 3; // 3-round burst
  const shotInterval = 0.085; // ~700 rounds/min

  for (let s = 0; s < shots; s++) {
    const t = now + s * shotInterval;

    // 1. Sharp supersonic crack (highpass noise)
    const bufferSize = Math.floor(ctx.sampleRate * 0.04);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(1400, t);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(t);

    // 2. Heavy 5.45mm punch body
    const bodyOsc = ctx.createOscillator();
    bodyOsc.type = 'sawtooth';
    bodyOsc.frequency.setValueAtTime(280, t);
    bodyOsc.frequency.exponentialRampToValueAtTime(65, t + 0.07);

    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(0.4, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(ctx.destination);
    bodyOsc.start(t);
    bodyOsc.stop(t + 0.07);
  }
}

// ================= TANK CANNON SHOT (ПОСТРІЛ ГАРМАТИ ТАНКА 125мм) =================
export function playTankCannonSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Tremendous sub-bass shockwave blast
  const subOsc = ctx.createOscillator();
  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(90, now);
  subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.5);

  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(0.85, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  subOsc.connect(subGain);
  subGain.connect(ctx.destination);
  subOsc.start(now);
  subOsc.stop(now + 0.6);

  // 2. High energy explosive powder roar (noise)
  const bufferSize = Math.floor(ctx.sampleRate * 0.8);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(500, now);
  filter.frequency.exponentialRampToValueAtTime(100, now + 0.7);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.7, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now);
}

// ================= BIG EXPLOSION SOUND (ВИБУХ ДЕТОНАЦІЇ) =================
export function playExplosionSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Deep booming blast
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(30, now + 0.45);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.7, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.5);

  // Crackling fiery rumble
  const bufferSize = Math.floor(ctx.sampleRate * 0.9);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(450, now);
  filter.Q.setValueAtTime(1.5, now);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.6, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now);
}

// ================= FPV DRONE FLIGHT SOUND (ДРОН КВАДРОКОПТЕР) =================
let fpvDroneOsc = null;
let fpvDroneGain = null;

export function startDroneFlightSound() {
  if (isMuted || fpvDroneOsc) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // High-pitch 4-motor brushless whine
  fpvDroneOsc = ctx.createOscillator();
  fpvDroneOsc.type = 'sawtooth';
  fpvDroneOsc.frequency.setValueAtTime(480, now);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(800, now);
  filter.Q.setValueAtTime(2.0, now);

  fpvDroneGain = ctx.createGain();
  fpvDroneGain.gain.setValueAtTime(0.001, now);
  fpvDroneGain.gain.linearRampToValueAtTime(0.14, now + 0.3);

  fpvDroneOsc.connect(filter);
  filter.connect(fpvDroneGain);
  fpvDroneGain.connect(ctx.destination);

  fpvDroneOsc.start(now);
}

export function stopDroneFlightSound() {
  if (!fpvDroneOsc) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  if (fpvDroneGain) {
    fpvDroneGain.gain.linearRampToValueAtTime(0.001, now + 0.3);
  }

  const osc = fpvDroneOsc;
  fpvDroneOsc = null;
  fpvDroneGain = null;

  setTimeout(() => {
    try {
      osc.stop();
    } catch {}
  }, 350);
}

export const playRadioBeepSound = playPoliceRadioSound;

// Police / DPS Traffic Inspector Whistle
export function playPoliceWhistleSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  // Dual tone typical for traffic whistles
  osc1.type = 'triangle';
  osc2.type = 'sawtooth';
  osc1.frequency.setValueAtTime(2600, now);
  osc1.frequency.linearRampToValueAtTime(2750, now + 0.15);
  osc1.frequency.linearRampToValueAtTime(2550, now + 0.35);

  osc2.frequency.setValueAtTime(2850, now);
  osc2.frequency.linearRampToValueAtTime(3000, now + 0.15);
  osc2.frequency.linearRampToValueAtTime(2800, now + 0.35);

  // Tremolo vibrato effect
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.setValueAtTime(28, now);
  lfoGain.gain.setValueAtTime(60, now);
  lfo.connect(osc1.frequency);
  lfo.connect(osc2.frequency);
  lfo.start(now);
  lfo.stop(now + 0.38);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
  gain.gain.setValueAtTime(0.16, now + 0.28);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.38);
  osc2.stop(now + 0.38);
}

// Distant Battlefield Artillery Shell & Blast
export function playArtilleryShellSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Whistle incoming
  const whistleOsc = ctx.createOscillator();
  const whistleGain = ctx.createGain();
  whistleOsc.type = 'sine';
  whistleOsc.frequency.setValueAtTime(1400, now);
  whistleOsc.frequency.exponentialRampToValueAtTime(350, now + 0.45);

  whistleGain.gain.setValueAtTime(0.001, now);
  whistleGain.gain.linearRampToValueAtTime(0.12, now + 0.2);
  whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

  whistleOsc.connect(whistleGain);
  whistleGain.connect(ctx.destination);
  whistleOsc.start(now);
  whistleOsc.stop(now + 0.45);

  // Blast noise
  setTimeout(() => {
    try {
      const bufferSize = ctx.sampleRate * 1.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.28));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, ctx.currentTime);

      const bGain = ctx.createGain();
      bGain.gain.setValueAtTime(0.25, ctx.currentTime);
      bGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      noise.connect(filter);
      filter.connect(bGain);
      bGain.connect(ctx.destination);
      noise.start();
    } catch {}
  }, 420);
}







