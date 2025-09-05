const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')
mongoose.plugin(slug)

const schema = mongoose.Schema(
  {
    name: String,
    parent: String,
    position: String,
    status: String,
    avatar: String,
    description: String,
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

const category = mongoose.model(
  "Catagory",
  schema,
  "categories"
)

module.exports = category