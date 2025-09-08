const router=require('express').Router()
const multer =  require('multer')
const categoryController=require('../../controllers/admin/category.controller')
const cloudinaryHelper = require('../../helpers/cloudinary.helper')
const categoryValidate = require('../../validate/admin/category.validate')
const upload = multer({ storage: cloudinaryHelper.storage })

router.get('/list',categoryController.list)

router.get('/create',categoryController.create)

router.post('/create', upload.single("avatar"),categoryValidate.createPost, categoryController.createPost)

router.get('/edit/:id',categoryController.edit) //:id :id động

router.patch(
  '/edit/:id', 
  upload.single("avatar"),
  categoryValidate.createPost, 
  categoryController.editPatch
)

router.patch('/delete/:id',categoryController.deletePatch)
module.exports=router;