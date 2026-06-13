import { state, editors } from './state.js';
import { languages } from './languages.js';

export function showStatus(message, type = '', persistent = false) {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.className = 'status-message ' + type;

  if (type && !persistent) {
    setTimeout(() => {
      statusEl.className = 'status-message';
      statusEl.textContent = '就绪';
    }, 3000);
  }
}

export function showToast(message, type = '') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 2000);
}

export function updateStats() {
  const inputText = editors.input ? editors.input.getValue() : '';
  const outputText = editors.output ? editors.output.getValue() : '';

  document.getElementById('inputStats').textContent = `${inputText.length} 字符, ${inputText.split('\n').length} 行`;
  document.getElementById('outputStats').textContent = `${outputText.length} 字符, ${outputText.split('\n').length} 行`;

  if (inputText.length > 0 && outputText.length > 0 && outputText.length < inputText.length) {
    const rate = ((1 - outputText.length / inputText.length) * 100).toFixed(1);
    document.getElementById('compressionRate').textContent = `${rate}%`;
    document.getElementById('compressionRow').classList.remove('hidden');
  } else {
    document.getElementById('compressionRow').classList.add('hidden');
  }
}

export function updateCursorPosition() {
  if (!editors.input) return;
  const cursor = editors.input.getCursor();
  document.getElementById('cursorPosition').textContent = `行 ${cursor.line + 1}, 列 ${cursor.ch + 1}`;
}

export function detectLanguage() {
  const code = editors.input ? editors.input.getValue() : '';
  if (!code.trim()) {
    showStatus('请输入代码后再检测', 'error');
    return;
  }

  let detected = 'text';
  const firstLine = code.trim().split('\n')[0];

  if (firstLine.startsWith('<!DOCTYPE') || code.includes('<html') || code.includes('<[')) {
    detected = 'html';
  } else if (code.match(/^[\{\[]/) && code.match(/[\}\]]$/) && code.includes(':')) {
    try {
      JSON.parse(code);
      detected = 'json';
    } catch (e) {}
  } else if (firstLine.startsWith('<?xml')) {
    detected = 'xml';
  } else if (code.includes('SELECT') || code.includes('INSERT') || code.includes('UPDATE') || code.includes('DELETE')) {
    detected = 'sql';
  } else if (code.includes('function') || code.includes('const ') || code.includes('let ') || code.includes('=>')) {
    if (code.includes(': string') || code.includes(': number') || code.includes(': boolean') || code.includes('interface ')) {
      detected = 'typescript';
    } else {
      detected = 'javascript';
    }
  } else if (code.includes('{') && code.includes(':') && (code.includes('px') || code.includes('em') || code.includes('rem') || code.includes('%') || code.includes('#'))) {
    if (code.includes('$') || code.includes('@mixin') || code.includes('@include')) {
      detected = 'scss';
    } else {
      detected = 'css';
    }
  } else if (code.includes('# ') || code.includes('## ') || code.includes('### ') || code.includes('```') || code.includes('**')) {
    detected = 'markdown';
  }

  if (languages[detected]) {
    import('./hashState.js').then(({ switchLanguage }) => {
      switchLanguage(detected);
    });
    showStatus(`检测到语言: ${languages[detected].name}`, 'success');
  } else {
    showStatus('无法自动检测语言', 'error');
  }
}
