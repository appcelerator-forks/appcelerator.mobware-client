var tiappXml = require('tiapp.xml'),
	U = require('./utils');

var DEFAULT_KEYS = 'dev,prod';

module.exports = function keys(opts, callback) {

	// validate input
	callback = U.maybeCallback(arguments[arguments.length-1]);
	if (!opts || U.isFunction(opts)) {
		opts = {};
	} else if (U.isString(opts)) {
		opts = { keys: opts };
	}
	if (!opts.keys) { opts.keys = DEFAULT_KEYS; }

	// obtain list of keys to return in result set
	var parts = opts.keys.split(',');
	var keySet = [];
	for (var i = 0; i < parts.length; i++) {
		var part = parts[i].trim();
		switch (part) {
			case 'dev':
			case 'development':
				keySet.push('dev');
				break;
			case 'prod':
			case 'production':
				keySet.push('prod');
				break;
			default:
				return callback('invalid key type "' + part + '"');
		}
	}

	// get key(s) from tiapp
	try {
		var tiapp = tiappXml.load(opts.tiapp);
		var results = {};

		keySet.forEach(function(key) {
			key = 'mw-key-' + key;
			results[key] = tiapp.getProperty(key);
		});

		return callback(null, results);
	} catch (e) {
		return callback(e);
	}
};
