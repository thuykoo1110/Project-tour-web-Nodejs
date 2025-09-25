const { default: slugify } = require('slugify');
const Contact =  require('../../models/contacts.model')
const moment = require('moment')
module.exports.list=async (req,res)=>{
  const find = {
    deleted: false
  }

  const dataFilter = {};
  if(req.query.startDate){
    const startDate = moment(req.query.startDate).toDate();
    dataFilter.$gte = startDate;
  }

  if(req.query.endDate){
    const endDate = moment(req.query.endDate).toDate();
    dataFilter.$lte = endDate;
  }

  if(Object.keys(dataFilter).length > 0){
    find.createdAt = dataFilter;
  }

  if(req.query.keyword){
    const keyword = slugify(req.query.keyword);
    const keywordRegex = new RegExp(keyword,"i");
    find.slug = keywordRegex;
  }

  const limitItems = 4;
  const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
  const skip = (page-1)*limitItems;
  const totalRecord = await Contact.countDocuments(find);
  const totalPage = Math.ceil(totalRecord/limitItems);
  const pagination = {
    skip:  skip,
    totalRecord: totalRecord,
    totalPage: totalPage
  }

  const contactList = await Contact
    .find(find)
    .sort({
      createdAt: "desc"
    })
    .limit(limitItems)
    .skip(skip)

  for(const item of contactList){
    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
  }
  res.render('admin/pages/contact-list',{
    pageTitle: "Thông tin liên hệ",
    contactList: contactList,
    pagination: pagination
  })
}

module.exports.changeMultiPatch = async(req,res) => {
  try{
    const { option, ids } = req.body;
    switch(option){
      case "delete":
        if(!req.permissions.includes("contact-edit")){
          res.json({
            code: "error",
            message: "Không có quyền!"
          })
        }
        await Contact.updateMany({
          _id: { $in: ids }
        },{
          deleted: true,
          deletedBy: req.account.id,
          deletedAt: Date.now()
        })
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
  }catch(error){
    res.json({
      code: "error",
      message: "Bản ghi không hợp lệ!"
    })
  }
}

module.exports.deletePatch = async(req,res) =>{
  try{
    if(!req.permissions.includes("contact-edit")){
      res.json({
        code: "error",
        message: "Không có quyền!"
      })
      return;
    }
    const id = req.params.id;
    await Contact.updateMany({
      _id: id
    },{
      deleted: true,
      deletedBy: req.account.id,
      deletedAt: Date.now()
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