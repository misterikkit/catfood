const io = require('socket.io-client');
const rpio = require('rpio');
const spawn = require('child_process').spawn;


function setup() {
  // Subprocess to set PWM mark:space mode because it isn't in the API.
  const setms = spawn('gpio', ['pwm-ms']);
  rpio.open(12, rpio.PWM);
  // divide 19.2Mhz by 128 (150kHz)
  rpio.pwmSetClockDivider(128);
  // Set 3000 clock ticks per pwm cycle (20ms)
  rpio.pwmSetRange(12, 3000);
}

function forward() {
  // 1.3ms == 195
  rpio.pwmSetData(12, 195);
}
function reverse() {
  // 1.7ms == 255
  rpio.pwmSetData(12, 255);
}
function stop() {
  // 1.5ms == 225
  rpio.pwmSetData(12, 225);
}

// cb called on disconnect.
function listen(cb) {
  var socket = io.connect('https://tired-crab.gomix.me/');
  socket.on('connect', function() {
    console.log('connected');
    socket.emit('client', 'device');
  });
  socket.on('disconnect', function() {
    console.log('disconnected');
    cb();
  });

  socket.on('control', function(msg) {
    console.log('control: ' + msg);
    rpio.pwmSetRange(12, msg.clock);
    rpio.pwmSetData(12, msg.data);
  });
  console.log('end of listen');
}

setup();
listen(listen);
console.log('eof');

/*
var app = require('express')();
app.listen(3000, function() { console.log('http request'); });
*/
