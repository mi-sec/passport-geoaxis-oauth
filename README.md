# passport-geoaxis-oauth

GEOAxIS (OAuth 2.0) authentication strategy for Passport.

[![NPM](https://nodei.co/npm/@mi-sec/passport-geoaxis-oauth.png?downloads=true&stars=true&downloadRank=true)](https://www.npmjs.com/package/@mi-sec/passport-geoaxis-oauth)

![GEOAxISStrategy tests](https://github.com/mi-sec/passport-geoaxis-oauth/workflows/GEOAxISStrategy%20tests/badge.svg)
![GEOAxISStrategy lint](https://github.com/mi-sec/passport-geoaxis-oauth/workflows/GEOAxISStrategy%20lint/badge.svg)

### Installation

`npm i @mi-sec/passport-geoaxis-oauth`

### Usage

**Basic usage:**

```
const
	config   = require( 'config' ),
	passport = require( 'passport' ),
	{
		Strategy: GEOAxISStrategy
	}        = require( 'passport-geoaxis-oauth' );

const app = express();

passport.use( new GEOAxISStrategy(
    {
        clientID: '',
        clientSecret: '',
        authorizationURL: '',
        tokenURL: '',
        userProfileURL: '',
        scope: '',
        callbackURL: ''
    },
    function( token, refresh, profile, done ) {
        return done( null, { token, refresh, profile } );
    }
) );

passport.serializeUser( ( user, done ) => done( null, user ) );
passport.deserializeUser( ( obj, done ) => done( null, obj ) );

app.use( passport.initialize() );
app.use( passport.session() );
```
