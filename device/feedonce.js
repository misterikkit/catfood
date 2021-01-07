const hardware = require('./hardware.js');
// add timestamp to logs.
require('log-timestamp')(() => new Date().toLocaleString() + ' %s');

hardware.setup()
    .then(() => {
        hardware.dispense();
    })
    .catch(console.error);
