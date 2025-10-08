const Order = require('../../models/order.model')
const Tour =  require('../../models/tour.model')
const {
  paymentStatusList,
  paymentMethodList,
  statusList,
  pathAdmin
} = require('../../config/variable.config')
const moment = require('moment')
const City = require('../../models/city.model')

module.exports.list=async(req,res)=>{
  const find = {
    deleted:  false
  };

  if(req.query.status){
    find.status = req.query.status;
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
    const keyRegex = new RegExp(keyword, "i");
    find.slug = keyRegex;
  }

  if(req.query.method){
    find.paymentMethod = req.query.method;
  }

  if(req.query.paymentStatus){
    find.paymentStatus = req.query.paymentStatus;
  }

  const limitItems = 8;
  const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
  const skip = (page-1)*limitItems;
  const totalRecord = await Order.countDocuments(find);
  const totalPage = Math.ceil(totalRecord/limitItems);
  const pagination = {
    skip: skip,
    totalPage: totalPage,
    totalRecord: totalRecord
  }

  const orderList = await Order
    .find(find)
    .sort({
      createdAt: "desc"
    })
    .skip(skip)
    .limit(limitItems)

  for(const orderDetail of orderList){
    orderDetail.paymentMethodName = paymentMethodList.find(item => item.value == orderDetail.paymentMethod).label;
    orderDetail.paymentStatusName = paymentStatusList.find(item => item.value == orderDetail.paymentStatus).label;
    orderDetail.statusInfo= statusList.find(item => item.value == orderDetail.status);
    orderDetail.createdAtTime = moment(orderDetail.createdAt).format("HH:mm");
    orderDetail.createdAtDate = moment(orderDetail.createdAt).format("DD/MM/YYYY");
    for(const item of orderDetail.items){
      const tourInfo = await Tour.findOne({
        _id: item.tourId
      })
      if(tourInfo){
        item.avatar = tourInfo.avatar;
        item.name = tourInfo.name;
      }
    }
  }
  res.render('admin/pages/order-list',{
    pageTitle: "Danh sách đơn",
    orderList: orderList ,
    pagination: pagination
  })
}
module.exports.edit=async(req,res)=>{
  try{
    const id = req.params.id;

    const orderDetail = await Order.findOne({
      _id: id,
      deleted: false
    })

    if(!orderDetail){
      res.redirect(`/${pathAdmin}/order/list`);
      return;
    }
    orderDetail.createdAtFormat = moment(orderDetail.createdAt).format("YYYY-MM-DDTHH:mm");

    for(const item of orderDetail.items){
      const tourInfo = await Tour.findOne({
        _id: item.tourId
      })
      if(tourInfo){
        item.avatar = tourInfo.avatar;
        item.name = tourInfo.name;
        item.departureDateFormat = moment(tourInfo.departureDateFormat).format("DD/MM/YYYY");
        const city = await City.findOne({
          _id: item.locationFrom
        })
        item.cityName = city.name;
      }
    }
    res.render('admin/pages/order-edit',{
      pageTitle: `Đơn hàng ${orderDetail.code}`,
      orderDetail: orderDetail,
      paymentMethodList: paymentMethodList,
      paymentStatusList: paymentStatusList,
      statusList: statusList
    })
  }
  catch(error){
    console.log(error)
    res.redirect(`/${pathAdmin}/order/list`)
  }
}

module.exports.deletePatch = async(req,res) =>{
  try{
    if(!req.permissions.includes("order-edit")){
      res.json({
        code: "error",
        message: "Không có quyền!"
      })
      return;
    }
    const id = req.params.id;
    await Order.updateOne({
      _id: id
    },{
      deleted: true,
      deletedBy: req.account.id,
      deletedAt: Date.now()
    })

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

module.exports.editPatch = async(req,res) => {
  try{
    const id = req.params.id;

    await Order.updateOne({
      _id: id,
      deleted: false
    }, req.body);
    
    res.json({
      code: "success",
      message: "Cập nhật thành công!"
    })
  } catch(error){
    res.json({
      code: "error",
      message: "Cập nhật thất bại!"
    })
  }
}