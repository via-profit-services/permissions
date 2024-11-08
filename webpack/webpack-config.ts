// eslint-disable-next-line @typescript-eslint/ban-ts-comment
/* @ts-ignore */
import fs from 'node:fs';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
/* @ts-ignore */
import path from 'node:path';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
/* @ts-ignore */
import NodemonPlugin from 'nodemon-webpack-plugin';
import { Configuration, DefinePlugin, Compiler } from 'webpack';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import packageInfo from '../package.json';

const isDev = process.env.NODE_ENV === 'development';
const webpackBaseConfig: Configuration = {
  target: 'node',
  mode: isDev ? 'development' : 'production',
  devtool: isDev ? 'source-map' : false,
  optimization: {
    minimize: false,
  },
  entry:{
    index: path.resolve(__dirname, '../src/index.ts'),
  },
  output: {
    libraryTarget: 'commonjs2',
    path: isDev ? path.join(__dirname, '../build/') : path.join(__dirname, '../dist/'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    alias: {
      '~': path.resolve(__dirname, '..', 'src'),
    },
  },
  externals: [],
  node: {
    __dirname: true,
  },
  plugins: [
    /**
     * Development and production plugins
     */
    new DefinePlugin({
      'process.env.WEBPACK_INJECT_APP_VERSION': JSON.stringify(packageInfo.version),
    }),
    ...(isDev
      ? /**
         * Development only plugins
         */
        [
          new NodemonPlugin({
            watch: ['./build'],
            exec: 'node --inspect=9229 ./build/index.js',
          }),
        ]
      : /**
         * Production only plugins
         */
        [
          {
            apply: (compiler: Compiler) => {
              compiler.hooks.beforeRun.tapAsync('WebpackBeforeBuild', (_, callback) => {
                if (fs.existsSync(path.join(__dirname, '../dist/'))) {
                  fs.rmSync(path.join(__dirname, '../dist/'), { recursive: true });
                }
      
                callback();
              });
      
              compiler.hooks.afterEmit.tapAsync('WebpackAfterBuild', (_, callback) => {
                fs.copyFileSync(
                  path.resolve(__dirname, '../src/@types/index.d.ts'),
                  path.resolve(__dirname, '../dist/index.d.ts'),
                );
                callback();
              });
            },
          },

        ]),
  ],
};

export default webpackBaseConfig;
