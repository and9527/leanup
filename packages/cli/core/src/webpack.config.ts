const path = require('path');

const CopyModulesWebpackPlugin = require('copy-modules-webpack-plugin');
const { ESBuildPlugin, ESBuildMinifyPlugin } = require('esbuild-loader');
const packageJsonApp = require(path.join(process.cwd(), 'package.json'));
const packageJsonCli = require(path.join(process.cwd(), 'node_modules', '@leanup', 'cli', 'package.json'));

export function webpackConfig(env: any, argv: any): Object {
  argv.host = typeof argv.host === 'string' ? argv.host : 'localhost';

  const BABEL_LOADER = {
    test: /\.(j|t)sx$/,
    use: {
      loader: 'babel-loader',
      options: Object.assign(
        {
          cacheCompression: false,
          cacheDirectory: true,
        },
        require(path.join(process.cwd(), './babel.config'))
      ),
    },
  };
  const ESBUILD_LOADER_JS = {
    test: /\.js$/,
    loader: 'esbuild-loader',
  };
  const ESBUILD_LOADER_TS = {
    test: /\.ts$/,
    loader: 'esbuild-loader',
    options: {
      loader: 'ts',
    },
  };
  // const ESBUILD_LOADER_TSX = {
  //   test: /\.tsx$/,
  //   loader: 'esbuild-loader',
  //   options: {
  //     loader: 'tsx',
  //   },
  // };
  const FONT_FILE_LOADER = {
    test: /\.(woff|woff2|eot|ttf|otf)$/,
    use: [
      {
        loader: 'file-loader',
        options: {
          outputPath: 'assets/fonts',
        },
      },
    ],
  };
  const IMAGE_FILE_LOADER = {
    test: /\.(png|svg|jpg|jpeg|gif)$/,
    use: [
      {
        loader: 'file-loader',
        options: {
          outputPath: 'assets/images',
        },
      },
    ],
  };
  const LESS_LOADER = {
    test: /\.less$/,
    use: [
      'style-loader',
      'css-loader',
      'postcss-loader',
      {
        loader: 'less-loader',
        options: {
          lessOptions: {
            javascriptEnabled: true,
            modifyVars: {},
          },
        },
      },
    ],
  };
  const SASS_LOADER = {
    test: /\.(sa|s?c)ss$/,
    use: [
      'style-loader',
      'css-loader',
      'postcss-loader',
      {
        loader: 'sass-loader',
        options: {
          implementation: require('sass'),
          sassOptions: {
            includePaths: ['node_modules'],
          },
        },
      },
    ],
  };

  const MULTIPLE_REPLACEMENTS = [
    // https://nodejs.org/dist/latest-v14.x/docs/api/process.html#process_process_env
    // https://github.com/webpack/webpack/issues/7074#issuecomment-663855534
    { search: '$$NODE_ENV$$', replace: argv.mode },
  ];

  // https://docs.npmjs.com/files/package.json#people-fields-author-contributors
  if (typeof packageJsonApp.name === 'string') {
    MULTIPLE_REPLACEMENTS.push({ search: '$$APP_NAME$$', replace: packageJsonApp.name });
  }
  if (typeof packageJsonApp.version === 'string') {
    MULTIPLE_REPLACEMENTS.push({ search: '$$APP_VERSION$$', replace: packageJsonApp.version });
  }
  if (typeof packageJsonApp.author === 'string') {
    MULTIPLE_REPLACEMENTS.push({ search: '$$APP_AUTHOR$$', replace: packageJsonApp.author });
  } else if (typeof packageJsonApp.author === 'object' && packageJsonApp.author != null) {
    if (typeof packageJsonApp.author.name === 'string') {
      MULTIPLE_REPLACEMENTS.push({ search: '$$APP_AUTHOR_NAME$$', replace: packageJsonApp.author.name });
    }
    if (typeof packageJsonApp.author.mail === 'string') {
      MULTIPLE_REPLACEMENTS.push({ search: '$$APP_AUTHOR_MAIL$$', replace: packageJsonApp.author.mail });
    }
    if (typeof packageJsonApp.author.url === 'string') {
      MULTIPLE_REPLACEMENTS.push({ search: '$$APP_AUTHOR_URL$$', replace: packageJsonApp.author.url });
    }
  }
  if (typeof packageJsonApp.homepage === 'string') {
    MULTIPLE_REPLACEMENTS.push({ search: '$$APP_HOMEPAGE$$', replace: packageJsonApp.homepage });
  }
  if (typeof packageJsonCli.name === 'string') {
    MULTIPLE_REPLACEMENTS.push({ search: '$$CLI_NAME$$', replace: packageJsonCli.name });
  }
  if (typeof packageJsonCli.version === 'string') {
    MULTIPLE_REPLACEMENTS.push({ search: '$$CLI_VERSION$$', replace: packageJsonCli.version });
  }
  const STRING_REPLACE_LOADER = {
    test: /\.(j|t)sx?$/,
    loader: 'string-replace-loader',
    options: {
      multiple: MULTIPLE_REPLACEMENTS,
    },
  };

  const config = {
    devServer: {
      compress: true,
      contentBase: path.join(process.cwd(), `public`),
      host: argv.host,
      disableHostCheck: true,
      publicPath: '/',
    },
    entry: {
      app: path.join(process.cwd(), `src`, `main.ts`),
    },
    module: {
      rules: [
        BABEL_LOADER,
        STRING_REPLACE_LOADER,
        ESBUILD_LOADER_JS,
        ESBUILD_LOADER_TS,
        BABEL_LOADER,
        // ESBUILD_LOADER_TSX,
        FONT_FILE_LOADER,
        IMAGE_FILE_LOADER,
        LESS_LOADER,
        SASS_LOADER,
      ],
    },
    optimization: {
      minimize: true,
      minimizer: [
        new ESBuildMinifyPlugin({
          target: 'es2015',
        }),
      ],
    },
    output: {
      path: path.join(process.cwd(), 'dist'),
    },
    plugins: [
      new CopyModulesWebpackPlugin({
        destination: '.reports/nexus-iq',
        includePackageJsons: true,
      }),
      new ESBuildPlugin(),
    ],
    resolve: {
      alias: {},
      modules: ['node_modules'],
      extensions: ['.mjs', '.js', '.jsx', '.svelte', '.ts', '.tsx', '.vue', '.gql', '.graphql'],
    },
  };

  const cannotFindCliModule = /Cannot find module.+leanup\/cli/;

  function loadAddon(name: string) {
    try {
      require(`@leanup/cli-${name}/webpack.config`)(argv, config);
    } catch (error) {
      if (false === cannotFindCliModule.test(error)) {
        throw error;
      }
    }
  }
  ['addons', 'cucumber', 'graphql', 'pwa', 'webhint'].forEach(loadAddon);

  return config;
}
