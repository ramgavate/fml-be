/**
 * Created by ritej on 5/9/2017.
 */

//Library Inits
const express = require('express');
const mongoose = require('mongoose');
const fcm = require('fcm-node');
const moment = require('moment');
const moment1 = require('moment-timezone');
moment1.tz.setDefault('Asia/Kolkata');
const fs = require('fs');

//Model Objects for DB Queries
const Pos = require('../models/pos');
const Console = require('../models/console');
const Admin = require('../models/admin');
const User = require('../models/user');
const Outlet = require('../models/outlet');
const Bill = require('../models/bill');
const Order = require('../models/order');
const Config = require('../models/config');
const Category = require('../models/category');
const Foodcategory = require('../models/foodcategory');
const Event = require('../models/event');
const Offer = require('../models/offer');
const Game = require('../models/game');
const Fooddisplay = require('../models/fooddisplay');
const Feed = require('../models/feed');
const Music = require('../models/music');
const TableBooking = require('../models/tablebooking');
const Feedback = require('../models/feedback');
const Temp = require('../models/temp');
const Temp2 = require('../models/temp2');
const Tnc = require('../models/tnc');
const Gamevalue = require('../models/gamevalue');
const Dailylog = require('../models/dailylog');

const gcmSenderKeyAndroid = 'AAAALJErIRw:APA91bFY8TIKhiEf_7h5abk2chqhqg7YJB5-ePZj7_0466XN2M_JrE_qkNKpVkKvMxJQ9J2txwqvnPG52yxC1Vu2J2M_B7a0xYWBXMFr4BNwEULhQLdNR-EMgNkqOjjXvrG7cyAug1h_';

const posRoutes = express.Router();
const socket = require('../io').io();

//Middleware to verify token
posRoutes.use(function (req, res, next) {
    var postoken = req.headers['auth_token'];
    if (postoken) {
        // verifies secret and checks exp
        Pos.findOne({
            "token": postoken
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

//API to get outlet for pos
posRoutes.get('/outlets', function (req, res) {
    var token = req.headers['auth_token'];
    Pos.findOne({token: token}, function (err, posFound) {
        if (!err && posFound) {
            Outlet.findOne({outletId: posFound.outletId}, function (err, outlet) {
                if (!err && outlet) {
                    res.json({
                        success: true,
                        data: outlet,
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
                success: false,
                data: null,
                error: 'error finding pos'
            });
        }
    }).lean();
});

//API to get drink categories
posRoutes.get('/category', function (req, res) {
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
    }).sort({name: 1}).lean();
});//end of API to get categories

//API to get food categories
posRoutes.get('/foodcategory', function (req, res) {
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
    }).sort({name: 1}).lean();
});//end of API to get categories

//API to get tables
posRoutes.get('/tables', function (req, res) {
    var token = req.headers['auth_token'];
    var tableArray = [];
    Pos.findOne({token: token}, function (err, posFound) {
        if (!err && posFound) {
            Outlet.findOne({outletId: posFound.outletId}, function (err, outletFound) {
                if (!err && outletFound) {

                    for (var j = 0; j < outletFound.tables.length; j++) {
                        var obj = {};
                        obj.tableNumber = outletFound.tables[j].tableNumber;
                        obj.tableId = outletFound.tables[j].tableId;
                        obj.capacity = outletFound.tables[j].capacity;
                        obj.assigned = outletFound.tables[j].assigned;
                        obj.assignedAdmin = outletFound.tables[j].assignedAdmin;
                        obj.status = outletFound.tables[j].status;
                        obj.outletId = outletFound.outletId;
                        tableArray.push(obj);
                    }
                    if (j >= outletFound.tables.length) {
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
                        error: 'error finding outlet'
                    });
                }
            }).lean();
        } else {
            console.log(err);
            res.json({
                success: false,
                data: null,
                error: 'Cant find pos USER'
            });
        }
    }).lean();
});//

//API to get CONFIRMED tables
posRoutes.get('/confirmedtables', function (req, res) {
    var token = req.headers['auth_token'];
    var tableArray = [];
    Pos.findOne({token: token}, function (err, posFound) {
        if (!err && posFound) {
            Outlet.findOne({outletId: posFound.outletId}, function (err, outletFound) {
                if (!err && outletFound) {

                    for (var j = 0; j < outletFound.tables.length; j++) {
                        var obj = {};
                        if (outletFound.tables[j].status == 'occupied' || outletFound.tables[j].status == 'billing') {
                            obj.tableNumber = outletFound.tables[j].tableNumber;
                            obj.tableId = outletFound.tables[j].tableId;
                            obj.capacity = outletFound.tables[j].capacity;
                            obj.assigned = outletFound.tables[j].assigned;
                            obj.assignedAdmin = outletFound.tables[j].assignedAdmin;
                            obj.status = outletFound.tables[j].status;
                            obj.outletId = outletFound.outletId;
                            tableArray.push(obj);
                        }

                    }
                    if (j >= outletFound.tables.length) {
                        res.json({
                            success: true,
                            data: {tables: tableArray},
                            error: null
                        });
                    }
                } else console.log(err);
            }).lean();
        } else {
            console.log(err);
            res.json({
                success: false,
                data: null,
                error: 'Cant find pos USER'
            });
        }
    }).lean();
});

/*//API to get orders
posRoutes.get('/orders', function (req, res) {
    var tableNumber = req.query.tableNumber;
    var outletid;
    var token = req.headers['auth_token'];
    function sortFunctionOrders(a, b) {
        var name1, name2;
        name1 = a.orderId;
        name2 = b.orderId;
        return name1 > name2 ? -1 : 1;
    }
var billOrderIds =[];
    Pos.findOne({token:token}, function (err, posFound) {
        if(!err && posFound!=null){
            outletid = posFound.outletId;
            Bill.findOne({$and:[{outletId:outletid},{tableNumber:tableNumber},{$or:[{status:'unpaid'},{status:'requested'}]}]}, function (err, billFound) {
                if(!err && billFound){
                    for(var b=0;b<billFound.orderIds.length;b++){
                        billOrderIds.push(billFound.orderIds[b].orderId);
                    }
                    Category.find({}, function (err, categories) {
                        if (!err && categories) {
                            Foodcategory.find({}, function (err, foodCategories) {
                                if (!err && foodCategories) {
                                    Order.find({$and:[{outletId: outletid},{tableNumber:tableNumber},{$or:[{status:'confirmed'},{status:'placed'},{orderId:{$in:billOrderIds}}]}]}, function (err, ordersFound) {
                                        if (!err && ordersFound) {
                                            var orderArray = [];
                                            for (var j = 0; j < ordersFound.length; j++) {
                                                if(ordersFound[j].status!='cancelled'){
                                                    var order = {};
                                                    order.orderId = ordersFound[j].orderId;
                                                    order.outletId = ordersFound[j].outletId;
                                                    order.tableNumber = ordersFound[j].tableNumber;
                                                    order.status = ordersFound[j].status;
                                                    order.userId = ordersFound[j].userId;
                                                    order.adminId = ordersFound[j].adminId;
                                                    order.name = ordersFound[j].name;
                                                    order.orderType = ordersFound[j].type;
                                                    order.orderDate = ordersFound[j].orderDate;
                                                    order.orderTime = ordersFound[j].orderTime;
                                                    order.confirmTime = ordersFound[j].confirmTime;
                                                    order.created_at = ordersFound[j].created_at;
                                                    order.updated_at = ordersFound[j].updated_at;
                                                    order.syncStatus = 0;
                                                    order.drinks = [];
                                                    order.foods = [];
                                                    if (ordersFound[j].drinks.length > 0) {
                                                        for (var dr = 0; dr < ordersFound[j].drinks.length; dr++) {
                                                            var drObj = {};
                                                            drObj.userPrice = ordersFound[j].drinks[dr].userPrice;
                                                            drObj.numberofdrinks = ordersFound[j].drinks[dr].numberofdrinks;
                                                            drObj.drinkType = ordersFound[j].drinks[dr].drinkType;
                                                            drObj.category = ordersFound[j].drinks[dr].category;
                                                            drObj.drinkId = ordersFound[j].drinks[dr].drinkId;
                                                            drObj.name = ordersFound[j].drinks[dr].name;
                                                            drObj.basePrice = ordersFound[j].drinks[dr].basePrice;
                                                            drObj.capPrice = ordersFound[j].drinks[dr].capPrice;
                                                            drObj.runningPrice = ordersFound[j].drinks[dr].runningPrice;
                                                            drObj.available = ordersFound[j].drinks[dr].available;
                                                            drObj.demandRate = ordersFound[j].drinks[dr].demandRate;
                                                            drObj.demandLevel = ordersFound[j].drinks[dr].demandLevel;
                                                            drObj.priceIncrementPerUnit = ordersFound[j].drinks[dr].priceIncrementPerUnit;
                                                            drObj.status = ordersFound[j].drinks[dr].status;
                                                            drObj.itemCode = ordersFound[j].drinks[dr].itemCode;
                                                            drObj.regularPrice = ordersFound[j].drinks[dr].regularPrice;
                                                            drObj.priceVariable = ordersFound[j].drinks[dr].priceVariable;

                                                            for (var cat = 0; cat < categories.length; cat++) {
                                                                if (categories[cat].name == ordersFound[j].drinks[dr].drinkType) {
                                                                    drObj.drinkCategoryCode = categories[cat].id;
                                                                }
                                                            }
                                                            if (cat >= categories.length) {
                                                                order.drinks.push(drObj);
                                                            }
                                                        }
                                                        if (dr >= ordersFound[j].drinks.length) {
                                                            orderArray.push(order);
                                                        }
                                                    }
                                                    if (ordersFound[j].foods.length > 0) {
                                                        for (var fd = 0; fd < ordersFound[j].foods.length; fd++) {
                                                            var foodObj = {};
                                                            foodObj.available = ordersFound[j].foods[fd].available;
                                                            foodObj.basePrice = ordersFound[j].foods[fd].basePrice;
                                                            foodObj.foodId = ordersFound[j].foods[fd].foodId;
                                                            foodObj.itemCode = ordersFound[j].foods[fd].itemCode;
                                                            foodObj.foodType = ordersFound[j].foods[fd].foodType;
                                                            foodObj.name = ordersFound[j].foods[fd].name;
                                                            foodObj.numberoffoods = ordersFound[j].foods[fd].numberoffoods;
                                                            for (var fc = 0; fc < foodCategories.length; fc++) {
                                                                if (foodCategories[fc].name == ordersFound[j].foods[fd].foodType) {
                                                                    foodObj.foodCategoryCode = foodCategories[fc].id;
                                                                }
                                                            }
                                                            if (fc >= foodCategories.length) {
                                                                order.foods.push(foodObj);
                                                            }
                                                        }
                                                        if (fd >= ordersFound[j].foods.length) {
                                                            orderArray.push(order);
                                                        }
                                                    }
                                                }


                                            }
                                            if (j >= ordersFound.length) {
                                                orderArray.sort(sortFunctionOrders);
                                                res.json({
                                                    success: true,
                                                    data: {orders: orderArray},
                                                    error: null
                                                });
                                            }
                                        } else console.log(err);
                                    }).sort({orderId: -1}).lean();
                                } else console.log(err);
                            }).lean();
                        } else console.log(err);
                    }).lean();
                }
                else{
                    Category.find({}, function (err, categories) {
                        if (!err && categories) {
                            Foodcategory.find({}, function (err, foodCategories) {
                                if (!err && foodCategories) {
                                    Order.find({$and:[{outletId: outletid},{tableNumber:tableNumber}]}, function (err, ordersFound) {
                                        if (!err && ordersFound) {
                                            var orderArray = [];
                                            for (var j = 0; j < ordersFound.length; j++) {
                                                if (ordersFound[j].status == 'confirmed' || ordersFound[j].status == 'placed') {
                                                    var order = {};
                                                    order.orderId = ordersFound[j].orderId;
                                                    order.outletId = ordersFound[j].outletId;
                                                    order.tableNumber = ordersFound[j].tableNumber;
                                                    order.status = ordersFound[j].status;
                                                    order.userId = ordersFound[j].userId;
                                                    order.adminId = ordersFound[j].adminId;
                                                    order.name = ordersFound[j].name;
                                                    order.orderType = ordersFound[j].type;
                                                    order.orderDate = ordersFound[j].orderDate;
                                                    order.orderTime = ordersFound[j].orderTime;
                                                    order.confirmTime = ordersFound[j].confirmTime;
                                                    order.created_at = ordersFound[j].created_at;
                                                    order.updated_at = ordersFound[j].updated_at;
                                                    order.syncStatus = 0;
                                                    order.drinks = [];
                                                    order.foods = [];
                                                    if (ordersFound[j].drinks.length > 0) {
                                                        for (var dr = 0; dr < ordersFound[j].drinks.length; dr++) {
                                                            var drObj = {};
                                                            drObj.userPrice = ordersFound[j].drinks[dr].userPrice;
                                                            drObj.numberofdrinks = ordersFound[j].drinks[dr].numberofdrinks;
                                                            drObj.drinkType = ordersFound[j].drinks[dr].drinkType;
                                                            drObj.category = ordersFound[j].drinks[dr].category;
                                                            drObj.drinkId = ordersFound[j].drinks[dr].drinkId;
                                                            drObj.name = ordersFound[j].drinks[dr].name;
                                                            drObj.basePrice = ordersFound[j].drinks[dr].basePrice;
                                                            drObj.capPrice = ordersFound[j].drinks[dr].capPrice;
                                                            drObj.runningPrice = ordersFound[j].drinks[dr].runningPrice;
                                                            drObj.available = ordersFound[j].drinks[dr].available;
                                                            drObj.demandRate = ordersFound[j].drinks[dr].demandRate;
                                                            drObj.demandLevel = ordersFound[j].drinks[dr].demandLevel;
                                                            drObj.priceIncrementPerUnit = ordersFound[j].drinks[dr].priceIncrementPerUnit;
                                                            drObj.status = ordersFound[j].drinks[dr].status;
                                                            drObj.itemCode = ordersFound[j].drinks[dr].itemCode;
                                                            drObj.regularPrice = ordersFound[j].drinks[dr].regularPrice;
                                                            drObj.priceVariable = ordersFound[j].drinks[dr].priceVariable;

                                                            for (var cat = 0; cat < categories.length; cat++) {
                                                                if (categories[cat].name == ordersFound[j].drinks[dr].drinkType) {
                                                                    drObj.drinkCategoryCode = categories[cat].id;
                                                                }
                                                            }
                                                            if (cat >= categories.length) {
                                                                order.drinks.push(drObj);
                                                            }
                                                        }
                                                        if (dr >= ordersFound[j].drinks.length) {
                                                            orderArray.push(order);
                                                        }
                                                    }
                                                    if (ordersFound[j].foods.length > 0) {
                                                        for (var fd = 0; fd < ordersFound[j].foods.length; fd++) {
                                                            var foodObj = {};
                                                            foodObj.available = ordersFound[j].foods[fd].available;
                                                            foodObj.basePrice = ordersFound[j].foods[fd].basePrice;
                                                            foodObj.foodId = ordersFound[j].foods[fd].foodId;
                                                            foodObj.itemCode = ordersFound[j].foods[fd].itemCode;
                                                            foodObj.foodType = ordersFound[j].foods[fd].foodType;
                                                            foodObj.name = ordersFound[j].foods[fd].name;
                                                            foodObj.numberoffoods = ordersFound[j].foods[fd].numberoffoods;
                                                            for (var fc = 0; fc < foodCategories.length; fc++) {
                                                                if (foodCategories[fc].name == ordersFound[j].foods[fd].foodType) {
                                                                    foodObj.foodCategoryCode = foodCategories[fc].id;
                                                                }
                                                            }
                                                            if (fc >= foodCategories.length) {
                                                                order.foods.push(foodObj);
                                                            }
                                                        }
                                                        if (fd >= ordersFound[j].foods.length) {
                                                            orderArray.push(order);
                                                        }
                                                    }
                                                }
                                            }
                                            if (j >= ordersFound.length) {
                                                orderArray.sort(sortFunctionOrders);
                                                res.json({
                                                    success: true,
                                                    data: {orders: orderArray},
                                                    error: null
                                                });
                                            }
                                        } else console.log(err);
                                    }).sort({orderId: -1}).lean();
                                } else console.log(err);
                            }).lean();
                        } else console.log(err);
                    }).lean();
                }
            });

        }
        else{
            res.json({
                success:false,
                data:null,
                error:'Error finding POS user'
            });
        }
    }).lean();

});*/

//API to place Order POS
posRoutes.post('/placeorder', function (req, res) {
    var token = req.headers['auth_token'];
    var orderObj = req.body;
    var order = new Order;
    var newCount = 0;
    var numberOfDrinks = 0;
    var demandRate;
    var runningPrice;
    var newPrice = 0;
    var outletId = Number;
    var temp2;
    var demandLevel = 0;
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var date = moment(date1).format('YYYY-MM-DD');
    var time = moment(date1).format('HH:mm:ss');
    var drinkItemCodes = [];
    var drinkIdArray = [];
    var totalNumber = 0;
    var socket_id = [];
    var dailyLog = new Dailylog;
    var outletid;

    if(orderObj.drinks.length>0){
        Pos.findOne({token: token}, function (err, adminFound) {
            if (!err && adminFound) {
                outletId = adminFound.outletId;
                outletid = adminFound.outletId;
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
                        order.status = 'confirmed';
                        order.userId = 0;
                        order.adminId = 0;
                        order.name = "POS - " + adminFound.userName;
                        order.orderType = "POS";
                        order.orderDate = date;
                        order.orderTime = time;
                        order.confirmTime = time;
                        order.created_at = newdate;
                        order.updated_at = newdate;
                        order.syncStatus = 1;
                        order.drinks = [];
                        var logObj2 = {
                            logTime: String,
                            log: String
                        };
                 

                        for (var i = 0; i < orderObj.drinks.length; i++) {
                            order.drinks.push(orderObj.drinks[i]);
                            drinkItemCodes.push(orderObj.drinks[i].itemCode);
                            numberOfDrinks = orderObj.drinks[i].numberofdrinks;
                            totalNumber = totalNumber + numberOfDrinks;
                        }
                        if (i >= orderObj.drinks.length) {
                            order.save(function (err, saved) {
                               if(!err && saved){
                                   res.json({
                                       success: true,
                                       data: {orderId: saved.orderId},
                                       error: null
                                   });
                               }
                            });

                                Outlet.findOneAndUpdate({
                                outletId: adminFound.outletId,
                                'tables.tableNumber': orderObj.tableNumber
                            }, {
                                $set: {'tables.$.status': 'occupied'}
                            }, {safe: true, new: true}, function (err, outletFound) {
                                if (!err && outletFound!=null) {
                                    outletId = outletFound.outletId;
                                    for (var g = 0; g < outletFound.drinks.length; g++) {
                                        totalNumber = totalNumber + outletFound.drinks[g].demandLevel;
                                    }

                                    if (g >= outletFound.drinks.length) {
                                        outletid = orderObj.outletId;
                                        for (var q = 0; q < orderObj.drinks.length; q++) {
                                            drinkIdArray.push(orderObj.drinks[q].itemCode);
                                            numberOfDrinks = orderObj.drinks[q].numberofdrinks;
                                        }
                                        if (q >= orderObj.drinks.length) {

                                            orderObj.drinks.forEach(function (eachOrderDrink, a) {
                                                outletFound.drinks.forEach(function (eachDrinkOutlet, b) {
                                                    if (eachDrinkOutlet.itemCode == eachOrderDrink.itemCode) {
                                                        newPrice = parseInt(eachOrderDrink.runningPrice) + ((eachOrderDrink.priceIncrementPerUnit) * (parseInt(eachOrderDrink.numberofdrinks)));
                                                        numberOfDrinks = eachOrderDrink.numberofdrinks;

                                                        if (newPrice > parseInt(eachDrinkOutlet.capPrice)) {
                                                            runningPrice = eachDrinkOutlet.capPrice;
                                                        }
                                                        else runningPrice = newPrice.toString();
                                                        var tempArr = [];
                                                        if(eachDrinkOutlet.priceVariable == true){
                                                            eachDrinkOutlet.runningPrice = runningPrice;
                                                        }
                                                    }
                                                });
                                                if(orderObj.drinks.length-1 == a){
                                                    outletFound.save(function (err, outletSaved) {
                                                        if (!err && outletSaved) {

                                                            Game.find({$and: [{'drinks.itemCode': {$in: drinkIdArray}}, {orderDate: orderObj.orderDate}]}, function (err, games) {
                                                                if (!err && games) {
                                                                    Outlet.findOne({outletId: orderObj.outletId}, function (err, outletFound) {
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
                                                                                    if (games[z].gameId == orderObj.gameId) {
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
                                        /*for (var a = 0; a < orderObj.drinks.length; a++) {
                                            for (var b = 0; b < outletFound.drinks.length; b++) {
                                                if (outletFound.drinks[b].name == orderObj.drinks[a].name) {
                                                    newPrice = parseInt(orderObj.drinks[a].runningPrice) + ((orderObj.drinks[a].priceIncrementPerUnit) * (parseInt(orderObj.drinks[a].numberofdrinks)));
                                                    demandLevel = outletFound.drinks[b].demandLevel;
                                                    newCount = demandLevel + orderObj.drinks[a].numberofdrinks;
                                                    demandRate = ((100 / totalNumber) * newCount);
                                                    numberOfDrinks = orderObj.drinks[a].numberofdrinks;
                                                    if (newPrice > parseInt(outletFound.drinks[b].capPrice)) {
                                                        runningPrice = outletFound.drinks[b].capPrice;
                                                    }
                                                    else runningPrice = newPrice.toString();

                                                    var tempCount = 0;
                                                    var demandRate2;
                                                    for (var t = 0; t < outletFound.drinks.length; t++) {
                                                        tempCount = outletFound.drinks[t].demandLevel;
                                                        if (outletFound.drinks[b].name == outletFound.drinks[t].name) {
                                                            outletFound.drinks[t].demandRate = parseInt(demandRate);
                                                            outletFound.drinks[t].demandLevel = newCount;
                                                            outletFound.drinks[t].runningPrice = runningPrice;
                                                        } else {
                                                            demandRate2 = ((100 / totalNumber) * tempCount);
                                                            outletFound.drinks[t].demandRate = parseInt(demandRate2);
                                                            outletFound.updated_at = newdate;
                                                        }

                                                    }
                                                }
                                            }
                                        }
                                        if (a == orderObj.drinks.length) {
                                            order.save(function (err, saved) {
                                                if (!err && saved) {
                                                    outletFound.save(function (err, outletSaved) {
                                                        if (!err && outletSaved) {
                                                            res.json({
                                                                success: true,
                                                                data: {orderId: saved.orderId},
                                                                error: null
                                                            });
                                                            Game.find({$and: [{'drinks.itemCode': {$in: drinkItemCodes}}, {orderDate: date}]}, function (err, games) {
                                                                if (!err && games) {
                                                                    Outlet.findOne({outletId: outletSaved.outletId}, function (err, outletFound) {
                                                                        if (!err && outletFound) {
                                                                            for (var z = 0; z < games.length; z++) {
                                                                                for (var z1 = 0; z1 < games[z].drinks.length; z1++) {
                                                                                    if (drinkIdArray.indexOf(games[z].drinks[z1].itemCode) > -1) {
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
                                                                                            User.findOne({userId: games[temp2].userId}, function (err, userFound) {
                                                                                                if (!err && userFound) {
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
                                                                                                    var sender = new fcm(gcmSenderKeyAndroid);
                                                                                                    if (userFound.userAgent == 'android') {
                                                                                                        var message1 = {
                                                                                                            to: userFound.gcmId,
                                                                                                            collapse_key: 'demo',
                                                                                                            priority: 'high',
                                                                                                            contentAvailable: true,
                                                                                                            timeToLive: 3,
                                                                                                            //restrictedPackageName: "somePackageName",
                                                                                                            data: {
                                                                                                                type: "orderstatus",
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
                                                                                                                type: "orderstatus",
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

                                                                                                } else console.log(err);
                                                                                            });

                                                                                        } else console.log(err);
                                                                                    });
                                                                                }
                                                                            }
                                                                            if (z >= games.length) {

                                                                            }
                                                                        } else console.log(err);
                                                                    });

                                                                } else console.log(err);
                                                            });
                                                            var socktObj = {
                                                                arr:[],
                                                                outletId: outletId
                                                            };
                                                            for(var sd=0;sd<outletSaved.drinks.length;sd++){
                                                                if(drinkItemCodes.indexOf(outletSaved.drinks[sd].itemCode)>-1){
                                                                    socktObj.arr.push(outletSaved.drinks[sd]);
                                                                }
                                                            }
                                                                if(sd>=outletSaved.drinks.length){
                                                                    socket.emit('pricechanged', socktObj);
                                                                }


                                                        } else{
                                                            console.log(err);
                                                            res.json({
                                                                success: false,
                                                                data: null,
                                                                error: 'Error Placing Order!!'
                                                            });
                                                        }
                                                    });




                                                } else {
                                                    res.json({
                                                        success: false,
                                                        data: null,
                                                        error: 'Error Placing Order!!'
                                                    });
                                                }
                                            });
                                        }*/
                                    }
                                } else {
                                    console.log(err);
                                }
                            });//end of outlet findone and update
                        }
                    } else{
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
        });
    }else{
        res.json({
            success:false,
            data:null,
            error:'Error in incoming order for DRINKS!!!!'
        });
    }
});//end of API for admin to place order

//API to place Order Admin
posRoutes.post('/placefoodorder', function (req, res) {
    var token = req.headers['auth_token'];
    var orderObj = req.body;
    var order = new Order;
    var outletId = Number;
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var date = moment(date1).format('YYYY-MM-DD');
    var time = moment(date1).format('HH:mm:ss');
    var dailyLog = new Dailylog;
    Pos.findOne({token: token}, function (err, adminFound) {
        if (!err && adminFound) {
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
                    order.status = 'confirmed';
                    order.name = "POS - " + adminFound.userName;
                    order.userId = 0;
                    order.adminId = 0;
                    order.orderType = "POS";
                    order.orderDate = date;
                    order.orderTime = time;
                    order.confirmTime = time;
                    order.created_at = newdate;
                    order.updated_at = newdate;
                    order.syncStatus = 1;
                    order.foods = [];
                    order.drinks = [];
                    var logObj2 = {
                        logTime: String,
                        log: String
                    };
        
                    for (var i = 0; i < orderObj.foods.length; i++) {
                        var foodObj = {
                            foodId: orderObj.foods[i].foodId,
                            foodType: orderObj.foods[i].foodType,
                            name: orderObj.foods[i].name,
                            basePrice: orderObj.foods[i].basePrice,
                            available: orderObj.foods[i].available,
                            numberoffoods: orderObj.foods[i].numberoffoods,
                            itemCode: orderObj.foods[i].itemCode,
                            delivered:false,
                            remark: ''
                        };
                        order.foods.push(foodObj);
                    }
                    if (i >= orderObj.foods.length) {
                        Admin.findOne({$and: [{outletId: adminFound.outletId}, {'tables.tableNumber': orderObj.tableNumber}]}, function (err, admin) {
                            if (!err && admin) {
                                order.adminId = admin.adminId;
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
                                                    data: {orderId: orderid},
                                                    error: null
                                                });
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
                            } else {
                                console.log(err);
                            }
                        })

                    }
                }
                else{
                    console.log(err);
                    res.json({
                        success:false,
                        data:null,
                        error:'no orders'
                    });
                }
            }).sort({orderId: -1}).limit(2).lean();
        } else {
            console.log(err);
            res.json({
                success:false,
                data:null,
                error:'invalid access'
            });
        }
    });
});//end of API for admin to place order

//API for billing
posRoutes.post('/bill', function (req, res) {


    var tableNumber = req.query.tableNumber;
    var bill = new Bill;
    var obj = {};
    var total = 0;
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var date = moment(date1).format('YYYY-MM-DD');
    var time = moment(date1).format('HH:mm:ss');
    var outletid, outletid2;
    var userid = 0;
    var token = req.headers['auth_token'];
    var drinkTotal=0,foodTotal=0;
    var userids = [];
    var ordersMain;
    var billid;
    var oid;
    var gst, serviceChargeOnFood, serviceChargeOnDrink, vatOnDrink;
    var dailyLog = new Dailylog;
    Pos.findOne({token: token}, function (err, adminFound) {
        if (!err && adminFound!=null) {
            oid = adminFound.outletId;
            Order.find({$and: [{outletId: adminFound.outletId}, {tableNumber: tableNumber}, {$or: [{status: 'placed'}, {status: 'confirmed'}]}]}, function (err, orders) {
                if (!err && orders) {
                    ordersMain=orders;
                    Bill.findOne({$and:[{$or:[{status:'unpaid'},{status:'requested'}]},{tableNumber:tableNumber},{outletId:oid}]}, function (err, billFound) {
                        if(!err && billFound!=null){
                            billid = billFound.billId;
                            if (ordersMain.length > 0) {

                                for (var i1 = 0; i1 < ordersMain.length; i1++) {

                                    if (ordersMain[i1].drinks.length > 0) {
                                        var orderObj1 = {};
                                        orderObj1.orderId = ordersMain[i1].orderId;
                                        billFound.orderIds.push(orderObj1);
                                        for (var j1 = 0; j1 < ordersMain[i1].drinks.length; j1++) {
                                            total = total + ((parseFloat(ordersMain[i1].drinks[j1].userPrice)) * ordersMain[i1].drinks[j1].numberofdrinks);
                                            drinkTotal = drinkTotal + ((parseFloat(ordersMain[i1].drinks[j1].userPrice)) * ordersMain[i1].drinks[j1].numberofdrinks);
                                        }
                                    }
                                    else {
                                        orderObj = {};
                                        orderObj.orderId = ordersMain[i1].orderId;
                                        billFound.orderIds.push(orderObj);
                                        for (j1 = 0; j1 < ordersMain[i1].foods.length; j1++) {
                                            total = total + ((parseInt(ordersMain[i1].foods[j1].basePrice)) * ordersMain[i1].foods[j1].numberoffoods);
                                            foodTotal = foodTotal + ((parseInt(ordersMain[i1].foods[j1].basePrice)) * ordersMain[i1].foods[j1].numberoffoods);
                                        }
                                    }

                                }
                                if (i1 >= ordersMain.length) {
                                    if(drinkTotal==0){
                                        billFound.vatOnDrink=billFound.vatOnDrink+0;
                                        billFound.serviceChargeOnDrink = billFound.serviceChargeOnDrink +0;
                                        billFound.gst = billFound.gst+((5/100)*foodTotal);
                                        billFound.serviceChargeOnFood = billFound.serviceChargeOnFood +((10/100)*foodTotal);

                                    }
                                    else if(foodTotal==0){
                                        billFound.vatOnDrink= billFound.vatOnDrink+((5/100)*drinkTotal);
                                        billFound.serviceChargeOnDrink = billFound.serviceChargeOnDrink +((10/100)*drinkTotal);
                                        billFound.gst = billFound.gst +0;
                                        billFound.serviceChargeOnFood = billFound.serviceChargeOnFood+0;

                                    }else{
                                        billFound.vatOnDrink= billFound.vatOnDrink+((5/100)*drinkTotal);
                                        billFound.serviceChargeOnDrink = billFound.serviceChargeOnDrink +((10/100)*drinkTotal);
                                        billFound.gst = billFound.gst+((5/100)*foodTotal);
                                        billFound.serviceChargeOnFood = billFound.serviceChargeOnFood+((10/100)*foodTotal);
                                    }

                                    ordersMain.forEach(function (eachOrder) {
                                        if (eachOrder.gameId > 0) {
                                            if (userids.indexOf(eachOrder.userId) == -1) {
                                                userids.push(eachOrder.userId);
                                            }
                                        }
                                        var orderObjectId = eachOrder._id.toString();
                                        Order.findByIdAndUpdate(orderObjectId, {
                                            status: 'billed',
                                            updated_at: newdate
                                        }, {safe: true,  new: true}, function (err, updatedOrder) {
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

                                                            outletid2 = outletid;
                                                            Outlet.findOneAndUpdate({
                                                                outletId: outletid2,
                                                                'tables.tableNumber': tableNumber
                                                            }, {
                                                                $set: {
                                                                    'tables.$.status': 'vacant',
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
                                                            'tables.$.status': 'vacant',
                                                            updated_at: newdate
                                                        }
                                                    }, {safe: true}, function (err, tableUpdated) {
                                                        if (err) console.log(err);
                                                    });
                                                }
                                            } else console.log(err);
                                        });
                                    });
/*
                                    for (var a = 0; a < ordersMain.length; a++) {
                                        if (ordersMain[a].gameId > 0) {
                                            if (userids.indexOf(ordersMain[a].userId) == -1) {
                                                userids.push(ordersMain[a].userId);
                                            }
                                        }
                                        Order.findOneAndUpdate({orderId: ordersMain[a].orderId}, {
                                            status: 'billed',
                                            updated_at: newdate
                                        }, {safe: true,  new: true}, function (err, updatedOrder) {
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
*/
                                    if (total > 0) {
                                        billFound.totalBill = billFound.totalBill +total;
                                        billFound.status = "paid";
                                        billFound.syncStatus = 1;
                                        billFound.adminId = adminFound.adminId;
                                        billFound.billDate = date;
                                        billFound.billTime = time;
                                        billFound.generatedBy = 'POS';
                                        billFound.updated_at = newdate;
                                        var logObj2 = {
                                            logTime: String,
                                            log: String
                                        };
                               
                                        billFound.save(function (err, billSaved) {
                                            if (!err && billSaved) {

                                                res.json({
                                                    success: true,
                                                    data: {billId: billSaved.billId},
                                                    error: null
                                                });


                                            } else {
                                                res.json({
                                                    success: false,
                                                    data: null,
                                                    error: 'Error saving bill'
                                                });
                                            }
                                        });

                                    }
                                    else {
                                        billFound.status = 'paid';
                                        billFound.save(function (err) {
                                            if(err) console.log(err);
                                        });
                                        res.json({
                                            success: true,
                                            data: {billId: billFound.billId},
                                            error: null
                                        });
                                    }
                                }
                            }
                            else {
                                billFound.status = 'paid';
                                billFound.save(function (err) {
                                    if(err) console.log(err);
                                });
                                res.json({
                                    success: true,
                                    data: {billId: billFound.billId},
                                    error: null
                                });
                            }
                        }
                        else{
                            if (ordersMain.length > 0) {

                                for (var i = 0; i < ordersMain.length; i++) {
                                    if (ordersMain[i].drinks.length > 0) {
                                        var orderObj = {};
                                        orderObj.orderId = ordersMain[i].orderId;
                                        bill.orderIds.push(orderObj);
                                        for (var j = 0; j < ordersMain[i].drinks.length; j++) {
                                            total = total + ((parseFloat(ordersMain[i].drinks[j].userPrice)) * ordersMain[i].drinks[j].numberofdrinks);
                                            drinkTotal = drinkTotal + ((parseFloat(ordersMain[i].drinks[j].userPrice)) * ordersMain[i].drinks[j].numberofdrinks);
                                        }
                                    }
                                    else {
                                        orderObj = {};
                                        orderObj.orderId = ordersMain[i].orderId;
                                        bill.orderIds.push(orderObj);
                                        for (j = 0; j < ordersMain[i].foods.length; j++) {
                                            total = total + ((parseInt(ordersMain[i].foods[j].basePrice)) * ordersMain[i].foods[j].numberoffoods);
                                            foodTotal = foodTotal + ((parseInt(ordersMain[i].foods[j].basePrice)) * ordersMain[i].foods[j].numberoffoods);
                                        }
                                    }

                                }
                                if (i >= ordersMain.length) {
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
                                            ordersMain.forEach(function (eachOrder) {
                                                if (eachOrder.gameId > 0) {
                                                    if (userids.indexOf(eachOrder.userId) == -1) {
                                                        userids.push(eachOrder.userId);
                                                    }
                                                }
                                                Order.findByIdAndUpdate(eachOrder._id.toString(), {
                                                    status: 'billed',
                                                    updated_at: newdate
                                                }, {safe: true,  new: true}, function (err, updatedOrder) {
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
                                                                    }, {safe: true}, function (err, userFound) {
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

                                                                    outletid2 = outletid;
                                                                    Outlet.findOneAndUpdate({
                                                                        outletId: outletid2,
                                                                        'tables.tableNumber': tableNumber
                                                                    }, {
                                                                        $set: {
                                                                            'tables.$.status': 'vacant',
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
                                                                    'tables.$.status': 'vacant',
                                                                    updated_at: newdate
                                                                }
                                                            }, {safe: true}, function (err, tableUpdated) {
                                                                if (err) console.log(err);
                                                            });
                                                        }
                                                    } else console.log(err);
                                                });
                                            });

/*
                                            for (var a = 0; a < ordersMain.length; a++) {
                                                if (ordersMain[a].gameId > 0) {
                                                    if (userids.indexOf(ordersMain[a].userId) == -1) {
                                                        userids.push(ordersMain[a].userId);
                                                    }
                                                }
                                                Order.findOneAndUpdate({orderId: ordersMain[a].orderId}, {
                                                    status: 'billed',
                                                    updated_at: newdate
                                                }, {safe: true,  new: true}, function (err, updatedOrder) {
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
*/
                                            if (total > 0) {
                                                for (var uid = 0; uid < userids.length; uid++) {
                                                    bill.userIds.push({userId: userids[uid]});
                                                }
                                                bill.billId = billid;
                                                bill.tableNumber = tableNumber;
                                                bill.totalBill = total;
                                                bill.status = "paid";
                                                bill.syncStatus = 1;
                                                bill.outletId = adminFound.outletId;
                                                bill.adminId = adminFound.adminId;
                                                bill.billDate = date;
                                                bill.billTime = time;
                                                bill.generatedBy = 'POS';
                                                bill.gst = gst;
                                                bill.serviceChargeOnFood = serviceChargeOnFood;
                                                bill.serviceChargeOnDrink = serviceChargeOnDrink;
                                                bill.vatOnDrink = vatOnDrink;
                                                bill.created_at = newdate;
                                                bill.updated_at = newdate;
                                                var logObj = {
                                                    logTime: String,
                                                    log: String
                                                };
                                     
                                                Outlet.findOneAndUpdate({
                                                    outletId: bill.outletId,
                                                    'tables.tableNumber': bill.tableNumber
                                                }, {
                                                    $set: {'tables.$.status': 'vacant'}
                                                }, {safe: true,new:true}, function (err, outletUpdated) {
                                                    if (err) console.log(err);
                                                });
                                                bill.save(function (err, billSaved) {
                                                    if (!err && billSaved) {

                                                        res.json({
                                                            success: true,
                                                            data: {billId: billid},
                                                            error: null
                                                        });


                                                    } else {
                                                        res.json({
                                                            success: false,
                                                            data: null,
                                                            error: 'Error saving bill'
                                                        });
                                                    }
                                                });

                                            }
                                            else {
                                                res.json({
                                                    success: false,
                                                    data: null,
                                                    error: 'Error saving bill'
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
                else{
                    res.json({
                        success: false,
                        data: null,
                        error: 'error fetching orders'
                    });
                }
            }).sort({orderId: -1}).lean();
        }else{
            res.json({
                success: false,
                data: null,
                error: 'error finding POS'
            });
        }

    }).lean();
});//end of API to generate bill

//API to get all bills
posRoutes.get('/unpaidbills', function (req, res) {
    var token = req.headers['auth_token'];
    var arr = [];
    var billArray = [];
    var outletid = 0;
    var tableNumber = req.query.tableNumber;
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var date = moment(date1).format('YYYY-MM-DD');
    var time = moment(date1).format('HH:mm:ss');
    Category.find({}, function (err, categories) {
        if (!err && categories) {
            Foodcategory.find({}, function (err, foodCategories) {
                if (!err && foodCategories) {
                    Pos.findOne({token: token}, function (err, posFound) {
                        if (!err && posFound) {
                            outletid = posFound.outletId;
                            Order.find({outletId: outletid}, function (err, orders) {
                                if (!err && orders) {
                                    Bill.find({$and: [{outletId: outletid}, {status: 'unpaid'}, {tableNumber: tableNumber}]}, function (err, bills) {
                                        if (!err && bills) {
                                            var emptyArr = [];
                                            if (bills.length > 0) {
                                                for (var b = 0; b < bills.length; b++) {
                                                    //if (bills[b].tableNumber == tableNumber && bills[b].status == 'unpaid') {
                                                    var obj = {};
                                                    obj.billId = bills[b].billId;
                                                    obj.totalBill = String(bills[b].totalBill);
                                                    obj.status = bills[b].status;
                                                    obj.outletId = bills[b].outletId;
                                                    obj.adminId = bills[b].adminId;
                                                    obj.userIds = bills[b].userIds;
                                                    obj.billDate = bills[b].billDate;
                                                    obj.billTime = bills[b].billTime;
                                                    obj.gst = String(bills[b].gst);
                                                    obj.serviceChargeOnDrink = String(bills[b].serviceChargeOnDrink);
                                                    obj.serviceChargeOnFood = String(bills[b].serviceChargeOnFood);
                                                    obj.vatOnDrink = String(bills[b].vatOnDrink);
                                                    obj.created_at = bills[b].created_at;
                                                    obj.updated_at = bills[b].updated_at;
                                                    obj.orders = [];
                                                    obj.tableNumber = bills[b].tableNumber;
                                                    for (var i = 0; i < bills[b].orderIds.length; i++) {
                                                        for (var j = 0; j < orders.length; j++) {
                                                            if (orders[j].orderId == bills[b].orderIds[i].orderId) {
                                                                var order = {};
                                                                order.orderId = orders[j].orderId;
                                                                order.outletId = orders[j].outletId;
                                                                order.tableNumber = orders[j].tableNumber;
                                                                order.status = orders[j].status;
                                                                order.userId = orders[j].userId;
                                                                order.adminId = orders[j].adminId;
                                                                order.name = orders[j].name;
                                                                order.orderType = orders[j].type;
                                                                order.orderDate = orders[j].orderDate;
                                                                order.orderTime = orders[j].orderTime;
                                                                order.confirmTime = orders[j].confirmTime;
                                                                order.created_at = orders[j].created_at;
                                                                order.updated_at = orders[j].updated_at;
                                                                order.syncStatus = 0;
                                                                order.drinks = [];
                                                                order.foods = [];

                                                                if (orders[j].drinks.length > 0) {
                                                                    for (var dr = 0; dr < orders[j].drinks.length; dr++) {
                                                                        var drObj = {};
                                                                        drObj.userPrice = orders[j].drinks[dr].userPrice;
                                                                        drObj.numberofdrinks = orders[j].drinks[dr].numberofdrinks;
                                                                        drObj.drinkType = orders[j].drinks[dr].drinkType;
                                                                        drObj.category = orders[j].drinks[dr].category;
                                                                        drObj.drinkId = orders[j].drinks[dr].drinkId;
                                                                        drObj.name = orders[j].drinks[dr].name;
                                                                        drObj.basePrice = orders[j].drinks[dr].basePrice;
                                                                        drObj.capPrice = orders[j].drinks[dr].capPrice;
                                                                        drObj.runningPrice = orders[j].drinks[dr].runningPrice;
                                                                        drObj.available = orders[j].drinks[dr].available;
                                                                        drObj.demandRate = orders[j].drinks[dr].demandRate;
                                                                        drObj.demandLevel = orders[j].drinks[dr].demandLevel;
                                                                        drObj.priceIncrementPerUnit = orders[j].drinks[dr].priceIncrementPerUnit;
                                                                        drObj.status = orders[j].drinks[dr].status;
                                                                        drObj.itemCode = orders[j].drinks[dr].itemCode;
                                                                        drObj.regularPrice = orders[j].drinks[dr].regularPrice;
                                                                        drObj.priceVariable = orders[j].drinks[dr].priceVariable;

                                                                        for (var cat = 0; cat < categories.length; cat++) {
                                                                            if (categories[cat].name == orders[j].drinks[dr].drinkType) {
                                                                                drObj.drinkCategoryCode = categories[cat].id;
                                                                            }
                                                                        }
                                                                        if (cat >= categories.length) {
                                                                            order.drinks.push(drObj);
                                                                        }
                                                                    }
                                                                    if (dr >= orders[j].drinks.length) {
                                                                        obj.orders.push(order);
                                                                    }
                                                                }
                                                                if (orders[j].foods.length > 0) {
                                                                    for (var fd = 0; fd < orders[j].foods.length; fd++) {
                                                                        var foodObj = {};
                                                                        foodObj.available = orders[j].foods[fd].available;
                                                                        foodObj.basePrice = orders[j].foods[fd].basePrice;
                                                                        foodObj.foodId = orders[j].foods[fd].foodId;
                                                                        foodObj.itemCode = orders[j].foods[fd].itemCode;
                                                                        foodObj.foodType = orders[j].foods[fd].foodType;
                                                                        foodObj.name = orders[j].foods[fd].name;
                                                                        foodObj.numberoffoods = orders[j].foods[fd].numberoffoods;
                                                                        for (var fc = 0; fc < foodCategories.length; fc++) {
                                                                            if (foodCategories[fc].name == orders[j].foods[fd].foodType) {
                                                                                foodObj.foodCategoryCode = foodCategories[fc].id;
                                                                            }
                                                                        }
                                                                        if (fc >= foodCategories.length) {
                                                                            order.foods.push(foodObj);
                                                                        }
                                                                    }
                                                                    if (fd >= orders[j].foods.length) {
                                                                        obj.orders.push(order);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                    if (i >= bills[b].orderIds.length) {
                                                        billArray.push(obj);
                                                    }

                                                }
                                                if (b >= bills.length) {
                                                    res.json({
                                                        success: true,
                                                        data: {bills: billArray},
                                                        error: null
                                                    });
                                                }
                                                /*bills.forEach(function (eachBill, a) {
                                                 if (eachBill.tableNumber == tableNumber && eachBill.status == 'unpaid') {
                                                 var obj = {};
                                                 obj.billId = eachBill.billId;
                                                 obj.totalBill = eachBill.totalBill;
                                                 obj.status = eachBill.status;
                                                 obj.outletId = eachBill.outletId;
                                                 obj.adminId = eachBill.adminId;
                                                 obj.userId = eachBill.userId;
                                                 obj.billDate = eachBill.billDate;
                                                 obj.billTime = eachBill.billTime;
                                                 obj.created_at = eachBill.created_at;
                                                 obj.updated_at = eachBill.updated_at;
                                                 obj.orders = [];
                                                 obj.tableNumber = eachBill.tableNumber;
                                                 for (var i = 0; i < eachBill.orderIds.length; i++) {
                                                 for (var j = 0; j < orders.length; j++) {
                                                 if (orders[j].orderId == eachBill.orderIds[i].orderId) {
                                                 obj.orders.push(orders[j]);

                                                 }
                                                 }
                                                 }
                                                 if (i >= eachBill.orderIds.length) {
                                                 billArray.push(obj);
                                                 }
                                                 }

                                                 if (bills.length - 1 === a) {
                                                 res.json({
                                                 success: true,
                                                 data: {bills: billArray},
                                                 error: null
                                                 });
                                                 }
                                                 });*/
                                            }
                                            else {
                                                res.json({
                                                    success: true,
                                                    data: {bills: emptyArr},
                                                    error: null
                                                });
                                            }
                                        } else {
                                            console.log(err);
                                            res.json({
                                                success: false,
                                                data: null,
                                                error: 'error fetching bills'
                                            });
                                        }

                                    }).lean();
                                } else console.log(err);
                            }).lean();

                        } else console.log(err);
                    }).lean();
                } else console.log(err);
            });
        } else console.log(err);
    });
});//end of API to get all bills

//API to cancel all orders and vacate table
posRoutes.put('/cancelorder', function (req, res) {
    var table = req.query.tableNumber;
    var billedOrderIds = [];
    var orderid;
    var outletid;
    var date1 = moment.utc().add(330, 'minutes');
    var date = moment(date1).format('YYYY-MM-DD');
    var time = moment(date1).format('HH:mm:ss');
    var token = req.headers['auth_token'];
    var obj = {};
    var userid;
    var dailyLog = new Dailylog;
    Pos.findOne({token:token}, function (err, pos) {
        if(!err && pos) {
            outletid = pos.outletId;

            Bill.findOne({$and: [{$or: [{status: 'requested'}, {status: 'unpaid'}]}, {tableNumber: table},{outletId:outletid}]}, function (err, billFound) {
                if (!err && billFound != null) {
                    for (var b = 0; b < billFound.orderIds.length; b++) {
                        billedOrderIds.push(billFound.orderIds[b].orderId);
                    }
                    if (b >= billFound.orderIds.length) {
                        Order.find({$or: [{orderId: {$in: billedOrderIds}}, {$and: [{outletId: billFound.outletId}, {tableNumber: table}, {$or: [{status: 'pending'}, {status: 'confirmed'},{status:'placed'}]}]}]}, function (err, ordersFound) {
                            if (!err && ordersFound) {
                                for (var o = 0; o < ordersFound.length; o++) {
                                    orderid = ordersFound[o].orderId;
                                    if (ordersFound[o].orderType == 'user') {
                                        if (ordersFound[o].drinks.length > 0) {
                                            Order.findByIdAndUpdate(ordersFound[o]._id.toString(), {
                                                status: 'cancelled',
                                                cancelTime: time,
                                                gameId: 0
                                            }, {safe: true}, function (err, orderRemoved) {
                                                if (!err && orderRemoved) {
                                                    User.findOneAndUpdate({userId: orderRemoved.userId}, {
                                                        $pull: {
                                                            orders: orderRemoved.orderId
                                                        }
                                                    }, {safe: true, new: true}, function (err, userUpdated) {
                                                        if(err) console.log(err);
                                                        else{

                                                        }
                                                    });


                                                    Game.findOne({$and:[{outletId:outletid},{orderId:orderRemoved.orderId}]}, function (err, gameUpdated) {
                                                        if (!err && gameUpdated!=null){
                                                            if(gameUpdated.gameStatus == 'finished'){
                                                                console.log('game finished');
                                                                gameUpdated.status = 'cancelled';
                                                                gameUpdated.save(function (err) {
                                                                    if(err) console.log(err);
                                                                });
                                                            }else{
                                                                gameUpdated.gameStatus = 'finished';
                                                                gameUpdated.status = 'cancelled';
                                                                gameUpdated.save(function (err, saved) {
                                                                    if(!err && saved){
                                                                        userid = saved.userId;
                                                                        obj={};
                                                                        obj.gameId = saved.gameId;
                                                                        obj.gameStatus = saved.gameStatus;
                                                                        obj.tableNumber = saved.tableNumber;
                                                                        obj.orderId = saved.orderId;
                                                                        obj.status = saved.status;
                                                                        obj.outletId = saved.outletId;
                                                                        obj.userId = saved.userId;
                                                                        obj.userName = saved.userName;
                                                                        obj.orderDate = saved.orderDate;
                                                                        obj.orderTime = saved.orderTime;
                                                                        obj.billId = 0;
                                                                        User.findOneAndUpdate({userId: saved.userId}, {
                                                                            lastGameId: 0,
                                                                            gameId: 0,
                                                                            currentTableNumber: '0'
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
                                                                    }
                                                                    else{
                                                                        console.log(err);
                                                                    }
                                                                });
                                                            }
                                                        }
                                                        else{
                                                            console.log(err);
                                                        }
                                                    });
                                                } else {
                                                    res.json({
                                                        success: false,
                                                        data: null,
                                                        error: 'Error cancelling order'
                                                    });
                                                }
                                            });
                                        }//end of if drinks user order
                                        else {
                                            Order.findOneAndUpdate({$and:[{outletId:outletid},{orderId: orderid}]}, {
                                                status: 'cancelled',
                                                cancelTime: time
                                            }, {safe: true}, function (err, orderRemoved) {
                                                if (!err && orderRemoved) {
                                                    //do smthing
                                                    orderid = orderRemoved.orderId;
                                                    User.findOneAndUpdate({userId: orderRemoved.userId}, {
                                                        $pull: {
                                                            orders: orderid
                                                        }
                                                    }, {safe: true}, function (err) {
                                                        if (err) console.log(err);
                                                    })
                                                } else {
                                                    console.log(err);
                                                }
                                            });
                                        }
                                    }//end of if order by user
                                    else {
                                        Order.findOneAndUpdate({$and:[{outletId:outletid},{orderId: ordersFound[o].orderId}]}, {
                                            status: 'cancelled',
                                            cancelTime: time
                                        }, {safe: true}, function (err) {
                                            if (err) console.log(err);
                                        });
                                    }
                                }//end of ordersFound for loop
                                if (o >= ordersFound.length) {
                                    res.json({
                                        success: true,
                                        data: {message: 'Bill and All Orders Cancelled'},
                                        error: null
                                    });
                                    billFound.status = 'paid';
                                    billFound.cancelTime = time;
                                    billFound.totalBill = 0;
                                    billFound.vatOnDrink = 0;
                                    billFound.serviceChargeOnDrink = 0;
                                    billFound.serviceChargeOnFood = 0;
                                    billFound.gst = 0;
                                    billFound.save(function (err, billCancelled) {
                                        if (!err && billCancelled) {
                                            Outlet.findOneAndUpdate({
                                                outletId: billCancelled.outletId,
                                                'tables.tableNumber': table
                                            }, {
                                                'tables.$.status': 'vacant'
                                            }, {safe: true}, function (err) {
                                                if (err)console.log(err);
                                            });
                                        }
                                    });
                                }
                            }//end of if orders found
                            else {
                                res.json({
                                    success: false,
                                    data: null,
                                    error: 'Error finding orders on table'
                                });
                            }
                        });
                    }
                }//end of if bill found
                else {
                    Order.find({$and: [{outletId: pos.outletId}, {tableNumber: table}, {$or: [{status: 'pending'}, {status: 'confirmed'},{status:'placed'}]}]}, function (err, ordersFound) {
                        if (!err && ordersFound) {
                            for (var o = 0; o < ordersFound.length; o++) {
                                if (ordersFound[o].orderType == 'user') {
                                    if (ordersFound[o].drinks.length > 0) {
                                        Order.findOneAndUpdate({$and:[{outletId:outletid},{orderId: ordersFound[o].orderId}]}, {
                                            status: 'cancelled',
                                            cancelTime: time,
                                            gameId: 0
                                        }, {safe: true}, function (err, orderRemoved) {
                                            if (!err && orderRemoved) {
                                                User.findOneAndUpdate({userId: orderRemoved.userId}, {
                                                    $pull: {
                                                        orders: orderRemoved.orderId
                                                    }
                                                }, {safe: true, new: true}, function (err, userUpdated) {
                                                    if(err) console.log(err);
                                                    else{

                                                    }
                                                });
                                                Game.findOne({$and:[{outletId:outletid},{orderId:orderRemoved.orderId}]}, function (err, gameUpdated) {
                                                    if(err && gameUpdated == null) console.log(err);
                                                    else{
                                                        if(gameUpdated.gameStatus == 'finished'){
                                                            gameUpdated.status = 'cancelled';
                                                            gameUpdated.save(function (err) {
                                                                if(err) console.log(err);
                                                            });
                                                        }else{
                                                            gameUpdated.gameStatus = 'finished';
                                                            gameUpdated.status = 'cancelled';
                                                            gameUpdated.save(function (err, saved) {
                                                                if(!err && saved){
                                                                    userid = saved.userId;
                                                                    obj={};
                                                                    obj.gameId = saved.gameId;
                                                                    obj.gameStatus = saved.gameStatus;
                                                                    obj.tableNumber = saved.tableNumber;
                                                                    obj.orderId = saved.orderId;
                                                                    obj.status = saved.status;
                                                                    obj.outletId = saved.outletId;
                                                                    obj.userId = saved.userId;
                                                                    obj.userName = saved.userName;
                                                                    obj.orderDate = saved.orderDate;
                                                                    obj.orderTime = saved.orderTime;
                                                                    obj.billId = 0;
                                                                    User.findOneAndUpdate({userId: saved.userId}, {
                                                                        lastGameId: 0,
                                                                        gameId: 0,
                                                                        currentTableNumber: '0'
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
                                                                }
                                                                else{
                                                                    console.log(err);
                                                                }
                                                            });
                                                        }
                                                    }
                                                });

                                            } else {
                                                console.log(err);
                                            }
                                        });
                                    }//end of if drinks user order
                                    else {
                                        Order.findOneAndUpdate({$and:[{outletId:outletid},{orderId: ordersFound[o].orderId}]}, {
                                            status: 'cancelled',
                                            cancelTime: time
                                        }, {safe: true}, function (err, orderRemoved) {
                                            if (!err && orderRemoved) {
                                                //do smthing
                                                orderid = orderRemoved.orderId;
                                                User.findOneAndUpdate({userId: orderRemoved.userId}, {
                                                    $pull: {
                                                        orders: orderid
                                                    }
                                                }, {safe: true}, function (err) {
                                                    if (err) console.log(err);
                                                })
                                            } else {
                                                console.log(err);
                                            }
                                        });
                                    }
                                }//end of if order by user
                                else {
                                    Order.findOneAndUpdate({$and:[{outletId:outletid},{orderId: ordersFound[o].orderId}]}, {
                                        status: 'cancelled',
                                        cancelTime: time
                                    }, {safe: true}, function (err) {
                                        if (err) console.log(err);
                                    });
                                }
                            }//end of ordersFound for loop
                            if (o >= ordersFound.length) {
                                res.json({
                                    success: true,
                                    data: {message: 'Bill and All Orders Cancelled'},
                                    error: null
                                });
                                var logObj = {
                                    logTime: String,
                                    log: String
                                };
                     
                                Outlet.findOneAndUpdate({outletId: outletid, 'tables.tableNumber': table}, {
                                    'tables.$.status': 'vacant'
                                }, {safe: true}, function (err) {
                                    if (err)console.log(err);
                                });
                            }
                        }//end of if orders found
                        else {
                            res.json({
                                success: false,
                                data: null,
                                error: 'Error finding orders on table'
                            });
                        }
                    }).lean();
                }
            });//end of bill find
        }
        else {
            res.json({
                success:false,
                data:null,
                error:'Error fetching POS'
            })
        }
    }).lean();
});

//API to change user table
posRoutes.put('/changetable', function (req, res) {
    var oldTableIn = req.query.oldTableNumber;
    var oldTable = oldTableIn.toString();
    var newTableIn = req.query.tableNumber;
    var newTable = newTableIn.toString();
    var outletid;
    var token = req.headers['auth_token'];
    var date1 = moment.utc().add(330, 'minutes');
    var date = moment(date1).format('YYYY-MM-DD');
    var time = moment(date1).format('HH:mm:ss');
    var newdate = new Date(date1);
    var billOrderId = [];
    var dailyLog = new Dailylog;
    Pos.findOne({token:token}, function (err, posFound) {
        if(!err && posFound!=null){
            outletid = posFound.outletId;
            Bill.findOne({$and:[{outletId:outletid},{tableNumber:newTable},{$or:[{status:'requested'},{status:'unpaid'}]}]}, function (err, newTableBill) {
                if(!err && newTableBill!=null){
                    if(newTableBill.status == 'requested' || newTableBill.status == 'unpaid'){
                        Bill.findOne({$and:[{outletId:outletid},{tableNumber:oldTable},{$or:[{status:'requested'},{status:'unpaid'}]}]}, function (err, billFound) {
                            if(!err && billFound){
                                for(var b=0;b<billFound.orderIds.length;b++){
                                    billOrderId.push(billFound.orderIds[b].orderId);
                                    newTableBill.orderIds.push(billFound.orderIds[b]);
                                }
                                if(b>=billFound.orderIds.length){
                                    newTableBill.save(function (err) {
                                        if(err) console.log(err);
                                    });
                                    Order.find({$and:[{outletId:outletid},{tableNumber:oldTable},{$or:[{status:'pending'},{status:'confirmed'},{status:'placed'},{orderId:{$in:billOrderId}}]}]}, function (err, orders) {
                                        if(!err && orders.length>0){
                                            for(var o=0;o<orders.length;o++){
                                                outletid = orders[o].outletId;
                                                Order.findByIdAndUpdate(orders[o]._id.toString(),{
                                                    tableNumber : newTable
                                                }, function (err) {
                                                    if(err) console.log(err);
                                                });
                                                if(orders[o].gameId>0){
                                                    Game.findOneAndUpdate({$and:[{outletId:outletid},{orderId:orders[o].orderId}]},{
                                                        tableNumber:newTable
                                                    },{safe:true}, function (err, gameFound) {
                                                        if(err) console.log(err);
                                                        else{
                                                            User.findOneAndUpdate({userId:gameFound.userId},{
                                                                currentTableNumber:newTable
                                                            },{safe:true}, function (err) {
                                                                if(err) console.log(err);
                                                            })
                                                        }
                                                    });

                                                }
                                            }
                                            if(o>=orders.length){
                                                res.json({
                                                    success:true,
                                                    data:{message:'Updated Table number'},
                                                    error:null
                                                });
                                                var logObj = {
                                                    logTime: String,
                                                    log: String
                                                };
                                    
                                                Outlet.findOneAndUpdate({outletId: outletid,
                                                    'tables.tableNumber':oldTable},{
                                                    $set: {
                                                        'tables.$.status': 'vacant',
                                                        updated_at: newdate
                                                    }    },{safe:true}, function (err) {
                                                    if(err) console.log(err);
                                                });

                                                Outlet.findOneAndUpdate({outletId: outletid,
                                                    'tables.tableNumber':newTable},{
                                                    $set: {
                                                        'tables.$.status': 'occupied',
                                                        updated_at: newdate
                                                    }    },{safe:true}, function (err) {
                                                    if(err) console.log(err);
                                                });
                                            }
                                        }
                                        else{
                                            res.json({
                                                success:false,
                                                data:null,
                                                error:'Error Updating Table'
                                            });
                                        }
                                    }).lean();
                                }
                                newTableBill.totalBill = newTableBill.totalBill + billFound.totalBill;
                                newTableBill.serviceChargeOnFood = newTableBill.serviceChargeOnFood + billFound.serviceChargeOnFood;
                                newTableBill.serviceChargeOnDrink = newTableBill.serviceChargeOnDrink + billFound.serviceChargeOnDrink;
                                newTableBill.vatOnDrink = newTableBill.vatOnDrink + billFound.vatOnDrink;

                                billFound.totalBill = 0;
                                billFound.serviceChargeOnFood = 0;
                                billFound.serviceChargeOnDrink = 0;
                                billFound.vatOnDrink = 0;
                                billFound.status = 'paid';
                                billFound.save(function (err) {
                                    if(err) console.log(err);
                                });


                            }
                            else{
                                Order.find({$and:[{'outletId':outletid},{tableNumber:oldTable},{$or:[{status:'pending'},{status:'confirmed'},{status:'placed'}]}]}, function (err, orders) {
                                    if(!err && orders.length>0){
                                        for(var o=0;o<orders.length;o++){
                                            outletid = orders[o].outletId;
                                            Order.findByIdAndUpdate(orders[o]._id.toString(),{
                                                tableNumber:newTable
                                            },function (err) {
                                                if(err)console.log(err);
                                            });

                                            if(orders[o].gameId>0){
                                                Game.findOneAndUpdate({$and:[{outletId:outletid},{orderId:orders[o].orderId}]},{
                                                    tableNumber:newTable
                                                },{safe:true}, function (err, gameFound) {
                                                    if(err) console.log(err);
                                                    else{
                                                        User.findOneAndUpdate({userId:gameFound.userId},{
                                                            currentTableNumber:newTable
                                                        },{safe:true}, function (err) {
                                                            if(err) console.log(err);
                                                        })
                                                    }
                                                });

                                            }
                                        }
                                        if(o>=orders.length){
                                            res.json({
                                                success:true,
                                                data:{message:'Updated Table number'},
                                                error:null
                                            });
                                            var logObj = {
                                                logTime: String,
                                                log: String
                                            };
                                      
                                            Outlet.findOneAndUpdate({outletId: outletid,
                                                'tables.tableNumber':oldTable},{
                                                $set: {
                                                    'tables.$.status': 'vacant',
                                                    updated_at: newdate
                                                }    },{safe:true}, function (err) {
                                                if(err) console.log(err);
                                            });

                                            Outlet.findOneAndUpdate({outletId: outletid,
                                                'tables.tableNumber':newTable},{
                                                $set: {
                                                    'tables.$.status': 'occupied',
                                                    updated_at: newdate
                                                }    },{safe:true}, function (err) {
                                                if(err) console.log(err);
                                            });
                                        }
                                    }
                                    else{
                                        res.json({
                                            success:false,
                                            data:null,
                                            error:'Error Updating Table'
                                        });
                                    }
                                }).lean();
                            }
                        });
                    }
                }
                else{
                    Bill.findOne({$and:[{outletId:outletid},{tableNumber:oldTable},{$or:[{status:'requested'},{status:'unpaid'}]}]}, function (err, billFound) {
                        if(!err && billFound!=null){
                            if(billFound.status == 'requested' || billFound.status == 'unpaid'){
                                billFound.tableNumber = newTable;
                                billFound.save(function (err, saved) {
                                    if(!err && saved){

                                    }else console.log(err);
                                });
                            }
                            for(var b=0;b<billFound.orderIds.length;b++){
                                billOrderId.push(billFound.orderIds[b].orderId);
                            }
                            if(b>=billFound.orderIds.length){
                                Order.find({$and:[{outletId:outletid},{tableNumber:oldTable},{$or:[{status:'pending'},{status:'confirmed'},{status:'placed'},{orderId:{$in:billOrderId}}]}]}, function (err, orders) {
                                    if(!err && orders.length>0){

                                        orders.forEach(function (eachOrder, o) {
                                            outletid = eachOrder.outletId;
                                            Order.findByIdAndUpdate(eachOrder._id.toString(),{
                                                tableNumber: newTable
                                            },{safe:true}, function (err, updated) {
                                                if(err) console.log(err);
                                            });

                                            if(eachOrder.gameId>0){
                                                Game.findOneAndUpdate({$and:[{outletId:outletid},{orderId:eachOrder.orderId}]},{
                                                    tableNumber:newTable
                                                },{safe:true}, function (err, gameFound) {
                                                    if(err) console.log(err);
                                                    else{
                                                    }
                                                });
                                                User.findOneAndUpdate({userId:eachOrder.userId},{
                                                    currentTableNumber:newTable
                                                },{safe:true}, function (err) {
                                                    if(err) console.log(err);
                                                });

                                            }
                                            if(orders.length-1 === o){
                                                res.json({
                                                    success:true,
                                                    data:{message:'Updated Table number'},
                                                    error:null
                                                });
                                                var logObj2 = {
                                                    logTime: String,
                                                    log: String
                                                };
                                      
                                                Outlet.findOneAndUpdate({outletId: outletid,
                                                    'tables.tableNumber':oldTable},{
                                                    $set: {
                                                        'tables.$.status': 'vacant',
                                                        updated_at: newdate
                                                    }    },{safe:true}, function (err) {
                                                    if(err) console.log(err);
                                                });

                                                Outlet.findOneAndUpdate({outletId: outletid,
                                                    'tables.tableNumber':newTable},{
                                                    $set: {
                                                        'tables.$.status': 'occupied',
                                                        updated_at: newdate
                                                    }    },{safe:true}, function (err) {
                                                    if(err) console.log(err);
                                                });
                                            }
                                        });
                                    }
                                    else{
                                        res.json({
                                            success:false,
                                            data:null,
                                            error:'Error Updating Table'
                                        });
                                    }
                                }).lean();
                            }

                        }
                        else{
                            Order.find({$and:[{'outletId':outletid},{tableNumber:oldTable},{$or:[{status:'pending'},{status:'confirmed'},{status:'placed'}]}]}, function (err, orders) {
                                if(!err && orders.length>0){
                                    orders.forEach(function (eachOrder, o) {
                                        outletid = orders[o].outletId;
                                        Order.findByIdAndUpdate(eachOrder._id.toString(),{
                                            tableNumber: newTable
                                        }, function (err) {
                                            if(err) console.log(err);
                                        });
                                        if(eachOrder.gameId>0){
                                            Game.findOneAndUpdate({$and:[{outletId:outletid},{orderId:eachOrder.orderId}]},{
                                                tableNumber:newTable
                                            },{safe:true}, function (err, gameFound) {
                                                if(err) console.log(err);
                                                else{
                                                    User.findOneAndUpdate({userId:gameFound.userId},{
                                                        currentTableNumber:newTable
                                                    },{safe:true}, function (err) {
                                                        if(err) console.log(err);
                                                    })
                                                }
                                            });

                                        }
                                        if(orders.length-1 === o){
                                            res.json({
                                                success:true,
                                                data:{message:'Updated Table number'},
                                                error:null
                                            });
                                            var logObj2 = {
                                                logTime: String,
                                                log: String
                                            };
                               

                                            Outlet.findOneAndUpdate({outletId: outletid,
                                                'tables.tableNumber':oldTable},{
                                                $set: {
                                                    'tables.$.status': 'vacant',
                                                    updated_at: newdate
                                                }    },{safe:true}, function (err) {
                                                if(err) console.log(err);
                                            });

                                            Outlet.findOneAndUpdate({outletId: outletid,
                                                'tables.tableNumber':newTable},{
                                                $set: {
                                                    'tables.$.status': 'occupied',
                                                    updated_at: newdate
                                                }    },{safe:true}, function (err) {
                                                if(err) console.log(err);
                                            });
                                        }


                                    })
                                }
                                else{
                                    res.json({
                                        success:false,
                                        data:null,
                                        error:'Error Updating Table'
                                    });
                                }
                            }).lean();

                        }
                    });
                }
            });

        }
        else{
            res.json({
                success:false,
                data:null,
                error:'Error finding POS User'
            });
        }
    }).lean()
});

//API to remove items from orders
posRoutes.put('/removeitems', function (req, res) {

    var foods = req.body.foods;
    var drinks = req.body.drinks;
    var tablenumber = req.body.tableNumber;
    var ordersMain;
    var logObj = {
        logTime: String,
        log: String
    };
    var newNumber;
    var removed =false;
    var newNumberFood;
    var token = req.headers['auth_token'];
    var updated = false;
    var outletid;
    var drinkid,foodid;
    var orderid;
    var outletid2;
    var userid = 0;
    var userids = [];
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var date = moment(date1).format('YYYY-MM-DD');
    var time = moment(date1).format('HH:mm:ss');
    var drinkTotal=0, foodTotal=0, total = 0;
    var posid;
    var billedOrderIds = [];
    var obj = {};
    var drinkq;
    var drinkss = [];
    var foodss = [];
    var billid;
    var drinkObj={
        itemCode: Number,
        userPrice: String,
        quantity: Number,
        removed: Boolean
    };
    var drinkArr = [];
    var foodObj={
        itemCode: Number,
        userPrice: String,
        quantity: Number,
        removed: Boolean
    };
    var foodArr = [];
    var dailyLog = new Dailylog;

    if(drinks!=null){
        for(var a=0;a<drinks.length;a++){
            drinkObj = {};
            drinkObj.itemCode = drinks[a].itemCode;
            drinkObj.userPrice = drinks[a].userPrice;
            drinkObj.quantity = drinks[a].quantity;
            drinkObj.removed = false;
            drinkArr.push(drinkObj);
        }
    }else{
        drinks = drinkss;
    }

    if(foods!=null){
        for(var c=0;c<foods.length;c++){
            foodObj.itemCode = foods[c].itemCode;
            foodObj.userPrice = foods[c].userPrice;
            foodObj.quantity = foods[c].quantity;
            foodObj.removed = false;
            foodArr.push(foodObj);
        }
    }else{
        foods = foodss;
    }

    if(a>=drinks.length || c>=foods.length){
        Pos.findOne({token:token}, function (err, posFound) {
            if(!err && posFound){
                outletid = posFound.outletId;
                posid = posFound.userName;
                Bill.findOne({$and:[{outletId:posFound.outletId},{tableNumber:tablenumber},{$or:[{status:'requested'},{status:'unpaid'}]}]}, function (err, billFound) {
                    if(!err && billFound!=null){
                        billid = billFound.billId;
                        for (var b = 0; b < billFound.orderIds.length; b++) {
                            billedOrderIds.push(billFound.orderIds[b].orderId);
                        }
                        if (b >= billFound.orderIds.length) {
                            Order.find({$and:[{outletId:outletid},{tableNumber:tablenumber},{$or:[{status:'confirmed'},{status:'placed'},{orderId:{$in:billedOrderIds}}]}]}, function (err, orders) {
                                if(!err && orders){
                                    var arrtemp = [];

                                    if(orders.length>0){
                                        if(orders.length==1) {
                                            arrtemp.push(orders[0]);
                                        }
                                        else{
                                            arrtemp = orders;
                                        }
                                        orders.forEach(function (eachOrder, o) {
                                            orderid = eachOrder.orderId;
                                            if(eachOrder.status!='cancelled'){
                                                if(eachOrder.drinks.length>0){
                                                    if(drinkArr.length>0){
                                                        eachOrder.drinks.forEach(function (eachDrink) {
                                                            drinkArr.forEach(function (eachRemoveDrink) {
                                                                if(eachRemoveDrink.removed == false){
                                                                    if((eachDrink.itemCode == eachRemoveDrink.itemCode) && (eachDrink.userPrice == eachRemoveDrink.userPrice) && (eachDrink.numberofdrinks >= eachRemoveDrink.quantity)){
                                                                        eachRemoveDrink.removed=true;
                                                                        drinkid = eachRemoveDrink.itemCode;
                                                                        drinkq = eachRemoveDrink.quantity;

                                                                        if(eachDrink.numberofdrinks > eachRemoveDrink.quantity){
                                                                            newNumber = eachDrink.numberofdrinks - eachRemoveDrink.quantity;

                                                                            Order.findOneAndUpdate({$and:[{outletId:outletid},{orderId:eachOrder.orderId}],'drinks.itemCode':drinkid},{
                                                                                'drinks.$.numberofdrinks':newNumber
                                                                            },{safe:true,new:true}, function (err,orderUpdated) {
                                                                                if(err){
                                                                                    console.log(err);
                                                                                }
                                                                                else if(!err && orderUpdated!=null){
                                                                                    if(orderUpdated.orderType == 'user'){
                                                                                        Game.findOneAndUpdate({$and:[{outletId:outletid},{orderId:orderUpdated.orderId}],'drinks.itemCode':drinkid},{
                                                                                            'drinks.$.numberofdrinks':newNumber
                                                                                        },{safe:true}, function (err, gameDrinksChanged) {
                                                                                            if(err) console.log(err);
                                                                                            else if(!err && gameDrinksChanged!=null){
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
                                                                                                        var sender = new fcm(gcmSenderKeyAndroid);

                                                                                                        if (userFoundNow.userAgent == 'android') {
                                                                                                            var message1 = {
                                                                                                                to: userFoundNow.gcmId,
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
                                                                                                                to: userFoundNow.gcmId,
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

                                                                                                    } else {
                                                                                                        console.log(err);
                                                                                                    }
                                                                                                });

                                                                                            }
                                                                                        });
                                                                                    }
                                                                                }
                                                                            });
                                                                        }
                                                                        else{
                                                                            newNumber = 0;
                                                                            if(eachOrder.drinks.length>1){
                                                                                Order.findOneAndUpdate({$and:[{outletId:outletid},{orderId:eachOrder.orderId}]},{
                                                                                    $pull:{
                                                                                        drinks:{itemCode:drinkid}
                                                                                    }
                                                                                },{safe:true,new:true}, function (err,orderUpdated) {
                                                                                    if(err){
                                                                                        console.log(err);
                                                                                    }
                                                                                    else if(!err && orderUpdated!=null){
                                                                                        if(orderUpdated.orderType == 'user'){
                                                                                            Game.findOneAndUpdate({$and:[{outletId:outletid},{orderId:orderUpdated.orderId}]},{
                                                                                                $pull:{
                                                                                                    drinks:{
                                                                                                        itemCode:drinkid
                                                                                                    }
                                                                                                }
                                                                                            },{safe:true,new:true}, function (err, gameDrinksChanged) {
                                                                                                if(err) console.log(err);
                                                                                                else if(!err && gameDrinksChanged!=null){
                                                                                                    console.log(gameDrinksChanged.gameId);
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
                                                                                                                        console.log('Error sending drinks Confirm Push Android');

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
                                                                                                                        console.log('Error sending drinks Confirm Push ios');

                                                                                                                    } else {
                                                                                                                        console.log("Successfully sent: ", response);
                                                                                                                    }
                                                                                                                });
                                                                                                            }

                                                                                                        } else {
                                                                                                            console.log(err);
                                                                                                        }
                                                                                                    });

                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    }
                                                                                });
                                                                            }
                                                                            else{
                                                                                Order.findOneAndUpdate({$and:[{outletId:outletid},{orderId:eachOrder.orderId}]},{
                                                                                    status:'cancelled'
                                                                                },{safe:true}, function (err,orderUpdated) {
                                                                                    if(err){
                                                                                        console.log(err);
                                                                                    }
                                                                                    else if(!err && orderUpdated!=null){
                                                                                        if(orderUpdated.orderType == 'user'){
                                                                                            Game.findOneAndUpdate({$and:[{outletId:outletid},{orderId:orderUpdated.orderId}],'drinks.itemCode':drinkid},{
                                                                                                $pull:{
                                                                                                    drinks:{
                                                                                                        itemCode:drinkid
                                                                                                    }
                                                                                                }
                                                                                            },{safe:true,new:true}, function (err, gameDrinksChanged) {
                                                                                                if(err) console.log(err);
                                                                                                else if(!err && gameDrinksChanged!=null){
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
                                                                                                    User.findOneAndUpdate({userId: gameDrinksChanged.userId},{
                                                                                                        gameId:0,
                                                                                                        lastGameId:0
                                                                                                    },{safe:true}, function (err, userFoundNow) {
                                                                                                        if (!err && userFoundNow) {
                                                                                                            var sender = new fcm(gcmSenderKeyAndroid);
                                                                                                            if (userFoundNow.userAgent == 'android') {
                                                                                                                var message = {
                                                                                                                    to: userFoundNow.gcmId,
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
                                                                                                                    to: userFoundNow.gcmId,
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

                                                                                                        } else {
                                                                                                            console.log(err);
                                                                                                        }
                                                                                                    });
                                                                                                    gameDrinksChanged.gameStatus = 'finished';
                                                                                                    gameDrinksChanged.status = 'cancelled';
                                                                                                    gameDrinksChanged.save(function (err) {
                                                                                                        if(err) console.log(err);
                                                                                                    });
                                                                                                }
                                                                                            });
                                                                                        }

                                                                                    }
                                                                                });
                                                                            }
                                                                        }
                                                            
                                                                    }
                                                                }
                                                            });
                                                        });
                                                    }
                                                }//end of if drinks order
                                                else if(eachOrder.foods.length>0){
                                                    if(foodArr.length>0){
                                                        for(var f=0;f<orders[o].foods.length;f++){
                                                            for(var fo=0;fo<foodArr.length;fo++){
                                                                if(foodArr[fo].removed == false){
                                                                    if(orders[o].foods[f].itemCode == foodArr[fo].itemCode){
                                                                        foodArr[fo].removed = true;
                                                                        foodid =orders[o].foods[f].itemCode;
                                                                        drinkq = foodArr[fo].quantity;
                                                                        if(orders[o].foods.length>1){
                                                                            if(orders[o].foods[f].numberoffoods > foodArr[fo].quantity){
                                                                                newNumberFood = orders[o].foods[f].numberoffoods - foodArr[fo].quantity;
                                                                                Order.findOneAndUpdate({$and:[{outletId:outletid},{orderId:orders[o].orderId}],'foods.foodId':orders[o].foods[f].foodId},{
                                                                                    'foods.$.numberoffoods':newNumberFood
                                                                                },{safe:true,new:true}, function (err) {
                                                                                    if(err){
                                                                                        console.log(err);
                                                                                    }
                                                                                });

                                                                            }
                                                                            else{
                                                                                newNumberFood = 0;
                                                                                Order.findOneAndUpdate({$and:[{outletId:outletid},{orderId:orders[o].orderId}]},{
                                                                                    $pull:{
                                                                                        foods:{itemCode : foodid}
                                                                                    }
                                                                                },{safe:true,new:true}, function (err) {
                                                                                    if(err){
                                                                                        console.log(err);
                                                                                    }
                                                                                });
                                                                            }
                                                                        }
                                                                        else{
                                                                            if(eachOrder.foods[f].numberoffoods > foodArr[fo].quantity){
                                                                                newNumberFood = eachOrder.foods[f].numberoffoods - foodArr[fo].quantity;
                                                                                Order.findOneAndUpdate({$and:[{outletId:outletid},{orderId:eachOrder.orderId}],'foods.itemCode':eachOrder.foods[f].itemCode},{
                                                                                    'foods.$.numberoffoods':newNumberFood
                                                                                },{safe:true,new:true}, function (err) {
                                                                                    if(err){
                                                                                        console.log(err);
                                                                                    }

                                                                                });
                                                                            }
                                                                            else{
                                                                                newNumberFood = 0;
                                                                                Order.findOneAndUpdate({$and:[{outletId:outletid},{orderId:eachOrder.orderId}]},{
                                                                                    status:'cancelled'
                                                                                },{safe:true,new:true}, function (err) {
                                                                                    if(err){
                                                                                        console.log(err);
                                                                                    }
                                                                                    else{
                                                                                        removed=true;
                                                                                    }
                                                                                });
                                                                            }
                                                                        }
                                                     
                                                                    }

                                                                }
                                                            }//end of foods for
                                                        }//end of order foods for
                                                    }
                                                }//end of if foods order
                                            }

                                            if(arrtemp.length == 1){
                                                res.json({
                                                    success: true,
                                                    data:{message:'successfully updated items'},
                                                    error:null
                                                });
                                                Order.find({$and:[{outletId:outletid},{orderId:{$in:billedOrderIds}},{status:'billed'}]}, function (err, orders) {
                                                    if(!err && orders){
                                                        billFound.orderIds = [];
                                                        for (var i1 = 0; i1 < orders.length; i1++) {
                                                            billFound.orderIds.push({orderId:orders[i1].orderId});
                                                            if (orders[i1].drinks.length > 0) {
                                                                for (var j1 = 0; j1 < orders[i1].drinks.length; j1++) {
                                                                    total = total + ((parseFloat(orders[i1].drinks[j1].userPrice)) * orders[i1].drinks[j1].numberofdrinks);
                                                                    drinkTotal = drinkTotal + ((parseFloat(orders[i1].drinks[j1].userPrice)) * orders[i1].drinks[j1].numberofdrinks);
                                                                }
                                                            }
                                                            else {
                                                                for (j1 = 0; j1 < orders[i1].foods.length; j1++) {
                                                                    total = total + ((parseInt(orders[i1].foods[j1].basePrice)) * orders[i1].foods[j1].numberoffoods);
                                                                    foodTotal = foodTotal + ((parseInt(orders[i1].foods[j1].basePrice)) * orders[i1].foods[j1].numberoffoods);
                                                                }
                                                            }
                                                        }
                                                        if (i1 >= orders.length) {
                                                            if(drinkTotal==0){
                                                                billFound.vatOnDrink=0;
                                                                billFound.serviceChargeOnDrink = 0;
                                                                billFound.gst = ((5/100)*foodTotal);
                                                                billFound.serviceChargeOnFood = ((10/100)*foodTotal);

                                                            }
                                                            else if(foodTotal==0){
                                                                billFound.vatOnDrink= ((5/100)*drinkTotal);
                                                                billFound.serviceChargeOnDrink = ((10/100)*drinkTotal);
                                                                billFound.gst = 0;
                                                                billFound.serviceChargeOnFood = 0;

                                                            }else{
                                                                billFound.vatOnDrink= ((5/100)*drinkTotal);
                                                                billFound.serviceChargeOnDrink = ((10/100)*drinkTotal);
                                                                billFound.gst = ((5/100)*foodTotal);
                                                                billFound.serviceChargeOnFood = ((10/100)*foodTotal);
                                                            }
                                                            if (total > 0) {
                                                                billFound.totalBill = total;
                                                                billFound.billDate = date;
                                                                billFound.billTime = time;
                                                                billFound.generatedBy = 'POS';
                                                                billFound.updated_at = newdate;
                                                                billFound.save(function (err, billSaved) {
                                                                    if (!err && billSaved) {

                                                                    } else {
                                                                        console.log(err);
                                                                    }
                                                                });

                                                            }
                                                            else {
                                                                console.log('No Total');
                                                            }
                                                        }
                                                    }
                                                });
                                            }
                                            else if(arrtemp.length>1){
                                                if(orders.length-1 == o){

                                                    res.json({
                                                        success: true,
                                                        data:{message:'successfully updated items'},
                                                        error:null
                                                    });
                                                    Order.find({$and:[{outletId:outletid},{orderId:{$in:billedOrderIds}},{status:'billed'}]}, function (err, orders) {
                                                        if(!err && orders){
                                                            billFound.orderIds = [];
                                                            for (var i1 = 0; i1 < orders.length; i1++) {
                                                                billFound.orderIds.push({orderId:orders[i1].orderId});
                                                                if (orders[i1].drinks.length > 0) {
                                                                    for (var j1 = 0; j1 < orders[i1].drinks.length; j1++) {
                                                                        total = total + ((parseFloat(orders[i1].drinks[j1].userPrice)) * orders[i1].drinks[j1].numberofdrinks);
                                                                        drinkTotal = drinkTotal + ((parseFloat(orders[i1].drinks[j1].userPrice)) * orders[i1].drinks[j1].numberofdrinks);
                                                                    }
                                                                }
                                                                else {
                                                                    for (j1 = 0; j1 < orders[i1].foods.length; j1++) {
                                                                        total = total + ((parseInt(orders[i1].foods[j1].basePrice)) * orders[i1].foods[j1].numberoffoods);
                                                                        foodTotal = foodTotal + ((parseInt(orders[i1].foods[j1].basePrice)) * orders[i1].foods[j1].numberoffoods);
                                                                    }
                                                                }
                                                            }
                                                            if (i1 >= orders.length) {
                                                                if(drinkTotal==0){
                                                                    billFound.vatOnDrink=0;
                                                                    billFound.serviceChargeOnDrink = 0;
                                                                    billFound.gst = ((5/100)*foodTotal);
                                                                    billFound.serviceChargeOnFood = ((10/100)*foodTotal);

                                                                }
                                                                else if(foodTotal==0){
                                                                    billFound.vatOnDrink= ((5/100)*drinkTotal);
                                                                    billFound.serviceChargeOnDrink = ((10/100)*drinkTotal);
                                                                    billFound.gst = 0;
                                                                    billFound.serviceChargeOnFood = 0;

                                                                }else{
                                                                    billFound.vatOnDrink= ((5/100)*drinkTotal);
                                                                    billFound.serviceChargeOnDrink = ((10/100)*drinkTotal);
                                                                    billFound.gst = ((5/100)*foodTotal);
                                                                    billFound.serviceChargeOnFood = ((10/100)*foodTotal);
                                                                }
                                                                if (total > 0) {
                                                                    billFound.totalBill = total;
                                                                    billFound.billDate = date;
                                                                    billFound.billTime = time;
                                                                    billFound.generatedBy = 'POS';
                                                                    billFound.updated_at = newdate;
                                                                    billFound.save(function (err, billSaved) {
                                                                        if (!err && billSaved) {

                                                                        } else {
                                                                            console.log(err);
                                                                        }
                                                                    });

                                                                }
                                                                else {
                                                                    console.log('No Total');
                                                                }
                                                            }
                                                        }
                                                    });
                                                }

                                            }
                                        });
                                    }
                                }//end of find all orders
                                else{
                                    res.json({
                                        success:false,
                                        data:null,
                                        error:'Error finding orders'
                                    });
                                    console.log(err);
                                }
                            }).lean();


                        }
                    }//end of if bill found
                    else{
                        Order.find({$and:[{outletId:outletid},{tableNumber:tablenumber},{$or:[{status:'confirmed'},{status:'placed'}]}]}, function (err, orders) {
                            if(!err && orders){
                                var temparr2 = [];
                                if(orders.length == 1) temparr2.push(orders[0]);
                                else temparr2 = orders;
                                orders.forEach(function (eachOrder, o) {
                                    if(eachOrder.status!='cancelled'){
                                        if(eachOrder.drinks.length>0){
                                            if(drinkArr.length>0){
                                                eachOrder.drinks.forEach(function (eachOrderDrink) {
                                                    drinkArr.forEach(function (eachReplaceDrink) {
                                                        if(eachReplaceDrink.removed == false){
                                                            if((eachOrderDrink.itemCode == eachReplaceDrink.itemCode) && (eachOrderDrink.userPrice == eachReplaceDrink.userPrice) && (eachOrderDrink.numberofdrinks >= eachReplaceDrink.quantity)){
                                                                eachReplaceDrink.removed=true;
                                                                drinkid = eachReplaceDrink.itemCode;
                                                                drinkq = eachReplaceDrink.quantity;
                                                                if(eachOrderDrink.numberofdrinks > eachReplaceDrink.quantity){
                                                                    newNumber = eachOrderDrink.numberofdrinks - eachReplaceDrink.quantity;
                                                                    Order.findOneAndUpdate({$and:[{outletId:outletid},{orderId:eachOrder.orderId}],'drinks.itemCode':drinkid},{
                                                                        'drinks.$.numberofdrinks':newNumber
                                                                    },{safe:true,new:true}, function (err,orderUpdated) {
                                                                        if(err){
                                                                            console.log(err);
                                                                        }
                                                                        else{
                                                                            if(orderUpdated.orderType == 'user'){
                                                                                Game.findOneAndUpdate({$and:[{outletId:outletid},{orderId:orderUpdated.orderId}],'drinks.itemCode':drinkid},{
                                                                                    'drinks.$.numberofdrinks':newNumber
                                                                                },{safe:true}, function (err, gameDrinksChanged) {
                                                                                    if(err) console.log(err);
                                                                                    else if(!err && gameDrinksChanged!=null){
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
                                                                                                var sender = new fcm(gcmSenderKeyAndroid);

                                                                                                if (userFoundNow.userAgent == 'android') {
                                                                                                    var message1 = {
                                                                                                        to: userFoundNow.gcmId,
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
                                                                                                        to: userFoundNow.gcmId,
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

                                                                                            } else {
                                                                                                console.log(err);
                                                                                            }
                                                                                        });

                                                                                    }
                                                                                });
                                                                            }
                                                                        }
                                                                    });
                                                                }
                                                                else{
                                                                    newNumber = 0;
                                                                    if(eachOrder.drinks.length>1){
                                                                        Order.findOneAndUpdate({$and:[{outletId:outletid},{orderId:eachOrder.orderId}]},{
                                                                            $pull:{
                                                                                drinks:{itemCode:drinkid}
                                                                            }
                                                                        },{safe:true,new:true}, function (err,orderUpdated) {
                                                                            if(err){
                                                                                console.log(err);
                                                                            }
                                                                            else{
                                                                                if(orderUpdated.orderType == 'user'){
                                                                                    Game.findOneAndUpdate({$and:[{outletId:outletid},{orderId:orderUpdated.orderId}]},{
                                                                                        $pull:{
                                                                                            drinks:{
                                                                                                itemCode:drinkid
                                                                                            }
                                                                                        }
                                                                                    },{safe:true,new:true}, function (err, gameDrinksChanged) {
                                                                                        if(err) console.log(err);
                                                                                        else if(!err && gameDrinksChanged!=null){
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

                                                                                        }
                                                                                    });
                                                                                }
                                                                            }
                                                                        });
                                                                    }
                                                                    else{
                                                                        Order.findOneAndUpdate({$and:[{outletId:outletid},{orderId:eachOrder.orderId}]},{
                                                                            status:'cancelled'
                                                                        },{safe:true,new:true}, function (err,orderUpdated) {
                                                                            if(err){
                                                                                console.log(err);
                                                                            }
                                                                            else{
                                                                                if(orderUpdated.orderType == 'user'){
                                                                                    Game.findOneAndUpdate({$and:[{outletId:outletid},{orderId:orderUpdated.orderId}]},{
                                                                                        $pull:{
                                                                                            drinks:{
                                                                                                itemCode:drinkid
                                                                                            }
                                                                                        }
                                                                                    },{safe:true,new:true}, function (err, gameDrinksChanged) {
                                                                                        if(err) console.log(err);
                                                                                        else{
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
                                                                                            User.findOneAndUpdate({userId: gameDrinksChanged.userId},{
                                                                                                gameId:0,
                                                                                                lastGameId:0
                                                                                            },{safe:true}, function (err, userFoundNow) {
                                                                                                if (!err && userFoundNow) {
                                                                                                    var sender = new fcm(gcmSenderKeyAndroid);
                                                                                                    if (userFoundNow.userAgent == 'android') {
                                                                                                        var message = {
                                                                                                            to: userFoundNow.gcmId,
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
                                                                                                            to: userFoundNow.gcmId,
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

                                                                                                } else {
                                                                                                    console.log(err);
                                                                                                }
                                                                                            });
                                                                                            gameDrinksChanged.gameStatus = 'finished';
                                                                                            gameDrinksChanged.status = 'cancelled';
                                                                                            gameDrinksChanged.save(function (err) {
                                                                                                if(err) console.log(err);
                                                                                            });
                                                                                        }
                                                                                    });
                                                                                }

                                                                            }
                                                                        });
                                                                    }
                                                                }
                                            
                                                            }
                                                        }
                                                    });
                                                });
                                            }
                                        }//end of if drinks order
                                        else if(eachOrder.foods.length>0){
                                            if(foodArr.length>0){
                                                for(var f=0;f<eachOrder.foods.length;f++){
                                                    for(var fo=0;fo<foodArr.length;fo++){
                                                        if(foodArr[fo].removed == false){
                                                            if(eachOrder.foods[f].itemCode == foodArr[fo].itemCode ){
                                                                foodArr[fo].removed = true;
                                                                foodid =eachOrder.foods[f].itemCode;
                                                                drinkq = foodArr[fo].quantity;
                                                                if(eachOrder.foods.length>1){
                                                                    if(eachOrder.foods[f].numberoffoods > foodArr[fo].quantity){
                                                                        newNumberFood = eachOrder.foods[f].numberoffoods - foodArr[fo].quantity;
                                                                        Order.findOneAndUpdate({$and:[{outletId:outletid},{orderId:eachOrder.orderId}],'foods.foodId':eachOrder.foods[f].foodId},{
                                                                            'foods.$.numberoffoods':newNumberFood
                                                                        },{safe:true,new:true}, function (err) {
                                                                            if(err){
                                                                                console.log(err);
                                                                            }
                                                                            else{

                                                                            }
                                                                        });
                                                                    }
                                                                    else{
                                                                        newNumberFood = 0;
                                                                        Order.findOneAndUpdate({$and:[{outletId:outletid},{orderId:eachOrder.orderId}]},{
                                                                            $pull:{
                                                                                foods:{itemCode : foodid}
                                                                            }
                                                                        },{safe:true,new:true}, function (err) {
                                                                            if(err){
                                                                                console.log(err);
                                                                            }
                                                                        });
                                                                    }
                                                                }
                                                                else{
                                                                    if(eachOrder.foods[f].numberoffoods > foodArr[fo].quantity){
                                                                        newNumberFood = eachOrder.foods[f].numberoffoods - foodArr[fo].quantity;
                                                                        Order.findOneAndUpdate({$and:[{outletId:outletid},{orderId:eachOrder.orderId}],'foods.itemCode':eachOrder.foods[f].itemCode},{
                                                                            'foods.$.numberoffoods':newNumberFood
                                                                        },{safe:true,new:true}, function (err) {
                                                                            if(err){
                                                                                console.log(err);
                                                                            }
                                                                            else{

                                                                            }
                                                                        });
                                                                    }
                                                                    else{
                                                                        newNumberFood = 0;
                                                                        Order.findOneAndUpdate({$and:[{outletId:outletid},{orderId:eachOrder.orderId}]},{
                                                                            status:'cancelled'
                                                                        },{safe:true,new:true}, function (err) {
                                                                            if(err){
                                                                                console.log(err);
                                                                            }
                                                                            else{
                                                                                removed=true;
                                                                            }
                                                                        });
                                                                    }
                                                                }
                                                     
                                                            }

                                                        }
                                                    }//end of foods for
                                                }//end of order foods for
                                            }
                                        }//end of if foods order
                                    }


                                    if(temparr2.length == 1){
                                        res.json({
                                            success: true,
                                            data:{message:'successfully updated items'},
                                            error:null
                                        });
                                    }
                                    else if(temparr2.length>1){
                                        if(orders.length-1 == o){
                                            res.json({
                                                success: true,
                                                data:{message:'successfully updated items'},
                                                error:null
                                            });
                                        }
                                    }

                                });
                            }//end of find all orders
                            else{
                                res.json({
                                    success:false,
                                    data:null,
                                    error:'Error finding orders'
                                });
                                console.log(err);
                            }
                        }).lean();
                    }
                });
            }
            else{
                res.json({
                    success:false,
                    data:null,
                    error:'Error finding pos user'
                });
            }
        });
    }
    });//end of api

//API to discount items
posRoutes.put('/discountitem', function (req, res) {
    var itemCode = req.body.itemCode;
    var oldPrice = req.body.oldPrice;
    var newPrice = req.body.newPrice;
    var type = req.body.itemType;

    var changed = false;
    var obj ={};
    //var quantity = req.body.quantity;
    var name = req.body.itemName;
    var tablenumber = req.query.tableNumber;
    var token = req.headers['auth_token'];
    var outletid;
    var userid;
    var orderid;
    var outletid2;
    var userids = [];
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var date = moment(date1).format('YYYY-MM-DD');
    var time = moment(date1).format('HH:mm:ss');
    var drinkTotal=0, foodTotal=0, total = 0;
    var billedOrderIds = [];
    var logObj = {
        logTime: String,
        log: String
    };

var dailyLog = new Dailylog;

    if(itemCode!=null && oldPrice!=null && newPrice!=null && type!=null){
        Pos.findOne({token:token}, function (err, posFound) {
            if(!err && posFound){
                outletid = posFound.outletId;
                Bill.findOne({$and:[{outletId:posFound.outletId},{tableNumber:tablenumber},{$or:[{status:'requested'},{status:'unpaid'}]}]}, function (err, billFound) {
                    if(!err && billFound!=null){
                        for (var b = 0; b < billFound.orderIds.length; b++) {
                            billedOrderIds.push(billFound.orderIds[b].orderId);
                        }
                        if(b>=billFound.orderIds.length){
                            Order.find({$and:[{outletId:outletid},{tableNumber:tablenumber},{$or:[{status:'confirmed'},{status:'placed'},{orderId:{$in:billedOrderIds}}]}]}, function (err, orders) {
                                if(!err && orders){
                                    orders.forEach(function (eachOrder, o) {
                                        if(eachOrder.status !='cancelled'){
                                            if(eachOrder.drinks.length>0){
                                                if(type == 'drink' && changed == false){
                                                    eachOrder.drinks.forEach(function (eachDrink) {
                                                        var drinkTotal = 0;
                                                        drinkTotal = parseFloat(eachDrink.userPrice) * eachDrink.numberofdrinks;
                                                        if(eachDrink.itemCode == itemCode && drinkTotal == parseInt(oldPrice)/* && orders[o].drinks[d].numberofdrinks == quantity*/){
                                                            orderid = eachOrder.orderId;
                                                            changed = true;
                                                            Order.findOneAndUpdate({$and:[{outletId:outletid},{orderId:eachOrder.orderId}],'drinks.itemCode':itemCode},{
                                                                'drinks.$.userPrice':newPrice
                                                            },{safe:true,new:true}, function (err, orderUpdated) {
                                                                if(!err && orderUpdated!=null){
                                                                    if(orderUpdated.orderType == 'user'){
                                                                        if(orderUpdated.drinks.length>1){
                                                                            Game.findOneAndUpdate({$and:[{outletId:outletid},{orderId:orderUpdated.orderId}],'drinks.itemCode':itemCode},{
                                                                                'drinks.$.userPrice':newPrice
                                                                            },{safe:true,new:true}, function (err, gameDrinksChanged) {
                                                                                if(!err && gameDrinksChanged!=null){
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
                                                                                    User.findOne({userId: gameDrinksChanged.userId}, function (err, userFoundNow) {
                                                                                        if (!err && userFoundNow) {
                                                                                            var sender = new fcm(gcmSenderKeyAndroid);
                                                                                            if (userFoundNow.userAgent == 'android') {
                                                                                                var message1 = {
                                                                                                    to: userFoundNow.gcmId,
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
                                                                                                    to: userFoundNow.gcmId,
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
                                                                                        } else console.log(err);
                                                                                    });
                                                                                }else{
                                                                                    console.log(err);
                                                                                }
                                                                            });
                                                                        }
                                                                        else if(orderUpdated.drinks.length == 1){
                                                                            Game.findOneAndUpdate({$and:[{outletId:outletid},{orderId:orderUpdated.orderId}],'drinks.itemCode':itemCode},
                                                                                {
                                                                                    'drinks.$.userPrice':newPrice
                                                                                },{safe:true,new:true}, function (err, gameUpdated) {
                                                                                    if(!err && gameUpdated!=null){
                                                                                        userid = gameUpdated.userId;
                                                                                        obj={};
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
                                                                                        gameUpdated.gameStatus = 'finished';
                                                                                        gameUpdated.save(function (err) {
                                                                                            if(err) console.log(err);
                                                                                        });
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
                                                                                    }
                                                                                    else console.log(err);
                                                                                });
                                                                        }
                                                                    }
                                                                }
                                                                else{
                                                                    console.log(err);
                                                                }
                                                            });
                                                  
                                                        }
                                                    });

                                                }
                                            }
                                            else if(eachOrder.foods.length>0) {
                                                if (type == 'food' && changed == false) {
                                                    eachOrder.foods.forEach(function (eachFood) {
                                                        var foodTotal = 0;
                                                        foodTotal = parseInt(eachFood.basePrice) * eachFood.numberoffoods;
                                                        if (eachFood.itemCode == itemCode &&foodTotal==parseInt(oldPrice)/*&& orders[o].foods[f].numberoffoods == quantity*/) {
                                                            changed = true;

                                                            Order.findOneAndUpdate({$and:[{outletId:outletid},{orderId: eachOrder.orderId}],'foods.itemCode':itemCode},{
                                                                'foods.$.basePrice' : newPrice
                                                            },{safe:true,new:true}, function (err, orderDiscount) {
                                                                if(!err && orderDiscount){
                                                                    if(err) console.log(err);
                                                                }else{
                                                                }
                                                            });

                                                    
                                                        }
                                                    });
                                                }
                                            }
                                        }

                                      if(orders.length-1 == o) {


                                          Order.find({$and:[{outletId:outletid},{orderId:{$in:billedOrderIds}}]}, function (err, orders) {
                                              if(!err && orders){
                                                  for (var i1 = 0; i1 < orders.length; i1++) {
                                                      if (orders[i1].drinks.length > 0) {
                                                          for (var j1 = 0; j1 < orders[i1].drinks.length; j1++) {
                                                              total = total + ((parseFloat(orders[i1].drinks[j1].userPrice)) * orders[i1].drinks[j1].numberofdrinks);
                                                              drinkTotal = drinkTotal + ((parseFloat(orders[i1].drinks[j1].userPrice)) * orders[i1].drinks[j1].numberofdrinks);
                                                          }
                                                      }
                                                      else {
                                                          for (j1 = 0; j1 < orders[i1].foods.length; j1++) {
                                                              total = total + ((parseInt(orders[i1].foods[j1].basePrice)) * orders[i1].foods[j1].numberoffoods);
                                                              foodTotal = foodTotal + ((parseInt(orders[i1].foods[j1].basePrice)) * orders[i1].foods[j1].numberoffoods);
                                                          }
                                                      }
                                                  }
                                                  if (i1 >= orders.length) {
                                                      if(drinkTotal==0){
                                                          billFound.vatOnDrink=0;
                                                          billFound.serviceChargeOnDrink = 0;
                                                          billFound.gst = ((5/100)*foodTotal);
                                                          billFound.serviceChargeOnFood = ((10/100)*foodTotal);

                                                      }
                                                      else if(foodTotal==0){
                                                          billFound.vatOnDrink= ((5/100)*drinkTotal);
                                                          billFound.serviceChargeOnDrink = ((10/100)*drinkTotal);
                                                          billFound.gst = 0;
                                                          billFound.serviceChargeOnFood = 0;

                                                      }else{
                                                          billFound.vatOnDrink= ((5/100)*drinkTotal);
                                                          billFound.serviceChargeOnDrink = ((10/100)*drinkTotal);
                                                          billFound.gst = ((5/100)*foodTotal);
                                                          billFound.serviceChargeOnFood = ((10/100)*foodTotal);
                                                      }


                                                      if (total > 0) {
                                                          res.json({
                                                              success: true,
                                                              data: {billId: billFound.billId},
                                                              error: null
                                                          });
                                                          billFound.totalBill = total;
                                                          billFound.syncStatus = 1;
                                                          billFound.adminId = 0;
                                                          billFound.billDate = date;
                                                          billFound.billTime = time;
                                                          billFound.updated_at = newdate;
                                                          billFound.save(function (err, billSaved) {
                                                              if (!err && billSaved) {



                                                              } else {
                                                                  res.json({
                                                                      success: false,
                                                                      data: null,
                                                                      error: 'Error saving bill'
                                                                  });
                                                              }
                                                          });
                                                      }
                                                      else {
                                                          res.json({
                                                              success: true,
                                                              data: {billId: billFound.billId},
                                                              error: null
                                                          });
                                                      }
                                                  }
                                              }
                                              else{
                                                  console.log(err);
                                              }
                                          });

                                      }
                                    });
                                  
                                }
                                else{
                                    console.log(err);
                                }
                            }).lean();
                        }

                    }
                    else{
                        Order.find({$and:[{outletId:outletid},{tableNumber:tablenumber},{$or:[{status:'confirmed'},{status:'placed'}]}]}, function (err, orders) {
                            if(!err && orders.length>0){
                                orders.forEach(function (eachOrder, o) {
                                    orderid = eachOrder.orderId;
                                    if(eachOrder.status!='cancelled'){
                                        if(eachOrder.drinks.length>0){
                                            if(type == 'drink' && changed == false){
                                                eachOrder.drinks.forEach(function (eachDrink) {
                                                    var drinkTotal = 0;
                                                    drinkTotal = parseFloat(eachDrink.userPrice) * eachDrink.numberofdrinks;
                                                    if(eachDrink.itemCode == itemCode && drinkTotal == parseFloat(oldPrice) /*&& orders[o].drinks[d].numberofdrinks == quantity*/){
                                                        changed = true;
                                                        Order.findOneAndUpdate({$and:[{outletId:outletid},{orderId:eachOrder.orderId}],'drinks.itemCode':itemCode},{
                                                            'drinks.$.userPrice':newPrice
                                                        },{new:true}, function (err, orderUpdated) {
                                                            if(!err && orderUpdated){
                                                                if(orderUpdated.orderType == 'user'){
                                                                    if(orderUpdated.drinks.length>1){
                                                                        Game.findOneAndUpdate({$and:[{outletId:outletid},{orderId:orderUpdated.orderId}], 'drinks.itemCode':itemCode},{
                                                                            'drinks.$.userPrice':newPrice
                                                                        },{safe:true,new:true}, function (err, gameDrinksChanged) {
                                                                            if(!err && gameDrinksChanged!=null){
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
                                                                                User.findOne({userId: gameDrinksChanged.userId}, function (err, userFoundNow) {
                                                                                    if (!err && userFoundNow!=null) {
                                                                                        var sender = new fcm(gcmSenderKeyAndroid);
                                                                                        if (userFoundNow.userAgent == 'android') {
                                                                                            var message1 = {
                                                                                                to: userFoundNow.gcmId,
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
                                                                                                to: userFoundNow.gcmId,
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
                                                                                    } else console.log(err);
                                                                                });


                                                                            }else{
                                                                                console.log(err);
                                                                            }
                                                                        });
                                                                    }
                                                                    else if(orderUpdated.drinks.length == 1){
                                                                        Game.findOneAndUpdate({$and:[{outletId:outletid},{orderId:orderUpdated.orderId}],'drinks.itemCode':itemCode},
                                                                            {
                                                                                'drinks.$.userPrice':newPrice
                                                                            },{new:true}, function (err, gameUpdated) {
                                                                                if(err) console.log(err);
                                                                                else if(!err && gameUpdated!=null){
                                                                                    userid = gameUpdated.userId;
                                                                                    obj={};
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
                                                                                    obj.billId = 0;
                                                                                    gameUpdated.gameStatus = 'finished';
                                                                                    gameUpdated.save(function (err) {
                                                                                        if(err) console.log(err);
                                                                                    });

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

                                                                                }
                                                                            });
                                                                    }
                                                                }
                                                            }
                                                            else{
                                                                console.log(err);
                                                            }
                                                        });

                                                        logObj = {};
                                                  
                                                    }
                                                });
                                            }
                                        }
                                        else if(eachOrder.foods.length>0){
                                            if (type == 'food' && changed == false) {
                                                eachOrder.foods.forEach(function (eachFood) {
                                                    var foodTotal = 0;
                                                    foodTotal = parseInt(eachFood.basePrice) * eachFood.numberoffoods;
                                                    if (eachFood.itemCode == itemCode &&foodTotal==parseInt(oldPrice)/*&& orders[o].foods[f].numberoffoods == quantity*/) {
                                                        changed = true;

                                                        Order.findOneAndUpdate({$and:[{outletId:outletid},{orderId: eachOrder.orderId}],'foods.itemCode':itemCode},{
                                                            'foods.$.basePrice' : newPrice
                                                        },{safe:true,new:true}, function (err, orderDiscount) {
                                                            if(!err && orderDiscount){
                                                                if(err) console.log(err);
                                                            }else{
                                                            }
                                                        });

                                              
                                                    }
                                                });
                                            }
                                        }
                                    }


                                    if(orders.length-1 == o){
                                        res.json({
                                            success:true,
                                            data:{message:'updated orders'},
                                            error:null
                                        });
                                    }
                                });
      
                            }
                            else{
                                console.log(err);
                                res.json({
                                    success:false,
                                    data:null,
                                    error:'No Active orders on that table number'
                                });
                            }
                        }).lean();
                    }
                });
            }
            else{
                console.log(err);
                res.json({
                    success:false,
                    data:null,
                    error:'Error gaining access from POS'
                });
            }
        }).lean();

    }
    else{
        res.json({
            success:false,
            data:null,
            error:'Errorin incoming data'
        });
    }
});

//API to make bill paid
posRoutes.put('/billpaid', function (req, res) {
    var logObj = {
        logTime: String,
        log: String
    };

    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var date = moment(date1).format('YYYY-MM-DD');
    var time = moment(date1).format('HH:mm:ss');
    var dailyLog = new Dailylog;
    function listToArray(fullString, separator) {
        var fullArray = [];

        if (fullString !== undefined) {
            if (fullString.indexOf(separator) == -1) {
                fullArray.push(fullString);
            } else {
                fullArray = fullString.split(separator);
            }
        }
        return fullArray;
    }


    var billIdList = req.body.billId_List;
    console.log(req.body);
    var billIdArray = listToArray(billIdList, ',');
    if (billIdArray.length > 0) {
        for (var b = 0; b < billIdArray.length; b++) {
            Bill.findOneAndUpdate({billId: billIdArray[b]}, {
                status: 'paid'
            }, {safe: true, new:true}, function (err, billpaid) {
                if (!err && billpaid!=null) {

                    for(var u=0;u<billpaid.userIds.length;u++){
                        User.findOneAndUpdate({userId:billpaid.userIds[u].userId}, {
                            gameId:0,
                            lastGameId:0,
                            currentTableNumber:'0'
                        },{safe:true}, function (err, userUpdated) {
                            if(err) console.log(err);
                        });
                    }
                
                    Outlet.findOneAndUpdate({
                        outletId: billpaid.outletId,
                        'tables.tableNumber': billpaid.tableNumber
                    }, {
                        $set: {'tables.$.status': 'vacant'}
                    }, {safe: true,new:true}, function (err, outletUpdated) {
                        if (err) console.log(err);
                    });
               
                }
            });

        }
        if (b >= billIdArray.length) {
            res.json({
                success: true,
                data: {message: 'Successfully Paid'},
                error: null
            });
        }
    }
    else {
        res.json({
            success: true,
            data: {message: 'Bill Id List Empty'},
            error: null
        });
    }
});


posRoutes.get('/byid', function (req, res) {
    var id = req.query.id;
    Order.findById(id, function (err, order) {
     if(!err && order){
         res.json({
             success:true,
             data:order,
             error:null
         })
     }
        else{
         res.json({
             success:false,
             data:null,
             error:'Error finding by id'
         })
     }

    });
});



module.exports = posRoutes;
