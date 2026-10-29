/*! Atom Forge
   © 2026 Mandeep S. Bhullar · SpinalXeno™. All rights reserved. SpinalXeno™ is a trademark of Mandeep S. Bhullar.
   Unauthorized copying, modification or redistribution of this code is prohibited.
   Digitally signed by SpinalXeno, signing key fingerprint (SHA-256) 25666eb2cf27368640bb41154733bfdc1f8a07b194aec7661659fc7b565155b3 */
/* ==========================================================
   ATOM FORGE — interactive nuclear & quantum atom builder
   Three.js r147 (classic build) · no build step required
   ========================================================== */
(() => {
'use strict';

const loaderMsg = document.getElementById('loader-msg');
if (typeof THREE === 'undefined' || !THREE.EffectComposer || !THREE.OrbitControls) {
  loaderMsg.textContent = 'Could not load Three.js from the CDN — check your internet connection and reload.';
  return;
}

/* ==========================================================
   1. ELEMENT & NUCLIDE DATA
   ========================================================== */
// symbol · name · standard atomic weight ([x] = most stable isotope) · most common / longest-lived mass number
const ELEMENT_DATA = `
H Hydrogen 1.008 1|He Helium 4.0026 4|Li Lithium 6.94 7|Be Beryllium 9.0122 9|B Boron 10.81 11|C Carbon 12.011 12|N Nitrogen 14.007 14|O Oxygen 15.999 16|F Fluorine 18.998 19|Ne Neon 20.180 20|
Na Sodium 22.990 23|Mg Magnesium 24.305 24|Al Aluminium 26.982 27|Si Silicon 28.085 28|P Phosphorus 30.974 31|S Sulfur 32.06 32|Cl Chlorine 35.45 35|Ar Argon 39.948 40|K Potassium 39.098 39|Ca Calcium 40.078 40|
Sc Scandium 44.956 45|Ti Titanium 47.867 48|V Vanadium 50.942 51|Cr Chromium 51.996 52|Mn Manganese 54.938 55|Fe Iron 55.845 56|Co Cobalt 58.933 59|Ni Nickel 58.693 58|Cu Copper 63.546 63|Zn Zinc 65.38 64|
Ga Gallium 69.723 69|Ge Germanium 72.630 74|As Arsenic 74.922 75|Se Selenium 78.971 80|Br Bromine 79.904 79|Kr Krypton 83.798 84|Rb Rubidium 85.468 85|Sr Strontium 87.62 88|Y Yttrium 88.906 89|Zr Zirconium 91.224 90|
Nb Niobium 92.906 93|Mo Molybdenum 95.95 98|Tc Technetium [98] 98|Ru Ruthenium 101.07 102|Rh Rhodium 102.91 103|Pd Palladium 106.42 106|Ag Silver 107.87 107|Cd Cadmium 112.41 114|In Indium 114.82 115|Sn Tin 118.71 120|
Sb Antimony 121.76 121|Te Tellurium 127.60 130|I Iodine 126.90 127|Xe Xenon 131.29 132|Cs Caesium 132.91 133|Ba Barium 137.33 138|La Lanthanum 138.91 139|Ce Cerium 140.12 140|Pr Praseodymium 140.91 141|Nd Neodymium 144.24 142|
Pm Promethium [145] 145|Sm Samarium 150.36 152|Eu Europium 151.96 153|Gd Gadolinium 157.25 158|Tb Terbium 158.93 159|Dy Dysprosium 162.50 164|Ho Holmium 164.93 165|Er Erbium 167.26 166|Tm Thulium 168.93 169|Yb Ytterbium 173.05 174|
Lu Lutetium 174.97 175|Hf Hafnium 178.49 180|Ta Tantalum 180.95 181|W Tungsten 183.84 184|Re Rhenium 186.21 187|Os Osmium 190.23 192|Ir Iridium 192.22 193|Pt Platinum 195.08 195|Au Gold 196.97 197|Hg Mercury 200.59 202|
Tl Thallium 204.38 205|Pb Lead 207.2 208|Bi Bismuth 208.98 209|Po Polonium [209] 209|At Astatine [210] 210|Rn Radon [222] 222|Fr Francium [223] 223|Ra Radium [226] 226|Ac Actinium [227] 227|Th Thorium 232.04 232|
Pa Protactinium 231.04 231|U Uranium 238.03 238|Np Neptunium [237] 237|Pu Plutonium [244] 244|Am Americium [243] 243|Cm Curium [247] 247|Bk Berkelium [247] 247|Cf Californium [251] 251|Es Einsteinium [252] 252|Fm Fermium [257] 257|
Md Mendelevium [258] 258|No Nobelium [259] 259|Lr Lawrencium [266] 266|Rf Rutherfordium [267] 267|Db Dubnium [268] 268|Sg Seaborgium [269] 269|Bh Bohrium [270] 270|Hs Hassium [269] 269|Mt Meitnerium [278] 278|Ds Darmstadtium [281] 281|
Rg Roentgenium [282] 282|Cn Copernicium [285] 285|Nh Nihonium [286] 286|Fl Flerovium [289] 289|Mc Moscovium [290] 290|Lv Livermorium [293] 293|Ts Tennessine [294] 294|Og Oganesson [294] 294`;

const ELEMENTS = [null];
ELEMENT_DATA.replace(/\n/g, '').split('|').forEach((rec, i) => {
  const [sym, name, massText, A] = rec.trim().split(/\s+/);
  ELEMENTS.push({ Z: i + 1, sym, name, massText, mass: parseFloat(massText.replace(/[[\]]/g, '')), A: +A });
});

const CATS = {
  alkali:     { label: 'Alkali metal',          color: '#ff4d6d' },
  alkaline:   { label: 'Alkaline earth metal',  color: '#ff9f43' },
  transition: { label: 'Transition metal',      color: '#ffd166' },
  post:       { label: 'Post-transition metal', color: '#9be564' },
  metalloid:  { label: 'Metalloid',             color: '#2ee6c5' },
  nonmetal:   { label: 'Reactive nonmetal',     color: '#4cc9f0' },
  halogen:    { label: 'Halogen',               color: '#6c8cff' },
  noble:      { label: 'Noble gas',             color: '#b28dff' },
  lanthanide: { label: 'Lanthanide',            color: '#ff8fd8' },
  actinide:   { label: 'Actinide',              color: '#e05cff' },
};
const CAT_SETS = {
  nonmetal: [1, 6, 7, 8, 15, 16, 34], noble: [2, 10, 18, 36, 54, 86, 118],
  alkali: [3, 11, 19, 37, 55, 87], alkaline: [4, 12, 20, 38, 56, 88],
  metalloid: [5, 14, 32, 33, 51, 52], halogen: [9, 17, 35, 53, 85, 117],
  post: [13, 31, 49, 50, 81, 82, 83, 84, 113, 114, 115, 116],
};
function categoryOf(Z) {
  for (const k in CAT_SETS) if (CAT_SETS[k].includes(Z)) return k;
  if (Z >= 57 && Z <= 71) return 'lanthanide';
  if (Z >= 89 && Z <= 103) return 'actinide';
  return 'transition';
}
ELEMENTS.forEach(e => { if (e) e.cat = categoryOf(e.Z); });

// periodic-table placement → {row, col, period, group}
function tablePos(Z) {
  const at = (period, col, row = period) => ({ row, col, period, group: row > 7 ? null : col });
  if (Z === 1) return at(1, 1);
  if (Z === 2) return at(1, 18);
  if (Z <= 18) { const p = Z <= 10 ? 2 : 3, i = Z - (p === 2 ? 3 : 11); return at(p, i < 2 ? i + 1 : i + 11); }
  if (Z <= 36) return at(4, Z - 18);
  if (Z <= 54) return at(5, Z - 36);
  const p = Z <= 86 ? 6 : 7, base = p === 6 ? 54 : 86;
  if (Z <= base + 2) return at(p, Z - base);
  if (Z <= base + 17) return at(p, Z - base - 3 + 3, p === 6 ? 9 : 10);
  return at(p, Z - base - 14);
}

// Stable nuclides (mass numbers), Z = 1…82
const STABLE = [[]].concat(
  ('1 2|3 4|6 7|9|10 11|12 13|14 15|16 17 18|19|20 21 22|23|24 25 26|27|28 29 30|31|32 33 34 36|35 37|36 38 40|39 41|' +
   '40 42 43 44 46|45|46 47 48 49 50|51|50 52 53 54|55|54 56 57 58|59|58 60 61 62 64|63 65|64 66 67 68 70|69 71|70 72 73 74|' +
   '75|74 76 77 78 80|79 81|80 82 83 84 86|85|84 86 87 88|89|90 91 92 94|93|92 94 95 96 97 98||96 98 99 100 101 102 104|103|' +
   '102 104 105 106 108 110|107 109|106 108 110 111 112 114|113|112 114 115 116 117 118 119 120 122 124|121 123|120 122 123 124 125 126|' +
   '127|126 128 129 130 131 132 134|133|132 134 135 136 137 138|139|136 138 140 142|141|142 143 145 146 148||144 149 150 152 154|153|' +
   '154 155 156 157 158 160|159|156 158 160 161 162 163 164|165|162 164 166 167 168 170|169|168 170 171 172 173 174 176|175|' +
   '176 177 178 179 180|181|182 183 184 186|185|184 187 188 189 190 192|191 193|192 194 195 196 198|197|196 198 199 200 201 202 204|' +
   '203 205|204 206 207 208').split('|').map(s => s ? s.split(' ').map(Number) : [])
);

// Primordial radionuclides: radioactive but far longer-lived than the universe (or close)
const QUASI = new Set(('19-40 20-48 23-50 32-76 34-82 36-78 37-87 40-96 42-100 48-113 48-116 49-115 52-128 52-130 54-124 54-136 ' +
  '56-130 57-138 60-144 60-150 62-147 62-148 63-151 64-152 71-176 72-174 74-180 75-187 76-186 78-190 83-209 90-232 92-235 92-238').split(' '));

// Known half-lives "Z-A": "half-life|decay mode"
const HALF = {
  '0-1': '10.2 min|β⁻', '1-3': '12.32 y|β⁻', '4-7': '53.2 d|EC', '4-8': '8.2×10⁻¹⁷ s|2α', '4-10': '1.39 Myr|β⁻',
  '6-11': '20.4 min|β⁺', '6-14': '5,730 y|β⁻', '7-13': '9.97 min|β⁺', '8-15': '2.04 min|β⁺', '9-18': '109.8 min|β⁺',
  '11-22': '2.60 y|β⁺', '11-24': '15.0 h|β⁻', '13-26': '717,000 y|β⁺', '15-32': '14.3 d|β⁻', '16-35': '87.4 d|β⁻',
  '17-36': '301,000 y|β⁻', '19-40': '1.25 Gyr|β⁻ / EC', '20-48': '6.4×10¹⁹ y|2β⁻', '23-50': '2.7×10¹⁷ y|EC / β⁻',
  '26-55': '2.74 y|EC', '26-60': '2.6 Myr|β⁻', '27-60': '5.27 y|β⁻', '28-63': '101 y|β⁻', '31-67': '3.26 d|EC',
  '32-76': '1.9×10²¹ y|2β⁻', '34-82': '1.0×10²⁰ y|2β⁻', '36-78': '9.2×10²¹ y|2EC', '36-85': '10.7 y|β⁻',
  '37-87': '49 Gyr|β⁻', '38-90': '28.8 y|β⁻', '40-96': '2.3×10¹⁹ y|2β⁻', '42-99': '66 h|β⁻', '42-100': '7.1×10¹⁸ y|2β⁻',
  '43-98': '4.2 Myr|β⁻', '43-99': '211,000 y|β⁻', '48-113': '7.7×10¹⁵ y|β⁻', '48-116': '3.1×10¹⁹ y|2β⁻',
  '49-111': '2.80 d|EC', '49-115': '4.4×10¹⁴ y|β⁻', '52-128': '2.2×10²⁴ y|2β⁻', '52-130': '7.9×10²⁰ y|2β⁻',
  '53-125': '59.4 d|EC', '53-129': '15.7 Myr|β⁻', '53-131': '8.02 d|β⁻', '54-124': '1.8×10²² y|2EC', '54-133': '5.25 d|β⁻',
  '54-136': '2.2×10²¹ y|2β⁻', '55-137': '30.1 y|β⁻', '56-130': '~10²¹ y|2EC', '56-133': '10.5 y|EC',
  '57-138': '103 Gyr|EC / β⁻', '60-144': '2.3×10¹⁵ y|α', '60-150': '9.1×10¹⁸ y|2β⁻', '61-145': '17.7 y|EC',
  '61-147': '2.62 y|β⁻', '62-147': '106 Gyr|α', '62-148': '7×10¹⁵ y|α', '63-151': '5×10¹⁸ y|α', '64-152': '1.1×10¹⁴ y|α',
  '71-176': '37.6 Gyr|β⁻', '72-174': '2×10¹⁵ y|α', '74-180': '1.8×10¹⁸ y|α', '75-187': '41.6 Gyr|β⁻', '76-186': '2×10¹⁵ y|α',
  '78-190': '650 Gyr|α', '81-201': '73 h|EC', '82-210': '22.2 y|β⁻', '83-209': '2.0×10¹⁹ y|α', '84-209': '124 y|α',
  '84-210': '138 d|α', '85-210': '8.1 h|EC', '86-222': '3.82 d|α', '87-223': '22 min|β⁻', '88-226': '1,600 y|α',
  '89-227': '21.8 y|β⁻', '90-232': '14.0 Gyr|α', '91-231': '32,760 y|α', '92-233': '159,200 y|α', '92-235': '704 Myr|α',
  '92-238': '4.47 Gyr|α', '93-237': '2.14 Myr|α', '94-238': '87.7 y|α', '94-239': '24,110 y|α', '94-244': '80 Myr|α',
  '95-241': '432 y|α', '95-243': '7,370 y|α', '96-247': '15.6 Myr|α', '97-247': '1,380 y|α', '98-251': '898 y|α',
  '98-252': '2.65 y|α / SF', '99-252': '472 d|α', '100-257': '100.5 d|α', '101-258': '51.5 d|α', '102-259': '58 min|α',
  '103-266': '~11 h|SF', '104-267': '~1.3 h|SF', '105-268': '~16 h|SF', '106-269': '~14 min|α', '107-270': '~1 min|α',
  '108-269': '~16 s|α', '109-278': '~4.5 s|α', '110-281': '~14 s|SF', '111-282': '~100 s|α', '112-285': '~30 s|α',
  '113-286': '~10 s|α', '114-289': '~2 s|α', '115-290': '~0.65 s|α', '116-293': '~60 ms|α', '117-294': '~50 ms|α', '118-294': '~0.7 ms|α',
};

/* ==========================================================
   2. NUCLEAR PHYSICS & ELECTRON CONFIGURATION
   ========================================================== */
const LIGHT_B = { '1-0': 0, '0-1': 0, '1-1': 2.224, '1-2': 8.482, '2-1': 7.718, '2-2': 28.296, '3-3': 31.994, '3-4': 39.245,
  '4-5': 58.165, '4-4': 56.5, '5-5': 64.751, '5-6': 76.205, '6-6': 92.162, '6-7': 97.108, '7-7': 104.659, '8-8': 127.619 };

// Weizsäcker semi-empirical mass formula (MeV), measured values for the lightest nuclei
function bindingEnergy(Z, N) {
  const A = Z + N;
  if (A <= 1) return 0;
  const lb = LIGHT_B[Z + '-' + N];
  if (lb !== undefined) return lb;
  let B = 15.75 * A - 17.8 * Math.cbrt(A * A) - 0.711 * Z * (Z - 1) / Math.cbrt(A) - 23.7 * (N - Z) ** 2 / A;
  if (Z % 2 === 0 && N % 2 === 0) B += 11.18 / Math.sqrt(A);
  else if (Z % 2 === 1 && N % 2 === 1) B -= 11.18 / Math.sqrt(A);
  return B;
}

function atomicMass(Z, N, E) {
  return Z * 1.00782503 + N * 1.00866492 - Math.max(0, bindingEnergy(Z, N)) / 931.494 - (Z - E) * 0.00054858;
}

function nuclearStatus(Z, N) {
  const A = Z + N, key = Z + '-' + A;
  const known = HALF[key] ? HALF[key].split('|') : null;
  const out = (cls, label, half, mode, note = '') => ({ cls, label, half, mode, note });
  if (A === 0) return out('none', 'No nucleus', '—', '—');
  if (Z === 0) return N === 1 ? out('radioactive', 'Radioactive', known[0], known[1], 'free neutron')
                              : out('unbound', 'Unbound', '< 10⁻²¹ s', 'Neutron emission', 'no bound multi-neutron state');
  if ((Z <= 82 && STABLE[Z].includes(A))) return out('stable', 'Stable', 'Stable', '—');
  if (QUASI.has(key)) return out('primordial', 'Primordial', known[0], known[1], 'effectively stable');
  if (key === '4-8') return out('unbound', 'Unbound', known[0], known[1], 'splits into two α particles');
  if (known) return out('radioactive', 'Radioactive', known[0], known[1]);
  if (N === 0) return out('unbound', 'Unbound', '< 10⁻²¹ s', 'Proton emission', 'beyond the proton drip line');

  const B = bindingEnergy(Z, N);
  const Sn = B - bindingEnergy(Z, N - 1);
  const Sp = B - bindingEnergy(Z - 1, N);
  if (B <= 0 || Sn < 0) return out('unbound', 'Unbound', '< 10⁻²¹ s', 'Neutron emission', 'beyond the neutron drip line');
  if (Sp < 0) return out('unbound', 'Unbound', '< 10⁻¹⁸ s', 'Proton emission', 'beyond the proton drip line');

  const Zopt = A / (1.98 + 0.0155 * Math.cbrt(A * A));   // valley of β-stability
  let mode;
  if (Z >= 84 || A > 209) {
    if (Z < Zopt - 1.5) mode = 'β⁻';
    else if (Z > Zopt + 3) mode = 'β⁺ / EC · α';
    else mode = Z >= 98 && Z % 2 === 0 ? 'α · spontaneous fission' : 'α';
  } else mode = Z < Zopt ? 'β⁻' : 'β⁺ / EC';
  return out('radioactive', 'Radioactive', 'Short-lived', mode, Z < Zopt ? 'neutron-rich' : 'proton-rich');
}

const ORDER = ['1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p', '5s', '4d', '5p', '6s', '4f', '5d', '6p', '7s', '5f', '6d', '7p'];
const LETTERS = 'spdf';
const CAP = { s: 2, p: 6, d: 10, f: 14 };
const MAX_E = 118;
// Ground-state anomalies vs. the Madelung rule
const EXC = {
  24: { '4s': -1, '3d': 1 }, 29: { '4s': -1, '3d': 1 }, 41: { '5s': -1, '4d': 1 }, 42: { '5s': -1, '4d': 1 },
  44: { '5s': -1, '4d': 1 }, 45: { '5s': -1, '4d': 1 }, 46: { '5s': -2, '4d': 2 }, 47: { '5s': -1, '4d': 1 },
  57: { '4f': -1, '5d': 1 }, 58: { '4f': -1, '5d': 1 }, 64: { '4f': -1, '5d': 1 }, 78: { '6s': -1, '5d': 1 },
  79: { '6s': -1, '5d': 1 }, 89: { '5f': -1, '6d': 1 }, 90: { '5f': -2, '6d': 2 }, 91: { '5f': -1, '6d': 1 },
  92: { '5f': -1, '6d': 1 }, 93: { '5f': -1, '6d': 1 }, 96: { '5f': -1, '6d': 1 }, 103: { '6d': -1, '7p': 1 },
};
const subN = k => +k[0];
const subL = k => LETTERS.indexOf(k[1]);
const subCmp = (a, b) => subN(a) - subN(b) || subL(a) - subL(b);

function madelung(e) {
  const c = {};
  for (const s of ORDER) { if (e <= 0) break; const k = Math.min(CAP[s[1]], e); c[s] = k; e -= k; }
  return c;
}
function neutralConfig(Z) {
  const c = madelung(Z), ex = EXC[Z];
  if (ex) for (const k in ex) c[k] = (c[k] || 0) + ex[k];
  for (const k in c) if (!c[k]) delete c[k];
  return c;
}
// Cations lose electrons from the highest n first (4s before 3d); anions fill by Madelung order
function configFor(Z, E) {
  if (Z <= 0) return madelung(E);
  const c = neutralConfig(Math.min(Z, MAX_E));
  let tot = Z;
  while (tot > E) {
    const k = Object.keys(c).sort(subCmp).pop();
    if (--c[k] === 0) delete c[k];
    tot--;
  }
  for (const s of ORDER) {
    if (tot >= E) break;
    const add = Math.min(CAP[s[1]] - (c[s] || 0), E - tot);
    if (add > 0) { c[s] = (c[s] || 0) + add; tot += add; }
  }
  return c;
}
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = n => String(n).split('').map(d => SUP[d]).join('');

function formatConfig(c) {
  const total = Object.values(c).reduce((a, b) => a + b, 0);
  if (!total) return '<span style="color:var(--dim)">no electrons</span>';
  let core = 0;
  for (const g of [86, 54, 36, 18, 10, 2]) {
    if (g >= total) continue;
    const nc = neutralConfig(g);
    if (Object.keys(nc).every(k => c[k] === nc[k])) { core = g; break; }
  }
  const coreKeys = core ? Object.keys(neutralConfig(core)) : [];
  const rest = Object.keys(c).filter(k => c[k] > 0 && !coreKeys.includes(k)).sort(subCmp);
  return (core ? `<span class="core">[${ELEMENTS[core].sym}]</span> ` : '') + rest.map(k => k + sup(c[k])).join(' ');
}
function shellCounts(c) {
  const sh = [];
  for (const k in c) { const n = subN(k); sh[n - 1] = (sh[n - 1] || 0) + c[k]; }
  for (let i = 0; i < sh.length; i++) sh[i] = sh[i] || 0;
  return sh;
}
function blockOf(Z) {
  const { row, col } = tablePos(Z);
  return row > 7 ? 'f' : (col <= 2 || Z === 2) ? 's' : col >= 13 ? 'p' : 'd';
}

/* ==========================================================
   3. RENDERER, CAMERA, POST-PROCESSING
   ========================================================== */
THREE.ColorManagement.legacyMode = false;
const TAU = Math.PI * 2;
const canvas = document.getElementById('scene');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch (err) {
  loaderMsg.textContent = 'WebGL is not available in this browser.';
  return;
}
const PR = Math.min(window.devicePixelRatio || 1, 2);
renderer.setPixelRatio(PR);
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x000000, 1);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.05, 3000);
camera.position.set(-40, 55, 190);

const controls = new THREE.OrbitControls(camera, canvas);
Object.assign(controls, {
  enableDamping: true, dampingFactor: 0.06, minDistance: 1.6, maxDistance: 320,
  rotateSpeed: 0.55, zoomSpeed: 0.9, panSpeed: 0.6, autoRotate: true, autoRotateSpeed: 0.35,
});

const hdrTarget = new THREE.WebGLRenderTarget(innerWidth * PR, innerHeight * PR, { type: THREE.HalfFloatType });
const composer = new THREE.EffectComposer(renderer, hdrTarget);
composer.setSize(innerWidth, innerHeight);
composer.addPass(new THREE.RenderPass(scene, camera));
const bloom = new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 1.1, 0.62, 0.55);
composer.addPass(bloom);

const FinalShader = {
  uniforms: {
    tDiffuse: { value: null }, time: { value: 0 }, exposure: { value: 1.05 },
    resolution: { value: new THREE.Vector2(innerWidth * PR, innerHeight * PR) },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float time, exposure; uniform vec2 resolution;
    varying vec2 vUv;
    vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }
    vec3 toSRGB(vec3 c){ return mix(c*12.92, 1.055*pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c)); }
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec2 d = vUv - 0.5;
      vec2 off = d * dot(d, d) * 0.012;                       // lens chromatic aberration
      vec3 col = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
      col = aces(col * exposure);
      col *= 1.0 - 0.55 * smoothstep(0.25, 0.85, length(d * vec2(1.0, 0.82)));   // vignette
      col = toSRGB(col);
      col += (hash(vUv * resolution + fract(time) * 91.7) - 0.5) * 0.035;        // film grain
      gl_FragColor = vec4(col, 1.0);
    }`,
};
const finalPass = new THREE.ShaderPass(FinalShader);
composer.addPass(finalPass);

if (THREE.RoomEnvironment) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
}
scene.add(new THREE.HemisphereLight(0x8fb0ff, 0x1a0a20, 0.6));
const keyLight = new THREE.DirectionalLight(0xfff2e6, 2.4); keyLight.position.set(20, 30, 25); scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0x5ef0ff, 1.8); rimLight.position.set(-25, -10, -30); scene.add(rimLight);

/* ==========================================================
   4. SHARED MATERIALS & TEXTURES
   ========================================================== */
function glowTexture(stops) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  stops.forEach(([o, a]) => grd.addColorStop(o, `rgba(255,255,255,${a})`));
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
const softGlow = glowTexture([[0, 1], [0.15, 0.7], [0.4, 0.18], [0.7, 0.04], [1, 0]]);
const hdr = (hex, k) => new THREE.Color(hex).multiplyScalar(k);

const POINT_VS = `
  attribute float size; attribute float seed; attribute vec3 acolor;
  uniform float time, pixelRatio, twinkle, scale, opacity;
  varying vec3 vColor; varying float vAlpha;
  void main(){
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float tw = 1.0 - twinkle + twinkle * (0.5 + 0.5 * sin(time * (0.8 + seed * 2.5) + seed * 61.0));
    vColor = acolor; vAlpha = opacity * tw;
    gl_PointSize = max(1.0, size * scale * pixelRatio / max(0.1, -mv.z));
    gl_Position = projectionMatrix * mv;
  }`;
const POINT_FS = `
  varying vec3 vColor; varying float vAlpha;
  void main(){
    vec2 c = gl_PointCoord - 0.5;
    float a = exp(-dot(c, c) * 18.0);
    if (a < 0.02) discard;
    gl_FragColor = vec4(vColor, a * vAlpha);
  }`;
function pointsMaterial(scale, twinkle, opacity = 1) {
  return new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, pixelRatio: { value: PR }, twinkle: { value: twinkle }, scale: { value: scale }, opacity: { value: opacity } },
    vertexShader: POINT_VS, fragmentShader: POINT_FS,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
}
function pointsGeometry(pos, col, size, seed) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('acolor', new THREE.BufferAttribute(col, 3));
  g.setAttribute('size', new THREE.BufferAttribute(size, 1));
  g.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  return g;
}

/* ==========================================================
   5. DEEP-SPACE BACKDROP
   ========================================================== */
const nebulaMat = new THREE.ShaderMaterial({
  uniforms: { time: { value: 0 } },
  side: THREE.BackSide, depthWrite: false,
  vertexShader: `varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform float time; varying vec3 vDir;
    float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
    float noise(vec3 x){
      vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                 mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
    }
    float fbm(vec3 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
    void main(){
      vec3 d = normalize(vDir);
      float n1 = fbm(d * 2.3 + vec3(0.0, time * 0.004, 0.0));
      float n2 = fbm(d * 4.7 - vec3(time * 0.003));
      float band = exp(-pow(d.y * 2.6 + sin(d.x * 2.1 + d.z) * 0.45, 2.0));
      vec3 col = vec3(0.003, 0.004, 0.012);
      col += vec3(0.055, 0.018, 0.12) * smoothstep(0.42, 0.85, n1) * (0.5 + band);
      col += vec3(0.0, 0.05, 0.08) * smoothstep(0.5, 0.92, n2) * (0.4 + band);
      col += vec3(0.03, 0.02, 0.05) * band * n1;
      gl_FragColor = vec4(col, 1.0);
    }`,
});
scene.add(new THREE.Mesh(new THREE.SphereGeometry(1400, 48, 32), nebulaMat));

const starMat = pointsMaterial(600, 0.55);
{
  const n = 5000, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), size = new Float32Array(n), seed = new Float32Array(n);
  const tints = ['#ffffff', '#cfe0ff', '#ffe6c7', '#a8c8ff', '#ffd1e8'].map(h => new THREE.Color(h));
  for (let i = 0; i < n; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(650 + Math.random() * 600);
    v.y *= 0.75;
    pos.set([v.x, v.y, v.z], i * 3);
    const c = tints[(Math.random() * tints.length) | 0].clone().multiplyScalar(0.4 + Math.random() ** 3 * 2.5);
    col.set([c.r, c.g, c.b], i * 3);
    size[i] = 1.2 + Math.random() ** 4 * 5;
    seed[i] = Math.random();
  }
  scene.add(new THREE.Points(pointsGeometry(pos, col, size, seed), starMat));
}

// faint drifting dust in the atom's neighbourhood for parallax depth
const dustMat = pointsMaterial(260, 0.8, 0.5);
{
  const n = 900, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), size = new Float32Array(n), seed = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(45 + Math.random() * 200);
    pos.set([v.x, v.y * 0.6, v.z], i * 3);
    const c = new THREE.Color(Math.random() < 0.5 ? '#5ef0ff' : '#b28dff').multiplyScalar(0.12 + Math.random() * 0.2);
    col.set([c.r, c.g, c.b], i * 3);
    size[i] = 0.6 + Math.random() * 1.4;
    seed[i] = Math.random();
  }
  var dust = new THREE.Points(pointsGeometry(pos, col, size, seed), dustMat);
  scene.add(dust);
}

/* ==========================================================
   6. NUCLEUS — nucleons, quarks, gluons
   ========================================================== */
const MAX_P = 118, MAX_N = 180, NUC_R = 0.5;
const nucGeo = new THREE.SphereGeometry(NUC_R, 30, 22);
const protonMat = new THREE.MeshStandardMaterial({ color: '#ff5a3c', emissive: '#ff2a10', emissiveIntensity: 0.55, roughness: 0.32, metalness: 0.1, envMapIntensity: 0.7, transparent: true });
const neutronMat = new THREE.MeshStandardMaterial({ color: '#a9bde0', emissive: '#203d7a', emissiveIntensity: 0.45, roughness: 0.38, metalness: 0.3, envMapIntensity: 0.9, transparent: true });
const protonIM = new THREE.InstancedMesh(nucGeo, protonMat, MAX_P);
const neutronIM = new THREE.InstancedMesh(nucGeo, neutronMat, MAX_N);
[protonIM, neutronIM].forEach(m => { m.count = 0; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(m); });

const MAX_Q = (MAX_P + MAX_N) * 3;
const quarkIM = new THREE.InstancedMesh(new THREE.SphereGeometry(0.115, 14, 10),
  new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false }), MAX_Q);
quarkIM.count = 0; quarkIM.frustumCulled = false; quarkIM.renderOrder = 3;
quarkIM.setColorAt(0, new THREE.Color());
scene.add(quarkIM);
const COLOR_CHARGE = [hdr('#ff3355', 2.6), hdr('#33ff77', 2.4), hdr('#3a7bff', 2.8)];

const gluonPos = new Float32Array(MAX_Q * 2 * 3), gluonCol = new Float32Array(MAX_Q * 2 * 3);
const gluonGeo = new THREE.BufferGeometry();
gluonGeo.setAttribute('position', new THREE.BufferAttribute(gluonPos, 3).setUsage(THREE.DynamicDrawUsage));
gluonGeo.setAttribute('color', new THREE.BufferAttribute(gluonCol, 3).setUsage(THREE.DynamicDrawUsage));
const gluons = new THREE.LineSegments(gluonGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
gluons.frustumCulled = false; gluons.renderOrder = 4;
scene.add(gluons);

const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: softGlow, color: hdr('#ff6a3a', 1.2), transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false }));
scene.add(halo);

// capture flashes
const flashes = [];
for (let i = 0; i < 24; i++) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: softGlow, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 }));
  s.visible = false; s.userData.age = 1; scene.add(s); flashes.push(s);
}
let flashIdx = 0;
const FLASH_P = hdr('#ff7a40', 2.2), FLASH_N = hdr('#9cc4ff', 1.8), FLASH_E = hdr('#5ef0ff', 1.6);
function flash(pos, color, size = 3.5) {
  const s = flashes[flashIdx++ % flashes.length];
  s.position.copy(pos); s.material.color.copy(color); s.userData.age = 0; s.userData.size = size; s.visible = true;
}

const nucleons = [];
let liveP = 0, liveN = 0, nucleusR = 0.5;
const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _e = new THREE.Euler();

function addNucleon(type) {
  const dir = new THREE.Vector3().randomDirection();
  const tangent = new THREE.Vector3().randomDirection().cross(dir).normalize();
  nucleons.push({
    type, state: 'in', age: 0, seed: Math.random() * 100, scale: 0,
    pos: dir.clone().multiplyScalar(30 + Math.random() * 12),
    vel: tangent.multiplyScalar(8 + Math.random() * 6).addScaledVector(dir, -6),
  });
  type === 'p' ? liveP++ : liveN++;
}
function removeNucleon(type) {
  let best = null, bestR = -1;
  for (const n of nucleons) if (n.type === type && n.state !== 'out') { const r = n.pos.lengthSq(); if (r > bestR) { bestR = r; best = n; } }
  if (!best) return;
  best.state = 'out'; best.age = 0;
  best.vel.copy(best.pos).normalize().multiplyScalar(26);
  if (best.vel.lengthSq() < 1) best.vel.randomDirection().multiplyScalar(26);
  type === 'p' ? liveP-- : liveN--;
}

function stepNucleus(dt) {
  const act = nucleons.filter(n => n.state !== 'out');
  const sub = 2, h = dt / sub;
  for (let s = 0; s < sub; s++) {
    for (const a of act) {
      const r = a.pos.length();
      const pull = a.state === 'in' ? 70 : Math.min(r, 4) * 6;
      a.acc = (a.acc || new THREE.Vector3()).copy(a.pos).multiplyScalar(r > 1e-5 ? -pull / r : 0);
    }
    for (let i = 0; i < act.length; i++) {
      const a = act[i];
      for (let j = i + 1; j < act.length; j++) {
        const b = act[j];
        _v.subVectors(a.pos, b.pos);
        const d2 = _v.lengthSq();
        if (d2 < 1.0 && d2 > 1e-8) {
          const d = Math.sqrt(d2), f = (1.0 - d) * 90 / d;
          a.acc.addScaledVector(_v, f); b.acc.addScaledVector(_v, -f);
        } else if (d2 <= 1e-8) a.acc.x += Math.random() - 0.5;
      }
    }
    for (const a of act) {
      a.vel.addScaledVector(a.acc, h).multiplyScalar(Math.exp(-h * (a.state === 'in' ? 2.2 : 7)));
      a.pos.addScaledVector(a.vel, h);
      if (a.state === 'in' && a.pos.length() < nucleusR + 0.8) {
        a.state = 'live';
        flash(a.pos, a.type === 'p' ? FLASH_P : FLASH_N, 3 + Math.random());
      }
    }
  }
  for (let i = nucleons.length - 1; i >= 0; i--) {
    const n = nucleons[i];
    n.age += dt;
    if (n.state === 'out') {
      n.pos.addScaledVector(n.vel, dt);
      n.scale = Math.max(0, 1 - n.age / 1.3);
      if (n.age > 1.3) nucleons.splice(i, 1);
    } else n.scale = Math.min(1, n.scale + dt * 2.5);
  }
  let maxR = 0.5;
  for (const n of act) if (n.state === 'live') maxR = Math.max(maxR, n.pos.length() + NUC_R);
  nucleusR += (maxR - nucleusR) * Math.min(1, dt * 3);
}

let quarkFade = 0;
function renderNucleus(t, rt) {
  let ip = 0, ineu = 0, iq = 0, ig = 0;
  const showQ = quarkFade > 0.01;
  for (const n of nucleons) {
    const j = 0.025;
    _v.set(Math.sin(rt * 7.1 + n.seed) * j, Math.sin(rt * 6.3 + n.seed * 2.1) * j, Math.sin(rt * 7.7 + n.seed * 3.3) * j).add(n.pos);
    _s.setScalar(Math.max(0.001, n.scale));
    _m.compose(_v, _q.identity(), _s);
    if (n.type === 'p') protonIM.setMatrixAt(ip++, _m); else neutronIM.setMatrixAt(ineu++, _m);

    if (showQ && iq + 3 <= MAX_Q) {
      _e.set(n.seed, t * 1.6 + n.seed * 1.7, n.seed * 0.7);
      _q.setFromEuler(_e);
      const k = Math.floor(rt * 1.2 + n.seed) % 3;
      const pts = [];
      for (let qi = 0; qi < 3; qi++) {
        const a = qi / 3 * TAU + Math.sin(rt * 3 + n.seed + qi) * 0.25;
        const rr = 0.23 + Math.sin(rt * 5 + qi * 2 + n.seed) * 0.03;
        const p = new THREE.Vector3(Math.cos(a) * rr, Math.sin(a) * rr, Math.sin(rt * 4 + qi + n.seed) * 0.06).applyQuaternion(_q).add(_v);
        pts.push(p);
        // proton = u u d, neutron = u d d — up quarks drawn slightly larger
        const isUp = n.type === 'p' ? qi < 2 : qi === 0;
        _s.setScalar(n.scale * (isUp ? 1.0 : 0.82));
        _m.compose(p, _q2.identity(), _s);
        quarkIM.setMatrixAt(iq, _m);
        quarkIM.setColorAt(iq, COLOR_CHARGE[(qi + k) % 3]);
        iq++;
      }
      for (let qi = 0; qi < 3; qi++) {
        const a = pts[qi], b = pts[(qi + 1) % 3];
        const w = (0.35 + 0.65 * Math.abs(Math.sin(rt * 11 + n.seed * 3 + qi * 2))) * n.scale;
        gluonPos.set([a.x, a.y, a.z, b.x, b.y, b.z], ig * 3);
        gluonCol.set([w, w * 0.8, w * 0.45, w, w * 0.8, w * 0.45], ig * 3);
        ig += 2;
      }
    }
  }
  protonIM.count = ip; neutronIM.count = ineu;
  protonIM.instanceMatrix.needsUpdate = true; neutronIM.instanceMatrix.needsUpdate = true;

  quarkIM.visible = gluons.visible = showQ;
  if (showQ) {
    quarkIM.count = iq;
    quarkIM.instanceMatrix.needsUpdate = true;
    quarkIM.instanceColor.needsUpdate = true;
    quarkIM.material.opacity = quarkFade;
    gluonGeo.setDrawRange(0, ig);
    gluonGeo.attributes.position.needsUpdate = true;
    gluonGeo.attributes.color.needsUpdate = true;
    gluons.material.opacity = quarkFade * 0.9;
  }
  const op = 1 - 0.8 * quarkFade;
  protonMat.opacity = neutronMat.opacity = op;
  protonMat.depthWrite = neutronMat.depthWrite = quarkFade < 0.02;

  const hasNuc = liveP + liveN > 0;
  halo.visible = hasNuc;
  halo.scale.setScalar((nucleusR * 2 + 2.5) * 2.6);
  halo.material.opacity = (0.22 + 0.04 * Math.sin(rt * 2)) * (1 - quarkFade * 0.85);
  halo.material.color.copy(liveP ? HALO_P : HALO_N);
}
const HALO_P = hdr('#ff6a3a', 1.2), HALO_N = hdr('#7aa0ff', 1.0);
const _q2 = new THREE.Quaternion();

/* ==========================================================
   7. ELECTRONS — Bohr-style subshell orbits with light trails
   ========================================================== */
const SUBCOLORS = [['#38e8ff', '#2a6bff'], ['#c86bff', '#ff4fa8'], ['#ffb547', '#ff6a3d'], ['#6dff9a', '#d6ff4f']];
const subRadius = (n, l) => 6.0 + (n - 1) * 4.4 + l * 0.95;
const quatCache = {};
function subQuat(key, t) {
  const n = subN(key), l = subL(key), a = n * 1.31 + l * 2.17;
  _e.set(Math.sin(a * 1.7) * 0.95 + 0.22 * Math.sin(t * 0.05 + a), a * 2.3 + t * 0.035 * (l % 2 ? -1 : 1), Math.cos(a * 1.1) * 0.6, 'YXZ');
  return (quatCache[key] || (quatCache[key] = new THREE.Quaternion())).setFromEuler(_e);
}
function slotPosition(e, t, out) {
  const n = subN(e.key), l = subL(e.key), r = subRadius(n, l);
  const w = (l % 2 ? -1 : 1) * 1.25 / Math.pow(n, 1.1);
  const th = e.i / e.count * TAU + t * w + n * 0.7 + l * 1.9;
  return out.set(Math.cos(th) * r, 0, Math.sin(th) * r).applyQuaternion(quatCache[e.key] || subQuat(e.key, t));
}

const TRAIL = 48;
const eGeo = new THREE.SphereGeometry(0.19, 16, 12);
const eMat = new THREE.MeshBasicMaterial({ color: hdr('#b4fbff', 4.5) });
const eHaloMat = new THREE.SpriteMaterial({ map: softGlow, color: hdr('#5ef0ff', 1.6), transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false });
const trailMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false });
const trailColors = new Float32Array(TRAIL * 3);
{
  const c = hdr('#5ef0ff', 1.4);
  for (let i = 0; i < TRAIL; i++) { const f = Math.pow(1 - i / (TRAIL - 1), 1.7); trailColors.set([c.r * f, c.g * f, c.b * f], i * 3); }
}

const electrons = [];
let liveE = 0;
function addElectron() {
  const group = new THREE.Group();
  const core = new THREE.Mesh(eGeo, eMat);
  const glow = new THREE.Sprite(eHaloMat); glow.scale.setScalar(1.7);
  group.add(core, glow);
  const pos = new THREE.Vector3().randomDirection().multiplyScalar(80 + Math.random() * 30);
  const tg = new THREE.BufferGeometry();
  const tp = new Float32Array(TRAIL * 3);
  for (let i = 0; i < TRAIL; i++) tp.set([pos.x, pos.y, pos.z], i * 3);
  tg.setAttribute('position', new THREE.BufferAttribute(tp, 3).setUsage(THREE.DynamicDrawUsage));
  tg.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));
  const trail = new THREE.Line(tg, trailMat); trail.frustumCulled = false;
  scene.add(group, trail);
  electrons.push({ group, trail, pos, offset: new THREE.Vector3(), key: null, i: 0, count: 1, state: 'live', fresh: true, age: 0, vel: new THREE.Vector3() });
  liveE++;
}
function removeElectron() {
  for (let i = electrons.length - 1; i >= 0; i--) {
    const e = electrons[i];
    if (e.state !== 'out') {
      e.state = 'out'; e.age = 0;
      e.vel.copy(e.pos).normalize().multiplyScalar(30);
      liveE--;
      return;
    }
  }
}

// ring + label per occupied subshell
const rings = new Map();
const labelCache = {};
function labelTexture(text, color) {
  const id = text + color;
  if (labelCache[id]) return labelCache[id];
  const c = document.createElement('canvas'); c.width = 256; c.height = 96;
  const g = c.getContext('2d');
  g.font = '600 46px "Space Grotesk", system-ui, sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = color; g.shadowBlur = 18; g.fillStyle = color;
  g.fillText(text, 128, 50);
  g.shadowBlur = 0; g.fillStyle = '#ffffff'; g.globalAlpha = 0.85; g.fillText(text, 128, 50);
  const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding;
  return (labelCache[id] = tex);
}
function ensureRing(key) {
  let r = rings.get(key);
  if (r) return r;
  const n = subN(key), l = subL(key);
  const geo = new THREE.TorusGeometry(subRadius(n, l), 0.028, 6, 260); geo.rotateX(Math.PI / 2);
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: hdr(SUBCOLORS[l][0], 1.5), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  const label = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, opacity: 0, depthWrite: false }));
  label.scale.set(2.6, 0.975, 1);
  scene.add(mesh, label);
  r = { key, n, l, mesh, label, op: 0, target: 1, count: 0, text: '' };
  rings.set(key, r);
  return r;
}

let visualConfig = {};
let cloudDirtyAt = -1;
function reassignElectrons(t) {
  visualConfig = configFor(state.Z, liveE);
  const subs = Object.keys(visualConfig).sort(subCmp);
  const live = electrons.filter(e => e.state !== 'out');
  let idx = 0;
  for (const key of subs) {
    const cnt = visualConfig[key];
    for (let i = 0; i < cnt && idx < live.length; i++) {
      const e = live[idx++];
      if (e.key !== key || e.i !== i || e.count !== cnt) {
        e.key = key; e.i = i; e.count = cnt;
        subQuat(key, t);
        e.offset.copy(e.pos).sub(slotPosition(e, t, _v));
      }
    }
  }
  for (const r of rings.values()) r.target = 0;
  for (const key of subs) {
    const r = ensureRing(key);
    r.target = 1; r.count = visualConfig[key];
    const text = key + sup(r.count);
    if (text !== r.text) { r.text = text; r.label.material.map = labelTexture(text, SUBCOLORS[r.l][0]); r.label.material.needsUpdate = true; }
  }
  cloudDirtyAt = performance.now();
}

function updateElectrons(t, dt) {
  for (const r of rings.values()) {
    r.op += (r.target - r.op) * Math.min(1, dt * 3);
    const q = subQuat(r.key, t);
    r.mesh.quaternion.copy(q);
    r.mesh.material.opacity = r.op * vis.bohr * vis.paths * 0.55;
    r.mesh.visible = r.mesh.material.opacity > 0.003;
    const rad = subRadius(r.n, r.l) + 0.9;
    r.label.position.set(Math.cos(0.8) * rad, 0.6, Math.sin(0.8) * rad).applyQuaternion(q);
    r.label.material.opacity = r.op * vis.bohr * vis.labels * 0.9;
    r.label.visible = r.label.material.opacity > 0.003;
    if (r.target === 0 && r.op < 0.005) {
      scene.remove(r.mesh, r.label); r.mesh.geometry.dispose(); r.mesh.material.dispose(); r.label.material.dispose();
      rings.delete(r.key);
    }
  }
  trailMat.opacity = vis.bohr * vis.trails;
  const coreScale = Math.max(0.0001, vis.bohr);
  for (let i = electrons.length - 1; i >= 0; i--) {
    const e = electrons[i];
    if (e.state === 'out') {
      e.age += dt;
      e.vel.multiplyScalar(1 + dt * 1.2);
      e.pos.addScaledVector(e.vel, dt);
      e.group.scale.setScalar(Math.max(0.0001, 1 - e.age / 1.4) * coreScale);
      if (e.age > 1.5) {
        scene.remove(e.group, e.trail); e.trail.geometry.dispose();
        electrons.splice(i, 1);
        continue;
      }
    } else if (e.key) {
      slotPosition(e, t, _v);
      e.offset.multiplyScalar(Math.exp(-dt * (e.fresh ? 1.8 : 4.5)));
      if (e.fresh) {
        e.offset.applyAxisAngle(THREE.Object3D.DefaultUp, dt * 1.4);
        if (e.offset.lengthSq() < 0.09) { e.fresh = false; flash(_v, FLASH_E, 2.2); }
      }
      e.pos.copy(_v).add(e.offset);
      e.group.scale.setScalar(coreScale);
    }
    e.group.position.copy(e.pos);
    const tp = e.trail.geometry.attributes.position;
    tp.array.copyWithin(3, 0, (TRAIL - 1) * 3);
    tp.array[0] = e.pos.x; tp.array[1] = e.pos.y; tp.array[2] = e.pos.z;
    tp.needsUpdate = true;
  }
}

/* ==========================================================
   8. QUANTUM ORBITAL CLOUDS — sampled from hydrogen-like |ψ|²
   ========================================================== */
function laguerre(k, alpha, x) {
  if (k === 0) return 1;
  let L0 = 1, L1 = 1 + alpha - x;
  for (let i = 1; i < k; i++) { const L2 = ((2 * i + 1 + alpha - x) * L1 - (i + alpha) * L0) / (i + 1); L0 = L1; L1 = L2; }
  return L1;
}
const radialR = (n, l, r) => { const rho = 2 * r / n; return Math.exp(-rho / 2) * Math.pow(rho, l) * laguerre(n - l - 1, 2 * l + 1, rho); };
const radialTables = {};
function radialTable(n, l) {
  const key = n + '' + l;
  if (radialTables[key]) return radialTables[key];
  const steps = 900, rmax = 4 * n * n + 8, cdf = new Float32Array(steps + 1);
  let acc = 0;
  for (let i = 1; i <= steps; i++) { const r = i / steps * rmax, R = radialR(n, l, r); acc += r * r * R * R; cdf[i] = acc; }
  for (let i = 1; i <= steps; i++) cdf[i] /= acc;
  return (radialTables[key] = { cdf, rmax, steps });
}
function sampleRadius(n, l) {
  const { cdf, rmax, steps } = radialTable(n, l), u = Math.random();
  let lo = 0, hi = steps;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cdf[mid] < u) lo = mid; else hi = mid; }
  const f = (u - cdf[lo]) / Math.max(1e-9, cdf[hi] - cdf[lo]);
  return (lo + f) / steps * rmax;
}
// real spherical harmonics (unnormalised) on the unit sphere
function Ylm(l, m, x, y, z) {
  switch (l) {
    case 0: return 1;
    case 1: return m === -1 ? y : m === 0 ? z : x;
    case 2: return [x * y, y * z, 3 * z * z - 1, x * z, x * x - y * y][m + 2];
    default: return [y * (3 * x * x - y * y), x * y * z, y * (5 * z * z - 1), z * (5 * z * z - 3), x * (5 * z * z - 1), z * (x * x - y * y), x * (x * x - 3 * y * y)][m + 3];
  }
}
const ylmMax = {};
function ylmMaxSq(l, m) {
  const k = l + ',' + m;
  if (ylmMax[k]) return ylmMax[k];
  let mx = 0;
  for (let i = 0; i < 6000; i++) { _v.randomDirection(); const y = Ylm(l, m, _v.x, _v.y, _v.z); mx = Math.max(mx, y * y); }
  return (ylmMax[k] = mx * 1.05);
}
const M_ORDER = [0, 1, -1, 2, -2, 3, -3];
const radialMap = r => 2.2 + 3.1 * Math.pow(r, 0.62);

let cloud = null;
const oldClouds = [];
const cloudGroup = new THREE.Group();
scene.add(cloudGroup);
function buildCloud() {
  const PER_E = 430;
  const subs = Object.keys(visualConfig).sort(subCmp);
  let total = 0;
  for (const k of subs) total += visualConfig[k] * PER_E;
  if (cloud) { oldClouds.push(cloud); cloud = null; }
  if (!total) return;
  const pos = new Float32Array(total * 3), col = new Float32Array(total * 3), size = new Float32Array(total), seed = new Float32Array(total);
  let p = 0;
  const cA = new THREE.Color(), cB = new THREE.Color();
  for (const key of subs) {
    const n = subN(key), l = subL(key), cnt = visualConfig[key], norb = 2 * l + 1;
    const occ = new Array(norb).fill(0);
    for (let i = 0; i < cnt; i++) occ[i % norb]++;               // Hund's rule: singly occupy first
    cA.set(SUBCOLORS[l][0]).multiplyScalar(0.55); cB.set(SUBCOLORS[l][1]).multiplyScalar(0.55);
    for (let oi = 0; oi < norb; oi++) {
      if (!occ[oi]) continue;
      const m = M_ORDER.filter(v => Math.abs(v) <= l)[oi], ymax = ylmMaxSq(l, m);
      for (let s = 0; s < occ[oi] * PER_E; s++) {
        let y, guard = 0;
        do { _v.randomDirection(); y = Ylm(l, m, _v.x, _v.y, _v.z); } while (Math.random() * ymax > y * y && ++guard < 200);
        const r = sampleRadius(n, l);
        const sign = Math.sign(y || 1) * Math.sign(radialR(n, l, r) || 1);   // wavefunction phase
        const rv = radialMap(r);
        pos[p * 3] = _v.x * rv; pos[p * 3 + 1] = _v.z * rv; pos[p * 3 + 2] = _v.y * rv;
        const c = sign > 0 ? cA : cB, b = 0.7 + Math.random() * 0.6;
        col[p * 3] = c.r * b; col[p * 3 + 1] = c.g * b; col[p * 3 + 2] = c.b * b;
        size[p] = 0.45 + Math.random() * 0.55;
        seed[p] = Math.random();
        p++;
      }
    }
  }
  cloud = new THREE.Points(pointsGeometry(pos, col, size, seed), pointsMaterial(320, 0.5, 0));
  cloud.frustumCulled = false;
  cloud.userData.fade = 0;
  cloudGroup.add(cloud);
}
function updateCloud(dt, rt) {
  if (cloudDirtyAt > 0 && vis.cloudTarget > 0 && performance.now() - cloudDirtyAt > 160) { cloudDirtyAt = -1; buildCloud(); }
  cloudGroup.rotation.y += dt * 0.04 * state.speed * (state.paused ? 0 : 1);
  if (cloud) {
    cloud.userData.fade = Math.min(1, cloud.userData.fade + dt * 1.5);
    cloud.material.uniforms.opacity.value = cloud.userData.fade * vis.cloud;
    cloud.material.uniforms.time.value = rt;
    cloud.visible = vis.cloud > 0.003;
  }
  for (let i = oldClouds.length - 1; i >= 0; i--) {
    const c = oldClouds[i], u = c.material.uniforms.opacity;
    u.value -= dt * 2.2;
    if (u.value <= 0) { cloudGroup.remove(c); c.geometry.dispose(); c.material.dispose(); oldClouds.splice(i, 1); }
  }
}

/* ==========================================================
   9. STATE
   ========================================================== */
const state = { Z: 0, N: 0, E: 0, view: 'bohr', speed: 1, paused: false, cinematic: false };
const vis = { bohr: 1, cloud: 0, cloudTarget: 0, paths: 1, trails: 1, labels: 1 };
const toggles = { paths: true, trails: true, labels: true };
let lastAssignZ = -1, lastAssignE = -1;

function syncParticles(t) {
  const step = (diff) => Math.min(Math.abs(diff), Math.max(1, Math.ceil(Math.abs(diff) / 16)));
  let d = state.Z - liveP;
  for (let i = step(d); i > 0; i--) d > 0 ? addNucleon('p') : removeNucleon('p');
  d = state.N - liveN;
  for (let i = step(d); i > 0; i--) d > 0 ? addNucleon('n') : removeNucleon('n');
  d = state.E - liveE;
  for (let i = step(d); i > 0; i--) d > 0 ? addElectron() : removeElectron();
  if (liveE !== lastAssignE || state.Z !== lastAssignZ) {
    lastAssignE = liveE; lastAssignZ = state.Z;
    reassignElectrons(t);
  }
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function setCounts(Z, N, E, opts = {}) {
  const prevZ = state.Z;
  state.Z = clamp(Z, 0, MAX_P); state.N = clamp(N, 0, MAX_N); state.E = clamp(E, 0, MAX_E);
  if (opts.announce !== false && state.Z !== prevZ) {
    const from = prevZ ? ELEMENTS[prevZ].name : 'Empty', to = state.Z ? ELEMENTS[state.Z].name : 'Empty';
    toast(`<span class="tag">Transmutation</span>${from} → <b>${to}</b>`, 'z');
  }
  updateInfo(prevZ !== state.Z);
}
function buildElement(Z, announce = true) {
  const el = ELEMENTS[Z];
  setCounts(Z, el.A - Z, Z, { announce: false });
  if (announce) toast(`<span class="tag">Assembling</span><b>${el.name}-${el.A}</b> · ${Z} p · ${el.A - Z} n · ${Z} e`, 'build');
  setTimeout(() => cameraPreset('atom', 2.2), 250);
}

/* ==========================================================
   10. UI
   ========================================================== */
const $ = id => document.getElementById(id);

function updateInfo(zChanged) {
  const { Z, N, E } = state, A = Z + N, q = Z - E, el = ELEMENTS[Z];
  const card = $('element-card');
  const catColor = el ? CATS[el.cat].color : '#5a6388';
  card.style.setProperty('--cat', catColor);
  if (zChanged) { card.classList.remove('flash'); void card.offsetWidth; card.classList.add('flash'); }
  $('ec-z').textContent = Z;
  $('ec-mass').textContent = el ? el.massText : '—';
  $('ec-symbol').textContent = el ? el.sym : (N ? 'n' : '∅');
  $('ec-name').textContent = el ? el.name : (N === 1 ? 'Free neutron' : N ? 'Neutron cluster' : 'Empty space');
  $('ec-cat').textContent = el ? CATS[el.cat].label : (N ? 'Baryonic matter' : 'Add a proton to begin');

  const chargeTxt = q === 0 ? '' : (Math.abs(q) > 1 ? Math.abs(q) : '') + (q > 0 ? '+' : '−');
  const nu = $('nuclide');
  nu.querySelector('.nu-sup').textContent = A || '';
  nu.querySelector('.nu-sub').textContent = Z || (N ? 0 : '');
  nu.querySelector('.nu-sym').textContent = el ? el.sym : (N ? 'n' : '—');
  nu.querySelector('.nu-charge').textContent = chargeTxt;

  const special = Z === 1 ? ({ 1: 'Protium', 2: 'Deuterium', 3: 'Tritium' })[A] : null;
  $('isotope-name').textContent = el ? `${el.name}-${A}${special ? ' · ' + special : ''}` : (N ? `${N} neutron${N > 1 ? 's' : ''}` : 'No nucleus');
  const st = nuclearStatus(Z, N);
  const badge = $('stability');
  badge.className = 'badge ' + st.cls;
  badge.textContent = st.label + (st.note ? ' · ' + st.note : '');

  bump('cnt-p', Z); bump('cnt-n', N); bump('cnt-e', E);
  $('st-p').textContent = Z; $('st-n').textContent = N; $('st-e').textContent = E; $('st-a').textContent = A;
  const qEl = $('st-q');
  qEl.textContent = q === 0 ? '0' : (q > 0 ? '+' : '−') + Math.abs(q);
  qEl.style.color = q > 0 ? 'var(--proton)' : q < 0 ? 'var(--electron)' : '';
  $('st-m').textContent = (A || E) ? atomicMass(Z, N, E).toFixed(A > 99 ? 2 : 3) + ' u' : '—';

  const B = Math.max(0, bindingEnergy(Z, N)), ba = A > 1 ? B / A : 0;
  $('st-be').textContent = A > 1 ? `${ba.toFixed(3)} MeV` : '—';
  $('be-fill').style.width = `${clamp(ba / 8.8, 0, 1) * 100}%`;
  $('st-r').textContent = A ? `${(1.2 * Math.cbrt(A)).toFixed(2)} fm` : '—';
  $('st-hl').textContent = st.half;
  $('st-decay').textContent = st.mode;

  const cfg = configFor(Z, E);
  $('config').innerHTML = formatConfig(cfg);
  const sh = shellCounts(cfg);
  const NAMES = 'KLMNOPQ';
  $('shells').innerHTML = sh.length
    ? sh.map((c, i) => {
        const full = c === 2 * (i + 1) ** 2 || (i === sh.length - 1 && isClosedShell(cfg));
        return `<div class="shell-chip${full ? ' full' : ''}"><small>${NAMES[i]}</small><b>${c}</b></div>`;
      }).join('')
    : '<span style="color:var(--dim);font-size:12px">—</span>';
  if (el) {
    const p = tablePos(Z);
    $('st-pos').textContent = `${blockOf(Z)} · ${p.period} · ${p.group ?? 'f-block'}`;
  } else $('st-pos').textContent = '—';
  $('st-val').textContent = sh.length ? sh[sh.length - 1] : 0;

  document.querySelectorAll('.pt-cell.current').forEach(c => c.classList.remove('current'));
  if (Z) { const c = document.querySelector(`.pt-cell[data-z="${Z}"]`); if (c) c.classList.add('current'); }
  if (!ptHover) showPreview(Z || 1);
}
function isClosedShell(cfg) {
  const keys = Object.keys(cfg).sort(subCmp);
  if (!keys.length) return false;
  const last = keys[keys.length - 1];
  return cfg[last] === CAP[last[1]] && (last[1] === 'p' || last === '1s');
}
const lastCounts = {};
function bump(id, v) {
  const el = $(id);
  if (lastCounts[id] !== v) { el.textContent = v; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); lastCounts[id] = v; }
}

let lastToastKind = '', lastToastAt = 0;
function toast(html, kind = '') {
  const box = $('toasts'), now = performance.now();
  if (kind && kind === lastToastKind && now - lastToastAt < 700 && box.lastElementChild) {
    box.lastElementChild.innerHTML = html;
  } else {
    const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = html; box.appendChild(t);
    setTimeout(() => t.remove(), 3200);
    while (box.children.length > 3) box.firstElementChild.remove();
  }
  lastToastKind = kind; lastToastAt = now;
}

function act(a) {
  const { Z, N, E } = state;
  switch (a) {
    case 'p+': setCounts(Z + 1, N, E); break;
    case 'p-': setCounts(Z - 1, N, E); break;
    case 'n+': setCounts(Z, N + 1, E); break;
    case 'n-': setCounts(Z, N - 1, E); break;
    case 'e+': setCounts(Z, N, E + 1); break;
    case 'e-': setCounts(Z, N, E - 1); break;
    case 'neutral': setCounts(Z, N, Z); break;
    case 'stable': if (Z) setCounts(Z, ELEMENTS[Z].A - Z, E); break;
    case 'clear': setCounts(0, 0, 0, { announce: false }); break;
  }
}
// press-and-hold repeat on +/- buttons
document.querySelectorAll('[data-act]').forEach(btn => {
  const a = btn.dataset.act;
  if (!btn.classList.contains('pm')) { btn.addEventListener('click', () => act(a)); return; }
  let t1, t2;
  const stop = () => { clearTimeout(t1); clearInterval(t2); };
  btn.addEventListener('pointerdown', ev => {
    ev.preventDefault(); act(a);
    t1 = setTimeout(() => { t2 = setInterval(() => act(a), 70); }, 380);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(evn => btn.addEventListener(evn, stop));
});

function setView(v) {
  state.view = v;
  document.querySelectorAll('#view-mode button').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  vis.cloudTarget = v === 'bohr' ? 0 : v === 'hybrid' ? 0.6 : 1;
  if (vis.cloudTarget > 0 && !cloud) cloudDirtyAt = 1;
}
document.querySelectorAll('#view-mode button').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));

const bindToggle = (id, fn) => { const el = $(id); el.addEventListener('change', () => fn(el.checked)); };
bindToggle('tg-paths', v => toggles.paths = v);
bindToggle('tg-trails', v => toggles.trails = v);
bindToggle('tg-labels', v => toggles.labels = v);
bindToggle('tg-rotate', v => { controls.autoRotate = v; });

const bindSlider = (id, fmt, fn) => {
  const el = $(id), out = $(id + '-v');
  const upd = () => { const v = parseFloat(el.value); out.textContent = fmt(v); fn(v); };
  el.addEventListener('input', upd); upd();
};
bindSlider('sl-speed', v => v.toFixed(1) + '×', v => state.speed = v);
bindSlider('sl-bloom', v => v.toFixed(1), v => bloom.strength = v);
bindSlider('sl-exposure', v => v.toFixed(2), v => finalPass.uniforms.exposure.value = v);

document.querySelectorAll('[data-collapse]').forEach(b => b.addEventListener('click', () => {
  const p = $(b.dataset.collapse); p.classList.toggle('collapsed');
  b.textContent = p.classList.contains('collapsed') ? '+' : '–';
}));
if (innerWidth < 760) $('panel-info').classList.add('collapsed');

// ---------- periodic table ----------
const ptable = $('ptable');
let ptHover = 0;
function showPreview(Z) {
  const el = ELEMENTS[Z];
  $('pv-cell').style.setProperty('--cat', CATS[el.cat].color);
  $('pv-z').textContent = Z; $('pv-sym').textContent = el.sym; $('pv-name').textContent = el.name;
  $('pv-cat').textContent = CATS[el.cat].label;
  $('pv-mass').textContent = `Atomic mass ${el.massText} · common isotope ${el.sym}-${el.A}`;
  $('pv-config').innerHTML = formatConfig(neutralConfig(Z));
}
for (let Z = 1; Z <= 118; Z++) {
  const el = ELEMENTS[Z], p = tablePos(Z), c = document.createElement('div');
  c.className = 'pt-cell'; c.dataset.z = Z;
  c.style.gridRow = p.row; c.style.gridColumn = p.col;
  c.style.setProperty('--cat', CATS[el.cat].color);
  c.style.animationDelay = `${(p.col + p.row * 2) * 12}ms`;
  c.innerHTML = `<span class="z">${Z}</span><span class="sym">${el.sym}</span><span class="nm">${el.name}</span>`;
  c.title = `${el.name} · ${el.massText}`;
  c.addEventListener('mouseenter', () => { ptHover = Z; showPreview(Z); });
  c.addEventListener('click', () => { closeOverlay('table-overlay'); buildElement(Z); });
  ptable.appendChild(c);
}
[[6, '57–71'], [7, '89–103']].forEach(([row, txt]) => {
  const c = document.createElement('div'); c.className = 'pt-cell placeholder';
  c.style.gridRow = row; c.style.gridColumn = 3; c.textContent = txt; ptable.appendChild(c);
});
ptable.addEventListener('mouseleave', () => { ptHover = 0; showPreview(state.Z || 1); });
const legend = $('pt-legend');
Object.entries(CATS).forEach(([k, c]) => {
  const it = document.createElement('div'); it.className = 'lg-item'; it.style.setProperty('--c', c.color);
  it.innerHTML = `<i></i>${c.label}`;
  it.addEventListener('mouseenter', () => document.querySelectorAll('.pt-cell[data-z]').forEach(cell => cell.classList.toggle('dim', ELEMENTS[cell.dataset.z].cat !== k)));
  it.addEventListener('mouseleave', () => applySearch());
  legend.appendChild(it);
});
const search = $('table-search');
function searchMatches(qs) {
  qs = qs.trim().toLowerCase();
  if (!qs) return null;
  return ELEMENTS.filter(e => e && (String(e.Z) === qs || e.sym.toLowerCase().startsWith(qs) || e.name.toLowerCase().includes(qs)))
    .sort((a, b) => (b.sym.toLowerCase() === qs) - (a.sym.toLowerCase() === qs));
}
function applySearch() {
  const m = searchMatches(search.value), set = m && new Set(m.map(e => e.Z));
  document.querySelectorAll('.pt-cell[data-z]').forEach(c => c.classList.toggle('dim', !!set && !set.has(+c.dataset.z)));
  if (m && m.length) showPreview(m[0].Z);
}
search.addEventListener('input', applySearch);
search.addEventListener('keydown', e => {
  if (e.key === 'Enter') { const m = searchMatches(search.value); if (m && m.length) { closeOverlay('table-overlay'); buildElement(m[0].Z); } }
  if (e.key === 'Escape') { search.blur(); closeOverlay('table-overlay'); }
});

function openOverlay(id) {
  $(id).classList.add('open');
  if (id === 'table-overlay') { search.value = ''; applySearch(); setTimeout(() => search.focus(), 60); }
}
function closeOverlay(id) { $(id).classList.remove('open'); }
$('open-table').addEventListener('click', () => openOverlay('table-overlay'));
$('btn-help').addEventListener('click', () => openOverlay('help-overlay'));
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => closeOverlay(b.dataset.close)));
document.querySelectorAll('.overlay').forEach(o => o.addEventListener('pointerdown', e => { if (e.target === o) closeOverlay(o.id); }));

/* ==========================================================
   11. CAMERA DIRECTION
   ========================================================== */
const tween = { active: false };
const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function flyTo(pos, target, dur = 1.6) {
  Object.assign(tween, { active: true, t: 0, dur, p0: camera.position.clone(), p1: pos, t0: controls.target.clone(), t1: target });
}
function outerRadius() {
  let r = 0;
  for (const k of Object.keys(configFor(state.Z, state.E))) r = Math.max(r, subRadius(subN(k), subL(k)));
  return r || 6;
}
function cameraPreset(kind, dur = 1.8) {
  const dir = camera.position.clone().sub(controls.target).normalize();
  if (dir.lengthSq() < 0.5) dir.set(0, 0.3, 1).normalize();
  dir.y = clamp(dir.y, -0.6, 0.6); dir.normalize();
  const origin = new THREE.Vector3();
  const targetR = 0.6 * Math.cbrt(Math.max(1, state.Z + state.N)) + 0.3;
  const dist = kind === 'nucleus' ? targetR * 3 + 6 : kind === 'atom' ? outerRadius() * 2.7 + 10 : 210;
  flyTo(dir.multiplyScalar(dist), origin, dur);
}
function zoomBy(f) {
  const off = camera.position.clone().sub(controls.target);
  const d = clamp(off.length() * f, controls.minDistance, controls.maxDistance);
  flyTo(controls.target.clone().add(off.setLength(d)), controls.target.clone(), 0.55);
}
document.querySelectorAll('[data-cam]').forEach(b => b.addEventListener('click', () => {
  const k = b.dataset.cam;
  if (k === 'zoom-in') zoomBy(0.7); else if (k === 'zoom-out') zoomBy(1.43); else cameraPreset(k);
}));
// cancel tweens when the user grabs the camera
canvas.addEventListener('pointerdown', () => { tween.active = false; });
canvas.addEventListener('wheel', () => { tween.active = false; }, { passive: true });

let userAutoRotate = true, cineBase = 0, cineT = 0;
function setCinematic(on) {
  state.cinematic = on;
  document.body.classList.toggle('cinematic', on);
  $('btn-cinema').classList.toggle('on', on);
  if (on) {
    userAutoRotate = controls.autoRotate;
    controls.autoRotate = true; controls.autoRotateSpeed = 0.9;
    cineBase = camera.position.distanceTo(controls.target); cineT = 0;
  } else {
    controls.autoRotate = userAutoRotate; controls.autoRotateSpeed = 0.35;
  }
}
$('btn-cinema').addEventListener('click', () => setCinematic(!state.cinematic));
function setPaused(p) { state.paused = p; $('btn-pause').textContent = p ? '▶' : '❚❚'; $('btn-pause').classList.toggle('on', p); }
$('btn-pause').addEventListener('click', () => setPaused(!state.paused));

function snapshot() {
  composer.render();
  const a = document.createElement('a');
  const el = ELEMENTS[state.Z];
  a.download = `atom-${el ? el.sym + '-' + (state.Z + state.N) : 'empty'}.png`;
  a.href = renderer.domElement.toDataURL('image/png');
  a.click();
  toast('<span class="tag">Snapshot</span>Saved <b>' + a.download + '</b>');
}
$('btn-shot').addEventListener('click', snapshot);

window.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' && e.target.type !== 'checkbox' && e.target.type !== 'range') return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key.toLowerCase();
  const anyOpen = document.querySelector('.overlay.open');
  if (k === 'escape') { if (anyOpen) closeOverlay(anyOpen.id); else if (state.cinematic) setCinematic(false); else document.body.classList.remove('ui-hidden'); return; }
  if (anyOpen && k !== 't' && k !== '?') return;
  switch (k) {
    case 'p': act(e.shiftKey ? 'p-' : 'p+'); break;
    case 'n': act(e.shiftKey ? 'n-' : 'n+'); break;
    case 'e': act(e.shiftKey ? 'e-' : 'e+'); break;
    case 't': anyOpen ? closeOverlay('table-overlay') : openOverlay('table-overlay'); e.preventDefault(); break;
    case '?': case '/': anyOpen ? closeOverlay('help-overlay') : openOverlay('help-overlay'); break;
    case 'v': setView({ bohr: 'cloud', cloud: 'hybrid', hybrid: 'bohr' }[state.view]); break;
    case '1': cameraPreset('nucleus'); break;
    case '2': cameraPreset('atom'); break;
    case '3': cameraPreset('wide'); break;
    case '+': case '=': zoomBy(0.7); break;
    case '-': case '_': zoomBy(1.43); break;
    case ' ': setPaused(!state.paused); e.preventDefault(); break;
    case 'c': setCinematic(!state.cinematic); break;
    case 'h': document.body.classList.toggle('ui-hidden'); break;
    case 's': snapshot(); break;
  }
});

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
  finalPass.uniforms.resolution.value.set(innerWidth * PR, innerHeight * PR);
});

/* ==========================================================
   12. MAIN LOOP
   ========================================================== */
const hudLevel = $('scale-level'), hudDetail = $('scale-detail'), hud = $('scale-hud');
let lastHud = '';
function updateHud(dist) {
  let lvl, det;
  if (quarkFade > 0.5) { lvl = 'SUBNUCLEAR SCALE'; det = '≈ 10⁻¹⁶ m · quarks (uud / udd) bound by gluons'; }
  else if (dist < nucleusR * 3 + 12) { lvl = 'NUCLEAR SCALE'; det = '≈ 10⁻¹⁵ m · protons & neutrons'; }
  else if (dist < 170) { lvl = 'ATOMIC SCALE'; det = '≈ 10⁻¹⁰ m · electron shells'; }
  else { lvl = 'OBSERVER'; det = 'a single atom adrift in the vacuum'; }
  const key = lvl + det;
  if (key !== lastHud) { lastHud = key; hudLevel.textContent = lvl; hudDetail.textContent = det; hud.classList.toggle('quark', quarkFade > 0.5); }
}

let last = performance.now(), simT = 0, started = false;
const approach = (cur, tgt, rate, dt) => cur + (tgt - cur) * Math.min(1, dt * rate);
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const rt = now / 1000;
  if (!state.paused) simT += dt * state.speed;

  vis.bohr = approach(vis.bohr, state.view === 'cloud' ? 0 : 1, 3, dt);
  vis.cloud = approach(vis.cloud, vis.cloudTarget, 3, dt);
  vis.paths = approach(vis.paths, toggles.paths ? 1 : 0, 5, dt);
  vis.trails = approach(vis.trails, toggles.trails ? 1 : 0, 5, dt);
  vis.labels = approach(vis.labels, toggles.labels ? 1 : 0, 5, dt);

  syncParticles(simT);
  stepNucleus(dt);
  const dist = camera.position.length();
  quarkFade = approach(quarkFade, 1 - THREE.MathUtils.smoothstep(dist, nucleusR + 2.5, nucleusR + 7), 4, dt);
  renderNucleus(simT, state.paused ? 0 : rt);
  updateElectrons(simT, dt);
  updateCloud(dt, rt);

  for (const f of flashes) {
    if (!f.visible) continue;
    f.userData.age += dt;
    const a = f.userData.age / 0.6;
    if (a >= 1) { f.visible = false; continue; }
    f.scale.setScalar(f.userData.size * (0.3 + a));
    f.material.opacity = (1 - a) * (1 - a);
  }

  if (tween.active) {
    tween.t += dt / tween.dur;
    const k = easeInOut(Math.min(1, tween.t));
    camera.position.lerpVectors(tween.p0, tween.p1, k);
    controls.target.lerpVectors(tween.t0, tween.t1, k);
    if (tween.t >= 1) tween.active = false;
  } else if (state.cinematic) {
    cineT += dt;
    const off = camera.position.clone().sub(controls.target);
    off.setLength(clamp(cineBase * (1 + 0.28 * Math.sin(cineT * 0.11)), controls.minDistance, controls.maxDistance));
    off.y = approach(off.y, Math.sin(cineT * 0.07) * off.length() * 0.35, 0.4, dt);
    camera.position.copy(controls.target).add(off);
  }
  controls.update();

  dust.rotation.y += dt * 0.006;
  nebulaMat.uniforms.time.value = rt;
  starMat.uniforms.time.value = rt;
  dustMat.uniforms.time.value = rt;
  finalPass.uniforms.time.value = rt;
  updateHud(dist);

  composer.render();
  if (!started) {
    started = true;
    $('loader').classList.add('done');
    setTimeout(() => { buildElement(6); }, 700);
  }
}

// redraw subshell labels once the web font has arrived
if (document.fonts) document.fonts.ready.then(() => {
  for (const k in labelCache) { labelCache[k].dispose(); delete labelCache[k]; }
  for (const r of rings.values()) r.text = '';
  lastAssignE = -1;
});

setView('bohr');
updateInfo(false);
requestAnimationFrame(frame);
})();
