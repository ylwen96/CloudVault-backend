// src/routes/api/putById.js
const { File } = require("../../model/file");
const path = require("path");
const contentType = require("content-type");

module.exports = async (req, res) => {
  const type = contentType.parse(req.headers["content-type"]).type;
  const id = path.parse(req.url).name;

  try {
    const file = new File(await File.byId(req.user, id));
    file.type = type;
    if (File.isSupportedType(type)) {
      await file.save();
      await file.setData(req.body);
      res.status(200).json({ status: "ok", file: file });
    } else {
      console.log("Content-Type is not supported");
      res.status(400).json({
        status: "error",
        error: {
          code: 400,
          message: "Content-Type is not supported",
        },
      });
    }
  } catch (error) {
    console.log({ error }, "unable to update file, file not found", { id });
    res.status(404).json({
      status: `error`,
      error: {
        code: 404,
        message: `unable to update file, file not found', ${id}, ${error}`,
      },
    });
  }
};
