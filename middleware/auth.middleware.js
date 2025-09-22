const jwt = require('jsonwebtoken');
const accountAdmin = require('../models/account-admin.model');
const Role = require('../models/roles.model')

module.exports.verifyToken = async (req,res,next) => {
  try{
  const token = req.cookies.token;

  if(!token){
    res.redirect(`/${pathAdmin}/account/login`);
    return;
  }

  //check token is valid?
  var decoded = jwt.verify(token, process.env.JWT_SECRET);
  const { id, email } = decoded;

  //kiểm tra tài khoản đc activate chưa 
  const existAccount = await accountAdmin.findOne({
    _id: id ,//mongoose quy định _id
    email: email,
    status: "active"
  })

  if(!existAccount){
    res.clearCookie("token");
    res.redirect(`/${pathAdmin}/account/login`);
    return;
  }
  
  if(existAccount.role){
    const roleInfo = await Role.findOne({
      _id: existAccount.role
    })
    if(roleInfo){
      existAccount.roleName = roleInfo.name
    }
  }
  req.account = existAccount;

  res.locals.account = existAccount; //lưu thông tin vào file pug
  next();
}
  catch(error){
    console.error("Token error:", error);
    res.clearCookie("token");
    res.redirect(`/${pathAdmin}/account/login`);
  }
  
}