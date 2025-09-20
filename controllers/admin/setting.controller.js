const SettingwebsiteInfo = require("../../models/setting-website-info.model")

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
  res.render('admin/pages/setting-role-list',{
    pageTitle: "Nhóm quyền"
  })
}

module.exports.roleCreate=async(req,res)=>{
  res.render('admin/pages/setting-role-create',{
    pageTitle: "Tạo nhóm quyền"
  })
}