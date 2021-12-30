'use strict';

const
    { promises: fs } = require( 'fs' ),
    path             = require( 'path' );

async function recursivelyReadDirectory( dir, items = [] ) {
    const layer = await fs.readdir( path.resolve( dir ) );

    await Promise.all(
        layer.map(
            async ( fpath ) => {
                fpath      = path.join( dir, fpath );
                const info = await fs.stat( fpath );

                if ( info.isDirectory() ) {
                    return await recursivelyReadDirectory( fpath, items );
                }
                else {
                    items.push( fpath );
                }
            }
        )
    );

    return items;
}

module.exports = recursivelyReadDirectory;
