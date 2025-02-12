export function isArray(v) {
  return Array.isArray(v);
}

export function isObject(v) {
  return !isArray(v) && typeof v === 'object' && v !== null;
}

export function isBoolean(o) {
  return o === true || o === false;
}

export function isUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export function isEmail(str) {
  return /^.+@.+\..+$/.test(str);
}

export function isString(v) {
  return typeof v === 'string';
}

export function isNumber(v) {
  return typeof v === 'number';
}

export function isLocalhost() {
  return window.location.origin === 'https://localhost' || window.location.origin === 'http://localhost';
}
