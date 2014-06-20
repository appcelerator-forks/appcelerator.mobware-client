var tiappXml = require('tiapp.xml'),
	U = require('./utils');

module.exports = function disable(opts, callback) {

	// validate input
	callback = U.maybeCallback(arguments[arguments.length-1]);
	if (!opts || U.isFunction(opts)) {
		opts = {};
	}

	// remove keys from tiapp
	try {
		var tiapp = tiappXml.load(opts.tiapp);

		tiapp.removeProperty('mw-key-dev');
		tiapp.removeProperty('mw-key-prod');
		tiapp.write();

		return callback();
	} catch (e) {
		return callback(e);
	}
};
