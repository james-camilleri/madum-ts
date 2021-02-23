const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const path = require('path')
const ESLintPlugin = require('eslint-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const production = process.env.NODE_ENV === 'production'

module.exports = {
  mode: production ? 'production' : 'development',
  entry: './src/index.ts',
  resolve: {
    extensions: ['.ts', '.js', '.svg']
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist'
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader'
      }, {
        test: /\.svg$/,
        use: 'raw-loader'
      }, {
        test: /\.html$/,
        use: 'html-loader'
      }, {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new ESLintPlugin({
      extensions: ['ts']
    })
  ]
}
