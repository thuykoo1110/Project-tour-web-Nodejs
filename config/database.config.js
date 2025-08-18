const mongoose = require('mongoose');

module.exports.connect = async () => {
    //kết nối database
    try {
        await mongoose.connect(process.env.DATABASE);
        console.log("Successful");
    } catch (error) {
        console.log(error);
        console.log("Fail");
    }

}