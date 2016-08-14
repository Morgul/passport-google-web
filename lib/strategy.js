//----------------------------------------------------------------------------------------------------------------------
/// Brief description for strategy.js module.
///
/// @module
//----------------------------------------------------------------------------------------------------------------------

var util = require('util');
var $http = require('axios');
var Strategy = require('passport-strategy');

//----------------------------------------------------------------------------------------------------------------------

function param(req, name)
{
    var params = req.params || {};
    var body = req.body || {};
    var query = req.query || {};

    if(params[name] && params.hasOwnProperty(name))
    {
        return params[name];
    }
    else if(body[name])
    {
        return body[name];
    }
    else if(query[name])
    {
        return query[name];
    } // end if
} // end param

//----------------------------------------------------------------------------------------------------------------------

function GoogleSignInStrategy(options, verify)
{
    if(arguments.length == 1)
    {
        verify = options;
        options = {};
    } // end if

    if (!verify) throw new Error('Google SignIn authentication strategy requires a verify callback.');

    Strategy.call(this);

    this._verify = verify;
    this.name = 'google-signin';
} // end GoogleSignInStrategy

util.inherits(GoogleSignInStrategy, Strategy);

GoogleSignInStrategy.prototype.authenticate = function(request, options)
{
    var self = this;

    // Support either `idToken` or `id_token`
    var idToken = param(request, 'idToken') || param(request, 'id_token');

    // Validate the token against google's api.
    $http.get('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + idToken)
        .then(function(response)
        {
            var tokenData = response.data;

            var token = {
                iss: tokenData.iss,
                sub: tokenData.sub,
                azp: tokenData.azp,
                aud: tokenData.aud,
                iat: tokenData.iat,
                exp: tokenData.exp
            };

            var profile = {
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
        })
        .catch(function(error)
        {
            this.error(error);
        });
}; // end authenticate

GoogleSignInStrategy.prototype._done = function(err, user, info)
{
    if (err) { return this.error(err); }
    if (!user) { return this.fail(info); }
    this.success(user, info);
}; // end _done

//----------------------------------------------------------------------------------------------------------------------

module.exports = GoogleSignInStrategy;

//----------------------------------------------------------------------------------------------------------------------
