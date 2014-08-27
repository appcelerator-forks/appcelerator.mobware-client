var async = require('async'),
	constants = require('./constants'),
	https = require('https'),
	querystring = require('querystring'),
	readline = require('readline');

exports.die = function die() {
	var args = Array.prototype.slice.call(arguments, 0);
	console.error.apply(console, args);
	process.exit(1);
};

exports.maybeCallback = function maybeCallback(cb) {
	return cb && exports.isFunction(cb) ? cb : function(err) { if (err) { throw err; } };
};

['Function','String'].forEach(function(type) {
	exports['is' + type] = function(o) {
		return Object.prototype.toString.call(o) === '[object ' + type + ']';
	};
});

exports.authenticate = function authenticate(opts, callback) {
	var funcs = [];
	callback = exports.maybeCallback(arguments[arguments.length-1]);
	if (!opts || exports.isFunction(opts)) {
		opts = {};
	}

	opts.username = opts.username || process.env.APPC_360_USERNAME;
	opts.password = opts.password || process.env.APPC_360_PASSWORD;
	if (typeof opts.prompt === 'undefined') {
		opts.prompt = true;
	}

	// validate input
	if (!opts.prompt) {
		if (!opts.username || !exports.isString(opts.username)) {
			return callback(new Error('username required and must be a string'));
		} else if (!opts.password || !exports.isString(opts.password)) {
			return callback(new Error('password required and must be a string'));
		}
	}

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

	// authenticate
	funcs.push(function(opts, callback) {
		return exports.doRequest(
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
						return callback(new Error(e));
					}
				}
			},
			callback
		);
	});

	// auth then enable app
	async.waterfall(funcs, callback);

};

exports.doRequest = function doRequest(api, opts, callback) {
	var postData = querystring.stringify(opts.postObject || {}),
		method = opts.method || 'POST',
		httpsOpts = {
			host: opts.host || constants.MW_HOST,
			port: opts.port || constants.MW_PORT,
			method: method,
			path: api,
			headers: method === 'POST' ? {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': postData.length
			} : {}
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
				var error = new Error('Bad HTTP request status code (' + res.statusCode + ')');
				res.data = data;
				error.response = res;
				return callback(error);
			}

			// process data in success handler
			return opts.success(res, data);
		});

	});

	// error with request
	req.on('error', function(e) {
		var error = new Error('HTTP request error: ' + e.message);
		error.exception = e;
		return callback(error);
	});

	req.write(postData);
	req.end();
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
