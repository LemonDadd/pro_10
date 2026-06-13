import { state, editors } from './state.js';
import { languages } from './languages.js';
import { showStatus, showToast, updateStats, updateCursorPosition } from './ui.js';
import { saveStateToHash } from './hashState.js';

function createEditor(textareaId, mode, readOnly = false) {
  const textarea = document.getElementById(textareaId);
  if (!textarea) return null;

  const editor = CodeMirror.fromTextArea(textarea, {
    mode: mode,
    theme: state.theme === 'dark' ? 'dracula' : 'eclipse',
    lineNumbers: state.options.lineNumbers,
    lineWrapping: state.options.lineWrapping,
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    matchBrackets: true,
    autoCloseBrackets: true,
    styleActiveLine: true,
    indentUnit: state.options.tabWidth,
    tabSize: state.options.tabWidth,
    indentWithTabs: false,
    readOnly: readOnly,
    viewportMargin: Infinity
  });

  return editor;
}

function setupSyncScroll() {
  let isSyncing = false;

  editors.input.on('scroll', () => {
    if (!isSyncing && state.options.syncScroll) {
      isSyncing = true;
      const info = editors.input.getScrollInfo();
      editors.output.scrollTo(info.left, info.top);
      isSyncing = false;
    }
  });

  editors.output.on('scroll', () => {
    if (!isSyncing && state.options.syncScroll) {
      isSyncing = true;
      const info = editors.output.getScrollInfo();
      editors.input.scrollTo(info.left, info.top);
      isSyncing = false;
    }
  });
}

export function updateEditorMode() {
  const langConfig = languages[state.currentLang];
  if (editors.input) {
    editors.input.setOption('mode', { name: langConfig.mode });
    editors.output.setOption('mode', { name: langConfig.mode });
  }
  document.getElementById('langIndicator').textContent = langConfig.name;
}

export function initEditors() {
  const langConfig = languages[state.currentLang];

  editors.input = createEditor('inputEditor', { name: langConfig.mode });
  editors.output = createEditor('outputEditor', { name: langConfig.mode }, true);
  editors.autoInput = createEditor('autoInputEditor', { name: 'css' });

  editors.input.setValue(langConfig.example);

  editors.input.on('change', () => {
    updateStats();
    updateCursorPosition();
  });

  editors.input.on('cursorActivity', updateCursorPosition);

  editors.output.on('change', updateStats);

  if (state.options.syncScroll) {
    setupSyncScroll();
  }

  updateStats();
}

export function swapContent() {
  if (!editors.input || !editors.output) return;
  const temp = editors.input.getValue();
  editors.input.setValue(editors.output.getValue());
  editors.output.setValue(temp);
  showStatus('内容已交换', 'success');
}

export function clearAll() {
  if (editors.input) editors.input.setValue('');
  if (editors.output) editors.output.setValue('');
  showStatus('已清空', 'success');
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast('已复制到剪贴板', 'success');
  } catch (error) {
    showToast('复制失败', 'error');
  }
  document.body.removeChild(textarea);
}

export function copyOutput() {
  const text = editors.output ? editors.output.getValue() : '';
  if (!text) {
    showStatus('没有可复制的内容', 'error');
    return;
  }

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('已复制到剪贴板', 'success');
    }).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

export function downloadFile() {
  const text = editors.output ? editors.output.getValue() : '';
  if (!text) {
    showStatus('没有可下载的内容', 'error');
    return;
  }

  const langConfig = languages[state.currentLang];
  const blob = new Blob([text], { type: langConfig.mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `formatted${langConfig.ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('文件已下载', 'success');
}

export function updateOptionsUI() {
  document.getElementById('tabWidth').value = state.options.tabWidth;
  document.getElementById('printWidth').value = state.options.printWidth;
  document.getElementById('singleQuote').checked = state.options.singleQuote;
  document.getElementById('semi').checked = state.options.semi;
  document.getElementById('trailingComma').value = state.options.trailingComma;
  document.getElementById('syncScroll').checked = state.options.syncScroll;
  document.getElementById('lineNumbers').checked = state.options.lineNumbers;
  document.getElementById('lineWrapping').checked = state.options.lineWrapping;

  if (editors.input) {
    editors.input.setOption('lineNumbers', state.options.lineNumbers);
    editors.input.setOption('lineWrapping', state.options.lineWrapping);
    editors.input.setOption('indentUnit', state.options.tabWidth);
    editors.input.setOption('tabSize', state.options.tabWidth);
    editors.output.setOption('lineNumbers', state.options.lineNumbers);
    editors.output.setOption('lineWrapping', state.options.lineWrapping);
  }
}
