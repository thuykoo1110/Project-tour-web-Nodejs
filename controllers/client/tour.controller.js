const Tour = require("../../models/tour.model");
const Category = require('../../models/catagory.model')
const moment = require('moment')
const City = require('../../models/city.model')

module.exports.detail = async (req, res) => {
  const slug = req.params.slug;
  const tourDetail = await Tour
    .findOne({
      slug: slug,
      deleted: false,
      status: "active"
    })

  if(!tourDetail){
    res.redirect('/');
    return;
  }

   // Breadcrumb
  const breadcrumb = [];

  if(tourDetail.category) {
    const category = await Category
      .findOne({
        _id: tourDetail.category,
        deleted: false,
        status: "active"
      })

    if(category) {
      breadcrumb.push({
        name: category.name,
        slug: category.slug,
        avatar: category.avatar,
      });
    }
  }

  breadcrumb.push({
    name: tourDetail.name,
    slug: tourDetail.slug,
    avatar: tourDetail.avatar,
  });
  // End Breadcrumb

  // Format data tourDetail
  if(tourDetail.departureDate){
    tourDetail.departureDateFormat = moment(tourDetail.departureDate).format("DD/MM/YYYY");
  }
  
  if(tourDetail.locations){
    tourDetail.locationsDetail = await City.find({
      _id: { $in: tourDetail.locations }
    })
  }
  // End format data tourDetail

  res.render('client/pages/tour-detail', {
    pageTitle: tourDetail.name,
    breadCrumb: breadcrumb,
    tourDetail: tourDetail
  })
}
