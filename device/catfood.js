const hardware = (() => {
    if (process.env.FAKE) {
        return require('./fake-hardware');
    }
    return require('./hardware');
})();

const cloud = require('./cloud');
const config = require('./config');
const scheduler = require('./scheduler');

const events = require('events');
// add timestamp to logs.
require('log-timestamp')(() => new Date().toLocaleString() + ' %s');

hardware.setup();

// Set up scheduler with last known config.
const sched = new scheduler.Scheduler(hardware.dispense);
config.Load()
    .then((cfg) => { sched.UpdateSchedule(cfg.schedule); })
    .catch((err) => { console.error('Config load error:', err); });

// Connect to cloud for config updates and ad-hoc feedings.
const emitter = new events.EventEmitter();
emitter.on('config', (cfg) => {
    sched.UpdateSchedule(cfg.schedule);
    config.Save(cfg)
        .catch((err) => { console.error('Config save error:', err); });
});
emitter.on('feedNow', hardware.dispense);
cloud.Connect(emitter);

console.log('catfood startup complete');
