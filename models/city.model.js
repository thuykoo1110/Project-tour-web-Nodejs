const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  name :String
})

const city = mongoose.model("City", schema, "cities")

module.exports = city