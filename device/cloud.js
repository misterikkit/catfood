const WebSocket = require('ws');
// add timestamp to logs.
require('log-timestamp')(() => new Date().toLocaleString() + ' %s');


function Connect(emitter) {
    console.log('Cloud connecting');
    const ws = new WebSocket('ws://10.0.0.13:3000/device');

    ws.on('open', function open() {
        console.log('Cloud connected');
    });

    ws.on('error', (err) => {
        console.log('Cloud socket error', err);
        ws.close();
    });

    ws.on('close', () => {
        console.log('Cloud disconnected');
        setTimeout(() => { Connect(emitter); }, 500);
    });

    ws.on('message', (data) => {
        console.log('Cloud data received')
        const msg = JSON.parse(data)
        emitter.emit(data.type, data.config);
    });
}

exports.Connect = Connect;