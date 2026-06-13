const state = {
  currentLang: 'html',
  currentView: 'editor',
  theme: 'light',
  options: {
    tabWidth: 2,
    singleQuote: true,
    semi: true,
    printWidth: 80,
    trailingComma: 'es5',
    syncScroll: true,
    lineNumbers: true,
    lineWrapping: false,
    mangle: false,
    cssLevel: 2
  }
};

const languages = {
  html: {
    name: 'HTML',
    mode: 'htmlmixed',
    parser: 'html',
    ext: '.html',
    mime: 'text/html',
    example: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Test</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>'
  },
  css: {
    name: 'CSS',
    mode: 'css',
    parser: 'css',
    ext: '.css',
    mime: 'text/css',
    example: '.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n}'
  },
  scss: {
    name: 'SCSS',
    mode: 'css',
    parser: 'scss',
    ext: '.scss',
    mime: 'text/x-scss',
    example: '$primary: #3b82f6;\n\n.container {\n  display: flex;\n  \n  .item {\n    color: $primary;\n  }\n}'
  },
  javascript: {
    name: 'JavaScript',
    mode: 'javascript',
    parser: 'babel',
    ext: '.js',
    mime: 'application/javascript',
    example: 'function greet(name) {\n  console.log("Hello, " + name);\n}\n\ngreet("World");'
  },
  typescript: {
    name: 'TypeScript',
    mode: 'javascript',
    parser: 'typescript',
    ext: '.ts',
    mime: 'application/typescript',
    example: 'interface User {\n  name: string;\n  age: number;\n}\n\nconst user: User = {\n  name: "John",\n  age: 30\n};'
  },
  json: {
    name: 'JSON',
    mode: 'javascript',
    parser: 'json',
    ext: '.json',
    mime: 'application/json',
    example: '{"name":"John","age":30,"hobbies":["reading","coding"]}'
  },
  xml: {
    name: 'XML',
    mode: 'xml',
    parser: 'xml',
    ext: '.xml',
    mime: 'application/xml',
    example: '<?xml version="1.0"?>\n<users>\n  <user>\n    <name>John</name>\n    <age>30</age>\n  </user>\n</users>'
  },
  sql: {
    name: 'SQL',
    mode: 'sql',
    parser: null,
    ext: '.sql',
    mime: 'text/sql',
    example: 'SELECT users.name, COUNT(orders.id) as order_count\nFROM users\nLEFT JOIN orders ON users.id = orders.user_id\nWHERE users.active = 1\nGROUP BY users.id, users.name\nHAVING order_count > 5\nORDER BY order_count DESC;'
  },
  markdown: {
    name: 'Markdown',
    mode: 'markdown',
    parser: 'markdown',
    ext: '.md',
    mime: 'text/markdown',
    example: '# Hello World\n\n## Introduction\n\nThis is a **markdown** example.\n\n- Item 1\n- Item 2\n- Item 3'
  }
};

let editors = {
  input: null,
  output: null,
  autoInput: null
};

const prettierPlugins = {
  html: null,
  babel: null,
  typescript: null,
  postcss: null,
  markdown: null,
  yaml: null
};

function initPrettierPlugins() {
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

function initTheme() {
  const savedTheme = localStorage.getItem('codebeautify-theme');
  if (savedTheme) {
    state.theme = savedTheme;
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    state.theme = 'dark';
  }
  applyTheme();
}

function applyTheme() {
  document.body.classList.remove('theme-light', 'theme-dark');
  document.body.classList.add(`theme-${state.theme}`);
  
  const cmTheme = state.theme === 'dark' ? 'dracula' : 'eclipse';
  if (editors.input) editors.input.setOption('theme', cmTheme);
  if (editors.output) editors.output.setOption('theme', cmTheme);
  if (editors.autoInput) editors.autoInput.setOption('theme', cmTheme);
  
  localStorage.setItem('codebeautify-theme', state.theme);
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  applyTheme();
}

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

function initEditors() {
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

function updateEditorMode() {
  const langConfig = languages[state.currentLang];
  if (editors.input) {
    editors.input.setOption('mode', { name: langConfig.mode });
    editors.output.setOption('mode', { name: langConfig.mode });
  }
  document.getElementById('langIndicator').textContent = langConfig.name;
}

function updateStats() {
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

function updateCursorPosition() {
  if (!editors.input) return;
  const cursor = editors.input.getCursor();
  document.getElementById('cursorPosition').textContent = `行 ${cursor.line + 1}, 列 ${cursor.ch + 1}`;
}

function getPrettierPlugins(parser) {
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

async function formatCode() {
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

async function minifyCode() {
  const code = editors.input.getValue();
  if (!code.trim()) {
    showStatus('请输入代码', 'error');
    return;
  }
  
  try {
    let result = '';
    
    switch (state.currentLang) {
      case 'html':
        result = await minifyHTML(code);
        break;
      case 'css':
      case 'scss':
        result = await minifyCSS(code);
        break;
      case 'javascript':
      case 'typescript':
        result = await minifyJS(code);
        break;
      case 'json':
        result = JSON.stringify(JSON.parse(code));
        break;
      case 'xml':
        result = minifyXML(code);
        break;
      case 'sql':
        result = minifySQL(code);
        break;
      case 'markdown':
        result = minifyMarkdown(code);
        break;
      default:
        showStatus('该语言暂不支持压缩', 'error');
        return;
    }
    
    editors.output.setValue(result);
    showStatus('压缩成功', 'success');
  } catch (error) {
    showStatus(`压缩错误: ${error.message}`, 'error');
  }
}

async function minifyHTML(code) {
  const minifier = window.htmlMinifierTerser || window.htmlminifier || window.HTMLMinifier;
  if (minifier) {
    return minifier.minify(code, {
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true,
      minifyJS: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    });
  }
  return code
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

async function minifyCSS(code) {
  const CleanCSSLib = window.CleanCSS || window.cleanCSS || window.CssClean;
  if (CleanCSSLib) {
    const result = new CleanCSSLib({ level: state.options.cssLevel }).minify(code);
    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors[0]);
    }
    return result.styles;
  }
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};:,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

async function minifyJS(code) {
  const TerserLib = window.Terser || window.terser;
  if (TerserLib) {
    const result = await TerserLib.minify(code, {
      mangle: state.options.mangle,
      compress: {
        drop_console: false,
        drop_debugger: true
      },
      output: {
        comments: false
      }
    });
    if (result.error) {
      throw result.error;
    }
    return result.code;
  }
  return code
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};:,=+\-*/<>!&|?])\s*/g, '$1')
    .trim();
}

function minifyXML(code) {
  return code
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

function minifySQL(code) {
  return code
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function minifyMarkdown(code) {
  return code
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+$/gm, '')
    .trim();
}

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

async function runAutoprefixer() {
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

function convertColor() {
  const input = document.getElementById('colorInput').value.trim();
  const results = document.getElementById('colorResults');
  
  if (!input) {
    results.textContent = '请输入颜色值';
    return;
  }
  
  let r, g, b, a = 1;
  
  const hexMatch = input.match(/^#?([a-f\d]{3,8})$/i);
  const rgbaMatch = input.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/i);
  const hslMatch = input.match(/hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+))?\s*\)/i);
  
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length === 4) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    if (hex.length === 8) {
      a = parseInt(hex.substr(6, 2), 16) / 255;
      hex = hex.substr(0, 6);
    }
    r = parseInt(hex.substr(0, 2), 16);
    g = parseInt(hex.substr(2, 2), 16);
    b = parseInt(hex.substr(4, 2), 16);
  } else if (rgbaMatch) {
    r = parseInt(rgbaMatch[1]);
    g = parseInt(rgbaMatch[2]);
    b = parseInt(rgbaMatch[3]);
    a = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;
  } else if (hslMatch) {
    const h = parseInt(hslMatch[1]) / 360;
    const s = parseInt(hslMatch[2]) / 100;
    const l = parseInt(hslMatch[3]) / 100;
    a = hslMatch[4] ? parseFloat(hslMatch[4]) : 1;
    const rgb = hslToRgb(h, s, l);
    r = rgb.r;
    g = rgb.g;
    b = rgb.b;
  } else {
    results.textContent = '无法解析的颜色格式';
    return;
  }
  
  const hex = rgbToHex(r, g, b);
  const hexa = rgbToHex(r, g, b, a);
  const rgba = `rgba(${r}, ${g}, ${b}, ${a})`;
  const rgb = `rgb(${r}, ${g}, ${b})`;
  const hsl = rgbToHsl(r, g, b);
  const hsla = `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${a})`;
  
  results.textContent = `HEX: ${hex}\nHEXA: ${hexa}\nRGB: ${rgb}\nRGBA: ${rgba}\nHSL: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)\nHSLA: ${hsla}`;
}

function rgbToHex(r, g, b, a = null) {
  const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  let hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  if (a !== null && a < 1) {
    hex += toHex(Math.round(a * 255));
  }
  return hex.toUpperCase();
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function hslToRgb(h, s, l) {
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function convertPxRem() {
  const input = document.getElementById('pxremInput').value.trim();
  const rootSize = parseInt(document.getElementById('rootFontSize').value) || 16;
  const results = document.getElementById('pxremResults');
  
  if (!input) {
    results.textContent = '请输入数值';
    return;
  }
  
  const values = input.match(/[\d.]+(?:px|rem)/gi) || [input];
  const converted = [];
  
  values.forEach(val => {
    const match = val.match(/([\d.]+)(px|rem)/i);
    if (match) {
      const num = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      
      if (unit === 'px') {
        converted.push(`${num}px = ${(num / rootSize).toFixed(4)}rem`);
      } else {
        converted.push(`${num}rem = ${(num * rootSize).toFixed(2)}px`);
      }
    } else {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        converted.push(`${num}px = ${(num / rootSize).toFixed(4)}rem`);
        converted.push(`${num}rem = ${(num * rootSize).toFixed(2)}px`);
      }
    }
  });
  
  results.textContent = converted.join('\n') || '无法解析输入';
}

function escapeHtml() {
  const input = document.getElementById('htmlEscapeInput').value;
  const results = document.getElementById('htmlEscapeResults');
  
  const div = document.createElement('div');
  div.textContent = input;
  results.textContent = div.innerHTML;
}

function unescapeHtml() {
  const input = document.getElementById('htmlEscapeInput').value;
  const results = document.getElementById('htmlEscapeResults');
  
  const div = document.createElement('div');
  div.innerHTML = input;
  results.textContent = div.textContent;
}

function runBabel() {
  const input = document.getElementById('babelInput').value;
  const results = document.getElementById('babelResults');
  
  if (!input.trim()) {
    results.textContent = '请输入 ES6+ 代码';
    return;
  }
  
  try {
    const babelLib = window.Babel || window.babel;
    if (!babelLib) {
      throw new Error('Babel 未加载');
    }
    
    const output = babelLib.transform(input, {
      presets: ['env'],
      targets: {
        browsers: ['> 1%', 'last 2 versions', 'ie >= 9']
      }
    });
    
    results.textContent = output.code;
  } catch (error) {
    results.textContent = `Babel 错误: ${error.message}`;
  }
}

function validateJson() {
  const input = document.getElementById('jsonToolInput').value;
  const results = document.getElementById('jsonToolResults');
  
  try {
    const obj = JSON.parse(input);
    results.textContent = '✅ JSON 格式有效\n\n类型: ' + (Array.isArray(obj) ? 'Array' : 'Object') + '\n键数量: ' + (Array.isArray(obj) ? obj.length : Object.keys(obj).length);
  } catch (error) {
    results.textContent = '❌ JSON 格式错误: ' + error.message;
  }
}

function sortJson() {
  const input = document.getElementById('jsonToolInput').value;
  const results = document.getElementById('jsonToolResults');
  
  try {
    const obj = JSON.parse(input);
    const sorted = sortObjectKeys(obj);
    results.textContent = JSON.stringify(sorted, null, 2);
  } catch (error) {
    results.textContent = '错误: ' + error.message;
  }
}

function sortObjectKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).sort().reduce((result, key) => {
      result[key] = sortObjectKeys(obj[key]);
      return result;
    }, {});
  }
  return obj;
}

function flattenJson() {
  const input = document.getElementById('jsonToolInput').value;
  const results = document.getElementById('jsonToolResults');
  
  try {
    const obj = JSON.parse(input);
    const flattened = {};
    
    function flatten(current, prefix = '') {
      if (Array.isArray(current)) {
        current.forEach((item, i) => {
          flatten(item, `${prefix}[${i}]`);
        });
      } else if (current !== null && typeof current === 'object') {
        Object.keys(current).forEach(key => {
          const newPrefix = prefix ? `${prefix}.${key}` : key;
          flatten(current[key], newPrefix);
        });
      } else {
        flattened[prefix] = current;
      }
    }
    
    flatten(obj);
    results.textContent = JSON.stringify(flattened, null, 2);
  } catch (error) {
    results.textContent = '错误: ' + error.message;
  }
}

function encodeBase64() {
  const input = document.getElementById('base64Input').value;
  const results = document.getElementById('base64Results');
  
  try {
    const encoded = btoa(unescape(encodeURIComponent(input)));
    results.textContent = encoded;
  } catch (error) {
    results.textContent = '编码错误: ' + error.message;
  }
}

function decodeBase64() {
  const input = document.getElementById('base64Input').value;
  const results = document.getElementById('base64Results');
  
  try {
    const decoded = decodeURIComponent(escape(atob(input)));
    results.textContent = decoded;
  } catch (error) {
    results.textContent = '解码错误: ' + error.message;
  }
}

function swapContent() {
  if (!editors.input || !editors.output) return;
  const temp = editors.input.getValue();
  editors.input.setValue(editors.output.getValue());
  editors.output.setValue(temp);
  showStatus('内容已交换', 'success');
}

function clearAll() {
  if (editors.input) editors.input.setValue('');
  if (editors.output) editors.output.setValue('');
  showStatus('已清空', 'success');
}

function copyOutput() {
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

function downloadFile() {
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

function saveStateToHash() {
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

function loadStateFromHash() {
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

function updateOptionsUI() {
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

function showStatus(message, type = '', persistent = false) {
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

function showToast(message, type = '') {
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

function detectLanguage() {
  const code = editors.input ? editors.input.getValue() : '';
  if (!code.trim()) {
    showStatus('请输入代码后再检测', 'error');
    return;
  }
  
  let detected = 'text';
  const firstLine = code.trim().split('\n')[0];
  
  if (firstLine.startsWith('<!DOCTYPE') || code.includes('<html') || code.includes('<![')) {
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
    switchLanguage(detected);
    showStatus(`检测到语言: ${languages[detected].name}`, 'success');
  } else {
    showStatus('无法自动检测语言', 'error');
  }
}

function switchLanguage(lang) {
  if (!languages[lang]) return;
  
  state.currentLang = lang;
  
  document.querySelectorAll('.lang-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.lang === lang);
  });
  
  updateEditorMode();
  saveStateToHash();
}

function switchView(view) {
  state.currentView = view;
  
  document.querySelectorAll('.view-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === view);
  });
  
  document.querySelectorAll('.view').forEach(v => {
    v.classList.toggle('active', v.id === `view-${view}`);
  });
  
  saveStateToHash();
}

function bindEvents() {
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  
  document.querySelectorAll('.view-tab').forEach(tab => {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  });
  
  document.querySelectorAll('.lang-tab').forEach(tab => {
    tab.addEventListener('click', () => switchLanguage(tab.dataset.lang));
  });
  
  document.getElementById('formatBtn').addEventListener('click', formatCode);
  document.getElementById('minifyBtn').addEventListener('click', minifyCode);
  document.getElementById('swapBtn').addEventListener('click', swapContent);
  document.getElementById('clearBtn').addEventListener('click', clearAll);
  document.getElementById('copyBtn').addEventListener('click', copyOutput);
  document.getElementById('downloadBtn').addEventListener('click', downloadFile);
  document.getElementById('detectLangBtn').addEventListener('click', detectLanguage);
  
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
  
  window.addEventListener('hashchange', loadStateFromHash);
}

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

function updateOfflineStatus() {
  const { missing, isOnline } = checkLibAvailability();
  
  if (!isOnline && missing.length > 0) {
    showStatus(`📴 离线模式 / ${missing.length} 项功能不可用：${missing.join('、')}`, 'error', true);
  } else if (!isOnline) {
    showStatus('📴 离线模式 / 核心功能可用', 'warning', true);
  } else if (missing.length > 0) {
    showStatus(`⚠️ 部分功能不可用：${missing.join('、')}`, 'warning', true);
  }
}

function initOnlineStatus() {
  window.addEventListener('online', updateOfflineStatus);
  window.addEventListener('offline', updateOfflineStatus);
  setTimeout(updateOfflineStatus, 500);
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initPrettierPlugins();
  initEditors();
  bindEvents();
  loadStateFromHash();
  initOnlineStatus();
  
  if (editors.autoInput) {
    editors.autoInput.setValue(`.example {
  display: flex;
  transition: transform 0.3s;
  user-select: none;
  transform: translateX(10px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}`);
  }
});
