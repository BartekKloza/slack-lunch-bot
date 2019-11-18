const { WebClient } = require('@slack/web-api');
const firstPart = require('./firstPart');
const secondPart = require('./secondPart');

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
    await firstPart.run();
    //await secondPart.run();

    if (new Date().getMinutes() < 15) {
        // It's 12:05, execute firstPart.js
        // await firstPart.run();
    } else {
        // It's 12:30, execute secondPart.js
        // await secondPart.run();
    }
};
