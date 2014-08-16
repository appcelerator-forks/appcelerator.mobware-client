var async = require('async'),
	constants = require('./constants'),
	tiappXml = require('tiapp.xml'),
	U = require('./utils');

module.exports = function enable(username, password, opts, callback) {

	// process params
	callback = U.maybeCallback(arguments[arguments.length-1]);
	if (!opts || U.isFunction(opts)) {
		opts = {};
	}
	opts.username = username || opts.username || null;
	opts.password = password || opts.password || null;

	// pass in opts, prompt for creds, authenticate, then enable
	async.waterfall([
		function(cb) { return cb(null, opts); },
		U.authenticate, enableRequest
	], callback);
};

function enableRequest(opts, callback) {
	return U.doRequest(
		constants.ENABLE_API,
		{
			cookie: opts.cookie,
			host: opts.host,
			port: opts.port,
			postObject: {
				appId: opts.appId
			},
			success: function(res, data) {
				try {
					var json = JSON.parse(data),
						tiapp = tiappXml.load(opts.tiapp);

					tiapp.setProperty('mw-key-dev', json.result.keys.development, 'string');
					tiapp.setProperty('mw-key-prod', json.result.keys.production, 'string');
					tiapp.write();

					return callback(null, json);
				} catch (e) {
					return callback(e);
				}
			}
		},
		callback
	);
}
