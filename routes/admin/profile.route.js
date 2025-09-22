const router=require('express').Router()
const profileController=require('../../controllers/admin/profile.controller')
const multer = require('multer')
const cloudinaryHelper = require('../../helpers/cloudinary.helper')
const upload = multer({ storage: cloudinaryHelper.storage })
const profileValidate = require('../../validate/admin/profile.validate')
router.get('/edit',profileController.edit);

router.patch(
  '/edit', 
  upload.single("avatar"),
  profileValidate.profilePatch,
  profileController.editPatch
);

router.get('/change-password',profileController.changePassword);

router.patch(
  '/change-password',
  profileValidate.changePassword,
  profileController.changePasswordPatch);

module.exports=router;