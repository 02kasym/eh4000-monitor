// Реестр экранов раздела настроек/журналов. Ключ — id экрана для навигационного стека.
import { menuScreen, formScreen, ioScreen } from './kit.js';
import {
  maintScreen, faultsScreen, machineDataScreen, timeScreen, tiltScreen, autolubeScreen, vehicleScreen,
} from './screens-custom.js';
import { CCU, IDU, DLU } from './data-io.js';

const STAR_PRESSES_TO_UNLOCK = 3;

const DISPLAY_ROWS = [
  { label: 'Вид единицы скорости', value: 'km/h', options: ['km/h', 'MPH'] },
  { label: 'Вид единицы расстояния', value: 'Km', options: ['Km', 'мили'] },
  { label: 'Вид единицы веса', value: 'M-ton', options: ['M-ton', 'S-ton'] },
  { label: 'Ед.изм.темп.', value: 'уровень C', options: ['уровень C', 'уровень F'] },
  { label: 'Вид часов', value: '24часа', options: ['24часа', '12часов'] },
  { label: 'Отображенная нагрузка', value: 'Тип 1', options: ['Тип 1', 'Тип 2', 'Тип 3'] },
  { label: 'Тип индикатора', value: 'ISO', options: ['ISO', 'GB'] },
];

const LANGS = ['Английский', 'Японский', 'Испанский', 'Французский', 'португальский', 'Русский', 'Турецкий'];

export const SCREENS = {
  // --- из меню сервиса ---
  maintLog: maintScreen('log'),
  machineData: machineDataScreen,
  faults: faultsScreen,

  // --- «Различные настройки» → Меню настроек ---
  settings: menuScreen({
    title: 'Меню настроек',
    items: [
      'Настройка технического обслуживания', 'Инициализация данных ручной фиксации', 'Настройка времени',
      'Калибровка угла кузова', 'Калибровка датчика наклона', 'Калибровка NMH', 'Настройка нагрузки',
      'Настр. авт. смаз. маш. маслом',
    ],
    targets: ['maintSetup', 'snapshot', 'time', 'bodyAngle', 'tilt', 'nmh', 'loadParams', 'autolube'],
    badge: (st) => '+'.repeat(st.plus ?? 0),
    star: (st) => {
      const plus = (st.plus ?? 0) + 1;
      if (plus >= STAR_PRESSES_TO_UNLOCK) return { st: { ...st, plus: 0 }, push: 'settings2' };
      return { st: { ...st, plus } };
    },
  }),
  maintSetup: maintScreen('setup'),
  snapshot: menuScreen({
    title: 'Настройка снимка',
    items: ['Инициализация данных ручной фиксации'],
    targets: [(st, ctx) => {
      ctx.clearRecords();
      return { st: { ...st, msg: 'Данные ручной фиксации инициализированы' } };
    }],
  }),
  time: timeScreen,
  bodyAngle: formScreen({
    title: 'Калибровка угла кузова',
    hints: [['ud', 'Выбрать'], ['x', 'Назад'], ['o', 'устан.']],
    rows: [
      { label: 'Угол опускания кузова', value: '45', unit: '[degree]', msg: 'Задайте угол на машине' },
      { label: 'Угол подъема кузова', value: '135', unit: '[degree]', msg: 'Задайте угол на машине' },
      { label: 'Начать калибровку', button: true, msg: 'Калибровка: поднимите и опустите кузов' },
      { label: 'Контроль удара кузова', value: 'ВКЛ', toggle: true },
    ],
  }),
  tilt: tiltScreen({ title: 'Калибровка датчика наклона', isCombined: false }),
  nmh: formScreen({
    title: 'Калибровка NMH',
    hints: [['x', 'Назад']],
    startSel: 1,
    rows: [
      { label: 'Настройки NMH', value: '163', unit: 'тонна', ro: true },
      { label: 'Измерение NMH', value: '178', unit: 'тонна', msg: 'Измерение NMH выполнено' },
    ],
    note: 'Это знач. предпол. полн. загруз. топлива',
  }),
  loadParams: formScreen({
    title: 'Настройка параметров нагрузки',
    hints: [['ud', 'Выбрать'], ['x', 'Отмена'], ['o', 'Изменить']],
    rows: [
      { label: 'Номинальная нагрузка[кг]', value: '221000', msg: 'Значение изменяется только на машине' },
      { label: 'Тип передних шин', value: '46/90R57', options: ['40.00R57', '46/90R57', 'Другое'] },
      { label: 'Вес передних шин[кг]', value: '4000', msg: 'Значение изменяется только на машине' },
      { label: 'Тип задних шин', value: '46/90R57', options: ['40.00R57', '46/90R57', 'Другое'] },
      { label: 'Вес задних шин[кг]', value: '4000', msg: 'Значение изменяется только на машине' },
      { label: 'Сопротивление движению[%]', value: '2.5', msg: 'Значение изменяется только на машине' },
    ],
  }),
  autolube: autolubeScreen,

  // --- Меню настроек-2 (✱✱✱ в «Меню настроек») ---
  settings2: menuScreen({
    title: 'Меню настроек-2',
    items: [
      'Задать язык', 'Меню монитора ввода-вывода', 'Настройка режима механика по обслуживанию',
      'Настройка и калибровка для специалиста по ремонту', 'Установка отображения', 'Состояние устройства связи',
    ],
    targets: ['language', 'ioMenu', 'mechanic', 'repair', 'display', 'comm'],
  }),
  language: menuScreen({
    title: 'Задать язык',
    items: LANGS,
    targets: LANGS.map((l) => (st) => ({ st: { ...st, msg: `Выбран язык: ${l}` } })),
  }),
  ioMenu: menuScreen({
    title: 'Меню монитора ввода-вывода',
    items: ['МОНИТОР CCU', 'МОНИТОР IDU', 'МОНИТОР DLU'],
    targets: ['ioCCU', 'ioIDU', 'ioDLU'],
  }),
  ioCCU: ioScreen('МОНИТОР CCU', CCU),
  ioIDU: ioScreen('МОНИТОР IDU', IDU),
  ioDLU: ioScreen('МОНИТОР DLU', DLU),
  mechanic: formScreen({
    title: 'Настройка режима механика по обслуживанию',
    rows: (ctx) => [
      { label: 'Экран измерений', section: true },
      { label: 'Цифровой дисплей (ВКЛ/ВЫКЛ)', value: ctx.isDigital() ? 'ВКЛ' : 'ВЫКЛ', toggle: true, id: 'digital' },
      { label: 'Врем.интервал смены сообщ.', value: '3', options: ['1', '2', '3', '4', '5'] },
      { label: 'Управл. сиреной', section: true },
      { label: 'Превышение возм. торможения (ВКЛ/ВЫКЛ)', value: 'ВКЛ', toggle: true },
      { label: 'Рабочая настройка', section: true },
      { label: 'Тип управления зарядкой аккумулятора', value: '2', ro: true },
    ],
    onChange: (row, ctx) => { if (row.id === 'digital') ctx.setDigital(row.value === 'ВКЛ'); },
  }),
  repair: menuScreen({
    title: 'Настройка и калибровка для специалиста по ремонту',
    items: ['Наклон / комбинированная калибровка сенсора', 'Калибровка сенсора угла рулевого управления',
      'Настройки топливного бака', 'Настройка транспортного средства'],
    targets: ['tiltCombined', 'steering', 'fuelTank', 'vehicle'],
  }),
  tiltCombined: tiltScreen({ title: 'Наклон / комбинированная калибровка сенсора', isCombined: true }),
  steering: formScreen({
    title: 'Калибровка сенсора угла рулевого управления',
    hints: [['x', 'Назад'], ['o', 'устан.']],
    rows: [{ label: 'Настр. сенсора угла рул. упр.', value: '', msg: 'Сенсор угла руля откалиброван' }],
  }),
  fuelTank: formScreen({
    title: 'Настройки топливного бака',
    hints: [['x', 'Назад'], ['o', 'устан.']],
    rows: [{ label: 'Топливный бак', value: 'Стандартный размер', options: ['Стандартный размер', 'Опция (Больш.) размер'] }],
  }),
  vehicle: vehicleScreen,
  display: formScreen({
    title: 'Установка отображения',
    hints: [['ud', 'Выбрать'], ['star', 'По умолч.'], ['x', 'Назад'], ['o', 'Изменить']],
    rows: DISPLAY_ROWS,
    star: (st) => ({ st: { ...st, rows: DISPLAY_ROWS.map((r) => ({ ...r })), msg: 'Восстановлены значения по умолчанию' } }),
  }),
  comm: formScreen({
    title: 'Состояние устройства связи',
    hints: [['x', 'Назад']],
    rows: [
      { label: 'Статус GPS', value: '1', ro: true },
      { label: 'Состояние терминала связи', section: true },
      { label: 'Интенсивность радиоволн', value: '2', ro: true },
      { label: 'Состояние передачи данных', value: '0', ro: true },
      { label: 'Состояние модуля связи', value: '0', ro: true },
      { label: 'Принимаемый сигнал антенны', value: '16', ro: true },
      { label: 'Состояние разъёма сети GPRS', value: '1', ro: true },
      { label: 'Частота радиоволн', value: '3', ro: true },
    ],
  }),
};
