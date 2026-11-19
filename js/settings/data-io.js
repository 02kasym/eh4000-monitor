// Мониторы входов/выходов CCU / IDU / DLU.
const seq = (prefix, from, to, values, unit = '') =>
  Array.from({ length: to - from + 1 }, (_, i) => [`${prefix}${from + i}`, values(i), unit]);

const onAt = (set) => (i) => (set.includes(i) ? 'ВКЛ' : 'ВЫКЛ');
const OFF = () => 'ВЫКЛ';
const DASH = () => '————';

export const CCU = [
  { left: { head: 'AI1', rows: seq('AN_IN', 0, 15, DASH, 'V') },
    right: { head: 'AI2', rows: seq('AN_IN', 16, 22, DASH, 'V') } },
  { left: { head: 'DI1', rows: seq('DG_IN', 0, 15, onAt([4])) },
    right: { head: 'DI2', rows: seq('DG_IN', 16, 31, (i) => onAt([0, 7, 11, 13])(i)) } },
  { left: { head: 'DO1', rows: seq('OC_OUT', 0, 15, OFF) },
    right: { head: 'DO2', rows: seq('OC_OUT', 16, 28, OFF) } },
  { left: { head: 'DO3', rows: [...seq('RLY_OUT', 0, 11, onAt([3, 4])), ...seq('SOL_OUT', 0, 3, OFF)] },
    right: { head: 'POWER', rows: [['MAIN_B', '————', 'V'], ['ALT_IN', '————', 'V'], ['24V_OUT', '————', 'V'], ['5V_OUT', '————', 'V']] } },
  { left: { head: 'PWMOUT1', rows: [
      ...seq('SOL_PWM_OUT', 0, 7, (i) => ['0.0', '0.0', '44.3', '0.0', '34.7', '0.0', '0.0', '0.0'][i], '%'),
      ...seq('SOL_PWM_FB', 0, 7, (i) => ['4', '4', '439', '4', '498', '5', '4', '4'][i], 'mA')] },
    right: { head: 'PWMOUT2', rows: seq('G_PWM_OUT', 0, 5, () => '0.0', '%') } },
];

export const IDU = [
  { left: { head: 'DO1', rows: seq('OC_OUT', 0, 15, OFF) }, right: { head: 'DO2', rows: [] } },
  { left: { head: 'DI1', rows: seq('DG_IN', 0, 14, OFF) },
    right: { head: 'DI2', rows: [...seq('DG_IN', 15, 22, OFF), ...seq('PLS_IN', 0, 7, onAt([1, 2]))] } },
  { left: { head: 'AI1', rows: seq('AN_IN', 0, 11,
      (i) => ['0.00', '0.00', '0.00', '0.00', '2.82', '3.98', '3.28', '3.97', '3.90', '3.88', '4.70', '4.70'][i], 'v') },
    right: { head: 'AI2', rows: [] } },
];

export const DLU = [
  { left: { head: 'AI', rows: seq('AN_IN', 0, 11,
      (i) => ['3.91', '0.00', '0.00', '3.98', '3.95', '3.98', '3.95', '0.00', '2.31', '2.97', '2.50', '2.24'][i], 'v') },
    right: { head: 'DI', rows: [...seq('DG_IN', 0, 4, OFF), ['KEY_SW0', 'ВКЛ'], ['KEY_SW1', 'ВКЛ'], ['KEY_SW2', 'ВКЛ']] } },
];
