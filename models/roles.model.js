const mongoose = require('mongoose')

const schema = mongoose.Schema({
  name: String,
  description: String,
  permissions: Array,
  createdBy: String,
  updatedBy: String,
  slug:{
      type: String,
      slug: "name",
      unique: true
    }, //đường dẫn
  deleted: {
    type: Boolean,
    default: false
  },
  deletedBy: String,
  deletedAt: Date
  },
  {
    timestamps: true
  }
);

const Role = mongoose.model("Role", schema, "roles");
module.exports = Role;