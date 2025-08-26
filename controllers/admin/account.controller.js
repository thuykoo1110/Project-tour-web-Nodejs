const accountAdmin = require("../../models/account-admin.model")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")
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

  console.log(token);
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

module.exports.otpPassword = async (req,res)=>{
  res.render('admin/pages/otp-password',{
    pageTitle: "Nhập mã otp"
  })
}

module.exports.resetPassword = async(req,res)=>{
  res.render('admin/pages/reset-password',{
    pageTitle: "Đặt lại mật khẩu"
  })
}

module.exports.logoutPost = async(req,res)=>{
  res.clearCookie("token");
  res.json({
    code: "success",
    message:  "Successfully logout!"
  })
}

