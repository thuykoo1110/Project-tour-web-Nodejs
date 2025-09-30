const router=require('express').Router()
const accountRoutes=require('../admin/account.route')
const dashboardRoutes = require('../admin/dashboard.route')
const categoryRoutes=require('./category.route')
const tourRoutes=require('./tour.route')
const orderRoutes=require('./order.route')
const userRoutes=require('./user.route')
const contactRoutes=require('./contact.route')
const settingRoutes=require('./setting.route')
const profileRoutes=require('./profile.route')
const uploadRoutes = require('./upload.route')
const authMiddlewares = require("../../middleware/admin/auth.middleware")

router.use('/account',accountRoutes)
router.use('/dashboard',authMiddlewares.verifyToken, dashboardRoutes)
router.use('/category', authMiddlewares.verifyToken,categoryRoutes)
router.use('/tour', authMiddlewares.verifyToken, tourRoutes)
router.use('/order', authMiddlewares.verifyToken, orderRoutes)
router.use('/user',authMiddlewares.verifyToken, userRoutes)
router.use('/contact', authMiddlewares.verifyToken, contactRoutes)
router.use('/setting',authMiddlewares.verifyToken, settingRoutes)
router.use('/profile', authMiddlewares.verifyToken, profileRoutes)
router.use('/upload',authMiddlewares.verifyToken, uploadRoutes)
router.use(authMiddlewares.verifyToken, (req,res)=>{
  res.render('admin/pages/error-404',{
    pageTitle: "404 not found"
  })
})//the other cases

module.exports=router