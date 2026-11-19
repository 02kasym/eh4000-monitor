// Пиктограммы главного экрана (простые SVG, рисованные вручную).
const W = 'fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"';
const K = 'fill="none" stroke="#062" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"';

export const ICON = {
  truck: '<svg width="34" height="22" viewBox="0 0 34 22"><path d="M2 4h16l4 8h10v5H2z" fill="#fff"/><circle cx="8" cy="18" r="3.4" fill="#000" stroke="#fff" stroke-width="2"/><circle cx="26" cy="18" r="3.4" fill="#000" stroke="#fff" stroke-width="2"/></svg>',
  hourmeter: '<svg width="26" height="22" viewBox="0 0 26 22"><rect x="2" y="2" width="22" height="18" fill="none" stroke="#fff" stroke-width="2.4"/><path d="M6 6l14 10M20 6L6 16" stroke="#fff" stroke-width="2.4"/></svg>',
  arrowL: '<svg width="60" height="34" viewBox="0 0 60 34"><path d="M2 17L22 2v9h8v12h-8v9z" fill="#2dff3c"/><rect x="34" y="11" width="4" height="12" fill="#2dff3c"/><rect x="41" y="11" width="4" height="12" fill="#2dff3c"/><rect x="48" y="11" width="4" height="12" fill="#2dff3c"/></svg>',
  arrowR: '<svg width="60" height="34" viewBox="0 0 60 34"><path d="M58 17L38 2v9h-8v12h8v9z" fill="#2dff3c"/><rect x="22" y="11" width="4" height="12" fill="#2dff3c"/><rect x="15" y="11" width="4" height="12" fill="#2dff3c"/><rect x="8" y="11" width="4" height="12" fill="#2dff3c"/></svg>',
  retarder: `<svg width="44" height="40" viewBox="0 0 44 40"><text x="4" y="32" font-family="Roboto Condensed,sans-serif" font-size="30" font-weight="700" fill="#062">R</text><path d="M26 10l12-5M26 20h13M26 30l12 5" ${K}/></svg>`,
  workLight: `<svg width="44" height="40" viewBox="0 0 44 40"><path d="M20 12a10 9 0 1 1 0 16z" ${K}/><path d="M18 14l-10 6M18 22l-10 6M18 30l-10 6M24 4v6M18 6l3 5" ${K}/></svg>`,
  headlight: `<svg width="44" height="40" viewBox="0 0 44 40"><path d="M24 9c10 0 14 5 14 11s-4 11-14 11z" ${K}/><path d="M6 11h14M6 17h14M6 23h14M6 29h14" ${K}/></svg>`,
  oil: `<svg width="30" height="20" viewBox="0 0 30 20"><path d="M4 10h5l3-4h8l6 4M9 10v6h14l3-6" ${W}/></svg>`,
  coolant: `<svg width="30" height="22" viewBox="0 0 30 22"><path d="M3 4h12v14H3zM20 3v12M20 15a3 3 0 1 0 0.1 0M23 6h4M23 10h4" ${W}/></svg>`,
  trans: `<svg width="30" height="22" viewBox="0 0 30 22"><circle cx="9" cy="11" r="7" ${W}/><path d="M7 7l4 4-4 4M21 3v12M21 15a3 3 0 1 0 .1 0" ${W}/></svg>`,
  hyd: `<svg width="30" height="22" viewBox="0 0 30 22"><path d="M8 4h14v14H8zM3 11h5M22 11h5M15 1v3M12 9l3-3 3 3" ${W}/></svg>`,
  load: '<svg width="40" height="26" viewBox="0 0 40 26"><path d="M4 16h30l-4 7H8z" fill="#fff"/><path d="M14 4l6 9 6-9z" fill="#fff"/><circle cx="20" cy="3" r="2.5" fill="#fff"/></svg>',
  fuel: `<svg width="24" height="26" viewBox="0 0 24 26"><path d="M3 24V4h10v20M3 10h10M13 8l5 4v9a2 2 0 0 0 4 0V9l-3-3" ${W}/></svg>`,
  dump: '<svg width="36" height="22" viewBox="0 0 36 22"><path d="M2 18L30 4l4 6-26 10z" fill="#fff"/><circle cx="10" cy="20" r="2" fill="#fff"/></svg>',
  thermo: `<svg width="18" height="26" viewBox="0 0 18 26"><path d="M7 3v14a5 5 0 1 0 4 0V3z" ${W}/><path d="M9 9v10" stroke="#fff" stroke-width="3"/></svg>`,
};
