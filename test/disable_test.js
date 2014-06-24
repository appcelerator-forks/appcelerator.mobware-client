var disable = require('..').disable,
	fs = require('fs'),
	path = require('path'),
	should = require('should'),
	tiappXml = require('tiapp.xml');

var FIXTURES = path.join('test', 'fixtures');

describe('disable.js', function() {

	describe('#disable', function() {

		beforeEach(function() {
			if (fs.existsSync('tiapp.xml')) {
				fs.unlinkSync('tiapp.xml');
			}
		});

		it('is a function', function() {
			should.exist(disable);
			disable.should.be.a.Function;
		});

		it('should return callback with error if no tiapp.xml', function(done) {
			disable(function(err) {
				should.exist(err);
				err.toString().should.match(/not found/);
				done();
			});
		});

		it('should return callback with error if no tiapp.xml as option', function(done) {
			disable({ tiapp: '/i/so/do/not/exist/tiapp.xml' }, function(err) {
				should.exist(err);
				err.toString().should.match(/not found/);
				done();
			});
		});

		it('should do nothing to tiapp.xml if no MW keys are present', function(done) {
			var before = fs.readFileSync(path.join(FIXTURES, 'tiapp.nokeys.xml'), 'utf8');
			fs.writeFileSync('tiapp.xml', before);

			before.should.not.containEql('mw-key');

			disable(function(err) {
				should.not.exist(err);

				// quick and dirty check
				var after = fs.readFileSync('tiapp.xml', 'utf8');
				should.exist(after);
				after.should.equal(before);

				done();
			});
		});

		it('should remove Mobware keys in tiapp.xml', function(done) {
			var before = fs.readFileSync(path.join(FIXTURES, 'tiapp.withkeys.xml'), 'utf8');
			fs.writeFileSync('tiapp.xml', before);

			before.should.containEql('mw-key');

			disable(function(err) {
				should.not.exist(err);

				// quick and dirty check
				var after = fs.readFileSync('tiapp.xml', 'utf8');
				after.should.not.containEql('mw-key');

				done();
			});
		});

		it('should remove Mobware keys in tiapp.xml as option', function(done) {
			var before = fs.readFileSync(path.join(FIXTURES, 'tiapp.withkeys.xml'), 'utf8');
			fs.writeFileSync('tiapp.xml', before);

			before.should.containEql('mw-key');

			disable({ tiapp: 'tiapp.xml' }, function(err) {
				should.not.exist(err);

				// quick and dirty check
				var after = fs.readFileSync('tiapp.xml', 'utf8');
				after.should.not.containEql('mw-key');

				done();
			});
		});

	});

});