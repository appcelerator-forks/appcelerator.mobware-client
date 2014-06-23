var async = require('async'),
	constants = require('./constants'),
	https = require('https'),
	querystring = require('querystring'),
	tiappXml = require('tiapp.xml'),
	U = require('./utils');

module.exports = function enable(username, password, opts, callback) {

	// validate input
	callback = U.maybeCallback(arguments[arguments.length-1]);
	if (!username || !U.isString(username)) {
		return callback('username required and must be a string');
	} else if (!password || !U.isString(password)) {
		return callback('password required and must be a string');
	} else if (!opts || U.isFunction(opts)) {
		opts = {};
	}

	// closures to pass in args for use with async
	var authenticateClosure = function(cb) {
		return authenticateRequest(username, password, opts, cb);
	},
	enableClosure = function(cookie, cb) {
		return enableRequest(cookie, opts, cb);
	};

	// auth then enable app
	async.waterfall([ authenticateClosure, enableClosure ], callback);
};

function doRequest(api, opts, callback) {
	var postData = querystring.stringify(opts.postObject || {}),
		httpsOpts = {
			host: opts.host || constants.MW_HOST,
			port: opts.port || constants.MW_PORT,
			method: 'POST',
			path: api,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': postData.length
			}
		};

	// add cookie, if present
	if (opts.cookie) {
		httpsOpts.headers.Cookie = opts.cookie;
	}

	// make https auth call
	var req = https.request(httpsOpts, function(res) {

		// compose date from request
		var data = '';
		res.on('data', function(chunk) {
			data += chunk;
		});

		// handle request
		res.on('end', function() {

			// handle error codes
			if (res.statusCode !== 200) {
				res.data = data;
				return callback(res);
			}

			// process data in success handler
			return opts.success(res, data);
		});

	});

	// error with request
	req.on('error', function(e) {
		return callback(e);
	});

	req.write(postData);
	req.end();
}

function authenticateRequest(username, password, opts, callback) {
	return doRequest(
		constants.AUTH_API,
		{
			host: opts.host,
			port: opts.port,
			postObject: {
				username: username,
				password: password
			},
			success: function(res) {
				try {
					return callback(null, res.headers['set-cookie'][0]);
				} catch (e) {
					e.message = 'failed to parse auth headers: ' + (e.message || '');
					return callback(e);
				}
			}
		},
		callback
	);
}

function enableRequest(cookie, opts, callback) {
	return doRequest(
		constants.ENABLE_API,
		{
			cookie: cookie,
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
