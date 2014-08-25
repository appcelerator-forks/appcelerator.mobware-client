var _ = require('lodash'),
	async = require('async'),
	fs = require('fs'),
	path = require('path'),
	sdk = require('..').sdk,
	should = require('should'),
	tiappXml = require('tiapp.xml');

var FIXTURES = path.join('test', 'fixtures');

should.Assertion.add('MwSdk', function(mod) {
	this.params = { operator: 'to have MW SDK configured in tiapp.xml' };

	// make sure the sdk name property is set
	this.params.message = 'could not find mw-sdk-name property "' + mod.id + '"';
	var tiapp = this.obj;
	tiapp.getProperty('mw-sdk-name').should.equal(mod.id);

	// make sure the module is set
	this.params.message = 'could not find mw sdk module ' + JSON.stringify(mod);
	var modules = _.filter(tiapp.getModules(), function(_mod) {
		return _mod.id === mod.id;
	});
	modules.should.be.an.Array;
	modules.length.should.equal(1);

	// make sure module is the same
	this.params.message = 'expected ' + JSON.stringify(mod) + ' to equal ' + JSON.stringify(modules[0]);
	modules[0].should.eql(mod);
}, false);

describe('sdk.js', function() {

	describe('#sdk', function() {

		beforeEach(function() {
			if (fs.existsSync('tiapp.xml')) {
				fs.unlinkSync('tiapp.xml');
			}
		});

		it('is a function', function() {
			should.exist(sdk);
			sdk.should.be.a.Function;
		});

		it('should return error if bad type', function(done) {
			sdk({ type: 'badkey' }, function(err) {
				should.exist(err);
				err.toString().should.match(/Invalid type/);
				done();
			});
		});

		it('should return error if no tiapp.xml', function(done) {
			sdk(function(err) {
				should.exist(err);
				err.toString().should.match(/not found/);
				done();
			});
		});

		it('should return error if no tiapp.xml as option', function(done) {
			sdk({ tiapp: '/i/so/do/not/exist/tiapp.xml' }, function(err) {
				should.exist(err);
				err.toString().should.match(/not found/);
				done();
			});
		});

		it('should return null on get if no sdk is configured', function(done) {
			var before = fs.readFileSync(path.join(FIXTURES, 'tiapp.nokeys.xml'), 'utf8');
			fs.writeFileSync('tiapp.xml', before);

			var optsSets = [
				{type: 'get'},
				undefined
			];
			var funcs = _.map(optsSets, function(opts) {
				return function(cb) {
					sdk(opts, function(err, results) {
						should.not.exist(err);
						should.equal(results, null);
						cb();
					});
				};
			});

			async.series(funcs, function(err, result) {
				should.not.exist(err);
				done();
			});
		});

		it('should return sdk module info on get', function(done) {
			var before = fs.readFileSync(path.join(FIXTURES, 'tiapp.withkeys.xml'), 'utf8');
			fs.writeFileSync('tiapp.xml', before);

			var optsSets = [
				{type: 'get'},
				undefined
			];
			var funcs = _.map(optsSets, function(opts) {
				return function(cb) {
					sdk(opts, function(err, results) {
						should.not.exist(err);
						should.exist(results);
						results.should.be.an.Object;
						results.id.should.equal('my.sdk');
						results.version.should.equal('1.3');
						results.platform.should.equal('commonjs');
						cb();
					});
				};
			});

			async.series(funcs, function(err, result) {
				should.not.exist(err);
				done();
			});
		});

		it('should return error if no name is specified with set', function(done) {
			var before = fs.readFileSync(path.join(FIXTURES, 'tiapp.nokeys.xml'), 'utf8');
			fs.writeFileSync('tiapp.xml', before);

			sdk({ type: 'set' }, function(err, results) {
				should.exist(err);
				err.toString().should.match(/No sdk specified/);
				done();
			});
		});

		it('should set sdk module without version', function(done) {
			var before = fs.readFileSync(path.join(FIXTURES, 'tiapp.nokeys.xml'), 'utf8');
			fs.writeFileSync('tiapp.xml', before);

			sdk({ type: 'set', name: 'set.sdk' }, function(err, results) {
				should.not.exist(err);
				tiappXml.load().should.have.MwSdk({
					id: 'set.sdk',
					platform: 'commonjs'
				});

				done();
			});
		});

		it('should set sdk module with version', function(done) {
			var before = fs.readFileSync(path.join(FIXTURES, 'tiapp.nokeys.xml'), 'utf8');
			fs.writeFileSync('tiapp.xml', before);

			sdk({ type: 'set', name: 'set.sdk', version: '3.3' }, function(err, results) {
				should.not.exist(err);
				tiappXml.load().should.have.MwSdk({
					id: 'set.sdk',
					platform: 'commonjs',
					version: '3.3'
				});

				done();
			});
		});

		it('should overwrite existing property and module if sdk name is changed', function(done) {
			var before = fs.readFileSync(path.join(FIXTURES, 'tiapp.withkeys.xml'), 'utf8');
			fs.writeFileSync('tiapp.xml', before);

			var tiapp = tiappXml.load();
			tiapp.getProperty('mw-sdk-name').should.equal('my.sdk');

			sdk({ type: 'set', name: 'overwrite.sdk', version: '3.3' }, function(err, results) {
				should.not.exist(err);
				tiappXml.load().should.have.MwSdk({
					id: 'overwrite.sdk',
					platform: 'commonjs',
					version: '3.3'
				});
				tiapp.getProperty('mw-sdk-name').should.not.equal('my.sdk');

				done();
			});
		});

		it('should retrieve updates', function(done) {
			sdk({ type: 'install' }, function(err, results) {
				should.not.exist(err);
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

	});

});