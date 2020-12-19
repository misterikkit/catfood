const express = require('express')
const config = require('./config')
const app = express()
const port = process.env.PORT || 3000

// Client content is statically served
app.use(express.static('client'))

// Special case for static client index
app.get('/', (req, res) => {
    res.sendFile('client/html/index.html', { root: '.' })
})


app.get('/config', (req, res) => config.GetConfig(req, res));

app.post('/config/schedule', (req, res) => {
    const now = new Date();
    const t = { H: now.getHours(), M: now.getMinutes() };
    config.AddSchedule(t);
    res.send('ok');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})