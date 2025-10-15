const moment = require('moment')
const Tour = require("../../models/tour.model")
const Category = require('../../models/catagory.model')
const categoryHelper = require('../../helpers/category.helper')
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

  // Section 4
  const categoryIdSection4 = res.locals.settingWebsiteInfo.dataSection4;
  const categoryChildrenSection4 = await categoryHelper.getCategoryChild(categoryIdSection4); //vì là hàm async nên có await
  const categoryChildIdSection4 = categoryChildrenSection4.map(item => item.id);
  const categorySection4 = await Category
    .findOne({
      _id: categoryIdSection4,
      deleted: false,
      status: "active"
    })
  let tourListSection4 = [];
  if(categorySection4){
    tourListSection4 = await Tour
    .find({
      category: { $in: [ categoryIdSection4, ...categoryChildIdSection4 ]},
      deleted: false,
      status: "active"
    })
    .sort({
      position: "desc"
    })
    .limit(8)

    for(const item of tourListSection4){
      item.discount = Math.floor(((item.priceAdult - item.priceNewAdult) / item.priceAdult)*100);
      if(item.departureDate){
        item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
      }
    }
  }
  // End Section 4

  // Section 6 - tour nuoc ngoai
  const categoryIdSection6 = res.locals.settingWebsiteInfo.dataSection6;
  const categoryChildrenSection6 = await categoryHelper.getCategoryChild(categoryIdSection6); //vì là hàm async nên có await
  const categoryChildIdSection6 = categoryChildrenSection6.map(item => item.id);
  const categorySection6 = await Category
    .findOne({
      _id: categoryIdSection6,
      deleted: false,
      status: "active"
    })
  let tourListSection6 = [];
  if(categorySection6){
    tourListSection6 = await Tour
    .find({
      category: { $in: [ categoryIdSection6, ...categoryChildIdSection6 ]},
      deleted: false,
      status: "active"
    })
    .sort({
      position: "desc"
    })
    .limit(8)

    for(const item of tourListSection6){
      item.discount = Math.floor(((item.priceAdult - item.priceNewAdult) / item.priceAdult)*100);
      if(item.departureDate){
        item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
      }
    }
  }
  // End section 6
  res.render('client/pages/home', {
      pageTitle: 'Trang chủ',
      tourListSection2: tourListSection2,
      tourListSection4: tourListSection4,
      categorySection4: categorySection4,
      categorySection6: categorySection6,
      tourListSection6: tourListSection6
  }) 
}