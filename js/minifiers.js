import { state, editors } from './state.js';
import { showStatus } from './ui.js';

export async function minifyCode() {
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

export async function minifyHTML(code) {
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

export async function minifyCSS(code) {
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

export async function minifyJS(code) {
  const Terser = window.Terser || window.terser;
  if (Terser && Terser.minify) {
    const result = await Terser.minify(code, {
      mangle: state.options.mangle,
      compress: {
        drop_console: false,
        dead_code: true
      }
    });
    if (result.error) {
      throw new Error(result.error);
    }
    return result.code;
  }
  return code
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};:,=+\-*/<>!&|?])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

export function minifyXML(code) {
  return code
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

export function minifySQL(code) {
  return code
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function minifyMarkdown(code) {
  return code
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}
