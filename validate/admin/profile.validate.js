const Joi = require('joi')

module.exports.profilePatch = async(req,res,next) => {
  const schema = Joi.object({
    fullName: Joi.string()
      .required()
      .min(5)
      .max(50)
      .messages({
        "string.empty": "Vui lòng nhập họ tên!"
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