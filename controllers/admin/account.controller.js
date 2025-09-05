const accountAdmin = require("../../models/account-admin.model")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")
const generateHelper= require('../../helpers/generate.helper')
const forgotPassword = require('../../models/forgot-password.model')
const mailHelper = require('../../helpers/mail.hepler')

module.exports.login=async (req,res)=>{
  res.render('admin/pages/login',{
    pageTitle: "Đăng nhập"
  })
}

module.exports.loginPost = async (req,res) => {
  const { email, password, rememberPassword }= req.body;

  const existAccount = await accountAdmin.findOne({
    email: email
  })
  
  if(!existAccount){
    res.json({
    code: "error",
    message: "Email hasn't existed!"
    })
    return;
  }

  const isValidPassword = await bcrypt.compare(password,existAccount.password);
  if(!isValidPassword){
    res.json({
  code: "error",
  message: "Password is incorrect!"
});
    return;
  }

  if(existAccount.status != "active"){
    res.json({
    code: "error",
    message: "The account has not been activated!"
    })
    return;
  }
  const token = jwt.sign({
  id: existAccount.id,
  email: existAccount.email
  }, 
  process.env.JWT_SECRET,
  {
    expiresIn: rememberPassword? "7d":"1d"
  }
)

  // console.log(token);
  res.cookie("token",token,{
    maxAge: rememberPassword? (7*60*60*1000):(24*60*60*1000), //1 day
    httpOnly: true,
    sameSite: "strict"
  })

  res.json({
    code: "success",
    message: "Successfully login!"
  })
}

module.exports.register = async (req,res)=>{
  res.render('admin/pages/register',{
    pageTitle: "Đăng kí"
  })
}

module.exports.registerPost = async (req,res)=>{
  const existAccount = await accountAdmin.findOne({
    email: req.body.email
  })
  //check existing account
  if(existAccount){
    res.json({
    code: "error",
    message: "Email has existed"
  })
    return;
  }

  req.body.status="initial";

  //Mã hóa mât khẩu
  const salt = await bcrypt.genSaltSync(10);
  req.body.password = await bcrypt.hashSync(req.body.password, salt);

  const newAccount = new accountAdmin(req.body); //ghi data vào database
  await newAccount.save();  //await: để đơi lưu dữ liệu xong mới chạy xún bên dứi
  
  console.log(req.body);
  res.json({
    code: "success",
    message: "Successfully register"
  })
}

module.exports.registerInitial = async(req,res)=>{
  res.render('admin/pages/register-initial',{
    pageTitle: "Tài khoản đã được khởi tạo"
  })
}

module.exports.forgotPassword = async (req,res)=>{
  res.render('admin/pages/forgot-password',{
    pageTitle: "Quên mật khẩu"
  })
}

module.exports.forgotPasswordPost = async (req,res)=>{
  const {email}=req.body;

  // Kiểm tra email có trong database ko
  const existAccount = await accountAdmin.findOne({
    email: email,
    status: "active"
  })
  if(!existAccount){
    res.json({
      code: "error",
      message: "Email has not existed!"
    })
    return;
  }

  //Kiểm tra email đã tồn tại trong ForgotPassword collection chưa
  const existEmailInForgotPassword = await forgotPassword.findOne({
    email: email
  })

  if(existEmailInForgotPassword){
    res.json({
      code: "error",
      message: "Vui lòng gửi lại sau 5 phút!"
    })
    return;
  }
  //Otp create
  const otp = generateHelper.getRandomNumber(6);
  console.log(otp);
  
  //Lưu vào CSDL bản record mới: email, otp lưu trong 5 phút
  const record = new forgotPassword({
    email: email,
    otp: otp,
    expireAt: Date.now() +  5*60*1000
  });
  await record.save();

  //Gửi mã otp tự dộng qua mail
  const title = "Mã OTP lấy lại mật khẩu"
  const content = `Mã OTP của bạn là <b>${otp}</b>. Mã OTP có hiệu lực trong 5 phút, vui lòng không cung cấp cho bất kì ai.`
  mailHelper.sendMail(email,title,content);

  res.json({
    code: "success",
    message: 'Đã gửi OTP qua email!'
  })
}

module.exports.otpPassword = async (req,res)=>{
  res.render('admin/pages/otp-password',{
    pageTitle: "Nhập mã otp"
  })
}

module.exports.otpPasswordPost = async (req,res) => {
  const { email, otp } = req.body;

  const existRecord = await forgotPassword.findOne({
    email: email,
    otp: otp
  })

  if(!existRecord){
    res.json({
      code: "error",
      message: "Mã OTP không chính xác!"
    })
    return;
  }

  const account = await accountAdmin.findOne({
    email: email
  })

  const token = jwt.sign(
  {
    id: account.id,
    email: account.email
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "1d"
  }
  )

  res.cookie("token", token, {
    maxAge: 24*60*60*1000,
    httpOnly: true,
    sameSite: "strict"
  })

  res.json({
    code: "success",
    message: "Xác thực thành công!"
  })
} 

module.exports.resetPassword = async(req,res)=>{
  res.render('admin/pages/reset-password',{
    pageTitle: "Đặt lại mật khẩu"
  })
}
module.exports.resetPasswordPost = async (req,res) =>{
  const { password }= req.body;

  //Encode password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  console.log(hashPassword);
  await accountAdmin.updateOne({
    _id: req.account.id},
  {
    password: hashPassword
  }) //tham số 1 là đặc trưng của accout(vd id) //tham số thứ 2 là cái update

  res.json({
    code: "success",
    message: "Đổi mật khẩu thành công!"
  })
}
module.exports.logoutPost = async(req,res)=>{
  res.clearCookie("token");
  res.json({
    code: "success",
    message:  "Successfully logout!"
  })
}

