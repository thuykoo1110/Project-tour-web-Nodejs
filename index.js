const express = require('express') //nhúng thư viện/hàm vào file này (như import)
const mongoose = require('mongoose');
require('dotenv').config();
const app = express()
const path = require('path')
const port = 3000
const clientRoutes = require("./routes/client/index.route")
//kết nối database
mongoose.connect(process.env.DATABASE);


// Thiết lập thư mục chứa code giao diện (view)
// app.set('views', './views') //./views: views dỉrectory, local ổn nhưng đẩy lên onl thì ko
app.set('views', path.join(__dirname, "views"));
//Thiết lập template engine (vd Pug)
app.set('view engine', 'pug');

//Thiết lập thư mục chứa file tĩnh (static file)
app.use(express.static(path.join(__dirname, "public"))); //vì deploy onl lỗi nên mới có path join

app.use("/", clientRoutes);
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

// caiphuongthuy1110 zYaFDpZqNNCGbXK5: mongodb database user
