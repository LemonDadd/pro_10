export const languages = {
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
