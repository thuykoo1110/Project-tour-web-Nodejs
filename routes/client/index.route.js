const router = require('express').Router();
const homeRoutes = require("./home.route")
const tourRoutes = require("./tour.route")
const cartRoutes=require('./cart.route')
const categoryRoutes = require('./category.route')
const contactRoutes = require('./contact.route')
const searchRoutes = require('./search.route')
const settingMiddleware = require('../../middleware/client/setting.middleware')
const categoryMiddleware = require('../../middleware/client/category.middleware')

router.use(settingMiddleware.webisiteInfo)

router.use(categoryMiddleware.list)

router.use('/', homeRoutes)

router.use('/tour', tourRoutes)

router.use('/cart',cartRoutes)

router.use('/contact', contactRoutes)

router.use('/category', categoryRoutes)

router.use('/search', searchRoutes)

module.exports = router