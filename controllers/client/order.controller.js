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
const axios = require('axios').default;
const CryptoJS = require('crypto-js');

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

module.exports.paymentZaloPay = async(req, res) => {
  const { orderCode, phone } = req.query;

  const orderDetail = await Order.findOne({
    code: orderCode,
    phone: phone
  })

  if(!orderDetail){
    res.redirect('/');
    return;
  }

  const config = {
    app_id: process.env.ZALOPAY_APPID,
    key1: process.env.ZALOPAY_KEY1,
    key2: process.env.ZALOPAY_KEY2,
    endpoint: `${process.env.ZALOPAY_DOMAIN}/v2/create`
  };

  const embed_data = {
    redirecturl: `${process.env.WEBSITE_DOMAIN}/order/success?orderCode=${orderCode}&phone=${phone}`
  };

  const items = [{}];
  const transID = Math.floor(Math.random() * 1000000);
  const order = {
      app_id: config.app_id,
      app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
      app_user: `${phone}-${orderCode}`,
      app_time: Date.now(), // miliseconds
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: orderDetail.total,
      description: `Thanh toán đơn hàng #${orderCode}`,
      bank_code: "",
      callback_url: `${process.env.WEBSITE_DOMAIN}/order/payment-zalopay-result`
  };

  // appid|app_trans_id|appuser|amount|apptime|embeddata|item
  const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
  order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

  const response = await axios.post(config.endpoint, null, { params: order });
  if(response.data.return_code == 1){
    res.redirect(response.data.order_url);
  }
}

module.exports.paymentZaloPayResultPost = async(req, res) => {
  const config = {
    key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf"
  };
  let result = {};

  try {
    let dataStr = req.body.data;
    let reqMac = req.body.mac;

    let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();

    // kiểm tra callback hợp lệ (đến từ ZaloPay server)
    if (reqMac !== mac) {
      // callback không hợp lệ
      result.return_code = -1;
      result.return_message = "mac not equal";
    }
    else {
      // thanh toán thành công
      // merchant cập nhật trạng thái cho đơn hàng
      let dataJson = JSON.parse(dataStr, config.key2);
      const [phone, orderCode] = dataJson.app_user.split("-");
      await Order.updateOne({
        phone: phone,
        code: orderCode
      }, {
        paymentStatus: "paid"
      })

      result.return_code = 1;
      result.return_message = "success";
    }
  } catch (ex) {
    result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
    result.return_message = ex.message;
  }

  res.json(result);

}