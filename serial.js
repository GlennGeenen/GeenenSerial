(function () {

	'use strict';

	var SerialPort = require('serialport');
	var sp;

	function formatNumber(n) {
		var hours = Math.floor(+n / 60 / 60);
		var minutes = Math.floor((+n - (hours * 60 * 60)) / 60);
		var seconds = Math.round(+n - (hours * 60 * 60) - (minutes * 60));

		var result = formatSplit(hours.toString());
		result += formatSplit(minutes.toString());
		result += formatSplit(seconds.toString(), true);

		return result;
	}

	function formatSplit(n, end) {
		if (typeof end === 'undefined') {
			end = false;
		}

		if (n && n.length === 2) {
			return n[0] + ' ' + n[1] + (end ? ' ' : '.');
		} else if (n && n.length === 1) {
			return '0 ' + n[0] + (end ? ' ' : '.');
		} else {
			return end ? '0 0 ' : '0 0.';
		}
	}

	function formatString(time) {
		if (time.match(/^(?:\d{1,2}:)(?:[0-5]\d:)(?:[0-5]\d)$/g) ||
			time.match(/^(?:\d{1,2}:)(?:[0-5]\d)$/g)) {
			var arr = time.split(':');

			while (arr.length < 3) {
				arr.unshift('');
			}

			var result = formatSplit(arr[0]);
			result += formatSplit(arr[1]);
			result += formatSplit(arr[2], true);

			return result;

		} else {
			return '0 0.0 0.0 0 ';
		}
	}

	function formatDate(n) {
		var seconds = n.getHours() * 60 * 60;
		seconds += n.getMinutes() * 60;
		seconds += n.getSeconds();
		return formatNumber(seconds);
	}

	function formatLine(n) {

		if (n) {
			if (typeof n === 'number') {
				return formatNumber(n);
			} else if (n instanceof Date) {
				return formatDate(n);
			} else {
				return formatString(n);
			}
		} else {
			console.log('fail');
			return '0 0.0 0.0 0 ';
		}
	}

	function formatLines(a, b) {
		var result = 'W' + formatLine(a) + '\r';
		result += 'X' + formatLine(b) + '\r';

		// http://en.wikipedia.org/wiki/Seven-segment_display
		// result += 'Y.ABCDEFG.ABCDEFG.ABCDEFG.ABCDEFG.ABCDEFG.ABCDEFG\r\n';
		// result += 'Z.ABCDEFG.ABCDEFG.ABCDEFG.ABCDEFG.ABCDEFG.ABCDEFG\r\n';
		return result;
	}

	function sendLines(lineA, lineB) {

		if (!sp) {
			sp = new SerialPort.SerialPort('/dev/ttyAMA0', {
				baudrate: 19200
			});
			sp.on('open', portOpen);
			sp.on('error', displayError);
		}

		if (sp.isOpen()) {

			if(lineA) {
				sp.write('W' + formatLine(lineA) + '\r', onWrite);		
			}
			if(lineB) {
				setTimeout(function(){
					sp.write('X' + formatLine(lineB) + '\r', onWrite);
				}, 50);	
			}
		}
	}

	function onWrite() {
		console.log('write return');
	}

	function portOpen() {
		console.log('port open');
		sp.on('data', function (data) {
			// TODO: concat buffer
		});
		sp.on('end', function() {
			// TODO: display result
		});
	}

	function displayError(err) {
		console.error(err.message);
	}

	function listPorts(next) {
		SerialPort.list(function (err, ports) {

			if(err) {
				console.log(JSON.stringify(err));			
			} else {
				console.log(JSON.stringify(ports));
				ports.forEach(function (port) {
					console.log(port.comName);
					console.log(port.pnpId);
					console.log(port.manufacturer);
				});
			}
			next(err);
		});
	}

	module.exports = {
		sendLines: sendLines,
		listPorts: listPorts
	};

})();
