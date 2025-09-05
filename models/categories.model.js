const mongoose = require('mongoose')

const schema = mongoose.schema(
  {
    name: String,
    parent: String,
    position: String,
    status: String,
    avatar: String,
    description: String,
    createdBy: String,
    updatedBy: String,
    slug: String, //đường dẫn
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