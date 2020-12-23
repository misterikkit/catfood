const schedule = require('node-schedule');
require('log-timestamp')(() => new Date().toLocaleString() + ' %s');

class Scheduler {
    constructor(dispense) {
        this.dispense = dispense;
        this.jobs = [];
    }

    cancelAllJobs() {
        this.jobs.map((j) => { j.cancel(); })
        this.jobs = [];
    }

    UpdateSchedule(times) {
        this.cancelAllJobs();
        times.map((time) => {
            const j = schedule.scheduleJob({ hour: time.H, minute: time.M }, this.dispense);
            this.jobs.push(j);
            console.log('Dispense at', j.nextInvocation());
        })
        console.log('Applied schedule')
    }
}

exports.Scheduler = Scheduler;