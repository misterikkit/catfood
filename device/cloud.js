const WebSocket = require('ws');
// add timestamp to logs.
require('log-timestamp')(() => new Date().toLocaleString() + ' %s');


function Connect(emitter) {
    console.log('Connecting to cloud');
    const ws = new WebSocket('ws://10.0.0.13:3000/device');

    ws.on('open', function open() {
        console.log('Connected to cloud');
    });

    ws.on('error', (err) => {
        console.log('Socket error', err);
        ws.close();
    });

    ws.on('close', () => {
        console.log('Disconnected');
        setTimeout(() => { Connect(emitter); }, 500);
    });

    ws.on('message', function incoming(data) {
        emitter.send(data.type, data.config);
    });
}

exports.Connect = Connect;