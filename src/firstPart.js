const { SLACK_OAUTH_KEY, SLACK_CHANNEL_ID, DYNAMO_DB_TABLE } = process.env.SLACK_OAUTH_KEY;
const { WebClient } = require('@slack/web-api');
const AWS = require('aws-sdk');

const slackWebClient = new WebClient(SLACK_OAUTH_KEY);
const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-2' });

async function run() {
  // 1. Post a message in a Slack channel for people to leave reactions
  const postMessageResponse = await slackWebClient.chat.postMessage({
    channel: SLACK_CHANNEL_ID,
    text: "Hi London grads! Who's going for lunch? :lunch:",
  });
  if (!postMessageResponse.ok) {
    console.log('Slack chat.postMessage API error !');
    return;
  }

  // 2. Save a timestamp of the sent message so the message can be referenced later
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
        console.log('DynamoDB error! Unable to save a timestamp to the DB');
        return;
      }
      resolve();
    });
  });
}

module.exports = {
  run,
};
