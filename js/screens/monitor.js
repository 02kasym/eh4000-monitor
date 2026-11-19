// Страница мониторинга, список записей и экран воспроизведения.
import { esc, header, hints } from '../ui.js';
import { grid } from './grid.js';

const STATUS = {
  watch: ['Отслеживается', ''],
  rec: ['Запись', ' status--rec'],
  play: ['Воспроизводится', ' status--play'],
};

const frame = ({ item, page, idx, total, status }) => {
  const [label, cls] = STATUS[status];
  return `
    ${header('Мониторинг и ручн. фиксация')}
    <div class="crumb crumb--1">${esc(item)}</div>
    <div class="crumb crumb--2">${esc(page.title)}</div>
    <div class="status${cls}">${label}</div>
    <div class="pager">${idx + 1}/ ${total}</div>
    ${grid(page)}`;
};

/** @param {{ item: string, page: object, idx: number, total: number, isRecording: boolean, message: string }} st */
export const renderMonitor = (st) => {
  const keys = st.total > 1 ? [['ud', 'Стр.']] : [];
  return `
    ${frame({ ...st, status: st.isRecording ? 'rec' : 'watch' })}
    <div class="msgline">${esc(st.message)}</div>
    ${hints([...keys, ['x', 'Назад'], ['o', 'Пуск'], ['q', 'Сброс']])}`;
};

const PER_PAGE = 5;

/** @param {{ records: Array<{ts:string, tab:string, item:string}>, sel: number }} st */
export const renderRecords = ({ records, sel }) => {
  const pages = Math.max(1, Math.ceil(records.length / PER_PAGE));
  const pageIdx = Math.floor(sel / PER_PAGE);
  const slice = records.slice(pageIdx * PER_PAGE, pageIdx * PER_PAGE + PER_PAGE);
  const rows = Array.from({ length: PER_PAGE }, (_, i) => {
    const r = slice[i];
    if (!r) return '<div class="rec-row"></div>';
    const isSel = pageIdx * PER_PAGE + i === sel;
    return `<div class="rec-row${isSel ? ' rec-row--sel' : ''}"><span>${esc(r.ts)}</span><span>${esc(r.tab)}<small>${esc(r.item)}</small></span></div>`;
  }).join('');
  return `
    ${header('Мониторинг и ручн. фиксация')}
    <div class="pager" style="top:44px">${pageIdx + 1}/${pages}</div>
    <div class="list" style="left:60px;top:80px;width:680px">${rows}</div>
    ${hints([['ud', 'Выбрать'], ['lr', 'Стр.'], ['x', 'Назад'], ['o', 'устан.']])}`;
};

const TRANSPORT = ['|◀◀', '◀◀', '◀', '❚❚', '▶', '▶▶', '▶▶|'];

/** @param {{ record: object, page: object, idx: number, total: number, pos: number, len: number, isHold: boolean }} st */
export const renderPlayback = (st) => {
  const active = st.isHold ? 3 : 4;
  const btns = TRANSPORT.map((t, i) => `<span class="tbtn${i === active ? ' tbtn--on' : ''}">${t}</span>`).join('');
  const pct = st.len > 0 ? (st.pos / st.len) * 100 : 0;
  return `
    ${frame({ item: st.record.item, page: st.page, idx: st.idx, total: st.total, status: 'play' })}
    <div class="transport">
      ${btns}
      <span class="tpos">${esc(st.record.ts)}<br>+${st.pos.toFixed(1)} s</span>
      <div class="tbar"><div class="tbar__track"><div class="tbar__fill" style="width:${pct}%"></div></div>
        <span style="display:flex;justify-content:space-between"><span>0</span><span>${st.len}</span></span></div>
    </div>
    ${hints([['left', 'Обратн.'], ['right', 'Вперед'], ['ud', 'Страница'], ['o', 'Удерж.'], ['x', 'Назад']])}`;
};
