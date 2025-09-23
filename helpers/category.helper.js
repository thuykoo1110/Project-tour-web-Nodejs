const category = require("../models/catagory.model");

const buildCategoryTree = (categoryList, parentID="") => {
  const tree = [];

  categoryList.forEach(item => {
    if(item.parent === parentID){
      const children = buildCategoryTree(categoryList, item.id);

      tree.push({
        id: item.id,
        name: item.name,
        children: children,
        slug: item.slug
      });
    }
  });
  return tree;
}

module.exports.buildCategoryTree = buildCategoryTree

// getCategoryChild
const getCategoryChild = async (parentId) =>{
  const result = [];

  const childrenList = await category
    .find({
      status: "active",
      deleted: false,
      parent: parentId
    })
  
  for(const item of childrenList){
    result.push({
      id: item.id,
      name: item.name
    })

    await getCategoryChild(item.id);
  };
  return result;
}
module.exports.getCategoryChild = getCategoryChild
// End getCategoryChild 