module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    "no-console": "off",  // disable warnings about having console.XXX() statements - re-enable for non-dev situations
    "linebreak-style": 0,  // accept CRLF at end of lines (as opposed to requiring only LF)
    "comma-dangle": 0
  },
};
