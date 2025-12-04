// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Added "wasm" to the list of asset extensions
config.resolver.assetExts.push('wasm');

module.exports = config;
