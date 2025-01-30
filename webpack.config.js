const path = require("node:path");

module.exports = {
  mode: "development",
  devtool: "source-map",
  module: {
    rules: [
      {
        // 拡張子 js のファイル（正規表現）
        test: /\.jsx?$/,
        // ローダーの指定
        loader: "babel-loader",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".json", ".jsx"],
  },
  entry: "./src/index.jsx",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist", "src"),
    publicPath: '/src/',
  },
  devServer: {
    static: {
      directory: "./dist",
    },
  },
};