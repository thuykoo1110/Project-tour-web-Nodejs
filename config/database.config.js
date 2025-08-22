const mongoose = require('mongoose');

module.exports.connect = async () => {
    //kết nối database
    try {
        await mongoose.connect(process.env.DATABASE);
        console.log("Successfully connect to DB");
    } catch (error) {
        console.log(error);
        console.log("Fail");
    }

}