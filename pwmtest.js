var rpio = require('rpio');
var timers = require('timers');

rpio.open(12, rpio.PWM);

rpio.pwmSetClockDivider(128);
rpio.pwmSetRange(12, 3000);

function go() {
	// 1.3ms == 195
	rpio.pwmSetData(12,   195);
	timers.setTimeout(()=>{
			// 1.7ms == 255
			rpio.pwmSetData(12,   255);
			timers.setTimeout(()=>{
					// 1.5ms == 225
					rpio.pwmSetData(12,   225);
					}, 500);
			}, 5000);
}

timers.setInterval(go, 10000);
