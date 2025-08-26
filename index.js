const express = require('express') //nhúng thư viện/hàm vào file này (như import)
require('dotenv').config();
const app = express()
const path = require('path')
const cookieParser = require('cookie-parser')
const port = 3000
const clientRoutes = require("./routes/client/index.route")
const adminRoutes=require('./routes/admin/index.route')
const databaseConfig = require("./config/database.config")
const variableConfig=require("./config/variable.config")

databaseConfig.connect();
// Thiết lập thư mục chứa code giao diện (view) TEMPLATE ENGINE
// app.set('views', './views') //./views: views dỉrectory, local ổn nhưng đẩy lên onl thì ko
app.set('views', path.join(__dirname, "views"));
//Thiết lập template engine (vd Pug)
app.set('view engine', 'pug');

//Thiết lập thư mục chứa file tĩnh (static file)
app.use(express.static(path.join(__dirname, "public"))); //vì deploy onl lỗi nên mới có path join

//Biến toàn cục trong file PUG
app.locals.pathAdmin=variableConfig.pathAdmin

//Tạo biến toàn cục trong các file backend
global.pathAdmin = variableConfig.pathAdmin

app.use(express.json());  //send data to backend as json

app.use(cookieParser()); //get cookie

app.use("/", clientRoutes);
app.use(`/${variableConfig.pathAdmin}`,adminRoutes);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

