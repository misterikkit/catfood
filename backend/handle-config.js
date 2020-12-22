const config = require('./config');

function asTime(h, m) {
    return { H: parseInt(h), M: parseInt(m) };
}

function validTime(t) {
    return (
        t.H >= 0 && t.H < 24
        && t.M >= 0 && t.M < 60
    );
}

function validProgram(p) {
    return true; // TODO
}

function handleErr(err, req, res) {
    console.error(`${req.path}: ${err}`)
    res.status(500).send(err);
}

// Used for successful mutations.
function sendOK(broker, req, res) {
    console.log(`${req.path}: ok`);
    res.send('ok');
    broker.emit('configUpdate');
}


function SetUp(app, broker) {
    app.get('/config', (req, res) => {
        // This URI allows unauthenticated access.
        config.Get()
            .catch((err) => {
                res.status(500).send(err);
            })
            .then((config) => {
                res.setHeader('content-type', 'application/json');
                res.send(config);
            });
    });

    app.post('/config/schedule/add', (req, res) => {
        const time = asTime(req.body.newHour, req.body.newMinute);
        if (!validTime(time)) {
            handleErr(`invalid time: ${JSON.stringify(time)}`, req, res);
            return;
        }
        config.AddSchedule(time)
            .then(() => sendOK(broker, req, res))
            .catch((err) => handleErr(err, req, res));
    });

    app.post('/config/schedule/edit', (req, res) => {
        const oldTime = asTime(req.body.oldHour, req.body.oldMinute);
        const newTime = asTime(req.body.newHour, req.body.newMinute);
        if (!validTime(oldTime)) {
            handleErr(`invalid time: ${JSON.stringify(oldTime)}`, req, res);
            return;
        }
        if (!validTime(newTime)) {
            handleErr(`invalid time: ${JSON.stringify(newTime)}`, req, res);
            return;
        }
        config.EditSchedule(oldTime, newTime)
            .then(() => sendOK(broker, req, res))
            .catch((err) => handleErr(err, req, res));
    });

    app.post('/config/schedule/delete', (req, res) => {
        const oldTime = asTime(req.body.oldHour, req.body.oldMinute);
        if (!validTime(oldTime)) {
            handleErr(`invalid time: ${JSON.stringify(oldTime)}`, req, res);
            return;
        }
        config.DeleteSchedule(oldTime)
            .then(() => sendOK(broker, req, res))
            .catch((err) => handleErr(err, req, res));
    });

    app.post('/config/program', (req, res) => {
        console.log(req.body);
        program = req.body.amount.map((amount, i) => { return { amount: amount, direction: req.body.direction[i] }; });
        console.log(program);
        config.OverwriteProgram(program)
            .then(() => sendOK(broker, req, res))
            .catch((err) => handleErr(err, req, res));
    });
}

exports.SetUp = SetUp;