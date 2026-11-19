// Общие помощники для отрисовки экранов.

const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Экранирует текст для вставки в HTML. */
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC_MAP[c]);

/** Часы в формате ЧЧ:ММ. */
export const clock = (d = new Date()) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

/** Дата-время записи: 2021-11-25 08:52:19 */
export const stamp = (d = new Date()) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

const ICONS = {
  up: '<svg viewBox="0 0 24 24"><path d="M12 3l8 9h-5v9H9v-9H4z"/></svg>',
  down: '<svg viewBox="0 0 24 24"><path d="M12 21l-8-9h5V3h6v9h5z"/></svg>',
  left: '<svg viewBox="0 0 24 24"><path d="M3 12l9-8v5h9v6h-9v5z"/></svg>',
  right: '<svg viewBox="0 0 24 24"><path d="M21 12l-9 8v-5H3V9h9V4z"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M4 4l16 16M20 4L4 20" stroke-width="3.5" fill="none"/></svg>',
  o: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" stroke-width="3" fill="none"/></svg>',
  q: '<svg viewBox="0 0 24 24"><text x="12" y="19" text-anchor="middle" font-size="20" font-weight="700" stroke="none">?</text></svg>',
};

const keyIcon = (k) => {
  if (k === 'ud') return `<span class="hk-pair"><span class="hk">${ICONS.up}</span><span class="hk">${ICONS.down}</span></span>`;
  if (k === 'lr') return `<span class="hk-pair"><span class="hk">${ICONS.left}</span><span class="hk">${ICONS.right}</span></span>`;
  const bare = k === 'x' || k === 'o' || k === 'q';
  return `<span class="hk${bare ? ' hk--bare' : ''}">${ICONS[k]}</span>`;
};

/**
 * Нижняя строка подсказок.
 * @param {Array<[string, string]>} items пары [клавиша, подпись]: ud | lr | up | down | left | right | x | o | q
 */
export const hints = (items) =>
  `<div class="s-hints">${items
    .map(([k, label]) => `<span class="s-hint">${keyIcon(k)}${esc(label)}</span>`)
    .join('')}</div>`;

/** Заголовок экрана с часами. */
export const header = (title) =>
  `<div class="s-title">${esc(title)}</div><div class="s-clock">${clock()}</div>`;

/** Список строк с подсветкой выбранной. */
export const list = (items, sel, { x, y, w, rows }) => {
  const filled = [...items, ...Array(Math.max(0, rows - items.length)).fill(null)];
  const html = filled
    .map((it, i) => {
      if (it === null) return '<div class="row row--empty"></div>';
      return `<div class="row${i === sel ? ' row--sel' : ''}">${esc(it)}</div>`;
    })
    .join('');
  return `<div class="list" style="left:${x}px;top:${y}px;width:${w}px">${html}</div>`;
};

/** Ограничивает индекс по кругу. */
export const wrap = (i, n) => ((i % n) + n) % n;
