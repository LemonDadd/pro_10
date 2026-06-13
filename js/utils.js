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

export function convertColor() {
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

export function convertPxRem() {
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

export function escapeHtml() {
  const input = document.getElementById('htmlEscapeInput').value;
  const results = document.getElementById('htmlEscapeResults');

  const div = document.createElement('div');
  div.textContent = input;
  results.textContent = div.innerHTML;
}

export function unescapeHtml() {
  const input = document.getElementById('htmlEscapeInput').value;
  const results = document.getElementById('htmlEscapeResults');

  const div = document.createElement('div');
  div.innerHTML = input;
  results.textContent = div.textContent;
}

export function runBabel() {
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

export function validateJson() {
  const input = document.getElementById('jsonToolInput').value;
  const results = document.getElementById('jsonToolResults');

  try {
    const obj = JSON.parse(input);
    results.textContent = '✅ JSON 格式有效\n\n类型: ' + (Array.isArray(obj) ? 'Array' : 'Object') + '\n键数量: ' + (Array.isArray(obj) ? obj.length : Object.keys(obj).length);
  } catch (error) {
    results.textContent = '❌ JSON 格式错误: ' + error.message;
  }
}

export function sortJson() {
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

export function flattenJson() {
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

export function encodeBase64() {
  const input = document.getElementById('base64Input').value;
  const results = document.getElementById('base64Results');

  try {
    const encoded = btoa(unescape(encodeURIComponent(input)));
    results.textContent = encoded;
  } catch (error) {
    results.textContent = '编码错误: ' + error.message;
  }
}

export function decodeBase64() {
  const input = document.getElementById('base64Input').value;
  const results = document.getElementById('base64Results');

  try {
    const decoded = decodeURIComponent(escape(atob(input)));
    results.textContent = decoded;
  } catch (error) {
    results.textContent = '解码错误: ' + error.message;
  }
}
