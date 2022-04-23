const path = require('path');
const webpack = require('webpack');

const presets = [];
const productionPreset = '@babel/preset-env';

const baseConfig = {
  entry: './src/main.js',
  devServer: {
    contentBase: './',
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [{
      test: /\.js?$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            presets: presets,
            plugins: [
              'babel-plugin-redrunner',
              '@babel/plugin-proposal-class-properties'
            ],
          }
        }
      ]
    }]
  }
};


module.exports =  function(env, argv) {
  // For some reason env is undefined, so use argv.mode
  const mode = argv.mode;
  baseConfig.mode = mode;
  if (mode == 'production') {
    presets.push(productionPreset);
    console.log("MODE=development... Using preset @babel/preset-env.");
  } else {
    console.log("MODE=development... Not using any presets.");
    baseConfig['devtool'] = 'eval-cheap-source-map'
  }
  // console.log(baseConfig.module.rules[0].use[0])
  return baseConfig
}