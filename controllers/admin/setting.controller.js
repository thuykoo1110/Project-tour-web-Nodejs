const SettingwebsiteInfo = require("../../models/setting-website-info.model")
const { permissionList, pathAdmin } = require("../../config/variable.config")
const Role = require('../../models/roles.model')
const slugify = require('slugify')
const accountAdmin = require('../../models/account-admin.model')
const bcrypt=require("bcryptjs")
const moment = require('moment')

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
  const find = {
    deleted: false
  }

  if(req.query.status){
    find.status = req.query.status
  }

  const dataFilter={};
  if(req.query.startDate){
    const startDate = moment(req.query.startDate).toDate();
    dataFilter.$gte = startDate;
  }
  if(req.query.endDate){
    const endDate = moment(req.query.endDate).toDate();
    dataFilter.$lte = endDate;
  }
  if(Object.keys(dataFilter).length>0){
    find.createdAt=dataFilter;
  }

  if(req.query.keyword){
    const keyword = slugify(req.query.keyword);
    const keywordRegex = new RegExp(keyword, "i");
    find.slug = keywordRegex;
  }

  if(req.query.role){
    find.role = req.query.role;
  }

  // Phân trang
  const limitItems = 4;
  const page = parseInt(req.query.page) > 0? parseInt(req.query.page) : 1;

  const skip = (page-1)*limitItems;
  const totalRecord = await accountAdmin.countDocuments(find);
  const totalPage = Math.ceil(totalRecord/limitItems);
  const pagination = {
    skip: skip || 0,
    totalRecord: totalRecord || 0,
    totalPage: totalPage
  }
  const accountAdminList = await accountAdmin
    .find(find)
    .sort({
      createdAt: "desc"
    })
    .limit(limitItems)
    .skip(skip)

  for(const item of accountAdminList){
    if(item.role){
      const roleInfo = await Role.findOne({
        _id: item.role
      });
      if(roleInfo){
        item.roleName = roleInfo.name;
      }
    }
  }

  const roleList = await Role.find({
    deleted: false
  });

  res.render('admin/pages/setting-account-admin-list',{
    pageTitle: "Tài khoản quản trị",
    accountAdminList: accountAdminList,
    pagination: pagination,
    roleList: roleList
  })
}

module.exports.accountAdminCreate=async(req,res)=>{
  const roleList =  await Role.find({
    deleted: false
  })
  res.render('admin/pages/setting-account-admin-create',{
    pageTitle: "Tạo tài khoản quản trị",
    roleList: roleList
  })
}

module.exports.deleteAccountAdminPatch = async (req,res) => {
  try{
    const id = req.params.id;
    await accountAdmin.updateOne({
      _id:id
    },{
      deleted: true,
      deletedAt: Date.now(),
      deletedBy: req.account.id
    });

    res.json({
        code: "success",
        message: "Xóa danh mục thành công!"
      })
  }catch(error){
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!"
    })
  }
}
module.exports.accountAdminCreatePost = async(req,res) =>{
  try{
    const existAccount = await accountAdmin.findOne({
      email: req.body.email
    });

    if(existAccount){
      res.json({
        code: "error",
        message: "Email đã tồn tại trong hệ thống!"
      })
      return;
    }
    req.body.createdBy = req.account.id;
    req.body.updatedBy = req.account.id;
    req.body.avatar = (req.file)? req.file.path:"";

    //Mã hóa mât khẩu
    const salt = await bcrypt.genSaltSync(10);
    req.body.password = await bcrypt.hashSync(req.body.password, salt);

    const newAccount = new accountAdmin(req.body); //ghi data vào database
    await newAccount.save();  //await: để đơi lưu dữ liệu xong mới chạy xún bên dứi

    res.json({
      code: "success",
      message: "Tạo tài khoản thành công!"
    })
  }catch(error){
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}

module.exports.accountAdminEdit=async(req,res)=>{
  try{
    const id = req.params.id;

    const  accountDetail = await accountAdmin.findOne({
      _id: id,
      deleted: false
    })

    if(!accountDetail){
      res.redirect(`/${pathAdmin}/setting/account-admin/list`);
      return;
    }

    const roleList =  await Role.find({
      deleted: false
    })
    res.render('admin/pages/setting-account-admin-edit',{
      pageTitle: "Chỉnh sửa tài khoản quản trị",
      roleList: roleList,
      accountDetail: accountDetail
    })
  }catch(error){
    res.redirect(`/${pathAdmin}/setting/account-admin/list`);
  }
}

module.exports.accountAdminEditPatch=async(req,res)=>{
  try{
    const id = req.params.id;

    const  accountDetail = await accountAdmin.findOne({
      _id: id,
      deleted: false
    })

    if(!accountDetail){
      res.json({
        code: "error",
        message: "Bản ghi không tồn tại!"
      })
      return;
    }
    
    const existEmail = await accountAdmin.findOne({
      _id: { $ne: id }, //$ne: not equal
      email: req.body.email
    }) // tìm bản ghi có id khác mà trùng email vs req.body.email

    if(existEmail){
      res.json({
        code: "error",
        message: "Email đã tồn tại!"
      })
      return;
    }

    if(req.body.password){
      //Mã hóa mât khẩu
      const salt = await bcrypt.genSaltSync(10);
      req.body.password = await bcrypt.hashSync(req.body.password, salt);
    }else{
      delete req.body.password;
    }

    req.body.updatedBy = req.account.id;
    if(req.file){
      req.body.avatar = req.file.path;
    }
    else{
      delete req.body.avatar;
    }

    await accountAdmin.updateOne({
      _id: id,
      deleted: false
    },req.body);
    
    res.json({
      code: "success",
      message: "Cập nhật tài khoản thành công!"
    })
  }catch(error){
    res.json({
      code: "error",
      message: "Tài khoản không hợp lệ!"
    })
  }
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

module.exports.roleEdit = async(req,res) => {
  try{
    const id =req.params.id;

    const roleDetail = await Role.findOne({
      _id: id,
      deleted: false
    });

    if(!roleDetail){
      res.redirect(`/${pathAdmin}/setting/role/list`);
      return;
    }
    res.render('admin/pages/setting-role-edit',{
      pageTitle: "Chỉnh sửa nhóm quyền",
      permissionList: permissionList,
      roleDetail: roleDetail
    })
  }catch(error){
    res.redirect(`/${pathAdmin}/setting/role/list`);
  }
}


module.exports.roleEditPatch = async(req,res) => {
  try{
    const id =req.params.id;

    const roleDetail = await Role.findOne({
      _id: id,
      deleted: false
    });

    if(!roleDetail){
      res.json({
        code: "error",
        message: "Bản ghi không tồn tại!"
      });
      return;
    }
    
    req.body.updatedBy = req.account.id;
    await Role.updateOne({
      _id: id,
      deleted: false
    }, req.body);

    res.json({
      code: "success",
      message: "Cập nhật nhóm quyền thành công!"
    })
  }catch(error){
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}

module.exports.accountAdminChangeMulti = async(req,res) => {
  try{
    const { option, ids } = req.body;
    switch(option){
      case "active":
      case "inactive":
      case "initial":
        await accountAdmin.updateMany({
          _id: { $in: ids}
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
        });
        break;
    }
  }catch(error){
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!"
    })
  }
}