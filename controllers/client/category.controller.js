const Category = require('../../models/catagory.model')

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
  res.render('client/pages/tour-list',{
    pageTitle: categoryDetail.name,
    breadCrumb: breadCrumb
  })
}