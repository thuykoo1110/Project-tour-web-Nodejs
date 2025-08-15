const router = require('express').Router();
const tourController = require("../../controllers/client/tour.controller");
router.get('/', tourController.list)
router.get('/create', tourController.list)
router.get('/delete', tourController.list)
router.get('/update', tourController.list)

module.exports = router;