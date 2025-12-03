const mongoose = require('mongoose')
let Schema = mongoose.Schema
const tvbanner = new Schema({
  outlet_id: Number,
  banner: [
    {
      image_video_path: String,
      number_of_sec: Number,
      is_image_video: Number
    }
  ]
})

module.exports = mongoose.model('tvbanner', tvbanner)




// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// // Define the banner schema to be embedded within the TVBanner schema
// const bannerSchema = new Schema({
//   image_video_path: String,
//   number_of_sec: Number,
//   is_image_video: {
//     type: String,
//     enum: ['image', 'video'], // Enumerate the possible values
//     default: 'image' // Default value set to 'image'
//   }
// });

// // Define the TVBanner schema
// const tvbannerSchema = new Schema({
//   outlet_id: Number,
//   banner: [bannerSchema] // Array of banners, each containing image or video information
// });

// module.exports = mongoose.model('TVBanner', tvbannerSchema);



// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const tvbannerSchema = new Schema({
//   outlet_id: Number,
//   banner: [
//     {
//       image_video_path: String
//     }
//   ]
// });

// module.exports = mongoose.model('tvbanner', tvbannerSchema);



