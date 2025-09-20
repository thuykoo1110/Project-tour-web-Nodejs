const mongoose = require('mongoose')

const schema = mongoose.Schema({
  name: String,
  description: String,
  permissions: Array,
  createdBy: String,
  updatedBy: String,
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