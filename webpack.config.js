const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
    mode: "production",
    node: false,
    devtool: 'eval-source-map',
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist/client'),
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
          title: "Output Management",
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
          exclude: /webpack-dev-server\/client\/modules\/logger/,
        },
        {
          test: /\.js$/,
          loader: "webpack-remove-debug", // remove "debug" package
          exclude: /webpack-dev-server\/client\/modules\/logger/,
        },
        {
            test: /\.ts$/,
            loader: "ts-loader",
            exclude: /node-modules/,
        }
      ],
    },
    resolve: {
        extensions: [".js", ".ts"],
    }
  };