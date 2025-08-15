const router = require('express').Router();
const homeRoutes = require("./home.route")
const tourRoutes = require("./tour.route")

router.use('/', homeRoutes)
router.use('/tour', tourRoutes)

module.exports = router