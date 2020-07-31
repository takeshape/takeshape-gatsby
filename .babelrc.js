module.exports = (api) => {
  api.cache(false);
  return {
    presets: ['@babel/preset-typescript', 'babel-preset-gatsby-package'],
    plugins: ['@babel/plugin-transform-modules-commonjs']
  };
};
