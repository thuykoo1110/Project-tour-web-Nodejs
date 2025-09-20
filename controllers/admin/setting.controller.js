const SettingwebsiteInfo = require("../../models/setting-website-info.model")
const { permissionList } = require("../../config/variable.config")
const Role = require('../../models/roles.model')
const slugify = require('slugify')
module.exports.list=async(req,res)=>{
  res.render('admin/pages/setting-list',{
    pageTitle: "Danh sách cài đặt"
  })
}

module.exports.websiteInfo=async(req,res)=>{
  const settingWebsiteInfo = await SettingwebsiteInfo.findOne({});

  res.render('admin/pages/setting-website-info',{
    pageTitle: "Thông tin website",
    settingWebsiteInfo: settingWebsiteInfo
  })
}

module.exports.websiteInfoPatch = async( req, res ) => {
  // console.log(req.body);
  // console.log(req.files);
  if(req.files && req.files.logo){
    req.body.logo = req.files.logo[0].path;
  }

  if(req.files && req.files.favicon){
    req.body.favicon = req.files.favicon[0].path;
  }
  
  const settingWebsiteInfo = await SettingwebsiteInfo.findOne({});
  if(!settingWebsiteInfo){
    const newRecord = new SettingwebsiteInfo(req.body);
    await newRecord.save();
  }
  else{
    await SettingwebsiteInfo.updateOne({
      _id: settingWebsiteInfo.id
    }, req.body)
  }

  res.json({
    code: "success",
    message: "Cập nhật thành công!"
  })
}

module.exports.accountAdminList=async(req,res)=>{
  res.render('admin/pages/setting-account-admin-list',{
    pageTitle: "Tài khoản quản trị"
  })
}

module.exports.accountAdminCreate=async(req,res)=>{
  res.render('admin/pages/setting-account-admin-create',{
    pageTitle: "Tạo tài khoản quản trị"
  })
}

module.exports.roleList=async(req,res)=>{
  const find = {
    deleted: false
  };

  if(req.query.keyword){
    const keyword = slugify(req.query.keyword);
    const keywordRegex = new RegExp(keyword,"i");
    find.slug = keywordRegex
  }
  const roleList = await Role
    .find(find)
    .sort({
      createdAt: "desc"
    })
  res.render('admin/pages/setting-role-list',{
    pageTitle: "Nhóm quyền",
    roleList: roleList
  })
}

module.exports.changeMultiRolePatch = async(req,res)=>{
  try{
    const { option, ids } = req.body
    switch(option){
      case "delete":
        await Role.updateMany({
          _id: { $in: ids }
        },{
          deleted: true,
          deletedBy: req.account.id,
          deletedAt: Date.now()
        });
        res.json({
          code: "success",
          message: "Đã xóa thành công!"
        });
        break;
      default:
        res.json({
          code: "error",
          message: "Hành động không hợp lệ!"
        })
        break;
    }
  }catch(error){
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!"
    })
  }
}

module.exports.roleCreate=async(req,res)=>{
  res.render('admin/pages/setting-role-create',{
    pageTitle: "Tạo nhóm quyền",
    permissionList: permissionList
  })
}

module.exports.roleCreatePost=async(req,res)=>{
  try{
    req.body.createdBy = req.account.id;
    req.body.updatedBy = req.account.id;

    const newRecord = new Role(req.body);
    await newRecord.save();
    res.json({
      code: "success",
      message: "Tạo nhóm quyền thành công!"
    })
  } catch(error){
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}

module.exports.deleteRolePatch = async(req,res)=>{
  try{
    const id = req.params.id;

    await Role.updateOne({
      _id:id
    },{
      deleted: true,
      deletedBy: req.account.id,
      deletedAt: Date.now()
    });

    res.json({
      code: "success",
      message: "Xóa nhóm quyền thành công!"
    })
  }catch(error){
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!"
    })
  }
}