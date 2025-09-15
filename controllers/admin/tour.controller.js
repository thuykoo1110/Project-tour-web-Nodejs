const Category = require('../../models/catagory.model')
const categoryHelper = require('../../helpers/category.helper.js')
const City = require('../../models/city.model')
const Tour = require('../../models/tour.model')
const accountAdmin = require('../../models/account-admin.model.js')
const moment = require('moment')
const { pathAdmin } = require('../../config/variable.config.js')
const city = require('../../models/city.model')

module.exports.list = async (req,res)=>{
  const find ={
    deleted: false
  };

  const tourList = await Tour
    .find(find)
    .sort({
      position: "desc"
    });

    for(const item of tourList){
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
          _id: item.createdBy
        })
        if(infoAccount){
          item.updatedByFullName = infoAccount.fullName
        }
      }
      item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
      item.updatedAtFormat = moment(item.updatedAt).format("HH:mm - DD/MM/YYYY");
    }

    const accountAdminList = await accountAdmin.find({});
  res.render('admin/pages/tour-list',{
    pageTitle: "Danh sách tour",
    tourList: tourList,
    accountAdminList:accountAdminList
  })
}

module.exports.create = async (req,res)=>{
  const categoryList = await Category.find({
    deleted: false
  })

  const categoryTree = categoryHelper.buildCategoryTree(categoryList,"");

  const cityList = await City.find({});
  res.render('admin/pages/tour-create',{
    pageTitle: "Tạo tour",
    categoryList: categoryTree,
    cityList: cityList
  })
}

module.exports.createPost = async (req,res)=>{
  if(req.body.position){
    req.body.position = parseInt(req.body.position);
  }
  else{
    const totalRecord = await Tour.countDocuments({});
    req.body.position = totalRecord + 1;
  }

  req.body.avatar = req.file ? req.file.path : "";
  
  req.body.priceAdult = req.body.priceAdult ? parseInt(req.body.priceAdult) : 0;
  req.body.priceChildren = req.body.priceChildren ? parseInt(req.body.priceChildren) : 0;
  req.body.priceBaby = req.body.priceBaby ? parseInt(req.body.priceBaby) : 0;
  req.body.priceNewAdult = req.body.priceNewAdult ? parseInt(req.body.priceNewAdult) : 0;
  req.body.priceNewChildren = req.body.priceNewChildren ? parseInt(req.body.priceNewChildren) : 0;
  req.body.priceNewBaby = req.body.priceNewBaby ? parseInt(req.body.priceNewBaby) : 0;
  req.body.stockAdult = req.body.stockAdult ? parseInt(req.body.stockAdult) : 0;
  req.body.stockChildren = req.body.stockChildren ? parseInt(req.body.stockChildren) : 0;
  req.body.stockBaby = req.body.stockBaby ? parseInt(req.body.stockBaby) : 0;
  req.body.locations = req.body.locations ? JSON.parse(req.body.locations) : [];
  req.body.departureDate = req.body.departureDate ? new Date(req.body.departureDate) : null;
  req.body.schedules = req.body.schedules ? JSON.parse(req.body.schedules) : [];

  req.body.createdBy = req.account.id;
  req.body.updatedBy = req.account.id;

  const newRecord = new Tour(req.body);
  await newRecord.save();

  res.json({
    code: "success",
    message: "Tạo tour thành công!"
  })
}

module.exports.trash = async (req,res)=>{
  res.render('admin/pages/tour-trash',{
    pageTitle: "Thùng rác"
  })
}

module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;

    const tourDetail = await Tour.findOne({
      _id: id,
      deleted: false
    })

    if(tourDetail.departureDate) {
      tourDetail.departureDateFormat = moment(tourDetail.departureDate).format("YYYY-MM-DD");
    }

    const categoryList = await Category.find({
      deleted: false
    })

    const categoryTree = categoryHelper.buildCategoryTree(categoryList, "");

    const cityList = await City.find({});

    res.render('admin/pages/tour-edit', {
      pageTitle: "Chỉnh sửa tour",
      tourDetail: tourDetail,
      categoryList: categoryTree,
      cityList: cityList
    })
  } catch (error) {
    res.redirect(`/${pathAdmin}/tour/list`);
  }
}

module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;

    if(req.body.position) {
      req.body.position = parseInt(req.body.position);
    } else {
      const totalRecord = await Tour.countDocuments({});
      req.body.position = totalRecord + 1;
    }

    if(req.file) {
      req.body.avatar = req.file.path;
    } else {
      delete req.body.avatar;
    }
    req.body.priceAdult = req.body.priceAdult ? parseInt(req.body.priceAdult) : 0;
    req.body.priceChildren = req.body.priceChildren ? parseInt(req.body.priceChildren) : 0;
    req.body.priceBaby = req.body.priceBaby ? parseInt(req.body.priceBaby) : 0;
    req.body.priceNewAdult = req.body.priceNewAdult ? parseInt(req.body.priceNewAdult) : req.body.priceAdult;
    req.body.priceNewChildren = req.body.priceNewChildren ? parseInt(req.body.priceNewChildren) : req.body.priceChildren;
    req.body.priceNewBaby = req.body.priceNewBaby ? parseInt(req.body.priceNewBaby) : req.body.priceBaby;
    req.body.stockAdult = req.body.stockAdult ? parseInt(req.body.stockAdult) : 0;
    req.body.stockChildren = req.body.stockChildren ? parseInt(req.body.stockChildren) : 0;
    req.body.stockBaby = req.body.stockBaby ? parseInt(req.body.stockBaby) : 0;
    req.body.locations = req.body.locations ? JSON.parse(req.body.locations) : [];
    req.body.departureDate = req.body.departureDate ? new Date(req.body.departureDate) : null;
    req.body.schedules = req.body.schedules ? JSON.parse(req.body.schedules) : [];

    req.body.updatedBy = req.account.id;

    await Tour.updateOne({
      _id: id,
      deleted: false
    }, req.body);

    res.json({
      code: "success",
      message: "Cập nhật tour thành công!"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!"
    })
  }
}

module.exports.deletePatch = async (req,res) => {
  try{
    const id = req.params.id;

    await Tour.updateOne({
      _id: id
    },{
      deleted: true,
      deletedBy: req.account.id,
      deletedAt: Date.now()
    });

    res.json({
      code: "success",
      message: "Xóa tour thành công!"
    })
  }catch(error){
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!"
    })
  }
}