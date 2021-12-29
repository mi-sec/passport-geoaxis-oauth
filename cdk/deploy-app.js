const { promises: fs } = require( 'fs' );
const path             = require( 'path' );

const args = require( 'minimist' )( process.argv.slice( 2 ) );

const cfnOutput = require( './outputs.json' );

const VueService = require( '@vue/cli-service' );
const vueAppPath = path.join( process.cwd(), 'app' );
const service    = new VueService( vueAppPath );

const s3UploadDirectory = require( './lib/s3-upload-directory' );

// TODO::: use the vue config file and upload it to S3 once the cloudfront endpoint is created

async function main() {
    console.log( cfnOutput );

    if ( !cfnOutput.hasOwnProperty( 'GeoaxisUiExampleStack' ) ) {
        throw new Error( 'CFN Output doesn\'t look right, stopping process' );
    }
    await fs.writeFile(
        path.join( vueAppPath, '.env' ),
        [
            `VUE_APP_GEOAXIS_AUTH_ROUTE=${ cfnOutput.GeoaxisApiStack.apiUrl }/profile`,
            `VUE_APP_GEOAXIS_LOGOUT_ROUTE=${ cfnOutput.GeoaxisApiStack.apiUrl }/logout`
        ].join( '\n' )
    );

    service.init( 'production' );
    await service.run( 'build' );

    await s3UploadDirectory(
        path.join( process.cwd(), 'app', 'dist' ),
        cfnOutput.GeoaxisUiExampleStack.bucketName,
        args.profile
    );

    console.log( 'COMPLETE' );
}

main();
