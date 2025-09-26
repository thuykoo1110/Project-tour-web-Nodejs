const City = require('../../models/city.model')
const Tour = require('../../models/tour.model')
const moment = require('moment')
const slugify = require('slugify')

module.exports.list = async (req, res) =>{
  try{
    // City List
    const cityList = await City
      .find({})
      .sort({
        name: "asc"
      })
    // End City List
    const find = {
      status: "active",
      deleted: false
    }

    // Điểm đi
    if(req.query.locationFrom){
      find.locations = req.query.locationFrom;
    }
    // Hết điểm đi
    // Ngày khởi hành
    if(req.query.departureDate){
      const departureDate = new Date(req.query.departureDate)
      find.departureDate = departureDate;
    }
    // Hết ngày khởi hành
    // Điểm đến
    if(req.query.locationTo){
      const locationTo = slugify(req.query.locationTo);
      const locationToRegex = RegExp(locationTo,"i");
      find.slug = locationToRegex;
    }
    // Hết điểm đến

    // Số lượng hành khách
    // Adult
    if(req.query.stockAdult){
      find.stockAdult = {
        $gte: parseInt(req.query.stockAdult)
      }
    }
    // Children
    if(req.query.stockChildren){
      find.stockChildren = {
        $gte: parseInt(req.query.stockChildren)
      }
    }
    // Baby
    if(req.query.stockBaby){
      find.stockBaby = {
        $gte: parseInt(req.query.stockBaby)
      }
    }
    // Hết Số lượng hành khách

    // Price
    if(req.query.price){
      const [priceMin, priceMax] = req.query.price.split("-").map(item => parseInt(item));
      find.priceNewAdult = {
        $gte: priceMin,
        $lte: priceMax
      };
    }
    // End price
    const tourList = await Tour
      .find(find)
      .sort({
        position: "desc"
      })

    for(const item of tourList){
      item.discount = Math.floor(((item.priceAdult - item.priceNewAdult) / item.priceAdult)*100);
      if(item.departureDate){
        item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
      }
    }
    res.render('client/pages/search',{
      pageTitle: 'Kết quả tìm kiếm',
      cityList: cityList,
      tourList: tourList
    })
  }catch(error){
    res.redirect('/');
  }
  
}