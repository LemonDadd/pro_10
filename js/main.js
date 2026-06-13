import { loadAllScripts } from './loadScripts.js';
import { initTheme } from './theme.js';
import { initPrettierPlugins } from './formatters.js';
import { initEditors, updateOptionsUI } from './editors.js';
import { bindEvents } from './bindEvents.js';
import { loadStateFromHash } from './hashState.js';
import { initOnlineStatus, updateOfflineStatus } from './onlineStatus.js';
import { showStatus } from './ui.js';
import { getMissingRequired } from './libRegistry.js';

async function main() {
  try {
    showStatus('正在加载脚本...', '');

    const results = await loadAllScripts();

    const missingRequired = getMissingRequired();
    if (missingRequired.length > 0) {
      updateOfflineStatus();
      return;
    }

    initTheme();
    initPrettierPlugins();
    initEditors();
    bindEvents();
    updateOptionsUI();
    loadStateFromHash();
    initOnlineStatus();

    updateOfflineStatus();

    showStatus('就绪', 'success');

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
