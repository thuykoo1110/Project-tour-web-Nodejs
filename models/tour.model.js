const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')
mongoose.plugin(slug)

const schema = mongoose.Schema(
  {
    name: String,
    category: String,
    position: Number,
    status: String,
    featured: Boolean,
    avatar: String,
    priceAdult: Number,
    priceChildren: Number,
    priceBaby: Number,
    priceNewAdult: Number,
    priceNewChildren: Number,
    priceNewBaby: Number,
    stockAdult: Number,
    stockChildren: Number,
    stockBaby: Number,
    locations: Array,
    time: String,
    vehicle: String,
    departureDate: Date,
    information: String,
    schedules: Array,
    createdBy: String,
    updatedBy: String,
    slug:{
      type: String,
      slug: "name",
      unique: true
    }, //đường dẫn
    deleted:{
      type: Boolean,
      default: false
    },
    deletedBy: String,
    deletedAt: Date
  },
  {
    timestamps: true
  }
)

const tour = mongoose.model(
  "Tour",
  schema,
  "tour"
)

module.exports = tour