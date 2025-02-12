import themeStore from '../stores/theme.js';

export function initColorScheme() {
  const colorSchemeQueryList = window.matchMedia('(prefers-color-scheme: dark)');
  setColorScheme(colorSchemeQueryList);
  colorSchemeQueryList.addEventListener('change', setColorScheme);
}

function setColorScheme(e) {
  if (e.matches) {
    setDarkTheme();
  } else {
    setLightTheme();
  }
}

function setDarkTheme() {
  const el = document.documentElement;
  themeStore.update(theme => 'dark');
  el.classList.add('theme-dark');
  el.classList.remove('theme-light');
}

function setLightTheme() {
  const el = document.documentElement;
  themeStore.update(theme => 'light');
  el.classList.add('theme-light');
  el.classList.remove('theme-dark');
}
