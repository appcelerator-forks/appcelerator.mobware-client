exports.COMMANDS = ['enable','disable','help','keys','sdk'];
exports.AUTH_API = '/api/v1/auth/login';
exports.ENABLE_API = '/api/v1/apibuilder/enable';
exports.UPDATE_API = '/api/v1/apibuilder/sdk/updates';

if (process.env.MW_CLIENT_TEST) {
	exports.MW_HOST = 'localhost';
	exports.MW_PORT = 15678;
} else {
	exports.MW_HOST = 'dashboard.appcelerator.com';
	exports.MW_PORT = 443;
}
