var exec = require('child_process').exec;

var BIN = './node_modules/.bin/';

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		env: {
			dev: {
				NODE_DEV: 'development',
				MW_CLIENT_TEST: true,
				NODE_TLS_REJECT_UNAUTHORIZED: '0'
			}
		},
		mochaTest: {
			options: {
				timeout: 3000,
				ignoreLeaks: false,
				reporter: 'spec'
			},
			src: ['test/*_test.js']
		},
		jshint: {
			options: {
				camelcase: true,
				curly: true,
				eqeqeq: true,
				immed: true,
				indent: 4,
				latedef: 'nofunc',
				newcap: true,
				noarg: false,
				nonew: true,
				undef: true,
				unused: true,
				trailing: true,
				loopfunc: true,
				proto: true,
				node: true,
				'-W068': true  // Wrapping non-IIFE function literals in parens is unnecessary
			},
			tests: {
				options: {
					expr: true,
					unused: false,
					globals: {
						describe: false,
						it: false,
						before: false,
						beforeEach: false,
						after: false,
						afterEach: false
					}
				},
				src: ['test/*_test.js']
			},
			src: ['lib/*.js']
		},
		clean: {
			src: ['tmp', 'tiapp.xml']
		},
		istanbul: {
			src: ['test/**/*_test.js']
		}
	});

	// Load grunt plugins for modules
	grunt.loadNpmTasks('grunt-env');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');

	// Register tasks
	grunt.registerMultiTask('istanbul', 'generate test coverage report', function() {
		var done = this.async(),
			cmd = BIN + 'istanbul cover --report html ' + BIN + '_mocha -- -R min ' +
				this.filesSrc.reduce(function(p,c) { return (p || '') + ' "' + c + '" '; });

		grunt.log.debug(cmd);
		exec(cmd, function(err, stdout, stderr) {
			if (err) { grunt.fail.fatal(err); }
			if (/No coverage information was collected/.test(stderr)) {
				grunt.fail.warn('No coverage information was collected. Report not generated.');
			} else {
				grunt.log.ok('test coverage report generated to "./coverage/index.html"');
			}
			done();
		});
	});

	grunt.registerTask('server', 'start local https server', function() {
		// require() constants here, since we need to wait for the "env" task
		console.log(process.env.MW_CLIENT_TEST);
		require('./test/server').listen(require('./lib/constants').MW_PORT);
		delete process.env.APPC_360_USERNAME;
		delete process.env.APPC_360_PASSWORD;
	});

	grunt.registerTask('coverage', ['env:dev', 'server', 'istanbul', 'clean']);
	grunt.registerTask('test', ['env:dev', 'server', 'mochaTest', 'clean']);
	grunt.registerTask('default', ['jshint', 'test']);

};