// Экран «Начало проверки» при включении.
import { hints } from '../ui.js';

const ITEMS = [
  { label: 'Проверка памяти', top: 60 },
  { label: 'Проверка сирены', top: 130, noResult: true },
  { label: 'Проверка конфигурации системы', top: 190 },
];

/** @param {{ step: number }} st шаг 0..3: сколько проверок завершено */
export const renderBoot = ({ step }) => {
  const items = ITEMS.map((it, i) => {
    let res = '';
    if (!it.noResult && step > i) res = '<div class="boot-item__res">Нормальн.</div>';
    else if (!it.noResult && step === i) res = '<div class="boot-item__res boot-item__res--pending">Проверка…</div>';
    return `<div class="boot-item" style="top:${it.top}px"><div class="boot-item__label">${it.label}</div>${res}</div>`;
  }).join('');
  const done = step >= ITEMS.length;
  return `
    <div class="s-title" style="left:90px">Начало проверки</div>
    ${items}
    ${done ? '<div class="boot-msg">⚠ Остановка при сигнале сирены<br>&nbsp;&nbsp;&nbsp;Аварийный переключатель ВКЛ</div>' : ''}
    ${done ? hints([['o', 'Проверьте']]) : ''}`;
};
