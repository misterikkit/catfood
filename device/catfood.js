const hardware = require('./hardware');
const cloud = require('./cloud');
const config = require('./config');

const events = require('events');
const schedule = require('node-schedule');
// add timestamp to logs.
require('log-timestamp')(() => new Date().toLocaleString() + ' %s');

hardware.setup();

const emitter = new events.EventEmitter();
emitter.on('config', (cfg) => {
    console.log('got new config', cfg.schedule);
    config.Save(cfg)
        .catch(console.error);
});
emitter.on('feedNow', hardware.dispense);
cloud.Connect(emitter);

//////////////////////
// FEEDING SCHEDULE //
//////////////////////

// Recurrence rule for feedings at 6AM, NOON, and 11PM.
const feedings = new schedule.RecurrenceRule();
feedings.hour = [6, 12, 23];
feedings.minute = 0;
schedule.scheduleJob(feedings, hardware.dispense);

console.log('catfood startup complete');
