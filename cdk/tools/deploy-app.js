const path              = require( 'path' );
const s3UploadDirectory = require( './s3-upload-directory' );

const args       = require( 'minimist' )( process.argv.slice( 2 ) );
const cfnOutput  = require( '../outputs-ui.json' );
const vueAppPath = path.join( process.cwd(), 'ui' );

async function main() {
    if ( !cfnOutput.hasOwnProperty( 'GeoaxisUiStack' ) ) {
        throw new Error( 'CFN Output doesn\'t look right, stopping process' );
    }

    await s3UploadDirectory(
        path.join( vueAppPath, 'dist' ),
        cfnOutput.GeoaxisUiStack.bucketName,
        args.profile
    );

    console.log( 'COMPLETE' );
}

main();
