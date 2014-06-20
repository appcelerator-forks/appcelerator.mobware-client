var disable = require('./disable'),
	enable = require('./enable'),
	keys = require('./keys'),
	pkg = require('../package'),
	sdk = require('./sdk');

exports.disable = disable;
exports.enable = enable;
exports.keys = keys;
exports.sdk = sdk;
exports.version = pkg.version;