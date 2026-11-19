// Главный экран. Разметка снята с фото монитора и переведена в координаты 800×600.
import { esc, clock } from '../ui.js';
import { pt, arc, ring, ticks, sector, needle } from './gauge-svg.js';
import { ICON } from './dash-icons.js';

export const FAULTS = [
  { code: '14404-007', text: 'Аварийный переключатель' },
  { code: '18412-003', text: 'Неиспр. датчика угла корпуса Высок.' },
];

const DIGITAL = {
  speed: '0.0', rpm: '---',
  left: [['ТемТранМасл(Л)', '-16', 'c'], ['ТемТранМасл(П)', '-16', 'c']],
  right: [['Т-раОхл.Жидк.Торм.', '-12', 'c'], ['ОтпусканиеСт.Торм.', '0.1', 'MPa']],
  small: [['---', 'kPa'], ['---', 'c'], ['-6', 'c'], ['0.0', 'MPa']],
};

const BLUE = '#1e9bff';
const RED = '#ff2a1a';
const NAVY = '#0b1658';

// ---------- спидометр ----------
const SPEEDO = { cx: 161, cy: 305, r: 150, a0: 225, sweep: 186, max: 80 };

const speedo = () => {
  const { cx, cy, r, a0, sweep, max } = SPEEDO;
  const ang = (v) => a0 + (v / max) * sweep;
  const nums = [0, 10, 20, 30, 40, 50, 60, 70, 80].map((v) => {
    const [x, y] = pt(cx, cy, v === 0 ? r * 0.66 : r * 0.81, ang(v) + (v === 0 ? -8 : 0));
    return `<text x="${x}" y="${y + 10}" class="dnum">${v}</text>`;
  }).join('');
  return `${ring(cx, cy, r, 7)}
    <path d="${arc(cx, cy, r * 0.57, ang(0), ang(75))}" stroke="${BLUE}" stroke-width="${r * 0.13}" fill="none"/>
    ${[10, 20, 30, 40, 50, 60, 70].map((v) => {
      const [x0, y0] = pt(cx, cy, r * 0.5, ang(v));
      const [x1, y1] = pt(cx, cy, r * 0.64, ang(v));
      return `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#0b1658" stroke-width="2"/>`;
    }).join('')}
    ${ticks({ cx, cy, rOut: r * 0.5, max: 75, step: 2.5, major: 10, ang, len: [6, 12] })}
    ${nums}
    <text x="${cx + r * 0.62}" y="${cy - r * 0.2}" class="dunit">km/h</text>
    ${needle(cx, cy, r * 0.74, ang(0), 7, 22)}`;
};

// ---------- тахометр ----------
const TACHO = { cx: 414, cy: 276, r: 118, a0: 210, sweep: 178, max: 25 };

const tacho = () => {
  const { cx, cy, r, a0, sweep, max } = TACHO;
  const ang = (v) => a0 + (v / max) * sweep;
  const nums = [0, 5, 10, 15, 20, 25].map((v) => {
    const [x, y] = pt(cx, cy, v === 0 ? r * 0.55 : r * 0.78, ang(v) + (v === 0 ? -14 : 0));
    return `<text x="${x}" y="${y + 10}" class="dnum">${v}</text>`;
  }).join('');
  return `${ring(cx, cy, r, 7)}
    ${sector(cx, cy, r * 0.6, r - 3, 96, 120, '#d9d9d9')}
    ${sector(cx, cy, r * 0.6, r - 3, 120, 144, '#d9d9d9')}
    ${sector(cx, cy, r * 0.6, r - 3, 144, 170, '#d9d9d9')}
    ${[['F', 108], ['N', 132], ['R', 157]].map(([t, a]) => {
      const [x, y] = pt(cx, cy, r * 0.8, a);
      return `<text x="${x}" y="${y + 11}" class="dgear">${t}</text>`;
    }).join('')}
    <path d="${arc(cx, cy, r * 0.52, ang(0), ang(20))}" stroke="#f2f2f2" stroke-width="4" fill="none"/>
    <path d="${arc(cx, cy, r * 0.52, ang(20), ang(23))}" stroke="${RED}" stroke-width="7" fill="none"/>
    ${ticks({ cx, cy, rOut: r * 0.52, max: 23, step: 1, major: 5, ang, len: [5, 9] })}
    ${nums}
    <text x="${cx + r * 0.62}" y="${cy - r * 0.22}" class="dunit dunit--sm">×100min<tspan dy="-7" font-size="9">-1</tspan></text>
    ${needle(cx, cy, r * 0.6, ang(0), 5, 10)}`;
};

// ---------- малые приборы ----------
// Углы по компасу (0° — вверх). Дуга и красные зоны сняты с фото каждого прибора.
// «L–H» (давление масла, гидравлика): дуга по верху, стрелка лежит у L слева.
// «C–H» (температуры): дуга от C снизу слева через верх, красная зона вверху справа.
const LH = { arc: [292, 432], scale: [300, 425], lo: [-0.62, 0.1], hi: [0.66, 0.14], icon: [-21, 0.26] };
const CH = { arc: [228, 400], scale: [262, 410], lo: [-0.5, 0.6], hi: [0.62, -0.18], icon: [-4, 0.08] };

const SMALL = [
  { cx: 346, kind: LH, lo: 'L', icon: ICON.oil, needle: 282, red: [[292, 308]] },
  { cx: 474, kind: CH, lo: 'C', icon: ICON.coolant, needle: 238, red: [[372, 400]] },
  { cx: 601, kind: CH, lo: 'C', icon: ICON.trans, needle: 238, red: [[372, 400]] },
  { cx: 729, kind: LH, lo: 'L', icon: ICON.hyd, needle: 284, red: [[292, 306], [418, 432]] },
];

const ICON_SCALE = 0.95;

const smallGauges = () => SMALL.map(({ cx, kind, lo, icon, needle: at, red }) => {
  const cy = 447, r = 57;
  const [s0, s1] = kind.scale;
  const tickAng = (v) => s0 + (v / 10) * (s1 - s0);
  return `${ring(cx, cy, r, 6)}
    <path d="${arc(cx, cy, r * 0.8, kind.arc[0], kind.arc[1])}" stroke="${BLUE}" stroke-width="9" fill="none"/>
    ${red.map(([a0, a1]) => `<path d="${arc(cx, cy, r * 0.8, a0, a1)}" stroke="${RED}" stroke-width="9" fill="none"/>`).join('')}
    <path d="${arc(cx, cy, r * 0.52, s0, s1)}" stroke="#d8d8d8" stroke-width="1.5" fill="none"/>
    ${ticks({ cx, cy, rOut: r * 0.52, max: 10, step: 1, major: 5, ang: tickAng, len: [4, 4] })}
    <text x="${cx + r * kind.lo[0]}" y="${cy + r * kind.lo[1] + 7}" class="dsmall">${lo}</text>
    <text x="${cx + r * kind.hi[0]}" y="${cy + r * kind.hi[1] + 7}" class="dsmall">H</text>
    <g transform="translate(${cx + kind.icon[0]} ${cy + r * kind.icon[1]}) scale(${ICON_SCALE})">${icon}</g>
    ${needle(cx, cy, r * 0.74, at, 5, 3)}`;
}).join('');

// ---------- груз и топливо ----------
const loadAndFuel = () => {
  const level = 0.92;
  const top = 238, bot = 365, l = 700, rgt = 762;
  const yTop = bot - (bot - top) * level;
  return `
    <rect x="563" y="226" width="107" height="147" fill="#000" stroke="#2c48c8" stroke-width="1.5"/>
    <path d="M585 238 h56 l7 -4 v52 l-7 4 h-56 z" fill="#f0f0f0"/>
    <line x1="585" y1="262" x2="641" y2="262" stroke="#9a9a9a" stroke-width="2"/>
    <path d="M641 238 l7 -4 v52 l-7 4" fill="#c9c9c9"/>
    <rect x="573" y="297" width="87" height="36" fill="#3c3c3c" stroke="#9a9a9a"/>
    <text x="647" y="325" class="dbig" text-anchor="end">0 t</text>
    <g transform="translate(596 339)">${ICON.load}</g>
    <rect x="677" y="226" width="113" height="147" fill="#000" stroke="#2c48c8" stroke-width="1.5"/>
    <rect x="690" y="242" width="7" height="${bot - 242}" fill="${BLUE}"/>
    <rect x="690" y="${bot - 14}" width="7" height="14" fill="${RED}"/>
    <path d="M${l} ${bot} V${yTop + 4} H${l + 18} Q${l + 46} ${yTop + 2} ${rgt} ${top} V${top + 4} Q${l + 50} ${bot - 50} ${l + 30} ${bot} Z" fill="#33cfff"/>
    ${[1, 2, 3, 4, 5, 6].map((i) => `<line x1="${l}" x2="${l + 40}" y1="${bot - i * 18}" y2="${bot - i * 18}" stroke="#000" stroke-width="2"/>`).join('')}
    <text x="769" y="257" class="dsmall" text-anchor="middle">F</text>
    <text x="736" y="364" class="dsmall" text-anchor="middle">E</text>
    <g transform="translate(750 330)">${ICON.fuel}</g>`;
};

// ---------- верх: модель, поворотники, моточасы, лампы, слоты ----------
const slots = () => {
  let out = '';
  const x0 = 11, w = 773, cols = 14, gap = 3, cw = (w - gap * (cols - 1)) / cols;
  for (let row = 0; row < 2; row++) {
    for (let c = 0; c < cols; c++) {
      if (row === 0 && c > 5 && c < 9) continue;
      const span = row === 0 && c === 5 ? 4 : 1;
      out += `<rect x="${(x0 + c * (cw + gap)).toFixed(1)}" y="${52 + row * 52}" width="${(cw * span + gap * (span - 1)).toFixed(1)}" height="46" fill="#000" stroke="#2c48c8" stroke-width="1.2"/>`;
    }
  }
  return out;
};

const lamps = () => [ICON.retarder, ICON.workLight, ICON.headlight].map((ic, i) => {
  const x = 564 + i * 60;
  return `<rect x="${x}" y="171" width="53" height="48" rx="3" fill="#19dd33" stroke="#7dff8e" stroke-width="2"/>
    <g transform="translate(${x + 4} ${173})">${ic}</g>`;
}).join('');

const header = (blink) => `
  <rect x="0" y="0" width="800" height="47" fill="${NAVY}"/>
  <g transform="translate(10 12)">${ICON.truck}</g>
  <text x="56" y="34" class="dhead">EH4000AC-3</text>
  <g opacity="${blink ? 1 : 0.12}">
    <g transform="translate(276 8)">${ICON.arrowL}</g><g transform="translate(474 8)">${ICON.arrowR}</g>
  </g>
  <g transform="translate(626 12)">${ICON.hourmeter}</g>
  <text x="790" y="34" class="dhead" text-anchor="end">000007.8 h</text>`;

// ---------- низ: полоса груза, неисправность, часы, меню, температура ----------
const footer = (f) => `
  <g transform="translate(6 474)">${ICON.dump}</g>
  <rect x="42" y="472" width="242" height="36" fill="#000" stroke="#2c48c8"/>
  <rect x="44" y="476" width="222" height="4" fill="${BLUE}"/><rect x="268" y="476" width="12" height="4" fill="${RED}"/>
  <rect x="44" y="483" width="236" height="22" fill="#fff"/>
  <rect x="6" y="515" width="788" height="28" fill="#000" stroke="#555"/>
  <line x1="106" y1="515" x2="106" y2="543" stroke="#555"/><line x1="221" y1="515" x2="221" y2="543" stroke="#555"/>
  <text x="164" y="536" class="dfault" text-anchor="middle">${esc(f.code)}</text>
  <text x="243" y="536" class="dfault">${esc(f.text)}</text>
  <path d="M7 551 H108 a14 14 0 0 1 14 14 V578 a14 14 0 0 1 -14 14 H7 Z" fill="#000" stroke="#e8e8e8" stroke-width="2"/>
  <text x="64" y="583" class="dclock" text-anchor="middle">${clock().replace(':', ' ')}</text>
  <text x="178" y="578" class="dlabel">Ав. сигн.</text>
  <rect x="446" y="551" width="42" height="40" fill="${NAVY}" stroke="#5a6bb8"/>
  <circle cx="467" cy="571" r="11" fill="none" stroke="#19dd33" stroke-width="4"/>
  <text x="498" y="579" class="dlabel">Меню</text>
  <rect x="697" y="551" width="95" height="40" rx="3" fill="#000" stroke="#e8e8e8" stroke-width="2"/>
  <g transform="translate(704 558)">${ICON.thermo}</g>
  <text x="784" y="580" class="dclock" text-anchor="end" style="font-size:20px">-12 °C</text>`;

// ---------- спидометр: табло ВЫКЛ и одометр ----------
const odometer = () => `
  <rect x="146" y="343" width="125" height="28" fill="#3c3c3c" stroke="#8a8a8a"/>
  <text x="208" y="364" class="dodo" text-anchor="middle">ВЫКЛ</text>
  <rect x="146" y="375" width="125" height="28" fill="#3c3c3c" stroke="#8a8a8a"/>
  <text x="208" y="396" class="dodo" text-anchor="middle">000001.6 km</text>`;

const digital = () => {
  const row = ([l, v, u]) => `<tr><td>${esc(l)}</td><td>${esc(v)}</td><td>${esc(u)}</td></tr>`;
  const small = DIGITAL.small
    .map(([v, u], i) => `<div class="dig" style="left:${SMALL[i].cx - 40}px;top:487px;width:80px">${esc(v)} ${esc(u)}</div>`)
    .join('');
  return `
    <div class="dig" style="left:200px;top:290px;width:58px">${DIGITAL.speed}</div>
    <div class="dig" style="left:452px;top:262px;width:52px">${DIGITAL.rpm}</div>
    <table class="dig-table" style="left:20px;top:410px">${DIGITAL.left.map(row).join('')}</table>
    <table class="dig-table" style="left:563px;top:378px">${DIGITAL.right.map(row).join('')}</table>
    ${small}`;
};

/** @param {{ faultIdx: number, isDigital: boolean, blink: boolean }} st */
export const renderDashboard = (st) => `
  <svg class="dash-svg" viewBox="0 0 800 600" aria-hidden="true">
    <style>
      .dnum{font:700 28px Arial,Helvetica,sans-serif;fill:#fff;text-anchor:middle}
      .dunit{font:700 17px Arial,Helvetica,sans-serif;fill:#fff;text-anchor:middle}
      .dunit--sm{font-size:15px}
      .dgear{font:700 28px Arial,Helvetica,sans-serif;fill:#555;text-anchor:middle}
      .dsmall{font:700 17px Arial,Helvetica,sans-serif;fill:#fff;text-anchor:middle}
      .dbig{font:700 30px Arial,Helvetica,sans-serif;fill:#fff}
      .dodo{font:400 17px Arial,Helvetica,sans-serif;fill:#fff}
      .dhead{font:700 22px var(--font-screen);fill:#fff}
      .dfault{font:400 17px var(--font-screen);fill:#fff}
      .dclock{font:700 28px Arial,Helvetica,sans-serif;fill:#fff}
      .dlabel{font:700 17px var(--font-screen);fill:#fff}
    </style>
    ${header(st.blink)}${slots()}${lamps()}${loadAndFuel()}
    ${speedo()}${odometer()}${tacho()}${smallGauges()}
    ${footer(FAULTS[st.faultIdx])}
  </svg>
  ${st.isDigital ? digital() : ''}`;
