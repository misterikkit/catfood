const WebSocket = require('ws');
// add timestamp to logs.
require('log-timestamp')(() => new Date().toLocaleString() + ' %s');


function Connect() {
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
        setTimeout(Connect, 500);
    });

    ws.on('message', function incoming(data) {
        console.log('Message from cloud', data);
    });
}

exports.Connect = Connect;