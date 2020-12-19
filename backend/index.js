const express = require('express')
const bodyParser = require('body-parser');

const config = require('./config')

const app = express();
const port = process.env.PORT || 3000;

// Client content is statically served
app.use(express.static('client'));
app.use(bodyParser.urlencoded({ extended: false }));

// Special case for static client index
app.get('/', (req, res) => {
    res.sendFile('client/html/index.html', { root: '.' });
})

app.get('/config', (req, res) => {
    config.Get()
        .catch((err) => {
            res.statusCode = 500;
            res.send(err);
        })
        .then((config) => {
            res.setHeader('content-type', 'application/json');
            res.send(config);
        });
});

app.post('/config/schedule', (req, res) => {
    const now = new Date();
    const t = { H: now.getHours(), M: now.getMinutes() };
    config.AddSchedule(t)
        .catch((err) => {
            res.statusCode = 500;
            res.send(err);
        })
        .then(() => {
            res.send('ok');
        });
});

app.post('/config/schedule/add', (req, res) => {
    // TODO: validate input
    config.AddSchedule({ H: req.body.newHour, M: req.body.newMinute })
        .catch((err) => {
            res.statusCode = 500;
            res.send(err);
        })
        .then(() => {
            res.send('ok');
        });
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})