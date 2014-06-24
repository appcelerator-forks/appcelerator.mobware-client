var constants = require('../lib/constants'),
	enable = require('..').enable,
	fs = require('fs'),
	https = require('https'),
	path = require('path'),
	should = require('should'),
	tiappXml = require('tiapp.xml'),
	util = require('util');

var DEFAULT_HOST = constants.MW_HOST,
	FIXTURES = path.join('test', 'fixtures'),
	APPID = 'ti.mw.todo',
	COOKIE = 'sessioncookie';

// custom assertions
should.Assertion.add('HttpCode', function(code) {
	this.params = {
		operator: 'to be HTTP code',
		expected: code,
		showDiff: true
	};

	should.exist(this.obj);
	should.exist(this.obj.statusCode);
	this.obj.statusCode.should.equal(code);
}, false);

// test suite
describe('enable.js', function() {

	describe('#enable', function() {

		beforeEach(function() {
			constants.MW_HOST = DEFAULT_HOST;
			if (fs.existsSync('tiapp.xml')) {
				fs.unlinkSync('tiapp.xml');
			}
		});

		it('is a function', function() {
			should.exist(enable);
			enable.should.be.a.Function;
		});

		it('should return error if no username', function(done) {
			enable(null, 'password', {prompt:false}, function(err) {
				should.exist(err);
				err.should.match(/username required/);
				done();
			});
		});

		it('should return error if no password', function(done) {
			enable('username', null, {prompt:false}, function(err) {
				should.exist(err);
				err.should.match(/password required/);
				done();
			});
		});

		it('should return error if password not a string', function(done) {
			enable('username', 123, {prompt:false}, function(err) {
				should.exist(err);
				err.should.match(/password required/);
				done();
			});
		});

		it('should return error when no server is present', function(done) {
			constants.MW_HOST = 'somebadhost';
			enable('test', 'test', {prompt:false}, function(err) {
				should.exist(err);
				should.exist(err.code);
				err.code.should.match(/(?:ECONNREFUSED|ENOTFOUND)/);
				done();
			});
		});

		it('should return 400 if user/pass are bad', function(done) {
			enable('test', 'bad', function(err) {
				should.exist(err);
				err.should.have.HttpCode(400);
				done();
			});
		});

		it('should return 400 if no appId is given', function(done) {
			enable('test', 'test', function(err) {
				should.exist(err);
				err.should.have.HttpCode(400);
				done();
			});
		});

		it('should return 400 if appId does not exist in MW', function(done) {
			enable('test', 'test', { appId: 'i.do.not.exist' }, function(err) {
				should.exist(err);
				err.should.have.HttpCode(400);
				done();
			});
		});

		it('should return 500 on MW error', function(done) {
			enable('test', 'test', { appId: 'bad.api' }, function(err) {
				should.exist(err);
				err.should.have.HttpCode(500);
				done();
			});
		});

		it('should return error when there\'s a cookie error', function(done) {
			enable('nocookie', 'test', { appId: APPID }, function(err) {
				should.exist(err);
				err.toString().should.match(/retrieve cookie/);
				done();
			});
		});

		it('should return callback with error if no tiapp.xml', function(done) {
			enable('test', 'test', { appId: APPID }, function(err) {
				should.exist(err);
				err.toString().should.match(/not found/);
				done();
			});
		});

		it('should return callback with error if no tiapp.xml as option', function(done) {
			enable('test', 'test', { appId: APPID, tiapp: '/i/am/a/fake/path/tiapp.xml' }, function(err) {
				should.exist(err);
				err.toString().should.match(/not found/);
				done();
			});
		});

		it('should write MobileWare keys to tiapp.xml', function(done) {
			fs.writeFileSync('tiapp.xml',
				fs.readFileSync(path.join(FIXTURES, 'tiapp.nokeys.xml'), 'utf8'));
			enable('test', 'test', { appId: APPID }, function(err, results) {
				should.not.exist(err);
				should.exist(results);
				results.result.keys.should.be.an.Object;
				results.result.keys.development.should.equal('developmentkey');
				results.result.keys.production.should.equal('productionkey');

				// quick and dirty check
				var data = fs.readFileSync('tiapp.xml', 'utf8');
				data.should.containEql('developmentkey');
				data.should.containEql('productionkey');
				done();
			});
		});

		it('should write MobileWare keys to tiapp.xml with explicit host & port', function(done) {
			fs.writeFileSync('tiapp.xml',
				fs.readFileSync(path.join(FIXTURES, 'tiapp.nokeys.xml'), 'utf8'));
			enable('test', 'test', {
				appId: APPID,
				host: 'localhost',
				port: 15678
			}, function(err, results) {
				should.not.exist(err);
				should.exist(results);
				results.result.keys.should.be.an.Object;
				results.result.keys.development.should.equal('developmentkey');
				results.result.keys.production.should.equal('productionkey');

				// quick and dirty check
				var data = fs.readFileSync('tiapp.xml', 'utf8');
				data.should.containEql('developmentkey');
				data.should.containEql('productionkey');
				done();
			});
		});

		it('should write MobileWare keys to tiapp.xml as option', function(done) {
			fs.writeFileSync('tiapp.xml',
				fs.readFileSync(path.join(FIXTURES, 'tiapp.nokeys.xml'), 'utf8'));
			enable('test', 'test', { appId: APPID, tiapp: 'tiapp.xml' }, function(err, results) {
				should.not.exist(err);
				should.exist(results);
				results.result.keys.should.be.an.Object;
				results.result.keys.development.should.equal('developmentkey');
				results.result.keys.production.should.equal('productionkey');

				// quick and dirty check
				var data = fs.readFileSync('tiapp.xml', 'utf8');
				data.should.containEql('developmentkey');
				data.should.containEql('productionkey');
				done();
			});
		});

		it('should prompt for username and password', function(done) {
			fs.writeFileSync('tiapp.xml',
				fs.readFileSync(path.join(FIXTURES, 'tiapp.nokeys.xml'), 'utf8'));
			enable(null, null, { appId: APPID, tiapp: 'tiapp.xml' }, function(err, results) {
				should.not.exist(err);
				should.exist(results);
				results.result.keys.should.be.an.Object;
				results.result.keys.development.should.equal('developmentkey');
				results.result.keys.production.should.equal('productionkey');

				// quick and dirty check
				var data = fs.readFileSync('tiapp.xml', 'utf8');
				data.should.containEql('developmentkey');
				data.should.containEql('productionkey');
				done();
			});

			// fake prompt input
			setTimeout(function() {
				process.stdin.emit('data', 'test');
				process.stdin.emit('data', '\n');
			}, 100);
			setTimeout(function() {
				process.stdin.emit('data', 'test');
				process.stdin.emit('data', '\n');
			}, 200);
		});

		it('should overwrite MobileWare keys in tiapp.xml', function(done) {
			fs.writeFileSync('tiapp.xml', fs.readFileSync(path.join(FIXTURES, 'tiapp.withkeys.xml'), 'utf8'));
			enable('test', 'test', { appId: APPID }, function(err, results) {
				should.not.exist(err);
				should.exist(results);
				results.result.keys.should.be.an.Object;
				results.result.keys.development.should.equal('developmentkey');
				results.result.keys.production.should.equal('productionkey');

				// quick and dirty check
				var data = fs.readFileSync('tiapp.xml', 'utf8');
				data.should.containEql('developmentkey');
				data.should.containEql('productionkey');
				data.should.not.containEql('dummy');
				done();
			});
		});

	});

});