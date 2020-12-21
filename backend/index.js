const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const config = require('./config');
const auth = require('./auth');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('client')); // Client content is statically served
// I'm rather surprised that bodyParser and cookieParser are sold separately.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: new Date().toString() })); // todo: secure static secret. Stable secret doesn't matter until we persist sessions, anyhow

// Special case for static client index
app.get('/', (req, res) => {
    res.sendFile('client/html/index.html', { root: '.' });
})

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
    if (!auth.CheckSession(req, res)) {
        res.sendStatus(401);
        return;
    }
    const time = asTime(req.body.newHour, req.body.newMinute);
    if (!validTime(time)) {
        handleErr(`invalid time: ${JSON.stringify(time)}`, req, res);
        return;
    }
    config.AddSchedule(time)
        .then(() => sendOK(req, res))
        .catch((err) => handleErr(err, req, res));
});

app.post('/config/schedule/edit', (req, res) => {
    if (!auth.CheckSession(req, res)) {
        res.sendStatus(401);
        return;
    }
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
        .then(() => sendOK(req, res))
        .catch((err) => handleErr(err, req, res));
});

app.post('/config/schedule/delete', (req, res) => {
    if (!auth.CheckSession(req, res)) {
        res.sendStatus(401);
        return;
    }
    const oldTime = asTime(req.body.oldHour, req.body.oldMinute);
    if (!validTime(oldTime)) {
        handleErr(`invalid time: ${JSON.stringify(oldTime)}`, req, res);
        return;
    }
    config.DeleteSchedule(oldTime)
        .then(() => sendOK(req, res))
        .catch((err) => handleErr(err, req, res));
});

function asTime(h, m) {
    return { H: parseInt(h), M: parseInt(m) };
}

function validTime(t) {
    return (
        t.H >= 0 && t.H < 24
        && t.M >= 0 && t.M < 60
    );
}

function handleErr(err, req, res) {
    console.error(`${req.path}: ${err}`)
    res.status(500).send(err);
}

function sendOK(req, res) {
    console.log(`${req.path}: ok`);
    res.send('ok');
}



app.post('/login', (req, res) => {
    const csrf_token_cookie = req.cookies.g_csrf_token;
    if (!csrf_token_cookie) {
        res.status(400).send('No CSRF token in Cookie.');
    }
    const csrf_token_body = req.body.g_csrf_token;
    if (!csrf_token_body) {
        res.status(400).send('No CSRF token in post body.');
    }
    if (csrf_token_cookie != csrf_token_body) {
        res.status(400).send('Failed to verify double submit cookie.')
    }

    auth.Verify(req.body.credential)
        .then((user) => {
            req.session.email = user.email;
            res.cookie('logged_in', 'yes');
            res.redirect('/');
        })
        .catch((err) => {
            res.status(401).send(err);
        });
});

app.listen(port, () => {
    console.log(`Catfood backend listening at http://localhost:${port}`)
});