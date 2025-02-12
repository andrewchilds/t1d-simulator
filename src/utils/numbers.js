export function pad(n) {
  return (n + '').padStart(2, '0');
}

export function roundToBasalPrecision(n) {
  const rounded = Math.floor(n * 20);

  return twoDecimals(rounded / 20);
}

export function oneDecimal(n) {
  return parseFloat(n.toFixed(1));
}

export function twoDecimals(n) {
  return parseFloat(n.toFixed(2));
}

export function randomInt(min, max) {
  return Math.round((Math.random() * (max - min)) + min);
}
