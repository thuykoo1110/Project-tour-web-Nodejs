module.exports.edit=async(req,res)=>{
  res.render('admin/pages/profile-edit',{
    pageTitle: "Sửa profile"
  })
}

module.exports.changePassword=async(req,res)=>{
  res.render('admin/pages/profile-change-password',{
    pageTitle: "Thay đổi mật khẩu profile"
  })
}