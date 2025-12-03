/**
 * Created by ritej on 8/21/2016.
 */
var mongoose =  require('mongoose');
var Schema = mongoose.Schema;
var Admin = new Schema({
    userName: String,
    password: String,
    outletId: Number,
    outlet: String,
    token: String,
    image: String,
    tables:[{
        tableNumber: String,
        tableId: Number,
        capacity: String,
        status: String,
        assigned_on: Date
    }],
    adminId: Number,
    state: String,
    name: String,
    phoneNumber: String,
    created_at: Date,
    updated_at: Date,
    gcmId: String
});

module.exports = mongoose.model('Admin', Admin);
