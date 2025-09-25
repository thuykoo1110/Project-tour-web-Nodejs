const Category = require('../../models/catagory.model')
const categoryHelper = require('../../helpers/category.helper')
const Tour = require('../../models/tour.model')
const moment = require('moment')

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
  const categoryChildId = await categoryChild.map(item => item.id);

  const tourList = await Tour
    .find({
      category: { $in: [ categoryId, ...categoryChildId]},
      deleted: false,
      status: "active"
    })
    .sort({
      position: "desc"
    })
    .limit(8)
  
  for(const item of tourList){
    item.discount = Math.floor(((item.priceAdult - item.priceNewAdult) / item.priceAdult)*100);
    if(item.departureDate){
      item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
    }
  }
  // End tour list  in caategory
  res.render('client/pages/tour-list',{
    pageTitle: categoryDetail.name,
    breadCrumb: breadCrumb,
    categoryDetail: categoryDetail,
    tourList: tourList
  })
}