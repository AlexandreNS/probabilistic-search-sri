const multer = require("multer");
const path = require("path");
const slugify = require('slugify')
const crypto = require("crypto");

const storageTypes = multer.diskStorage({
  destination: (req, file, cb) => {
    if (req.params.uuid) {
      cb(null, path.resolve(__dirname, "..", "..", "tmp", "uploads", `${req.params.uuid}`));
    } else {
      cb(null, path.resolve(__dirname, "..", "..", "tmp", "uploads"));
    }
  },
  filename: (req, file, cb) => {
    crypto.randomBytes(16, (err, hash) => {
      if (err) cb(err);
      file.key = `${hash.toString("hex")}-${slugify(file.originalname)}`;
      
      cb(null, file.key);
    });
  }
});

module.exports = {
  dest: path.resolve(__dirname, "..", "..", "tmp", "uploads"),
  storage: storageTypes,
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "text/html",
      "text/plain"
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type."));
    }
  }
};
