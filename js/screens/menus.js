// Меню сервиса, меню мониторинга, селектор вкладок, заглушки.
import { esc, header, hints, list } from '../ui.js';

export const SERVICE_ITEMS = [
  'Привод перем.тока',
  'Мониторинг и ручн. фиксация',
  'Журнал технического обслуживания',
  'Данные машины',
  'Различные настройки',
];

export const MON_ITEMS = ['Мониторинг/Запись/Воспроизведение', 'Воспроизведение'];

const SELECT_HINTS = [['ud', 'Выбрать'], ['x', 'Назад'], ['o', 'устан.']];

export const renderService = ({ sel }) => `
  ${header('Меню сервиса')}
  ${list(SERVICE_ITEMS, sel, { x: 115, y: 120, w: 590, rows: 8 })}
  ${hints(SELECT_HINTS)}`;

export const renderMonMenu = ({ sel }) => `
  ${header('Мониторинг и ручн. фиксация')}
  ${list(MON_ITEMS, sel, { x: 115, y: 120, w: 590, rows: 8 })}
  ${hints(SELECT_HINTS)}`;

/** @param {{ tabs: Array<{name:string, items:Array<{name:string}>}>, tab: number, sel: number }} st */
export const renderSelector = ({ tabs, tab, sel }) => {
  const tabsHtml = tabs
    .map((t, i) => `<div class="tab${i === tab ? ' tab--on' : ''}">${esc(t.name)}</div>`)
    .join('');
  const names = tabs[tab].items.map((it) => it.name);
  return `
    ${header('Мониторинг и ручн. фиксация')}
    <div class="tabs">${tabsHtml}</div>
    ${list(names, sel, { x: 34, y: 120, w: 362, rows: 10 })}
    ${list([], -1, { x: 402, y: 120, w: 384, rows: 10 })}
    ${hints([['lr', 'Класс'], ['ud', 'Содержимое'], ['x', 'Отмена'], ['o', 'устан.']])}`;
};

export const renderStub = ({ title }) => `
  ${header(title)}
  <div class="stub">Раздел «${esc(title)}»<br>не был сфотографирован —<br>содержимое появится после добавления фото.</div>
  ${hints([['x', 'Назад']])}`;
