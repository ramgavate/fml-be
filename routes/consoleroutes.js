/**
 * Created by ritej on 5/9/2017.
 */

//Library Inits
var express = require('express');
var mongoose = require('mongoose');
var moment = require('moment');
var moment1 = require('moment-timezone');
var fcm = require('fcm-node');
var formidable = require('formidable');
var fs = require('fs');
moment1.tz.setDefault('Asia/Kolkata');


//Model Objects for DB Queries
var Pos = require('../models/pos');
var Console = require('../models/console');
var Admin = require('../models/admin');
var User = require('../models/user');
var Outlet = require('../models/outlet');
var Bill = require('../models/bill');
var Order = require('../models/order');
var Config = require('../models/config');
var Category = require('../models/category');
var Foodcategory = require('../models/foodcategory');
var Event = require('../models/event');
var Offer = require('../models/offer');
var Game = require('../models/game');
var Fooddisplay = require('../models/fooddisplay');
var Feed = require('../models/feed');

const Music = require('../models/music');
const TableBooking = require('../models/tablebooking');
const Feedback = require('../models/feedback');
const Temp = require('../models/temp');
const Temp2 = require('../models/temp2');
const Tnc = require('../models/tnc');
const Gamevalue = require('../models/gamevalue');
const Dailylog = require('../models/dailylog');

const multer = require('multer')

var consoleRoutes = express.Router();
const path = require("path");

consoleRoutes.use(express.static(__dirname + '/uploads'));

var { upload } = require('../utils/utils.js')


var gcmSenderKeyAndroid = 'AAAALJErIRw:APA91bFY8TIKhiEf_7h5abk2chqhqg7YJB5-ePZj7_0466XN2M_JrE_qkNKpVkKvMxJQ9J2txwqvnPG52yxC1Vu2J2M_B7a0xYWBXMFr4BNwEULhQLdNR-EMgNkqOjjXvrG7cyAug1h_';


var consoleRoutes = express.Router();
const socket = require('../io').io();

//API to set game values
consoleRoutes.put('/setgamevalues', function (req, res) {

    var seconds = req.query.seconds;
    var maxDiscount = req.query.discount;
    console.log('sec = '+seconds + '| Discount = '+maxDiscount);
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var token = req.headers['auth_token'];
    Console.findOne({token:token}, function (err, consoleFound) {
        if(!err && consoleFound){
            if(consoleFound.accessType == 'full'){
                Gamevalue.findOne({}, function (err, found) {
                    if(!err && found!=null){
                        found.maxDiscount = maxDiscount;
                        found.seconds = seconds;
                        found.updated_at = newdate;
                        found.save(function (err, saved) {
                            if(!err && saved){
                                res.json({
                                    success:true,
                                    data:{message:'Updated game values'},
                                    error:null
                                })
                            }else{
                                res.json({
                                    success:false,
                                    data:null,
                                    error:'Error Updating Game Values'
                                })
                            }
                        });
                    }else{
                        console.log(err);
                        res.json({
                            success:false,
                            data:null,
                            error:'Error fetching game values'
                        });
                    }
                });

            }
            else{
                res.json({
                    success:false,
                    data:null,
                    error:'You dont have permissions'
                });
            }
        }
        else{
            res.json({
                success:false,
                data:null,
                error:'You dont have permissions'
            });
        }
    }).lean();
});

//Middleware to verify token
consoleRoutes.use(function (req, res, next) {
    var consoletoken = req.headers['auth_token'];
    if (consoletoken) {
        // verifies secret and checks exp
        Console.findOne({
            "token": consoletoken
        }, function (err, decoded) {
            if (!err && decoded!=null) {

                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();

            } else {
                return res.json({
                    success: false,
                    data: null,
                    error: 'Access Denied'
                });
            }
        });
    } else {
        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            data: null,
            error: 'token not provided'
        });
    }
});//end of middleware to grant console access to routes


consoleRoutes.get('/pushnotitest', function (req, res) {

    var fcmId = "f7qjPckAHmE:APA91bFNvlqnkr19XIGQSlRa7A37jjvZlPZ5e1RhSBaGS2tzRsmcond-jK0mZuUcBg1_wAEcLMiuHwIuD3PYrDAyrPn06gVtn7APEgLe0HCXo_INGcqlG7VpBVsVsf7Ynf-Ekbi-7wkB";
    var sender = new fcm(gcmSenderKeyAndroid);
    var message1 = {
        to: fcmId,
        collapse_key: 'admin',
        priority: 'high',
        contentAvailable: true,
        timeToLive: 3,
        message_type: 'userorderplaced',
        //restrictedPackageName: "somePackageName",
        data: {
            type: "covidmessage",
            game: "http://35.154.86.71:7777/share/notitest.png",
            icon: "app_logo",
            title: "This is the title",
            body: "This is the body"
        }
    };
    sender.send(message1, function (err, response) {
        if (err) {
            console.log(err);
        } else {
            console.log("Successfully sent: ", response);
        }
    });
    res.json({
        success:true,
        data:null,
        message:'push sent'
    })
})

//API to add outlet
consoleRoutes.post('/addoutlet', function (req, res) {
    var token = req.headers['auth_token'];
    var tableid = 1;
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var outletid = 1;
    var outlet = new Outlet;
    var obj = req.body;

    Console.findOne({token:token}, function (err, consoleFound) {
        if(!err && consoleFound!=null){
            if(consoleFound.accessType == 'full'){
                Outlet.find({},{outletId:1}, function (err, outlets) {
                    if (!err && outlets.length > 0) {
                        outlet.outletId = (outlets[0].outletId) + 1;
                        outlet.name = obj.name;
                        outlet.outletImage = "/outlets/outlet1.jpg";
                        outlet.locality = obj.locality;
                        outlet.address = "Lane No - 8, Koregaon Park, Pune";
                        outlet.phno = "8600949056";
                        outlet.lat = "73.905513";
                        outlet.lon = "18.539408";
                        outlet.startTime = "13:00:00";
                        outlet.endTime = "23:30:00";
                        outlet.created_at = newdate;
                        outlet.updated_at = newdate;
                        outlet.save(function (err, saved) {
                            if (!err && saved) {
                                res.json({
                                    success: true,
                                    data: {message: 'success'},
                                    error: null
                                });
                            } else console.log(err);
                        });
                    }
                    else {
                        outlet.outletId = outletid;
                        outlet.name = obj.name;
                        outlet.outletImage = "/outlets/outlet1.jpg";
                        outlet.locality = obj.locality;
                        outlet.address = "Lane No - 8, Koregaon Park, Pune";
                        outlet.phno = "8600949056";
                        outlet.lat = "73.905513";
                        outlet.lon = "18.539408";
                        outlet.startTime = "13:00:00";
                        outlet.endTime = "23:30:00";
                        outlet.created_at = newdate;
                        outlet.updated_at = newdate;
                        outlet.save(function (err, saved) {
                            if (!err && saved) {
                                res.json({
                                    success: true,
                                    data: {message: 'success'},
                                    error: null
                                });
                            } else console.log(err);
                        });
                    }
                }).sort({outletId: -1}).lean();//end of outlet findall

            }
            else{
             res.json({
                 success:false,
                 data:null,
                 error:'You dont have acess to this feature'
             });
            }

        }else{
            res.json({
                success:false,
                data:null,
                error:'You dont have acess to this feature'
            });
        }
    }).lean();
});//end of API to add outlet

//API to fetch Outlets for console
consoleRoutes.get('/outlets', function (req, res) {
    var outletArray = [];
    var token = req.headers['auth_token'];
    var outletTemp = [];
    Console.findOne({token:token}, function (err, consoleFound) {
        if(!err && consoleFound!=null){
            if(consoleFound.accessType == 'manager'){
                Outlet.findOne({outletId:consoleFound.outletId}, function (err, outletFound) {
                    if(!err && outletFound!=null){
                        outletTemp.push(outletFound);
                        res.json({
                            success: true,
                            data: {outlets: outletTemp},
                            error: null
                        });
                    }
                    else{
                        res.json({
                            success:false,
                            data:null,
                            error:'No outlet assigned to manager'
                        });
                    }
                }).lean();
            }
            else if(consoleFound.accessType == 'full'){
                Outlet.find({}, function (err, outletsFound) {
                    if (!err && outletsFound.length > 0) {
                        res.json({
                            success: true,
                            data: {outlets: outletsFound},
                            error: null
                        });
                    }
                    else if (!err && outletsFound.length == 0) {
                        res.json({
                            success: true,
                            data: {outlets: outletArray},
                            error: null
                        });
                    }
                    if (err)console.log(err);
                }).sort({outletId: 1}).lean();
            }
        }else{
            res.json({
                success:false,
                data:null,
                error:'Error finding console access rights'
            });
        }
    }).lean();

});//end of api to fetch  outlets for console

//API to add  tables to outlet
consoleRoutes.put('/addtable', function (req, res) {

    function sortFunctionTables(a, b) {
        var name1, name2;
        name1 = a.tableId;
        name2 = b.tableId;
        return name1 > name2 ? -1 : 1;
    }


    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var obj = req.body;
    var tableObj = {};
    Outlet.findOne({outletId: req.query.outletId}, function (err, outletFound) {
        if (!err && outletFound) {
            if (outletFound.tables.length == 0) {
                tableObj.tableNumber = obj.number;
                tableObj.tableId = 1;
                tableObj.capacity = obj.capacity;
                tableObj.status = "vacant";
                tableObj.assigned = false;
                tableObj.assignedAdmin = 0;
                tableObj.created_at = newdate;
                tableObj.updated_at = newdate;
                Outlet.findOneAndUpdate({outletId: req.query.outletId}, {
                    $push: {tables: tableObj}
                }, {safe: true, upsert: true}, function (err, updated) {
                    if (!err && updated) {
                        res.json({
                            success: true,
                            data: {message: 'table added'},
                            error: null
                        });
                    } else {
                        res.json({
                            success: false,
                            data: null,
                            error: 'error adding table'
                        });
                    }
                });
            }
            else {
                outletFound.tables.sort(sortFunctionTables);
                tableObj.tableNumber = obj.number;
                tableObj.tableId = outletFound.tables[0].tableId + 1;
                tableObj.capacity = obj.capacity;
                tableObj.status = "vacant";
                tableObj.assigned = false;
                tableObj.assignedAdmin = 0;
                tableObj.created_at = newdate;
                tableObj.updated_at = newdate;

                Outlet.findOneAndUpdate({outletId: req.query.outletId}, {
                    $push: {tables: tableObj}
                }, {safe: true, upsert: true}, function (err, updated) {
                    if (!err && updated) {
                        res.json({
                            success: true,
                            data: {message: 'table added'},
                            error: null
                        });
                    } else {
                        res.json({
                            success: false,
                            data: null,
                            error: 'error adding table'
                        });
                    }
                });
            }
        } else {
            console.log(err);
            res.json({
                success: false,
                data: null,
                error: 'No outlet found!!'
            });
        }
    });
});//end of API to add table

// //API to add drink to the menu
// consoleRoutes.put('/adddrink', function (req, res) {
//     function sortFunctionDrinks(a, b) {
//         var name1, name2;
//         name1 = a.drinkId;
//         name2 = b.drinkId;
//         return name1 > name2 ? -1 : 1;
//     }
//     function sortFunctionItemcode(a, b) {
//         var name1, name2;
//         name1 = a.drinkId;
//         name2 = b.drinkId;
//         return name1 > name2 ? -1 : 1;
//     }

//     var obj = req.body;
//     var id = req.query.outletId;

//     var drinkObj = {};
//     Outlet.findOne({outletId: id}, function (err, outletFound) {
//         if (!err && outletFound) {
//             if (outletFound.drinks.length == 0) {
//                 drinkObj.drinkType = obj.drinkType;
//                 drinkObj.category = obj.drinkType;

//                 drinkObj.drinkId = 1;
//                 drinkObj.name = obj.name.toUpperCase();
//                 drinkObj.basePrice = obj.basePrice.toString();
//                 drinkObj.runningPrice = obj.basePrice.toString();
//                 try {
//                     drinkObj.capPrice = obj.capPrice.toString();
//                 } catch (err) {
//                     console.log(err);
//                 }
//                 drinkObj.available = obj.available;
//                 drinkObj.status = obj.status;
//                 drinkObj.demandLevel = obj.demandLevel;
//                 drinkObj.demandRate = obj.demandRate;
//                 drinkObj.priceIncrementPerUnit = obj.priceIncrementPerUnit;
//                 drinkObj.regularPrice = obj.regularPrice;
//                 drinkObj.itemCode = 1001;
//                 drinkObj.priceVariable = true;
//                 Outlet.findOneAndUpdate({outletId: id}, {
//                     $push: {drinks: drinkObj}
//                 }, {safe: true, upsert: true}, function (err, drinkadded) {
//                     if (!err && drinkadded) {
//                         res.json({
//                             success: true,
//                             data: {message: 'drink added to outlet'},
//                             error: null
//                         });
//                     } else {
//                         console.log(err);
//                         res.json({
//                             success: false,
//                             data: null,
//                             error: 'error adding drink'
//                         });
//                     }
//                 });
//             }
//             else {
//                 outletFound.drinks.sort(sortFunctionDrinks);
//                 drinkObj.drinkType = obj.drinkType;
//                 drinkObj.category = obj.drinkType;

//                 drinkObj.drinkId = (outletFound.drinks[0].drinkId) + 1;
//                 drinkObj.name = obj.name.toUpperCase();
//                 drinkObj.basePrice = obj.basePrice.toString();
//                 drinkObj.runningPrice = obj.basePrice.toString();
//                 try {
//                     drinkObj.capPrice = obj.capPrice.toString();
//                 } catch (err) {
//                     console.log(err);
//                 }
//                 drinkObj.available = obj.available;
//                 drinkObj.status = obj.status;
//                 drinkObj.demandLevel = obj.demandLevel;
//                 drinkObj.demandRate = obj.demandRate;
//                 drinkObj.priceIncrementPerUnit = obj.priceIncrementPerUnit;
//                 drinkObj.regularPrice = obj.regularPrice;
//                 outletFound.drinks.sort(sortFunctionItemcode);

//                 drinkObj.itemCode = obj.itemCode;
//                 drinkObj.priceVariable = true;

//                 Outlet.findOneAndUpdate({outletId: id}, {
//                     $push: {drinks: drinkObj}
//                 }, {safe: true, upsert: true}, function (err, drinkadded) {
//                     if (!err && drinkadded) {

//                         res.json({
//                             success: true,
//                             data: {message: 'drink added to outlet'},
//                             error: null
//                         });
//                     } else {
//                         console.log(err);
//                         res.json({
//                             success: false,
//                             data: null,
//                             error: 'error adding drink'
//                         });
//                     }
//                 });
//             }
//         } else {
//             console.log(err);
//             res.json({
//                 success: false,
//                 data: null,
//                 error: 'error finding outlet'
//             })
//         }
//     });
// });//end of api to add drink

// //API to delete drink
// consoleRoutes.put('/deletedrink', function (req, res) {
//     var id = req.query.outletId;
//     var itemCode = req.query.drinkItemCode;
//     Outlet.findOneAndUpdate({outletId: id}, {
//         $pull: {drinks:{itemCode:itemCode} }
//     }, {safe: true, upsert: true}, function (err) {
//         if (!err) {
//             res.json({
//                 success: true,
//                 data: {message: 'drink deleted'},
//                 error: null
//             });
//         } else {
//             res.json({
//                 success: false,
//                 data: null,
//                 error: 'An error occured, contact DB Admin'
//             });
//         }
//     });
// });

// //API to add food items to outlet
// consoleRoutes.put('/addfood', function (req, res) {
//     function sortFunctionFood(a, b) {
//         var name1, name2;
//         name1 = a.foodId;
//         name2 = b.foodId;
//         return name1 > name2 ? -1 : 1;
//     }

//     var obj = req.body;
//     var id = req.query.outletId;
//     var foodObj = {};
//     Outlet.findOne({outletId: id}, function (err, outletFound) {
//         if (!err && outletFound) {
//             if (outletFound.foods.length == 0) {
//                 foodObj.foodType = obj.foodType;
//                 foodObj.foodId = 1;
//                 foodObj.name = obj.name;
//                 foodObj.description = obj.description;
//                 foodObj.basePrice = obj.basePrice;
//                 foodObj.available = obj.available;
//                 foodObj.itemCode = 1;
//                 Outlet.findOneAndUpdate({outletId: id}, {
//                     $push: {foods: foodObj}
//                 }, {safe: true, upsert: true}, function (err, foodadded) {
//                     if (!err && foodadded) {
//                         res.json({
//                             success: true,
//                             data: {message: 'drink added to outlet'},
//                             error: null
//                         });
//                     } else {
//                         console.log(err);
//                         res.json({
//                             success: false,
//                             data: null,
//                             error: 'error adding drink'
//                         });
//                     }
//                 });
//             }
//             else {
//                 outletFound.foods.sort(sortFunctionFood);
//                 //foodObj.foodImage = pathset;
//                 foodObj.foodType = obj.foodType;
//                 foodObj.foodId = (outletFound.foods[0].foodId) + 1;
//                 foodObj.name = obj.name;
//                 foodObj.description = obj.description;
//                 foodObj.basePrice = obj.basePrice;
//                 foodObj.available = obj.available;
//                 foodObj.itemCode = obj.itemCode;

//                 Outlet.findOneAndUpdate({outletId: id}, {
//                     $push: {foods: foodObj}
//                 }, {safe: true, upsert: true}, function (err, drinkadded) {
//                     if (!err && drinkadded) {

//                         res.json({
//                             success: true,
//                             data: {message: 'food added to outlet'},
//                             error: null
//                         });
//                     } else {
//                         console.log(err);
//                         res.json({
//                             success: false,
//                             data: null,
//                             error: 'error adding drink'
//                         });
//                     }
//                 });
//             }
//         } else {
//             res.json({
//                 success: false,
//                 data: null,
//                 error: 'Error Finding Outlet with OutletId provided in query'
//             });
//         }
//     });
// });

// //API to delete food
// consoleRoutes.put('/deletefood', function (req, res) {
//     var id = req.query.outletId;
//     var itemCode = req.query.foodItemCode;
//     Outlet.findOneAndUpdate({outletId: id}, {
//         $pull: {foods:{itemCode:itemCode} }
//     }, {safe: true, upsert: true}, function (err) {
//         if (!err) {
//             res.json({
//                 success: true,
//                 data: {message: 'food deleted'},
//                 error: null
//             });
//         } else {
//             res.json({
//                 success: false,
//                 data: null,
//                 error: 'An error occured, contact DB Admin'
//             });
//         }
//     });
// });



//API to add drink to the menu
/*consoleRoutes.put('/adddrink', function (req, res) {
    function sortFunctionDrinks(a, b) {
        var name1, name2;
        name1 = a.drinkId;
        name2 = b.drinkId;
        return name1 > name2 ? -1 : 1;
    }
    function sortFunctionItemcode(a, b) {
        var name1, name2;
        name1 = a.drinkId;
        name2 = b.drinkId;
        return name1 > name2 ? -1 : 1;
    }

    var obj = req.body;
    var id = req.query.outletId;

    var drinkObj = {};
    Outlet.findOne({outletId: id}, function (err, outletFound) {
        if (!err && outletFound) {
            if (outletFound.drinks.length == 0) {
                drinkObj.drinkType = obj.drinkType;
                drinkObj.category = obj.drinkType;

                drinkObj.drinkId = 1;
                drinkObj.name = obj.name.toUpperCase();
                drinkObj.basePrice = obj.basePrice.toString();
                drinkObj.runningPrice = obj.basePrice.toString();
                try {
                    drinkObj.capPrice = obj.capPrice.toString();
                } catch (err) {
                    console.log(err);
                }
                drinkObj.available = obj.available;
                drinkObj.status = obj.status;
                drinkObj.demandLevel = obj.demandLevel;
                drinkObj.demandRate = obj.demandRate;
                drinkObj.priceIncrementPerUnit = obj.priceIncrementPerUnit;
                drinkObj.regularPrice = obj.regularPrice;
                drinkObj.itemCode = 1001;
                drinkObj.skucode = obj.skucode
                drinkObj.priceVariable = true;
                Outlet.findOneAndUpdate({outletId: id}, {
                    $push: {drinks: drinkObj}
                }, {safe: true, upsert: true}, function (err, drinkadded) {
                    if (!err && drinkadded) {
                        res.json({
                            success: true,
                            data: {message: 'drink added to outlet'},
                            error: null
                        });
                    } else {
                        console.log(err);
                        res.json({
                            success: false,
                            data: null,
                            error: 'error adding drink'
                        });
                    }
                });
            }
            else {
                outletFound.drinks.sort(sortFunctionDrinks);

                let duplicate_itemcode = outletFound.drinks.find(drink => drink.itemCode == +obj.itemCode);
                console.log(duplicate_itemcode);
                if(duplicate_itemcode!="" && duplicate_itemcode != undefined) {
                    console.log(err);
                        res.json({
                            success: false,
                            data: null,
                            error: 'Please add unique Itemcode'
                        });
                } else {

                drinkObj.drinkType = obj.drinkType;
                drinkObj.category = obj.drinkType;

                drinkObj.drinkId = (outletFound.drinks[0].drinkId) + 1;
                drinkObj.name = obj.name.toUpperCase();
                drinkObj.basePrice = obj.basePrice.toString();
                drinkObj.runningPrice = obj.basePrice.toString();
                try {
                    drinkObj.capPrice = obj.capPrice.toString();
                } catch (err) {
                    console.log(err);
                }
                drinkObj.available = obj.available;
                drinkObj.status = obj.status;
                drinkObj.demandLevel = obj.demandLevel;
                drinkObj.demandRate = obj.demandRate;
                drinkObj.priceIncrementPerUnit = obj.priceIncrementPerUnit;
                drinkObj.regularPrice = obj.regularPrice;
                outletFound.drinks.sort(sortFunctionItemcode);

                drinkObj.itemCode = obj.itemCode;
                drinkObj.skucode = obj.skucode;
                drinkObj.priceVariable = true;

                Outlet.findOneAndUpdate({outletId: id}, {
                    $push: {drinks: drinkObj}
                }, {safe: true, upsert: true}, function (err, drinkadded) {
                    if (!err && drinkadded) {

                        res.json({
                            success: true,
                            data: {message: 'drink added to outlet'},
                            error: null
                        });
                    } else {
                        console.log(err);
                        res.json({
                            success: false,
                            data: null,
                            error: 'error adding drink'
                        });
                    }
                });
            }
            }
        } else {
            console.log(err);
            res.json({
                success: false,
                data: null,
                error: 'error finding outlet'
            })
        }
    });
});*///end of api to add drink

//API to add drink to the menu
// consoleRoutes.put('/adddrink', upload('drinks').single("uploadfile"), function (req, res) {
//     let files;
//     function sortFunctionDrinks(a, b) {
//         var name1, name2;
//         name1 = a.drinkId;
//         name2 = b.drinkId;
//         return name1 > name2 ? -1 : 1;
//     }
//     function sortFunctionItemcode(a, b) {
//         var name1, name2;
//         name1 = a.drinkId;
//         name2 = b.drinkId;
//         return name1 > name2 ? -1 : 1;
//     }
//     var obj = req.body;
//     var id = req.query.outletId;
//     // console.log("objpre", obj.recommended)
//     if (req.file) { //abhishek
//         console.log("obj.recommended", obj.recommended)
//         let file = req.file.filename.replace(/(?:\.(?![^.]+$)|[^\w.])+/g, "")
//          files = "/" + "drinks/" + file;
//     }
//     var drinkObj = {};
//     Outlet.findOne({ outletId: id }, function (err, outletFound) {
//         if (!err && outletFound) {
//             console.log(outletFound)
//             if (outletFound.drinks.length == 0) {
//                 drinkObj.drinkType = obj.drinkType;
//                 drinkObj.category = obj.drinkType;
//                 drinkObj.drinkId = 1;
//                 drinkObj.itemImage = files
//                 // if (obj.recommended) { //ketki
//                 // }
//                 drinkObj.recommended = obj.recommended
//                 drinkObj.skucode = obj.skucode
//                 drinkObj.description = obj.description
//                 drinkObj.name = obj.name.toUpperCase();
//                 drinkObj.basePrice = obj.basePrice.toString();
//                 drinkObj.runningPrice = obj.basePrice.toString();
//                 try {
//                     drinkObj.capPrice = obj.capPrice.toString();
//                 } catch (err) {
//                     console.log(err);
//                 }
//                 drinkObj.available = obj.available;
//                 drinkObj.status = obj.status;
//                 drinkObj.demandLevel = obj.demandLevel;
//                 drinkObj.demandRate = obj.demandRate;
//                 drinkObj.priceIncrementPerUnit = obj.priceIncrementPerUnit;
//                 drinkObj.regularPrice = obj.regularPrice;
//                 drinkObj.itemCode = 1001;
//                 drinkObj.priceVariable = true;
//                 Outlet.findOneAndUpdate({ outletId: id }, {
//                     $push: { drinks: drinkObj }
//                 }, { safe: true, upsert: true }, function (err, drinkadded) {
//                     if (!err && drinkadded) {
//                         res.json({
//                             success: true,
//                             data: { message: 'drink added to outlet' },
//                             error: null
//                         });
//                     } else {
//                         console.log(err);
//                         res.json({
//                             success: false,
//                             data: null,
//                             error: 'error adding drink'
//                         });
//                     }
//                 });
//             }
//             else {
//                 outletFound.drinks.sort(sortFunctionDrinks);
//                 drinkObj.drinkType = obj.drinkType;
//                 drinkObj.category = obj.drinkType;

//                 drinkObj.drinkId = (outletFound.drinks[0].drinkId) + 1;
//                 drinkObj.name = obj.name.toUpperCase();
//                 if (obj.recommended) { //ketki
//                     drinkObj.itemImage = files
//                 }
//                 drinkObj.recommended = obj.recommended
//                 drinkObj.description = obj.description
//                 drinkObj.basePrice = obj.basePrice.toString();
//                 drinkObj.runningPrice = obj.basePrice.toString();
//                 try {
//                     drinkObj.capPrice = obj.capPrice.toString();
//                 } catch (err) {
//                     console.log(err);
//                 }
//                 drinkObj.available = obj.available;
//                 drinkObj.status = obj.status;
//                 drinkObj.demandLevel = obj.demandLevel;
//                 drinkObj.demandRate = obj.demandRate;
//                 drinkObj.priceIncrementPerUnit = obj.priceIncrementPerUnit;
//                 drinkObj.regularPrice = obj.regularPrice;
//                 outletFound.drinks.sort(sortFunctionItemcode);

//                 drinkObj.itemCode = obj.itemCode;
//                 drinkObj.skucode = obj.skucode;
//                 drinkObj.priceVariable = true;

//                 Outlet.findOneAndUpdate({ outletId: id }, {
//                     $push: { drinks: drinkObj }
//                 }, { safe: true, upsert: true }, function (err, drinkadded) {
//                     if (!err && drinkadded) {

//                         res.json({
//                             success: true,
//                             data: { message: 'drink added to outlet' },
//                             error: null
//                         });
//                     } else {
//                         console.log(err);
//                         res.json({
//                             success: false,
//                             data: null,
//                             error: 'error adding drink'
//                         });
//                     }
//                 });
//             }
//         } else {
//             console.log(err);
//             res.json({
//                 success: false,
//                 data: null,
//                 error: 'error finding outlet'
//             })
//         }
//     });
// });//end of api to add drink





consoleRoutes.put('/adddrink', upload('drinks').single("uploadfile"), function (req, res) {
    let files;
    function sortFunctionDrinks(a, b) {
        var name1, name2;
        name1 = a.drinkId;
        name2 = b.drinkId;
        return name1 > name2 ? -1 : 1;
    }
    function sortFunctionItemcode(a, b) {
        var code1, code2;
        code1 = a.itemCode;
        code2 = b.itemCode;
        return code1 > code2 ? -1 : 1;
      }
      

    var obj = req.body;
    var id = req.query.outletId;
    // console.log("objpre", obj.recommended)
    if (req.file) { //abhishek
        // console.log("obj.recommended", obj.recommended)
        let file = req.file.filename.replace(/(?:\.(?![^.]+$)|[^\w.])+/g, "")
        files = "/" + "drinks/" + file;
    }

    var drinkObj = {};
    Outlet.findOne({ outletId: id }, function (err, outletFound) {
        if (!err && outletFound) {
            console.log(outletFound)
            if (outletFound.drinks.length == 0) {
                drinkObj.drinkType = obj.drinkType;
                drinkObj.category = obj.drinkType;
                drinkObj.drinkId = 1;
                drinkObj.itemImage = files;
                // if (obj.recommended) { //ketki
                // }
                drinkObj.recommended = obj.recommended;
                drinkObj.skucode = obj.skucode;
                drinkObj.isStrikeOut=false;
                drinkObj.offerName= "NA";
                drinkObj.isOffer= false
                drinkObj.specialTab= false;
                drinkObj.tabName= "NA";
                drinkObj.description = obj.description;
                drinkObj.name = obj.name.toUpperCase();
                drinkObj.basePrice = obj.basePrice.toString();
                drinkObj.runningPrice = obj.basePrice.toString();
                try {
                    drinkObj.capPrice = obj.capPrice.toString();
                } catch (err) {
                    console.log(err);
                }
                drinkObj.available = obj.available;
                drinkObj.isStrikeOut = obj.isStrikeOut;
                drinkObj.offerName = obj.offerName;
                drinkObj.status = obj.status;
                drinkObj.demandLevel = obj.demandLevel;
                drinkObj.demandRate = obj.demandRate;
                drinkObj.priceIncrementPerUnit = obj.priceIncrementPerUnit;
                drinkObj.regularPrice = obj.regularPrice;
                drinkObj.itemCode = 1;
                drinkObj.priceVariable = true;
                Outlet.findOneAndUpdate({ outletId: id }, {
                    $push: { drinks: drinkObj }
                }, { safe: true, upsert: true }, function (err, drinkadded) {
                    if (!err && drinkadded) {
                        res.json({
                            success: true,
                            data: { message: 'drink added to outlet' },
                            error: null
                        });
                    } else {
                        console.log(err);
                        res.json({
                            success: false,
                            data: null,
                            error: 'error adding drink'
                        });
                    }
                });
            }
            else {
                outletFound.drinks.sort(sortFunctionDrinks);
                drinkObj.drinkType = obj.drinkType;
                drinkObj.category = obj.drinkType;
                
                drinkObj.drinkId = (outletFound.drinks[0].drinkId) + 1;
                drinkObj.name = obj.name.toUpperCase();
                if (obj.recommended) { //ketki
                    drinkObj.itemImage = files
                }
                drinkObj.recommended = obj.recommended
                drinkObj.description = obj.description
                drinkObj.basePrice = obj.basePrice.toString();
                drinkObj.runningPrice = obj.basePrice.toString();
                try {
                    drinkObj.capPrice = obj.capPrice.toString();
                } catch (err) {
                    console.log(err);
                }
                drinkObj.available = obj.available;
                drinkObj.status = obj.status;
                drinkObj.demandLevel = obj.demandLevel;
                drinkObj.demandRate = obj.demandRate;
                drinkObj.priceIncrementPerUnit = obj.priceIncrementPerUnit;
                drinkObj.regularPrice = obj.regularPrice;
                outletFound.drinks.sort(sortFunctionItemcode);
                
                drinkObj.itemCode = (outletFound.drinks[0].itemCode)+1;
                drinkObj.skucode = obj.skucode;
                drinkObj.isStrikeOut=false,
                drinkObj.offerName= "NA",
                drinkObj.isOffer= false,
                drinkObj.specialTab= false,
                drinkObj.tabName= "NA",
                drinkObj.priceVariable = true;
                console.log(drinkObj)
                
                Outlet.findOneAndUpdate({ outletId: id }, {
                    $push: { drinks: drinkObj }
                }, { safe: true, upsert: true }, function (err, drinkadded) {
                    if (!err && drinkadded) {

                        res.json({
                            success: true,
                            data: { message: 'drink added to outlet' },
                            error: null
                        });
                    } else {
                        console.log(err);
                        res.json({
                            success: false,
                            data: null,
                            error: 'error adding drink'
                        });
                    }
                });
            }
        } else {
            console.log(err);
            res.json({
                success: false,
                data: null,
                error: 'error finding outlet'
            })
        }
    });
});



//API to delete drink
consoleRoutes.put('/deletedrink', function (req, res) {
    var id = req.query.outletId;
    var itemCode = req.query.drinkItemCode;
    Outlet.findOneAndUpdate({outletId: id}, {
        $pull: {drinks:{itemCode:itemCode} }
    }, {safe: true, upsert: true}, function (err) {
        if (!err) {
            res.json({
                success: true,
                data: {message: 'drink deleted'},
                error: null
            });
        } else {
            res.json({
                success: false,
                data: null,
                error: 'An error occured, contact DB Admin'
            });
        }
    });
});





//API to add food items to outlet abhishek
// consoleRoutes.put('/addfood', upload('foods').single("uploadfile"), function (req, res) {
//     let files
//     function sortFunctionFood(a, b) {
//         var name1, name2;
//         name1 = a.foodId;
//         name2 = b.foodId;
//         return name1 > name2 ? -1 : 1;
//     }

//     var obj = req.body;
//     var id = req.query.outletId;

//     if(req.file){
//         let file = req.file.filename.replace(/(?:\.(?![^.]+$)|[^\w.])+/g, "")
//          files = "/" + "foods/" + file;

//     }

//     var foodObj = {};
//     Outlet.findOne({ outletId: id }, function (err, outletFound) {
//         if (!err && outletFound) {
//             if (outletFound.foods.length == 0) {
//                 foodObj.foodType = obj.foodType;
//                 foodObj.foodId = 1;
//                 foodObj.name = obj.name;
//                 foodObj.itemImage = files;
//                 // if(obj.recommended) {
//                 // }
//                 foodObj.recommended = obj.recommended
//                 foodObj.description = obj.description;
//                 foodObj.basePrice = obj.basePrice;
//                 foodObj.available = obj.available;
//                 foodObj.itemCode = 1;
//                 foodObj.skucode = "1";
//                 Outlet.findOneAndUpdate({ outletId: id }, {
//                     $push: { foods: foodObj }
//                 }, { safe: true, upsert: true }, function (err, foodadded) {
//                     if (!err && foodadded) {
//                         res.json({
//                             success: true,
//                             data: { message: 'food added to outlet' },
//                             error: null
//                         });
//                     } else {
//                         console.log(err);
//                         res.json({
//                             success: false,
//                             data: null,
//                             error: 'error adding food'
//                         });
//                     }
//                 });
//             }
//             else {
//                 outletFound.foods.sort(sortFunctionFood);
//                 let duplicate_itemcode = outletFound.foods.find(food => food.itemCode == +obj.itemCode);
//                 if(duplicate_itemcode!="" && duplicate_itemcode != undefined) {
//                     console.log(err);
//                         res.json({
//                             success: false,
//                             data: null,
//                             error: 'Please add unique Itemcode'
//                         });
//                 }else{
//                 //foodObj.foodImage = pathset;
//                 foodObj.foodType = obj.foodType;
//                 foodObj.foodId = (outletFound.foods[0].foodId) + 1;
//                 foodObj.name = obj.name;
//                 if (obj.recommended) {
//                     foodObj.itemImage = files;
//                 }
//                 foodObj.recommended = obj.recommended;
//                 foodObj.description = obj.description;
//                 foodObj.basePrice = obj.basePrice;
//                 foodObj.available = obj.available;
//                 foodObj.itemCode = obj.itemCode;
//                 foodObj.skucode = obj.skucode;

//                 Outlet.findOneAndUpdate({ outletId: id }, {
//                     $push: { foods: foodObj }
//                 }, { safe: true, upsert: true }, function (err, drinkadded) {
//                     if (!err && drinkadded) {

//                         res.json({
//                             success: true,
//                             data: { message: 'food added to outlet' },
//                             error: null
//                         });
//                     } else {
//                         console.log(err);
//                         res.json({
//                             success: false,
//                             data: null,
//                             error: 'error adding food'
//                         });
//                     }
//                 });
//             }
//         }
//         } else {
//             res.json({
//                 success: false,
//                 data: null,
//                 error: 'Error Finding Outlet with OutletId provided in query'
//             });
//         }
//     });
// });

consoleRoutes.put('/addfood', upload('foods').single("uploadfile"), function (req, res) {
    let files
    function sortFunctionFood(a, b) {
        var name1, name2;
        name1 = a.foodId;
        name2 = b.foodId;
        return name1 > name2 ? -1 : 1;
    }
    function sortFunctionItemcode(a, b) {
        var code1, code2;
        code1 = a.itemCode;
        code2 = b.itemCode;
        return code1 > code2 ? -1 : 1;
      }

    var obj = req.body;
    var id = req.query.outletId;

    if (req.file) {
        let file = req.file.filename.replace(/(?:\.(?![^.]+$)|[^\w.])+/g, "")
        files = "/" + "foods/" + file;

    }

    var foodObj = {};
    Outlet.findOne({ outletId: id }, function (err, outletFound) {
        if (!err && outletFound) {
            if (outletFound.foods.length == 0) {
                foodObj.foodType = obj.foodType;
                foodObj.foodId = 1;
                foodObj.name = obj.name;
                foodObj.itemImage = files;
                // if(obj.recommended) {
                // }
                foodObj.recommended = obj.recommended
                foodObj.description = obj.description;
                foodObj.basePrice = obj.basePrice;
                foodObj.available = obj.available;
                foodObj.itemCode = 1;
                foodObj.skucode = "1";
                foodObj.isStrikeOut=false;
                foodObj.strikeOutPrice="NA";
                Outlet.findOneAndUpdate({ outletId: id }, {
                    $push: { foods: foodObj }
                }, { safe: true, upsert: true }, function (err, foodadded) {
                    if (!err && foodadded) {
                        res.json({
                            success: true,
                            data: { message: 'food added to outlet' },
                            error: null
                        });
                    } else {
                        console.log(err);
                        res.json({
                            success: false,
                            data: null,
                            error: 'error adding food'
                        });
                    }
                });
            }
            else {
                outletFound.foods.sort(sortFunctionFood);
                //foodObj.foodImage = pathset;
                foodObj.foodType = obj.foodType;
                foodObj.foodId = (outletFound.foods[0].foodId) + 1;
                foodObj.name = obj.name;
                if (obj.recommended) {
                    foodObj.itemImage = files;
                }
                foodObj.recommended = obj.recommended;
                foodObj.description = obj.description;
                foodObj.basePrice = obj.basePrice;
                foodObj.available = obj.available;
                outletFound.foods.sort(sortFunctionItemcode);
                foodObj.itemCode = (outletFound.foods[0].itemCode)+1;
                foodObj.skucode = obj.skucode;
                foodObj.isStrikeOut=false;
                foodObj.strikeOutPrice="NA";

                Outlet.findOneAndUpdate({ outletId: id }, {
                    $push: { foods: foodObj }
                }, { safe: true, upsert: true }, function (err, drinkadded) {
                    if (!err && drinkadded) {

                        res.json({
                            success: true,
                            data: { message: 'food added to outlet' },
                            error: null
                        });
                    } else {
                        console.log(err);
                        res.json({
                            success: false,
                            data: null,
                            error: 'error adding food'
                        });
                    }
                });
            }
        } else {
            res.json({
                success: false,
                data: null,
                error: 'Error Finding Outlet with OutletId provided in query'
            });
        }
    });
});

//API to delete food
consoleRoutes.put('/deletefood', function (req, res) {
    var id = req.query.outletId;
    var itemCode = req.query.foodItemCode;
    Outlet.findOneAndUpdate({outletId: id}, {
        $pull: {foods:{itemCode:itemCode} }
    }, {safe: true, upsert: true}, function (err) {
        if (!err) {
            res.json({
                success: true,
                data: {message: 'food deleted'},
                error: null
            });
        } else {
            res.json({
                success: false,
                data: null,
                error: 'An error occured, contact DB Admin'
            });
        }
    });
});


//API to get configs from DB
consoleRoutes.get('/configs', function (req, res) {
    Config.findOne({}, function (err, config) {
        if (!err && config) {
            res.json({
                success: true,
                data: config,
                error: null
            });
        } else console.log(err);
    }).lean();
});//end of API to get config

//API to save editted config
consoleRoutes.put('/saveconfig', function (req, res) {
    var newconfig = req.body;
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    Config.findOneAndUpdate({}, {
        userDiscountPerLevel: newconfig.userDiscountPerLevel,
        userNumberOfLevel: newconfig.userNumberOfLevel,
        userTimePerLevel: newconfig.userTimePerLevel,
        currencyType: newconfig.currencyType,
        flickerPercent: newconfig.flickerPercent,
        noOfDrinksForFlickerDiscount: newconfig.noOfDrinksForFlickerDiscount,
        loyaltyDiscountPercent: newconfig.loyaltyDiscountPercent,
        noOfOrdersForLoyaltyDiscount: newconfig.noOfOrdersForLoyaltyDiscount,
        updated_at: newdate
    }, {safe: true, new: true}, function (err, updated) {
        if (!err && updated) {
            res.json({
                success: true,
                data: {message: 'Updated Config'},
                error: null
            });
        } else console.log(err);
    });
});//end of API to edit config

//API to get drink categories
consoleRoutes.get('/category', function (req, res) {
    Category.find({}, function (err, categories) {
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
    }).sort({sequence: 1}).lean();
});//end of API to get categories

//API to add a drink category
consoleRoutes.post('/addcategory', function (req, res) {
    var category = new Category;
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);

    Category.findOne({ name: req.body.name.toUpperCase() }, function (err, exists) { // ketki 24 th march 2023
        if (!err && exists != null ) { //ketki 23 rd march 2023
            res.json({ // ketki 24 th march 2023
                success: false, // ketki 24 th march 2023
                data: exists, // ketki 24 th march 2023
                error: 'Category by that name already exists' // ketki 24 th march 2023
            }); // ketki 24 th march 2023
        } // ketki 24 th march 2023
        else {

            Category.find({}, function (err, categories) {
                if (!err && categories) {
                    var id = 1;
                    if (categories.length > 0) {
                        id = categories[0].id + 1;
                    }
                    category.id = id;
                    category.name = req.body.name.toUpperCase(); // Ketki 24 th march 2023
                    category.sequence = req.body.sequence; //ketki 23 rd mach 2023
                    category.created_at = newdate;
                    category.updated_at = newdate;
                    category.save(function (err, saved) {
                        if (!err && saved) {
                            res.json({
                                success: true,
                                data: {message: 'Successfully added Drink Category'},
                                error: null
                            });
                        } else console.log(err);
                    });
                }
            }).sort({id: -1});
        } // ketki 24 th march 2023
    }); // ketki 24 th march 2023
});//end of API to add a drink category

//API to EDIT CATEGORY
consoleRoutes.put('/editcategory', function (req, res) {
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var catName;
    console.log(req.body);
    Category.findOne({id:req.body.id}, function (err, category) {
        if (!err && category!=null) {
            Category.findOne({name : req.body.name.toUpperCase()}, function (err, exists) {
                //if (!err && exists != null) {
                if (!err && (exists != null && exists.id != req.body.id)) { //ketki 23 rd march 2023
                    res.json({
                        success: false,
                        data: exists,
                        error: 'Category by that name already exists'
                    });
                }
                else {
                    category.name = req.body.name.toUpperCase(); // Ketki 24 th march 2023
                    category.sequence = req.body.sequence; //ketki 23 rd march 2023
                    category.updated_at = newdate;
                    category.save(function (err, saved) {
                        if (!err && saved) {
                            res.json({
                                success: true,
                                data: {message: 'Successfully Edited Drink Category'},
                                error: null
                            });
                            Outlet.find({}, function (err, outlets) {
                                if(!err && outlets!=null){
                                    outlets.forEach(function (eachOutlet) {
                                        Outlet.findById(eachOutlet._id.toString(), function (err, outlet) {
                                            if(!err && outlet){
                                                for(var f=0;f<outlet.drinks.length;f++){
                                                    if(outlet.drinks[f].drinkType == catName){
                                                        outlet.drinks[f].drinkType = req.body.name.toUpperCase();
                                                        outlet.drinks[f].category = req.body.name.toUpperCase();
                                                    }
                                                }
                                                if(f>=outlet.drinks.length){
                                                    outlet.save(function (err) {
                                                        if(err) console.log(err);
                                                    });
                                                }

                                            }
                                            else{
                                                console.log(err);
                                            }
                                        });

                                    });

                                }else console.log(err);
                            });
                        } else console.log(err);
                    });
                }
            }).lean();

        }else{
            res.json({
                success:false,
                data:null,
                error:'NO CATEGORY BY THAT ID'
            })
        }
    });
});//end of API to add a drink category

//API to delete category
// consoleRoutes.post('/deletecategory', function (req, res) {
//     var catid = req.query.id;
//     var outletid;
//     Category.findOne({id:catid}, function (err, categoryFound) {
//         if(!err && categoryFound!=null){
//             Outlet.find({}, function (err, allDrinks) {
//                 allDrinks.forEach(function (eachList) {
//                     outletid = eachList.outletId;
//                     eachList.drinks.forEach(function (eachDrink){
//                         if(eachDrink.drinkType == categoryFound.name){
//                             Outlet.findOneAndUpdate({outletId:outletid},{
//                                 $pull : {drinks : {name : eachDrink.itemCode}}
//                             }, function (err) {
//                                 if(err) console.log(err);
//                             });
//                         }
//                     });
//                 });
//                 Category.findOneAndRemove({id:catid}, function (err, removed) {
//                     if(!err && removed){
//                         res.json({
//                             success:true,
//                             data:{message:'Category removed'},
//                             error:null
//                         });
//                     }else{
//                         console.log(err);
//                         res.json({
//                             success:false,
//                             data:null,
//                             error:'Error removing category with that id'
//                         });

//                     }
//                 });

//             }).lean();
//         }else{
//             res.json({
//                 success:false,
//                 data:null,
//                 error:'Error removing category with that id'
//             });

//         }
//     }).lean();
// });

//API to Drink CATEGORY Visible
consoleRoutes.put('/drinkvisible', function (req, res) {
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var catName;
    Category.findOneAndUpdate({id:req.query.id}, {
        visible : true
    },function (err, category) {
        if (!err && category!=null) {
            res.json({
                success:true,
                data:{message:'Made Visible'},
                error:null
            });
        }else{
            res.json({
                success:false,
                data:null,
                error:'Error editing drink category'
            });
        }
    });
});//end of API to add a drink category

//API to Drink CATEGORY Invisible
consoleRoutes.put('/drinkinvisible', function (req, res) {
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var catName;
    Category.findOneAndUpdate({id:req.query.id}, {
        visible : false
    },function (err, category) {
        if (!err && category!=null) {
            res.json({
                success:true,
                data:{message:'Made Visible'},
                error:null
            });
        }else{
            res.json({
                success:false,
                data:null,
                error:'Error editing drink category'
            });
        }
    });
});//end of API to add a drink category

//API to get food categories
consoleRoutes.get('/foodcategory', function (req, res) {
    Foodcategory.find({}, function (err, foodcategories) {
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
    }).sort({sequence: 1}).lean();
});//end of API to get categories

//API to add a food category
consoleRoutes.post('/addfoodcategory', function (req, res) {
    var foodcategory = new Foodcategory;
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);

    Foodcategory.findOne({ name: req.body.name.toUpperCase() }, function (err, exists) {  // ketki  24 th march 2023
        if (!err && exists != null) { // ketki 23 rd march 2023
            res.json({ // ketki 24 rd march 2023
                success: false, // ketki 24 rd march 2023
                data: exists, //ketki 24 th march 2023
                error: 'Category by that name already exists' //ketki 24 th march 2023
            });//ketki 24 th march 2023
        }//ketki 24 th march 2023
        else {//ketki 24 th march 2023
            Foodcategory.find({}, function (err, categories) {
                if (!err && categories) {
                    var id = 1;
                    if (categories.length > 0) {
                        id = categories[0].id + 1;
                    }
                    foodcategory.id = id;
                    foodcategory.name = req.body.name.toUpperCase(); //  ketki 24 th march 2023
                    foodcategory.sequence = req.body.sequence; // Ketki 23 rd march 2023
                    foodcategory.visible = false;
                    foodcategory.created_at = newdate;
                    foodcategory.updated_at = newdate;
                    foodcategory.save(function (err, saved) {
                        if (!err && saved) {
                            res.json({
                                success: true,
                                data: {message: 'Successfully added Drink Category'},
                                error: null
                            });
                        } else console.log(err);
                    });
                }
            }).sort({id: -1});
        }//ketki 24 th march 2023
    });//ketki 24 th march 2023
});//end of API to add a food category

//API to EDIT FOOD CATEGORY
consoleRoutes.put('/editfoodcategory', function (req, res) {
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var catName;
    Foodcategory.findOne({id:req.body.id}, function (err, category) {
        if (!err && category!=null) {

            Foodcategory.findOne({name : req.body.name.toUpperCase()}, function (err, exists) {
                //if (!err && exists != null) {
                if (!err && (exists != null && exists.id != req.body.id)) { // ketki 23 rd march 2023
                    res.json({
                        success: false,
                        data: exists,
                        error: 'Category by that name already exists'
                    });
                }
                else {
                    catName = category.name;
                    category.name = req.body.name.toUpperCase();
                    category.sequence = req.body.sequence; //ketki 23 rd march 2023
                    category.updated_at = newdate;
                    category.save(function (err, saved) {
                        if (!err && saved) {
                            res.json({
                                success: true,
                                data: {message: 'Successfully Edited Drink Category'},
                                error: null
                            });
                            Outlet.find({}, function (err, outlets) {
                                if(!err && outlets!=null){
                                    outlets.forEach(function (eachOutlet) {
                                        Outlet.findById(eachOutlet._id.toString(), function (err, outlet) {
                                            if(!err && outlet){
                                                for(var f=0;f<outlet.foods.length;f++){
                                                    if(outlet.foods[f].foodType == catName){
                                                        outlet.foods[f].foodType = req.body.name.toUpperCase();
                                                    }
                                                }
                                                if(f>=outlet.foods.length-1){
                                                    outlet.save(function (err) {
                                                        if(err) console.log(err);
                                                    });
                                                }

                                            }
                                            else{
                                                console.log(err);
                                            }
                                        });

                                    });

                                }else console.log(err);
                            }).lean();
                        } else console.log(err);
                    });
                }
            }).lean();


        }else{
            res.json({
                success:false,
                data:null,
                error:'Error editing drink category'
            });
        }
    });
});//end of API to add a drink category

//API to delete food category
consoleRoutes.post('/deletefoodcategory', function (req, res) {
    var catid = req.query.id;
    var outletid;
    Foodcategory.findOne({id:catid}, function (err, category) {
        if(!err && category!=null){
            Outlet.find({}, function (err, allFoods) {
                allFoods.forEach(function (eachList) {
                    outletid = eachList.outletId;
                    eachList.foods.forEach(function (eachFood){
                        if(eachFood.foodType == category.name){
                            Outlet.findOneAndUpdate({outletId:outletid},{
                                $pull : {foods : {name : eachFood.name}}
                            }, function (err) {
                                if(err) console.log(err);
                            });
                        }
                    });
                });
                Foodcategory.findOneAndRemove({id:catid}, function (err, removed) {
                    if(!err && removed){
                        res.json({
                            success:true,
                            data:{message:'Category removed'},
                            error:null
                        });
                    }else{
                        console.log(err);
                        res.json({
                            success:false,
                            data:null,
                            error:'Error removing category with that id'
                        });

                    }
                });

            }).lean();
        }else{
            res.json({
                success:false,
                data:null,
                error:'Error finding that category'
            })
        }
    }).lean();
});

//API to Drink CATEGORY Visible
consoleRoutes.put('/foodvisible', function (req, res) {
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var catName;
    Foodcategory.findOneAndUpdate({id:req.query.id}, {
        visible : true
    },function (err, category) {
        if (!err && category!=null) {
            res.json({
                success:true,
                data:{message:'Made Visible'},
                error:null
            });
        }else{
            res.json({
                success:false,
                data:null,
                error:'Error editing drink category'
            });
        }
    });
});//end of API to add a drink category

//API to Drink CATEGORY Invisible
consoleRoutes.put('/foodinvisible', function (req, res) {
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var catName;
    Foodcategory.findOneAndUpdate({id:req.query.id}, {
        visible : false
    },function (err, category) {
        if (!err && category!=null) {
            res.json({
                success:true,
                data:{message:'Made Visible'},
                error:null
            });
        }else{
            res.json({
                success:false,
                data:null,
                error:'Error editing drink category'
            });
        }
    });
});//end of API to add a drink category

// //API to get admins
// consoleRoutes.get('/admins', function (req, res) {
//     Admin.find({}, function (err, admins) {
//         if (!err && admins) {
//             res.json({
//                 success: true,
//                 data: {admins: admins},
//                 error: null
//             });
//         } else {
//             console.log(err);
//             res.json({
//                 success: false,
//                 data: null,
//                 error: 'error fetching admins'
//             });
//         }
//     }).lean();
// });//end of API to fetch admins

//API to add admin

consoleRoutes.get('/admins', function (req, res) {
    var token = req.headers['auth_token'];
    Console.findOne({token:token}, function (err, consoleFoud) {
        if(!err && consoleFoud!=null){
            if(consoleFoud.accessType == 'manager'){
                Admin.find({outletId:consoleFoud.outletId}, function (err, admins) {
                    if (!err && admins) {
                        res.json({
                            success: true,
                            data: {admins: admins},
                            error: null
                        });
                    } else {
                        console.log(err);
                        res.json({
                            success: false,
                            data: null,
                            error: 'error fetching admins'
                        });
                    }
                }).lean();
            }
            else if(consoleFoud.accessType == 'full'){
                Admin.find( function (err, admins) {
                    if (!err && admins) {
                        res.json({
                            success: true,
                            data: {admins: admins},
                            error: null
                        });
                    } else {
                        console.log(err);
                        res.json({
                            success: false,
                            data: null,
                            error: 'error fetching admins'
                        });
                    }
                }).lean();
            }
        }else{
            res.json({
                success:false,
                data:null,
                error:'Error fetching console'
            });
        }
    }).lean();
});//end of API to fetch admins





consoleRoutes.post('/addadmin', function (req, res) {
    var admin = new Admin;
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    Admin.find({}, function (err, admins) {
        if (!err && admins) {
            var adminid = 1;
            if (admins.length > 0) {
                adminid = admins[0].adminId + 1;
            }
            var obj = req.body;
            var usrname = obj.name;
            var password = obj.password;

            admin.adminId = adminid;
            admin.userName = usrname;
            admin.password = password;
            admin.name = usrname;
            admin.outletId = 0;
            admin.token = "";
            admin.state = "inactive";
            admin.outlet = "";
            admin.created_at = newdate;
            admin.updated_at = newdate;
            admin.save(function (err, adminAdded) {
                if (!err && adminAdded) {
                    res.json({
                        success: true,
                        data: {message: 'Admin Added Successfully'},
                        error: null
                    });
                } else {
                    console.log(err);
                    res.json({
                        success: false,
                        data: null,
                        error: 'error adding admin'
                    });

                }
            });
        } else {
            console.log(err);
        }
    }).sort({adminId: -1});
});//end fo API to add admin

//API to remove admin
consoleRoutes.post('/deleteadmin', function (req, res) {
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    Admin.findOne({adminId: req.query.adminId}, function (err, adminFound) {
        if (!err && adminFound) {
            if (adminFound.outletId > 0) {
                Outlet.findOne({outletId: adminFound.outletId}, function (err, outletFOund) {
                    if (!err && outletFOund) {
                        for (var i = 0; i < adminFound.tables.length; i++) {
                            for (var j = 0; j < outletFOund.tables.length; j++) {
                                if (outletFOund.tables[j].tableNumber == adminFound.tables[i].tableNumber) {
                                    outletFOund.tables[j].assigned = false;
                                    outletFOund.tables[j].assignedAdmin = 0;
                                    outletFOund.updated_at = newdate;
                                    outletFOund.save(function (err, saved) {
                                        if (!err && saved) {
                                        } else console.log(err);
                                    });
                                }
                            }
                        }
                        if (i >= adminFound.tables.length) {
                            Admin.findOneAndRemove({adminId: req.query.adminId}, function (err, adminDeleted) {
                                if (!err && adminDeleted) {
                                    res.json({
                                        success: true,
                                        data: {message: 'Admin deleted'},
                                        error: null
                                    });
                                } else console.log(err);
                            });
                        }
                    }
                });
            } else {
                Admin.findOneAndRemove({adminId: req.query.adminId}, function (err, adminDeleted) {
                    if (!err && adminDeleted) {
                        res.json({
                            success: true,
                            data: {message: 'Admin deleted'},
                            error: null
                        });
                    } else console.log(err);
                });
            }


        } else {
            console.log(err);
            res.json({
                success: false,
                data: null,
                error: 'Error removing admin'
            })
        }
    })
});//end of API to delete admin/waitor

//API to set admin tables
consoleRoutes.put('/setadminoutlet', function (req, res) {
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    Admin.findOne({adminId: req.query.adminId}, function (err, adminFound) {
        if (!err && adminFound) {
            if (adminFound.outletId > 0) {
                Outlet.findOne({outletId: adminFound.outletId}, function (err, currentOutlet) {
                    if (!err && currentOutlet) {
                        for (var i = 0; i < adminFound.tables.length; i++) {
                            for (var j = 0; j < currentOutlet.tables.length; j++) {
                                if (currentOutlet.tables[j].tableNumber == adminFound.tables[i].tableNumber) {
                                    currentOutlet.tables[j].assigned = false;
                                    currentOutlet.tables[j].assignedAdmin = 0;
                                    currentOutlet.updated_at = newdate;
                                    currentOutlet.save(function (err, saved) {
                                        if (!err && saved) {
                                        } else console.log(err);
                                    });
                                }
                            }
                        }
                        if (i >= adminFound.tables.length) {
                            Outlet.findOne({outletId: req.query.outletId}, function (err, outletFound) {
                                if (!err && outletFound) {

                                    adminFound.outletId = req.query.outletId;
                                    adminFound.outlet = outletFound.locality;
                                    adminFound.tables = [];
                                    adminFound.updated_at = newdate;
                                    adminFound.save(function (err, saved) {
                                        if (!err && saved) {
                                            res.json({
                                                success: true,
                                                data: {message: 'admin outlet set'},
                                                error: null
                                            });
                                        } else console.log(err);
                                    });
                                }
                                else console.log(err)
                            });
                        }
                    }
                });
            }
            else {
                Outlet.findOne({outletId: req.query.outletId}, function (err, outletFound) {
                            if (!err && outletFound) {

                                adminFound.outletId = req.query.outletId;
                                adminFound.outlet = outletFound.locality;
                                adminFound.tables = [];
                                adminFound.updated_at = newdate;
                                adminFound.save(function (err, saved) {
                                    if (!err && saved) {
                                        res.json({
                                            success: true,
                                            data: {message: 'admin outlet set'},
                                            error: null
                                        });
                                    } else console.log(err);
                                });
                    }
                    else console.log(err)
                });
            }

        }
    });


});

//API to get tables of outlet
consoleRoutes.get('/tables', function (req, res) {
    var outletLocality = req.query.outlet;
    Outlet.findOne({locality: outletLocality}, function (err, outlet) {
        if (!err && outlet) {
            var tableArray = [];
            for (var i = 0; i < outlet.tables.length; i++) {
                if (outlet.tables[i].assigned == false) {
                    tableArray.push(outlet.tables[i]);
                }
            }
            if (i >= outlet.tables.length) {
                res.json({
                    success: true,
                    data: {tables: tableArray},
                    error: null
                });
            }

        } else {
            console.log(err);
            res.json({
                success: false,
                data: null,
                error: 'Error fetching tables'
            });
        }
    }).lean();
});

//API to assign table to admins
consoleRoutes.put('/setadmintable', function (req, res) {
    var table = req.query.tableNumber;
    var adminid = req.query.adminId;
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    Admin.findOne({adminId: adminid}, function (err, adminFound) {
        if (!err && adminFound) {

            Outlet.findOne({outletId: adminFound.outletId}, function (err, outletFound) {
                if (!err && outletFound) {
                    for (var j = 0; j < outletFound.tables.length; j++) {
                        if (outletFound.tables[j].tableNumber == table) {
                            var adminObj = {};
                            adminObj.tableNumber = outletFound.tables[j].tableNumber;
                            adminObj.tableId = outletFound.tables[j].tableId;
                            adminObj.capacity = outletFound.tables[j].capacity;
                            adminObj.status = outletFound.tables[j].status;
                            adminObj.assigned_on = newdate;
                            Admin.findOneAndUpdate({adminId: adminid}, {
                                $push: {tables: adminObj}
                            }, {safe: true, upsert: true, new: true}, function (err, adminUpdated) {
                                if (!err && adminUpdated) {

                                } else console.log(err);
                            });
                            outletFound.tables[j].assigned = true;
                            outletFound.tables[j].assignedAdmin = adminFound.adminId;
                            outletFound.updated_at = newdate;
                            outletFound.save(function (err, saved) {
                                if (!err && saved) {

                                } else console.log(err);
                            });
                        }
                    }
                    if(j>=outletFound.tables.length){
                        res.json({
                            success: true,
                            data: {message: "admin Updated"},
                            error: null
                        });
                    }

                } else console.log(err);
            });
        } else {
            console.log(err);
            res.json({
                success: false,
                data: null,
                error: 'Error Assigning Tables'
            });
        }
    });
});//end of API to assign admin tables

//API to remove table from admin
consoleRoutes.put('/removeadmintable', function (req, res) {
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    Admin.findOneAndUpdate({adminId: req.query.adminId}, {
        $pull: {tables: {tableNumber: req.query.tableNumber}},
        $set: {updated_at: newdate}
    }, {safe: true, upsert: true, new: true}, function (err, adminUpdated) {
        if (!err && adminUpdated) {
            res.json({
                success: true,
                data: {message: 'updated admin'},
                error: null
            });
            Outlet.findOne({outletId: adminUpdated.outletId}, function (err, outletFound) {
                if (!err && outletFound) {
                    for (var i = 0; i < outletFound.tables.length; i++) {
                        if (outletFound.tables[i].tableNumber == req.query.tableNumber) {
                            outletFound.tables[i].assigned = false;
                            outletFound.tables[i].assignedAdmin = 0;
                            outletFound.updated_at = newdate;
                            outletFound.save(function (err, saved) {
                                if (!err && saved) {
                                } else console.log(err);
                            });
                        }
                    }
                } else {
                    console.log(err);
                }
            });
        } else {
            console.log(err);
            res.json({
                success: false,
                data: null,
                error: 'error removing table'
            });
        }
    });
});//end of API to remove table from admin

//API to get bills for console
consoleRoutes.get('/bills', function (req, res) {
    var outletId = req.body.outletId;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var start = moment(startDate).format('YYYY-mm-dd');
    var end = moment(endDate).format('YYYY-mm-dd');
    var time = moment('12:00:00').format('HH:mm:ss');
    var billsArray = [];
    Bill.find({outletId: outletId}, function (err, bills) {
        if (!err && bills) {
            for (var i = 0; i < bills.length; i++) {
                if (bills[i].billDate >= start && bills[i].billDate <= end && bills[i].billTime > time) {
                    billsArray.push(bills[i]);
                }
            }
        } else {

        }
    }).lean();

});

//API to flush data for the day
consoleRoutes.get('/reset', function (req, res) {

    var token = req.headers['auth_token'];
    var outletid;
    Console.findOne({token:token}, function (err, consoleFound) {
        if(!err && consoleFound!=null){
            if(consoleFound.accessType == 'manager'){
                outletid = consoleFound.outletId;
                Outlet.findOne({outletId:outletid}, function (err, outlets) {
                    if (!err && outlets) {
                        res.json({
                            success: true,
                            data: null,
                            error: null
                        });
                            for (var i = 0; i < outlets.drinks.length; i++) {
                                /*basePrice: String,
                                 runningPrice: String,
                                 demandRate: Number,
                                 demandLevel: Number,*/
                                outlets.drinks[i].runningPrice = outlets.drinks[i].basePrice;
                                outlets.drinks[i].demandRate = 0;
                                outlets.drinks[i].demandLevel = 0;

                            }
                            for (var t = 0; t < outlets.tables.length; t++) {
                                outlets.tables[t].status = 'vacant';
                            }
                            if (i >= outlets.drinks.length-1 && t >= outlets.tables.length-1) {
                                outlets.save(function (err, saved) {
                                    if (!err && saved) {

                                    }
                                    else {
                                        console.log(err);
                                    }
                                });
                            }

                    }
                    else {
                        console.log(err);
                    }
                });
                User.find({}, function (err, users) {
                    if(!err && users){
                        for(var i=0;i<users.length;i++){
                            if(users[i].gameId != 0 || users[i].lastGameId != 0 || users[i].currentTableNumber != '0'){
                                User.findByIdAndUpdate(users[i]._id.toString(),{
                                    gameId:0,
                                    lastGameId:0,
                                    currentTableNumber:'0'
                                },{safe:true}, function (err) {
                                    if(err) console.log(err);
                                });
                            }
                        }
                    }else{
                        console.log(err);
                    }
                });
                Order.find({$and:[{outletId:outletid},{$or:[{status:'confirmed'},{status:'placed'},{status:'pending'}]}]}, function (err, orders) {
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
                });
                Bill.find({$and:[{outletId:outletid},{$or:[{status:'requested'},{status:'unpaid'}]}]}, function (err, bills) {
                    if(!err &&bills.length>0){
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
                });
            }
            else if(consoleFound.accessType == 'full'){
                res.json({
                    success: true,
                    data: null,
                    error: null
                });
                Outlet.find({}, function (err, outlets) {
                    if (!err && outlets) {
                        console.log('here');
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
                                                console.log('saved');
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
                        for(var i=0;i<users.length;i++){
                            if(users[i].gameId != 0 || users[i].lastGameId != 0 || users[i].currentTableNumber != '0'){
                                User.findOneAndUpdate({userId:users[i].userId},{
                                    gameId:0,
                                    lastGameId:0,
                                    currentTableNumber:'0'
                                },{safe:true}, function (err) {
                                    if(err) console.log(err);
                                });
                            }
                        }
                    }else{
                        console.log(err);
                    }
                });
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
                });
                Bill.find({$or:[{status:'requested'},{status:'unpaid'}]}, function (err, bills) {
                    if(!err &&bills.length>0){
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
                });
            }
        }else{
            res.json({
                success:false,
                data:null,
                error: 'Error giving access'
            });
        }
    });



});

//API to edit table
consoleRoutes.put('/edittable', function (req, res) {
    var outletid = req.query.outletId;
    var tableObj = req.body;


    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    Outlet.findOne({outletId: outletid}, function (err, outletFound) {
        if (!err && outletFound) {
            for (var i = 0; i < outletFound.tables.length; i++) {
                if (outletFound.tables[i].tableNumber == tableObj.number) {
                    outletFound.tables[i].capacity = tableObj.capacity;
                    outletFound.tables[i].updated_at = newdate;
                }
            }
            if (i >= outletFound.tables.length) {
                outletFound.save(function (err, saved) {
                    if (!err && saved) {
                        res.json({
                            success: true,
                            data: {message: 'table editted and saved'},
                            error: null
                        });
                    }
                });
            }
        } else {
            res.json({
                success: false,
                data: null,
                error: 'An error occured, contact DB Admin'
            });
        }
    });
});

// //API to edit drink
// consoleRoutes.put('/editdrink', function (req, res) {
//     var outletid = req.query.outletId;
//     var obj = req.body;

//     var date1 = moment.utc().add(330, 'minutes');
//     var newdate = new Date(date1);
//     Outlet.findOne({outletId: outletid}, function (err, outletFound) {
//         if (!err && outletFound) {
//             for (var i = 0; i < outletFound.drinks.length; i++) {
//                 if (outletFound.drinks[i].itemCode == obj.itemCode) {
//                     outletFound.drinks[i].drinkType = obj.drinkType;
//                     outletFound.drinks[i].category = obj.drinkType;
//                     outletFound.drinks[i].name = obj.name;
//                     outletFound.drinks[i].basePrice = obj.basePrice.toString();
//                     if(parseInt(outletFound.drinks[i].runningPrice) < obj.basePrice){
//                         outletFound.drinks[i].runningPrice = obj.basePrice.toString();
//                     }
//                     try {
//                         outletFound.drinks[i].capPrice = obj.capPrice.toString();
//                     } catch (err) {
//                         console.log(err);
//                     }
//                     outletFound.drinks[i].priceIncrementPerUnit = obj.priceIncrementPerUnit;
//                     if(obj.priceIncrementPerUnit == 0){
//                         outletFound.drinks[i].priceVariable = false;
//                     }else{
//                         outletFound.drinks[i].priceVariable = true;
//                     }
//                     outletFound.drinks[i].regularPrice = obj.regularPrice;
//                     outletFound.drinks[i].itemCode = obj.itemCode;
//                 }
//             }
//             if (i >= outletFound.drinks.length) {
//                 outletFound.save(function (err, saved) {
//                     if (!err && saved) {
//                         res.json({
//                             success: true,
//                             data: {message: 'drink edited and saved'},
//                             error: null
//                         });
//                     }
//                 });
//             }
//         } else {
//             res.json({
//                 success: false,
//                 data: null,
//                 error: 'An error occured, contact DB Admin'
//             });
//         }
//     });
// });

//API to edit drink
/*consoleRoutes.put('/editdrink', function (req, res) {
    var outletid = req.query.outletId;
    var obj = req.body;

    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    Outlet.findOne({outletId: outletid}, function (err, outletFound) {
        if (!err && outletFound) {
            for (var i = 0; i < outletFound.drinks.length; i++) {
                if (outletFound.drinks[i].itemCode == obj.itemCode) {
                    outletFound.drinks[i].drinkType = obj.drinkType;
                    outletFound.drinks[i].category = obj.drinkType;
                    outletFound.drinks[i].name = obj.name;
                    outletFound.drinks[i].basePrice = obj.basePrice.toString();
                    outletFound.drinks[i].skucode = obj.skucode;
                    if(parseInt(outletFound.drinks[i].runningPrice) < obj.basePrice){
                        outletFound.drinks[i].runningPrice = obj.basePrice.toString();
                    }
                    try {
                        outletFound.drinks[i].capPrice = obj.capPrice.toString();
                    } catch (err) {
                        console.log(err);
                    }
                    outletFound.drinks[i].priceIncrementPerUnit = obj.priceIncrementPerUnit;
                    if(obj.priceIncrementPerUnit == 0){
                        outletFound.drinks[i].priceVariable = false;
                    }else{
                        outletFound.drinks[i].priceVariable = true;
                    }
                    outletFound.drinks[i].regularPrice = obj.regularPrice;
                    outletFound.drinks[i].itemCode = obj.itemCode;
                }
            }
            if (i >= outletFound.drinks.length) {
                outletFound.save(function (err, saved) {
                    if (!err && saved) {
                        res.json({
                            success: true,
                            data: {message: 'drink edited and saved'},
                            error: null
                        });
                    }
                });
            }
        } else {
            res.json({
                success: false,
                data: null,
                error: 'An error occured, contact DB Admin'
            });
        }
    });
});*/

consoleRoutes.put('/editdrink', upload("drinks").single("uploadfile"), function (req, res) {
    var outletid = req.query.outletId;
    var obj = req.body;
    console.log(obj);

    if (req.file != undefined) {
        let file = req.file.filename.replace(/(?:\.(?![^.]+$)|[^\w.])+/g, "")
        var files = "/" + "drinks/" + file;
    }

    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    Outlet.findOne({ outletId: outletid }, function (err, outletFound) {
        if (!err && outletFound) {
            for (var i = 0; i < outletFound.drinks.length; i++) {
                if (outletFound.drinks[i].itemCode == obj.itemCode) {
                    outletFound.drinks[i].drinkType = obj.drinkType;
                    outletFound.drinks[i].category = obj.drinkType;
                    outletFound.drinks[i].itemImage = files;
                    // if(obj.recommended == true) {
                    // }
                    outletFound.drinks[i].recommended = obj.recommended
                    outletFound.drinks[i].description = obj.description
                    outletFound.drinks[i].name = obj.name;
                    outletFound.drinks[i].basePrice = obj.basePrice.toString();
                    outletFound.drinks[i].skucode = obj.skucode;
                    if (parseInt(outletFound.drinks[i].runningPrice) < obj.basePrice) {
                        outletFound.drinks[i].runningPrice = obj.basePrice.toString();
                    }
                    try {
                        outletFound.drinks[i].capPrice = obj.capPrice.toString();
                    } catch (err) {
                        console.log(err);
                    }
                    outletFound.drinks[i].priceIncrementPerUnit = obj.priceIncrementPerUnit;
                    if (obj.priceIncrementPerUnit == 0) {
                        outletFound.drinks[i].priceVariable = false;
                    } else {
                        outletFound.drinks[i].priceVariable = true;
                    }
                    outletFound.drinks[i].regularPrice = obj.regularPrice;
                    outletFound.drinks[i].itemCode = obj.itemCode;
                }
            }
            if (i >= outletFound.drinks.length) {
                outletFound.save(function (err, saved) {
                    if (!err && saved) {
                        res.json({
                            success: true,
                            data: { message: 'drink edited and saved' },
                            error: null
                        });
                    }
                });
            }
        } else {
            res.json({
                success: false,
                data: null,
                error: 'An error occured, contact DB Admin'
            });
        }
    });
});

//API to delete table
consoleRoutes.put('/deleteTable', function (req, res) {
    var tablenumber = req.query.tableNumber;
    var outletid = req.query.outletId;
    Outlet.findOneAndUpdate({outletId: outletid, 'tables.tableNumber': tablenumber}, {
        $pull: {tables: {tableNumber: tablenumber}}
    }, {safe: true}, function (err, updated) {
        if (!err && updated) {
            res.json({
                success: true,
                data: {message: 'successfully deleted table'},
                error: null
            });
        } else {
            res.json({
                success: false,
                data: null,
                error: 'Error deleting table'
            })
        }
    });
});

//API to make drink unavailable
consoleRoutes.put('/unavailabledrink', function (req, res) {
    var outletid = req.query.outletId;
    var itemCode = req.query.drinkItemCode;
    Outlet.findOneAndUpdate({outletId: outletid, 'drinks.itemCode': itemCode}, {
        $set: {'drinks.$.available': false}
    }, {safe: true}, function (err, drinkUnavailable) {
        if (!err && drinkUnavailable) {
            res.json({
                success: true,
                data: {message: 'drink made unavailable'},
                error: null
            });
            var socktObj = {
                arr:[]
            };
            for(var sd=0;sd<drinkUnavailable.drinks.length;sd++){
                if(itemCode== drinkUnavailable.drinks[sd].itemCode){
                    socktObj.arr.push(drinkUnavailable.drinks[sd]);
                }
            }
            if(sd>=drinkUnavailable.drinks.length){
                socket.emit('pricechanged', socktObj);
            }
        } else
            res.json({
                success: false,
                data: null,
                error: 'An error occured, contact DB Admin'
            });
    });
});

//API to make drink available
consoleRoutes.put('/availabledrink', function (req, res) {
    var outletid = req.query.outletId;
    var itemCode = req.query.drinkItemCode;

    Outlet.findOneAndUpdate({outletId: outletid, 'drinks.itemCode': itemCode}, {
        $set: {'drinks.$.available': true}
    }, {safe: true}, function (err, drinkAvailable) {
        if (!err && drinkAvailable) {
            res.json({
                success: true,
                data: {message: 'drink made available'},
                error: null
            });
        } else {
            res.json({
                success: false,
                data: null,
                error: 'An error occured, contact DB Admin'
            });
        }
    });
});

// //API to edit food
// consoleRoutes.put('/editfood', function (req, res) {
//     var outletid = req.query.outletId;
//     var obj = req.body;

//     var date1 = moment.utc().add(330, 'minutes');
//     var newdate = new Date(date1);
//     Outlet.findOne({outletId: outletid}, function (err, outletFound) {
//         if (!err && outletFound) {
//             for (var i = 0; i < outletFound.foods.length; i++) {
//                 if (outletFound.foods[i].itemCode == obj.itemCode) {
//                     outletFound.foods[i].foodType = obj.foodType;
//                     outletFound.foods[i].name = obj.name;
//                     outletFound.foods[i].basePrice = obj.basePrice.toString();
//                     outletFound.foods[i].description = obj.description;
//                 }
//             }
//             if (i >= outletFound.foods.length) {
//                 outletFound.save(function (err, saved) {
//                     if (!err && saved) {
//                         res.json({
//                             success: true,
//                             data: {message: 'food edited and saved'},
//                             error: null
//                         });
//                     }
//                 });
//             }
//         } else {
//             res.json({
//                 success: false,
//                 data: null,
//                 error: 'An error occured, contact DB Admin'
//             });
//         }
//     });
// });


//API to edit food
/*consoleRoutes.put('/editfood', function (req, res) {
    var outletid = req.query.outletId;
    var obj = req.body;

    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    Outlet.findOne({outletId: outletid}, function (err, outletFound) {
        if (!err && outletFound) {
            for (var i = 0; i < outletFound.foods.length; i++) {
                if (outletFound.foods[i].itemCode == obj.itemCode) {
                    outletFound.foods[i].skucode = obj.skucode;
                    outletFound.foods[i].foodType = obj.foodType;
                    outletFound.foods[i].name = obj.name;
                    outletFound.foods[i].basePrice = obj.basePrice.toString();
                    outletFound.foods[i].description = obj.description;
                }
            }
            if (i >= outletFound.foods.length) {
                outletFound.save(function (err, saved) {
                    if (!err && saved) {
                        res.json({
                            success: true,
                            data: {message: 'food edited and saved'},
                            error: null
                        });
                    }
                });
            }
        } else {
            res.json({
                success: false,
                data: null,
                error: 'An error occured, contact DB Admin'
            });
        }
    });
});*/


//API to edit food abhishek
consoleRoutes.put('/editfood', upload("foods").single("uploadfile"), function (req, res) {
    var outletid = req.query.outletId;
    var obj = req.body;

    console.log(req.file)
    if (req.file != undefined) {
        let file = req.file.filename.replace(/(?:\.(?![^.]+$)|[^\w.])+/g, "")
        var files = "/" + "foods/" + file;
    }

    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    Outlet.findOne({ outletId: outletid }, function (err, outletFound) {
        if (!err && outletFound) {
            for (var i = 0; i < outletFound.foods.length; i++) {
                if (outletFound.foods[i].itemCode == obj.itemCode) {
                    outletFound.foods[i].foodType = obj.foodType;
                    outletFound.foods[i].name = obj.name;
                    outletFound.foods[i].itemImage = files;
                    outletFound.foods[i].recommended = obj.recommended
                    outletFound.foods[i].skucode = obj.skucode;
                    outletFound.foods[i].basePrice = obj.basePrice.toString();
                    outletFound.foods[i].description = obj.description;
                }
            }
            if (i >= outletFound.foods.length) {
                outletFound.save(function (err, saved) {
                    if (!err && saved) {
                        res.json({
                            success: true,
                            data: { message: 'food edited and saved' },
                            error: null
                        });
                    }
                });
            }
        } else {
            res.json({
                success: false,
                data: null,
                error: 'An error occured, contact DB Admin'
            });
        }
    });
});

//API to make drink unavailable
consoleRoutes.put('/unavailablefood', function (req, res) {
    var outletid = req.query.outletId;
    var itemCode = req.query.foodItemCode;
    Outlet.findOneAndUpdate({outletId: outletid, 'foods.itemCode': itemCode}, {
        $set: {'foods.$.available': false}
    }, {safe: true}, function (err, foodUnavailable) {
        if (!err && foodUnavailable) {
            res.json({
                success: true,
                data: {message: 'food made unavailable'},
                error: null
            });
        } else {
            res.json({
                success: false,
                data: null,
                error: 'An error occured, contact DB Admin'
            });
        }
    });
});

//API to make drink available
consoleRoutes.put('/availablefood', function (req, res) {
    var outletid = req.query.outletId;
    var itemCode = req.query.foodItemCode;

    Outlet.findOneAndUpdate({outletId: outletid, 'foods.itemCode': itemCode}, {
        $set: {'foods.$.available': true}
    }, {safe: true}, function (err, foodAvailable) {
        if (!err && foodAvailable) {
            res.json({
                success: true,
                data: {message: 'food made available'},
                error: null
            });
        } else {
            res.json({
                success: false,
                data: null,
                error: 'An error occured, contact DB Admin'
            });
        }
    });
});

//API to get table Bookings
consoleRoutes.get('/bookings', function (req, res) {
    var token = req.headers['auth_token'];
    var outletid;
    Console.findOne({token:token}, function (err, consoleFoud) {
        if(!err && consoleFoud!=null){
            if(consoleFoud.accessType == 'manager'){
                outletid = consoleFoud.outletId;
                TableBooking.find({outletId: outletid}, function (err, bookings) {
                    if (!err && bookings) {
                        res.json({
                            success:true,
                            data:{
                                bookings:bookings
                            },
                            error:null
                        })
                    }
                    else{
                        res.json({
                            success:false,
                            data:null,
                            error:'Error fetching bookings'
                        });
                    }
                }).sort({bookingId:-1}).lean();
            }
            else if(consoleFoud.accessType == 'full'){
                TableBooking.find({}, function (err, bookings) {
                    if (!err && bookings) {
                        res.json({
                            success:true,
                            data:{
                                bookings:bookings
                            },
                            error:null
                        })
                    }
                    else{
                        res.json({
                            success:false,
                            data:null,
                            error:'Error fetching bookings'
                        });
                    }
                }).sort({bookingId:-1}).limit(200).lean();
            }
        }else{
            res.json({
                success:false,
                data:null,
                error:'Error fetching bookings'
            });
        }
    }).lean();

});




//SMS send on PhoneNumber call this function in confirmbooking API (Abhishek)
// function sendSms(message, bookingFound) {
//     console.log("book", bookingFound)
//     const timestamp = bookingFound.date;
//     const dateObj = new Date(timestamp);
//     const day = dateObj.getUTCDate().toString().padStart(2, '0');
//     const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
//     const year = dateObj.getUTCFullYear();
//     const formattedDate = `${day}-${month}-${year}`;
//     console.log(formattedDate);
//     var request = require('request');
//     var options = {
//         'method': 'POST',
//         'url': 'http://sms.pearlsms.com/public/sms/sendjson',
//         'headers': {
//             'apikey': 'b96d39f95378438fa615ed0ba3435bd0',
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify([{
//             "message": "Dearest Patron, Greetings of the day from FML.! Your Table Reservation for " + formattedDate + " " + bookingFound.time + " is CONFIRMED. For any further queries please call the restaurant on 7888007755. Thank You.! -FML - Food Music Love",
//             "sender": "FMLPUB",
//             "smstype": "TRANS",
//             "numbers": bookingFound.phoneNumber,
//             "unicode": "no"
//         }])
//     }
//     request(options, function (error, response) {
//         if (error) throw new Error(error);
//         console.log(response.body);
//         // responseSuccess(token, message, otp, userFound)
//     });
// }
// //API to confirm booking
// consoleRoutes.put('/confirmbooking', function (req, res) {
//     var bookingid = req.query.bookingId;
//     TableBooking.findOneAndUpdate({ bookingId: bookingid }, { status: 'accepted' },

//         function (err, bookingFound) {
//             if (!err && bookingFound != null) {
//                 var sender = new fcm(gcmSenderKeyAndroid);
//                 if (bookingFound.userAgent == 'android') {
//                     var message = {
//                         to: bookingFound.userGCM,
//                         collapse_key: 'booking',
//                         priority: 'high',
//                         contentAvailable: true,
//                         timeToLive: 3,
//                         message_type: 'booking',
//                         //restrictedPackageName: "somePackageName",
//                         data: {
//                             type: "booking",
//                             icon: "app_logo",
//                             title: "Your booking at FML has been confirmed",
//                             body: "See you there on " + bookingFound.date + " at " + bookingFound.time + "!"
//                         }
//                     };
//                     sender.send(message, function (err, response) {
//                         if (err) {
//                             console.log(err);
//                         } else {
//                             console.log("Successfully sent: ", response);

//                         }
//                     });
//                 }
//                 else {
//                     var message1 = {
//                         to: bookingFound.userGCM,
//                         collapse_key: 'booking',
//                         priority: 'high',
//                         contentAvailable: true,
//                         timeToLive: 3,
//                         message_type: 'booking',
//                         //restrictedPackageName: "somePackageName",
//                         data: {
//                             type: "booking",
//                             icon: "app_logo",
//                             title: "Your booking at FML has been confirmed",
//                             body: "See you there on " + bookingFound.date + " at " + bookingFound.time + "!"
//                         },
//                         notification: {
//                             title: "Your booking at FML has been confirmed",
//                             body: "See you there on " + bookingFound.date + " at " + bookingFound.time + "!",
//                             sound: "default",
//                             badge: "2",
//                             content_available: true,
//                             priority: "high",
//                             color: "#3ed6d2"
//                         },
//                         aps: {
//                             sound: "default",
//                             badge: "2",
//                             alert: 'Your booking at FML has been confirmed'
//                         }
//                     };
//                     sender.send(message1, function (err, response) {
//                         if (err) {
//                             console.log(err);
//                         } else {

//                             console.log("Successfully sent: ", response);
//                         }
//                     });

//                 }
//                 setTimeout(function () { //(Abhishek)
//                     sendSms(message, bookingFound);
//                 }, 2000);
//                 res.json({
//                     success: true,
//                     data: { message: 'Accepted Booking Successfully' },
//                     error: null
//                 });
//             } else {
//                 console.log(err);
//                 res.json({
//                     success: false,
//                     data: null,
//                     error: 'Error finding Booking'
//                 });
//             }

//         });
// });



// //SMS send on PhoneNumber call this function in declinebooking API (Abhishek)
// function declineSendSms(message, bookingFound) {
//     console.log("book", bookingFound)
//     const timestamp = bookingFound.date;
//     const dateObj = new Date(timestamp);
//     const day = dateObj.getUTCDate().toString().padStart(2, '0');
//     const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
//     const year = dateObj.getUTCFullYear();
//     const formattedDate = `${day}-${month}-${year}`;
//     console.log(formattedDate);
//     var request = require('request');
//     var options = {
//         'method': 'POST',
//         'url': 'http://sms.pearlsms.com/public/sms/sendjson',
//         'headers': {
//             'apikey': 'b96d39f95378438fa615ed0ba3435bd0',
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify([{
//             "message": "Dearest Patron, Greetings of the day from FML.! Your Table Reservation for " + formattedDate + " " + bookingFound.time + " is WAITLISTED. For any further queries please call the restaurant on 7888007755. Thank You.! -FML - Food Music Love",
//             "sender": "FMLPUB",
//             "smstype": "TRANS",
//             "numbers": bookingFound.phoneNumber,
//             "unicode": "no"
//         }])
//     }
//     request(options, function (error, response) {
//         if (error) throw new Error(error);
//         console.log(response.body);
//         // responseSuccess(token, message, otp, userFound)
//     });
// }
// //API to decline booking
// consoleRoutes.put('/declinebooking', function (req, res) {
//     var bookingid = req.query.bookingId;
//     TableBooking.findOneAndUpdate({ bookingId: bookingid }, {
//         status: 'declined'
//     }, function (err, bookingFound) {
//         if (!err && bookingFound != null) {
//             var sender = new fcm(gcmSenderKeyAndroid);
//             if (bookingFound.userAgent == 'android') {
//                 var message = {
//                     to: bookingFound.userGCM,
//                     collapse_key: 'booking',
//                     priority: 'high',
//                     contentAvailable: true,
//                     timeToLive: 3,
//                     message_type: 'booking',
//                     //restrictedPackageName: "somePackageName",
//                     data: {
//                         type: "booking",
//                         icon: "app_logo",
//                         title: "Your booking at FML has been DECLINED",
//                         body: "Unfortunately we could not confirm your booking due to unavailability of tables"
//                     }
//                 };
//                 sender.send(message, function (err, response) {
//                     if (err) {
//                         console.log(err);
//                     } else {
//                         console.log("Successfully sent: ", response);
//                     }
//                 });
//             }
//             else {
//                 var message1 = {
//                     to: bookingFound.userGCM,
//                     collapse_key: 'booking',
//                     priority: 'high',
//                     contentAvailable: true,
//                     timeToLive: 3,
//                     message_type: 'booking',
//                     //restrictedPackageName: "somePackageName",
//                     data: {
//                         type: "booking",
//                         icon: "app_logo",
//                         title: "Your booking at FML has been DECLINED",
//                         body: "Unfortunately we could not confirm your booking due to unavailability of tables"
//                     },
//                     notification: {
//                         title: "Your booking at FML has been DECLINED",
//                         body: "Unfortunately we could not confirm your booking due to unavailability of tables",
//                         sound: "default",
//                         badge: "2",
//                         content_available: true,
//                         priority: "high",
//                         color: "#3ed6d2"
//                     },
//                     aps: {
//                         sound: "default",
//                         badge: "2",
//                         alert: 'Your booking at FML has been DECLINED'
//                     }
//                 };
//                 sender.send(message1, function (err, response) {
//                     if (err) {
//                         console.log(err);
//                     } else {

//                         console.log("Successfully sent: ", response);
//                     }
//                 });
//             }
//             setTimeout(function(){
//                 declineSendSms(message, bookingFound); 
//             },2000)
//             res.json({
//                 success: true,
//                 data: { message: 'Declined Booking Successfully' },
//                 error: null
//             });
//         } else {
//             console.log(err);
//             res.json({
//                 success: false,
//                 data: null,
//                 error: 'Error finding Booking'
//             });
//         }
//     });
// });


function sendSms(message, bookingFound) {
    console.log("book", bookingFound)
    const timestamp = bookingFound.date;
    const dateObj = new Date(timestamp);
    const day = dateObj.getUTCDate().toString().padStart(2, '0');
    const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getUTCFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    console.log(formattedDate);
    var request = require('request');
    var options = {
        'method': 'POST',
        'url': 'http://sms.pearlsms.com/public/sms/sendjson',
        'headers': {
            'apikey': 'b96d39f95378438fa615ed0ba3435bd0',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify([{
            "message": "Dearest Patron, Greetings of the day from FML.! Your Table Reservation for " + formattedDate + " " + bookingFound.time + " is CONFIRMED. For any further queries please call the restaurant on 7888007755. Thank You.! -FML - Food Music Love",
            "sender": "FMLPUB",
            "smstype": "TRANS",
            "numbers": bookingFound.phoneNumber,
            "unicode": "no"
        }])
    }
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
        // responseSuccess(token, message, otp, userFound)
    });
}
//API to confirm booking
consoleRoutes.put('/confirmbooking', function (req, res) {
    var bookingid = req.query.bookingId;
    TableBooking.findOneAndUpdate({ bookingId: bookingid }, { status: 'accepted' },
        function (err, bookingFound) {
            const timestamp = bookingFound.date;
            const dateObj = new Date(timestamp);
            const day = dateObj.getUTCDate().toString().padStart(2, '0');
            const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
            const year = dateObj.getUTCFullYear();
            const formattedDate = `${day}-${month}-${year}`;
            console.log(formattedDate);
            if (!err && bookingFound != null) {
                var sender = new fcm(gcmSenderKeyAndroid);
                if (bookingFound.userAgent == 'android') {
                    var message = {
                        to: bookingFound.userGCM,
                        collapse_key: 'booking',
                        priority: 'high',
                        contentAvailable: true,
                        timeToLive: 3,
                        message_type: 'booking',
                        // restrictedPackageName: "somePackageName",
                        data: {
                            type: "booking",
                            icon: "app_logo",
                            title: "Your booking at FML has been confirmed",
                            body: "See you there on " + formattedDate + " at " + bookingFound.time + "!"
                        }
                    };
                    sender.send(message, function (err, response) {
                        console.log("abhi",message);
                        if (!err && response) {
                            console.log("SenderAbhi", response)
                            // console.log("Successfully sent Abhi: ", response);
                        } else {
                            console.log(err);

                        }
                    });
                }
                else {
                    var message1 = {
                        to: bookingFound.userGCM,
                        collapse_key: 'booking',
                        priority: 'high',
                        contentAvailable: true,
                        timeToLive: 3,
                        message_type: 'booking',
                        // restrictedPackageName: "somePackageName",
                        data: {
                            type: "booking",
                            icon: "app_logo",
                            title: "Your booking at FML has been confirmed",
                            body: "See you there on " + formattedDate + " at " + bookingFound.time + "!"
                        },
                        notification: {
                            title: "Your booking at FML has been confirmed",
                            body: "See you there on " + formattedDate + " at " + bookingFound.time + "!",
                            sound: "default",
                            badge: "2",
                            content_available: true,
                            priority: "high",
                            color: "#3ed6d2"
                        },
                        aps: {
                            sound: "default",
                            badge: "2",
                            alert: 'Your booking at FML has been confirmed'
                        }
                    };
                    sender.send(message1, function (err, response) {
                        if (!err && response) {
                            console.log("Successfully sent: ", response);
                        } else {
                            console.log(err);
                        }
                    });

                }
                setTimeout(function () { //(Abhishek)
                    sendSms(message, bookingFound);
                }, 2000);
                res.json({
                    success: true,
                    data: { message: 'Accepted Booking Successfully' },
                    error: null
                });
            } else {
                console.log(err);
                res.json({
                    success: false,
                    data: null,
                    error: 'Error finding Booking'
                });
            }

        });
});



//SMS send on PhoneNumber call this function in declinebooking API (Abhishek)
function declineSendSms(message, bookingFound) {
    console.log("book", bookingFound)
    const timestamp = bookingFound.date;
    const dateObj = new Date(timestamp);
    const day = dateObj.getUTCDate().toString().padStart(2, '0');
    const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getUTCFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    console.log(formattedDate);
    var request = require('request');
    var options = {
        'method': 'POST',
        'url': 'http://sms.pearlsms.com/public/sms/sendjson',
        'headers': {
            'apikey': 'b96d39f95378438fa615ed0ba3435bd0',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify([{
            "message": "Dearest Patron, Greetings of the day from FML.! Your Table Reservation for " + formattedDate + " " + bookingFound.time + " is WAITLISTED. For any further queries please call the restaurant on 7888007755. Thank You.! -FML - Food Music Love",
            "sender": "FMLPUB",
            "smstype": "TRANS",
            "numbers": bookingFound.phoneNumber,
            "unicode": "no"
        }])
    }
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
        // responseSuccess(token, message, otp, userFound)
    });
}
//API to decline booking
consoleRoutes.put('/declinebooking', function (req, res) {
    var bookingid = req.query.bookingId;
    TableBooking.findOneAndUpdate({ bookingId: bookingid }, {
        status: 'declined'
    }, function (err, bookingFound) {
        if (!err && bookingFound != null) {
            var sender = new fcm(gcmSenderKeyAndroid);
            if (bookingFound.userAgent == 'android') {
                var message = {
                    to: bookingFound.userGCM,
                    collapse_key: 'booking',
                    priority: 'high',
                    contentAvailable: true,
                    timeToLive: 3,
                    message_type: 'booking',
                    //restrictedPackageName: "somePackageName",
                    data: {
                        type: "booking",
                        icon: "app_logo",
                        title: "Your booking at FML has been DECLINED",
                        body: "Unfortunately we could not confirm your booking due to unavailability of tables"
                    }
                };
                sender.send(message, function (err, response) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Successfully sent: ", response);
                    }
                });
            }
            else {
                var message1 = {
                    to: bookingFound.userGCM,
                    collapse_key: 'booking',
                    priority: 'high',
                    contentAvailable: true,
                    timeToLive: 3,
                    message_type: 'booking',
                    //restrictedPackageName: "somePackageName",
                    data: {
                        type: "booking",
                        icon: "app_logo",
                        title: "Your booking at FML has been DECLINED",
                        body: "Unfortunately we could not confirm your booking due to unavailability of tables"
                    },
                    notification: {
                        title: "Your booking at FML has been DECLINED",
                        body: "Unfortunately we could not confirm your booking due to unavailability of tables",
                        sound: "default",
                        badge: "2",
                        content_available: true,
                        priority: "high",
                        color: "#3ed6d2"
                    },
                    aps: {
                        sound: "default",
                        badge: "2",
                        alert: 'Your booking at FML has been DECLINED'
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
            setTimeout(function () {
                declineSendSms(message, bookingFound);
            }, 2000)
            res.json({
                success: true,
                data: { message: 'Declined Booking Successfully' },
                error: null
            });
        } else {
            console.log(err);
            res.json({
                success: false,
                data: null,
                error: 'Error finding Booking'
            });
        }
    });
});



//API to add admin to an outlet
consoleRoutes.post('/addadminoutlet', function (req, res) {
    var admin = new Admin;
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var outletid = parseInt(req.query.outletId);
    console.log(outletid);
    console.log(req.query);
    Outlet.findOne({outletId:outletid}, function (err, outletFound) {
        if(!err && outletFound){
            Admin.find({}, function (err, admins) {
                if (!err && admins) {
                    var adminid = 1;
                    if (admins.length > 0) {
                        adminid = admins[0].adminId + 1;
                    }
                    var obj = req.body;
                    var usrname = obj.name;
                    var password = obj.password;

                    admin.adminId = adminid;
                    admin.userName = usrname;
                    admin.password = password;
                    admin.name = usrname;
                    admin.outletId = outletid;
                    admin.token = "";
                    admin.state = "inactive";
                    admin.outlet = outletFound.locality;
                    admin.created_at = newdate;
                    admin.updated_at = newdate;
                    admin.save(function (err, adminAdded) {
                        if (!err && adminAdded) {
                            res.json({
                                success: true,
                                data: {message: 'Admin Added Successfully'},
                                error: null
                            });
                        } else {
                            console.log(err);
                            res.json({
                                success: false,
                                data: null,
                                error: 'error adding admin'
                            });

                        }
                    });
                } else {
                    console.log(err);
                }
            }).sort({adminId: -1});
        }
        else{
            console.log(err);
            res.json({
                success: false,
                data: null,
                error: 'error finding outlet'
            });
        }
    });
});//end fo API to add admin

//API to get admins
consoleRoutes.get('/adminsoutlet', function (req, res) {
    var outletid = req.query.outletId;
    Admin.find({outletId:outletid}, function (err, admins) {
        if (!err && admins) {
            res.json({
                success: true,
                data: {admins: admins},
                error: null
            });
        } else {
            console.log(err);
            res.json({
                success: false,
                data: null,
                error: 'error fetching admins'
            });
        }
    }).lean();
});//end of API to fetch admins

//APi to get logs
consoleRoutes.get('/logs', function (req, res) {

    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var date = moment(date1).format('YYYY-MM-DD');
    var time = moment(date1).format('HH:mm:ss');

    Dailylog.findOne({logDate:date}, function (err, allLogsToday) {
        if(!err && allLogsToday!=null){
            res.json({
                    success:true,
                    data:{logs:allLogsToday.loggings},
                    error:null
                });
        }
        else{
            res.json({
                success:true,
                data:{logs:[]},
                error:null
            });
        }
    });
});

//API to update console user GCM ID
consoleRoutes.put('/updatefcm', function (req, res) {
    var token = req.headers['auth_token'];
    var newToken = req.query.gcmId;
    Console.findOneAndUpdate({token: token}, {
        gcmId: newToken
    }, {safe: true}, function (err, userFound) {
        if (!err && userFound != null) {
            res.json({
                success: true,
                data: {message: 'FCM ID updated'},
                error: null
            });
        } else {
            res.json({
                success: false,
                data: null,
                error: 'Error updating User, user not found in DB'
            });
        }
    });
});

//API to get outlets
// consoleRoutes.get('/outletsonly', function (req, res) {

//     var allOutlets=[];


//     Outlet.find({}, function (err, outletsFound) {
//         if (!err && outletsFound) {
//             for(var o=0;o<outletsFound.length;o++){
//                 var eachOutlet = {
//                     outletId : outletsFound[o].outletId,
//                     name : outletsFound[o].name,
//                     status : outletsFound[o].status,
//                     locality : outletsFound[o].locality,
//                     outletImage : outletsFound[o].outletImage,
//                     address : outletsFound[o].address,
//                     phno : outletsFound[o].phno,
//                     lat : outletsFound[o].lat,
//                     lon : outletsFound[o].lon,
//                     startTime : outletsFound[o].startTime,
//                     endTime : outletsFound[o].endTime,
//                     placeOfferIds : outletsFound[o].placeOfferIds,
//                     placeEventIds : outletsFound[o].placeEventIds,
//                     noOfTables  : outletsFound[o].tables.length,
//                     noOfDrinks : outletsFound[o].drinks.length,
//                     noOfFoods : outletsFound[o].foods.length,
//                     oldpos:outletsFound[o].oldpos
//                 };
//                 allOutlets.push(eachOutlet);
//             }
//             if(o>=outletsFound.length-1){
//                 res.json({
//                     success: true,
//                     data: {outlets: allOutlets},
//                     error: null
//                 })
//             }

//         } else {
//             res.json({
//                 success: false,
//                 data: null,
//                 error: 'error fetching outlets'
//             });
//         }
//     }).sort({outletId: 1}).lean();
// });//end of get outlets API



//API to get outlets
consoleRoutes.get('/outletsonly', function (req, res) {

    var allOutlets=[];
    var token = req.headers['auth_token'];
    Console.findOne({token:token}, function (err, consoleFoud) {
        if(!err && consoleFoud!=null){
            if(consoleFoud.accessType == 'manager'){
                Outlet.findOne({outletId:consoleFoud.outletId}, function (err, outletsFound) {
                    if (!err && outletsFound) {
                            var eachOutlet = {
                                outletId : outletsFound.outletId,
                                name : outletsFound.name,
                                status : outletsFound.status,
                                locality : outletsFound.locality,
                                outletImage : outletsFound.outletImage,
                                address : outletsFound.address,
                                phno : outletsFound.phno,
                                lat : outletsFound.lat,
                                lon : outletsFound.lon,
                                startTime : outletsFound.startTime,
                                endTime : outletsFound.endTime,
                                placeOfferIds : outletsFound.placeOfferIds,
                                placeEventIds : outletsFound.placeEventIds,
                                noOfTables  : outletsFound.tables.length,
                                noOfDrinks : outletsFound.drinks.length,
                                noOfFoods : outletsFound.foods.length,
                                oldpos:outletsFound.oldpos
                            };
                            allOutlets.push(eachOutlet);
                            res.json({
                                success: true,
                                data: {outlets: allOutlets},
                                error: null
                            })   
                    } else {
                        res.json({
                            success: false,
                            data: null,
                            error: 'error fetching outlets'
                        });
                    }
                });
            }
            else if(consoleFoud.accessType == 'full'){
                Outlet.find({}, function (err, outletsFound) {
                    if (!err && outletsFound) {
                        for(var o=0;o<outletsFound.length;o++){
                            var eachOutlet = {
                                outletId : outletsFound[o].outletId,
                                name : outletsFound[o].name,
                                status : outletsFound[o].status,
                                locality : outletsFound[o].locality,
                                outletImage : outletsFound[o].outletImage,
                                address : outletsFound[o].address,
                                phno : outletsFound[o].phno,
                                lat : outletsFound[o].lat,
                                lon : outletsFound[o].lon,
                                startTime : outletsFound[o].startTime,
                                endTime : outletsFound[o].endTime,
                                placeOfferIds : outletsFound[o].placeOfferIds,
                                placeEventIds : outletsFound[o].placeEventIds,
                                noOfTables  : outletsFound[o].tables.length,
                                noOfDrinks : outletsFound[o].drinks.length,
                                noOfFoods : outletsFound[o].foods.length,
                                oldpos:outletsFound[o].oldpos
                            };
                            allOutlets.push(eachOutlet);
                        }
                        if(o>=outletsFound.length-1){
                            res.json({
                                success: true,
                                data: {outlets: allOutlets},
                                error: null
                            })
                        }
                    } else {
                        res.json({
                            success: false,
                            data: null,
                            error: 'error fetching outlets'
                        });
                    }
                }).sort({outletId: 1}).lean();
            }
        }else{
            res.json({
                success:false,
                data:null,
                error:'Error fetching console'
            });
        }
    }).lean();

});//end of get outlets API


//API to get outlets
consoleRoutes.get('/getoutletdrinks', function (req, res) {
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
consoleRoutes.get('/getoutletfoods', function (req, res) {
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
consoleRoutes.get('/getoutlettables', function (req, res) {
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

//API to flush data for individual outlet drinks
consoleRoutes.get('/resetoutlet', function (req, res) {

    var token = req.headers['auth_token'];
    var outletid;
    var outletid = req.query.id;
    Console.findOne({token:token}, function (err, consoleFound) {
        if(!err && consoleFound!=null){
                Outlet.findOne({outletId:outletid}, function (err, outlet) {
                    if (!err && outlet) {
                            for (var i = 0; i < outlet.drinks.length; i++) {
                                outlet.drinks[i].runningPrice = outlet.drinks[i].basePrice;
                            }
                          
                            if (i >= outlet.drinks.length-1) {
                                outlet.save(function (err, saved) {
                                    if (!err && saved) {
                                        res.json({
                                            success: true,
                                            data: null,
                                            error: null
                                        });
                                    }
                                    else {
                                        console.log(err);
                                    }
                                });
                            }

                    }
                    else {
                        console.log(err);
                    }
                });
            
        }else{
            res.json({
                success:false,
                data:null,
                error: 'Error giving access'
            });
        }
    });



});

///API for special push to all users
consoleRoutes.post('/specialpush', function (req, res) {
    var form = formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if(!err && fields && files){
            var pushobj = JSON.parse(fields.specialPushModel);
            if(files.pushImage!=null){
                try {
                    var   path_pushImage = (__dirname + '/../uploads/pushimages/special.jpg');
                    var   pushImage = files.pushImage.path;
                    var   pathset = ('/pushimages/special.jpg');
                    rewrite(pushImage, path_pushImage, pushobj.title, pushobj.body, pathset);
                }
                catch (err) {
                    console.log(err);
                }
            }
        }
    });//end of form parse

    function rewrite(image, path, title, body, imagePath) {
        fs.readFile(image, function (err, data) {
            fs.writeFile(path, data, function (err) {
                if (err){
                    console.log('error writing');
                }else{
                    res.json({
                        success:true,
                        data:{message:'sending to all users'},
                        error:null
                    });
                    User.find({}, function (err, allUsers) {
                        if(!err && allUsers){

                            //var userLength = allUsers.length;

/*
                            var gcmId = "eEGAGhREn4U:APA91bGtwhL9ZyAZsUzJQbUKOFu1RLVHaumkfNhpEoWuzIARoEf_J35wISYawI5i7PBV-repLhk1Ux229cftGUtKl0jHmX1c3Uw0-7tleuk9zzhHf3Z89ysP3tDWecIfgp8H3ULVB549"
                            var senderAndroid = new fcm(gcmSenderKeyAndroid);
                            var fcmMessage1 = {
                                to: gcmId,
                                collapseKey: 'demo',
                                priority: 'high',
                                contentAvailable: true,
                                timeToLive: 3,
                                //restrictedPackageName: "somePackageName",
                                data: {
                                    type: "covidmessage",
                                    title: title,
                                    body: body,
                                    icon: "app_logo",
                                    game: imagePath
                                }
                            };
                            //adding sender reg Id (gcmId)
                            senderAndroid.send(fcmMessage1, function(err, response){
                                if (err) {
                                    console.log("Something has gone wrong!");
                                } else {
                                    console.log("Successfully sent with response: ", response);
                                }
                            });*/
                            allUsers.forEach(function (eachUser) {
                                    if(eachUser.userAgent == 'ios'){
                                        /*var senderIos = new fcm(gcmSenderKeyAndroid);
                                        var fcmMessage = {
                                            to: eachUser.gcmId,
                                            collapseKey: 'demo',
                                            priority: 'high',
                                            contentAvailable: true,
                                            timeToLive: 3,
                                            //restrictedPackageName: "somePackageName",
                                            data: {
                                                type: "covidmessage"
                                            },
                                            notification: {
                                                icon: "app_logo",
                                                title: title,
                                                body:  body,
                                                badge: "2",
                                                sound: "default",
                                                color: "#ffffff"
                                            }
                                        };
                                        //adding sender reg Id (gcmId)
                                        senderIos.send(fcmMessage, function(err, response){
                                            if (err) {
                                                console.log("Something has gone wrong!");
                                            } else {
                                                console.log("Successfully sent with response: ", response);
                                            }
                                        });*/
                                    }
                                    if(eachUser.userAgent == 'android'){
                                        var senderAndroid = new fcm(gcmSenderKeyAndroid);
                                        var fcmMessage1 = {
                                            to: eachUser.gcmId,
                                            collapseKey: 'demo',
                                            priority: 'high',
                                            contentAvailable: true,
                                            timeToLive: 3,
                                            //restrictedPackageName: "somePackageName",
                                            data: {
                                                type: "covidmessage",
                                                title: title,
                                                body: body,
                                                icon: "app_logo",
                                                game: imagePath
                                            }
                                        };
                                        //adding sender reg Id (gcmId)
                                        senderAndroid.send(fcmMessage1, function(err, response){
                                            if (err) {

                                            }
                                        });
                                    }


                                //
                                //if(userLength-1 === a){
                                //}
                            });//end of seperating each user
                        }else{
                            res.json({
                                success:false,
                                data:null,
                                error:'error fetching users'
                            });
                        }

                    });//end of finding all users

                }

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

});//end of API to push special messages

//API to set POS
consoleRoutes.put('/setposvalue', function (req, res) {

    var outlet_id = req.query.outlet_id;
    var oldpos = req.query.oldpos;
    var token = req.headers['auth_token'];
    Console.findOne({token:token}, function (err, consoleFound) {
        if(!err && consoleFound){
            if(consoleFound.accessType == 'full'){
                Outlet.findOne({outletId:outlet_id}, function (err, found) {
                    if(!err && found!=null){
                        found.oldpos = oldpos;
                        found.save(function (err, saved) {
                            if(!err && saved){
                                console.log("Updated pos values")
                                res.json({
                                    success:true,
                                    data:{message:'Updated pos values'+oldpos},
                                    error:null
                                }) 
                            }else{
                                console.log("Error Updating pos Values")
                                res.json({
                                    success:false,
                                    data:null,
                                    error:'Error Updating pos Values'
                                })
                            }
                        });
                    }else{
                        console.log("err");
                        res.json({
                            success:false,
                            data:null,
                            error:'Error fetching game values'
                        });
                    }
                });

            }
            else{
                res.json({
                    success:false,
                    data:null,
                    error:'You dont have permissions'
                });
            }
        }
        else{
            res.json({
                success:false,
                data:null,
                error:'You dont have permissions'
            });
        }
    }).lean();
});



// change current price for max discount.
const ObjectID = require('mongodb').ObjectId

consoleRoutes.put('/updatecurrentprice', function (req, res) {
    
    let outletid = req.query.outletId ;
    let maxdiscount =req.query.maxdiscount;

    let date1 = moment.utc().add(330, 'minutes');
    let newdate = new Date(date1);

       Gamevalue.findOne({}, function (err, found) {
        if (!err && found != null) {

        let discount
        let seconds 

        if(maxdiscount === "50"){
           discount=20
           seconds = 600000
        }else if(maxdiscount === "75"){
          discount= 25
          seconds = 750000
        }else if(maxdiscount === "100"){
            discount = 30
            seconds = 900000
       }else{
        return
       }
       
       console.log("discount:", discount, ">>>>>>>>>", "seconds:", seconds)
     
            found.maxDiscount = discount;
            found.seconds = seconds;
            found.updated_at = newdate;
            found.save()
        }     
    });
    
 if(outletid != null || maxdiscount != null){

    Outlet.findOne({ outletId: outletid }, 
        function (err, outletFound) {
        if (!err && outletFound) {
            for (var i = 0; i < outletFound.drinks.length; i++) {
                let drinks = outletFound.drinks[i]

                if (drinks.capPrice > drinks.basePrice && drinks.capPrice > drinks.runningPrice) {

                    let basePrice = parseInt(drinks.basePrice)
                    let pricediff = drinks.capPrice - basePrice
                    let value = maxdiscount / 100 * pricediff;
                  
                    let changecurrentprice = basePrice + value
                    
                    Outlet.updateMany({ outletId: outletid,
                        "drinks._id": ObjectID(drinks._id) },
                        { $set: { "drinks.$.runningPrice": Math.round(changecurrentprice)} },
                        function (err, result) { })
                    drinks.runningPrice = Math.round(changecurrentprice)
                }
            }
            if (i >= outletFound.drinks.length) {
                outletFound.save(function (err, saved) {
                    if (!err && saved) {
                        res.json({
                            success: true,
                            data: { message: `Price hiked by ${maxdiscount}%.` },
                            error: null
                        });
                    }
                });
            }
        } else {
            res.json({
                success: false,
                data: null,
                error: 'An error occured, contact DB Admin'
            });
        }
    });
}
});


module.exports = consoleRoutes;
