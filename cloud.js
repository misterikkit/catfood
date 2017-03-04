const io = require('socket.io-client');
const rpio = require('rpio');
const spawn = require('child_process').spawn;




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
