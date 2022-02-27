# Passport Strategy for "Google Sign-In for Websites"

This is a very simple implementation of the backend portion of the ["Google Sign-In for Websites"][google-signin]
authentication flow. It's very easy to set up and the code is very simple. It also has no dependencies, other than
passport itself.

[google-signin]: "https://developers.google.com/identity/sign-in/web/"

## Usage

### Create a Google API Console project

Before using `passport-google-web`, you will need to create a [Google API Console][create-project] project. In the
project, you create a client ID, which you will need to call the sign-in API.

[create-project]: https://developers.google.com/identity/sign-in/web/devconsole-project

### Configure the client side

#### Load the Google Platform Library

You must include the Google Platform Library on your web pages that integrate Google Sign-In.

```javascript
<script src="https://apis.google.com/js/platform.js" async defer></script>
```

#### Specify your app's client ID

Specify the client ID you created for your app in the Google Developers Console with the `google-signin-client_id` meta
element.

```html
<meta name="google-signin-client_id" content="YOUR_CLIENT_ID.apps.googleusercontent.com">
```

#### Add a Google Sign-In button

The easiest way to add a Google Sign-In button to your site is to use an automatically rendered sign-in button. With
only a few lines of code, you can add a button that automatically configures itself to have the appropriate text, logo,
and colors for the sign-in state of the user and the scopes you request.

```html
<div class="g-signin2" data-onsuccess="onSignIn"></div>
```

#### Send the ID token to your server

After a user successfully signs in, get the user's ID token:

```javascript
function onSignIn(googleUser) {
  var id_token = googleUser.getAuthResponse().id_token;
  ...
}
```

Then, send the ID token to your server with an HTTPS POST request:

```javascript
var xhr = new XMLHttpRequest();
xhr.open('POST', 'https://yourbackend.example.com/tokensignin');
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
xhr.onload = function() {
  console.log('Signed in as: ' + xhr.responseText);
};
xhr.send('idToken=' + idToken);
```

#### Example

Here is an example of the client setup:

```html

<html lang="en">
	<head>
		<meta name="google-signin-scope" content="profile email">
		<meta name="google-signin-client_id" content="YOUR_CLIENT_ID.apps.googleusercontent.com">
		<script src="https://apis.google.com/js/platform.js" async defer></script>
	</head>
	<body>
		<!-- The sign-in button -->
		<div class="g-signin2" data-onsuccess="onSignIn" data-theme="dark"></div>
		<!-- Sign-in script -->
		<script>
			function onSignIn(googleUser)
			{
				// Retrieve the id_token
				const idToken = googleUser.getAuthResponse().id_token;

				// Send it as a post to the backend server
				const xhr = new XMLHttpRequest();
				xhr.open('POST', 'https://yourbackend.example.com/tokensignin');
				xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
				xhr.onload = function ()
				{
					console.log('Signed in as: ' + xhr.responseText);
				};
				xhr.send('idToken=' + idToken);
			}
		</script>
	</body>
</html>
```

### Configure Strategy

The `passport-google-web` strategy uses a simplified OAuth 2.0 flow, designed to be very easy to implement. Once the
client side callback sends the `idToken` to the backend, the authentication is already complete. All that is required is
for the backend to validate the token, to ensure it's not being forged. As such, there's every little required of the
strategy, and no configuration options required.

```javascript
var GoogleStrategy = require('passport-google-web');

passport.use(new GoogleStrategy(function(token, profile, done) {
    User.findOrCreate({ googleId: profile.id }, function(err, user) {
      return cb(err, user);
    });
  }
));
```

### Authenticate Requests

Use `passport.authenticate()`, specifying the `google-signin` strategy, to authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com) application:

```javascript
app.post('/auth/google', passport.authenticate('google-signin'), function(req, resp)
{
	resp.json(req.user);
});
```

## License

[The MIT License](http://opensource.org/licenses/MIT)
