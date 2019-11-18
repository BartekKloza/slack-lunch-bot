const SLACK_OAUTH_KEY = process.env.SLACK_OAUTH_KEY;
const DYNAMO_DB_TABLE = process.env.DYNAMO_DB_TABLE;
const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID;

const { WebClient } = require('@slack/web-api');
const AWS = require('aws-sdk');

const slackWebClient = new WebClient(SLACK_OAUTH_KEY);
const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-2' });

async function run() {
    console.log('Running the second part !');

    const todaysDateString = new Date().toLocaleString().split(',');
    const queryParams = {
        TableName: DYNAMO_DB_TABLE,
        Key: {
            ID: todaysDateString[0]
        },
    }
    
    let DBResponse;
    await new Promise((resolve) => {
        dynamodb.get(queryParams, (error, data) => {
            if (error) {
                console.log('DynamoDB error! Unable to get timestamp from the DB');
                return;
            } else {
                DBResponse = data;
            }
            resolve();
        });
    });
    await new Promise((resolve) => {
        dynamodb.delete(queryParams, (error) => {
            if (error) {
                console.log('DynamoDB error! Unable to delete timestamp from the DB');
                return;
            }
            resolve();
        });
    });

    console.log(DBResponse.Item.TS);
    
    // const getReactionsResponse = await slackWebClient.reactions.get({
    //     channel: SLACK_CHANNEL_ID,
    //     timestamp: DBResponse.Item.TS,
    //     full: true,
    // });
    
    
    //console.log(getReactionsResponse);
}

module.exports = {
    run,
};
