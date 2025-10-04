const moment = require('moment')
const Tour = require('../../models/tour.model')
const City = require('../../models/city.model')

module.exports.cart=async (req,res)=>{
  res.render('client/pages/cart',{
    pageTitle:'Giỏ hàng'
  })
}

module.exports.detail = async(req,res) => {
  try{
    const cart = req.body;
    const cartDetail =  [];

    for(const item of cart){
      const tourInfo = await Tour.findOne({
        deleted: false,
        status: "active",
        _id: item.tourId
      });
      if(tourInfo){
        const cityInfo = await City.findOne({
          _id: item.locationFrom
        })
        cartDetail.push({
          tourId: item.tourId,
          locationFrom: item.locationFrom,
          quantityAdult: item.quantityAdult,
          quantityChildren: item.quantityChildren,
          quantityBaby: item.quantityBaby,
          avatar: tourInfo.avatar,
          checked: item.checked,
          name: tourInfo.name,
          departureDate: moment(tourInfo.departureDate).format("DD/MM/YYYY"),
          cityName: cityInfo.name,
          stockAdult: tourInfo.stockAdult,
          stockChildren: tourInfo.stockChildren,
          stockBaby: tourInfo.stockBaby,
          priceNewAdult: tourInfo.priceNewAdult,
          priceNewChildren: tourInfo.priceNewChildren,
          priceNewBaby: tourInfo.priceNewBaby,
          slug: tourInfo.slug
        })
      }
    }
    res.json({
      code: "success",
      cart: cartDetail
    })
  }catch(error){
    res.json({
      code: "error",
      message: "Thất bại!"
    })
  }
}