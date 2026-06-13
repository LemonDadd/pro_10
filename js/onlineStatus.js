import { showStatus } from './ui.js';
import { getMissingRequired, getMissingOptional } from './libRegistry.js';

const friendlyNames = {
  'CodeMirror': 'CodeMirror',
  'Prettier': 'Prettier',
  'Terser': 'JS 压缩',
  'Babel Standalone': 'Babel 转译'
};

function friendlyName(key) {
  return friendlyNames[key] || key;
}

export function updateOfflineStatus() {
  const missingRequired = getMissingRequired();
  const missingOptional = getMissingOptional();
  const isOnline = navigator.onLine;
  const allMissing = [...missingRequired, ...missingOptional];
  const names = allMissing.map(friendlyName);

  if (missingRequired.length > 0) {
    showStatus(`❌ 核心库未加载：${names.join('、')}，请检查 vendor 目录或网络`, 'error', true);
  } else if (!isOnline && missingOptional.length > 0) {
    showStatus(`📴 离线模式 / ${missingOptional.length} 项可选功能不可用：${names.join('、')}`, 'warning', true);
  } else if (!isOnline) {
    showStatus('📴 离线模式 / 核心功能可用', 'warning', true);
  } else if (missingOptional.length > 0) {
    showStatus(`⚠️ 部分可选功能不可用：${names.join('、')}`, 'warning', true);
  }
}

export function initOnlineStatus() {
  window.addEventListener('online', updateOfflineStatus);
  window.addEventListener('offline', updateOfflineStatus);
}
