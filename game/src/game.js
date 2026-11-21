// The Reading Room game controller: owns the state of one hunt (which
// differences are found, the clock, the mistakes, the hint) and paints both
// panels every frame. The left canvas always shows the untouched scene, the
// right canvas the scene with every difference applied; found differences
// get a ring marker on both panels at the same spot.

import { DIFFERENCES, TOTAL_DIFFERENCES } from './differences.js';
import { drawScene } from './scene.js';

const SCENE_WIDTH = 560;
const SCENE_HEIGHT = 420;
const ALL_CHANGED = new Set(DIFFERENCES.map((d) => d.id));
const NO_CHANGED = new Set();

function formatTime(totalSeconds) {
  const whole = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(whole / 60);
  const seconds = whole % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export class SpotDifferenceGame {
  constructor({ canvasA, canvasB, onHud, onToast, onWin }) {
    this.contexts = [canvasA, canvasB].map((canvas) => {
      const ctx = canvas.getContext('2d');
      // The canvases carry a 2x backing store for crisp lines; draw in
      // scene coordinates and let the transform do the scaling.
      ctx.setTransform(canvas.width / SCENE_WIDTH, 0, 0, canvas.height / SCENE_HEIGHT, 0, 0);
      return ctx;
    });
    this.onHud = onHud;
    this.onToast = onToast;
    this.onWin = onWin;
    this.audio = null;
    this.frozen = false;
    this.reset(performance.now());
    canvasA.addEventListener('pointerdown', (event) => this.handlePointer(canvasA, event));
    canvasB.addEventListener('pointerdown', (event) => this.handlePointer(canvasB, event));
  }

  reset(now) {
    this.found = new Map(); // difference id -> timestamp found
    this.mistakes = 0;
    this.penaltySeconds = 0;
    this.startStamp = now;
    this.elapsedAtStop = 0;
    this.running = true;
    this.won = false;
    this.hintId = null;
    this.hintUntil = 0;
    this.wrongMarks = [];
    this.pushHud();
  }

  elapsedSeconds(now) {
    if (this.frozen) return this.frozenSeconds;
    const runningPart = this.running ? (now - this.startStamp) / 1000 : this.elapsedAtStop;
    return runningPart + this.penaltySeconds;
  }

  remaining() {
    return TOTAL_DIFFERENCES - this.found.size;
  }

  pushHud(now = performance.now()) {
    this.onHud({
      left: this.remaining(),
      found: this.found.size,
      total: TOTAL_DIFFERENCES,
      timeText: formatTime(this.elapsedSeconds(now)),
      mistakes: this.mistakes,
    });
  }

  handlePointer(canvas, event) {
    if (this.won) return;
    this.ensureAudio();
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * SCENE_WIDTH;
    const y = ((event.clientY - rect.top) / rect.height) * SCENE_HEIGHT;
    const now = performance.now();

    let nearest = null;
    let nearestDistance = Infinity;
    for (const difference of DIFFERENCES) {
      if (this.found.has(difference.id)) continue;
      const distance = Math.hypot(x - difference.x, y - difference.y);
      if (distance < nearestDistance) {
        nearest = difference;
        nearestDistance = distance;
      }
    }

    if (nearest && nearestDistance <= nearest.r) {
      this.found.set(nearest.id, now);
      this.playDing();
      this.onToast(nearest.foundText);
      if (this.remaining() === 0) this.finish(now);
    } else {
      this.mistakes += 1;
      this.penaltySeconds += 5;
      this.wrongMarks.push({ x, y, until: now + 650 });
      this.playBuzz();
      this.onToast('Not there — five seconds added.');
    }
    this.pushHud(now);
  }

  useHint(now = performance.now()) {
    if (this.won) return;
    const open = DIFFERENCES.filter((d) => !this.found.has(d.id));
    if (open.length === 0) return;
    const pick = open[Math.floor(Math.random() * open.length)];
    this.hintId = pick.id;
    this.hintUntil = now + 1500;
    this.penaltySeconds += 10;
    this.ensureAudio();
    this.onToast('A glow marks the spot — ten seconds added.');
    this.pushHud(now);
  }

  finish(now) {
    this.won = true;
    this.running = false;
    this.elapsedAtStop = (now - this.startStamp) / 1000;
    this.playWin();
    this.pushHud(now);
    this.onWin({
      timeText: formatTime(this.elapsedSeconds(now)),
      mistakes: this.mistakes,
    });
  }

  // Freezes the game in a chosen state so the maker can photograph it:
  // the first `foundCount` differences are already ringed, the clock shows
  // `timeSeconds`, and with `win` set the hunt is complete.
  applyShotState({ foundCount = 0, timeSeconds = 0, mistakes = 0, win = false }) {
    const now = performance.now();
    this.reset(now);
    DIFFERENCES.slice(0, foundCount).forEach((d) => this.found.set(d.id, now - 1000));
    this.mistakes = mistakes;
    this.frozen = true;
    this.frozenSeconds = timeSeconds;
    if (win) {
      DIFFERENCES.forEach((d) => this.found.set(d.id, now - 1000));
      this.won = true;
      this.running = false;
    }
    this.pushHud(now);
  }

  render(now) {
    this.drawPanel(this.contexts[0], NO_CHANGED, now);
    this.drawPanel(this.contexts[1], ALL_CHANGED, now);
    if (this.running && !this.frozen) this.pushHud(now);
  }

  drawPanel(ctx, changed, now) {
    ctx.save();
    ctx.clearRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);
    drawScene(ctx, changed);
    this.drawHint(ctx, now);
    this.drawMarkers(ctx, now);
    this.drawWrongMarks(ctx, now);
    ctx.restore();
  }

  drawHint(ctx, now) {
    if (!this.hintId || now > this.hintUntil) return;
    const difference = DIFFERENCES.find((d) => d.id === this.hintId);
    const pulse = 1 + Math.sin(now / 90) * 0.12;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 170, 0, 0.9)';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 7]);
    ctx.beginPath();
    ctx.arc(difference.x, difference.y, difference.r * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawMarkers(ctx, now) {
    for (const [id, foundAt] of this.found) {
      const difference = DIFFERENCES.find((d) => d.id === id);
      const age = Math.min(1, (now - foundAt) / 260);
      const pop = 1 + (1 - age) * 0.45;
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 183, 3, 0.35)';
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.arc(difference.x, difference.y, difference.r * pop, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#ffb703';
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(difference.x, difference.y, difference.r * pop - 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawWrongMarks(ctx, now) {
    this.wrongMarks = this.wrongMarks.filter((mark) => mark.until > now);
    ctx.save();
    ctx.strokeStyle = 'rgba(214, 40, 57, 0.9)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (const mark of this.wrongMarks) {
      ctx.beginPath();
      ctx.moveTo(mark.x - 11, mark.y - 11);
      ctx.lineTo(mark.x + 11, mark.y + 11);
      ctx.moveTo(mark.x + 11, mark.y - 11);
      ctx.lineTo(mark.x - 11, mark.y + 11);
      ctx.stroke();
    }
    ctx.restore();
  }

  ensureAudio() {
    if (!this.audio) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (AudioCtor) this.audio = new AudioCtor();
    }
    if (this.audio && this.audio.state === 'suspended') this.audio.resume();
  }

  tone(frequency, startOffset, duration, type = 'sine', volume = 0.16) {
    if (!this.audio) return;
    const start = this.audio.currentTime + startOffset;
    const oscillator = this.audio.createOscillator();
    const gain = this.audio.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain).connect(this.audio.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
  }

  playDing() {
    this.tone(880, 0, 0.16);
    this.tone(1318, 0.07, 0.22);
  }

  playBuzz() {
    this.tone(150, 0, 0.18, 'square', 0.07);
  }

  playWin() {
    [523, 659, 784, 1046].forEach((note, i) => this.tone(note, i * 0.11, 0.3));
  }
}
