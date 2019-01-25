const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const errorHandler = require('./lib/core/errorHandler');
const config = require('./lib/core/config');
const port = config.get('PORT');
const createLoggers = require('namespaced-console-logger');
const logger = createLoggers().get('namespace');
//const apiResource = require('./lib/api/resource');

const loggers = require('./lib/core/loggers');
const app = express();

/* istanbul ignore if */
if (config.get('NODE_ENV') !== 'test') {
	app.use(morgan(':date[iso] (server) INFO: :method :url :remote-addr :response-time :status', {
		skip: (req) => /^\/favicon.ico/.test(req.originalUrl),
	}));
}

var mpd = require('mpd'),
	cmd = mpd.cmd;
	
var client = mpd.connect({
	port: 6600,
	host: 'localhost',
});

client.on('ready', function() {
	logger.info("ready");
});

client.on('system', function(name) {
	logger.info("update", name);
});

client.on('system-player', function() {
	client.sendCommand(cmd("status", []), function(err, msg) {
		if (err) throw err;
		logger.info(msg);
	});
});

app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: '10mb' }));
app.get('/_health', (req, res) => res.end('ok'));
app.get('/favicon.ico', (req, res) => res.end());
//app.use('/api', apiResource);
app.use(errorHandler);

app.listen(port, () => {
	logger.info(`listening on :${port}`);
});
