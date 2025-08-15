const express = require('express') //nhúng thư viện/hàm vào file này (như import)
const mongoose = require('mongoose');
require('dotenv').config()
const app = express()
const path = require('path')
const port = 3000

//kết nối database
mongoose.connect(process.env.DATABASE);

const Tour = mongoose.model('Tour',
    {
        name: String,
        vehicle: String
    },
    "tours"
);

// Thiết lập thư mục chứa code giao diện (view)
// app.set('views', './views') //./views: views dỉrectory, local ổn nhưng đẩy lên onl thì ko
app.set('views', path.join(__dirname, "views"));
//Thiết lập template engine (vd Pug)
app.set('view engine', 'pug');

//Thiết lập thư mục chứa file tĩnh (static file)
app.use(express.static(path.join(__dirname, "public"))); //vì deploy onl lỗi nên mới có path join
app.get('/', (req, res) => {
    res.render('client/pages/home', {
        pageTitle: 'Trang chủ'
    }) //convert pug file to html
}) //'/'-trang chủ

app.get('/tour', async (req, res) => {
    const tourList = await Tour.find({});
    // console.log(tourList);
    res.render('client/pages/tour-list', {
        pageTitle: 'Danh sách tour',
        tourList: tourList
    })
}) //app.get(path, callback)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

// caiphuongthuy1110 zYaFDpZqNNCGbXK5: mongodb database user
