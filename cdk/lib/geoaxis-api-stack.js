const path                     = require( 'path' );
const uuid                     = require( 'uuid' );
const cdk                      = require( '@aws-cdk/core' );
const iam                      = require( '@aws-cdk/aws-iam' );
const lambda                   = require( '@aws-cdk/aws-lambda' );
const dynamodb                 = require( '@aws-cdk/aws-dynamodb' );
const apiGatewayV2             = require( '@aws-cdk/aws-apigatewayv2' );
const apiGatewayV2Integrations = require( '@aws-cdk/aws-apigatewayv2-integrations' );
const { version }              = require( '../lambda/package.json' );
require( 'dotenv' ).config();

const requiredEnvKeys = [
    'GEOAXIS_CLIENT_ID',
    'GEOAXIS_SECRET_ID',
    'GEOAXIS_SCOPE',
    'GEOAXIS_AUTHORIZATION_URL',
    'GEOAXIS_TOKEN_URL',
    'GEOAXIS_USER_PROFILE_URL'
];

for ( let i = 0; i < requiredEnvKeys.length; i++ ) {
    if ( !process.env.hasOwnProperty( requiredEnvKeys[ i ] ) ) {
        throw new Error(
            `Oops. The environment variable ${ requiredEnvKeys[ i ] } is required. Add it to the .env file.`
        );
    }
}

class GeoaxisApiStack extends cdk.Stack
{
    constructor( scope, id, props )
    {
        super( scope, id, props );

        const geoaxisSessionStorageTable = new dynamodb.Table( this, 'geoaxisSessionStorageTable', {
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING }
        } );

        const auxiliaryRouteLambdaRole = new iam.Role( this, 'auxiliaryRouteLambdaRole', {
            assumedBy: new iam.ServicePrincipal( 'lambda.amazonaws.com' ),
            path: '/service-role/',
            inlinePolicies: {
                GeoaxisDynamoDBStorePolicy: new iam.PolicyDocument( {
                    statements: [
                        new iam.PolicyStatement( {
                            effect: iam.Effect.ALLOW,
                            actions: [
                                'dynamodb:PutItem',
                                'dynamodb:DescribeTable',
                                'dynamodb:DeleteItem',
                                'dynamodb:GetItem',
                                'dynamodb:Scan',
                                'dynamodb:Query',
                                'dynamodb:UpdateItem'
                            ],
                            resources: [
                                [
                                    'arn:aws:dynamodb', this.region, this.account,
                                    `table/${ geoaxisSessionStorageTable.tableName }`
                                ].join( ':' )
                            ]
                        } )
                    ]
                } ),
                AWSLambdaBasicExecutionRole: new iam.PolicyDocument( {
                    statements: [
                        new iam.PolicyStatement( {
                            effect: iam.Effect.ALLOW,
                            actions: [
                                'logs:CreateLogGroup',
                                'logs:CreateLogStream',
                                'logs:PutLogEvents'
                            ],
                            resources: [
                                `arn:aws:logs:${ this.region }:${ this.account }:*`
                            ]
                        } )
                    ]
                } )
            }
        } );


        const httpApi = new apiGatewayV2.HttpApi( this, 'geoaxis-api' );
        const API_URL = `https://${ httpApi.httpApiId }.execute-api.${ this.region }.${ this.urlSuffix }`;

        // primary geoaxis handler
        const geoaxisLambda = new lambda.Function( this, 'geoaxis-handler', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'index.handler',
            memorySize: 1024,
            timeout: cdk.Duration.seconds( 30 ),
            role: auxiliaryRouteLambdaRole,
            code: lambda.Code.fromAsset( path.join( __dirname, '..', 'lambda' ) ),
            environment: {
                VERSION: version,
                DEPLOY_TIME: new Date().toString(),

                SESSION_SECRET: process.env.SESSION_SECRET || uuid.v4(),
                DYNAMO_DB_SESSION_STORAGE_TABLE: geoaxisSessionStorageTable.tableName,

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

        const httpApiGeoaxisIntegration = new apiGatewayV2Integrations.HttpLambdaIntegration(
            'geoaxis-handler-integration', geoaxisLambda
        );

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
            path: '/failure',
            methods: [ apiGatewayV2.HttpMethod.ANY ],
            integration: httpApiGeoaxisIntegration
        } );

        httpApi.addRoutes( {
            path: '/version',
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
