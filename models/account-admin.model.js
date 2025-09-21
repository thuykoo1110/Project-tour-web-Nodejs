const mongoose=require('mongoose')


const schema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  role: String,
  positionCompany: String,
  createdBy: String,
  updatedBy: String,
  password: String,
  status: String, //initial, active, inactive
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
);
const accountAdmin=mongoose.model(
  'AccountAdmin',
  schema,
  "accounts-admin"
);

module.exports = accountAdmin;