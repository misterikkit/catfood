
class Broker {
    constructor() {
        this.deviceSocket = null;
        this.clientSockets = [];
    }

    AddClientSocket(s) {
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
        })

        this.updateClients();
    }

    AddDeviceSocket(s) {
        if (this.deviceSocket !== null) {
            console.error('Got conflicting device socket');
            this.deviceSocket.close();
        }
        this.deviceSocket = s;

        this.updateClients();
    }

    // Send device state to clients
    updateClients() {
        console.log(`Updating ${this.clientSockets.length} clients`);
        const msg = JSON.stringify({ DeviceState: (this.deviceSocket !== null) ? 'CONNECTED' : 'DISCONNECTED' });
        this.clientSockets.map((s) => { s.send(msg); });
        // for (s in this.clientSockets) {
        //     s.send(msg);
        // }
    }
}

exports.Broker = Broker;