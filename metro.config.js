const { getDefaultConfig } = require('@expo/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];
  return config;
})();
