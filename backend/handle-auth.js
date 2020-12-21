const auth = require('./auth');

function SetUp(app) {
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
}

exports.SetUp = SetUp;