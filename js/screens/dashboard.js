// Главный экран: дизайн по фото (чёрные циферблаты, синие шкалы, синий фон).
import { esc, clock, hints } from '../ui.js';
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

const BLUE = '#1fa3ff';
const RED = '#ff3b2f';

const speedo = () => {
  const cx = 168, cy = 322, r = 150, a0 = 225, sweep = 180;
  const ang = (v) => a0 + (v / 80) * sweep;
  return `${ring(cx, cy, r)}
    <path d="${arc(cx, cy, r - 50, ang(0), ang(75))}" stroke="${BLUE}" stroke-width="14" fill="none"/>
    ${ticks({ cx, cy, rOut: r - 52, max: 80, step: 2, major: 10, ang, len: [8, 16] })}
    ${[0, 10, 20, 30, 40, 50, 60, 70, 80].map((v) => {
      const [x, y] = pt(cx, cy, r - 26, ang(v) - (v === 0 ? 6 : 0));
      return `<text x="${x}" y="${y + 9}" class="dnum">${v}</text>`;
    }).join('')}
    <text x="${cx + 84}" y="${cy - 10}" class="dunit">km/h</text>
    ${needle(cx, cy, r - 66, ang(0), 8)}`;
};

const tacho = () => {
  const cx = 410, cy = 288, r = 118, a0 = 210, sweep = 180;
  const ang = (v) => a0 + (v / 25) * sweep;
  return `${ring(cx, cy, r)}
    <path d="${arc(cx, cy, r - 40, ang(0), ang(20))}" stroke="#e8e8e8" stroke-width="4" fill="none"/>
    <path d="${arc(cx, cy, r - 40, ang(20), ang(22))}" stroke="${RED}" stroke-width="6" fill="none"/>
    ${ticks({ cx, cy, rOut: r - 40, max: 25, step: 1, major: 5, ang, len: [6, 10], inward: true })}
    ${[0, 5, 10, 15, 20, 25].map((v) => {
      const [x, y] = pt(cx, cy, r - 22, ang(v));
      return `<text x="${x}" y="${y + 9}" class="dnum">${v}</text>`;
    }).join('')}
    <text x="${cx + 50}" y="${cy - 22}" class="dunit">×100min⁻¹</text>
    ${sector(cx, cy, 70, 114, 98, 120, '#bdbdbd')}
    ${sector(cx, cy, 70, 114, 122, 144, '#bdbdbd')}
    ${sector(cx, cy, 70, 114, 146, 168, '#bdbdbd')}
    ${[['F', 109], ['N', 133], ['R', 157]].map(([t, a]) => {
      const [x, y] = pt(cx, cy, 92, a);
      return `<text x="${x}" y="${y + 9}" class="dgear">${t}</text>`;
    }).join('')}
    ${needle(cx, cy, r - 50, ang(0), 6)}`;
};

const SMALL = [
  { cx: 345, lo: 'L', hi: 'H', icon: ICON.oil, at: 0.12, redLo: true },
  { cx: 470, lo: 'C', hi: 'H', icon: ICON.coolant, at: 0.1, redLo: false },
  { cx: 594, lo: 'C', hi: 'H', icon: ICON.trans, at: 0.1, redLo: false },
  { cx: 718, lo: 'L', hi: 'H', icon: ICON.hyd, at: 0.08, redLo: true },
];

const smallGauges = () => SMALL.map(({ cx, lo, hi, icon, at, redLo }) => {
  const cy = 456, r = 56, a0 = 255, sweep = 135;
  return `${ring(cx, cy, r, 5)}
    <path d="${arc(cx, cy, r - 10, a0, a0 + sweep * 0.85)}" stroke="${BLUE}" stroke-width="7" fill="none"/>
    <path d="${arc(cx, cy, r - 10, a0 + sweep * 0.85, a0 + sweep)}" stroke="${RED}" stroke-width="7" fill="none"/>
    ${redLo ? `<path d="${arc(cx, cy, r - 10, a0, a0 + sweep * 0.1)}" stroke="${RED}" stroke-width="7" fill="none"/>` : ''}
    <text x="${cx - 30}" y="${cy + 18}" class="dsmall">${lo}</text>
    <text x="${cx + 34}" y="${cy + 2}" class="dsmall">${hi}</text>
    <g transform="translate(${cx - 4} ${cy + 18})">${icon}</g>
    ${needle(cx, cy + 6, r - 18, a0 + sweep * at, 3)}`;
}).join('');

const loadAndFuel = () => {
  const fuelLevel = 0.82;
  const top = 250, bot = 382, left = 676, right = 762;
  const yTop = bot - (bot - top) * fuelLevel;
  return `
    <rect x="556" y="246" width="104" height="138" fill="#000" stroke="#2840c0"/>
    <rect x="580" y="252" width="56" height="30" fill="#eeeeee"/><rect x="580" y="283" width="56" height="30" fill="#e2e2e2"/>
    <rect x="566" y="318" width="84" height="30" fill="#000" stroke="#bdbdbd" stroke-width="2"/>
    <text x="640" y="342" class="dbig" text-anchor="end">0 t</text>
    <g transform="translate(590 352)">${ICON.load}</g>
    <rect x="668" y="246" width="102" height="138" fill="#000" stroke="#2840c0"/>
    <path d="M${left} ${bot} L${left} ${yTop} Q${left + 40} ${yTop + 6} ${right - 8} ${top} L${left + 22} ${bot} Z" fill="#2ad4ff"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<line x1="${left}" x2="${left + 30}" y1="${bot - 20 - i * 20}" y2="${bot - 20 - i * 20}" stroke="#000" stroke-width="2"/>`).join('')}
    <rect x="${left}" y="${bot - 12}" width="5" height="12" fill="${RED}"/>
    <text x="${right}" y="${top + 16}" class="dsmall" text-anchor="end">F</text>
    <text x="${left + 34}" y="${bot}" class="dsmall">E</text>
    <g transform="translate(${right - 26} ${bot - 30})">${ICON.fuel}</g>`;
};

const lamps = () => `
  <rect x="558" y="190" width="48" height="44" fill="#14d12e" rx="3"/><g transform="translate(560 192)">${ICON.retarder}</g>
  <rect x="612" y="190" width="48" height="44" fill="#14d12e" rx="3"/><g transform="translate(614 192)">${ICON.workLight}</g>
  <rect x="666" y="190" width="48" height="44" fill="#14d12e" rx="3"/><g transform="translate(668 192)">${ICON.headlight}</g>`;

const slotsSvg = () => {
  let out = '';
  const x0 = 12, w = 776, cols = 14, gap = 4, cw = (w - gap * (cols - 1)) / cols;
  for (let row = 0; row < 2; row++) {
    for (let c = 0; c < cols; c++) {
      if (row === 0 && c > 5 && c < 9) continue;
      const span = row === 0 && c === 5 ? 4 : 1;
      out += `<rect x="${x0 + c * (cw + gap)}" y="${46 + row * 44}" width="${cw * span + gap * (span - 1)}" height="40" fill="#000" stroke="#1a2a8a"/>`;
    }
  }
  return out;
};

const digital = () => {
  const row = ([l, v, u]) => `<tr><td>${esc(l)}</td><td>${esc(v)}</td><td>${esc(u)}</td></tr>`;
  const small = DIGITAL.small
    .map(([v, u], i) => `<div class="dig" style="left:${SMALL[i].cx - 40}px;top:500px;width:80px">${esc(v)} ${esc(u)}</div>`)
    .join('');
  return `
    <div class="dig" style="left:206px;top:290px;width:58px">${DIGITAL.speed}</div>
    <div class="dig" style="left:452px;top:262px;width:52px">${DIGITAL.rpm}</div>
    <table class="dig-table" style="left:40px;top:420px">${DIGITAL.left.map(row).join('')}</table>
    <table class="dig-table" style="left:556px;top:388px">${DIGITAL.right.map(row).join('')}</table>
    ${small}`;
};

/** @param {{ faultIdx: number, isDigital: boolean, blink: boolean }} st */
export const renderDashboard = (st) => {
  const f = FAULTS[st.faultIdx];
  return `
    <svg class="dash-svg" viewBox="0 0 800 600" aria-hidden="true">
      <style>
        .dnum{font:700 28px var(--font-ui);fill:#fff;text-anchor:middle}
        .dunit{font:700 16px var(--font-ui);fill:#fff;text-anchor:middle}
        .dgear{font:700 26px var(--font-ui);fill:#fff;text-anchor:middle}
        .dsmall{font:700 16px var(--font-ui);fill:#fff;text-anchor:middle}
        .dbig{font:700 28px var(--font-screen);fill:#fff}
      </style>
      ${slotsSvg()}
      <g opacity="${st.blink ? 1 : 0.15}">
        <g transform="translate(300 8)">${ICON.arrowL}</g><g transform="translate(470 8)">${ICON.arrowR}</g>
      </g>
      ${lamps()}${loadAndFuel()}${smallGauges()}${speedo()}${tacho()}
      <rect x="132" y="372" width="118" height="26" fill="#3a3a3a" stroke="#cfcfcf"/>
      <text x="191" y="391" class="dunit">ВЫКЛ</text>
      <rect x="126" y="402" width="130" height="28" fill="#3a3a3a" stroke="#cfcfcf"/>
      <text x="191" y="422" class="dunit" style="font-family:var(--font-screen);font-size:17px">000001.6 km</text>
      <g transform="translate(14 472)">${ICON.dump}</g>
      <rect x="52" y="472" width="250" height="4" fill="${BLUE}"/><rect x="290" y="472" width="12" height="4" fill="${RED}"/>
      <rect x="52" y="480" width="250" height="22" fill="#fff"/>
    </svg>
    <div class="dash-model">${ICON.truck}<span>EH4000AC-3</span></div>
    <div class="dash-hours">${ICON.hourmeter}<span>000007.8 h</span></div>
    ${st.isDigital ? digital() : ''}
    <div class="dash-fault"><b>${esc(f.code)}</b><span>${esc(f.text)}</span></div>
    <div class="dash-bottom">
      <span class="dash-clock">${clock().replace(':', ' ')}</span>
      <span class="dash-alarm"><span class="alarm-arrow">◀</span> Ав. сигн. <span class="alarm-arrow">▶</span></span>
      ${hints([['o', 'Меню']]).replace('class="s-hints"', 'class="s-hints dash-menu"')}
      <span class="dash-temp">${ICON.thermo}<span>-12 °C</span></span>
    </div>`;
};
