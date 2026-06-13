export const state = {
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

export let editors = {
  input: null,
  output: null,
  autoInput: null
};

export const prettierPlugins = {
  html: null,
  babel: null,
  typescript: null,
  postcss: null,
  markdown: null,
  yaml: null
};
