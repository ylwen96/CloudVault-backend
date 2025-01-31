// src/model/data/aws/ddbDocClient.js

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
// Helper library for working with converting DynamoDB types to/from JS
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

/**
 * If AWS credentials are configured in the environment, use them. Normally when we connect to DynamoDB from a deployment in AWS, we won't bother with this.  But if you're testing locally, you'll need
 * these, or if you're connecting to LocalStack or DynamoDB Local
 * @returns Object | undefined
 */
const getCredentials = () => {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    const credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: process.env.AWS_SESSION_TOKEN,
    };
    console.log('Using extra DynamoDB Credentials');
    return credentials;
  }
};

/**
 * If an AWS DynamoDB Endpoint is configured in the environment, use it.
 * @returns string | undefined
 */
const getDynamoDBEndpoint = () => {
  if (process.env.AWS_DYNAMODB_ENDPOINT_URL) {
    console.log(
      { endpoint: process.env.AWS_DYNAMODB_ENDPOINT_URL },
      'Using alternate DynamoDB endpoint'
    );
    return process.env.AWS_DYNAMODB_ENDPOINT_URL;
  }
};

// Create and configure an Amazon DynamoDB client object.
const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  endpoint: getDynamoDBEndpoint(),
  credentials: getCredentials(),
});

const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: {
    convertEmptyValues: false, // false, by default.
    removeUndefinedValues: false, // false, by default.
    convertClassInstanceToMap: true, // we have to set this to `true` for LocalStack
  },
  unmarshallOptions: {
    wrapNumbers: false, // false, by default.
  },
});

module.exports = ddbDocClient;
