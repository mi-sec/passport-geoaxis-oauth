'use strict';

const express                       = require( 'express' );
const cors                          = require( 'cors' );
const bodyParser                    = require( 'body-parser' );
const session                       = require( 'express-session' );
const passport                      = require( 'passport' );
const logger                        = require( 'pino' )();
const expressPino                   = require( 'express-pino-logger' );
const { Strategy: GEOAxISStrategy } = require( '@mi-sec/passport-geoaxis-oauth' );

const serverlessExpress = require( '@vendia/serverless-express' );

const app = express();

app.use( expressPino( { logger } ) );
app.use( cors() );
app.use( bodyParser.urlencoded( { extended: false } ) );
app.use( bodyParser.json() );

app.use( session( {
    name: 'session',
    secret: 'secret-session',
    proxy: true,
    resave: false,
    saveUninitialized: false
} ) );

passport.use( new GEOAxISStrategy(
    {
        clientID: process.env.GEOAXIS_CLIENT_ID,
        clientSecret: process.env.GEOAXIS_SECRET_ID,
        authorizationURL: process.env.GEOAXIS_AUTHORIZATION_URL,
        tokenURL: process.env.GEOAXIS_TOKEN_URL,
        userProfileURL: process.env.GEOAXIS_USER_PROFILE_URL,
        scope: process.env.GEOAXIS_SCOPE ? process.env.GEOAXIS_SCOPE.split( ',' ) : [ 'UserProfile.me' ],
        callbackURL: process.env.GEOAXIS_CALLBACK_URL
    },
    function( token, refresh, profile, done ) {
        return done( null, { token, refresh, profile } );
    }
) );

passport.serializeUser( ( user, done ) => done( null, user ) );
passport.deserializeUser( ( obj, done ) => done( null, obj ) );

app.use( passport.initialize() );
app.use( passport.session() );

app.get( '/', ( req, res ) => {
    res.setHeader( 'Content-Type', 'text/html' );
    res.write( `<a href="${ process.env.AUTH_ROUTE }"><button>CAC Access</button></a>` );
    res.write( `<a href="${ process.env.LOGOUT_ROUTE }"><button>Logout</button></a>` );
    res.write( '<br/>' );
    res.end();
} );

app.get( '/ping', ( req, res ) => {
    res.status( 200 ).json( { message: 'pong' } );
} );

app.get( '/logout', ( req, res ) => {
    const redirectOrigin = req.session.origin || '/';
    const url            = new URL( redirectOrigin );
    url.searchParams.set( 'logout', '' );

    try {
        req.session.destroy();
    }
    catch {
        console.error( 'no session found' );
    }

    return res
        .set( { 'Clear-Site-Data': '"cache", "cookies", "storage", "executionContexts"' } )
        .redirect( url );
} );

app.get( '/profile', [
    ( req, res, next ) => {
        req.session.origin = req.query.redirect_uri || req.headers.referer;

        if ( !req.user ) {
            return passport.authenticate( 'geoaxis', {
                failureRedirect: '/403-Forbidden'
            } )( req, res, next );
        }

        return next();
    },
    ( req, res ) => {
        try {
            const profile = req.user.profile._json;

            if ( profile.message ) {
                if ( /failed/i.test( profile.message ) ) {
                    return res.status( 403 ).send( profile.message );
                }
                else {
                    return res.status( 400 ).send( profile );
                }
            }

            const url = new URL( req.session.origin );
            url.searchParams.set( 'uid', profile.uid );
            url.searchParams.set( 'email', profile.email );
            url.searchParams.set( 'PersonaDisplayName', profile.PersonaDisplayName );

            // generate JWT access token

            if ( url.searchParams.get( 'show-profile' ) ) {
                return res.status( 200 ).json( profile );
            }
            else {
                return res.redirect( url );
            }
        }
        catch ( e ) {
            return res
                .status( 500 )
                .send( JSON.stringify( e, Object.getOwnPropertyNames( e ) ) )
                .end();
        }
    }
] );

exports.handler = serverlessExpress( { app } );
