// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const VideoBannerSchema = new Schema({
//   outlet_id: {
//     type: String,
//     required: true,
//   },
//   videos: [
//     {
//       video_path: {
//         type: String,
//         required: true,
//       },
//     },
//   ],
// });

// const VideoBanner = mongoose.model('VideoBanner', VideoBannerSchema);

// module.exports = VideoBanner;



const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VideoBannerSchema = new Schema({
  outlet_id: {
    type: Number, // Changed type to Number
    required: true,
  },
  videos: [
    {
      video_path: {
        type: String,
        required: true,
      },
    },
  ],
});

const VideoBanner = mongoose.model('VideoBanner', VideoBannerSchema);

module.exports = VideoBanner;
