import { state, editors } from './state.js';

export function initTheme() {
  const savedTheme = localStorage.getItem('codebeautify-theme');
  if (savedTheme) {
    state.theme = savedTheme;
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    state.theme = 'dark';
  }
  applyTheme();
}

export function applyTheme() {
  document.body.classList.remove('theme-light', 'theme-dark');
  document.body.classList.add(`theme-${state.theme}`);

  const cmTheme = state.theme === 'dark' ? 'dracula' : 'eclipse';
  if (editors.input) editors.input.setOption('theme', cmTheme);
  if (editors.output) editors.output.setOption('theme', cmTheme);
  if (editors.autoInput) editors.autoInput.setOption('theme', cmTheme);

  localStorage.setItem('codebeautify-theme', state.theme);
}

export function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  applyTheme();
}
