#!/bin/bash
set -e

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
VENDOR_DIR="$BASE_DIR/vendor"

CM="https://cdn.jsdelivr.net/npm/codemirror@5.65.16"

echo "=== 创建目录结构 ==="
mkdir -p \
  "$VENDOR_DIR/codemirror/lib" \
  "$VENDOR_DIR/codemirror/theme" \
  "$VENDOR_DIR/codemirror/mode/xml" \
  "$VENDOR_DIR/codemirror/mode/javascript" \
  "$VENDOR_DIR/codemirror/mode/css" \
  "$VENDOR_DIR/codemirror/mode/htmlmixed" \
  "$VENDOR_DIR/codemirror/mode/sql" \
  "$VENDOR_DIR/codemirror/mode/markdown" \
  "$VENDOR_DIR/codemirror/addon/fold" \
  "$VENDOR_DIR/codemirror/addon/edit" \
  "$VENDOR_DIR/codemirror/addon/selection" \
  "$VENDOR_DIR/prettier" \
  "$VENDOR_DIR/terser" \
  "$VENDOR_DIR/babel-standalone"

echo ""
echo "=== 下载 CodeMirror (编辑器核心) ==="
cd "$VENDOR_DIR/codemirror/lib"
curl -sLO "$CM/lib/codemirror.js"
curl -sLO "$CM/lib/codemirror.css"

cd "$VENDOR_DIR/codemirror/theme"
curl -sLO "$CM/theme/eclipse.css"
curl -sLO "$CM/theme/dracula.css"

cd "$VENDOR_DIR/codemirror/mode/xml"
curl -sLO "$CM/mode/xml/xml.js"

cd "$VENDOR_DIR/codemirror/mode/javascript"
curl -sLO "$CM/mode/javascript/javascript.js"

cd "$VENDOR_DIR/codemirror/mode/css"
curl -sLO "$CM/mode/css/css.js"

cd "$VENDOR_DIR/codemirror/mode/htmlmixed"
curl -sLO "$CM/mode/htmlmixed/htmlmixed.js"

cd "$VENDOR_DIR/codemirror/mode/sql"
curl -sLO "$CM/mode/sql/sql.js"

cd "$VENDOR_DIR/codemirror/mode/markdown"
curl -sLO "$CM/mode/markdown/markdown.js"

cd "$VENDOR_DIR/codemirror/addon/fold"
curl -sLO "$CM/addon/fold/foldcode.js"
curl -sLO "$CM/addon/fold/foldgutter.js"
curl -sLO "$CM/addon/fold/brace-fold.js"
curl -sLO "$CM/addon/fold/xml-fold.js"
curl -sLO "$CM/addon/fold/comment-fold.js"
curl -sLO "$CM/addon/fold/foldgutter.css"

cd "$VENDOR_DIR/codemirror/addon/edit"
curl -sLO "$CM/addon/edit/matchbrackets.js"

cd "$VENDOR_DIR/codemirror/addon/selection"
curl -sLO "$CM/addon/selection/active-line.js"

echo "  完成：CodeMirror 核心 + 6 种语言模式 + 折叠 + 括号匹配"

echo ""
echo "=== 下载 Prettier (格式化引擎) ==="
cd "$VENDOR_DIR/prettier"
curl -sLO "https://cdn.jsdelivr.net/npm/prettier@2.8.8/standalone.js"
curl -sLO "https://cdn.jsdelivr.net/npm/prettier@2.8.8/parser-html.js"
curl -sLO "https://cdn.jsdelivr.net/npm/prettier@2.8.8/parser-babel.js"
curl -sLO "https://cdn.jsdelivr.net/npm/prettier@2.8.8/parser-typescript.js"
curl -sLO "https://cdn.jsdelivr.net/npm/prettier@2.8.8/parser-postcss.js"
curl -sLO "https://cdn.jsdelivr.net/npm/prettier@2.8.8/parser-markdown.js"
curl -sLO "https://cdn.jsdelivr.net/npm/prettier@2.8.8/parser-yaml.js"
echo "  完成：Prettier standalone + 6 个 parser"

echo ""
echo "=== 下载 Terser (JS 压缩) ==="
cd "$VENDOR_DIR/terser"
curl -sLO "https://cdn.jsdelivr.net/npm/terser@5.19.2/dist/bundle.min.js"
echo "  完成：Terser JS 压缩器"

echo ""
echo "=== 下载 Babel (ES6+ 转译) ==="
cd "$VENDOR_DIR/babel-standalone"
curl -sLO "https://cdn.jsdelivr.net/npm/@babel/standalone@7.23.5/babel.min.js"
echo "  完成：@babel/standalone"

echo ""
echo "=== 说明：以下库无浏览器 UMD 构建，走 CDN fallback ==="
echo "  - clean-css (Node.js 原生工具)"
echo "  - html-minifier-terser (Node.js 原生工具)"
echo "  - PostCSS / Autoprefixer (Node.js 生态)"
echo "  - browserslist (Node.js 工具)"
echo ""
echo "  注：这些库在 index.html 中通过 onerror 自动回退到 CDN"

echo ""
echo "=== 完成 ==="
echo "JS 文件: $(find "$VENDOR_DIR" -name "*.js" | wc -l) 个"
echo "CSS 文件: $(find "$VENDOR_DIR" -name "*.css" | wc -l) 个"
echo "总大小: $(du -sh "$VENDOR_DIR" | cut -f1)"
