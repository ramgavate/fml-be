// Dev code 25/02/2023

var  multer = require('multer')
const fs = require('fs')
const path = require('path')

exports.upload = (folderName) => {

    return imageUpload = multer({
      storage: multer.diskStorage({
        destination: function (req, file, cb) {
          const path = `./uploads/${folderName}/`; 
          var stat = null;
                  try {
                      stat = fs.statSync(path);
                  } catch (err) {
                      fs.mkdirSync(path);
                  }
                  if (stat && !stat.isDirectory()) {
                      throw new Error('Directory cannot be created because an inode of a different type exists at "' + dest + '"');
                  }       
                  cb(null, path);
        },
  
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {
          cb(null,file.originalname.replace(/(?:\.(?![^.]+$)|[^\w.])+/g, ""));   
        }
      }),
      limits: { fileSize: 10000000 },
      fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|JPG|webp|jpeg|JPEG|png|PNG|gif|GIF|jfif|JFIF)$/)) {
          req.fileValidationError = 'Only image files are allowed!';
          return cb(null, false);
        }
        cb(null, true);
      }
    })
  }
  
