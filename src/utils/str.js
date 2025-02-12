import { isNumber } from './is.js';

export function pluralize(n, singular, plural) {
  if (!isNumber(n)) {
    return n + ' ' + plural;
  }

  return [n.toLocaleString(), n === 1 ? singular : plural].join(' ');
}
