'use strict';

const { WebClient } = require('@slack/web-api');
const AWS = require('aws-sdk');
const SLACK_OAUTH_KEY = 'xoxp-817907755365-805114853026-821955892133-6e2790f8e1932cee7d39c20790c9472d';
const DYNAMO_DB_TABLE = 'lunch-bot-timestamps';
const slackWebClient = new WebClient(SLACK_OAUTH_KEY);
const dynamodb = new AWS.DynamoDB.DocumentClient({region: 'eu-west-2'});

// --- Grad workspace details ---
// Grad workspace id = T03KG8S3Z
// nineteen-london channel id = GNART2BFE

let asd = async function (event, context) {

    // Create a new instance of the WebClient class with the token read from your environment variable
    // The current date
    const currentTime = new Date().toTimeString();

    // Use the `auth.test` method to find information about the installing user
    const res = await slackWebClient.auth.test()

    // Find your user id to know where to send messages to
    const userId = res.user_id

    // Use the `chat.postMessage` method to send a message from this app
    const postMessageResponse = await slackWebClient.chat.postMessage({
        channel: userId,
        text: `The current time is ${currentTime}`,
    });
    console.log('Message posted!');

    const timestampObj = {
        TableName: DYNAMO_DB_TABLE,
        Item: {
            ID: postMessageResponse.ts
        }
    };
    console.log('saving timestamp to the DB');
    dynamodb.put(timestampObj, (error) => {
        if(error) {
            console.log('DynamoDB error! Unable to save timestamp to the DB');
        }
        else {
            console.log('Timestamp saved successfully!')
        }
    });
    console.log('what happened here?');
}

asd();