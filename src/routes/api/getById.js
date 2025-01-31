// src/routes/api/getById.js

const { File } = require("../../model/file");
const path = require("path");

module.exports = async (req, res) => {
  const id = path.parse(req.url).name;
  const ownerId = req.user;
  const ext = path.extname(req.url);

  try {
    const file = new File(await File.byId(ownerId, id));
    if (ext) {
      if (file.isSupportedExtension(ext)) {
        res
          .status(200)
          .setHeader("content-type", file.convertContentType(ext))
          .send(await file.convertData(ext));
      } else {
        res.status(415).json({
          status: "error",
          error: {
            code: 415,
            message: `file extension is not supported ${ext}`,
          },
        });
      }
    } else {
      res
        .status(200)
        .setHeader("content-type", file.type)
        .send(await file.getData());
    }
  } catch (error) {
    console.log({ error }, "error found, cannot get file by", { id });
    res.status(404).json({
      status: "error",
      error: {
        code: 404,
        message: `failed to get file by id, error found, ${error}`,
      },
    });
  }
};
