// Схема «Привод перем.тока» (меню сервиса → первый пункт).
import { esc, header, hints } from '../ui.js';

const tag = (x, y, t) => `<div class="ac-tag" style="left:${x}px;top:${y}px">${esc(t)}</div>`;
const lbl = (x, y, t, warm = false) => `<div class="ac-lbl${warm ? ' ac-lbl--warm' : ''}" style="left:${x}px;top:${y}px">${esc(t)}</div>`;
const v = (x, y, val, unit, warm = false) =>
  `<div class="ac-val${warm ? ' ac-val--warm' : ''}" style="left:${x}px;top:${y}px">${esc(val)}</div>` +
  (unit ? `<div class="ac-unit" style="left:${x + 72}px;top:${y + 4}px">${esc(unit)}</div>` : '');

const motor = (y, side, d) => `
  <div class="ac-motor" style="left:560px;top:${y - 26}px">Мотор<br>${side}</div>
  ${lbl(642, y - 22, 'Скор.')}${v(692, y - 24, d.spd, 'km/h')}
  ${lbl(642, y + 2, 'Темп.')}${v(692, y, d.t, 'c')}
  ${lbl(600, y + 30, 'Т.внт.пдш.', true)}${v(692, y + 28, d.tin, 'c')}
  ${lbl(600, y + 54, 'Т.внш.пдш.', true)}${v(692, y + 52, d.tout, 'c')}`;

const branch = (y, name, amps, temp) => `
  ${tag(400, y, name)}
  ${lbl(402, y + 32, 'Ток')}${v(470, y + 30, amps, 'A')}
  ${lbl(402, y + 58, 'Темп.')}${v(470, y + 56, temp, 'c')}`;

const LINES = `
  <svg class="ac-svg" viewBox="0 0 800 600" aria-hidden="true">
    <g stroke="#1b1f10" stroke-width="2" fill="none">
      <path d="M380 68 V392 M380 68 H400 M380 188 H400 M380 300 H400 M380 392 H400"/>
      <path d="M340 296 H380"/>
      <path d="M52 270 V296 M110 296 H140 M226 296 H250"/>
      <path d="M520 68 H560 M520 188 H560"/>
      <path d="M200 270 q6 -10 12 0 q6 -10 12 0 q6 -10 12 0"/>
      <path d="M520 300 l8 -8 l8 16 l8 -16 l8 16 l8 -8 M520 392 l8 -8 l8 16 l8 -16 l8 16 l8 -8"/>
    </g>
  </svg>`;

export const renderAcDrive = () => `
  ${LINES}
  ${header('Привод перем.тока')}
  ${tag(40, 210, 'Двиг.')}${v(60, 238, '0', '/min')}
  ${tag(40, 284, 'Всп.ген')}${tag(140, 284, 'Глав.ген.')}${tag(250, 284, 'Выпрямит.')}
  ${tag(176, 214, 'MFR')}${lbl(240, 206, 'Ток')}${v(240, 230, '0.0', 'A')}
  ${lbl(150, 316, 'Темп.')}${v(150, 338, '-2', 'c', true)}
  ${lbl(150, 366, 'Т. пдш', true)}${v(150, 388, '-12', 'c', true)}
  ${lbl(270, 316, 'DC')}${v(270, 338, '16.6', 'V')}
  ${lbl(270, 366, 'Ток')}${v(270, 388, '1.2', 'A')}
  ${lbl(270, 414, 'Темп.')}${v(270, 436, '-11', 'c')}
  ${branch(56, 'Инв. П', '1.8', '-13')}
  ${branch(176, 'Инв. Л', '1.5', '-13')}
  ${branch(288, 'ПРЕОБ П', '0.0', '-13')}
  ${branch(380, 'ПРЕОБ Л', '3.6', '-13')}
  ${motor(80, 'П', { spd: '0.0', t: '-7', tin: '-14', tout: '-15' })}
  ${motor(200, 'Л', { spd: '0.0', t: '-6', tin: '-14', tout: '-15' })}
  <div class="ac-panel" style="left:560px;top:300px;width:228px;height:84px"></div>
  ${lbl(568, 306, 'Атмосф. темп.')}${v(700, 304, '-12', 'c')}
  ${lbl(568, 332, 'Темп. шкафа')}${v(700, 330, '-7', 'c')}
  ${lbl(568, 358, 'Темп.охл.жидк.')}${v(700, 356, '-14', 'c')}
  <div class="ac-panel" style="left:560px;top:392px;width:228px;height:32px"></div>
  ${lbl(568, 398, '24VDC(P24A)')}${v(700, 396, '24.0', 'V')}
  ${lbl(568, 434, 'Скр.кол.ПП')}${v(680, 432, '0.0', 'km/h')}
  ${lbl(568, 460, 'Скр.кол.ПЛ')}${v(680, 458, '0.0', 'km/h')}
  <div class="ac-foot"><div></div><div></div><div></div></div>
  ${hints([['x', 'Назад']]).replace('class="s-hints"', 'class="s-hints" style="justify-content:flex-end;padding-right:120px"')}`;
