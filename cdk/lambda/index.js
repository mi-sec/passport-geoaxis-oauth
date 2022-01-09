'use strict';

const express       = require( 'express' );
const cors          = require( 'cors' );
const bodyParser    = require( 'body-parser' );
const session       = require( 'express-session' );
const DynamoDBStore = require( 'connect-dynamodb' )( session );

const logger                        = require( 'pino' )();
const expressPino                   = require( 'express-pino-logger' );
const passport                      = require( 'passport' );
const { Strategy: GEOAxISStrategy } = require( '@mi-sec/passport-geoaxis-oauth' );

const serverlessExpress = require( '@vendia/serverless-express' );

const AWS = require( 'aws-sdk' );
const DDB = new AWS.DynamoDB();

const generatePolicy = require( './generatePolicy' );

const app = express();

app.use( cors() );
app.use( bodyParser.urlencoded( { extended: false } ) );
app.use( bodyParser.json() );
app.use( expressPino( { logger } ) );

app.use( session( {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new DynamoDBStore( {
        client: DDB,
        table: process.env.DYNAMO_DB_SESSION_STORAGE_TABLE
    } )
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
    const { event }        = serverlessExpress.getCurrentInvoke();
    const authRoute        = new URL( '/profile', `https://${ event.headers.host }` );
    const logoutRoute      = new URL( '/logout', `https://${ event.headers.host }` );
    const customAuthorizer = new URL( '/custom-authorizer', `https://${ event.headers.host }` );

    res.setHeader( 'Content-Type', 'text/html' );
    res.write( `<a href="${ authRoute }"><button>CAC Access</button></a>` );
    res.write( `<a href="${ logoutRoute }"><button>Logout</button></a>` );
    res.write( `<a href="${ customAuthorizer }"><button>custom authorizer</button></a>` );
    res.write( '<br/>' );
    res.write( `<p id="queryparams"></p>` );
    res.write( `<script>document.getElementById('queryparams').innerText=window.location.search;</script>` );
    res.end();
} );

app.get( '/failure', ( req, res ) => {
    res.status( 403 ).json( { message: 'geoaxis signin failed' } );
} );

app.get( '/version', ( req, res ) => {
    res.status( 200 ).json( {
        env: app.get( 'env' ),
        version: process.env.VERSION,
        deployedTime: process.env.DEPLOY_TIME
    } );
} );

app.get( '/test', ( req, res ) => {
    res.status( 200 ).json( serverlessExpress.getCurrentInvoke() );
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

app.get( '/custom-authorizer', [
    ( req, res, next ) => {
        if ( !req.user ) {
            const { event }   = serverlessExpress.getCurrentInvoke();
            const redirectUrl = new URL( '/custom-authorizer', `https://${ event.headers.host }` );
            const url         = new URL( '/profile', `https://${ event.headers.host }` );
            url.searchParams.set( 'redirect_uri', redirectUrl.href );

            req.session.origin = redirectUrl.href;
            req.session.save();
            return res.redirect( url.href );
        }
        else {
            return next();
        }
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

            const { context } = serverlessExpress.getCurrentInvoke();

            return res.status( 200 ).json(
                generatePolicy( '*', 'Allow', context.invokedFunctionArn, {
                    uid: profile.uid,
                    email: profile.email,
                    name: profile.PersonaDisplayName
                } )
            );
        }
        catch ( e ) {
            return res
                .status( 500 )
                .send( JSON.stringify( e, Object.getOwnPropertyNames( e ) ) )
                .end();
        }
    }
] );

app.get( '/profile', [
    ( req, res, next ) => {
        req.session.origin = req.query.redirect_uri || req.headers.referer;

        if ( !req.user ) {
            return passport.authenticate( 'geoaxis', {
                failureRedirect: '/failure'
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
