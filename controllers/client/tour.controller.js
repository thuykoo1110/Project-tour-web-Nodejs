const Tour = require("../../models/tour.model");
module.exports.list = async (req, res) => {
    const tourList = await Tour.find({}); //lấy document trong collections tours
    // console.log(tourList);
    res.render('client/pages/tour-list', {
        pageTitle: 'Danh sách tour',
        tourList: tourList
    })

    res.render('client/pages/tour-detail', {
        pageTitle: 'Chi tiết tour'
    })
}