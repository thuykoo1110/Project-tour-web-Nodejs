const route = require('express').Router();
const uploadController = require('../../controllers/admin/upload.controller')
const multer = require('multer')
const cloudinaryHelper = require('../../helpers/cloudinary.helper')
const upload = multer({ storage: cloudinaryHelper.storage })

route.post(
  '/image', 
  upload.single("file"),
  uploadController.imagePost
);

module.exports = route;