const express = require('express') //nhúng thư viện/hàm vào file này (như import)
const mongoose = require('mongoose');
require('dotenv').config();
const app = express()
const path = require('path')
const port = 3000
const homeRouters = require('./routes/client/home.route');
const tourRouters = require("./routes/client/tour.route")
//kết nối database
mongoose.connect(process.env.DATABASE);


// Thiết lập thư mục chứa code giao diện (view)
// app.set('views', './views') //./views: views dỉrectory, local ổn nhưng đẩy lên onl thì ko
app.set('views', path.join(__dirname, "views"));
//Thiết lập template engine (vd Pug)
app.set('view engine', 'pug');

//Thiết lập thư mục chứa file tĩnh (static file)
app.use(express.static(path.join(__dirname, "public"))); //vì deploy onl lỗi nên mới có path join

app.use('/', homeRouters)

app.use('/tour', tourRouters) // chỉ use còn vào file con thì mới get
//'/tour':path cha
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

// caiphuongthuy1110 zYaFDpZqNNCGbXK5: mongodb database user
