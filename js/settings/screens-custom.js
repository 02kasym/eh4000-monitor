// Нестандартные экраны: таблица ТО, неисправности, данные машины, время, калибровки, автосмазка, ТС.
import { esc, header, hints, wrap } from '../ui.js';
import { dialogHtml } from './kit.js';
import { FAULT_LIST, FAULTS_TOTAL } from './data-faults.js';
import { getOffsetMin, setOffsetMin, formatOffset, TZ_STEP_MIN, TZ_MIN, TZ_MAX } from '../time.js';

const WINDOW = 8;
const scrollTop = (sel, top, n) => {
  if (sel < top) return sel;
  if (sel >= top + WINDOW) return sel - WINDOW + 1;
  return Math.min(top, Math.max(0, n - WINDOW));
};
const two = (n) => String(n).padStart(2, '0');

// ---------- Формуляр ТО / Настройка ТО ----------
const MAINT_COLS = ['interval', 'remain', 'alarm'];
const INTERVAL_STEP = 10;

/** @param {'log'|'setup'} mode */
export const maintScreen = (mode) => ({
  init: () => ({ sel: 0, top: 0, col: 2, edit: null }),
  render: (st, ctx) => {
    const items = ctx.maint();
    const rows = items.slice(st.top, st.top + WINDOW).map((it, k) => {
      const i = st.top + k;
      const isRow = i === st.sel;
      const cell = (c, text) => {
        const isCell = mode === 'setup' && isRow && MAINT_COLS[st.col] === c;
        const val = isCell && st.edit !== null ? st.edit : text;
        return `<span class="mt-${c}${isCell ? ' mt-cell--sel' : ''}${isCell && st.edit !== null ? ' mt-cell--edit' : ''}">${esc(val)}</span>`;
      };
      return `<div class="mt-row${mode === 'log' && isRow ? ' mt-row--sel' : ''}">
        <span class="mt-no">${i + 1}</span>
        <span class="mt-name">${esc(it.name)}</span>
        <span class="mt-count">${it.count}</span>
        ${cell('interval', it.interval)}${cell('remain', it.remain)}${cell('alarm', it.alarm ? 'ВКЛ' : 'ВЫКЛ')}
      </div>`;
    }).join('');
    const keys = mode === 'log'
      ? [['ud', 'Выбрать'], ['x', 'Назад'], ['o', 'устан.']]
      : st.edit !== null
        ? [['ud', 'Значение'], ['x', 'Отмена'], ['o', 'устан.']]
        : [['udlr', 'Выбр.элемент'], ['x', 'Отмена'], ['o', 'Изменить'], ['star', 'Субменю']];
    return `
      ${header(mode === 'log' ? 'Формуляр ТО' : 'Настройка технического обслуживания')}
      <div class="mt-total">Всего ${items.length}</div>
      <div class="mt-upd">
        <span>Дата обн.</span><b>${mode === 'log' ? '2021-11-25 11:54' : ''}</b>
        <span>Обн.часомер</span><b>000007</b>
      </div>
      <div class="mt-table">
        <div class="mt-head"><span class="mt-no">№</span><span>Название позиции обслуживания</span></div>
        <div class="mt-head mt-head--2"><span class="mt-no"></span><span class="mt-count">Раз</span><span>Дата</span><span>Посл.вмеш.</span>
          <span class="mt-interval">Интервал</span><span class="mt-remain">Оставаться</span><span class="mt-alarm">АвСиг</span></div>
        ${rows}
      </div>
      ${hints(keys)}`;
  },
  on: (key, st, ctx) => {
    const items = ctx.maint();
    const n = items.length;
    if (st.edit !== null) {
      if (key === 'up') return { st: { ...st, edit: st.edit + INTERVAL_STEP } };
      if (key === 'down') return { st: { ...st, edit: Math.max(0, st.edit - INTERVAL_STEP) } };
      if (key === 'x') return { st: { ...st, edit: null } };
      if (key === 'o') {
        const c = MAINT_COLS[st.col];
        ctx.setMaint(items.map((it, i) => (i === st.sel ? { ...it, [c]: st.edit } : it)));
        return { st: { ...st, edit: null } };
      }
      return {};
    }
    const move = (sel) => ({ st: { ...st, sel, top: scrollTop(sel, st.top, n) } });
    if (key === 'up') return move(wrap(st.sel - 1, n));
    if (key === 'down') return move(wrap(st.sel + 1, n));
    if (key === 'x') return { pop: true };
    if (mode === 'log') return {};
    if (key === 'left') return { st: { ...st, col: wrap(st.col - 1, MAINT_COLS.length) } };
    if (key === 'right') return { st: { ...st, col: wrap(st.col + 1, MAINT_COLS.length) } };
    if (key === 'star') return { push: 'snapshot' };
    if (key === 'o') {
      const c = MAINT_COLS[st.col];
      if (c === 'alarm') {
        ctx.setMaint(items.map((it, i) => (i === st.sel ? { ...it, alarm: !it.alarm } : it)));
        return {};
      }
      return { st: { ...st, edit: items[st.sel][c] } };
    }
    return {};
  },
});

// ---------- Список текущих неисправностей ----------
export const faultsScreen = {
  init: () => ({ sel: 0, top: 0, reloadUntil: 0 }),
  render: (st) => {
    const rows = FAULT_LIST.slice(st.top, st.top + WINDOW).map((f, k) => {
      const i = st.top + k;
      return `<div class="fl-row${i === st.sel ? ' fl-row--sel' : ''}"><span>${i + 1}</span><span>${esc(f[0])}</span><span>${esc(f[1])}</span><span>${esc(f[2])}</span></div>`;
    }).join('');
    return `
      ${header('Список текущих неисправностей')}
      <div class="mt-total" style="left:auto;right:30px;top:38px">Всего ${FAULTS_TOTAL}</div>
      <div class="fl">
        <div class="fl-row fl-head"><span>№</span><span>Код SAE</span><span>НСМ</span><span>Содержимое</span></div>
        ${rows}
      </div>
      ${Date.now() < st.reloadUntil ? dialogHtml(['Доступ к контроллеру.']) : ''}
      ${hints([['ud', 'Выбрать'], ['x', 'Назад'], ['star', 'Перезагр.']])}`;
  },
  on: (key, st) => {
    const n = FAULT_LIST.length;
    const move = (sel) => ({ st: { ...st, sel, top: scrollTop(sel, st.top, n) } });
    if (key === 'up') return move(Math.max(0, st.sel - 1));
    if (key === 'down') return move(Math.min(n - 1, st.sel + 1));
    if (key === 'x') return { pop: true };
    if (key === 'star') return { st: { ...st, reloadUntil: Date.now() + 1200 } };
    return {};
  },
};

// ---------- Данные машины ----------
const LOAD_MS = 1500;
const machinePage1 = () => `
  <div class="md-block" style="top:96px">
    <div class="md-title">Блок контроллера</div>
    <div class="md-grid md-grid--3"><b>Модель</b><b>Версия</b><b>P/N</b>
      <span>CCU</span><span>3.2.26</span><span>YA60072352</span>
      <span>DLU</span><span>3.2.23</span><span>YA60060852</span>
      <span>IDU/V</span><span>3.2.18</span><span>YA60060851</span>
      <span>DTU</span><span>2.2.00</span><span>60023555</span>
      <span></span><span></span><span></span></div>
  </div>
  <div class="md-block" style="top:330px">
    <div class="md-grid md-grid--3"><b>Устройство связи</b><b>Номер телефона</b><b>Состояние</b>
      <span>Мобильный терминал</span><span>+467191004178890</span><span>📶 GPRS</span></div>
  </div>`;

const machinePage2 = () => `
  <div class="md-block" style="top:96px;width:340px">
    <div class="md-title">Устройство контроля движения</div>
    <div class="md-grid md-grid--2"><b>Модель</b><b>Версия</b>
      ${[['CPU1', '7.354'], ['CPU2', '7.056'], ['CPU3', '7.352'], ['CPU4', '7.352'], ['CPU5', '7.352'], ['FPGA', '43.41'], ['FPGA(COM)', '5.00'], ['', '']]
        .map(([a, b]) => `<span>${a}</span><span>${b}</span>`).join('')}</div>
  </div>
  <div class="md-block" style="top:96px;left:400px;width:370px">
    <div class="md-title">Состояние установки параметра</div>
    <div class="md-grid md-grid--1"><b>P/N</b><span>YA00068661</span><b>Модель грузовика</b><span>EH4000AC-3</span>
      <b>Тип двигателя</b><span>Cummins QSK60</span></div>
  </div>`;

export const machineDataScreen = {
  init: () => ({ page: 0, loadUntil: Date.now() + LOAD_MS }),
  render: (st) => {
    const isLoading = Date.now() < st.loadUntil;
    return `
      ${header('Данные машины')}
      <div class="md-sub">EH4000AC-3 &nbsp;&nbsp; № 11012</div>
      <div class="pager pager--box">${st.page + 1}/ 2</div>
      ${st.page === 0 ? machinePage1() : machinePage2()}
      ${isLoading ? dialogHtml(['Доступ к контроллеру.']) : ''}
      ${hints(isLoading ? [['ud', 'Выбрать'], ['x', 'Назад']] : [['ud', 'Выбрать'], ['x', 'Назад'], ['star', 'Перезагр.']])}`;
  },
  on: (key, st) => {
    if (key === 'x') return { pop: true };
    if (key === 'up' || key === 'down') return { st: { ...st, page: 1 - st.page } };
    if (key === 'star') return { st: { ...st, loadUntil: Date.now() + LOAD_MS } };
    return {};
  },
};

// ---------- Настройка времени ----------
const dateBoxes = (d) =>
  `<span class="tbox">${d.getUTCFullYear()}</span>-<span class="tbox">${two(d.getUTCMonth() + 1)}</span>-<span class="tbox">${two(d.getUTCDate())}</span>
   &nbsp;<span class="tbox">${two(d.getUTCHours())}</span>:<span class="tbox">${two(d.getUTCMinutes())}</span>:<span class="tbox tbox--dim">${two(d.getUTCSeconds())}</span>`;

// ○ «Настроить» — правка пояса: ↑↓ ±30 мин, ○ сохранить, ✕ отмена.
export const timeScreen = {
  init: () => ({ edit: null, msg: '' }),
  render: (st) => {
    const now = new Date();
    const isEdit = st.edit !== null;
    const offset = isEdit ? st.edit : getOffsetMin();
    const local = new Date(now.getTime() + offset * 60e3);
    const keys = isEdit
      ? [['ud', 'Изменить'], ['x', 'Отмена'], ['o', 'устан.']]
      : [['x', 'Назад'], ['o', 'Настроить']];
    return `
      ${header('Настройка времени')}
      <div class="ts">
        <div class="ts-label">Время по Гринвичу</div><div class="ts-val">${dateBoxes(now)}</div>
        <div class="ts-label">Местное поясное время</div><div class="ts-val">${dateBoxes(local)}</div>
        <div class="ts-label">Разница во времени</div>
        <div class="ts-val"><span class="tbox${isEdit ? ' tbox--edit' : ''}">${formatOffset(offset)}</span></div>
      </div>
      ${st.msg ? `<div class="toast">${esc(st.msg)}</div>` : ''}
      ${hints(keys)}`;
  },
  on: (key, st) => {
    if (st.edit !== null) {
      if (key === 'up') return { st: { ...st, edit: Math.min(TZ_MAX, st.edit + TZ_STEP_MIN) } };
      if (key === 'down') return { st: { ...st, edit: Math.max(TZ_MIN, st.edit - TZ_STEP_MIN) } };
      if (key === 'x') return { st: { ...st, edit: null, msg: '' } };
      if (key === 'o') {
        setOffsetMin(st.edit);
        return { st: { ...st, edit: null, msg: `Часовой пояс: GMT ${formatOffset(st.edit)}` } };
      }
      return {};
    }
    if (key === 'x') return { pop: true };
    if (key === 'o') return { st: { ...st, edit: getOffsetMin(), msg: '' } };
    return {};
  },
};

// ---------- Калибровка датчика наклона (простая и комбинированная) ----------
const livePitch = () => (1.093 + ((Date.now() / 1000) % 5) * 0.0094).toFixed(3);

/** @param {{ title: string, isCombined: boolean }} cfg */
export const tiltScreen = ({ title, isCombined }) => ({
  init: () => ({ col: 0, fwd: '0.000', rev: '0.000' }),
  render: (st) => {
    const tab = (i, t) => `<span class="tl-tab${st.col === i ? ' tl-tab--sel' : ''}">${t}</span>`;
    const extra = isCombined ? `
      <div class="tl-label" style="top:250px">Сенсор совмещения</div>
      ${['Датчик степени отклон.', 'Передне-боковое ускор.', 'Право-левое ускорение'].map((l, i) => `
        <div class="tl-row" style="top:${290 + i * 50}px"><span class="tl-name">${l}</span><span></span>
          <span class="tl-box tl-box--dark"></span><span class="tl-box tl-box--dark"></span></div>`).join('')}` : '';
    return `
      ${header(title)}
      <div class="tl-label" style="top:100px">Датчик наклона</div>
      <div class="tl-tabs">${tab(0, 'Вперед')}${tab(1, 'Реверс')}</div>
      <div class="tl-row" style="top:170px"><span class="tl-name">Тангаж</span>
        <span class="tl-box">${livePitch()}</span><span class="tl-box">${st.fwd}</span><span class="tl-box">${st.rev}</span>
        <span>[degree]</span></div>
      ${extra}
      ${hints([['lr', 'Выбрать'], ['x', 'Назад'], ['o', 'устан.']])}`;
  },
  on: (key, st) => {
    if (key === 'x') return { pop: true };
    if (key === 'left' || key === 'right') return { st: { ...st, col: 1 - st.col } };
    if (key === 'o') return { st: { ...st, [st.col === 0 ? 'fwd' : 'rev']: livePitch() } };
    return {};
  },
});

// ---------- Настройка автосмазки ----------
const TEST_POPUP_MS = 2500;
export const autolubeScreen = {
  init: () => ({ value: 15, edit: null, isTest: false, popupUntil: 0 }),
  render: (st) => {
    const isEdit = st.edit !== null;
    const keys = isEdit
      ? [['up', 'Включ.'], ['down', 'Дес.'], ['x', 'Отмена'], ['o', 'устан.']]
      : [['q', `Р. пров. (${st.isTest ? 'ВКЛ.' : 'ВЫКЛ.'})`], ['x', 'Отмена'], ['o', 'Изменить']];
    return `
      ${header('Настр. авт. смаз. маш. маслом')}
      <div class="form" style="top:120px"><div class="frow"><span class="frow__label">Интервал смазки [мин]</span>
        <span class="frow__val${isEdit ? ' frow__val--sel' : ''}">${isEdit ? st.edit : st.value}</span><span></span></div></div>
      ${Date.now() < st.popupUntil ? dialogHtml(['Тестовый режим автосмазки', '', 'Система смазки будет работать с интервалом', '3 минуты, пока вы находитесь в этом экране.']) : ''}
      ${hints(keys)}`;
  },
  on: (key, st) => {
    if (st.edit !== null) {
      if (key === 'up') return { st: { ...st, edit: st.edit + 1 } };
      if (key === 'down') return { st: { ...st, edit: Math.max(1, st.edit - 1) } };
      if (key === 'x') return { st: { ...st, edit: null } };
      if (key === 'o') return { st: { ...st, value: st.edit, edit: null } };
      return {};
    }
    if (key === 'x') return { pop: true };
    if (key === 'o') return { st: { ...st, edit: st.value } };
    if (key === 'help') {
      const isTest = !st.isTest;
      return { st: { ...st, isTest, popupUntil: isTest ? Date.now() + TEST_POPUP_MS : 0 } };
    }
    return {};
  },
};

// ---------- Настройка транспортного средства ----------
const OPTION_NAMES = ['Система вагонетки', 'Подвеска Цилиндр Тип2', 'Подъемник Цилиндр Тип2',
  ...Array.from({ length: 12 }, (_, i) => `Опция${i + 4}`)];
const PER_PAGE = 8;

export const vehicleScreen = {
  init: () => ({ page: 0, sel: 0, values: OPTION_NAMES.map(() => false), isList: false }),
  render: (st) => {
    const start = st.page * PER_PAGE;
    const rows = OPTION_NAMES.slice(start, start + PER_PAGE).map((n, k) => {
      const i = start + k;
      return `<div class="frow"><span class="frow__label">${i + 1}.${esc(n)}</span>
        <span class="frow__val${i === st.sel ? ' frow__val--sel' : ''}">${st.values[i] ? 'ВКЛ' : 'ВЫКЛ'}</span><span></span></div>`;
    }).join('');
    const list = st.isList ? `
      <div class="vlist"><div class="vlist__title"><span>EH4000AC-3</span><span>№ 11012</span></div>
        <div class="vlist__grid">${OPTION_NAMES.map((_, i) => `<span>${i + 1} ${st.values[i] ? 'вкл' : 'выкл'}</span>`).join('')}</div></div>` : '';
    return `
      ${header('Настройка транспортного средства')}
      <div class="pager pager--box">${st.page + 1}/ 2</div>
      <div class="form" style="top:80px">
        <div class="frow"><span class="frow__label">Тип установки</span><span class="frow__val frow__val--ro">Синхронизация.</span><span></span></div>
        <div class="frow frow--section">Пункт настройки</div>
        ${rows}
      </div>
      ${list}
      ${hints(st.isList ? [['x', 'Назад']] : [['lr', 'Стр.'], ['x', 'Назад'], ['o', 'Изменить'], ['star', 'список']])}`;
  },
  on: (key, st) => {
    if (st.isList) return key === 'x' || key === 'star' ? { st: { ...st, isList: false } } : {};
    const n = OPTION_NAMES.length;
    if (key === 'x') return { pop: true };
    if (key === 'star') return { st: { ...st, isList: true } };
    if (key === 'left' || key === 'right') {
      const page = 1 - st.page;
      return { st: { ...st, page, sel: page * PER_PAGE } };
    }
    if (key === 'up' || key === 'down') {
      const start = st.page * PER_PAGE;
      const count = Math.min(PER_PAGE, n - start);
      const local = wrap(st.sel - start + (key === 'up' ? -1 : 1), count);
      return { st: { ...st, sel: start + local } };
    }
    if (key === 'o') return { st: { ...st, values: st.values.map((v, i) => (i === st.sel ? !v : v)) } };
    return {};
  },
};
