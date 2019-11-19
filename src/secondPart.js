const SLACK_OAUTH_KEY = process.env.SLACK_OAUTH_KEY;
const DYNAMO_DB_TABLE = process.env.DYNAMO_DB_TABLE;
const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID;

const { WebClient } = require('@slack/web-api');
const AWS = require('aws-sdk');

const slackWebClient = new WebClient(SLACK_OAUTH_KEY);
const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-2' });

async function run() {
    // 1. Get the timestamp from the DB and then delete it, so the table stays clean
    const todaysDateString = new Date().toLocaleString().split(',');
    const queryParams = {
        TableName: DYNAMO_DB_TABLE,
        Key: {
            ID: todaysDateString[0],
        },
    }
    let messageTimestamp;
    await new Promise((resolve) => {
        dynamodb.get(queryParams, (error, data) => {
            if (error) {
                console.log('DynamoDB error! Unable to get timestamp from the DB');
                return;
            } else {
                messageTimestamp = data.Item.TS;
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

    // 2. Get IDs of users that reacted to bot's message. If noone reacted, send appropriate message and exit
    const getReactionsResponse = await slackWebClient.reactions.get({
        channel: SLACK_CHANNEL_ID,
        timestamp: messageTimestamp,
        full: true,
    });

    let userIDsArr = [];
    if (getReactionsResponse.ok && getReactionsResponse.message.reactions) {
        getReactionsResponse.message.reactions.map(reaction => {
            reaction.users.map(userID => {
                if (!userIDsArr.includes(userID)) {
                    userIDsArr.push(userID);
                }
            });
        });
    } else if (getReactionsResponse.ok && !getReactionsResponse.message.reactions) {
        await slackWebClient.chat.postMessage({
            channel: SLACK_CHANNEL_ID,
            text: 'Nobody wants to go for lunch today!',
        });
        return;
    } else {
        console.log('Slack reactions.get API error !');
        return;
    }
    
    let usersDisplayNamesArr = [];
    await Promise.all(userIDsArr.map(async userID => {
        const getUsersResponse = await slackWebClient.users.info({
            user: userID,
            timestamp: messageTimestamp,
        }); 
        usersDisplayNamesArr.push(getUsersResponse)

    }))
    let userNamesString = '';
    usersDisplayNamesArr.map((userObj) => {
        console.log(userObj.user.real_name);
        userNamesString += userObj.user.real_name + ', ';
    });
    userNamesString = userNamesString.slice(0, -2);
    const postMessageResponse = await slackWebClient.chat.postMessage({
        channel: SLACK_CHANNEL_ID,
        text: 'People going for lunch today are: ' + userNamesString,
    });
    if (!postMessageResponse.ok) {
        console.log('Slack chat.postMessage API error !');
    }
    return;
}

module.exports = {
    run,
};
