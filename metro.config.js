const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// Get the default Expo Metro config
const defaultConfig = getDefaultConfig(__dirname);

// Extend asset extensions if needed (e.g., for databases, fonts, etc.)
defaultConfig.resolver.assetExts.push(
  "db",
  "sqlite",
  "ttf",
  "otf",
  "woff",
  "woff2"
);

// Enable experimental import support (if using Expo Router)
defaultConfig.resolver.unstable_enablePackageExports = true;

// Apply NativeWind CSS processing
module.exports = withNativeWind(defaultConfig, {
  input: "./global.css",
  // Optional: Enable watching CSS changes in development
  projectRoot: __dirname,
});