require('log-timestamp')(() => new Date().toLocaleString() + ' %s');

module.exports.setup = () => { console.log('Fake hardware is set up'); return Promise.resolve(); };
module.exports.dispense = () => { console.log('Fake hardware is dispensing product'); };
module.exports.updateProgram = (p) => { console.log('Fake hardware new program', p); };
