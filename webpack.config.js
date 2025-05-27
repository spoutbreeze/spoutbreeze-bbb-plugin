/* eslint-disable @typescript-eslint/no-var-requires */
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const path = require('path');

module.exports = {
  entry: './src/index.tsx',
  output: {
    filename: 'SampleStreamButtonPlugin.js',
    library: 'SampleStreamButtonPlugin',
    libraryTarget: 'umd',
    publicPath: '/',
    globalObject: 'this',
  },
  devServer: {
    allowedHosts: 'all',
    port: 4701,
    host: '0.0.0.0',
    hot: false,
    liveReload: false,
    client: {
      overlay: false,
    },
    onBeforeSetupMiddleware: (devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      // Serve manifest.json from the project root when requested at /manifest.json
      devServer.app.get('/manifest.json', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'manifest.json'));
      });
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.tsx', '.ts'],
  },
  plugins: [
    new Dotenv({
      path: './.env', // Path to .env file
      safe: false, // Set to true if you have a .env.example file
      systemvars: true, // Load system environment variables as well
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.json', to: './' }, // Copy manifest.json to static/ in the output folder
      ],
    }),
  ],
};
