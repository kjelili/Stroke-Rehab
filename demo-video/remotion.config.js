// CommonJS so Remotion CLI can load this when running render/preview
const { Config } = require('@remotion/cli/config');

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
