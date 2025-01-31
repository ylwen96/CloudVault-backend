const MemoryDB = require('./memory-db');

// Create two in-memory databases: one for file metadata and the other for raw data
const data = new MemoryDB();
const metadata = new MemoryDB();

// Write a file's metadata to memory db. Returns a Promise
function writeFile(file) {
  return metadata.put(file.ownerId, file.id, file);
}

// Read a file's metadata from memory db. Returns a Promise
function readFile(ownerId, id) {
  return metadata.get(ownerId, id);
}

// Write a file's data to memory db. Returns a Promise
function writeFileData(ownerId, id, value) {
  return data.put(ownerId, id, value);
}

// Read a file's data from memory db. Returns a Promise
function readFileData(ownerId, id) {
  return data.get(ownerId, id);
}

// Get a list of file ids/objects for the given user from memory db. Returns a Promise
async function listFiles(ownerId, expand = false) {
  const files = await metadata.query(ownerId);

  // If we don't get anything back, or are supposed to give expanded files, return
  if (expand || !files) {
    return files;
  }

  // Otherwise, map to only send back the ids
  return files.map((file) => file.id);
}

// Delete a file's metadata and data from memory db. Returns a Promise
function deleteFile(ownerId, id) {
  return Promise.all([
    // Delete metadata
    metadata.del(ownerId, id),
    // Delete data
    data.del(ownerId, id),
  ]);
}

module.exports.listFiles = listFiles;
module.exports.writeFile = writeFile;
module.exports.readFile = readFile;
module.exports.writeFileData = writeFileData;
module.exports.readFileData = readFileData;
module.exports.deleteFile = deleteFile;
