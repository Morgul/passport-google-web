//----------------------------------------------------------------------------------------------------------------------
// Google Web Strategy
//----------------------------------------------------------------------------------------------------------------------

const util = require('util');
const https = require('https');
const Strategy = require('passport-strategy');

//----------------------------------------------------------------------------------------------------------------------

function param(req, name)
{
    const params = req.params || {};
    const body = req.body || {};
    const query = req.query || {};

    if(params[ name ] && params.hasOwnProperty(name))
    {
        return params[ name ];
    }
    else if(body[ name ])
    {
        return body[ name ];
    }
    else if(query[ name ])
    {
        return query[ name ];
    }
}

//----------------------------------------------------------------------------------------------------------------------

function GoogleSignInStrategy(options, verify)
{
    if(arguments.length === 1)
    {
        verify = options;
        options = {};
    }

    if(!verify)
    {
        throw new Error('Google SignIn authentication strategy requires a verify callback.');
    }

    Strategy.call(this);

    this._verify = verify;
    this.name = 'google-signin';
}

util.inherits(GoogleSignInStrategy, Strategy);

GoogleSignInStrategy.prototype.authenticate = function (request, options)
{
    const self = this;

    // Support either `idToken` or `id_token`
    const idToken = param(request, 'idToken') || param(request, 'id_token');

    // Validate the token against Google's api.
    https.get('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + idToken, (response) =>
    {
        let rawData = '';
        response.on('data', (chunk) => rawData += chunk);
        response.on('end', () => {
            try
            {
                const tokenData = JSON.parse(rawData);

                const token = {
                    iss: tokenData.iss,
                    sub: tokenData.sub,
                    azp: tokenData.azp,
                    aud: tokenData.aud,
                    iat: tokenData.iat,
                    exp: tokenData.exp
                };

                const profile = {
                    id: tokenData.sub,
                    email: tokenData.email,
                    name: tokenData.name,
                    picture: tokenData.picture,
                    givenName: tokenData.given_name,
                    familyName: tokenData.family_name,
                    locale: tokenData.locale
                };

                // Call the verification callback
                self._verify(token, profile, self._done.bind(self));
            } catch (e) {
                console.error(e.message);
            }
        });
    }).on('error', (error) => {
        self.error(error);
    });
};

GoogleSignInStrategy.prototype._done = function (err, user, info)
{
    if(err)
    { return this.error(err); }
    if(!user)
    { return this.fail(info); }
    this.success(user, info);
};

//----------------------------------------------------------------------------------------------------------------------

module.exports = GoogleSignInStrategy;

//----------------------------------------------------------------------------------------------------------------------
