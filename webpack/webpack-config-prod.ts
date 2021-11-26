import fs from 'fs';
import path from 'path';
import { BannerPlugin, Configuration, Compiler } from 'webpack';
import { merge } from 'webpack-merge';

import packageInfo from '../package.json';
import webpackBaseConfig from './webpack-config-base';

const webpackProdConfig: Configuration = merge(webpackBaseConfig, {
  entry: {
    index: path.resolve(__dirname, '../src/index.ts'),
  },
  output: {
    path: path.join(__dirname, '../dist/'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  mode: 'production',
  optimization: {
    minimize: false,
  },
  plugins: [
    new BannerPlugin({
      banner: `
 Via Profit services / Permissions

Repository ${packageInfo.repository.url}
Contact    ${packageInfo.support}
      `,
    }),
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
  ],
});

export default webpackProdConfig;
