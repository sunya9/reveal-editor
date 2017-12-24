const { EnvironmentPlugin } = require('webpack')
const { join, resolve } = require('path')
const BabiliPlugin = require('babili-webpack-plugin')

const debug = process.env.NODE_ENV !== 'production'

const config = {
  entry: join(__dirname, 'src/js/main.js'),
  output: {
    path: join(__dirname, 'assets'),
    publicPath: '/assets/',
    filename: 'js/bundle.js'
  },
  plugins: [],
  module: {
    rules: [
      {
        include: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'eslint-loader']
      },
      {
        include: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        include: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            js: ['babel-loader', 'eslint-loader'],
            scss: ['style-loader', 'css-loader', 'sass-loader']
          }
        }
      },
      {
        include: /\.(woff2?|otf|ttf|eot|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'fonts/',
              publicPath: `${debug ? 'http://localhost:8080' : '.'}/assets/`
            }
          }
        ]
      }]
  },
  target: 'electron-renderer',
  resolve: {
    alias: {
      '@main': resolve(__dirname, 'lib'),
      '@renderer': resolve(__dirname, 'src', 'js'),
      '@style': resolve(__dirname, 'src', 'scss')
    }
  }
}

if(debug) {
  config.devtool = 'source-map'
} else {
  config.plugins.push(new BabiliPlugin())
  config.plugins.push(new EnvironmentPlugin(['NODE_ENV']))
}

module.exports = config
