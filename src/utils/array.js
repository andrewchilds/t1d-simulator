
export function createRange(start, end, step = 1, defaultValue = false) {
  const a = [];
  for (let i = start; i <= end; i += step) {
    if (defaultValue === false) {
      a.push(i);
    } else {
      a.push(defaultValue);
    }
  }

  return a;
}

// Ref: https://stackoverflow.com/a/4550514/440094
export function randomValueFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomValuesFrom(arr, count) {
  let values = [];
  let shutoff = 1000;

  if (arr.length <= count) {
    return arr;
  }

  while (values.length < count || shutoff === 0) {
    let val = randomValueFrom(arr);
    if (!values.includes(val)) {
      values.push(val);
    }
    shutoff -= 1;
  }

  return values;
}

export function shuffleExisting(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// Calculating mean, quantiles, stdev
// https://stackoverflow.com/a/55297611/440094

export function sortAscending(arr) {
  return arr.sort((a, b) => a - b);
}

export function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

export function mean(arr) {
  return sum(arr) / arr.length;
}

export function stdDev(arr) {
  const mu = mean(arr);
  const diffArr = arr.map(a => (a - mu) ** 2);

  return Math.sqrt(sum(diffArr) / (arr.length - 1));
}
