import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const CHANNEL_URL = 'https://www.youtube.com/@IVEstarship/videos';
const OUTPUT_FILE = 'media-index.json';
const CURATED_IDS = new Set([
  'trlOTS4nKO4', '1Lmy7qwmSMc', 'TNDF5Qr6ayo', '9qkpcLK422o',
  'B1ShLiq3EVc', '38xYeot-ciM', 'g36q0ZLvygQ', 'es9MaJPb_U8',
  'TT1rdIBPfmY', 'D-geLVTaBAo'
]);

function inferEra(title) {
  const value = title.toUpperCase();
  if (/BLACKHOLE|BANG BANG|REVIVE\+/.test(value)) return 'REVIVE+';
  if (/XOXZ|IVE SECRET/.test(value)) return 'IVE SECRET';
  if (/ATTITUDE|REBEL HEART|IVE EMPATHY/.test(value)) return 'IVE EMPATHY';
  if (/HEYA|ACCENDIO|IVE SWITCH/.test(value)) return 'IVE SWITCH';
  if (/BADDIE|OFF THE RECORD|EITHER WAY|HOLY MOLY|I'VE MINE|I’VE MINE/.test(value)) return "I'VE MINE";
  if (/I AM|KITSCH|NOT YOUR GIRL|I'VE IVE|I’VE IVE/.test(value)) return "I'VE IVE";
  if (/AFTER LIKE/.test(value)) return 'AFTER LIKE';
  if (/LOVE DIVE|ROYAL/.test(value)) return 'LOVE DIVE';
  if (/ELEVEN|TAKE IT/.test(value)) return 'ELEVEN';
  return 'IVE official archive';
}

function classifyTitle(title, duration = 0) {
  const value = String(title || '').toUpperCase();
  if (!value || (duration > 0 && duration < 75)) return null;
  if (/TEASER|REACTION|CHEERING GUIDE|HIGHLIGHT MEDLEY|TRAILER|CHALLENGE|FANCAM|FACE ?CAM|FOCUS CAM|SHORTS|BEHIND|IVE ON|MAKING|DANCE PRACTICE|PERFORMANCE VIDEO/.test(value)) return null;
  if (/\bMV\b|M\/V|MUSIC VIDEO|OFFICIAL VIDEO/.test(value)) {
    return { type: 'Music video', categories: ['music-video'] };
  }
  return null;
}

function formatDate(entry) {
  const raw = String(entry.upload_date || '');
  if (/^\d{8}$/.test(raw)) return `${raw.slice(0, 4)}.${raw.slice(4, 6)}.${raw.slice(6, 8)}`;
  if (Number.isFinite(entry.timestamp)) {
    return new Date(entry.timestamp * 1000).toISOString().slice(0, 10).replaceAll('-', '.');
  }
  return 'Official upload';
}

const command = spawnSync('yt-dlp', [
  '--flat-playlist',
  '--dump-single-json',
  '--playlist-end', '900',
  '--no-warnings',
  CHANNEL_URL
], {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024
});

if (command.error) throw command.error;
if (command.status !== 0) {
  throw new Error(`yt-dlp failed (${command.status}): ${command.stderr.trim()}`);
}

const payload = JSON.parse(command.stdout);
const entries = Array.isArray(payload.entries) ? payload.entries : [];
const seen = new Set(CURATED_IDS);
const videos = [];

for (const entry of entries) {
  const id = String(entry.id || '');
  const classification = classifyTitle(entry.title, Number(entry.duration) || 0);
  if (!/^[A-Za-z0-9_-]{11}$/.test(id) || !classification || seen.has(id)) continue;
  seen.add(id);
  videos.push({
    id,
    title: entry.title,
    date: formatDate(entry),
    type: classification.type,
    categories: classification.categories,
    era: inferEra(entry.title)
  });
}

const output = {
  generatedAt: new Date().toISOString(),
  source: CHANNEL_URL,
  count: videos.length,
  categoryCounts: { 'music-video': videos.length },
  videos
};

writeFileSync(OUTPUT_FILE, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${videos.length} official M/V entries to ${OUTPUT_FILE}.`);
