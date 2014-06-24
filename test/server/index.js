var bodyParser = require('body-parser'),
	constants = require('../../lib/constants'),
	cookieParser = require('cookie-parser'),
	express = require('express'),
	fs = require('fs'),
	https = require('https'),
	path = require('path');

var certDir = path.join(__dirname,'..','fixtures'),
	key = fs.readFileSync(path.join(certDir, 'mw-test-server-key.pem')),
	cert = fs.readFileSync(path.join(certDir, 'mw-test-server-cert.pem'));

// prep express
var app = express();
app.listen = function() {
	var server = https.createServer({
		key: key,
		cert: cert
	}, this);
	return server.listen.apply(server, arguments);
};
app.use(bodyParser());
app.use(cookieParser());

// auth route
app.post('/api/v1/auth/login', function(req, res) {
	var user = req.param('username'),
		pass = req.param('password');

	// auth
	if ((user !== 'test' && user !== 'nocookie') || pass !== 'test') {
		return res.status(400).type('text/plain').send('invalid username/password combo');
	}

	// add cookie and send
	if (user !== 'nocookie') {
		res.cookie('connect.sid', 'sessioncookie');
	}
	return res.status(200).type('text/plain').send('logged in');
});

// enable route
app.post('/api/v1/mmp/enable', function(req, res) {
	var appId = req.param('appId');

	// sent a cookie, right?
	if (!req.cookies['connect.sid']) {
		return res.status(400).type('text/plain').send('no cookie');
	}

	// make sure we have an appId
	if (!appId) {
		return res.status(400).type('text/plain').send('appId is a required parameter');
	}

	// make sure appId exists
	if (appId === 'bad.api') {
		return res.status(500).type('text/plain').send('failed to load MW keys');
	} else if (appId !== 'ti.mw.todo') {
		return res.status(400).type('text/plain').send('appId does not exist');
	}

	// send keys via fixture data
	try {
		return res.status(200).type('application/json').send({
			success: true,
			result: {
				keys: {
					development: 'developmentkey',
					production: 'productionkey'
				}
			}
		});
	} catch (e) {
		return res.status(500).type('text/plain').send('failed to load MW keys');
	}
});

app.on('error', function(err) {
	console.error('error listen: ' + err);
});

module.exports = app;