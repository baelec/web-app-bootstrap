'use strict';

const path = require('path');
const webpack = require('webpack');
const HtmlPlugin = require('html-webpack-plugin');
const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
//const HardSourcePlugin = require('hard-source-webpack-plugin');
const HappyPackPlugin = require('happypack');

const happyThreadPool = HappyPackPlugin.ThreadPool({size: 5});

const ROOT_DIR = path.resolve('.');
const SOURCE_DIR = path.resolve(ROOT_DIR, 'src');
const BUILD_DIR = path.resolve(ROOT_DIR, 'build/webpack');

module.exports = (isDev = false) => {
  const plugins = [
    new CleanPlugin(BUILD_DIR, {root: ROOT_DIR}),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    /*new HardSourcePlugin({}),
    createHappyPlugin('ts', [{
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
        happyPackMode: true,
      },
    }]),*/
    new HtmlPlugin({
      inject: true,
      template: path.resolve(ROOT_DIR, 'public/index.html'),
    }),
    new ForkTsCheckerPlugin({
      async: false,
      watch: SOURCE_DIR,
      tslint: false,
      checkSyntacticErrors: true,
    }),
  ];

  const HAPPY_CSS_LOADER = 'happypack/loader?id=css';
  const CSS_LOADER = 'css-loader';
  const mode = isDev ? 'development' : 'production';
  if (isDev) {
    plugins.push(createHappyPlugin('css', ['style-loader', CSS_LOADER]));
  } else {
    plugins.push(new MiniCssExtractPlugin(), createHappyPlugin('css', [MiniCssExtractPlugin.loader, CSS_LOADER]))
  }

  return {
    mode,
    devtool: false,
    performance: {
      hints: false,
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /node_modules/,
            priority: 20,
          }
        }
      }
    },
    entry: [
      path.resolve(SOURCE_DIR, 'index.tsx'),
    ],
    output: {
      chunkFilename: "[name].[chunkhash:4].js",
      filename: '[name].[chunkhash].js',
      path: BUILD_DIR,
    },
    resolve: {
      extensions: [
        '.ts',
        '.js',
        '.mjs',
        '.tsx',
        '.jsx',
        '.json',
      ],
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|mjs)$/,
          loader: 'source-map-loader',
          enforce: 'pre',
          include: SOURCE_DIR,
        },
        {
          oneOf: [
            {
              test: /\.(ts|tsx|js|jsx|mjs)$/,
              include: SOURCE_DIR,
              use: 'happypack/loader?id=ts',
            },
            {
              test: /\.css$/,
              use: HAPPY_CSS_LOADER,
            },
            {
              exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
              loader: 'file-loader',
              options: {
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
          ],
        },
      ],
    },
    plugins,
  };
};

function createHappyPlugin(id, loaders) {
  return new HappyPackPlugin({
    id: id,
    loaders: loaders,
    threadPool: happyThreadPool,
    verbose: false,
  });
}
