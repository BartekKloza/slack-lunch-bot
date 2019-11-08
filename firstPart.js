const SLACK_OAUTH_KEY = process.env.SLACK_OAUTH_KEY;
const DYNAMO_DB_TABLE = process.env.DYNAMO_DB_TABLE;
const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID;

const { WebClient } = require('@slack/web-api');
const AWS = require('aws-sdk');

const slackWebClient = new WebClient(SLACK_OAUTH_KEY);
const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-2' });

async function run() {
  console.log('run first part !');
  const postMessageResponse = await slackWebClient.chat.postMessage({
    channel: SLACK_CHANNEL_ID,
    text: "Hi London grads! Who's going for lunch? :lunch:",
  });
  console.log('Message posted!');
  const todaysDateTimeString = new Date().toLocaleString().split(',');

  const timestampObj = {
    TableName: DYNAMO_DB_TABLE,
    Item: {
      ID: todaysDateTimeString[0],
      TS: postMessageResponse.ts,
    },
  };
  console.log('saving timestamp to the DB');
  await new Promise((resolve) => {
    dynamodb.put(timestampObj, (error) => {
      if (error) {
        console.log('DynamoDB error! Unable to save timestamp to the DB');
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
