// SVG-примитивы для циферблатов. Углы — по компасу: 0° вверх, по часовой.

export const pt = (cx, cy, r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [+(cx + r * Math.cos(a)).toFixed(1), +(cy + r * Math.sin(a)).toFixed(1)];
};

export const arc = (cx, cy, r, a0, a1) => {
  const [x0, y0] = pt(cx, cy, r, a0);
  const [x1, y1] = pt(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${x0} ${y0} A${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
};

/** Чёрный циферблат с белой рамкой. */
export const ring = (cx, cy, r, w = 7) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#000" stroke="#f2f2f2" stroke-width="${w}"/>`;

/** Деления шкалы. */
export const ticks = ({ cx, cy, rOut, max, step, major, ang, len: [minor, big], inward = true }) => {
  let out = '';
  for (let v = 0; v <= max; v += step) {
    const isMajor = v % major === 0;
    const l = isMajor ? big : minor;
    const [x0, y0] = pt(cx, cy, rOut, ang(v));
    const [x1, y1] = pt(cx, cy, inward ? rOut - l : rOut + l, ang(v));
    out += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#fff" stroke-width="${isMajor ? 3 : 1.6}"/>`;
  }
  return out;
};

export const sector = (cx, cy, r0, r1, a0, a1, fill) => {
  const [ax, ay] = pt(cx, cy, r1, a0);
  const [bx, by] = pt(cx, cy, r1, a1);
  const [c1, d1] = pt(cx, cy, r0, a1);
  const [ex, ey] = pt(cx, cy, r0, a0);
  return `<path d="M${ax} ${ay} A${r1} ${r1} 0 0 1 ${bx} ${by} L${c1} ${d1} A${r0} ${r0} 0 0 0 ${ex} ${ey}Z" fill="${fill}" stroke="#000" stroke-width="3"/>`;
};

/** Стрелка: оранжевая полоса с жёлтой серединой и коротким хвостом за центром. */
export const needle = (cx, cy, len, deg, w = 6, tail = 0) => {
  const [tx, ty] = pt(cx, cy, len, deg);
  const [bx, by] = pt(cx, cy, tail, deg + 180);
  return `<line x1="${bx}" y1="${by}" x2="${tx}" y2="${ty}" stroke="#ff4a10" stroke-width="${w}" stroke-linecap="round"/>
    <line x1="${bx}" y1="${by}" x2="${tx}" y2="${ty}" stroke="#ffb22a" stroke-width="${Math.max(1, w * 0.35)}" stroke-linecap="round"/>`;
};
