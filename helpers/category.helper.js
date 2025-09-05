const buildCategoryTree = (categoryList, parentID="") => {
  const tree = [];

  categoryList.forEach(item => {
    if(item.parent === parentID){
      const children = buildCategoryTree(categoryList, item.id);

      tree.push({
        id: item.id,
        name: item.name,
        children: children
      });
    }
  });
  return tree;
}

module.exports.buildCategoryTree = buildCategoryTree