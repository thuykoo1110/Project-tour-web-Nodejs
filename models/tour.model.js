const mongoose = require('mongoose');
const Tour = mongoose.model(
    'Tour',
    {
        name: String,
        vehicle: String
    },
    "tours" //collection name in mongoDB
)

module.exports = Tour;