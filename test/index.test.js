'use strict';

const
    chai                          = require( 'chai' ),
    expect                        = chai.expect,
    { Strategy: GEOAxISStrategy } = require( '../index' );

describe( 'GEOAxISStrategy', () => {
    it( 'GEOAxISStrategy typeof Function',
        () => expect( GEOAxISStrategy ).to.be.a( 'function' )
    );

    it( 'GEOAxISStrategy.constructor should throw error if missing authorizationURL',
        () => expect( () => new GEOAxISStrategy( {} ) )
            .to.throw( 'GEOAxIS authorizationURL is required' )
    );

    it( 'GEOAxISStrategy.constructor should throw error if missing tokenURL',
        () => expect( () => new GEOAxISStrategy( {
            authorizationURL: 'abc'
        } ) )
            .to.throw( 'GEOAxIS tokenURL is required' )
    );

    it( 'GEOAxISStrategy.constructor should throw error if missing userProfileURL',
        () => expect( () => new GEOAxISStrategy( {
            authorizationURL: 'abc',
            tokenURL: 'abc'
        } ) )
            .to.throw( 'GEOAxIS userProfileURL is required' )
    );

    it( 'GEOAxISStrategy.constructor should throw error if missing scope',
        () => expect( () => new GEOAxISStrategy( {
            authorizationURL: 'abc',
            tokenURL: 'abc',
            userProfileURL: 'abc'
        } ) )
            .to.throw( 'GEOAxIS scope is required' )
    );

    it( 'GEOAxISStrategy.constructor should throw error if scope is not an array',
        () => expect( () => new GEOAxISStrategy( {
            authorizationURL: 'abc',
            tokenURL: 'abc',
            userProfileURL: 'abc',
            scope: 'abc'
        } ) )
            .to.throw( 'GEOAxIS scope must be an array' )
    );

    it( 'GEOAxISStrategy.constructor should throw error if missing clientID',
        () => expect( () => new GEOAxISStrategy( {
            authorizationURL: 'abc',
            tokenURL: 'abc',
            userProfileURL: 'abc',
            scope: [ 'abc' ]
        } ) )
            .to.throw( 'GEOAxIS clientID is required' )
    );

    it( 'GEOAxISStrategy.constructor should throw error if missing clientSecret',
        () => expect( () => new GEOAxISStrategy( {
            authorizationURL: 'abc',
            tokenURL: 'abc',
            userProfileURL: 'abc',
            scope: [ 'abc' ],
            clientID: 'abc'
        } ) )
            .to.throw( 'GEOAxIS clientSecret is required' )
    );

    it( 'GEOAxISStrategy.super OAuth2Strategy requires a verify callback',
        () => expect( () => new GEOAxISStrategy( {
            authorizationURL: 'abc',
            tokenURL: 'abc',
            userProfileURL: 'abc',
            scope: [ 'abc' ],
            clientID: 'abc',
            clientSecret: 'abc'
        } ) )
            .to.throw( 'OAuth2Strategy requires a verify callback' )
    );

    it( 'GEOAxISStrategy.constructor should throw error if missing clientSecret',
        () => {
            const obj = new GEOAxISStrategy( {
                authorizationURL: 'abc',
                tokenURL: 'abc',
                userProfileURL: 'abc',
                scope: [ 'abc' ],
                clientID: 'abc',
                clientSecret: 'abc'
            }, () => {} );

            expect( obj ).to.have.property( 'name' ).and.eq( 'geoaxis' );
        }
    );

    it( 'GEOAxISStrategy.setAuthorizationHeader',
        () => {
            expect( GEOAxISStrategy.setAuthorizationHeader ).to.be.a( 'function' );

            expect(
                GEOAxISStrategy.setAuthorizationHeader( 'abc', '123', {} )
            ).to.deep.eq( { Authorization: 'Basic YWJjOjEyMw==' } );

            const obj = {};
            GEOAxISStrategy.setAuthorizationHeader( 'abc', '123', obj );
            expect( obj ).to.deep.eq( { Authorization: 'Basic YWJjOjEyMw==' } );
        }
    );
} );
