const fs = require('fs');
const { OAuth2Client } = require('google-auth-library');

const config = require('./config');

/**
 * How does auth work here?
 *
 * 1. index.html includes a google one-tap snippet that prompts the user to sign in.
 * 2. The user is redirected through consent/oauth screens
 * 3. The user is redirected to /login with credential in POST body
 * 4. The /login handler saves user email into the session, and sets a
 *    'logged_in=yes' cookie, then redirects to /
 * 5. The 'logged_in' cookie prevents the google one-tap sign in from popping
 *    up again (https://developers.google.com/identity/one-tap/web/guides/toggle-display-with-cookies)
 * 6. The /config/* handlers return 401 if the session doesn't contain user email
 * 7. The /config/* handlers return 403 if the user is not on the allow list
 */

// Verify process the result of OAuth login to verify the results. The returned
// object contains the user's email.
async function Verify(token) {
    const cfg = await config.GetBackend();
    const client = new OAuth2Client(cfg.OAuthClientID);
    console.log(`Using OAuth client id ${cfg.OAuthClientID}`);
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: cfg.OAuthClientID,
    });
    const payload = ticket.getPayload();

    if (!payload['email_verified']) { throw 'email not verified'; }
    if (payload['aud'] !== cfg.OAuthClientID) { throw 'invalid audience'; }
    return { email: payload['email'] }
}

_userList = null;
function getUserList() {
    if (_userList) { return Promise.resolve(_userList); }
    return new Promise((resolve, reject) => {
        config.GetBackend()
            .then((cfg) => {
                _userList = cfg.UserAllowList;
                resolve(_userList);
            })
            .catch(reject);
    });
}

// CheckSession is express middleware that inspects the current session to see
// if the user has authenticated, and sets the 'logged_in' cookie appropriately
// (to prevent google one-tap popup).
function CheckSession(req, res, next) {
    // Special case for login and logout pages
    if (req.path === "/login") { return next(); }
    if (req.path === "/logout") { return next(); }

    // Make sure to populate 'logged_in'
    if (req.session.email) {
        res.cookie('logged_in', 'yes');
    } else {
        res.cookie('logged_in', '', { expires: new Date(Date.now() - 1) });
    }

    // Allow GET unauthenticated
    if (req.method === "GET") { return next(); }

    // If logged in, check the allow list
    if (req.session.email) {
        getUserList()
            .then((list) => {
                if (list.includes(req.session.email)) {
                    console.log('user is allowed')
                    return next();
                }
                console.log('user is not allowed')
                res.status(403).send(`${req.session.email} is not on the list`);
                // TODO: clear logged_in cookie here to enable a different login?
            })
            .catch((err) => { res.status(403).send(err); });
        return;
    }

    res.sendStatus(401);
}

exports.Verify = Verify;
exports.CheckSession = CheckSession;