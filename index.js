const { WebClient } = require('@slack/web-api');
const firstPart = require('./src/firstPart');
const secondPart = require('./src/secondPart');

const SLACK_OAUTH_KEY = process.env.SLACK_OAUTH_KEY;
const slackWebClient = new WebClient(SLACK_OAUTH_KEY);

// --- Grad workspace details ---
// Grad workspace id = T03KG8S3Z
// nineteen-london channel id = GNART2BFE

exports.handler = async (event, context) => {
    // Test Slack OAuth
    const res = await slackWebClient.auth.test();
    if (!res.ok) {
        console.log('Slack auth error! Terminating lambda.');
        return;
    }

    // There are 2 CRON jobs set up in AWS to run this lambda at 12:05 and 12:30.
    // If it's before 12:15 run firstPart.js else run secondPart.js
    if (new Date().getMinutes() < 15) {
        await firstPart.run();
    } else {
        await secondPart.run();
    }
};
