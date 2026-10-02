let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function unlockAudio() {
  audio();
}

function beep(freq: number, dur: number, gain = 0.05, type: OscillatorType = "sine") {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + dur);
}

export function tickCountdown() {
  beep(880, 0.08, 0.04, "square");
}

export function tickZero() {
  beep(220, 0.4, 0.07, "sawtooth");
}

export function radioChirp() {
  beep(1400, 0.05, 0.04, "square");
  setTimeout(() => beep(1100, 0.08, 0.04, "square"), 90);
}

export function goChime() {
  beep(523, 0.12, 0.04);
  setTimeout(() => beep(659, 0.12, 0.04), 110);
  setTimeout(() => beep(784, 0.18, 0.05), 220);
}

export function rumble(seconds = 1.2) {
  const ac = audio();
  if (!ac) return;
  const len = ac.sampleRate * seconds;
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ac.createBufferSource();
  const filter = ac.createBiquadFilter();
  const g = ac.createGain();
  src.buffer = buf;
  filter.type = "lowpass";
  filter.frequency.value = 140;
  g.gain.value = 0.18;
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + seconds);
  src.connect(filter);
  filter.connect(g);
  g.connect(ac.destination);
  src.start();
}
