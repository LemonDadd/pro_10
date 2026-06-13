export const scriptManifest = [
  {
    name: 'CodeMirror',
    required: true,
    global: 'CodeMirror',
    local: 'vendor/codemirror/lib/codemirror.js',
    cdn: 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/lib/codemirror.js'
  },
  {
    name: 'CodeMirror XML Mode',
    required: false,
    global: 'CodeMirror',
    local: 'vendor/codemirror/mode/xml/xml.js',
    cdn: 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/mode/xml/xml.js',
    after: 'CodeMirror'
  },
  {
    name: 'CodeMirror JS Mode',
    required: false,
    global: 'CodeMirror',
    local: 'vendor/codemirror/mode/javascript/javascript.js',
    cdn: 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/mode/javascript/javascript.js',
    after: 'CodeMirror'
  },
  {
    name: 'CodeMirror CSS Mode',
    required: false,
    global: 'CodeMirror',
    local: 'vendor/codemirror/mode/css/css.js',
    cdn: 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/mode/css/css.js',
    after: 'CodeMirror'
  },
  {
    name: 'CodeMirror HTML Mixed Mode',
    required: false,
    global: 'CodeMirror',
    local: 'vendor/codemirror/mode/htmlmixed/htmlmixed.js',
    cdn: 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/mode/htmlmixed/htmlmixed.js',
    after: 'CodeMirror XML Mode',
    waitFor: ['CodeMirror XML Mode', 'CodeMirror JS Mode', 'CodeMirror CSS Mode']
  },
  {
    name: 'CodeMirror SQL Mode',
    required: false,
    global: 'CodeMirror',
    local: 'vendor/codemirror/mode/sql/sql.js',
    cdn: 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/mode/sql/sql.js',
    after: 'CodeMirror'
  },
  {
    name: 'CodeMirror Markdown Mode',
    required: false,
    global: 'CodeMirror',
    local: 'vendor/codemirror/mode/markdown/markdown.js',
    cdn: 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/mode/markdown/markdown.js',
    after: 'CodeMirror'
  },
  {
    name: 'CodeMirror FoldCode',
    required: false,
    global: 'CodeMirror',
    local: 'vendor/codemirror/addon/fold/foldcode.js',
    cdn: 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/addon/fold/foldcode.js',
    after: 'CodeMirror'
  },
  {
    name: 'CodeMirror FoldGutter',
    required: false,
    global: 'CodeMirror',
    local: 'vendor/codemirror/addon/fold/foldgutter.js',
    cdn: 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/addon/fold/foldgutter.js',
    after: 'CodeMirror FoldCode'
  },
  {
    name: 'CodeMirror Brace Fold',
    required: false,
    global: 'CodeMirror',
    local: 'vendor/codemirror/addon/fold/brace-fold.js',
    cdn: 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/addon/fold/brace-fold.js',
    after: 'CodeMirror FoldCode'
  },
  {
    name: 'CodeMirror XML Fold',
    required: false,
    global: 'CodeMirror',
    local: 'vendor/codemirror/addon/fold/xml-fold.js',
    cdn: 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/addon/fold/xml-fold.js',
    after: 'CodeMirror FoldCode'
  },
  {
    name: 'CodeMirror Comment Fold',
    required: false,
    global: 'CodeMirror',
    local: 'vendor/codemirror/addon/fold/comment-fold.js',
    cdn: 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/addon/fold/comment-fold.js',
    after: 'CodeMirror FoldCode'
  },
  {
    name: 'CodeMirror MatchBrackets',
    required: false,
    global: 'CodeMirror',
    local: 'vendor/codemirror/addon/edit/matchbrackets.js',
    cdn: 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/addon/edit/matchbrackets.js',
    after: 'CodeMirror'
  },
  {
    name: 'CodeMirror ActiveLine',
    required: false,
    global: 'CodeMirror',
    local: 'vendor/codemirror/addon/selection/active-line.js',
    cdn: 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/addon/selection/active-line.js',
    after: 'CodeMirror'
  },
  {
    name: 'Prettier',
    required: true,
    global: 'prettier',
    local: 'vendor/prettier/standalone.js',
    cdn: 'https://cdn.jsdelivr.net/npm/prettier@2.8.8/standalone.js'
  },
  {
    name: 'Prettier HTML Parser',
    required: false,
    global: 'prettierPlugins.html',
    local: 'vendor/prettier/parser-html.js',
    cdn: 'https://cdn.jsdelivr.net/npm/prettier@2.8.8/parser-html.js',
    after: 'Prettier'
  },
  {
    name: 'Prettier Babel Parser',
    required: false,
    global: 'prettierPlugins.babel',
    local: 'vendor/prettier/parser-babel.js',
    cdn: 'https://cdn.jsdelivr.net/npm/prettier@2.8.8/parser-babel.js',
    after: 'Prettier'
  },
  {
    name: 'Prettier TS Parser',
    required: false,
    global: 'prettierPlugins.typescript',
    local: 'vendor/prettier/parser-typescript.js',
    cdn: 'https://cdn.jsdelivr.net/npm/prettier@2.8.8/parser-typescript.js',
    after: 'Prettier'
  },
  {
    name: 'Prettier PostCSS Parser',
    required: false,
    global: 'prettierPlugins.postcss',
    local: 'vendor/prettier/parser-postcss.js',
    cdn: 'https://cdn.jsdelivr.net/npm/prettier@2.8.8/parser-postcss.js',
    after: 'Prettier'
  },
  {
    name: 'Prettier Markdown Parser',
    required: false,
    global: 'prettierPlugins.markdown',
    local: 'vendor/prettier/parser-markdown.js',
    cdn: 'https://cdn.jsdelivr.net/npm/prettier@2.8.8/parser-markdown.js',
    after: 'Prettier'
  },
  {
    name: 'Prettier YAML Parser',
    required: false,
    global: 'prettierPlugins.yaml',
    local: 'vendor/prettier/parser-yaml.js',
    cdn: 'https://cdn.jsdelivr.net/npm/prettier@2.8.8/parser-yaml.js',
    after: 'Prettier'
  },
  {
    name: 'Terser',
    required: false,
    global: 'Terser',
    local: 'vendor/terser/bundle.min.js',
    cdn: 'https://cdn.jsdelivr.net/npm/terser@5.19.2/dist/bundle.min.js'
  },
  {
    name: 'Babel Standalone',
    required: false,
    global: 'Babel',
    local: 'vendor/babel-standalone/babel.min.js',
    cdn: 'https://cdn.jsdelivr.net/npm/@babel/standalone@7.23.5/babel.min.js'
  }
];
