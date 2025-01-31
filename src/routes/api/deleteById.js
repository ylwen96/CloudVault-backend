const { File } = require("../../model/file");

module.exports = async (req, res) => {
  try {
    const id = req.params._id;
    await File.delete(req.user, id);
    res.status(200).json({
      status: "ok",
    });
  } catch (err) {
    console.log({ err }, "error found, cannot delete file by");
    res.status(404).json({
      status: "error",
      error: {
        code: code,
        message: "page not found",
      },
    });
  }
};
