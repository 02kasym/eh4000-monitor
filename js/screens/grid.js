// Сетка 2×4 ячеек для страниц мониторинга и воспроизведения.
import { esc } from '../ui.js';

const DASH = '---';
const show = (v) => (v === null || v === undefined ? DASH : esc(v));

const pct = (v, min, max) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, ((n - min) / (max - min)) * 100));
};

const barCell = (c) => {
  const p = pct(c.value ?? c.min, c.min, c.max);
  const zero = pct(0, c.min, c.max);
  const left = Math.min(zero, p);
  const width = Math.abs(p - zero);
  return `
    <div class="gauge">
      <div class="gauge__scale">
        <span>${esc(c.min)}</span>
        <span class="box" style="min-width:72px">${show(c.value)}</span>
        <span>${esc(c.unit)}</span>
        <span>${esc(c.max)}</span>
      </div>
      <div class="gauge__bar">
        <span class="box">${esc(c.lo)}</span>
        <div class="track">
          <div class="track__fill" style="left:${left}%;width:${width}%"></div>
          <div class="track__mark" style="left:calc(${p}% - 1px)"></div>
        </div>
        <span class="box">${esc(c.hi)}</span>
      </div>
    </div>`;
};

const body = (c) => {
  switch (c.kind) {
    case 'bar': return barCell(c);
    case 'sw': return `<span class="box box--sw${c.isOn ? ' box--on' : ''}">${c.isOn ? 'ВКЛ' : 'ВЫКЛ'}</span>`;
    case 'txt': return `<span class="box box--ready">${esc(c.value)}</span>`;
    default: return `<span class="box">${show(c.value)}</span>${c.unit ? `<span>${esc(c.unit)}</span>` : ''}`;
  }
};

const cell = (c) => {
  if (!c) return '<div class="cell cell--blank"><div class="cell__head"></div><div class="cell__body"></div></div>';
  return `<div class="cell"><div class="cell__head">${esc(c.label)}</div><div class="cell__body">${body(c)}</div></div>`;
};

/** Рисует сетку: левая колонка сверху вниз, затем правая. */
export const grid = (page) => `<div class="grid">${[...page.left, ...page.right].map(cell).join('')}</div>`;

/** Применяет «Сброс»: мин/макс становятся равны текущему значению. */
export const resetMinMax = (page) => {
  const fix = (c) => (c && c.kind === 'bar' ? { ...c, lo: c.value ?? 0, hi: c.value ?? 0 } : c);
  return { ...page, left: page.left.map(fix), right: page.right.map(fix) };
};
