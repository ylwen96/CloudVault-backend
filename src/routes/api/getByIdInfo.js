// src/routes/api/getByIdWithInfo.js

const { File } = require("../../model/file");

module.exports = async (req, res) => {
  const id = req.params.id;
  const ownerId = req.user;

  try {
    const file = await File.byId(ownerId, id);
    if (file) {
      res.status(200).json({ status: "ok", file: file });
    } else {
      res.status(404).json({
        status: "error",
        error: { code: 404, message: "fragment is not found" },
      });
    }
  } catch (error) {
    console.log({ error }, "error found, cannot get fragment by", { id });
    res.status(404).json({
      status: "error",
      error: {
        code: 404,
        message: `failed to get fragment by id, error found, ${error}`,
      },
    });
  }
};
