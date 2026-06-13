# 功能需求迭代提示词

> 复制下方 **「Agent 提示词」** 整段到 Cursor Agent。
> 来源：第 1 轮 `/不满意原因` 审查（CodeBeautify Pro 离线能力与多语言格式化缺口）。
> 每轮迭代后更新「变更记录」。

---

## 变更记录

| 轮次 | 日期 | 范围 | 状态 |
|------|------|------|------|
| 1 | 2026-06-12 | 离线依赖、XML/SCSS 格式化、Autoprefixer 真路径、压缩选项、Diff 与 hash | 待做 |

---

## Agent 提示词（复制从这里开始）

**项目路径**：`/Users/ext.feixuan3/Desktop/solo/pro_10`
**栈**：纯前端单页（`index.html` + `styles.css` + `app.js`），无构建工具；依赖 CodeMirror / Prettier / Terser / PostCSS 等 CDN

### 核心需求（不变）

构建对标 CodeBeautify 的**离线增强版**多语言代码格式化/压缩工具：9 种语言 Tab、Prettier 可配选项、Autoprefixer（按 browserslist 加前缀 + Diff 高亮）、6 项实用子工具、编辑器增强（行号/折叠/主题/快捷键），URL hash 保存语言与选项（尽量可分享）。

### 已完成（勿重复改，除非回归）

- 三视图骨架：编辑器 / Autoprefixer / 实用工具
- CodeMirror 双栏编辑器 + 同步滚动（初始化时）
- Prettier 格式化：HTML、CSS、JS、TS、JSON、Markdown（及 SQL 关键词换行）
- 压缩：HTML / CSS / JS / JSON / XML / SQL / MD，带 CDN 库与正则降级
- 实用工具：颜色转换、px↔rem、HTML 实体、Babel、JSON 工具、Base64
- 主题切换 + localStorage 持久化
- URL hash 保存语言、视图、Prettier/显示选项（不含代码正文）
- 快捷键：Ctrl/Cmd+Enter 格式化，Ctrl/Cmd+Shift+M 压缩
- 复制、下载、交换、清空、语言自动检测

### P0 — 必须修复

#### 1. 断网后核心能力整体失效

**问题**：页面完全依赖十余个外网 CDN 脚本，项目内无 `vendor/` 或 Service Worker；断网或 CDN 挂掉后格式化、压缩、Babel、真 Autoprefixer 都可能不可用。

**要求**：
- 新增 `vendor/` 目录，将**核心依赖**本地化（至少：CodeMirror、Prettier standalone + 各 parser、Terser、clean-css、html-minifier-terser、@babel/standalone）
- `index.html` 优先加载本地脚本，CDN 作 fallback（`<script src="vendor/...">` + onerror 切 CDN）
- 可选：加极简 Service Worker 缓存首次加载资源（本轮可只做 vendor，SW 放 P1）
- 断网时状态栏明确提示「离线模式 / 部分功能不可用」，不要静默失败

#### 2. XML Tab 格式化名不副实

**问题**：语言配置 `parser: 'xml'`，但 `index.html` 未引入 XML 的 Prettier 插件，`getPrettierPlugins()` 也没有 `xml` 分支，点格式化得不到可靠结果。

**要求**：
- 接入 Prettier 可用的 XML 解析路径（如 `@prettier/plugin-xml` 浏览器 版，或文档说明用 `html` parser + `xml` 插件组合）
- 补全 `getPrettierPlugins('xml')` 与 `formatCode` 分支
- XML 示例代码格式化后结构正确、可再压缩

#### 3. SCSS 格式化破坏嵌套/变量

**问题**：`formatCode` 里对 `scss` 强制 `options.parser = 'css'`，嵌套、`$变量`、`@mixin` 等会被当普通 CSS 处理。

**要求**：
- SCSS 使用 postcss/scss 解析器（`parser: 'scss'` + postcss 插件），不要降级成纯 CSS
- 保留现有 CSS Tab 行为不变

#### 4. Autoprefixer 主路径不可用且降级忽略 browserslist

**问题**：PostCSS / Autoprefixer 从 unpkg 加载，浏览器环境常失败；失败后走 `fallbackAutoprefixer` 固定前缀表，**用户填的 browserslist 查询不起作用**；过程却把 Autoprefixer 当主功能验收。

**要求**：
- 优先修通浏览器内 PostCSS + Autoprefixer（换可用的 browser bundle 或本地 vendor 打包）
- 若必须降级：UI 明确标注「兼容模式，未按 browserslist 计算」，并尽量在兼容模式里读取 browserslist 做最小支持
- 运行成功时 Diff 区应反映真实前缀差异

#### 5. Autoprefixer Diff 高亮错位

**问题**：`renderDiff` 按**行号索引**逐行对比，插入行后后续行全部标绿，不能准确标出「新增了哪些前缀行」。

**要求**：
- 改为行级 diff 算法（如逐行 LCS / `diff` 库），或按「原行 → 展开多行前缀」的语义对比
- 统计「+N 行新增前缀」与绿色高亮一致

### P1 — 体验与骨架补齐

#### 6. 压缩强度选项未暴露给用户

**问题**：`state.options.mangle`、`state.options.cssLevel` 在代码里有默认值，控制面板无对应开关。

**要求**：
- 在「操作」或「Prettier 选项」区增加：JS「混淆变量名(mangle)」勾选、CSS「压缩级别(1/2)」下拉
- 变更写入 `state.options` 并同步 URL hash

#### 7. Babel 工具 preset 错误

**问题**：`runBabel()` 使用 `presets: ['env']`，@babel/standalone 7.x 需要 `'@babel/preset-env'`。

**要求**：修正 preset 名称；ES6+ 示例代码能转译输出

#### 8. 同步滚动开关切换后不生效

**问题**：`syncScroll` 仅在 `initEditors` 时绑定一次，用户取消勾选后滚动监听仍可能生效。

**要求**：勾选变化时动态绑定/解绑 scroll 监听，或统一在 handler 内判断 `state.options.syncScroll`

#### 9. 按钮缺少 `type="button"`

**问题**：`index.html` 大量 `<button>` 无 `type`，在部分嵌入场景可能触发非预期默认行为。

**要求**：所有非提交用途按钮加 `type="button"`

### P2 — 可选（本轮时间够再做）

- URL hash 或 localStorage 可选保存输入区代码（注意 4KB hash 限制，大内容用 localStorage）
- SQL 格式化提示为「简易排版」或接入专用 SQL formatter

### 验收清单

| 项 | 命令 / 动作 | 期望 |
|----|-------------|------|
| 本地打开 | `cd pro_10 && python3 -m http.server 8080`，浏览器打开 | 页面正常加载，无控制台报错 |
| 断网核心功能 | 断网后刷新（vendor 已就位） | HTML/JS 仍能格式化；状态栏有离线提示 |
| XML 格式化 | XML Tab，点示例 → 格式化 | 输出缩进正确，非报错或空 |
| SCSS 格式化 | SCSS Tab，含 `$var` 与嵌套 → 格式化 | 嵌套结构保留，变量不被破坏 |
| Autoprefixer | 输入 flex 相关 CSS，改 browserslist 为 `ie 11` | 输出含对应前缀；Diff 绿色行与真实新增行一致 |
| 压缩选项 | 勾选 mangle、CSS level 2 → 压缩 JS/CSS | 输出明显更短/变量被混淆（mangle 开启时） |
| Babel | 实用工具 ES6 箭头函数示例 → 转译 | 输出 ES5 风格代码，非 preset 报错 |
| 同步滚动 | 取消「同步滚动」后只滚左侧 | 右侧不再跟随 |
| 回归 | HTML/JSON 格式化、复制下载、主题切换 | 仍正常 |

### 工作方式

1. **先读**：`index.html`、`app.js`（格式化/压缩/Autoprefixer/hash 段）、`.trae/documents/PRD_代码格式化工具.md`
2. **先定离线策略**：列必须 vendor 化的脚本清单，再改 `index.html` 引用顺序
3. **Autoprefixer**：先验证浏览器能否跑通 PostCSS，再改 Diff；不要把 fallback 当默认路径
4. **最小 diff**：本轮不引入 Webpack/Vite，保持「直接打开 html 可用」
5. **总结**：已修复 / 未修复 / 需用户本地确认（对照验收表）

## Agent 提示词（复制到这里结束）
