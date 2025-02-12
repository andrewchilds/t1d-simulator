import { isNumber, isString } from './is.js';
import { pad } from './numbers.js';

export const ONE_SECOND = 1000;
export const ONE_MINUTE = ONE_SECOND * 60;
export const ONE_HOUR = ONE_MINUTE * 60;
export const ONE_DAY = ONE_HOUR * 24;

export const FIVE_MINUTES_IN_MS = ONE_MINUTE * 5;

export const DATE_FORMATS = {
  STANDARD: 'F j Y, g:i a',
  STANDARD_NO_YEAR: 'F j, g:i a',
  LONG: 'D, F j Y, g:i a',
  WEEKDAY: 'D, F j',
  WEEKDAY_LONG: 'L, F j',
  YYYYMMDD: 'Y-m-d',
  HHMMSS: 'H:i:s',
  HHMM: 'H:i',
  DATE_ONLY: 'F j, Y',
  LONG_DATE_ONLY: 'f j, Y',
  TIME_ONLY: 'g:i a'
};

// Based on: https://gist.github.com/barberboy/e39f8a21cb0b60813576
export const WEEKDAYS = {
  long: 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' '),
  short: 'Sun Mon Tue Wed Thu Fri Sat'.split(' ')
};
export const MONTHS = {
  long: 'January February March April May June July August September October November December'.split(' '),
  short: 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')
};

const FORMATTER = {
  d: date => pad(date.getDate()),
  D: date => WEEKDAYS.short[date.getDay()].substring(0, 3),
  j: date => String(date.getDate()),
  L: date => WEEKDAYS.long[date.getDay()],
  l: date => WEEKDAYS.short[date.getDay()],
  N: date => String((date.getDay()) ? date.getDay() : 7),
  w: date => String(date.getDay()),
  f: date => MONTHS.long[date.getMonth()],
  F: date => MONTHS.short[date.getMonth()],
  m: date => pad(FORMATTER.n(date)),
  M: date => FORMATTER.F(date).substring(0, 3),
  n: date => String(date.getMonth() + 1),
  Y: date => String(date.getFullYear()),
  y: date => FORMATTER.Y(date).substring(2, 4),
  a: date => (date.getHours() < 12) ? 'am' : 'pm',
  A: date => (date.getHours() < 12) ? 'AM' : 'PM',
  g: date => String((date.getHours() % 12) || 12),
  G: date => String(date.getHours()),
  h: date => pad(FORMATTER.g(date)),
  H: date => pad(FORMATTER.G(date)),
  i: date => pad(date.getMinutes()),
  s: date => pad(date.getSeconds()),
  O: date => date.toString().match(/GMT(.*) /)[1],
  T: date => date.toString().match(/\((.*)\)/)[1],
  Z: date => date.getTimezoneOffset() * 60,
  c: date => date.toISOString(),
  r: date => date.toString(),
  U: date => String(date.getTime())
};

export function formatDate(d, format) {
  if (isString(d) || isNumber(d)) {
    d = new Date(d);
  }

  return format.split('').map(ch => {
    return (ch in FORMATTER) ? FORMATTER[ch](d) : ch
  }).join('')
}

export function formatDateForInput(d) {
  return formatDate(d, DATE_FORMATS.YYYYMMDD) + 'T' + formatDate(d, DATE_FORMATS.HHMMSS);
}

// Converts a getTimezoneOffset() offset to one that can be used in new Date().
// Examples:
// Eastern Daylight Time: 240 -> '-04:00'
// India Standard Time: -330 -> '+05:30'
// Australian Central Western Standard Time: -525 -> '+08:45'
export function getTimezoneOffset(d) {
  return convertTimezoneOffset(d.getTimezoneOffset());
}

export function convertTimezoneOffset(offset) {
  const plusMinus = offset > 0 ? '-' : '+';
  const hours = Math.abs(Math.ceil(offset / 60)) + '';
  const minutes = (Math.abs(offset) % 60) + '';

  return `${plusMinus}${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}

export function getStartOfDay(d) {
  return new Date(formatDate(d, DATE_FORMATS.YYYYMMDD) + 'T00:00:00');
}

export function getEndOfDay(d) {
  return new Date(formatDate(d, DATE_FORMATS.YYYYMMDD) + 'T23:59:59');
}

export function getStartOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0);
}

export function getEndOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
}

export function offsetDateByHours(dateOrStr, offsetInHours) {
  let d = new Date(dateOrStr);
  d.setHours(d.getHours() + offsetInHours);
  return d;
}

export function setToBeginningOfHour(d) {
  d.setMinutes(0);
  d.setSeconds(0);
  d.setMilliseconds(0);

  return d;
}

export function setToBeginningOfDay(d) {
  d.setHours(0);
  d.setMinutes(0);
  d.setSeconds(0);
  d.setMilliseconds(0);

  return d;
}

export function secondsSoFar(d) {
  return d.getSeconds() + (60 * d.getMinutes()) + (60 * 60 * d.getHours());
}

export function diffInMilliseconds(dateString, currentDate) {
  const now = (currentDate || new Date()).getTime();
  const d = new Date(dateString).getTime();

  return now - d;
}
