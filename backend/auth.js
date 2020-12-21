const fs = require('fs');
const { OAuth2Client } = require('google-auth-library');

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


const rawsecret = fs.readFileSync(process.env.OAUTH_SECRET);
const secret = JSON.parse(rawsecret);
console.log(`OAuth client ID is ${secret.clientID}`);

const client = new OAuth2Client(secret.clientID);

// Verify process the result of OAuth login to verify the results. The returned
// object contains the user's email.
async function Verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: secret.clientID,
    });
    const payload = ticket.getPayload();
    console.log('PAYLOAD');
    console.log(payload);
    if (!payload['email_verified']) { throw 'email not verified'; }
    if (payload['aud'] !== secret.clientID) { throw 'invalid audience'; }
    return { email: payload['email'] }
}

// CheckSession inspects the current session to see if the user has
// authenticated, and sets the 'logged_in' cookie appropriately (to prevent
// google one-tap popup). This returns true if the user is authenticated.
function CheckSession(req, res) {
    if (req.session.email) {
        res.cookie('logged_in', 'yes');
        return true;
    } else {
        res.cookie('logged_in', '', { expires: new Date(Date.now() - 1) });
        return false;
    }
}

exports.Verify = Verify;
exports.CheckSession = CheckSession;