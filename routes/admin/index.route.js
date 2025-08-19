const router=require('express').Router()
const accountRoutes=require('../admin/account.route')

router.use('/account',accountRoutes)

module.exports=router