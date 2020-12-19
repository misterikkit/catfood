const hardware = require('./hardware.js');
const schedule = require('node-schedule');
// add timestamp to logs.
require('log-timestamp')(() => new Date().toLocaleString() + ' %s');

hardware.setup();

//////////////////////
// FEEDING SCHEDULE //
//////////////////////

// Every 30 seconds.
schedule.scheduleJob({second : 0}, hardware.dispense);
schedule.scheduleJob({second : 30}, hardware.dispense);

console.log('catfood load test begins');
