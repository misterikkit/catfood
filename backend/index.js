const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
// add timestamp to logs.
require('log-timestamp')(() => new Date().toLocaleString() + ' %s');

const auth = require('./auth');
const authHandlers = require('./handle-auth');
const broker = require('./broker');
const configHandlers = require('./handle-config');

const app = express();
var expressWs = require('express-ws')(app);

const port = process.env.PORT || 3000;

app.use(express.static('client')); // Client content is statically served
// I'm rather surprised that bodyParser and cookieParser are sold separately.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// Log HTTP errors
app.use(morgan('tiny', {
    skip: function (req, res) { return res.statusCode < 400 }
}));
app.use(session({
    // todo: secure static secret. Stable secret doesn't matter until we persist sessions, anyhow
    secret: new Date().toString(),
    resave: false,
    saveUninitialized: false
}));

// Enforce authz and authn on POST requests.
app.use(auth.CheckSession);

// Special case for static client index
app.get('/', (req, res) => {
    res.sendFile('client/html/index.html', { root: '.' });
})

const brk = new broker.Broker();

app.ws('/client', (ws) => { brk.AddClientSocket(ws); });
app.ws('/device', (ws) => { brk.AddDeviceSocket(ws); });

configHandlers.SetUp(app, brk);
authHandlers.SetUp(app);

// Simple rate limiter for manual feeding.
let lastManualFeed = Date.now();
const minFeedInterval = 10 * 1000; // 10 seconds
app.post('/feedcatnow', (req, res) => {
    const now = Date.now();
    if ((now - lastManualFeed) < minFeedInterval) {
        res.sendStatus(429);
        return;
    }
    lastManualFeed = now;
    brk.emit('feedCatNow'); res.send('ok')
});

app.listen(port, () => {
    console.log(`Catfood backend listening at http://localhost:${port}`)
});
