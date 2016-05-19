'use strict';

var http = require('http');
var serial = require('./serial');

serial.openPort('/dev/ttyAMA0');

http.createServer(function (req, res) {

    // CORS
    res.writeHead(200, {
        'Access-Control-Allow-Origin': '*'
    });

    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Max-Age': 86400, // 24 hours
            'Access-Control-Allow-Headers': 'X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept'
        });
        return res.end();
    }

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
                    res.statusCode = 400;
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
