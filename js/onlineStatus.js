import { showStatus } from './ui.js';
import { scriptManifest } from './scriptManifest.js';

function checkLibAvailability() {
  const libs = {
    CodeMirror: { name: 'CodeMirror', required: true, global: 'CodeMirror' },
    prettier: { name: 'Prettier', required: true, global: 'prettier' },
    terser: { name: 'JS 压缩', required: false, global: 'Terser' },
    babel: { name: 'Babel 转译', required: false, global: 'Babel' }
  };

  const missing = [];

  for (const lib of Object.values(libs)) {
    const parts = lib.global.split('.');
    let val = window;
    let found = true;
    for (const part of parts) {
      if (val == null || val[part] == null) {
        found = false;
        break;
      }
      val = val[part];
    }
    if (!found) {
      missing.push(lib.name);
    }
  }

  return { missing, isOnline: navigator.onLine };
}

export function updateOfflineStatus() {
  const { missing, isOnline } = checkLibAvailability();

  if (!isOnline && missing.length > 0) {
    showStatus(`📴 离线模式 / ${missing.length} 项功能不可用：${missing.join('、')}`, 'error', true);
  } else if (!isOnline) {
    showStatus('📴 离线模式 / 核心功能可用', 'warning', true);
  } else if (missing.length > 0) {
    showStatus(`⚠️ 部分功能不可用：${missing.join('、')}`, 'warning', true);
  }
}

export function initOnlineStatus() {
  updateOfflineStatus();

  window.addEventListener('online', updateOfflineStatus);
  window.addEventListener('offline', updateOfflineStatus);
}
