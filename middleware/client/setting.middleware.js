const SettingWebsiteInfo = require('../../models/setting-website-info.model')

module.exports.webisiteInfo = async(req, res, next) =>{
  const settingWebsiteInfo = await SettingWebsiteInfo.findOne({});
  res.locals.settingWebsiteInfo = settingWebsiteInfo; 
  next();
}