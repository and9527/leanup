// remove before release v1.1
module.exports = (env, argv) => {
  const { webpackConfig } = require('./lib/webpack.config');
  return webpackConfig(env, argv);
};
