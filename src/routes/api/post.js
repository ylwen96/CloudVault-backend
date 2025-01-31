// src/routes/api/post.js

const { File } = require("../../model/file");
const contentType = require("content-type");

module.exports = async (req, res) => {
  const type = contentType.parse(req.headers["content-type"]).type;
  const ownerId = req.user;

  if (Buffer.isBuffer(req.body) === true && File.isSupportedType(type)) {
    const file = new File({ ownerId, type });

    try {
      await file.save();
      await file.setData(req.body);
      res.location(`${process.env.API_URL}/drive/files/${file.id}`);
      res.status(201).json(createSuccessResponse({ file: file }));
    } catch (error) {
      console.log({ error }, "post request failed", { ownerId });
      throw new Error({ error }, "unable to save file");
    }
  } else {
    console.log("post request failed", { ownerId });
    res
      .status(415)
      .json({
        status: `error`,
        error: { code: 415, message: "Content-Type is not supported" },
      });
  }
};
