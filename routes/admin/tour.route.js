const router=require('express').Router()
const tourController=require('../../controllers/admin/tour.controller')
const cloudinaryHelper = require('../../helpers/cloudinary.helper')
const multer =  require('multer')
const upload = multer({ storage: cloudinaryHelper.storage })
const tourValidate = require('../../validate/admin/tour.validate')
const tour = require('../../models/tour.model')

router.get('/list',tourController.list)

router.get('/create',tourController.create)

router.post(
  '/create',
  upload.fields([
    { name: "avatar", maxCount: 1},
    { name: "images", maxCount: 10}
  ]),
  tourValidate.createPost,
  tourController.createPost
)

router.get('/edit/:id',tourController.edit)

router.patch(
  '/edit/:id', 
  // upload.single("avatar"),
  upload.fields([
    { name: "avatar", maxCount: 1},
    { name: "images", maxCount: 10}
  ]),
  tourValidate.createPost, 
  tourController.editPatch
)

router.patch('/delete/:id', tourController.deletePatch)

router.delete('/destroy/:id', tourController.destroyDelete)

router.patch('/undo/:id', tourController.undoPatch)

router.patch('/change-multi', tourController.changeMultiPatch)

router.get('/trash',tourController.trash)
module.exports=router;