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

async function Set(cfg) {

}

// Add a time to the schedule (and sort it)
// newTime is {H, M}
async function AddSchedule(newTime) {
    // TODO: use a transaction
    let cfg = await Get();
    if (!"schedule" in cfg) {
        cfg.schedule = [];
    }
    if (!Array.isArray(cfg.schedule)) {
        cfg.schedule = [];
    }
    cfg.schedule.push({ H: newTime.H, M: newTime.M });
    // TODO: sort schedule
    datastore.update({ key: configKey, data: cfg }).catch(console.error);
}

exports.GetConfig = GetConfig;
exports.AddSchedule = AddSchedule;