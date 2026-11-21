// Hand-in program for "The Reading Room", a spot-the-difference game.
// Runs on Node 22 with the standard library only. It copies the static game
// (game/) and the maker's screenshots (screenshots/) from this repository
// into the output directory and writes dossier.json there, built by the
// vendored make.fun library so the bytes match what the grader rebuilds.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate's caps for this bounty: at most 4 screenshots of 256 KiB each,
// at most 993 files and 48 MiB under game/, no game path over 1000 bytes,
// and the dossier's source text capped at 160 KiB.
const GATE_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function copyIntoOutput(name: string): void {
  const from = join(repoRoot, name);
  if (!existsSync(from)) return;
  cpSync(from, join(outputDir, name), { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
copyIntoOutput('game');
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
copyIntoOutput('screenshots');

writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, GATE_CAPS));
