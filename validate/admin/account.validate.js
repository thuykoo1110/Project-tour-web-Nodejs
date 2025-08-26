const Joi = require('joi');

module.exports.registerPost= async (req,res,next)=>{
  const schema = Joi.object({
    fullName: Joi.string()
        .min(5)
        .max(50)
        .required()
        .messages({
          "string.empty": "Vui lòng nhập lại", //field (required) empty
          "string.min":'Họ tên phải có ít nhất 5 ký tự!',
          "string.max":'Họ tên không được vượt quá 50 ký tự!',
        }),
    email :Joi.string()
        .email()
        .required()
        .messages({
          "string.empty": "Vui lòng nhập lại"
        }),
    password: Joi.string()
        .min(8)
        .custom((value,helpers)=>{
          if(!/[A-Z]/.test(value)){
            return helpers.error('password.uppercase');
          }
          if(!/[a-z]/.test(value)){
            return helpers.error('password.lowercase');
          }
          if(!/\d/.test(value)){
            return helpers.error('password.number');
          }
          if(!/[@$!%*?&]/.test(value)){
            return helpers.error('password.special');
          }
          return value;
        })
        .required()
        .messages({
          "string.empty": "Vui lòng nhập lại",
          "string.min" : 'Mật khẩu phải chứa ít nhất 8 ký tự!',
          "password.uppercase" : 'Mật khẩu phải chứa ít nhất một chữ cái in hoa!',
          "password.lowercase" : 'Mật khẩu phải chứa ít nhất một chữ cái thường!',
          "password.number" : 'Mật khẩu phải chứa ít nhất một chữ số!',
          "password.special" : 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt!'
        })
  })

  const {error} = schema.validate(req.body);
  if(error){
    const errorMessage=error.details[0].message;

    res.json({
      code: "error",
      message: errorMessage
    })
    return;
  }
  next()
} //hàm trung gian

module.exports.loginPost= async (req,res,next)=>{
  const schema = Joi.object({
    email :Joi.string()
        .email()
        .required()
        .messages({
          "string.empty": "Vui lòng nhập lại"
        }),
    password: Joi.string()
        .required()
        .messages({
          "string.empty": "Vui lòng nhập lại"
        }),
    rememberPassword: Joi.boolean()
  })

  const {error} = schema.validate(req.body);
  if(error){
    const errorMessage=error.details[0].message;

    res.json({
      code: "error",
      message: errorMessage
    })
    return;
  }
  next()
}