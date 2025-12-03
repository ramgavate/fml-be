/**
 * Created by ritej on 8/21/2016.
 */
 var mongoose =  require('mongoose');
 var Schema = mongoose.Schema;
 var banner = new Schema({
    outlet_id: Number,
    banner: [{  
        banner_title:String, 
        image_path:String, 
        is_active:Number,
        is_fix:Number,  
        duration:{
            todate:Date,
            fromdate:Date
        }
    }]
 });
 
 module.exports = mongoose.model('banner', banner);