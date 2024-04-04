import path, { join, resolve as _resolve } from 'path';
import { fileURLToPath } from 'url';
import pkg from 'webpack';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyPlugin from 'copy-webpack-plugin';

import process from 'process';

const reduxLogEnable = process.argv.includes('reduxlogenable');
const devEnvironment = process.argv.includes('devenv');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { HotModuleReplacementPlugin } = pkg;
const { loader: _loader } = MiniCssExtractPlugin;

const mainConfig = {
  devtool: 'inline-cheap-module-source-map',
  mode: 'development',
  entry: {
    index: './src/index.js',
    app: './src/app.jsx',
    contentScript: './src/pageServices/contentScripts/index.ts',
    options: './src/options/options.js',
  },
  output: {
    path: join(__dirname, 'dist'),
    filename: (chunkData) => {
      return chunkData.chunk.name === 'options' ? '[name].js' : '[name].bundle.js';
    },
    publicPath: './',
  },
  plugins: [
    new HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      title: 'JDN extension',
      template: './src/index.html',
      filename: 'index.html',
      inject: false,
    }),
    new HtmlWebpackPlugin({
      title: 'JDN extension - panel',
      template: './src/app.html',
      filename: 'app.html',
      chunks: ['app'],
    }),
    new HtmlWebpackPlugin({
      title: 'Extension settings',
      template: './src/options/options.html',
      filename: 'options.html',
      chunks: ['optionsScript'],
      inject: true,
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new pkg.DefinePlugin({
      __REDUX_LOG_ENABLE__: reduxLogEnable,
      __DEV_ENVIRONMENT__: devEnvironment,
    }),
    new CopyPlugin({
      patterns: [{ from: './src/options/options.styles.css', to: '' }],
    }),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        type: 'javascript/auto',
        test: /manifest\.json$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: './[name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        use: ['ts-loader'],
        include: join(__dirname, 'src'),
      },
      {
        test: /\.css$/i,
        use: [_loader, 'css-loader'],
      },
      {
        test: /\.less$/i,
        use: [
          _loader,
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                // important extra layer for less-loader^6.0.0
                javascriptEnabled: true,
                modifyVars: {
                  'menu-horizontal-line-height': '32px',
                  'checkbox-size': '14px',
                  'layout-header-background': 'transparent',
                },
              },
            },
          },
          {
            loader: 'style-resources-loader',
            options: {
              patterns: [_resolve(__dirname, 'src/common/styles/variables.less')],
            },
          },
        ],
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: '@svgr/webpack',
            options: {
              babel: false,
              icon: true,
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              esModule: false,
              name: '[name].[ext]',
              outputPath: './',
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ['file-loader', 'url-loader'],
      },
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.md$/,
        use: 'raw-loader',
      },
    ],
  },
};

const manifest = {
  devtool: 'inline-cheap-module-source-map',
  mode: 'development',
  entry: './manifest.json',
  output: {
    path: join(__dirname, 'dist'),
    publicPath: './',
    assetModuleFilename: '[name][ext]',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.json$/,
        type: 'asset/resource',
      },
    ],
  },
};

const contentStyles = {
  entry: './src/pageServices/contentScripts/css/index.less',
  mode: 'production',
  plugins: [new MiniCssExtractPlugin({ filename: 'contentStyles.css' })],
  module: {
    rules: [
      {
        test: /index.less$/i,
        use: [
          {
            loader: _loader,
            options: {
              publicPath: './',
            },
          },
          'css-loader',
          'less-loader',
          {
            loader: 'style-resources-loader',
            options: {
              patterns: [_resolve(__dirname, 'src/pageServices/contentScripts/css/variables.less')],
            },
          },
        ],
      },
    ],
  },
};

export default [mainConfig, manifest, contentStyles];
