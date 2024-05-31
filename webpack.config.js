const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: "./src/client/index.ts",
    performance: {
        hints: false,
    },
    output: {
      filename: "[name].bundle.js",
      path: path.resolve(__dirname, 'dist/client'),
      clean: true,
    },
    mode: "development",
    node: false,
    devtool: 'inline-source-map',
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist/client'),
        },
        allowedHosts: "all",
        client: {
          logging: "warn",
          overlay: {
            errors: true,
            warnings: false,
          },
        },
        hot: true,
        proxy: [
          {
            context: "/socket.io",
            target: "http://127.0.0.1:3000"
          },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
          title: "Statium Client",
          template: "./src/client/index.html",
        }),
      ],
    module: {
      rules: [
        {
          test: /\.m?js$/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"], // ensure compatibility with older browsers
              plugins: ["@babel/plugin-transform-object-assign"], // ensure compatibility with IE 11
            },
          },
          exclude: [/webpack-dev-server\/client\/modules\/logger/, /src\/server/],
        },
        {
          test: /\.js$/,
          loader: "webpack-remove-debug", // remove "debug" package
          exclude: [/webpack-dev-server\/client\/modules\/logger/, /src\/server/],
        },
        {
            test: /\.ts$/,
            loader: "ts-loader",
            exclude: [/node-modules/],
        }
      ],
    },
    resolve: {
        extensions: [".js", ".ts"],
    },
    /*
    optimization: {
      runtimeChunk: "single",
      minimize: true,
      minimizer: [new TerserPlugin({
          terserOptions: {
              ecma: 6,
              compress: { drop_console: true },
              output: { comments: false, beautify: false },
          },
      })],
    },*/
  };