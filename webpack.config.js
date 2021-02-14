const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const BundleAnalyzerPlugin = !!process.env.PROFILE ? require('webpack-bundle-analyzer').BundleAnalyzerPlugin : undefined;
const isProduction = process.env['NODE_ENV'] == 'production';

const PAGE_TITLE = "macaco";

const stats = {
  assets: true,
  children: false,
  chunks: false,
  errorDetails: true,
  errors: true,
  hash: false,
  modules: false,
  performance: false,
  publicPath: false,
  reasons: false,
  source: false,
  timings: true,
  version: false,
  warnings: true,
};

const frontend_config = {
  stats,
  mode: isProduction ? 'production' : 'development',
  entry: './src/frontend/index.tsx',
  output: { filename: "js/[fullhash].js", path: __dirname + "/public" },
  devtool: "source-map",
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
      { test: /\.css$/i, use: ['style-loader', 'css-loader'], },
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.sass', '.scss'],
    alias: {
      "react": "preact/compat",
      "react-dom": "preact/compat"
    }
  },
  performance: { hints: false },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!favicon.ico'],
    }),
    new HtmlWebpackPlugin({
      title: PAGE_TITLE,
      filename: 'index.html'
    }),
  ],
};

const backend_config = {
  stats,
  mode: isProduction ? 'production' : 'development',
  target: 'node',
  entry: { server: [ "./src/backend/main.ts" ], cli: [ "./src/backend/macaco_cli.ts" ], tests: ["./src/test_suite.ts"] },
  output: { filename: "[name].js", path: __dirname + "/dist" },
  externals: [nodeExternals()],
  devtool: "source-map",
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  optimization: {
    // don't hardcode NODE_ENV environment variable
    nodeEnv: false
  },
  performance: { hints: false },
  plugins: [
    new CleanWebpackPlugin(),
  ],
}

if (BundleAnalyzerPlugin !== undefined) {
  config.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = [ backend_config, frontend_config ];
