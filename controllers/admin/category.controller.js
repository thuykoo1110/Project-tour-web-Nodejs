const Category = require('../../models/catagory.model')
const categoryHelper = require('../../helpers/category.helper.js')
const accountAdmin = require('../../models/account-admin.model.js')
const moment = require('moment')
const { pathAdmin } = require('../../config/variable.config.js')

module.exports.list=async (req,res)=>{
  // console.log(req.query); //.query: các biến sau dấu ?
  const find = {
    deleted: false,
    };

  //Lọc theo trạng thái
  if(req.query.status){
      find.status = req.query.status;
  }
  const categoryList = await Category
    .find(find)
    .sort({
      position: "desc"
    })
  
  for(const item of categoryList){
    if(item.createdBy){
      const infoAccount = await accountAdmin.findOne({
        _id: item.createdBy
      })
      if(infoAccount){
        item.createdByFullName = infoAccount.fullName
      }
    }
    if(item.updatedBy){
      const infoAccount = await accountAdmin.findOne({
        _id: item.updatedBy
      })
      if(infoAccount){
        item.updatedByFullName = infoAccount.fullName
      }
    }
    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY")
    item.updatedAtFormat = moment(item.updatedAt).format("HH:mm - DD/MM/YYYY")
  }
  res.render('admin/pages/category-list',{
    pageTitle: "Danh sách danh mục",
    categoryList: categoryList
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

module.exports.edit=async (req,res)=>{
  try{
  // console.log(req.params) //cho đối tượng dộng (VD id ở router)
  const { id } = req.params

  const categoryDetail = await Category.findOne({
    _id: id,
    deleted: false
  })

  const categoryList = await Category.find({
    deleted: false
  })

  const categoryTree = categoryHelper.buildCategoryTree(categoryList, "");
  res.render('admin/pages/category-edit',{
    pageTitle: "Chỉnh sửa danh mục",
    categoryList: categoryTree,
    categoryDetail: categoryDetail
  })
  }
  catch(error){
    res.redirect(`/${pathAdmin}/category/list`)
  }
}

module.exports.editPatch = async(req,res) => {
  try{
    // console.log(req.params.id);
    // console.log(req.file);
    // console.lof(req.body);
    const id = req.params.id;
    if(req.body.position){
    req.body.position = parseInt(req.body.position);
    }
    else{
      const totalRecord = await Category.countDocuments({});
      req.body.position = totalRecord+1;
    }

    req.body.updatedBy = req.account.id;
    if(req.file){
      req.body.avatar = req.file.path;
    }
    else{
      delete req.body.avatar;
    }
    
    //Model.updateOne( filter,   // điều kiện tìm document cần update
                      //update,   // dữ liệu update
                      //options   // (không bắt buộc))
    await Category.updateOne({
      _id:id,
      deleted: false
    }, req.body);

    res.json({
        code: "success",
        message: "Cập nhật danh mục thành công!"
      })
  }
  catch(error){
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!"
    })
  }
}

module.exports.deletePatch = async(req,res) => {
  try{
    const id = req.params.id;
    
    //Model.updateOne( filter,   // điều kiện tìm document cần update
                      //update,   // dữ liệu update
                      //options   // (không bắt buộc))
    await Category.updateOne({
      _id:id,
    }, {
      deleted: true,
      deletedBy: req.account.id,
      deletedAt: Date.now()
    });

    res.json({
        code: "success",
        message: "Xóa danh mục thành công!"
      })
  }
  catch(error){
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!"
    })
  }
}