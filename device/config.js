const fs = require('fs');
const path = require('path');


const configPath = path.join(process.env.HOME, 'catfood_config.json');

function Save(cfg) {
    return new Promise((resolve, reject) => {
        fs.writeFile(configPath, JSON.stringify(cfg), (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(err);
        });
    });
}

function Load() {
    return new Promise((resolve, reject) => {
        fs.readFile(configPath, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(JSON.parse(data));
        });
    });
}

exports.Save = Save;
exports.Load = Load;