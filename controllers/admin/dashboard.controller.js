const AccountAdmin = require('../../models/account-admin.model')
const Order = require('../../models/order.model')
const {
  paymentStatusList,
  paymentMethodList,
  statusList,
  pathAdmin
} = require('../../config/variable.config')
const Tour = require('../../models/tour.model')
const moment = require('moment')

module.exports.dashboard=async (req,res)=>{
  // thông số tổng quan
  const overview = {
    totalAdmin: 0,
    totalOrder: 0,
    totalRevenue: 0
  }

  overview.totalAdmin = await AccountAdmin.countDocuments({
    deleted: false
  })

  let orderList = await Order.find({
    deleted: false
  })
  overview.totalOrder = orderList.length;
  overview.totalRevenue = orderList.reduce((total,item) => total + item.total,0);
  
  orderList = await Order
    .find({
      deleted: false
    })
    .limit(10)
    .sort({
      createdAt: "desc"
    })
  
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
  // End thông số tổng quan
  res.render('admin/pages/dashboard',{
    pageTitle: "Dashboard",
    overview: overview,
    orderList: orderList
  })
}

module.exports.revenueChart = async(req, res) =>{
  const { currentMonth, currentYear, previousMonth, previousYear, arrayDays } = req.body;

  // truy vấn đơn hàng trong tháng hiện tại
  const orderCurrentMonth = await Order.find({
    deleted: false,
    createdAt: {
      $gte: new Date(currentYear, currentMonth - 1, 1),
      $lt: new Date(currentYear, currentMonth, 1)
    }
  })

  // truy vấn đơn hàng trong tháng trước
  const orderPrevioustMonth = await Order.find({
    deleted: false,
    createdAt: {
      $gte: new Date(previousYear, previousMonth - 1, 1),
      $lt: new Date(previousYear, previousMonth, 1)
    }
  })

  // Tạo mảng doanh thu theo từng ngày
  const dataMonthCurrent = [];
  const dataMonthPrevious = [];
  for(const day of arrayDays){
    // doanh thu theo ngày của tháng hiện tại
    let revenueCurrent = 0;
    for(const order of orderCurrentMonth){
      const orderDate = new Date(order.createdAt).getDate();
      if(orderDate == day){
        revenueCurrent += order.total;
      }
    }
    dataMonthCurrent.push(revenueCurrent);
    // doanh thu theo ngày của tháng trước
    let revenuePrevious = 0;
    for(const order of orderPrevioustMonth){
      const orderDate = new Date(order.createdAt).getDate();
      if(orderDate == day){
        revenuePrevious += order.total;
      }
    }
    dataMonthPrevious.push(revenuePrevious);
  }

  res.json({
    code: "success",
    message: "Thành công",
    dataMonthCurrent: dataMonthCurrent,
    dataMonthPrevious: dataMonthPrevious
  })
}