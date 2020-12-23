const WebSocket = require('ws');
// add timestamp to logs.
require('log-timestamp')(() => new Date().toLocaleString() + ' %s');

const target = process.env.CLOUD_TARGET || 'ws://10.0.0.13:3000/device';
function Connect(emitter) {
    console.log('Cloud connecting to', target);
    const ws = new WebSocket(target);

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
        emitter.emit(msg.type, msg.config);
    });
}

exports.Connect = Connect;