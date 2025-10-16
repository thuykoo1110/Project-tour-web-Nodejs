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
const { sortObject } = require('../../helpers/sort.helper')
const https = require('https')
const crypto = require('crypto');

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

module.exports.paymentVNPay = async(req, res) => {
  const { orderCode, phone } = req.query;
  
  const orderDetail = await Order.findOne({
    code: orderCode,
    phone: phone
  })
  if(!orderDetail){
    res.redirect('/');
    return;
  }

  let date = new Date();
  let createDate = moment(date).utcOffset(7).format('YYYYMMDDHHmmss');
  
  let ipAddr = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

  
  let tmnCode = process.env.VNPAY_TMNCODE
  let secretKey = process.env.VNPAY_SECRET_KEY
  let vnpUrl = process.env.VNPAY_URL
  let returnUrl = `${process.env.WEBSITE_DOMAIN}/order/payment-vnpay-result`
  let orderId = `${phone}-${orderCode}-${Date.now()}`
  let amount = orderDetail.total;
  let bankCode = "";
  
  let locale = "vn";
  if(locale === null || locale === ''){
      locale = 'vn';
  }
  let currCode = 'VND';
  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = locale;
  vnp_Params['vnp_CurrCode'] = currCode;
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = amount * 100;
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;
  if(bankCode !== null && bankCode !== ''){
      vnp_Params['vnp_BankCode'] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  let querystring = require('qs');
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let crypto = require("crypto");     
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
  vnp_Params['vnp_SecureHash'] = signed;
  vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

  res.redirect(vnpUrl)
}

module.exports.paymentVNPayResult =  async(req, res) => {
  let vnp_Params = req.query;

  let secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);

  let secretKey = process.env.VNPAY_SECRET_KEY

  let querystring = require('qs');
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let crypto = require("crypto");     
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");     

  if(secureHash === signed){
    if(vnp_Params['vnp_TransactionStatus'] == "00" && vnp_Params['vnp_ResponseCode'] == "00") {
      const [phone, orderCode] = vnp_Params['vnp_TxnRef'].split("-");
      await Order.updateOne({
        phone: phone,
        code: orderCode
      }, {
        paymentStatus: "paid"
      })

      res.redirect(`${process.env.WEBSITE_DOMAIN}/order/success?orderCode=${orderCode}&phone=${phone}`);
    }
  } else{
    res.redirect('/')
  }
}

module.exports.paymentMomo = async(req, res) => {
  try {
    const { orderCode, phone } = req.query;

    const orderDetail = await Order.findOne({
      code: orderCode,
      phone: phone
    })

    if(!orderDetail){
      res.redirect('/');
      return;
    }
    const accessKey = 'F8BBA842ECF85';
    const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    const partnerCode = 'MOMO';
    const requestType = 'payWithATM';
    const redirectUrl = `${process.env.WEBSITE_DOMAIN}/order/success?orderCode=${orderCode}&phone=${phone}`;
    const ipnUrl = `${process.env.WEBSITE_DOMAIN}/order/momo-ipn`;
    const amount = orderDetail.total;
    const orderInfo = `Thanh toán MoMo cho đơn hàng ${orderCode}`;
    const orderId = `${phone}-${orderCode}-${Date.now()}`
    const requestId = orderId;
    const extraData = ''; // có thể encode base64 nếu muốn gửi thêm thông tin

    // Tạo chữ ký HMAC SHA256
    const rawSignature =
      `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto.createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = JSON.stringify({
      partnerCode,
      partnerName: "MyShop",
      storeId: "MomoTestStore",
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      requestType,
      extraData,
      signature,
    });

    // Gửi request đến MoMo
    const options = {
      hostname: 'test-payment.momo.vn',
      port: 443,
      path: '/v2/gateway/api/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };

    const momoReq = https.request(options, momoRes => {
      let data = '';
      momoRes.on('data', chunk => data += chunk);
      momoRes.on('end', () => {
        const result = JSON.parse(data);

        if (result && result.payUrl) {
          //  Chuyển hướng người dùng sang trang thanh toán MoMo
          res.redirect(result.payUrl);
        } else {
          res.status(400).json({ message: 'Không nhận được payUrl từ MoMo', result });
        }
      });
    });

    momoReq.on('error', e => {
      console.error(e);
      res.status(500).json({ message: 'Lỗi kết nối MoMo', error: e.message });
    });

    momoReq.write(requestBody);
    momoReq.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports.momoResult = async(req, res)  => {
  try {
    const data = req.body;

    const {
      amount, orderId, orderInfo, orderType, partnerCode, requestId,
      responseTime, resultCode, transId, message, payType, extraData
    } = data;

    //Tạo chữ ký để kiểm tra
    const accessKey = 'F8BBA842ECF85';
    const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&message=${message}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&orderType=${orderType}` +
      `&partnerCode=${partnerCode}` +
      `&payType=${payType}` +
      `&requestId=${requestId}` +
      `&responseTime=${responseTime}` +
      `&resultCode=${resultCode}` +
      `&transId=${transId}`;

    const signature = crypto.createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    // Kiểm tra chữ ký
    if (signature !== data.signature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    // Xử lý kết quả thanh toán
    if (parseInt(resultCode) === 0) {
      const orderIdParts = orderId.split("-");
      const phone = orderIdParts[0];
      const orderCode = orderIdParts[1];
      await Order.updateOne(
        { phone: phone, code: orderCode },
        { paymentStatus: "paid" }
      );
    }
    // Bắt buộc trả 200 OK cho MoMo, để họ không gửi lại
    res.status(200).json({ message: 'Received IPN' });

  } catch (error) {
    console.error('Lỗi xử lý IPN:', error);
    res.status(500).json({ message: 'Server Error' });
  }
}