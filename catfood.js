const hardware = require('./hardware.js');
const schedule = require('node-schedule');
// add timestamp to logs.
require('log-timestamp')(() => new Date().toLocaleString() + ' %s');

hardware.setup();

//////////////////////
// FEEDING SCHEDULE //
//////////////////////

// 6AM
schedule.scheduleJob({hour : 6, minute : 0}, hardware.dispense);
// NOON
schedule.scheduleJob({hour : 12, minute : 0}, hardware.dispense);
// 11PM
schedule.scheduleJob({hour : 23, minute : 0}, hardware.dispense);

console.log('catfood startup complete');
