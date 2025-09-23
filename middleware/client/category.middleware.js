const Category = require("../../models/catagory.model")
const categoryHelper = require("../../helpers/category.helper")

module.exports.list = async(req, res, next) =>{
  const categoryList = await Category
    .find({
      deleted: false,
      status: "active"
    })
    .sort({
      position: "desc"
    })

  const categoryTree = categoryHelper.buildCategoryTree(categoryList,"");
  res.locals.categoryList = categoryTree;
  next()
}