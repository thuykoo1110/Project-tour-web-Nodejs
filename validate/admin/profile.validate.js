const Joi = require('joi')

module.exports.profilePatch = async(req,res,next) => {
  const schema = Joi.object({
    fullName: Joi.string()
      .required()
      .min(5)
      .max(50)
      .messages({
        "string.empty": "Vui lòng nhập họ tên!",
        "string.min": 'Họ tên phải có ít nhất 5 ký tự!',
        "string.max": 'Họ tên không được vượt quá 50 ký tự!'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        "string.empty": "Vui lòng nhập email!"
      }),
    phone: Joi.string()
      .required()
      .custom((value,helpers) => {
        if(!/(84|0[3|5|7|8|9])+([0-9]{8})\b/g.test(value)){
          return helpers.error('phone-format')
        }
        return value;
      })
      .messages({
        "phone-format": 'Số điện thoại không đúng định dạng!',
        "string.empty": 'Vui lòng nhập số điện thoại!'
      })
  })

  const { error } = schema.validate(req.body);
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

module.exports.changePassword = async (req,res,next) =>{
  const schema = Joi.object({
    password: Joi.string()
      .required()
      .min(8)
      .custom((value,helpers) => {
        if(!/[A-Z]/.test(value)){
          return helpers.error('password-uppercase')
        }
        if(!/[a-z]/.test(value))
          return helpers.error('password-lowercase')
        if(!/\d/.test(value))
          return helpers.error('password-number')
        if(!/[@$!%*?&]/.test(value))
          return helpers.error('password-special')
        return value
      })
      .messages({
        "string.emepty": 'Vui lòng nhập mật khẩu!',
        "password-uppercase": 'Mật khẩu phải chứa ít nhất một chữ cái in hoa!',
        "string.min": 'Mật khẩu phải chứa ít nhất 8 ký tự!',
        "password-lowercase": 'Mật khẩu phải chứa ít nhất một chữ cái thường!',
        "password-number": 'Mật khẩu phải chứa ít nhất một chữ số!',
        "password-special": 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt!'
      })
    // confirmPassword: Joi.string()
    //   .required()
    //   .valid(Joi.ref('password')) // <== So sánh với trường password
    //   .messages({
    //     "any.only": "Mật khẩu xác nhận không khớp!",
    //     "string.empty": "Vui lòng xác nhận mật khẩu!"
    //   })
  })
  const { error } = schema.validate(req.body);
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