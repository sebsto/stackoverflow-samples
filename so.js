// create table with 
//
// aws dynamodb create-table --table-name demo --key-schema AttributeName=id,KeyType=HASH --attribute-definitions AttributeName=id,AttributeType=N --billing-mode PAY_PER_REQUEST
const AWS = require('aws-sdk');
AWS.config.region = 'eu-west-1';
const documentClient = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = 'demo';
async function insertOrUpdateDDB(userId, value) {

    return new Promise((resolve, reject) => {

        var params = {
            TableName: TABLE_NAME,
            Key: {
                id: userId
            },
            UpdateExpression: "ADD amount :val",
            ExpressionAttributeValues: {
                ":val": value
            }
        };

        documentClient.update(params, (err, data) => {
            if (err) {
                console.log("Error when calling DynamoDB");
                console.log(err, err.stack); // an error occurred
                reject(err);
            } else {
                //console.log(data); // successful response
                resolve(data);
            }
        });
    });
}

async function readDDB(userId) {

    return new Promise((resolve, reject) => {
        var params = {
            TableName: TABLE_NAME,
            Key: {
                id: userId
            }
        };

        documentClient.get(params, (err, data) => {
            if (err) {
                console.log("Error when calling DynamoDB");
                console.log(err, err.stack); // an error occurred
                reject(err);
            } else {
                //console.log(data); // successful response
                resolve(data);
            }
        });
    });
}

async function main() {
    console.log("adding 150 to the amount");
    await insertOrUpdateDDB(1, 150);

    console.log("removing 50 from the amount");
    await insertOrUpdateDDB(1, -50);

    console.log("querying the amount");
    // await readDDB(1).then( (data) => {
    //     console.log(JSON.stringify(data,null,2));
    // });
    let data = await readDDB(1);
    console.log(JSON.stringify(data,null,2));
}    

main();
