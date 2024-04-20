const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const paths = require('./config/paths');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const nodeExternals = require('webpack-node-externals');

const config = {
  bail: true,

  context: __dirname,

  entry: {
    'armory-component-ui': './src/index.js',
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs-module',
  },

  externals: [nodeExternals()],

  module: {
    strictExportPresence: true,

    rules: [
      {
        test: /\.js$/,
        include: paths.appSrc,
        loader: 'babel-loader',
      },
      {
        test: /\.(css|less)$/,
        include: [paths.appSrc, paths.appNodeModules],
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: true,
                importLoaders: '1',
                localIdentName: 'gw2a--[hash:base64:5]',
              },
            },
            'less-loader',
          ],
        }),
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 100,
          name: 'images/gw2a--[hash:base64:5].[ext]',
        },
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
      },
    ],
  },

  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),

    new ExtractTextPlugin({
      filename: 'styles.css',
      allChunks: true,
    }),

    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
    }),
  ],

  devServer: {
    contentBase: path.join(__dirname, 'dist'), // 告诉 devServer 从哪里提供内容
    port: 8082, // 设置 devServer 的端口号
    proxy: {
      '/qobuz': { // 设置代理规则，将以 /api 开头的请求代理到目标地址
        target: 'https://www.qobuz.com', // 设置代理目标地址
        changeOrigin: true, // 修改请求头中的 host 为代理目标地址的 host
        secure: false, // 如果代理目标地址是 https，需要设置为 false
      },
    },
  },
};

module.exports = config;
