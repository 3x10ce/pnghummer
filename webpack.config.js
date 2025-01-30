const path = require("node:path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// development モードか否か？
const isDev = process.env.NODE_ENV === "development";

module.exports = {
  mode: isDev ? "development" : "production",
  devtool: isDev ? "source-map" : undefined,
  module: {
    rules: [
      {
        // 画像やフォントファイル
        test: /\.(ico|png|svg|ttf|otf|eot|woff?2?)$/,
        type: "asset",
        parser: {
          dataUrlCondition: {
	          // 8kb 以上なら `asset/resource` する
            maxSize: 1024 * 8,
          },
        },
      },
      {
        // 拡張子 js のファイル（正規表現）
        test: /\.jsx?$/,
        // ローダーの指定
        loader: "babel-loader",
      },
      {
        // 拡張子 scss または css のファイル
        test: /\.s?css$/,
        use: [
          "style-loader",
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: false,
            },
          },
          {
            loader: "css-loader",
            options: {
              // dev モードではソースマップを付ける
              sourceMap: isDev,
            },
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: isDev,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".json", ".jsx"],
  },
  entry: "./src/index.jsx",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    // publicPath: '/src/',
    assetModuleFilename: "asset/[name][ext]",
  },
  devServer: {
    static: {
      directory: "./dist",
    },
  },
  plugins: [
    // HTMML の出力
    new HtmlWebpackPlugin({
      // テンプレート
      template: "./src/index.html",
      // 出力先
      filename: "index.html",
      // <script> ~ </script> タグの挿入位置
      inject: "body",
      // スクリプト読み込みのタイプ
      scriptLoading: "defer",
      // ファビコン
      favicon: "./src/favicon.svg",
    }),
    // CSS の出力
    new MiniCssExtractPlugin(),
  ],
};