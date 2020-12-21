
// Initialization
$(() => {
    ws = new WebSocket('ws://localhost:3000/ws/echo');
    ws.onopen = (e) => { console.log('open'); console.log(e); ws.send('hello from client'); }
    ws.onclose = (e) => { console.log('close'); console.log(e); }
    ws.onmessage = (e) => { console.log('message'); console.log(e.data); }
    ws.onerror = (e) => { console.log('error'); console.log(e); }
});