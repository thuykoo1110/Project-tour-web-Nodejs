const router=require('express').Router()
const tourController=require('../../controllers/admin/tour.controller')
const cloudinaryHelper = require('../../helpers/cloudinary.helper')
const multer =  require('multer')
const upload = multer({ storage: cloudinaryHelper.storage })
const tourValidate = require('../../validate/admin/tour.validate')

router.get('/list',tourController.list)

router.get('/create',tourController.create)

router.post('/create', upload.single("avatar"),tourValidate.createPost,tourController.createPost)

router.get('/edit/:id',tourController.edit)

router.patch(
  '/edit/:id', 
  upload.single("avatar"),
  tourValidate.createPost, 
  tourController.editPatch
)

router.patch('/delete/:id', tourController.deletePatch)

router.patch('/change-multi', tourController.changeMultiPatch)

router.get('/trash',tourController.trash)
module.exports=router;