// Draws "The Reading Room", the cozy scene both pictures share.
//
// drawScene(ctx, changed) paints the whole 560 x 420 scene. `changed` is a
// Set of difference ids (see differences.js): when an id is in the set, that
// object is painted the way the right-hand picture shows it; otherwise it is
// painted the way the left-hand picture shows it. The left panel is drawn
// with an empty set, the right panel with every id in the set, so the two
// pictures differ in exactly the ten listed spots and nowhere else.

const INK = '#4a3428';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipse(ctx, cx, cy, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
}

function shadow(ctx, cx, cy, rx) {
  ctx.save();
  ctx.fillStyle = 'rgba(60, 35, 20, 0.13)';
  ellipse(ctx, cx, cy, rx, 9);
  ctx.fill();
  ctx.restore();
}

function drawWallAndFloor(ctx) {
  const wall = ctx.createLinearGradient(0, 0, 0, 300);
  wall.addColorStop(0, '#f6e7cd');
  wall.addColorStop(1, '#eed9b8');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, 560, 302);

  ctx.fillStyle = '#b9825a';
  ctx.fillRect(0, 302, 560, 118);
  ctx.fillStyle = '#a96f47';
  for (let y = 302; y < 420; y += 24) ctx.fillRect(0, y, 560, 3);
  ctx.strokeStyle = 'rgba(90, 55, 30, 0.25)';
  ctx.lineWidth = 2;
  for (let x = 40; x < 560; x += 92) {
    ctx.beginPath();
    ctx.moveTo(x, 302);
    ctx.lineTo(x - 18, 420);
    ctx.stroke();
  }
  ctx.fillStyle = '#8a5a36';
  ctx.fillRect(0, 294, 560, 9);
}

function drawWindow(ctx, changed) {
  // Sky through the panes.
  ctx.save();
  roundRect(ctx, 38, 58, 124, 144, 6);
  ctx.clip();
  const sky = ctx.createLinearGradient(0, 58, 0, 202);
  sky.addColorStop(0, '#a8d4f0');
  sky.addColorStop(1, '#dff0fb');
  ctx.fillStyle = sky;
  ctx.fillRect(38, 58, 124, 144);
  ctx.fillStyle = '#ffd94d';
  ellipse(ctx, 128, 88, 17, 17);
  ctx.fill();
  ctx.fillStyle = '#9ccb86';
  ellipse(ctx, 62, 208, 62, 34);
  ctx.fill();
  ctx.fillStyle = '#7fb96a';
  ellipse(ctx, 140, 214, 66, 38);
  ctx.fill();
  ctx.restore();

  // Frame and muntins.
  ctx.strokeStyle = '#7c4f2e';
  ctx.lineWidth = 9;
  roundRect(ctx, 38, 58, 124, 144, 6);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(100, 58);
  ctx.lineTo(100, 202);
  ctx.moveTo(38, 130);
  ctx.lineTo(162, 130);
  ctx.stroke();
  ctx.fillStyle = '#7c4f2e';
  ctx.fillRect(30, 200, 140, 10);

  // Left curtain always hangs straight.
  ctx.fillStyle = '#c4503f';
  roundRect(ctx, 30, 50, 30, 158, 8);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(42, 56, 5, 146);

  // Right curtain: hanging straight, or tied back in the changed picture.
  ctx.fillStyle = '#c4503f';
  if (changed.has('curtain')) {
    // Tied back: the fabric sweeps in from the rod to a gold band at the
    // middle, then bunches out below the band in a short gathered tail.
    ctx.beginPath();
    ctx.moveTo(140, 50);
    ctx.lineTo(170, 50);
    ctx.lineTo(170, 124);
    ctx.quadraticCurveTo(152, 106, 143, 124);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(143, 131);
    ctx.lineTo(170, 131);
    ctx.lineTo(166, 170);
    ctx.quadraticCurveTo(156, 161, 147, 170);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(156, 134, 4, 30);
    ctx.fillStyle = '#e8b64c';
    ctx.fillRect(140, 122, 32, 10);
  } else {
    roundRect(ctx, 140, 50, 30, 158, 8);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(152, 56, 5, 146);
  }
  ctx.fillStyle = '#8a5a36';
  ctx.fillRect(24, 42, 152, 9);
}

function drawClock(ctx, changed) {
  ctx.save();
  ctx.fillStyle = '#7c4f2e';
  ellipse(ctx, 250, 90, 37, 37);
  ctx.fill();
  ctx.fillStyle = '#fdf6e3';
  ellipse(ctx, 250, 90, 30, 30);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const inner = i % 3 === 0 ? 21 : 25;
    ctx.beginPath();
    ctx.moveTo(250 + Math.cos(a) * inner, 90 + Math.sin(a) * inner);
    ctx.lineTo(250 + Math.cos(a) * 28, 90 + Math.sin(a) * 28);
    ctx.stroke();
  }
  // Three o'clock in one picture, half past six in the other.
  const hourAngle = changed.has('clock') ? Math.PI * 1.083 : Math.PI / 2;
  const minuteAngle = changed.has('clock') ? Math.PI : -Math.PI / 2;
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(250, 90);
  ctx.lineTo(250 + Math.cos(hourAngle) * 15, 90 + Math.sin(hourAngle) * 15);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(250, 90);
  ctx.lineTo(250 + Math.cos(minuteAngle) * 23, 90 + Math.sin(minuteAngle) * 23);
  ctx.stroke();
  ctx.fillStyle = '#c4503f';
  ellipse(ctx, 250, 90, 4, 4);
  ctx.fill();
  ctx.restore();
}

function drawPicture(ctx, changed) {
  ctx.fillStyle = '#8a5a36';
  roundRect(ctx, 360, 56, 130, 88, 4);
  ctx.fill();
  ctx.fillStyle = '#2e6f79';
  roundRect(ctx, 368, 64, 114, 72, 3);
  ctx.fill();
  ctx.save();
  if (changed.has('picture')) {
    ctx.fillStyle = '#e2543e';
    ctx.beginPath();
    ctx.moveTo(425, 122);
    ctx.bezierCurveTo(396, 96, 404, 74, 425, 88);
    ctx.bezierCurveTo(446, 74, 454, 96, 425, 122);
    ctx.fill();
  } else {
    ctx.fillStyle = '#f4c542';
    ctx.beginPath();
    const cx = 425;
    const cy = 100;
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 === 0 ? 21 : 9;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

const BOOK_COLORS = ['#b5524a', '#4a7fb5', '#5da05d', '#e0a83c', '#7a5fa0', '#4fa3a5', '#d1793f'];

function drawBookRow(ctx, books, shelfY) {
  let x = 398;
  for (const book of books) {
    if (book === null) {
      x += 22;
      continue;
    }
    ctx.fillStyle = book.color;
    roundRect(ctx, x, shelfY - book.h, book.w, book.h, 3);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(x + 3, shelfY - book.h + 6, 3, book.h - 12);
    x += book.w + 4;
  }
}

function drawBookshelf(ctx, changed) {
  ctx.fillStyle = '#8a5a36';
  roundRect(ctx, 390, 162, 148, 176, 5);
  ctx.fill();
  ctx.fillStyle = '#6e4525';
  roundRect(ctx, 398, 170, 132, 160, 3);
  ctx.fill();
  ctx.fillStyle = '#8a5a36';
  ctx.fillRect(398, 212, 132, 7);
  ctx.fillRect(398, 262, 132, 7);
  ctx.fillRect(398, 312, 132, 7);

  const topBooks = [
    { w: 15, h: 34, color: BOOK_COLORS[0] },
    { w: 13, h: 38, color: changed.has('book-color') ? '#e07b39' : '#2e8f86' },
    { w: 16, h: 31, color: BOOK_COLORS[3] },
    { w: 12, h: 36, color: BOOK_COLORS[4] },
    { w: 15, h: 33, color: BOOK_COLORS[1] },
    { w: 13, h: 37, color: BOOK_COLORS[2] },
  ];
  drawBookRow(ctx, topBooks, 212);

  const middleBooks = [
    { w: 14, h: 35, color: BOOK_COLORS[5] },
    { w: 16, h: 32, color: BOOK_COLORS[2] },
    changed.has('missing-book') ? null : { w: 18, h: 38, color: BOOK_COLORS[6] },
    { w: 13, h: 34, color: BOOK_COLORS[0] },
    { w: 15, h: 30, color: BOOK_COLORS[4] },
  ];
  drawBookRow(ctx, middleBooks, 262);

  const bottomBooks = [
    { w: 16, h: 33, color: BOOK_COLORS[1] },
    { w: 13, h: 36, color: BOOK_COLORS[6] },
    { w: 15, h: 31, color: BOOK_COLORS[3] },
  ];
  drawBookRow(ctx, bottomBooks, 312);
  // A little vase keeps the bottom shelf company.
  ctx.fillStyle = '#7a5fa0';
  ctx.beginPath();
  ctx.moveTo(492, 312);
  ctx.quadraticCurveTo(486, 292, 496, 288);
  ctx.lineTo(504, 288);
  ctx.quadraticCurveTo(514, 292, 508, 312);
  ctx.closePath();
  ctx.fill();
}

function drawLamp(ctx, changed) {
  const on = !changed.has('lamp');
  if (on) {
    const glow = ctx.createRadialGradient(347, 172, 8, 347, 172, 92);
    glow.addColorStop(0, 'rgba(255, 205, 92, 0.5)');
    glow.addColorStop(1, 'rgba(255, 205, 92, 0)');
    ctx.fillStyle = glow;
    ellipse(ctx, 347, 172, 92, 92);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 205, 92, 0.16)';
    ellipse(ctx, 347, 340, 50, 9);
    ctx.fill();
  }
  ctx.fillStyle = '#5d4a3a';
  ctx.fillRect(344, 190, 6, 138);
  ellipse(ctx, 347, 332, 26, 7);
  ctx.fill();
  ctx.fillStyle = on ? '#f6b73c' : '#9aa3ab';
  ctx.beginPath();
  ctx.moveTo(326, 196);
  ctx.lineTo(368, 196);
  ctx.lineTo(358, 150);
  ctx.lineTo(336, 150);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(74, 52, 40, 0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();
  if (on) {
    ctx.fillStyle = '#ffe9a8';
    ellipse(ctx, 347, 192, 15, 5);
    ctx.fill();
  }
}

function drawCat(ctx) {
  ctx.save();
  ctx.fillStyle = '#8d9299';
  ellipse(ctx, 196, 292, 34, 15);
  ctx.fill();
  ellipse(ctx, 168, 284, 15, 13);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(158, 276);
  ctx.lineTo(154, 264);
  ctx.lineTo(166, 270);
  ctx.closePath();
  ctx.moveTo(176, 272);
  ctx.lineTo(178, 260);
  ctx.lineTo(184, 270);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#8d9299';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(226, 296);
  ctx.quadraticCurveTo(244, 290, 240, 276);
  ctx.stroke();
  ctx.strokeStyle = '#5d6167';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(160, 284);
  ctx.quadraticCurveTo(164, 287, 168, 284);
  ctx.moveTo(172, 284);
  ctx.quadraticCurveTo(176, 287, 180, 284);
  ctx.stroke();
  ctx.restore();
}

function drawArmchair(ctx, changed) {
  shadow(ctx, 190, 356, 92);
  ctx.fillStyle = '#b5524a';
  roundRect(ctx, 118, 222, 144, 96, 26);
  ctx.fill();
  ctx.fillStyle = '#c05e54';
  roundRect(ctx, 104, 262, 40, 76, 18);
  ctx.fill();
  roundRect(ctx, 236, 262, 40, 76, 18);
  ctx.fill();
  ctx.fillStyle = '#cd6f60';
  roundRect(ctx, 140, 282, 100, 34, 12);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  roundRect(ctx, 140, 282, 100, 10, 5);
  ctx.fill();
  ctx.fillStyle = '#7c4f2e';
  ctx.fillRect(122, 338, 10, 16);
  ctx.fillRect(248, 338, 10, 16);
  if (!changed.has('cat')) drawCat(ctx);
}

function drawSideTable(ctx, changed) {
  shadow(ctx, 63, 346, 44);
  ctx.fillStyle = '#7c4f2e';
  roundRect(ctx, 26, 288, 74, 10, 3);
  ctx.fill();
  ctx.fillRect(34, 298, 8, 46);
  ctx.fillRect(84, 298, 8, 46);
  // A small stack of books lives on the table in both pictures.
  ctx.fillStyle = '#4a7fb5';
  roundRect(ctx, 68, 278, 28, 10, 2);
  ctx.fill();
  ctx.fillStyle = '#e0a83c';
  roundRect(ctx, 71, 268, 24, 10, 2);
  ctx.fill();
  if (!changed.has('mug')) {
    ctx.fillStyle = '#2e8f86';
    roundRect(ctx, 50, 262, 20, 26, 4);
    ctx.fill();
    ctx.strokeStyle = '#2e8f86';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(74, 275, 8, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.fillStyle = '#fdf6e3';
    ellipse(ctx, 60, 264, 8, 3);
    ctx.fill();
  }
}

function drawPlant(ctx, changed) {
  shadow(ctx, 308, 348, 26);
  ctx.strokeStyle = '#4d7c4f';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(308, 322);
  ctx.quadraticCurveTo(304, 300, 296, 288);
  ctx.moveTo(308, 322);
  ctx.quadraticCurveTo(308, 298, 308, 284);
  ctx.moveTo(308, 322);
  ctx.quadraticCurveTo(314, 300, 322, 290);
  ctx.stroke();
  ctx.fillStyle = '#5da05d';
  for (const [lx, ly, a] of [[294, 284, -0.7], [308, 278, 0], [323, 286, 0.7], [300, 296, -0.4], [318, 298, 0.4]]) {
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(a);
    ellipse(ctx, 0, 0, 7, 13);
    ctx.fill();
    ctx.restore();
  }
  if (!changed.has('flower')) {
    ctx.fillStyle = '#ef7fa8';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ellipse(ctx, 308 + Math.cos(a) * 6, 272 + Math.sin(a) * 6, 5, 5);
      ctx.fill();
    }
    ctx.fillStyle = '#ffd94d';
    ellipse(ctx, 308, 272, 4, 4);
    ctx.fill();
  }
  ctx.fillStyle = '#b56545';
  ctx.beginPath();
  ctx.moveTo(290, 320);
  ctx.lineTo(326, 320);
  ctx.lineTo(321, 348);
  ctx.lineTo(295, 348);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#96502f';
  ctx.fillRect(288, 316, 40, 7);
}

function drawRug(ctx, changed) {
  ctx.fillStyle = '#93403a';
  roundRect(ctx, 118, 346, 324, 60, 16);
  ctx.fill();
  if (!changed.has('rug')) {
    ctx.strokeStyle = '#e8c98a';
    ctx.lineWidth = 4;
    roundRect(ctx, 130, 356, 300, 40, 11);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(232, 201, 138, 0.5)';
  ellipse(ctx, 280, 376, 26, 12);
  ctx.fill();
}

export function drawScene(ctx, changed) {
  drawWallAndFloor(ctx);
  drawWindow(ctx, changed);
  drawClock(ctx, changed);
  drawPicture(ctx, changed);
  drawBookshelf(ctx, changed);
  drawRug(ctx, changed);
  drawLamp(ctx, changed);
  drawSideTable(ctx, changed);
  drawArmchair(ctx, changed);
  drawPlant(ctx, changed);
}
