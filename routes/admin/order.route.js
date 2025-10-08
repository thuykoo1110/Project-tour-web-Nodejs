const router=require('express').Router()
const orderController=require('../../controllers/admin/order.controller')
const orderValidate = require('../../validate/admin/order.validate.js')

router.get('/list',orderController.list)

router.get('/edit/:id',orderController.edit)

router.patch('/edit/:id', orderValidate.editPatch, orderController.editPatch)

router.patch('/delete/:id', orderController.deletePatch)
module.exports=router