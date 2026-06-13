import { editors } from './state.js';
import { showStatus } from './ui.js';

const prefixMap = {
  'display: flex': ['display: -webkit-box', 'display: -ms-flexbox', 'display: flex'],
  'display: grid': ['display: -ms-grid', 'display: grid'],
  'display: inline-flex': ['display: -webkit-inline-box', 'display: -ms-inline-flexbox', 'display: inline-flex'],
  'display: inline-grid': ['display: -ms-inline-grid', 'display: inline-grid'],
  'flex:': ['-webkit-box-flex:', '-ms-flex:', 'flex:'],
  'flex-direction:': ['-webkit-box-orient:', '-webkit-box-direction:', '-ms-flex-direction:', 'flex-direction:'],
  'flex-wrap:': ['-ms-flex-wrap:', 'flex-wrap:'],
  'justify-content:': ['-webkit-box-pack:', '-ms-flex-pack:', 'justify-content:'],
  'align-items:': ['-webkit-box-align:', '-ms-flex-align:', 'align-items:'],
  'align-content:': ['-ms-flex-line-pack:', 'align-content:'],
  'order:': ['-webkit-box-ordinal-group:', '-ms-flex-order:', 'order:'],
  'flex-grow:': ['-webkit-box-flex:', '-ms-flex-positive:', 'flex-grow:'],
  'flex-shrink:': ['-ms-flex-negative:', 'flex-shrink:'],
  'flex-basis:': ['-ms-flex-preferred-size:', 'flex-basis:'],
  'transform:': ['-webkit-transform:', '-ms-transform:', 'transform:'],
  'transition:': ['-webkit-transition:', 'transition:'],
  'box-shadow:': ['-webkit-box-shadow:', 'box-shadow:'],
  'border-radius:': ['-webkit-border-radius:', 'border-radius:'],
  'linear-gradient': ['-webkit-linear-gradient', 'linear-gradient'],
  'user-select:': ['-webkit-user-select:', '-moz-user-select:', '-ms-user-select:', 'user-select:'],
  'appearance:': ['-webkit-appearance:', '-moz-appearance:', 'appearance:'],
  'backdrop-filter:': ['-webkit-backdrop-filter:', 'backdrop-filter:'],
  'mask:': ['-webkit-mask:', 'mask:'],
  'clip-path:': ['-webkit-clip-path:', 'clip-path:'],
  'filter:': ['-webkit-filter:', 'filter:']
};

function fallbackAutoprefixer(css) {
  let result = css;

  for (const [property, prefixes] of Object.entries(prefixMap)) {
    const regex = new RegExp(`\\b${property.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*([^;]+)`, 'gi');

    result = result.replace(regex, (_match, value) => {
      const lines = [];

      for (const prefix of prefixes) {
        if (prefix.includes(':')) {
          if (prefix.includes('-webkit-box-orient') || prefix.includes('-webkit-box-direction')) {
            if (value.trim() === 'row') {
              lines.push('  -webkit-box-orient: horizontal');
              lines.push('  -webkit-box-direction: normal');
            } else if (value.trim() === 'column') {
              lines.push('  -webkit-box-orient: vertical');
              lines.push('  -webkit-box-direction: normal');
            } else if (value.trim() === 'row-reverse') {
              lines.push('  -webkit-box-orient: horizontal');
              lines.push('  -webkit-box-direction: reverse');
            } else if (value.trim() === 'column-reverse') {
              lines.push('  -webkit-box-orient: vertical');
              lines.push('  -webkit-box-direction: reverse');
            }
          } else if (prefix.includes('-webkit-box-pack')) {
            const val = value.trim();
            let webkitVal = val;
            if (val === 'flex-start') webkitVal = 'start';
            else if (val === 'flex-end') webkitVal = 'end';
            else if (val === 'space-between') webkitVal = 'justify';
            else if (val === 'space-around') webkitVal = 'distribute';
            lines.push(`  ${prefix}${webkitVal}`);
          } else if (prefix.includes('-webkit-box-align')) {
            const val = value.trim();
            let webkitVal = val;
            if (val === 'flex-start') webkitVal = 'start';
            else if (val === 'flex-end') webkitVal = 'end';
            lines.push(`  ${prefix}${webkitVal}`);
          } else {
            lines.push(`  ${prefix}${value}`);
          }
        } else {
          lines.push(`  ${prefix}${value}`);
        }
      }

      return lines.join(';\n');
    });
  }

  return result;
}

export async function runAutoprefixer() {
  const css = editors.autoInput.getValue();
  if (!css.trim()) {
    showStatus('请输入 CSS 代码', 'error');
    return;
  }

  const browserslistQuery = document.getElementById('browserslist').value;

  try {
    const postcssLib = window.postcss || window.PostCSS;
    const autoprefixerLib = window.autoprefixer || window.Autoprefixer;

    let resultCss;

    if (postcssLib && autoprefixerLib && typeof postcssLib === 'function') {
      const result = await postcssLib([
        autoprefixerLib({ overrideBrowserslist: browserslistQuery })
      ]).process(css, { from: undefined });
      resultCss = result.css;
    } else {
      resultCss = fallbackAutoprefixer(css);
    }

    renderDiff(css, resultCss);
    showStatus('Autoprefixer 处理完成', 'success');
  } catch (error) {
    try {
      const resultCss = fallbackAutoprefixer(css);
      renderDiff(css, resultCss);
      showStatus('Autoprefixer 处理完成（使用兼容模式）', 'success');
    } catch (fallbackError) {
      showStatus(`Autoprefixer 错误: ${error.message}`, 'error');
    }
  }
}

function renderDiff(original, modified) {
  const originalLines = original.split('\n');
  const modifiedLines = modified.split('\n');
  const diffContainer = document.getElementById('diffOutput');
  diffContainer.innerHTML = '';

  let addedCount = 0;

  modifiedLines.forEach((line, index) => {
    const div = document.createElement('div');
    div.className = 'diff-line';

    const originalLine = originalLines[index] || '';
    const isAdded = line !== originalLine && line.trim().length > 0;

    if (isAdded) {
      div.classList.add('added');
      addedCount++;
    }

    const lineNum = document.createElement('span');
    lineNum.className = 'diff-line-number';
    lineNum.textContent = index + 1;

    const content = document.createElement('span');
    content.textContent = line;

    div.appendChild(lineNum);
    div.appendChild(content);
    diffContainer.appendChild(div);
  });

  document.getElementById('prefixStats').textContent = `+${addedCount} 行新增前缀`;
}
