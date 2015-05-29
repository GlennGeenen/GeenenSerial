(function () {

	'use strict';

	var SerialPort = require('serialport');
	var sp;

	function formatNumber(n) {
		var hours = Math.floor(+n / 60 / 60);
		var minutes = Math.floor((+n - (hours * 60 * 60)) / 60);
		var seconds = Math.round(+n - (hours * 60 * 60) - (minutes * 60));
		return formatArray([hours === 0 ? '' : hours.toString(), minutes.toString(), seconds.toString()]);
	}

	function formatArray(arr) {

		if(arr.length === 3) {

			var result = '';
			var tmp = '';
			var started = false;

			for(var i = 0; i < 3; ++i) {
				tmp = formatSplit(arr[i], started, i === 2);
				if(tmp[0] !== ' ') {
					started = true;
				}
				result += tmp;
			}
			return result;

		} else {
			return '            ';
		}
	}

	function formatSplit(n, started, end) {
		if (typeof end === 'undefined') {
			end = false;
		}

		if (n && n.length === 2) {
			return n[0] + ' ' + n[1] + (end ? ' ' : '.');
		} else if (n && n.length === 1) {
			return (started ? '0 ' : '  ') + n[0] + (end ? ' ' : '.');
		} else {
			return started ? (end ? '0 0 ' : '0 0.') : '    ';
		}
	}

	function formatString(time) {
		if (time.match(/^(?:\d{1,2}:)(?:[0-5]\d:)(?:[0-5]\d)$/g) ||
			time.match(/^(?:\d{1,2}:)(?:[0-5]\d)$/g)) {
			var arr = time.split(':');
			while (arr.length < 3) {
				arr.unshift('');
			}
			return formatArray(arr);
		} else {
			return '            ';
		}
	}

	function formatDate(n) {
		var seconds = n.getHours() * 60 * 60;
		seconds += n.getMinutes() * 60;
		seconds += n.getSeconds();
		return formatNumber(seconds);
	}

	function getNumber(n) {
		var str = n.toString();
		var i;
		var result = '';

		for(i = 6; i > str.length; --i) {
			result += '  ';
		}
		for(i = 0; i < str.length && i < 6; ++i) {
			result += str[i] + ' ';
		}
		return result;
	}

	function getMoney(n) {
		var arr = n.toString().split('.');
		var i;
		var result = '';

		for(i = 4; i > arr[0].length; --i) {
			result += '  ';
		}
		for(i = 0; i < arr[0].length && i < 4; ++i) {
			result += arr[0][i] + ' ';
		}

		// Add .
		result = result.substring(0, result.length - 1) + '.';

		if(arr.length > 1) {
			if(arr[1].length > 1) {
				result += arr[1][0] + ' ' + arr[1][1] + ' ';
			} else if(arr[1].length > 0) {
				result += arr[1][0] + ' 0 ';
			} else {
				result += '0 0 ';
			}
		} else {
			result += '0 0 ';
		}
		return result;
	}

	function formatLine(n) {

		if (n && n.type && n.value) {
			if(n.type === 'number') {
				return getNumber(n.value);
			} else if(n.type === 'money') {
				return getMoney(n.value);
			} else if (typeof n.value === 'number') {
				return formatNumber(n.value);
			} else if (n.value instanceof Date) {
				return formatDate(n.value);
			} else {
				return formatString(n.value);
			}
		} else {
			console.log('fail');
			return '            ';
		}
	}

	// http://en.wikipedia.org/wiki/Seven-segment_display
	// result += 'Y.ABCDEFG.ABCDEFG.ABCDEFG.ABCDEFG.ABCDEFG.ABCDEFG\r\n';
	// result += 'Z.ABCDEFG.ABCDEFG.ABCDEFG.ABCDEFG.ABCDEFG.ABCDEFG\r\n';

	function openPort(port) {
		if (!sp) {
			sp = new SerialPort.SerialPort(port, {
				baudrate: 19200
			});
			sp.on('open', portOpen);
			sp.on('error', displayError);
		}
	}

	function sendLines(lineA, lineB) {
		if (sp && sp.isOpen()) {
			if(lineA) {
				sp.write('W' + formatLine(lineA) + '\r');
			}
			if(lineB) {
				setTimeout(function(){
					sp.write('X' + formatLine(lineB) + '\r');
				}, 100);
			}
		}
	}

	function portOpen() {
		console.log('port open');
//        sp.on('data', function (data) {
//            // TODO: concat buffer
//        });
//        sp.on('end', function() {
//            // TODO: display result
//        });
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
		openPort: openPort,
		sendLines: sendLines,
		listPorts: listPorts
	};

})();
