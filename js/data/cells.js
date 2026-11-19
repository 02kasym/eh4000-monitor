// Конструкторы ячеек экрана мониторинга (сетка 2 колонки × 4 строки).
// null в value => на экране показывается «---».

export const bar = (label, min, max, unit, value = 0, lo, hi) => ({
  kind: 'bar', label, min, max, unit, value,
  lo: lo ?? value ?? 0,
  hi: hi ?? value ?? 0,
});

export const val = (label, value, unit = '') => ({ kind: 'val', label, value, unit });

export const sw = (label, isOn = false) => ({ kind: 'sw', label, isOn });

export const ready = (label) => ({ kind: 'txt', label, value: 'ГОТОВО' });

export const blank = null;

// Часто повторяющиеся поля
export const RPM = () => bar('Обороты двигателя', 0, 2500, 'min-1', null, 0, 0);
export const RPM_DSC = () => bar('Обороты двигателя (DSC)', 0, 2500, 'min-1', 0);
export const SPEED = () => bar('Скорость машины', 0, 60, 'km/h', 0);
export const PEDAL_ACC = () => bar('Положение педали акселератора', 0, 100, '%', 0);
export const PEDAL_BRK = () => bar('Положение педали тормоза', 0, 100, '%', 0);
export const HOIST_LEVER = () => val('Положение рычага подъемника', 'F');
export const SHIFT_LEVER = () => val('Положение рычага переключения', 'N');
export const BODY_ANGLE = () => bar('Угол кузова', 0, 100, '%', 0);
export const HOIST_ANGLE = () => bar('Угол рычага подъемника', 0, 100, '%', 31);
export const TORQUE = (label, v = 0) => bar(label, -32000, 32255, 'Nm', v);
export const WHEEL = (label, v = 0) => bar(label, -250, 251, 'km/h', v);
export const AMP = (label, v = 0, lo, hi) => bar(label, 0, 3212, 'A', v, lo, hi);
export const VOLT = (label, v = 0, lo, hi) => bar(label, 0, 3212, 'V', v, lo, hi);
export const KW = (label, v = 0) => bar(label, 0, 32127, 'kW', v);
export const TEMP = (label, v) => val(label, v, 'c');
export const MPA = (label, v = '0.0') => val(label, v, 'MPa');

/** Страница: подзаголовок + левая и правая колонки по 4 ячейки. */
export const page = (title, left, right) => ({ title, left, right });
