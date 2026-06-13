import { state, editors, prettierPlugins } from './state.js';
import { languages } from './languages.js';

export function initPrettierPlugins() {
  if (window.prettierPlugins) {
    prettierPlugins.html = window.prettierPlugins.html;
    prettierPlugins.babel = window.prettierPlugins.babel;
    prettierPlugins.typescript = window.prettierPlugins.typescript;
    prettierPlugins.postcss = window.prettierPlugins.postcss;
    prettierPlugins.markdown = window.prettierPlugins.markdown;
    prettierPlugins.yaml = window.prettierPlugins.yaml;
  } else {
    prettierPlugins.html = window.prettierPluginHtml || window.html;
    prettierPlugins.babel = window.prettierPluginBabel || window.babel;
    prettierPlugins.typescript = window.prettierPluginTypescript || window.typescript;
    prettierPlugins.postcss = window.prettierPluginPostcss || window.postcss;
    prettierPlugins.markdown = window.prettierPluginMarkdown || window.markdown;
    prettierPlugins.yaml = window.prettierPluginYaml || window.yaml;
  }
}

export function getPrettierPlugins(parser) {
  const plugins = [];
  switch (parser) {
    case 'html':
      if (prettierPlugins.html) plugins.push(prettierPlugins.html);
      break;
    case 'babel':
      if (prettierPlugins.babel) plugins.push(prettierPlugins.babel);
      break;
    case 'typescript':
      if (prettierPlugins.typescript) plugins.push(prettierPlugins.typescript);
      break;
    case 'css':
    case 'scss':
    case 'less':
      if (prettierPlugins.postcss) plugins.push(prettierPlugins.postcss);
      break;
    case 'json':
      if (prettierPlugins.babel) plugins.push(prettierPlugins.babel);
      break;
    case 'markdown':
      if (prettierPlugins.markdown) plugins.push(prettierPlugins.markdown);
      break;
    case 'yaml':
      if (prettierPlugins.yaml) plugins.push(prettierPlugins.yaml);
      break;
  }
  return plugins;
}

function parsePrettierError(error) {
  const match = error.message.match(/\((\d+):(\d+)\)/);
  if (match) {
    return {
      line: parseInt(match[1]),
      column: parseInt(match[2]),
      message: error.message.replace(/\s*\(\d+:\d+\)\s*/, '').trim()
    };
  }
  return { line: 1, column: 1, message: error.message };
}

import { showStatus } from './ui.js';

export async function formatCode() {
  const code = editors.input.getValue();
  if (!code.trim()) {
    showStatus('请输入代码', 'error');
    return;
  }

  const langConfig = languages[state.currentLang];

  if (state.currentLang === 'sql') {
    formatSQL(code);
    return;
  }

  if (!langConfig.parser) {
    showStatus('该语言暂不支持格式化', 'error');
    return;
  }

  try {
    const options = {
      parser: langConfig.parser,
      plugins: getPrettierPlugins(langConfig.parser),
      tabWidth: state.options.tabWidth,
      singleQuote: state.options.singleQuote,
      semi: state.options.semi,
      printWidth: state.options.printWidth,
      trailingComma: state.options.trailingComma,
      useTabs: false
    };

    if (langConfig.parser === 'scss') {
      options.parser = 'css';
    }

    const formatted = prettier.format(code, options);
    editors.output.setValue(formatted);
    showStatus('格式化成功', 'success');
  } catch (error) {
    const parsed = parsePrettierError(error);
    showStatus(`解析错误: 第 ${parsed.line} 行 - ${parsed.message}`, 'error');

    if (editors.input) {
      editors.input.setCursor({ line: parsed.line - 1, ch: parsed.column - 1 });
      editors.input.focus();
    }
  }
}

function formatSQL(code) {
  const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'HAVING', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'ON', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'LIMIT', 'OFFSET', 'UNION', 'UNION ALL'];

  let formatted = code;
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    formatted = formatted.replace(regex, '\n' + keyword);
  });

  formatted = formatted
    .replace(/^\n+/, '')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map((line, i) => {
      const trimmed = line.trim();
      if (i === 0) return trimmed;
      const isKeyword = keywords.some(kw => trimmed.toUpperCase().startsWith(kw));
      return isKeyword ? trimmed : '  ' + trimmed;
    })
    .join('\n');

  editors.output.setValue(formatted);
  showStatus('SQL 格式化成功', 'success');
}
