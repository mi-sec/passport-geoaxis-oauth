const path                     = require( 'path' );
const { createReadStream }     = require( 'fs' );
const AWS                      = require( 'aws-sdk' );
const mime                     = require( 'mime-types' );
const recursivelyReadDirectory = require( './recursively-read-directory' );

async function s3UploadDirectory( localPath, bucketName, profile = '' ) {
    AWS.config.credentials = new AWS.SharedIniFileCredentials( { profile } );

    const s3 = new AWS.S3();

    const files = await recursivelyReadDirectory( localPath );

    const uploads = [];

    for ( let i = 0; i < files.length; i++ ) {
        const filePath    = files[ i ];
        const s3Key       = path.relative( localPath, filePath );
        const contentType = mime.lookup( s3Key );

        console.log( `uploading s3://${ bucketName }/${ s3Key }` );
        uploads.push(
            s3.putObject( {
                Key: s3Key,
                Bucket: bucketName,
                Body: createReadStream( filePath ),
                ContentType: contentType
            } )
                .promise()
        );
    }

    return Promise.all( uploads );
}

module.exports = s3UploadDirectory;
