// Bootstrap: wires the page's canvases, HUD and buttons to a
// SpotDifferenceGame, runs the frame loop, and reads the maker's screenshot
// parameters (?found=4&time=73, or ?win=1) so a hunt can be photographed in
// a chosen mid-game state.

import { SpotDifferenceGame } from './game.js';

const elements = {
  leftCount: document.getElementById('left-count'),
  foundCount: document.getElementById('found-count'),
  timeReadout: document.getElementById('time-readout'),
  mistakeCount: document.getElementById('mistake-count'),
  toast: document.getElementById('toast'),
  winCard: document.getElementById('win-card'),
  winTime: document.getElementById('win-time'),
  winMistakes: document.getElementById('win-mistakes'),
};

let toastTimer = null;

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.style.opacity = '1';
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    elements.toast.style.opacity = '0.55';
  }, 2600);
}

function updateHud({ left, found, total, timeText, mistakes }) {
  elements.leftCount.textContent = String(left);
  elements.foundCount.textContent = `${found} / ${total}`;
  elements.timeReadout.textContent = timeText;
  elements.mistakeCount.textContent = String(mistakes);
}

function showWin({ timeText, mistakes }) {
  elements.winTime.textContent = timeText;
  elements.winMistakes.textContent = String(mistakes);
  elements.winCard.hidden = false;
}

const game = new SpotDifferenceGame({
  canvasA: document.getElementById('picture-a'),
  canvasB: document.getElementById('picture-b'),
  onHud: updateHud,
  onToast: showToast,
  onWin: showWin,
});

function restart() {
  elements.winCard.hidden = true;
  game.reset(performance.now());
  showToast('A fresh hunt. Ten differences hide again.');
}

document.getElementById('hint-button').addEventListener('click', () => game.useHint());
document.getElementById('restart-button').addEventListener('click', restart);
document.getElementById('play-again-button').addEventListener('click', restart);
window.addEventListener('keydown', (event) => {
  if (event.key === 'h' || event.key === 'H') game.useHint();
  if (event.key === 'r' || event.key === 'R') restart();
});

const params = new URLSearchParams(window.location.search);
if (params.has('found') || params.has('time') || params.has('win')) {
  const win = params.has('win');
  game.applyShotState({
    foundCount: Number(params.get('found') ?? 0),
    timeSeconds: Number(params.get('time') ?? 0),
    mistakes: Number(params.get('mistakes') ?? 0),
    win,
  });
  if (win) showWin({ timeText: elements.timeReadout.textContent, mistakes: game.mistakes });
  showToast(win ? 'Every difference found.' : 'A hunt in progress.');
}

function frame(now) {
  game.render(now);
  window.requestAnimationFrame(frame);
}
window.requestAnimationFrame(frame);
