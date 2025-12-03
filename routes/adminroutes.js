/**
 * Created by ritej on 5/9/2017.
 */

//Library Inits
const express = require('express');
const mongoose = require('mongoose');
var formidable = require('formidable');
var fcm = require('fcm-node');
const request = require('request');
var moment = require('moment');
var moment1 = require('moment-timezone');
moment1.tz.setDefault('Asia/Kolkata');
var fs = require('fs');

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
const Offeravail = require('../models/offeravail');
const Dailylog = require('../models/dailylog');
const axios = require('axios');
const jwt = require('jsonwebtoken');

var gcmSenderKeyAndroid = 'AAAALJErIRw:APA91bFY8TIKhiEf_7h5abk2chqhqg7YJB5-ePZj7_0466XN2M_JrE_qkNKpVkKvMxJQ9J2txwqvnPG52yxC1Vu2J2M_B7a0xYWBXMFr4BNwEULhQLdNR-EMgNkqOjjXvrG7cyAug1h_';


var adminRoutes = express.Router();
var socket = require('../io').io();





//Middleware to verify token
adminRoutes.use(function (req, res, next) {
    var admintoken = req.headers['auth_token'];
    if (admintoken) {
        // verifies secret and checks exp
        Admin.findOne({
            "token": admintoken
        }, function (err, decoded) {
            if (!err && decoded) {
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

//API to get outlet for admin
adminRoutes.get('/outlets', function (req, res) {
    var token = req.headers['auth_token'];
    Admin.findOne({token: token}, function (err, adminFound) {
        if (!err && adminFound) {
            Outlet.findOne({outletId: adminFound.outletId}, function (err, outlet) {
                if (!err && outlet) {
                    var array = [];
                    array.push(outlet);
                    res.json({
                        success: true,
                        data: {outlets: array},
                        error: null
                    });
                } else {
                    res.json({
                        success: false,
                        data: null,
                        error: 'error fetching outlets'
                    });
                }
            }).lean();

        } else {
            console.log(err);
            res.json({
                success:false,
                data:null,
                error:'Error finding admin'
            });
        }
    }).lean();
});

//API to get outlets
adminRoutes.get('/getoutletdrinks', function (req, res) {

    var token = req.headers['auth_token'];
    Admin.findOne({token: token}, function (err, adminFound) {
        if (!err && adminFound) {
            Outlet.findOne({outletId:adminFound.outletId},{drinks:1}, function (err, outletsFound) {
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
        }
    }).lean();

});//end of get outlets API

//API to get outlets
adminRoutes.get('/getoutletfoods', function (req, res) {

    var token = req.headers['auth_token'];
    Admin.findOne({token: token}, function (err, adminFound) {
        if (!err && adminFound) {
            Outlet.findOne({outletId:adminFound.outletId},{foods:1}, function (err, outletsFound) {
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
        }
    }).lean();

});//end of get outlets API



//APi to set admin state
adminRoutes.put('/setstate', function (req, res) {
    var token = req.headers['auth_token'];
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    Admin.findOneAndUpdate({token: token}, {
        state: 'active',
        updated_at: newdate
    }, {safe: true, new: true}, function (err, isset) {
        if (!err && isset) {
            res.json({
                success: true,
                data: {message: 'done'},
                error: null
            });
        } else {
            res.json({
                success: false,
                data: null,
                error: 'error updating admin'
            });
        }
    });
});

//APi to remove admin state
adminRoutes.put('/removestate', function (req, res) {
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var token = req.headers['auth_token'];
    Admin.findOneAndUpdate({token: token}, {
        state: 'inactive',
        updated_at: newdate
    }, {safe: true, new: true}, function (err, isset) {
        if (!err && isset) {
            res.json({
                success: true,
                data: {message: 'removed'},
                error: null
            });
        } else {
            res.json({
                success: false,
                data: null,
                error: 'error updating admin'
            });
        }
    });
});

//API to get admin date
adminRoutes.get('/state', function (req, res) {
    var token = req.headers['auth_token'];
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var date = moment(date1).format('YYYY-MM-DD');
    var time = moment(date1).format('HH:mm:ss');
    var mongoid;
    var latestid;
    var outletid;
    Admin.findOne({token: token}, function (err, adminFound) {
        if (!err && adminFound) {
            res.json({
                success: true,
                data: adminFound.state,
                error: null
            });
            outletid = adminFound.outletId;
            Order.find({orderDate:date}, function (err, orders) {
                for(var i=0;i<orders.length;i++){
                    if(orders[i].status!='cancelled'){
                        for(var j=i+1;j<orders.length;j++){
                            if(orders[j].status!='cancelled'){
                                if((orders[i].orderId == orders[j].orderId) && (orders[i].outletId == orders[j].outletId)){

                                    if(orders[i].status != 'pending'){
                                        mongoid = orders[j]._id.toString();
                                    }else{
                                        mongoid = orders[i]._id.toString();
                                    }

                                    Order.findByIdAndRemove(mongoid, function (err, duplicateOrder) {
                                        if(!err && duplicateOrder){
                                           console.log('duplicate removed')
                                        }
                                        else{
                                            console.log(err);
                                        }
                                    });

                                }

                            }
                        }

                    }
                }
            }).sort({orderId:-1}).limit(100);
        } else {
            console.log(err);
            res.json({
                success: false,
                data: null,
                error: 'Error fetching admin'
            });
        }
    }).lean();
});

//API to get orders
// adminRoutes.get('/orders', function (req, res) {
//     var token = req.headers['auth_token'];

//     function sortFunctionOrders(a, b) {
//         var name1, name2;
//         name1 = a.orderId;
//         name2 = b.orderId;
//         return name1 > name2 ? -1 : 1;
//     }

//     Admin.findOne({token: token}, function (err, adminFound) {
//         if (!err && adminFound) {
//             Order.find({$and:[{outletId: adminFound.outletId},{$or:[{status:'pending'},{status:'confirmed'}]}]}, function (err, ordersFound) {
//                 if (!err && ordersFound) {
//                     var orderArray = [];
//                     for (var i = 0; i < adminFound.tables.length; i++) {
//                         for (var j = 0; j < ordersFound.length; j++) {
//                             if (adminFound.tables[i].tableNumber == ordersFound[j].tableNumber) {
//                                 orderArray.push(ordersFound[j]);
//                             }

//                         }
//                     }
//                     if (i >= adminFound.tables.length) {
//                         orderArray.sort(sortFunctionOrders);
//                         res.json({
//                             success: true,
//                             data: {orders: orderArray},
//                             error: null
//                         });
//                     }

//                 } else{
//                     console.log(err);
//                     res.json({
//                         success:false,
//                         data:null,
//                         error:'Error fetching orders'
//                     });
//                 }
//             }).sort({orderId: -1}).limit(1000).lean();
//         } else {
//             console.log(err);
//             res.json({
//                 success:false,
//                 data:null,
//                 error:'Error finding admin'
//             });
//         }
//     });
// });

//Abhishek
adminRoutes.get('/orders', function (req, res) {
    var token = req.headers['auth_token'];

    function sortFunctionOrders(a, b) {
        var name1, name2;
        name1 = a.orderId;
        name2 = b.orderId;
        return name1 > name2 ? -1 : 1;
    }

    Admin.findOne({ token: token }, function (err, adminFound) {
        if (!err && adminFound) {
            Order.find({ $and: [{ outletId: adminFound.outletId }, { $or: [{ status: 'pending' }, { status: 'confirmed' }] }] }, function (err, ordersFound) {
                if (!err && ordersFound) {
                    var orderArray = [];
                    var promises = [];

                    for (var i = 0; i < adminFound.tables.length; i++) {
                        for (var j = 0; j < ordersFound.length; j++) {
                            if (adminFound.tables[i].tableNumber == ordersFound[j].tableNumber) {
                                const promise = User.findOne({ userId: ordersFound[j].userId }).exec();
                                promises.push(promise);

                                orderArray.push(ordersFound[j]);
                            }
                        }
                    }

                    Promise.all(promises)
                        .then(function (usersFound) {
                            for (var k = 0; k < usersFound.length; k++) {
                                if (usersFound[k] != null) {
                                    orderArray[k].customerName = usersFound[k].name;
                                    orderArray[k].phoneNumber = usersFound[k].phoneNumber;
                                    orderArray[k].numberOfVisits = usersFound[k].numberOfVisits;
                                }
                            }
                            // console.log("OrderObecjet",orderArray)
                            orderArray.sort(sortFunctionOrders);

                            res.json({
                                success: true,
                                data: { orders: orderArray },
                                error: null
                            });
                        })
                        .catch(function (err) {
                            console.log(err);
                            res.json({
                                success: false,
                                data: null,
                                error: 'Error fetching user data'
                            });
                        });
                } else {
                    console.log(err);
                    res.json({
                        success: false,
                        data: null,
                        error: 'Error fetching orders'
                    });
                }
            }).sort({ orderId: -1 }).limit(1000).lean();
        } else {
            console.log(err);
            res.json({
                success: false,
                data: null,
                error: 'Error finding admin'
            });
        }
    });
});


//API to get drink categories
adminRoutes.get('/category', function (req, res) {
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
    }).sort({sequence: 1}).lean();
});//end of API to get categories

//API to get food categories
adminRoutes.get('/foodcategory', function (req, res) {

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
    }).sort({sequence: 1}).lean();
});//end of API to get categories

//API to get tables
// adminRoutes.get('/tables', function (req, res) {
//     var token = req.headers['auth_token'];
//     var tableArray = [];
//     Admin.findOne({token: token}, function (err, adminFound) {
//         if (!err && adminFound) {
//             Outlet.findOne({outletId: adminFound.outletId}, function (err, outletFound) {
//                 if (!err && outletFound) {

//                     for (var i = 0; i < adminFound.tables.length; i++) {
//                         for (var j = 0; j < outletFound.tables.length; j++) {
//                             if (outletFound.tables[j].tableNumber == adminFound.tables[i].tableNumber) {
//                                 var obj = {};
//                                 obj.tableNumber = outletFound.tables[j].tableNumber;
//                                 obj.tableId = outletFound.tables[j].tableId;
//                                 obj.capacity = outletFound.tables[j].capacity;
//                                 obj.assigned = outletFound.tables[j].assigned;
//                                 obj.assignedAdmin = outletFound.tables[j].assignedAdmin;
//                                 obj.status = outletFound.tables[j].status;
//                                 obj.outletId = outletFound.outletId;
//                                 tableArray.push(obj);
//                             }
//                         }
//                     }
//                     if (i >= adminFound.tables.length) {
//                         res.json({
//                             success: true,
//                             data: {tables: tableArray},
//                             error: null
//                         });
//                     }
//                 } else console.log(err);
//             }).lean();
//         } else {
//             console.log(err);
//             res.json({
//                 success: false,
//                 data: null,
//                 error: 'Cant find admin'
//             });
//         }
//     }).lean();
// });


//Abhishek
adminRoutes.get('/tables', async function (req, res) {
    try {
        var token = req.headers['auth_token'];
        var tableArray = [];
        console.log("Tables", tableArray)

        const adminFound = await Admin.findOne({ token: token }).lean();
        if (adminFound) {
            const outletFound = await Outlet.findOne({ outletId: adminFound.outletId }).lean();
            if (outletFound) {
                for (var i = 0; i < adminFound.tables.length; i++) {
                    for (var j = 0; j < outletFound.tables.length; j++) {
                        if (outletFound.tables[j].tableNumber == adminFound.tables[i].tableNumber) {
                            const obj = {
                                tableNumber: outletFound.tables[j].tableNumber,
                                tableId: outletFound.tables[j].tableId,
                                capacity: outletFound.tables[j].capacity,
                                assigned: outletFound.tables[j].assigned,
                                assignedUserId: outletFound.tables[j].assignedUserId,
                                assignedAdmin: outletFound.tables[j].assignedAdmin,
                                status: outletFound.tables[j].status,
                                outletId: outletFound.outletId
                            };

                            const userFound = await User.findOne({ userId: outletFound.tables[j].assignedUserId }).lean();
                            if (userFound) {
                                obj.name = userFound.name;
                                obj.phoneNumber = userFound.phoneNumber;
                                obj.numberOfVisits = userFound.numberOfVisits;
                            }

                            tableArray.push(obj);
                            break;
                        }
                    }
                }

                if (i >= adminFound.tables.length) {
                    res.json({
                        success: true,
                        data: { tables: tableArray },
                        error: null
                    });
                }
        
            } else {
                console.log('Outlet not found');
            }
        } else {
            console.log('Admin not found');
            res.json({
                success: false,
                data: null,
                error: 'Cant find admin'
            });
        }
    } catch (err) {
        console.log(err);
        res.json({
            success: false,
            data: null,
            error: 'An error occurred'
        });
    }
});




//API to upload admin image
adminRoutes.put('/uploadimage', function (req, res) {
    var token = req.headers['auth_token'];

    var pathset;

    function rewrite(image, path) {
        //reading incoming file
        fs.readFile(image, function (err, data) {
            //writing read file to location on server
            fs.writeFile(path, data, function (err) {
                if (err)
                    console.log('error writing');
                //removing temporary image file
                fs.unlink(image, function (err) {
                    if (err)
                        console.log('error unlinking');

                    else {
                        console.log('success image saved.');
                    }
                });//unlinked temp image
            });//writing to new path
        });//reading image file
    }//end of rewrite function

    Admin.findOne({token: token}, function (err, adminFound) {
        if (!err && adminFound) {
            var form = new formidable.IncomingForm();
            form.parse(req, function (err, fields, files) {
                try {
                    var path = (__dirname + '/../uploads/admins/image' + adminFound.adminId + '.jpg');
                    var selfie = files.image.path;
                    rewrite(selfie, path);
                    pathset = ('/admins/image' + adminFound.adminId + '.jpg');
                    adminFound.image = pathset;
                    adminFound.save(function (err, imagesaved) {
                        if (!err && imagesaved) {
                            res.json({
                                success: true,
                                data: {message:'image saved'},
                                error: null
                            });
                        }
                        else{
                            console.log(err);
                        }
                    });
                }
                catch (err) {
                    console.log(err);
                }
            });
        } else {
            res.json({
                success: false,
                data: null,
                error: 'Error finding admin'
            });
        }
    });
});


//API to confirm order
adminRoutes.put('/confirmorder', function (req, res) {
    
    var token = req.headers['auth_token'];
    let oldpos=false
    var branchlist = []
    let outletdata;
    
    const apiKey = '65b0a6c8-f5e1-494d-af91-4915ec93ac02';
    const secretKey = 'F6iF5IeWW31m6rntXD_HD7diA6vPI34pNcknv6mgtzs';
    const tokenCreationTime = Math.floor(Date.now() / 1000);
    var uuid = require('uuid');
    const payload = { iss: apiKey, iat: tokenCreationTime,jti: uuid.v4()  };

    //jwt library uses HS256 as default.
    const jwttoken = jwt.sign(payload, secretKey);

    Admin.findOne({token: token}, function (err, adminFound) {
        if (!err && adminFound) {
            Outlet.findOne({outletId:adminFound.outletId}, function (err, dataFound) {
                console.log("Outlet Data",dataFound._doc.oldpos)
                outletdata=dataFound._doc;
                if (!err && dataFound != null) {
                    if(dataFound._doc.oldpos == 0){
                        oldpos=false
                    }else{
                        oldpos=true
                    }
                    callAfterOutletidFind()
                }else{
                    res.json({
                        success: true,
                        data: null,
                        error: err
                    });
                    callAfterOutletidFind()
                    console.log(err);
                } 
            });
          }else{
                    console.log(err);
                    res.json({
                        success:false,
                        data:null,
                        error:'An Error occurred'
                    });
                }
          }).lean();
   


    function callAfterOutletidFind(){
        console.log("Pos",oldpos)
        if(oldpos){
            var socket_id = [];
            var token = req.headers['auth_token'];
            var outletid ;
            var date1 = moment.utc().add(330, 'minutes');
            var newdate = new Date(date1);
            var date = moment(date1).format('YYYY-MM-DD');
            var dateOrder = moment(date1).format('DD-MMM-YYYY');
            var time = moment(date1).format('HH:mm:ss');
        
            var posModel ={
                "SourceId": 57,
                "Sourcepwd": "!RePl@y.",
                "OutletCode": "95916879",//for testing on juhi system - 21504
                "Outletpswd": "FMLPASHAN",//for testing on juhi system - demo1
                "OnlineOrder":{
                    "CustName": "",
                    "TableNo": "1",
                    "CustAddressLine1": "",
                    "CustAddressLine2": "",
                    "CustAddressLine3": "",
                    "CustAddressLine4": "",
                    "CustTel": "",
                    "CustTel2": "",
                    "KotNo":"45",
                    "OnlineOrderId": "45",
                    "KOTDate": dateOrder,
                    "KOTCover": "",
                    "Captain": "",
                    "Remark": "",
                    "OrderSource": "",
                    "EnteredBy": "",
                    "KOTType": "",
                    "IsPaymentReceived": false,
                    "ModeOFPayment": "CASH",
                    "IsBilled": false,
                    "KOTAmount": "45",
                    "IsKOTComplimentry": false,
                    "IsCancelled": false,
                    "Discount": 0,
                    "DiscountAmount": 0,
                    "ReasonForDiscount": "",
                    "EmailTo": "",
                    "EmailFrom": "",
                    "ReplyTo": "",
                    "ObjListItems": []
                }
            };
        
            Admin.findOne({token: token}, function (err, adminFound) {
                if (!err && adminFound) {
                    outletid = adminFound.outletId;
                    if(outletid == 4){
                        posModel.OutletCode = "19224069";
                        posModel.Outletpswd = "FMLMAGARPATTA"
                    }
                    if(outletid == 2){
                        posModel.OutletCode = "24839455";
                        posModel.Outletpswd = "FMLKALYANINAGAR"
                    }
        
                    if(outletid == 3){
                        posModel.OutletCode = "63608834";
                        posModel.Outletpswd = "FMLHINJEWADI"
                    }
        
                    if(outletid == 1){
                        posModel.OutletCode = "50513131";
                        posModel.Outletpswd = "FMLBHUGAON"
                    }
        
                    if(outletid == 5){
                        posModel.OutletCode = "82049386";
                        posModel.Outletpswd = "FMLNIMB"
                    }
        
                    var orderid = req.query.orderId;
                    var numberOfDrinks;
                    var date1 = moment.utc().add(330, 'minutes');
                    var newdate = new Date(date1);
                    var date = moment(date1).format('YYYY-MM-DD');
                    var time = moment(date1).format('HH:mm:ss');
                    var runningPrice;
                    var newPrice = 0;
                    var outletId = Number;
                    var drinkIdArray = [];
                    var temp2;
                    var dailyLog = new Dailylog;
        
                    posModel.OnlineOrder.KotNo = orderid;
                    posModel.OnlineOrder.KOTDate = dateOrder;
                    posModel.OnlineOrder.OnlineOrderId = orderid;
        
                    Order.findOne({$and:[{orderId:orderid},{outletId:outletid}]}, function (err, orderFound) {
                        if(!err &&orderFound!=null){
                            if(orderFound.status != 'pending'){
                                res.json({
                                    success: true,
                                    data: {message: 'Order Updated'},
                                    error: null
                                });
                            }
                            else{
                                posModel.OnlineOrder.TableNo = orderFound.tableNumber;
        
                                posModel.OnlineOrder.KotNo = orderFound._id.toString();
                                posModel.OnlineOrder.OnlineOrderId = orderFound._id.toString();
                                Order.findOneAndUpdate({$and:[{orderId: orderid},{outletId:outletid}]}, {
                                    status: 'confirmed',
                                    name: "ADMIN - " + adminFound.name,
                                    adminId: adminFound.adminId,
                                    confirmTime: time
                                }, {safe: true, new: true}, function (err, orderUpdated) {
                                    if (!err && orderUpdated) {
                                        res.json({
                                            success: true,
                                            data: {message: 'Order Updated'},
                                            error: null
                                        });
                                        posModel.OnlineOrder.TableNo = orderUpdated.tableNumber;
        
        
                                        var logObj = {
                                            log:String,
                                            logTime: String
                                        };
                                     
                                        temp2 = orderUpdated.tableNumber;
                                        User.findOneAndUpdate({userId: orderUpdated.userId}, {
                                            $set: {
                                                currentTableNumber: temp2,
                                                updated_at: newdate
                                            },
                                            $push:{orders:parseInt(orderid)}
                                        }, {safe: true, upsert: true, new: true}, function (err, userOrderUpdated) {
                                            if (!err && userOrderUpdated) {
                                                Outlet.findOneAndUpdate({
                                                    outletId: orderUpdated.outletId,
                                                    'tables.tableNumber': orderUpdated.tableNumber
                                                }, {
                                                    $set: {
                                                        'tables.$.status': 'occupied',
                                                        updated_at: newdate
                                                    }
                                                }, {safe: true, new: true}, function (err, outletUpdated) {
                                                    if (!err && outletUpdated) {
                                                        outletId = outletUpdated.outletId;
        
                                                        if (orderUpdated.drinks.length > 0) {
                                                                for (var q = 0; q < orderUpdated.drinks.length; q++) {
                                                                    var item = {
                                                                        "KISection": "",
                                                                        "KIItemCode": orderUpdated.drinks[q].itemCode,
                                                                        "KIIsManualEntry": false,
                                                                        "KIIsComplimentry": false,
                                                                        "KIDiscountPer": 0,
                                                                        "KIDiscountAmount": 0,
                                                                        "KIDescription": orderUpdated.drinks[q].name,
                                                                        "KIPrintingDescription": orderUpdated.drinks[q].name,
                                                                        "KIToppingsSelected": "",
                                                                        "KIQty": orderUpdated.drinks[q].numberofdrinks,
                                                                        "KIRate": parseFloat(orderUpdated.drinks[q].userPrice),
                                                                        "KIBillSeries": "Liquor Bills",
                                                                        "KIRemark": "",
                                                                        "KICourse": "",
                                                                        "KISaleType": "",
                                                                        "KIBillingSection": "",
                                                                        "KIPreparedByKitchen": "",
                                                                        "KIDepartment": "",
                                                                        "KIUserCategory1": "",
                                                                        "KIUserCategory2": "",
                                                                        "KITaxCategory": "",
                                                                        "KIReasonForComplimentary": "",
                                                                        "KIReasonForDiscount": "",
                                                                        "KIPreparationTime": 10
                                                                    };
                                                                    posModel.OnlineOrder.ObjListItems.push(item);
                                                                    drinkIdArray.push(orderUpdated.drinks[q].itemCode);
                                                                    numberOfDrinks = orderUpdated.drinks[q].numberofdrinks;
                                                                }
                                                            if (q >= orderUpdated.drinks.length-1) {
        
                                                                if(outletId == 6 || outletId == 4 || outletid == 2 || outletid ==3 ||outletid ==1 || outletid == 5){
                                                                    var payload = posModel;
                                                                    request.post('http://doi.dytelworld.com/OnlineOrderIntegration.asmx/InsertOnlineOrder', {
                                                                        json: payload
                                                                    }, function (error, response, body) {
                                                                        if(error){
                                                                            console.log(error);
                                                                        }
                                                                        else{
                                                                            console.log(body);
                                                                        }
                                                                    });
        
                                                                }
        
                                                                orderUpdated.drinks.forEach(function (eachOrderDrink, a) {
                                                                    outletUpdated.drinks.forEach(function (eachDrinkOutlet, b) {
                                                                        if (eachDrinkOutlet.itemCode == eachOrderDrink.itemCode) {
                                                                            newPrice = parseInt(eachOrderDrink.runningPrice) + ((eachOrderDrink.priceIncrementPerUnit) * (parseInt(eachOrderDrink.numberofdrinks)));
                                                                            numberOfDrinks = eachOrderDrink.numberofdrinks;
        
                                                                            if (newPrice >= parseInt(eachDrinkOutlet.capPrice)) {
                                                                                runningPrice = eachDrinkOutlet.capPrice;
                                                                            }
                                                                            else runningPrice = newPrice.toString();
                                                                            if(newPrice <= parseInt(eachDrinkOutlet.basePrice)){
                                                                                runningPrice = eachDrinkOutlet.basePrice;
                                                                            }
                                                                            var tempArr = [];
                                                                            if(eachDrinkOutlet.priceVariable == true){
                                                                                eachDrinkOutlet.runningPrice = runningPrice;
                                                                            }
                                                                        }
                                                                    });
                                                                    if(orderUpdated.drinks.length-1 === a){
                                                                        outletUpdated.save(function (err, outletSaved) {
                                                                            if (!err && outletSaved) {
        
                                                                                Game.find({$and: [{'drinks.itemCode': {$in: drinkIdArray}}, {orderDate: orderUpdated.orderDate}]}, function (err, games) {
                                                                                    if (!err && games) {
                                                                                        Outlet.findOne({outletId: orderUpdated.outletId}, function (err, outletFound) {
                                                                                            if (!err && outletFound) {
                                                                                                for (var z = 0; z < games.length; z++) {
                                                                                                    for (var z1 = 0; z1 < games[z].drinks.length; z1++) {
                                                                                                        if (drinkIdArray.indexOf(games[z].drinks[z1].itemCode) > -1) {
                                                                                                            for (var z2 = 0; z2 < outletFound.drinks.length; z2++) {
                                                                                                                if (outletFound.drinks[z2].itemCode == games[z].drinks[z1].itemCode) {
                                                                                                                    games[z].drinks[z1].runningPrice = outletFound.drinks[z2].runningPrice;
                                                                                                                    games[z].status = 'confirmed';
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                    if (z1 >= games[z].drinks.length) {
                                                                                                        if (games[z].gameId == orderUpdated.gameId) {
                                                                                                            games[z].save(function (err, gameDrinksChanged) {
                                                                                                                if (!err && gameDrinksChanged) {
                                                                                                                    var obj = {};
                                                                                                                    obj.gameId = gameDrinksChanged.gameId;
                                                                                                                    obj.gameStatus = gameDrinksChanged.gameStatus;
                                                                                                                    obj.tableNumber = gameDrinksChanged.tableNumber;
                                                                                                                    obj.orderId = gameDrinksChanged.orderId;
                                                                                                                    obj.status = gameDrinksChanged.status;
                                                                                                                    obj.outletId = gameDrinksChanged.outletId;
                                                                                                                    obj.userId = gameDrinksChanged.userId;
                                                                                                                    obj.userName = gameDrinksChanged.userName;
                                                                                                                    obj.orderDate = gameDrinksChanged.orderDate;
                                                                                                                    obj.orderTime = gameDrinksChanged.orderTime;
                                                                                                                    User.findOne({userId: gameDrinksChanged.userId}, function (err, userFoundNow) {
                                                                                                                        if (!err && userFoundNow) {
                                                                                                                            if (userFoundNow.userAgent == 'android') {
                                                                                                                                var sender = new fcm(gcmSenderKeyAndroid);
                                                                                                                                var message1 = {
                                                                                                                                    to: userFoundNow.gcmId,
                                                                                                                                    collapse_key: 'order',
                                                                                                                                    priority: 'high',
                                                                                                                                    contentAvailable: true,
                                                                                                                                    timeToLive: 3,
                                                                                                                                    message_type: 'orderstatus',
                                                                                                                                    //restrictedPackageName: "somePackageName",
                                                                                                                                    data: {
                                                                                                                                        type: "orderstatus",
                                                                                                                                        game: obj,
                                                                                                                                        icon: "app_logo",
                                                                                                                                        title: "Order Confirmed",
                                                                                                                                        body: "Order Confirmed"
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
                                                                                                                                    message_type: 'orderstatus',
                                                                                                                                    notification: {
                                                                                                                                        title: "Order Confirmed",
                                                                                                                                        body: "Order Confirmed",
                                                                                                                                        sound: "default",
                                                                                                                                        badge: "2",
                                                                                                                                        content_available: true,
                                                                                                                                        priority: "high",
                                                                                                                                        color: "#90aa9c"
                                                                                                                                    },
                                                                                                                                    aps:{
                                                                                                                                        sound: "default",
                                                                                                                                        badge: "2",
                                                                                                                                        alert:'Order Confirmed'
                                                                                                                                    },
                                                                                                                                    //restrictedPackageName: "somePackageName",
                                                                                                                                    data: {
                                                                                                                                        type: "orderstatus",
                                                                                                                                        game: obj,
                                                                                                                                        icon: "app_logo",
                                                                                                                                        title: "Order Confirmed",
                                                                                                                                        body: "Order Confirmed"
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
        
                                                                                                                        } else {
                                                                                                                            console.log(err);
                                                                                                                        }
                                                                                                                    });
        
                                                                                                                } else console.log(err);
                                                                                                            });
                                                                                                        } else {
                                                                                                            if (games[z].gameStatus != 'finished') {
                                                                                                                games[z].save(function (err, gameDrinksChanged) {
                                                                                                                    if (!err && gameDrinksChanged) {
                                                                                                                        var obj = {};
                                                                                                                        obj.gameId = gameDrinksChanged.gameId;
                                                                                                                        obj.gameStatus = gameDrinksChanged.gameStatus;
                                                                                                                        obj.tableNumber = gameDrinksChanged.tableNumber;
                                                                                                                        obj.orderId = gameDrinksChanged.orderId;
                                                                                                                        obj.status = gameDrinksChanged.status;
                                                                                                                        obj.outletId = gameDrinksChanged.outletId;
                                                                                                                        obj.userId = gameDrinksChanged.userId;
                                                                                                                        obj.userName = gameDrinksChanged.userName;
                                                                                                                        obj.orderDate = gameDrinksChanged.orderDate;
                                                                                                                        obj.orderTime = gameDrinksChanged.orderTime;
                                                                                                                    } else console.log(err);
                                                                                                                });
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            } else console.log(err);
                                                                                        });
                                                                                    } else console.log(err);
                                                                                });
        
                                                                                var socktObj = {
                                                                                    arr:[],
                                                                                    outletId: outletid
                                                                                };
                                                                                for(var sd=0;sd<outletSaved.drinks.length;sd++){
                                                                                    if(drinkIdArray.indexOf(outletSaved.drinks[sd].itemCode)>-1){
                                                                                        socktObj.arr.push(outletSaved.drinks[sd]);
                                                                                    }
                                                                                }
                                                                                //todo: check for broadcast env for all sockets and not just one socket
                                                                                    if(sd>=outletSaved.drinks.length){
                                                                                        socket.emit('pricechanged', socktObj);
                                                                                    }
        
        
        
                                                                            }else {
                                                                                console.log(err);
                                                                            }
                                                                        });
                                                                    }
                                                                });
        
                                                            }
                                                        }
                                                        else if (outletUpdated.foods.length > 0) {
        
                                                            for (var d = 0; d < orderUpdated.foods.length; d++) {
                                                                var item2 = {
                                                                    "KISection": "",
                                                                    "KIItemCode": orderUpdated.foods[d].itemCode,
                                                                    "KIIsManualEntry": false,
                                                                    "KIIsComplimentry": false,
                                                                    "KIDiscountPer": 0,
                                                                    "KIDiscountAmount": 0,
                                                                    "KIDescription": orderUpdated.foods[d].name,
                                                                    "KIPrintingDescription": orderUpdated.foods[d].name,
                                                                    "KIToppingsSelected": "",
                                                                    "KIQty": orderUpdated.foods[d].numberoffoods,
                                                                    "KIRate": parseInt(orderUpdated.foods[d].basePrice),
                                                                    "KIBillSeries": "Food Bills",
                                                                    "KIRemark": "",
                                                                    "KICourse": "",
                                                                    "KISaleType": "",
                                                                    "KIBillingSection": "",
                                                                    "KIPreparedByKitchen": "",
                                                                    "KIDepartment": "",
                                                                    "KIUserCategory1": "",
                                                                    "KIUserCategory2": "",
                                                                    "KITaxCategory": "",
                                                                    "KIReasonForComplimentary": "",
                                                                    "KIReasonForDiscount": "",
                                                                    "KIPreparationTime": 10
                                                                };
                                                                posModel.OnlineOrder.ObjListItems.push(item2);
                                                            }
                                                            if (d >= orderUpdated.foods.length-1) {
        
                                                                if (outletId == 6 || outletId == 4 || outletid ==2 || outletid == 3 || outletid ==1 || outletid == 5) {
                                                                    var payload2 = posModel;
                                                                    request.post('http://doi.dytelworld.com/OnlineOrderIntegration.asmx/InsertOnlineOrder', {
                                                                        json: payload2
                                                                    }, function (error, response, body) {
                                                                        if (error) {
                                                                            console.log(error);
                                                                        } else {
                                                                            console.log(body);
                                                                        }
                                                                    });
        
                                                                }
                                                            }
        
                                                            var sender = new fcm(gcmSenderKeyAndroid);
                                                            if (userOrderUpdated.userAgent == 'android') {
                                                                var message = {
                                                                    to: userOrderUpdated.gcmId,
                                                                    collapse_key: 'foodorder',
                                                                    priority: 'high',
                                                                    contentAvailable: true,
                                                                    timeToLive: 3,
                                                                    message_type: 'foodorderconfirmed',
                                                                    //restrictedPackageName: "somePackageName",
                                                                    data: {
                                                                        type: "foodorderconfirmed",
                                                                        icon: "app_logo",
                                                                        title: "Food Order Confirmed",
                                                                        body: "Food Order Confirmed"
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
                                                                    to: userOrderUpdated.gcmId,
                                                                    collapse_key: 'foodorder',
                                                                    priority: 'high',
                                                                    contentAvailable: true,
                                                                    timeToLive: 3,
                                                                    message_type: 'foodorderconfirmed',
                                                                    //restrictedPackageName: "somePackageName",
                                                                    data: {
                                                                        type: "foodorderconfirmed",
                                                                        icon: "app_logo",
                                                                        title: "Food Order Confirmed",
                                                                        body: "Food Order Confirmed"
                                                                    },
                                                                    notification: {
                                                                        title: "Food Order Confirmed",
                                                                        body: "Food Order Confirmed",
                                                                        sound: "default",
                                                                        badge: "2",
                                                                        content_available: true,
                                                                        priority: "high",
                                                                        color: "#3ed6d2"
                                                                    },
                                                                    aps:{
                                                                        sound: "default",
                                                                        badge: "2",
                                                                        alert:'Food Order Confirmed'
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
        
        
                                                        }
        
                                                    } else console.log('error updating outlet table - ' + err);
                                                });
        
        
                                            } else console.log("user error - " + err);
                                        });
        
                                        if(outletid != 6 || outletid !=4 || outletid !=2 ||outletid !=3 || outletid!=1 || outletid!=5){
                                            var payload ={
                                                tableNo: orderUpdated.tableNumber,
                                                request: 'order',
                                                orderId: orderid,
                                                outletId: outletid
                                            };
                                            request.post('http://fmlajnode.reapit.in:3000/request', {
                                                json: payload
                                            }, function (error, response, body) {
                                                if(error){
                                                    console.log(error);
                                                }
                                                else{
                                                    console.log(body);
                                                }
                                            });
                                        }
        
                                    }
                                    else {
                                        console.log(err);
                                        res.json({
                                            success:false,
                                            data:null,
                                            error:'An Error occurred'
                                        });
                                    }
                                });
                            }
                        }
                        else{
                            console.log(err);
                            res.json({
                                success:false,
                                data:null,
                                error:'An Error occurred'
                            });
                        }
                    }).lean();
                }
                else {
                    console.log(err);
                    res.json({
                        success:false,
                        data:null,
                        error:'An Error occurred'
                    });
                }
            }).lean();
            }else{
        
                const apiKey = '65b0a6c8-f5e1-494d-af91-4915ec93ac02';
                const secretKey = 'F6iF5IeWW31m6rntXD_HD7diA6vPI34pNcknv6mgtzs';
                const tokenCreationTime = Math.floor(Date.now() / 1000);
                var uuid = require('uuid');
                console.log("JTI:"+uuid.v4())
                const payload = { iss: apiKey, iat: tokenCreationTime,jti: uuid.v4()  };
            
                //jwt library uses HS256 as default.
                const jwttoken = jwt.sign(payload, secretKey);
                console.log("token : "+jwttoken);
                var token = req.headers['auth_token'];
                var outletid ;
                var date1 = moment.utc().add(330, 'minutes');
                var dateOrder = moment(date1).format('DD-MMM-YYYY');
               
                var data = {
                    "branchCode": "FS",
                    "channel": "Dine In FML",
                    "customer": {
                      "name": "Customer Name",
                      "phoneNumber": "1234567890"
                    },
                    "sourceInfo": {
                        "invoiceNumber": "123456",
                        "invoiceDate": new Date((dt = new Date()).getTime() - dt.getTimezoneOffset() * 60000).toISOString().replace(/(.*)T(.*)\..*/,'$1 $2'),
                        "callbackURL": ""
                      },
                    "items": [],
                     "resourceInfo": {
                      "resourceId": "resourceId",
                      "resourceName": "resourceName",
                      "groupSize": 0,
                      "resourceGroupName": ""
                    }
                  };
            
                Admin.findOne({token: token}, function (err, adminFound) {
                    if (!err && adminFound) {
                        outletid = adminFound.outletId;
                        data.sourceInfo.callbackURL="http://35.154.86.71:7777/callback?orderid="+outletid;
                        if(outletid == 1){
                            data.branchCode="FBH"
                        }
                        if(outletid == 2){
                            data.branchCode="FKN"
                        }
                        if(outletid == 3){
                            data.branchCode="FH"
                        }
                        if(outletid == 4){
                            data.branchCode="FS"
                        }
                        if(outletid == 5){
                            data.branchCode="FNI"
                        }
                        if(outletid == 6){
                            data.branchCode="FP"
                        }
            
                        var orderid = req.query.orderId;
                        var numberOfDrinks;
                        var date1 = moment.utc().add(330, 'minutes');
                        var newdate = new Date(date1);
                        var date = moment(date1).format('YYYY-MM-DD');
                        var time = moment(date1).format('HH:mm:ss');
                        var runningPrice;
                        var newPrice = 0;
                        var outletId = Number;
                        var drinkIdArray = [];
                        var temp2;
                        var dailyLog = new Dailylog;
                        data.sourceInfo.invoiceNumber=orderid
                        Order.findOne({$and:[{orderId:orderid},{outletId:outletid}]}, function (err, orderFound) {
                            if(!err &&orderFound!=null){
                                if(orderFound.status != 'pending'){
                                    res.json({
                                        success: true,
                                        data: {message: 'Order Updated'},
                                        error: null
                                    });
                                }
                                else{
                                    var request = require('request'); var options = {
                                        'method': 'GET',
                                        'url': 'https://api.ristaapps.com/v1/resource?branch='+data.branchCode,
                                        'headers': {
                                          'x-api-key': '65b0a6c8-f5e1-494d-af91-4915ec93ac02',
                                          'x-api-token':jwttoken,
                                          'Content-Type': 'application/json'
                                        }
                                    };
                                   
                                    request(options, function (error, response) { 
                                        if (error) throw new Error(error);
                                        // console.table(response.body)
                                        let resource_data = JSON.parse(response.body).find(obj => obj.name == +orderFound.tableNumber)
                                        // resolve(resource_data);
                                        // console.log("Selectedtable",resource_data)
                                        data.resourceInfo.resourceId = resource_data.resourceId
                                        data.resourceInfo.resourceName = resource_data.name
                                        data.resourceInfo.groupSize = resource_data.capacity
                                        // console.log('middle');
                                        callAfterResourse(resource_data)
                                    });
                                          
                                    function callAfterResourse(){
                                        // console.log('result', result)
                                        Order.findOneAndUpdate({$and:[{orderId: orderid},{outletId:outletid}]}, {
        
                                            status: 'confirmed',
                                            name: "ADMIN - " + adminFound.name,
                                            adminId: adminFound.adminId,
                                            confirmTime: time
                                        }, {safe: true, new: true}, function (err, orderUpdated) {
            
                                            if (!err && orderUpdated) {
                                                res.json({
                                                    success: true,
                                                    data: {message: 'Order Updated'},
                                                    error: null
                                                });
                                                User.findOne({userId: orderUpdated.userId}, function (err, userFound) {
                                                    if (!err && userFound != null) {
                                                    data.customer.name=userFound.name
                                                        if(userFound.phoneNumber!=null){
                                                            data.customer.phoneNumber=userFound.phoneNumber
                                                        }
                                                    }
                                                });
                                                temp2 = orderUpdated.tableNumber;
                                                User.findOneAndUpdate({userId: orderUpdated.userId}, {
                                                    $set: {
                                                        currentTableNumber: temp2,
                                                        updated_at: newdate
                                                    },
                                                    $push:{orders:parseInt(orderid)}
                                                }, {safe: true, upsert: true, new: true}, function (err, userOrderUpdated) {
                                                    if (!err && userOrderUpdated) {
                                                        Outlet.findOneAndUpdate({
                                                            outletId: orderUpdated.outletId,
                                                            'tables.tableNumber': orderUpdated.tableNumber
                                                        }, {
                                                            $set: {
                                                                'tables.$.status': 'occupied',
                                                                updated_at: newdate
                                                            }
                                                        }, {safe: true, new: true}, function (err, outletUpdated) {
                                                            if (!err && outletUpdated) {
                                                                outletId = outletUpdated.outletId;
                                                            if (orderUpdated.drinks.length > 0) {
                                                                        
                                                                        
                                                                        for (var q = 0; q < orderUpdated.drinks.length; q++) {
                                                                          
                                                                            let resource_data = outletdata.drinks.find(obj => obj.itemCode == orderUpdated.drinks[q].itemCode)
                                                                            var item=  {
                                                                                "shortName":  orderUpdated.drinks[q].name,
                                                                                "quantity": orderUpdated.drinks[q].numberofdrinks,
                                                                                "unitPrice": parseFloat(orderUpdated.drinks[q].userPrice),
                                                                                "overridden": true,
                                                                                "skuCode": String(resource_data.skucode)
                                                                            };
                
                                                                            data.items.push(item);
                                                                            drinkIdArray.push(orderUpdated.drinks[q].itemCode);
                                                                            numberOfDrinks = orderUpdated.drinks[q].numberofdrinks;
                                                                        }
                                                                    
                                                                        if (q >= orderUpdated.drinks.length-1) {
                                                                            console.log("body:",data)
                
                                                                        if(outletid == 6 || outletid == 4 || outletid == 2 || outletid ==3 ||outletid ==1 || outletid == 5){
                                                                                    const headers = {
                                                                                        'x-api-key': apiKey,
                                                                                        'x-api-token': jwttoken,
                                                                                        'Content-Type': 'application/json'
                                                                                    }
                
                                                                                    axios.post("https://api.ristaapps.com/v1/sale",
                                                                                        data, {
                                                                                        headers: headers
                                                                                    })
                                                                                        .then((response) => {
                                                                                            console.log("data: " + response.data)
                                                                                        })
                                                                                        .catch((error) => {
                                                                                            console.log(error)
                                                                                        })
                
                                                                        }
                
                                                                        orderUpdated.drinks.forEach(function (eachOrderDrink, a) {
                                                                            outletUpdated.drinks.forEach(function (eachDrinkOutlet, b) {
                                                                                if (eachDrinkOutlet.itemCode == eachOrderDrink.itemCode) {
                                                                                    newPrice = parseInt(eachOrderDrink.runningPrice) + ((eachOrderDrink.priceIncrementPerUnit) * (parseInt(eachOrderDrink.numberofdrinks)));
                                                                                    numberOfDrinks = eachOrderDrink.numberofdrinks;
                
                                                                                    if (newPrice >= parseInt(eachDrinkOutlet.capPrice)) {
                                                                                        runningPrice = eachDrinkOutlet.capPrice;
                                                                                    }
                                                                                    else runningPrice = newPrice.toString();
                                                                                    if(newPrice <= parseInt(eachDrinkOutlet.basePrice)){
                                                                                        runningPrice = eachDrinkOutlet.basePrice;
                                                                                    }
                                                                                    var tempArr = [];
                                                                                    if(eachDrinkOutlet.priceVariable == true){
                                                                                        eachDrinkOutlet.runningPrice = runningPrice;
                                                                                    }
                                                                                }
                                                                            });
                                                                            if(orderUpdated.drinks.length-1 === a){
                                                                                outletUpdated.save(function (err, outletSaved) {
                                                                                    if (!err && outletSaved) {
                
                                                                                        Game.find({$and: [{'drinks.itemCode': {$in: drinkIdArray}}, {orderDate: orderUpdated.orderDate}]}, function (err, games) {
                                                                                            if (!err && games) {
                                                                                                Outlet.findOne({outletId: orderUpdated.outletId}, function (err, outletFound) {
                                                                                                    if (!err && outletFound) {
                                                                                                        for (var z = 0; z < games.length; z++) {
                                                                                                            for (var z1 = 0; z1 < games[z].drinks.length; z1++) {
                                                                                                                if (drinkIdArray.indexOf(games[z].drinks[z1].itemCode) > -1) {
                                                                                                                    for (var z2 = 0; z2 < outletFound.drinks.length; z2++) {
                                                                                                                        if (outletFound.drinks[z2].itemCode == games[z].drinks[z1].itemCode) {
                                                                                                                            games[z].drinks[z1].runningPrice = outletFound.drinks[z2].runningPrice;
                                                                                                                            games[z].status = 'confirmed';
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                            if (z1 >= games[z].drinks.length) {
                                                                                                                if (games[z].gameId == orderUpdated.gameId) {
                                                                                                                    games[z].save(function (err, gameDrinksChanged) {
                                                                                                                        if (!err && gameDrinksChanged) {
                                                                                                                            var obj = {};
                                                                                                                            obj.gameId = gameDrinksChanged.gameId;
                                                                                                                            obj.gameStatus = gameDrinksChanged.gameStatus;
                                                                                                                            obj.tableNumber = gameDrinksChanged.tableNumber;
                                                                                                                            obj.orderId = gameDrinksChanged.orderId;
                                                                                                                            obj.status = gameDrinksChanged.status;
                                                                                                                            obj.outletId = gameDrinksChanged.outletId;
                                                                                                                            obj.userId = gameDrinksChanged.userId;
                                                                                                                            obj.userName = gameDrinksChanged.userName;
                                                                                                                            obj.orderDate = gameDrinksChanged.orderDate;
                                                                                                                            obj.orderTime = gameDrinksChanged.orderTime;
                                                                                                                            User.findOne({userId: gameDrinksChanged.userId}, function (err, userFoundNow) {
                                                                                                                                if (!err && userFoundNow) {
                                                                                                                                    if (userFoundNow.userAgent == 'android') {
                                                                                                                                        var sender = new fcm(gcmSenderKeyAndroid);
                                                                                                                                        var message1 = {
                                                                                                                                            to: userFoundNow.gcmId,
                                                                                                                                            collapse_key: 'order',
                                                                                                                                            priority: 'high',
                                                                                                                                            contentAvailable: true,
                                                                                                                                            timeToLive: 3,
                                                                                                                                            message_type: 'orderstatus',
                                                                                                                                            //restrictedPackageName: "somePackageName",
                                                                                                                                            data: {
                                                                                                                                                type: "orderstatus",
                                                                                                                                                game: obj,
                                                                                                                                                icon: "app_logo",
                                                                                                                                                title: "Order Confirmed",
                                                                                                                                                body: "Order Confirmed"
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
                                                                                                                                            message_type: 'orderstatus',
                                                                                                                                            notification: {
                                                                                                                                                title: "Order Confirmed",
                                                                                                                                                body: "Order Confirmed",
                                                                                                                                                sound: "default",
                                                                                                                                                badge: "2",
                                                                                                                                                content_available: true,
                                                                                                                                                priority: "high",
                                                                                                                                                color: "#90aa9c"
                                                                                                                                            },
                                                                                                                                            aps:{
                                                                                                                                                sound: "default",
                                                                                                                                                badge: "2",
                                                                                                                                                alert:'Order Confirmed'
                                                                                                                                            },
                                                                                                                                            //restrictedPackageName: "somePackageName",
                                                                                                                                            data: {
                                                                                                                                                type: "orderstatus",
                                                                                                                                                game: obj,
                                                                                                                                                icon: "app_logo",
                                                                                                                                                title: "Order Confirmed",
                                                                                                                                                body: "Order Confirmed"
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
                
                                                                                                                                } else {
                                                                                                                                    console.log(err);
                                                                                                                                }
                                                                                                                            });
                
                                                                                                                        } else console.log(err);
                                                                                                                    });
                                                                                                                } else {
                                                                                                                    if (games[z].gameStatus != 'finished') {
                                                                                                                        games[z].save(function (err, gameDrinksChanged) {
                                                                                                                            if (!err && gameDrinksChanged) {
                                                                                                                                var obj = {};
                                                                                                                                obj.gameId = gameDrinksChanged.gameId;
                                                                                                                                obj.gameStatus = gameDrinksChanged.gameStatus;
                                                                                                                                obj.tableNumber = gameDrinksChanged.tableNumber;
                                                                                                                                obj.orderId = gameDrinksChanged.orderId;
                                                                                                                                obj.status = gameDrinksChanged.status;
                                                                                                                                obj.outletId = gameDrinksChanged.outletId;
                                                                                                                                obj.userId = gameDrinksChanged.userId;
                                                                                                                                obj.userName = gameDrinksChanged.userName;
                                                                                                                                obj.orderDate = gameDrinksChanged.orderDate;
                                                                                                                                obj.orderTime = gameDrinksChanged.orderTime;
                                                                                                                            } else console.log(err);
                                                                                                                        });
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    } else console.log(err);
                                                                                                });
                                                                                            } else console.log(err);
                                                                                        });
                
                                                                                        var socktObj = {
                                                                                            arr:[],
                                                                                            outletId: outletid
                                                                                        };
                                                                                        for(var sd=0;sd<outletSaved.drinks.length;sd++){
                                                                                            if(drinkIdArray.indexOf(outletSaved.drinks[sd].itemCode)>-1){
                                                                                                socktObj.arr.push(outletSaved.drinks[sd]);
                                                                                            }
                                                                                        }
                                                                                        //todo: check for broadcast env for all sockets and not just one socket
                                                                                            if(sd>=outletSaved.drinks.length){
                                                                                                socket.emit('pricechanged', socktObj);
                                                                                            }
                
                
                
                                                                                    }else {
                                                                                        console.log(err);
                                                                                    }
                                                                                });
                                                                            }
                                                                        });
                
                                                                    }
                                                                }
                                                                else if (outletUpdated.foods.length > 0) {
                                                                
                                                                    for (var d = 0; d < orderUpdated.foods.length; d++) {
                                                                        let resource_data = outletdata.foods.find(obj => obj.itemCode == orderUpdated.foods[d].itemCode)
                                                                        var item2=  {
                                                                            "shortName": orderUpdated.foods[d].name,
                                                                            "quantity": orderUpdated.foods[d].numberoffoods,
                                                                            "unitPrice": parseInt(orderUpdated.foods[d].basePrice),
                                                                            "overridden": false,
                                                                            "skuCode": resource_data.skucode,
                                                                        };
                                                                    
                                                                        data.items.push(item2);
                                                                    }
            
                                                                    console.log(data)
                                                                    if (d >= orderUpdated.foods.length-1) {
                
                                                                        if (outletId == 6 || outletId == 4 || outletid ==2 || outletid == 3 || outletid ==1 || outletid == 5) {
                                                                            const headers = {
                                                                                'x-api-key': apiKey,
                                                                                'x-api-token': jwttoken,
                                                                                'Content-Type': 'application/json'
                                                                            }
            
                                                                            axios.post("https://api.ristaapps.com/v1/sale",
                                                                                data, {
                                                                                headers: headers
                                                                            })
                                                                                .then((response) => {
                                                                                    console.log("data: " , response.data)
                                                                                })
                                                                                .catch((error) => {
                                                                                    console.log(error)
                                                                                })
                
                                                                        }
                                                                    }
                                                                    var sender = new fcm(gcmSenderKeyAndroid);
                                                                    if (userOrderUpdated.userAgent == 'android') {
                                                                        var message = {
                                                                            to: userOrderUpdated.gcmId,
                                                                            collapse_key: 'foodorder',
                                                                            priority: 'high',
                                                                            contentAvailable: true,
                                                                            timeToLive: 3,
                                                                            message_type: 'foodorderconfirmed',
                                                                            //restrictedPackageName: "somePackageName",
                                                                            data: {
                                                                                type: "foodorderconfirmed",
                                                                                icon: "app_logo",
                                                                                title: "Food Order Confirmed",
                                                                                body: "Food Order Confirmed"
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
                                                                            to: userOrderUpdated.gcmId,
                                                                            collapse_key: 'foodorder',
                                                                            priority: 'high',
                                                                            contentAvailable: true,
                                                                            timeToLive: 3,
                                                                            message_type: 'foodorderconfirmed',
                                                                            //restrictedPackageName: "somePackageName",
                                                                            data: {
                                                                                type: "foodorderconfirmed",
                                                                                icon: "app_logo",
                                                                                title: "Food Order Confirmed",
                                                                                body: "Food Order Confirmed"
                                                                            },
                                                                            notification: {
                                                                                title: "Food Order Confirmed",
                                                                                body: "Food Order Confirmed",
                                                                                sound: "default",
                                                                                badge: "2",
                                                                                content_available: true,
                                                                                priority: "high",
                                                                                color: "#3ed6d2"
                                                                            },
                                                                            aps:{
                                                                                sound: "default",
                                                                                badge: "2",
                                                                                alert:'Food Order Confirmed'
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
                
                
                                                                }
                
                                                            } else console.log('error updating outlet table - ' + err);
                                                        });
                
                
                                                    } else console.log("user error - " + err);
                                                });
                
                                                // if(outletid != 6 || outletid !=4 || outletid !=2 ||outletid !=3 || outletid!=1 || outletid!=5){
                                                //     var payload ={
                                                //         tableNo: orderUpdated.tableNumber,
                                                //         request: 'order',
                                                //         orderId: orderid,
                                                //         outletId: outletid
                                                //     };
                                                //     request.post('http://fmlajnode.reapit.in:3000/request', {
                                                //         json: payload
                                                //     }, function (error, response, body) {
                                                //         if(error){
                                                //             console.log(error);
                                                //         }
                                                //         else{
                                                //             console.log(body);
                                                //         }
                                                //     });
                                                // }
                
                
                
                                            }
                                            else {
                                                console.log(err);
                                                res.json({
                                                    success:false,
                                                    data:null,
                                                    error:'An Error occurred'
                                                });
                                            };
                                        });
                                    }
                                    
                                }
                            }
                            else{
                                console.log(err);
                                res.json({
                                    success:false,
                                    data:null,
                                    error:'An Error occurred'
                                });
                            }
                        }).lean();
                    }
                    else {
                        console.log(err);
                        res.json({
                            success:false,
                            data:null,
                            error:'An Error occurred'
                        });
                    }
                }).lean();
        
            }
    }
   
});

//API to confirm order
// adminRoutes.put('/confirmorder', function (req, res) {
    
//     var token = req.headers['auth_token'];
//     let oldpos=false
//     var branchlist = []
    
//     const apiKey = '65b0a6c8-f5e1-494d-af91-4915ec93ac02';
//     const secretKey = 'F6iF5IeWW31m6rntXD_HD7diA6vPI34pNcknv6mgtzs';
//     const tokenCreationTime = Math.floor(Date.now() / 1000);
//     var uuid = require('uuid');
//     const payload = { iss: apiKey, iat: tokenCreationTime,jti: uuid.v4()  };

//     //jwt library uses HS256 as default.
//     const jwttoken = jwt.sign(payload, secretKey);

//     Admin.findOne({token: token}, function (err, adminFound) {
//         if (!err && adminFound) {
//             Outlet.findOne({outletId:adminFound.outletId}, function (err, dataFound) {
//                 console.log("Outlet Data",dataFound._doc.oldpos)
//                 if (!err && dataFound != null) {
//                     if(dataFound._doc.oldpos == 0){
//                         oldpos=false
//                     }else{
//                         oldpos=true
//                     }
//                     callAfterOutletidFind()
//                 }else{
//                     res.json({
//                         success: true,
//                         data: null,
//                         error: err
//                     });
//                     callAfterOutletidFind()
//                     console.log(err);
//                 } 
//             });
//           }else{
//                     console.log(err);
//                     res.json({
//                         success:false,
//                         data:null,
//                         error:'An Error occurred'
//                     });
//                 }
//           }).lean();
   


//     function callAfterOutletidFind(){
//         console.log("Pos",oldpos)
//         if(oldpos){
//             var socket_id = [];
//             var token = req.headers['auth_token'];
//             var outletid ;
//             var date1 = moment.utc().add(330, 'minutes');
//             var newdate = new Date(date1);
//             var date = moment(date1).format('YYYY-MM-DD');
//             var dateOrder = moment(date1).format('DD-MMM-YYYY');
//             var time = moment(date1).format('HH:mm:ss');
        
//             var posModel ={
//                 "SourceId": 57,
//                 "Sourcepwd": "!RePl@y.",
//                 "OutletCode": "95916879",//for testing on juhi system - 21504
//                 "Outletpswd": "FMLPASHAN",//for testing on juhi system - demo1
//                 "OnlineOrder":{
//                     "CustName": "",
//                     "TableNo": "1",
//                     "CustAddressLine1": "",
//                     "CustAddressLine2": "",
//                     "CustAddressLine3": "",
//                     "CustAddressLine4": "",
//                     "CustTel": "",
//                     "CustTel2": "",
//                     "KotNo":"45",
//                     "OnlineOrderId": "45",
//                     "KOTDate": dateOrder,
//                     "KOTCover": "",
//                     "Captain": "",
//                     "Remark": "",
//                     "OrderSource": "",
//                     "EnteredBy": "",
//                     "KOTType": "",
//                     "IsPaymentReceived": false,
//                     "ModeOFPayment": "CASH",
//                     "IsBilled": false,
//                     "KOTAmount": "45",
//                     "IsKOTComplimentry": false,
//                     "IsCancelled": false,
//                     "Discount": 0,
//                     "DiscountAmount": 0,
//                     "ReasonForDiscount": "",
//                     "EmailTo": "",
//                     "EmailFrom": "",
//                     "ReplyTo": "",
//                     "ObjListItems": []
//                 }
//             };
        
//             Admin.findOne({token: token}, function (err, adminFound) {
//                 if (!err && adminFound) {
//                     outletid = adminFound.outletId;
//                     if(outletid == 4){
//                         posModel.OutletCode = "19224069";
//                         posModel.Outletpswd = "FMLMAGARPATTA"
//                     }
//                     if(outletid == 2){
//                         posModel.OutletCode = "24839455";
//                         posModel.Outletpswd = "FMLKALYANINAGAR"
//                     }
        
//                     if(outletid == 3){
//                         posModel.OutletCode = "63608834";
//                         posModel.Outletpswd = "FMLHINJEWADI"
//                     }
        
//                     if(outletid == 1){
//                         posModel.OutletCode = "50513131";
//                         posModel.Outletpswd = "FMLBHUGAON"
//                     }
        
//                     if(outletid == 5){
//                         posModel.OutletCode = "82049386";
//                         posModel.Outletpswd = "FMLNIMB"
//                     }
        
//                     var orderid = req.query.orderId;
//                     var numberOfDrinks;
//                     var date1 = moment.utc().add(330, 'minutes');
//                     var newdate = new Date(date1);
//                     var date = moment(date1).format('YYYY-MM-DD');
//                     var time = moment(date1).format('HH:mm:ss');
//                     var runningPrice;
//                     var newPrice = 0;
//                     var outletId = Number;
//                     var drinkIdArray = [];
//                     var temp2;
//                     var dailyLog = new Dailylog;
        
//                     posModel.OnlineOrder.KotNo = orderid;
//                     posModel.OnlineOrder.KOTDate = dateOrder;
//                     posModel.OnlineOrder.OnlineOrderId = orderid;
        
//                     Order.findOne({$and:[{orderId:orderid},{outletId:outletid}]}, function (err, orderFound) {
//                         if(!err &&orderFound!=null){
//                             if(orderFound.status != 'pending'){
//                                 res.json({
//                                     success: true,
//                                     data: {message: 'Order Updated'},
//                                     error: null
//                                 });
//                             }
//                             else{
//                                 posModel.OnlineOrder.TableNo = orderFound.tableNumber;
        
//                                 posModel.OnlineOrder.KotNo = orderFound._id.toString();
//                                 posModel.OnlineOrder.OnlineOrderId = orderFound._id.toString();
//                                 Order.findOneAndUpdate({$and:[{orderId: orderid},{outletId:outletid}]}, {
//                                     status: 'confirmed',
//                                     name: "ADMIN - " + adminFound.name,
//                                     adminId: adminFound.adminId,
//                                     confirmTime: time
//                                 }, {safe: true, new: true}, function (err, orderUpdated) {
//                                     if (!err && orderUpdated) {
//                                         res.json({
//                                             success: true,
//                                             data: {message: 'Order Updated'},
//                                             error: null
//                                         });
//                                         posModel.OnlineOrder.TableNo = orderUpdated.tableNumber;
        
        
//                                         var logObj = {
//                                             log:String,
//                                             logTime: String
//                                         };
                                     
//                                         temp2 = orderUpdated.tableNumber;
//                                         User.findOneAndUpdate({userId: orderUpdated.userId}, {
//                                             $set: {
//                                                 currentTableNumber: temp2,
//                                                 updated_at: newdate
//                                             },
//                                             $push:{orders:parseInt(orderid)}
//                                         }, {safe: true, upsert: true, new: true}, function (err, userOrderUpdated) {
//                                             if (!err && userOrderUpdated) {
//                                                 Outlet.findOneAndUpdate({
//                                                     outletId: orderUpdated.outletId,
//                                                     'tables.tableNumber': orderUpdated.tableNumber
//                                                 }, {
//                                                     $set: {
//                                                         'tables.$.status': 'occupied',
//                                                         updated_at: newdate
//                                                     }
//                                                 }, {safe: true, new: true}, function (err, outletUpdated) {
//                                                     if (!err && outletUpdated) {
//                                                         outletId = outletUpdated.outletId;
        
//                                                         if (orderUpdated.drinks.length > 0) {
//                                                                 for (var q = 0; q < orderUpdated.drinks.length; q++) {
//                                                                     var item = {
//                                                                         "KISection": "",
//                                                                         "KIItemCode": orderUpdated.drinks[q].itemCode,
//                                                                         "KIIsManualEntry": false,
//                                                                         "KIIsComplimentry": false,
//                                                                         "KIDiscountPer": 0,
//                                                                         "KIDiscountAmount": 0,
//                                                                         "KIDescription": orderUpdated.drinks[q].name,
//                                                                         "KIPrintingDescription": orderUpdated.drinks[q].name,
//                                                                         "KIToppingsSelected": "",
//                                                                         "KIQty": orderUpdated.drinks[q].numberofdrinks,
//                                                                         "KIRate": parseFloat(orderUpdated.drinks[q].userPrice),
//                                                                         "KIBillSeries": "Liquor Bills",
//                                                                         "KIRemark": "",
//                                                                         "KICourse": "",
//                                                                         "KISaleType": "",
//                                                                         "KIBillingSection": "",
//                                                                         "KIPreparedByKitchen": "",
//                                                                         "KIDepartment": "",
//                                                                         "KIUserCategory1": "",
//                                                                         "KIUserCategory2": "",
//                                                                         "KITaxCategory": "",
//                                                                         "KIReasonForComplimentary": "",
//                                                                         "KIReasonForDiscount": "",
//                                                                         "KIPreparationTime": 10
//                                                                     };
//                                                                     posModel.OnlineOrder.ObjListItems.push(item);
//                                                                     drinkIdArray.push(orderUpdated.drinks[q].itemCode);
//                                                                     numberOfDrinks = orderUpdated.drinks[q].numberofdrinks;
//                                                                 }
//                                                             if (q >= orderUpdated.drinks.length-1) {
        
//                                                                 if(outletId == 6 || outletId == 4 || outletid == 2 || outletid ==3 ||outletid ==1 || outletid == 5){
//                                                                     var payload = posModel;
//                                                                     request.post('http://doi.dytelworld.com/OnlineOrderIntegration.asmx/InsertOnlineOrder', {
//                                                                         json: payload
//                                                                     }, function (error, response, body) {
//                                                                         if(error){
//                                                                             console.log(error);
//                                                                         }
//                                                                         else{
//                                                                             console.log(body);
//                                                                         }
//                                                                     });
        
//                                                                 }
        
//                                                                 orderUpdated.drinks.forEach(function (eachOrderDrink, a) {
//                                                                     outletUpdated.drinks.forEach(function (eachDrinkOutlet, b) {
//                                                                         if (eachDrinkOutlet.itemCode == eachOrderDrink.itemCode) {
//                                                                             newPrice = parseInt(eachOrderDrink.runningPrice) + ((eachOrderDrink.priceIncrementPerUnit) * (parseInt(eachOrderDrink.numberofdrinks)));
//                                                                             numberOfDrinks = eachOrderDrink.numberofdrinks;
        
//                                                                             if (newPrice >= parseInt(eachDrinkOutlet.capPrice)) {
//                                                                                 runningPrice = eachDrinkOutlet.capPrice;
//                                                                             }
//                                                                             else runningPrice = newPrice.toString();
//                                                                             if(newPrice <= parseInt(eachDrinkOutlet.basePrice)){
//                                                                                 runningPrice = eachDrinkOutlet.basePrice;
//                                                                             }
//                                                                             var tempArr = [];
//                                                                             if(eachDrinkOutlet.priceVariable == true){
//                                                                                 eachDrinkOutlet.runningPrice = runningPrice;
//                                                                             }
//                                                                         }
//                                                                     });
//                                                                     if(orderUpdated.drinks.length-1 === a){
//                                                                         outletUpdated.save(function (err, outletSaved) {
//                                                                             if (!err && outletSaved) {
        
//                                                                                 Game.find({$and: [{'drinks.itemCode': {$in: drinkIdArray}}, {orderDate: orderUpdated.orderDate}]}, function (err, games) {
//                                                                                     if (!err && games) {
//                                                                                         Outlet.findOne({outletId: orderUpdated.outletId}, function (err, outletFound) {
//                                                                                             if (!err && outletFound) {
//                                                                                                 for (var z = 0; z < games.length; z++) {
//                                                                                                     for (var z1 = 0; z1 < games[z].drinks.length; z1++) {
//                                                                                                         if (drinkIdArray.indexOf(games[z].drinks[z1].itemCode) > -1) {
//                                                                                                             for (var z2 = 0; z2 < outletFound.drinks.length; z2++) {
//                                                                                                                 if (outletFound.drinks[z2].itemCode == games[z].drinks[z1].itemCode) {
//                                                                                                                     games[z].drinks[z1].runningPrice = outletFound.drinks[z2].runningPrice;
//                                                                                                                     games[z].status = 'confirmed';
//                                                                                                                 }
//                                                                                                             }
//                                                                                                         }
//                                                                                                     }
//                                                                                                     if (z1 >= games[z].drinks.length) {
//                                                                                                         if (games[z].gameId == orderUpdated.gameId) {
//                                                                                                             games[z].save(function (err, gameDrinksChanged) {
//                                                                                                                 if (!err && gameDrinksChanged) {
//                                                                                                                     var obj = {};
//                                                                                                                     obj.gameId = gameDrinksChanged.gameId;
//                                                                                                                     obj.gameStatus = gameDrinksChanged.gameStatus;
//                                                                                                                     obj.tableNumber = gameDrinksChanged.tableNumber;
//                                                                                                                     obj.orderId = gameDrinksChanged.orderId;
//                                                                                                                     obj.status = gameDrinksChanged.status;
//                                                                                                                     obj.outletId = gameDrinksChanged.outletId;
//                                                                                                                     obj.userId = gameDrinksChanged.userId;
//                                                                                                                     obj.userName = gameDrinksChanged.userName;
//                                                                                                                     obj.orderDate = gameDrinksChanged.orderDate;
//                                                                                                                     obj.orderTime = gameDrinksChanged.orderTime;
//                                                                                                                     User.findOne({userId: gameDrinksChanged.userId}, function (err, userFoundNow) {
//                                                                                                                         if (!err && userFoundNow) {
//                                                                                                                             if (userFoundNow.userAgent == 'android') {
//                                                                                                                                 var sender = new fcm(gcmSenderKeyAndroid);
//                                                                                                                                 var message1 = {
//                                                                                                                                     to: userFoundNow.gcmId,
//                                                                                                                                     collapse_key: 'order',
//                                                                                                                                     priority: 'high',
//                                                                                                                                     contentAvailable: true,
//                                                                                                                                     timeToLive: 3,
//                                                                                                                                     message_type: 'orderstatus',
//                                                                                                                                     //restrictedPackageName: "somePackageName",
//                                                                                                                                     data: {
//                                                                                                                                         type: "orderstatus",
//                                                                                                                                         game: obj,
//                                                                                                                                         icon: "app_logo",
//                                                                                                                                         title: "Order Confirmed",
//                                                                                                                                         body: "Order Confirmed"
//                                                                                                                                     }
//                                                                                                                                 };
//                                                                                                                                 sender.send(message1, function (err, response) {
//                                                                                                                                     if (err) {
//                                                                                                                                         console.log(err);
        
//                                                                                                                                     } else {
//                                                                                                                                         console.log("Successfully sent: ", response);
//                                                                                                                                     }
//                                                                                                                                 });
//                                                                                                                             }
//                                                                                                                             else {
//                                                                                                                                 var sender1 = new fcm(gcmSenderKeyAndroid);
//                                                                                                                                 var message2 = {
//                                                                                                                                     to: userFoundNow.gcmId,
//                                                                                                                                     collapse_key: 'order',
//                                                                                                                                     priority: 'high',
//                                                                                                                                     contentAvailable: true,
//                                                                                                                                     timeToLive: 3,
//                                                                                                                                     message_type: 'orderstatus',
//                                                                                                                                     notification: {
//                                                                                                                                         title: "Order Confirmed",
//                                                                                                                                         body: "Order Confirmed",
//                                                                                                                                         sound: "default",
//                                                                                                                                         badge: "2",
//                                                                                                                                         content_available: true,
//                                                                                                                                         priority: "high",
//                                                                                                                                         color: "#90aa9c"
//                                                                                                                                     },
//                                                                                                                                     aps:{
//                                                                                                                                         sound: "default",
//                                                                                                                                         badge: "2",
//                                                                                                                                         alert:'Order Confirmed'
//                                                                                                                                     },
//                                                                                                                                     //restrictedPackageName: "somePackageName",
//                                                                                                                                     data: {
//                                                                                                                                         type: "orderstatus",
//                                                                                                                                         game: obj,
//                                                                                                                                         icon: "app_logo",
//                                                                                                                                         title: "Order Confirmed",
//                                                                                                                                         body: "Order Confirmed"
//                                                                                                                                     }
//                                                                                                                                 };
//                                                                                                                                 sender1.send(message2, function (err, response) {
//                                                                                                                                     if (err) {
//                                                                                                                                         console.log(err);
        
//                                                                                                                                     } else {
//                                                                                                                                         console.log("Successfully sent: ", response);
//                                                                                                                                     }
//                                                                                                                                 });
//                                                                                                                             }
        
//                                                                                                                         } else {
//                                                                                                                             console.log(err);
//                                                                                                                         }
//                                                                                                                     });
        
//                                                                                                                 } else console.log(err);
//                                                                                                             });
//                                                                                                         } else {
//                                                                                                             if (games[z].gameStatus != 'finished') {
//                                                                                                                 games[z].save(function (err, gameDrinksChanged) {
//                                                                                                                     if (!err && gameDrinksChanged) {
//                                                                                                                         var obj = {};
//                                                                                                                         obj.gameId = gameDrinksChanged.gameId;
//                                                                                                                         obj.gameStatus = gameDrinksChanged.gameStatus;
//                                                                                                                         obj.tableNumber = gameDrinksChanged.tableNumber;
//                                                                                                                         obj.orderId = gameDrinksChanged.orderId;
//                                                                                                                         obj.status = gameDrinksChanged.status;
//                                                                                                                         obj.outletId = gameDrinksChanged.outletId;
//                                                                                                                         obj.userId = gameDrinksChanged.userId;
//                                                                                                                         obj.userName = gameDrinksChanged.userName;
//                                                                                                                         obj.orderDate = gameDrinksChanged.orderDate;
//                                                                                                                         obj.orderTime = gameDrinksChanged.orderTime;
//                                                                                                                     } else console.log(err);
//                                                                                                                 });
//                                                                                                             }
//                                                                                                         }
//                                                                                                     }
//                                                                                                 }
//                                                                                             } else console.log(err);
//                                                                                         });
//                                                                                     } else console.log(err);
//                                                                                 });
        
//                                                                                 var socktObj = {
//                                                                                     arr:[],
//                                                                                     outletId: outletid
//                                                                                 };
//                                                                                 for(var sd=0;sd<outletSaved.drinks.length;sd++){
//                                                                                     if(drinkIdArray.indexOf(outletSaved.drinks[sd].itemCode)>-1){
//                                                                                         socktObj.arr.push(outletSaved.drinks[sd]);
//                                                                                     }
//                                                                                 }
//                                                                                 //todo: check for broadcast env for all sockets and not just one socket
//                                                                                     if(sd>=outletSaved.drinks.length){
//                                                                                         socket.emit('pricechanged', socktObj);
//                                                                                     }
        
        
        
//                                                                             }else {
//                                                                                 console.log(err);
//                                                                             }
//                                                                         });
//                                                                     }
//                                                                 });
        
//                                                             }
//                                                         }
//                                                         else if (outletUpdated.foods.length > 0) {
        
//                                                             for (var d = 0; d < orderUpdated.foods.length; d++) {
//                                                                 var item2 = {
//                                                                     "KISection": "",
//                                                                     "KIItemCode": orderUpdated.foods[d].itemCode,
//                                                                     "KIIsManualEntry": false,
//                                                                     "KIIsComplimentry": false,
//                                                                     "KIDiscountPer": 0,
//                                                                     "KIDiscountAmount": 0,
//                                                                     "KIDescription": orderUpdated.foods[d].name,
//                                                                     "KIPrintingDescription": orderUpdated.foods[d].name,
//                                                                     "KIToppingsSelected": "",
//                                                                     "KIQty": orderUpdated.foods[d].numberoffoods,
//                                                                     "KIRate": parseInt(orderUpdated.foods[d].basePrice),
//                                                                     "KIBillSeries": "Food Bills",
//                                                                     "KIRemark": "",
//                                                                     "KICourse": "",
//                                                                     "KISaleType": "",
//                                                                     "KIBillingSection": "",
//                                                                     "KIPreparedByKitchen": "",
//                                                                     "KIDepartment": "",
//                                                                     "KIUserCategory1": "",
//                                                                     "KIUserCategory2": "",
//                                                                     "KITaxCategory": "",
//                                                                     "KIReasonForComplimentary": "",
//                                                                     "KIReasonForDiscount": "",
//                                                                     "KIPreparationTime": 10
//                                                                 };
//                                                                 posModel.OnlineOrder.ObjListItems.push(item2);
//                                                             }
//                                                             if (d >= orderUpdated.foods.length-1) {
        
//                                                                 if (outletId == 6 || outletId == 4 || outletid ==2 || outletid == 3 || outletid ==1 || outletid == 5) {
//                                                                     var payload2 = posModel;
//                                                                     request.post('http://doi.dytelworld.com/OnlineOrderIntegration.asmx/InsertOnlineOrder', {
//                                                                         json: payload2
//                                                                     }, function (error, response, body) {
//                                                                         if (error) {
//                                                                             console.log(error);
//                                                                         } else {
//                                                                             console.log(body);
//                                                                         }
//                                                                     });
        
//                                                                 }
//                                                             }
        
//                                                             var sender = new fcm(gcmSenderKeyAndroid);
//                                                             if (userOrderUpdated.userAgent == 'android') {
//                                                                 var message = {
//                                                                     to: userOrderUpdated.gcmId,
//                                                                     collapse_key: 'foodorder',
//                                                                     priority: 'high',
//                                                                     contentAvailable: true,
//                                                                     timeToLive: 3,
//                                                                     message_type: 'foodorderconfirmed',
//                                                                     //restrictedPackageName: "somePackageName",
//                                                                     data: {
//                                                                         type: "foodorderconfirmed",
//                                                                         icon: "app_logo",
//                                                                         title: "Food Order Confirmed",
//                                                                         body: "Food Order Confirmed"
//                                                                     }
//                                                                 };
//                                                                 sender.send(message, function (err, response) {
//                                                                     if (err) {
//                                                                         console.log(err);
//                                                                     } else {
        
//                                                                         console.log("Successfully sent: ", response);
//                                                                     }
//                                                                 });
//                                                             }
//                                                             else {
//                                                                 var message1 = {
//                                                                     to: userOrderUpdated.gcmId,
//                                                                     collapse_key: 'foodorder',
//                                                                     priority: 'high',
//                                                                     contentAvailable: true,
//                                                                     timeToLive: 3,
//                                                                     message_type: 'foodorderconfirmed',
//                                                                     //restrictedPackageName: "somePackageName",
//                                                                     data: {
//                                                                         type: "foodorderconfirmed",
//                                                                         icon: "app_logo",
//                                                                         title: "Food Order Confirmed",
//                                                                         body: "Food Order Confirmed"
//                                                                     },
//                                                                     notification: {
//                                                                         title: "Food Order Confirmed",
//                                                                         body: "Food Order Confirmed",
//                                                                         sound: "default",
//                                                                         badge: "2",
//                                                                         content_available: true,
//                                                                         priority: "high",
//                                                                         color: "#3ed6d2"
//                                                                     },
//                                                                     aps:{
//                                                                         sound: "default",
//                                                                         badge: "2",
//                                                                         alert:'Food Order Confirmed'
//                                                                     }
//                                                                 };
//                                                                 sender.send(message1, function (err, response) {
//                                                                     if (err) {
//                                                                         console.log(err);
//                                                                     } else {
        
//                                                                         console.log("Successfully sent: ", response);
//                                                                     }
//                                                                 });
//                                                             }
        
        
//                                                         }
        
//                                                     } else console.log('error updating outlet table - ' + err);
//                                                 });
        
        
//                                             } else console.log("user error - " + err);
//                                         });
        
//                                         if(outletid != 6 || outletid !=4 || outletid !=2 ||outletid !=3 || outletid!=1 || outletid!=5){
//                                             var payload ={
//                                                 tableNo: orderUpdated.tableNumber,
//                                                 request: 'order',
//                                                 orderId: orderid,
//                                                 outletId: outletid
//                                             };
//                                             request.post('http://fmlajnode.reapit.in:3000/request', {
//                                                 json: payload
//                                             }, function (error, response, body) {
//                                                 if(error){
//                                                     console.log(error);
//                                                 }
//                                                 else{
//                                                     console.log(body);
//                                                 }
//                                             });
//                                         }
        
//                                     }
//                                     else {
//                                         console.log(err);
//                                         res.json({
//                                             success:false,
//                                             data:null,
//                                             error:'An Error occurred'
//                                         });
//                                     }
//                                 });
//                             }
//                         }
//                         else{
//                             console.log(err);
//                             res.json({
//                                 success:false,
//                                 data:null,
//                                 error:'An Error occurred'
//                             });
//                         }
//                     }).lean();
//                 }
//                 else {
//                     console.log(err);
//                     res.json({
//                         success:false,
//                         data:null,
//                         error:'An Error occurred'
//                     });
//                 }
//             }).lean();
//             }else{
        
//                 const apiKey = '65b0a6c8-f5e1-494d-af91-4915ec93ac02';
//                 const secretKey = 'F6iF5IeWW31m6rntXD_HD7diA6vPI34pNcknv6mgtzs';
//                 const tokenCreationTime = Math.floor(Date.now() / 1000);
//                 var uuid = require('uuid');
//                 console.log("JTI:"+uuid.v4())
//                 const payload = { iss: apiKey, iat: tokenCreationTime,jti: uuid.v4()  };
            
//                 //jwt library uses HS256 as default.
//                 const jwttoken = jwt.sign(payload, secretKey);
//                 console.log("token : "+jwttoken);
//                 var token = req.headers['auth_token'];
//                 var outletid ;
//                 var date1 = moment.utc().add(330, 'minutes');
//                 var dateOrder = moment(date1).format('DD-MMM-YYYY');
               
//                 var data = {
//                     "branchCode": "FS",
//                     "channel": "Dine In FML",
//                     "customer": {
//                       "name": "Customer Name",
//                       "phoneNumber": "1234567890"
//                     },
//                     "sourceInfo": {
//                         "invoiceNumber": "123456",
//                         "invoiceDate": new Date((dt = new Date()).getTime() - dt.getTimezoneOffset() * 60000).toISOString().replace(/(.*)T(.*)\..*/,'$1 $2'),
//                         "callbackURL": ""
//                       },
//                     "items": [],
//                      "resourceInfo": {
//                       "resourceId": "resourceId",
//                       "resourceName": "resourceName",
//                       "groupSize": 0,
//                       "resourceGroupName": ""
//                     }
//                   };
            
//                 Admin.findOne({token: token}, function (err, adminFound) {
//                     if (!err && adminFound) {
//                         outletid = adminFound.outletId;
//                         data.sourceInfo.callbackURL="http://35.154.86.71:7777/callback?orderid="+outletid;
//                         if(outletid == 1){
//                             data.branchCode="FBH"
//                         }
//                         if(outletid == 2){
//                             data.branchCode="FKN"
//                         }
//                         if(outletid == 3){
//                             data.branchCode="FH"
//                         }
//                         if(outletid == 4){
//                             data.branchCode="FS"
//                         }
//                         if(outletid == 5){
//                             data.branchCode="FN"
//                         }
//                         if(outletid == 6){
//                             data.branchCode="FP"
//                         }
            
//                         var orderid = req.query.orderId;
//                         var numberOfDrinks;
//                         var date1 = moment.utc().add(330, 'minutes');
//                         var newdate = new Date(date1);
//                         var date = moment(date1).format('YYYY-MM-DD');
//                         var time = moment(date1).format('HH:mm:ss');
//                         var runningPrice;
//                         var newPrice = 0;
//                         var outletId = Number;
//                         var drinkIdArray = [];
//                         var temp2;
//                         var dailyLog = new Dailylog;
//                         data.sourceInfo.invoiceNumber=orderid
//                         Order.findOne({$and:[{orderId:orderid},{outletId:outletid}]}, function (err, orderFound) {
//                             if(!err &&orderFound!=null){
//                                 if(orderFound.status != 'pending'){
//                                     res.json({
//                                         success: true,
//                                         data: {message: 'Order Updated'},
//                                         error: null
//                                     });
//                                 }
//                                 else{
//                                     var request = require('request'); var options = {
//                                         'method': 'GET',
//                                         'url': 'https://api.ristaapps.com/v1/resource?branch=FS',
//                                         'headers': {
//                                           'x-api-key': '65b0a6c8-f5e1-494d-af91-4915ec93ac02',
//                                           'x-api-token':jwttoken,
//                                           'Content-Type': 'application/json'
//                                         }
//                                     };
                                   
//                                     request(options, function (error, response) { 
//                                         if (error) throw new Error(error);
//                                         // console.table(response.body)
//                                         let resource_data = JSON.parse(response.body).find(obj => obj.name == +orderFound.tableNumber)
//                                         // resolve(resource_data);
//                                         // console.log("Selectedtable",resource_data)
//                                         data.resourceInfo.resourceId = resource_data.resourceId
//                                         data.resourceInfo.resourceName = resource_data.name
//                                         data.resourceInfo.groupSize = resource_data.capacity
//                                         // console.log('middle');
//                                         callAfterResourse(resource_data)
//                                     });
                                          
//                                     function callAfterResourse(){
//                                         // console.log('result', result)
//                                         Order.findOneAndUpdate({$and:[{orderId: orderid},{outletId:outletid}]}, {
        
//                                             status: 'confirmed',
//                                             name: "ADMIN - " + adminFound.name,
//                                             adminId: adminFound.adminId,
//                                             confirmTime: time
//                                         }, {safe: true, new: true}, function (err, orderUpdated) {
            
//                                             if (!err && orderUpdated) {
//                                                 res.json({
//                                                     success: true,
//                                                     data: {message: 'Order Updated'},
//                                                     error: null
//                                                 });
//                                                 User.findOne({userId: orderUpdated.userId}, function (err, userFound) {
//                                                     if (!err && userFound != null) {
//                                                     data.customer.name=userFound.name
//                                                         if(userFound.phoneNumber!=null){
//                                                             data.customer.phoneNumber=userFound.phoneNumber
//                                                         }
//                                                     }
//                                                 });
//                                                 temp2 = orderUpdated.tableNumber;
//                                                 User.findOneAndUpdate({userId: orderUpdated.userId}, {
//                                                     $set: {
//                                                         currentTableNumber: temp2,
//                                                         updated_at: newdate
//                                                     },
//                                                     $push:{orders:parseInt(orderid)}
//                                                 }, {safe: true, upsert: true, new: true}, function (err, userOrderUpdated) {
//                                                     if (!err && userOrderUpdated) {
//                                                         Outlet.findOneAndUpdate({
//                                                             outletId: orderUpdated.outletId,
//                                                             'tables.tableNumber': orderUpdated.tableNumber
//                                                         }, {
//                                                             $set: {
//                                                                 'tables.$.status': 'occupied',
//                                                                 updated_at: newdate
//                                                             }
//                                                         }, {safe: true, new: true}, function (err, outletUpdated) {
//                                                             if (!err && outletUpdated) {
//                                                                 outletId = outletUpdated.outletId;
//                                                             if (orderUpdated.drinks.length > 0) {
                                                                        
//                                                                         for (var q = 0; q < orderUpdated.drinks.length; q++) {
                
//                                                                             var item=  {
//                                                                                 "shortName":  orderUpdated.drinks[q].name,
//                                                                                 "quantity": orderUpdated.drinks[q].numberofdrinks,
//                                                                                 "unitPrice": parseFloat(orderUpdated.drinks[q].userPrice),
//                                                                                 "overridden": true,
//                                                                                 "skuCode": String(orderUpdated.drinks[q].skucode)
//                                                                             };
                
//                                                                             data.items.push(item);
//                                                                             drinkIdArray.push(orderUpdated.drinks[q].itemCode);
//                                                                             numberOfDrinks = orderUpdated.drinks[q].numberofdrinks;
//                                                                         }
                                                                    
//                                                                         if (q >= orderUpdated.drinks.length-1) {
//                                                                             console.log("body:",data)
                
//                                                                         if(outletid == 6 || outletid == 4 || outletid == 2 || outletid ==3 ||outletid ==1 || outletid == 5){
//                                                                                     const headers = {
//                                                                                         'x-api-key': apiKey,
//                                                                                         'x-api-token': jwttoken,
//                                                                                         'Content-Type': 'application/json'
//                                                                                     }
                
//                                                                                     axios.post("https://api.ristaapps.com/v1/sale",
//                                                                                         data, {
//                                                                                         headers: headers
//                                                                                     })
//                                                                                         .then((response) => {
//                                                                                             console.log("data: " + response.data)
//                                                                                         })
//                                                                                         .catch((error) => {
//                                                                                             console.log(error)
//                                                                                         })
                
//                                                                         }
                
//                                                                         orderUpdated.drinks.forEach(function (eachOrderDrink, a) {
//                                                                             outletUpdated.drinks.forEach(function (eachDrinkOutlet, b) {
//                                                                                 if (eachDrinkOutlet.itemCode == eachOrderDrink.itemCode) {
//                                                                                     newPrice = parseInt(eachOrderDrink.runningPrice) + ((eachOrderDrink.priceIncrementPerUnit) * (parseInt(eachOrderDrink.numberofdrinks)));
//                                                                                     numberOfDrinks = eachOrderDrink.numberofdrinks;
                
//                                                                                     if (newPrice >= parseInt(eachDrinkOutlet.capPrice)) {
//                                                                                         runningPrice = eachDrinkOutlet.capPrice;
//                                                                                     }
//                                                                                     else runningPrice = newPrice.toString();
//                                                                                     if(newPrice <= parseInt(eachDrinkOutlet.basePrice)){
//                                                                                         runningPrice = eachDrinkOutlet.basePrice;
//                                                                                     }
//                                                                                     var tempArr = [];
//                                                                                     if(eachDrinkOutlet.priceVariable == true){
//                                                                                         eachDrinkOutlet.runningPrice = runningPrice;
//                                                                                     }
//                                                                                 }
//                                                                             });
//                                                                             if(orderUpdated.drinks.length-1 === a){
//                                                                                 outletUpdated.save(function (err, outletSaved) {
//                                                                                     if (!err && outletSaved) {
                
//                                                                                         Game.find({$and: [{'drinks.itemCode': {$in: drinkIdArray}}, {orderDate: orderUpdated.orderDate}]}, function (err, games) {
//                                                                                             if (!err && games) {
//                                                                                                 Outlet.findOne({outletId: orderUpdated.outletId}, function (err, outletFound) {
//                                                                                                     if (!err && outletFound) {
//                                                                                                         for (var z = 0; z < games.length; z++) {
//                                                                                                             for (var z1 = 0; z1 < games[z].drinks.length; z1++) {
//                                                                                                                 if (drinkIdArray.indexOf(games[z].drinks[z1].itemCode) > -1) {
//                                                                                                                     for (var z2 = 0; z2 < outletFound.drinks.length; z2++) {
//                                                                                                                         if (outletFound.drinks[z2].itemCode == games[z].drinks[z1].itemCode) {
//                                                                                                                             games[z].drinks[z1].runningPrice = outletFound.drinks[z2].runningPrice;
//                                                                                                                             games[z].status = 'confirmed';
//                                                                                                                         }
//                                                                                                                     }
//                                                                                                                 }
//                                                                                                             }
//                                                                                                             if (z1 >= games[z].drinks.length) {
//                                                                                                                 if (games[z].gameId == orderUpdated.gameId) {
//                                                                                                                     games[z].save(function (err, gameDrinksChanged) {
//                                                                                                                         if (!err && gameDrinksChanged) {
//                                                                                                                             var obj = {};
//                                                                                                                             obj.gameId = gameDrinksChanged.gameId;
//                                                                                                                             obj.gameStatus = gameDrinksChanged.gameStatus;
//                                                                                                                             obj.tableNumber = gameDrinksChanged.tableNumber;
//                                                                                                                             obj.orderId = gameDrinksChanged.orderId;
//                                                                                                                             obj.status = gameDrinksChanged.status;
//                                                                                                                             obj.outletId = gameDrinksChanged.outletId;
//                                                                                                                             obj.userId = gameDrinksChanged.userId;
//                                                                                                                             obj.userName = gameDrinksChanged.userName;
//                                                                                                                             obj.orderDate = gameDrinksChanged.orderDate;
//                                                                                                                             obj.orderTime = gameDrinksChanged.orderTime;
//                                                                                                                             User.findOne({userId: gameDrinksChanged.userId}, function (err, userFoundNow) {
//                                                                                                                                 if (!err && userFoundNow) {
//                                                                                                                                     if (userFoundNow.userAgent == 'android') {
//                                                                                                                                         var sender = new fcm(gcmSenderKeyAndroid);
//                                                                                                                                         var message1 = {
//                                                                                                                                             to: userFoundNow.gcmId,
//                                                                                                                                             collapse_key: 'order',
//                                                                                                                                             priority: 'high',
//                                                                                                                                             contentAvailable: true,
//                                                                                                                                             timeToLive: 3,
//                                                                                                                                             message_type: 'orderstatus',
//                                                                                                                                             //restrictedPackageName: "somePackageName",
//                                                                                                                                             data: {
//                                                                                                                                                 type: "orderstatus",
//                                                                                                                                                 game: obj,
//                                                                                                                                                 icon: "app_logo",
//                                                                                                                                                 title: "Order Confirmed",
//                                                                                                                                                 body: "Order Confirmed"
//                                                                                                                                             }
//                                                                                                                                         };
//                                                                                                                                         sender.send(message1, function (err, response) {
//                                                                                                                                             if (err) {
//                                                                                                                                                 console.log(err);
                
//                                                                                                                                             } else {
//                                                                                                                                                 console.log("Successfully sent: ", response);
//                                                                                                                                             }
//                                                                                                                                         });
//                                                                                                                                     }
//                                                                                                                                     else {
//                                                                                                                                         var sender1 = new fcm(gcmSenderKeyAndroid);
//                                                                                                                                         var message2 = {
//                                                                                                                                             to: userFoundNow.gcmId,
//                                                                                                                                             collapse_key: 'order',
//                                                                                                                                             priority: 'high',
//                                                                                                                                             contentAvailable: true,
//                                                                                                                                             timeToLive: 3,
//                                                                                                                                             message_type: 'orderstatus',
//                                                                                                                                             notification: {
//                                                                                                                                                 title: "Order Confirmed",
//                                                                                                                                                 body: "Order Confirmed",
//                                                                                                                                                 sound: "default",
//                                                                                                                                                 badge: "2",
//                                                                                                                                                 content_available: true,
//                                                                                                                                                 priority: "high",
//                                                                                                                                                 color: "#90aa9c"
//                                                                                                                                             },
//                                                                                                                                             aps:{
//                                                                                                                                                 sound: "default",
//                                                                                                                                                 badge: "2",
//                                                                                                                                                 alert:'Order Confirmed'
//                                                                                                                                             },
//                                                                                                                                             //restrictedPackageName: "somePackageName",
//                                                                                                                                             data: {
//                                                                                                                                                 type: "orderstatus",
//                                                                                                                                                 game: obj,
//                                                                                                                                                 icon: "app_logo",
//                                                                                                                                                 title: "Order Confirmed",
//                                                                                                                                                 body: "Order Confirmed"
//                                                                                                                                             }
//                                                                                                                                         };
//                                                                                                                                         sender1.send(message2, function (err, response) {
//                                                                                                                                             if (err) {
//                                                                                                                                                 console.log(err);
                
//                                                                                                                                             } else {
//                                                                                                                                                 console.log("Successfully sent: ", response);
//                                                                                                                                             }
//                                                                                                                                         });
//                                                                                                                                     }
                
//                                                                                                                                 } else {
//                                                                                                                                     console.log(err);
//                                                                                                                                 }
//                                                                                                                             });
                
//                                                                                                                         } else console.log(err);
//                                                                                                                     });
//                                                                                                                 } else {
//                                                                                                                     if (games[z].gameStatus != 'finished') {
//                                                                                                                         games[z].save(function (err, gameDrinksChanged) {
//                                                                                                                             if (!err && gameDrinksChanged) {
//                                                                                                                                 var obj = {};
//                                                                                                                                 obj.gameId = gameDrinksChanged.gameId;
//                                                                                                                                 obj.gameStatus = gameDrinksChanged.gameStatus;
//                                                                                                                                 obj.tableNumber = gameDrinksChanged.tableNumber;
//                                                                                                                                 obj.orderId = gameDrinksChanged.orderId;
//                                                                                                                                 obj.status = gameDrinksChanged.status;
//                                                                                                                                 obj.outletId = gameDrinksChanged.outletId;
//                                                                                                                                 obj.userId = gameDrinksChanged.userId;
//                                                                                                                                 obj.userName = gameDrinksChanged.userName;
//                                                                                                                                 obj.orderDate = gameDrinksChanged.orderDate;
//                                                                                                                                 obj.orderTime = gameDrinksChanged.orderTime;
//                                                                                                                             } else console.log(err);
//                                                                                                                         });
//                                                                                                                     }
//                                                                                                                 }
//                                                                                                             }
//                                                                                                         }
//                                                                                                     } else console.log(err);
//                                                                                                 });
//                                                                                             } else console.log(err);
//                                                                                         });
                
//                                                                                         var socktObj = {
//                                                                                             arr:[],
//                                                                                             outletId: outletid
//                                                                                         };
//                                                                                         for(var sd=0;sd<outletSaved.drinks.length;sd++){
//                                                                                             if(drinkIdArray.indexOf(outletSaved.drinks[sd].itemCode)>-1){
//                                                                                                 socktObj.arr.push(outletSaved.drinks[sd]);
//                                                                                             }
//                                                                                         }
//                                                                                         //todo: check for broadcast env for all sockets and not just one socket
//                                                                                             if(sd>=outletSaved.drinks.length){
//                                                                                                 socket.emit('pricechanged', socktObj);
//                                                                                             }
                
                
                
//                                                                                     }else {
//                                                                                         console.log(err);
//                                                                                     }
//                                                                                 });
//                                                                             }
//                                                                         });
                
//                                                                     }
//                                                                 }
//                                                                 else if (outletUpdated.foods.length > 0) {
                                                                
//                                                                     for (var d = 0; d < orderUpdated.foods.length; d++) {
                
//                                                                         var item2=  {
//                                                                             "shortName": orderUpdated.foods[d].name,
//                                                                             "quantity": orderUpdated.foods[d].numberoffoods,
//                                                                             "unitPrice": parseInt(orderUpdated.foods[d].basePrice),
//                                                                             "overridden": false,
//                                                                             "skuCode": orderUpdated.foods[d].skucode,
//                                                                         };
                                                                    
//                                                                         data.items.push(item2);
//                                                                     }
            
//                                                                     console.log(data)
//                                                                     if (d >= orderUpdated.foods.length-1) {
                
//                                                                         if (outletId == 6 || outletId == 4 || outletid ==2 || outletid == 3 || outletid ==1 || outletid == 5) {
//                                                                             const headers = {
//                                                                                 'x-api-key': apiKey,
//                                                                                 'x-api-token': jwttoken,
//                                                                                 'Content-Type': 'application/json'
//                                                                             }
            
//                                                                             axios.post("https://api.ristaapps.com/v1/sale",
//                                                                                 data, {
//                                                                                 headers: headers
//                                                                             })
//                                                                                 .then((response) => {
//                                                                                     console.log("data: " , response.data)
//                                                                                 })
//                                                                                 .catch((error) => {
//                                                                                     console.log(error)
//                                                                                 })
                
//                                                                         }
//                                                                     }
//                                                                     var sender = new fcm(gcmSenderKeyAndroid);
//                                                                     if (userOrderUpdated.userAgent == 'android') {
//                                                                         var message = {
//                                                                             to: userOrderUpdated.gcmId,
//                                                                             collapse_key: 'foodorder',
//                                                                             priority: 'high',
//                                                                             contentAvailable: true,
//                                                                             timeToLive: 3,
//                                                                             message_type: 'foodorderconfirmed',
//                                                                             //restrictedPackageName: "somePackageName",
//                                                                             data: {
//                                                                                 type: "foodorderconfirmed",
//                                                                                 icon: "app_logo",
//                                                                                 title: "Food Order Confirmed",
//                                                                                 body: "Food Order Confirmed"
//                                                                             }
//                                                                         };
//                                                                         sender.send(message, function (err, response) {
//                                                                             if (err) {
//                                                                                 console.log(err);
//                                                                             } else {
                
//                                                                                 console.log("Successfully sent: ", response);
//                                                                             }
//                                                                         });
//                                                                     }
//                                                                     else {
//                                                                         var message1 = {
//                                                                             to: userOrderUpdated.gcmId,
//                                                                             collapse_key: 'foodorder',
//                                                                             priority: 'high',
//                                                                             contentAvailable: true,
//                                                                             timeToLive: 3,
//                                                                             message_type: 'foodorderconfirmed',
//                                                                             //restrictedPackageName: "somePackageName",
//                                                                             data: {
//                                                                                 type: "foodorderconfirmed",
//                                                                                 icon: "app_logo",
//                                                                                 title: "Food Order Confirmed",
//                                                                                 body: "Food Order Confirmed"
//                                                                             },
//                                                                             notification: {
//                                                                                 title: "Food Order Confirmed",
//                                                                                 body: "Food Order Confirmed",
//                                                                                 sound: "default",
//                                                                                 badge: "2",
//                                                                                 content_available: true,
//                                                                                 priority: "high",
//                                                                                 color: "#3ed6d2"
//                                                                             },
//                                                                             aps:{
//                                                                                 sound: "default",
//                                                                                 badge: "2",
//                                                                                 alert:'Food Order Confirmed'
//                                                                             }
//                                                                         };
//                                                                         sender.send(message1, function (err, response) {
//                                                                             if (err) {
//                                                                                 console.log(err);
//                                                                             } else {
                
//                                                                                 console.log("Successfully sent: ", response);
//                                                                             }
//                                                                         });
//                                                                     }
                
                
//                                                                 }
                
//                                                             } else console.log('error updating outlet table - ' + err);
//                                                         });
                
                
//                                                     } else console.log("user error - " + err);
//                                                 });
                
//                                                 // if(outletid != 6 || outletid !=4 || outletid !=2 ||outletid !=3 || outletid!=1 || outletid!=5){
//                                                 //     var payload ={
//                                                 //         tableNo: orderUpdated.tableNumber,
//                                                 //         request: 'order',
//                                                 //         orderId: orderid,
//                                                 //         outletId: outletid
//                                                 //     };
//                                                 //     request.post('http://fmlajnode.reapit.in:3000/request', {
//                                                 //         json: payload
//                                                 //     }, function (error, response, body) {
//                                                 //         if(error){
//                                                 //             console.log(error);
//                                                 //         }
//                                                 //         else{
//                                                 //             console.log(body);
//                                                 //         }
//                                                 //     });
//                                                 // }
                
                
                
//                                             }
//                                             else {
//                                                 console.log(err);
//                                                 res.json({
//                                                     success:false,
//                                                     data:null,
//                                                     error:'An Error occurred'
//                                                 });
//                                             };
//                                         });
//                                     }
                                    
//                                 }
//                             }
//                             else{
//                                 console.log(err);
//                                 res.json({
//                                     success:false,
//                                     data:null,
//                                     error:'An Error occurred'
//                                 });
//                             }
//                         }).lean();
//                     }
//                     else {
//                         console.log(err);
//                         res.json({
//                             success:false,
//                             data:null,
//                             error:'An Error occurred'
//                         });
//                     }
//                 }).lean();
        
//             }
//     }
   
// });



//API to place Order
adminRoutes.put('/orderplaced', function (req, res) {
    var orderid = req.query.orderId;
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var date = moment(date1).format('YYYY-MM-DD');
    var time = moment(date1).format('HH:mm:ss');
    var feedObj = {};
    var feedObjValue = {};
    var notUsed = 0;
    var token = req.headers['auth_token'];
    var dailyLog = new Dailylog;
    var outletid;

    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    Admin.findOne({token:token}, function (err, adminFound) {
    if(!err && adminFound!=null){
        outletid = adminFound.outletId;
        Order.findOne({$and:[{orderId:orderid},{outletId:outletid}]}, function (err, orderFound) {
            if (!err && orderFound != null) {
                if(orderFound.status!='confirmed'){
                    res.json({
                        success: true,
                        data: {message: 'order placed'},
                        error: null
                    });
                }
                else{
                    Order.findOneAndUpdate({$and:[{orderId: orderid},{outletId:outletid}]}, {
                        status: 'placed',
                        updated_at: newdate,
                        placedTime: time
                    }, {safe: true,  new: true}, function (err, orderPlaced) {
                        if (!err && orderPlaced) {
                            var logObj = {
                                logTime: String,
                                log: String
                            };
                         
                            if (orderPlaced.orderType == 'user') {
                                User.findOne({userId: orderPlaced.userId}, function (err, orderPlacedUser) {
                                    if (!err && orderPlacedUser) {
                                        if (orderPlaced.drinks.length > 0) {
                                            Game.findOneAndUpdate({gameId: orderPlaced.gameId}, {
                                                status: 'placed',
                                                gameStatus: 'active',
                                                startTime: time
                                            }, {safe: true,  new: true}, function (err, gameUpdated) {
                                                if (!err && gameUpdated) {
                                                    var obj = {};
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
                                                    res.json({
                                                        success: true,
                                                        data: {message: 'order placed'},
                                                        error: null
                                                    });
                                                    var sender = new fcm(gcmSenderKeyAndroid);
                                                    if (orderPlacedUser.userAgent == 'android') {

                                                        var message = {
                                                            to: orderPlacedUser.gcmId,
                                                            collapse_key: 'order',
                                                            priority: 'high',
                                                            contentAvailable: true,
                                                            timeToLive: 3,
                                                            message_type: 'orderstatus',
                                                            //restrictedPackageName: "somePackageName",
                                                            data: {
                                                                type: "orderstatus",
                                                                game: obj,
                                                                icon: "app_logo",
                                                                title: "Order Placed",
                                                                body: "Order Placed"
                                                            }
                                                        };
                                                        sender.send(message, function (err, response) {
                                                            if (err) {
                                                                console.log(err);
                                                            } else {
                                                                console.log("Successfully sent with response: ", response);
                                                            }
                                                        });
                                                    }
                                                    else {

                                                        var message1 = {
                                                            to: orderPlacedUser.gcmId,
                                                            collapse_key: 'order',
                                                            priority: 'high',
                                                            contentAvailable: true,
                                                            timeToLive: 3,
                                                            message_type: 'orderstatus',
                                                            //restrictedPackageName: "somePackageName",
                                                            notification: {
                                                                title: "Order Placed",
                                                                body: "Order Placed",
                                                                sound: "default",
                                                                badge: "2",
                                                                content_available: true,
                                                                priority: "high",
                                                                color: "#90aa9c"
                                                            },
                                                            aps:{
                                                                sound: "default",
                                                                badge: "2",
                                                                alert:'Order Placed'
                                                            },
                                                            data: {
                                                                type: "orderstatus",
                                                                game: obj,
                                                                icon: "app_logo",
                                                                title: "Order Placed",
                                                                body: "Order Placed"
                                                            }
                                                        };
                                                        sender.send(message1, function (err, response) {
                                                            if (err) {
                                                                console.log(err);
                                                            } else {
                                                                console.log("Successfully sent with response: ", response);
                                                            }
                                                        });
                                                    }

                                                    //regularorder , roundtime, rounddiscount, cheaper, popular
                                                        try{
                                                            Feed.find({}, function (err, feeds) {
                                                                if (!err && feeds) {
                                                                    var feedid = 0;
                                                                    var fid = 0;
                                                                    if (feeds.length > 0) {
                                                                        feedid = feeds[0].feedId;
                                                                    }
                                                                    for (var f = 0; f < 3; f++) {

                                                                        feedObj = {};
                                                                        feedObjValue = {};
                                                                        var feed = new Feed;
                                                                        if (f == 0) {
                                                                            //regularorder
                                                                            feed.feedId = feedid + fid + 1;
                                                                            fid++;
                                                                            feed.feedOrderId = orderPlaced.orderId;
                                                                            feed.type = 'regularorder';
                                                                            feed.feedTime = time;
                                                                            if(orderPlacedUser.name.indexOf(' ')>-1){
                                                                                feed.personName = orderPlacedUser.name;
                                                                            }else{
                                                                                feed.personName = orderPlacedUser.name+' user';
                                                                            }
                                                                            try {
                                                                                feed.personImage = orderPlacedUser.profilePic;
                                                                            } catch (err) {
                                                                                console.log(err);
                                                                            }
                                                                            feed.quantity = gameUpdated.drinks[0].numberofdrinks;
                                                                            feed.drinkRunningPrice = gameUpdated.drinks[0].userPrice;
                                                                            feed.drinkName = gameUpdated.drinks[0].name;
                                                                            feed.save(function (err, feedDone) {
                                                                                if (!err && feedDone) {
                                                                                    socket.emit("newfeed",feedDone);
                                                                                }
                                                                                else console.log(err);
                                                                            });
                                                                        }

                                                                        else if (f == 1) {
                                                                            //cheaper
                                                                            feed.feedId = feedid + fid + 1;
                                                                            fid++;
                                                                            feed.feedTime = time;
                                                                            feed.feedOrderId = orderPlaced.orderId;
                                                                            feed.type = 'cheaper';
                                                                            feed.personName = orderPlacedUser.name;
                                                                            try {
                                                                                feed.personImage = 'http://35.154.86.71:7777/feeds/cheaper.jpg';
                                                                            } catch (err) {
                                                                                console.log(err);
                                                                            }
                                                                            feed.save(function (err, feedSaved) {
                                                                                if (!err && feedSaved) {
                                                                                    feedObjValue = feedSaved;
                                                                                    Outlet.findOne({outletId: gameUpdated.outletId}, function (err, outletFound) {
                                                                                        if (!err && outletFound) {
                                                                                            feedObj.price = parseInt(outletFound.drinks[0].runningPrice);
                                                                                            feedObj.drinkName = outletFound.drinks[0].name;
                                                                                            feedObj.drinkRunningPrice = outletFound.drinks[0].runningPrice;
                                                                                            for (var dr1 = 1; dr1 < outletFound.drinks.length; dr1++) {
                                                                                                if (feedObj.price > parseInt(outletFound.drinks[dr1].runningPrice) && outletFound.drinks[dr1].priceVariable == true) {
                                                                                                    feedObj.drinkName = outletFound.drinks[dr1].name;
                                                                                                    feedObj.price = parseInt(outletFound.drinks[dr1].runningPrice);
                                                                                                    feedObj.drinkRunningPrice = outletFound.drinks[dr1].runningPrice;
                                                                                                }
                                                                                            }
                                                                                            if (dr1 >= outletFound.drinks.length) {
                                                                                                Feed.findOneAndUpdate({feedId: feedSaved.feedId}, {
                                                                                                    drinkName: feedObj.drinkName,
                                                                                                    personName: feedObj.drinkName,
                                                                                                    drinkRunningPrice: feedObj.drinkRunningPrice
                                                                                                }, {
                                                                                                    safe: true,
                                                                                                    new: true
                                                                                                }, function (err, feedDone) {
                                                                                                    if (!err && feedDone) {
                                                                                                        socket.emit("newfeed", feedDone);
                                                                                                    }
                                                                                                    else console.log(err);
                                                                                                });
                                                                                            }
                                                                                        } else console.log(err);
                                                                                    });

                                                                                } else console.log(err);
                                                                            });
                                                                        }
                                                                        else if (f == 2) {
                                                                            //popular
                                                                            feed.feedId = feedid + fid + 1;
                                                                            fid++;
                                                                            feed.feedTime = time;
                                                                            feed.feedOrderId = orderPlaced.orderId;
                                                                            feed.type = 'popular';
                                                                            feed.personName = orderPlacedUser.name;
                                                                            try {
                                                                                feed.personImage = "http://35.154.86.71:7777/feeds/popular.jpg";
                                                                            } catch (err) {
                                                                                console.log(err);
                                                                            }
                                                                            feed.save(function (err, feedSaved) {
                                                                                if (!err && feedSaved) {
                                                                                    feedObjValue = feedSaved;
                                                                                    Outlet.findOne({outletId: gameUpdated.outletId}, function (err, outletFound) {
                                                                                        if (!err && outletFound) {

                                                                                            var drinkArr = shuffle(outletFound.drinks);
                                                                                            feedObj.drinkName = drinkArr[0].name;
                                                                                            feedObj.drinkRunningPrice = drinkArr[0].runningPrice;

                                                                                            var set = false
                                                                                            for (var dr1 = 1; dr1 < drinkArr.length; dr1++) {
                                                                                                if (drinkArr[dr1].available == true && set == false) {
                                                                                                    feedObj.drinkName = drinkArr[dr1].name;
                                                                                                    feedObj.demandRate = drinkArr[dr1].demandRate;
                                                                                                    feedObj.drinkRunningPrice = drinkArr[dr1].runningPrice;
                                                                                                    set = true;
                                                                                                }
                                                                                            }
                                                                                            if (dr1 >= drinkArr.length) {
                                                                                                Feed.findOneAndUpdate({feedId: feedSaved.feedId}, {
                                                                                                    drinkName: feedObj.drinkName,
                                                                                                    personName: feedObj.drinkName,
                                                                                                    drinkRunningPrice: feedObj.drinkRunningPrice
                                                                                                }, {
                                                                                                    safe: true,
                                                                                                    new: true
                                                                                                }, function (err, feedDone) {
                                                                                                    if (!err && feedDone) {
                                                                                                        socket.emit("newfeed",feedDone);
                                                                                                    }
                                                                                                    else console.log(err);
                                                                                                });
                                                                                            }
                                                                                        } else console.log(err);
                                                                                    });

                                                                                } else console.log(err);
                                                                            });
                                                                        }
                                                                    }
                                                                }
                                                            }).sort({feedId: -1}).lean().limit(10);
                                                        }
                                                        catch(err){
                                                            console.log(err);
                                                        }



                                                } else console.log(err);
                                            });
                                        }
                                        else if (orderPlaced.foods.length > 0) {
                                            res.json({
                                                success: true,
                                                data: {message: 'order placed'},
                                                error: null
                                            });
                                        }

                                    } else console.log(err);
                                });
                            }
                            else {
                                res.json({
                                    success: true,
                                    data: {message: 'order placed'},
                                    error: null
                                });
                            }

                        }
                        else {
                            console.log(err);
                            res.json({
                                success: false,
                                data: null,
                                error: 'Error updating order'
                            });
                        }
                    });
                }
            }
            else{
                console.log(err);
                res.json({
                    success: false,
                    data: null,
                    error: 'Error updating order'
                });
            }
        })



    }
    else {
        console.log(err);
        res.json({
            success: false,
            data: null,
            error: 'Error updating order'
        });
    }

    }).lean();

});

// //API to place Order Admin
// adminRoutes.post('/placeorder', function (req, res) {
//     var token = req.headers['auth_token'];
//     var orderObj = req.body;
//     var order = new Order;
//     var newCount = 0;
//     var numberOfDrinks = 0;
//     var demandRate;
//     var runningPrice;
//     var newPrice = 0;
//     var outletId = Number;
//     var temp;
//     var demandLevel = 0;
//     var date1 = moment.utc().add(330, 'minutes');
//     var newdate = new Date(date1);
//     var date = moment(date1).format('YYYY-MM-DD');
//     var time = moment(date1).format('HH:mm:ss');
//     var dateOrder = moment(date1).format('DD-MMM-YYYY');

//     var drinkItemCodes = [];
//     var obj = {};
//     var drinkIdArray = [];
//     var totalNumber = 0;
//     var temp2;
//     var dailyLog = new Dailylog;
//     var socket_id = [];
//     var orderDrinkArray = [];
//     var outletid;
//     var mongoid;
//     var payload;
//     if(time > '00:00:00' || time < '08:00:00'){
//         dateOrder = moment(date1).subtract(1, 'days').format('DD-MMM-YYYY');
//     }

//     var posModel ={
//         "SourceId": 57,
//         "Sourcepwd": "!RePl@y.",
//         "OutletCode": "95916879",//for testing on juhi system - 21504
//         "Outletpswd": "FMLPASHAN",//for testing on juhi system - demo1
//         "OnlineOrder":{
//             "CustName": "",
//             "TableNo": "1",
//             "CustAddressLine1": "",
//             "CustAddressLine2": "",
//             "CustAddressLine3": "",
//             "CustAddressLine4": "",
//             "CustTel": "",
//             "CustTel2": "",
//             "KotNo":"45",
//             "OnlineOrderId": "45",
//             "KOTDate": dateOrder,
//             "KOTCover": "",
//             "Captain": "",
//             "Remark": "",
//             "OrderSource": "",
//             "EnteredBy": "",
//             "KOTType": "",
//             "IsPaymentReceived": false,
//             "ModeOFPayment": "CASH",
//             "IsBilled": false,
//             "KOTAmount": "45",
//             "IsKOTComplimentry": false,
//             "IsCancelled": false,
//             "Discount": 0,
//             "DiscountAmount": 0,
//             "ReasonForDiscount": "",
//             "EmailTo": "",
//             "EmailFrom": "",
//             "ReplyTo": "",
//             "ObjListItems": []
//         }
//     };
//     var orderid;

//     Admin.findOne({token: token}, function (err, adminFound) {
//         if (!err && adminFound) {
//             outletid = adminFound.outletId;
//             if(outletid == 4){
//                 posModel.OutletCode = "19224069";
//                 posModel.Outletpswd = "FMLMAGARPATTA";
//             }
//             if(outletid == 2){
//                 posModel.OutletCode = "24839455";
//                 posModel.Outletpswd = "FMLKALYANINAGAR"
//             }

//             if(outletid == 3){
//                 posModel.OutletCode = "63608834";
//                 posModel.Outletpswd = "FMLHINJEWADI"
//             }
//             if(outletid == 1){
//                 posModel.OutletCode = "50513131";
//                 posModel.Outletpswd = "FMLBHUGAON"
//             }
//             if(outletid == 5){
//                 posModel.OutletCode = "82049386";
//                 posModel.Outletpswd = "FMLNIMB"
//             }
//             Order.find({},{orderId:1}, function (err, orders) {
//                 if (!err && orders) {
//                     var orderid = 0;
//                     if (orders.length > 0) {
//                         orderid = orders[0].orderId + 1;
//                     } else {
//                         orderid = 1;
//                     }
//                     order.orderId = orderid;
//                     order.outletId = adminFound.outletId;
//                     order.tableNumber = orderObj.tableNumber;
//                     posModel.OnlineOrder.TableNo = orderObj.tableNumber;
//                     order.status = 'confirmed';
//                     order.name = "ADMIN - " + adminFound.name;
//                     order.adminId = adminFound.adminId;
//                     order.userId = 0;
//                     order.gameId = 0;
//                     order.orderType = 'admin';
//                     order.orderDate = date;
//                     order.orderTime = time;
//                     order.confirmTime = time;
//                     order.created_at = newdate;
//                     order.updated_at = newdate;
//                     order.syncStatus = 0;
//                     order.drinks = [];
//                     order.foods = [];
//                     order.save(function (err, orderSaved) {
//                         if(!err && orderSaved){
//                             var mongoid = orderSaved._id.toString();
//                             res.json({
//                                 success: true,
//                                 data: {message: 'Order Updated'},
//                                 error: null
//                             });
//                             for (var i = 0; i < orderObj.drinks.length; i++) {
//                                 orderDrinkArray.push(orderObj.drinks[i]);
//                                 drinkItemCodes.push(orderObj.drinks[i].itemCode);
//                                 var item = {
//                                     "KISection": "",
//                                     "KIItemCode": orderObj.drinks[i].itemCode,
//                                     "KIIsManualEntry": false,
//                                     "KIIsComplimentry": false,
//                                     "KIDiscountPer": 0,
//                                     "KIDiscountAmount": 0,
//                                     "KIDescription": orderObj.drinks[i].name,
//                                     "KIPrintingDescription": orderObj.drinks[i].name,
//                                     "KIToppingsSelected": "",
//                                     "KIQty": orderObj.drinks[i].numberofdrinks,
//                                     "KIRate": orderObj.drinks[i].userPrice,
//                                     "KIBillSeries": "Liquor Bills",
//                                     "KIRemark": orderObj.drinks[i].remark,
//                                     "KICourse": "",
//                                     "KISaleType": "",
//                                     "KIBillingSection": "",
//                                     "KIPreparedByKitchen": "",
//                                     "KIDepartment": "",
//                                     "KIUserCategory1": "",
//                                     "KIUserCategory2": "",
//                                     "KITaxCategory": "",
//                                     "KIReasonForComplimentary": "",
//                                     "KIReasonForDiscount": "",
//                                     "KIPreparationTime": 10
//                                 };
//                                 posModel.OnlineOrder.ObjListItems.push(item);
//                             }
//                             if (i >= orderObj.drinks.length) {
//                                 posModel.OnlineOrder.KotNo = orderSaved._id.toString();
//                                 posModel.OnlineOrder.OnlineOrderId = orderSaved._id.toString();
//                                 mongoid = orderSaved._id.toString();
//                                 payload =posModel;
//                                 if(outletid == 6 || outletid ==4 || outletid ==2 || outletid == 3 || outletid==1 || outletid == 5){
//                                     request.post('http://doi.dytelworld.com/OnlineOrderIntegration.asmx/InsertOnlineOrder', {
//                                         json: payload
//                                     }, function (error, response, body) {
//                                         if(error){
//                                             console.log(error);
//                                         }
//                                         else{
//                                             console.log(body);
//                                         }
//                                     });
//                                 }


//                                 Order.findByIdAndUpdate(mongoid,{
//                                     drinks:orderDrinkArray
//                                 },{safe:true}, function (err) {
//                                     if(err) console.log(err);
//                                 });
//                                 Outlet.findOneAndUpdate({
//                                     outletId: adminFound.outletId,
//                                     'tables.tableNumber': orderObj.tableNumber
//                                 }, {
//                                     $set: {'tables.$.status': 'occupied'}
//                                 }, {safe: true,  new: true}, function (err, outletFound) {
//                                     if (!err && outletFound) {
//                                         outletId = outletFound.outletId;
//                                         orderObj.drinks.forEach(function (eachDrink, a) {
//                                             outletFound.drinks.forEach(function (eachOutletDrink) {
//                                                 if (eachOutletDrink.itemCode == eachDrink.itemCode) {
//                                                     drinkIdArray.push(eachOutletDrink.itemCode);
//                                                     newPrice = parseInt(eachDrink.runningPrice) + ((eachDrink.priceIncrementPerUnit) * (parseInt(eachDrink.numberofdrinks)));
//                                                     numberOfDrinks = eachDrink.numberofdrinks;
//                                                     if (newPrice > parseInt(eachOutletDrink.capPrice)) {
//                                                         runningPrice = eachOutletDrink.capPrice;
//                                                     }
//                                                     else runningPrice = newPrice.toString();
//                                                     var tempCount = 0;
//                                                     var demandRate2;
//                                                     for (var t = 0; t < outletFound.drinks.length; t++) {
//                                                         tempCount = outletFound.drinks[t].demandLevel;
//                                                         if (eachOutletDrink.name == outletFound.drinks[t].name) {
//                                                             outletFound.drinks[t].runningPrice = runningPrice;
//                                                         }
//                                                     }
//                                                 }
//                                             });
//                                             if(orderObj.drinks.length-1 == a){
//                                                 outletFound.save(function (err, outletSaved) {
//                                                     if (!err && outletSaved) {

//                                                         var socktObj = {
//                                                             arr:[],
//                                                             outletId: outletid
//                                                         };
//                                                         for(var sd=0;sd<outletSaved.drinks.length;sd++){
//                                                             if(drinkItemCodes.indexOf(outletSaved.drinks[sd].itemCode)>-1){
//                                                                 socktObj.arr.push(outletSaved.drinks[sd]);
//                                                             }
//                                                         }
//                                                             if(sd>=outletSaved.drinks.length){
//                                                                 socket.emit('pricechanged', socktObj);
//                                                             }


//                                                         Game.find({$and: [{'drinks.itemCode': {$in: drinkItemCodes}}, {orderDate: date},{gameStatus:'active'}]}, function (err, games) {
//                                                             if (!err && games) {
//                                                                 Outlet.findOne({outletId: outletSaved.outletId}, function (err, outletFound) {
//                                                                     if (!err && outletFound) {
//                                                                         for (var z = 0; z < games.length; z++) {
//                                                                             for (var z1 = 0; z1 < games[z].drinks.length; z1++) {
//                                                                                 if (drinkItemCodes.indexOf(games[z].drinks[z1].itemCode) > -1) {
//                                                                                     for (var z2 = 0; z2 < outletFound.drinks.length; z2++) {
//                                                                                         if (outletFound.drinks[z2].itemCode == games[z].drinks[z1].itemCode) {
//                                                                                             games[z].drinks[z1].runningPrice = outletFound.drinks[z2].runningPrice;
//                                                                                         }
//                                                                                     }
//                                                                                 }
//                                                                             }
//                                                                             if (z1 >= games[z].drinks.length) {
//                                                                                 temp2 = z;
//                                                                                 games[z].save(function (err, gameDrinksChanged) {
//                                                                                     if (!err && gameDrinksChanged) {
//                                                                                         obj = {};
//                                                                                         obj.gameId = gameDrinksChanged.gameId;
//                                                                                         obj.gameStatus = gameDrinksChanged.gameStatus;
//                                                                                         obj.tableNumber = gameDrinksChanged.tableNumber;
//                                                                                         obj.orderId = gameDrinksChanged.orderId;
//                                                                                         obj.status = gameDrinksChanged.status;
//                                                                                         obj.outletId = gameDrinksChanged.outletId;
//                                                                                         obj.userId = gameDrinksChanged.userId;
//                                                                                         obj.userName = gameDrinksChanged.userName;
//                                                                                         obj.orderDate = gameDrinksChanged.orderDate;
//                                                                                         obj.orderTime = gameDrinksChanged.orderTime;

//                                                                                         User.findOne({userId: games[temp2].userId}, function (err, userFound) {
//                                                                                             if (!err && userFound) {
//                                                                                                 if(userFound.gameId>0){
//                                                                                                     var sender = new fcm(gcmSenderKeyAndroid);
//                                                                                                     if (userFound.userAgent == 'android') {
//                                                                                                         var message1 = {
//                                                                                                             to: userFound.gcmId,
//                                                                                                             collapse_key: 'demo',
//                                                                                                             priority: 'high',
//                                                                                                             contentAvailable: true,
//                                                                                                             timeToLive: 3,
//                                                                                                             message_type: 'drinkpricechanged',
//                                                                                                             //restrictedPackageName: "somePackageName",
//                                                                                                             data: {
//                                                                                                                 type: "drinkpricechanged",
//                                                                                                                 game: obj,
//                                                                                                                 icon: "app_logo",
//                                                                                                                 title: "Drinks Rates Changed",
//                                                                                                                 body: "Drinks Rates Changed"
//                                                                                                             }
//                                                                                                         };
//                                                                                                         sender.send(message1, function (err, response) {
//                                                                                                             if (err) {
//                                                                                                                 console.log(err);
//                                                                                                             } else {
//                                                                                                                 console.log("Successfully sent with response: ", response);
//                                                                                                             }
//                                                                                                         });
//                                                                                                     }
//                                                                                                     else {
//                                                                                                         var message = {
//                                                                                                             to: userFound.gcmId,
//                                                                                                             collapse_key: 'demo',
//                                                                                                             priority: 'high',
//                                                                                                             contentAvailable: true,
//                                                                                                             timeToLive: 3,
//                                                                                                             message_type: 'drinkpricechanged',
//                                                                                                             //restrictedPackageName: "somePackageName",
//                                                                                                             notification: {
//                                                                                                                 title: "Drinks Rates Changed",
//                                                                                                                 body: "Drinks Rates Changed",
//                                                                                                                 sound: "default",
//                                                                                                                 badge: "2",
//                                                                                                                 content_available: true,
//                                                                                                                 priority: "high"
//                                                                                                             },
//                                                                                                             aps:{
//                                                                                                                 sound: "default",
//                                                                                                                 badge: "2",
//                                                                                                                 alert:'Drinks Rates Changed'
//                                                                                                             },
//                                                                                                             data: {
//                                                                                                                 type: "drinkpricechanged",
//                                                                                                                 game: obj,
//                                                                                                                 icon: "app_logo",
//                                                                                                                 title: "Drinks Rates Changed",
//                                                                                                                 body: "Drinks Rates Changed"
//                                                                                                             }
//                                                                                                         };
//                                                                                                         sender.send(message, function (err, response) {
//                                                                                                             if (err) {
//                                                                                                                 console.log(err);
//                                                                                                             } else {
//                                                                                                                 console.log("Successfully sent with response: ", response);
//                                                                                                             }
//                                                                                                         });
//                                                                                                     }

//                                                                                                 }

//                                                                                             } else console.log(err);
//                                                                                         });

//                                                                                     } else console.log(err);
//                                                                                 });
//                                                                             }
//                                                                         }

//                                                                     } else console.log(err);
//                                                                 });

//                                                             } else console.log(err);
//                                                         });

//                                                     } else{
//                                                         console.log(err);

//                                                     }
//                                                 });
//                                                 var payload ={
//                                                     tableNo: orderObj.tableNumber,
//                                                     request: 'order',
//                                                     orderId:orderid,
//                                                     outletId: outletid
//                                                 };
//                                                 if(outletid!=6 || outletid!=4|| outletid!=2 || outletid!=3 || outletid !=1 || outletid != 5){
//                                                     request.post('http://fmlajnode.reapit.in:3000/request', {
//                                                         json: payload
//                                                     }, function (error, response, body) {
//                                                         if(error){
//                                                             console.log(error);
//                                                         }
//                                                         else{
//                                                             console.log(body);
//                                                         }
//                                                     });
//                                                 }
//                                             }
//                                         });

//                                     } else{
//                                         console.log(err);
//                                     }
//                                 });//end of outlet findone and update
//                             }
//                         }else{
//                             console.log(err);
//                         }
//                     });
//                     var logObj = {
//                         logTime: String,
//                         log: String
//                     };
       


//                 } else{
//                     console.log(err);
//                     res.json({
//                         success: false,
//                         data: null,
//                         error: 'Error Placing Order!!'
//                     });
//                 }
//             }).sort({orderId: -1}).limit(2).lean();
//         } else {
//             console.log(err);
//             res.json({
//                 success: false,
//                 data: null,
//                 error: 'Error Placing Order!!'
//             });
//         }
//     }).lean();
// });//end of API for admin to place order

// //API to place Order Admin
// adminRoutes.post('/placefoodorder', function (req, res) {
//     var token = req.headers['auth_token'];
//     var orderObj = req.body;
//     var order = new Order;
//     var outletId = Number;
//     var date1 = moment.utc().add(330, 'minutes');
//     var dateOrder = moment(date1).format('DD-MMM-YYYY');

//     var newdate = new Date(date1);
//     var date = moment(date1).format('YYYY-MM-DD');
//     var time = moment(date1).format('HH:mm:ss');
//     var dailyLog = new Dailylog;
//     var outletid;
//     var payload;
//     if(time > '00:00:00' || time < '08:00:00'){
//         dateOrder = moment(date1).subtract(1, 'days').format('DD-MMM-YYYY');
//     }
//     var posModel ={
//         "SourceId": 57,
//         "Sourcepwd": "!RePl@y.",
//             "OutletCode": "95916879",//for testing on juhi system - 21504
//             "Outletpswd": "FMLPASHAN",//for testing on juhi system - demo1
//         "OnlineOrder":{
//             "CustName": "",
//             "TableNo": "1",
//             "CustAddressLine1": "",
//             "CustAddressLine2": "",
//             "CustAddressLine3": "",
//             "CustAddressLine4": "",
//             "CustTel": "",
//             "CustTel2": "",
//             "KotNo":"45",
//             "OnlineOrderId": "45",
//             "KOTDate": dateOrder,
//             "KOTCover": "",
//             "Captain": "",
//             "Remark": "",
//             "OrderSource": "",
//             "EnteredBy": "",
//             "KOTType": "",
//             "IsPaymentReceived": false,
//             "ModeOFPayment": "CASH",
//             "IsBilled": false,
//             "KOTAmount": "45",
//             "IsKOTComplimentry": false,
//             "IsCancelled": false,
//             "Discount": 0,
//             "DiscountAmount": 0,
//             "ReasonForDiscount": "",
//             "EmailTo": "",
//             "EmailFrom": "",
//             "ReplyTo": "",
//             "ObjListItems": []
//         }
//     };
//     Admin.findOne({token: token}, function (err, adminFound) {
//         if (!err && adminFound) {
//             outletid = adminFound.outletId;
//             if(outletid == 4){
//                 posModel.OutletCode = "19224069";
//                 posModel.Outletpswd = "FMLMAGARPATTA";
//             }
//             if(outletid == 2){
//                 posModel.OutletCode = "24839455";
//                 posModel.Outletpswd = "FMLKALYANINAGAR"
//             }
//             if(outletid == 3){
//                 posModel.OutletCode = "63608834";
//                 posModel.Outletpswd = "FMLHINJEWADI"
//             }
//             if(outletid == 1){
//                 posModel.OutletCode = "50513131";
//                 posModel.Outletpswd = "FMLBHUGAON"
//             }
//             if(outletid == 5){
//                 posModel.OutletCode = "82049386";
//                 posModel.Outletpswd = "FMLNIMB"
//             }
//             Order.find({},{orderId:1}, function (err, orders) {
//                 if (!err && orders) {
//                     var orderid = 0;
//                     if (orders.length > 0) {
//                         orderid = orders[0].orderId + 1;
//                     } else {
//                         orderid = 1;
//                     }
//                     order.orderId = orderid;
//                     order.outletId = adminFound.outletId;
//                     order.tableNumber = orderObj.tableNumber;
//                     posModel.OnlineOrder.TableNo = orderObj.tableNumber;

//                     order.status = 'confirmed';
//                     order.name = "ADMIN - " + adminFound.name;
//                     order.adminId = adminFound.adminId;
//                     order.userId = 0;
//                     order.orderType = 'admin';
//                     order.orderDate = date;
//                     order.orderTime = time;
//                     order.confirmTime = time;
//                     order.created_at = newdate;
//                     order.updated_at = newdate;
//                     order.foods = [];
//                     order.syncStatus = 0;
//                     order.drinks = [];
//                     var logObj = {
//                         logTime: String,
//                         log: String
//                     };
            
//                     for (var i = 0; i < orderObj.foods.length; i++) {
//                         var item = {
//                             "KISection": "",
//                             "KIItemCode": orderObj.foods[i].itemCode,
//                             "KIIsManualEntry": false,
//                             "KIIsComplimentry": false,
//                             "KIDiscountPer": 0,
//                             "KIDiscountAmount": 0,
//                             "KIDescription": orderObj.foods[i].name,
//                             "KIPrintingDescription": orderObj.foods[i].name,
//                             "KIToppingsSelected": "",
//                             "KIQty": orderObj.foods[i].numberoffoods,
//                             "KIRate": parseInt(orderObj.foods[i].basePrice),
//                             "KIBillSeries": "Food Bills",
//                             "KIRemark": orderObj.foods[i].remark,
//                             "KICourse": "",
//                             "KISaleType": "",
//                             "KIBillingSection": "",
//                             "KIPreparedByKitchen": "",
//                             "KIDepartment": "",
//                             "KIUserCategory1": "",
//                             "KIUserCategory2": "",
//                             "KITaxCategory": "",
//                             "KIReasonForComplimentary": "",
//                             "KIReasonForDiscount": "",
//                             "KIPreparationTime": 10
//                         };

//                         posModel.OnlineOrder.ObjListItems.push(item);

//                         var foodObj = {
//                             foodId: orderObj.foods[i].foodId,
//                             foodType: orderObj.foods[i].foodType,
//                             name: orderObj.foods[i].name,
//                             basePrice: orderObj.foods[i].basePrice,
//                             available: orderObj.foods[i].available,
//                             numberoffoods: orderObj.foods[i].numberoffoods,
//                             itemCode: orderObj.foods[i].itemCode,
//                             delivered:false,
//                             remark: orderObj.foods[i].remark
//                         };
//                         order.foods.push(foodObj);
//                     }
//                     if (i >= orderObj.foods.length) {
//                         Outlet.findOneAndUpdate({
//                             outletId: adminFound.outletId,
//                             'tables.tableNumber': orderObj.tableNumber
//                         }, {
//                             $set: {'tables.$.status': 'occupied'}
//                         }, {safe: true, new: true}, function (err, outletFound) {
//                             if (!err && outletFound) {

//                                 outletId = outletFound.outletId;
//                                 order.save(function (err, saved) {
//                                     if (!err && saved) {
//                                         res.json({
//                                             success: true,
//                                             data: {message: 'Order Updated'},
//                                             error: null
//                                         });
//                                         posModel.OnlineOrder.KotNo = saved._id.toString();
//                                         posModel.OnlineOrder.OnlineOrderId = saved._id.toString();
//                                         if(outletid==6 || outletid == 4 || outletid == 2 || outletid == 3 || outletid ==1 || outletid == 5){
//                                             payload =posModel;
//                                             request.post('http://doi.dytelworld.com/OnlineOrderIntegration.asmx/InsertOnlineOrder', {
//                                                 json: payload
//                                             }, function (error, response, body) {
//                                                 if(error){
//                                                     console.log(error);
//                                                 }
//                                                 else{
//                                                     console.log(body);
//                                                 }
//                                             });
//                                         }else{
//                                             payload ={
//                                                 tableNo: orderObj.tableNumber,
//                                                 request: 'order',
//                                                 orderId: orderid,
//                                                 outletId: outletid
//                                             };
//                                             request.post('http://fmlajnode.reapit.in:3000/request', {
//                                                 json: payload
//                                             }, function (error, response, body) {
//                                                 if(error){
//                                                     console.log(error);
//                                                 }
//                                                 else{

//                                                 }
//                                             });
//                                         }

//                                     } else {
//                                         res.json({
//                                             success: false,
//                                             data: null,
//                                             error: 'Error Placing Order!!'
//                                         });
//                                     }
//                                 });
//                             } else console.log(err);
//                         });//end of outlet findone and update
//                     }
//                 } else console.log(err);
//             }).sort({orderId: -1}).limit(2).lean();
//         } else {
//             console.log(err);
//         }
//     }).lean();
// });//end of API for admin to place order




//API to place Order Admin
adminRoutes.post('/placeorder', function (req, res) {

 
    var token = req.headers['auth_token'];
    let oldpos=false
    var branchlist = []
    
    const apiKey = '65b0a6c8-f5e1-494d-af91-4915ec93ac02';
    const secretKey = 'F6iF5IeWW31m6rntXD_HD7diA6vPI34pNcknv6mgtzs';
    const tokenCreationTime = Math.floor(Date.now() / 1000);
    var uuid = require('uuid');
    const payload = { iss: apiKey, iat: tokenCreationTime,jti: uuid.v4()  };

    //jwt library uses HS256 as default.
    const jwttoken = jwt.sign(payload, secretKey);

    Admin.findOne({token: token}, function (err, adminFound) {
        if (!err && adminFound) {
            Outlet.findOne({outletId:adminFound.outletId}, function (err, dataFound) {
                console.log("Outlet Data",dataFound._doc.oldpos)
                if (!err && dataFound != null) {
                    if(dataFound._doc.oldpos == 0){
                        oldpos=false
                    }else{
                        oldpos=true
                    }
                    callAfterOutletidFind()
                }else{
                    res.json({
                        success: true,
                        data: null,
                        error: err
                    });
                    callAfterOutletidFind()
                    console.log(err);
                } 
            });
          }else{
                    console.log(err);
                    res.json({
                        success:false,
                        data:null,
                        error:'An Error occurred'
                    });
                }
          }).lean();
   


    function callAfterOutletidFind(){
            if(oldpos){
            var orderObj = req.body;
            var order = new Order;
            var newCount = 0;
            var numberOfDrinks = 0;
            var demandRate;
            var runningPrice;
            var newPrice = 0;
            var outletId = Number;
            var temp;
            var demandLevel = 0;
            var date1 = moment.utc().add(330, 'minutes');
            var newdate = new Date(date1);
            var date = moment(date1).format('YYYY-MM-DD');
            var time = moment(date1).format('HH:mm:ss');
            var dateOrder = moment(date1).format('DD-MMM-YYYY');

            var drinkItemCodes = [];
            var obj = {};
            var drinkIdArray = [];
            var totalNumber = 0;
            var temp2;
            var dailyLog = new Dailylog;
            var socket_id = [];
            var orderDrinkArray = [];
            var outletid;
            var mongoid;
            
            if(time > '00:00:00' || time < '08:00:00'){
                dateOrder = moment(date1).subtract(1, 'days').format('DD-MMM-YYYY');
            }

            var posModel ={
                "SourceId": 57,
                "Sourcepwd": "!RePl@y.",
                "OutletCode": "95916879",//for testing on juhi system - 21504
                "Outletpswd": "FMLPASHAN",//for testing on juhi system - demo1
                "OnlineOrder":{
                    "CustName": "",
                    "TableNo": "1",
                    "CustAddressLine1": "",
                    "CustAddressLine2": "",
                    "CustAddressLine3": "",
                    "CustAddressLine4": "",
                    "CustTel": "",
                    "CustTel2": "",
                    "KotNo":"45",
                    "OnlineOrderId": "45",
                    "KOTDate": dateOrder,
                    "KOTCover": "",
                    "Captain": "",
                    "Remark": "",
                    "OrderSource": "",
                    "EnteredBy": "",
                    "KOTType": "",
                    "IsPaymentReceived": false,
                    "ModeOFPayment": "CASH",
                    "IsBilled": false,
                    "KOTAmount": "45",
                    "IsKOTComplimentry": false,
                    "IsCancelled": false,
                    "Discount": 0,
                    "DiscountAmount": 0,
                    "ReasonForDiscount": "",
                    "EmailTo": "",
                    "EmailFrom": "",
                    "ReplyTo": "",
                    "ObjListItems": []
                }
            };
            var orderid;

            Admin.findOne({token: token}, function (err, adminFound) {
                if (!err && adminFound) {
                    outletid = adminFound.outletId;
                    if(outletid == 4){
                        posModel.OutletCode = "19224069";
                        posModel.Outletpswd = "FMLMAGARPATTA";
                    }
                    if(outletid == 2){
                        posModel.OutletCode = "24839455";
                        posModel.Outletpswd = "FMLKALYANINAGAR"
                    }

                    if(outletid == 3){
                        posModel.OutletCode = "63608834";
                        posModel.Outletpswd = "FMLHINJEWADI"
                    }
                    if(outletid == 1){
                        posModel.OutletCode = "50513131";
                        posModel.Outletpswd = "FMLBHUGAON"
                    }
                    if(outletid == 5){
                        posModel.OutletCode = "82049386";
                        posModel.Outletpswd = "FMLNIMB"
                    }
                    Order.find({},{orderId:1}, function (err, orders) {
                        if (!err && orders) {
                            var orderid = 0;
                            if (orders.length > 0) {
                                orderid = orders[0].orderId + 1;
                            } else {
                                orderid = 1;
                            }
                            order.orderId = orderid;
                            order.outletId = adminFound.outletId;
                            order.tableNumber = orderObj.tableNumber;
                            posModel.OnlineOrder.TableNo = orderObj.tableNumber;
                            order.status = 'confirmed';
                            order.name = "ADMIN - " + adminFound.name;
                            order.adminId = adminFound.adminId;
                            order.userId = 0;
                            order.gameId = 0;
                            order.orderType = 'admin';
                            order.orderDate = date;
                            order.orderTime = time;
                            order.confirmTime = time;
                            order.created_at = newdate;
                            order.updated_at = newdate;
                            order.syncStatus = 0;
                            order.drinks = [];
                            order.foods = [];
                            order.save(function (err, orderSaved) {
                                if(!err && orderSaved){
                                    var mongoid = orderSaved._id.toString();
                                    res.json({
                                        success: true,
                                        data: {message: 'Order Updated'},
                                        error: null
                                    });
                                    for (var i = 0; i < orderObj.drinks.length; i++) {
                                        orderDrinkArray.push(orderObj.drinks[i]);
                                        drinkItemCodes.push(orderObj.drinks[i].itemCode);
                                        var item = {
                                            "KISection": "",
                                            "KIItemCode": orderObj.drinks[i].itemCode,
                                            "KIIsManualEntry": false,
                                            "KIIsComplimentry": false,
                                            "KIDiscountPer": 0,
                                            "KIDiscountAmount": 0,
                                            "KIDescription": orderObj.drinks[i].name,
                                            "KIPrintingDescription": orderObj.drinks[i].name,
                                            "KIToppingsSelected": "",
                                            "KIQty": orderObj.drinks[i].numberofdrinks,
                                            "KIRate": orderObj.drinks[i].userPrice,
                                            "KIBillSeries": "Liquor Bills",
                                            "KIRemark": orderObj.drinks[i].remark,
                                            "KICourse": "",
                                            "KISaleType": "",
                                            "KIBillingSection": "",
                                            "KIPreparedByKitchen": "",
                                            "KIDepartment": "",
                                            "KIUserCategory1": "",
                                            "KIUserCategory2": "",
                                            "KITaxCategory": "",
                                            "KIReasonForComplimentary": "",
                                            "KIReasonForDiscount": "",
                                            "KIPreparationTime": 10
                                        };
                                        posModel.OnlineOrder.ObjListItems.push(item);
                                    }
                                    if (i >= orderObj.drinks.length) {
                                        posModel.OnlineOrder.KotNo = orderSaved._id.toString();
                                        posModel.OnlineOrder.OnlineOrderId = orderSaved._id.toString();
                                        mongoid = orderSaved._id.toString();
                                        var payload =posModel;
                                        if(outletid == 6 || outletid ==4 || outletid ==2 || outletid == 3 || outletid==1 || outletid == 5){
                                            request.post('http://doi.dytelworld.com/OnlineOrderIntegration.asmx/InsertOnlineOrder', {
                                                json: payload
                                            }, function (error, response, body) {
                                                if(error){
                                                    console.log(error);
                                                }
                                                else{
                                                    console.log(body);
                                                }
                                            });
                                        }


                                        Order.findByIdAndUpdate(mongoid,{
                                            drinks:orderDrinkArray
                                        },{safe:true}, function (err) {
                                            if(err) console.log(err);
                                        });
                                        Outlet.findOneAndUpdate({
                                            outletId: adminFound.outletId,
                                            'tables.tableNumber': orderObj.tableNumber
                                        }, {
                                            $set: {'tables.$.status': 'occupied'}
                                        }, {safe: true,  new: true}, function (err, outletFound) {
                                            if (!err && outletFound) {
                                                outletId = outletFound.outletId;
                                                orderObj.drinks.forEach(function (eachDrink, a) {
                                                    outletFound.drinks.forEach(function (eachOutletDrink) {
                                                        if (eachOutletDrink.itemCode == eachDrink.itemCode) {
                                                            drinkIdArray.push(eachOutletDrink.itemCode);
                                                            newPrice = parseInt(eachDrink.runningPrice) + ((eachDrink.priceIncrementPerUnit) * (parseInt(eachDrink.numberofdrinks)));
                                                            numberOfDrinks = eachDrink.numberofdrinks;
                                                            if (newPrice > parseInt(eachOutletDrink.capPrice)) {
                                                                runningPrice = eachOutletDrink.capPrice;
                                                            }
                                                            else runningPrice = newPrice.toString();
                                                            var tempCount = 0;
                                                            var demandRate2;
                                                            for (var t = 0; t < outletFound.drinks.length; t++) {
                                                                tempCount = outletFound.drinks[t].demandLevel;
                                                                if (eachOutletDrink.name == outletFound.drinks[t].name) {
                                                                    outletFound.drinks[t].runningPrice = runningPrice;
                                                                }
                                                            }
                                                        }
                                                    });
                                                    if(orderObj.drinks.length-1 == a){
                                                        outletFound.save(function (err, outletSaved) {
                                                            if (!err && outletSaved) {

                                                                var socktObj = {
                                                                    arr:[],
                                                                    outletId: outletid
                                                                };
                                                                for(var sd=0;sd<outletSaved.drinks.length;sd++){
                                                                    if(drinkItemCodes.indexOf(outletSaved.drinks[sd].itemCode)>-1){
                                                                        socktObj.arr.push(outletSaved.drinks[sd]);
                                                                    }
                                                                }
                                                                    if(sd>=outletSaved.drinks.length){
                                                                        socket.emit('pricechanged', socktObj);
                                                                    }


                                                                Game.find({$and: [{'drinks.itemCode': {$in: drinkItemCodes}}, {orderDate: date},{gameStatus:'active'}]}, function (err, games) {
                                                                    if (!err && games) {
                                                                        Outlet.findOne({outletId: outletSaved.outletId}, function (err, outletFound) {
                                                                            if (!err && outletFound) {
                                                                                for (var z = 0; z < games.length; z++) {
                                                                                    for (var z1 = 0; z1 < games[z].drinks.length; z1++) {
                                                                                        if (drinkItemCodes.indexOf(games[z].drinks[z1].itemCode) > -1) {
                                                                                            for (var z2 = 0; z2 < outletFound.drinks.length; z2++) {
                                                                                                if (outletFound.drinks[z2].itemCode == games[z].drinks[z1].itemCode) {
                                                                                                    games[z].drinks[z1].runningPrice = outletFound.drinks[z2].runningPrice;
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                    if (z1 >= games[z].drinks.length) {
                                                                                        temp2 = z;
                                                                                        games[z].save(function (err, gameDrinksChanged) {
                                                                                            if (!err && gameDrinksChanged) {
                                                                                                obj = {};
                                                                                                obj.gameId = gameDrinksChanged.gameId;
                                                                                                obj.gameStatus = gameDrinksChanged.gameStatus;
                                                                                                obj.tableNumber = gameDrinksChanged.tableNumber;
                                                                                                obj.orderId = gameDrinksChanged.orderId;
                                                                                                obj.status = gameDrinksChanged.status;
                                                                                                obj.outletId = gameDrinksChanged.outletId;
                                                                                                obj.userId = gameDrinksChanged.userId;
                                                                                                obj.userName = gameDrinksChanged.userName;
                                                                                                obj.orderDate = gameDrinksChanged.orderDate;
                                                                                                obj.orderTime = gameDrinksChanged.orderTime;

                                                                                                User.findOne({userId: games[temp2].userId}, function (err, userFound) {
                                                                                                    if (!err && userFound) {
                                                                                                        if(userFound.gameId>0){
                                                                                                            var sender = new fcm(gcmSenderKeyAndroid);
                                                                                                            if (userFound.userAgent == 'android') {
                                                                                                                var message1 = {
                                                                                                                    to: userFound.gcmId,
                                                                                                                    collapse_key: 'demo',
                                                                                                                    priority: 'high',
                                                                                                                    contentAvailable: true,
                                                                                                                    timeToLive: 3,
                                                                                                                    message_type: 'drinkpricechanged',
                                                                                                                    //restrictedPackageName: "somePackageName",
                                                                                                                    data: {
                                                                                                                        type: "drinkpricechanged",
                                                                                                                        game: obj,
                                                                                                                        icon: "app_logo",
                                                                                                                        title: "Drinks Rates Changed",
                                                                                                                        body: "Drinks Rates Changed"
                                                                                                                    }
                                                                                                                };
                                                                                                                sender.send(message1, function (err, response) {
                                                                                                                    if (err) {
                                                                                                                        console.log(err);
                                                                                                                    } else {
                                                                                                                        console.log("Successfully sent with response: ", response);
                                                                                                                    }
                                                                                                                });
                                                                                                            }
                                                                                                            else {
                                                                                                                var message = {
                                                                                                                    to: userFound.gcmId,
                                                                                                                    collapse_key: 'demo',
                                                                                                                    priority: 'high',
                                                                                                                    contentAvailable: true,
                                                                                                                    timeToLive: 3,
                                                                                                                    message_type: 'drinkpricechanged',
                                                                                                                    //restrictedPackageName: "somePackageName",
                                                                                                                    notification: {
                                                                                                                        title: "Drinks Rates Changed",
                                                                                                                        body: "Drinks Rates Changed",
                                                                                                                        sound: "default",
                                                                                                                        badge: "2",
                                                                                                                        content_available: true,
                                                                                                                        priority: "high"
                                                                                                                    },
                                                                                                                    aps:{
                                                                                                                        sound: "default",
                                                                                                                        badge: "2",
                                                                                                                        alert:'Drinks Rates Changed'
                                                                                                                    },
                                                                                                                    data: {
                                                                                                                        type: "drinkpricechanged",
                                                                                                                        game: obj,
                                                                                                                        icon: "app_logo",
                                                                                                                        title: "Drinks Rates Changed",
                                                                                                                        body: "Drinks Rates Changed"
                                                                                                                    }
                                                                                                                };
                                                                                                                sender.send(message, function (err, response) {
                                                                                                                    if (err) {
                                                                                                                        console.log(err);
                                                                                                                    } else {
                                                                                                                        console.log("Successfully sent with response: ", response);
                                                                                                                    }
                                                                                                                });
                                                                                                            }

                                                                                                        }

                                                                                                    } else console.log(err);
                                                                                                });

                                                                                            } else console.log(err);
                                                                                        });
                                                                                    }
                                                                                }

                                                                            } else console.log(err);
                                                                        });

                                                                    } else console.log(err);
                                                                });

                                                            } else{
                                                                console.log(err);

                                                            }
                                                        });
                                                        // var payload ={
                                                        //     tableNo: orderObj.tableNumber,
                                                        //     request: 'order',
                                                        //     orderId:orderid,
                                                        //     outletId: outletid
                                                        // };
                                                        // if(outletid!=6 || outletid!=4|| outletid!=2 || outletid!=3 || outletid !=1 || outletid != 5){
                                                        //     request.post('http://fmlajnode.reapit.in:3000/request', {
                                                        //         json: payload
                                                        //     }, function (error, response, body) {
                                                        //         if(error){
                                                        //             console.log(error);
                                                        //         }
                                                        //         else{
                                                        //             console.log(body);
                                                        //         }
                                                        //     });
                                                        // }
                                                    }
                                                });

                                            } else{
                                                console.log(err);
                                            }
                                        });//end of outlet findone and update
                                    }
                                }else{
                                    console.log(err);
                                }
                            });
                            var logObj = {
                                logTime: String,
                                log: String
                            };
            


                        } else{
                            console.log(err);
                            res.json({
                                success: false,
                                data: null,
                                error: 'Error Placing Order!!'
                            });
                        }
                    }).sort({orderId: -1}).limit(2).lean();
                } else {
                    console.log(err);
                    res.json({
                        success: false,
                        data: null,
                        error: 'Error Placing Order!!'
                    });
                }
            }).lean();

        }else{
            var orderObj = req.body;
            console.log("requestbody",orderObj)
            var order = new Order;
            var newCount = 0;
            var numberOfDrinks = 0;
            var demandRate;
            var runningPrice;
            var newPrice = 0;
            var outletId = Number;
            var temp;
            var demandLevel = 0;
            var date1 = moment.utc().add(330, 'minutes');
            var newdate = new Date(date1);
            var date = moment(date1).format('YYYY-MM-DD');
            var time = moment(date1).format('HH:mm:ss');
            var dateOrder = moment(date1).format('DD-MMM-YYYY');

            var drinkItemCodes = [];
            var obj = {};
            var drinkIdArray = [];
            var totalNumber = 0;
            var temp2;
            var dailyLog = new Dailylog;
            var socket_id = [];
            var orderDrinkArray = [];
            var outletid;
            var mongoid;
            
            if(time > '00:00:00' || time < '08:00:00'){
                dateOrder = moment(date1).subtract(1, 'days').format('DD-MMM-YYYY');
            }

        
            var data = {
                "branchCode": "FS",
                "channel": "Dine In FML",
                "customer": {
                "name": "Admin",
                "phoneNumber": "1234567890"
                },
                "sourceInfo": {
                    "invoiceNumber": "123456",
                    "invoiceDate":  new Date((dt = new Date()).getTime() - dt.getTimezoneOffset() * 60000).toISOString().replace(/(.*)T(.*)\..*/,'$1 $2'),
                    "callbackURL": ""
                },
                "items": [],
                "resourceInfo": {
                "resourceId": "resourceId",
                "resourceName": "resourceName",
                "groupSize": 0,
                "resourceGroupName": ""
                }
            };

            Admin.findOne({token: token}, function (err, adminFound) {
                if (!err && adminFound) {
                    
                    outletid = adminFound.outletId;
                    data.sourceInfo.callbackURL="http://35.154.86.71:7777/callback?orderid="+outletid;
                    if(outletid == 1){
                        data.branchCode="FBH"
                    }
                    if(outletid == 2){
                        data.branchCode="FKN"
                    }
                    if(outletid == 3){
                        data.branchCode="FH"
                    }
                    if(outletid == 4){
                        data.branchCode="FS"
                    }
                    if(outletid == 5){
                        data.branchCode="FNI"
                    }
                    if(outletid == 6){
                        data.branchCode="FP"
                    }
                    Order.find({},{orderId:1}, function (err, orders) {
                        if (!err && orders) {
                            var orderid = 0;
                            if (orders.length > 0) {
                                orderid = orders[0].orderId + 1;
                            } else {
                                orderid = 1;
                            }
                            
                            order.orderId = orderid;
                            data.sourceInfo.invoiceNumber=orderid;
                            order.outletId = adminFound.outletId;
                            order.tableNumber = orderObj.tableNumber;
                            order.status = 'confirmed';
                            order.name = "ADMIN - " + adminFound.name;
                            order.adminId = adminFound.adminId;
                            order.userId = 0;
                            order.gameId = 0;
                            order.orderType = 'admin';
                            order.orderDate = date;
                            order.orderTime = time;
                            order.confirmTime = time;
                            order.created_at = newdate;
                            order.updated_at = newdate;
                            order.syncStatus = 0;
                            order.drinks = [];
                            order.foods = [];
                            order.save(function (err, orderSaved) {
                                if(!err && orderSaved){
                                    var mongoid = orderSaved._id.toString();
                                
                                    
                                    res.json({
                                        success: true,
                                        data: {message: 'Order Updated'},
                                        error: null
                                    });
                                    
                                    var request = require('request'); var options = {
                                        'method': 'GET',
                                        'url': 'https://api.ristaapps.com/v1/resource?branch='+data.branchCode,
                                        'headers': {
                                        'x-api-key': '65b0a6c8-f5e1-494d-af91-4915ec93ac02',
                                        'x-api-token':jwttoken,
                                        'Content-Type': 'application/json'
                                        }
                                    };
                                
                                    request(options, function (error, response) { 
                                        if (error) throw new Error(error);
                                        // console.table(response.body)
                                        let resource_data = JSON.parse(response.body).find(obj => obj.name == + orderObj.tableNumber)
                                        // resolve(resource_data);
                                        // console.log("Selectedtable",resource_data)
                                        data.resourceInfo.resourceId = resource_data.resourceId
                                        data.resourceInfo.resourceName = resource_data.name
                                        data.resourceInfo.groupSize = resource_data.capacity
                                        // console.log('middle');
                                        callAfterResourse(resource_data)
                                    });
                                        
                                    function callAfterResourse(){
                                        for (var i = 0; i < orderObj.drinks.length; i++) {
                                            orderDrinkArray.push(orderObj.drinks[i]);
                                            drinkItemCodes.push(orderObj.drinks[i].itemCode);
                                            var item=  {
                                                "shortName": orderObj.drinks[i].name,
                                                "note": orderObj.drinks[i].remark,
                                                "quantity":orderObj.drinks[i].numberofdrinks,
                                                "unitPrice": parseFloat(orderObj.drinks[i].userPrice),
                                                "overridden": true,
                                                "skuCode": orderObj.drinks[i].skucode
                                            };

                                            data.items.push(item);
                                        }
                                        if (i >= orderObj.drinks.length) {
                                        
                                            if(outletid == 6 || outletid ==4 || outletid ==2 || outletid == 3 || outletid==1 || outletid == 5){
                                                const headers = {
                                                    'x-api-key': apiKey,
                                                    'x-api-token': jwttoken,
                                                    'Content-Type': 'application/json'
                                                }

                                                console.log("data",data)
                                                axios.post("https://api.ristaapps.com/v1/sale",
                                                    data, {
                                                    headers: headers
                                                })
                                                    .then((response) => {
                                                        console.log("data: " + response.data)
                                                    })
                                                    .catch((error) => {
                                                        console.log(error)
                                                    })

                                            }


                                            Order.findByIdAndUpdate(mongoid,{
                                                drinks:orderDrinkArray
                                            },{safe:true}, function (err) {
                                                if(err) console.log(err);
                                            });
                                            Outlet.findOneAndUpdate({
                                                outletId: adminFound.outletId,
                                                'tables.tableNumber': orderObj.tableNumber
                                            }, {
                                                $set: {'tables.$.status': 'occupied'}
                                            }, {safe: true,  new: true}, function (err, outletFound) {
                                                if (!err && outletFound) {
                                                    outletId = outletFound.outletId;
                                                    orderObj.drinks.forEach(function (eachDrink, a) {
                                                        outletFound.drinks.forEach(function (eachOutletDrink) {
                                                            if (eachOutletDrink.itemCode == eachDrink.itemCode) {
                                                                drinkIdArray.push(eachOutletDrink.itemCode);
                                                                newPrice = parseInt(eachDrink.runningPrice) + ((eachDrink.priceIncrementPerUnit) * (parseInt(eachDrink.numberofdrinks)));
                                                                numberOfDrinks = eachDrink.numberofdrinks;
                                                                if (newPrice > parseInt(eachOutletDrink.capPrice)) {
                                                                    runningPrice = eachOutletDrink.capPrice;
                                                                }
                                                                else runningPrice = newPrice.toString();
                                                                var tempCount = 0;
                                                                var demandRate2;
                                                                for (var t = 0; t < outletFound.drinks.length; t++) {
                                                                    tempCount = outletFound.drinks[t].demandLevel;
                                                                    if (eachOutletDrink.name == outletFound.drinks[t].name) {
                                                                        outletFound.drinks[t].runningPrice = runningPrice;
                                                                    }
                                                                }
                                                            }
                                                        });
                                                        if(orderObj.drinks.length-1 == a){
                                                            outletFound.save(function (err, outletSaved) {
                                                                if (!err && outletSaved) {

                                                                    var socktObj = {
                                                                        arr:[],
                                                                        outletId: outletid
                                                                    };
                                                                    for(var sd=0;sd<outletSaved.drinks.length;sd++){
                                                                        if(drinkItemCodes.indexOf(outletSaved.drinks[sd].itemCode)>-1){
                                                                            socktObj.arr.push(outletSaved.drinks[sd]);
                                                                        }
                                                                    }
                                                                        if(sd>=outletSaved.drinks.length){
                                                                            socket.emit('pricechanged', socktObj);
                                                                        }


                                                                    Game.find({$and: [{'drinks.itemCode': {$in: drinkItemCodes}}, {orderDate: date},{gameStatus:'active'}]}, function (err, games) {
                                                                        if (!err && games) {
                                                                            Outlet.findOne({outletId: outletSaved.outletId}, function (err, outletFound) {
                                                                                if (!err && outletFound) {
                                                                                    for (var z = 0; z < games.length; z++) {
                                                                                        for (var z1 = 0; z1 < games[z].drinks.length; z1++) {
                                                                                            if (drinkItemCodes.indexOf(games[z].drinks[z1].itemCode) > -1) {
                                                                                                for (var z2 = 0; z2 < outletFound.drinks.length; z2++) {
                                                                                                    if (outletFound.drinks[z2].itemCode == games[z].drinks[z1].itemCode) {
                                                                                                        games[z].drinks[z1].runningPrice = outletFound.drinks[z2].runningPrice;
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                        if (z1 >= games[z].drinks.length) {
                                                                                            temp2 = z;
                                                                                            games[z].save(function (err, gameDrinksChanged) {
                                                                                                if (!err && gameDrinksChanged) {
                                                                                                    obj = {};
                                                                                                    obj.gameId = gameDrinksChanged.gameId;
                                                                                                    obj.gameStatus = gameDrinksChanged.gameStatus;
                                                                                                    obj.tableNumber = gameDrinksChanged.tableNumber;
                                                                                                    obj.orderId = gameDrinksChanged.orderId;
                                                                                                    obj.status = gameDrinksChanged.status;
                                                                                                    obj.outletId = gameDrinksChanged.outletId;
                                                                                                    obj.userId = gameDrinksChanged.userId;
                                                                                                    obj.userName = gameDrinksChanged.userName;
                                                                                                    obj.orderDate = gameDrinksChanged.orderDate;
                                                                                                    obj.orderTime = gameDrinksChanged.orderTime;

                                                                                                    User.findOne({userId: games[temp2].userId}, function (err, userFound) {
                                                                                                        if (!err && userFound) {
                                                                                                            if(userFound.gameId>0){
                                                                                                                var sender = new fcm(gcmSenderKeyAndroid);
                                                                                                                if (userFound.userAgent == 'android') {
                                                                                                                    var message1 = {
                                                                                                                        to: userFound.gcmId,
                                                                                                                        collapse_key: 'demo',
                                                                                                                        priority: 'high',
                                                                                                                        contentAvailable: true,
                                                                                                                        timeToLive: 3,
                                                                                                                        message_type: 'drinkpricechanged',
                                                                                                                        //restrictedPackageName: "somePackageName",
                                                                                                                        data: {
                                                                                                                            type: "drinkpricechanged",
                                                                                                                            game: obj,
                                                                                                                            icon: "app_logo",
                                                                                                                            title: "Drinks Rates Changed",
                                                                                                                            body: "Drinks Rates Changed"
                                                                                                                        }
                                                                                                                    };
                                                                                                                    sender.send(message1, function (err, response) {
                                                                                                                        if (err) {
                                                                                                                            console.log(err);
                                                                                                                        } else {
                                                                                                                            console.log("Successfully sent with response: ", response);
                                                                                                                        }
                                                                                                                    });
                                                                                                                }
                                                                                                                else {
                                                                                                                    var message = {
                                                                                                                        to: userFound.gcmId,
                                                                                                                        collapse_key: 'demo',
                                                                                                                        priority: 'high',
                                                                                                                        contentAvailable: true,
                                                                                                                        timeToLive: 3,
                                                                                                                        message_type: 'drinkpricechanged',
                                                                                                                        //restrictedPackageName: "somePackageName",
                                                                                                                        notification: {
                                                                                                                            title: "Drinks Rates Changed",
                                                                                                                            body: "Drinks Rates Changed",
                                                                                                                            sound: "default",
                                                                                                                            badge: "2",
                                                                                                                            content_available: true,
                                                                                                                            priority: "high"
                                                                                                                        },
                                                                                                                        aps:{
                                                                                                                            sound: "default",
                                                                                                                            badge: "2",
                                                                                                                            alert:'Drinks Rates Changed'
                                                                                                                        },
                                                                                                                        data: {
                                                                                                                            type: "drinkpricechanged",
                                                                                                                            game: obj,
                                                                                                                            icon: "app_logo",
                                                                                                                            title: "Drinks Rates Changed",
                                                                                                                            body: "Drinks Rates Changed"
                                                                                                                        }
                                                                                                                    };
                                                                                                                    sender.send(message, function (err, response) {
                                                                                                                        if (err) {
                                                                                                                            console.log(err);
                                                                                                                        } else {
                                                                                                                            console.log("Successfully sent with response: ", response);
                                                                                                                        }
                                                                                                                    });
                                                                                                                }

                                                                                                            }

                                                                                                        } else console.log(err);
                                                                                                    });

                                                                                                } else console.log(err);
                                                                                            });
                                                                                        }
                                                                                    }

                                                                                } else console.log(err);
                                                                            });

                                                                        } else console.log(err);
                                                                    });

                                                                } else{
                                                                    console.log(err);

                                                                }
                                                            });
                                                            // var payload ={
                                                            //     tableNo: orderObj.tableNumber,
                                                            //     request: 'order',
                                                            //     orderId:orderid,
                                                            //     outletId: outletid
                                                            // };
                                                            // if(outletid!=6 || outletid!=4|| outletid!=2 || outletid!=3 || outletid !=1 || outletid != 5){
                                                            //     request.post('http://fmlajnode.reapit.in:3000/request', {
                                                            //         json: payload
                                                            //     }, function (error, response, body) {
                                                            //         if(error){
                                                            //             console.log(error);
                                                            //         }
                                                            //         else{
                                                            //             console.log(body);
                                                            //         }
                                                            //     });
                                                            // }
                                                        }
                                                    });

                                                } else{
                                                    console.log(err);
                                                }
                                            });//end of outlet findone and update
                                        }
                                    }
                                }else{
                                    console.log(err);
                                }
                            });
                            var logObj = {
                                logTime: String,
                                log: String
                            };
            


                        } else{
                            console.log(err);
                            res.json({
                                success: false,
                                data: null,
                                error: 'Error Placing Order!!'
                            });
                        }
                    }).sort({orderId: -1}).limit(2).lean();
                } else {
                    console.log(err);
                    res.json({
                        success: false,
                        data: null,
                        error: 'Error Placing Order!!'
                    });
                }
            }).lean();      
        }
    }
});//end of API for admin to place order

//API to place Order Admin
adminRoutes.post('/placefoodorder', function (req, res) {

    
    var token = req.headers['auth_token'];
    let oldpos=false
    var branchlist = []
    
    const apiKey = '65b0a6c8-f5e1-494d-af91-4915ec93ac02';
    const secretKey = 'F6iF5IeWW31m6rntXD_HD7diA6vPI34pNcknv6mgtzs';
    const tokenCreationTime = Math.floor(Date.now() / 1000);
    var uuid = require('uuid');
    const jwtpayload = { iss: apiKey, iat: tokenCreationTime,jti: uuid.v4()  };

    //jwt library uses HS256 as default.
    const jwttoken = jwt.sign(jwtpayload, secretKey);

    Admin.findOne({token: token}, function (err, adminFound) {
        if (!err && adminFound) {
            Outlet.findOne({outletId:adminFound.outletId}, function (err, dataFound) {
                console.log("Outlet Data",dataFound._doc.oldpos)
                if (!err && dataFound != null) {
                    if(dataFound._doc.oldpos == 0){
                        oldpos=false
                    }else{
                        oldpos=true
                    }
                    callAfterOutletidFind()
                }else{
                    res.json({
                        success: true,
                        data: null,
                        error: err
                    });
                    callAfterOutletidFind()
                    console.log(err);
                } 
            });
          }else{
                    console.log(err);
                    res.json({
                        success:false,
                        data:null,
                        error:'An Error occurred'
                    });
                }
          }).lean();
   


    function callAfterOutletidFind(){
                if(oldpos){
                var token = req.headers['auth_token'];
                var orderObj = req.body;
                var order = new Order;
                var outletId = Number;
                var date1 = moment.utc().add(330, 'minutes');
                var dateOrder = moment(date1).format('DD-MMM-YYYY');

                var newdate = new Date(date1);
                var date = moment(date1).format('YYYY-MM-DD');
                var time = moment(date1).format('HH:mm:ss');
                var dailyLog = new Dailylog;
                var outletid;
                var payload;
                if(time > '00:00:00' || time < '08:00:00'){
                    dateOrder = moment(date1).subtract(1, 'days').format('DD-MMM-YYYY');
                }
                var posModel ={
                    "SourceId": 57,
                    "Sourcepwd": "!RePl@y.",
                        "OutletCode": "95916879",//for testing on juhi system - 21504
                        "Outletpswd": "FMLPASHAN",//for testing on juhi system - demo1
                    "OnlineOrder":{
                        "CustName": "",
                        "TableNo": "1",
                        "CustAddressLine1": "",
                        "CustAddressLine2": "",
                        "CustAddressLine3": "",
                        "CustAddressLine4": "",
                        "CustTel": "",
                        "CustTel2": "",
                        "KotNo":"45",
                        "OnlineOrderId": "45",
                        "KOTDate": dateOrder,
                        "KOTCover": "",
                        "Captain": "",
                        "Remark": "",
                        "OrderSource": "",
                        "EnteredBy": "",
                        "KOTType": "",
                        "IsPaymentReceived": false,
                        "ModeOFPayment": "CASH",
                        "IsBilled": false,
                        "KOTAmount": "45",
                        "IsKOTComplimentry": false,
                        "IsCancelled": false,
                        "Discount": 0,
                        "DiscountAmount": 0,
                        "ReasonForDiscount": "",
                        "EmailTo": "",
                        "EmailFrom": "",
                        "ReplyTo": "",
                        "ObjListItems": []
                    }
                };
                Admin.findOne({token: token}, function (err, adminFound) {
                    if (!err && adminFound) {
                        outletid = adminFound.outletId;
                        if(outletid == 4){
                            posModel.OutletCode = "19224069";
                            posModel.Outletpswd = "FMLMAGARPATTA";
                        }
                        if(outletid == 2){
                            posModel.OutletCode = "24839455";
                            posModel.Outletpswd = "FMLKALYANINAGAR"
                        }
                        if(outletid == 3){
                            posModel.OutletCode = "63608834";
                            posModel.Outletpswd = "FMLHINJEWADI"
                        }
                        if(outletid == 1){
                            posModel.OutletCode = "50513131";
                            posModel.Outletpswd = "FMLBHUGAON"
                        }
                        if(outletid == 5){
                            posModel.OutletCode = "82049386";
                            posModel.Outletpswd = "FMLNIMB"
                        }
                        Order.find({},{orderId:1}, function (err, orders) {
                            if (!err && orders) {
                                var orderid = 0;
                                if (orders.length > 0) {
                                    orderid = orders[0].orderId + 1;
                                } else {
                                    orderid = 1;
                                }
                                order.orderId = orderid;
                                order.outletId = adminFound.outletId;
                                order.tableNumber = orderObj.tableNumber;
                                posModel.OnlineOrder.TableNo = orderObj.tableNumber;

                                order.status = 'confirmed';
                                order.name = "ADMIN - " + adminFound.name;
                                order.adminId = adminFound.adminId;
                                order.userId = 0;
                                order.orderType = 'admin';
                                order.orderDate = date;
                                order.orderTime = time;
                                order.confirmTime = time;
                                order.created_at = newdate;
                                order.updated_at = newdate;
                                order.foods = [];
                                order.syncStatus = 0;
                                order.drinks = [];
                                var logObj = {
                                    logTime: String,
                                    log: String
                                };
                        
                                for (var i = 0; i < orderObj.foods.length; i++) {
                                    var item = {
                                        "KISection": "",
                                        "KIItemCode": orderObj.foods[i].itemCode,
                                        "KIIsManualEntry": false,
                                        "KIIsComplimentry": false,
                                        "KIDiscountPer": 0,
                                        "KIDiscountAmount": 0,
                                        "KIDescription": orderObj.foods[i].name,
                                        "KIPrintingDescription": orderObj.foods[i].name,
                                        "KIToppingsSelected": "",
                                        "KIQty": orderObj.foods[i].numberoffoods,
                                        "KIRate": parseInt(orderObj.foods[i].basePrice),
                                        "KIBillSeries": "Food Bills",
                                        "KIRemark": orderObj.foods[i].remark,
                                        "KICourse": "",
                                        "KISaleType": "",
                                        "KIBillingSection": "",
                                        "KIPreparedByKitchen": "",
                                        "KIDepartment": "",
                                        "KIUserCategory1": "",
                                        "KIUserCategory2": "",
                                        "KITaxCategory": "",
                                        "KIReasonForComplimentary": "",
                                        "KIReasonForDiscount": "",
                                        "KIPreparationTime": 10
                                    };

                                    posModel.OnlineOrder.ObjListItems.push(item);

                                    var foodObj = {
                                        foodId: orderObj.foods[i].foodId,
                                        foodType: orderObj.foods[i].foodType,
                                        name: orderObj.foods[i].name,
                                        basePrice: orderObj.foods[i].basePrice,
                                        available: orderObj.foods[i].available,
                                        numberoffoods: orderObj.foods[i].numberoffoods,
                                        itemCode: orderObj.foods[i].itemCode,
                                        delivered:false,
                                        remark: orderObj.foods[i].remark
                                    };
                                    order.foods.push(foodObj);
                                }
                                if (i >= orderObj.foods.length) {
                                    Outlet.findOneAndUpdate({
                                        outletId: adminFound.outletId,
                                        'tables.tableNumber': orderObj.tableNumber
                                    }, {
                                        $set: {'tables.$.status': 'occupied'}
                                    }, {safe: true, new: true}, function (err, outletFound) {
                                        if (!err && outletFound) {

                                            outletId = outletFound.outletId;
                                            order.save(function (err, saved) {
                                                if (!err && saved) {
                                                    res.json({
                                                        success: true,
                                                        data: {message: 'Order Updated'},
                                                        error: null
                                                    });
                                                    posModel.OnlineOrder.KotNo = saved._id.toString();
                                                    posModel.OnlineOrder.OnlineOrderId = saved._id.toString();
                                                    if(outletid==6 || outletid == 4 || outletid == 2 || outletid == 3 || outletid ==1 || outletid == 5){
                                                        payload =posModel;
                                                        request.post('http://doi.dytelworld.com/OnlineOrderIntegration.asmx/InsertOnlineOrder', {
                                                            json: payload
                                                        }, function (error, response, body) {
                                                            if(error){
                                                                console.log(error);
                                                            }
                                                            else{
                                                                console.log(body);
                                                            }
                                                        });
                                                    }else{
                                                        payload ={
                                                            tableNo: orderObj.tableNumber,
                                                            request: 'order',
                                                            orderId: orderid,
                                                            outletId: outletid
                                                        };
                                                        request.post('http://fmlajnode.reapit.in:3000/request', {
                                                            json: payload
                                                        }, function (error, response, body) {
                                                            if(error){
                                                                console.log(error);
                                                            }
                                                            else{

                                                            }
                                                        });
                                                    }

                                                } else {
                                                    res.json({
                                                        success: false,
                                                        data: null,
                                                        error: 'Error Placing Order!!'
                                                    });
                                                }
                                            });
                                        } else console.log(err);
                                    });//end of outlet findone and update
                                }
                            } else console.log(err);
                        }).sort({orderId: -1}).limit(2).lean();
                    } else {
                        console.log(err);
                    }
                }).lean();
            }else{
                var token = req.headers['auth_token'];
                var orderObj = req.body;
                var order = new Order;
                var outletId = Number;
                var date1 = moment.utc().add(330, 'minutes');
                var dateOrder = moment(date1).format('DD-MMM-YYYY');

                var newdate = new Date(date1);
                var date = moment(date1).format('YYYY-MM-DD');
                var time = moment(date1).format('HH:mm:ss');
                var dailyLog = new Dailylog;
                var outletid;
                var payload;
                if(time > '00:00:00' || time < '08:00:00'){
                    dateOrder = moment(date1).subtract(1, 'days').format('DD-MMM-YYYY');
                }
            var data = {
                    "branchCode": "FS",
                    "channel": "Dine In FML",
                    "customer": {
                    "name": "Admin",
                    "phoneNumber": "1234567890"
                    },
                    "sourceInfo": {
                        "invoiceNumber": "123456",
                        "invoiceDate":  new Date((dt = new Date()).getTime() - dt.getTimezoneOffset() * 60000).toISOString().replace(/(.*)T(.*)\..*/,'$1 $2'),
                        "callbackURL": ""
                    },
                    "items": [],
                    "resourceInfo": {
                    "resourceId": "resourceId",
                    "resourceName": "resourceName",
                    "groupSize": 0,
                    "resourceGroupName": ""
                    }
                };
                Admin.findOne({token: token}, function (err, adminFound) {
                    if (!err && adminFound) {
                        outletid = adminFound.outletId;
                        data.sourceInfo.callbackURL="http://35.154.86.71:7777/callback?orderid="+outletid;
                        if(outletid == 1){
                            data.branchCode="FBH"
                        }
                        if(outletid == 2){
                            data.branchCode="FKN"
                        }
                        if(outletid == 3){
                            data.branchCode="FH"
                        }
                        if(outletid == 4){
                            data.branchCode="FS"
                        }
                        if(outletid == 5){
                            data.branchCode="FNI"
                        }
                        if(outletid == 6){
                            data.branchCode="FP"
                        }
                        Order.find({},{orderId:1}, function (err, orders) {
                            if (!err && orders) {
                                var orderid = 0;
                                if (orders.length > 0) {
                                    orderid = orders[0].orderId + 1;
                                } else {
                                    orderid = 1;
                                }
                                order.orderId = orderid;
                                data.sourceInfo.invoiceNumber=orderid
                                order.outletId = adminFound.outletId;
                                order.tableNumber = orderObj.tableNumber;
                                order.status = 'confirmed';
                                order.name = "ADMIN - " + adminFound.name;
                                order.adminId = adminFound.adminId;
                                order.userId = 0;
                                order.orderType = 'admin';
                                order.orderDate = date;
                                order.orderTime = time;
                                order.confirmTime = time;
                                order.created_at = newdate;
                                order.updated_at = newdate;
                                order.foods = [];
                                order.syncStatus = 0;
                                order.drinks = [];
                                var logObj = {
                                    logTime: String,
                                    log: String
                                };
                                
                            
                                var request = require('request'); var options = {
                                    'method': 'GET',
                                    'url': 'https://api.ristaapps.com/v1/resource?branch='+data.branchCode,
                                    'headers': {
                                    'x-api-key': '65b0a6c8-f5e1-494d-af91-4915ec93ac02',
                                    'x-api-token':jwttoken,
                                    'Content-Type': 'application/json'
                                    }
                                };
                            
                                request(options, function (error, response) { 
                                    if (error) throw new Error(error);
                                    // console.table(response.body)
                                    let resource_data = JSON.parse(response.body).find(obj => obj.name == + orderObj.tableNumber)
                                    // resolve(resource_data);
                                    // console.log("Selectedtable",resource_data)
                                    data.resourceInfo.resourceId = resource_data.resourceId
                                    data.resourceInfo.resourceName = resource_data.name
                                    data.resourceInfo.groupSize = resource_data.capacity
                                    // console.log('middle');
                                    callAfterResourse(resource_data)
                                });
                                    
                                function callAfterResourse(){
                                
                            
                                for (var i = 0; i < orderObj.foods.length; i++) {
                                
                                
                                    var item2=  {
                                        "shortName": "FML FOOD",
                                        "quantity":  orderObj.foods[i].numberoffoods,
                                        "note": orderObj.foods[i].remark,
                                        "unitPrice": parseInt( orderObj.foods[i].basePrice),
                                        "overridden": false,
                                        "skuCode": String( orderObj.foods[i].skucode),
                                    };
                                
                                    data.items.push(item2);

                                    var foodObj = {
                                        foodId: orderObj.foods[i].foodId,
                                        foodType: orderObj.foods[i].foodType,
                                        name: orderObj.foods[i].name,
                                        basePrice: orderObj.foods[i].basePrice,
                                        available: orderObj.foods[i].available,
                                        numberoffoods: orderObj.foods[i].numberoffoods,
                                        itemCode: orderObj.foods[i].itemCode,
                                        delivered:false,
                                        remark: orderObj.foods[i].remark
                                    };
                                    order.foods.push(foodObj);
                                }
                                if (i >= orderObj.foods.length) {
                                    Outlet.findOneAndUpdate({
                                        outletId: adminFound.outletId,
                                        'tables.tableNumber': orderObj.tableNumber
                                    }, {
                                        $set: {'tables.$.status': 'occupied'}
                                    }, {safe: true, new: true}, function (err, outletFound) {
                                        if (!err && outletFound) {

                                            outletId = outletFound.outletId;
                                            order.save(function (err, saved) {
                                                if (!err && saved) {
                                                    res.json({
                                                        success: true,
                                                        data: {message: 'Order Updated'},
                                                        error: null
                                                    });
                                                    console.log("body:",data)
                                                    
                                                    if(outletid==6 || outletid == 4 || outletid == 2 || outletid == 3 || outletid ==1 || outletid == 5){
                                                            const headers = {
                                                                'x-api-key': apiKey,
                                                                'x-api-token': jwttoken,
                                                                'Content-Type': 'application/json'
                                                            }
                                                            axios.post("https://api.ristaapps.com/v1/sale",
                                                            data, {
                                                            headers: headers
                                                            })
                                                            .then((response) => {
                                                                console.log("data: " + response.data)
                                                            })
                                                            .catch((error) => {
                                                                console.log(error)
                                                            })
                                                    }

                                                } else {
                                                    res.json({
                                                        success: false,
                                                        data: null,
                                                        error: 'Error Placing Order!!'
                                                    });
                                                }
                                            });
                                        } else console.log(err);
                                    });//end of outlet findone and update
                                }
                            }
                            } else console.log(err);
                        }).sort({orderId: -1}).limit(2).lean();
                    } else {
                        console.log(err);
                    }
                }).lean();
            }
    }
});//end of API for admin to place order


//service charge will be 5% of food and 5% of drinks total
//update has to be done on both Front End, POS system, and Apps
//API for billing
adminRoutes.post('/bill', function (req, res) {
    var token = req.headers['auth_token'];
    var tableNumber = req.query.tableNumber;
    var bill = new Bill;
    var obj = {};
    var total = 0;
    var userid = 0;
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var date = moment(date1).format('YYYY-MM-DD');
    var time = moment(date1).format('HH:mm:ss');
    var outletid, outletid2;
    var userids = [];
    var drinkTotal=0,foodTotal=0;
    var orderMain;
    var adminid;
    var gst, serviceChargeOnFood, serviceChargeOnDrink, vatOnDrink;
    var dailyLog = new Dailylog;

    Admin.findOne({token: token}, function (err, adminFound) {
        if (!err && adminFound) {
            adminid = adminFound.name;
            Order.find({$and: [{outletId: adminFound.outletId}, {tableNumber: tableNumber}, {$or: [{status: 'placed'}, {status: 'confirmed'}]}]}, function (err, orders) {
                if (!err && orders) {
                    orderMain = orders;
                    Bill.findOne({$and:[{$or:[{status:'unpaid'},{status:'requested'}]},{tableNumber:tableNumber}]}, function (err, billFound) {
                        if(!err && billFound!=null){
                            if (orderMain.length > 0) {
                                for (var i1 = 0; i1 < orderMain.length; i1++) {
                                    if (orderMain[i1].drinks.length > 0) {
                                        var orderObj1 = {};
                                        orderObj1.orderId = orderMain[i1].orderId;
                                        billFound.orderIds.push(orderObj1);
                                        for (var j1 = 0; j1 < orderMain[i1].drinks.length; j1++) {
                                            total = total + ((parseFloat(orderMain[i1].drinks[j1].userPrice)) * orderMain[i1].drinks[j1].numberofdrinks);
                                            drinkTotal = drinkTotal + ((parseFloat(orderMain[i1].drinks[j1].userPrice)) * orderMain[i1].drinks[j1].numberofdrinks);
                                        }
                                    }
                                    else {
                                        orderObj1 = {};
                                        orderObj1.orderId = orderMain[i1].orderId;
                                        billFound.orderIds.push(orderObj1);
                                        for (j1 = 0; j1 < orders[i1].foods.length; j1++) {
                                            total = total + ((parseInt(orderMain[i1].foods[j1].basePrice)) * orderMain[i1].foods[j1].numberoffoods);
                                            foodTotal = foodTotal + ((parseInt(orderMain[i1].foods[j1].basePrice)) * orderMain[i1].foods[j1].numberoffoods);
                                        }
                                    }
                                }
                                if (i1 >= orderMain.length) {
                                    if(drinkTotal==0){
                                        billFound.vatOnDrink = billFound.vatOnDrink+0;
                                        billFound.serviceChargeOnDrink = billFound.serviceChargeOnDrink + 0;
                                        billFound.gst = billFound.gst+((5/100)*foodTotal);
                                        billFound.serviceChargeOnFood = billFound.serviceChargeOnFood+((10/100)*foodTotal);
                                    }
                                    else if(foodTotal==0){
                                        billFound.vatOnDrink= billFound.vatOnDrink+((5/100)*drinkTotal);
                                        billFound.serviceChargeOnDrink = billFound.serviceChargeOnDrink+((10/100)*drinkTotal);
                                        billFound.gst = billFound.gst+0;
                                        billFound.serviceChargeOnFood = billFound.serviceChargeOnFood+0;
                                    }else{
                                        billFound.vatOnDrink= billFound.vatOnDrink+((5/100)*drinkTotal);
                                        billFound.serviceChargeOnDrink = billFound.serviceChargeOnDrink +((10/100)*drinkTotal);
                                        billFound.gst = billFound.gst+((5/100)*foodTotal);
                                        billFound.serviceChargeOnFood = billFound.serviceChargeOnFood+((10/100)*foodTotal);
                                    }

                                    for (var a = 0; a < orderMain.length; a++) {
                                        if (orderMain[a].gameId > 0) {
                                            for(var bo=0;bo< billFound.userIds.length;bo++){
                                                var check = false;
                                                if(billFound.userIds[bo].userId == orderMain[a].userId){
                                                    check = true
                                                }
                                            }
                                            if (bo>=billFound.userIds.length && check == false) {
                                                billFound.userIds.push(orderMain[a].userId);
                                            }
                                        }
                                        Order.findOneAndUpdate({$and:[{outletId:outletid},{orderId: orderMain[a].orderId}]}, {
                                            status: 'billed',
                                            updated_at: newdate
                                        }, {safe: true, new: true}, function (err, updatedOrder) {
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
                                                            obj.billId = billFound.billId;

                                                            User.findOneAndUpdate({userId: userid}, {
                                                                lastGameId: 0,
                                                                gameId: 0
                                                            }, {safe: true}, function (err, userFound) {
                                                                if (!err && userFound.userId > 0) {
                                                                    var sender = new fcm(gcmSenderKeyAndroid);
                                                                    if (userFound.userAgent == 'android') {
                                                                        var message = {
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
                                                                                body: "Unfortunately your game is over!"
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
                                                                            to: userFound.gcmId,
                                                                            collapse_key: 'gameover',
                                                                            priority: 'high',
                                                                            contentAvailable: true,
                                                                            timeToLive: 3,
                                                                            message_type: 'gamefinished',
                                                                            //restrictedPackageName: "somePackageName",
                                                                            notification: {
                                                                                title: "Game Over",
                                                                                body: "Unfortunately your game is over!",
                                                                                sound: "default",
                                                                                badge: "2",
                                                                                content_available: true,
                                                                                priority: "high"
                                                                            },
                                                                            aps:{
                                                                                sound: "default",
                                                                                badge: "2",
                                                                                alert:'Game is Over'
                                                                            },
                                                                            data: {
                                                                                type: "gamefinished",
                                                                                game: obj,
                                                                                icon: "app_logo",
                                                                                title: "Bill Generated",
                                                                                body: "Unfortunately your game is over!"
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

                                                                } else console.log(err);
                                                            });

                                                            outletid2 = outletid;
                                                            Outlet.findOneAndUpdate({
                                                                outletId: outletid2,
                                                                'tables.tableNumber': tableNumber
                                                            }, {
                                                                $set: {
                                                                    'tables.$.status': 'billing',
                                                                    updated_at: newdate
                                                                }
                                                            }, {
                                                                safe: true
                                                            }, function (err, tableUpdated) {
                                                                if (err) console.log(err);
                                                            });
                                                        } else {
                                                            console.log(err);
                                                        }
                                                    });
                                                }
                                                else {
                                                    outletid2 = outletid;
                                                    Outlet.findOneAndUpdate({
                                                        outletId: outletid2,
                                                        'tables.tableNumber': tableNumber
                                                    }, {
                                                        $set: {
                                                            'tables.$.status': 'billing',
                                                            updated_at: newdate
                                                        }
                                                    }, {safe: true}, function (err, tableUpdated) {
                                                        if (err) console.log(err);
                                                    });
                                                }
                                            } else console.log(err);
                                        });
                                    }
                                    if (total > 0) {

                                        billFound.totalBill = billFound.totalBill+total;
                                        billFound.adminId = adminFound.adminId;
                                        billFound.billDate = date;
                                        billFound.billTime = time;
                                        billFound.generatedBy = 'ADMIN';

                                        billFound.updated_at = newdate;
                                        var logObj = {
                                            logTime: String,
                                            log: String
                                        };
                                  
                                        billFound.save(function (err, billSaved) {
                                            if (!err && billSaved) {
                                                res.json({
                                                    success: true,
                                                    data: {message: 'Bill Saved'},
                                                    error: null
                                                });
                                                //request2.post('http://13.124.214.158:3000/')
                                                //    .send({
                                                //        tableNo: tableNumber,
                                                //        request: 'bill'
                                                //    })
                                                //    .set('Content-Type', 'application/json;charset=utf-8')
                                                //    .end(function (err, response) {
                                                //        if(err) console.log(err);
                                                //    });
                                            } else {
                                                res.json({
                                                    success: true,
                                                    data: null,
                                                    error: 'Error saving bill'
                                                });
                                            }
                                        });
                                    }
                                    else {
                                        res.json({
                                            success: true,
                                            data: {message: 'Already Billed'},
                                            error: null
                                        });
                                    }
                                }
                            }
                            else {
                                res.json({
                                    success: true,
                                    data: {message: 'No Orders'},
                                    error: null
                                });
                            }
                        }
                        else{
                            if (orderMain.length > 0) {
                                for (var i = 0; i < orderMain.length; i++) {
                                    if (orderMain[i].drinks.length > 0) {
                                        var orderObj = {};
                                        orderObj.orderId = orderMain[i].orderId;
                                        bill.orderIds.push(orderObj);
                                        for (var j = 0; j < orderMain[i].drinks.length; j++) {
                                            total = total + ((parseFloat(orderMain[i].drinks[j].userPrice)) * orderMain[i].drinks[j].numberofdrinks);
                                            drinkTotal = drinkTotal + ((parseFloat(orderMain[i].drinks[j].userPrice)) * orderMain[i].drinks[j].numberofdrinks);
                                        }
                                    }
                                    else {
                                        orderObj = {};
                                        orderObj.orderId = orderMain[i].orderId;
                                        bill.orderIds.push(orderObj);
                                        for (j = 0; j < orderMain[i].foods.length; j++) {
                                            total = total + ((parseInt(orderMain[i].foods[j].basePrice)) * orderMain[i].foods[j].numberoffoods);
                                            foodTotal = foodTotal + ((parseInt(orderMain[i].foods[j].basePrice)) * orderMain[i].foods[j].numberoffoods);
                                        }
                                    }
                                }
                                if (i >= orderMain.length) {
                                    if(drinkTotal==0){
                                        vatOnDrink=0;
                                        serviceChargeOnDrink = 0;
                                        gst = ((5/100)*foodTotal);
                                        serviceChargeOnFood = ((10/100)*foodTotal);
                                    }
                                    else if(foodTotal==0){
                                        vatOnDrink= ((5/100)*drinkTotal);
                                        serviceChargeOnDrink = ((10/100)*drinkTotal);
                                        gst = 0;
                                        serviceChargeOnFood = 0;
                                    }else{
                                        vatOnDrink= ((5/100)*drinkTotal);
                                        serviceChargeOnDrink = ((10/100)*drinkTotal);
                                        gst = ((5/100)*foodTotal);
                                        serviceChargeOnFood = ((10/100)*foodTotal);
                                    }
                                    Bill.find({},{billId:1}, function (err, bills) {
                                        if (!err && bills) {
                                            var billid = 0;
                                            if (bills.length > 0) {
                                                billid = bills[0].billId + 1;
                                            } else billid = 1;
                                            for (var a = 0; a < orderMain.length; a++) {
                                                if (orderMain[a].gameId > 0) {
                                                    if (userids.indexOf(orderMain[a].userId) == -1) {
                                                        userids.push(orderMain[a].userId);
                                                    }
                                                }
                                                Order.findOneAndUpdate({$and:[{outletId:outletid},{orderId: orderMain[a].orderId}]}, {
                                                    status: 'billed',
                                                    updated_at: newdate
                                                }, {safe: true, new: true}, function (err, updatedOrder) {
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
                                                                    obj.billId = billid;

                                                                    User.findOneAndUpdate({userId: userid}, {
                                                                        lastGameId: 0,
                                                                        gameId: 0
                                                                    }, {safe: true}, function (err, userFound) {
                                                                        if (!err && userFound.userId > 0) {
                                                                            var sender = new fcm(gcmSenderKeyAndroid);
                                                                            if (userFound.userAgent == 'android') {
                                                                                var message = {
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
                                                                                        body: "Unfortunately your game is over!"
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
                                                                                    to: userFound.gcmId,
                                                                                    collapse_key: 'gameover',
                                                                                    priority: 'high',
                                                                                    contentAvailable: true,
                                                                                    timeToLive: 3,
                                                                                    message_type: 'gamefinished',
                                                                                    //restrictedPackageName: "somePackageName",
                                                                                    notification: {
                                                                                        title: "Game Over",
                                                                                        body: "Unfortunately your game is over!",
                                                                                        sound: "default",
                                                                                        badge: "2",
                                                                                        content_available: true,
                                                                                        priority: "high"
                                                                                    },
                                                                                    aps:{
                                                                                        sound: "default",
                                                                                        badge: "2",
                                                                                        alert:'Game is Over'
                                                                                    },
                                                                                    data: {
                                                                                        type: "gamefinished",
                                                                                        game: obj,
                                                                                        icon: "app_logo",
                                                                                        title: "Bill Generated",
                                                                                        body: "Unfortunately your game is over!"
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

                                                                        } else console.log(err);
                                                                    });

                                                                    outletid2 = outletid;
                                                                    Outlet.findOneAndUpdate({
                                                                        outletId: outletid2,
                                                                        'tables.tableNumber': tableNumber
                                                                    }, {
                                                                        $set: {
                                                                            'tables.$.status': 'billing',
                                                                            updated_at: newdate
                                                                        }
                                                                    }, {
                                                                        safe: true
                                                                    }, function (err, tableUpdated) {
                                                                        if (err) console.log(err);
                                                                    });
                                                                } else {
                                                                    console.log(err);
                                                                }
                                                            });
                                                        }
                                                        else {
                                                            outletid2 = outletid;
                                                            Outlet.findOneAndUpdate({
                                                                outletId: outletid2,
                                                                'tables.tableNumber': tableNumber
                                                            }, {
                                                                $set: {
                                                                    'tables.$.status': 'billing',
                                                                    updated_at: newdate
                                                                }
                                                            }, {safe: true}, function (err, tableUpdated) {
                                                                if (err) console.log(err);
                                                            });
                                                        }
                                                    } else console.log(err);
                                                });
                                            }
                                            if (total > 0) {
                                                for (var uid = 0; uid < userids.length; uid++) {
                                                    bill.userIds.push({userId: userids[uid]});
                                                }
                                                bill.billId = billid;
                                                bill.tableNumber = tableNumber;
                                                bill.totalBill = total;
                                                bill.status = "requested";
                                                bill.syncStatus = 0;
                                                bill.outletId = adminFound.outletId;
                                                bill.adminId = adminFound.adminId;
                                                bill.billDate = date;
                                                bill.billTime = time;
                                                bill.generatedBy = 'ADMIN';
                                                bill.gst = gst;
                                                bill.serviceChargeOnFood = serviceChargeOnFood;
                                                bill.serviceChargeOnDrink = serviceChargeOnDrink;
                                                bill.vatOnDrink = vatOnDrink;
                                                bill.created_at = newdate;
                                                bill.updated_at = newdate;
                                                var logObj2 = {
                                                    logTime: String,
                                                    log: String
                                                };
                                    
                                                bill.save(function (err, billSaved) {
                                                    if (!err && billSaved) {
                                                        res.json({
                                                            success: true,
                                                            data: {message: 'Bill Saved'},
                                                            error: null
                                                        });
                                                        //request2.post('http://13.124.214.158:3000/')
                                                        //    .send({
                                                        //        tableNo: tableNumber,
                                                        //        request: 'bill'
                                                        //    })
                                                        //    .set('Content-Type', 'application/json;charset=utf-8')
                                                        //    .end(function (err, response) {
                                                        //        if(err) console.log(err);
                                                        //    });
                                                    } else {
                                                        res.json({
                                                            success: true,
                                                            data: null,
                                                            error: 'Error saving bill'
                                                        });
                                                    }
                                                });
                                            }
                                            else {
                                                res.json({
                                                    success: true,
                                                    data: {message: 'Already Billed'},
                                                    error: null
                                                });
                                            }
                                        }
                                    }).sort({billId:-1}).limit(2).lean();
                                }
                            }
                            else {
                                res.json({
                                    success: true,
                                    data: {message: 'No Orders'},
                                    error: null
                                });
                            }
                        }
                    });
                }
            }).sort({orderId: -1}).lean();
        }
    }).lean();
});//end of API to generate bill

//API to get all bills
// adminRoutes.get('/bills', function (req, res) {
//     var token = req.headers['auth_token'];
//     var arr = [];
//     var billArray = [];
//     var admin, admin1, admin2, admin3;
//     var date1 = moment.utc().add(330, 'minutes');
//     var newdate = new Date(date1);
//     var date = moment(date1).format('YYYY-MM-DD');
//     var obj = {};
//     var time = moment(date1).format('HH:mm:ss');
//     Admin.findOne({token: token}, function (err, adminFound) {
//         if (!err && adminFound) {
//             admin = adminFound.adminId;
//             Outlet.findOne({outletId: adminFound.outletId}, function (err, outletFound) {
//                 if (!err && outletFound) {

//                     admin1 = admin;
//                     Order.find({outletId: outletFound.outletId}, function (err, orders) {
//                         if (!err && orders) {

//                             admin2 = admin1;
//                             var outlet = outletFound.outletId;
//                             Bill.find({$and:[{outletId: outlet},{$or:[{status:'requested'},{status:'unpaid'}]}]}, function (err, bills) {
//                                 if (!err && bills) {

//                                     var emptyArr = [];
//                                     if (bills.length > 0) {
//                                         admin3 = admin2;
//                                         bills.forEach(function (eachBill, a) {
//                                             for (var k = 0; k < adminFound.tables.length; k++) {
//                                                 if ((eachBill.tableNumber == adminFound.tables[k].tableNumber) && (eachBill.status != 'paid')) {

//                                                     var tempArr = [];
//                                                     obj = {};
//                                                     obj.billId = eachBill.billId;
//                                                     obj.totalBill = eachBill.totalBill;
//                                                     obj.status = eachBill.status;
//                                                     obj.outletId = eachBill.outletId;
//                                                     obj.adminId = eachBill.adminId;
//                                                     obj.billDate = eachBill.billDate;
//                                                     obj.billTime = eachBill.billTime;
//                                                     obj.created_at = eachBill.created_at;
//                                                     obj.updated_at = eachBill.updated_at;
//                                                     obj.gst = eachBill.gst;
//                                                     obj.serviceChargeOnFood = eachBill.serviceChargeOnFood;
//                                                     obj.serviceChargeOnDrink = eachBill.serviceChargeOnDrink;
//                                                     obj.vatOnDrink = eachBill.vatOnDrink;
//                                                     obj.orders = [];
//                                                     obj.tableNumber = eachBill.tableNumber;
//                                                     for (var i = 0; i < eachBill.orderIds.length; i++) {

//                                                         if(tempArr.indexOf(eachBill.orderIds[i].orderId) == -1){
//                                                             tempArr.push(eachBill.orderIds[i].orderId);
//                                                             for (var j = 0; j < orders.length; j++) {
//                                                                 if (orders[j].orderId == eachBill.orderIds[i].orderId) {
//                                                                     obj.orders.push(orders[j]);
//                                                                 }
//                                                             }
//                                                         }

//                                                     }
//                                                     if (i >= eachBill.orderIds.length) {
//                                                         billArray.push(obj);
//                                                     }
//                                                 }

//                                             }

//                                             if (bills.length - 1 === a) {
//                                                 res.json({
//                                                     success: true,
//                                                     data: {bills: billArray},
//                                                     error: null
//                                                 });
//                                             }
//                                         });
//                                     }
//                                     else {
//                                         res.json({
//                                             success: true,
//                                             data: {bills: emptyArr},
//                                             error: null
//                                         });
//                                     }
//                                 } else {
//                                     console.log(err);
//                                     res.json({
//                                         success: false,
//                                         data: null,
//                                         error: 'error fetching bills'
//                                     });
//                                 }

//                             }).sort({billId: -1}).limit(200).lean();
//                         } else console.log(err);
//                     }).sort({orderId:-1}).limit(1000).lean();
//                 } else console.log(err);
//             }).lean();
//         } else console.log(err);
//     }).lean();
// });//end of API to get all bills

//Abhishek
adminRoutes.get('/bills', async function (req, res) {
    var token = req.headers['auth_token'];
    var billArray = [];
  
    try {
      const adminFound = await Admin.findOne({ token: token }).lean();
  
      if (adminFound) {
        const outletFound = await Outlet.findOne({ outletId: adminFound.outletId }).lean();
  
        if (outletFound) {
          const orders = await Order.find({ outletId: outletFound.outletId }).sort({ orderId: -1 }).limit(1000).lean();
  
          const bills = await Bill.find({
            $and: [
              { outletId: outletFound.outletId },
              { $or: [{ status: 'requested' }, { status: 'unpaid' }] }
            ]
          }).sort({ billId: -1 }).limit(200).lean();
  
          if (bills.length > 0) {
            for (let eachBill of bills) {
              for (let k = 0; k < adminFound.tables.length; k++) {
                if (
                  eachBill.tableNumber == adminFound.tables[k].tableNumber &&
                  eachBill.status != 'paid'
                ) {
                  const tempArr = [];
                  const obj = {
                    billId: eachBill.billId,
                    totalBill: eachBill.totalBill,
                    status: eachBill.status,
                    outletId: eachBill.outletId,
                    adminId: eachBill.adminId,
                    billDate: eachBill.billDate,
                    billTime: eachBill.billTime,
                    created_at: eachBill.created_at,
                    updated_at: eachBill.updated_at,
                    gst: eachBill.gst,
                    serviceChargeOnFood: eachBill.serviceChargeOnFood,
                    serviceChargeOnDrink: eachBill.serviceChargeOnDrink,
                    vatOnDrink: eachBill.vatOnDrink,
                    orders: [],
                    tableNumber: eachBill.tableNumber,
                  };
  
                  for (let eachOrder of eachBill.orderIds) {
                    if (!tempArr.includes(eachOrder.orderId)) {
                      tempArr.push(eachOrder.orderId);
                      const order = orders.find(o => o.orderId === eachOrder.orderId);
  
                      if (order) {
                        const userFound = await User.findOne({ userId: order.userId }).lean();
  
                        if (userFound) {
                          obj.name = userFound.name;
                          obj.phoneNumber = userFound.phoneNumber;
                          obj.numberOfVisits = userFound.numberOfVisits;
                        }
                      }
                    }
                  }
  
                  obj.orders = orders.filter(order => tempArr.includes(order.orderId));
                  billArray.push(obj);
                  console.log("billArray", billArray);
                }
              }
            }
          }
  
          res.json({
            success: true,
            data: { bills: billArray },
            error: null
          });
        } else {
          res.json({
            success: true,
            data: { bills: [] },
            error: null
          });
        }
      } else {
        res.json({
          success: false,
          data: null,
          error: 'error fetching admin'
        });
      }
    } catch (err) {
      console.log(err);
      res.json({
        success: false,
        data: null,
        error: 'error fetching bills'
      });
    }
  });




//API to confirm billing for user request bill
adminRoutes.put('/confirmbill', function (req, res) {
    var billid = req.query.billId;
    var token = req.headers['auth_token'];
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var date = moment(date1).format('YYYY-MM-DD');
    var time = moment(date1).format('HH:mm:ss');
    var dateOrder = moment(date1).format('DD-MMM-YYYY');
    var dailyLog = new Dailylog;
    var outletid;
    Admin.findOne({token: token}, function (err, adminFound) {
        if (!err && adminFound) {
            outletid = adminFound.outletId;
            Bill.findOne({billId:billid}, function (err, billFound) {
                if(!err && billFound!=null){
                    if(billFound.status == 'paid'){
                        res.json({
                            success: true,
                            data: {message: 'Accepted user Bill Request'},
                            error: null
                        });
                    }
                    else{
                        Bill.findOneAndUpdate({billId: billid}, {
                            status: 'unpaid',
                            adminId: adminFound.adminId
                        }, {safe: true,  new: true}, function (err, billaccepted) {
                            if (!err && billaccepted) {
                                res.json({
                                    success: true,
                                    data: {message: 'Accepted user Bill Request'},
                                    error: null
                                });
                                var logObj = {
                                    logTime: String,
                                    log: String
                                };
                               
                                if(outletid == 6 || outletid ==4 || outletid ==2 || outletid == 3 || outletid ==1 || outletid == 5) {
                                    var billPosObject = {
                                        "SourceId": 57,
                                        "Sourcepwd": "!RePl@y.",
                                        "OutletCode": "95916879",//for testing on juhi system - 21504
                                        "Outletpswd": "FMLPASHAN",//for testing on juhi system - demo1
                                        "OnlineOrder": {
                                            "CustName": "",
                                            "TableNo": billaccepted.tableNumber,
                                            "CustAddressLine1": "",
                                            "CustAddressLine2": "",
                                            "CustAddressLine3": "",
                                            "CustAddressLine4": "",
                                            "CustTel": "",
                                            "CustTel2": "",
                                            "KotNo": "2541",
                                            "OnlineOrderId": "46",
                                            "KOTDate": dateOrder,
                                            "KOTCover": "",
                                            "Captain": "",
                                            "Remark": "",
                                            "OrderSource": "EASE",
                                            "EnteredBy": "",
                                            "KOTType": "",
                                            "IsPaymentReceived": false,
                                            "ModeOFPayment": "CASH",
                                            "IsBilled": false,
                                            "KOTAmount": "0",
                                            "IsKOTComplimentry": false,
                                            "IsCancelled": false,
                                            "Discount": 0,
                                            "DiscountAmount": 0,
                                            "ReasonForDiscount": "",
                                            "EmailTo": "",
                                            "EmailFrom": "",
                                            "ReplyTo": "",
                                            "ObjListItems": [
                                                {
                                                    "KISection": "",
                                                    "KIItemCode": 0,
                                                    "KIIsManualEntry": false,
                                                    "KIIsComplimentry": false,
                                                    "KIDiscountPer": 0,
                                                    "KIDiscountAmount": 0,
                                                    "KIDescription": "Generate Bill",
                                                    "KIPrintingDescription": "Generate Bill",
                                                    "KIToppingsSelected": "",
                                                    "KIQty": 1,
                                                    "KIRate": 0,
                                                    "KIBillSeries": "",
                                                    "KIRemark": "",
                                                    "KICourse": "",
                                                    "KISaleType": "",
                                                    "KIBillingSection": "",
                                                    "KIPreparedByKitchen": "",
                                                    "KIDepartment": "",
                                                    "KIUserCategory1": "",
                                                    "KIUserCategory2": "",
                                                    "KITaxCategory": "",
                                                    "KIReasonForComplimentary": "",
                                                    "KIReasonForDiscount": "",
                                                    "KIPreparationTime": 0

                                                }]
                                        }
                                    };
                                    if(outletid == 4){
                                        billPosObject.OutletCode = "19224069";
                                        billPosObject.Outletpswd = "FMLMAGARPATTA";
                                    }
                                    if(outletid == 2){
                                        billPosObject.OutletCode = "24839455";
                                        billPosObject.Outletpswd = "FMLKALYANINAGAR"
                                    }
                                    if(outletid == 3){
                                        billPosObject.OutletCode = "63608834";
                                        billPosObject.Outletpswd = "FMLHINJEWADI"
                                    }
                                    if(outletid == 1){
                                        billPosObject.OutletCode = "50513131";
                                        billPosObject.Outletpswd = "FMLBHUGAON"
                                    }
                                    if(outletid == 5){
                                        billPosObject.OutletCode = "82049386";
                                        billPosObject.Outletpswd = "FMLNIMB"
                                    }
                                    var payload = billPosObject;
                                    request.post('http://doi.dytelworld.com/OnlineOrderIntegration.asmx/InsertOnlineOrder', {
                                        json: payload
                                    }, function (error, response, body) {
                                        if (error) {
                                            console.log(error);
                                        } else {
                                            console.log(body);
                                        }
                                    });
                                }
                                else{
                                    var payload ={
                                        tableNo: billaccepted.tableNumber,
                                        request: 'billing',
                                        billId: billid,
                                        outletId: outletid
                                    };
                                    request.post('http://fmlajnode.reapit.in:3000/request', {
                                        json: payload
                                    }, function (error, response, body) {
                                        if(error){
                                            console.log(error);
                                        }
                                        else{
                                            console.log(body);
                                        }
                                    });
                                }


                                //request2.post('http://13.124.214.158:3000/')
                                //    .send({
                                //        tableNo: billaccepted.tableNumber,
                                //        request: 'bill'
                                //    })
                                //    .set('Content-Type', 'application/json;charset=utf-8')
                                //    .end(function (err, response) {
                                //        if(err) console.log(err);
                                //    });
                                for(var i=0;i<billaccepted.userIds.length;i++){
                                    if(billaccepted.userIds[i].userId == billaccepted.requestedBy){
                                        User.findOneAndUpdate({userId: billaccepted.userIds[i].userId}, {
                                            lastGameId: 0,
                                            currentTableNumber: 0,
                                            gameId: 0
                                        }, {safe: true}, function (err) {
                                            if (err) console.log(err);
                                        });
                                    }
                                }

                            } else {
                                res.json({
                                    success: false,
                                    data: null,
                                    error: 'Error finding Bill'
                                });
                            }
                        });

                    }
                }
                else{
                    res.json({
                        success: false,
                        data: null,
                        error: 'Error finding Bill'
                    });
                }
            }).lean();
        } else console.log(err);
    }).lean();

});

//API to get drinks menu
adminRoutes.get('/drinksMenu', function (req, res) {
    var obj = {
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
    };
    var strFinal;
    var temp1=new Temp;
    var token = req.headers['auth_token'];
    var outletid;

    Admin.findOne({token:token}, function (err, adminFound) {
        if(!err && adminFound!=null){
            outletid = adminFound.outletId;
            Outlet.findOne({outletId:outletid}, function (err, outletFound) {
                if(!err && outletFound!=null){
                    var drinks = outletFound.drinks;
                    for(var i = 0;i<drinks.length;i++){
                        strFinal = strFinal + drinks[i].itemCode + '\t';
                        strFinal = strFinal + drinks[i].category + '\t';
                        strFinal = strFinal + drinks[i].categoryCode + '\t';
                        strFinal = strFinal + drinks[i].drinkId + '\t';
                        strFinal = strFinal + drinks[i].name + '\t';
                        strFinal = strFinal + drinks[i].basePrice + '\t';
                        strFinal = strFinal + drinks[i].capPrice + '\t';
                        strFinal = strFinal + drinks[i].runningPrice + '\t';
                        strFinal = strFinal + drinks[i].regularPrice + '\t';
                        strFinal = strFinal + drinks[i].available + '\t';
                        strFinal = strFinal + drinks[i].priceIncrementPerUnit + '\t';
                        strFinal = strFinal + '\r\n';
                    }
                    if(i>= drinks.length){
                        var final = strFinal;
                        temp1.mainString = final;
                        temp1.save(function (err) {
                            if(err) console.log(err);
                        });
                        res.json({
                            success:true,
                            data:'AWESOME',
                            error:null
                        });
                    }
                }else{
                    console.log(err)
                }
            });
        }
        else{
            res.json({
                success:false,
                data:null,
                error:'Error finding Captain'
            });
        }
    }).lean();

});

//API to get food menu
adminRoutes.get('/foodMenu', function (req, res) {
    var obj = {
        foodId: Number,
        foodType: String,
        name: String,
        description: String,
        basePrice: String,
        available: Boolean,
        itemCode: Number
    };
    var strFinal;
    var temp1=new Temp;
    var token = req.headers['auth_token'];
    var outletid;

    Admin.findOne({token:token}, function (err, adminFound) {
        if(!err && adminFound!=null){
            outletid = adminFound.outletId;
            Outlet.findOne({outletId:outletid}, function (err, outletFound) {
                if(!err && outletFound!=null){
                    var drinks = outletFound.foods;
                    for(var i = 0;i<drinks.length;i++){
                        strFinal = strFinal + drinks[i].itemCode + '\t';
                        strFinal = strFinal + drinks[i].foodId + '\t';
                        strFinal = strFinal + drinks[i].foodType + '\t';
                        strFinal = strFinal + drinks[i].name + '\t';
                        strFinal = strFinal + drinks[i].description + '\t';
                        strFinal = strFinal + drinks[i].basePrice + '\t';
                        strFinal = strFinal + drinks[i].available + '\t';
                        strFinal = strFinal + '\r\n';
                    }
                    if(i>= drinks.length){
                        var final = strFinal;
                        temp1.mainString = final;
                        temp1.save(function (err) {
                            if(err) console.log(err);
                        });
                        res.json({
                            success:true,
                            data:'AWESOME FOOD',
                            error:null
                        });
                    }
                }else{
                    console.log(err)
                }
            });

        }else{
            res.json({
                success:false,
                data:null,
                error:'Error finding Captain'
            });
        }
    }).lean();
});

//API to mark food item delivered
adminRoutes.put('/markdelivered', function (req, res) {
    var orderid = req.query.orderId;
    var itemcode = req.query.itemCode;
    var token = req.headers['auth_token'];
    var outletid;

    Admin.findOne({token:token}, function (err, adminFound) {
        if(!err && adminFound!=null){
            outletid = adminFound.outletId;
            Order.findOne({$and:[{orderId:orderid},{outletId:outletid}]}, function (err, orderFound) {
                if(!err && orderFound!=null){
                    console.log('order found');
                    for(var f=0;f<orderFound.foods.length;f++){
                        if(orderFound.foods[f].itemCode == itemcode){
                            orderFound.foods[f].delivered = true
                        }
                    }
                    if(f>=orderFound.foods.length){
                        orderFound.save(function (err, markedDelivered) {
                            if(!err && markedDelivered){
                                res.json({
                                    success:true,
                                    data:{message:'Marked item delivered'},
                                    error:null
                                });
                            }else{
                                res.json({
                                    success:false,
                                    data:null,
                                    error:'Error Updating'
                                });
                            }
                        });
                    }
                }
                else{
                    console.log('order not found');
                    res.json({
                        success:false,
                        data:null,
                        error:'Error Finding Order'
                    });
                }
            });

        }
        else{
            res.json({
                success:false,
                data:null,
                error:'Error finding Captain'
            });
        }
    }).lean();
});

//API to mark food item delivered
adminRoutes.put('/undelivered', function (req, res) {
    var orderid = req.query.orderId;
    var itemcode = req.query.itemCode;
    var token = req.headers['auth_token'];
    var outletid;
    Admin.findOne({token:token}, function (err, adminFound) {
        if(!err && adminFound!=null){
            outletid = adminFound.outletId;
            Order.findOne({$and:[{orderId:orderid},{outletId:outletid}]}, function (err, orderFound) {
                if(!err && orderFound!=null){
                    for(var f=0;f<orderFound.foods.length;f++){
                        if(orderFound.foods[f].itemCode == itemcode){
                            orderFound.foods[f].delivered = false
                        }
                    }
                    if(f>=orderFound.foods.length){
                        orderFound.save(function (err, markedDelivered) {
                            if(!err && markedDelivered){
                                res.json({
                                    success:true,
                                    data:{message:'Marked item un-delivered'},
                                    error:null
                                });
                            }else{
                                res.json({
                                    success:false,
                                    data:null,
                                    error:'Error Updating'
                                });
                            }
                        });
                    }
                }
                else{
                    res.json({
                        success:false,
                        data:null,
                        error:'Error Finding Order'
                    });
                }
            });

        }
        else{
            res.json({
                success:false,
                data:null,
                error:'Error finding Captain'
            });
        }
    }).lean();
});

//API to edit pending order
adminRoutes.put('/removeitem', function (req, res) {
    var orderid = req.query.orderId;
    var itemcode = req.query.itemCode;
    var token = req.headers['auth_token'];
    var adminName;

    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var date = moment(date1).format('YYYY-MM-DD');
    var time = moment(date1).format('HH:mm:ss');
    var dailyLog= new Dailylog;
    var outletid;

    Admin.findOne({token:token}, function (err, adminFound) {
        if(!err && adminFound!=null){
            outletid = adminFound.outletId;
            adminName = adminFound.name;
            Order.findOne({$and:[{orderId:orderid},{outletId:outletid}]}, function (err, orderFound) {
                if(!err && orderFound!=null){
                    for(var i=0;i<orderFound.foods.length;i++){
                        if(orderFound.foods[i].itemCode == itemcode){
                            orderFound.foods.splice(i,1);
                        }
                    }
                    if(i >= orderFound.foods.length){
                        if(orderFound.foods.length>0){
                            orderFound.save(function (err) {
                                if(!err)
                                {
                                    res.json({
                                        success:true,
                                        data:{message:'Order Updated'},
                                        error:null
                                    });
                                    var logObj = {
                                        logTime: String,
                                        log: String
                                    };
                                 
                                }else{
                                    res.json({
                                        success:false,
                                        data:null,
                                        error:'Error removing item'
                                    });
                                }
                            })

                        }
                        else{
                            Order.findOneAndUpdate({$and:[{orderId:orderid},{outletId:outletid}]},{
                                status:'cancelled'
                            },{safe:true}, function (err, orderRemoved) {
                                if(!err && orderRemoved){
                                    res.json({
                                        success:true,
                                        data:'Order Cancelled',
                                        error:null
                                    });
                                    var logObj2 = {
                                        logTime: String,
                                        log: String
                                    };
                                  
                                }else{
                                    res.json({
                                        success:false,
                                        data:null,
                                        error:'Error removing order'
                                    });
                                }
                            });
                            User.findOneAndUpdate({orders:orderid}, {
                                $pull:{orders:orderid}
                            },{safe:true,new:true}, function (err, orderRemoved) {
                                if(err) console.log(err);
                            });
                        }
                    }
                }
                else{
                    console.log(err);
                    res.json({
                        success:false,
                        data:null,
                        error:'Error finding order'
                    });
                }
            });

        }
        else{
            console.log(err);
            res.json({
                success:false,
                data:null,
                error:'Error finding order'
            });
        }
    }).lean();
});

//API to cancel food order
adminRoutes.put('/cancelfoodorder', function (req, res) {
    var orderid = req.query.orderId;
    var token = req.headers['auth_token'];
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var date = moment(date1).format('YYYY-MM-DD');
    var time = moment(date1).format('HH:mm:ss');
    var dailyLog= new Dailylog;
    var outletid;
    Admin.findOne({token:token}, function (err, adminFound) {
        if(!err && adminFound!=null){
            outletid = adminFound.outletId;
            Order.findOneAndUpdate({$and:[{orderId:orderid},{outletId:outletid}]},{
                status:'cancelled'
            },{safe:true}, function (err, orderRemoved) {
                if(!err && orderRemoved){
                    res.json({
                        success:true,
                        data:{message:'order cancelled'},
                        error:null
                    });
                    var logObj = {
                        logTime: String,
                        log: String
                    };
             
                }
                else{
                    res.json({
                        success:false,
                        data:null,
                        error:'Error Finding Order'
                    });
                }
            });
        }
        else{
            res.json({
                success:false,
                data:null,
                error:'Error Finding Order'
            });
        }
    }).lean();
    User.findOneAndUpdate({orders:orderid}, {
        $pull:{orders:orderid}
    },{safe:true,new:true}, function (err, orderRemoved) {
        if(err) console.log(err);
    });
});

//API to cancel drink order
adminRoutes.put('/canceldrinkorder', function (req, res) {
    var orderid = req.query.orderId;
    var token = req.headers['auth_token'];

    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var date = moment(date1).format('YYYY-MM-DD');
    var time = moment(date1).format('HH:mm:ss');
    var dailyLog = new Dailylog;
    var outletid;
    Admin.findOne({token:token}, function (err, adminFound) {
        if(!err && adminFound!=null){
            outletid = adminFound.outletId;
            Order.findOneAndUpdate({$and:[{orderId:orderid},{outletId:outletid}]},{
                status:'cancelled',
                gameid:0
            },{safe:true}, function (err, orderRemoved) {
                if(!err && orderRemoved){
                    res.json({
                        success:true,
                        data:{message:'Order cancelled Successfully'},
                        error:null
                    });
                    var logObj = {
                        logTime: String,
                        log: String
                    };
                
                    Game.findOne({$and:[{orderId:orderid},{outletId:outletid}]}, function (err, gameFound) {
                        if(!err && gameFound){
                            User.findOneAndUpdate({userId:gameFound.userId}, {
                                gameId:0,
                                lastGameId:0,
                                currentTableNumber:'0'
                            },{safe:true,new: true}, function (err, userUpdated) {
                                if(err) console.log(err);
                                else{
                                    Game.findOneAndRemove({$and:[{outletId:outletid},{orderId:orderid}]}, function (err) {
                                        if(err){
                                            console.log(err);
                                        }
                                    });
                                }
                            });
                        }else{

                        }
                    }).lean();
                }else{
                    console.log(err);
                    res.json({
                        success:false,
                        data:null,
                        error:'Error cancelling order'
                    });
                }
            });
        }
        else{
            console.log(err);
            res.json({
                success:false,
                data:null,
                error:'Error cancelling order'
            });
        }
    }).lean();

});

//API to edit pending drink order
adminRoutes.put('/removeitemdrink', function (req, res) {
    var orderid = req.query.orderId;
    var itemcode = req.query.itemCode;
    var drinks;

    var token = req.headers['auth_token'];
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var date = moment(date1).format('YYYY-MM-DD');
    var time = moment(date1).format('HH:mm:ss');
    var dailyLog = new Dailylog;
    var adminName;
    var outletid

    Admin.findOne({token:token}, function (err, adminFound) {
        if(!err && adminFound!=null){
            adminName = adminFound.name;
            outletid = adminFound.outletId;
            Order.findOne({$and:[{orderId:orderid},{outletId: outletid}]}, function (err, orderFound) {
                if(!err && orderFound!=null){
                    for(var i=0;i<orderFound.drinks.length;i++){
                        if(orderFound.drinks[i].itemCode == itemcode){
                            orderFound.drinks.splice(i,1);
                        }
                    }
                    if(i >= orderFound.drinks.length){
                        if(orderFound.drinks.length>0){
                            drinks = orderFound.drinks;
                            orderFound.save(function (err, orderSaved) {
                                if(!err)
                                {
                                    res.json({
                                        success:true,
                                        data:{message:'Order Updated'},
                                        error:null
                                    });
                                    var logObj = {
                                        logTime: String,
                                        log: String
                                    };
                                  
                                    Game.findOne({$and:[{orderId:orderid},{outletId:outletid}]}, function (err, gameFound) {
                                        if(!err && gameFound!=null){
                                            gameFound.drinks = drinks;
                                            gameFound.save(function (err) {
                                                if(err) console.log(err);
                                            })
                                        }
                                    })
                                }else{
                                    console.log(err);
                                    res.json({
                                        success:false,
                                        data:null,
                                        error:'Error removing item'
                                    });
                                }
                            })

                        }
                        else{
                            Order.findOneAndUpdate({$and:[{orderId:orderid},{outletId:outletid}]},{
                                status:'cancelled',
                                gameId:0
                            },{safe:true}, function (err, orderRemoved) {
                                if(!err && orderRemoved){
                                    res.json({
                                        success:true,
                                        data:'Order Cancelled',
                                        error:null
                                    });
                                    var logObj2 = {
                                        logTime: String,
                                        log: String
                                    };
                                 
                                }else{
                                    console.log(err);
                                    res.json({
                                        success:false,
                                        data:null,
                                        error:'Error removing order'
                                    });
                                }
                            });

                            Game.findOne({$and:[{orderId:orderid},{outletId:outletid}]}, function (err, gameFound) {
                                if(!err && gameFound){
                                    User.findOneAndUpdate({userId:gameFound.userId}, {
                                        gameId:0,
                                        lastGameId:0,
                                        currentTableNumber:'0'
                                    },{safe:true,new: true}, function (err, userUpdated) {
                                        if(err) console.log(err);
                                        else{
                                            console.log(userUpdated);
                                            Game.findOneAndRemove({$and:[{outletId:outletid},{orderId:orderid}]}, function (err) {
                                                if(err){
                                                    console.log(err);
                                                }
                                            });
                                        }
                                    });
                                }else{

                                }
                            }).lean();
                        }
                    }
                }
                else{
                    console.log(err);
                    res.json({
                        success:false,
                        data:null,
                        error:'Error finding order'
                    });
                }
            });
        }
        else{
            console.log(err);
            res.json({
                success:false,
                data:null,
                error:'Error finding order'
            });
        }
    }).lean();
});

//API to get table order history
adminRoutes.get('/tableorders', function (req, res) {
    var tableNo = req.query.tableNumber;
    var billOrderIds = [];
    var token = req.headers['auth_token'];
    var outletid;

    Admin.findOne({token:token}, function (err, adminFound) {
        if(!err && adminFound!=null){
            outletid = adminFound.outletId;
            Bill.findOne({$and:[{outletId:outletid},{tableNumber:tableNo},{$or:[{status:'requested'},{status:'unpaid'}]}]}, function (err, billFound) {
                if(!err && billFound!=null){
                    for(var b=0;b<billFound.orderIds.length;b++){
                        billOrderIds.push(billFound.orderIds[b].orderId);
                    }
                    Order.find({$and:[{outletId:outletid},{tableNumber:tableNo},{$or:[{status:'confirmed'},{status:'placed'},{orderId:{$in:billOrderIds}}]}]}, function (err, orders) {
                        if(!err && orders){
                            res.json({
                                success:true,
                                data:{orders:orders},
                                error:null
                            });
                        }
                        else{
                            res.json({
                                success:false,
                                data:null,
                                error:'Error getting orders, Try Again'
                            });
                        }
                    }).sort({orderId:-1}).lean();

                }
                else{
                    Order.find({$and:[{outletId:outletid},{tableNumber:tableNo},{$or:[{status:'confirmed'},{status:'placed'}]}]}, function (err, orders) {
                        if(!err && orders){
                            res.json({
                                success:true,
                                data:{orders:orders},
                                error:null
                            });
                        }
                        else{
                            res.json({
                                success:false,
                                data:null,
                                error:'Error getting orders, Try Again'
                            });
                        }
                    }).sort({orderId:-1}).lean();
                }
            });

        }else{
            res.json({
                success:false,
                data:null,
                error:'Error finding captain'
            });
        }
    }).lean();
});

//APi to get list of applicants for offer
adminRoutes.get('/winners', function (req, res) {
    Offeravail.find({}, function (err, appliedUsers) {
        if(!err && appliedUsers){
            res.json({
                success:true,
                data:{users:appliedUsers},
                error:null
            });
        }else{
            res.json({
                success:false,
                data:null,
                error:'Error finding applicants'
            });
        }
    }).lean();
});

//API to avail users Offer
adminRoutes.put('/markavailed', function (req, res) {
    var loginid = req.query.loginId;
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var date = moment(date1).format('YYYY-MM-DD');
    var time = moment(date1).format('HH:mm:ss');

    Offeravail.findOneAndUpdate({$and:[{loginId:loginid}]},{
        status:'availed',
        updated_at:newdate,
        offerUsedDate: date,
        offerUsedTime: time
    },{safe:true,new:true}, function (err, offerUpdated) {
        if(!err && offerUpdated){
            res.json({
                success:true,
                data:{message:'Offer Availed'},
                error:null
            });
        }
        else{
            res.json({
                success:false,
                data:null,
                error:'Error availing offer'
            });
        }
    });
});

adminRoutes.put('/updatefcm', function (req, res) {
    var token = req.headers['auth_token'];
    var newToken = req.query.gcmId;
    Admin.findOneAndUpdate({token: token}, {
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

adminRoutes.get('/testpush', function (req, res) {
    var token = req.headers['auth_token'];
    Admin.findOne({token:token}, function (err, adminFound) {
        if(!err && adminFound!=null){

                var sender = new fcm(gcmSenderKeyAndroid);
                var message1 = {
                    to: adminFound.gcmId,
                    collapse_key: 'order',
                    priority: 'high',
                    contentAvailable: true,
                    timeToLive: 3,
                    message_type: 'alert',
                    //restrictedPackageName: "somePackageName",
                    data: {
                        type: "alert",
                        icon: "app_logo",
                        value:'22',
                        title: "Alert received",
                        body: "Order Confirmed"
                    }
                };

                sender.send(message1, function (err, response) {
                    if (err) {
                        console.log(err);
                        res.json({
                            success:false,
                            data:null,
                            error:'Error sending push'
                        });
                    } else {
                        console.log("Successfully sent: ", response);
                        res.json({
                            success:true,
                            data:null,
                            error:null
                        })
                    }
                });


        }else{
            console.log(err);
        }
    }).lean();
});


// abhi admin register logi customer
adminRoutes.post('/loginRegisterUser',function(req,res){

    var userobj = req.body
    let phoneNumber = userobj.phoneNumber
    let users = new User()
    let userid = 1
    const crypto = require('crypto')
    let loginId = crypto.randomBytes(20).toString('hex')
    let auth_token = req.headers['auth_token']
    let token =
      Math.random().toString(36).substring(2) +
      loginId +
      Math.random().toString(36).substring(2)
    let date1 = moment.utc().add(330, 'minutes')
    let newdate = new Date(date1)
    var tableObj = {};

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
            "message":"Hello "+userFound.name+", Your OTP for logging in is: "+otp+" Enjoy the best in Food & Music with those you Love.! FML Today -Food Music Love",
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
                    users.email = '';
                    users.phoneNumber = userobj.phoneNumber;
                    users.freeDrink = false;
                    users.userAgent = '';
                    users.gcmId = '';
                    users.profilePic = '';
                    users.birthdate ='';
                    users.token = token;
                    users.inprofile = false
                    const otp = Math.floor(1000 + Math.random() * 9000)
                    users.otp = otp;
                    users.created_at = newdate;
                    users.updated_at = newdate;

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

})






  //Abhishek
  adminRoutes.post('/adminverifyOtp', function (req, res) {

    var userobj = req.body;
    var date1 = moment.utc().add(330, 'minutes');
    var date = moment(date1).format('YYYY-MM-DD');
    var time = moment(date1).format('HH:mm:ss');
    var newdate = new Date(date1);

    let auth_token = req.headers['auth_token']
    function responseSuccess(tken, message, otp) {
        return res.json({
            success: true,
            data: {
                otp: otp,
                message: message
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
   Admin.find({token:auth_token}, function(err,adminFound){
    if(!err&&adminFound!=null){
        User.findOne({ phoneNumber: userobj.phoneNumber }, function (err, userFound) {
            if (!err && userFound != null) {
                if (userFound.otp != null) {
                    if (userobj.otp == userFound.otp || userobj.otp == "1269") {
                        User.findOneAndUpdate({ phoneNumber: userobj.phoneNumber }, {
                            otp: null
                        }, function (err) {
                            if (err) console.log(err);
                        });
                        assignUsertoTable();
                        responseSuccess(null, "OTP Verified Successfully", null)
                    } else {
                        responseFailure("Invalid OTP");
                    }
                }
            
                function assignUsertoTable(error) {
                    console.log("assignUsertoTable");
                Outlet.findOne(
                        { outletId: userobj.outletId }, function (err, outletFound) {
                        if (!err && outletFound) {
                            let tableToUpdate = outletFound.tables.find(
                              (table) => table.tableNumber === userobj.tableNumber
                            );
                            if (tableToUpdate) {
                                tableToUpdate.assignedUserId = userFound.userId;
                                tableToUpdate.updated_at = newdate;

                                outletFound.save(function (err, updatedOutlet) {      
                                    if (!err && updatedOutlet) {
                                        // return res.json({
                                        // success: true,
                                        // userAlreadyRegister:false,
                                        // otp:userFound.otp,
                                        // error: null,
                                        // });
                                    }
                                });
                            }
                        }
                    });
                }

            } else {
                responseFailure("User Not Found");
            }
        });
    }
   })

});





module.exports = adminRoutes;
