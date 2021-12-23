const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const mainConfig = {
  devtool: "inline-cheap-module-source-map",
  mode: "development",
  entry: ["./src/components/App.jsx", "./manifest.json"],
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].bundle.js",
    publicPath: "./",
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
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
    extensions: [".js", ".jsx"],
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
        test: /\.js?x$/,
        use: ["babel-loader"],
        include: path.join(__dirname, "src"),
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.less$/i,
        use: [
          MiniCssExtractPlugin.loader,
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
                path.resolve(__dirname, 'src/contentScripts/css/variables.less')
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
    ],
  },
};

const indexConfig = {
  entry: "./src/loadPanel.js",
  mode: "production",
  output: {
    path: path.join(__dirname, "dist"),
    filename: "loadPanel.js",
    publicPath: "./",
  },
};

const highlightCssConfig = {
  entry:
    "./src/contentScripts/highlight.css",
  mode: "production",
  plugins: [new MiniCssExtractPlugin({ filename: "highlight.css" })],
  module: {
    rules: [
      {
        test: /highlight.css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: "./",
            },
          },
          "css-loader",
        ],
      },
    ],
  },
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
            loader: MiniCssExtractPlugin.loader,
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
                path.resolve(__dirname, 'src/contentScripts/css/variables.less'),
              ],
            },
          },
        ],
      },
    ],
  },
};

module.exports = [mainConfig, indexConfig, highlightCssConfig, contentScripts];
