/*! HEPTA-7 · Seven-Edge Plasma Sword
   © 2026 Mandeep S. Bhullar · SpinalXeno™. All rights reserved. SpinalXeno™ is a trademark of Mandeep S. Bhullar.
   Unauthorized copying, modification or redistribution of this code is prohibited.
   Digitally signed by SpinalXeno, signing key fingerprint (SHA-256) 25666eb2cf27368640bb41154733bfdc1f8a07b194aec7661659fc7b565155b3 */
'use strict';
(() => {
// ---------- helpers ----------
const TAU = Math.PI * 2, G = 980;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[(Math.random() * arr.length) | 0];
const hypot = Math.hypot;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeOutBack = t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);

function pointSeg(px, py, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy || 1;
  const t = clamp(((px - a.x) * dx + (py - a.y) * dy) / l2, 0, 1);
  const x = a.x + dx * t, y = a.y + dy * t;
  return { x, y, d: hypot(px - x, py - y) };
}
function segInt(a, b, c, d) {
  const r1x = b.x - a.x, r1y = b.y - a.y, r2x = d.x - c.x, r2y = d.y - c.y;
  const den = r1x * r2y - r1y * r2x; if (Math.abs(den) < 1e-9) return null;
  const t = ((c.x - a.x) * r2y - (c.y - a.y) * r2x) / den;
  const u = ((c.x - a.x) * r1y - (c.y - a.y) * r1x) / den;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? { x: a.x + r1x * t, y: a.y + r1y * t, t } : null;
}
function pointInPoly(p, v) {
  let inside = false;
  for (let i = 0, j = v.length - 1; i < v.length; j = i++) {
    if ((v[i].y > p.y) !== (v[j].y > p.y) && p.x < (v[j].x - v[i].x) * (p.y - v[i].y) / (v[j].y - v[i].y) + v[i].x) inside = !inside;
  }
  return inside;
}
function polyArea(v) { let a = 0; for (let i = 0, j = v.length - 1; i < v.length; j = i++) a += v[j].x * v[i].y - v[i].x * v[j].y; return a / 2; }
function polyCentroid(v) {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, j = v.length - 1; i < v.length; j = i++) { const f = v[j].x * v[i].y - v[i].x * v[j].y; a += f; cx += (v[j].x + v[i].x) * f; cy += (v[j].y + v[i].y) * f; }
  if (Math.abs(a) < 1e-6) { let x = 0, y = 0; v.forEach(p => { x += p.x; y += p.y; }); return { x: x / v.length, y: y / v.length }; }
  return { x: cx / (3 * a), y: cy / (3 * a) };
}
function splitPoly(v, a, b) {
  const L = [], R = []; let p1 = null, p2 = null;
  const side = p => (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
  for (let i = 0; i < v.length; i++) {
    const p = v[i], q = v[(i + 1) % v.length], sp = side(p), sq = side(q);
    if (sp >= 0) L.push(p); if (sp <= 0) R.push(p);
    if ((sp > 0 && sq < 0) || (sp < 0 && sq > 0)) {
      const t = sp / (sp - sq), ip = { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t };
      L.push(ip); R.push(ip); if (!p1) p1 = ip; else p2 = ip;
    }
  }
  return { L, R, p1, p2 };
}
function convexHull(pts) {
  const p = pts.slice().sort((a, b) => a.x - b.x || a.y - b.y);
  const cr = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lo = [], up = [];
  for (const q of p) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function heatColor(h) { return h > .8 ? '#fffbe8' : h > .6 ? '#ffe27a' : h > .4 ? '#ffa630' : h > .2 ? '#ff5a1f' : '#b3200e'; }

// ---------- data ----------
const EDGES = [
  { name: 'Thermal',    color: '#ff2d55', desc: 'Melts & welds — molten cut faces' },
  { name: 'Ablative',   color: '#ff8a1e', desc: 'Vaporizes surface layers — sparks' },
  { name: 'Ionizing',   color: '#ffe11f', desc: 'Strips electrons — gas glows as plasma' },
  { name: 'Resonant',   color: '#29ff7f', desc: 'Phonon resonance — shatters lattices' },
  { name: 'Cryo-Phase', color: '#25e8ff', desc: 'Phase-locks surfaces — parts liquids' },
  { name: 'Magnetic',   color: '#3d6bff', desc: 'Field shear — severs confinement' },
  { name: 'Quantum',    color: '#b24bff', desc: 'Phase coherence — splits condensates' },
];
const MATS = {
  steel:   { label: 'Steel',      state: 'Solid · metal',    color: '#c9d3e0', hard: 1.0, aff: [1, .7, 0, .3, 0, .2, 0] },
  ice:     { label: 'Ice',        state: 'Solid · frozen',   color: '#9be8ff', hard: .45, aff: [1, .5, 0, .5, .3, 0, 0] },
  crystal: { label: 'Crystal',    state: 'Solid · lattice',  color: '#c99bff', hard: .55, aff: [.3, .3, 0, 1.2, 0, 0, .2], shatter: 'res' },
  water:   { label: 'Water',      state: 'Liquid',           color: '#3fa0ff', hard: .2,  aff: [.3, .2, 0, 0, 1, 0, 0] },
  gas:     { label: 'Gas',        state: 'Gas',              color: '#b8c4d6', hard: 0,   aff: [.2, .2, 1, 0, 0, 0, 0] },
  plasma:  { label: 'Plasma',     state: 'Plasma',           color: '#ff4fd8', hard: .6,  aff: [0, 0, .4, 0, 0, 1.2, .2] },
  bec:     { label: 'Condensate', state: 'Bose–Einstein',    color: '#7ff6ff', hard: .5,  aff: [0, 0, 0, 0, .4, 0, 1.3] },
};
const ORDER = ['steel', 'ice', 'crystal', 'water', 'gas', 'plasma', 'bec'];
// ---------- real-world targets (auto target practice) ----------
const AUTO_LIST = ['pipe', 'gold', 'gong', 'can', 'vase', 'plate', 'wood', 'brick', 'concrete', 'melon', 'apple', 'bulb', 'balloon', 'wballoon', 'steel', 'ice', 'crystal'];
const prng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function rotPoly(v, cx, cy, a) { const c = Math.cos(a), s = Math.sin(a); return v.map(p => ({ x: cx + (p.x - cx) * c - (p.y - cy) * s, y: cy + (p.x - cx) * s + (p.y - cy) * c })); }
function ellPoly(x, y, rx, ry, n) { return Array.from({ length: n }, (_, i) => { const a = i / n * TAU; return { x: x + Math.cos(a) * rx, y: y + Math.sin(a) * ry }; }); }
const linG = (bb, stops) => { const g = ctx.createLinearGradient(bb.minX, bb.minY, bb.maxX, bb.maxY); for (const [o, c] of stops) g.addColorStop(o, c); return g; };
function inLocal(o, fn) { ctx.save(); ctx.clip(); ctx.translate(o.x, o.y); ctx.rotate(o.a); ctx.scale(o.sc2, o.sc2); fn(o.s); ctx.restore(); }
function local(o, fn) { ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.a); ctx.scale(o.sc2, o.sc2); fn(o.s); ctx.restore(); }
const METAL = [1, .7, 0, .3, 0, .2, 0], BRITTLE = [.3, .35, 0, 1.15, 0, 0, .15], SOFT = [.5, .5, 0, .2, .6, 0, 0], ANY = [.5, .5, .5, .5, .5, .5, .5];
const REAL = {
  pipe: { label: 'Steel Pipe', state: 'Metal · hollow tube', color: '#d5dde8', hard: .9, aff: METAL, fx: 'metal',
    shape: (x, y, s) => rotPoly(boxPoly(x, y, 190 * s, 30 * s, 4 * s), x, y, rand(-.5, .5)),
    msg: { CUT: 'Tube sheared · molten steel drips while the pipe rings' },
    paint(o, bb) { ctx.fillStyle = linG(bb, [[0, '#3d444f'], [.3, '#eef2f7'], [.45, '#9aa3b1'], [.7, '#5a626e'], [1, '#252a31']]); ctx.fill(); ctx.strokeStyle = '#e6ecf3'; ctx.stroke(); } },
  gold: { label: 'Gold Bar', state: 'Metal · soft, dense', color: '#ffd45a', hard: .6, aff: [1, .8, 0, .2, 0, .2, 0], fx: 'metal',
    shape: (x, y, s) => [[-36, -18], [36, -18], [52, 18], [-52, 18]].map(([a, b]) => ({ x: x + a * s, y: y + b * s })),
    msg: { CUT: 'Gold bar sliced · dull heavy thunk, glowing soft faces' },
    paint(o, bb) { ctx.fillStyle = linG(bb, [[0, '#6b4c0e'], [.35, '#ffe68a'], [.6, '#d9a92c'], [1, '#5e420b']]); ctx.fill();
      if (!o.cut) inLocal(o, s => { ctx.strokeStyle = 'rgba(255,240,180,.55)'; ctx.lineWidth = 1; ctx.strokeRect(-16 * s, -7 * s, 32 * s, 14 * s); });
      ctx.strokeStyle = '#fff1b0'; ctx.stroke(); } },
  gong: { label: 'Brass Gong', state: 'Metal · resonant bronze', color: '#e9b44c', hard: 1, aff: [1, .7, 0, .4, 0, .2, 0], fx: 'metal',
    shape: (x, y, s) => ellPoly(x, y, 72 * s, 72 * s, 18),
    msg: { CUT: 'Gong cleaved mid-ring · bronze screams through the hall', DEFLECT: 'GONG! Bronze rings out · the blade bounced — swing harder to cut' },
    paint(o, bb) { const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.rad * o.sc2); g.addColorStop(0, '#ffe9a8'); g.addColorStop(.45, '#d19a35'); g.addColorStop(.85, '#8a5c1a'); g.addColorStop(1, '#5c3a0e');
      ctx.fillStyle = g; ctx.fill();
      if (!o.cut) inLocal(o, () => { ctx.strokeStyle = 'rgba(255,235,170,.35)'; ctx.lineWidth = 1.5; for (const f of [.25, .45, .65, .85]) { ctx.beginPath(); ctx.arc(0, 0, o.rad * f, 0, TAU); ctx.stroke(); } });
      ctx.strokeStyle = '#ffe2a0'; ctx.stroke(); } },
  can: { label: 'Tin Can', state: 'Metal · thin sheet', color: '#e05a6a', hard: .25, aff: [1, .7, 0, .2, 0, .1, 0], fx: 'metal',
    shape: (x, y, s) => rotPoly(boxPoly(x, y, 52 * s, 82 * s, 6 * s), x, y, rand(-.3, .3)),
    msg: { CUT: 'Can sliced open · tinny clatter and crumple' },
    paint(o, bb) { ctx.fillStyle = linG(bb, [[0, '#6c737e'], [.35, '#f1f4f8'], [.6, '#a7afba'], [1, '#4a5059']]); ctx.fill();
      inLocal(o, s => { ctx.fillStyle = '#d6283a'; ctx.fillRect(-60 * s, -15 * s, 120 * s, 30 * s); ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(-60 * s, -3 * s, 120 * s, 3 * s); });
      ctx.strokeStyle = '#eef1f5'; ctx.stroke(); } },
  vase: { label: 'Glass Vase', state: 'Glass · brittle', color: '#7ef0d6', hard: .3, aff: BRITTLE, fx: 'glass', shatter: true, heatMul: .2,
    shape: (x, y, s) => convexHull([[0, -76], [22, -72], [38, -22], [36, 40], [20, 72], [-20, 72], [-36, 40], [-38, -22], [-22, -72]].map(([a, b]) => ({ x: x + a * s, y: y + b * s }))),
    msg: { SHATTER: 'Glass vase exploded into shards', CUT: 'Glass cut clean' },
    paint(o, bb) { ctx.fillStyle = 'rgba(110,230,205,.30)'; ctx.fill(); ctx.strokeStyle = 'rgba(205,255,245,.9)'; ctx.stroke();
      inLocal(o, s => { ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(-18 * s, -50 * s); ctx.lineTo(-24 * s, 40 * s); ctx.stroke(); }); } },
  plate: { label: 'Ceramic Plate', state: 'Ceramic · brittle', color: '#f2efe6', hard: .35, aff: [.3, .4, 0, 1.1, 0, 0, .1], fx: 'ceramic', shatter: true, heatMul: .2,
    shape: (x, y, s) => ellPoly(x, y, 62 * s, 62 * s, 18),
    msg: { SHATTER: 'Ceramic plate smashed to pieces' },
    paint(o, bb) { ctx.fillStyle = '#f5f2ea'; ctx.fill();
      inLocal(o, () => { ctx.strokeStyle = '#2f5fc4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, o.rad * .74, 0, TAU); ctx.stroke(); ctx.setLineDash([5, 6]); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, o.rad * .55, 0, TAU); ctx.stroke(); ctx.setLineDash([]); });
      ctx.strokeStyle = '#bdb6a6'; ctx.stroke(); } },
  wood: { label: 'Wooden Log', state: 'Wood · fibrous', color: '#c08a4a', hard: .45, aff: [1, .9, 0, .3, 0, 0, 0], fx: 'wood', heatMul: .7,
    shape: (x, y, s) => rotPoly(boxPoly(x, y, 200 * s, 52 * s, 10 * s), x, y, rand(-.4, .4)),
    msg: { CUT: 'Log split · charred, smoking grain' },
    paint(o, bb) { ctx.fillStyle = linG(bb, [[0, '#5a3a1d'], [.5, '#a8743f'], [1, '#4d3018']]); ctx.fill();
      inLocal(o, s => { ctx.strokeStyle = 'rgba(60,35,15,.55)'; ctx.lineWidth = 1.5; for (let i = -3; i <= 3; i++) { ctx.beginPath(); for (let x = -110; x <= 110; x += 10) { const yy = (i * 7 + Math.sin(x * .05 + i) * 2.5) * s; x === -110 ? ctx.moveTo(x * s, yy) : ctx.lineTo(x * s, yy); } ctx.stroke(); } });
      ctx.strokeStyle = '#3a2410'; ctx.stroke(); } },
  brick: { label: 'Brick', state: 'Fired clay · brittle', color: '#c0583c', hard: .55, aff: [.5, .7, 0, 1, 0, 0, 0], fx: 'stone', shatter: true, heatMul: .3, dustCol: '#b97a62',
    shape: (x, y, s) => rotPoly(boxPoly(x, y, 112 * s, 50 * s, 3 * s), x, y, rand(-.3, .3)),
    msg: { SHATTER: 'Brick crumbled into chunks and dust' },
    paint(o, bb) { ctx.fillStyle = linG(bb, [[0, '#c0583c'], [1, '#7a2e1e']]); ctx.fill();
      inLocal(o, s => { const r = prng(o.seed); ctx.fillStyle = 'rgba(40,10,5,.35)'; for (let i = 0; i < 40; i++) ctx.fillRect((r() - .5) * 110 * s, (r() - .5) * 50 * s, 2, 2); });
      ctx.strokeStyle = '#5e2214'; ctx.stroke(); } },
  concrete: { label: 'Concrete Block', state: 'Stone · heavy', color: '#a6a8ad', hard: .8, aff: [.5, .7, 0, 1.1, 0, 0, 0], fx: 'stone', shatter: true, heatMul: .3, dustCol: '#b9b9b9',
    shape: (x, y, s) => rotPoly(boxPoly(x, y, 124 * s, 92 * s, 4 * s), x, y, rand(-.2, .2)),
    msg: { SHATTER: 'Concrete block blasted apart' },
    paint(o, bb) { ctx.fillStyle = linG(bb, [[0, '#a9abaf'], [1, '#6c6e72']]); ctx.fill();
      inLocal(o, s => { if (!o.cut) { ctx.fillStyle = 'rgba(30,30,32,.55)'; ctx.fillRect(-46 * s, -28 * s, 34 * s, 56 * s); ctx.fillRect(12 * s, -28 * s, 34 * s, 56 * s); }
        const r = prng(o.seed); ctx.fillStyle = 'rgba(40,40,40,.4)'; for (let i = 0; i < 50; i++) ctx.fillRect((r() - .5) * 124 * s, (r() - .5) * 92 * s, 2, 2); });
      ctx.strokeStyle = '#55575b'; ctx.stroke(); } },
  melon: { label: 'Watermelon', state: 'Fruit · 92% water', color: '#3fbf5a', hard: .12, aff: SOFT, fx: 'fruit', heatMul: 0, juice: '#ff2848',
    shape: (x, y, s) => ellPoly(x, y, 72 * s, 56 * s, 18),
    msg: { CUT: 'Watermelon split · juice everywhere' },
    paint(o, bb) {
      if (o.cut) { ctx.fillStyle = '#ff4a5e'; ctx.fill(); inLocal(o, s => { const r = prng(o.seed); ctx.fillStyle = '#1a0d0d'; for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.ellipse((r() - .5) * 70 * s, (r() - .5) * 50 * s, 2.2 * s, 3.6 * s, r() * 3, 0, TAU); ctx.fill(); } });
        ctx.strokeStyle = '#2f8a3a'; ctx.lineWidth = 5; ctx.stroke(); ctx.lineWidth = 1.2; return; }
      ctx.fillStyle = '#2f8a3a'; ctx.fill();
      inLocal(o, s => { ctx.strokeStyle = '#1b5a24'; ctx.lineWidth = 8 * s; for (let i = -5; i <= 5; i++) { ctx.beginPath(); for (let y = -60; y <= 60; y += 8) { const xx = (i * 16 + Math.sin(y * .08 + i) * 4) * s; y === -60 ? ctx.moveTo(xx, y * s) : ctx.lineTo(xx, y * s); } ctx.stroke(); } });
      ctx.strokeStyle = '#1d5a25'; ctx.stroke(); } },
  apple: { label: 'Apple', state: 'Fruit · crisp', color: '#ff4a4a', hard: .1, aff: SOFT, fx: 'fruit', heatMul: 0, juice: '#fff0c0',
    shape: (x, y, s) => ellPoly(x, y, 36 * s, 33 * s, 14),
    msg: { CUT: 'Apple sliced with a crisp crunch' },
    paint(o, bb) {
      if (o.cut) { ctx.fillStyle = '#fff3d6'; ctx.fill(); ctx.strokeStyle = '#c8202a'; ctx.lineWidth = 3; ctx.stroke(); ctx.lineWidth = 1.2; return; }
      const g = ctx.createRadialGradient(o.x - o.rad * .3, o.y - o.rad * .3, 2, o.x, o.y, o.rad * o.sc2); g.addColorStop(0, '#ff8a8a'); g.addColorStop(.5, '#e0222e'); g.addColorStop(1, '#8a0d16');
      ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#7a0d14'; ctx.stroke();
      local(o, s => { ctx.strokeStyle = '#5a3a1d'; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(0, -30 * s); ctx.lineTo(4 * s, -44 * s); ctx.stroke(); ctx.fillStyle = '#3fbf5a'; ctx.beginPath(); ctx.ellipse(12 * s, -40 * s, 9 * s, 4 * s, -.4, 0, TAU); ctx.fill(); }); } },
  bulb: { label: 'Light Bulb', state: 'Glass · vacuum', color: '#fff2a8', hard: .12, aff: [.3, .3, 0, 1, 0, .3, 0], fx: 'bulb', shatter: true, heatMul: 0,
    shape: (x, y, s) => ellPoly(x, y, 32 * s, 36 * s, 14),
    msg: { SHATTER: 'Light bulb popped · filament flash', CUT: 'Bulb split · vacuum pops' },
    paint(o, bb) { const g = ctx.createRadialGradient(o.x - 8, o.y - 10, 2, o.x, o.y, o.rad * o.sc2); g.addColorStop(0, 'rgba(255,255,240,.75)'); g.addColorStop(1, 'rgba(255,240,180,.18)');
      ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(255,250,220,.9)'; ctx.stroke();
      if (!o.cut) { inLocal(o, s => { ctx.strokeStyle = '#ffb347'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-6 * s, 30 * s); ctx.lineTo(-6 * s, 2 * s); for (let i = 0; i < 6; i++) ctx.lineTo((-6 + i * 2.4) * s, (i % 2 ? -4 : 2) * s); ctx.lineTo(6 * s, 2 * s); ctx.lineTo(6 * s, 30 * s); ctx.stroke(); });
        local(o, s => { ctx.fillStyle = '#9aa1ab'; ctx.fillRect(-13 * s, 31 * s, 26 * s, 20 * s); ctx.fillStyle = 'rgba(0,0,0,.35)'; for (let i = 0; i < 4; i++) ctx.fillRect(-13 * s, (34 + i * 4.5) * s, 26 * s, 1.5 * s); ctx.fillStyle = '#3a3d44'; ctx.fillRect(-6 * s, 51 * s, 12 * s, 5 * s); }); } } },
  balloon: { label: 'Balloon', state: 'Rubber · pressurized air', color: '#ff5fa8', hard: 0, aff: ANY, fx: 'pop', burst: true,
    shape: (x, y, s) => ellPoly(x, y, 38 * s, 48 * s, 16), init: o => { o.col = pick(['#ff3b5c', '#ffb02e', '#3bd5ff', '#8c5bff', '#3bff8a']); },
    msg: { BURST: 'POP! Balloon burst' },
    paint(o, bb) { const g = ctx.createRadialGradient(o.x - 12, o.y - 16, 2, o.x, o.y, o.rad * o.sc2); g.addColorStop(0, '#ffffff'); g.addColorStop(.25, o.col); g.addColorStop(1, '#1a1030');
      ctx.fillStyle = g; ctx.fill();
      local(o, s => { ctx.strokeStyle = 'rgba(230,230,255,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 48 * s); for (let i = 1; i <= 8; i++) ctx.lineTo(Math.sin(i + o.t * 3) * 4 * s, (48 + i * 9) * s); ctx.stroke(); }); } },
  wballoon: { label: 'Water Balloon', state: 'Rubber · full of water', color: '#3fa0ff', hard: 0, aff: ANY, fx: 'water', burst: true,
    shape: (x, y, s) => ellPoly(x, y, 42 * s, 40 * s, 16),
    msg: { BURST: 'Water balloon burst · splash!' },
    paint(o, bb) { const g = ctx.createRadialGradient(o.x - 12, o.y - 12, 2, o.x, o.y, o.rad * o.sc2); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(.3, 'rgba(70,160,255,.75)'); g.addColorStop(1, 'rgba(20,60,160,.8)');
      ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(190,225,255,.8)'; ctx.stroke(); } },
};
for (const k in REAL) MATS[k] = Object.assign({ real: true }, REAL[k]);
// 3D look: side-face colour, translucency, sphere / thin-disc shapes
Object.entries({ steel: { side: '#8a94a3' }, ice: { side: '#a8e6ff', clear: true }, crystal: { side: '#9b6bff', clear: true }, pipe: { side: '#9aa3b1' }, gold: { side: '#c9971f' },
  gong: { side: '#a8732a', thin: true }, can: { side: '#b8c0ca' }, vase: { side: '#7ef0d6', clear: true }, plate: { side: '#e6e1d4', thin: true }, wood: { side: '#7a5230' },
  brick: { side: '#9a4430' }, concrete: { side: '#8a8c90' }, melon: { side: '#2f8a3a', round: true }, apple: { side: '#c41e28', round: true },
  bulb: { side: '#fff2c0', clear: true, round: true }, balloon: { round: true }, wballoon: { round: true } }).forEach(([k, v]) => Object.assign(MATS[k], v));
const LIGHT = { x: -.45, y: -.89 };
function tracePath(v) { ctx.beginPath(); v.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath(); }

const LABEL = { CUT: 'CUT', SHATTER: 'SHATTER', DEFLECT: 'DEFLECT', GRAZE: 'GRAZE', SPLIT: 'SPLIT', PASS: 'PASS-THROUGH',
  BURST: 'BURST', IONIZED: 'IONIZED', PARTED: 'PARTED', DISPERSED: 'DISPERSED', SEVERED: 'SEVERED', ARC: 'ARC', DECOHERE: 'DECOHERENCE', LIMIT: 'QUANTUM LIMIT' };

const S = {
  mode: 'single', target: 'steel', zoom: 1, gesturing: false, punch: 0, kickX: 0, kickY: 0, chroma: 0, buzz: 0, sndStyle: 'xylo', lastEdge: -1, lastMat: 'steel', lastRes: 'CUT', energized: false, ignite: 0, power: 1, spin: .8, len: 300, vol: 1, bs: 1, labelT: 0, timeflow: 1,
  edges: [true, true, true, true, true, true, true],
  slowmo: false, cine: true, trails: true, sound: true, demo: false, restock: true, toss: false, freeze: false,
  ocHeld: false, ocLatch: false, heat: 0, vent: false,
  sx: 0, sy: 0, px: 0, py: 0, hx: 0, hy: 0, phx: 0, hvx: 0,
  base: -Math.PI / 2 + .22, angS: -Math.PI / 2, ang: -Math.PI / 2, spinPh: 0,
  strike: null, strikeDir: 1, lastInput: -1e9, lastAuto: 0, auto: false,
  geo: null, prev: null, angV: 0, pitch: 0, pitchV: 0, hvy: 0, phy: 0, ions: [], tipSpeed: 0, tipVX: 0, tipVY: 0, hist: [],
  shake: 0, hitstop: 0, cineT: 0, flash: 0, flashCol: '#ffffff', ts: 1,
  cam: { x: 0, y: 0, z: 1 }, camT: { x: 0, y: 0, z: 1 }, camHold: 0, lb: 0,
  stats: { cuts: 0, shatters: 0, deflects: 0, peak: 0 }, sc: 1, tossT: 0,
  score: 0, combo: 0, hits: 0, miss: 0, level: 1, autoE: 0, autoT: 0,
};
const oc = () => (S.ocHeld || S.ocLatch) && !S.vent && S.energized;
const edgeCols = () => { const c = EDGES.filter((e, i) => S.edges[i]).map(e => e.color); return c.length ? c : ['#ffffff']; };
const tempK = () => Math.round(1200 + 2600 * S.power * (S.edges[0] ? 1 : .3) * (oc() ? 1.4 : 1));

// ---------- canvas ----------
const cvs = document.getElementById('stage'), ctx = cvs.getContext('2d');
const xc = document.getElementById('xsec'), xctx = xc.getContext('2d');
let W = 0, H = 0, DPR = 1, floorY = 0, bgCan = null, vigCan = null;
const slots = [], dust = [];
const BGPAD = 60;

function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight;
  cvs.width = W * DPR | 0; cvs.height = H * DPR | 0; cvs.style.width = W + 'px'; cvs.style.height = H + 'px';
  S.bs = clamp(Math.min(W, H) / 800, .8, 1.5);
  floorY = H - Math.max(56, H * .08);
  layoutSlots();
  for (const o of objects) if (o.slot >= 0 && slots[o.slot]) { o.hx = slots[o.slot].x; o.hy = slots[o.slot].y; }
  S.len = clamp(H * .5, 240, 560); const ls = document.getElementById('len'); if (ls) { ls.max = Math.round(H * .75); ls.value = S.len; ls.oninput && ls.oninput(); }
  buildBG();
  dust.length = 0;
  for (let i = 0; i < 70; i++) dust.push({ x: rand(0, W), y: rand(0, floorY), vx: rand(-6, 6), vy: rand(-8, 2), s: rand(.5, 1.6), a: rand(.1, .45) });
}

function layoutSlots() {
  const narrow = W < 760;
  slots.length = 0;
  if (S.mode === 'auto') { S.sc = clamp(Math.min((narrow ? W - 40 : W - 620) / 300, H / 420) * .75, .75, 1.5); return; }
  if (S.mode === 'single') {   // one chosen target, big, centre stage
    const free = narrow ? W - 40 : W - 620;
    S.sc = clamp(Math.min(free / 300, H / 400), .9, 2.3);
    slots.push({ type: S.target, x: W / 2, y: H * .42 });
    return;
  }
  const x0 = narrow ? W * .1 : Math.max(300, W * .2), x1 = narrow ? W * .9 : Math.min(W - 300, W * .8);
  let spacing = (x1 - x0) / 6, rows = 1;
  if (spacing < 105) { rows = 2; spacing = (W * .84) / 3; }
  S.sc = clamp(spacing / 140, .55, 1.1);
  ORDER.forEach((type, i) => {
    let x, y;
    if (rows === 1) { x = x0 + i * (x1 - x0) / 6; y = H * .4 + (i % 2 ? 26 : -10); }
    else { const r = i < 4 ? 0 : 1, c = r ? i - 4 : i; x = r ? W * .2 + c * W * .3 : W * .08 + c * W * .28; y = r ? H * .5 : H * .31; }
    slots.push({ type, x, y });
  });
}
function buildBG() {
  const BW = W + BGPAD * 2, BH = H + BGPAD * 2;
  bgCan = document.createElement('canvas'); bgCan.width = BW * DPR; bgCan.height = BH * DPR;
  const g = bgCan.getContext('2d'); g.scale(DPR, DPR); g.translate(BGPAD, BGPAD);
  let gr = g.createLinearGradient(0, -BGPAD, 0, H + BGPAD); gr.addColorStop(0, '#04050b'); gr.addColorStop(.6, '#080b18'); gr.addColorStop(1, '#0a0d1c');
  g.fillStyle = gr; g.fillRect(-BGPAD, -BGPAD, BW, BH);
  for (const [c, fx, fy] of [['#3b1d7a', .2, .25], ['#0e3a6e', .82, .2], ['#5a1240', .55, .6], ['#0b4a52', .35, .7]]) {
    const r = Math.max(W, H) * .45, rg = g.createRadialGradient(W * fx, H * fy, 0, W * fx, H * fy, r);
    rg.addColorStop(0, c + '55'); rg.addColorStop(1, c + '00'); g.fillStyle = rg; g.fillRect(-BGPAD, -BGPAD, BW, BH);
  }
  for (let i = 0; i < 320; i++) { g.fillStyle = `rgba(255,255,255,${rand(.05, .55)})`; const s = rand(.4, 1.5); g.fillRect(rand(-BGPAD, W + BGPAD), rand(-BGPAD, floorY), s, s); }

  vigCan = document.createElement('canvas'); vigCan.width = W; vigCan.height = H;
  const v = vigCan.getContext('2d'), vg = v.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.max(W, H) * .75);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.65)'); v.fillStyle = vg; v.fillRect(0, 0, W, H);
}

const spriteCache = {};
function sprite(col) {
  let s = spriteCache[col]; if (s) return s;
  s = document.createElement('canvas'); s.width = s.height = 64;
  const g = s.getContext('2d'), [r, gg, b] = hexRgb(col), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `rgba(${r},${gg},${b},1)`); gr.addColorStop(.2, `rgba(${r},${gg},${b},.6)`);
  gr.addColorStop(.5, `rgba(${r},${gg},${b},.15)`); gr.addColorStop(1, `rgba(${r},${gg},${b},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return spriteCache[col] = s;
}
function glow(x, y, size, col, a) { if (a <= 0.003) return; ctx.globalAlpha = Math.min(1, a); ctx.drawImage(sprite(col), x - size, y - size, size * 2, size * 2); }

// ---------- audio (procedural, loud, layered: transient + body + tail, through a hall reverb and limiter) ----------
const AU = {
  c: null, last: {},
  curve(k) { const n = 2048, c = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i * 2 / n - 1; c[i] = (1 + k) * x / (1 + k * Math.abs(x)); } return c; },
  ir(sec) {
    const c = this.c, len = c.sampleRate * sec | 0, b = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    return b;
  },
  init() {
    if (this.c) { if (this.c.state === 'suspended') this.c.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const c = this.c = new AC();
    // master: out → soft clip → brick-wall limiter → speakers
    const lim = c.createDynamicsCompressor(); lim.threshold.value = -4; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = .002; lim.release.value = .12; lim.connect(c.destination);
    const clip = c.createWaveShaper(); clip.curve = this.curve(2.5); clip.oversample = '4x'; clip.connect(lim);
    this.out = c.createGain(); this.out.gain.value = S.sound ? S.vol : 0; this.out.connect(clip);
    this.fxBus = c.createGain(); this.fxBus.gain.value = 1.5; this.fxBus.connect(this.out);
    this.verb = c.createConvolver(); this.verb.buffer = this.ir(2.8);
    const vg = c.createGain(); vg.gain.value = .5; this.verb.connect(vg).connect(this.out);
    const nb = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = nb.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; this.nb = nb;
    // blade hum v2 — no buzz-saw: a pure sine core with slow FM, a resonant plasma body (noise rung through
    // seven narrow band-passes, one harmonic per edge), a dark filtered undertone, Doppler + stereo position
    this.pan = c.createStereoPanner ? c.createStereoPanner() : c.createGain(); this.pan.connect(this.out);
    const soft = c.createWaveShaper(); soft.curve = this.curve(1.4);
    this.humF = c.createBiquadFilter(); this.humF.type = 'lowpass'; this.humF.frequency.value = 900; this.humF.Q.value = .7;
    this.humG = c.createGain(); this.humG.gain.value = 0;
    soft.connect(this.humF).connect(this.humG).connect(this.pan);
    const hs = c.createGain(); hs.gain.value = .2; this.humG.connect(hs).connect(this.verb);
    const og = (o, v, to = soft) => { const g = c.createGain(); g.gain.value = v; o.connect(g).connect(to); return g; };
    this.o1 = c.createOscillator(); this.o1.frequency.value = 72; og(this.o1, .9);
    this.o2 = c.createOscillator(); this.o2.frequency.value = 144.3; og(this.o2, .3);
    this.sub = c.createOscillator(); this.sub.frequency.value = 36; og(this.sub, .85);
    this.o3 = c.createOscillator(); this.o3.type = 'sawtooth'; this.o3.frequency.value = 72.4;
    const uf = c.createBiquadFilter(); uf.type = 'lowpass'; uf.frequency.value = 240; uf.Q.value = 2; og(this.o3, .3, uf); uf.connect(soft);
    const fm = c.createOscillator(); fm.frequency.value = .37; og(fm, 1.6, this.o1.frequency);
    const fl = c.createOscillator(); fl.frequency.value = 11.3; og(fl, .018, this.humG.gain);
    [this.o1, this.o2, this.sub, this.o3, fm, fl].forEach(o => o.start());
    const nB = c.createBufferSource(); nB.buffer = nb; nB.loop = true; nB.start();
    this.pg = EDGES.map((e, i) => {
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 72 * (i + 3) * 1.003; bp.Q.value = 30;
      const g = c.createGain(); g.gain.value = 0; nB.connect(bp).connect(g).connect(this.humG); return g;
    });
    // swing: band-passed air through a short comb → the tonal "vwoom" of a moving column of plasma
    const ns = c.createBufferSource(); ns.buffer = nb; ns.loop = true;
    this.swF = c.createBiquadFilter(); this.swF.type = 'bandpass'; this.swF.frequency.value = 700; this.swF.Q.value = .9;
    this.swG = c.createGain(); this.swG.gain.value = 0; ns.connect(this.swF).connect(this.swG).connect(this.pan);
    this.comb = c.createDelay(.05); this.comb.delayTime.value = .006; const fb = c.createGain(); fb.gain.value = .6;
    const cg = c.createGain(); cg.gain.value = .55; this.swG.connect(this.comb); this.comb.connect(fb).connect(this.comb); this.comb.connect(cg).connect(this.pan);
    const ws = c.createGain(); ws.gain.value = .3; this.swG.connect(ws).connect(this.verb); ns.start();
    this.lastU = c.currentTime;
  },
  update(speed) {
    if (!this.c) return;
    const t = this.c.currentTime, dtA = Math.min(.1, t - this.lastU), ig = S.ignite, o = oc(), sp = clamp(speed / 3000, 0, 1), slow = .6 + .4 * S.ts; this.lastU = t;
    this.out.gain.setTargetAtTime(S.sound ? S.vol : 0, t, .05);
    const bed = S.sndStyle === 'xylo' ? .3 : 1;
    if (this.pan.pan) this.pan.pan.setTargetAtTime(clamp(S.hx / (W || 1) * 2 - 1, -1, 1) * .7, t, .05);
    this.humG.gain.setTargetAtTime(.36 * ig * (o ? 1.4 : 1) * (1 + sp * .5) * bed, t, .04);
    this.humF.frequency.setTargetAtTime((700 + sp * 2600 + (o ? 900 : 0)) * slow, t, .03);
    // Doppler: the tip's velocity toward / away from the screen centre bends the pitch
    let rv = 0; if (S.geo) { const ex = S.geo.tx - W / 2, ey = S.geo.ty - H / 2, d = hypot(ex, ey) || 1; rv = (ex * S.tipVX + ey * S.tipVY) / d; }
    const f = 72 * (1 + sp * .2) * (1 - clamp(rv / 9000, -.12, .12)) * (o ? 1.06 : 1) * slow;
    this.o1.frequency.setTargetAtTime(f, t, .03); this.o2.frequency.setTargetAtTime(f * 2.004, t, .03);
    this.sub.frequency.setTargetAtTime(f / 2, t, .03); this.o3.frequency.setTargetAtTime(f * 1.006, t, .03);
    this.pg.forEach((g, i) => g.gain.setTargetAtTime(S.edges[i] ? 1.1 * ig * (1 + sp) : 0, t, .1));
    this.swG.gain.setTargetAtTime(sp * 1.3 * ig * bed, t, .02);
    this.swF.frequency.setTargetAtTime(250 + sp * 2600, t, .03);
    this.comb.delayTime.setTargetAtTime(.0025 + .008 * (1 - sp), t, .04);
    // arc discharges: sparse grains at rest, a storm when overcharged or whipping fast
    if (ig > .5 && S.sound) { const rate = (o ? 28 : 2.2) + sp * 12; if (Math.random() < rate * dtA) this.noise(rand(.004, .02), 'highpass', rand(2500, 6500), rand(.15, .5) * (o ? 1 : .45) * bed, .8, 0, .15); }
  },
  dst(wet) {
    const g = this.c.createGain(); g.connect(this.fxBus);
    if (wet) { const s = this.c.createGain(); s.gain.value = wet; g.connect(s); s.connect(this.verb); }
    return g;
  },
  tone(f0, f1, dur, type = 'sine', gain = .2, delay = 0, wet = .3) {
    const c = this.c, t = c.currentTime + delay, o = c.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(this.dst(wet)); o.start(t); o.stop(t + dur + .05);
  },
  noise(dur, type, freq, gain = .2, q = 1, delay = 0, wet = .3, f1 = 0) {
    const c = this.c, t = c.currentTime + delay, s = c.createBufferSource(); s.buffer = this.nb;
    const f = c.createBiquadFilter(); f.type = type; f.Q.value = q; f.frequency.setValueAtTime(freq, t);
    if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(f).connect(g).connect(this.dst(wet)); s.start(t, Math.random()); s.stop(t + dur + .05);
  },
  modal(f, ratios, decays, gain, wet = .5) {   // struck-object resonances (inharmonic partials)
    ratios.forEach((r, i) => this.tone(f * r * rand(.995, 1.005), f * r * .998, decays[i], 'sine', gain / (i * .7 + 1), 0, wet));
  },
  crackle(dur, n, gain, freq, delay = 0) {
    for (let i = 0; i < n; i++) this.noise(rand(.003, .018), 'highpass', freq * rand(.6, 1.6), gain * rand(.3, 1), .7, delay + Math.random() * dur, .12);
  },
  thud(k) {   // heavy body thump on impact: chest-hit + air whump + sub drop
    k = clamp(k, .5, 1.6);
    this.tone(115, 42, .2, 'sine', 1.7 * k, 0, .2);
    this.noise(.14, 'lowpass', 320, 1.6 * k, .9, 0, .25);
    this.tone(58, 28, .45, 'sine', 1.3 * k, .005, .3);
  },
  boom(gain) { this.tone(85, 28, .8, 'sine', gain, 0, .25); this.noise(.3, 'lowpass', 200, gain * .9, 1, 0, .3); },
  zap(dur, gain) {
    const c = this.c, t = c.currentTime, o = c.createOscillator(); o.type = 'sawtooth';
    for (let s = 0; s < dur; s += .01) o.frequency.setValueAtTime(rand(50, 1800), t + s);
    const g = c.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(this.dst(.35)); o.start(t); o.stop(t + dur + .05);
  },
};
// ---------- xylophone sound style: struck wooden bars, pentatonic, register by material ----------
const XREG = { glass: 17, vase: 17, bulb: 18, crystal: 16, ice: 15, plate: 14, bec: 14, steel: 12, pipe: 13, can: 13, gold: 10, gong: 6, plasma: 11, gas: 10,
  balloon: 11, wballoon: 9, water: 8, wood: 7, melon: 5, apple: 8, brick: 4, concrete: 2 };
const xnote = i => { i = Math.max(0, Math.round(i)); return 130.81 * Math.pow(2, (12 * Math.floor(i / 5) + [0, 2, 4, 7, 9][i % 5]) / 12); };
function xbar(i, gain, delay = 0, damp = 1) {   // mallet click + tuned bar modes (1 : 3 : 6.2) + resonator ring
  const A = AU, f = xnote(i), d = clamp(1.5 - f / 1600, .22, 1.2) * damp;
  A.noise(.008, 'bandpass', Math.min(9000, f * 4), gain * .9, 2, delay, .2);
  A.tone(f, f, d, 'sine', gain, delay, .35);
  A.tone(f * 3, f * 3, d * .35, 'sine', gain * .32, delay, .3);
  A.tone(f * 6.2, f * 6.2, d * .14, 'sine', gain * .12, delay, .25);
}
function xylo(name, k) {
  const b = XREG[S.lastMat] ?? 9, up = S.mode === 'auto' ? Math.min(S.combo, 10) : 0, g = .3 + .2 * clamp(k, 0, 1.6);
  switch (name) {
    case 'impact':
      switch (S.lastRes) {
        case 'CUT': case 'SPLIT': case 'SEVERED': xbar(b + up, g); xbar(b + up + 2, g * .9, .07); if (k > 1) xbar(b + up + 4, g * .8, .14); break;
        case 'SHATTER': case 'DISPERSED': for (let i = 0; i < 9; i++) xbar(b + up + 8 - i, g * .7, i * .045); break;
        case 'BURST': for (let i = 0; i < 5; i++) xbar(b + up + i, g * .75, i * .04); break;
        case 'DEFLECT': xbar(b - 5, g * 1.1, 0, .35); xbar(b - 3, g * .7, .01, .3); break;
        default: xbar(b + up, g * .6);
      }
      if (k > 1.1) xbar(0, g * .9, 0, 1.3);
      break;
    case 'ignite': for (let i = 0; i < 7; i++) xbar(5 + i, .32, i * .05); break;
    case 'retract': for (let i = 0; i < 7; i++) xbar(11 - i, .28, i * .05); break;
    case 'click': xbar(S.lastEdge >= 0 ? 5 + S.lastEdge : 12, S.lastEdge >= 0 ? .4 : .18, 0, .6); break;
    case 'spawn': case 'appear': xbar(15, .22); xbar(17, .18, .06); break;
    case 'miss': xbar(4, .35); xbar(2, .35, .12); xbar(0, .35, .24); break;
    case 'freeze': for (let i = 0; i < 10; i++) xbar(19 - i, .22, i * .035); break;
    case 'vent': xbar(3, .3, 0, .5); xbar(1, .3, .1, .5); break;
  }
}
function sfx(name, amt = 1) {
  const A = AU; if (!A.c || !S.sound) return;
  if (S.sndStyle === 'xylo') { const now = A.c.currentTime; if (A.last['x' + name] && now - A.last['x' + name] < .045) return; A.last['x' + name] = now; return xylo(name, amt); }
  const now = A.c.currentTime; if (A.last[name] && now - A.last[name] < .045) return; A.last[name] = now;
  const k = clamp(amt, .3, 1.6);
  switch (name) {
    case 'ignite':   // snap-hiss: transient snap, rising roar, sub kick
      A.noise(.06, 'highpass', 3000, 1.2, 1, 0, .2); A.tone(55, 180, .55, 'sawtooth', .6, 0, .4);
      A.noise(.7, 'bandpass', 500, .9, .7, 0, .5, 3500); A.boom(.8); break;
    case 'retract': A.tone(180, 38, .55, 'sawtooth', .55, 0, .4); A.noise(.55, 'bandpass', 3000, .7, .7, 0, .4, 250); break;
    case 'sizzle':   // molten burn-through: hiss + crackle + buzzing bite
      A.noise(.45 * k + .2, 'highpass', 4500, .7 * k, 1, 0, .25); A.crackle(.6, 40, .6 * k, 3000); A.tone(240, 90, .25, 'sawtooth', .3 * k, 0, .2); break;
    case 'thud': A.boom(.8 * k); break;
    case 'crack':    // fracture: sharp transient + crackle + glassy tick
      A.noise(.03, 'highpass', 5000, 1.4 * k, 1, 0, .3); A.crackle(.25, 28, .7 * k, 4000); A.tone(3200, 1500, .09, 'triangle', .3, 0, .4); break;
    case 'shatter':
      A.noise(.05, 'highpass', 5000, 1.6, 1, 0, .4); A.boom(.6);
      for (let i = 0; i < 28; i++) { const f = rand(2500, 9000); A.tone(f, f * .985, rand(.2, .9), 'sine', .16, rand(0, .6), .6); }
      A.crackle(.9, 70, .6, 5000); break;
    case 'clang':    // struck steel bar: inharmonic modes ringing in the hall
      A.noise(.03, 'highpass', 3000, 1.4, 1, 0, .3); A.modal(rand(380, 460), [1, 2.32, 4.25, 6.63, 9.38], [2.4, 1.7, 1.2, .8, .5], .7 * k, .55); A.boom(.5); break;
    case 'splash':
      A.noise(.08, 'lowpass', 2500, 1.1 * k, 1, 0, .3); A.noise(.8, 'lowpass', 3000, .9 * k, .8, .02, .35, 350);
      for (let i = 0; i < 9; i++) A.tone(rand(400, 900), rand(1200, 2600), rand(.04, .09), 'sine', .3, rand(0, .45), .3); break;
    case 'whoosh': A.noise(.9, 'bandpass', 300, 1.1 * k, .6, 0, .45, 1600); break;
    case 'crackle':  // electric arc: buzz + discharge crackle
      A.crackle(.2, 30, .8 * k, 1500); A.tone(120, 118, .18, 'sawtooth', .35 * k, 0, .25); break;
    case 'zap':      // magnetic reconnection
      A.zap(.45, .45 * k); A.tone(1600, 45, .6, 'sawtooth', .45, 0, .45); A.boom(.7); A.crackle(.55, 55, .7, 2500); break;
    case 'chime':    // coherent matter wave: glassy bells in a big space
      A.modal(880, [1, 1.5, 2, 3, 4.2], [2.2, 1.8, 1.5, 1.1, .8], .45 * k, .75); A.tone(3520, 3530, 1.2, 'sine', .08, .05, .8); break;
    case 'spawn': A.tone(200, 1200, .45, 'sine', .25, 0, .55); A.noise(.4, 'highpass', 4000, .2, 1, 0, .5); break;
    case 'click': A.tone(2600, 2350, .035, 'sine', .14, 0, .2); A.noise(.012, 'bandpass', 6500, .12, 3, 0, .1); break;
    case 'vent': A.noise(1.5, 'bandpass', 2500, 1, .5, 0, .4, 700); break;
    case 'impact':   // the slam under every hit
      A.noise(.02, 'highpass', 1500, 2.4 * k, .5, 0, .3);
      A.tone(150, 38, .35, 'sine', 1.3 * k, 0, .2);
      A.tone(70, 28, .7, 'triangle', .9 * k, 0, .3);
      A.noise(.25, 'bandpass', 5000, 1 * k, .8, 0, .3, 400);
      if (k > 1) A.noise(1, 'lowpass', 900, 1.2 * (k - .6), .6, .02, .5, 110);
      break;
    case 'miss': A.tone(220, 85, .4, 'sine', .25, 0, .35); A.noise(.35, 'bandpass', 700, .25, .8, 0, .4, 180); break;
    case 'appear': A.tone(500, 1400, .12, 'sine', .18, 0, .3); A.noise(.08, 'highpass', 5000, .15, 1, 0, .3); break;
    case 'freeze': A.tone(2400, 110, 1.1, 'sine', .45, 0, .8); A.noise(.7, 'highpass', 7000, .35, 1, 0, .6); break;
  }
}


// what each real object sounds like when struck, cut, shattered, burst or dropped
function matSound(mat, ev, k = 1) {
  const A = AU; if (!A.c || !S.sound) return;
  if (S.sndStyle === 'xylo') { if (ev !== 'land') return; const now = A.c.currentTime; if (A.last['xl' + mat] && now - A.last['xl' + mat] < .08) return; A.last['xl' + mat] = now; return xbar((XREG[mat] ?? 9) + (k < .6 ? 3 : 0) + rand(-1, 1), .12 + .12 * clamp(k, 0, 1), 0, .5); }
  const now = A.c.currentTime, key = mat + ev; if (A.last[key] && now - A.last[key] < .06) return; A.last[key] = now;
  k = clamp(k, .25, 1.6);
  const bar = [1, 2.76, 5.40, 8.93];   // free-free bar / tube modes
  switch (mat + ':' + ev) {
    case 'steel:land': A.modal(rand(500, 600), bar, [.5, .35, .25, .15], .45 * k, .35); A.boom(.4 * k); break;
    case 'ice:land': A.noise(.05, 'highpass', 3000, .6 * k); A.crackle(.15, 12, .4 * k, 3500); A.tone(2600, 2000, .1, 'triangle', .15 * k); break;
    case 'crystal:land': A.modal(rand(1800, 2400), [1, 2.3, 3.9], [.6, .4, .25], .3 * k, .4); break;
    case 'pipe:cut': sfx('sizzle', k); A.modal(rand(620, 700), bar, [2.6, 1.8, 1.1, .6], .55 * k, .5); break;
    case 'pipe:deflect': A.noise(.02, 'highpass', 3500, 1.3); A.modal(rand(620, 700), bar, [3.2, 2.2, 1.4, .8], .95 * k, .55); break;
    case 'pipe:land': A.modal(rand(620, 700), bar, [1.4, .9, .6, .3], .6 * k, .45); A.crackle(.08, 6, .4 * k, 3000); break;
    case 'gold:cut': sfx('sizzle', k * .8); A.modal(rand(260, 300), bar, [.4, .25, .15, .1], .55 * k, .3); break;
    case 'gold:deflect': A.noise(.02, 'lowpass', 2500, 1); A.modal(rand(260, 300), bar, [.5, .3, .2, .1], .85 * k, .35); A.boom(.5); break;
    case 'gold:land': A.boom(.7 * k); A.modal(280, bar, [.3, .2, .1, .08], .45 * k, .3); break;
    case 'gong:deflect': case 'gong:cut': {
      const f = rand(105, 125); A.noise(.04, 'lowpass', 1200, 1.3 * k); A.boom(.9 * k);
      A.modal(f, [1, 1.52, 2.0, 2.74, 3.3, 4.1, 5.2], [6, 5.2, 4.6, 3.6, 3, 2.4, 1.8], 1.2 * k, .6);
      A.noise(3.5, 'bandpass', 2500, .14 * k, 2, .15, .6);   // the shimmering swell after the strike
      if (ev === 'cut') sfx('sizzle', k); break;
    }
    case 'gong:land': A.modal(rand(105, 125), [1, 1.52, 2.0, 2.74], [2.5, 2, 1.6, 1.2], .7 * k, .6); break;
    case 'can:cut': case 'can:deflect': A.noise(.12, 'bandpass', 3200, 1 * k, 1.2); A.modal(rand(1000, 1200), [1, 1.7, 2.45, 3.3], [.22, .16, .1, .07], .55 * k, .25); A.crackle(.12, 16, .6 * k, 2500); if (ev === 'cut') sfx('sizzle', .5); break;
    case 'can:land': for (let i = 0; i < 3; i++) { A.noise(.04, 'bandpass', 2800, .7 * k / (i + 1), 1.2, i * .09); A.tone(1150, 1100, .08, 'triangle', .25 * k / (i + 1), i * .09); } break;
    case 'vase:shatter': case 'vase:cut': A.modal(rand(1500, 1900), [1, 2.32, 3.95], [.9, .6, .4], .55 * k, .6); sfx('shatter', k); break;
    case 'vase:deflect': A.modal(rand(1500, 1900), [1, 2.32, 3.95, 5.6], [1.4, 1, .7, .4], .65 * k, .6); break;
    case 'bulb:shatter': case 'bulb:cut':
      A.noise(.025, 'highpass', 800, 1.7 * k, .5); A.boom(.55 * k); A.crackle(.35, 40, .55 * k, 6000, .02); A.zap(.12, .18);
      for (let i = 0; i < 12; i++) { const f = rand(3500, 9000); A.tone(f, f, rand(.1, .4), 'sine', .13, rand(.02, .4), .5); } break;
    case 'vase:land': case 'bulb:land': A.modal(rand(2000, 2600), [1, 2.3], [.3, .2], .35 * k, .4); break;
    case 'plate:shatter': case 'plate:cut':
      A.noise(.03, 'highpass', 2500, 1.5 * k); A.modal(rand(1200, 1500), [1, 1.9, 3.1], [.25, .18, .1], .65 * k, .4); A.crackle(.4, 45, .65 * k, 2500);
      for (let i = 0; i < 14; i++) { const f = rand(1500, 4500); A.tone(f, f * .99, rand(.06, .25), 'sine', .15, rand(.03, .5), .4); } break;
    case 'plate:deflect': case 'plate:land': A.modal(rand(1200, 1500), [1, 1.9, 3.1], [.35, .22, .14], .6 * k, .4); break;
    case 'wood:cut': A.tone(190, 120, .12, 'sine', .8 * k, 0, .3); A.noise(.1, 'bandpass', 900, 1 * k, 1.2); A.crackle(.5, 45, .65 * k, 1400); A.noise(.6, 'highpass', 3500, .35 * k, 1, .05, .3); break;
    case 'wood:deflect': A.tone(210, 140, .15, 'sine', 1 * k, 0, .35); A.noise(.08, 'bandpass', 800, 1.1 * k, 1.5); break;
    case 'wood:land': A.tone(170, 110, .18, 'sine', .8 * k, 0, .35); A.noise(.07, 'bandpass', 600, .8 * k, 1.5); break;
    case 'brick:shatter': case 'brick:cut': case 'brick:deflect': A.noise(.35, 'lowpass', 1400, 1.2 * k, .7); A.crackle(.35, 40, .65 * k, 900); A.boom(.65 * k); break;
    case 'brick:land': A.noise(.15, 'lowpass', 900, .9 * k); A.tone(110, 60, .15, 'sine', .55 * k); break;
    case 'concrete:shatter': case 'concrete:cut': case 'concrete:deflect':
      A.noise(.6, 'lowpass', 1100, 1.4 * k, .6); A.crackle(.8, 80, .65 * k, 700); A.boom(1.1 * k); A.noise(1.2, 'bandpass', 1800, .3 * k, .6, .2, .4, 600); break;
    case 'concrete:land': A.boom(.9 * k); A.noise(.25, 'lowpass', 700, .9 * k); break;
    case 'melon:cut': A.tone(150, 85, .18, 'sine', 1 * k, 0, .3); A.noise(.45, 'lowpass', 1800, 1 * k, .8, .02, .3, 300);
      for (let i = 0; i < 8; i++) A.noise(rand(.02, .06), 'bandpass', rand(600, 1500), .55, 2, rand(.05, .4), .2); break;
    case 'melon:deflect': case 'melon:land': A.tone(140, 90, .2, 'sine', 1 * k, 0, .35); A.noise(.06, 'lowpass', 600, .7 * k); break;
    case 'apple:cut': A.crackle(.12, 35, 1 * k, 2200); A.noise(.05, 'bandpass', 2500, .9 * k, 1.5); A.noise(.2, 'lowpass', 1500, .35 * k, 1, .05, .2, 400); break;
    case 'apple:deflect': case 'apple:land': A.tone(260, 160, .1, 'sine', .6 * k); A.noise(.04, 'lowpass', 900, .5 * k); break;
    case 'balloon:burst': A.noise(.012, 'highpass', 200, 2.2 * k, .5, 0, .5); A.noise(.15, 'lowpass', 900, 1.3 * k, .7, .005, .5); A.boom(.7 * k); break;
    case 'wballoon:burst': A.noise(.012, 'highpass', 300, 1.8 * k, .5, 0, .4); A.last.splash = 0; sfx('splash', 1.5); break;
    default:
      if (ev === 'cut') sfx('sizzle', k); else if (ev === 'deflect') sfx('clang', k * .6); else if (ev === 'shatter') sfx('shatter', k); else if (ev === 'land') sfx('thud', k * .6); else if (ev === 'burst') sfx('whoosh', k);
  }
}

// the violent part of every hit: slash scar, burst lines, shockwave that shoves the scene, camera punch, slam sound
function violence(o, info, h) {
  const now = performance.now(), chain = now - (S.lastViol || 0) < 150; S.lastViol = now;
  if (chain) h *= .35;   // follow-up hits inside the same freeze stay smaller
  const x = info.x, y = info.y, sp = hypot(info.bvx, info.bvy) || 1, ux = info.bvx / sp, uy = info.bvy / sp, g = S.geo, cols = edgeCols();
  addFx({ k: 'slash', x, y, dx: g.dx, dy: g.dy, len: 240 * h + (o.rad || 60) * 2.2, w: 9 * h, cols, life: .45, max: .45 });
  addFx({ k: 'burst', x, y, n: 20, r0: 24, r1: 240 * h, seed: rand(0, TAU), life: .3, max: .3 });
  ring(x, y, '#ffffff', 150 * h); addFx({ k: 'ring', x, y, r: 6, R: 340 * h, c: pick(cols), life: .75, max: .75 });
  sparks(x, y, Math.round(55 * h), cols.concat('#ffffff', '#ffe9a8'), ux, uy, .35, 1400 * h);
  sparks(x, y, Math.round(25 * h), ['#ffffff', '#fff3c4'], 0, 0, 1, 700 * h);
  flash(x, y, 170 * h, '#ffffff');
  S.punch = Math.max(S.punch, .9 * h); S.kickX = ux * 24 * h; S.kickY = uy * 24 * h;
  S.shake = Math.max(S.shake, 9 * h);
  if (!chain) { S.hitstop = Math.max(S.hitstop, .05 + .07 * h); S.flash = Math.min(.6, S.flash + .25 * h); S.flashCol = '#ffffff'; S.chroma = Math.max(S.chroma, .25 * h); }
  if (h > 1.15 && S.cine) S.cineT = Math.max(S.cineT, .45);
  const R = 270 * h;
  for (const q of objects) {
    if (q === o || q.dead) continue;
    const qx = q.x ?? q.hx, qy = q.y ?? q.hy, d = hypot(qx - x, qy - y); if (d > R || d < 1) continue;
    const f = (1 - d / R) * 520 * h;
    if (q.kind === 'solid' && q.free) { q.vx += (qx - x) / d * f; q.vy += (qy - y) / d * f - 120 * (1 - d / R); q.va += rand(-5, 5) * (1 - d / R); }
    else if (q.kind === 'plasma') { q.vx += (qx - x) / d * f * .5; q.vy += (qy - y) / d * f * .5; q.uns = 1; }
  }
  for (const p of water) { const d = hypot(p.x - x, p.y - y); if (d < R && d > 1) { const f = (1 - d / R) * 420 * h; p.vx += (p.x - x) / d * f; p.vy += (p.y - y) / d * f; } }
  sfx('impact', h);
  if (AU.c && S.sound && !chain) AU.thud(h);
}

function realImpact(o, info, r, hot, str) {
  const mat = o.mat, M = MATS[mat], x = info.x, y = info.y, res = r.res;
  let msg = '', cls = 'ok', shake = 3, stop = .04, cine = false;
  matSound(mat, res === 'SHATTER' ? 'shatter' : res === 'DEFLECT' ? 'deflect' : res === 'BURST' ? 'burst' : res === 'GRAZE' ? 'land' : 'cut', str);
  if (res === 'DEFLECT') {
    if (M.fx === 'metal') sparks(x, y, 44, ['#ffffff', '#ffe9a8', '#ffb347'], -info.bvx, -info.bvy, .55, 900);
    else if (M.fx === 'stone') dustFx(x, y, 14, M.dustCol || '#aaaaaa'); else if (M.fx === 'wood') glitter(x, y, 14, '#c08a4a'); else glitter(x, y, 10, '#ffffff');
    msg = M.msg.DEFLECT || `${M.label} deflected the blade · ${Math.round(info.value / M.hard * 100)}% of needed force — swing faster or ${needEdges(mat)}`;
    cls = 'bad'; shake = mat === 'gong' ? 9 : 6; stop = .07; recoil(); S.stats.deflects++;
    return { msg, cls, shake, stop, cine };
  }
  if (res === 'GRAZE') { sparks(x, y, 8, hot, info.bvx, info.bvy, .5, 400); return { msg: `Grazed the ${M.label.toLowerCase()}`, cls: 'mid', shake: 1, stop: .02, cine }; }
  switch (M.fx) {
    case 'metal': sparks(x, y, 30 * str, hot.concat('#ffd27a', '#ff9a3c'), info.bvx, info.bvy, .4, 750); molten(o.cutLine, 16); break;
    case 'glass': glitter(x, y, 70, '#d8fff6'); sparks(x, y, 20, ['#ffffff', '#bffff0'], 0, 0, 1, 600); break;
    case 'ceramic': glitter(x, y, 40, '#ffffff'); dustFx(x, y, 8, '#e8e4da'); break;
    case 'wood': glitter(x, y, 24, '#c08a4a'); dustFx(x, y, 10, '#3a3a3a'); molten(o.cutLine, 6); break;
    case 'stone': dustFx(x, y, 26, M.dustCol || '#aaaaaa'); glitter(x, y, 18, M.dustCol || '#aaaaaa'); break;
    case 'fruit': splash(x, y, info, 34, M.juice); break;
    case 'pop': for (let i = 0; i < 40; i++) glitter(o.x, o.y, 1, pick(['#ff3b5c', '#ffb02e', '#3bd5ff', '#8c5bff', '#3bff8a', o.col || '#ffffff'])); flash(o.x, o.y, 120, o.col || '#ffffff'); break;
    case 'water': {
      const b = addObj(spawnWater(o.x, o.y, true, 0, 0, '#3fa0ff'));
      for (const p of water) if (p.g === b.id) { p.vx += (p.x - o.x) * 7 + info.bvx * .05; p.vy += (p.y - o.y) * 7 - 120; }
      splash(o.x, o.y, info, 20, '#7fc4ff'); break;
    }
    case 'bulb': flash(x, y, 240, '#fff6c8'); glitter(x, y, 60, '#fffbe8'); for (let i = 0; i < 4; i++) bolt(x, y, x + rand(-60, 60), y + rand(-60, 60), '#fff2a8', .15); break;
  }
  if (res === 'SHATTER') { msg = M.msg.SHATTER || `${M.label} shattered · ${r.n} pieces`; shake = 8; stop = .08; cine = true; S.stats.shatters++; }
  else if (res === 'BURST') { msg = M.msg.BURST || `${M.label} burst`; shake = 5; stop = .05; S.stats.cuts++; }
  else { msg = M.msg.CUT || `${M.label} cut clean through`; shake = M.fx === 'metal' || M.fx === 'stone' ? 5 : 3; S.stats.cuts++; }
  if (mat === 'gong') { shake = 9; cine = true; }
  return { msg, cls, shake, stop, cine };
}

// ---------- fx particles ----------
let fx = [];
const addFx = p => { if (fx.length < 5000) fx.push(p); };
function sparks(x, y, n, cols, dx = 0, dy = 0, spread = 1, spd = 600) {
  const base = Math.atan2(dy, dx);
  for (let i = 0; i < n; i++) {
    const a = base + rand(-1, 1) * Math.PI * spread, v = rand(.25, 1) * spd, l = rand(.25, .75);
    addFx({ k: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: l, max: l, c: pick(cols), s: rand(.8, 2.4), sp: Math.random() < .3 ? 0 : 1 });
  }
  if (n >= 18) for (let i = 0; i < n / 7; i++) { const l = rand(1.4, 3); addFx({ k: 'smoke', x: x + rand(-6, 6), y: y + rand(-6, 6), vx: rand(-40, 40) + dx * .03, vy: rand(-80, -20), s: rand(7, 14), life: l, max: l, r: rand(0, TAU) }); }
}
// thermal colour of a cooling spark: white-hot → yellow → orange → cherry red
const SPARK_T = ['#7a1606', '#c8300f', '#ff6a1f', '#ffae42', '#ffe39a', '#fffaf0'];
const sparkCol = (h, c) => h > .82 ? c : SPARK_T[Math.min(5, h * 6.6 | 0)];
const flash = (x, y, s, c) => addFx({ k: 'flash', x, y, s, c, life: .22, max: .22 });
const ring = (x, y, c, R) => addFx({ k: 'ring', x, y, r: 4, R, c, life: .55, max: .55 });
const bolt = (ax, ay, bx, by, c, life = .12) => addFx({ k: 'bolt', ax, ay, bx, by, c, life, max: life });
function steamAt(x, y, n) { for (let i = 0; i < n; i++) { const l = rand(.8, 1.8); addFx({ k: 'steam', x: x + rand(-8, 8), y: y + rand(-8, 8), vx: rand(-30, 30), vy: rand(-60, -10), s: rand(6, 14), life: l, max: l }); } }
function dustFx(x, y, n, c) { for (let i = 0; i < n; i++) { const l = rand(.8, 2); addFx({ k: 'dust', x: x + rand(-10, 10), y: y + rand(-10, 10), vx: rand(-90, 90), vy: rand(-80, 20), s: rand(6, 14), c, life: l, max: l }); } }
function glitter(x, y, n, c = '#e6d0ff') { for (let i = 0; i < n; i++) { const a = rand(0, TAU), v = rand(40, 420), l = rand(.5, 1.4); addFx({ k: 'glit', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: l, max: l, c, s: rand(1.5, 3.5) }); } }
function molten(line, n) {
  if (!line) return;
  for (let i = 0; i < n; i++) { const t = Math.random(), l = rand(.6, 1.5); addFx({ k: 'ember', x: lerp(line[0].x, line[1].x, t), y: lerp(line[0].y, line[1].y, t), vx: rand(-90, 90), vy: rand(-160, 40), life: l, max: l, c: pick(['#fffbe8', '#ffe27a', '#ffa630']), s: rand(1.5, 3) }); }
}

function updateFx(dt) {
  let j = 0;
  for (let i = 0; i < fx.length; i++) {
    const p = fx[i]; p.life -= dt; if (p.life <= 0) continue;
    switch (p.k) {
      case 'spark': case 'glit': {
        if (p.k === 'spark' && !p.sp && p.life < p.max * .55) {   // pyro split: a spark bursts into two smaller ones
          p.sp = 1; for (let q = 0; q < 2; q++) { const l = p.life * rand(.4, .8); fx.push({ k: 'spark', x: p.x, y: p.y, vx: p.vx * .6 + rand(-160, 160), vy: p.vy * .6 + rand(-160, 60), life: l, max: l, c: p.c, s: p.s * .6, sp: 1 }); } }
        const d = Math.exp(-1.6 * dt); p.vx *= d; p.vy = p.vy * d + G * (p.k === 'spark' ? .5 : .2) * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; if (p.y > floorY && p.vy > 0) { p.y = floorY; p.vy *= -.35; p.vx *= .6; } break;
      }
      case 'ember': p.vy += G * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.y > floorY && p.vy > 0) { p.y = floorY; p.vy *= -.2; p.vx *= .5; } break;
      case 'smoke': p.vy -= 18 * dt; p.vx *= Math.exp(-.8 * dt); p.x += p.vx * dt; p.y += p.vy * dt; p.s += 16 * dt; break;
      case 'steam': p.vy -= 50 * dt; p.vx *= Math.exp(-dt); p.x += p.vx * dt; p.y += p.vy * dt; p.s += 24 * dt; break;
      case 'ring': p.r += (p.R - p.r) * (1 - Math.exp(-dt * 7)); break;
      case 'dust': p.vx *= Math.exp(-2 * dt); p.vy += (30 - p.vy) * 1.5 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.s += 12 * dt; break;
      case 'text': p.y -= 45 * dt; break;
    }
    fx[j++] = p;
  }
  fx.length = j;
}
function drawBolt(ax, ay, bx, by, col, a, w = 2) {
  const dx = bx - ax, dy = by - ay, L = hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, seg = Math.max(4, L / 14 | 0);
  ctx.beginPath(); ctx.moveTo(ax, ay);
  for (let i = 1; i < seg; i++) { const t = i / seg, o = rand(-1, 1) * L * .12 * Math.sin(t * Math.PI); ctx.lineTo(ax + dx * t + nx * o, ay + dy * t + ny * o); }
  ctx.lineTo(bx, by);
  ctx.globalAlpha = a * .35; ctx.strokeStyle = col; ctx.lineWidth = w * 4; ctx.stroke();
  ctx.globalAlpha = a; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = w * .6; ctx.stroke();
}
function drawFx(pass) {
  ctx.lineCap = 'round';
  for (const p of fx) {
    const t = p.life / p.max;
    if (pass === 'steam') { if (p.k === 'smoke') { const e = 1 - t; glow(p.x, p.y, p.s, '#3a3640', .32 * Math.min(1, e * 5) * t); } else if (p.k === 'steam') glow(p.x, p.y, p.s, '#dfe8f5', .14 * t); else if (p.k === 'dust') glow(p.x, p.y, p.s, p.c, .3 * t); continue; }
    switch (p.k) {
      case 'spark': {   // motion-blurred streak: coloured sheath + white-hot filament, length follows speed
        const c = sparkCol(t, p.c), k = .03 + .012 * t, ex = p.x - p.vx * k, ey = p.y - p.vy * k, fl = .75 + .25 * Math.sin(p.life * 90 + p.x);
        ctx.globalAlpha = Math.min(1, t * 1.8) * fl; ctx.strokeStyle = c; ctx.lineWidth = p.s * 1.9; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.globalAlpha = Math.min(1, t * 2) * .9; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = p.s * .55; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(lerp(p.x, ex, .6), lerp(p.y, ey, .6)); ctx.stroke();
        glow(p.x, p.y, 5 + 7 * t, c, t * .45); break;
      }
      case 'ember': { const fl = .6 + .4 * Math.sin(p.life * 31 + p.x * .1); glow(p.x, p.y, 5 + 3 * t, sparkCol(t * .9, p.c), t * fl); glow(p.x, p.y, 1.5, '#ffffff', t * fl); break; }
      case 'glit': glow(p.x, p.y, p.s * 2, p.c, t * (.5 + .5 * Math.sin(p.life * 40))); break;
      case 'flash': glow(p.x, p.y, p.s * (1.3 - .3 * t), p.c, t); break;
      case 'ring': ctx.globalAlpha = t * .8; ctx.strokeStyle = p.c; ctx.lineWidth = 3 * t + 1; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.stroke(); break;
      case 'bolt': drawBolt(p.ax, p.ay, p.bx, p.by, p.c, t); break;
      case 'slash': {
        const L = p.len * (1.1 - .1 * t), nx = -p.dy, ny = p.dx, ax = p.x - p.dx * L / 2, ay = p.y - p.dy * L / 2, bx = p.x + p.dx * L / 2, by = p.y + p.dy * L / 2;
        p.cols.forEach((c, j) => { const o = (j - (p.cols.length - 1) / 2) * p.w * .55 * (2 - t); ctx.globalAlpha = .55 * t; ctx.strokeStyle = c; ctx.lineWidth = p.w * 1.6 * t; ctx.beginPath(); ctx.moveTo(ax + nx * o, ay + ny * o); ctx.lineTo(bx + nx * o, by + ny * o); ctx.stroke(); });
        ctx.globalAlpha = t; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = p.w * t; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
        break;
      }
      case 'burst': {
        const e = 1 - t; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5 * t + .5; ctx.globalAlpha = .85 * t; ctx.beginPath();
        for (let i = 0; i < p.n; i++) { const a = p.seed + i * TAU / p.n + Math.sin(i * 7.3) * .12, r0 = p.r0 + (p.r1 - p.r0) * e * .55, r1 = p.r0 + (p.r1 - p.r0) * e * (.8 + .2 * Math.sin(i * 3.1));
          ctx.moveTo(p.x + Math.cos(a) * r0, p.y + Math.sin(a) * r0); ctx.lineTo(p.x + Math.cos(a) * r1, p.y + Math.sin(a) * r1); }
        ctx.stroke(); break;
      }
      case 'text': ctx.globalAlpha = Math.min(1, t * 1.5); ctx.fillStyle = p.c; ctx.font = `${p.size}px Michroma, sans-serif`; ctx.textAlign = 'center'; ctx.fillText(p.txt, p.x, p.y); break;
    }
  }
}

// ---------- matter ----------
let objects = [];
const addObj = o => { o.cool = Math.max(o.cool || 0, .25); if (o.slot === undefined) o.slot = -1; objects.push(o); return o; };

class Solid {
  constructor(mat, wv, o = {}) {
    this.kind = 'solid'; this.mat = mat;
    const c = polyCentroid(wv);
    this.x = c.x; this.y = c.y; this.hx = c.x; this.hy = c.y;
    this.v = wv.map(p => ({ x: p.x - c.x, y: p.y - c.y }));
    this.rad = Math.max(...this.v.map(p => hypot(p.x, p.y))); this.area = Math.abs(polyArea(this.v));
    this.a = 0; this.vx = o.vx || 0; this.vy = o.vy || 0; this.va = o.va || 0;
    this.free = !!o.free; this.hot = []; this.t = rand(0, TAU); this.rest = 0; this.alpha = 1; this.glint = o.glint || 0; this.cool = 0;
    this.s = S.sc; this.cut = !!o.cut; this.ps = 1; this.sc2 = 1; this.seed = (Math.random() * 1e9 | 0) + 1;
  }
  intact() { return !this.free; }
  toWorld(p) { const c = Math.cos(this.a), s = Math.sin(this.a), k = this.sc2; return { x: this.x + (p.x * c - p.y * s) * k, y: this.y + (p.x * s + p.y * c) * k }; }
  toLocal(p) { const c = Math.cos(this.a), s = Math.sin(this.a), k = this.sc2 || 1, dx = p.x - this.x, dy = p.y - this.y; return { x: (dx * c + dy * s) / k, y: (-dx * s + dy * c) / k }; }
  world() { return this.v.map(p => this.toWorld(p)); }
  update(dt) {
    this.glint = Math.max(0, this.glint - dt * .6);
    if (!this.free) {
      this.t += dt; this.x = this.hx; this.y = this.hy + Math.sin(this.t * 1.4) * 6; this.a = Math.sin(this.t * .7) * .06;
      if (this.ps < 1) { this.ps = Math.min(1, this.ps + dt * 3.5); this.sc2 = easeOutBack(this.ps); } else this.sc2 = 1;
      if (this.auto && !this.scored) { this.life -= dt; if (this.life <= 0) { autoMiss(this); this.dead = true; ring(this.x, this.y, '#ff5a6a', this.rad * 1.4); glitter(this.x, this.y, 12, '#8890b0'); } }
    }
    else {
      this.vy += G * dt; this.x += this.vx * dt; this.y += this.vy * dt; this.a += this.va * dt;
      let maxY = -1e9, minX = 1e9, maxX = -1e9;
      for (const p of this.world()) { if (p.y > maxY) maxY = p.y; if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x; }
      if (maxY > floorY && this.vy >= 0) {
        this.y -= maxY - floorY;
        if (this.vy > 260 && this.area > 250 * this.s * this.s) matSound(this.mat, 'land', this.vy / 900 * clamp(this.area / (3500 * this.s * this.s), .3, 1));
        if (this.auto && !this.scored) { autoMiss(this); this.rest = 12; }
        this.vy *= -.3; this.vx *= .88; this.va *= .82;
      }
      if (minX < 0) { this.x -= minX; this.vx = Math.abs(this.vx) * .5; }
      if (maxX > W) { this.x -= maxX - W; this.vx = -Math.abs(this.vx) * .5; }
      if (maxY > floorY - 2 && hypot(this.vx, this.vy) < 40) this.rest += dt; else this.rest = 0;
      if (this.rest > 14) { this.alpha -= dt * .5; if (this.alpha <= 0) this.dead = true; }
    }
    for (const h of this.hot) {
      h.heat -= dt * (this.mat === 'ice' ? .5 : .16);
      if (h.heat > .3 && Math.random() < dt * 22 * h.heat) {
        const pa = this.toWorld(h.a), pb = this.toWorld(h.b), t = Math.random(), x = lerp(pa.x, pb.x, t), y = lerp(pa.y, pb.y, t);
        if (this.mat === 'steel' || MATS[this.mat].fx === 'metal' || MATS[this.mat].fx === 'wood') { if (MATS[this.mat].fx === 'wood' && Math.random() < .4) dustFx(x, y, 1, '#4a4a4a'); const l = rand(.6, 1.4); addFx({ k: 'ember', x, y, vx: rand(-30, 30), vy: rand(-20, 40), life: l, max: l, c: heatColor(h.heat), s: rand(1.5, 3) }); }
        else if (this.mat === 'ice') { if (Math.random() < .5) dropWater(x, y, rand(-20, 20), rand(0, 40)); else steamAt(x, y, 1); }
        else glitter(x, y, 1);
      }
    }
    if (this.hot.length) this.hot = this.hot.filter(h => h.heat > 0);
  }
  hit(a, b) {
    if (this.sc2 < .9 || pointSeg(this.x, this.y, a, b).d > this.rad * this.sc2) return null;
    const wv = this.world(); let best = null;
    for (let i = 0; i < wv.length; i++) { const r = segInt(a, b, wv[i], wv[(i + 1) % wv.length]); if (r && (!best || r.t < best.t)) best = r; }
    if (!best && pointInPoly(b, wv)) best = { x: b.x, y: b.y };
    return best;
  }
  touch(hp) {
    if (!S.edges[0] && !S.edges[1]) return;
    sparks(hp.x, hp.y, 2, ['#ffe27a', '#ffa630', '#ffffff'], 0, -1, .5, 250); sfx('sizzle', .3);
  }
  slice(a, b, info) {
    const M = MATS[this.mat];
    if (info.value < M.hard) {
      this.free = true; this.vx += info.bvx * .12; this.vy += info.bvy * .12 - 80; this.va += rand(-4, 4);
      return { res: 'DEFLECT' };
    }
    if (M.burst) { this.dead = true; return { res: 'BURST' }; }
    const shatter = (M.shatter === 'res' ? S.edges[3] : !!M.shatter) && this.area > 1400 * this.s * this.s;
    const n = this.split(a, b, info, shatter);
    if (!n) return this.auto || this.area > 900 * this.s * this.s ? { res: 'GRAZE' } : null;
    return { res: shatter ? 'SHATTER' : 'CUT', n };
  }
  split(a, b, info, shatter) {
    const sp = splitPoly(this.world(), a, b);
    if (!sp.p2 || sp.L.length < 3 || sp.R.length < 3) return 0;
    if (Math.abs(polyArea(sp.L)) < 30 || Math.abs(polyArea(sp.R)) < 30) return 0;
    const dx = b.x - a.x, dy = b.y - a.y, dl = hypot(dx, dy) || 1, nx = -dy / dl, ny = dx / dl;
    const heat = (S.edges[0] ? clamp(.65 + .35 * S.power, 0, 1) : S.edges[1] ? .45 : .12) * (MATS[this.mat].heatMul ?? 1);
    this.dead = true; this.cutLine = [sp.p1, sp.p2];
    if (shatter) {
      const polys = [sp.L, sp.R], target = Math.round(7 + clamp(info.value, 0, 2) * 5); let guard = 0;
      while (polys.length < target && guard++ < 60) {
        let bi = 0, ba = 0; polys.forEach((p, i) => { const ar = Math.abs(polyArea(p)); if (ar > ba) { ba = ar; bi = i; } });
        if (ba < 160) break;
        const c = polyCentroid(polys[bi]), ang = rand(0, Math.PI), ca = { x: c.x + rand(-6, 6), y: c.y + rand(-6, 6) };
        const s2 = splitPoly(polys[bi], ca, { x: ca.x + Math.cos(ang), y: ca.y + Math.sin(ang) });
        if (!s2.p2 || s2.L.length < 3 || s2.R.length < 3 || Math.abs(polyArea(s2.L)) < 20 || Math.abs(polyArea(s2.R)) < 20) continue;
        polys.splice(bi, 1, s2.L, s2.R);
      }
      for (const p of polys) {
        const c = polyCentroid(p); let ux = c.x - info.x, uy = c.y - info.y; const ul = hypot(ux, uy) || 1, v = rand(320, 820) * (.7 + .3 * info.speed);
        addObj(new Solid(this.mat, p, { free: true, vx: this.vx + ux / ul * v + info.bvx * .06, vy: this.vy + uy / ul * v + info.bvy * .06 - 120, va: rand(-9, 9), glint: this.mat === 'crystal' ? 1 : 0, cut: true }));
      }
      return polys.length;
    }
    const push = 90 + 230 * clamp(info.value, 0, 1.5);
    [[sp.L, 1], [sp.R, -1]].forEach(([p, sg]) => {
      const o = new Solid(this.mat, p, { free: true, vx: this.vx + nx * sg * push + info.bvx * .05, vy: this.vy + ny * sg * push + info.bvy * .05 - 70, va: this.va + sg * rand(1, 3.5), cut: true });
      for (const h of this.hot) {
        const ha = this.toWorld(h.a), hb = this.toWorld(h.b), mx = (ha.x + hb.x) / 2, my = (ha.y + hb.y) / 2;
        if (((b.x - a.x) * (my - a.y) - (b.y - a.y) * (mx - a.x) >= 0) === (sg > 0)) o.hot.push({ a: o.toLocal(ha), b: o.toLocal(hb), heat: h.heat });
      }
      o.hot.push({ a: o.toLocal(sp.p1), b: o.toLocal(sp.p2), heat });
      addObj(o);
    });
    return 2;
  }
  extrude(wv) {   // perspective thickness: back face pulled toward the vanishing point, side faces lit by LIGHT
    const M = MATS[this.mat], vp = S.vp, k = clamp(this.rad * this.sc2 * (M.thin ? .00035 : .0011), .015, .1);
    const back = wv.map(p => ({ x: p.x + (vp.x - p.x) * k, y: p.y + (vp.y - p.y) * k }));
    const [r, g, b] = hexRgb(M.side || M.color || '#888888'), al = (M.clear ? .45 : 1) * this.alpha;
    ctx.lineWidth = 1;
    for (let i = 0; i < wv.length; i++) {
      const j = (i + 1) % wv.length, a = wv[i], c = wv[j];
      let nx = c.y - a.y, ny = -(c.x - a.x); const nl = hypot(nx, ny) || 1; nx /= nl; ny /= nl;
      if (nx * ((a.x + c.x) / 2 - this.x) + ny * ((a.y + c.y) / 2 - this.y) < 0) { nx = -nx; ny = -ny; }
      const sh = .32 + .68 * Math.max(0, nx * LIGHT.x + ny * LIGHT.y);
      ctx.globalAlpha = al; ctx.fillStyle = `rgb(${r * sh | 0},${g * sh | 0},${b * sh | 0})`;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(c.x, c.y); ctx.lineTo(back[j].x, back[j].y); ctx.lineTo(back[i].x, back[i].y); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = `rgba(0,0,0,${.25 * al})`; ctx.stroke();
    }
    ctx.globalAlpha = this.alpha;
  }
  shade(wv, bb, round) {   // light & shadow over the front face, plus the blade's coloured light
    tracePath(wv); ctx.save(); ctx.clip(); ctx.globalAlpha = this.alpha;
    const w = bb.maxX - bb.minX, h = bb.maxY - bb.minY;
    if (round) {
      const r = this.rad * this.sc2, lx = this.x - r * .38, ly = this.y - r * .42;
      let g = ctx.createRadialGradient(lx, ly, 0, lx, ly, r * .9); g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(.35, 'rgba(255,255,255,.08)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(bb.minX, bb.minY, w, h);
      g = ctx.createRadialGradient(this.x - r * .2, this.y - r * .25, r * .3, this.x, this.y, r * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)');
      ctx.fillStyle = g; ctx.fillRect(bb.minX, bb.minY, w, h);
    } else {
      const g = ctx.createLinearGradient(bb.minX, bb.minY, bb.maxX, bb.maxY); g.addColorStop(0, 'rgba(255,255,255,.16)'); g.addColorStop(.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.3)');
      ctx.fillStyle = g; ctx.fillRect(bb.minX, bb.minY, w, h);
    }
    const G = S.geo;
    if (G && S.ignite > .3) {
      const q = pointSeg(this.x, this.y, { x: G.bx, y: G.by }, { x: G.tx, y: G.ty }), R = 340;
      if (q.d < R) {
        const I = S.ignite * (1 - q.d / R) * .55, [r, g, b] = S.avgCol, lg = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, R);
        lg.addColorStop(0, `rgba(255,255,255,${I})`); lg.addColorStop(.35, `rgba(${r},${g},${b},${I * .7})`); lg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg; ctx.fillRect(bb.minX, bb.minY, w, h);
      }
    }
    ctx.restore();
  }
  draw() {
    const wv = this.world(); let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    ctx.globalAlpha = this.alpha; ctx.beginPath();
    wv.forEach((p, i) => { i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x; if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y; });
    ctx.closePath();
    const MM = MATS[this.mat], round = MM.round && !this.cut;
    if (!round) { this.extrude(wv); tracePath(wv); }
    ctx.lineWidth = 1.2;
    const P = MM.paint;
    if (P) P(this, { minX, minY, maxX, maxY });
    else if (this.mat === 'steel') {
      const gr = ctx.createLinearGradient(minX, minY, maxX, maxY);
      gr.addColorStop(0, '#5d6676'); gr.addColorStop(.35, '#c7d0dc'); gr.addColorStop(.55, '#7d8797'); gr.addColorStop(1, '#2c323d');
      ctx.fillStyle = gr; ctx.fill(); ctx.strokeStyle = 'rgba(230,238,250,.55)'; ctx.stroke();
    } else if (this.mat === 'ice') {
      ctx.fillStyle = 'rgba(150,225,255,.28)'; ctx.fill(); ctx.strokeStyle = 'rgba(215,248,255,.85)'; ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.beginPath(); ctx.moveTo(lerp(minX, maxX, .25), minY + 8); ctx.lineTo(lerp(minX, maxX, .55), maxY - 10); ctx.stroke();
    } else {
      const gr = ctx.createLinearGradient(minX, minY, maxX, maxY);
      gr.addColorStop(0, 'rgba(210,150,255,.5)'); gr.addColorStop(1, 'rgba(80,40,170,.38)');
      ctx.fillStyle = gr; ctx.fill(); ctx.strokeStyle = 'rgba(245,215,255,.9)'; ctx.stroke();
      ctx.strokeStyle = 'rgba(255,230,255,.22)'; ctx.beginPath();
      for (const p of wv) { ctx.moveTo(this.x, this.y); ctx.lineTo(p.x, p.y); } ctx.stroke();
    }
    this.shade(wv, { minX, minY, maxX, maxY }, round);
    if (this.auto && !this.scored) {   // target-practice ring + name
      const f = clamp(this.life / this.maxLife, 0, 1), R = this.rad * this.sc2 + 14;
      if (!this.free) {
        ctx.globalAlpha = .9; ctx.lineWidth = 3; ctx.strokeStyle = f > .35 ? '#7dffb0' : '#ff5a6a';
        ctx.beginPath(); ctx.arc(this.x, this.y, R, -Math.PI / 2, -Math.PI / 2 + TAU * f); ctx.stroke();
        ctx.globalAlpha = .2; ctx.beginPath(); ctx.arc(this.x, this.y, R, 0, TAU); ctx.stroke();
      }
      ctx.globalAlpha = .85; ctx.fillStyle = '#e8ecff'; ctx.font = '600 12px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
      ctx.fillText(MATS[this.mat].label.toUpperCase(), this.x, this.y + R + 16);
    }
    ctx.globalAlpha = 1;
  }
  drawHot() {
    if (this.glint > 0) {
      const wv = this.world(); ctx.globalAlpha = this.glint * .7; ctx.strokeStyle = '#29ff7f'; ctx.lineWidth = 1.5;
      ctx.beginPath(); wv.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath(); ctx.stroke();
    }
    for (const h of this.hot) {
      if (h.heat <= .02) continue;
      const a = this.toWorld(h.a), b = this.toWorld(h.b), col = this.mat === 'ice' ? '#bdf3ff' : heatColor(h.heat);
      ctx.strokeStyle = col; ctx.lineCap = 'round';
      ctx.globalAlpha = this.alpha * Math.min(1, h.heat * 1.5) * .3; ctx.lineWidth = 10 * h.heat + 2; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.globalAlpha = this.alpha * Math.min(1, h.heat * 1.5); ctx.lineWidth = 2.5; ctx.stroke();
    }
  }
}

// --- liquid: particle blobs with cohesion + short-range pressure ---
let water = [];
const groups = new Map(); let gid = 1;
class WaterBlob {
  constructor(x, y, free) {
    this.kind = 'water'; this.mat = 'water'; this.id = gid++; groups.set(this.id, this);
    this.hx = x; this.hy = y; this.ty = y; this.free = free; this.ten = 1; this.t = rand(0, TAU);
    this.cx = x; this.cy = y; this.n = 0; this.r = 40; this.cool = 0; this.age = 0;
  }
  intact() { return !this.free; }
  update(dt) { this.age += dt; this.t += dt; this.ty = this.hy + Math.sin(this.t * 1.4) * 6; if (this.free) this.ten = Math.max(.1, this.ten - dt * .12); }
  hit(a, b) { if (this.n < 4) return null; const q = pointSeg(this.cx, this.cy, a, b); return q.d < this.r * .85 ? q : null; }
  touch(hp) { if (S.edges[0]) { steamAt(hp.x, hp.y, 1); sfx('sizzle', .25); } }
  slice(a, b, info) {
    const ok = info.value >= MATS.water.hard;
    const dx = b.x - a.x, dy = b.y - a.y, dl = hypot(dx, dy) || 1, nx = -dy / dl, ny = dx / dl;
    let A = null, B = null;
    if (ok) { A = addObj(new WaterBlob(this.cx, this.cy, true)); B = addObj(new WaterBlob(this.cx, this.cy, true)); A.ten = B.ten = .9; this.dead = true; }
    const push = S.edges[4] ? 120 : 80;
    for (const p of water) {
      if (p.g !== this.id) continue;
      const s = (dx * (p.y - a.y) - dy * (p.x - a.x)) / dl, d = Math.abs(s), sg = s >= 0 ? 1 : -1;
      if (d < (S.edges[4] ? 5 : 9) && Math.random() < .55) {
        p.g = 0; p.life = rand(1.2, 2.6); p.vx += info.bvx * rand(.1, .3) + rand(-60, 60); p.vy += info.bvy * rand(.1, .3) - rand(40, 160); continue;
      }
      if (ok) { p.g = sg > 0 ? A.id : B.id; p.vx += nx * sg * push; p.vy += ny * sg * push; }
      else if (d < 26) { const w = 1 - d / 26; p.vx += info.bvx * .12 * w; p.vy += info.bvy * .12 * w; }
    }
    return { res: ok ? 'SPLIT' : 'PASS' };
  }
  draw() {}
}
function spawnWater(x, y, free = false, vx = 0, vy = 0, col) {
  const b = new WaterBlob(x, y, free), R = 46 * S.sc, n = Math.round(130 * S.sc * S.sc) + 20;
  for (let i = 0; i < n; i++) { const r = R * Math.sqrt(Math.random()), a = rand(0, TAU); water.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r, vx, vy, g: b.id, life: 0, c: col }); }
  return b;
}
function dropWater(x, y, vx, vy, c) { if (water.length < 2400) water.push({ x, y, vx, vy, g: 0, life: rand(1, 2.2), c }); }
function splash(x, y, info, n, c) { for (let i = 0; i < n; i++) dropWater(x + rand(-6, 6), y + rand(-6, 6), info.bvx * rand(.05, .25) + rand(-120, 120), info.bvy * rand(.05, .25) - rand(60, 260), c); }

function waterStep(dt) {
  for (const g of groups.values()) { g.sx = 0; g.sy = 0; g.n = 0; }
  for (const p of water) { if (p.g > 0) { const g = groups.get(p.g); if (g) { g.sx += p.x; g.sy += p.y; g.n++; } else p.g = 0; } }
  for (const g of groups.values()) {
    if (g.n) { g.cx = g.sx / g.n; g.cy = g.sy / g.n; g.r = 4.2 * Math.sqrt(g.n) + 4; }
    else if (g.age > .05) { g.dead = true; }
  }
  const P = water, N = P.length, h = 11, inv = 1 / 12, grid = new Map();
  for (let i = 0; i < N; i++) { const p = P[i], k = ((p.x * inv) | 0) + (((p.y * inv) | 0) << 12); let c = grid.get(k); if (!c) grid.set(k, c = []); c.push(i); }
  for (let i = 0; i < N; i++) {
    const p = P[i], cx = (p.x * inv) | 0, cy = (p.y * inv) | 0;
    for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) {
      const c = grid.get((cx + ox) + ((cy + oy) << 12)); if (!c) continue;
      for (const j of c) {
        if (j <= i) continue;
        const q = P[j], dx = q.x - p.x, dy = q.y - p.y, d2 = dx * dx + dy * dy;
        if (d2 >= h * h || d2 < 1e-4) continue;
        const d = Math.sqrt(d2), w = 1 - d / h, f = w * 1800 * dt, ux = dx / d, uy = dy / d;
        p.vx -= ux * f; p.vy -= uy * f; q.vx += ux * f; q.vy += uy * f;
        const vx = (q.vx - p.vx) * w * .08, vy = (q.vy - p.vy) * w * .08; p.vx += vx; p.vy += vy; q.vx -= vx; q.vy -= vy;
      }
    }
  }
  const damp = Math.exp(-1.5 * dt);
  let j = 0;
  for (let i = 0; i < N; i++) {
    const p = P[i], g = p.g > 0 ? groups.get(p.g) : null;
    if (g) {
      const k = g.ten * 9; p.vx += (g.cx - p.x) * k * dt; p.vy += (g.cy - p.y) * k * dt;
      if (!g.free) { p.vx += (g.hx - g.cx) * 6 * dt; p.vy += (g.ty - g.cy) * 6 * dt; p.vx *= Math.exp(-2 * dt); p.vy *= Math.exp(-2 * dt); }
      else p.vy += G * dt;
      if (g.free && g.age > 26) continue;
    } else { p.vy += G * dt; p.life -= dt; if (p.life <= 0) continue; }
    p.vx *= damp; p.vy *= damp; p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.y > floorY && p.vy > 0) { p.y = floorY; p.vy *= -.15; p.vx *= .92; }
    if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx) * .4; } if (p.x > W) { p.x = W; p.vx = -Math.abs(p.vx) * .4; }
    P[j++] = p;
  }
  P.length = j;
}
function drawWater() {
  const sp = sprite('#2f8cff'), hi = sprite('#bfe9ff');
  for (const p of water) {
    const g = p.g > 0 ? groups.get(p.g) : null;
    const a = g ? (g.free ? clamp((26 - g.age) / 6, 0, 1) : 1) : clamp(p.life * 2, 0, 1);
    ctx.globalAlpha = .55 * a; ctx.drawImage(p.c ? sprite(p.c) : sp, p.x - 11, p.y - 11, 22, 22);
    ctx.globalAlpha = .22 * a; ctx.drawImage(hi, p.x - 4, p.y - 5, 8, 8);
  }
}

// --- gas: soft parcels sprung to drifting offsets; cuts shear it into vortices, then it heals ---
class GasCloud {
  constructor(x, y) {
    this.kind = 'gas'; this.mat = 'gas'; this.hx = x; this.hy = y; this.t = rand(0, TAU); this.cool = 0;
    this.I = 1; this.fade = 1; this.diss = false; this.R = 62 * S.sc; this.ps = [];
    for (let i = 0; i < 150; i++) {
      const r = this.R * Math.sqrt(Math.random()), a = rand(0, TAU), ox = Math.cos(a) * r, oy = Math.sin(a) * r * .8;
      this.ps.push({ x: x + ox, y: y + oy, ox, oy, vx: 0, vy: 0, w: rand(-.5, .5), ion: 0, c: '#ffffff', sz: rand(12, 24) * S.sc });
    }
  }
  intact() { return !this.diss; }
  update(dt) {
    this.t += dt;
    const hy = this.hy + Math.sin(this.t * .9) * 7, I = this.diss ? 0 : this.I, damp = Math.exp(-1.4 * dt);
    if (!this.diss) this.I = Math.min(1, this.I + dt * .04);
    for (const p of this.ps) {
      const c = Math.cos(p.w * dt), s = Math.sin(p.w * dt), ox = p.ox * c - p.oy * s; p.oy = p.ox * s + p.oy * c; p.ox = ox;
      p.vx += ((this.hx + p.ox - p.x) * 2.2 * I + rand(-1, 1) * 40) * dt;
      p.vy += ((hy + p.oy - p.y) * 2.2 * I + rand(-1, 1) * 40 - (this.diss ? 30 : 0)) * dt;
      p.vx *= damp; p.vy *= damp; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.ion > 0) p.ion -= dt * .3;
    }
    if (this.diss) { this.fade -= dt * .25; if (this.fade <= 0) this.dead = true; }
  }
  hit(a, b) { if (this.diss) return null; const q = pointSeg(this.hx, this.hy, a, b); return q.d < this.R ? q : null; }
  ionize(x, y, r) { const cols = edgeCols(); let n = 0; for (const p of this.ps) if (hypot(p.x - x, p.y - y) < r) { p.ion = 1; p.c = pick(cols); n++; } return n; }
  touch(hp) { if (S.edges[2]) this.ionize(hp.x, hp.y, 26); }
  slice(a, b, info) {
    const dx = b.x - a.x, dy = b.y - a.y, dl = hypot(dx, dy) || 1, nx = -dy / dl, ny = dx / dl, cols = edgeCols();
    let nIon = 0;
    for (const p of this.ps) {
      const s = (dx * (p.y - a.y) - dy * (p.x - a.x)) / dl, d = Math.abs(s), sg = s >= 0 ? 1 : -1;
      if (d < this.R) {
        const w = 1 - d / this.R;
        p.vx += (nx * sg * 120 + dx / dl * sg * 90) * w + info.bvx * .08 * w;   // part + opposite shear on each side → rolls into vortices
        p.vy += (ny * sg * 120 + dy / dl * sg * 90) * w + info.bvy * .08 * w;
      }
      if (S.edges[2] && d < 34) { p.ion = 1; p.c = pick(cols); nIon++; }
    }
    this.I -= .26;
    if (this.I <= .05) { this.diss = true; return { res: 'DISPERSED' }; }
    return { res: S.edges[2] ? 'IONIZED' : 'PARTED', nIon };
  }
  draw() {
    const sp = sprite('#9fb4cc');
    ctx.globalCompositeOperation = 'source-over';
    for (const p of this.ps) { ctx.globalAlpha = .085 * this.fade; ctx.drawImage(sp, p.x - p.sz * 1.6, p.y - p.sz * 1.6, p.sz * 3.2, p.sz * 3.2); }
    ctx.globalCompositeOperation = 'lighter';
    for (const p of this.ps) if (p.ion > .02) { glow(p.x, p.y, p.sz * 1.1, p.c, .6 * p.ion * this.fade); glow(p.x, p.y, 2.5, '#ffffff', .8 * p.ion * this.fade); }
  }
}

// --- plasma: magnetically confined orb of orbiting filaments ---
const mkStrand = () => ({ ph: rand(0, TAU), w: rand(2.5, 6) * (Math.random() < .5 ? -1 : 1), tilt: rand(0, Math.PI), ecc: rand(.2, 1), rr: rand(.55, 1), c: pick(['#ff4fd8', '#b06bff', '#5ff3ff', '#ff8bf0']) });
let plasmaGrp = 1;
class PlasmaOrb {
  constructor(x, y, R, o = {}) {
    this.kind = 'plasma'; this.mat = 'plasma'; this.x = x; this.y = y; this.hx = o.hx ?? x; this.hy = o.hy ?? y;
    this.vx = o.vx || 0; this.vy = o.vy || 0; this.R = R; this.grp = o.grp ?? plasmaGrp++; this.slot = o.slot ?? -1;
    this.cool = 0; this.mergeT = o.mergeT || 0; this.uns = 0; this.t = rand(0, TAU);
    this.st = o.st || Array.from({ length: 10 }, mkStrand);
  }
  intact() { return true; }
  update(dt) {
    this.t += dt; this.mergeT -= dt;
    const hy = this.hy + Math.sin(this.t * 1.2) * 6, d = Math.exp(-dt);
    this.vx = (this.vx + (this.hx - this.x) * 2.2 * dt) * d; this.vy = (this.vy + (hy - this.y) * 2.2 * dt) * d;
    this.x += this.vx * dt; this.y += this.vy * dt; this.uns = Math.max(0, this.uns - dt * .8);
    for (const s of this.st) s.ph += s.w * dt * (1 + this.uns * 2);
    const g = S.geo;
    if (g && S.ignite > .5) {   // the orb reaches for the blade with arcs
      const q = pointSeg(this.x, this.y, { x: g.bx, y: g.by }, { x: g.tx, y: g.ty });
      if (q.d < this.R + 70 && Math.random() < dt * (3 + this.uns * 20)) {
        const a = Math.atan2(q.y - this.y, q.x - this.x);
        bolt(this.x + Math.cos(a) * this.R * .8, this.y + Math.sin(a) * this.R * .8, q.x, q.y, pick(['#ff4fd8', '#9a7bff', '#5ff3ff']));
        sfx('crackle', .4);
      }
    }
    if (this.uns > .3 && Math.random() < dt * 10) sparks(this.x + rand(-1, 1) * this.R, this.y + rand(-1, 1) * this.R, 1, ['#ff4fd8', '#ffffff'], 0, 0, 1, 200);
  }
  hit(a, b) { const q = pointSeg(this.x, this.y, a, b); return q.d < this.R * .9 ? q : null; }
  touch() { this.uns = Math.min(1, this.uns + .05); }
  slice(a, b, info) {
    if (info.value < MATS.plasma.hard) {
      this.uns = 1;
      for (let i = 0; i < 4; i++) { const t = rand(.2, 1); bolt(this.x, this.y, lerp(a.x, b.x, t), lerp(a.y, b.y, t), pick(['#ff4fd8', '#5ff3ff', '#ffffff']), .25); }
      this.vx += info.bvx * .05; this.vy += info.bvy * .05;
      return { res: 'ARC' };
    }
    this.dead = true;
    if (this.R < 18 * S.sc) { sparks(this.x, this.y, 40, ['#ff4fd8', '#5ff3ff', '#ffffff'], 0, 0, 1, 500); return { res: 'DISPERSED' }; }
    const dx = b.x - a.x, dy = b.y - a.y, dl = hypot(dx, dy) || 1, nx = -dy / dl, ny = dx / dl, R2 = this.R * .72, v = 160 + 120 * clamp(info.value, 0, 1.5);
    const half = Math.ceil(this.st.length / 2), sA = this.st.slice(0, half), sB = this.st.slice(half);
    while (sA.length < 6) sA.push(mkStrand()); while (sB.length < 6) sB.push(mkStrand());
    [[1, sA], [-1, sB]].forEach(([sg, st]) => addObj(new PlasmaOrb(this.x + nx * sg * R2 * .6, this.y + ny * sg * R2 * .6, R2,
      { hx: this.hx, hy: this.hy, vx: this.vx + nx * sg * v, vy: this.vy + ny * sg * v, grp: this.grp, slot: this.slot, mergeT: 1.1, st })));
    return { res: 'SEVERED' };
  }
  draw(t) {
    const { x, y, R } = this;
    glow(x, y, R * 1.9, '#ff3fc8', .28 + .1 * Math.sin(t * 6 + this.t)); glow(x, y, R * .7, '#ffffff', .35);
    { const sg = ctx.createRadialGradient(x - R * .35, y - R * .4, R * .05, x, y, R * 1.15);   // glass containment sphere
      sg.addColorStop(0, 'rgba(255,255,255,.22)'); sg.addColorStop(.25, 'rgba(255,140,230,.04)'); sg.addColorStop(.85, 'rgba(160,110,255,.06)'); sg.addColorStop(1, 'rgba(200,160,255,.28)');
      ctx.globalAlpha = 1; ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(x, y, R * 1.15, 0, TAU); ctx.fill(); }
    ctx.lineCap = 'round';
    for (const s of this.st) {
      const rx = Math.max(1, R * s.rr + this.uns * rand(-6, 6)), ry = Math.max(1, R * s.rr * s.ecc), st = s.ph - 1.9 * Math.sign(s.w);
      ctx.strokeStyle = s.c;
      ctx.globalAlpha = .18; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, s.tilt, st, s.ph, s.w < 0); ctx.stroke();
      ctx.globalAlpha = .85; ctx.lineWidth = 1.3; ctx.stroke();
      const c = Math.cos(s.ph), sn = Math.sin(s.ph), ct = Math.cos(s.tilt), stt = Math.sin(s.tilt);
      glow(x + rx * c * ct - ry * sn * stt, y + rx * c * stt + ry * sn * ct, 7, s.c, .9);
    }
    ctx.globalAlpha = .12 + this.uns * .3; ctx.strokeStyle = '#9a7bff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, R * 1.15, 0, TAU); ctx.stroke();
  }
}
function plasmaMerge() {
  const orbs = objects.filter(o => o.kind === 'plasma' && !o.dead);
  for (let i = 0; i < orbs.length; i++) for (let j = i + 1; j < orbs.length; j++) {
    const a = orbs[i], b = orbs[j];
    if (a.dead || b.dead || a.grp !== b.grp || a.mergeT > 0 || b.mergeT > 0) continue;
    if (hypot(a.x - b.x, a.y - b.y) > (a.R + b.R) * .45) continue;
    const ma = a.R * a.R, mb = b.R * b.R, m = ma + mb;
    a.x = (a.x * ma + b.x * mb) / m; a.y = (a.y * ma + b.y * mb) / m; a.vx = (a.vx * ma + b.vx * mb) / m; a.vy = (a.vy * ma + b.vy * mb) / m;
    a.R = Math.min(60 * S.sc, Math.sqrt(m)); a.st = a.st.concat(b.st).slice(0, 12); a.uns = .6; b.dead = true;
    flash(a.x, a.y, 110, '#ffffff'); ring(a.x, a.y, '#ff4fd8', 120); sfx('zap', .5);
    log({ mat: 'plasma', res: 'RECONNECT', msg: 'Field lines reconnect · orbs re-merge', cls: 'mid', kJ: 0 });
  }
}

// --- Bose–Einstein condensate: coherent matter-wave in a harmonic trap ---
class Condensate {
  constructor(x, y) {
    this.kind = 'bec'; this.mat = 'bec'; this.hx = x; this.hy = y; this.R0 = 50 * S.sc;
    this.parts = [{ x, y, vx: 0, vy: 0, r: this.R0, rip: 0 }]; this.vort = []; this.t = rand(0, TAU); this.cool = 0; this.since = 99;
  }
  intact() { return true; }
  update(dt) {
    this.t += dt; this.since += dt;
    const hy = this.hy + Math.sin(this.t * 1.1) * 5, damp = Math.exp(-(this.since > 8 ? 1.6 : .04) * dt);
    for (const p of this.parts) {
      p.vx = (p.vx + (this.hx - p.x) * 2 * dt) * damp; p.vy = (p.vy + (hy - p.y) * 2 * dt) * damp;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rip = Math.max(0, p.rip - dt * .7);
    }
    for (const v of this.vort) v.a += v.s * dt * 1.5;
    if (this.parts.length > 1 && this.since > 10 && this.parts.every(p => hypot(p.x - this.hx, p.y - hy) < 5)) {
      const r = Math.min(this.R0, Math.sqrt(this.parts.reduce((s, p) => s + p.r * p.r, 0)));
      this.parts = [{ x: this.hx, y: hy, vx: 0, vy: 0, r, rip: 1 }]; this.vort = [];
      sfx('chime', .4); ring(this.hx, hy, '#7ff6ff', 90);
      log({ mat: 'bec', res: 'RECOHERE', msg: 'Fragments re-condense into one coherent state', cls: 'mid', kJ: 0 });
    }
  }
  hit(a, b) {
    for (const p of this.parts) { const q = pointSeg(p.x, p.y, a, b); if (q.d < p.r * .9) { this.hp = p; return q; } }
    return null;
  }
  slice(a, b, info) {
    const p = this.hp;
    if (info.value < MATS.bec.hard) { p.rip = 1; return { res: 'DECOHERE' }; }
    if (this.parts.length >= 8) { p.rip = 1; return { res: 'LIMIT' }; }
    const dx = b.x - a.x, dy = b.y - a.y, dl = hypot(dx, dy) || 1, nx = -dy / dl, ny = dx / dl, r2 = p.r / Math.SQRT2, v = 110 + 90 * clamp(info.value, 0, 1.5);
    const A = { x: p.x + nx * r2 * .3, y: p.y + ny * r2 * .3, vx: p.vx + nx * v, vy: p.vy + ny * v, r: r2, rip: .6 };
    const B = { x: p.x - nx * r2 * .3, y: p.y - ny * r2 * .3, vx: p.vx - nx * v, vy: p.vy - ny * v, r: r2, rip: .6 };
    this.parts.splice(this.parts.indexOf(p), 1, A, B);
    this.vort = this.vort.filter(v => v.p !== p);
    for (const q of [A, B]) { const n = 1 + (Math.random() < .5); for (let i = 0; i < n; i++) this.vort.push({ p: q, d: rand(.2, .6) * r2, a: rand(0, TAU), s: Math.random() < .5 ? 1 : -1 }); }
    this.since = 0;
    return { res: 'SPLIT' };
  }
  draw() {
    for (const p of this.parts) {
      const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      gr.addColorStop(0, 'rgba(235,255,255,.85)'); gr.addColorStop(.45, 'rgba(120,230,255,.45)'); gr.addColorStop(.8, 'rgba(110,120,255,.18)'); gr.addColorStop(1, 'rgba(150,80,255,0)');
      ctx.globalAlpha = 1; ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill();
      glow(p.x, p.y, p.r * 1.8, '#66ffff', .14);
      if (p.rip > 0) { ctx.strokeStyle = '#bffcff'; ctx.lineWidth = 1.2; for (let k = 1; k <= 3; k++) { ctx.globalAlpha = p.rip * .5; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * ((1 - p.rip + k / 3) % 1), 0, TAU); ctx.stroke(); } }
    }
    // matter-wave interference wherever two fragments overlap
    for (let i = 0; i < this.parts.length; i++) for (let j = i + 1; j < this.parts.length; j++) {
      const a = this.parts[i], b = this.parts[j], dx = b.x - a.x, dy = b.y - a.y, d = hypot(dx, dy);
      if (d >= a.r + b.r) continue;
      const ux = d > .01 ? dx / d : 1, uy = d > .01 ? dy / d : 0, lam = clamp(1600 / (d + 20), 4, 22), span = a.r + b.r;
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, shift = (this.t * 30) % lam;
      ctx.save();
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, TAU); ctx.clip(); ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.clip();
      ctx.globalAlpha = .5; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = lam * .38; ctx.beginPath();
      for (let s = -span; s <= span; s += lam) { const cx = mx + ux * (s + shift), cy = my + uy * (s + shift); ctx.moveTo(cx - uy * span, cy + ux * span); ctx.lineTo(cx + uy * span, cy - ux * span); }
      ctx.stroke(); ctx.restore();
    }
    for (const v of this.vort) {
      const x = v.p.x + Math.cos(v.a) * v.d, y = v.p.y + Math.sin(v.a) * v.d;
      ctx.globalAlpha = .8; ctx.strokeStyle = '#b24bff'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, 6, v.a * 3, v.a * 3 + 4.5); ctx.stroke();
      ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = 'rgba(4,6,18,.85)'; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, TAU); ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
    }
  }
}

// ---------- spawning ----------
function boxPoly(x, y, w, h, b) {
  return [{ x: x - w / 2 + b, y: y - h / 2 }, { x: x + w / 2 - b, y: y - h / 2 }, { x: x + w / 2, y: y - h / 2 + b }, { x: x + w / 2, y: y + h / 2 - b },
    { x: x + w / 2 - b, y: y + h / 2 }, { x: x - w / 2 + b, y: y + h / 2 }, { x: x - w / 2, y: y + h / 2 - b }, { x: x - w / 2, y: y - h / 2 + b }];
}
function makeObj(type, x, y) {
  const sc = S.sc;
  switch (type) {
    case 'steel': return new Solid('steel', boxPoly(x, y, 108 * sc, 74 * sc, 12 * sc));
    case 'ice': return new Solid('ice', convexHull(Array.from({ length: 9 }, (_, i) => { const a = i / 9 * TAU + rand(-.15, .15), r = (52 + rand(-8, 8)) * sc; return { x: x + Math.cos(a) * r, y: y + Math.sin(a) * r }; })));
    case 'crystal': { const t = rand(-.25, .25), c = Math.cos(t), s = Math.sin(t);
      return new Solid('crystal', [[0, -78], [32, -44], [32, 44], [0, 78], [-32, 44], [-32, -44]].map(([px, py]) => ({ x: x + (px * c - py * s) * sc, y: y + (px * s + py * c) * sc }))); }
    case 'water': return spawnWater(x, y);
    case 'gas': return new GasCloud(x, y);
    case 'plasma': return new PlasmaOrb(x, y, 50 * sc);
    case 'bec': return new Condensate(x, y);
    default: { const R = MATS[type]; const o = new Solid(type, R.shape(x, y, sc)); if (R.init) R.init(o); return o; }
  }
}
function spawnAt(i, quiet) {
  const sl = slots[i], o = makeObj(sl.type, sl.x, sl.y); o.slot = i; addObj(o);
  if (!quiet) { ring(sl.x, sl.y, '#5fd8ff', 80 * S.sc); glitter(sl.x, sl.y, 18, '#9fe8ff'); sfx('spawn'); }
}
function chooseTarget(type) {
  S.mode = 'single'; S.target = type; layoutSlots(); clearAll(); spawnAt(0);
  const M = MATS[type]; banner(M.label.toUpperCase(), M.color, `${M.state} · target locked`);
  if (!S.energized) toggleEnergize();
  refreshUI();
}
function gallery() { S.mode = 'gallery'; layoutSlots(); lineup(); banner('GALLERY', '#cfd6ff', 'all 7 states of matter'); refreshUI(); }
// --- auto target practice: real objects pop up at random ---
function autoMode() {
  S.mode = 'auto'; layoutSlots(); clearAll();
  Object.assign(S, { score: 0, combo: 0, hits: 0, miss: 0, level: 1, autoE: 0, autoT: .8 });
  updateScore(); banner('TARGET PRACTICE', '#7dffb0', 'real objects pop up · slice them before they vanish');
  if (!S.energized) toggleEnergize();
  refreshUI();
}
function autoStep(dt) {
  if (S.mode !== 'auto') return;
  S.autoE += dt; const lvl = 1 + Math.floor(S.autoE / 20);
  if (lvl !== S.level) { S.level = lvl; banner(`LEVEL ${lvl}`, '#7dffb0', 'targets come faster'); updateScore(); }
  S.autoT -= dt;
  const alive = objects.filter(o => o.auto && !o.scored && !o.dead).length;
  if (S.autoT <= 0 && alive < 2 + lvl) { spawnAuto(); S.autoT = Math.max(.5, 1.8 - (lvl - 1) * .15) * rand(.7, 1.3); }
}
function spawnAuto() {
  const type = pick(AUTO_LIST), narrow = W < 760, x0 = narrow ? 60 : 340, x1 = narrow ? W - 60 : W - 340;
  const x = rand(x0, Math.max(x0 + 1, x1)), toss = Math.random() < .4, y = toss ? floorY + 40 : rand(H * .22, H * .58);
  const o = makeObj(type, x, y); o.auto = true; o.maxLife = o.life = Math.max(2.2, 4.8 - (S.level - 1) * .3);
  if (toss) { o.free = true; o.vy = -Math.sqrt(2 * G * (floorY + 40 - rand(H * .2, H * .45))); o.vx = (W / 2 - x) * rand(.05, .25); o.va = rand(-2, 2); }
  else { o.ps = 0; o.sc2 = 0; ring(x, y, '#7dffb0', 70); glitter(x, y, 14, '#bfffd8'); }
  addObj(o); o.cool = .12; sfx('appear');
}
function scoreHit(o, res, x, y) {
  if (o.scored) return; o.scored = true;
  const defl = res === 'DEFLECT' || res === 'GRAZE';
  S.combo = defl ? 0 : S.combo + 1;
  const pts = Math.round(100 * (.6 + MATS[o.mat].hard) * (defl ? .3 : 1) * (1 + Math.max(0, S.combo - 1) * .25) * (o.free && !defl ? 1.5 : 1));
  S.score += pts; S.hits++;
  addFx({ k: 'text', x, y: y - 24, txt: `+${pts}${S.combo > 1 ? '  ×' + S.combo : ''}`, c: defl ? '#ffd88a' : '#7dffb0', size: 20, life: 1.1, max: 1.1 });
  updateScore();
}
function autoMiss(o) {
  if (o.scored) return; o.scored = true; S.miss++; S.combo = 0;
  addFx({ k: 'text', x: o.x, y: o.y - 20, txt: 'MISS', c: '#ff5a6a', size: 18, life: 1, max: 1 }); sfx('miss'); updateScore();
}
function updateScore() {
  const t = S.hits + S.miss;
  $('scScore').textContent = S.score.toLocaleString(); $('scCombo').textContent = '×' + S.combo; $('scHits').textContent = S.hits;
  $('scMiss').textContent = S.miss; $('scAcc').textContent = t ? Math.round(S.hits / t * 100) + '%' : '–'; $('scLvl').textContent = S.level;
}
function clearAll() { objects = []; water = []; groups.clear(); fx = []; }
function lineup() { clearAll(); slots.forEach((s, i) => spawnAt(i)); }
const slotTimers = [];
function restock(dt) {
  if (!S.restock) return;
  slots.forEach((sl, i) => {
    if (objects.some(o => !o.dead && o.slot === i && o.intact())) { slotTimers[i] = 0; return; }
    slotTimers[i] = (slotTimers[i] || 0) + dt;
    if (slotTimers[i] > 3.5) { slotTimers[i] = 0; spawnAt(i); }
  });
}
function tossStep(dt) {
  if (!S.toss) return;
  S.tossT -= dt; if (S.tossT > 0) return; S.tossT = rand(.9, 1.6);
  const type = pick(['steel', 'ice', 'crystal', 'crystal', 'water']), x = rand(W * .25, W * .75), vx = (W / 2 - x) * rand(.3, .7), vy = -rand(900, 1150) * Math.sqrt(H / 900);
  if (type === 'water') { addObj(spawnWater(x, H + 60, true, vx, vy)); return; }
  const o = makeObj(type, x, H + 60); o.free = true; o.vx = vx; o.vy = vy; o.va = rand(-3, 3); addObj(o);
}

// ---------- blade ----------
function strike(dir) {
  if (!S.energized) return;
  if (S.strike && S.strike.t < .12) return;
  if (dir === undefined) dir = Math.abs(S.hvx) > 150 ? Math.sign(S.hvx) : (S.strikeDir *= -1);
  S.strike = { t: 0, dir, amp: 2.2 };
}
function recoil() { S.buzz = 1; const d = S.strike ? S.strike.dir : (Math.sign(S.tipVX) || 1); S.strike = null; S.angS = S.ang - d * .3; }

function toWorldPt(sx, sy) { return { x: S.cam.x + (sx - W / 2) / S.cam.z, y: S.cam.y + (sy - H / 2) / S.cam.z }; }

function updateBlade(rdt, tnow) {
  S.auto = S.demo && tnow - S.lastInput > 2.5 && S.energized;
  let tx, ty;
  if (S.auto) {
    const reach = S.mode === 'single' ? Math.min(W * .2, 120 + 90 * S.sc) : Math.max(60, W * .5 - 340);
    tx = W * .5 + Math.sin(tnow * .45) * reach;
    ty = Math.min(floorY - 50, (slots[0] ? slots[0].y : H * .4) + S.len * .45 + Math.sin(tnow * 1.3) * 30);
    if (tnow - S.lastAuto > .9) { S.lastAuto = tnow; strike(Math.cos(tnow * .45) > 0 ? 1 : -1); }
  } else { const p = toWorldPt(S.sx, S.sy); tx = p.x; ty = p.y; }
  const k = 1 - Math.exp(-rdt * 30);
  S.hx += (tx - S.hx) * k; S.hy += (ty - S.hy) * k;
  S.hvx = lerp(S.hvx, (S.hx - S.phx) / rdt, .25); S.phx = S.hx;
  S.hvy = lerp(S.hvy, (S.hy - S.phy) / rdt, .25); S.phy = S.hy;
  // weighted blade: an under-damped spring, so a swing overshoots and settles like real mass
  { const tgt = S.base + clamp(-S.hvx * .0008, -.85, .85); S.angV += ((tgt - S.angS) * 190 - S.angV * 17) * rdt; S.angS += S.angV * rdt; }
  let off = 0; const st = S.strike;
  if (st) {
    st.t += rdt; const up = .12, back = .3; let f;
    if (st.t < up) f = 1 - Math.pow(1 - st.t / up, 3);
    else if (st.t < up + back) { const u = (st.t - up) / back; f = 1 - u * u * (3 - 2 * u); }
    else { f = 0; S.strike = null; }
    off = f * st.amp * st.dir;
  }
  S.ang = S.angS + off + (Math.random() - .5) * S.buzz * .12;
  // depth: the blade pitches toward / away from the viewer on vertical moves and through every strike arc
  { const sw = st ? Math.sin(clamp(st.t / .42, 0, 1) * Math.PI) * .8 * st.dir : 0, tgt = clamp(-S.hvy * .0007, -.55, .55) + sw;
    S.pitchV += ((tgt - S.pitch) * 160 - S.pitchV * 16) * rdt; S.pitch = clamp(S.pitch + S.pitchV * rdt, -1.05, 1.05); }
  if (S.energized && S.ignite < 1) S.ignite = Math.min(1, S.ignite + rdt / .55);
  if (!S.energized && S.ignite > 0) S.ignite = Math.max(0, S.ignite - rdt / .4);
  S.spinPh += rdt * S.spin * TAU * (oc() ? 1.8 : 1);
  if (oc()) { S.heat += rdt * .2; if (S.heat >= 1) { S.vent = true; banner('VENTING', '#ffb347', 'Overcharge cooldown'); sfx('vent'); } }
  else S.heat = Math.max(0, S.heat - rdt * (S.vent ? .3 : .12));
  if (S.vent && S.heat < .35) S.vent = false;
  if (S.vent && Math.random() < rdt * 30) steamAt(S.hx, S.hy, 1);
  const dx = Math.cos(S.ang), dy = Math.sin(S.ang), L = S.len * easeOut(S.ignite) * Math.max(.62, Math.cos(S.pitch)), hs = 1.5 * S.bs, bx = S.hx + dx * 38 * hs, by = S.hy + dy * 38 * hs;
  S.prev = S.geo; S.geo = { dx, dy, bx, by, tx: bx + dx * L, ty: by + dy * L, L };
  if (S.prev) { S.tipVX = (S.geo.tx - S.prev.tx) / rdt; S.tipVY = (S.geo.ty - S.prev.ty) / rdt; S.tipSpeed = lerp(S.tipSpeed, hypot(S.tipVX, S.tipVY), .5); }
  S.hist.push({ bx, by, tx: S.geo.tx, ty: S.geo.ty, dx, dy });
  const maxH = S.ts < .5 ? 30 : 16; while (S.hist.length > maxH) S.hist.shift();
  // ions streaming hilt → tip inside the blade; fast swings shed them into the air
  { const ions = S.ions, cs = edgeCols(), want = S.ignite > .05 ? 110 : 0, sp = 1 + S.tipSpeed / 1800;
    while (ions.length < want) ions.push({ f: Math.random(), v: rand(.35, 1.1), ph: rand(0, TAU), w: rand(-6, 6), r: rand(.2, 1.25), c: pick(cs), z: Math.random() });
    if (ions.length > want) ions.length = want;
    for (const p of ions) { p.f += p.v * rdt * sp * S.ts; p.ph += p.w * rdt; if (p.f > 1) { p.f = 0; p.c = pick(cs); p.r = rand(.2, 1.25); } }
    if (S.ignite > .9 && S.tipSpeed > 1400 && Math.random() < rdt * 40) { const f = rand(.4, 1);
      addFx({ k: 'glit', x: lerp(bx, S.geo.tx, f), y: lerp(by, S.geo.ty, f), vx: S.tipVX * rand(.05, .2), vy: S.tipVY * rand(.05, .2), life: .7, max: .7, c: pick(cs), s: rand(1.2, 2.6) }); } }
  if (oc() && S.ignite > .9 && Math.random() < rdt * 25) {
    const t0 = rand(0, .8), t1 = t0 + rand(.08, .2);
    bolt(lerp(bx, S.geo.tx, t0), lerp(by, S.geo.ty, t0), lerp(bx, S.geo.tx, t1) + rand(-14, 14), lerp(by, S.geo.ty, t1) + rand(-14, 14), pick(edgeCols()), .08);
  }
}

function power(mat, speed) {
  const aff = MATS[mat].aff; let sum = 0;
  for (let i = 0; i < 7; i++) if (S.edges[i]) sum += aff[i];
  const sp = clamp(speed / 600, .45, 1.8), pw = S.power * (oc() ? 1.6 : 1);
  return { value: pw * sp * sum / 2, sum, speed: sp, pw };
}
function collide(rdt) {
  if (!S.prev || S.ignite < .55) return;
  const g = S.geo, p = S.prev;
  const n = clamp(Math.ceil(Math.max(hypot(g.tx - p.tx, g.ty - p.ty), hypot(g.bx - p.bx, g.by - p.by)) / 9), 1, 16);
  for (const o of objects.slice()) {
    o.cool -= rdt;
    if (o.dead || o.cool > 0) continue;
    for (let k = 1; k <= n; k++) {
      const t = k / n, a = { x: lerp(p.bx, g.bx, t), y: lerp(p.by, g.by, t) }, b = { x: lerp(p.tx, g.tx, t), y: lerp(p.ty, g.ty, t) };
      const hp = o.hit(a, b); if (!hp) continue;
      if (S.tipSpeed < 160) { if (o.touch) o.touch(hp); break; }
      const info = { ...power(o.mat, S.tipSpeed), x: hp.x, y: hp.y, bvx: S.tipVX, bvy: S.tipVY };
      o.cool = .2;
      const r = o.slice(a, b, info);
      if (r) onImpact(o, info, r);
      break;
    }
  }
}
function needEdges(mat) {
  const aff = MATS[mat].aff, idx = aff.map((v, i) => i).filter(i => aff[i] > 0 && !S.edges[i]).sort((a, b) => aff[b] - aff[a]).slice(0, 2);
  return idx.length ? 'enable ' + idx.map(i => `${EDGES[i].name} (${i + 1})`).join(' + ') : 'use Overcharge (O)';
}

function onImpact(o, info, r) {
  const mat = o.mat, M = MATS[mat], x = info.x, y = info.y, cols = edgeCols(), str = clamp(info.value, .3, 1.6), hot = cols.concat('#ffffff');
  const kJ = .5 * 1.8 * Math.pow(S.tipSpeed / 100, 2) * info.pw / 1000;
  S.stats.peak = Math.max(S.stats.peak, kJ);
  let msg = '', cls = 'ok', shake = 2, stop = .03, cine = false;
  switch (mat + ':' + r.res) {
    case 'steel:CUT': sparks(x, y, 34 * str, hot.concat('#ffd27a', '#ff9a3c'), info.bvx, info.bvy, .4, 750); molten(o.cutLine, 18);
      msg = `Clean cut · molten faces ≈ ${tempK()} K`; sfx('sizzle', str); sfx('thud', .6); shake = 4.5; stop = .05; S.stats.cuts++; break;
    case 'ice:CUT': sparks(x, y, 16, ['#e8fbff', '#9be8ff'].concat(cols), info.bvx, info.bvy, .5, 500);
      if (o.cutLine) for (let i = 0; i < 14; i++) { const t = Math.random(); dropWater(lerp(o.cutLine[0].x, o.cutLine[1].x, t), lerp(o.cutLine[0].y, o.cutLine[1].y, t), rand(-60, 60), rand(-120, 0)); }
      if (S.edges[0]) steamAt(x, y, 12);
      msg = S.edges[0] ? 'Cut · melt + flash-boil (solid → liquid → vapor)' : 'Cut · cold fracture, no melt'; sfx('crack', str); if (S.edges[0]) sfx('sizzle', .5); shake = 3; stop = .04; S.stats.cuts++; break;
    case 'crystal:CUT': glitter(x, y, 30); msg = S.edges[3] ? 'Cleaved on a lattice plane · fragment too small to resonate' : 'Cleaved on a lattice plane · enable Resonant (4) to shatter'; sfx('crack', str); shake = 3; S.stats.cuts++; break;
    case 'crystal:SHATTER': glitter(x, y, 90); sparks(x, y, 40, hot.concat('#d9b8ff', '#29ff7f'), 0, 0, 1, 800); ring(x, y, '#29ff7f', 220);
      msg = `Resonant shatter · ${r.n} shards`; sfx('shatter', str); shake = 10; stop = .09; cine = true; S.stats.shatters++; break;
    case 'steel:DEFLECT': case 'ice:DEFLECT': case 'crystal:DEFLECT':
      sparks(x, y, 44, ['#ffffff', '#ffe9a8', '#ffb347'].concat(cols), -info.bvx, -info.bvy, .55, 900); ring(x, y, '#ffffff', 90);
      msg = `Deflected · ${Math.round(info.value / M.hard * 100)}% of needed force — swing faster or ${needEdges(mat)}`;
      sfx(mat === 'steel' ? 'clang' : 'crack', str); if (mat !== 'steel') sfx('clang', .4); shake = 7; stop = .08; cls = 'bad'; recoil(); S.stats.deflects++; break;
    case 'steel:GRAZE': case 'ice:GRAZE': case 'crystal:GRAZE': sparks(x, y, 10, hot, info.bvx, info.bvy, .5, 400); msg = 'Grazed a corner'; sfx('sizzle', .4); cls = 'mid'; break;
    case 'water:SPLIT': splash(x, y, info, 26); if (S.edges[0]) steamAt(x, y, 10);
      msg = S.edges[4] ? 'Liquid parted cleanly · Cryo-Phase locks the surfaces' : 'Liquid parted · surfaces ripple and spray'; sfx('splash', str); if (S.edges[0]) sfx('sizzle', .4); S.stats.cuts++; break;
    case 'water:PASS': splash(x, y, info, 12); msg = 'Passed through · surface tension heals the gap'; sfx('splash', .5); cls = 'mid'; break;
    case 'gas:IONIZED': sparks(x, y, 14, cols, info.bvx, info.bvy, .5, 400); msg = `Ionized ${r.nIon} parcels · gas → glowing plasma`; sfx('whoosh', str); sfx('crackle', .5); break;
    case 'gas:PARTED': msg = 'Parted the gas · it rolls into vortices and heals'; sfx('whoosh', str); cls = 'mid'; break;
    case 'gas:DISPERSED': msg = 'Cloud dispersed · it lost its integrity'; sfx('whoosh', 1.2); break;
    case 'plasma:SEVERED': flash(x, y, 160, '#ffffff'); ring(x, y, '#ff4fd8', 200); sparks(x, y, 50, ['#ff4fd8', '#5ff3ff', '#ffffff', '#3d6bff'], 0, 0, 1, 800);
      msg = 'Field lines severed · magnetic reconnection splits the orb'; sfx('zap', str); shake = 6; stop = .06; cine = true; S.stats.cuts++; break;
    case 'plasma:ARC': msg = `Plasma arcs onto the blade · swing faster or ${needEdges('plasma')}`; sfx('crackle', 1.2); sfx('zap', .4); shake = 3; cls = 'bad'; break;
    case 'plasma:DISPERSED': msg = 'Orb too small to confine · dispersed'; sfx('zap', 1); break;
    case 'bec:SPLIT': ring(x, y, '#7ff6ff', 160); glitter(x, y, 24, '#bffcff'); msg = 'Matter wave split · fragments interfere (watch the fringes)'; sfx('chime', str); cine = true; stop = .05; S.stats.cuts++; break;
    case 'bec:DECOHERE': ring(x, y, '#7ff6ff', 80); msg = `Decoherence ripple · swing faster or ${needEdges('bec')}`; sfx('chime', .35); cls = 'bad'; break;
    case 'bec:LIMIT': msg = 'Quantum limit · fragments too small to split again'; sfx('chime', .3); cls = 'mid'; break;
    default: ({ msg, cls, shake, stop, cine } = realImpact(o, info, r, hot, str)); break;
  }
  flash(x, y, 50 + 60 * str, pick(hot)); ring(x, y, M.color, 50 + 50 * str);
  S.lastMat = o.mat; S.lastRes = r.res;
  const weak = ['PASS', 'PARTED', 'GRAZE', 'DECOHERE', 'LIMIT', 'IONIZED'].includes(r.res);
  const big = ['SHATTER', 'SEVERED', 'BURST', 'DISPERSED'].includes(r.res) || o.mat === 'gong';
  violence(o, info, clamp(S.tipSpeed / 1800, .5, 1.5) * (big ? 1.35 : r.res === 'DEFLECT' ? 1.15 : 1) * (weak ? .4 : 1) * (.7 + .3 * clamp(M.hard, 0, 1.2)));
  S.shake = Math.max(S.shake, shake); S.hitstop = Math.max(S.hitstop, stop);
  S.flash = Math.min(1, S.flash + .04 * shake); S.flashCol = M.color;
  if (S.cine && (cine || shake >= 6)) { S.cineT = cine ? .6 : .25; S.camHold = .9; S.camT.x = lerp(W / 2, x, .55); S.camT.y = lerp(H / 2, y, .55); S.camT.z = S.zoom * (cine ? 1.32 : 1.15); }
  if (o.auto) scoreHit(o, r.res, x, y);
  banner(LABEL[r.res], M.color, `${M.label} · ${M.state}`);
  log({ mat, res: r.res, msg, cls, kJ });
}

// ---------- rendering ----------
// floor lives in world space so it stays under the objects at any zoom
function drawFloor() {
  const L = -W * 3, R = W * 4, by = floorY + H * .6;
  const gr = ctx.createLinearGradient(0, floorY, 0, by); gr.addColorStop(0, '#0b1030'); gr.addColorStop(1, '#03040a');
  ctx.globalAlpha = 1; ctx.fillStyle = gr; ctx.fillRect(L, floorY, R - L, H * 4);
  ctx.strokeStyle = 'rgba(90,130,255,.16)'; ctx.lineWidth = 1; ctx.beginPath();
  const vx = W / 2, vy = floorY - H * .55;
  for (let i = -70; i <= 70; i++) { const x = W / 2 + i * W / 14, xa = vx + (x - vx) * ((floorY - vy) / (by - vy)); ctx.moveTo(xa, floorY); ctx.lineTo(x, by); }
  for (let k = 1; k < 10; k++) { const y = floorY + (by - floorY) * Math.pow(k / 9, 1.8); ctx.moveTo(L, y); ctx.lineTo(R, y); }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(120,220,255,.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(L, floorY); ctx.lineTo(R, floorY); ctx.stroke();
}
function shadow(x, yb, r, a = .55) {
  const h = Math.max(0, floorY - yb), f = clamp(1 - h / 650, .08, 1), rx = r * (1.05 + h / 700);
  ctx.save(); ctx.translate(x + h * .12, floorY + 2); ctx.scale(1, .16);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, `rgba(0,0,0,${.8 * a * f})`); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, TAU); ctx.fill(); ctx.restore();
}
function drawShadows() {
  for (const o of objects) {
    switch (o.kind) {
      case 'solid': shadow(o.x, o.y + o.rad * o.sc2, o.rad * o.sc2, .55 * o.alpha); break;
      case 'water': if (o.n > 4) shadow(o.cx, o.cy + o.r, o.r, .35); break;
      case 'gas': shadow(o.hx, o.hy + o.R, o.R * .8, .12 * o.fade); break;
      case 'plasma': shadow(o.x, o.y + o.R, o.R, .3); break;
      case 'bec': for (const p of o.parts) shadow(p.x, p.y + p.r, p.r, .3); break;
    }
  }
  const g = S.geo;
  if (g) { shadow(S.hx, S.hy + 20, 40, .5); if (S.ignite > .1) shadow((g.bx + g.tx) / 2, Math.max(g.by, g.ty), Math.abs(g.tx - g.bx) / 2 + 26, .35 * S.ignite); }
}
function drawPads(t) {
  ctx.globalCompositeOperation = 'lighter';
  for (const sl of slots) {
    const y = sl.y + 82 * S.sc, rx = 54 * S.sc, ry = 11 * S.sc;
    const gr = ctx.createLinearGradient(0, y, 0, y - 150 * S.sc);
    gr.addColorStop(0, 'rgba(80,170,255,.12)'); gr.addColorStop(1, 'rgba(80,170,255,0)');
    ctx.globalAlpha = 1; ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(sl.x - rx, y); ctx.lineTo(sl.x - rx * .6, y - 150 * S.sc); ctx.lineTo(sl.x + rx * .6, y - 150 * S.sc); ctx.lineTo(sl.x + rx, y); ctx.fill();
    ctx.strokeStyle = MATS[sl.type].color; ctx.globalAlpha = .45; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(sl.x, y, rx, ry, 0, 0, TAU); ctx.stroke();
    ctx.globalAlpha = .7; ctx.setLineDash([6, 10]); ctx.lineDashOffset = -t * 30; ctx.beginPath(); ctx.ellipse(sl.x, y, rx * .7, ry * .7, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.globalAlpha = .55; ctx.fillStyle = '#9fb0e8'; ctx.font = `${9 * Math.max(.8, S.sc)}px "JetBrains Mono", monospace`; ctx.textAlign = 'center';
    ctx.fillText(MATS[sl.type].label.toUpperCase(), sl.x, y + 22 * S.sc);
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}
function drawDust(dt) {
  ctx.fillStyle = '#c8d4ff';
  for (const d of dust) {
    d.x += d.vx * dt; d.y += d.vy * dt; if (d.y < 0) d.y = floorY; if (d.x < 0) d.x = W; if (d.x > W) d.x = 0;
    ctx.globalAlpha = d.a; ctx.fillRect(d.x, d.y, d.s, d.s);
  }
  ctx.globalAlpha = 1;
}
function avgEdgeColor() {
  const cs = edgeCols().map(hexRgb), n = cs.length, s = cs.reduce((a, c) => [a[0] + c[0], a[1] + c[1], a[2] + c[2]], [0, 0, 0]);
  return `rgb(${s[0] / n | 0},${s[1] / n | 0},${s[2] / n | 0})`;
}
function drawFloorLight() {
  const g = S.geo; if (!g || S.ignite <= 0) return;
  const mx = (g.bx + g.tx) / 2, h = floorY - Math.max(g.by, g.ty), I = S.ignite * clamp(1 - h / 700, .15, 1) * (oc() ? 1.4 : 1);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(mx, floorY); ctx.scale(1, .16);
  const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, 280);
  gr.addColorStop(0, `rgba(255,255,255,${.3 * I})`); gr.addColorStop(.3, avgEdgeColor().replace('rgb', 'rgba').replace(')', `,${.22 * I})`)); gr.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, 280, 0, TAU); ctx.fill(); ctx.restore();
}
function drawTrail() {
  if (!S.trails || S.ignite < .5 || S.hist.length < 3) return;
  const hs = S.hist, n = hs.length, cols = edgeCols();
  const avg = '#' + (S.avgCol || [255, 255, 255]).map(v => (v | 0).toString(16).padStart(2, '0')).join('');
  ctx.lineCap = 'round';
  for (let i = 1; i < n; i++) {
    const a = hs[i - 1], b = hs[i], seg = hypot(b.tx - a.tx, b.ty - a.ty), f = i / n, al = clamp(seg / 22, 0, 1) * f * f;
    if (al < .02) continue;
    // swept volume between two blade poses: coloured body, hot leading edge
    const gr = ctx.createLinearGradient(a.bx, a.by, a.tx, a.ty);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.35, avg); gr.addColorStop(1, '#ffffff');
    ctx.globalAlpha = al * .26; ctx.fillStyle = gr;
    ctx.beginPath(); ctx.moveTo(a.bx, a.by); ctx.lineTo(a.tx, a.ty); ctx.lineTo(b.tx, b.ty); ctx.lineTo(b.bx, b.by); ctx.fill();
    for (let j = 0; j < cols.length; j++) {
      const fr = .55 + .45 * (j + 1) / cols.length;
      ctx.globalAlpha = al * .16; ctx.strokeStyle = cols[j]; ctx.lineWidth = 3 + 5 * f;
      ctx.beginPath(); ctx.moveTo(lerp(a.bx, a.tx, fr), lerp(a.by, a.ty, fr)); ctx.lineTo(lerp(b.bx, b.tx, fr), lerp(b.by, b.ty, fr)); ctx.stroke();
    }
    ctx.globalAlpha = al * .8; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5 * f + .5;
    ctx.beginPath(); ctx.moveTo(a.tx, a.ty); ctx.lineTo(b.tx, b.ty); ctx.stroke();
  }
}
function drawBlade(t) {
  const ig = S.ignite; if (ig <= .001) return;
  const g = S.geo, nx = -g.dy, ny = g.dx, o = oc(), bs = S.bs * (o ? 1.25 : 1), flick = .86 + .14 * Math.random();
  const gap = 6.5 * bs, N = 44, R = 8 * bs, sp = Math.sin(S.pitch);
  const persp = f => 1 / (1 - clamp(sp * f * .55, -.5, .6));          // points swinging toward the viewer swell
  const avg = '#' + (S.avgCol || [255, 255, 255]).map(v => (v | 0).toString(16).padStart(2, '0')).join('');
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const es = [];
  for (let i = 0; i < 7; i++) if (S.edges[i]) es.push({ i, c: EDGES[i].color, Li: clamp(ig * 1.35 - i * .05, 0, 1), pulse: .75 + .25 * Math.sin(S.spinPh * 3 - i * TAU / 7) });
  const maxF = es.length ? Math.max(...es.map(e => e.Li)) : ig;
  const P = f => ({ x: g.bx + g.dx * g.L * f, y: g.by + g.dy * g.L * f });
  // 1 · volumetric corona: soft light stamped along the length, breathing with the plasma
  for (let k = 0; k <= N; k++) {
    const f = k / N; if (f > maxF) break;
    const p = P(f), w = persp(f) * (1 - .5 * f * f), br = .9 + .1 * Math.sin(t * 23 + k * 1.7) + .06 * Math.sin(t * 7.1 - k * .4);
    glow(p.x, p.y, 44 * bs * w * br, avg, .13 * flick * ig * (o ? 1.5 : 1));
  }
  // 2 · seven edges braided as a helix around the core; the far half is drawn first, dimmer and thinner
  const strand = (e, front) => {
    ctx.beginPath(); let pen = false;
    for (let k = 0; k <= N; k++) {
      const f = k / N; if (f > e.Li) break;
      const s = g.L * f, ph = S.spinPh * 2 + e.i * TAU / 7 + s * .021, taper = 1 - .82 * Math.pow(f, 1.7);
      const r = (R + Math.sin(s * .05 - t * 9 + e.i) * 1.2 * bs) * taper * persp(f), dep = Math.sin(ph);
      if ((dep >= 0) !== front) { pen = false; continue; }
      const off = Math.cos(ph) * r, x = g.bx + g.dx * s + nx * off, y = g.by + g.dy * s + ny * off;
      pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true;
    }
    ctx.stroke();
  };
  for (const e of es) { ctx.strokeStyle = e.c; ctx.globalAlpha = .16 * e.pulse * flick; ctx.lineWidth = 8 * bs; strand(e, false); ctx.globalAlpha = .45; ctx.lineWidth = 2.4 * bs; strand(e, false); }
  // 3 · the white-hot core, thickest at the emitter
  const core = (wd, a, c) => { ctx.strokeStyle = c; ctx.globalAlpha = a; ctx.lineWidth = wd; ctx.beginPath(); const p0 = P(0), p1 = P(maxF); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke(); };
  core(26 * bs, .09 * flick, avg); core(12 * bs, .32 * flick, '#ffffff'); core(5 * bs, .85, '#ffffff'); core(2 * bs, 1, '#ffffff');
  for (let k = 0; k <= 10; k++) { const f = k / 10 * maxF, p = P(f); glow(p.x, p.y, 13 * bs * persp(f) * (1 - .4 * f), '#ffffff', .22 * ig); }
  // 4 · near half of the braid, over the core
  for (const e of es) {
    ctx.strokeStyle = e.c; ctx.globalAlpha = .26 * e.pulse * flick; ctx.lineWidth = 12 * bs; strand(e, true);
    ctx.globalAlpha = .7 * e.pulse; ctx.lineWidth = 4.6 * bs; strand(e, true);
    ctx.globalAlpha = 1; ctx.lineWidth = 2 * bs; strand(e, true);
    ctx.strokeStyle = '#ffffff'; ctx.globalAlpha = .55 * e.pulse; ctx.lineWidth = .8 * bs; strand(e, true);
  }
  // 5 · ions riding the field lines toward the tip
  for (const p of S.ions) {
    if (p.f > maxF) continue;
    const s = g.L * p.f, taper = 1 - .7 * p.f, off = Math.cos(p.ph) * R * 1.5 * p.r * taper * persp(p.f), dep = Math.sin(p.ph);
    const x = g.bx + g.dx * s + nx * off, y = g.by + g.dy * s + ny * off, a = (.45 + .55 * (dep * .5 + .5)) * ig;
    glow(x, y, (2.2 + 2.8 * p.z) * bs, p.c, a); glow(x, y, .9 * bs, '#ffffff', a);
  }
  // 6 · tip: white star plus an anamorphic lens streak
  const tp = P(maxF), tw = persp(maxF);
  glow(tp.x, tp.y, 30 * bs * tw, '#ffffff', .55 * ig);
  ctx.globalAlpha = .32 * ig * flick; ctx.drawImage(sprite('#bcd6ff'), tp.x - 150 * bs * tw, tp.y - 3 * bs, 300 * bs * tw, 6 * bs);
  ctx.globalAlpha = .18 * ig; ctx.drawImage(sprite(avg), g.bx - 110 * bs, g.by - 2 * bs, 220 * bs, 4 * bs);
  if (ig < 1 && S.energized) glow(g.bx, g.by, 70 * (1 - ig) * bs + 14, '#ffffff', .8);
  // edge name tags after ignition / when an edge is switched
  if (S.labelT > 0 && ig > .8) {
    const a = clamp(S.labelT, 0, 1), side = (W / 2 - g.bx) * nx + (H / 2 - g.by) * ny >= 0 ? 1 : -1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.font = `600 ${Math.round(12 * Math.max(1, bs * .9))}px "JetBrains Mono", monospace`; ctx.textBaseline = 'middle';
    ctx.textAlign = side > 0 ? 'left' : 'right';
    for (let i = 0; i < 7; i++) {
      const f = .14 + i * .095, s = S.len * f, taper = 1 - .78 * Math.pow(f, 1.6), off = (i - 3) * gap * taper;
      const ax = g.bx + g.dx * s + nx * off, ay = g.by + g.dy * s + ny * off;
      const lx = g.bx + g.dx * s + nx * side * (34 * bs + 30), ly = g.by + g.dy * s + ny * side * (34 * bs + 30);
      ctx.globalAlpha = a * (S.edges[i] ? 1 : .4); ctx.strokeStyle = EDGES[i].color; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(lx, ly); ctx.stroke();
      ctx.fillStyle = 'rgba(5,7,18,.75)'; const tw = ctx.measureText(`${i + 1} ${EDGES[i].name}`).width + 10;
      ctx.fillRect(side > 0 ? lx + 2 : lx - tw - 2, ly - 9, tw, 18);
      ctx.fillStyle = S.edges[i] ? EDGES[i].color : '#6b7190'; ctx.fillText(`${i + 1} ${EDGES[i].name}${S.edges[i] ? '' : ' (off)'}`, lx + side * 7, ly);
    }
    ctx.globalCompositeOperation = 'lighter';
  }
  ctx.globalAlpha = 1;
}
function drawHilt() {
  ctx.save(); ctx.translate(S.hx, S.hy); ctx.rotate(S.ang); ctx.scale(1.5 * S.bs, 1.5 * S.bs);
  const gr = ctx.createLinearGradient(0, -9, 0, 9);
  gr.addColorStop(0, '#2b2f38'); gr.addColorStop(.35, '#c9d1dc'); gr.addColorStop(.6, '#6b7380'); gr.addColorStop(1, '#1d2027');
  ctx.fillStyle = gr; ctx.fillRect(-38, -8, 60, 16);
  ctx.fillStyle = 'rgba(0,0,0,.4)'; for (let x = -28; x <= 10; x += 6) ctx.fillRect(x, -8, 2.2, 16);
  const eg = ctx.createLinearGradient(0, -11, 0, 11); eg.addColorStop(0, '#3a3f4a'); eg.addColorStop(.4, '#eef2f8'); eg.addColorStop(1, '#2a2e36');
  ctx.fillStyle = eg; ctx.fillRect(22, -10.5, 16, 21); ctx.fillStyle = '#1a1d24'; ctx.fillRect(36, -9, 2, 18);
  ctx.fillStyle = '#4b5160'; ctx.fillRect(-42, -9.5, 5, 19);
  ctx.fillStyle = S.energized ? (S.vent ? '#ffb347' : '#ff2d55') : '#2a2e38'; ctx.fillRect(2, -11.5, 9, 3.5);
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {
    const x = 24 + i * 2, on = S.edges[i] && S.ignite > .2;
    ctx.globalAlpha = on ? 1 : .25; ctx.fillStyle = on ? EDGES[i].color : '#555';
    ctx.beginPath(); ctx.arc(x, 0, 1, 0, TAU); ctx.fill();
    if (on) glow(x, 0, 5, EDGES[i].color, .6);
  }
  ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}
function drawXsec() {
  const c = xctx, w = xc.width, cx = w / 2, cy = w / 2, R = w * .3, ig = S.ignite;
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, w); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  c.strokeStyle = 'rgba(140,170,255,.2)'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, R * 1.4, 0, TAU); c.stroke();
  const pts = EDGES.map((e, i) => { const a = S.spinPh + i * TAU / 7; return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, lx: cx + Math.cos(a) * R * 1.62, ly: cy + Math.sin(a) * R * 1.62, i }; });
  c.globalCompositeOperation = 'lighter';
  const cg = c.createRadialGradient(cx, cy, 0, cx, cy, R); cg.addColorStop(0, `rgba(255,255,255,${.9 * ig})`); cg.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = cg; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.fill();
  c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)); c.closePath();
  c.strokeStyle = `rgba(255,255,255,${.15 + .4 * ig})`; c.lineWidth = 3; c.stroke();
  c.font = '600 22px "JetBrains Mono", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (const p of pts) {
    const on = S.edges[p.i], col = EDGES[p.i].color;
    if (on && ig > 0) { c.globalAlpha = ig; c.drawImage(sprite(col), p.x - 30, p.y - 30, 60, 60); }
    c.globalAlpha = on ? 1 : .3; c.fillStyle = on ? col : '#555b70'; c.beginPath(); c.arc(p.x, p.y, 8, 0, TAU); c.fill();
    c.globalAlpha = on ? .9 : .3; c.fillText(p.i + 1, p.lx, p.ly);
  }
}

function render(rdt, t) {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  const cam = S.cam, z = cam.z * (1 + S.punch * .1);
  // depth: the far backdrop drifts less than the stage → parallax
  const px = (W / 2 - cam.x) * .35 - BGPAD, py = (H / 2 - cam.y) * .35 - BGPAD, bz = 1 + (z - 1) * .4;
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(bz, bz); ctx.translate(-W / 2, -H / 2);
  ctx.drawImage(bgCan, px, py, W + BGPAD * 2, H + BGPAD * 2); ctx.restore();
  const sx = S.shake > .2 ? rand(-1, 1) * S.shake : 0, sy = S.shake > .2 ? rand(-1, 1) * S.shake : 0;
  ctx.translate(W / 2 + sx + S.kickX, H / 2 + sy + S.kickY); ctx.scale(z, z); ctx.translate(-cam.x, -cam.y);

  S.vp = { x: S.cam.x + (S.cam.x - S.hx) * .3, y: floorY - H * 1.1 };
  { const cs = edgeCols().map(hexRgb), n = cs.length; S.avgCol = cs.reduce((a, c) => [a[0] + c[0] / n, a[1] + c[1] / n, a[2] + c[2] / n], [0, 0, 0]).map(v => v | 0); }
  drawFloor(); drawShadows(); drawPads(t); drawDust(rdt * S.ts); drawFloorLight();
  for (const o of objects) if (o.kind === 'solid') o.draw();
  drawFx('steam');
  for (const o of objects) if (o.kind === 'gas') o.draw();
  ctx.globalCompositeOperation = 'lighter';
  drawWater();
  for (const o of objects) if (o.kind === 'plasma' || o.kind === 'bec') o.draw(t);
  for (const o of objects) if (o.kind === 'solid') o.drawHot();
  drawFx();
  drawTrail(); drawBlade(t);
  ctx.globalCompositeOperation = 'source-over'; drawHilt();

  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  bloom();
  if (S.flash > .01) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = S.flash * .45; ctx.fillStyle = S.flashCol; ctx.fillRect(0, 0, W, H); }
  if (S.chroma > .01) {   // colour-split shudder on heavy hits
    const off = 4 + 30 * S.chroma; ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = Math.min(.5, S.chroma * 1.4);
    ctx.drawImage(cvs, off, 0, W, H); ctx.drawImage(cvs, -off, off * .3, W, H);
  }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.drawImage(vigCan, 0, 0, W, H);
  if (S.ts < .6) {   // time-dilation tint
    ctx.globalAlpha = (.6 - S.ts) * .25; ctx.fillStyle = '#2a1a6a'; ctx.globalCompositeOperation = 'lighter'; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }
  if (S.lb > .01) { ctx.globalAlpha = 1; ctx.fillStyle = '#000'; const h = H * .085 * S.lb; ctx.fillRect(0, 0, W, h); ctx.fillRect(0, H - h, W, h); }
  ctx.globalAlpha = 1;
  drawXsec();
}

// bloom: a 1/5-scale thresholded, blurred copy of the frame added back on top — light bleeds like a real lens
let bloomCan = null, bctx = null;
const HAS_FILTER = (() => { try { const c = document.createElement('canvas').getContext('2d'); c.filter = 'blur(1px)'; return c.filter === 'blur(1px)'; } catch (e) { return false; } })();
function bloom() {
  const bw = Math.max(2, W / 5 | 0), bh = Math.max(2, H / 5 | 0);
  if (!bloomCan) { bloomCan = document.createElement('canvas'); bctx = bloomCan.getContext('2d'); }
  if (bloomCan.width !== bw || bloomCan.height !== bh) { bloomCan.width = bw; bloomCan.height = bh; }
  bctx.globalCompositeOperation = 'copy'; if (HAS_FILTER) bctx.filter = 'brightness(.4) contrast(5) saturate(1.4) blur(3px)';
  bctx.drawImage(cvs, 0, 0, bw, bh); if (HAS_FILTER) bctx.filter = 'none';
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = HAS_FILTER ? .45 : .12; ctx.imageSmoothingEnabled = true;
  ctx.drawImage(bloomCan, 0, 0, W, H); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}

// ---------- UI ----------
const $ = id => document.getElementById(id);
const elEdges = $('edges'), elMats = $('mats'), elLog = $('log'), elBanner = $('banner');
EDGES.forEach((e, i) => {
  const b = document.createElement('button'); b.className = 'edge'; b.style.setProperty('--c', e.color); b.dataset.i = i;
  b.innerHTML = `<i></i><b>${i + 1} · ${e.name}</b><small>${e.desc}</small>`;
  b.onclick = () => toggleEdge(i); elEdges.appendChild(b);
});
ORDER.forEach(type => {
  const m = MATS[type], b = document.createElement('button'); b.className = 'mat'; b.style.setProperty('--c', m.color);
  b.dataset.type = type; b.innerHTML = `<b>${m.label}</b><small>${m.state}</small>`; b.onclick = () => { AU.init(); chooseTarget(type); }; elMats.appendChild(b);
});
function refreshUI() {
  const en = $('energize'); en.classList.toggle('on', S.energized); en.classList.toggle('vent', S.vent);
  en.querySelector('.lbl').textContent = S.energized ? 'ENERGIZED' : 'ENERGIZE';
  [...elEdges.children].forEach((b, i) => b.classList.toggle('off', !S.edges[i]));
  document.querySelectorAll('.tg').forEach(b => b.classList.toggle('on', !!S[b.dataset.k]));
  [...elMats.children].forEach(b => b.classList.toggle('sel', S.mode === 'single' && b.dataset.type === S.target));
  $('lineup').classList.toggle('on', S.mode === 'gallery');
  $('autoBtn').classList.toggle('on', S.mode === 'auto'); document.body.classList.toggle('auto', S.mode === 'auto');
}
function toggleEnergize() {
  AU.init(); S.energized = !S.energized; sfx(S.energized ? 'ignite' : 'retract'); if (S.energized) S.labelT = 5;
  if (S.energized && S.geo) { flash(S.geo.bx, S.geo.by, 90, '#ffffff'); ring(S.geo.bx, S.geo.by, '#ffffff', 60); }
  refreshUI();
}
function toggleEdge(i) {
  AU.init(); S.edges[i] = !S.edges[i]; S.lastEdge = i; sfx('click'); S.labelT = Math.max(S.labelT, 2.5);
  if (S.geo && S.ignite > 0) { flash(S.geo.bx, S.geo.by, 60, EDGES[i].color); sparks(S.geo.bx, S.geo.by, 10, [EDGES[i].color], 0, 0, 1, 250); }
  refreshUI();
}
function toggleKey(k) {
  AU.init(); S[k] = !S[k]; S.lastEdge = -1; sfx('click');
  if (k === 'freeze') { sfx('freeze'); banner(S.freeze ? 'TIME FROZEN' : 'TIME RESUMED', '#b24bff', '4th dimension'); }
  if (k === 'slowmo') banner(S.slowmo ? 'BULLET TIME' : 'REAL TIME', '#25e8ff', 'time flow');
  if (k === 'toss') S.tossT = 0;
  refreshUI();
}
document.querySelectorAll('.tg').forEach(b => b.onclick = () => toggleKey(b.dataset.k));
function setSndStyle(v) { S.sndStyle = v; AU.init(); S.lastEdge = -1; document.querySelectorAll('#sndStyle button').forEach(b => b.classList.toggle('on', b.dataset.v === v)); if (v === 'xylo') { xylo('ignite', 1); } else sfx('clang', .5); }
document.querySelectorAll('#sndStyle button').forEach(b => b.onclick = () => setSndStyle(b.dataset.v));
$('energize').onclick = toggleEnergize;
$('lineup').onclick = () => { AU.init(); gallery(); };
$('autoBtn').onclick = () => { AU.init(); autoMode(); };
$('clear').onclick = () => { clearAll(); sfx('click'); };
document.querySelectorAll('.fold').forEach(b => b.onclick = () => { const p = b.closest('.panel'); p.classList.toggle('folded'); b.textContent = p.classList.contains('folded') ? '+' : '–'; });
if (innerWidth < 760) document.querySelectorAll('.panel').forEach(p => { p.classList.add('folded'); p.querySelector('.fold').textContent = '+'; });
const bindSlider = (id, key, fmt) => { const el = $(id), out = $(id + 'Val'); const f = () => { S[key] = +el.value; out.textContent = fmt(S[key]); }; el.oninput = f; f(); };
bindSlider('power', 'power', v => Math.round(v * 100) + '%');
bindSlider('spin', 'spin', v => (v > 0 ? '↻ ' : v < 0 ? '↺ ' : '') + Math.abs(v).toFixed(1) + ' rev/s');
bindSlider('len', 'len', v => v | 0);
bindSlider('timeflow', 'timeflow', v => v.toFixed(2) + '×');
bindSlider('vol', 'vol', v => Math.round(v * 100) + '%');

let bannerT = 0;
function banner(text, col, sub = '') {
  const now = performance.now(); if (now - bannerT < 250) return; bannerT = now;
  elBanner.style.setProperty('--c', col); elBanner.querySelector('b').textContent = text; elBanner.querySelector('span').textContent = sub;
  elBanner.classList.remove('show'); void elBanner.offsetWidth; elBanner.classList.add('show');
}
function log(e) {
  const hint = elLog.querySelector('.hint'); if (hint) hint.remove();
  const li = document.createElement('li'), M = MATS[e.mat];
  li.className = e.cls; li.style.setProperty('--c', M.color);
  li.innerHTML = `<b>${M.label}</b><em>${LABEL[e.res] || e.res}</em>${e.kJ ? `<small>${e.kJ.toFixed(2)} kJ</small>` : ''}<br>${e.msg}`;
  elLog.prepend(li); while (elLog.children.length > 9) elLog.lastChild.remove();
  $('stCuts').textContent = S.stats.cuts; $('stShat').textContent = S.stats.shatters; $('stDefl').textContent = S.stats.deflects; $('stPeak').textContent = S.stats.peak.toFixed(1);
}
let hudT = 0;
function hud(t) {
  if (t - hudT < .12) return; hudT = t;
  const on = S.edges.filter(Boolean).length, o = oc();
  $('hSpeed').textContent = (S.tipSpeed / 100).toFixed(1);
  $('hTemp').textContent = S.ignite > .1 ? Math.round((2500 + 900 * on * S.power) * (o ? 1.5 : 1)).toLocaleString() : '0';
  $('hDraw').textContent = (S.ignite * on / 7 * S.power * (o ? 1.8 : 1) * 42).toFixed(1);
  $('hRpm').textContent = Math.round(S.spin * 60 * (o ? 1.8 : 1) * S.ignite);
  $('hMode').textContent = S.vent ? 'VENTING' : !S.energized ? 'STANDBY' : S.freeze ? 'TIME FROZEN' : o ? 'OVERCHARGE' : S.ts < .9 ? `TIME ×${S.ts.toFixed(2)}` : S.auto ? 'AUTO-DEMO' : 'ARMED';
  $('heatBar').style.width = (S.heat * 100).toFixed(0) + '%';
  $('energize').classList.toggle('vent', S.vent);
}

// ---------- input ----------
const markInput = e => { S.sx = e.clientX; S.sy = e.clientY; S.lastInput = performance.now() / 1000; };
cvs.addEventListener('pointermove', markInput);
cvs.addEventListener('pointerdown', e => { markInput(e); AU.init(); if (!S.energized) toggleEnergize(); });
function setZoom(z) { S.zoom = clamp(z, .5, 3); $('zoomVal').textContent = Math.round(S.zoom * 100) + '%'; }
cvs.addEventListener('wheel', e => {
  e.preventDefault();
  if (e.shiftKey) { S.base += (e.deltaY || e.deltaX) * .0015; return; }   // Shift+wheel tilts the blade
  if (e.ctrlKey && S.gesturing) return;
  setZoom(S.zoom * Math.exp(-e.deltaY * (e.ctrlKey ? .01 : .0015)));
}, { passive: false });
addEventListener('gesturestart', e => { e.preventDefault(); S.gesturing = true; S.gz = S.zoom; });   // Safari trackpad pinch
addEventListener('gesturechange', e => { e.preventDefault(); setZoom(S.gz * e.scale); });
addEventListener('gestureend', e => { e.preventDefault(); S.gesturing = false; });
$('zIn').onclick = () => setZoom(S.zoom * 1.25);
$('zOut').onclick = () => setZoom(S.zoom / 1.25);
$('zReset').onclick = () => setZoom(1);
addEventListener('keydown', e => {
  if (e.repeat && e.key !== 'Shift') return;
  const k = e.key.toLowerCase();
  if (e.key === 'Shift') { S.ocHeld = true; return; }
  if (k >= '1' && k <= '7') return toggleEdge(+k - 1);
  switch (k) {
    case 'e': toggleEnergize(); break;
    case ' ': e.preventDefault(); AU.init(); strike(); break;
    case 's': toggleKey('slowmo'); break;
    case 'x': toggleKey('freeze'); break;
    case 'o': toggleKey('ocLatch'); break;
    case 'm': toggleKey('sound'); break;
    case 'd': toggleKey('demo'); break;
    case 't': toggleKey('toss'); break;
    case 'l': AU.init(); gallery(); break;
    case 'a': AU.init(); autoMode(); break;
    case 'y': setSndStyle(S.sndStyle === 'xylo' ? 'real' : 'xylo'); break;
    case 'c': clearAll(); break;
    case 'arrowright': case 'arrowleft': { const i = (ORDER.indexOf(S.target) + (k === 'arrowright' ? 1 : 6)) % 7; AU.init(); chooseTarget(ORDER[i]); break; }
    case 'h': document.body.classList.toggle('noui'); break;
    case '=': case '+': setZoom(S.zoom * 1.25); break;
    case '-': case '_': setZoom(S.zoom / 1.25); break;
    case '0': setZoom(1); break;
    case '[': S.base -= .15; break;
    case ']': S.base += .15; break;
    case 'f': if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); break;
    case 'p': cvs.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'hepta-7.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }); break;
  }
});
addEventListener('keyup', e => { if (e.key === 'Shift') S.ocHeld = false; });
addEventListener('blur', () => { S.ocHeld = false; });
addEventListener('resize', resize);

// ---------- main loop ----------
function step(dt, rdt) {
  if (dt > 0) {
    const sub = Math.max(1, Math.ceil(dt / (1 / 90)));
    for (let i = 0; i < sub; i++) waterStep(dt / sub);
    for (const o of objects) o.update(dt);
    plasmaMerge();
    tossStep(dt);
    autoStep(dt);
  }
  updateFx(dt);
  let free = 0;
  for (let i = objects.length - 1; i >= 0; i--) if (objects[i].kind === 'solid' && objects[i].free && ++free > 140) objects[i].rest = 99;
  objects = objects.filter(o => { if (o.dead && o.kind === 'water') groups.delete(o.id); return !o.dead; });
  restock(rdt);
}
function updateCamera(rdt) {
  const c = S.cam, T = S.camT;
  S.camHold -= rdt;
  // when zoomed in, follow the sword just enough that the hilt stays under the cursor and the whole stage stays reachable
  const f = S.zoom > 1 ? 1 - 1 / S.zoom : 0;
  if (S.camHold <= 0 || !S.cine) { T.x = W / 2 + (S.hx - W / 2) * (f + .05 * (1 - f)); T.y = H / 2 + (S.hy - H / 2) * (f + .03 * (1 - f)); T.z = S.zoom; }
  const k = 1 - Math.exp(-rdt * (S.camHold > 0 ? 6 : f > 0 ? 8 : 2.5));
  c.x += (T.x - c.x) * k; c.y += (T.y - c.y) * k; c.z += (T.z - c.z) * k;
  const lbT = S.cine && (S.cineT > 0 || S.camHold > 0 || S.freeze || S.slowmo) ? 1 : 0;
  S.lb += (lbT - S.lb) * (1 - Math.exp(-rdt * 5));
}
let lastT = performance.now();
function frame(now) {
  const rdt = Math.min(.05, Math.max(.001, (now - lastT) / 1000)); lastT = now;
  const t = now / 1000;
  let ts = S.timeflow * (S.slowmo ? .25 : 1);
  if (S.cineT > 0) { S.cineT -= rdt; ts = Math.min(ts, .3); }
  if (S.hitstop > 0) { S.hitstop -= rdt; ts *= .06; }
  if (S.freeze) ts = 0;
  S.ts = ts;
  updateBlade(rdt, t); collide(rdt);
  step(rdt * ts, rdt);
  updateCamera(rdt);
  S.labelT -= rdt; S.shake *= Math.exp(-rdt * 8); S.punch *= Math.exp(-rdt * 9); S.kickX *= Math.exp(-rdt * 12); S.kickY *= Math.exp(-rdt * 12); S.chroma *= Math.exp(-rdt * 7); S.buzz *= Math.exp(-rdt * 5); S.flash *= Math.exp(-rdt * 6);
  AU.update(S.tipSpeed);
  render(rdt, t);
  hud(t);
  requestAnimationFrame(frame);
}

resize();
S.cam.x = S.camT.x = W / 2; S.cam.y = S.camT.y = H / 2;
S.sx = W / 2; S.sy = H * .78; S.hx = S.phx = W / 2; S.hy = H * .78;
spawnAt(0, true);
refreshUI();
setTimeout(() => { if (!S.energized) toggleEnergize(); banner('PICK A TARGET', '#cfd6ff', 'choose matter on the right · then swing the mouse through it'); }, 1100);
requestAnimationFrame(frame);
})();
