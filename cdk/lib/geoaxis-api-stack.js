const path                     = require( 'path' );
const cdk                      = require( '@aws-cdk/core' );
const lambda                   = require( '@aws-cdk/aws-lambda' );
const apiGatewayV2             = require( '@aws-cdk/aws-apigatewayv2' );
const apiGatewayV2Integrations = require( '@aws-cdk/aws-apigatewayv2-integrations' );

console.log( apiGatewayV2Integrations );
const { version } = require( '../lambda/package.json' );

require( 'dotenv' ).config();

class GeoaxisApiStack extends cdk.Stack
{
    constructor( scope, id, props )
    {
        super( scope, id, props );

        const httpApi = new apiGatewayV2.HttpApi( this, 'geoaxis-api' );
        const API_URL = `https://${ httpApi.httpApiId }.execute-api.${ this.region }.${ this.urlSuffix }`;

        // primary geoaxis handler
        const geoaxisLambda = new lambda.Function( this, 'geoaxis-handler', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'index.handler',
            memorySize: 1024,
            timeout: cdk.Duration.seconds( 30 ),
            code: lambda.Code.fromAsset( path.join( __dirname, '..', 'lambda' ) ),
            environment: {
                VERSION: version,
                DEPLOY_TIME: new Date().toString(),

                API_URL,
                AUTH_ROUTE: `${ API_URL }/profile`,
                LOGOUT_ROUTE: `${ API_URL }/logout`,
                GEOAXIS_CALLBACK_URL: `${ API_URL }/profile`,

                GEOAXIS_CLIENT_ID: process.env.GEOAXIS_CLIENT_ID,
                GEOAXIS_SECRET_ID: process.env.GEOAXIS_SECRET_ID,

                GEOAXIS_SCOPE: process.env.GEOAXIS_SCOPE,
                GEOAXIS_AUTHORIZATION_URL: process.env.GEOAXIS_AUTHORIZATION_URL,
                GEOAXIS_TOKEN_URL: process.env.GEOAXIS_TOKEN_URL,
                GEOAXIS_USER_PROFILE_URL: process.env.GEOAXIS_USER_PROFILE_URL
            }
        } );

        const httpApiGeoaxisIntegration = new apiGatewayV2Integrations.LambdaProxyIntegration( {
            handler: geoaxisLambda
        } );

        httpApi.addRoutes( {
            path: '/',
            methods: [ apiGatewayV2.HttpMethod.ANY ],
            integration: httpApiGeoaxisIntegration
        } );

        httpApi.addRoutes( {
            path: '/profile',
            methods: [ apiGatewayV2.HttpMethod.ANY ],
            integration: httpApiGeoaxisIntegration
        } );

        httpApi.addRoutes( {
            path: '/logout',
            methods: [ apiGatewayV2.HttpMethod.ANY ],
            integration: httpApiGeoaxisIntegration
        } );

        new cdk.CfnOutput( this, 'apiUrl', {
            value: API_URL,
            description: 'apiUrl for the ui to hit',
            exportName: 'apiUrl'
        } );
    }
}

module.exports = { GeoaxisApiStack };
