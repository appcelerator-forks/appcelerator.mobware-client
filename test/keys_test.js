var fs = require('fs'),
	keys = require('..').keys,
	path = require('path'),
	should = require('should'),
	tiappXml = require('tiapp.xml');

var FIXTURES = path.join('test', 'fixtures');

describe('keys.js', function() {

	describe('#keys', function() {

		beforeEach(function() {
			if (fs.existsSync('tiapp.xml')) {
				fs.unlinkSync('tiapp.xml');
			}
		});

		it('is a function', function() {
			should.exist(keys);
			keys.should.be.a.Function;
		});

		it('should return error if bad key type', function(done) {
			keys({ keys: 'badkey' }, function(err) {
				should.exist(err);
				err.toString().should.match(/invalid key/);
				done();
			});
		});

		it('should return error if bad key types', function(done) {
			keys({ keys: 'development,badkey' }, function(err) {
				should.exist(err);
				err.toString().should.match(/invalid key/);
				done();
			});
		});

		it('should return error if no tiapp.xml', function(done) {
			keys(function(err) {
				should.exist(err);
				err.toString().should.match(/not found/);
				done();
			});
		});

		it('should return error if no tiapp.xml as option', function(done) {
			keys({ tiapp: '/i/so/do/not/exist/tiapp.xml' }, function(err) {
				should.exist(err);
				err.toString().should.match(/not found/);
				done();
			});
		});

		it('should return an empty object if no MW keys are present', function(done) {
			var before = fs.readFileSync(path.join(FIXTURES, 'tiapp.nokeys.xml'), 'utf8');
			fs.writeFileSync('tiapp.xml', before);

			keys(function(err, results) {
				should.not.exist(err);
				should.exist(results);
				results.should.be.an.Object;
				Object.keys(results).length.should.equal(2);
				should.equal(results['mw-key-dev'], null);
				should.equal(results['mw-key-prod'], null);

				done();
			});
		});

		it('should return object of keys', function(done) {
			var before = fs.readFileSync(path.join(FIXTURES, 'tiapp.withkeys.xml'), 'utf8');
			fs.writeFileSync('tiapp.xml', before);

			keys(function(err, results) {
				should.not.exist(err);
				should.exist(results);
				results.should.be.an.Object;
				Object.keys(results).length.should.equal(2);
				results['mw-key-dev'].should.equal('dummy');
				results['mw-key-prod'].should.equal('dummy');

				done();
			});
		});

		it('should return object of keys with options', function(done) {
			var before = fs.readFileSync(path.join(FIXTURES, 'tiapp.withkeys.xml'), 'utf8');
			fs.writeFileSync('tiapp.xml', before);

			keys({ keys: 'production,dev' }, function(err, results) {
				should.not.exist(err);
				should.exist(results);
				results.should.be.an.Object;
				Object.keys(results).length.should.equal(2);
				results['mw-key-dev'].should.equal('dummy');
				results['mw-key-prod'].should.equal('dummy');

				done();
			});
		});

		it('should return key subset', function(done) {
			var before = fs.readFileSync(path.join(FIXTURES, 'tiapp.withkeys.xml'), 'utf8');
			fs.writeFileSync('tiapp.xml', before);

			keys({ keys: 'development' }, function(err, results) {
				should.not.exist(err);
				should.exist(results);
				results.should.be.an.Object;
				Object.keys(results).length.should.equal(1);
				results['mw-key-dev'].should.equal('dummy');

				done();
			});
		});

		it('should return key subset with string as opts', function(done) {
			var before = fs.readFileSync(path.join(FIXTURES, 'tiapp.withkeys.xml'), 'utf8');
			fs.writeFileSync('tiapp.xml', before);

			keys('development', function(err, results) {
				should.not.exist(err);
				should.exist(results);
				results.should.be.an.Object;
				Object.keys(results).length.should.equal(1);
				results['mw-key-dev'].should.equal('dummy');

				done();
			});
		});

	});

});