const router = require('express').Router();
const homeRoutes = require("./home.route")
const tourRoutes = require("./tour.route")
const cartRoutes=require('./cart.route')
const settingMiddleware = require('../../middleware/client/setting.middleware')

router.use(settingMiddleware.webisiteInfo)

router.use('/', homeRoutes)
router.use('/tour', tourRoutes)
router.use('/cart',cartRoutes)
module.exports = router