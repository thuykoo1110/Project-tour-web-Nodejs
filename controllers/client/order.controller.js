const generateRandomNum = require('../../helpers/generate.helper')
const Tour = require('../../models/tour.model')
const Order = require('../../models/order.model')
const {
  paymentStatusList,
  paymentMethodList,
  statusList
} = require('../../config/variable.config')
const moment = require('moment')
const City = require('../../models/city.model')

module.exports.createPost = async (req, res) =>{
  try{
    // mã đơn hàng
    req.body.code = "OD" + generateRandomNum.getRandomNumber(10);
    // end mã đơn hàng

    // Tạm tính
    req.body.subTotal = 0;
    // Danh sách tour
    for(const item of req.body.items){
      const info = await Tour.findOne({
        _id: item.tourId,
        deleted: false,
        status: "active"
      });
      if(info){
        // Thêm giá
        item.priceNewAdult = info.priceNewAdult;
        item.priceNewChildren = info.priceNewChildren;
        item.priceNewBaby = info.priceNewBaby;
        // Thêm ngày khởi hành
        item.departureDate = info.departureDate;

        // Tạm tính
        req.body.subTotal += (item.priceNewAdult * item.quantityAdult + item.priceNewChildren * item.quantityChildren + item.priceNewBaby * item.quantityBaby);
        // Cập nhật lại số lượng còn lại trong db
        await Tour.updateOne({
          _id: item.tourId
        },{
          stockAdult: info.stockAdult - item.quantityAdult,
          stockChildren: info.stockChildren - item.quantityChildren,
          stockBaby: info.stockBaby - item.quantityBaby
        })
      }
    }
    // Hết Danh sách tour

    // Thanh toán
    // Giảm giá
    req.body.discount = 0;

    // Tổng tiền
    req.body.total = req.body.subTotal - req.body.discount;
    // Hết thanh toán

    // Trạng thái thanh toán
    req.body.paymentStatus = "unpaid";

    // Trạng thái đơn hàng
    req.body.status = "initial";
    // Hết Trạng thái đơn hàng

    const newRecord = new Order(req.body);
    await newRecord.save();
    res.json({
      code: "success",
      message: "Chúc mừng bạn đã đặt hàng thành công!",
      orderCode: req.body.code
    })
  }catch(error){
    console.log(error)
    res.json({
      code: "error",
      message: "Đặt hàng không thành công!"
    })
  }
}

module.exports.success = async(req, res) => {
  const { orderCode, phone } = req.query;
  const orderDetail = await Order.findOne({
    code: orderCode,
    phone: phone
  })

  if(!orderDetail){
    res.redirect("/");
    return;
  }

  orderDetail.paymentMethodName = paymentMethodList.find(item => item.value == orderDetail.paymentMethod).label;
  orderDetail.paymentStatusName = paymentStatusList.find(item => item.value == orderDetail.paymentStatus).label;
  orderDetail.statusName = statusList.find(item => item.value == orderDetail.status).label;

  orderDetail.createdAtFormat = moment(orderDetail.createdAt).format("HH:mm - DD/MM/YYYY");

  for(const item of orderDetail.items){
    const tourInfo = await Tour.findOne({
      _id: item.tourId
    })
    if(tourInfo){
      item.avatar = tourInfo.avatar;
      item.name = tourInfo.name;
      item.slug = tourInfo.slug;
      item.departureDateFormat = moment(tourInfo.departureDate).format("DD/MM/YYYY");
      const city = await City.findOne({
        _id: item.locationFrom
      })
      item.cityName = city.name;
    }
  }
  res.render("client/pages/order-success",{
    pageTitle: "Đặt hàng thành công",
    orderDetail: orderDetail
  })
}