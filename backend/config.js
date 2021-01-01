const { Datastore } = require('@google-cloud/datastore');

const datastore = new Datastore();
const configKey = datastore.key(['CatFeederConfig', 'config']);
const backendConfigKey = datastore.key(['BackendConfig', 'config']);

// Return the entire config object
function Get() {
    return new Promise((resolve, reject) => {
        datastore.get(configKey, (err, entity) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(entity);
        });
    });
}

// Return the entire backend config object
function GetBackend() {
    return new Promise((resolve, reject) => {
        datastore.get(backendConfigKey, (err, entity) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(entity);
        });
    });
}

// MutateConfig fetches the current config, passes it to the worker function,
// and writes the mutated result back to the datastore.
function MutateConfig(fn) {
    return new Promise((resolve, reject) => {
        // TODO: use a transaction
        datastore.get(configKey, (err, entity) => {
            if (err) {
                reject(err);
                return;
            }
            if (!('schedule' in entity)) {
                entity.schedule = [];
            }
            if (!Array.isArray(entity.schedule)) {
                entity.schedule = [];
            }

            if (!('program' in entity)) {
                entity.program = [];
            }
            if (!Array.isArray(entity.program)) {
                entity.program = [];
            }

            // Do the actual work
            try { fn(entity); }
            catch (e) {
                reject(e);
                return;
            }

            // Write change to datastore
            datastore.update({ key: configKey, data: entity }, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    });
}

// Adds a time to the schedule, keeping items unique and sorted.
function AddSchedule(newTime) {
    return MutateConfig((config) => {
        const idx = config.schedule.findIndex((t => timeEq(t, newTime)));
        if (idx !== -1) {
            // time already exists
            return;
        }
        config.schedule.push({ H: newTime.H, M: newTime.M });
        config.schedule.sort(timeCmp);
    });
}

// Replaces an existing time with a new value, keeping items unique and sorted.
// Updating an existing time to match a different existing time is effectively a
// delete.
function EditSchedule(oldTime, newTime) {
    return MutateConfig((config) => {
        const oldIdx = config.schedule.findIndex((t) => timeEq(t, oldTime));
        if (oldIdx === -1) {
            throw `time not found: ${JSON.stringify(oldTime)}`;
        }
        const newIdx = config.schedule.findIndex((t) => timeEq(t, newTime));
        if (newIdx !== -1) {
            // collision with existing time. This is effectively a delete.
            config.schedule.splice(oldIdx, 1);
            return;
        }
        config.schedule.splice(oldIdx, 1, newTime);
        config.schedule.sort(timeCmp);
    });
}

// Removes an existing time from the schedule.
function DeleteSchedule(time) {
    return MutateConfig((config) => {
        const idx = config.schedule.findIndex((t) => timeEq(t, time));
        if (idx === -1) {
            throw `time not found: ${JSON.stringify(time)}`;
        }
        config.schedule.splice(idx, 1);
    });
}

// Replaces the program with a new one.
function OverwriteProgram(program) {
    return MutateConfig((config) => {
        config.program = program;
    });
}

// Because object equality needs a helper function
function timeEq(a, b) {
    return a.H === b.H && a.M === b.M;
}

// For sorting. Assumes both times are on same day
function timeCmp(a, b) {
    if (a.H < b.H) { return -1; }
    if (a.H > b.H) { return 1; }
    // H is equal
    if (a.M < b.M) { return -1; }
    if (a.M > b.M) { return 1; }
    return 0;
}

exports.Get = Get;
exports.GetBackend = GetBackend;
exports.AddSchedule = AddSchedule;
exports.EditSchedule = EditSchedule;
exports.DeleteSchedule = DeleteSchedule;
exports.OverwriteProgram = OverwriteProgram;