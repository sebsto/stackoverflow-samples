// dependencies
var AWS = require('aws-sdk');
var gm = require('gm').subClass({ imageMagick: true }); // Enable ImageMagick integration.

// constants
var MAX_WIDTH  = 100;
var MAX_HEIGHT = 100;

// get reference to S3 client
var s3 = new AWS.S3();

const event =  {
    "Records" : [
        {
            "s3" : {
                "bucket" : {
                    "name" : "test-so-sst"
                },
                "object" : {
                    "key" : "image.jpg"
                }
            }
        }
    ]
}

async function  download(srcBucket, srcKey) {
    return new Promise((resolve, reject) => {
        s3.getObject({
            Bucket: srcBucket,
            Key: srcKey
        }, (error, data) => {
            if (error) { 
                console.log(error); reject(error);
            } else {
                resolve(data);
            }
        });
    });
};

async function transform(imageType, image) {
    return new Promise((resolve, reject) => {

        gm(image).size(function(err, size) {
            // Infer the scaling factor to avoid stretching the image unnaturally.
            var scalingFactor = Math.min(
                MAX_WIDTH / size.width,
                MAX_HEIGHT / size.height
            );
            var width  = scalingFactor * size.width;
            var height = scalingFactor * size.height;

            // Transform the image buffer in memory.
            this.resize(width, height)
                .toBuffer(imageType, function(err, buffer) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(buffer);
                    }
                });
        }); 
    });
}

async function upload(dstBucket, dstKey, contentType, data) {
    return new Promise((resolve, reject) => {
        // Stream the transformed image to a different S3 bucket.
        s3.putObject({
                Bucket: dstBucket,
                Key: dstKey,
                Body: data,
                ContentType: contentType
            }, (error, data) => {
                if (error) { 
                    console.log(error); reject(error);
                } else {
                    resolve(data);
                }    
            });
    });
}

async function  copyImage(srcBucket, srcKey, dstBucket) {
    return new Promise((resolve, reject) => {
        s3.copyObject({
            CopySource: srcBucket + '/' + srcKey,
            Bucket: dstBucket,
            Key: srcKey
        }, (error, data) => {
            if (error) { 
                console.log(error); reject(error);
            } else {
                resolve(data);
            }
        });
    });
};

async function  deleteOrig(srcBucket, srcKey) {
    return new Promise((resolve, reject) => {
        s3.deleteObject({
            Bucket: srcBucket,
            Key: srcKey
        }, (error, data) => {
            if (error) { 
                console.log(error); reject(error);
            } else {
                resolve(data);
            }
        });
    });
};


exports.handler = async function(event, context, callback) {
    // Read options from the event.
    console.log("Reading options from event:\n", JSON.stringify(event, null,2));
    var srcBucket = event.Records[0].s3.bucket.name;
    // Object key may have spaces or unicode non-ASCII characters.
    var srcKey    =
    decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
    var dstBucket = srcBucket + "-resized";
    var dstKey    = "resized-" + srcKey;

    // Sanity check: validate that source and destination are different buckets.
    if (srcBucket == dstBucket) {
        callback("Source and destination buckets are the same.");
        return;
    }

    // Infer the image type.
    var typeMatch = srcKey.match(/\.([^.]*)$/);
    if (!typeMatch) {
        callback("Could not determine the image type.");
        return;
    }
    var imageType = typeMatch[1];
    if (imageType != "jpg" && imageType != "png") {
        callback(`Unsupported image type: ${imageType}`);
        return;
    }

    // Download the image from S3, transform, and upload to a different S3 bucket.
    try {
        let responseDownload  = await download(srcBucket, srcKey);
        let responseTransform = await transform(imageType, responseDownload.Body);
        let responseUpload    = await upload(dstBucket, dstKey, responseDownload.ContentType, responseTransform);
        let responseCopy      = await copyImage(srcBucket, srcKey, dstBucket);
        let responseDelete    = await deleteOrig(srcBucket, srcKey);    
        console.log(
            'Successfully resized ' + srcBucket + '/' + srcKey +
            ' and uploaded to ' + dstBucket + '/' + dstKey
        );
    } catch (error) {
        const message = 'Unable to resize ' + srcBucket + '/' + srcKey +
        ' and upload to ' + dstBucket + '/' + dstKey +
        ' due to an error: ' + error;
        console.error(message);
        callback(error, message);
    }
    
    callback(null, "success");
};

//to test from my laptop
exports.handler(event, null, (error, message) => {
    if (error) console.log(error);
    console.log(message);
})