const Category = require('../../models/catagory.model')
const categoryHelper = require('../../helpers/category.helper')
const Tour = require('../../models/tour.model')
const moment = require('moment')
const City = require('../../models/city.model')

module.exports.list = async(req,res) => {
  const slug = req.params.slug;
  const categoryDetail = await Category
    .findOne({
      slug: slug,
      deleted: false,
      status: "active"
    })

  if(!categoryDetail){
    res.redirect('/');
    return;
  }

  // Breadcrumb
  const breadCrumb = [];
  
  if(categoryDetail.parent){
    const categoryParent = await Category.findOne({
      _id: categoryDetail.parent,
      deleted: false,
      status: "active"
    })

    if(categoryParent){
      breadCrumb.push({
        name: categoryParent.name,
        slug: categoryParent.slug,
        avatar: categoryParent.avatar
      });
    }
  }
  breadCrumb.push({
    name: categoryDetail.name,
    slug: categoryDetail.slug,
    avatar: categoryDetail.avatar
  });
  // End Breadcurmb

  // Tour list in category
  const categoryId = categoryDetail.id;
  const categoryChild = await categoryHelper.getCategoryChild(categoryId);
  const categoryChildId = categoryChild.map(item => item.id);
  const find = {
    category: { $in: [ categoryId, ...categoryChildId]},
    deleted: false,
    status: "active"
  }

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

  // End tour list  in caategory
  const totalTour = await Tour.countDocuments(find);
  // city list in filter
  const cityList = await City
    .find({})
    .sort({
      name: "asc"
    })
  // End city list

  // End Pagination
  res.render('client/pages/tour-list',{
    pageTitle: categoryDetail.name,
    breadCrumb: breadCrumb,
    categoryDetail: categoryDetail,
    tourList: tourList,
    cityList: cityList,
    totalTour: totalTour,
    pagination: pagination
  })
}