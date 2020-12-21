
function setStatusBar(state) {
    switch (state.DeviceState) {
        case 'CONNECTED':
            $('#statusIcon').text(state.DeviceState).button({ icon: 'check' });
            $('#statusText').html('Device Status: Online');
            break;
        case 'DISCONNECTED':
            $('#statusIcon').text(state.DeviceState).button({ icon: 'delete' });
            $('#statusText').html('Device Status: Offline');
            break;
        default:
            $('#statusIcon').text(state.DeviceState).button({ icon: 'alert' });
            $('#statusText').html('<i>Device Status: Unknown</i>');
    }
    $('#statusIcon').enhanceWithin();
}

function connect() {
    console.log('connecting')
    ws = new WebSocket('ws://localhost:3000/ws/echo');
    ws.onopen = () => { console.log('connected'); };
    ws.onmessage = (e) => { setStatusBar(JSON.parse(e.data)); };
    ws.onclose = (e) => {
        console.log('socket closed');
        setStatusBar({});
        setTimeout(connect, 500);
    };
    ws.onerror = (e) => {
        console.log('socket error', e);
        ws.close();
    };
}
// Initialization
$(() => {
    connect();
});