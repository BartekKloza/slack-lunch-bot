const SLACK_OAUTH_KEY = process.env.SLACK_OAUTH_KEY;
const DYNAMO_DB_TABLE = process.env.DYNAMO_DB_TABLE;
const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID;

const { WebClient } = require('@slack/web-api');
const AWS = require('aws-sdk');

const slackWebClient = new WebClient(SLACK_OAUTH_KEY);
const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-2' });

async function run() {
    console.log('Running the first part !');

    const postMessageResponse = await slackWebClient.chat.postMessage({
        channel: SLACK_CHANNEL_ID,
        text: "Hi London grads! Who's going for lunch? :lunch:",
    });
    console.log('Message posted on Slack !');

    const todaysDateString = new Date().toLocaleString().split(',');

    const timestampObj = {
        TableName: DYNAMO_DB_TABLE,
        Item: {
            ID: todaysDateString[0],
            TS: postMessageResponse.ts,
        },
    };

    await new Promise((resolve) => {
        dynamodb.put(timestampObj, (error) => {
            if (error) {
                console.log('DynamoDB error! Unable to save timestamp to the DB');
                return;
            } else {
                console.log('Timestamp saved successfully!');
            }
            resolve();
        });
    });
}

module.exports = {
    run,
};
