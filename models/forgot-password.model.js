const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    email: String,
    otp: String,
    expireAt:{
      type: Date,
      expires: 10
  }
  },
  {
    timestamps: true //== true => auto add 2 properties 'createdAt' and 'updatedAt'
  }
);
const forgotPassword= mongoose.model(
  'forgotPassword',
  schema,
  'forgot-password'
);

module.exports = forgotPassword;