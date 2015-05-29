var http = require('http');
var serial = require('./serial');

serial.openPort('/dev/ttyAMA0');

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
                } else {
                    console.log('lineA or lineB not provided');
                }
            } catch (err) {
                console.error(err.message);
                res.statusCode = 500;
            }
            res.end();

        });
    } else {
        res.statusCode = 500;
        res.end();
    }

}).listen(1337);

console.log('Server running at port 1337');
