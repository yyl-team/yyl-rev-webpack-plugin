'use strict'
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const extOs = require('yyl-os')
const IPlugin = require('../../../')

// + plugin options
const iPluginOption = {
  context: __dirname,
  remote: true,
  remoteAddr: 'https://web.yystatic.com/project/yycom_header/pc/assets/rev-manifest.json',
  remoteBlankCss: true,
  extends: {
    ext01: +new Date()
  }
}
// - plugin options

const wConfig = {
  mode: 'development',
  context: __dirname,
  entry: {
    index: ['./src/entry/index/index.js']
  },
  output: {
    path: path.join(__dirname, './dist/'),
    filename: 'js/[name]-[chunkhash:8].js',
    chunkFilename: 'js/async_component/[name]-[chunkhash:8].js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader'
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'url-loader',
        options: {
          limit: 0,
          name: 'images/[name]-[hash:8].[ext]'
        }
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  resolve: {
    alias: {
      jsDest: './dist/js'
    }
  },
  devtool: 'source-map',
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name]-[chunkhash:8].css'
    }),
    new HtmlWebpackPlugin({
      template: './src/entry/index/index.html',
      filename: 'html/index.html',
      chunks: 'all'
    }),
    new IPlugin(iPluginOption)
  ],
  devServer: {
    static: './dist',
    port: 5000,
    open: true,
    openPage: 'http://127.0.0.1:5000/html/'
  }
}

module.exports = wConfig
