// Типовые экраны для раздела настроек. Каждый экран — объект:
//   { init(): st, render(st, ctx): html, on(key, st, ctx): Action }
// Action: { st } | { push: id } | { pop: true } | { msg } — можно комбинировать.
import { esc, header, hints, list, wrap } from '../ui.js';

const LIST_HINTS = [['ud', 'Выбрать'], ['x', 'Назад'], ['o', 'устан.']];

/**
 * Меню-список.
 * @param {{ title: string, items: string[], targets?: Array<string|null>, rows?: number,
 *           star?: (st, ctx) => object }} cfg
 */
export const menuScreen = (cfg) => ({
  init: () => ({ sel: 0 }),
  render: (st) => `
    ${header(cfg.title)}
    ${cfg.badge ? `<div class="plus-badge">${esc(cfg.badge(st))}</div>` : ''}
    ${list(cfg.items, st.sel, { x: 115, y: 100, w: 590, rows: cfg.rows ?? 8 })}
    ${st.msg ? `<div class="toast">${esc(st.msg)}</div>` : ''}
    ${hints(LIST_HINTS)}`,
  on: (key, st, ctx) => {
    const n = cfg.items.length;
    if (key === 'up') return { st: { ...st, sel: wrap(st.sel - 1, n), msg: '' } };
    if (key === 'down') return { st: { ...st, sel: wrap(st.sel + 1, n), msg: '' } };
    if (key === 'x') return { pop: true };
    if (key === 'o') {
      const t = cfg.targets?.[st.sel];
      if (typeof t === 'function') return t(st, ctx);
      return t ? { push: t } : { st: { ...st, msg: 'Нет данных для этого пункта' } };
    }
    if (key === 'star' && cfg.star) return cfg.star(st, ctx);
    return {};
  },
});

/** Всплывающий список выбора (как «Тип передних шин»). */
export const popupHtml = (title, options, sel, style = '') => `
  <div class="popup" style="${style}">
    <div class="popup__title">${esc(title)}</div>
    ${options.map((o, i) => `<div class="popup__opt${i === sel ? ' popup__opt--sel' : ''}">${esc(o)}</div>`).join('')}
  </div>`;

/** Модальное сообщение (как «Доступ к контроллеру.»). */
export const dialogHtml = (lines) =>
  `<div class="dialog">${lines.map((l) => `<div>${esc(l)}</div>`).join('')}</div>`;

/**
 * Форма «название — значение». Строки:
 *  { label, value, unit?, options?: string[], toggle?: true, step?: number, min?, max?, ro?: true, button?: true }
 * ↑↓ выбор строки, ○ изменить (список / переключатель / шаг), ✕ назад.
 */
export const formScreen = (cfg) => ({
  init: (ctx) => {
    const rows = (typeof cfg.rows === 'function' ? cfg.rows(ctx) : cfg.rows).map((r) => ({ ...r }));
    const first = rows.findIndex((r) => !r.section && !r.ro);
    return { sel: Math.max(0, cfg.startSel ?? first), rows, popup: null, msg: '' };
  },
  render: (st) => {
    const rows = st.rows.map((r, i) => {
      const cls = i === st.sel ? ' frow__val--sel' : '';
      if (r.button) return `<div class="frow frow--btn"><span class="frow__btn${cls}">${esc(r.label)}</span></div>`;
      if (r.section) return `<div class="frow frow--section">${esc(r.label)}</div>`;
      return `<div class="frow"><span class="frow__label">${esc(r.label)}</span>
        <span class="frow__val${cls}${r.ro ? ' frow__val--ro' : ''}">${esc(r.value)}</span>
        <span class="frow__unit">${esc(r.unit ?? '')}</span></div>`;
    }).join('');
    const pop = st.popup ? popupHtml(st.rows[st.sel].label, st.rows[st.sel].options, st.popup.sel, 'left:250px;top:180px') : '';
    const keys = st.popup
      ? [['ud', 'Выбрать'], ['x', 'Отмена'], ['o', 'устан.']]
      : cfg.hints ?? [['ud', 'Выбрать'], ['x', 'Назад'], ['o', 'Изменить']];
    return `
      ${header(cfg.title)}
      <div class="form" style="${cfg.formStyle ?? ''}">${rows}</div>
      ${cfg.note ? `<div class="form-note">${esc(cfg.note)}</div>` : ''}
      ${pop}
      ${st.msg ? `<div class="toast">${esc(st.msg)}</div>` : ''}
      ${hints(keys)}`;
  },
  on: (key, st, ctx) => {
    const selectable = st.rows.map((r, i) => (r.section || r.ro ? -1 : i)).filter((i) => i >= 0);
    if (st.popup) {
      const opts = st.rows[st.sel].options;
      if (key === 'up') return { st: { ...st, popup: { sel: wrap(st.popup.sel - 1, opts.length) } } };
      if (key === 'down') return { st: { ...st, popup: { sel: wrap(st.popup.sel + 1, opts.length) } } };
      if (key === 'x') return { st: { ...st, popup: null } };
      if (key === 'o') {
        const rows = st.rows.map((r, i) => (i === st.sel ? { ...r, value: opts[st.popup.sel] } : r));
        const next = { ...st, rows, popup: null };
        cfg.onChange?.(rows[st.sel], ctx);
        return { st: next };
      }
      return {};
    }
    const pos = Math.max(0, selectable.indexOf(st.sel));
    if (key === 'x') return { pop: true };
    if (!selectable.length) return {};
    if (key === 'up') return { st: { ...st, sel: selectable[wrap(pos - 1, selectable.length)], msg: '' } };
    if (key === 'down') return { st: { ...st, sel: selectable[wrap(pos + 1, selectable.length)], msg: '' } };
    if (key === 'x') return { pop: true };
    if (key === 'star' && cfg.star) return cfg.star(st, ctx);
    if (key === 'help' && cfg.help) return cfg.help(st, ctx);
    if (key !== 'o') return {};
    const r = st.rows[st.sel];
    if (!r) return {};
    if (r.button || r.msg) return { st: { ...st, msg: r.msg ?? 'Выполнено' } };
    if (r.options) return { st: { ...st, popup: { sel: Math.max(0, r.options.indexOf(r.value)) } } };
    if (r.toggle) {
      const rows = st.rows.map((x, i) => (i === st.sel ? { ...x, value: x.value === 'ВКЛ' ? 'ВЫКЛ' : 'ВКЛ' } : x));
      cfg.onChange?.(rows[st.sel], ctx);
      return { st: { ...st, rows } };
    }
    return { st: { ...st, msg: 'Значение изменяется только на машине' } };
  },
});

/**
 * Монитор входов/выходов: страницы из двух таблиц.
 * page = { left: { head, rows: [[name, value, unit?]] }, right: {...} }
 */
export const ioScreen = (title, pages) => ({
  init: () => ({ page: 0, isHold: false }),
  render: (st) => {
    const table = (t) => `
      <div class="io-col">
        <div class="io-head">${esc(t.head)}</div>
        ${Array.from({ length: 16 }, (_, i) => {
          const r = t.rows[i];
          if (!r) return '<div class="io-row"></div>';
          return `<div class="io-row"><span>${esc(r[0])}</span><b class="${r[1] === 'ВКЛ' ? 'io-on' : ''}">${esc(r[1])}</b><span>${esc(r[2] ?? '')}</span></div>`;
        }).join('')}
      </div>`;
    const p = pages[st.page];
    const keys = st.isHold
      ? [['x', 'Назад'], ['star', 'Воспр.']]
      : [['up', 'ПредыдущаяСтр'], ['down', 'СледующаяСтр'], ['x', 'Назад'], ['star', 'Удерж.']];
    return `
      ${header(`${title}${st.isHold ? '   Удерж.' : ''}`)}
      <div class="pager pager--box">${st.page + 1}/ ${pages.length}</div>
      <div class="io">${table(p.left)}${table(p.right)}</div>
      ${hints(keys)}`;
  },
  on: (key, st) => {
    if (key === 'x') return { pop: true };
    if (key === 'star') return { st: { ...st, isHold: !st.isHold } };
    if (st.isHold) return {};
    if (key === 'up') return { st: { ...st, page: wrap(st.page - 1, pages.length) } };
    if (key === 'down') return { st: { ...st, page: wrap(st.page + 1, pages.length) } };
    return {};
  },
});
