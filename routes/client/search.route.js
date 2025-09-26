const route = require('express').Router();
const searchController = require('../../controllers/client/search.controller')

route.get('/', searchController.list);

module.exports = route;