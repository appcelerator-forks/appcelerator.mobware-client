var async = require('async'),
	constants = require('./constants'),
	https = require('https'),
	querystring = require('querystring'),
	readline = require('readline'),
	tiappXml = require('tiapp.xml'),
	U = require('./utils');

module.exports = function enable(username, password, opts, callback) {
	var funcs = [];
	callback = U.maybeCallback(arguments[arguments.length-1]);
	if (!opts || U.isFunction(opts)) {
		opts = {};
	}

	if (typeof opts.prompt === 'undefined') {
		opts.prompt = true;
	}

	// validate input
	if (!opts.prompt) {
		if (!username || !U.isString(username)) {
			return callback('username required and must be a string');
		} else if (!password || !U.isString(password)) {
			return callback('password required and must be a string');
		}
	}
	opts.username = username;
	opts.password = password;

	// pass opts into async
	funcs.push(function(cb) { return cb(null, opts); });

	// prompt for username and password, if necessary
	['username','password'].forEach(function(field) {
		if (!opts[field]) {
			funcs.push(function(opts, cb) {
				promptFor(field, function(data) {
					opts[field] = data;
					return cb(null, opts);
				});
			});
		}
	});

	// authenticate & enable
	funcs.push(authenticateRequest, enableRequest);

	// auth then enable app
	async.waterfall(funcs, callback);
};

function promptFor(field, callback) {
	var stdin = process.openStdin(),
		query = field + ': ',
		rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

	process.stdin.setEncoding('utf8');
	process.stdin.on('data', function(char) {
		switch(char) {
			case '\n':
			case '\r':
			case '\u0004':
				stdin.pause();
				break;
			default:
				if (field === 'password') {
					process.stdout.write("\033[2K\033[200D" + query);
				}
				break;
		}
	});
	rl.question(query, callback);
}

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

function authenticateRequest(opts, callback) {
	return doRequest(
		constants.AUTH_API,
		{
			host: opts.host,
			port: opts.port,
			postObject: {
				username: opts.username,
				password: opts.password
			},
			success: function(res) {
				try {
					opts.cookie = res.headers['set-cookie'][0];
					return callback(null, opts);
				} catch (e) {
					e.message = 'failed to retrieve cookie from response headers.\n';
					e.headers = res.headers;
					return callback(e);
				}
			}
		},
		callback
	);
}

function enableRequest(opts, callback) {
	return doRequest(
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
