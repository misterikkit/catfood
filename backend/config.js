const { Datastore } = require('@google-cloud/datastore');

const datastore = new Datastore();
const configKey = datastore.key(['CatFeederConfig', 'config']);

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

// Add a time to the schedule (and sort it)
// newTime is {H, M}
function AddSchedule(newTime) {
    return new Promise((resolve, reject) => {
        // TODO: use a transaction
        datastore.get(configKey, (err, entity) => {
            if (err) {
                reject(err);
                return;
            }
            if (!'schedule' in entity) {
                entity.schedule = [];
            }
            if (!Array.isArray(entity.schedule)) {
                entity.schedule = [];
            }
            // TODO: Check for duplicates
            entity.schedule.push({ H: newTime.H, M: newTime.M });
            // Sort schedule by hour then minute
            entity.schedule.sort((a, b) => {
                if (a.H < b.H) { return -1; }
                if (a.H > b.H) { return 1; }
                // H is equal
                if (a.M < b.M) { return -1; }
                if (a.M > b.M) { return 1; }
                return 0;
            })
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

function DeleteSchedule(time) {
    return new Promise((resolve, reject) => {
        datastore.get(configKey, (err, entity) => {
            if (err) {
                reject(err);
                return;
            }
            if (!'schedule' in entity) {
                entity.schedule = [];
            }
            if (!Array.isArray(entity.schedule)) {
                entity.schedule = [];
            }
            const idx = entity.schedule.findIndex((t) => timeEq(t, time));
            if (idx == -1) {
                resolve();
                return;
            }
            entity.schedule.splice(idx, 1);
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

function timeEq(a, b) {
    return a.H === b.H && a.M === b.M;
}

exports.Get = Get;
exports.AddSchedule = AddSchedule;
exports.DeleteSchedule = DeleteSchedule;