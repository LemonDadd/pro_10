import { state, editors } from './state.js';
import { languages } from './languages.js';
import { updateEditorMode } from './editors.js';
import { updateOptionsUI } from './editors.js';

export function saveStateToHash() {
  const stateToSave = {
    lang: state.currentLang,
    view: state.currentView,
    options: state.options
  };

  try {
    const json = JSON.stringify(stateToSave);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    if (encoded.length < 4096) {
      history.replaceState(null, '', `#${encoded}`);
    }
  } catch (e) {
    console.warn('无法保存状态到 URL hash:', e);
  }
}

export function loadStateFromHash() {
  const hash = window.location.hash.slice(1);
  if (!hash) return;

  try {
    const json = decodeURIComponent(escape(atob(hash)));
    const savedState = JSON.parse(json);

    if (savedState.lang && languages[savedState.lang]) {
      switchLanguage(savedState.lang);
    }
    if (savedState.view) {
      switchView(savedState.view);
    }
    if (savedState.options) {
      Object.assign(state.options, savedState.options);
      updateOptionsUI();
    }
  } catch (e) {
    console.warn('无法从 URL hash 恢复状态:', e);
  }
}

export function switchLanguage(lang) {
  if (!languages[lang]) return;

  state.currentLang = lang;

  document.querySelectorAll('.lang-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.lang === lang);
  });

  updateEditorMode();
  saveStateToHash();
}

export function switchView(view) {
  state.currentView = view;

  document.querySelectorAll('.view-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === view);
  });

  document.querySelectorAll('.view').forEach(v => {
    v.classList.toggle('active', v.id === `view-${view}`);
  });

  saveStateToHash();
}
