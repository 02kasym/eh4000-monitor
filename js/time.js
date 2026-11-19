// Часовой пояс монитора: смещение от Гринвича в минутах. Хранится в браузере.
const STORE_KEY = 'eh4000-tz-offset-min';
export const TZ_STEP_MIN = 30;
export const TZ_MIN = -12 * 60;
export const TZ_MAX = 14 * 60;

const browserOffset = () => -new Date().getTimezoneOffset();

const load = () => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const n = raw === null ? NaN : Number(raw);
    return Number.isFinite(n) && n >= TZ_MIN && n <= TZ_MAX ? n : browserOffset();
  } catch {
    return browserOffset();
  }
};

let offsetMin = load();

export const getOffsetMin = () => offsetMin;

export const setOffsetMin = (m) => {
  offsetMin = Math.min(TZ_MAX, Math.max(TZ_MIN, m));
  try {
    localStorage.setItem(STORE_KEY, String(offsetMin));
  } catch {
    // хранилище недоступно — пояс действует до перезагрузки
  }
};

/** Дата, у которой getUTC*() возвращают местное время монитора. */
export const localNow = (base = Date.now()) => new Date(base + offsetMin * 60e3);

/** «+ 06:00» / «- 03:30» */
export const formatOffset = (m) => {
  const sign = m < 0 ? '-' : '+';
  const a = Math.abs(m);
  return `${sign} ${String(Math.floor(a / 60)).padStart(2, '0')}:${String(a % 60).padStart(2, '0')}`;
};
