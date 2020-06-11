const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: './src/main.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    contentBase: './',
  },
	module: {
		rules: [{
			test: /\.js?$/,
			exclude: /node_modules/,
			use: [
				{
					loader: 'babel-loader',
					options: {
            sourceMaps: false,
						presets: ['@babel/preset-env'],
						plugins: ['babel-plugin-redrunner', '@babel/plugin-proposal-class-properties'],
					}
				}
			]
		}]
	}
};