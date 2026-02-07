const path = require('path');

module.exports = function (api) {
  api.cache(true);

  // In monorepo, node_modules is at the root level
  const workspaceRoot = path.resolve(__dirname, '..');

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
      // module-resolver ya no es necesario (eliminados alias de better-auth)
      'react-native-worklets/plugin', // MUST be last (moved from reanimated/plugin)
    ],
  };
};
