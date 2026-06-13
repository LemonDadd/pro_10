import { loadAllScripts } from './loadScripts.js';
import { initTheme } from './theme.js';
import { initPrettierPlugins } from './formatters.js';
import { initEditors, updateOptionsUI } from './editors.js';
import { bindEvents } from './bindEvents.js';
import { loadStateFromHash } from './hashState.js';
import { initOnlineStatus, updateOfflineStatus } from './onlineStatus.js';
import { showStatus } from './ui.js';

async function main() {
  try {
    showStatus('正在加载脚本...', '');

    await loadAllScripts();

    initTheme();
    initPrettierPlugins();
    initEditors();
    bindEvents();
    updateOptionsUI();
    loadStateFromHash();
    initOnlineStatus();

    setTimeout(() => {
      updateOfflineStatus();
    }, 100);

    setTimeout(() => {
      const cm = window.CodeMirror;
      if (!cm) {
        showStatus('❌ CodeMirror 加载失败，检查 vendor 目录或网络', 'error', true);
      }
    }, 500);

  } catch (error) {
    console.error('初始化失败:', error);
    showStatus(`初始化失败: ${error.message}`, 'error', true);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
