const joi = require('joi')

module.exports.roleCreatePost = async(req,res,next) =>{
  const schema = joi.object({
    name: joi.string()
      .required()
      .messages({
        "string.empty": 'Vui lòng nhập tên nhóm quyền!'
      }),
    description: joi.string().allow(""),
    permissions: joi.array().default([])
  });

  const { error } = schema.validate(req.body);
  if(error){
    const errorMessage = error.details[0].message;

    res.json({
      code: error,
      message: errorMessage
    });
    return;
  };
  next()
}