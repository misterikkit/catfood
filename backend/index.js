const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const auth = require('./auth');
const configHandlers = require('./handle-config');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('client')); // Client content is statically served
// I'm rather surprised that bodyParser and cookieParser are sold separately.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    // todo: secure static secret. Stable secret doesn't matter until we persist sessions, anyhow
    secret: new Date().toString(),
    resave: false,
    saveUninitialized: false
}));
app.use(auth.CheckSession);

// Special case for static client index
app.get('/', (req, res) => {
    res.sendFile('client/html/index.html', { root: '.' });
})

configHandlers.SetUp(app);

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

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Catfood backend listening at http://localhost:${port}`)
});