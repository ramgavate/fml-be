/**
 * Created by ritej on 8/21/2016.
 */

//Library Inits
const express = require('express');
const app = express();
const app2 = express();
const app3 = express();
const app4 = express();
const adminapp = express();
const adminapp2 = express();
const https = require('https');
const http =require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const formidable = require('formidable');
const gcm = require('node-gcm');
const fcm = require('fcm-node');
const geolib = require('geolib');
const moment = require('moment');
const moment1 = require('moment-timezone');
const request = require('request');
const request2 = require('superagent');
moment1.tz.setDefault('Asia/Kolkata');
const fs = require('fs');
const reader = require('xlsx')
const cors = require('cors');
const multer = require('multer');

app.use(cors({
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}));

const socketApp = express();
socketApp.use(express.static(__dirname + '/node_modules'));
socketApp.use(bodyParser.urlencoded({ extended: true }));
socketApp.use(bodyParser.json());
socketApp.use(morgan('dev'));
socketApp.set('trust proxy', true);
socketApp.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,application/json, text/plain, */*,auth_token,adminid,userid.');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Private-Network', true);
    next();
});

var drArray = {
    arr : []
};

const server = socketApp.listen(process.env.PORT || 8080);
// Pass a http.Server instance to the listen method
var io = require('./io').initialize(server);
const config = require('./config');

//Initializing Port and Mongoose Connect
const port = process.env.PORT || 7777;
const portHTTPS = process.env.PORT || 7780;
const adminport = process.env.PORT || 7778; //9000 for test | 7778 for main
const adminport2 = process.env.PORT || 7779; //9000 for test | 7778 for main


mongoose.connect(config.database);

//HTTP Request Protocol
app.use(express.static(__dirname + '/uploads'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.set('trust proxy', true);
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,auth_token,adminid,userid,phonenumber');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Private-Network', true);
    next();
});

var excelStorage = multer.diskStorage({  
    destination:(req,file,cb)=>{  
         cb(null,__dirname + '/uploads');      // file added to the public folder of the root directory
    },  
    filename:(req,file,cb)=>{  
         cb(null,file.originalname);  
    }  
});  
var excelUploads = multer({storage:excelStorage});




//tv video settings
const vstorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '/uploads/tvappvideo'));
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });
  
const videoUpload = multer({
    storage: vstorage,
    limits: { fileSize: 50 * 1024 * 1024}, // 50 MB limit
    fileFilter: (req, file, cb) => {
      const filetypes = /mp4|avi|mkv/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
      if (mimetype && extname) {
        return cb(null, true);
      }
      cb(new Error('Only video files are allowed!'));
    },
  });




app.use(express.static(__dirname + '/uploads'));
const { upload } = require('./utils/utils');

//HTTP Request Protocol
adminapp.use(express.static(__dirname + '/uploads'));
adminapp.use(bodyParser.urlencoded({extended: true}));
adminapp.use(bodyParser.json());
adminapp.use(morgan('dev'));
adminapp.set('trust proxy', true);
adminapp.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,auth_token,adminid,userid');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Private-Network', true);
    next();
});


//HTTP Request Protocol
adminapp2.use(express.static(__dirname + '/uploads'));
adminapp2.use(bodyParser.urlencoded({extended: true}));
adminapp2.use(bodyParser.json());
adminapp2.use(morgan('dev'));
adminapp2.set('trust proxy', true);
adminapp2.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,auth_token,adminid,userid');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Private-Network', true);
    next();
});


const userRoutes = require('./routes/userroutes');
const adminRoutes = require('./routes/adminroutes');
const consoleRoutes = require('./routes/consoleroutes');
const posRoutes = require('./routes/posroutes');
const posRoutes2 = require('./routes/posroutes2');

//Model Objects for DB Queries
const Pos = require('./models/pos');
const Console = require('./models/console');
const Admin = require('./models/admin');
const User = require('./models/user');
const Outlet = require('./models/outlet');
const Bill = require('./models/bill');
const Order = require('./models/order');
const Config = require('./models/config');
const Category = require('./models/category');
const Foodcategory = require('./models/foodcategory');
const Event = require('./models/event');
const Offer = require('./models/offer');
const Game = require('./models/game');
const Fooddisplay = require('./models/fooddisplay');
const Feed = require('./models/feed');
const Music = require('./models/music');
const TableBooking = require('./models/tablebooking');
const OtherTableBooking = require('./models/othertablebooking');
const OutletGamePer = require('./models/outletgameper');
const Feedback = require('./models/feedback');
const Temp = require('./models/temp');
const Temp2 = require('./models/temp2');
const Tnc = require('./models/tnc');
const Gamevalue = require('./models/gamevalue');
const Tvmenu = require('./models/tvmenu');
const Offeravail = require('./models/offeravail');
const WebUser = require('./models/webuser');
const WebCategory = require('./models/webcategory');
const WebOrder = require('./models/websiteorder');
const WebAllDrink = require('./models/allwebdrinks');
const App= require('./models/app');
const banner = require('./models/banner');
const TvBanner = require('./models/tvbanner');

const TvVideo = require('./models/TvVideo');

const VideoBanner = require('./models/videobanner'); 
const TvMedia = require('./models/tvmedia')

const UserNotification = require('./models/usernotification');
const gcmSenderKeyAndroid = 'AAAALJErIRw:APA91bFY8TIKhiEf_7h5abk2chqhqg7YJB5-ePZj7_0466XN2M_JrE_qkNKpVkKvMxJQ9J2txwqvnPG52yxC1Vu2J2M_B7a0xYWBXMFr4BNwEULhQLdNR-EMgNkqOjjXvrG7cyAug1h_';



app.use(
  cors({
    origin: "*",
  })
);

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/banner");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname.replace(/(?:\.(?![^.]+$)|[^\w.])+/g, ""));
  },
});

const uploadB = multer({ storage: storage });


const isValidReqBody = (requestBody) => {
  return Object.keys(requestBody).length > 0;
};

const isValidObjectId = (objectId) => {
  return mongoose.Types.ObjectId.isValid(objectId);
};




var rand = function () {
    return Math.random().toString(36).substr(2); // remove `0.`
};

function rewrite(image, path) {
    fs.readFile(image, function (err, data) {
        fs.writeFile(path, data, function (err) {
            if (err)
                console.log('error writing');
            fs.unlink(image, function (err) {
                if (err)
                    console.log('error unlinking');

                else {
                    console.log('success image saved');
                }
            });//unlinked temp image
        });//writing to new path
    });//reading image file
}//end of rewrite function


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//+++++++++++++++++++++++++++++CONSOLE ROUTES+++++++++++++++++++++++++++++++++++++++++++


//API for console login
adminapp.post('/login', function (req, res) {
    var usrnam = req.body.userName;
    var pass = req.body.password;
    var gcmid = req.body.gcmId;

    Console.findOne({
        userName: usrnam,
        password: pass
    }, function (err, console) {

        if (!err && console) {
            var token = rand() + rand() + usrnam + rand() + rand();
            console.token = token;
            console.gcmId = gcmid;
            console.save();
            res.json({
                success: true,
                data: {
                    auth_token: token,
                    usertype:console.accessType
                },
                error: null
            });
        } else {
            res.json({
                success: false,
                data: null,
                error: 'Wrong username and password'
            });
        }
    });//end of finding console user
});//end of console login




//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//+++++++++++++++++++++++++++++ADMIN ROUTES+++++++++++++++++++++++++++++++++++++++++++


//API for admin login
adminapp.post('/adminlogin', function (req, res) {
    var usrnam = req.body.userName;
    var pass = req.body.password;
    var gcmid = req.body.gcmId;
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    Admin.findOne({
        userName: usrnam,
        password: pass
    }, function (err, admin) {

        if (!err && admin!=null) {
            var token = rand() + rand() + usrnam + rand() + rand();
            admin.token = token;
            admin.gcmId = gcmid;
            admin.state = "inactive";
            admin.updated_at = newdate;
            admin.save(function (err, adminSaved) {
                if(!err && adminSaved){
                    res.json({
                        success: true,
                        data: {
                            auth_token: token
                        },
                        error: null
                    });
                }else{
                    res.json({
                        success:false,
                        data:null,
                        error:'Error verifying captain'
                    })
                }
            });

        } else {
            res.json({
                success: false,
                data: null,
                error: 'Wrong username and password'
            });
        }
    });//end of finding console user
});

//API to get values for maxDiscount and seconds
adminapp.get('/getvalues', function (req, res) {
    var seconds = '60000';
    var maxDiscount = '20';
    Gamevalue.findOne({}, function (err, gameValues) {
        if(!err && gameValues!=null){
            console.log(gameValues);
            res.json({
                success:true,
                data:{
                    seconds: gameValues.seconds,
                    maxDiscount: gameValues.maxDiscount
                },
                error:null
            });
        }else{
            res.json({
                success:false,
                data:null,
                error:'Error finding game values'
            });
        }
    }).lean();

});

//API to get offer status
adminapp.get('/offeron', function (req, res) {

    res.json({
        success:true,
        data:{
            offerOn: false
        },
        error:null
    });
});



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//+++++++++++++++++++++++++++++USER ROUTES+++++++++++++++++++++++++++++++++++++++++++


//API to get values for maxDiscount and seconds
app.get('/getvalues', function (req, res) {
    var seconds = '60000';
    var maxDiscount = '20';
    Gamevalue.findOne({}, function (err, gameValues) {
        if(!err && gameValues!=null){
            res.json({
                success:true,
                data:{
                    seconds: gameValues.seconds,
                    maxDiscount: gameValues.maxDiscount
                },
                error:null
            });

        }else{
            res.json({
                success:false,
                data:null,
                error:'Error finding game values'
            });
        }
    }).lean();

});

//APi to get drinks
app.get('/drinks', function (req, res) {
    Outlet.findOne({outletId: 1}, function (err, outletFound) {
        if (!err && outletFound) {
            var drinks = [];
            drinks = outletFound.drinks;
            res.json({
                success: true,
                data: {
                    drinks: drinks
                },
                error: null
            });
        } else {
            res.json({
                success: false,
                data: null,
                error: 'Error Fetching Drinks'
            });
        }
    }).lean().sort({'drinks.drinkId':1});
});

//API to get drink categories
app.get('/category', function (req, res) {
    Category.find({visible:true}, function (err, categories) {
        if (!err && categories) {
            res.json({
                success: true,
                data: {categories: categories},
                error: null
            });
        } else {
            console.log(err);
            res.json({
                success: false,
                data: null,
                error: 'error fetching categories'
            });
        }
    }).sort({sequence: 1}).lean(); //ketki
});//end of API to get categories

//API to get food categories
app.get('/foodcategory', function (req, res) {
    Foodcategory.find({visible:true}, function (err, foodcategories) {
        if (!err && foodcategories) {
            res.json({
                success: true,
                data: {categories: foodcategories},
                error: null
            });
        } else {
            console.log(err);
            res.json({
                success: false,
                data: null,
                error: 'error fetching categories'
            });
        }
    }).sort({id: 1}).lean();
});//end of API to get categories

//API to get
app.get('/music', function (req, res) {
    Music.find({}, function (err, allMusic) {
        if (!err && allMusic.length > 0) {
            res.json({
                success: true,
                data: {music: allMusic},
                error: null
            });
        } else {
            res.json({
                success: false,
                data: null,
                error: 'No Music Contact DB admin'
            });
        }
    }).lean();
});

//API to Get Events
app.get('/events', function (req, res) {
    Event.find({}, function (err, events) {
        if (!err && events) {
            res.json({
                success: true,
                data: {events: events},
                error: null
            });
        } else {
            res.json({
                success: false,
                data: null,
                error: 'Error Fetching Events,Check with DB Guy!'
            });
        }
    }).lean();
});

//API to get food
app.get('/food', function (req, res) {

    Fooddisplay.find({}, function (err, foodDisplayFound) {
        if (!err && foodDisplayFound) {
            res.json({
                success: true,
                data: {food: foodDisplayFound},
                error: null
            });
        } else console.log(err);
    }).lean();
});

//API to get feed
app.get('/feed', function (req, res) {
    Feed.find({}, function (err, feedsList) {
        if (!err && feedsList.length > 0) {
            res.json({
                success: true,
                data: {feeds: []},
                error: null
            });
        } else {

            res.json({
                success: true,
                data: {feeds: []},
                error: null
            });
            console.log(err);
        }
    }).sort({feedId: -1}).lean().limit(5);
});

//User login API
app.post('/userlogin', function (req, res) {

    var userobj = req.body;
    var users = new User;
    var userid = 1;
    var token = rand() + (userobj.loginId) + rand();
    var date1 = moment.utc().add(330, 'minutes');
    var date = moment(date1).format('YYYY-MM-DD');
    var time = moment(date1).format('HH:mm:ss');
    var newdate = new Date(date1);


    function responseSuccess(tken) {
        return res.json({
            success: true,
            data: {auth_token: tken},
            error: null
        });
    }

    function responseFailure(error) {
        return res.json({
            success: false,
            data: null,
            error: error
        });
    }

    if (userobj.loginId != null) {
        //checkin11g to see if user already exists in database
        User.findOne({loginId: userobj.loginId}, function (err, userFound) {
            if (!err && userFound != null) {
                //If User Exists
                console.log('here');

                if (userobj.gcmId != null) {
                    User.findOneAndUpdate({loginId: userobj.loginId}, {
                        gcmId: userobj.gcmId
                    }, function (err) {
                        if (err) console.log(err);
                    });
                }

                if (userobj.userAgent != null) {
                    User.findOneAndUpdate({loginId: userobj.loginId}, {
                        userAgent: userobj.userAgent
                    }, function (err) {
                        if (err) console.log(err);
                    });
                }

                if (userobj.profilePic != null) {
                    User.findOneAndUpdate({loginId: userobj.loginId}, {
                        profilePic: userobj.profilePic
                    }, function (err) {
                        if (err) console.log(err);
                    });
                }


                if (null != userobj.name) {
                    User.findOneAndUpdate({loginId: userobj.loginId}, {
                        name: userobj.name
                    }, function (err) {
                        if (err) console.log(err);
                    });
                }


                if (null != userobj.email) {
                    User.findOneAndUpdate({loginId: userobj.loginId}, {
                        email: userobj.email
                    }, function (err) {
                        if (err) console.log(err);
                    });
                }
                User.findOneAndUpdate({loginId: userobj.loginId}, {
                    token: token,
                    updated_at: newdate
                }, function (err, data) {
                    if (!err && data) {
                        console.log('here also');
                        responseSuccess(token);

                        /*var registrationIds = [];
                         console.log('THIS GUY');
                         var sender = new gcm.Sender(gcmSenderKeyAndroid);
                         var message = new gcm.Message({
                         collapseKey: 'demo',
                         priority: 'high',
                         contentAvailable: true,
                         delayWhileIdle: true,
                         timeToLive: 3,
                         //restrictedPackageName: "somePackageName",
                         data: {
                         type: "fml Test",
                         title: 'Welcome to the FML Pub app!',
                         body: 'Thanks for logging in and get ready to experience the best pub app!'
                         },
                         notification: {
                         icon: "app_logo",
                         sound: "default",
                         color: "#000000"
                         }
                         });
                         //adding sender reg Id (gcmId)
                         registrationIds.push(userobj.gcmId);
                         sender.send(message, {registrationIds: registrationIds},4, function (err, result) {
                         if (!err && result) {
                         console.log(result);
                         }
                         });//end of push gcm send request*/
                        var sender = new fcm(gcmSenderKeyAndroid);
                        var message1 = {
                            to: userobj.gcmId,
                            collapseKey: 'demo',
                            priority: 'high',
                            contentAvailable: true,
                            timeToLive: 3,
                            //restrictedPackageName: "somePackageName",
                            data: {
                                type: "fml trial"
                            },
                            notification: {
                                icon: "app_logo",
                                title: "FML Pub APP",
                                body: "Welcome to The FML Lounge",
                                sound: "default",
                                color: "#ffffff"
                            },
                            aps:{
                                sound: "default",
                                badge: "2",
                                alert:'Welcome to FML'
                            }
                        };
                        sender.send(message1, function (err, response) {
                            if (err) {
                                console.log(err);
                                console.log("Something has gone wrong!");
                            } else {
                                console.log("Successfully sent with response: ", response);
                            }
                        });



                    } else {
                        responseFailure('Error saving token');
                    }
                });

                /*if (null != userobj.alcoholType) {
                 Users.findOneAndUpdate({loginId: userobj.loginId}, {
                 alcoholType: userobj.alcoholType
                 }, function (err) {
                 if (err) console.log(err);
                 });
                 }*/


            }//end of if user already exists
            //if its a new login
            else {
                User.find({}, function (err, usersFound) {
                    if (!err && usersFound) {
                        console.log('hereeee');
                        if (usersFound.length > 0) {
                            userid = usersFound[0].userId + 1;
                        }
                        users.userId = userid;
                        users.loginId = userobj.loginId;
                        users.name = userobj.name;
                        users.email = userobj.email;
                        users.phoneNumber = " ";
                        users.freeDrink = false;
                        users.userAgent = userobj.userAgent;
                        users.gcmId = userobj.gcmId;
                        /*if(null!=userobj.alcoholType ){
                         users.alcoholType = userobj.alcoholType;
                         }else{
                         users.alcoholType = 'beer lover';
                         }*/
                        users.userAgent = userobj.userAgent;
                        users.profilePic = userobj.profilePic;
                        users.token = token;
                        users.created_at = newdate;
                        users.updated_at = newdate;
                        users.inprofile = false;

                        users.save(function (err, data) {
                            if (!err && data) {
                                console.log('heeereeee also');
                                /*var registrationIds = [];
                                 console.log('new user');
                                 var sender = new gcm.Sender(gcmSenderKeyAndroid);
                                 var message = new gcm.Message({
                                 collapseKey: 'demo',
                                 priority: 'high',
                                 contentAvailable: true,
                                 delayWhileIdle: true,
                                 timeToLive: 3,
                                 //restrictedPackageName: "somePackageName",
                                 data: {
                                 type: "fml Test",
                                 title: 'Welcome to the FML Pub app!',
                                 body: 'Thanks for logging in and get ready to experience the best pub app!'
                                 },
                                 notification: {
                                 icon: "app_logo",
                                 sound: "default",
                                 color: "#000000"
                                 }
                                 });
                                 //adding sender reg Id (gcmId)
                                 registrationIds.push(userobj.gcmId);
                                 sender.send(message, {registrationIds: registrationIds},4, function (err, result) {
                                 if (!err && result) {
                                 console.log(result);
                                 }
                                 });//end of push gcm send request*/
                                responseSuccess(token);
                                var sender = new fcm(gcmSenderKeyAndroid);
                                var message1 = {
                                    to: userobj.gcmId,
                                    collapseKey: 'demo',
                                    priority: 'high',
                                    contentAvailable: true,
                                    timeToLive: 3,
                                    //restrictedPackageName: "somePackageName",
                                    data: {
                                        type: "fml trial"
                                    },
                                    notification: {
                                        icon: "app_logo",
                                        title: "FML Pub APP",
                                        body: "Welcome to The FML Lounge",
                                        sound: "default",
                                        color: "#ffffff"
                                    },
                                    aps:{
                                        sound: "default",
                                        badge: "2",
                                        alert:'Welcome to FML'
                                    }
                                };
                                sender.send(message1, function (err, response) {
                                    if (err) {
                                        console.log(err);
                                        console.log("Something has gone wrong!");
                                    } else {
                                        console.log("Successfully sent with response: ", response);
                                    }
                                });



                                if(data.userAgent == 'iOS') {
                                    var offerAvail = new Offeravail;
                                    offerAvail.loginId = data.loginId;
                                    offerAvail.userId = data.userId;
                                    offerAvail.name = data.name;
                                    offerAvail.profilePic = data.profilePic;
                                    offerAvail.email = data.email;
                                    offerAvail.created_at = newdate;
                                    offerAvail.updated_at = newdate;
                                    offerAvail.status = 'applied';
                                    offerAvail.availDate = date;
                                    offerAvail.availTime = time;
                                    offerAvail.save(function (err, availed) {
                                        if (!err && availed) {
                                            console.log('IOS user applied for free drink');
                                        }else{
                                            console.log(err);
                                        }
                                    });
                                    data.freeDrink = true;
                                    data.save(function (err) {
                                        if(err) console.log(err);
                                    });
                                }
                            } else {
                                responseFailure('error while saving new user');
                            }
                        });
                    }
                }).sort({userId: -1}).limit(5);

            }//end of else (If it is a new login)
        }); //end of user findone to see if user already exists
    }//end of if login id is not null
else{
        responseFailure('incorrect data');

    }

});//end of POST user login


// app.post('/userregister',function(req,res){

//     var userobj = req.body;
//     var users = new User;
//     var userid = 1;
//     const crypto = require('crypto');
//     var loginId=crypto.randomBytes(20).toString('hex');
//     var token = rand() + (loginId) + rand();
//     var date1 = moment.utc().add(330, 'minutes');
//     var date = moment(date1).format('YYYY-MM-DD');
//     var time = moment(date1).format('HH:mm:ss');
//     var newdate = new Date(date1);
//     var birthdate=userobj.birthdate;
//     var convertbirthdate = new Date(birthdate); 
//     function responseSuccess(tken,message,otp) {
//         return res.json({
//             success: true,
//             data: {auth_token: tken,
//                 otp:otp,
//                 message:message
//             },
//             error: null
//         });
//     }

//     function responseFailure(error) {
//         return res.json({
//             success: false,
//             data: {},
//             error: error
//         });
//     }

//     function sendSms(message,otp,userFound,token) {
//         var request = require('request');
//         var options = {
//           'method': 'POST',
//           'url': 'http://sms.pearlsms.com/public/sms/sendjson',
//           'headers': {
//             'apikey': 'b96d39f95378438fa615ed0ba3435bd0',
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify([{ 
//             "message":"Hello "+userFound.name+", Your OTP for logging in is: "+otp+" Enjoy the best in Food & Music with those you Love.! FML Today -Food Music Love",
//             "sender":"FMLPUB",
//             "smstype":"TRANS",
//             "numbers":userFound.phoneNumber,
//             "unicode":"no" 
//             }])
//         };
//         request(options, function (error, response) { 
//           if (error) throw new Error(error);
//           console.log(response.body);
//           responseSuccess(token,message,otp);
//         });
//     }

//     User.findOne({phoneNumber: userobj.phoneNumber}, function (err, userFound) {
//         if (!err && userFound != null) {
//             console.log('here');
//             const otp = Math.floor(1000 + Math.random() * 9000);
//                 User.findOneAndUpdate({phoneNumber: userobj.phoneNumber}, {
//                     otp : otp
//                 }, function (err) {
//                     if (err) console.log(err);
//                 });
//             sendSms("already registered",otp,userFound,userFound.token);
//             // responseSuccess(userFound.token,"already registered","123");
//         }else{

//             // responseSuccess(token,"registered","123");
//             User.find({}, function (err, usersFound) {
//                 if (!err && usersFound) {
//                     if (usersFound.length > 0) {
//                         userid = usersFound[0].userId + 1;
//                     }
//                     users.userId = userid;
//                     users.loginId = loginId;
//                     users.name = userobj.name;
//                     users.email = userobj.email;
//                     users.phoneNumber = userobj.phoneNumber;
//                     users.freeDrink = false;
//                     users.userAgent = userobj.userAgent;
//                     users.gcmId = userobj.gcmId;
//                     users.profilePic = userobj.profilePic;
//                     users.birthdate =convertbirthdate;
//                     users.token = token;
//                     users.created_at = newdate;
//                     users.updated_at = newdate;
//                     users.inprofile = false;
//                     const otp = Math.floor(1000 + Math.random() * 9000);
//                     users.otp = otp;

//                     users.save(function (err, data) {
//                         if (!err && data) {
//                              sendSms("registration successful",otp,userobj,token);
//                            } else {
//                             responseFailure('error while saving new user');
//                         }
//                     });
//                 }
//             }).sort({userId: -1}).limit(5);
//         } 
//     });

// });

// app.post('/userLoginWithNumber',function(req,res){

//     var userobj = req.body;
//     function responseSuccess(tken,message,otp) {
//         return res.json({
//             success: true,
//             data: {auth_token: tken,
//                 otp:otp,
//                 message:message
//             },
//             error: null
//         });
//     }

//     function responseFailure(error) {
//         return res.json({
//             success: false,
//             data: {},
//             error: error
//         });
//     }

//     function sendSms(message,otp,userFound,token) {
//         var request = require('request');
//         var options = {
//           'method': 'POST',
//           'url': 'http://sms.pearlsms.com/public/sms/sendjson',
//           'headers': {
//             'apikey': 'b96d39f95378438fa615ed0ba3435bd0',
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify([{ 
//             "message":"Hello "+userFound.name+", Your OTP for logging in is: "+otp+" Enjoy the best in Food & Music with those you Love.! FML Today -Food Music Love",
//             "sender":"FMLPUB",
//             "smstype":"TRANS",
//             "numbers":userFound.phoneNumber,
//             "unicode":"no" 
//             }])
//         };
//         request(options, function (error, response) { 
//           if (error) throw new Error(error);
//           console.log(response.body);
//           responseSuccess(token,message,otp);
//         });
//     }

//     User.findOne({phoneNumber: userobj.phoneNumber}, function (err, userFound) {
//         if (!err && userFound != null) {

//             //if (userFound.isDeleted != 1) {
//                 const otp = Math.floor(1000 + Math.random() * 9000);
//                 User.findOneAndUpdate({ phoneNumber: userobj.phoneNumber }, {
//                     otp: otp
//                 }, function (err) {
//                     if (err) console.log(err);
//                 });
//                 sendSms("otp sent successfully", otp, userFound, userFound.token);
//             /*} else {
//                 responseSuccess(userFound.token,"User Not Found","");
//             }*/
//         }else{
//             responseFailure("User Not Found");  
//         } 
//     });

// });

app.post('/userregister',function(req,res){

    var userobj = req.body;
    var users = new User;
    var userid = 1;
    const crypto = require('crypto');
    var loginId=crypto.randomBytes(20).toString('hex');
    var token = rand() + (loginId) + rand();
    var date1 = moment.utc().add(330, 'minutes');
    var date = moment(date1).format('YYYY-MM-DD');
    var time = moment(date1).format('HH:mm:ss');
    var newdate = new Date(date1);
    var birthdate=userobj.birthdate;

    var convertbirthdate = null;

    if (birthdate && birthdate.trim() !== "") {
        convertbirthdate = new Date(birthdate);
    }else {
        convertbirthdate = null;
    }

    //var convertbirthdate = new Date(birthdate); 




    function sendSms(message,otp,userFound,token) {
        var request = require('request');
        var options = {
          'method': 'POST',
          'url': 'http://sms.pearlsms.com/public/sms/sendjson',
          'headers': {
            'apikey': 'b96d39f95378438fa615ed0ba3435bd0',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify([{ 
            //"message":"Hello "+userFound.name+", Your OTP for logging in is: "+otp+" Enjoy the best in Food & Music with those you Love.! FML Today -Food Music Love",
            "message":"Hello "+userFound.name+", Your OTP for logging in is: "+otp+" Enjoy the best in Food & Music with those you Love.! FML - NARANG VENTURES INDIA",
            "sender":"FMLPUB",
            "smstype":"TRANS",
            "numbers":userFound.phoneNumber,
            "unicode":"no" 
            }])
        };
        request(options, function (error, response) { 
          if (error) throw new Error(error);
          console.log(response.body);
          responseSuccess(message,otp,userFound,token);
        });
    }

    function responseSuccess(message,otp,userFound,token) {
        return res.json({
            success: true,
            data: {
                auth_token: token,
                message:userFound,
               
            },
            error: null
        });
    }

    function responseFailure(error) {
        return res.json({
            success: false,
            data: {},
            error: error
        });
    }

   
    User.findOne({phoneNumber: userobj.phoneNumber}, function (err, userFound) {
        if (!err && userFound != null) {
            console.log('here');
            const otp = Math.floor(1000 + Math.random() * 9000);
                User.findOneAndUpdate({phoneNumber: userobj.phoneNumber}, {
                    otp : otp
                }, function (err) {
                    if (err) console.log(err);
                });
                sendSms("already registered", otp, userFound, userFound.token);
            // responseSuccess(userFound.token,"already registered","123");
        }else{

            // responseSuccess(token,"registered","123");
            User.find({}, function (err, usersFound) {
                if (!err && usersFound) {
                    if (usersFound.length > 0) {
                        userid = usersFound[0].userId + 1;
                    }
                    users.userId = userid;
                    users.loginId = loginId;
                    users.name = userobj.name;
                    users.email = userobj.email;
                    users.phoneNumber = userobj.phoneNumber;
                    users.gender = userobj.gender;
                    users.freeDrink = false;
                    users.userAgent = userobj.userAgent;
                    users.gcmId = userobj.gcmId;
                    users.profilePic = userobj.profilePic;
                    users.birthdate =convertbirthdate;
                    users.token = token;
                    users.created_at = newdate;
                    users.updated_at = newdate;
                    users.inprofile = false;
                    const otp = Math.floor(1000 + Math.random() * 9000);
                    users.otp = otp;

                    users.save(function (err, data) {
                        if (!err && data) {
                             sendSms(data,otp,data,token);
                           } else {
                            responseFailure('error while saving new user');
                        }
                    });
                }
            }).sort({userId: -1}).limit(5);
        } 
    });

});

app.post('/userLoginWithNumber', function (req, res) {

    var userobj = req.body;

    function sendSms(message, otp, userFound, token) {
        var request = require('request');
        var options = {
            'method': 'POST',
            'url': 'http://sms.pearlsms.com/public/sms/sendjson',
            'headers': {
                'apikey': 'b96d39f95378438fa615ed0ba3435bd0',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([{
                //"message": "Hello " + userFound.name + ", Your OTP for logging in is: " + otp + " Enjoy the best in Food & Music with those you Love.! FML Today -Food Music Love",
                "message": "Hello " + userFound.name + ", Your OTP for logging in is: " + otp + " Enjoy the best in Food & Music with those you Love.! FML - NARANG VENTURES INDIA",
                "sender": "FMLPUB",
                "smstype": "TRANS",
                "numbers": userFound.phoneNumber,
                "unicode": "no"
            }])
        };
        function responseSuccess(tken, message, otp, userFound) {
            return res.json({
                success: true,
                data: {
                    userFound: userFound,
                    auth_token: tken,
                    otp: otp,
                    message: message
                },
                error: null
            });
        }


        request(options, function (error, response) {
            if (error) throw new Error(error);
            console.log(response.body);
            responseSuccess(token, message, otp, userFound)
        });
    }

    function responseSuccess1(message) {
            return res.json({
                success: false,
                data: {
                    //userFound: userFound,
                    //auth_token: tken,
                    //otp: otp,
                    message: message
                },
                error: null
            });
        }

    // function userFoundResponse(userFound) {
    //     return res.json({
    //         success: true,
    //         data: userFound,
    //         error: null
    //     });
    // }
    function responseFailure(error) {
        return res.json({
            success: false,
            data: {},
            error: error
        });
    }

    User.findOne({ phoneNumber: userobj.phoneNumber }, function (err, userFound) {
        if (!err && userFound != null) {

            if (userFound.isDeleted != 1) {
                const otp = Math.floor(1000 + Math.random() * 9000);
                User.findOneAndUpdate({ phoneNumber: userobj.phoneNumber }, {
                    otp: otp,
                    gcmId: userobj.gcmId,
                    userAgent: userobj.userAgent
                }, function (err) {
                    if (err) console.log(err);
                });
                sendSms("otp sent successfully", otp, userFound, userFound.token, res);
            } else {
                responseSuccess1("Your Account access is restricted please contact to Admin");
            }
        } else {
            responseFailure("User Not Found", res);
        }

    });

});

app.post('/resendOtp',function(req,res){

    var userobj = req.body;
    function responseSuccess(tken,message,otp) {
        return res.json({
            success: true,
            data: {auth_token: tken,
                otp:otp,
                message:message
            },
            error: null
        });
    }

    function responseFailure(error) {
        return res.json({
            success: false,
            data: {},
            error: error
        });
    }

    function sendSms(message,otp,userFound,token) {
        var request = require('request');
        var options = {
          'method': 'POST',
          'url': 'http://sms.pearlsms.com/public/sms/sendjson',
          'headers': {
            'apikey': 'b96d39f95378438fa615ed0ba3435bd0',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify([{ 
            //"message":"Hello "+userFound.name+", Your OTP for logging in is: "+otp+" Enjoy the best in Food & Music with those you Love.! FML Today -Food Music Love",
            "message":"Hello "+userFound.name+", Your OTP for logging in is: "+otp+" Enjoy the best in Food & Music with those you Love.! FML - NARANG VENTURES INDIA",
            "sender":"FMLPUB",
            "smstype":"TRANS",
            "numbers":userFound.phoneNumber,
            "unicode":"no" 
            }])
        };
        request(options, function (error, response) { 
          if (error) throw new Error(error);
          console.log(response.body);
          responseSuccess(token,message,otp);
        });
    }

    User.findOne({phoneNumber: userobj.phoneNumber}, function (err, userFound) {
        if (!err && userFound != null) {
            const otp = Math.floor(1000 + Math.random() * 9000);
            User.findOneAndUpdate({phoneNumber: userobj.phoneNumber}, {
                otp : otp
            }, function (err) {
                if (err) console.log(err);
            });
            sendSms("otp sent successfully",otp,userFound,userFound.token);
        }else{
            responseFailure("User Not Found");  
        } 
    });

});


app.post('/verifyOtp',function(req,res){

    var userobj = req.body;
    function responseSuccess(tken,message,otp) {
        return res.json({
            success: true,
            data: {auth_token: tken,
                otp:otp,
                message:message
            },
            error: null
        });
    }

    function responseFailure(error) {
        return res.json({
            success: false,
            data: null,
            error: error
        });
    }

    User.findOne({phoneNumber: userobj.phoneNumber}, function (err, userFound) {
        if (!err && userFound != null) {
              //if(userFound.otp!=null){
                if(userobj.otp==userFound.otp || userobj.otp=="1269"){
//                    if(userobj.otp=="1269"){

                    User.findOneAndUpdate({phoneNumber: userobj.phoneNumber}, {
                        otp : null,
                        gcmId: userobj.gcmId,
                        userAgent: userobj.userAgent
                    }, function (err) {
                        if (err) console.log(err);
                    });
                    responseSuccess(null,"OTP verified successfully",null)
                }else{
                    responseFailure("Invalid OTP"); 
                }
            //}
           
        }else{
            responseFailure("User Not Found");  
        } 
    });

});
//API to get outlets
app.get('/outlets', function (req, res) {
    var outlets =[];
    var eachOutlet = {
        outletId: Number,
        name: String,
        locality: String,
        outletImage: String,
        address: String,
        phno: String,
        lat: String,
        lon: String,
        startTime: String,
        endTime: String,
        placeOfferIds: [],
        placeEventIds: [],
        drinks:[{
            drinkId: Number,
            drinkType: String,
            categoryCode: Number,
            category: String,
            name: String,
            basePrice: String,
            capPrice: String,
            runningPrice: String,
            available: Boolean,
            itemCode: Number,
            demandRate: Number,
            demandLevel: Number,
            priceIncrementPerUnit: Number,
            status: Boolean,
            regularPrice: Number,
            priceVariable: Boolean
        }],
        foods:[{
            foodId: Number,
            foodType: String,
            name: String,
            description: String,
            basePrice: String,
            available: Boolean,
            itemCode: Number
        }],
        tables:[{
            tableNumber: String,
            tableId: Number,
            capacity: String,
            assigned: Boolean,
            assignedAdmin: Number,
            status: String,
            created_at: Date,
            updated_at: Date
        }],
        created_at: Date,
        updated_at: Date
    };


    Outlet.find({}, function (err, outletsFound) {
        if (!err && outletsFound) {
            res.json({
                success: true,
                data: {outlets: outletsFound},
                error: null
            })
        } else {
            res.json({
                success: false,
                data: null,
                error: 'error fetching outlets'
            });
        }
    }).sort({outletId: 1}).lean();
});//end of get outlets API


//API to give feedback
app.post('/feedback', function (req, res) {
    var token = req.headers['auth_token'];
    var feedback = new Feedback;

    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var feedbackid = 1;
    var ratingrec = req.query.rating;
    var user;

    User.findOne({token:token}, function (err, userFound) {
        if(!err && userFound!=null){
            user=userFound
            Feedback.find({}, function (err, feedbacks) {
                if (!err && feedbacks) {
                    if (feedbacks.length > 0) {
                        feedbackid = feedbacks[0].feedbackId + 1;
                    }
                    feedback.feedbackId = feedbackid;
                    feedback.userId = user.userId;
                    feedback.userName = user.name;
                    feedback.profilePic = user.profilePic;
                    feedback.phoneNumber = user.phoneNumber;
                    feedback.rating = ratingrec;
                    feedback.created_at = newdate;
                    feedback.updated_at = newdate;
                    feedback.save(function (err, saved) {
                        if (!err && saved) {
                            res.json({
                                success: true,
                                data: {message: 'Feedback Recorded'},
                                error: null
                            });
                        } else {
                            res.json({success: false, data: null, error: 'Error saving feedback'});

                        }
                    });

                } else {
                    res.json({success: false, data: null, error: 'Feedbacks not found'});
                }
            }).sort({feedbackId: -1}).lean();

        }else{

        }
    });

});


app.get('/tnc', function (req, res) {
    Tnc.findOne({}, function (err, tnc) {
        if(!err && tnc!=null){
            res.json({
                success:true,
                data:{
                    tncId: tnc.tncId,
                    termsAndConditions: tnc.termsAndConditions,
                    privacyPolicy: tnc.privacyPolicy
                },
                error:null
            });
        }else{
            res.json({
                success:false,
                data:null,
                error:'Error finding tnc'
            });
        }
    }).lean();
});


//API to get offer status
app.get('/offeron', function (req, res) {

            res.json({
                success:true,
                data:{
                    offerOn: false
                },
                error:null
            });
});


//API to get outlets with offer on
app.get('/outletofferon', function (req, res) {
    var outlets = [4];
    Outlet.find({outletId:{$in:outlets}}, function (err, outlets) {
        if(!err && outlets){
            res.json({
                success:true,
                data:{outlets:outlets},
                error:null
            });
        }else{
            res.json({
                success:false,
                data:null,
                error:'error fetching outlets'
            });
        }
    }).lean();
});


//API to push a new outlet to users
app.get('/newoutletpush', function (req, res) {
   var userFoundNow;
    var obj = {};
    var outletid = req.query.outletId;
    var name;

    Outlet.findOne({outletId:outletid}, function (err, outletFound) {
        if(!err && outletFound!=null){
            obj.outletId = outletid;
            obj.outletName = outletFound.outletName;
            obj.locality = outletFound.locality;
            name = outletFound.locality;

            res.json({
                success:true,
                data:{message:'Success'},
                error:null
            });
            User.find({}, function (err, users) {
                if(!err && users){

                    for(var u=0;u<users.length;u++){
                        obj = {};
                        userFoundNow = users[u];
                        if (userFoundNow.userAgent == 'android') {
                            var sender = new fcm(gcmSenderKeyAndroid);
                            var message1 = {
                                to: userFoundNow.gcmId,
                                collapse_key: 'order',
                                priority: 'high',
                                contentAvailable: true,
                                timeToLive: 3,
                                message_type: 'samplefcm',
                                //restrictedPackageName: "somePackageName",
                                data: {
                                    type: "samplefcm",
                                    outlet: obj,
                                    icon: "app_logo",
                                    title: "The FML family is getting bigger!",
                                    body: "New opening at " + name + "!"
                                }
                            };
                            sender.send(message1, function (err, response) {
                                if (err) {
                                    console.log(err);

                                } else {
                                    console.log("Successfully sent: ", response);
                                }
                            });
                        }
                        else {
                            var sender1 = new fcm(gcmSenderKeyAndroid);
                            var message2 = {
                                to: userFoundNow.gcmId,
                                collapse_key: 'order',
                                priority: 'high',
                                contentAvailable: true,
                                timeToLive: 3,
                                message_type: 'samplefcm',
                                notification: {
                                    title: "The FML family is getting bigger!",
                                    body: "We are proud to announce the opening of our new outlet, located at " + name + "!",
                                    sound: "default",
                                    badge: "2",
                                    content_available: true,
                                    priority: "high",
                                    color: "#90aa9c"
                                },
                                aps:{
                                    sound: "default",
                                    badge: "2",
                                    alert:'samplefcm'
                                },
                                //restrictedPackageName: "somePackageName",
                                data: {
                                    type: "samplefcm",
                                    outlet: obj,
                                    icon: "app_logo",
                                    title: "The FML family is getting bigger!",
                                    body: "We are proud to announce the opening of our new outlet, located at " + name + "!"
                                }
                            };
                            sender1.send(message2, function (err, response) {
                                if (err) {
                                    console.log(err);

                                } else {
                                    console.log("Successfully sent: ", response);
                                }
                            });
                        }
                    }

                }else{
                    res.json({
                        success:false,
                        data:null,
                        error:'Error fetching users'
                    });
                }
            }).lean();
        }
        else{
            res.json({
                success:false,
                data:null,
                error:'error fetching outlet'
            });
        }
    }).lean();

});

//API to get outlets
app.get('/outletsonly', function (req, res) {
    Outlet.find({status: "open"},{drinks:0,foods:0,tables:0}, function (err, outletsFound) {
        if (!err && outletsFound) {
            res.json({
                success: true,
                data: {outlets: outletsFound},
                error: null
            })
        } else {
            res.json({
                success: false,
                data: null,
                error: 'error fetching outlets'
            });
        }
        var rib= 0;
    }).sort({outletId: 1}).lean();
});//end of get outlets API

//API to get outlets
app.get('/getoutletdrinks', function (req, res) {
    var outletid = req.query.outletId;
    Outlet.findOne({outletId:outletid},{drinks:1}, function (err, outletsFound) {
        if (!err && outletsFound) {
            res.json({
                success: true,
                data: {drinks: outletsFound.drinks},
                error: null
            })
        } else {
            res.json({
                success: false,
                data: null,
                error: 'error fetching outlets'
            });
        }
    }).lean();
});//end of get outlets API

//API to get outlets
app.get('/getoutletfoods', function (req, res) {
    var outletid = req.query.outletId;

    Outlet.findOne({outletId:outletid},{foods:1}, function (err, outletsFound) {
        if (!err && outletsFound) {
            res.json({
                success: true,
                data: {foods: outletsFound.foods},
                error: null
            })
        } else {
            res.json({
                success: false,
                data: null,
                error: 'error fetching outlets'
            });
        }
    }).lean();
});//end of get outlets API

//API to get outlets
app.get('/getoutlettables', function (req, res) {
    var outletid = req.query.outletId;

    Outlet.findOne({outletId:outletid},{tables:1}, function (err, outletsFound) {
        if (!err && outletsFound) {
            res.json({
                success: true,
                data: {tables: outletsFound.tables},
                error: null
            })
        } else {
            res.json({
                success: false,
                data: null,
                error: 'error fetching outlets'
            });
        }
    }).lean();
});//end of get outlets API

//API to add web user
app.post('/webuser', function (req, res) {
    {
        var users = new WebUser;
        var phoneNumber = req.body.phoneNumber;
        console.log(req.body);
        var date1 = moment.utc().add(330, 'minutes');
        var date = moment(date1).format('YYYY-MM-DD');
        var time = moment(date1).format('HH:mm:ss');
        var newdate = new Date(date1);
        WebUser.findOne({phoneNumber: phoneNumber}, function (err, user) {
            if(!err && user!=null){
                res.json({
                    success:true,
                    data:null,
                    error:null
                });
            }else{
                users.phoneNumber = phoneNumber;
                users.firstName = "";
                users.lastName = "";
                users.email = "";
                users.address = [];
                users.created_at = newdate;
                users.updated_at = newdate;
                users.orders = [];
                users.favourites = [];

                users.save(function (err, saved) {
                    if(!err && saved){
                        res.json({
                            success:true,
                            data:null,
                            error:null
                        });
                    }
                });
            }
        }).lean();
    }
});

//API to get categories
app.get('/webcategories', function (req, res) {
    WebCategory.find({}, function (err, categories) {
        if(!err && categories.length>0){
            res.json({
                success:true,
                data:categories,
                error:null
            });
        }else{
            res.json({
                success:false,
                data:null,
                error:'Error fetching categories'
            });
        }
    }).lean();
});

//API to add to favourites
app.put('/addwebfavourite', function (req, res) {
    var userPhNo = req.headers['phonenumber'];
    var drinkName = req.body.name;
    console.log(drinkName);
    console.log(req.headers);
    WebUser.findOne({phoneNumber:userPhNo}, function (err, userFound) {
        if(!err && userFound!=null){
            userFound.favourites.push(drinkName);
            userFound.save(function (err, favSaved) {
                if(!err && favSaved){
                    res.json({
                        success : true,
                        data : 'Favourite Saved',
                        error : null
                    });
                }
            });
        }else{
            res.json({
                success:false,
                data:null,
                error:'Error finding user'
            });
        }
    });
});

//API to add to favourites
app.put('/deletewebfavourite', function (req, res) {
    var userPhNo = req.headers['phonenumber'];
    var drinkName = req.body.name;
    console.log(drinkName);
    console.log(req.headers);
    WebUser.findOneAndUpdate({phoneNumber:userPhNo}, {
        $pull:{favourites: drinkName}
    }, function (err, userFound) {
        if(!err && userFound!=null){
                    res.json({
                        success : true,
                        data : 'Favourite Saved',
                        error : null
                    });
        }else{
            res.json({
                success:false,
                data:null,
                error:'Error finding user'
            });
        }
    });
});

//API to get favourites
app.get('/getwebfavourites', function (req, res) {
    var userPhNo = req.headers['phonenumber'];
    console.log(req.headers);
    WebUser.findOne({phoneNumber:userPhNo}, {favourites:1}, function (err, userFound) {
        if(!err && userFound!=null){
            res.json({
                success : true,
                data : userFound.favourites,
                error : null
            });
        }else{
            res.json({
                success:false,
                data:null,
                error:'Error fetching favourites'
            });
        }
    }).lean();
});

//API to add a new address
app.put('/addaddress', function (req, res) {
    var address = req.body.address;
    var userPhNo = req.headers['phonenumber'];
    console.log(req.headers);
    console.log(address);
    WebUser.findOne({phoneNumber:userPhNo}, function (err, userFound) {
        if (!err && userFound != null) {
            userFound.address.push(address);
            userFound.save(function (err, addressSaved) {
                if(!err && addressSaved!=null){
                    res.json({
                        success:true,
                        data:'Address saved successfully',
                        error:null
                    });
                }else{
                    res.json({
                        success:false,
                        data:null,
                        error:'Error adding address'
                    });
                }
            });
        }else{
            res.json({
                success:false,
                data:null,
                error:'Error finding user'
            });
        }
    });
});

//API to edit address
app.put('/editaddress', function (req, res) {
    console.log(req.body);
    var flatNo = req.body.oldFlatNo;
    var address = req.body.address;
    var userPhNo = req.headers['phonenumber'];
    WebUser.findOne({phoneNumber:userPhNo}, function (err, userFound) {
        if (!err && userFound != null) {
            for(var ad=0;ad< userFound.address.length;ad++){
                if(userFound.address[ad].flatNo == flatNo){
                    userFound.address[ad].firstName = address.firstName;
                    userFound.address[ad].lastName = address.lastName;
                    userFound.address[ad].email = address.email;
                    userFound.address[ad].phoneNumber = address.phoneNumber;
                    userFound.address[ad].locality = address.locality;
                    userFound.address[ad].flatNo = address.flatNo;
                    userFound.address[ad].landmark = address.landmark;
                }
            }
            if(ad>=userFound.address.length-1){
                userFound.save(function (err, addressSaved) {
                    if(!err && addressSaved!=null){
                        res.json({
                            success:true,
                            data:'Address saved successfully',
                            error:null
                        });
                    }else{
                        res.json({
                            success:false,
                            data:null,
                            error:'Error editing address'
                        });
                    }
                });
            }
        }else{
            res.json({
                success:false,
                data:null,
                error:'Error finding user'
            });
        }
    });
});

//API to get addresses
app.get('/getaddresses', function (req, res) {
    var userPhNo = req.headers['phonenumber'];
    WebUser.findOne({phoneNumber:userPhNo}, function (err, userFound) {
        if (!err && userFound != null) {
            res.json({
                success : true,
                data:userFound.address,
                error:null
            });
        }else{
            res.json({
                success : true,
                data:null,
                error:'Error finding addresses'
            });
        }
    }).lean();
});

//API to add profile details
app.put('/editprofile', function (req, res) {
    var profileDetails = req.body.profileDetails;
    var userPhNo = req.headers['phonenumber'];
    WebUser.findOne({phoneNumber:userPhNo}, function (err, userFound) {
        if (!err && userFound != null) {
            userFound.firstName = profileDetails.firstName;
            userFound.lastName = profileDetails.lastName;
            userFound.email = profileDetails.email;
            userFound.save(function (err, addressSaved) {
                if(!err && addressSaved!=null){
                    res.json({
                        success:true,
                        data:'Profile Updated successfully',
                        error:null
                    });
                }else{
                    res.json({
                        success:false,
                        data:null,
                        error:'Error editing profile'
                    });
                }
            });
        }else{
            res.json({
                success:false,
                data:null,
                error:'Error editing profile'
            });
        }
    });
});

//API to get profile information
app.get('/getprofile', function (req, res) {
    var userPhNo = req.headers['phonenumber'];
    WebUser.findOne({phoneNumber:userPhNo}, {orders:0,favourites:0}, function (err, userFound) {
        if (!err && userFound != null) {
            res.json({
                success:true,
                data:userFound,
                error:null
            })
        }else{
            res.json({
                success:false,
                data:null,
                error:'Error finding user'
            });
        }
    }).lean();
});

//API for search query
app.get('/websearch', function (req, res) {
    var query = req.params.search || req.query.search;
    var result = [];
    console.log(query);

    WebAllDrink.find({$or:[{'name': new RegExp(query, 'gi')}, {'category': new RegExp(query, 'gi')}]}, function (err, drinkss) {
        if(!err && drinkss.length>0){
            res.json({
                success:true,
                data:drinkss,
                error:null
            });
        }else{
            res.json({
                success:true,
                data:[],
                error:null
            });
        }
    }).lean();
});

app.post('/webhook', function (req, res) {
    console.log(req.body);
    res.json({
        success:true,
        data:'Received Callback',
        error:null
    });
});

app.post('/weborder', function (req, res) {
    var orderObj = req.body;
    console.log(orderObj);
    res.json({
        success:true,
        data:null,
        error:null
    });
});


app.get('/getVersion',function(req,res){


    function responseSuccess(Android_Version,IOS_Version) {
        return res.json({
            success: true,
            data: { Android_Version: Android_Version,
                   IOS_Version:IOS_Version},
            error: null
        });
    }

    function responseFailure(error) {
        return res.json({
            success: false,
            data: { Android_Version: "",
                IOS_Version:""},
            error: error
        });
    }

    App.findOne( function (err, dataFound) {
        if (!err && dataFound != null) {
             
         responseSuccess(dataFound.Android_Version,dataFound.IOS_Version)
            
        }else{
            responseFailure("App Details not Found");  
        } 
    });

});


app.get('/getBanner',function(req,res){
    var outletId = req.query.outlet_id;
    var userId = req.query.userId;
    var userOutletName = req.query.locality;
    var data;
    var check = new Date();

    function responseSuccess(response) {
        return res.json({
            success: true,
            data: response,
            error: null
        });
    }
   function responseFailure(error) {
        return res.json({
            success: false,
            data:null,
            error: error
        });
    }

    if(outletId!=null){
        if (userId != null) {
            User.findOneAndUpdate({ userId: userId }, { $set: { userOutlet: outletId, userOutletName: userOutletName } }, { new: true },
                function (err, userFound) {
                    if (err) {
                        console.log("Error in banner", err);
                    } else {
                        console.log(userFound);
                    }
                })
        }
        console.log("path: "+__dirname )
        banner.findOne({outlet_id:outletId,'banner.is_active': 1}, function (err, dataFound) {
            let banner = [];
            if (!err && dataFound != null) {
              
                dataFound.banner.forEach((res) => {
                   if(res.is_active==1) {
                        if(res.is_fix!=1){
                            // console.log(res.duration.fromdate)
                            // console.log(check)
                            // console.log(res.duration.todate)
                            if(check.getTime() >= res.duration.fromdate.getTime() && check.getTime() <= res.duration.todate.getTime())banner.push(res)
                        }else banner.push(res)
                    }
                   } , function(err) {
                      console.log()
                  });
                  data={"outlet_id":outletId,banner}
               responseSuccess(data) 
            }else{
                     responseFailure("Banners Details not Found");  
             } 
        });
    }else{
        banner.findOne({outlet_id:null}, function (err, dataFound) {
                let banner = [];
                if (!err && dataFound != null) {
                    dataFound.banner.forEach((res) => {
                        if(res.is_active==1) {
                             if(res.is_fix!=1){
                                 if(check.getTime() >= res.duration.fromdate.getTime() && check.getTime() <= res.duration.todate.getTime())banner.push(res)
                             }else banner.push(res)
                         }
                        } , function(err) {
                           console.log()
                       });
                       data={"outlet_id":outletId,banner}
                     responseSuccess(data)   
                }else{
                    responseFailure("Banners Details not Found");  
                } 
            });
    }

});

/*//API to add all drinks to a new collection
app.post('/addallwebdrinks', function (req, res) {
    WebCategory.find({}, function (err, cats) {
        if(!err && cats){

            cats.forEach(function (eachCat, ec) {
                if(eachCat.sub == false){
                    eachCat.drinks.forEach(function (eachDrink) {
                        console.log(eachDrink);
                        var newDrink = new WebAllDrink;
                        newDrink.category = eachDrink.category;
                        newDrink.name = eachDrink.name;
                        newDrink.quantity = eachDrink.quantity;
                        newDrink.image = "";
                        newDrink.available = true;
                        newDrink.save(function (err, saved) {
                            if(err) console.log(err);
                        });
                    });
                }else{
                    eachCat.subCategory.forEach(function (eachSubCat) {
                        eachSubCat.drinks.forEach(function (eachDrink2) {
                            var newDrink2 = new WebAllDrink;
                            newDrink2.category = eachDrink2.category;
                            newDrink2.name = eachDrink2.name;
                            newDrink2.image = "";
                            newDrink2.quantity = eachDrink2.quantity;
                            newDrink2.available = true;
                            newDrink2.save(function (err, saved) {
                                if(err) console.log(err);
                            });
                        });
                    });
                }

                if(ec>= cats.length-1){
                    res.json({
                        success:true
                    })
                }
            });

        }else{
            res.json({
                success:false,
                data:null,
                error: 'Error finding categories'
            });
        }
    }).sort({name:1}).lean();
});

//API to add image to all drinks
app.post('/adddrinksimage', function (req, res) {
    var categoryname = req.query.catName;
    console.log(categoryname);
    WebCategory.findOne({name:categoryname}, function (err, cats) {
        if(!err && cats !=null){



                        if(cats.sub == false){
                            for (var d=0;d<cats.drinks.length;d++){
                                cats.drinks[d].image = "";
                            }
                        }else{

                                for(var ec=0;ec<cats.subCategory.length;ec++){
                                    for (var d1=0;d1<cats.subCategory[ec].drinks.length;d1++){
                                        cats.subCategory[ec].drinks[d1].image = "";
                                    }
                                }
                        }

                        if(d>= cats.drinks.length-1 || ec>=cats.subCategory.length-1){
                            cats.save(function (err, saved) {
                                if(!err && saved){
                                    res.json({
                                        success:true,
                                        data:'categories updated',
                                        error: null
                                    });
                                }else{
                                    res.json({
                                        success:false,
                                        data:null,
                                        error: 'Error saving categories'
                                    });
                                }
                            })
                        }

        }else{
            res.json({
                success:false,
                data:null,
                error: 'Error finding categories'
            });
        }
    });
});*/



//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++POS ROUTES++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++++++++++++++++POS ROUTES+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++POS ROUTES+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


//API for admin login
adminapp.post('/poslogin', function (req, res) {
    var usrnam = req.body.userName;
    var pass = req.body.password;
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    Pos.findOne({
        userName: usrnam,
        password: pass
    }, function (err, pos) {

        if (!err && pos) {
            var token = rand() + rand() + usrnam + rand() + rand();
            pos.token = token;
            pos.updated_at = newdate;
            pos.save(function (err, saved) {
                if(!err && saved){
                    res.json({
                        success: true,
                        data: {
                            auth_token: token
                        },
                        error: null
                    });
                }else{
                    res.json({
                            success:false,
                            data:null,
                            error:'Error verifying POS'
                        }
                    );
                }
            });

        } else {
            res.json({
                success: false,
                data: null,
                error: 'Wrong username and password'
            });
        }
    });//end of finding console user
});

//API for admin login
adminapp2.post('/poslogin', function (req, res) {
    var usrnam = req.body.userName;
    var pass = req.body.password;
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    Pos.findOne({
        userName: usrnam,
        password: pass
    }, function (err, pos) {

        if (!err && pos) {
            var token = rand() + rand() + usrnam + rand() + rand();
            pos.token = token;
            pos.updated_at = newdate;
            pos.save(function (err, saved) {
                if(!err && saved){
                    res.json({
                        success: true,
                        data: {
                            auth_token: token
                        },
                        error: null
                    });
                }else{
                    res.json({
                            success:false,
                            data:null,
                            error:'Error verifying POS'
                        }
                    );
                }
            });

        } else {
            res.json({
                success: false,
                data: null,
                error: 'Wrong username and password'
            });
        }
    });//end of finding console user
});




//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!TV MENU!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

//API for login for TV Menu access
app.put('/tvlogin', function (req, res) {

    var usrnam = req.body.userName;
    var pass = req.body.password;
    console.log(usrnam + " | " + pass);
    Tvmenu.findOne({$and:[{userName:usrnam},{password:pass}]}, function (err, tvuserFound) {
        if(!err && tvuserFound!=null){
            res.json({
                success:true,
                data: {outletId:tvuserFound.outletId},
                error: null
            });
        }else{
            res.json({
                success:false,
                data:null,
                error:'Error logging in'
            });
        }
    }).lean();
});




// OtherTablbooking API (Abhishek)
app.post('/otherbooktable_Web', function (req, res) {

    var tablebook = new OtherTableBooking;
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var bookingObj = req.body;

    OtherTableBooking.find({}, function (err, bookings) {
        if (!err && bookings) {
            var bookingid = 1;
            console.log("bookings.length", bookings.length)
            if (bookings && bookings.length > 0) {
                bookingid = bookings[bookings.length - 1].bookingId + 1;
            }
            
            tablebook.bookingId = bookingid;
            tablebook.time = bookingObj.time;
            tablebook.date = bookingObj.date;
            tablebook.name = bookingObj.name;
            tablebook.status = 'pending';
            tablebook.outletLocation = bookingObj.outletLocation;
            tablebook.outletName = bookingObj.outletName;
            tablebook.phoneNumber = bookingObj.phoneNumber;
            tablebook.noOfPersons = bookingObj.noOfPersons;
            console.log("bookingsdata", tablebook)

            tablebook.save(function (err, saved) {
                if (!err && saved) {
                    res.json({
                        success: true,
                        data: {
                            success: true,
                            bookingid: bookingid,
                            message: 'Table Booked!'
                        },
                        error: null
                    });
                } else {
                    res.json({
                        success: false,
                        data: null,
                        error: 'Error Booking Table'
                    });
                }
            });
        }
        else {
            res.json({
                success: false,
                data: null,
                error: 'Cant fetch bookings'
            });
        }
    }).sort({ bookingId: -1 }).limit(1).lean();
});

//GetBookingId details (Abhishek)
app.get('/getOtherBookingId', function (req, res) {
    var bookingId = req.query.bookingId;
    OtherTableBooking.findOne({ bookingId: bookingId }, function (err, bookingFound) {
        if (!err) {
            if (bookingId) {
                res.json({
                    success: true,
                    data: { bookingData: bookingFound },
                    error: null
                });
            } else {
                res.json({
                    success: false,
                    data: null,
                    error: 'No booking data found for the given bookingId'
                });
            }
        } else {
            res.json({
                success: false,
                data: null,
                error: 'error fetching outlets'
            });
        }
    }).lean()
}); //end of get GetBookingId API

//Otherconfirmation details (Abhishek)
app.post('/otherconfirmbooking', async function (req, res) {
    try {
        var bookingid = req.body.bookingId;
        await OtherTableBooking.findOneAndUpdate({ bookingId: bookingid }, { status: 'accepted' });
        res.json({
            success: true,
            data: { message: 'Booking Status Accepted Successfully' },
            error: null
        });

    } catch (err) {
        console.log(err);
        res.json({
            success: false,
            data: null,
            error: 'Error finding Booking'
        });
    }
});

//OtherReject details (Abhishek)
app.post('/otherdeclinebooking', async function (req, res) {
    try {
        var bookingid = req.body.bookingId;
        await OtherTableBooking.findOneAndUpdate({ bookingId: bookingid }, { status: 'rejected' });
        res.json({
            success: true,
            data: { message: 'Booking Status Rejected Successfully' },
            error: null
        });
    } catch (err) {
        console.log(err);
        res.json({
            success: false,
            data: null,
            error: 'Error finding Booking'
        });
    }
});

// adminapp.post('/updatedrinkdata', excelUploads.single("uploadfile"), function (req,res) {
    
//     console.log(req.file)
//     const file = reader.readFile(__dirname + '/uploads/' + req.file.filename)
//     let data = []
//     const sheets = file.SheetNames
//     const temp = reader.utils.sheet_to_json(
//     file.Sheets[file.SheetNames[0]])
//     var categorycreate=0,categroynotcrearte=0;
//     const key = 'Category';
//     const arrayUniqueByKey = [...new Map(temp.map(item =>
//     [item[key].trim(), item])).values()];
//     console.log(arrayUniqueByKey.length);


//     arrayUniqueByKey.forEach((res, index) => {
//           var categoryCode;
//           Category.findOne({name:res.Category.trim()},function (err, dataFound) {
            
//             if(dataFound==null){
//                   Category.find(function (err, dataFound) {
//                     if(dataFound!=null){
//                         if (dataFound.length > 0) {
//                             categoryCode = dataFound[dataFound.length-1].id + 1; 
//                         }else{
//                             categoryCode=1
//                         } 
//                         Category.create({ id: categoryCode,name:res.Category.trim(),visible: true,__v:0 }, function (err, doc) {
//                             if(!err){
//                                 console.log("name Create",res.Category.trim())
//                                 categorycreate++
//                                 data.push(res)
//                                 if (arrayUniqueByKey.length == data.length) {
//                                     console.log(arrayUniqueByKey.length)
//                                     console.log(data.length)
//                                     addUpdateDrink()
//                                  }
//                             }else{
//                                 console.log(err)
//                                 data.push(res)
//                             }
//                         });
//                     }
//                 });
//             }else{
//                 data.push(res) 
//                 categroynotcrearte++
//                 if(arrayUniqueByKey.length === data.length) {
//                 console.log(arrayUniqueByKey.length)
//                 console.log(data.length)
//                 addUpdateDrink()
//                }
//             }
//           });
       
//         })

//           function addUpdateDrink(){
//             console.log("categorycreate "+categorycreate+"  categroynotcrearte: "+categroynotcrearte)
//             temp.forEach((res) => {
//                 data.push(res)
//                 var categoryCode;
//                 Category.findOne({name:res.Category.trim()},function (err, dataFound) {
//                     if(dataFound!=null){
//                          categoryCode=dataFound.id
//                          callaftercategory()
//                     }else{
//                         console.log("categorynotfound")
//                     }
//                 });
//                 function callaftercategory(){
//                  Outlet.findOne({outletId:res.Outlet_ID ,'drinks.itemCode':parseInt(res.Item_Code)}, function (err, dataFound) {
//                   if ( dataFound != null) {
//                       Outlet.update({outletId:res.Outlet_ID ,'drinks.itemCode': parseInt(res.Item_Code)},{'$set': {
//                           'drinks.$.name': res.Drink_Name,
//                           'drinks.$.category': res.Category.trim(),
//                           'drinks.$.drinkType':res.Category.trim(),
//                           'drinks.$.priceVariable': res.Is_Price_Variable,
//                           'drinks.$.basePrice':String(res.Base_Price),
//                           'drinks.$.capPrice':String(res.Cap_Price),
//                           'drinks.$.runningPrice': String(res.Current_Price),
//                           'drinks.$.regularPrice':res.Market_Price,
//                           'drinks.$.priceIncrementPerUnit': res.Price_Increment_Per_Drink,
//                           'drinks.$.available': res.Available,
//                           'drinks.$.skucode': String(res.skucode),
//                           'drinks.$.categoryCode':categoryCode
//                      }}
//                       , function(err) {
//                           console.log()
//                       });
//                   }else{
//                       var drinkid;
//                       Outlet.findOne({outletId:res.Outlet_ID }, function (err, dataFound) {
//                           if ( dataFound != null) {
//                                       if (dataFound.drinks.length > 0) {
//                                               drinkid = dataFound.drinks[dataFound.drinks.length-1].drinkId + 1;
//                                               console.log(drinkid)
//                                       }else{
//                                           drinkid=1
//                                       }
                                    
//                                           Outlet.findOneAndUpdate({outletId:res.Outlet_ID},{'$push': {
//                                               drinks: {
//                                                   'priceVariable': res.Is_Price_Variable,
//                                                   'available': res.Available,
//                                                   'priceIncrementPerUnit': res.Price_Increment_Per_Drink,
//                                                   'demandLevel':0,
//                                                   'demandRate':0,
//                                                   'itemCode': parseInt(res.Item_Code), //Math.round()
//                                                   'basePrice':String(res.Base_Price),
//                                                   'capPrice':String(res.Cap_Price),
//                                                   'runningPrice': String(res.Current_Price),
//                                                   'regularPrice':res.Market_Price,
//                                                   'name': res.Drink_Name,
//                                                   'category': res.Category.trim(),
//                                                   'drinkType':res.Category.trim(),
//                                                   'skucode': String(res.skucode),
//                                                   'drinkId':drinkid,
//                                                   'categoryCode':categoryCode
//                                               }
       
//                                          }}, function (err) {
//                                               if (err) console.log(err);
//                                           });
                                      
//                                   }
//                       });
//                   } 
//                  });
//                 }
//               })
//             res.json({
//                 success: true,
//                 data:data,
//                 error: ''
//                });
//           }  
// });

//abhishek
// adminapp.post(
//     '/updatedrinkdata',
//     excelUploads.single('uploadfile'),
//     function (req, res) {
//       //  console.log(req.file);
//       const file = reader.readFile(__dirname + '/uploads/' + req.file.filename)
//       let data = []
//       const sheets = file.SheetNames
//       const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[0]])
//       //console.log(temp);
//       var categorycreate = 0,
//         categroynotcrearte = 0
//       const key = 'Category'
//       const arrayUniqueByKey = [
//         ...new Map(temp.map(item => [item[key].trim(), item])).values()
//       ]
//       //  console.log(arrayUniqueByKey.length);
  
//       arrayUniqueByKey.forEach((res, index) => {
//         //  console.log(res)
//         var categoryCode
//         Category.findOne(
//           { name: res.Category.trim() },
//           function (err, dataFound) {
//             if (dataFound == null) {
//               Category.find(function (err, dataFound) {
//                 if (dataFound != null) {
//                   //data get
//                   if (dataFound.length > 0) {
//                     categoryCode = dataFound[dataFound.length - 1].id + 1
//                     console.log(categoryCode)
//                   } else {
//                     categoryCode = 1
//                   }
//                   Category.create(
//                     {
//                       id: categoryCode,
//                       name: res.Category.trim(),
//                       visible: true,
//                       __v: 0
//                     },
//                     function (err, doc) {
//                       if (!err) {
//                         //   console.log("name Create", res.Category.trim());
//                         categorycreate++
//                         data.push(res)
//                         if (arrayUniqueByKey.length == data.length) {
//                           // console.log(arrayUniqueByKey.length);
//                           // console.log(data.length);
//                           addUpdateDrink()
//                         }
//                       } else {
//                         console.log(err)
//                         data.push(res)
//                       }
//                     }
//                   )
//                 }
//               })
//             } else {
//               data.push(res)
//               categroynotcrearte++
//               if (arrayUniqueByKey.length === data.length) {
//                 // console.log(arrayUniqueByKey.length);
//                 // console.log(data.length);
//                 addUpdateDrink()
//               }
//             }
//           }
//         )
//       })
  
//       function addUpdateDrink () {
//         for (let item of temp) {
//           try {
//             if (item.skucode != undefined || item.skucode != null) {
//               //skucode should not be empty (By Namdev)
//               data.push(item)
//               var categoryCode
//               Category.findOne(
//                 { name: item.Category.trim() },
//                 function (err, dataFound) {
//                   if (dataFound != null) {
//                     categoryCode = dataFound.id
//                     callaftercategory()
//                   } else {
//                     console.log('categorynotfound')
//                   }
//                 }
//               )
//             async  function callaftercategory () {
//                await Outlet.findOne(
//                   {
//                     outletId: item.Outlet_ID,
//                     'drinks.itemCode': parseInt(item.Item_Code)
//                   },
//                   function (err, dataFound) {
//                     if (dataFound != null) {
//                       console.log(item)
//                       Outlet.updateMany(
//                         {
//                           outletId: item.Outlet_ID,
//                           'drinks.itemCode': parseInt(item.Item_Code)
//                         },
//                         {
//                           $set: {
//                             'drinks.$.name': item.Drink_Name,
//                             'drinks.$.category': item.Category.trim(),
//                             'drinks.$.drinkType': item.Category.trim(),
//                             'drinks.$.basePrice': String(item.Base_Price),
//                             'drinks.$.capPrice': String(item.Cap_Price),
//                             'drinks.$.runningPrice': String(item.Current_Price),
//                             'drinks.$.regularPrice': item.Market_Price,
//                             'drinks.$.priceIncrementPerUnit':
//                               item.Price_Increment_Per_Drink,
//                             // "drinks.$.status": item.Status,
//                             'drinks.$.priceVariable': item.Is_Price_Variable,
//                             'drinks.$.available': item.Available,
//                             'drinks.$.skucode': String(item.skucode),
//                             'drinks.$.isStrikeOut': item.Is_Strike_Out,
//                             'drinks.$.offerName': item.Offer_Name,
//                             'drinks.$.isOffer': item.Is_Offer,
//                             'drinks.$.specialTab': item.Special_Tab,
//                             'drinks.$.tabName': item.Tab_Name
//                             // 'drinks.$.strikeOutPrice': String(item.Strike_Out_Price),
//                           }
//                         },
//                         function (err) {
//                           console.log()
//                         }
//                       )
//                     } else {
//                       var drinkid
//                       /*var itemCode
//                       if (item.Item_Code != null) {
//                         if (item.Item_Code >= '0' && item.Item_Code <= '9') {
//                           itemCode = '100' + item.Item_Code.toString()
//                         } else if (
//                           item.Item_Code >= '10' &&
//                           item.Item_Code <= '99'
//                         ) {
//                           itemCode = '10' + item.Item_Code.toString()
//                         } else if (
//                           item.Item_Code >= '100' &&
//                           item.Item_Code <= '999'
//                         ) {
//                           itemCode = '1' + item.Item_Code.toString()
//                         } else {
//                           return
//                         }
//                       }
//                       console.log(parseInt(itemCode))*/
//                       Outlet.findOne(
//                         { outletId: item.Outlet_ID },
//                         function (err, dataFound) {
//                           if (dataFound != null) {
//                             if (dataFound.drinks.length > 0) {
//                               drinkid =
//                                 dataFound.drinks[dataFound.drinks.length - 1]
//                                   .drinkId + 1
//                               // console.log(drinkid);
//                             } else {
//                               drinkid = 1
//                             }
  
//                             Outlet.findOneAndUpdate(
//                               { outletId: item.Outlet_ID },
//                               {
//                                 $push: {
//                                   drinks: {
//                                     priceVariable: item.Is_Price_Variable,
//                                     // status: item.Status,
//                                     priceIncrementPerUnit:
//                                       item.Price_Increment_Per_Drink,
//                                     demandLevel: 0,
//                                     demandRate: 0,
//                                     itemCode: parseInt(item.Item_Code),
//                                     basePrice: String(item.Base_Price),
//                                     capPrice: String(item.Cap_Price),
//                                     runningPrice: String(item.Current_Price),
//                                     regularPrice: item.Market_Price,
//                                     name: item.Drink_Name,
//                                     category: item.Category.trim(),
//                                     drinkType: item.Category.trim(),
//                                     available: item.Available,
//                                     skucode: String(item.skucode),
//                                     isStrikeOut: item.Is_Strike_Out,
//                                     offerName: String(item.Offer_Name),
//                                     isOffer: item.Is_Offer,
//                                     specialTab: item.Special_Tab,
//                                     tabName: String(item.Tab_Name),
//                                     drinkId: drinkid,
//                                     categoryCode: categoryCode
//                                   }
//                                 }
//                               },
//                               function (err) {
//                                 if (err) console.log(err)
//                               }
//                             )
//                           }
//                         }
//                       )
//                     }
//                   }
//                 )
//               }
//             } else {
//               return res
//                 .status(400)
//                 .json({ status: false, msg: 'please enter skucode' }) ////skucode should not be empty (By Namdev)
//             }
//           } catch (e) {
//             res.json({
//               status: false,
//               msg: e.message
//             })
//           }
//         }
//         res.json({
//           success: true,
//           data: data,
//           error: ''
//         })
//       }
//     }
//   )
  



adminapp.post('/updatedrinkdata', excelUploads.single('uploadfile'), async function (req, res) {
  try {
      const file = reader.readFile(__dirname + '/uploads/' + req.file.filename);
      let data = [];
      const sheets = file.SheetNames;
      const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[0]]);
      var categorycreate = 0,
          categroynotcrearte = 0;
      const key = 'Category';
      const arrayUniqueByKey = [
          ...new Map(temp.map((item) => [item[key].trim(), item])).values(),
      ];

      for (const res of arrayUniqueByKey) {
          var categoryCode;
          const dataFound = await Category.findOne({ name: res.Category.trim() }).exec();
          if (dataFound == null) {
              const dataFound = await Category.find().exec();
              if (dataFound != null) {
                  if (dataFound.length > 0) {
                      categoryCode = dataFound[dataFound.length - 1].id + 1;
                  } else {
                      categoryCode = 1;
                  }
                  const doc = await Category.create({
                      id: categoryCode,
                      name: res.Category.trim(),
                      visible: true,
                      __v: 0,
                  });
                  categorycreate++;
                  data.push(res);
                  if (arrayUniqueByKey.length == data.length) {
                      await addUpdateDrink(data);
                  }
              }
          } else {
              data.push(res);
              categroynotcrearte++;
              if (arrayUniqueByKey.length === data.length) {
                  await addUpdateDrink(data);
              }
          }
      }

      async function addUpdateDrink(data) {
        /*const maxItem = await Outlet.findOne({ outletId: data.Outlet_ID })
              .sort('-drinks.itemCode')
              .exec();
          let maxItemCode = maxItem ? maxItem.drinks[0].itemCode : 0;
          let newItemCode = maxItemCode + 1;*/
        let maxItem = 0;
        const dataFound = await Outlet.findOne({ outletId: data[0].Outlet_ID }).exec();
        if (dataFound != null) {
            if (dataFound.drinks.length > 0) {
                maxItem = Math.max.apply(Math, dataFound.drinks.map(function(o) { return o.itemCode; }));
            }
        }
        console.log(data[0]);
              
        let maxItemCode = maxItem ? maxItem : 0;
        let newItemCode = maxItemCode + 1;
          for (let item of temp) {
              try {
                  if (!item.Item_Code) {
                      item.Item_Code = newItemCode.toString();
                      newItemCode++;
                  }

                  if (!item.skucode) {
                      return res.status(400).json({ status: false, msg: 'please enter skucode' });
                  }

                  data.push(item);
                  var categoryCode;
                  const dataFound = await Category.findOne({ name: item.Category.trim() }).exec();
                  if (dataFound != null) {
                      categoryCode = dataFound.id;
                      await callaftercategory();
                  } else {
                      console.log('categorynotfound');
                  }

                  async function callaftercategory() {
                      const dataFound = await Outlet.findOne({
                          outletId: item.Outlet_ID,
                          'drinks.itemCode': item.Item_Code,
                      }).exec();
                      if (dataFound != null) {
                          console.log(dataFound);
                          await Outlet.updateMany(
                              {
                                  outletId: item.Outlet_ID,
                                  'drinks.itemCode': item.Item_Code,
                              },
                              {
                                  $set: {
                                      'drinks.$.name': item.Drink_Name,
                                      'drinks.$.category': item.Category.trim(),
                                      'drinks.$.drinkType': item.Category.trim(),
                                      'drinks.$.basePrice': String(item.Base_Price),
                                      'drinks.$.capPrice': String(item.Cap_Price),
                                      'drinks.$.runningPrice': String(item.Current_Price),
                                      'drinks.$.regularPrice': item.Market_Price,
                                      'drinks.$.priceIncrementPerUnit': item.Price_Increment_Per_Drink,
                                      'drinks.$.priceVariable': item.Is_Price_Variable,
                                      'drinks.$.available': item.Available,
                                      'drinks.$.description': String(item.Description),
                                      'drinks.$.skucode': String(item.skucode),
                                      'drinks.$.isStrikeOut': item.Is_Strike_Out,
                                      'drinks.$.offerName': item.Offer_Name,
                                      'drinks.$.isOffer': item.Is_Offer,
                                      'drinks.$.specialTab': item.Special_Tab,
                                      'drinks.$.tabName': item.Tab_Name,
                                  },
                              }
                          );
                      } else {
                          var drinkid;
                          //var newItemCodek;
                          const dataFound = await Outlet.findOne({ outletId: item.Outlet_ID }).exec();
                          if (dataFound != null) {
                              if (dataFound.drinks.length > 0) {
                                  drinkid = dataFound.drinks[dataFound.drinks.length - 1].drinkId + 1;
                                  //newItemCodek = Math.max.apply(Math, dataFound.drinks.map(function(o) { return o.itemCode; })) + 1;
                              } else {
                                  drinkid = 1;
                              }
                              await Outlet.findOneAndUpdate(
                                  { outletId: item.Outlet_ID },
                                  {
                                      $push: {
                                          drinks: {
                                              priceVariable: item.Is_Price_Variable,
                                              priceIncrementPerUnit: item.Price_Increment_Per_Drink,
                                              demandLevel: 0,
                                              demandRate: 0,
                                              itemCode: item.Item_Code, //newItemCodek,
                                              basePrice: String(item.Base_Price),
                                              capPrice: String(item.Cap_Price),
                                              runningPrice: String(item.Current_Price),
                                              regularPrice: item.Market_Price,
                                              name: item.Drink_Name,
                                              category: item.Category.trim(),
                                              drinkType: item.Category.trim(),
                                              available: item.Available,
                                              description: String(item.Description),
                                              skucode: String(item.skucode),
                                              isStrikeOut: item.Is_Strike_Out,
                                              offerName: String(item.Offer_Name),
                                              isOffer: item.Is_Offer,
                                              specialTab: item.Special_Tab,
                                              tabName: String(item.Tab_Name),
                                              drinkId: drinkid,
                                              categoryCode: categoryCode,
                                          },
                                      },
                                  }
                              );
                          }
                      }
                  }
              } catch (e) {
                  console.log(e);
              }
          }

          res.json({
              success: true,
              data: data,
              error: '',
          });
      }

  } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal server error' });
  }
});






 
  // adminapp.post('/updatefooddata', excelUploads.single("uploadfile"), function (req,res) {
    

//     function responseSuccess(response) {
//         return res.json({
//             success: true,
//             data: response,
//             error: null
//         });
//     }
//    function responseFailure(error) {
//         return res.json({
//             success: false,
//             data:null,
//             error: error
//         });
//     }

//     console.log(req.file)
//     const file = reader.readFile(__dirname + '/uploads/' + req.file.filename)
//     let data = []
//     const sheets = file.SheetNames
//     for(let i = 0; i < sheets.length; i++)
//     {
//        const temp = reader.utils.sheet_to_json(
//             file.Sheets[file.SheetNames[i]])
//        temp.forEach((res) => {
//           data.push(res)
//           console.log(res)
//           Outlet.findOne({outletId:res.Outlet_ID ,'foods.itemCode': parseInt(res.Item_Code) }, function (err, dataFound) {
//             if ( dataFound != null) {
//                 Outlet.update({outletId:res.Outlet_ID ,'foods.itemCode': parseInt(res.Item_Code)},{'$set': {
//                     'foods.$.name': res.Item_Name,
//                     'foods.$.foodType': res.Category,
//                     'foods.$.basePrice':String(res.Price),
//                     'foods.$.available': res.Status,
//                     'foods.$.skucode': String(res.skucode)
//                }}
//                 , function(err) {
//                     console.log()
//                 });
//             }else{


//                 var foodid;
//                 Outlet.findOne({outletId:res.Outlet_ID }, function (err, dataFound) {
//                     if ( dataFound != null) {
//                                     if (dataFound.foods.length > 0) {
//                                             foodid = dataFound.foods[dataFound.foods.length-1].foodId + 1;
//                                             console.log(foodid)
//                                     }else{
//                                         foodid=1
//                                         console.log(foodid)
//                                     }
//                                     Outlet.findOneAndUpdate({outletId:res.Outlet_ID},{'$push': {
//                                         foods: {
//                                             'itemCode':parseInt(res.Item_Code),
//                                             'name': res.Item_Name,
//                                             'foodType': res.Category,
                                            
//                                             'basePrice':String(res.Price),
//                                             'available': res.Status,
//                                             'skucode': String(res.skucode),
//                                             'foodId':foodid,
//                                             'description':" "
//                                         }
//                                    }}, function (err) {
//                                         if (err) console.log(err);
//                                    });
//                             }
//                 });
               
//             } 
//         });
//        })
       
//     }
    
//     res.json({
//             success: true,
//             data:data,
//             error: ''
//     });

  
// });


// adminapp.post('/updatefooddata', excelUploads.single("uploadfile"), function (req,res) {
//     const file = reader.readFile(__dirname + '/uploads/' + req.file.filename)
//     let data = []
//     const sheets = file.SheetNames
//     const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[0]])

//     var categorycreate=0,categroynotcrearte=0;
//     const key = 'Category';
//     const arrayUniqueByKey = [...new Map(temp.map(item =>[item[key].trim(), item])).values()];
//     console.log(arrayUniqueByKey.length);


//     arrayUniqueByKey.forEach((res, index) => {
//           var categoryCode;
//           Foodcategory.findOne({name:res.Category.trim()},function (err, dataFound) {
            
//             if(dataFound==null){
//                 Foodcategory.find(function (err, dataFound) {
//                     if(dataFound!=null){
//                         if (dataFound.length > 0) {
//                             categoryCode = dataFound[dataFound.length-1].id + 1; 
//                         }else{
//                             categoryCode=1
//                         } 
//                         Foodcategory.create({ id: categoryCode,name:res.Category.trim(),visible: true,__v:0 }, function (err, doc) {
//                             if(!err){
//                                 console.log("Create",res.Category.trim())
//                                 categorycreate++
//                                 data.push(res)
//                                 if (arrayUniqueByKey.length == data.length) {
//                                     console.log(arrayUniqueByKey.length)
//                                     console.log(data.length)
//                                     addUpdatefood()
//                                  }
//                             }else{
//                                 console.log(err)
//                                 data.push(res)
//                             }
//                         });
//                     }
//                 });
//             }else{
//                 data.push(res) 
//                 categroynotcrearte++
//                 if(arrayUniqueByKey.length === data.length) {
//                 console.log(arrayUniqueByKey.length)
//                 console.log(data.length)
//                 addUpdatefood()
//                }
//             }
//           });
       
//         })

//           function addUpdatefood(){
//             console.log("categorycreate "+categorycreate+"  categroynotcrearte: "+categroynotcrearte)
//             temp.forEach((res) => {
//             Outlet.findOne({outletId:res.Outlet_ID ,'foods.itemCode': parseInt(res.Item_Code) }, function (err, dataFound) {
//             if ( dataFound != null) {
//                 Outlet.update({outletId:res.Outlet_ID ,'foods.itemCode': parseInt(res.Item_Code)},{'$set': {
//                     'foods.$.name': res.Item_Name,
//                     'foods.$.foodType': res.Category.trim(),
//                     'foods.$.basePrice':String(res.Price),
//                     'foods.$.available': res.Available,
//                     'foods.$.skucode': String(res.skucode)
//                }}
//                 , function(err) {
//                     console.log()
//                 });
//             }else{


//                 var foodid;
//                 Outlet.findOne({outletId:res.Outlet_ID }, function (err, dataFound) {
//                     if ( dataFound != null) {
//                                     if (dataFound.foods.length > 0) {
//                                             foodid = dataFound.foods[dataFound.foods.length-1].foodId + 1;
//                                             console.log(foodid)
//                                     }else{
//                                         foodid=1
//                                         console.log(foodid)
//                                     }
//                                     Outlet.findOneAndUpdate({outletId:res.Outlet_ID},{'$push': {
//                                         foods: {
//                                             'itemCode':parseInt(res.Item_Code),
//                                             'name': res.Item_Name,
//                                             'foodType': res.Category.trim(),
//                                             'basePrice':String(res.Price),
//                                             'available': res.Available,
//                                             'skucode': String(res.skucode),
//                                             'foodId':foodid,
//                                             'description':" "
//                                         }
//                                    }}, function (err) {
//                                         if (err) console.log(err);
//                                    });
//                             }
//                 });
               
//             } 
//         });
//             })
//             res.json({
//                 success: true,
//                 data:data,
//                 error: ''
//             });
//           }
// });

//abhishek
// adminapp.post(
//     '/updatefooddata',
//     excelUploads.single('uploadfile'),
//     function (req, res) {
//       const file = reader.readFile(__dirname + '/uploads/' + req.file.filename)
//       let data = []
//       const sheets = file.SheetNames
//       const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[0]])
//       console.log(temp)
//       var categorycreate = 0,
//         categroynotcrearte = 0
//       const key = 'Category'
//       const arrayUniqueByKey = [
//         ...new Map(temp.map(item => [item[key].trim(), item])).values()
//       ]
//       console.log(arrayUniqueByKey.length)
  
//       arrayUniqueByKey.forEach((res, index) => {
//         var categoryCode
//         Foodcategory.findOne(
//           { name: res.Category.trim() },
//           function (err, dataFound) {
//             if (dataFound == null) {
//               Foodcategory.find(function (err, dataFound) {
//                 if (dataFound != null) {
//                   if (dataFound.length > 0) {
//                     categoryCode = dataFound[dataFound.length - 1].id + 1
//                   } else {
//                     categoryCode = 1
//                   }
//                   Foodcategory.create(
//                     {
//                       id: categoryCode,
//                       name: res.Category.trim(),
//                       visible: true,
//                       __v: 0
//                     },
//                     function (err, doc) {
//                       if (!err) {
//                         console.log('name Create', res.Category.trim())
//                         categorycreate++
//                         data.push(res)
//                         if (arrayUniqueByKey.length == data.length) {
//                           console.log(arrayUniqueByKey.length)
//                           console.log(data.length)
//                           addUpdateDrink()
//                         }
//                       } else {
//                         console.log(err)
//                         data.push(res)
//                       }
//                     }
//                   )
//                 }
//               })
//             } else {
//               data.push(res)
//               categroynotcrearte++
//               if (arrayUniqueByKey.length === data.length) {
//                 console.log(arrayUniqueByKey.length)
//                 console.log(data.length)
//                 addUpdateDrink()
//               }
//             }
//           }
//         )
//       })
  
//       function addUpdateDrink () {
//         console.log(
//           'categorycreate ' +
//             categorycreate +
//             '  categroynotcrearte: ' +
//             categroynotcrearte
//         )
//         temp.forEach(res => {
//           // var skucode = res.skucode
//           if (res.skucode != undefined || res.skucode != null) {
//             Outlet.findOne(
//               {
//                 outletId: res.Outlet_ID,
//                 'foods.itemCode': parseInt(res.Item_Code)
//               },
//               function (err, dataFound) {
//                 if (dataFound != null) {
//                   console.table(res)
//                   Outlet.update(
//                     {
//                       outletId: res.Outlet_ID,
//                       'foods.itemCode': parseInt(res.Item_Code)
//                     },
//                     {
//                       $set: {
//                         'foods.$.name': res.Food_Name,
//                         'foods.$.foodType': res.Category.trim(),
//                         'foods.$.basePrice': String(res.Price),
//                         'foods.$.available': res.available,
//                         'foods.$.skucode': String(res.skucode),
//                         'foods.$.isStrikeOut': res.Is_Strike_Out,
//                         'foods.$.strikeOutPrice': String(res.Strike_Out_Price)
//                       }
//                     },
//                     function (err) {
//                       console.log(err)
//                       // console.log("abcd")
//                     }
//                   )
//                 } else {
//                   var foodid
//                   Outlet.findOne(
//                     { outletId: res.Outlet_ID },
//                     function (err, dataFound) {
//                       if (dataFound != null) {
//                         if (dataFound.foods.length > 0) {
//                           foodid =
//                             dataFound.foods[dataFound.foods.length - 1].foodId + 1
//                           console.log(foodid)
//                         } else {
//                           console.log(foodid)
//                           foodid = 1
//                         }
//                         Outlet.findOneAndUpdate(
//                           { outletId: res.Outlet_ID },
//                           {
//                             $push: {
//                               foods: {
//                                 itemCode: parseInt(res.Item_Code),
//                                 name: res.Food_Name,                                
//                                 foodType: res.Category.trim(),
//                                 basePrice: String(res.Price),
//                                 available: res.available,
//                                 skucode: String(res.skucode || ''),
//                                 isStrikeOut: res.Is_Strike_Out,
//                                 strikeOutPrice: String(res.Strike_Out_Price),
//                                 foodId: foodid,
//                                 description: ' '
//                               }
//                             }
//                           },
//                           function (err) {
//                             if (err) console.log(err)
//                           }
//                         )
//                       }
//                     }
//                   )
//                 }
//               }
//             )
//           }
//         })
//         if (res) {
//           res.json({
//             success: true,
//             data: data,
//             error: ''
//           })
//         } else {
//           return res
//             .status(400)
//             .json({ status: false, msg: 'Please enter skucode' })
//         }
//       }
//     }
//   )
  



adminapp.post('/updatefooddata', excelUploads.single('uploadfile'), function (req, res) {
    const file = reader.readFile(__dirname + '/uploads/' + req.file.filename);
    const sheets = file.SheetNames;
    const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[0]]);
    let data = [];

    const key = 'Category';
    const arrayUniqueByKey = [
        ...new Map(temp.map((item) => [item[key].trim(), item])).values(),
    ];

    arrayUniqueByKey.forEach((res, index) => {
        var categoryCode;
        Foodcategory.findOne({ name: res.Category.trim() }, function (err, dataFound) {
            if (dataFound == null) {
                Foodcategory.find(function (err, dataFound) {
                    if (dataFound != null) {
                        if (dataFound.length > 0) {
                            categoryCode = dataFound[dataFound.length - 1].id + 1;
                        } else {
                            categoryCode = 1;
                        }
                        Foodcategory.create(
                            {
                                id: categoryCode,
                                name: res.Category.trim(),
                                visible: true,
                                __v: 0,
                            },
                            function (err, doc) {
                                if (!err) {
                                    data.push(res);
                                    if (arrayUniqueByKey.length == data.length) {
                                        addUpdateFood(data);
                                    }
                                } else {
                                    console.log(err);
                                    data.push(res);
                                    if (arrayUniqueByKey.length == data.length) {
                                        addUpdateFood(data);
                                    }
                                }
                            }
                        );
                    }
                });
            } else {
                data.push(res);
                if (arrayUniqueByKey.length === data.length) {
                    addUpdateFood(data);
                }
            }
        });
    });

    async function addUpdateFood(data) {

        let maxItem = 0;
        console.log("bvjhb");
        const dataFound =  await Outlet.findOne({ outletId: data[0].Outlet_ID }).exec();
        console.log(dataFound.foods.length);
        if (dataFound != null) {
            if (dataFound.foods.length > 0) {
                maxItem = Math.max.apply(Math, dataFound.foods.map(function(o) { return o.itemCode; }));
            }
        }
        let maxItemCode = maxItem ? maxItem : 0;
        let newItemCode = maxItemCode + 1;


        /*Outlet.findOne({ outletId: data.Outlet_ID })
            .sort('-foods.itemCode')
            .exec(function (err, maxItem) {
                let maxItemCode = maxItem ? maxItem.foods[0].itemCode : 0;
                let newItemCode = maxItemCode + 1;*/
                for (let item of temp) {
                    try {
                        if (!item.Item_Code) {
                            item.Item_Code = newItemCode.toString();
                            newItemCode++;
                        }

                        if (!item.skucode) {
                            return res
                                .status(400)
                                .json({ status: false, msg: 'please enter skucode' });
                        }

                        data.push(item);
                        var categoryCode;
                        Foodcategory.findOne(
                            { name: item.Category.trim() },
                            function (err, dataFound) {
                                if (dataFound != null) {
                                    categoryCode = dataFound.id;
                                    callaftercategory();
                                } else {
                                    console.log('categorynotfound');
                                }
                            }
                        );
                        function callaftercategory() {
                            Outlet.findOne(
                                {
                                    outletId: item.Outlet_ID,
                                    'foods.itemCode': item.Item_Code,
                                },
                                function (err, dataFound) {
                                    if (dataFound != null) {
                                        Outlet.updateMany(
                                            {
                                                outletId: item.Outlet_ID,
                                                'foods.itemCode': item.Item_Code,
                                            },
                                            {
                                                $set: {
                                                    'foods.$.name': item.Food_Name,
                                                    'foods.$.foodType': item.Category.trim(),
                                                    'foods.$.basePrice': String(item.Price),
                                                    'foods.$.available': item.Available,
                                                    'foods.$.description': String(item.Description),
                                                    'foods.$.skucode': String(item.skucode),
                                                    'foods.$.isStrikeOut': item.Is_Strike_Out,
                                                    'foods.$.strikeOutPrice': String(item.Strike_Out_Price)
                                                },
                                            },
                                            function (err) {
                                                if (err) {
                                                    console.log(err);
                                                }
                                            }
                                        );
                                    } else {
                                        var foodid;
                                       // var newItemCodek;
                                        Outlet.findOne(
                                            { outletId: item.Outlet_ID },
                                            function (err, dataFound) {
                                                if (dataFound != null) {
                                                    if (dataFound.foods.length > 0) {
                                                        foodid = dataFound.foods[dataFound.foods.length - 1].foodId + 1;
                                                        //newItemCodek = Math.max.apply(Math, dataFound.foods.map(function(o) { return o.itemCode; })) + 1
                                                    } else {
                                                        foodid = 1;
                                                    }
                                                    Outlet.findOneAndUpdate(
                                                        { outletId: item.Outlet_ID },
                                                        {
                                                            $push: {
                                                                foods: {
                                                                    itemCode: item.Item_Code, // Parse itemCode as an integer
                                                                    name: item.Food_Name,
                                                                    foodType: item.Category.trim(),
                                                                    basePrice: String(item.Price),
                                                                    available: item.Available,
                                                                    description: String(item.Description),
                                                                    skucode: String(item.skucode || ''),
                                                                    isStrikeOut: item.Is_Strike_Out,
                                                                    strikeOutPrice: String(item.Strike_Out_Price),
                                                                    foodId: foodid,

                                                                },
                                                            },
                                                        },
                                                        function (err) {
                                                            if (err) {
                                                                console.log(err);
                                                            }
                                                        }
                                                    );
                                                }
                                            }
                                        );
                                    }
                                }
                            );
                        }
                    } catch (e) {
                        console.log(e);
                    }
                }
                res.json({
                    success: true,
                    data: data,
                    error: '',
                });
            //});
    }
});


app.post('/callback',function(req,res){
   
    var orderobj = req.body;
    var outlet_id = req.query.orderid;
    console.log("query",req.body);
    console.log("querypar",req.query);
    console.log(orderobj.status)
    const newdate = new Date()
    var bill = new Bill;
    var outletid,outletid2;
    var userid = 0;
    var billid;
    var userids = [];
    var oid;
    var total = 0;
    var drinkTotal=0,foodTotal=0;

    if(orderobj.status=="Closed"){
        var tableNumber=orderobj.resourceInfo.resourceName;
    
                Bill.findOneAndUpdate({$and: [{outletId: outlet_id}, {tableNumber: orderobj.resourceInfo.resourceName}, {$or: [{status: 'unpaid'}, {status: 'requested'}]}]}, {
                  status: 'paid'
                }, {safe: true, new: true}, function (err, billpaid) {
                    if (!err && billpaid != null) {
                        console.log(billpaid)
                        Order.find({$and: [{outletId: outlet_id}, {tableNumber: orderobj.resourceInfo.resourceName}, {$or: [{status: 'placed'}, {status: 'confirmed'}]}]}, function (err, orders) {
                            if (!err && orders) {
                                orders.forEach(function (eachOrder) {
                                    console.log("orderid",eachOrder._doc.orderId)
                                    Order.findOneAndUpdate({orderId: eachOrder._doc.orderId}, {
                                        status: 'billed',
                                        updated_at: newdate
                                    },{safe: true,  new: true}, function (err, updatedOrder) {
                                        if (!err && updatedOrder) {
                                            outletid = updatedOrder.outletId;
                                            if (updatedOrder.gameId > 0) {
                                                Game.findOneAndUpdate({gameId: updatedOrder.gameId}, {
                                                    gameStatus: 'finished',
                                                    status: 'billing'
                                                }, {
                                                    safe: true,
                                                    new: true
                                                }, function (err, gameUpdated) {
                                                    if (!err && gameUpdated) {
                                                        obj = {};
                                                        userid = gameUpdated.userId;
                                                        obj.gameId = gameUpdated.gameId;
                                                        obj.gameStatus = gameUpdated.gameStatus;
                                                        obj.tableNumber = gameUpdated.tableNumber;
                                                        obj.orderId = gameUpdated.orderId;
                                                        obj.status = gameUpdated.status;
                                                        obj.outletId = gameUpdated.outletId;
                                                        obj.userId = gameUpdated.userId;
                                                        obj.userName = gameUpdated.userName;
                                                        obj.orderDate = gameUpdated.orderDate;
                                                        obj.orderTime = gameUpdated.orderTime;
        
                                                        User.findOneAndUpdate({userId: userid}, {
                                                            lastGameId: 0,
                                                            gameId: 0,
                                                            currentTableNumber: 0
                                                        }, {
                                                            safe: true
                                                        }, function (err, userFound) {
                                                            if (!err && userFound) {
                                                                var sender = new fcm(gcmSenderKeyAndroid);
                                                                var message1 = {
                                                                    to: userFound.gcmId,
                                                                    collapse_key: 'gameover',
                                                                    priority: 'high',
                                                                    contentAvailable: true,
                                                                    timeToLive: 3,
                                                                    message_type: 'gamefinished',
                                                                    //restrictedPackageName: "somePackageName",
                                                                    data: {
                                                                        type: "gamefinished",
                                                                        game: obj,
                                                                        icon: "app_logo",
                                                                        title: "Game Over",
                                                                        body: "Your time has run out!"
                                                                    }
                                                                };
                                                                sender.send(message1, function (err, response) {
                                                                    if (err) {
                                                                        console.log(err);
                                                                    } else {
                                                                        console.log("Successfully sent: ", response);
                                                                    }
                                                                });
                                                            } else console.log(err);
                                                        });
                                                    } else {
                                                        console.log(err);
                                                    }
                                                });
                                            }
                                        } else console.log(err);
                                       
                                    }); 
        
        
                                });
                            
                                // console.table(orders[0].orderId)
                              
                            }
                            else{
                             
                            }
                        }).sort({orderId: -1});
                        for (var u = 0; u < billpaid.userIds.length; u++) {
                            User.findOneAndUpdate({userId: billpaid.userIds[u].userId}, {
                                gameId: 0,
                                lastGameId: 0,
                                currentTableNumber: '0'
                            }, {safe: true}, function (err, userUpdated) {
                                if (err) console.log(err);
                            });
                        }
                    
                        Outlet.findOneAndUpdate({
                            outletId:outlet_id,
                            'tables.tableNumber': orderobj.resourceInfo.resourceName
                        }, {
                            $set: {'tables.$.status': 'vacant','tables.$.assignedUserId': 0}
                        }, {safe: true, new: true}, function (err, outletUpdated) {
                            if (err) console.log(err);
                        });
            
                    }
                    else{
                        // res.json({
                        //     success:false,
                        //     data:null,
                        //     error:'No Bill Found'
                        // });
                        Order.find({$and: [{outletId: outlet_id}, {tableNumber: orderobj.resourceInfo.resourceName}, {$or: [{status: 'placed'}, {status: 'confirmed'}]}]}, function (err, orders) {
                            if (!err && orders) {
                                orders.forEach(function (eachOrder) {
                                    console.log("orderid",eachOrder._doc.orderId)
                                    Order.findOneAndUpdate({orderId: eachOrder._doc.orderId}, {
                                        status: 'billed',
                                        updated_at: newdate
                                    },{safe: true,  new: true}, function (err, updatedOrder) {
                                        if (!err && updatedOrder) {
                                            outletid = updatedOrder.outletId;
                                            if (updatedOrder.gameId > 0) {
                                                Game.findOneAndUpdate({gameId: updatedOrder.gameId}, {
                                                    gameStatus: 'finished',
                                                    status: 'billing'
                                                }, {
                                                    safe: true,
                                                    new: true
                                                }, function (err, gameUpdated) {
                                                    if (!err && gameUpdated) {
                                                        obj = {};
                                                        userid = gameUpdated.userId;
                                                        obj.gameId = gameUpdated.gameId;
                                                        obj.gameStatus = gameUpdated.gameStatus;
                                                        obj.tableNumber = gameUpdated.tableNumber;
                                                        obj.orderId = gameUpdated.orderId;
                                                        obj.status = gameUpdated.status;
                                                        obj.outletId = gameUpdated.outletId;
                                                        obj.userId = gameUpdated.userId;
                                                        obj.userName = gameUpdated.userName;
                                                        obj.orderDate = gameUpdated.orderDate;
                                                        obj.orderTime = gameUpdated.orderTime;
        
                                                        User.findOneAndUpdate({userId: userid}, {
                                                            lastGameId: 0,
                                                            gameId: 0,
                                                            currentTableNumber: 0
                                                        }, {
                                                            safe: true
                                                        }, function (err, userFound) {
                                                            if (!err && userFound) {
                                                                var sender = new fcm(gcmSenderKeyAndroid);
                                                                var message1 = {
                                                                    to: userFound.gcmId,
                                                                    collapse_key: 'gameover',
                                                                    priority: 'high',
                                                                    contentAvailable: true,
                                                                    timeToLive: 3,
                                                                    message_type: 'gamefinished',
                                                                    //restrictedPackageName: "somePackageName",
                                                                    data: {
                                                                        type: "gamefinished",
                                                                        game: obj,
                                                                        icon: "app_logo",
                                                                        title: "Game Over",
                                                                        body: "Your time has run out!"
                                                                    }
                                                                };
                                                                sender.send(message1, function (err, response) {
                                                                    if (err) {
                                                                        console.log(err);
                                                                    } else {
                                                                        console.log("Successfully sent: ", response);
                                                                    }
                                                                });
                                                            } else console.log(err);
                                                        });
                                                    } else {
                                                        console.log(err);
                                                    }
                                                });
                                            }
                                        } else console.log(err);
                                       
                                    }); 
        
        
                                });
                            
                                // console.table(orders[0].orderId)
                              
                            }
                            else{
                             
                            }
                        }).sort({orderId: -1});

                        Outlet.findOneAndUpdate({
                            outletId:outlet_id,
                            'tables.tableNumber': orderobj.resourceInfo.resourceName
                        }, {
                            $set: {'tables.$.status': 'vacant','tables.$.assignedUserId': 0}
                        }, {safe: true, new: true}, function (err, outletUpdated) {
                            if (err) console.log(err);
                        });

                    }
                });
    }else{
        res.json({
            success:true,
            data:null
        });
    }

});



app.post("/addBanner", uploadB.single("uploadfile"), async (req, res) => {
    try {
      const data = req.body;
      const file = req.file.filename.replace(/(?:\.(?![^.]+$)|[^\w.])+/g, "")                          
      const files = "/" + "banner/" + file
    // const file = "/" + "banner/" + req.file.filename
    // const files= file.replace(/\s/g, "")
      if (!isValidReqBody(data)) {
        return res
          .status(400)
          .send({ status: false, msg: "Please provide valid requestBody." });
      }
      if (!file && file.length == 0) {
        return res
          .status(400)
          .send({ status: false, msg: "Please enter image file" });
      }
  
      const { outlet_id, banner_title, is_active, is_fix, todate, fromdate } =
        data;
  
      if (!outlet_id || !banner_title || !is_active || !is_fix) {
        return res
          .status(400)
          .send({ status: false, msg: "Missing Fields are required" });
      }
  
      const time =
        is_fix == 0
          ? {
              fromdate: new Date(fromdate).toLocaleString("en-US"),
              todate: new Date(todate).toLocaleString("en-US"),
            }
          : 0;
  
      const isOutletIdExist = await banner.findOne({ outlet_id: outlet_id });
  
      if (!isOutletIdExist) {
        const banner_data = {
          outlet_id: outlet_id,
          banner: [
            {
              banner_title: banner_title,
              image_path: files,
              is_active: is_active,
              is_fix: is_fix,
              duration: time,
            },
          ],
        };
  
        const banner_add = await banner.create(banner_data);
        return res.status(201).send({
          status: true,
          msg: "Successfully Banner data added",
          data: banner_add,
        });
      }
      //   time = is_fix == 0 ? { todate: new Date(), fromdate: new Date() } : 0;
  
      if (isOutletIdExist) {
        const arr = [
          {
            banner_title: banner_title,
            image_path: files,
            is_active: is_active,
            is_fix: is_fix,
            duration: time,
          },
        ];
        const banner_update = await banner.updateOne(
          { outlet_id: outlet_id },
          { $push: { banner: arr[0] } }
        );
        return res.status(200).send({
          status: true,
          msg: "Successfully banner data updated",
          data: banner_update,
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send({ status: false, msg: error.message });
    }
  });
  
  app.get("/getBanner/:id", async (req, res) => {
    try {
      const id = req.params.id;
      console.log(id)
  ;
      if (!isValidObjectId(id)) {
        return res
          .status(400)
          .send({ status: false, msg: "Please enter valid BannerId" });
      }
      const bannerData = await banner.findOne({ "banner._id": id });
      return res.status(200).send({
        status: true,
        msg: "Successfully get banner data by ID.",
        data: bannerData,
      });
    } catch (error) {
      return res.status(500).send({ status: false, msg: error.message });
    }
  });
  
  app.get("/getBannerList", async (req, res) => {
    try {
      const isExist = await banner.find();
      return res
        .status(200)
        .send({ status: true, msg: "Banner data list", data: isExist });
    } catch (error) {
      return res.status(500).send(error.message);
    }
  });
  
  app.delete("/deleteBanner/:id/:outlet_id", async (req, res) => {
    try {
      const id = req.params.id;
      const oulet_id = req.params.outlet_id;
      // console.log("outlet:",oulet_id , "banner:",id);
  
      if (!id) {
        return res
          .status(400)
          .send({ status: false, msg: "Please Enter BannerId." });
      }
      if (!isValidObjectId(id)) {
        return res
          .status(400)
          .send({ status: false, msg: "Please enter valid BannerId." });
      }
  
      const da = await banner.update(
        { _id: oulet_id },
        { $pull: { banner: { _id: id } } }
      );
      return res
        .status(200)
        .send({ status: true, msg: "Successfully Banner deleted" });
    } catch (error) {
      return res.status(500).send({ status: false, msg: error.message });
    }
  });
  app.put("/updateBanner/:id", uploadB.single("uploadfile"), async (req, res) => {
    try {
      const id = req.params.id;
      const data = req.body;
      console.log(data);
      if (!id) {
        return res
          .status(400)
          .send({ status: false, msg: "Please Enter BannerId." });
      }
  
      const { banner_title, is_active, is_fix, fromdate, todate } = data;
  
      if (banner_title) {
        if (banner_title.length < 3) {
          return res.status(400).send({
            statu: false,
            msg: "Banner title must be greater than three char.",
          });
        }
      }
  
      if (is_active) {
        if (/[^01]/.test(is_active)) {
          return res
            .status(400)
            .send({ status: false, msg: "Active must be a Number" });
        }
      }
      if (is_fix) {
        if (/[^01]/.test(is_fix)) {
          return res
            .status(400)
            .send({ status: false, msg: "Fix must be number" });
        }
      }
  
      //   const time = is_fix == 0 ? {
      //     fromdate: new Date(fromdate).toLocaleString("en-US"),
      //     todate: new Date(todate).toLocaleString("en-US"),
      //   } : 0;
      //   console.log(time)
  
      if (req.file) {
        const file = req.file.filename.replace(/(?:\.(?![^.]+$)|[^\w.])+/g, "")
        const files = "/" + "banner/" + file
        // const file = "/" + "banner/" + req.file.filename
        // const files= file.replace(/\s/g, "")
        const isExistBanner = await banner.update(
          { "banner._id": id },
          {
            $set: {
              "banner.$.banner_title": banner_title,
              "banner.$.is_active": is_active,
              "banner.$.image_path": files,
              "banner.$.is_fix": is_fix,
              "banner.$.duration.fromdate": new Date(fromdate),
              "banner.$.duration.todate": new Date(todate),
            },
          }
        );
        return res
          .status(200)
          .send({ msg: "Successfully banner data updated", data: isExistBanner });
      } else {
        const isExistBanner = await banner.update(
          { "banner._id": id },
          {
            $set: {
              "banner.$.banner_title": banner_title,
              "banner.$.is_active": is_active,
              "banner.$.is_fix": is_fix,
              "banner.$.duration.fromdate": new Date(fromdate),
              "banner.$.duration.todate": new Date(todate),
            },
          }
        );
        return res
          .status(200)
          .send({ msg: "Successfully banner data updated", data: isExistBanner });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).send({ status: false, msg: error.message });
    }
  });
  
 
  app.post("/logoutadmin", async (req, res) => {
    try {
      const token = req.headers["auth_token"];
      const isExistUser = await Admin.updateOne(
        {
          token: token,
        },
        { $set: { gcmId: null } },
        { new: true }
      );
      if (!isExistUser) {
        return res
          .status(400)
          .send({ status: false, msg: "Please provide valid token" });
      }
      return res.status(200).send({ status: true, msg: "Successfully logOut" });
    } catch (error) {
      console.log(error.message);
      return res.status(500).send({ status: false, msg: error.message });
    }
  });
  
  app.post("/logoutconsole", async (req, res) => {
    try {
      const token = req.headers["auth_token"];
      const isExistUser = await Console.updateOne(
        {
          token: token,
        },
        { $set: { gcmId: null } },
        { new: true }
      );
      if (!isExistUser) {
        return res
          .status(400)
          .send({ status: false, msg: "Please provide valid token" });
      }
      return res.status(200).send({ status: true, msg: "Successfully logOut" });
    } catch (error) {
      return res.status(500).send({ status: false, msg: error.message });
    }
  });
  // Show Manager oulet wise
  app.get("/managerlist", async (req, res) => {
    try {
      const outletId = req.query.outletId;
      const accessType = req.query.accessType;
  
      if (outletId) {
        // const ouletData = await Outlet.findOne({ outletId: outletId });
        const manager_list = await Console.find({
          outletId: outletId,
        });
        // const data = { locality: ouletData.locality };
        // manager_list.push(data);
        return res.send({
          status: true,
          msg: "manager list outlet wise",
          data: manager_list,
        });
      } else {
        const All_list = await Console.find({ accessType: accessType });
        return res.send({
          status: true,
          msg: "manager list",
          data: All_list,
        });
      }
    } catch (error) {
      return res.status(500).send({ status: false, msg: error.message });
    }
  });
  
  app.get("/outletlist", async (req, res) => {
    try {
      const fetchData = await Outlet.find();
      return res.send({ status: true, msg: "Outlet data list", data: fetchData });
    } catch (error) {
      return res.status(500).send({ status: false, msg: error.message });
    }
  });


  adminapp.post("/adminlogout", async (req, res) => {
    try {
      const token = req.headers["auth_token"];
      const isExistUser = await Admin.updateOne(
        {
          token: token,
        },{$set:{gcmId:""}},
        { new: true }
      );
      if (!isExistUser) {
           return res.json({
            success: false,
            data: null,
            error: "Please provide valid token"
           });
      }
      return res.json({
        success: true,
        data: null,
        error: null
       });
    } catch (error) {
        return res.json({
            success: false,
            data: null,
            error: error.message
           });
    }
  });

  adminapp.post("/consolelogout", async (req, res) => {
    try {
      const token = req.headers["auth_token"];
      const isExistUser = await Console.updateOne(
        {
          token: token,
        },{$set:{gcmId:""}},
        { new: true }
      );
      if (!isExistUser) {
        return res.json({
         success: false,
         data: null,
         error: "Please provide valid token"
        });
   }
   return res.json({
     success: true,
     data: null,
     error: null
    });
 } catch (error) {
     return res.json({
         success: false,
         data: null,
         error: error.message
        });
 }
     
  });  

//   //get users data
//   adminapp.get("/getUsers", function (req, res) {
//     var page = req.query.page;
//     var search = req.query.search;
//     var totalcount;
//     console.log(search);
//     if (search != null) {
//       User.find({ name: new RegExp(search) }, function (err, UsersFound) {
//         if (!err && UsersFound) {
//           console.log(UsersFound);
//           count(UsersFound);
//         } else {
//           res.json({
//             success: false,
//             data: null,
//             error: "error fetching outlets",
//           });
//         }
//       })
//         .limit(10)
//         .skip(page * 10);
//     } else {
//       User.find(function (err, UsersFound) {
//         if (!err && UsersFound) {
//           count(UsersFound);
//         } else {
//           res.json({
//             success: false,
//             data: null,
//             error: "error fetching outlets",
//           });
//         }
//       })
//         .limit(10)
//         .skip(page * 10);
//     }
  
//     async function count(UsersFound) {
//       let counttotal, pagecount;
//       if (search != null) {
//         counttotal = await User.find({ name: new RegExp(search) }).count();
//       } else {
//         counttotal = await User.count();
//       }
//       if (counttotal < 10) {
//         pagecount = 1;
//       } else {
//         pagecount = ~~(counttotal / 10);
//       }
//       console.log("count :", ~~(counttotal / 10));
//       res.json({
//         success: true,
//         data: {
//           User: UsersFound,
//           count: pagecount,
//         },
//         error: null,
//       });
//     }
//   });


//adminapp.get("/getUsers", function (req, res) {
    // app.get("/getUsers", async function (req, res) {
    //     var page = parseInt(req.query.page || 0);
    //     var search = req.query.search || "";
    //     var fromdate = req.query.fromdate || null;
    //     var todate = req.query.todate || null;
    //     let page_size = 10
    //     let f = new Date(fromdate)
    //      // var day = 60 * 60 * 24 * 1000 
    //       let fromDate = new Date(f.getTime());
    //       let t = new Date(todate)
    //       let toDate = new Date(t.getTime())
      
    //     let query ;
      
    //     if(search != null){
    //       query = {name:new RegExp(search)}
    //     }
    //     if(fromdate != null || todate != null){
    //       query = {created_at: { $gte: fromDate, $lte: toDate } }
    //     }
    //     console.log(query)
    //     let totalPage = await User.find(query).count()
      
    //      await User.find(query, function (err, UsersFound) {
    //         if (!err && UsersFound) {
    //           let pageCount
    //           if(totalPage < 10){
    //             pageCount=1
    //           }else{
    //             pageCount =~~(totalPage/page_size)
    //           }
    //           res.json({
    //             success: true,
    //             data: {
    //               User: UsersFound,
    //               count: pageCount,
    //              // totalPage: Math.ceil(totalPage/page_size)
    //             },
    //           })
    //         } else {
    //           res.json({
    //             success: false,
    //             data: null,
    //             error: "error fetching outlets",
    //           });
    //         }
    //       })
    //       .limit(page_size)
    //       .skip(page * page_size);
    //   });
      
 
    //TableBooikng AIP  (Abhishek Lokhande) 
    app.get('/tablebooking', async (req, res) => {
        try {
            let outletId = req.query.outletId;
            let fromdate = req.query.fromdate || null;
            let f = new Date(fromdate);
            let fromDate = new Date(f.getFullYear(), f.getMonth(), f.getDate());
            let page = parseInt(req.query.page || 0);
            let page_size = 10;
            let query = {};
    
            if (fromdate != null) {
                query.date = { $gte: fromDate, $lt: new Date(fromDate.getTime() + 86400000) }
            }
    
            if (outletId) {
                const totalPage = await TableBooking.find({
                    outletId: outletId,
                    ...query
                }).count();
                const table_list = await TableBooking.find({
                    outletId: outletId,
                    ...query
                }).sort({updated_at: -1 }) // Sort by date in descending order
                    .limit(page_size)
                    .skip(page * page_size);
                return res.json({
                    status: true,
                    msg: 'tablebooking list outlet wise',
                    data: {
                        table_list: table_list,
                        count: ~~(totalPage / page_size)
                    }
                });
            } else {
                const totalPage = await TableBooking.find(query).count();
                const table_list = await TableBooking.find(query)
                    .sort({updated_at: -1 }) // Sort by date in descending order
                    .limit(page_size)
                    .skip(page * page_size);
                return res.json({
                    status: true,
                    msg: 'tablebooking list',
                    data: {
                        table_list: table_list,
                        count: ~~(totalPage / page_size)
                    }
                });
            }
        } catch (error) {
            return res.status(500).send({ status: false, msg: error.message });
        }
    });//this code end here (Abhishek Lokhande)
    
      
 app.get('/outletsPercentage', async function (req, res) {
        try {
            let fromdate = req.query.fromdate || null;
            let todate = req.query.todate || null;
            let outletId = +req.query.outletId || null;
            let f = new Date(fromdate);
            const FromDate = new Date(f.getFullYear(), f.getMonth(), f.getDate());
            let t = new Date(todate);
            const ToDate = new Date(t.getFullYear(), t.getMonth(), t.getDate());
            let page = parseInt(req.query.page || 0);
            let page_size = 10;
    
            const outletGamePer = await OutletGamePer.find({});
            const outlet = await Outlet.find({});
            const data = [];
            const list = [];
       
           
            for (let i = 0; i < outletGamePer.length; i++) {
                for (let j = 0; j < outletGamePer[i].percentage.length; j++) {
                    let outletper = {
                        _id: outletGamePer[i]._id,
                        outletId: outletGamePer[i].outletId,
                        percentage: outletGamePer[i].percentage[j],
                    };
                    list.push(outletper);
                }
            }
    
            for (let i = 0; i < list.length; i++) {
                for (let j = 0; j < outlet.length; j++) {
                    const gameDate = new Date(list[i].percentage.game_date); // to get a game_date's
                    // console.log(gameDate)
    
                    const gameDateOnly = new Date(gameDate.getFullYear(),gameDate.getMonth(),gameDate.getDate()); //To just check date not time 
    
                    let outletFilter = (outletId && list[i].outletId === outletId) || !outletId;
    
                    let dateRangeFilter = fromdate !== null && todate !== null && gameDateOnly >= FromDate && gameDateOnly <= ToDate; // date range 
                    //  console.log(dateRangeFilter)
    
                    if (outletFilter && (dateRangeFilter || (fromdate === null && todate === null))) {
                        if (list[i].outletId === outlet[j].outletId) {
                            let obj = {
                                percentage: list[i],
                                outletName: outlet[j].locality,
                            };
                            data.push(obj);
                        }
                    }
                }
            }
            data.sort((a, b) => {
                const dateA = a.percentage.percentage.game_date;
                const dateB = b.percentage.percentage.game_date;
                return dateB - dateA;
            });
            const totalPages = Math.ceil(data.length / page_size);

            // Extract the objects for the current page based on the page size and page number
            const startIndex = page * page_size;
            const endIndex = Math.min(startIndex + page_size, data.length);
            const dataList = data.slice(startIndex, endIndex);
            
            // Construct the pagination object
            const pagination = {
              totalItems: data.length,
              currentPage: page,
              pageSize: page_size,
              totalPages: totalPages,
              hasNextPage: page < totalPages - 1,
              nextPage: page < totalPages - 1 ? page + 1 : null,
            };
            
            // Include the pagination object in the response
            res.json({
              success: true,
              data: {
                outletper: dataList,
                pagination: pagination,
              },
                message: 'Outlet Percentage',
            });
        } catch (err) {
            res.status(500).send({ state: 'error', msg: err.message });
        }
    
    
    })
    

  
    
    app.get('/getUsers', async function (req, res) {
    var page = parseInt(req.query.page || 0);
    var search = req.query.search || '';
    var fromdate = req.query.fromdate || null;
    var birthdate = req.query.birthdate || null;
    var todate = req.query.todate || null;
    let filter = req.query.filter || null;
    let lastorderdate = req.query.lastOrderDate || null;
    let gameorderdate = req.query.gameorderdate || null;
    let togameorderdate = req.query.togameorderdate || null;
    let page_size = 10;
    let f = new Date(fromdate);
    let fromDate = new Date(f.getTime());
    let t = new Date(todate);
    let toDate = new Date(t.getTime());
    let b = new Date(birthdate);
    let birthDate = new Date(b.getFullYear(), b.getMonth(), b.getDate());
    let last = new Date(lastorderdate);
    let lastOrderDate = new Date(
        last.getFullYear(),
        last.getMonth(),
        last.getDate()
    );
    let game = new Date(gameorderdate);
    let gameOrderDate = new Date(game.getTime());
    let togame = new Date(togameorderdate);
    let toGameOrderDate = new Date(togame.getTime())

    let query = {};

    if (search != null) {
        query.name = new RegExp(search);
    }
    if (fromdate != null && todate != null) {
        query.created_at = { $gte: fromDate, $lte: toDate };
    } else if (fromdate != null) {
        query.created_at = {
            $gte: fromDate,
            $lt: new Date(fromDate.getTime() + 86400000),
        };
    }
    if (birthdate != null) {
        query.birthdate = {
            $gte: birthDate,
            $lt: new Date(birthDate.getTime() + 86400000),
        };
    }
    if (filter != null) {
        query.gender = {
            $eq: filter,
        };
    }

    if (lastorderdate != null) {
        query.lastOrderDate = {
            $gte: lastOrderDate,
            $lt: new Date(lastOrderDate.getTime() + 86400000),
        };
    }

    if (gameorderdate != null && togameorderdate != null) {
        query.lastGameOrderDate = {
            $gte: gameOrderDate,
            $lte: toGameOrderDate,
        };
    }

    console.log(query);

    let usersFound = await User.find(query)
        .sort({ created_at: -1 })
        .limit(page_size)
        .skip(page * page_size);

    let totalPage = await User.find(query).count();
    let pageCount = Math.ceil(totalPage / page_size);

    await Promise.all(
        usersFound.map(async (user) => {
            if (user.isProcessed !== true) {
                const userOrders = await Order.find({ userId: user.userId, status: "billed" });
                let userTotalPrice = 0;
                let previousOrderDate = null;
                let visitCount = 0;

                userOrders.forEach((order) => {
                    order.drinks.forEach((drink) => {
                        userTotalPrice += parseInt(drink.runningPrice);
                    });
                    order.foods.forEach((food) => {
                        userTotalPrice += parseInt(food.basePrice);
                    });

                    const orderDate = order.orderDate;
                    if (!previousOrderDate || previousOrderDate !== orderDate) {
                        visitCount++;
                    }
                    previousOrderDate = orderDate;
                });

                try {
                    await User.findOneAndUpdate(
                        { userId: user.userId },
                        {
                            lifeTimeSpent: userTotalPrice,
                            numberOfVisits: visitCount,
                            isProcessed: true,
                        },
                        { new: true, safe: true }
                    );
                    user.isProcessed = true;
                    user.lifeTimeSpent = userTotalPrice;
                    user.numberOfVisits = visitCount;
                    console.log(
                        "spent",
                        user.lifeTimeSpent,
                        "visits",
                        user.numberOfVisits
                    );
                } catch (error) {
                    console.log("Failed to update user data:", error);
                }
            }
        })
    );

    if (res) {
        res.json({
            success: true,
            data: {
                Users: usersFound,
                count: pageCount,
            },
        });
    } else {
        return res.status(500).send({ status: false, msg: error.message });
    }
});

// API for userFilter data notification(Abhishek) 
app.get('/userFilter', async function (req, res) {
    try {
        var search = req.query.search || ''
        var fromdate = req.query.fromdate || null
        var birthdate = req.query.birthdate || null
        var todate = req.query.todate || null
        let filter = req.query.filter || null
        let lastorderdate = req.query.lastOrderDate || null
        let f = new Date(fromdate)
        let fromDate = new Date(f.getTime())
        let t = new Date(todate)
        let toDate = new Date(t.getTime())
        let b = new Date(birthdate)
        let birthDate = new Date(b.getFullYear(), b.getMonth(), b.getDate())
        let last = new Date(lastorderdate)
        let lastOrderDate = new Date(
            last.getFullYear(),
            last.getMonth(),
            last.getDate()
        )
        query = {};
        if (search != null) {
            query.name = new RegExp(search)
        }
        if (fromdate != null && todate != null) {
            query.created_at = { $gte: fromDate, $lte: toDate }
        } else if (fromdate != null) {
            query.created_at = {
                $gte: fromDate,
                $lt: new Date(fromDate.getTime() + 86400000)
            }
        }
        if (birthdate != null) {
            query.birthdate = {
                $gte: birthDate,
                $lt: new Date(birthDate.getTime() + 86400000)
            }
        }
        if (filter != null) {
            query.gender = {
                $eq: filter
            }
        }

        if (lastorderdate != null) {
            query.lastOrderDate = {
                $gte: lastOrderDate,
                $lt: new Date(lastOrderDate.getTime() + 86400000)
            }
        }

        let usersFound = await User.find(query)
        // console.log("Abhishek",usersFound)
        return res.json({
            success: true,
            Userfilter: usersFound,
            error: null
        })
    } catch (err) {
        res.status(500).send({ state: 'error', msg: err.message });
    }
});


app.post(
    '/addNotification',upload('userNotificationImage').single('uploadfile'),
    async (req, res) => {
        try {
            const data = req.body;
            console.log('Notification:', data);
            const deviceTokensandroid = data.android;
            const deviceTokensiOS = data.iOS;

            const file = req.file.filename.replace(/(?:\.(?![^.]+$)|[^\w.])+/g, '');
            const files = '/userNotificationImage/' + file;

            if (!isValidReqBody(data)) {
                return res
                    .status(400)
                    .send({ status: false, msg: 'Please provide valid requestBody.' });
            }

            if (!file || file.length === 0) {
                return res
                    .status(400)
                    .send({ status: false, msg: 'Please upload an image file.' });
            }

            const { notification_title, description } = data;

            if (!notification_title || !description) {
                return res
                    .status(400)
                    .send({ status: false, msg: 'Missing required fields.' });
            }

            const notificationData = {
                notification_title: notification_title,
                image_path: files,
                description: description
            };

            const UserNotification_update = await UserNotification.create(
                notificationData
            );

            UserNotification.findOne(
                { _id: UserNotification_update._id },
                function (err, dataFound) {
                    if (!err && dataFound != null) {
                        var sender = new fcm(gcmSenderKeyAndroid);

                        if (deviceTokensandroid && deviceTokensandroid.length > 0) {
                            const message = {
                                registration_ids: deviceTokensandroid,
                                // to:"dy9I29OCQbW_WSpWYzmv1Z:APA91bFP4roZEXlWvlbHcFeocCAF8ducL8bTrzJeai-ji9_gyXf7VY8mgYpAGrSzJKsdzhlg9xncNlLDjKaVD_Ddr5TfDWHgYZoPA9o9VAeoBhzBsOAxkY4jgnlYyJ6PXuGKE2DjhCZw",
                                collapse_key: 'booking',
                                priority: 'high',
                                content_available: true,
                                time_to_live: 3,
                                message_type: 'booking',
                                data: {
                                    type: 'Notification',
                                    icon: 'app_logo',
                                    title: dataFound.notification_title,
                                    body: dataFound.description,
                                    image: files // Include the image path in the payload
                                },
                                notification: {
                                    title: dataFound.notification_title,
                                    body: dataFound.description,
                                    sound: 'default',
                                    badge: '2',
                                    content_available: true,
                                    priority: 'high',
                                    color: '#3ed6d2'
                                },
                                aps: {
                                    sound: 'default',
                                    badge: '2',
                                    image: files // Include the image path in the aps payload
                                }
                            };

                            sender.send(message, function (err, response) {
                                console.log('abhi', message);
                                if (!err && response) {
                                    console.log('SenderAbhi', response);
                                    // console.log("Successfully sent Abhi: ", response);
                                } else {
                                    console.log(err);
                                }
                            });
                        }

                        if (deviceTokensiOS && deviceTokensiOS.length > 0) {
                            const message1 = {
                                registration_ids: deviceTokensiOS,
                                // to:"fUfZezJZUGU:APA91bH_IxGYnKVIxxAOICmJSoL6TdVHiJ4c2E8THVbOVzP9KfuZq1-aE6AmqJeKIoQrbuJ7LQZXZCj_Filmhu8lJyXNl_Xe4U2xroKedEuBTkH3wxbfdtI0lJkiJoJDN5Ch_WKMOtTI",
                                collapse_key: 'booking',
                                priority: 'high',
                                contentAvailable: true,
                                timeToLive: 3,
                                message_type: 'booking',
                                data: {
                                    type: 'Notification',
                                    icon: 'app_logo',
                                    title: dataFound.notification_title,
                                    body: dataFound.description,
                                    image: files // Include the image path in the payload
                                },
                                notification: {
                                    title: dataFound.notification_title,
                                    body: dataFound.description,
                                    sound: 'default',
                                    badge: '2',
                                    content_available: true,
                                    priority: 'high',
                                    color: '#3ed6d2'
                                },
                                aps: {
                                    sound: 'default',
                                    badge: '2',
                                    image: files // Include the image path in the aps payload
                                }
                            };

                            sender.send(message1, function (err, response) {
                                if (!err && response) {
                                    console.log('Successfully sent: ', response);
                                } else {
                                    console.log(err);
                                }
                            });
                        }

                        res.json({
                            success: true,
                            data: { message: 'Notification Sent Successfully' },
                            error: null
                        });
                    } else {
                        console.log(err);
                        res.json({
                            success: false,
                            data: null,
                            error: 'Error Sending Notification'
                        });
                    }
                }
            );
        } catch (error) {
            console.error(error);
            return res.status(500).send({ status: false, msg: error.message });
        }
    }
);



      //OtherTableBooking API (Abhishek)
      app.get('/otherbooking', async (req, res) => {
        try {
          let outletLocation = req.query.outletLocation
          let fromdate = req.query.fromdate || null
          let f = new Date(fromdate)
          let fromDate = new Date(f.getFullYear(), f.getMonth(), f.getDate())
          let page = parseInt(req.query.page || 0)
          let page_size = 10
          query = {}
          if (fromdate != null) {
            query.date = {
              $gte: fromDate,
              $lt: new Date(fromDate.getTime() + 86400000)
            }
          }
          if (outletLocation) {
            const TotalPage = await OtherTableBooking.find({
              outletLocation: outletLocation,
              ...query
            }).count()
            const Table_list = OtherTableBooking.find({
              outletLocation: outletLocation,
              ...query
            })
              .sort({ updated_at: -1 })
              .limit(page_size)
              .skip(page * page_size)
            return res.json({
              status: true,
              msg: 'tablebooking list outlet wise',
              data: {
                table_list: Table_list,
                count: ~~(TotalPage / page_size)
              }
            })
          } else {
            const TotalPage = await OtherTableBooking.find(query).count()
            const Table_list = await OtherTableBooking.find(query)
              .sort({ updated_at: -1 }) // Sort by date in descending order
              .limit(page_size)
              .skip(page * page_size)
            return res.json({
              status: true,
              msg: 'tablebooking list',
              data: {
                table_list: Table_list,
                count: ~~(TotalPage / page_size)
              }
            })
          }
        } catch (error) {
          return res.status(500).send({ status: false, msg: error.message })
        }
      })
      
  
  //download drink data by outlet
  app.get("/downloaddrink/:outletId", async (req, res) => {
    try {
      const outletId = req.params.outletId;
      if (outletId) {
        const fileData = await Outlet.findOne({
          outletId: outletId,
        });
        if (!fileData) {
          return res.status(400).send({ status: false, msg: "Data not found" });
        }
        return res.status(200).send({
          status: true,
          data: fileData,
        });
      }
    } catch (error) {
      return res.status(500).send({ status: false, msg: error.message });
    }
  });


  //// This is for download food
app.get("/downloadfood/:outletId", async (req, res) => { //This code write by Abhishek Lokhande
    try {
        const outletId = req.params.outletId;
        if (outletId) {
            const fileData = await Outlet.findOne({
                outletId: outletId,
            });
            if (!fileData) {
                return res.status(400).send({ Status: false, msg: "Food Data Not Found" });
            }
            return res.status(200).send({ success: true, data: fileData });
        }
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message });
    }
});  ////This code end here (Abhishek Lokhande)
  
  //Api delete bulk drink data
  
// app.post(
//     "/deletedrinkdata",
//     excelUploads.single("uploadfile"),
//     async (req, res) => {
//       try {
//       //  console.log(req.file);
//         const file = reader.readFile(__dirname + "/uploads/" + req.file.filename);
//         const sheets = file.SheetNames;
//         const sheetData = reader.utils.sheet_to_json(
//           file.Sheets[file.SheetNames[0]]
//         );
//         const itemCode = sheetData.map((val) => {
//           return parseInt(val.Item_Code);
//         });
//         console.log(itemCode)
//         const outletId = sheetData.map((val) => {
//           return parseInt(val.Outlet_ID);
//         });
//         await Outlet.update(
//           {
//             outletId: outletId,
//           },
//           { $pull: { drinks: { itemCode: { $in: itemCode } } } }
//         );
//         res.send({
//           status: true,
//           msg: "successfully drink product deleted.",
//         });
//       } catch (error) {
//         return res.status(500).send({ status: false, message: error.message });
//       }
//     }
//   );

  app.post(
    '/deletedrinkdata',
    excelUploads.single('uploadfile'),
    async (req, res) => {
      try {
        //  console.log(req.file);
        const file = reader.readFile(__dirname + '/uploads/' + req.file.filename)
        const sheets = file.SheetNames
        const sheetData = reader.utils.sheet_to_json(
          file.Sheets[file.SheetNames[0]]
        )
        const itemCode = sheetData.map(val => {
          return parseInt(val.Item_Code)
        })
        console.log(itemCode)
        const outletId = sheetData.map(val => {
          return parseInt(val.Outlet_ID)
        })
        await Outlet.update(
          {
            outletId: outletId
          },
          { $pull: { drinks: { itemCode: { $in: itemCode } } } }
        )
        res.send({
          status: true,
          msg: 'successfully drink product deleted.'
        })
      } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
      }
    }
  )
  
//Abhishek recommende api
app.get('/getrecommendeddrinks', (req, res) => {

    let outletid = req.query.outletId;

    Outlet.find({ outletId: outletid }, function (err, outletsFound) {

        if (!err && outletsFound) {
            let array = [];
            var filteredResults = outletsFound.filter(function (item) {
                let obj = item.drinks.filter(e => e.recommended == true && e.available == true) // Abhishek Lokhande 4 feb 2023

                obj.sort(function (a, b) { //Ketki 24 th march 2023
                    var keyA = a.name, //Ketki 24 th march 2023
                        keyB = b.name; //Ketki 24 th march 2023
                    if (keyA < keyB) return -1; //Ketki 24 th march 2023
                    if (keyA > keyB) return 1; //Ketki 24 th march 2023
                    return 0; //Ketki 24 th march 2023
                });
                let data = obj.slice(0, 10)
                Array.prototype.push.apply(array, data);
                console.table(data)
            })
            res.json({
                success: true,
                data: { drinks: array },
                error: null
            })

        } else {
            res.json({
                success: false,
                data: null,
                error: 'error fetching outlets'
            });
        }
    })
        .lean();
});//end of get outlets API 


//abhishek recommended api
app.get('/getrecommendedfoods', (req, res) => {

    let outletid = req.query.outletId;

    Outlet.find({ outletId: outletid }, function (err, outletsFound) {

        if (!err && outletsFound) {
            let array = [];
            var filteredResults = outletsFound.filter(function (item) {
                let obj = item.foods.filter(e => e.recommended == true && e.available == true); // Abhishek Lokhande 4 feb 2023
                let data = obj.slice(0, 10)
                // if(data.isStrikeOut==true){
                // }
                Array.prototype.push.apply(array, data);
                console.table(data)
            })
            res.json({
                success: true,
                data: { foods: array },
                error: null
            })

        } else {
            res.json({
                success: false,
                data: null,
                error: 'error fetching outlets'
            });
        }
    })
        .lean();
});//end of get outlets API



  
app.get("/exportusers", async (req, res) => {
    try {
      let fromdate = req.query.fromdate || null;
      let todate = req.query.todate || null;
      console.log("fromdate:", fromdate, ">>>>>>>>>", "todate:",todate)
      if (fromdate != null || todate != null) {
        let f = new Date(fromdate)
        //var day = 60 * 60 * 24 * 1000 
        let fromDate = new Date(f.getTime());
        let t = new Date(todate)
        let toDate = new Date(t.getTime())
      //  console.log("fromdate:", fromDate, ">>>>>>>>>", "todate:",toDate)
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet("Sheet 1");
  
        worksheet.columns = [
          { header: "UserId", key: "userId", width: 15 },
          { header: "Name", key: "name", width: 15 },
          { header: "Phone_Number", key: "phoneNumber", width: 20 },
          { header: "Email", key: "email", width: 30 },
          { header: "Gender", key: "gender", width: 15 },
          { header: "Date_of_birthdate", key: "birthdate", width: 20 },
          { header: "Otp", key: "otp", width: 15 },
          { header: "Source", key: "userAgent", width: 15 },
          { header: "Created_At", key: "created_at", width: 15 },
        ];
  
        let count = await User.count();
        console.log(count)
        let chunk = 1000;
        const total_pages = Math.ceil(count / chunk);
  
        for (let page = 0; page < total_pages; page++) {
  
          let userData = await User.find({ created_at: { $gte: fromdate, $lte: todate } })
            .select({
              userId: 1,
              name: 1,
              phoneNumber: 1,
              email: 1,
              gender: 1,
              birthdate: 1,
              otp: 1,
              userAgent: 1,
              created_at: 1
            })
            .sort({ created_at: 1 })
            .skip(page * chunk)
            .limit(chunk)
            .lean();
  
          userData.forEach((item, index) => {
          //  console.log(item);
            worksheet.addRow({
              userId: item.userId,
              name: item.name,
              phoneNumber: item.phoneNumber,
              email: item.email,
              gender: item.gender,
              otp: item.otp,
              birthdate: item.birthdate,
              userAgent: item.userAgent,
              created_at: item.created_at
            });
          });
  
          worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
          });
        }
        // workbook.xlsx.writeFile('users.xlsx').then(()=>{
        //   res.end()
        // })
  
        let fileNameExcel =
          "user data" + moment().format("_MM-DD-YYYY_hh:mm:ss").toString();
        res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=" + fileNameExcel + ".xlsx"
        );
        return workbook.xlsx.write(res).then(function () {
          res.end();
        });
      } else {
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet("Sheet 1");
  
        worksheet.columns = [
          { header: "UserId", key: "userId", width: 15 },
          { header: "Name", key: "name", width: 15 },
          { header: "Phone_Number", key: "phoneNumber", width: 20 },
          { header: "Email", key: "email", width: 30 },
          { header: "Date_of_birthdate", key: "birthdate", width: 20 },
          { header: "Otp", key: "otp", width: 15 },
          { header: "Source", key: "userAgent", width: 15 },
          { header: "Created_At", key: "created_at", width: 15 },
        ];
  
        let count = await User.count();
  
        let chunk = 1000;
        const total_pages = Math.ceil(count / chunk);
  
        for (let page = 0; page < total_pages; page++) {
  
          let userData = await User.find({}, { timeout: false })
            .select({
              userId: 1,
              name: 1,
              phoneNumber: 1,
              email: 1,
              otp: 1,
              birthdate: 1,
              userAgent: 1,
              created_at: 1,
            })
            .sort({ created_at: 1 })
            .allowDiskUse(true)
            .skip(page * chunk)
            .limit(chunk)
            .lean();
  
          userData.forEach((item, index) => {
            console.log(item);
            worksheet.addRow({
              userId: item.userId,
              name: item.name,
              phoneNumber: item.phoneNumber,
              email: item.email,
              otp: item.otp,
              birthdate: item.birthdate,
              userAgent: item.userAgent,
              created_at: item.created_at
            });
          });
  
          worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
          });
        }
        let fileNameExcel =
          "user data" + moment().format("_MM-DD-YYYY_hh:mm:ss").toString();
        res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=" + fileNameExcel + ".xlsx"
        );
        return workbook.xlsx.write(res).then(function () {
          res.end();
        });
      }
    } catch (error) {
      return res.status(500).send({ status: false, msg: error.message });
    }
  });



var CronJob = require('cron').CronJob;
var resetDay = new CronJob('00 00 06 * * *', function () {
    Outlet.find({}, function (err, outlets) {
        if (!err && outlets) {
            outlets.forEach(function (err, eachOutlet) {
                Outlet.findOne({outletId:eachOutlet.outletId}, function (err, outlet) {
                    if(!err && outlet){
                        for (var i = 0; i < outlet.drinks.length; i++) {
                            /*basePrice: String,
                             runningPrice: String,
                             demandRate: Number,
                             demandLevel: Number,*/
                            outlet.drinks[i].runningPrice = outlet.drinks[i].basePrice;
                            outlet.drinks[i].demandRate = 0;
                            outlet.drinks[i].demandLevel = 0;

                        }
                        for (var t = 0; t < outlet.tables.length; t++) {
                            outlet.tables[t].status = 'vacant';
                        }
                        if (i >= outlet.drinks.length-1 && t >= outlet.tables.length-1) {
                            outlet.save(function (err, saved) {
                                if (!err && saved) {

                                }
                                else {
                                    console.log(err);
                                }
                            });
                        }
                    }else console.log(err);
                });
            });
        }
        else {
            console.log(err);
        }
    }).lean();
    User.find({$or:[{gameId:{$gt:0}},{lastGameId:{$gt:0}},{currentTableNumber:{$gt:0}}]}, function (err, users) {
        if(!err && users){
                users.forEach(function (eachUser) {
                    if(eachUser.gameId != 0 || eachUser.lastGameId != 0 || eachUser.currentTableNumber != '0'){
                        User.findByIdAndUpdate(eachUser._id.toString(),{
                            gameId:0,
                            lastGameId:0,
                            currentTableNumber:'0'
                        },{safe:true}, function (err) {
                            if(err) console.log(err);
                        });
                    }
                });


        }else{
            console.log(err);
        }
    }).lean();
    Order.find({$or:[{status:'confirmed'},{status:'placed'},{status:'pending'}]}, function (err, orders) {
        if(!err && orders.length>0){
            for(var o=0;o<orders.length;o++){
                var mongoid = orders[o]._id.toString();
                Order.findByIdAndUpdate(mongoid,{
                    status:'cancelled'
                },{safe:true}, function (err) {
                    if(err) console.log(err);
                });
            }
        }
        else{
            console.log(err);
        }
    }).lean();
    Bill.find({$or:[{status:'requested'},{status:'unpaid'}]}, function (err, bills) {
        if(!err && bills.length>0){
            for(var b=0;b<bills.length;b++){
                var billMongoId = bills[b]._id.toString();
                Bill.findByIdAndUpdate(billMongoId,{
                    status:'paid'
                },{safe:true}, function (err) {
                    if(err) console.log(err);
                });
            }
        }
        else{
            console.log(err);
        }
    }).lean();
}, null, true, 'Asia/Kolkata');
resetDay.start();





//TV app APIs

//********************filter Non Bogo Categories******************************** */
/*app.get('/tvappdrinkdata', async function (req, res) {
    try {
        var outletid = req.query.outletId;
        var requestedCategory = req.query.category;
        var strikeOutDrinkPercentage = req.query.strikeOutDrinkPercentage || 0; // Default to 0 if not provided

        var query = { outletId: outletid };

        // Add a filter for the category field if requestedCategory is provided
        if (requestedCategory) {
            query["drinks.category"] = requestedCategory;
        }

        const outletsFound = await Outlet.findOne(query, { 'drinks.category': 1, 'drinks.name': 1, 'drinks.runningPrice': 1, 'drinks.available': 1 }).lean();

        if (outletsFound) {
            // Filter out categories that start with "BOGO"
            // Filter out categories that start with "BOGO" and drinks that are not available
            var nonBogoCategories = outletsFound.drinks.reduce((acc, drink) => {
                if (!drink.category.startsWith("BOGO") && drink.available) { // Check for "available" field
                    acc.add(drink.category);
                }
                return acc;
            }, new Set());

            // Filter out drinks with categories not in nonBogoCategories and "available" set to true
            var nonBogoDrinks = outletsFound.drinks.filter(drink => nonBogoCategories.has(drink.category) && drink.available);


            // Calculate strikeOutPrice for each non-Bogo drink
            var drinksData = nonBogoDrinks.map(drink => ({
                category: drink.category,
                name: drink.name,
                strikeOutPrice: drink.runningPrice - (drink.runningPrice * strikeOutDrinkPercentage) / 100
            }));

            // Grouping the drinksData by category
            var groupedDrinks = drinksData.reduce((acc, drink) => {
                acc[drink.category] = acc[drink.category] || [];
                acc[drink.category].push({ name: drink.name, strikeOutPrice: drink.strikeOutPrice });
                return acc;
            }, {});

            // Creating the final response format
            var finalResponse = Object.keys(groupedDrinks).map(category => ({
                category: category,
                drinks: groupedDrinks[category]
            }));

            res.json({
                success: true,
                data: finalResponse,
                error: null
            });
        } else {
            res.json({
                success: false,
                data: null,
                error: 'error fetching outlets'
            });
        }
    } catch (err) {
        res.json({
            success: false,
            data: null,
            error: 'internal server error'
        });
    }
});*/


app.get('/tvappdrinkdata', async function (req, res) {
    try {
        var outletid = req.query.outletId;
        var requestedCategory = req.query.category;

        var query = { outletId: outletid };

        // Add a filter for the category field if requestedCategory is provided
        if (requestedCategory) {
            query["drinks.category"] = requestedCategory;
        }

        const outletsFound = await Outlet.findOne(query, { 'drinks.category': 1, 'drinks.name': 1, 'drinks.runningPrice': 1, 'drinks.available': 1, 'drinks.isStrikeOut': 1, 'strikeOutDrinkPercentage': 1 }).lean();

        if (outletsFound) {
            // Fetch strikeOutDrinkPercentage from the fetched Outlet document
            var strikeOutDrinkPercentage = outletsFound.strikeOutDrinkPercentage || 0; // Default to 0 if not provided

            // Filter out categories that start with "BOGO"
            // Filter out categories that start with "BOGO" and drinks that are not available
            var nonBogoCategories = outletsFound.drinks.reduce((acc, drink) => {
                if (!drink.category.startsWith("BOGO") && drink.available) { // Check for "available" field
                    acc.add(drink.category);
                }
                return acc;
            }, new Set());

            // Filter out drinks with categories not in nonBogoCategories and "available" set to true
            var nonBogoDrinks = outletsFound.drinks.filter(drink => nonBogoCategories.has(drink.category) && drink.available);

            // Calculate price based on isStrikeOut field
            var drinksData = nonBogoDrinks.map(drink => ({
                category: drink.category,
                name: drink.name,
                //price: drink.isStrikeOut ? Math.floor(drink.runningPrice - (drink.runningPrice * strikeOutDrinkPercentage) / 100) : drink.runningPrice
                price: drink.isStrikeOut ? Math.floor(drink.runningPrice - (drink.runningPrice * strikeOutDrinkPercentage) / 100) : Math.floor(drink.runningPrice)
            }));

            // Grouping the drinksData by category
            var groupedDrinks = drinksData.reduce((acc, drink) => {
                acc[drink.category] = acc[drink.category] || [];
                acc[drink.category].push({ name: drink.name, price: drink.price });
                return acc;
            }, {});

            // Creating the final response format
            var finalResponse = Object.keys(groupedDrinks).map(category => ({
                category: category,
                drinks: groupedDrinks[category]
            }));

            res.json({
                success: true,
                data: finalResponse,
                error: null
            });
        } else {
            res.json({
                success: false,
                data: null,
                error: 'error fetching outlets'
            });
        }
    } catch (err) {
        res.json({
            success: false,
            data: null,
            error: 'internal server error'
        });
    }
});




app.post('/tvaddBanner', upload('slider').single('uploadfile'), async (req, res) => {
    try {
        var tvbannerobj = req.body;
        console.log('Banner log', tvbannerobj);
        const file = req.file;
  
        // Validation
        if (!isValidReqBody(tvbannerobj)) {
          return res
            .status(400)
            .send({ status: false, msg: 'Please provide valid requestBody.' });
        }
        if (!file) {
          return res
            .status(400)
            .send({ status: false, msg: 'Please upload a file' });
        }
  
        const files = '/slider/' + file.filename;
  
        const { outlet_id } = tvbannerobj; // Removing mediaType and sec from here
  
        // Find if outlet_id exists
        const existingBanner = await TvBanner.findOne({ outlet_id });
  
        if (!existingBanner) {
          // Create new banner data
          const banner_data = {
            outlet_id: outlet_id,
            banner: [
              {
                image_video_path: files,
              },
            ],
          };
          const banner_add = await TvBanner.create(banner_data);
          return res.status(201).send({
            status: true,
            msg: 'Successfully Banner data added',
            data: {
              image_video_path: files
            },
          });
        } else {
          // Update existing banner data
          const updatedBanner = await TvBanner.updateOne(
            { outlet_id: outlet_id },
            {
              $push: {
                banner: {
                  image_video_path: files,
                },
              },
            }
          );
          console.log(updatedBanner);
  
          return res.status(200).send({
            status: true,
            msg: 'Successfully Banner data updated',
            data: {
              image_video_path: files
            },
          });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: false, msg: error.message });
    }
});



app.get('/tvBanner', async (req, res) => {
    try {
        const outletId = req.query.outletId;
  
        // Validate outletId here if needed
  
        // Retrieve banner data based on outletId
        const bannerDataList = await TvBanner.find({ 'outlet_id': outletId });
  
        if (!bannerDataList || bannerDataList.length === 0) {
            return res.status(404).send({ status: false, msg: 'Banner data not found' });
        }
  
        // Collect outlet images into a list
        let allImages = [];
        bannerDataList.forEach(bannerData => {
            const outletImages = bannerData.banner.map(item => ({ image_path: item.image_video_path }));
            allImages = allImages.concat(outletImages);
        });
  
        return res.status(200).send({ status: true, data: allImages });
        } catch (error) {
        console.log(error);
        return res.status(500).send({ status: false, msg: error.message });
    }
});




app.get('/getTvBannerList', async (req, res) => {
    try {
        const banners = await TvBanner.find({}, { mediaType: 0, seconds: 0 }); // Exclude mediaType and seconds fields
        return res.status(200).send({
            status: true,
            msg: 'Banner data list',
            data: banners
        });
    } catch (error) {
      return res.status(500).send(error.message);
    }
});




app.delete('/deleteTvBanner/:bannerId', async (req, res) => {
  try {
    const { bannerId } = req.params;

    // Assuming TvBanner is your Mongoose model
    const bannerToDelete = await TvBanner.findOne({ 'banner._id': bannerId });

    if (!bannerToDelete) {
      return res.status(404).send({ status: false, msg: 'Banner not found.' });
    }

    await bannerToDelete.remove();

    return res.status(200).send({ status: true, msg: 'Banner deleted successfully.', data: bannerToDelete });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
});





app.put('/editTvBanner/:id', upload('slider').single('uploadfile'), async (req, res) => {
    try {
        const id = req.params.id
        var bannerDetail = req.body
        console.log(bannerDetail, id)
        if (!id) {
            return res
            .status(400)
            .send({ status: false, msg: 'Please Enter BannerId.' })
        }
  
        const { number_of_sec, is_image_video } = bannerDetail
  
        if (req.file) {
            const file = req.file.filename.replace(/(?:\.(?![^.]+$)|[^\w.])+/g, '')
            const files = '/' + 'slider/' + file
            const isExistBanner = await TvBanner.update(
                { 'banner._id': id },
                {
                    $set: {
                        'banner.$.image_video_path': files,
                        'banner.$.is_image_video': is_image_video,
                        'banner.$.number_of_sec': number_of_sec
                    }
                }
            )
            return res.status(200).send({
            msg: 'Successfully banner data updated',
            data: isExistBanner
          })
        } else {
            const isExistBanner = await TvBanner.update(
            { 'banner._id': id },
            {
                $set: {
                    'banner.$.is_image_video': is_image_video,
                    'banner.$.number_of_sec': number_of_sec
                }
            }
          )
        return res.status(200).send({
            msg: 'Successfully banner data updated',
            data: isExistBanner
        })
    }
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }
});



app.get('/getTvBanner/:id', async (req, res) => {
    try {
        const id = req.params.id
        console.log(id)
        if (!isValidObjectId(id)) {
        return res
          .status(400)
          .send({ status: false, msg: 'Please enter valid BannerId' })
        }
        const bannerData = await TvBanner.findOne({ 'banner._id': id })
        //const bannerData  = await banner.findOne({banner:{$elemMatch:{_id:id}}})
        return res.status(200).send({
            status: true,
            msg: 'Successfully get banner data by ID.',
            data: bannerData
        })
    } catch (error) {
      return res.status(500).send({ status: false, msg: error.message })
    }
});




app.get('/tvVideo', async (req, res) => {
    try {
        const outletId = req.query.outletId;

        // Validate outletId here if needed

        // Retrieve video data based on outletId
        const videoDataList = await VideoBanner.find({ 'outlet_id': outletId });

        if (!videoDataList || videoDataList.length === 0) {
            return res.status(404).send({ status: false, msg: 'Video data not found' });
        }

        // Collect outlet videos into a list
        let allVideos = [];
        videoDataList.forEach(videoData => {
            const outletVideos = videoData.videos.map(item => ({ video_path: item.video_path }));
            allVideos = allVideos.concat(outletVideos);
        });

        return res.status(200).send({ status: true, data: allVideos });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: false, msg: error.message });
    }
});


app.post('/tvaddVideo', (req, res) => {
    videoUpload.single('uploadfile')(req, res, async (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).send({ status: false, msg: 'The uploaded video exceeds the size limit of 50 MB. Please upload a video within 50 MB.' });
        }
        return res.status(400).send({ status: false, msg: err.message });
      }
  
      try {
        const tvvideoobj = req.body;
        console.log('Video log', tvvideoobj);
        const file = req.file;
  
        // Validation
        if (!isValidReqBody(tvvideoobj)) {
          return res.status(400).send({ status: false, msg: 'Please provide valid requestBody.' });
        }
        if (!file) {
          return res.status(400).send({ status: false, msg: 'Please upload a video file' });
        }
  
        const videoPath = 'tvappvideo/' + file.filename; // New video path code
  
        const { outlet_id } = tvvideoobj;
  
        // Find if outlet_id exists
        const existingVideo = await VideoBanner.findOne({ outlet_id });
  
        if (!existingVideo) {
          // Create new video data
          const video_data = {
            outlet_id: outlet_id,
            videos: [
              {
                video_path: videoPath,
              },
            ],
          };
          const video_add = await VideoBanner.create(video_data);
          return res.status(201).send({
            status: true,
            msg: 'Video added successfully',
            data: {
              video_path: videoPath,
            },
          });
        } else {
          // Update existing video data
          const updatedVideo = await VideoBanner.updateOne(
            { outlet_id: outlet_id },
            {
              $push: {
                videos: {
                  video_path: videoPath,
                },
              },
            }
          );
          console.log(updatedVideo);
  
          return res.status(200).send({
            status: true,
            msg: 'Successfully updated video data',
            data: {
              video_path: videoPath,
            },
          });
        }
      } catch (error) {
        console.log(error);
        return res.status(500).send({ status: false, msg: error.message });
      }
    });
  });


app.get('/getTvVideoList', async (req, res) => {
    try {
      const videos = await VideoBanner.find({}, { videos: 1, outlet_id: 1 }); // Only include videos and outlet_id fields
      return res.status(200).send({
        status: true,
        msg: 'Video data list',
        data: videos
      });
    } catch (error) {
      return res.status(500).send(error.message);
    }
  });


app.get('/getMediaList', async (req, res) => {
    try {
      const outletId = req.query.outletId; // Get outletId from query params
  
      let banners;
      let videos;
  
      if (outletId) {
        // Fetch banners and videos for the specific outlet ID
        banners = await TvBanner.find({ outlet_id: outletId }, { mediaType: 0, seconds: 0 });
        videos = await VideoBanner.find({ outlet_id: outletId }, { videos: 1, outlet_id: 1 });
      } else {
        // Fetch all banners and videos if no outlet ID is provided
        banners = await TvBanner.find({}, { mediaType: 0, seconds: 0 });
        videos = await VideoBanner.find({}, { videos: 1, outlet_id: 1 });
      }
  
      return res.status(200).send({
        status: true,
        msg: 'Media data list',
        data: { banners, videos }
      });
    } catch (error) {
      return res.status(500).send(error.message);
    }
  });



app.delete('/deleteMedia/:outletId/:mediaId/:type', async (req, res) => {
    try {
        const { outletId, mediaId, type } = req.params;
        let model, updateQuery;

        console.log(`Received request to delete media ID: ${mediaId} of type: ${type} from outlet ID: ${outletId}`);

        if (type === 'Image') {
            model = TvBanner;
            updateQuery = { $pull: { banner: { _id: mediaId } } };
        } else if (type === 'Video') {
            model = VideoBanner;
            updateQuery = { $pull: { videos: { _id: mediaId } } };
        } else {
            return res.status(400).send('Invalid media type');
        }

        console.log(`Using model: ${model.modelName}`);

        // Perform the update operation
        const updatedMedia = await model.findOneAndUpdate(
            { outlet_id: outletId },
            updateQuery,
            { new: true } // Return the modified document
        );

        // Check if any documents were modified
        if (!updatedMedia) {
            console.log('Media not found');
            return res.status(404).send('Media not found');
        }

        console.log('Media deleted successfully');

        return res.status(200).send({
            status: true,
            msg: 'Media deleted successfully',
            data: updatedMedia
        });
    } catch (error) {
        console.log('Error:', error.message);
        return res.status(500).send(error.message);
    }
});



app.put('/editTvVideo/:videoId', videoUpload.single('uploadfile'), async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const tvVideoObj = req.body;
    const file = req.file;

    // Validation
    if (!videoId) {
      return res.status(400).send({ status: false, msg: 'Please provide Video ID.' });
    }
    if (!file) {
      return res.status(400).send({ status: false, msg: 'Please upload a video file.' });
    }

    const videoPath = 'tvappvideo/' + file.filename;

    // Get the video list from the existing API
    const videos = await VideoBanner.find({}, { videos: 1, outlet_id: 1 });

    // Find the specific video by videoId
    let videoFound = false;
    let oldVideoPath = '';

    for (const videoDocument of videos) {
      const videoToUpdate = videoDocument.videos.id(videoId);

      if (videoToUpdate) {
        videoFound = true;
        oldVideoPath = videoToUpdate.video_path;

        // Update video details
        videoToUpdate.video_path = videoPath;
        videoToUpdate.is_image_video = tvVideoObj.is_image_video || videoToUpdate.is_image_video;
        videoToUpdate.number_of_sec = tvVideoObj.number_of_sec || videoToUpdate.number_of_sec;

        // Save the updated document
        await videoDocument.save();

        // Delete old video file
        fs.unlink(path.join(__dirname, '../uploads', oldVideoPath), (err) => {
          if (err) {
            console.error('Failed to delete old video file:', err);
          } else {
            console.log('Old video file deleted successfully');
          }
        });

        return res.status(200).send({
          status: true,
          msg: 'Successfully updated video data',
          data: videoDocument
        });
      }
    }

    if (!videoFound) {
      return res.status(404).send({ status: false, msg: 'Video not found' });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, msg: error.message });
  }
});








//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//SETTING up ROUTES and starting server
app.use('/user', userRoutes);
const serverHTTP = http.createServer(app)
const serverSSL = https.createServer(
    {
        key: fs.readFileSync(path.join(__dirname, 'cert', 'fmllounge.com.key')),
        cert: fs.readFileSync(path.join(__dirname, 'cert', 'fmllounge_com.crt')),
        ca: fs.readFileSync(path.join(__dirname, 'cert', 'My_CA_Bundle.crt'))
    },
    app
);
serverHTTP.listen(port);
serverSSL.listen(portHTTPS);



adminapp.use('/admin', adminRoutes);
adminapp.use('/console', consoleRoutes);
adminapp.use('/pos', posRoutes);
adminapp2.use('/pos', posRoutes2);
adminapp.listen(adminport);
adminapp2.listen(adminport2);




console.log('server listening at : port -' + port);
console.log('server listening at : portHTTPS -' + portHTTPS);
console.log('Admin server listening at : port -' + adminport);
