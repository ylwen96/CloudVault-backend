// choose either aws or in memory

module.exports = process.env.AWS_REGION ? require('./aws') : require('./memory');