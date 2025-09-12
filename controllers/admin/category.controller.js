const Category = require('../../models/catagory.model')
const categoryHelper = require('../../helpers/category.helper.js')
const accountAdmin = require('../../models/account-admin.model.js')
const moment = require('moment')
const { pathAdmin } = require('../../config/variable.config.js')
const slugify = require('slugify')

module.exports.list=async (req,res)=>{
  // console.log(req.query); //.query: các biến sau dấu ?
  const find = {
    deleted: false,
    };

  //Lọc theo trạng thái
  if(req.query.status){
      find.status = req.query.status;
  }

  //Lọc theo người tạo
  if(req.query.createdBy){
    find.createdBy = req.query.createdBy;
  }
  
  // Lọc theo ngày tạo
  const dataFilter = {};
  if(req.query.startDate){
    const startDate = moment(req.query.startDate).toDate();  //format theo thời gian trong database
    dataFilter.$gte = startDate; //lọc thời gian >=startDate
  }
  if(req.query.endDate){
    const endDate = moment(req.query.endDate).toDate();
    dataFilter.$lte = endDate;
  }
  if(Object.keys(dataFilter).length>0){  //check object có chứa phần tử ko rùi mới add vào find
    find.createdAt = dataFilter;
  }
  // Hết Lọc theo ngày tạo

  // Search
  if(req.query.keyword){
    const keyword = slugify(req.query.keyword); //format keyword theo format slug
    const keywordRegex = new RegExp(keyword, "i"); //regex
    find.slug = keywordRegex;
  }
  // End Search
  const limitItems = 4;
  let page;
  if(req.query.page&&parseInt(req.query.page)>0){
    page = req.query.page;
  }

  const skip = (page-1)*limitItems;
  const totalRecord = await Category.countDocuments(find);
  const totalPage = Math.ceil(totalRecord/limitItems);
  const pagination = {
    skip: skip,
    totalRecord: totalRecord,
    totalPage: totalPage
  }
  // Phân trang

  // End phân trang
  const categoryList = await Category
  .find(find)
  .sort({
    position: "desc"
  })
  .limit(limitItems)
  .skip(skip)
  
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

  //Danh sách tài khoản quản trị
  const accountAdminList = await accountAdmin.find({});
  res.render('admin/pages/category-list',{
    pageTitle: "Danh sách danh mục",
    categoryList: categoryList,
    accountAdminList: accountAdminList,
    pagination: pagination
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

module.exports.changeMultiPatch = async (req,res) =>{
  try{
    const { option, ids } =req.body;
    
    switch(option){
      case "active":
      case "inactive":
        await Category.updateMany({
          _id: { $in: ids } //update nhìu item dùng updateMany
        },{
          status: option
        });

        res.json({
          code: "success",
          message: "Cập nhật trạng thái thành công!"
        })
        break;
      case "delete":
        await Category.updateMany({
          _id: { $in: ids } //update nhìu item dùng updateMany
        },{
          deleted: true,
          deletedBy: req.account.id,
          deletedAt: Date.now()
        });
        res.json({ 
          code: "success",
          message: "Đã xóa thành công!"
        })
        break;
      default: 
        res.json({
          code: "error",
          message: "Hành động không hợp lệ!"
        })
        break;
    }
    
  }
  catch(error){
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!"
    })
  }
}