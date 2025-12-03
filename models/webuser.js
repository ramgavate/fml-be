
var mongoose =  require('mongoose');
var Schema = mongoose.Schema;
var WebUser = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    phoneNumber: String,
    address:[{
        firstName: String,
        lastName: String,
        email: String,
        phoneNumber: String,
        locality: String, //address
        flatNo : String, //for query/header
        landmark : String
    }],
    created_at: Date,
    updated_at: Date,
    orders:[],
    favourites:[]
});

module.exports = mongoose.model('WebUser', WebUser);
