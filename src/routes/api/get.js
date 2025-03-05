// src/routes/api/get.js

const { File } = require("../../model/file");

module.exports = async (req, res) => {
  const ownerId = req.user;
  const expand = req.query.expand;

  try {
    const files = await File.byUser(ownerId, expand > 0);
    res.status(200).json({
      status: "ok",
      files: files,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      error: {
        code: 404,
        message: "file to get list of files",
      },
    });
  }
};
