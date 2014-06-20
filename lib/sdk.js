var tiappXml = require('tiapp.xml'),
	U = require('./utils');

module.exports = function sdk(opts, callback) {

	// validate input
	callback = U.maybeCallback(arguments[arguments.length-1]);
	if (!opts || U.isFunction(opts)) {
		opts = {};
	}

	// validate command type
	var type = opts.type || 'get';
	if (type !== 'get' && type !== 'set') {
		return callback('Invalid type "' + type + '". Must be "get" or "set".');
	}

	try {
		var tiapp = tiappXml.load(opts.tiapp);

		if (type === 'get') {

			// get the tiapp property holding the SDK name
			var mwSdk = tiapp.getProperty('mw-sdk-name');
			if (!mwSdk) {
				return callback(null, null);
			}

			// search for the installed module
			var modules = tiapp.getModules();
			for (var i = 0; i < modules.length; i++) {
				if (modules[i].id === mwSdk) {

					// return module object if found
					return callback(null, modules[i]);
				}
			}
		} else if (type === 'set') {
			if (!opts.name) {
				return callback('No sdk name specified for sdk() with type "set"');
			}

			// write sdk name as tiapp property
			tiapp.setProperty('mw-sdk-name', opts.name, 'string');

			// set the native commonjs module
			tiapp.setModule(opts.name, {
				version: opts.version,
				platform: 'commonjs'
			});

			// write the tiapp.xml
			tiapp.write();
		}
	} catch (e) {
		return callback(e);
	}

	return callback(null, null);
};
