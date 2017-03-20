const hardware = require('./hardware.js');
const request = require('request');
const schedule = require('node-schedule');
// add timestamp to logs.
require('log-timestamp')(() => new Date().toLocaleString() + ' %s');

hardware.setup();

/////////////////////
// WATCHDOG ALERTS //
/////////////////////

function stillAlive() {
  request.post(
    'https://tired-crab.glitch.me/keepalive',
    {form: {secret: process.env.SECRET}}
  );
}

// Recurrence rule for watchdog keepalives.
const watchdog = new schedule.RecurrenceRule();
watchdog.minute = [0, 15, 30, 45];
schedule.scheduleJob(watchdog, stillAlive);
stillAlive();  // One keepalive to signal job start.

//////////////////////
// FEEDING SCHEDULE //
//////////////////////

// Recurrence rule for feedings at 6AM, NOON, and 11PM.
const feedings = new schedule.RecurrenceRule();
feedings.hour = [6, 12, 23];
feedings.minute = 0;
schedule.scheduleJob(feedings, hardware.dispense);

console.log('catfood startup complete');
