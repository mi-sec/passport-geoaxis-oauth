'use strict';

const
    OAuth2Strategy         = require( 'passport-oauth2' ),
    { InternalOAuthError } = OAuth2Strategy;

class GEOAxISStrategy extends OAuth2Strategy
{
    constructor( opts = {}, verify )
    {
        if ( !opts.authorizationURL ) {
            throw new Error( 'GEOAxIS authorizationURL is required' );
        }
        else if ( !opts.tokenURL ) {
            throw new Error( 'GEOAxIS tokenURL is required' );
        }
        else if ( !opts.userProfileURL ) {
            throw new Error( 'GEOAxIS userProfileURL is required' );
        }
        else if ( !opts.scope ) {
            throw new Error( 'GEOAxIS scope is required' );
        }
        else if ( !Array.isArray( opts.scope ) ) {
            throw new Error( 'GEOAxIS scope must be an array' );
        }
        else if ( !opts.clientID ) {
            throw new Error( 'GEOAxIS clientID is required' );
        }
        else if ( !opts.clientSecret ) {
            throw new Error( 'GEOAxIS clientSecret is required' );
        }

        opts.customHeaders = {};
        GEOAxISStrategy.setAuthorizationHeader( opts.clientID, opts.clientSecret, opts.customHeaders );

        super( opts, verify );

        this.opts            = opts;
        this.name            = 'geoaxis';
        this._userProfileURL = this.opts.userProfileURL;

        this._oauth2.setAccessTokenName( 'code' );
        this._oauth2.useAuthorizationHeaderforGET( true );
        this._oauth2.setAuthMethod( '' );
    }

    static setAuthorizationHeader( clientId, clientSecret, headerObj = {} )
    {
        const combinedOauthKeys = Buffer.from( `${ clientId }:${ clientSecret }` ).toString( 'base64' );
        headerObj.Authorization = `Basic ${ combinedOauthKeys }`;
        return headerObj;
    }

    userProfile( accessToken, done )
    {
        this._oauth2.get(
            this._userProfileURL,
            accessToken,
            ( err, data ) => {
                let json;

                if ( err ) {
                    return done( new InternalOAuthError( 'Failed to fetch user profile', err ) );
                }

                try {
                    json = JSON.parse( data );
                }
                catch ( e ) {
                    return done( new Error( 'Failed to parse user profile' ) );
                }

                done( null, {
                    provider: this.name,
                    token: accessToken,
                    _raw: data,
                    _json: json
                } );
            }
        );
    }
}

exports          = module.exports = GEOAxISStrategy;
exports.Strategy = GEOAxISStrategy;
