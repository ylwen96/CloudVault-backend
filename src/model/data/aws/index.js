// XXX: temporary use of memory-db until we add DynamoDB
const s3Client = require('./s3Client');
const ddbDocClient = require('./ddbDocClient');
const { PutCommand, GetCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// Create two in-memory databases: one for file metadata and the other for raw data
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    // As the data streams in, we'll collect it into an array.
    const chunks = [];

    // When there's data, add the chunk to our chunks list
    stream.on('data', (chunk) => chunks.push(chunk));
    // When there's an error, reject the Promise
    stream.on('error', reject);
    // When the stream is done, resolve with a new Buffer of our chunks
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });


// Writes a file to DynamoDB. Returns a Promise.
function writeFile(file) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Item: file,
  };

  // Create a PUT command to send to DynamoDB
  const command = new PutCommand(params);

  try {
    return ddbDocClient.send(command);
  } catch (err) {
    console.log({ err, params, file }, 'error writing file to DynamoDB');
    throw err;
  }
}

// Reads a file from DynamoDB. Returns a Promise<file|undefined>
async function readFile(ownerId, id) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: { ownerId, id },
  };

  // Create a GET command to send to DynamoDB
  const command = new GetCommand(params);

  try {
    // Wait for the data to come back from AWS
    const data = await ddbDocClient.send(command);
    return data?.Item;
  } catch (err) {
    console.log({ err, params }, 'error reading file from DynamoDB');
    throw err;
  }
}

// Writes a file's data to an S3 Object in a Bucket
async function writeFileData(ownerId, id, data) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
    Body: data,
  };

  // Create a PUT Object command to send to S3
  const command = new PutObjectCommand(params);

  try {
    await s3Client.send(command);
  } catch (err) {
    const { Bucket, Key } = params;
    console.log({ err, Bucket, Key }, 'Error uploading file data to S3');
    throw new Error('unable to upload file data');
  }
}

// Reads a file's data from S3 and returns (Promise<Buffer>)
async function readFileData(ownerId, id) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  // Create a GET Object command to send to S3
  const command = new GetObjectCommand(params);

  try {
    const data = await s3Client.send(command);
    return streamToBuffer(data.Body);
  } catch (err) {
    const { Bucket, Key } = params;
    console.log({ err, Bucket, Key }, 'Error streaming file data from S3');
    throw new Error('unable to read file data');
  }
}

// Get a list of files, either ids-only, or full Objects, for the given user.
// Returns a Promise<Array<file>|Array<string>|undefined>
async function listFiles(ownerId, expand = false) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    KeyConditionExpression: 'ownerId = :ownerId',
    ExpressionAttributeValues: {
      ':ownerId': ownerId,
    },
  };

  // Limit to only `id` if we aren't supposed to expand. Without doing this
  // we'll get back every attribute.  The projection expression defines a list
  // of attributes to return, see:
  if (!expand) {
    params.ProjectionExpression = 'id';
  }

  // Create a QUERY command to send to DynamoDB
  const command = new QueryCommand(params);

  try {
    // Wait for the data to come back from AWS
    const data = await ddbDocClient.send(command);
    return !expand ? data?.Items.map((item) => item.id) : data?.Items
  } catch (err) {
    console.log({ err, params }, 'error getting all files for user from DynamoDB');
    throw err;
  }
}

// Delete a file's metadata and data from memory db. Returns a Promise
async function deleteFile(ownerId, id) {
  const paramsS3 = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    // Our key will be a mix of the ownerID and file id, written as a path
    Key: `${ownerId}/${id}`,
  };

  const paramsDynamoDB = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: { ownerId, id },
  };

  // Create a Delete Object command to send to S3
  const commandS3 = new DeleteObjectCommand(paramsS3);

  // Create a Delete Object command to send to DynamoDB
  const commandDynamoDB = new DeleteCommand(paramsDynamoDB);

  try {
    // Delete the object from the Amazon S3 bucket.
    await s3Client.send(commandS3);
  } catch (err) {
    const { Bucket, Key } = paramsS3;
    console.log({ err, Bucket, Key }, 'Error deleting file data from S3');
    throw new Error('unable to delete file data');
  }

  try {
    // Delete the object from the DynamoDB.
    await ddbDocClient.send(commandDynamoDB);
  } catch (err) {
    console.log({ err, paramsS3 }, 'error deleting file from DynamoDB');
    throw err;
  }
}

module.exports.listFiles = listFiles;
module.exports.writeFile = writeFile;
module.exports.readFile = readFile;
module.exports.writeFileData = writeFileData;
module.exports.readFileData = readFileData;
module.exports.deleteFile = deleteFile;
