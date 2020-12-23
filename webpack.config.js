const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { ESBuildPlugin } = require('esbuild-loader');
const { EnvironmentPlugin } = require('webpack');

module.exports = {
  entry: './src/index.ts',

  mode: process.env.NODE_ENV !== 'production' ? 'development' : 'production',

  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
  },

  devServer: {
    contentBase: './dist',
    hot: true,
    disableHostCheck: true,
  },

  devtool: 'inline-source-map',

  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'esbuild-loader',
        exclude: /node_modules/,
        options: {
          loader: 'ts',
          target: 'es2018',
          tsconfigRaw: require('./tsconfig.json'),
        },
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|bmp)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.obj$/i,
        type: 'asset/resource',
      },
      {
        test: /\.glsl$/,
        use: 'raw-loader',
      },
      // {
      //   test: /\.obj$/,
      //   loader: 'webpack-obj-loader',
      // },
    ],
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.glsl'],
  },

  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new HtmlWebpackPlugin({
      title: 'WebGL',
      template: './src/index.html',
    }),
    new EnvironmentPlugin({
      NODE_ENV: 'development',
    }),
    new ESBuildPlugin(),
  ],

  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
