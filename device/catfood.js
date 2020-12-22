const hardware = require('./hardware');
const cloud = require('./cloud');
const schedule = require('node-schedule');
// add timestamp to logs.
require('log-timestamp')(() => new Date().toLocaleString() + ' %s');

hardware.setup();
cloud.Connect();

//////////////////////
// FEEDING SCHEDULE //
//////////////////////

// Recurrence rule for feedings at 6AM, NOON, and 11PM.
const feedings = new schedule.RecurrenceRule();
feedings.hour = [6, 12, 23];
feedings.minute = 0;
schedule.scheduleJob(feedings, hardware.dispense);

console.log('catfood startup complete');
