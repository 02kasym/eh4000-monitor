// Схема «Привод перем.тока» (меню сервиса → первый пункт). Координаты сняты с фото экрана.
import { esc, clock, hints } from '../ui.js';

const tag = (x, y, w, t) => `<div class="ac-tag" style="left:${x}px;top:${y}px;width:${w}px">${esc(t)}</div>`;
const lbl = (x, y, t, cls = '') => `<div class="ac-lbl ${cls}" style="left:${x}px;top:${y}px">${esc(t)}</div>`;

/** Белое поле значения + единица справа. */
const box = (x, y, w, val, unit = '', unitCls = '') =>
  `<div class="ac-val" style="left:${x}px;top:${y}px;width:${w}px">${esc(val)}</div>` +
  (unit ? `<div class="ac-unit ${unitCls}" style="left:${x + w + 3}px;top:${y + 1}px">${esc(unit)}</div>` : '');

const motor = (cx, cy, side) =>
  `<div class="ac-motor" style="left:${cx - 36}px;top:${cy - 36}px">Мотор<br>${side}</div>`;

/** Инвертор/преобразователь: плашка, Ток, Темп. */
const branch = (y, name, amps, temp) => `
  ${tag(392, y, 81, name)}
  ${lbl(393, y + 31, 'Ток')}${box(463, y + 30, 68, amps, 'A')}
  ${lbl(393, y + 59, 'Темп.')}${box(463, y + 58, 68, temp, 'C')}`;

/** Данные мотора: скорость, температура и две температуры подшипников. */
const motorData = (y, d) => `
  ${lbl(633, y - 23, 'Скор.')}${box(691, y - 24, 69, d.spd, 'km/h')}
  ${lbl(633, y + 5, 'Темп.')}${box(691, y + 4, 69, d.t, 'C')}
  ${lbl(555, y + 45, 'Т.вент.пдш.', 'ac-lbl--red')}${box(690, y + 44, 69, d.b1, 'C')}
  ${lbl(555, y + 73, 'Т.вент.пдш.', 'ac-lbl--red')}${box(690, y + 72, 69, d.b2, 'C')}`;

const ZIGZAG = (x, y) => `M${x} ${y} l7 -8 l7 16 l7 -16 l7 16 l7 -16 l7 8`;

const LINES = `
  <svg class="ac-svg" viewBox="0 0 800 600" aria-hidden="true">
    <g stroke="#000" stroke-width="2.4" fill="none">
      <path d="M22 256 V307"/>
      <path d="M116 318 H132 M228 318 H243 M342 318 H359 V269 H377"/>
      <path d="M377 83 V428 M377 83 H392 M377 220 H392 M377 336 H392 M377 428 H392"/>
      <path d="M473 83 H553 M473 220 H550"/>
      <path d="M180 256 V289 q4 6 8 0 q4 6 8 0 q4 6 8 0"/>
      <path d="${ZIGZAG(475, 336)} ${ZIGZAG(475, 428)}"/>
    </g>
  </svg>`;

export const renderAcDrive = () => `
  <div class="ac-top"><span>Привод перем.тока</span><span>${clock()}</span></div>
  ${LINES}
  ${tag(14, 232, 58, 'Двиг.')}${box(36, 271, 62, '0', '/min')}
  ${tag(151, 232, 49, 'MFR')}${lbl(212, 229, 'Ток')}${box(212, 255, 68, '0.0', 'A')}
  ${tag(16, 307, 100, 'Всп.ген')}${tag(132, 307, 96, 'Глав.ген.')}${tag(243, 307, 99, 'Выпрямит.')}
  ${lbl(153, 336, 'Темп.')}${box(153, 360, 59, '-2', 'C')}
  ${lbl(153, 394, 'Т. пдш')}${box(153, 418, 59, '-12', 'C')}
  ${lbl(263, 336, 'DC')}${box(263, 360, 68, '15.6', 'V')}
  ${lbl(263, 394, 'Ток')}${box(263, 418, 68, '2.0', 'A')}
  ${lbl(263, 447, 'Темп.')}${box(263, 471, 68, '-11', 'C')}
  ${branch(71, 'Инв. П', '2.6', '-13')}
  ${branch(208, 'Инв. Л', '0.6', '-13')}
  ${branch(324, 'ПРЕОБ П', '2.6', '-13')}
  ${branch(417, 'ПРЕОБ Л', '4.5', '-13')}
  ${motor(589, 83, 'П')}${motorData(83, { spd: '0.0', t: '-7', b1: '-14', b2: '-15' })}
  ${motor(586, 220, 'Л')}${motorData(220, { spd: '0.0', t: '-6', b1: '-14', b2: '-15' })}
  <div class="ac-panel">
    <div class="ac-panel__sec" style="height:86px"></div>
    <div class="ac-panel__sec" style="height:35px"></div>
    <div class="ac-panel__sec" style="height:60px;border:0"></div>
  </div>
  ${lbl(555, 330, 'Атмосф. темп.', 'ac-lbl--panel')}${box(710, 330, 62, '-12', 'C', 'ac-unit--panel')}
  ${lbl(555, 356, 'Темп. шкафа', 'ac-lbl--panel')}${box(710, 356, 62, '-7', 'C', 'ac-unit--panel')}
  ${lbl(555, 381, 'Темп.охл.жидк.', 'ac-lbl--panel')}${box(710, 381, 62, '-14', 'C', 'ac-unit--panel')}
  ${lbl(555, 417, '24VDC(P24A)', 'ac-lbl--panel')}${box(700, 417, 72, '24.0', 'V', 'ac-unit--panel')}
  ${lbl(555, 453, 'Скр.кол.ПП', 'ac-lbl--panel')}${box(677, 453, 69, '0.0', 'km/h', 'ac-unit--panel')}
  ${lbl(555, 478, 'Скр.кол.ПЛ', 'ac-lbl--panel')}${box(677, 478, 69, '0.0', 'km/h', 'ac-unit--panel')}
  <div class="ac-foot"><div></div><div></div><div></div></div>
  <div class="ac-bottom">${hints([['x', 'Назад']]).replace('class="s-hints"', 'class="s-hints ac-hints"')}</div>`;
