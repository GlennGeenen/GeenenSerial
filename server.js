var http = require('http');
var serial = require('./serial');

http.createServer(function (req, res) {

	'use strict';

	if (req.method === 'POST') {

		var body = '';

		req.on('data', function (chunk) {
			body += chunk.toString();
		});

		req.on('end', function () {

			try {
				body = JSON.parse(body);
				if (body.lineA && body.lineB) {
					serial.sendLines(body.lineA, body.lineB);
				}
			} catch (err) {
				console.error(err.message);
				res.statusCode = 500;
			}

		});
	} else {
		res.statusCode = 500;
	}

	res.end();

}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');
