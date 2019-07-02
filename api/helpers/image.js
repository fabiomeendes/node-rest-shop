const multer = require('multer');
const moment = require('moment');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${moment(Date.now()).format('MMDDYYYYHHmmss')}__${file.originalname}`);
  },
});

const limits = {
  fileSize: 1024 * 1024 * 5, // approx 5MB
};

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage, limits, fileFilter });

module.exports = upload;
