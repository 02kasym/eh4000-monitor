// Главный экран: спидометр, тахометр, лампы, строка неисправностей.
import { esc, clock, hints } from '../ui.js';

export const FAULTS = [
  { code: '14404-007', text: 'Аварийный переключатель', type: 'Ав. сигн.' },
  { code: '18412-003', text: 'Неиспр. датчика угла корпуса Высок.', type: 'Неисправн.' },
];

const DIGITAL = {
  speed: '0.0', rpm: '---',
  left: [['ТемТранМасл(Л)', '-16', 'c'], ['ТемТранМасл(П)', '-16', 'c']],
  right: [['Т-раОхл.Жидк.Торм.', '-12', 'c'], ['ОтпусканиеСт.Торм.', '0.1', 'MPa']],
  small: [['---', 'kPa'], ['---', 'c'], ['-6', 'c'], ['0.0', 'MPa']],
};

// Угол по компасу (0° = вверх, по часовой) -> точка
const pt = (cx, cy, r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};

const arc = (cx, cy, r, a0, a1) => {
  const [x0, y0] = pt(cx, cy, r, a0);
  const [x1, y1] = pt(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
};

const sector = (cx, cy, r0, r1, a0, a1, fill) => {
  const [ax, ay] = pt(cx, cy, r1, a0);
  const [bx, by] = pt(cx, cy, r1, a1);
  const [c1, d1] = pt(cx, cy, r0, a1);
  const [ex, ey] = pt(cx, cy, r0, a0);
  return `<path d="M${ax} ${ay} A${r1} ${r1} 0 0 1 ${bx} ${by} L${c1} ${d1} A${r0} ${r0} 0 0 0 ${ex} ${ey}Z" fill="${fill}" stroke="#c9cfe0" stroke-width="1.5"/>`;
};

const needle = (cx, cy, len, deg, w = 6) => {
  const [x, y] = pt(cx, cy, len, deg);
  const [bx, by] = pt(cx, cy, 14, deg + 180);
  return `<line x1="${bx}" y1="${by}" x2="${x}" y2="${y}" stroke="#ff6a2b" stroke-width="${w}" stroke-linecap="round"/>`;
};

const dial = (cx, cy, r) =>
  `<circle cx="${cx}" cy="${cy}" r="${r + 6}" fill="#c5cad6"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#dialBg)"/>`;

const speedo = () => {
  const cx = 200, cy = 330, r = 142, a0 = 225, sweep = 180;
  const ang = (v) => a0 + (v / 80) * sweep;
  let ticks = '';
  for (let v = 0; v <= 80; v += 2) {
    const major = v % 10 === 0;
    const [x0, y0] = pt(cx, cy, r - 14, ang(v));
    const [x1, y1] = pt(cx, cy, r - (major ? 34 : 24), ang(v));
    ticks += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#c9cfe0" stroke-width="${major ? 3 : 1.5}"/>`;
    if (major) {
      const [tx, ty] = pt(cx, cy, r - 56, ang(v));
      ticks += `<text x="${tx}" y="${ty + 9}" class="dnum">${v}</text>`;
    }
  }
  return `${dial(cx, cy, r)}
    <path d="${arc(cx, cy, r - 18, a0, a0 + sweep)}" stroke="#7f8796" stroke-width="12" fill="none"/>
    ${ticks}
    <text x="${cx + 75}" y="${cy - 26}" class="dunit">km/h</text>
    ${needle(cx, cy, r - 40, ang(0))}
    <circle cx="${cx}" cy="${cy}" r="10" fill="#2a3150"/>`;
};

const tacho = () => {
  const cx = 430, cy = 295, r = 112, a0 = 210, sweep = 180;
  const ang = (v) => a0 + (v / 25) * sweep;
  let ticks = '';
  for (let v = 0; v <= 25; v += 1) {
    const major = v % 5 === 0;
    const [x0, y0] = pt(cx, cy, r - 10, ang(v));
    const [x1, y1] = pt(cx, cy, r - (major ? 26 : 18), ang(v));
    ticks += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#c9cfe0" stroke-width="${major ? 3 : 1.5}"/>`;
    if (major) {
      const [tx, ty] = pt(cx, cy, r - 44, ang(v));
      ticks += `<text x="${tx}" y="${ty + 9}" class="dnum">${v}</text>`;
    }
  }
  return `${dial(cx, cy, r)}
    <path d="${arc(cx, cy, r - 14, ang(4), ang(21))}" stroke="#3fd04a" stroke-width="7" fill="none"/>
    <path d="${arc(cx, cy, r - 14, ang(22), ang(25))}" stroke="#e5463a" stroke-width="7" fill="none"/>
    ${ticks}
    <text x="${cx + 50}" y="${cy - 22}" class="dunit">×100min⁻¹</text>
    ${sector(cx, cy, 58, 104, 100, 122, 'rgba(120,130,160,.6)')}
    ${sector(cx, cy, 58, 104, 124, 146, '#3fc94a')}
    ${sector(cx, cy, 58, 104, 148, 170, 'rgba(120,130,160,.6)')}
    <text x="${pt(cx, cy, 82, 111)[0]}" y="${pt(cx, cy, 82, 111)[1] + 8}" class="dgear">F</text>
    <text x="${pt(cx, cy, 82, 135)[0]}" y="${pt(cx, cy, 82, 135)[1] + 8}" class="dgear" fill="#063">N</text>
    <text x="${pt(cx, cy, 82, 159)[0]}" y="${pt(cx, cy, 82, 159)[1] + 8}" class="dgear">R</text>
    ${needle(cx, cy, r - 30, ang(0), 5)}
    <circle cx="${cx}" cy="${cy}" r="8" fill="#2a3150"/>`;
};

const SMALL = [
  { cx: 368, lo: 'L', hi: 'H', icon: '⛽', at: 0.25, red: false },
  { cx: 483, lo: 'C', hi: 'H', icon: '🌡', at: 0.1, red: false },
  { cx: 598, lo: 'C', hi: 'H', icon: '⚙', at: 0.12, red: true },
  { cx: 713, lo: 'L', hi: 'H', icon: '⚙', at: 0.2, red: true },
];

const smallGauges = () => SMALL.map(({ cx, lo, hi, at, red }) => {
  const cy = 452, r = 48, a0 = 250, sweep = 150;
  return `${dial(cx, cy, r)}
    <path d="${arc(cx, cy, r - 8, a0, a0 + sweep * 0.78)}" stroke="#3fd04a" stroke-width="6" fill="none"/>
    <path d="${arc(cx, cy, r - 8, a0 + sweep * 0.8, a0 + sweep)}" stroke="#e5463a" stroke-width="6" fill="none"/>
    ${red ? `<path d="${arc(cx, cy, r - 8, a0, a0 + sweep * 0.2)}" stroke="#e5463a" stroke-width="6" fill="none"/>` : ''}
    <text x="${cx - 30}" y="${cy + 4}" class="dsmall">${lo}</text>
    <text x="${cx + 30}" y="${cy + 4}" class="dsmall">${hi}</text>
    <circle cx="${cx}" cy="${cy + 20}" r="9" fill="none" stroke="#c9cfe0" stroke-width="2"/>
    ${needle(cx, cy, r - 14, a0 + sweep * at, 3)}`;
}).join('');

const fuelAndLoad = () => {
  let bars = '';
  for (let i = 0; i < 7; i++) {
    const y = 370 - i * 14;
    const w = 14 + i * 4;
    const fill = i === 0 ? '#e5463a' : i < 5 ? '#3fd04a' : '#2b3566';
    bars += `<rect x="700" y="${y}" width="${w}" height="11" fill="${fill}" stroke="#7d88b8"/>`;
  }
  return `${bars}
    <text x="762" y="285" class="dsmall">F</text><text x="738" y="384" class="dsmall">E</text>
    <rect x="588" y="262" width="58" height="22" fill="#9aa1b4"/><rect x="588" y="287" width="58" height="22" fill="#9aa1b4"/>
    <rect x="578" y="318" width="74" height="30" fill="#2b3566" stroke="#c9cfe0"/>
    <text x="640" y="342" class="dbig" text-anchor="end">0 t</text>
    <rect x="58" y="488" width="250" height="16" fill="#e8ebf2"/>
    <rect x="58" y="482" width="230" height="3" fill="#3fd04a"/><rect x="288" y="482" width="20" height="3" fill="#e5463a"/>`;
};

const digital = () => {
  const row = ([l, v, u]) => `<tr><td>${esc(l)}</td><td>${esc(v)}</td><td>${esc(u)}</td></tr>`;
  const small = DIGITAL.small
    .map(([v, u], i) => `<div class="dig" style="left:${SMALL[i].cx - 40}px;top:492px;width:80px">${esc(v)} ${esc(u)}</div>`)
    .join('');
  return `
    <div class="dig" style="left:232px;top:300px;width:58px">${DIGITAL.speed}</div>
    <div class="dig" style="left:478px;top:276px;width:52px">${DIGITAL.rpm}</div>
    <table class="dig-table" style="left:56px;top:430px">${DIGITAL.left.map(row).join('')}</table>
    <table class="dig-table" style="left:510px;top:400px">${DIGITAL.right.map(row).join('')}</table>
    ${small}`;
};

const LAMP_BATT = '<svg viewBox="0 0 34 30"><rect x="3" y="8" width="28" height="18" rx="2" fill="none" stroke="#fff" stroke-width="2.5"/><path d="M8 5h5M21 5h5M9 17h6M24 14v6M21 17h6" stroke="#fff" stroke-width="2.5"/></svg>';
const LAMP_PARK = '<svg viewBox="0 0 34 30"><circle cx="17" cy="15" r="12" fill="none" stroke="#fff" stroke-width="2.5"/><text x="17" y="21" text-anchor="middle" font-size="16" font-weight="700" fill="#fff">P</text></svg>';

const slots = () => {
  const cells = Array.from({ length: 28 }, (_, i) => {
    if (i === 14) return `<div class="slot"><span class="lamp">${LAMP_BATT}</span></div>`;
    if (i === 23) return `<div class="slot"><span class="lamp">${LAMP_PARK}</span></div>`;
    return '<div class="slot"></div>';
  });
  return `<div class="slots">${cells.join('')}</div>`;
};

/** @param {{ faultIdx: number, isDigital: boolean, hasCaution: boolean }} st */
export const renderDashboard = (st) => {
  const f = FAULTS[st.faultIdx];
  return `
    <div class="dash-model">🚛 EH4000AC-3</div>
    <div class="dash-hours">⏱ 000007.8 h</div>
    ${slots()}
    ${st.hasCaution ? '<div class="caution">⚠ CAUTION</div>' : ''}
    <svg class="dash-svg" viewBox="0 0 800 600" aria-hidden="true">
      <defs>
        <radialGradient id="dialBg" cx="50%" cy="45%" r="60%">
          <stop offset="0" stop-color="#2a3a8a"/><stop offset="1" stop-color="#0d1545"/>
        </radialGradient>
        <style>
          .dnum{font:600 26px var(--font-ui);fill:#fff;text-anchor:middle}
          .dunit{font:15px var(--font-ui);fill:#fff;text-anchor:middle}
          .dgear{font:700 22px var(--font-ui);fill:#dfe3ee;text-anchor:middle}
          .dsmall{font:700 14px var(--font-ui);fill:#fff;text-anchor:middle}
          .dbig{font:28px var(--font-screen);fill:#fff}
        </style>
      </defs>
      ${speedo()}${tacho()}${smallGauges()}${fuelAndLoad()}
      <rect x="168" y="372" width="102" height="24" fill="#2b3566" stroke="#c9cfe0"/>
      <text x="219" y="390" class="dunit">ВЫКЛ</text>
      <rect x="160" y="398" width="118" height="26" fill="#2b3566" stroke="#c9cfe0"/>
      <text x="219" y="417" class="dunit" style="font-family:var(--font-screen);font-size:17px">000001.6 km</text>
    </svg>
    ${st.isDigital ? digital() : ''}
    <div class="dash-fault"><b>${esc(f.code)}</b><span>${esc(f.text)}</span></div>
    <div class="dash-bottom">
      <span class="dash-clock">${clock()}</span>
      <span><span class="alarm-arrow">◀</span> Ав. сигн.</span>
      <span><span class="alarm-arrow">▶</span> Неисправн.</span>
      ${hints([['o', 'Меню']]).replace('class="s-hints"', 'class="s-hints" style="position:static"')}
      <span class="dash-temp">🌡 -12°C</span>
    </div>`;
};
