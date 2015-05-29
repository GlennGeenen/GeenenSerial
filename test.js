var serial = require('./serial');

serial.openPort('/dev/ttyAMA0');

var a = 0;
var b = 0;

console.log('listPorts');
serial.listPorts(function() {
	console.log('list done');
});
clock();

function clock() {
	++a;
	++b;

	if(a > 33) {
		a = 0;
	}

	serial.sendLines(a, b);
	setTimeout(clock, 1000);
}


