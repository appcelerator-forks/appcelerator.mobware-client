var mwclient = require('..'),
	pkg = require('../package'),
	should = require('should');

describe('mwclient.js', function() {

	describe('#version', function() {

		it('is a string', function() {
			should.exist(mwclient.version);
			mwclient.version.should.be.a.String;
		});

		it('should equal the module version', function() {
			mwclient.version.should.equal(pkg.version);
		});

	});

});