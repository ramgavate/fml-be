var mongoose =  require('mongoose');
var Schema = mongoose.Schema;
var WebsiteOrder = new Schema({
    status: String,
    orderDate: String,
    orderTime: String,
    confirmTime: String,
    cancelTime: String,
    phoneNumber : String,
    permit : Boolean,
    permitNumber: String,
    address:{
        locality: String, //address
        flatNo : String,
        landmark : String,
        firstName: String,
        lastName: String,
        email: String,
    },
    drinks:[{
        quantity: Number,
        category: String,
        id: String,
        name: String,
        runningPrice: String
    }],
    created_at: Date,
    updated_at: Date
});

module.exports = mongoose.model('WebsiteOrder', WebsiteOrder);
