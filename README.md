# Slack Lunch Bot
Slack Bot for asking people who's going for lunch.
## Setup
In order to run the bot you need to set up:

1. AWS Lambda function (with AmazonDynamoDBFullAccess permission)
2. DynamoDB table

Requires following Lambda env variables:

1. DynamoDB table name (`DYNAMO_DB_TABLE`)
2. Slack channel ID (`SLACK_CHANNEL_ID`)
3. Slack App OAuth key (`SLACK_OAUTH_KEY`)

