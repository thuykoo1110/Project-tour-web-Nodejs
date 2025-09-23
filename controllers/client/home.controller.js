const moment = require('moment')
const Tour = require("../../models/tour.model")

module.exports.home = async (req, res) => {
  // Section 2
  const tourListSection2 = await Tour
    .find({
      deleted: false,
      status: "active",
      featured:  true
    })
    .sort({
      position: "desc"
    })
    .limit(6)

    for(const item of tourListSection2){
      item.discount = Math.floor(((item.priceAdult - item.priceNewAdult) / item.priceAdult)*100);
      if(item.departureDate){
        item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
      }
    }
  // End Section 2
  res.render('client/pages/home', {
      pageTitle: 'Trang chủ',
      tourListSection2: tourListSection2
  }) 
}