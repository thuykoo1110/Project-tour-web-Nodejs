const router = require('express').Router();
const orderController = require("../../controllers/client/order.controller");
router.post('/create', orderController.createPost) //'/'-trang chủ

module.exports = router;