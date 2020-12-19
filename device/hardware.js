const events = require('events');
const rpio = require('rpio');
const spawn = require('child_process').spawn;
const timers = require('timers');
// add timestamp to logs.
require('log-timestamp')(() => new Date().toLocaleString() + ' %s');

const config = {
  // divide 19.2Mhz by 128 (150kHz)
  clockDivider : 128,
  // Set 3000 clock ticks per pwm cycle (20ms)
  range : 3000,
  pin : 12,
  // Tests with this program yielded an average of 11.29 grams kibble per run.
  program : [
    // Forward 1 seconds
    {speed : 1, duration : 1.0},
    // Reverse 0.25 seconds
    {speed : -1, duration : 0.25},
    // Forward 1 seconds
    {speed : 1, duration : 1.0},
    // Reverse 0.25 seconds
    {speed : -1, duration : 0.25}
  ]
};
const eventEmitter = new events.EventEmitter();

function setup() {
  // Subprocess to set PWM mark:space mode because it isn't in the API.
  const setms = spawn('gpio', [ 'pwm-ms' ]);
  rpio.open(config.pin, rpio.PWM);
  rpio.pwmSetClockDivider(config.clockDivider);
  rpio.pwmSetRange(config.pin, config.range);
  stop();
}

function forward() {
  // 1.3ms == 195 ticks (/3000)
  rpio.pwmSetData(config.pin, 195);
  // TODO: Setting the PWM range to config.range + 195 here is slightly more
  // accurate according to the servo spec.
}
function reverse() {
  // 1.7ms == 255 ticks (/3000)
  rpio.pwmSetData(config.pin, 255);
}
function stop() {
  // In theory, setting the PWM to 225 ticks (1.5ms) should stop the motor.
  // In practice, a 0% duty cycle is more effective.
  rpio.pwmSetData(config.pin, 0);
}

function run(sequence) {
  if (sequence.length === 0) {
    stop();
  } else {
    switch (sequence[0].speed) {
    case 1:
      forward();
      break;
    case -1:
      reverse();
      break;
    }
    timers.setTimeout(() => { run(sequence.slice(1)); },
                      1000 * sequence[0].duration);
  }
}

eventEmitter.on('dispense', () => {
  console.log('dispensing product');
  run(config.program);
});

module.exports.setup = setup;
module.exports.dispense = () => { eventEmitter.emit('dispense'); };