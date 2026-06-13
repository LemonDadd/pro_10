import { state } from './state.js';
import { toggleTheme } from './theme.js';
import { switchLanguage, switchView, saveStateToHash, loadStateFromHash } from './hashState.js';
import { formatCode } from './formatters.js';
import { minifyCode } from './minifiers.js';
import { swapContent, clearAll, copyOutput, downloadFile, updateOptionsUI } from './editors.js';
import { runAutoprefixer } from './autoprefixer.js';
import {
  convertColor, convertPxRem, escapeHtml, unescapeHtml, runBabel,
  validateJson, sortJson, flattenJson, encodeBase64, decodeBase64
} from './utils.js';
import { detectLanguage } from './ui.js';

function bindEditorEvents() {
  document.getElementById('formatBtn').addEventListener('click', formatCode);
  document.getElementById('minifyBtn').addEventListener('click', minifyCode);
  document.getElementById('swapBtn').addEventListener('click', swapContent);
  document.getElementById('clearBtn').addEventListener('click', clearAll);
  document.getElementById('copyBtn').addEventListener('click', copyOutput);
  document.getElementById('downloadBtn').addEventListener('click', downloadFile);
  document.getElementById('detectLangBtn').addEventListener('click', detectLanguage);
}

function bindOptionsEvents() {
  document.getElementById('tabWidth').addEventListener('change', (e) => {
    state.options.tabWidth = parseInt(e.target.value) || 2;
    updateOptionsUI();
    saveStateToHash();
  });

  document.getElementById('printWidth').addEventListener('change', (e) => {
    state.options.printWidth = parseInt(e.target.value) || 80;
    saveStateToHash();
  });

  document.getElementById('singleQuote').addEventListener('change', (e) => {
    state.options.singleQuote = e.target.checked;
    saveStateToHash();
  });

  document.getElementById('semi').addEventListener('change', (e) => {
    state.options.semi = e.target.checked;
    saveStateToHash();
  });

  document.getElementById('trailingComma').addEventListener('change', (e) => {
    state.options.trailingComma = e.target.value;
    saveStateToHash();
  });

  document.getElementById('syncScroll').addEventListener('change', (e) => {
    state.options.syncScroll = e.target.checked;
    saveStateToHash();
  });

  document.getElementById('lineNumbers').addEventListener('change', (e) => {
    state.options.lineNumbers = e.target.checked;
    updateOptionsUI();
    saveStateToHash();
  });

  document.getElementById('lineWrapping').addEventListener('change', (e) => {
    state.options.lineWrapping = e.target.checked;
    updateOptionsUI();
    saveStateToHash();
  });
}

function bindUtilsEvents() {
  document.getElementById('runAutoprefixerBtn').addEventListener('click', runAutoprefixer);

  document.getElementById('convertColorBtn').addEventListener('click', convertColor);
  document.getElementById('convertPxRemBtn').addEventListener('click', convertPxRem);
  document.getElementById('escapeHtmlBtn').addEventListener('click', escapeHtml);
  document.getElementById('unescapeHtmlBtn').addEventListener('click', unescapeHtml);
  document.getElementById('runBabelBtn').addEventListener('click', runBabel);
  document.getElementById('validateJsonBtn').addEventListener('click', validateJson);
  document.getElementById('sortJsonBtn').addEventListener('click', sortJson);
  document.getElementById('flattenJsonBtn').addEventListener('click', flattenJson);
  document.getElementById('encodeBase64Btn').addEventListener('click', encodeBase64);
  document.getElementById('decodeBase64Btn').addEventListener('click', decodeBase64);
}

function bindKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (state.currentView === 'editor') {
        formatCode();
      } else if (state.currentView === 'autoprefixer') {
        runAutoprefixer();
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
      e.preventDefault();
      if (state.currentView === 'editor') {
        minifyCode();
      }
    }
  });
}

export function bindEvents() {
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  document.querySelectorAll('.view-tab').forEach(tab => {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  });

  document.querySelectorAll('.lang-tab').forEach(tab => {
    tab.addEventListener('click', () => switchLanguage(tab.dataset.lang));
  });

  bindEditorEvents();
  bindOptionsEvents();
  bindUtilsEvents();
  bindKeyboardShortcuts();

  window.addEventListener('hashchange', loadStateFromHash);
}
