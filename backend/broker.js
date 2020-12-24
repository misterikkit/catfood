const EventEmitter = require('events');
// add timestamp to logs.
require('log-timestamp')(() => new Date().toLocaleString() + ' %s');
const config = require('./config');

class Broker extends EventEmitter {
    constructor() {
        super();
        this.deviceSocket = null;
        this.clientSockets = [];
        this.on('configUpdate', () => { this.updateDevice(); });
        this.on('feedCatNow', () => { this.feedCatNow(); });
    }

    AddClientSocket(s) {
        console.log('New client socket')
        this.clientSockets.push(s);
        s.on('close', (e) => {
            console.log('Client socket closed', e);
            // remove s from array
            const idx = this.clientSockets.indexOf(s);
            if (idx !== -1) {
                this.clientSockets.splice(idx, 1);
            }
        });
        s.on('error', (e) => {
            console.error('Socket error', e);
            s.close();
        });

        this.updateClients();
    }

    AddDeviceSocket(s) {
        console.log('New device socket')
        if (this.deviceSocket !== null) {
            console.error('Got conflicting device socket');
            this.deviceSocket.close();
        }
        s.on('close', (e) => {
            console.log('Device socket closed', e);
            this.deviceSocket = null;
            this.updateClients();
        })
        s.on('error', (e) => {
            console.error('Socket error', e);
            s.close();
        });

        this.deviceSocket = s;
        this.updateDevice();
        this.updateClients();
    }

    // Send device state to clients
    updateClients() {
        console.log(`Updating ${this.clientSockets.length} clients`);
        const msg = JSON.stringify({ DeviceState: (this.deviceSocket !== null) ? 'CONNECTED' : 'DISCONNECTED' });
        this.clientSockets.map((s) => { s.send(msg); });
    }

    updateDevice() {
        // TODO: There are some redundant config.Gets. Maybe cache in the config package?
        config.Get()
            .then((cfg) => {
                if (this.deviceSocket === null) {
                    console.error('Cannot update device: no socket');
                    return;
                }
                this.deviceSocket.send(JSON.stringify(
                    {
                        type: 'config',
                        config: cfg
                    }
                ));
            })
            .catch(console.error);
    }

    feedCatNow() {
        if (this.deviceSocket === null) {
            console.error('Cannot feed cat: no socket');
            return;
        }
        this.deviceSocket.send(JSON.stringify({ type: 'feedNow' }));
    }
}

exports.Broker = Broker;