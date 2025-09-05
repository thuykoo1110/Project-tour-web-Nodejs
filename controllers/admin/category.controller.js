const Category = require('../../models/catagory.model')
const categoryHelper = require('../../helpers/category.helper.js')
module.exports.list=async (req,res)=>{
  res.render('admin/pages/category-list',{
    pageTitle: "Danh sách danh mục"
  })
}

module.exports.create=async (req,res)=>{
  const categoryList = await Category.find({
    deleted: false
  })

  const categoryTree = categoryHelper.buildCategoryTree(categoryList, "");
  res.render('admin/pages/category-create',{
    pageTitle: "Tạo danh mục",
    categoryList: categoryTree
  })
}

module.exports.createPost=async (req,res)=>{
  // console.log(req.file);  //dạng file
  if(req.body.position){
    req.body.position = parseInt(req.body.position);
  }
  else{
    const totalRecord = await Category.countDocuments({});
    req.body.position = totalRecord+1;
  }

  req.body.createdBy = req.account.id;
  req.body.updatedBy = req.account.id;
  req.body.avatar = req.file ? req.file.path : "";

  const newRecord = new Category(req.body);
  await newRecord.save();

  res.json({
    code: "success",
    message: "Tạo danh mục thành công!"
  })
}