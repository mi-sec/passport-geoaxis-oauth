const cdk        = require( '@aws-cdk/core' );
const s3         = require( '@aws-cdk/aws-s3' );
const cloudfront = require( '@aws-cdk/aws-cloudfront' );

require( 'dotenv' ).config();

class GeoaxisUiStack extends cdk.Stack
{
    constructor( scope, id, props )
    {
        super( scope, id, props );

        const appBucket = new s3.Bucket( this, 'geoaxis-website-host', {
            websiteIndexDocument: 'index.html'
        } );

        new cdk.CfnOutput( this, 'bucketName', {
            value: appBucket.bucketName,
            description: 'Name of the s3 bucket where the app ui is stored',
            exportName: 'bucketName'
        } );

        const originAccessIdentity = new cloudfront.OriginAccessIdentity( this, 'OIA', {
            comment: 'Setup access from CloudFront to the bucket ( read )'
        } );

        appBucket.grantRead( originAccessIdentity );

        const cfDist = new cloudfront.CloudFrontWebDistribution( this, 'geoaxis-app', {
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: appBucket,
                        originAccessIdentity: originAccessIdentity
                    },
                    behaviors: [
                        { isDefaultBehavior: true }
                    ]
                }
            ]
        } );

        new cdk.CfnOutput( this, 'cloudfrontDistributionUrl', {
            value: cfDist.distributionDomainName,
            description: 'CloudFront Distribution URL',
            exportName: 'cloudfrontDistributionUrl'
        } );
    }
}

module.exports = { GeoaxisUiStack };
