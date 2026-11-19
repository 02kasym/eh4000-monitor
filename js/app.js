// Ядро: состояние, навигация по кнопкам, отрисовка.
import { engineTab } from './data/tab-engine.js';
import { hydraulicTab } from './data/tab-hydraulic.js';
import { acDriveTab } from './data/tab-acdrive.js';
import { bar, val, sw, page as mkPage } from './data/cells.js';
import { wrap, stamp } from './ui.js';
import { resetMinMax } from './screens/grid.js';
import { renderBoot } from './screens/boot.js';
import { renderDashboard, FAULTS } from './screens/dashboard.js';
import { renderService, renderMonMenu, renderSelector, renderStub, SERVICE_ITEMS, MON_ITEMS } from './screens/menus.js';
import { renderMonitor, renderRecords, renderPlayback } from './screens/monitor.js';
import { renderAcDrive } from './screens/acdrive.js';

const TABS = [engineTab, hydraulicTab, acDriveTab];
const STORE_KEY = 'eh4000-records-v1';
const BOOT_STEP_MS = 700;
const BOOT_AUTO_MS = 5000;
const PLAY_TICK_MS = 100;
const REC_PAGE = 5;

// Запись с фото: 2021-11-25, «Охлаждающая жидкость двигателя»
const SAMPLE_RECORD = { ts: '2021-11-25 08:52:19', tabIdx: 0, itemIdx: 1, len: 2, isSample: true };

const samplePage = (pos) => {
  const wobble = Math.round(pos * 10) % 3;
  return mkPage('Уров. охлажд. жидкости двигателя',
    [bar('Обороты двигателя', 0, 2500, 'min-1', 648 + wobble, 648, 650),
      sw('Перекл. пров. охлажд. жидк. двиг.'), val('Уров. охлажд. жидкости двигателя', 100, '%'), null],
    [bar('Обороты двигателя (DSC)', 0, 2500, 'min-1', 646 + wobble, 646, 648),
      val('Темп. охлажд. жидкости двигателя', 34, 'c'), null, null]);
};

// ---------- хранилище записей ----------
const loadRecords = () => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((r) => TABS[r.tabIdx]?.items[r.itemIdx]) : [];
  } catch {
    return [];
  }
};

const saveRecords = (records) => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(records.filter((r) => !r.isSample)));
  } catch {
    // хранилище недоступно (приватный режим) — записи живут до перезагрузки
  }
};

// ---------- состояние ----------
let state = {
  screen: 'boot',
  bootStep: 0,
  faultIdx: 0,
  isDigital: false,
  dim: 0,
  serviceSel: 0,
  monSel: 0,
  tab: 0,
  itemSel: 0,
  pageIdx: 0,
  isRecording: false,
  recStartedAt: 0,
  message: '',
  resets: {},
  records: [...loadRecords(), SAMPLE_RECORD],
  recSel: 0,
  play: { recIdx: 0, pageIdx: 0, pos: 0, isHold: false },
  stubTitle: '',
};

const setState = (patch) => {
  state = { ...state, ...patch };
  render();
};

const currentItem = () => TABS[state.tab].items[state.itemSel];
const pageKey = () => `${state.tab}:${state.itemSel}:${state.pageIdx}`;

const recordInfo = (r) => ({
  ...r,
  tab: TABS[r.tabIdx].name,
  item: TABS[r.tabIdx].items[r.itemIdx].name,
});

// ---------- обработчики по экранам ----------
const stopRecording = () => {
  if (!state.isRecording) return {};
  const len = Math.max(1, Math.round((Date.now() - state.recStartedAt) / 1000));
  const rec = { ts: stamp(new Date(state.recStartedAt)), tabIdx: state.tab, itemIdx: state.itemSel, len };
  const records = [rec, ...state.records];
  saveRecords(records);
  return { isRecording: false, records, message: `Запись сохранена (${len} s) → «Воспроизведение»` };
};

const HANDLERS = {
  boot: {
    o: () => (state.bootStep >= 3 ? { screen: 'main' } : {}),
  },
  main: {
    o: () => ({ screen: 'service', serviceSel: 0 }),
    left: () => ({ faultIdx: wrap(state.faultIdx - 1, FAULTS.length) }),
    right: () => ({ faultIdx: wrap(state.faultIdx + 1, FAULTS.length) }),
    help: () => ({ isDigital: !state.isDigital }),
  },
  service: {
    up: () => ({ serviceSel: wrap(state.serviceSel - 1, SERVICE_ITEMS.length) }),
    down: () => ({ serviceSel: wrap(state.serviceSel + 1, SERVICE_ITEMS.length) }),
    x: () => ({ screen: 'main' }),
    o: () => {
      if (state.serviceSel === 0) return { screen: 'acdrive' };
      if (state.serviceSel === 1) return { screen: 'monMenu', monSel: 0 };
      return { screen: 'stub', stubTitle: SERVICE_ITEMS[state.serviceSel] };
    },
  },
  acdrive: { x: () => ({ screen: 'service' }) },
  stub: { x: () => ({ screen: 'service' }) },
  monMenu: {
    up: () => ({ monSel: wrap(state.monSel - 1, MON_ITEMS.length) }),
    down: () => ({ monSel: wrap(state.monSel + 1, MON_ITEMS.length) }),
    x: () => ({ screen: 'service' }),
    o: () => (state.monSel === 0 ? { screen: 'selector' } : { screen: 'records', recSel: 0 }),
  },
  selector: {
    left: () => ({ tab: wrap(state.tab - 1, TABS.length), itemSel: 0 }),
    right: () => ({ tab: wrap(state.tab + 1, TABS.length), itemSel: 0 }),
    up: () => ({ itemSel: wrap(state.itemSel - 1, TABS[state.tab].items.length) }),
    down: () => ({ itemSel: wrap(state.itemSel + 1, TABS[state.tab].items.length) }),
    x: () => ({ screen: 'monMenu' }),
    o: () => ({ screen: 'monitor', pageIdx: 0, message: '' }),
  },
  monitor: {
    up: () => ({ pageIdx: wrap(state.pageIdx - 1, currentItem().pages.length) }),
    down: () => ({ pageIdx: wrap(state.pageIdx + 1, currentItem().pages.length) }),
    x: () => ({ ...stopRecording(), screen: 'selector', message: '' }),
    o: () => (state.isRecording
      ? stopRecording()
      : { isRecording: true, recStartedAt: Date.now(), message: 'Идёт запись… ○ — остановить' }),
    help: () => ({ resets: { ...state.resets, [pageKey()]: true }, message: 'Мин./макс. значения сброшены' }),
  },
  records: {
    up: () => ({ recSel: wrap(state.recSel - 1, state.records.length) }),
    down: () => ({ recSel: wrap(state.recSel + 1, state.records.length) }),
    left: () => ({ recSel: Math.max(0, state.recSel - REC_PAGE) }),
    right: () => ({ recSel: Math.min(state.records.length - 1, state.recSel + REC_PAGE) }),
    x: () => ({ screen: 'monMenu' }),
    o: () => ({ screen: 'playback', play: { recIdx: state.recSel, pageIdx: 0, pos: 0, isHold: false } }),
  },
  playback: {
    left: () => ({ play: { ...state.play, pos: Math.max(0, state.play.pos - 1) } }),
    right: () => ({ play: { ...state.play, pos: Math.min(playLen(), state.play.pos + 1) } }),
    up: () => ({ play: { ...state.play, pageIdx: wrap(state.play.pageIdx - 1, playPages().length) } }),
    down: () => ({ play: { ...state.play, pageIdx: wrap(state.play.pageIdx + 1, playPages().length) } }),
    o: () => {
      const isAtEnd = state.play.pos >= playLen();
      if (state.play.isHold && isAtEnd) return { play: { ...state.play, pos: 0, isHold: false } };
      return { play: { ...state.play, isHold: !state.play.isHold } };
    },
    x: () => ({ screen: 'records' }),
  },
};

const playRecord = () => state.records[state.play.recIdx];
const playLen = () => playRecord().len;
const playPages = () => TABS[playRecord().tabIdx].items[playRecord().itemIdx].pages;

/** Нажатие кнопки панели. */
const press = (key) => {
  if (key === 'star') {
    setState({ dim: (state.dim + 1) % 3 });
    return;
  }
  const fn = HANDLERS[state.screen]?.[key];
  if (fn) setState(fn());
};

// ---------- отрисовка ----------
const screenEl = document.getElementById('screen');

const renderScreen = () => {
  switch (state.screen) {
    case 'boot': return renderBoot({ step: state.bootStep });
    case 'main': return renderDashboard({ faultIdx: state.faultIdx, isDigital: state.isDigital, hasCaution: true });
    case 'service': return renderService({ sel: state.serviceSel });
    case 'acdrive': return renderAcDrive();
    case 'stub': return renderStub({ title: state.stubTitle });
    case 'monMenu': return renderMonMenu({ sel: state.monSel });
    case 'selector': return renderSelector({ tabs: TABS, tab: state.tab, sel: state.itemSel });
    case 'monitor': {
      const item = currentItem();
      const raw = item.pages[state.pageIdx];
      const page = state.resets[pageKey()] ? resetMinMax(raw) : raw;
      return renderMonitor({
        item: item.name, page, idx: state.pageIdx, total: item.pages.length,
        isRecording: state.isRecording, message: state.message,
      });
    }
    case 'records': return renderRecords({ records: state.records.map(recordInfo), sel: state.recSel });
    case 'playback': {
      const rec = recordInfo(playRecord());
      const pages = playPages();
      const { pageIdx, pos, isHold } = state.play;
      const page = rec.isSample && pageIdx === 0 ? samplePage(pos) : pages[pageIdx];
      return renderPlayback({ record: rec, page, idx: pageIdx, total: pages.length, pos, len: rec.len, isHold });
    }
    default: return '';
  }
};

function render() {
  screenEl.className = `screen${state.screen === 'acdrive' ? ' ac' : ''}`;
  screenEl.dataset.dim = String(state.dim);
  screenEl.dataset.screen = state.screen;
  screenEl.innerHTML = renderScreen();
}

// ---------- масштаб экрана ----------
const fit = () => {
  const w = screenEl.parentElement.clientWidth;
  screenEl.style.setProperty('--scale', String(w / 800));
};
new ResizeObserver(fit).observe(screenEl.parentElement);

// ---------- ввод ----------
const KEYMAP = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  Enter: 'o', ' ': 'o', Escape: 'x', Backspace: 'x',
  h: 'help', H: 'help', '?': 'help', р: 'help', Р: 'help',
  b: 'star', B: 'star', '*': 'star', и: 'star', И: 'star',
};

const flash = (key) => {
  const btn = document.querySelector(`.key[data-key="${key}"]`);
  if (!btn) return;
  btn.classList.add('is-pressed');
  setTimeout(() => btn.classList.remove('is-pressed'), 120);
};

document.querySelectorAll('.key').forEach((btn) => {
  btn.addEventListener('click', () => press(btn.dataset.key));
});

document.addEventListener('keydown', (e) => {
  const key = KEYMAP[e.key];
  if (!key || e.metaKey || e.ctrlKey || e.altKey) return;
  // Enter/пробел на сфокусированной кнопке панели уже даст click
  if ((e.key === 'Enter' || e.key === ' ') && document.activeElement?.classList.contains('key')) return;
  e.preventDefault();
  flash(key);
  press(key);
});

// ---------- таймеры ----------
const bootTimer = setInterval(() => {
  if (state.screen !== 'boot') { clearInterval(bootTimer); return; }
  if (state.bootStep < 3) setState({ bootStep: state.bootStep + 1 });
}, BOOT_STEP_MS);

setTimeout(() => { if (state.screen === 'boot') setState({ screen: 'main' }); }, BOOT_AUTO_MS);

setInterval(() => {
  if (state.screen !== 'playback' || state.play.isHold) return;
  const pos = Math.min(playLen(), +(state.play.pos + PLAY_TICK_MS / 1000).toFixed(1));
  setState({ play: { ...state.play, pos, isHold: pos >= playLen() } });
}, PLAY_TICK_MS);

// часы на экране
setInterval(() => { if (state.screen !== 'playback') render(); }, 15000);

fit();
render();
