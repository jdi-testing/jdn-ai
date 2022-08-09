import path from 'path';
import { fileURLToPath } from 'url';
import { join, resolve as _resolve } from "path";
import pkg from 'webpack';
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { HotModuleReplacementPlugin } = pkg;
const { loader: _loader } = MiniCssExtractPlugin;

const mainConfig = {
  devtool: "inline-cheap-module-source-map",
  mode: "development",
  entry: ["./src/components/App.jsx", "./manifest.json"],
  output: {
    path: join(__dirname, "dist"),
    filename: "[name].bundle.js",
    publicPath: "./",
  },
  plugins: [
    new HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      title: "JDN extension",
      template: "./src/index.html",
      filename: "index.html",
      inject: false,
    }),
    new HtmlWebpackPlugin({
      title: "JDN extension - panel",
      template: "./src/panel.html",
      filename: "panel.html",
    }),
    new MiniCssExtractPlugin({
      filename: "./css/[name].css",
    }),
  ],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  module: {
    rules: [
      {
        type: "javascript/auto",
        test: /manifest\.json$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "./[name].[ext]",
            },
          },
        ],
      },
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        use: ["ts-loader"],
        include: join(__dirname, "src"),
      },
      {
        test: /\.css$/i,
        use: [_loader, "css-loader"],
      },
      {
        test: /\.less$/i,
        use: [
          _loader,
          "css-loader",
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                // important extra layer for less-loader^6.0.0
                javascriptEnabled: true,
                modifyVars: {
                  "primary-color": "#1582d8",
                  "primary-color-hover": "#0f73c1",
                  "primary-color-active": "#0f73c1",
                  "disabled-color": "#ffffff",
                  "disabled-bg": "#b2b5c2",
                  // "normal-color": "#b2b5C2",
                  "success-color": "#1582d8", // success state color
                  "warning-color": "#d8a115", // warning state color
                  "error-color": "#d82c15",
                  "btn-default-color": "#1582d8",
                  "btn-default-border": "#1582d8",
                  "menu-horizontal-line-height": "36px",
                  "menu-bg": "#000000",
                  "border-radius-base": "0px",
                  "checkbox-size": "14px",
                },
              },
            },
          },
          {
            loader: 'style-resources-loader',
            options: {
              patterns: [
                _resolve(__dirname, 'src/contentScripts/css/variables.less')
              ],
            },
          },
        ],
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "babel-loader",
          },
          {
            loader: "@svgr/webpack",
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
            loader: "file-loader",
            options: {
              esModule: false,
              name: "[name].[ext]",
              outputPath: "./images/",
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ["file-loader", "url-loader"],
      },
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false
        }
      },
    ],
  },
};

const indexConfig = {
  entry: "./src/loadPanel.js",
  mode: "production",
  output: {
    path: join(__dirname, "dist"),
    filename: "loadPanel.js",
    publicPath: "./",
  },
  module: {
    rules:
    [{
      test: /\.(png|jpe?g|gif)$/i,
      use: [
        {
          loader: "file-loader",
          options: {
            esModule: false,
            name: "[name].[ext]",
            outputPath: "./",
          },
        },
      ],
    }],
  }
};

const contentScripts = {
  entry:
    "./src/contentScripts/css/contentScripts.less",
  mode: "production",
  plugins: [new MiniCssExtractPlugin({ filename: "contentScripts.css" })],
  module: {
    rules: [
      {
        test: /contentScripts.less$/i,
        use: [
          {
            loader: _loader,
            options: {
              publicPath: "./",
            },
          },
          "css-loader",
          "less-loader",
          {
            loader: 'style-resources-loader',
            options: {
              patterns: [
                _resolve(__dirname, 'src/contentScripts/css/variables.less'),
              ],
            },
          },
        ],
      },
    ],
  },
};

export default [mainConfig, indexConfig, contentScripts];
