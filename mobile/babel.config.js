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
      [
        'module-resolver',
        {
          alias: {
            'better-auth/react': path.resolve(workspaceRoot, 'node_modules/better-auth/dist/client/react/index.mjs'),
            'better-auth/client/plugins': path.resolve(workspaceRoot, 'node_modules/better-auth/dist/client/plugins/index.mjs'),
            '@better-auth/expo/client': path.resolve(workspaceRoot, 'node_modules/@better-auth/expo/dist/client.mjs'),
          },
        },
      ],
      'react-native-worklets/plugin', // MUST be last (moved from reanimated/plugin)
    ],
  };
};
