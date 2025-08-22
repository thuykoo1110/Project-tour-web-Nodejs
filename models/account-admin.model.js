const mongoose=require('mongoose')

const accountAdmin=mongoose.model(
  'AccountAdmin',
  {
    fullName: String,
    email: String,
    password: String,
    status: String, //initial, active, inactive
  },
  "accounts-admin"
);

module.exports =accountAdmin;