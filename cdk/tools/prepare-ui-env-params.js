const { promises: fs } = require( 'fs' );
const path             = require( 'path' );

const cfnOutput = require( '../outputs-api.json' );

const vueAppPath = path.join( process.cwd(), 'ui' );

async function main() {
    console.log( cfnOutput );

    if ( !cfnOutput.hasOwnProperty( 'GeoaxisApiStack' ) ) {
        throw new Error( 'CFN Output doesn\'t look right, stopping process' );
    }

    const authRoute   = new URL( '/profile', cfnOutput.GeoaxisApiStack.apiUrl );
    const logoutRoute = new URL( '/logout', cfnOutput.GeoaxisApiStack.apiUrl );

    await fs.writeFile(
        path.join( vueAppPath, '.env' ),
        [
            `VUE_APP_GEOAXIS_AUTH_ROUTE=${ authRoute.href }`,
            `VUE_APP_GEOAXIS_LOGOUT_ROUTE=${ logoutRoute.href }`
        ].join( '\n' )
    );
}

main();
