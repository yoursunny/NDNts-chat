const path = require("path");
const Dotenv = require("dotenv-webpack");

/** @returns {import("webpack").Configuration} */
module.exports = (env, argv) => ({
  mode: argv.mode ?? "production",
  devtool: argv.mode === "development" ? "cheap-module-source-map" : "source-map",
  entry: "./src/main.tsx",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "public"),
  },
  performance: {
    hints: false,
  },
  plugins: [
    new Dotenv({
      defaults: "sample.env",
    }),
  ],
  devServer: {
    static: {
      directory: path.resolve(__dirname, "public"),
    },
    allowedHosts: "all",
    port: 3333,
  },
});
