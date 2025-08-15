module.exports.home = (req, res) => {
    res.render('client/pages/home', {
        pageTitle: 'Trang chủ'
    }) //convert pug file to html
}