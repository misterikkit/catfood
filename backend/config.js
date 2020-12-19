// config accessors

const { Datastore } = require('@google-cloud/datastore');

const datastore = new Datastore();
const configKey = datastore.key(['CatFeederConfig', 'config']);


// HTTP handler for fetching entire config object
function GetConfig(req, res) {
    datastore.get(configKey, (err, value) => {
        if (err) {
            res.statusCode = 500;
            res.send(err);
            return;
        }
        res.setHeader("content-type", "application/json");
        res.send(value);
    })
}

// Return the entire config object
async function Get() {
    const result = await datastore.get(configKey)
    // TODO: consider writing an explicit promise instead of assuming array index 0
    return result[0]
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
            entity.schedule.push({ H: newTime.H, M: newTime.M });
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

exports.GetConfig = GetConfig;
exports.AddSchedule = AddSchedule;