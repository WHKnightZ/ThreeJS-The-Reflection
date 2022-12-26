const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: ["./src/index.ts", "./src/styles/index.scss"],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.glsl$/,
        loader: "webpack-glsl-loader",
      },
      {
        test: /\.(sa|sc)ss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts", ".html"],
  },
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "static/js"),
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "../styles/index.css",
    }),
  ],
  devServer: {
    static: {
      directory: "./",
    },
    compress: true,
    port: 3000,
    devMiddleware: {
      writeToDisk: true,
    },
  },
};
