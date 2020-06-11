import babel from '@rollup/plugin-babel';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs'
  },
  external: ['redrunner'],
  plugins: [
    babel({ babelHelpers: 'bundled' })
  ]
};