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

    // Pagination
    const limitItems = 8;
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const skip = (page-1)*limitItems;
    const totalRecord = await Tour.countDocuments(find);
    const totalPage = Math.ceil(totalRecord/limitItems);
    const pagination = {
      skip: skip || 0,
      totalRecord: totalRecord || 0,
      totalPage: totalPage || 1,
      currentPage: page
    }
    // ENd pagination
    const tourList = await Tour
      .find(find)
      .limit(limitItems)
      .skip(skip)

    for(const item of tourList){
      item.discount = Math.floor(((item.priceAdult - item.priceNewAdult) / item.priceAdult)*100);
      if(item.departureDate){
        item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
      }
    }
    // Sắp xếp
    if (req.query.sort) {
      switch (req.query.sort) {
        case "price-asc":
          tourList.sort((a, b) => a.priceNewAdult - b.priceNewAdult);
          break;
        case "price-desc":
          tourList.sort((a, b) => b.priceNewAdult - a.priceNewAdult);
          break;
        case "hot-sale":
          tourList.sort((a, b) => b.discount - a.discount);
          break;
        default:
          tourList.sort((a, b) => b.position - a.position); // nếu có field position
          break;
      }
    }
    // Hết sắp xếp
    
    
    const totalTour = await Tour.countDocuments(find);
    res.render('client/pages/search',{
      pageTitle: 'Kết quả tìm kiếm',
      cityList: cityList,
      tourList: tourList,
      totalTour: totalTour,
      pagination: pagination
    })
  }catch(error){
    console.log(error)
    res.redirect('/');
  }
  
}