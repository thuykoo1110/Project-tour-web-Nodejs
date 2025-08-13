const express = require('express') //nhúng thư viện/hàm vào file này (như import)
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('Trang chủ')
}) //'/'-trang chủ

app.get('/tour', (req, res) => {
    res.send('Danh sách tour')
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
