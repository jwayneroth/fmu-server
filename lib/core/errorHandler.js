const config = require('./config');
const loggers = require('./loggers');

const logger = loggers.get('core/errorHandler');
const isPgError = (err) => ('code' in err) && ('schema' in err) && ('table' in err);
const isPgDataExceptionRe = /^(22|23)/;

module.exports = function errorHandler(err, req, res, next) {
	console.log('errorHandler', err);
	
	if (isPgError(err) && isPgDataExceptionRe.test(err.code)) {
		console.log('PgError');
		res.status(400).json(err.message);
	}
	else if (err.status) {
		console.log('has status', err.message);
		res.status(err.status).json(err.message);
	}
	/* istanbul ignore next */
	else if (/^(test|development)$/.test(config.get('NODE_ENV'))) {
		logger.error(err.stack);
		res.status(500).end(err.stack);
	}
	/* istanbul ignore next */
	else {
		next(err);
	}
};
