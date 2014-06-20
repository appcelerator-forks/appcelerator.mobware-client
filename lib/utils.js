exports.die = function die() {
	var args = Array.prototype.slice.call(arguments, 0);
	if (args[0]) {
		args[0] = 'error: ' + args[0];
	}
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
