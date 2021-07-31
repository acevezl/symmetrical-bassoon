const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
// const SWPrecacheWebpackPlugin = require("sw-precache-webpack-plugin");
const WebpackPwaManifest = require("webpack-pwa-manifest");
const path = require('path');

const config = {
  entry: { 
    app: './public/js/index.js',
    // offline: './public/js/idb.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: __dirname + '/public/dist'
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              esModule: false,
              name(file) {
                return '[path][name].[ext]';
              },
              publicPath(url) {
                return url.replace('/', '/public');
              }
            }
          },
          {
            loader: 'image-webpack-loader'
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static'
    }),
    new WebpackPwaManifest({
      name: "Symmetrical Bassoon",
      short_name: "SymBass",
      description: "An app that allows you to keep track of your spending.",
      background_color: "#01579b",
      theme_color: "#ffffff",
      fingerprints: false,
      inject: false,
      icons: [{
        src: path.resolve("public/icons/icon-512x512.png"),
        sizes: [72, 96, 128, 144, 152, 192, 384, 512],
        destination: path.join("assets", "icons")
      }]
    })
  ],
  mode: 'development'
};

module.exports = config;
