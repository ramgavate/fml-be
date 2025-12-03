/**
 * Created by ritej on 5/9/2017.
 */

//Library Inits
var express = require('express');
var mongoose = require('mongoose');
const fcm = require('fcm-node');
const moment = require('moment');
const moment1 = require('moment-timezone');
moment1.tz.setDefault('Asia/Kolkata');

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
const OutletGamePer = require('../models/outletgameper');
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
const Offeravail = require('../models/offeravail');
var Dailylog = require('../models/dailylog');

var usereRoutes = express.Router();
const path = require("path");
usereRoutes.use(express.static(__dirname + '/uploads'));
var { upload } = require('../utils/utils.js')

var gcmSenderKeyAndroid = 'AAAALJErIRw:APA91bFY8TIKhiEf_7h5abk2chqhqg7YJB5-ePZj7_0466XN2M_JrE_qkNKpVkKvMxJQ9J2txwqvnPG52yxC1Vu2J2M_B7a0xYWBXMFr4BNwEULhQLdNR-EMgNkqOjjXvrG7cyAug1h_';



var userRoutes = express.Router();

//Middleware to check User Token
userRoutes.use(function (req, res, next) {
    var usertoken = req.headers['auth_token'];
    if (usertoken) {
        // verifies secret and checks exp
        User.findOne({
            "token": usertoken
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
});//end of middleware to grant user access to routes

//API to get outlets
userRoutes.get('/outlets', function (req, res) {
    var token = req.headers['auth_token'];
    Outlet.find({}, function (err, outletsFound) {
        if (!err && outletsFound) {
            res.json({
                success: true,
                data: {outlets: outletsFound},
                error: null
            });
        } else {
            res.json({
                success: false,
                data: null,
                error: 'error fetching outlets'
            });
        }
    }).sort({outletId: 1}).lean();

});//end of get outlets API

//API to get drink categories
userRoutes.get('/category', function (req, res) {
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
    }).sort({name: 1}).lean();
});//end of API to get categories


//API to get food categories
userRoutes.get('/foodcategory', function (req, res) {
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
    }).sort({sequence: 1}).lean(); //ketki
});//end of API to get categories



//API to place an order
userRoutes.post('/placeorder', function (req, res) {


    var orderObj = req.body;
    var repeat = orderObj.repeat;
    var dailyLog = new Dailylog;
    var order = new Order;
    var game = new Game;
    var orderid;
    var gameid = 1;
    var outletid = req.query.outletId;
    var usr_token = req.headers['auth_token'];
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var date = moment(date1).format('YYYY-MM-DD');
    var time = moment(date1).format('HH:mm:ss');
    var userOrderObj = {};
    var userid;
    var drinkss = [];
    var userAgent;
    var lastUserOrder;
    var drinklength;
    var gameide;
    var userSavingOnGame = 0;
    var neg = false;


    //placeName,userName,tableNumber,drink[]
    for(var dneg=0;dneg<orderObj.drinks.length;dneg++){
        if(parseInt(orderObj.drinks[dneg].userPrice) < 0){
            neg = true;
        }
    }
    if(dneg >= orderObj.drinks.length-1 && neg == false){
        User.findOne({token: usr_token}, function (err, userFound) {
            if (!err && userFound!=null) {
                userid = userFound.userId;
                userSavingOnGame = userFound.userSavingOnGame ? userFound.userSavingOnGame : userSavingOnGame;
                userAgent = userFound.userAgent;
                gameide = userFound.gameId;

                Game.find({},{gameId:1}, function (err, games) {
                    if (!err && games) {
                        Order.find({},{orderId:1}, function (err, orders) {
                            if (!err && orders.length > 0) {
                                if (repeat == true) {
                                    Game.findOneAndUpdate({'$and': [{userId: userFound.userId}, {gameStatus: 'active'}]}, {
                                        gameStatus: 'finished'
                                    }, {safe: true}, function (err, gameUpdated) {
                                        if (!err && gameUpdated) {
                                            User.findOneAndUpdate({userId: userFound.userId}, {
                                                lastGameId: gameUpdated.gameId
                                            }, {safe: true}, function (err) {
                                                if (err) console.log(err);
                                            });
                                        }
                                        else {
                                            console.log(err);
                                        }
                                    });
                                }

                                if (games.length > 0) {
                                    gameid = games[0].gameId + 1;
                                }
                                order.orderId = orders[0].orderId + 1;
                                orderid = orders[0].orderId+1;
                                order.outletId = outletid;
                                order.tableNumber = orderObj.tableNumber;
                                order.status = 'pending';
                                order.name = orderObj.userName;
                                order.userId = userFound.userId;
                                order.orderType = 'user';
                                order.orderDate = date;
                                order.orderTime = time;
                                order.created_at = newdate;
                                order.updated_at = newdate;
                                order.syncStatus = 0;
                                order.drinks = [];
                                order.gameId = gameid;
                                drinklength = orderObj.drinks.length;
                                order.drinks = orderObj.drinks;

                                order.save(function (err, saved) {

                                    if(!err && saved){
                                        game.gameId = gameid;
                                        game.gameStatus = 'inactive';
                                        game.isRepeat = repeat;
                                        game.orderId = saved.orderId;
                                        game.outletId = outletid;
                                        game.tableNumber = orderObj.tableNumber;
                                        game.status = 'pending';
                                        game.name = orderObj.userName;
                                        game.userId = userFound.userId;
                                        game.orderDate = date;
                                        game.orderTime = time;
                                        game.created_at = newdate;
                                        game.updated_at = newdate;
                                        game.drinks = orderObj.drinks;

                                        game.save( async function (err, gameSaved) {
                                            if (!err && gameSaved) {//send admin push notification
                                                User.findOneAndUpdate({token: usr_token}, {
                                                    gameId: gameid,
                                                    updated_at: newdate
                                                }, {safe: true}, function (err) {
                                                    if (err)console.log(err);
                                                });

                                                  //Abhishek
                                                  Outlet.findOneAndUpdate(
                                                    {
                                                        outletId: outletid,
                                                        'tables.tableNumber': orderObj.tableNumber
                                                    },
                                                    {
                                                        $set: {
                                                            'tables.$.status': 'occupied',
                                                            'tables.$.assignedUserId': userFound.userId
                                                        }
                                                    },
                                                    { new: true },
                                                    function (err, updatedOutlet) {
                                                        if (err) {
                                                            console.log(err);
                                                        } else {
                                                            console.log(updatedOutlet);
                                                        }
                                                    }
                                                );

                                                //abhishek 
                                                for (var dneg = 0; dneg < orderObj.drinks.length; dneg++) {
                                                    let differenceSaving = parseInt(orderObj.drinks[dneg].runningPrice) - parseInt(orderObj.drinks[dneg].userPrice)
                                                    userSavingOnGame = userSavingOnGame + differenceSaving;

                                                    User.findOneAndUpdate({ token: usr_token }, {
                                                        userSavingOnGame: userSavingOnGame
                                                    }, { safe: true }, function (err) {
                                                        if (err) console.log(err);
                                                    });
                                                }
                                                console.log(userSavingOnGame)

                                                       //abhishek life time spent
                                                       try {
                                                        User.findOne({ token: usr_token }, function (err, userFound) {
                                                            if (err) {
                                                                console.log('Error finding user: ' + err.message);
                                                                return;
                                                            }
                                                            var userCurrentSpent = userFound.lifeTimeSpent || 0;
                                                            for (var dneg1 = 0; dneg1 < orderObj.drinks.length; dneg1++) {
                                                                let userSpent = parseInt(orderObj.drinks[dneg1].runningPrice);
                                                                userCurrentSpent += userSpent;
                                                            }
                                                            User.findOneAndUpdate({ token: usr_token }, { lifeTimeSpent: userCurrentSpent }, { safe: true }, function (err) {
                                                                if (err) {
                                                                    console.log('Error updating lifeTimeSpent value: ' + err.message);
                                                                } else {
                                                                    console.log('lifeTimeSpent value updated successfully');
                                                                }
                                                            }
                                                            );
                                                        });
                                                    } catch (error) {
                                                        console.log('Error: ' + error.message);
                                                    }
    
    
                                                    //last order date (abhishek)
                                                    let lastOrderDate = date;
                                                    User.findOneAndUpdate({ token: usr_token }, { $set: { lastOrderDate: lastOrderDate } }, function (err, user) {
                                                        if (!err && user) {
                                                            console.log("lastOrderDate Updated", lastOrderDate);
                                                        } else {
                                                            console.log("lastOrderDate Not Updated");
                                                        }
                                                    });
    
    
                                                    // number of visits (abhishek)
                                                    try {
                                                        const userOrders = await Order.find({ userId: userFound.userId });
                                                        let previousOrderDate = null;
                                                        let visitCount = 0;
                                                        for (const order of userOrders) {
                                                            const orderDate = order.orderDate;
                                                            if (!previousOrderDate || previousOrderDate !== orderDate) {
                                                                visitCount++;
                                                            }
                                                            previousOrderDate = orderDate;
                                                        }
                                                        await User.findOneAndUpdate({ token: usr_token }, { numberOfVisits: visitCount }, { new: true, safe: true });
                                                        console.log('number of visit increment by 1')
                                                    } catch (error) {
                                                        console.log('Number of visits failed', error)
                                                    };


                                                 //Percentage count (Abhishek)
                                                 try {
                                                    const Order_Date = moment.utc().add(330, 'minutes');
                                                    const current_Date = new Date(Order_Date); // Get the current date as a Date object
                                                    const startOfDay = new Date(current_Date.getFullYear(), current_Date.getMonth(), current_Date.getDate(), 7, 0, 0);
                                                    let endOfDay = new Date(current_Date.getFullYear(), current_Date.getMonth(), current_Date.getDate(), 6, 59, 59);

                                                    // Adjust the endOfDay date by adding 1 day if it is before startOfDay                
                                                    if (endOfDay.getTime() < startOfDay.getTime()) {
                                                        endOfDay.setDate(endOfDay.getDate() + 1);
                                                    }

                                                    const userOrderCount = await Order.find({ outletId: outletid, updated_at: { $gte: startOfDay, $lte: endOfDay }, drinks: { $exists: true, $not: { $size: 0 } } }).count().exec();
                                                    if (repeat == true) {
                                                        const gameOrderCount = await Game.find({ outletId: outletid, updated_at: { $gte: startOfDay, $lte: endOfDay }, isRepeat: true }).count().exec();
                                                        let percentage = (gameOrderCount / userOrderCount * 100).toFixed(2);
                                                        console.log("user"+userOrderCount+"/"+"game"+gameOrderCount+"*100:"+percentage);

                                                        const outletGamePer = await OutletGamePer.findOne({ outletId: outletid });
                                                        //if outlet not found it create new outlet model
                                                        if (!outletGamePer) { 
                                                            const percentageGame_data = {
                                                                outletId: outletid,
                                                                percentage: [
                                                                    {
                                                                        order_count:userOrderCount,
                                                                        game_count:gameOrderCount,
                                                                        game_per: parseFloat(percentage),
                                                                        game_date: current_Date
                                                                    }
                                                                ]
                                                            };

                                                            const gamePer_add = await OutletGamePer.create(percentageGame_data);
                                                            console.log("Game Percentage created", gamePer_add);

                                                        } else {
                                                            // Check if the last entry is on a previous day
                                                            const lastEntry = outletGamePer.percentage[outletGamePer.percentage.length - 1];

                                                            if (lastEntry && lastEntry.game_date < startOfDay) {
                                                                // Create new object if the last entry is on a previous day
                                                                const newPercentageObj = {
                                                                    order_count:userOrderCount,
                                                                    game_count:gameOrderCount,
                                                                    game_per: parseFloat(percentage),
                                                                    game_date: current_Date
                                                                };

                                                                outletGamePer.percentage.push(newPercentageObj);
                                                                await outletGamePer.save();
                                                                console.log("New Game Percentage created");
                                                            } else {
                                                                // Update the game_per value of the last entry
                                                                const existingPercentageObj = outletGamePer.percentage[outletGamePer.percentage.length - 1];

                                                                existingPercentageObj.game_per = parseFloat(percentage);
                                                                existingPercentageObj.order_count=userOrderCount;
                                                                existingPercentageObj.game_count=gameOrderCount;
                                                                await outletGamePer.save();
                                                                console.log("Game Percentage and order,game value updated");
                                                            }
                                                        }
                                                    }
                                                } catch (err) {
                                                    console.log('Error occurred while calculating game played percentage:', err);
                                                }



                                                Admin.findOne({$and: [{outletId: outletid}, {'tables.tableNumber': orderObj.tableNumber}]}, function (err, adminFound) {
                                                    if (!err && adminFound) {
                                                        var sender = new fcm(gcmSenderKeyAndroid);
                                                        var message1 = {
                                                            to: adminFound.gcmId,
                                                            collapse_key: 'admin',
                                                            priority: 'high',
                                                            contentAvailable: true,
                                                            timeToLive: 3,
                                                            message_type: 'userorderplaced',
                                                            //restrictedPackageName: "somePackageName",
                                                            data: {
                                                                type: "userorderplaced",
                                                                icon: "app_logo",
                                                                title: "DRINKS Order Placed",
                                                                body: "Table No - "+ gameSaved.tableNumber
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
                                                });

                                                res.json({
                                                    success: true,
                                                    data: {gameId: gameid},
                                                    error: null
                                                });


                                            } else console.log(err);
                                        });
                                        var logObj = {
                                            log:String,
                                            logTime: String
                                        };

                                    }

                                });

                            }
                            else if (!err && orders.length == 0) {
                                order.orderId = 1;
                                order.outletId = outletid;
                                order.tableNumber = orderObj.tableNumber;
                                order.status = 'pending';
                                order.orderType = 'user';
                                order.name = orderObj.userName;
                                order.userId = userFound.userId;
                                order.drinks = [];
                                order.orderDate = date;
                                order.orderTime = time;
                                order.syncStatus = 0;
                                order.created_at = newdate;
                                order.updated_at = newdate;

                                var logObj2 = {
                                    log:String,
                                    logTime: String
                                };

                                if (games.length > 0) {
                                    gameid = games[0].gameId + 1;
                                }
                                game.gameId = gameid;
                                order.gameId = gameid;
                                game.gameStatus = 'inactive';
                                game.isRepeat = repeat;
                                game.orderId = 1;
                                game.outletId = outletid;
                                game.tableNumber = orderObj.tableNumber;
                                game.status = 'pending';
                                game.name = orderObj.userName;
                                game.userId = userFound.userId;
                                game.orderDate = date;
                                game.orderTime = time;
                                game.created_at = newdate;
                                game.updated_at = newdate;
                                game.drinks = [];
                                for (var i1 = 0; i1 < orderObj.drinks.length; i1++) {
                                    order.drinks.push(orderObj.drinks[i1]);
                                    game.drinks.push(orderObj.drinks[i1]);

                                }

                                if (i1 == orderObj.drinks.length) {
                                    //obj.orderTotal = temp;
                                    User.findOneAndUpdate({token: usr_token}, {
                                        gameId: gameid,
                                        updated_at: newdate
                                    }, {safe: true}, function (err) {
                                        if (err)console.log(err);
                                    });
                                    order.save(function (err, saved) {
                                        if (!err && saved) {
                                            game.save(function (err, gameSaved) {
                                                if (!err && gameSaved) {
                                                    //send admin push notification
                                                    Admin.findOne({$and: [{outletId: outletid}, {'tables.tableNumber': orderObj.tableNumber}]}, function (err, adminFound) {
                                                        if (!err && adminFound) {
                                                            var sender = new fcm(gcmSenderKeyAndroid);
                                                            var message1 = {
                                                                to: adminFound.gcmId,
                                                                collapse_key: 'admin',
                                                                priority: 'high',
                                                                contentAvailable: true,
                                                                timeToLive: 3,
                                                                message_type: 'User Order Placed',
                                                                //restrictedPackageName: "somePackageName",
                                                                data: {
                                                                    type: "userorderplaced",
                                                                    icon: "app_logo",
                                                                    title: "DRINKS Order Placed",
                                                                    body: "Table No - "+ gameSaved.tableNumber
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
                                                    });

                                                    res.json({
                                                        success: true,
                                                        data: {gameId: gameid},
                                                        error: null
                                                    });
                                                } else console.log(err);
                                            })
                                        } else {
                                            res.json({
                                                success: false,
                                                data: null,
                                                error: 'Error Placing Order!!'
                                            });
                                        }
                                    });
                                }
                            }
                            if (err){
                                console.log(err);
                                res.json({
                                    success:false,
                                    data:null,
                                    error:'Error fetching orders'
                                })
                            }
                        }).sort({orderId: -1}).limit(2).lean();
                    } else console.log(err);
                }).sort({gameId: -1}).limit(2).lean();
            } else console.log(err);
        }).lean();
    }else{
        res.json({
            success:false,
            data:null,
            error: 'Error placing order, negative value'
        });
    }
});//and of API to post order

//API to place Order Admin
userRoutes.post('/placefoodorder', function (req, res) {

        var token = req.headers['auth_token'];
        var orderObj = req.body;
        var order = new Order;
        var outletid = req.query.outletId;
        var date1 = moment.utc().add(330, 'minutes');
        var newdate = new Date(date1);
        var date = moment(date1).format('YYYY-MM-DD');
        var time = moment(date1).format('HH:mm:ss');
        var userid;
        var dailyLog = new Dailylog;
        User.findOne({token: token}, function (err, adminFound) {
            if (!err && adminFound) {
                userid = adminFound.userId;
                Order.find({},{orderId:1}, function (err, orders) {
                    if (!err && orders) {
                        var orderid = 0;
                        if (orders.length > 0) {
                            orderid = orders[0].orderId + 1;
                        } else {
                            orderid = 1;
                        }
                        order.orderId = orderid;
                        order.outletId = outletid;
                        order.tableNumber = orderObj.tableNumber;
                        order.status = 'pending';
                        order.userId = adminFound.userId;
                        order.orderType = 'user';
                        order.orderDate = date;
                        order.orderTime = time;
                        order.confirmTime = time;
                        order.created_at = newdate;
                        order.updated_at = newdate;
                        order.syncStatus = 0;
                        order.gameId = 0;
                        order.foods = [];
                        order.drinks = [];

                        var logObj = {
                            log:String,
                            logTime: String
                        };


                        for (var i = 0; i < orderObj.foodList.length; i++) {
                            var foodObj = {
                                foodId: orderObj.foodList[i].foodId,
                                foodType: orderObj.foodList[i].foodType,
                                name: orderObj.foodList[i].name,
                                basePrice: orderObj.foodList[i].basePrice,
                                available: orderObj.foodList[i].available,
                                numberoffoods: orderObj.foodList[i].numberoffoods,
                                itemCode: orderObj.foodList[i].itemCode,
                                delivered:false,
                                remark: '',
                                skucode:  orderObj.foodList[i].skucode,
                            };
                            order.foods.push(foodObj);
                        }
                        if (i >= orderObj.foodList.length) {
                            Outlet.findOneAndUpdate({
                                outletId: outletid,
                                'tables.tableNumber': orderObj.tableNumber
                            }, {
                                $set: {'tables.$.status': 'occupied','tables.$.assignedUserId': adminFound.userId}
                            }, {safe: true, new: true}, function (err, outletFound) {
                                if (!err && outletFound) {

                                    order.save( async function (err, saved) {
                                        if (!err && saved) {
                                                  // lastorder date (Abhishek)
                                        var lastOrderDate = date;
                                        User.findOneAndUpdate({ token: token }, { $set: { lastOrderDate: lastOrderDate } }, function (err, user) {
                                            if (!err && user) {
                                                console.log("lastOrderDate Updated", lastOrderDate);
                                            } else {
                                                console.log("lastOrderDate Not Updated");
                                            }
                                        });

                                        //Abhishek Update the user's lifeTimeSpent
                                        User.findOne({ token: token }, function (err, userFound) {
                                            if (err) {
                                                console.log('Error finding user: ' + err.message);
                                                return;
                                            }
                                            var userCurrentSpent = userFound.lifeTimeSpent || 0;
                                            for (var i = 0; i < orderObj.foodList.length; i++) {
                                                var userSpent = parseInt(orderObj.foodList[i].basePrice);
                                                userCurrentSpent += userSpent;
                                            }
                                            User.findOneAndUpdate({ token: token }, { lifeTimeSpent: userCurrentSpent }, { safe: true }, function (err) {
                                                if (err) {
                                                    console.log('Error updating lifeTimeSpent value: ' + err.message);
                                                } else {
                                                    console.log('lifeTimeSpent value updated successfully');
                                                }
                                            });
                                        });

                                        //Number of visits (abhishek)
                                        try {
                                            const userOrders = await Order.find({ userId: adminFound.userId });
                                            let previousOrderDate = null;
                                            let visitCount = 0;
                                            for (const order of userOrders) {
                                                const orderDate = order.orderDate;
                                                if (!previousOrderDate || previousOrderDate !== orderDate) {
                                                    visitCount++;
                                                }
                                                previousOrderDate = orderDate;
                                            }
                                            await User.findOneAndUpdate({ token: token }, { numberOfVisits: visitCount }, { new: true, safe: true });
                                            console.log('number of visit increment by 1')
                                        } catch (error) {
                                            console.log('Number of visits failed', error)
                                        }
                                            //send admin push notification
                                            Admin.findOne({$and: [{outletId: outletid}, {'tables.tableNumber': orderObj.tableNumber}]}, function (err, adminFound) {
                                                if (!err && adminFound) {
                                                    var sender = new fcm(gcmSenderKeyAndroid);
                                                    var message1 = {
                                                        to: adminFound.gcmId,
                                                        collapse_key: 'admin',
                                                        priority: 'high',
                                                        contentAvailable: true,
                                                        timeToLive: 3,
                                                        message_type: 'User Order Placed',
                                                        //restrictedPackageName: "somePackageName",
                                                        data: {
                                                            type: "userorderplaced",
                                                            icon: "app_logo",
                                                            title: "FOOD Order Placed",
                                                            body: "Table No - " + orderObj.tableNumber
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
                                            });
                                            res.json({
                                                success: true,
                                                data: {message: 'Order Updated'},
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
                                } else {
                                    console.log(err);
                                    res.json({
                                        success: false,
                                        data: null,
                                        error: 'Error Placing Order!!'
                                    });
                                }
                            });//end of outlet findone and update
                        }
                    } else {
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


});//end of API for admin to place order



//API to get Game Status
userRoutes.get('/game', function (req, res) {
    var token = req.headers['auth_token'];
    var obj = {};
    User.findOne({token: token}, function (err, userFound) {
        if (!err && userFound) {
            if (userFound.gameId > 0) {
                Game.findOne({gameId: userFound.gameId}, function (err, gameFound) {
                    if (!err && gameFound != null) {
                        res.json({
                            success: true,
                            data: gameFound,
                            error: null
                        });
                    }
                    else {
                        console.log(err);
                        res.json({
                            success: true,
                            data: obj,
                            error: null
                        });
                    }
                }).lean();
            }
            else {
                res.json({
                    success: true,
                    data: obj,
                    error: null
                });
            }
        } else console.log(err);
    }).lean();
});

//API to get user game status
userRoutes.get('/gamestatus', function (req, res) {
    var token = req.headers['auth_token'];
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var outletId,tableNumber;
    var date = moment(date1).format('YYYY-MM-DD');
    var obj2 = {};
    var time = moment(date1).format('HH:mm:ss');
    var bill = new Bill;
    var total = 0;
    var userids = [];
    var userid;
    var outletid,outletid2;
    var drinkTotal=0,foodTotal=0;
    var gst, serviceChargeOnFood, serviceChargeOnDrink, vatOnDrink;
    User.findOne({token: token}, function (err, userFound) {
        if (!err && userFound != null) {
            if (userFound.gameId > 0) {
                userid = userFound.userId;
                Game.findOne({gameId: userFound.gameId}, function (err, gameFound) {
                    if (!err && gameFound != null) {

                        outletId = gameFound.outletId;
                        tableNumber = gameFound.tableNumber;
                        if(gameFound.gameStatus == 'finished'){

                            gameFound.gameStatus = 'finished';
                            gameFound.save(function (err, finishedGame) {
                                if(!err && finishedGame){
                                    res.json({
                                        success: true,
                                        data: {gamestatus: 'finished'},
                                        error: null
                                    });

                                }
                            });

                            Bill.findOne({$and:[{outletId:outletId},{tableNumber:tableNumber},{$or:[{status:'requested'},{status:'unpaid'}]}]}, function (err, billFound) {
                                if(!err && billFound!=null){
                                    Order.find({$and: [{outletId: outletId}, {tableNumber: tableNumber}, {$or: [{status: 'placed'}, {status: 'confirmed'}]}]}, function (err, orders) {
                                        if (!err && orders) {
                                            if (orders.length > 0) {

                                                for (var i = 0; i < orders.length; i++) {

                                                    if (orders[i].drinks.length > 0) {
                                                        var orderObj = {};
                                                        orderObj.orderId = orders[i].orderId;
                                                        billFound.orderIds.push(orderObj);
                                                        for (var j = 0; j < orders[i].drinks.length; j++) {
                                                            total = total + ((parseInt(orders[i].drinks[j].userPrice)) * orders[i].drinks[j].numberofdrinks);
                                                            drinkTotal = drinkTotal + ((parseInt(orders[i].drinks[j].userPrice)) * orders[i].drinks[j].numberofdrinks);
                                                        }
                                                    }
                                                    else {
                                                        orderObj = {};
                                                        orderObj.orderId = orders[i].orderId;
                                                        billFound.orderIds.push(orderObj);
                                                        for (j = 0; j < orders[i].foods.length; j++) {
                                                            total = total + ((parseInt(orders[i].foods[j].basePrice)) * orders[i].foods[j].numberoffoods);
                                                            foodTotal = foodTotal + ((parseInt(orders[i].foods[j].basePrice)) * orders[i].foods[j].numberoffoods);
                                                        }
                                                    }

                                                }
                                                if (i >= orders.length) {
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
                                                            for (var a = 0; a < orders.length; a++) {
                                                                if (orders[a].gameId > 0) {
                                                                    if (userids.indexOf(orders[a].userId) == -1) {
                                                                        userids.push(orders[a].userId);
                                                                    }
                                                                }
                                                                Order.findByIdAndUpdate(orders[a]._id.toString(), {
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
                                                                                    obj2.gameId = gameUpdated.gameId;
                                                                                    obj2.gameStatus = gameUpdated.gameStatus;
                                                                                    obj2.tableNumber = gameUpdated.tableNumber;
                                                                                    obj2.orderId = gameUpdated.orderId;
                                                                                    obj2.status = gameUpdated.status;
                                                                                    obj2.outletId = gameUpdated.outletId;
                                                                                    obj2.userId = gameUpdated.userId;
                                                                                    obj2.userName = gameUpdated.userName;
                                                                                    obj2.orderDate = gameUpdated.orderDate;
                                                                                    obj2.orderTime = gameUpdated.orderTime;
                                                                                    obj2.billId = billFound.billId;

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
                                                                                                        game: obj2,
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
                                                                                                        alert:'Game is over'
                                                                                                    },
                                                                                                    data: {
                                                                                                        type: "gamefinished",
                                                                                                        game: obj2,
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
                                                                    var check = false;
                                                                    for(var bo=0;bo<billFound.userIds.length;bo++){
                                                                    if(billFound.userIds[bo].userId == userids[uid]){
                                                                        check = true;
                                                                    }
                                                                    }
                                                                    if(bo>=billFound.userIds.length && check == false){
                                                                        billFound.userIds.push({userId: userids[uid]});
                                                                    }

                                                                }
                                                                if(uid>=userids.length){
                                                                    billFound.totalBill = billFound.totalBill+total;
                                                                    billFound.billDate = date;
                                                                    billFound.billTime = time;
                                                                    billFound.generatedBy = 'USER';
                                                                    billFound.gst = billFound.gst+gst;
                                                                    billFound.serviceChargeOnFood = billFound.serviceChargeOnFood+serviceChargeOnFood;
                                                                    billFound.serviceChargeOnDrink = billFound.serviceChargeOnDrink+serviceChargeOnDrink;
                                                                    billFound.vatOnDrink = vatOnDrink;
                                                                    billFound.created_at = newdate;
                                                                    billFound.updated_at = newdate;
                                                                    billFound.save(function (err, billSaved) {
                                                                        if (!err && billSaved) {

                                                                        } else {
                                                                            console.log(err);
                                                                        }
                                                                    });
                                                                }

                                                            }

                                                }
                                            }
                                            else {

                                            }
                                        }
                                    }).sort({orderId: -1});
                                }
                                else{
                                    Order.find({$and: [{outletId: outletId}, {tableNumber: tableNumber}, {$or: [{status: 'placed'}, {status: 'confirmed'}]}]}, function (err, orders) {
                                        if (!err && orders) {
                                            if (orders.length > 0) {

                                                for (var i = 0; i < orders.length; i++) {

                                                    if (orders[i].drinks.length > 0) {
                                                        var orderObj = {};
                                                        orderObj.orderId = orders[i].orderId;
                                                        bill.orderIds.push(orderObj);
                                                        for (var j = 0; j < orders[i].drinks.length; j++) {
                                                            total = total + ((parseInt(orders[i].drinks[j].userPrice)) * orders[i].drinks[j].numberofdrinks);
                                                            drinkTotal = drinkTotal + ((parseInt(orders[i].drinks[j].userPrice)) * orders[i].drinks[j].numberofdrinks);
                                                        }
                                                    }
                                                    else {
                                                        orderObj = {};
                                                        orderObj.orderId = orders[i].orderId;
                                                        bill.orderIds.push(orderObj);
                                                        for (j = 0; j < orders[i].foods.length; j++) {
                                                            total = total + ((parseInt(orders[i].foods[j].basePrice)) * orders[i].foods[j].numberoffoods);
                                                            foodTotal = foodTotal + ((parseInt(orders[i].foods[j].basePrice)) * orders[i].foods[j].numberoffoods);
                                                        }
                                                    }

                                                }
                                                if (i >= orders.length) {
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

                                                    Bill.find({}, function (err, bills) {
                                                        if (!err && bills) {
                                                            var billid = 0;
                                                            if (bills.length > 0) {
                                                                billid = bills[0].billId + 1;
                                                            } else billid = 1;
                                                            for (var a = 0; a < orders.length; a++) {
                                                                if (orders[a].gameId > 0) {
                                                                    if (userids.indexOf(orders[a].userId) == -1) {
                                                                        userids.push(orders[a].userId);
                                                                    }
                                                                }
                                                                Order.findByIdAndUpdate(orders[a]._id.toString(), {
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
                                                                                    obj2.gameId = gameUpdated.gameId;
                                                                                    obj2.gameStatus = gameUpdated.gameStatus;
                                                                                    obj2.tableNumber = gameUpdated.tableNumber;
                                                                                    obj2.orderId = gameUpdated.orderId;
                                                                                    obj2.status = gameUpdated.status;
                                                                                    obj2.outletId = gameUpdated.outletId;
                                                                                    obj2.userId = gameUpdated.userId;
                                                                                    obj2.userName = gameUpdated.userName;
                                                                                    obj2.orderDate = gameUpdated.orderDate;
                                                                                    obj2.orderTime = gameUpdated.orderTime;
                                                                                    obj2.billId = billid;

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
                                                                                                        game: obj2,
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
                                                                                                        alert:'Game is over'
                                                                                                    },
                                                                                                    data: {
                                                                                                        type: "gamefinished",
                                                                                                        game: obj2,
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
                                                                bill.outletId = outletId;
                                                                bill.adminId = userid;
                                                                bill.billDate = date;
                                                                bill.billTime = time;
                                                                bill.generatedBy = 'USER';
                                                                bill.gst = gst;
                                                                bill.serviceChargeOnFood = serviceChargeOnFood;
                                                                bill.serviceChargeOnDrink = serviceChargeOnDrink;
                                                                bill.vatOnDrink = vatOnDrink;
                                                                bill.created_at = newdate;
                                                                bill.updated_at = newdate;
                                                                bill.save(function (err, billSaved) {
                                                                    if (!err && billSaved) {

                                                                    } else {

                                                                    }
                                                                });
                                                            }
                                                        }
                                                    }).sort({billId:-1}).limit(20).lean();
                                                }
                                            }
                                            else {

                                            }
                                        }
                                    }).sort({orderId: -1});
                                }
                            })
                        }
                        if(gameFound.gameStatus == 'inactive'){
                            res.json({
                                success: true,
                                data: {
                                    gamestatus: gameFound.gameStatus
                                },
                                error: null
                            });
                        }
                        if(gameFound.gameStatus == 'active'){
                            var startTime=moment(gameFound.startTime, "HH:mm:ss");
                            var endTime=moment(time, "HH:mm:ss");
                            var duration = moment.duration(endTime.diff(startTime));
                            var hours = parseInt(duration.asHours());
                            var minutes = parseInt(duration.asMinutes())-hours*60;
                            var secs = minutes*60;
                            var temp ;
                            Gamevalue.findOne({}, function (err, gameValues) {
                                if(!err && gameValues!=null){
                                    temp = (parseInt(gameValues.seconds))/1000;
                                    total = parseInt(temp);
                                    if(total>secs){
                                        res.json({
                                            success: true,
                                            data: {
                                                gamestatus: gameFound.gameStatus,
                                                currentTime: time,
                                                startTime: gameFound.startTime
                                            },
                                            error: null
                                        });
                                    }//end of total
                                    else if(total<=secs){
                                        gameFound.gameStatus = 'finished';
                                        gameFound.save(function (err, finishedGame) {
                                            if(!err&&finishedGame){
                                                res.json({
                                                    success: true,
                                                    data: {gamestatus: 'finished'},
                                                    error: null
                                                });

                                            }
                                        });

                                        Bill.findOne({$and:[{outletId:outletId},{tableNumber:tableNumber},{$or:[{status:'requested'},{status:'unpaid'}]}]}, function (err, billFound) {
                                            if(!err && billFound!=null){
                                                Order.find({$and: [{outletId: outletId}, {tableNumber: tableNumber}, {$or: [{status: 'placed'}, {status: 'confirmed'}]}]}, function (err, orders) {
                                                    if (!err && orders) {
                                                        if (orders.length > 0) {

                                                            for (var i = 0; i < orders.length; i++) {

                                                                if (orders[i].drinks.length > 0) {
                                                                    var orderObj = {};
                                                                    orderObj.orderId = orders[i].orderId;
                                                                    billFound.orderIds.push(orderObj);
                                                                    for (var j = 0; j < orders[i].drinks.length; j++) {
                                                                        total = total + ((parseInt(orders[i].drinks[j].userPrice)) * orders[i].drinks[j].numberofdrinks);
                                                                        drinkTotal = drinkTotal + ((parseInt(orders[i].drinks[j].userPrice)) * orders[i].drinks[j].numberofdrinks);
                                                                    }
                                                                }
                                                                else {
                                                                    orderObj = {};
                                                                    orderObj.orderId = orders[i].orderId;
                                                                    billFound.orderIds.push(orderObj);
                                                                    for (j = 0; j < orders[i].foods.length; j++) {
                                                                        total = total + ((parseInt(orders[i].foods[j].basePrice)) * orders[i].foods[j].numberoffoods);
                                                                        foodTotal = foodTotal + ((parseInt(orders[i].foods[j].basePrice)) * orders[i].foods[j].numberoffoods);
                                                                    }
                                                                }

                                                            }
                                                            if (i >= orders.length) {
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
                                                                for (var uid = 0; uid < userids.length; uid++) {
                                                                    var check=false;
                                                                    for(var bi=0;bi<billFound.userIds.length;bi++) {
                                                                        if(billFound.userIds[bi].userId == userids[uid]) {
                                                                        check = true;
                                                                        }
                                                                    }
                                                                    if(bi>=billFound.userIds.length && check==false) {
                                                                        billFound.userIds.push({userId: userids[uid]});
                                                                    }
                                                                }
                                                                if(uid>=userids.length){
                                                                    billFound.totalBill = billFound.totalBill+total;
                                                                    billFound.billDate = date;
                                                                    billFound.billTime = time;
                                                                    billFound.generatedBy = 'USER';
                                                                    billFound.gst = billFound.gst+gst;
                                                                    billFound.serviceChargeOnFood = billFound.serviceChargeOnFood+serviceChargeOnFood;
                                                                    billFound.serviceChargeOnDrink = billFound.serviceChargeOnDrink+serviceChargeOnDrink;
                                                                    billFound.vatOnDrink = billFound.vatOnDrink+vatOnDrink;
                                                                    billFound.updated_at = newdate;
                                                                    billFound.save(function (err, billSaved) {
                                                                        if (!err && billSaved) {

                                                                        } else {

                                                                        }
                                                                    });
                                                                }
                                                            }

                                                            }
                                                        } else {
                                                            res.json({
                                                                success: true,
                                                                data: {message: 'No Orders'},
                                                                error: null
                                                            });
                                                        }

                                                }).sort({orderId: -1});
                                            }
                                            else{
                                                Order.find({$and: [{outletId: outletId}, {tableNumber: tableNumber}, {$or: [{status: 'placed'}, {status: 'confirmed'}]}]}, function (err, orders) {
                                                    if (!err && orders) {
                                                        if (orders.length > 0) {

                                                            for (var i = 0; i < orders.length; i++) {

                                                                if (orders[i].drinks.length > 0) {
                                                                    var orderObj = {};
                                                                    orderObj.orderId = orders[i].orderId;
                                                                    bill.orderIds.push(orderObj);
                                                                    for (var j = 0; j < orders[i].drinks.length; j++) {
                                                                        total = total + ((parseInt(orders[i].drinks[j].userPrice)) * orders[i].drinks[j].numberofdrinks);
                                                                        drinkTotal = drinkTotal + ((parseInt(orders[i].drinks[j].userPrice)) * orders[i].drinks[j].numberofdrinks);
                                                                    }
                                                                }
                                                                else {
                                                                    orderObj = {};
                                                                    orderObj.orderId = orders[i].orderId;
                                                                    bill.orderIds.push(orderObj);
                                                                    for (j = 0; j < orders[i].foods.length; j++) {
                                                                        total = total + ((parseInt(orders[i].foods[j].basePrice)) * orders[i].foods[j].numberoffoods);
                                                                        foodTotal = foodTotal + ((parseInt(orders[i].foods[j].basePrice)) * orders[i].foods[j].numberoffoods);
                                                                    }
                                                                }

                                                            }
                                                            if (i >= orders.length) {
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

                                                                Bill.find({}, function (err, bills) {
                                                                    if (!err && bills) {
                                                                        var billid = 0;
                                                                        if (bills.length > 0) {
                                                                            billid = bills[0].billId + 1;
                                                                        } else billid = 1;
                                                                        for (var a = 0; a < orders.length; a++) {
                                                                            if (orders[a].gameId > 0) {
                                                                                if (userids.indexOf(orders[a].userId) == -1) {
                                                                                    userids.push(orders[a].userId);
                                                                                }
                                                                            }
                                                                            Order.findByIdAndUpdate(orders[a]._id.toString(), {
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
                                                                                                obj2.gameId = gameUpdated.gameId;
                                                                                                obj2.gameStatus = gameUpdated.gameStatus;
                                                                                                obj2.tableNumber = gameUpdated.tableNumber;
                                                                                                obj2.orderId = gameUpdated.orderId;
                                                                                                obj2.status = gameUpdated.status;
                                                                                                obj2.outletId = gameUpdated.outletId;
                                                                                                obj2.userId = gameUpdated.userId;
                                                                                                obj2.userName = gameUpdated.userName;
                                                                                                obj2.orderDate = gameUpdated.orderDate;
                                                                                                obj2.orderTime = gameUpdated.orderTime;
                                                                                                obj2.billId = billid;

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
                                                                                                                    game: obj2,
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
                                                                                                                    alert:'Game is over'
                                                                                                                },
                                                                                                                data: {
                                                                                                                    type: "gamefinished",
                                                                                                                    game: obj2,
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
                                                                            bill.syncStatus = userid;
                                                                            bill.outletId = outletId;
                                                                            bill.adminId = 0;
                                                                            bill.billDate = date;
                                                                            bill.billTime = time;
                                                                            bill.generatedBy = 'USER';
                                                                            bill.gst = gst;
                                                                            bill.serviceChargeOnFood = serviceChargeOnFood;
                                                                            bill.serviceChargeOnDrink = serviceChargeOnDrink;
                                                                            bill.vatOnDrink = vatOnDrink;
                                                                            bill.created_at = newdate;
                                                                            bill.updated_at = newdate;
                                                                            bill.save(function (err, billSaved) {
                                                                                if (!err && billSaved) {

                                                                                } else {

                                                                                }
                                                                            });
                                                                        }
                                                                    }
                                                                }).sort({billId:-1}).limit(20).lean();
                                                            }
                                                        } else {
                                                            res.json({
                                                                success: true,
                                                                data: {message: 'No Orders'},
                                                                error: null
                                                            });
                                                        }
                                                    }
                                                }).sort({orderId: -1});
                                            }
                                        });
                                    }//end of total<=secs
                                }
                                else{
                                    res.json({
                                        success: false,
                                        data: null,
                                        error: 'Error finding your game, contact DB Admin'
                                    });
                                }
                            });
                        }
                    }
                    else {
                        res.json({
                            success: false,
                            data: null,
                            error: 'Error finding your game, contact DB Admin'
                        });
                    }
                });
            }
            else {
                res.json({
                    success: true,
                    data: {gamestatus: 'finished'},
                    error: null
                });
            }
        }
        else {
            console.log(err);
            res.json({
                success: false,
                data: null,
                error: 'Error finding user with provided token'
            });
        }
    });
});

//API to request bill from user
userRoutes.post('/requestbill', function (req, res) {
    var token = req.headers['auth_token'];
    var bill = new Bill;
    var total = 0;
    var useridnew;
    var tableNumber = req.query.tableNumber;
    var outletId = req.query.outletId;
    var userids = [];
    var userid;
    var obj2 = {};
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var date = moment(date1).format('YYYY-MM-DD');
    var time = moment(date1).format('HH:mm:ss');
    var drinkTotal=0,foodTotal=0;
    var ordersMain;
    var orderidbill = [];
    var obj = {};
    var gst, serviceChargeOnFood, serviceChargeOnDrink, vatOnDrink;
    var dailyLog = new Dailylog;

    User.findOne({token: token}, function (err, userFound) {
        if (!err && userFound) {
            userids.push(userFound.userId);
            userid = userFound.userId;
            Game.findOne({gameId:userFound.gameId}, function (err, gameFound) {
                if(!err && gameFound!=null){
                    if(gameFound.status == 'billing'){
                        Bill.findOne({'orderIds.orderId':gameFound.orderId}, function (err, billFound) {
                            if(!err && billFound!=null){
                                var orderids = [];
                                for(var b=0;b<billFound.orderIds.length;b++){
                                    orderids.push(billFound.orderIds[b].orderId);
                                }
                                if(b>=billFound.orderIds.length){
                                    Order.find({$and:[{orderId:{$in:orderids}},{outletId: billFound.outletId},{tableNumber:billFound.tableNumber}]}, function (err, billOrders) {
                                        if(!err && billOrders){
                                            var obj = {};
                                            obj.billId = billFound.billId;
                                            obj.requestedBy = userid;
                                            obj.tableNumber = billFound.tableNumber;
                                            obj.billDate = billFound.billDate;
                                            obj.billTime = billFound.billTime;
                                            obj.totalBill = billFound.totalBill;
                                            obj.status = billFound.status;
                                            obj.orderIds = billFound.orderIds;
                                            obj.outletId = billFound.outletId;
                                            obj.userIds = billFound.userIds;
                                            obj.adminId = billFound.adminId;
                                            obj.orders = [];
                                            for (var j = 0; j < billOrders.length; j++) {
                                                obj.orders.push(billOrders[j]);
                                            }
                                            if (j >= billOrders.length) {
                                                res.json({
                                                    success: true,
                                                    data: obj,
                                                    error: null
                                                });
                                            }
                                        }else{
                                            console.log(err);
                                            res.json({
                                                success:false,
                                                data:null,
                                                error:'Error fetching Orders in Bill'
                                            });
                                        }
                                    }).sort({orderId:-1}).lean();
                                }
                            }else{
                                console.log(err);
                                res.json({
                                    success:false,
                                    data:null,
                                    error:'Error fetching bill'
                                });
                            }
                        });
                        gameFound.gameStatus = 'finished';
                        gameFound.save(function (err) {
                            if(err) console.log(err);
                        });
                    }
                    else{
                        Order.find({$and:[{outletId: outletId},{tableNumber: tableNumber},{$or:[{status:'placed'},{status:'confirmed'}]}]}, function (err, orders) {
                            if (!err && orders) {
                                ordersMain = orders;
                                Bill.findOne({$and:[{$or:[{status:'unpaid'},{status:'requested'}]},{tableNumber:tableNumber},{outletId:outletId}]}, function (err, billFound) {
                                    if(!err && billFound!=null){
                                        if (ordersMain.length > 0) {
                                            for (var i1 = 0; i1 < ordersMain.length; i1++) {
                                                if (ordersMain[i1].gameId > 0) {
                                                    if (userids.indexOf(ordersMain[i1].userId) == -1) {
                                                        userids.push(ordersMain[i1].userId);
                                                    }
                                                }
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
                                                    orderObj1 = {};
                                                    orderObj1.orderId = ordersMain[i1].orderId;
                                                    billFound.orderIds.push(orderObj1);
                                                    for (j1 = 0; j1 < ordersMain[i1].foods.length; j1++) {
                                                        total = total + ((parseInt(ordersMain[i1].foods[j1].basePrice)) * ordersMain[i1].foods[j1].numberoffoods);
                                                        foodTotal = foodTotal + ((parseInt(ordersMain[i1].foods[j1].basePrice)) * ordersMain[i1].foods[j1].numberoffoods);
                                                    }
                                                }


                                            }
                                            if (i1 >= ordersMain.length) {
                                                if(drinkTotal==0){
                                                    billFound.vatOnDrink=billFound.vatOnDrink+0;
                                                    billFound.serviceChargeOnDrink = billFound.serviceChargeOnDrink+0;
                                                    billFound.gst = billFound.gst+((5/100)*foodTotal);
                                                    billFound.serviceChargeOnFood = billFound.serviceChargeOnFood+((10/100)*foodTotal);

                                                }
                                                else if(foodTotal==0){
                                                    billFound.vatOnDrink= billFound.vatOnDrink+((5/100)*drinkTotal);
                                                    billFound.serviceChargeOnDrink = billFound.serviceChargeOnDrink+((10/100)*drinkTotal);
                                                    billFound.gst = billFound.gst +0;
                                                    billFound.serviceChargeOnFood= billFound.serviceChargeOnFood+0;

                                                }else{
                                                    billFound.vatOnDrink= billFound.vatOnDrink+((5/100)*drinkTotal);
                                                    billFound.serviceChargeOnDrink = billFound.serviceChargeOnDrink +((10/100)*drinkTotal);
                                                    billFound.gst = billFound.gst +((5/100)*foodTotal);
                                                    billFound.serviceChargeOnFood = billFound.serviceChargeOnFood +((10/100)*foodTotal);
                                                }
                                                for (var a = 0; a < ordersMain.length; a++) {
                                                    Order.findByIdAndUpdate(ordersMain[a]._id.toString(), {
                                                        status: 'billed',
                                                        updated_at: newdate
                                                    }, {safe: true, new: true}, function (err, updatedOrder) {
                                                        if (!err && updatedOrder) {
                                                            if (updatedOrder.orderType == 'user' && updatedOrder.drinks.length>0) {

                                                                    Game.findOneAndUpdate({gameId: updatedOrder.gameId}, {
                                                                        gameStatus: 'finished',
                                                                        status: 'billing'
                                                                    }, {safe: true, new: true}, function (err, gameUpdated) {
                                                                        if (!err && gameUpdated) {

                                                                            useridnew = gameUpdated.userId;

                                                                            if(useridnew!=userid){
                                                                                obj2.gameId = gameUpdated.gameId;
                                                                                obj2.gameStatus = gameUpdated.gameStatus;
                                                                                obj2.tableNumber = gameUpdated.tableNumber;
                                                                                obj2.orderId = gameUpdated.orderId;
                                                                                obj2.status = gameUpdated.status;
                                                                                obj2.outletId = gameUpdated.outletId;
                                                                                obj2.userId = gameUpdated.userId;
                                                                                obj2.userName = gameUpdated.userName;
                                                                                obj2.orderDate = gameUpdated.orderDate;
                                                                                obj2.orderTime = gameUpdated.orderTime;
                                                                                obj2.billId = billFound.billId;

                                                                                User.findOneAndUpdate({userId: useridnew}, {
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
                                                                                                    game: obj2,
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
                                                                                                    alert:'Game is over'
                                                                                                },
                                                                                                data: {
                                                                                                    type: "gamefinished",
                                                                                                    game: obj2,
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

                                                                            Outlet.findOneAndUpdate({
                                                                                outletId: outletId,
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
                                                                        else {
                                                                            console.log(err);
                                                                        }
                                                                    });


                                                            } else {
                                                                Outlet.findOneAndUpdate({
                                                                    outletId: outletId,
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
                                                    console.log(total);
                                                    billFound.totalBill = billFound.totalBill + total;
                                                    billFound.adminId = 0;
                                                    billFound.billDate = date;
                                                    billFound.billTime = time;
                                                    billFound.generatedBy = 'USER';
                                                    billFound.updated_at = newdate;
                                                    var logObj = {
                                                        log:String,
                                                        logTime: String
                                                    };
                                    
                                                    
                                                    billFound.save(function (err, billSaved) {
                                                        if (!err && billSaved) {

                                                            obj = {};
                                                            obj.billId = billSaved.billId;
                                                            obj.tableNumber = billSaved.tableNumber;
                                                            obj.billDate = billSaved.billDate;
                                                            obj.billTime = billSaved.billTime;
                                                            obj.totalBill = billSaved.totalBill;
                                                            obj.status = billSaved.status;
                                                            obj.orderIds = billSaved.orderIds;
                                                            obj.outletId = billSaved.outletId;
                                                            obj.userIds = billSaved.userIds;
                                                            obj.gst = billSaved.gst;
                                                            obj.serviceChargeOnFood = billSaved.serviceChargeOnFood;
                                                            obj.serviceChargeOnDrink = billSaved.serviceChargeOnDrink;
                                                            obj.vatOnDrink = billSaved.vatOnDrink;
                                                            obj.adminId = billSaved.adminId;
                                                            obj.orders = [];
                                                            for(var k=0;k<billSaved.orderIds.length;k++){
                                                                orderidbill.push(billSaved.orderIds[k].orderId);
                                                            }
                                                            if(k>=billSaved.orderIds.length){
                                                                Order.find({$and:[{orderId:{$in:orderidbill}},{outletId: billFound.outletId},{tableNumber:billFound.tableNumber}]}, function (err, ordersBill) {
                                                                    if (!err && ordersBill) {
                                                                        for (var j = 0; j < ordersBill.length; j++) {
                                                                            obj.orders.push(ordersBill[j]);
                                                                        }
                                                                        if (j >= ordersMain.length) {
                                                                            res.json({
                                                                                success: true,
                                                                                data: obj,
                                                                                error: null
                                                                            });
                                                                        }
                                                                    }
                                                                });
                                                            }

                                                        } else {
                                                            res.json({
                                                                success: true,
                                                                data: null,
                                                                error: 'Error saving bill'
                                                            });
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    }
                                    else{
                                        if (ordersMain.length > 0) {

                                            for (var i = 0; i < ordersMain.length; i++) {
                                                if (ordersMain[i].gameId > 0) {
                                                    if (userids.indexOf(ordersMain[i].userId) == -1) {
                                                        userids.push(ordersMain[i].userId);
                                                    }
                                                }
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
                                                for (a = 0; a < ordersMain.length; a++) {
                                                    Order.findOneAndUpdate({$and:[{orderId: ordersMain[a].orderId},{outletId:outletId}]}, {
                                                        status: 'billed',
                                                        updated_at: newdate
                                                    }, {safe: true, new: true}, function (err, updatedOrder) {
                                                        if (!err && updatedOrder) {
                                                            if (updatedOrder.orderType == 'user' && updatedOrder.drinks.length>0) {

                                                                    Game.findOneAndUpdate({gameId: updatedOrder.gameId}, {
                                                                        gameStatus: 'finished',
                                                                        status: 'billing'
                                                                    }, {safe: true, new: true}, function (err, gameUpdated) {
                                                                        if (!err && gameUpdated) {

                                                                            useridnew = gameUpdated.userId;

                                                                            if(useridnew!=userid){
                                                                                obj2.gameId = gameUpdated.gameId;
                                                                                obj2.gameStatus = gameUpdated.gameStatus;
                                                                                obj2.tableNumber = gameUpdated.tableNumber;
                                                                                obj2.orderId = gameUpdated.orderId;
                                                                                obj2.status = gameUpdated.status;
                                                                                obj2.outletId = gameUpdated.outletId;
                                                                                obj2.userId = gameUpdated.userId;
                                                                                obj2.userName = gameUpdated.userName;
                                                                                obj2.orderDate = gameUpdated.orderDate;
                                                                                obj2.orderTime = gameUpdated.orderTime;
                                                                                obj2.billId = 0;

                                                                                User.findOneAndUpdate({userId: useridnew}, {
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
                                                                                                    game: obj2,
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
                                                                                                    alert:'Game is over'
                                                                                                },
                                                                                                data: {
                                                                                                    type: "gamefinished",
                                                                                                    game: obj2,
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
                                                                            Outlet.findOneAndUpdate({
                                                                                outletId: outletId,
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
                                                                        else {
                                                                            console.log(err);
                                                                        }
                                                                    });


                                                            } else {
                                                                Outlet.findOneAndUpdate({
                                                                    outletId: outletId,
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
                                                    Bill.find({},{billId:1}, function (err, bills) {
                                                        if (!err && bills) {
                                                            var billid = 0;
                                                            if (bills.length > 0) {
                                                                billid = bills[0].billId + 1;
                                                            } else billid = 1;
                                                            for (var uid = 0; uid < userids.length; uid++) {
                                                                bill.userIds.push({userId: userids[uid]});
                                                            }

                                                            bill.billId = billid;
                                                            bill.tableNumber = tableNumber;
                                                            bill.totalBill = total;
                                                            bill.status = "requested";
                                                            bill.outletId = outletId;
                                                            bill.adminId = 0;
                                                            bill.billDate = date;
                                                            bill.billTime = time;
                                                            bill.generatedBy = 'USER';
                                                            bill.gst = gst;
                                                            bill.serviceChargeOnFood = serviceChargeOnFood;
                                                            bill.serviceChargeOnDrink = serviceChargeOnDrink;
                                                            bill.vatOnDrink = vatOnDrink;
                                                            bill.created_at = newdate;
                                                            bill.updated_at = newdate;
                                                            bill.syncStatus = 0;
                                                            var logObj = {
                                                                log:String,
                                                                logTime: String
                                                            };
                                         
                                                            bill.save(function (err, billSaved) {
                                                                if (!err && billSaved) {

                                                                    obj = {};
                                                                    obj.billId = billSaved.billId;
                                                                    obj.tableNumber = billSaved.tableNumber;
                                                                    obj.billDate = billSaved.billDate;
                                                                    obj.billTime = billSaved.billTime;
                                                                    obj.totalBill = billSaved.totalBill;
                                                                    obj.status = billSaved.status;
                                                                    obj.orderIds = billSaved.orderIds;
                                                                    obj.outletId = billSaved.outletId;
                                                                    obj.userIds = billSaved.userIds;
                                                                    obj.gst = billSaved.gst;
                                                                    obj.serviceChargeOnFood = billSaved.serviceChargeOnFood;
                                                                    obj.serviceChargeOnDrink = billSaved.serviceChargeOnDrink;
                                                                    obj.vatOnDrink = billSaved.vatOnDrink;
                                                                    obj.adminId = billSaved.adminId;
                                                                    obj.orders = [];
                                                                    for (var j = 0; j < ordersMain.length; j++) {
                                                                        for (var k = 0; k < billSaved.orderIds.length; k++) {
                                                                            if (ordersMain[j].orderId == billSaved.orderIds[k].orderId) {
                                                                                obj.orders.push(ordersMain[j]);
                                                                            }
                                                                        }
                                                                    }
                                                                    if (j >= ordersMain.length) {
                                                                        res.json({
                                                                            success: true,
                                                                            data: obj,
                                                                            error: null
                                                                        });
                                                                    }
                                                                } else {
                                                                    res.json({
                                                                        success: true,
                                                                        data: null,
                                                                        error: 'Error saving bill'
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    }).sort({billId: -1}).limit(2).lean();
                                                }
                                            }
                                        }
                                    }
                                });
                            } else console.log(err);
                        }).sort({orderId: -1}).lean();
                    }
                }else console.log(err);
            });
        } else console.log(err)
    });
    Admin.findOne({$and:[{outletId:outletId},{'tables.tableNumber':tableNumber}]}, function (err, adminFound) {
        if(!err && adminFound!=null){
            var sender = new fcm(gcmSenderKeyAndroid);
            var message1 = {
                to: adminFound.gcmId,
                collapse_key: 'admin',
                priority: 'high',
                contentAvailable: true,
                timeToLive: 3,
                message_type: 'User Order Placed',
                //restrictedPackageName: "somePackageName",
                data: {
                    type: "userorderplaced",
                    icon: "app_logo",
                    title: "BILL Requested",
                    body: "Table No - " + tableNumber
                }
            };
            sender.send(message1, function (err, response) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully sent: ", response);
                }
            });
        }else{
            console.log(err);
        }
    }).lean();
});//end of API to generate bill

//API to get my admin
userRoutes.get('/myadmin', function (req, res) {
    var token = req.headers['auth_token'];
    var tableNumber = req.query.tableNumber;
    var outletid = req.query.outletId;
    Admin.findOne({
        $and: [
            {outletId: outletid},
            {'tables.tableNumber': tableNumber}
        ]
    }, function (err, adminFound) {
        if (!err && adminFound) {
            res.json({
                success: true,
                data: adminFound,
                error: null
            });
        }
    }).lean();
});

//API to get feed
userRoutes.get('/feed', function (req, res) {
    Feed.find({}, function (err, feedsList) {
        if (!err && feedsList) {
            res.json({
                success: true,
                data: {feeds: feedsList},
                error: null
            });
        } else console.log(err);
    }).sort({feedId: -1}).lean().limit(5);
});

//API to get in profile
userRoutes.put('/inprofile', function (req, res) {
    var token = req.headers['auth_token'];
    User.findOneAndUpdate({token: token}, {
        inprofile: true
    }, {safe: true}, function (err, userFound) {
        if(!err && userFound!=null){
            res.json({
                success: true,
                data: {message: 'In Profile Now'},
                error: null
            });
        }else{
            res.json({
                success: false,
                data: null,
                error: 'Error making userin profile'
            });
        }

    });
});

//API to get out of profile
userRoutes.put('/outprofile', function (req, res) {
    var token = req.headers['auth_token'];
    User.findOneAndUpdate({token: token}, {
        inprofile: false
    }, {safe: true}, function (err, userUpdated) {
        if(!err && userUpdated!=null){
            res.json({
                success: true,
                data: {message: 'In Profile Now'},
                error: null
            });
        }else{
            res.json({
                success: false,
                data: null,
                error: 'Error making userin profile'
            });
        }
    });
});

//User API to end Game
userRoutes.put('/endgame', function (req, res) {
    var token = req.headers['auth_token'];
    User.findOne({token: token}, function (err, userFound) {
        if (!err && userFound) {
            Game.findOneAndUpdate({gameId: userFound.gameId}, {
                gameStatus: 'finished'
            }, {safe: true, new: true}, function (err, gameEnded) {
                if (!err && gameEnded) {
                    res.json({
                        success: true,
                        data: {message: 'Game Finished'},
                        error: null
                    });
                } else {
                    console.log(err);
                    res.json({
                        success: false,
                        data: null,
                        error: 'Error finding game'
                    });
                }
            });
        } else console.log(err);
    }).lean();
});

//User API to book a table
// userRoutes.post('/booktable', function (req, res) {
//     var token = req.headers['auth_token'];
//     var tablebook = new TableBooking;
//     var date1 = moment.utc().add(330, 'minutes');
//     var newdate = new Date(date1);
//     var bookingObj = req.body;
//     var userObj;
//     var outletObj;
//     res.json({
//         success:false,
//         data:null,
//         error:'Not Accepting Bookings'
//     })
//     /*User.findOne({token: token}, function (err, userFound) {
//         if (!err && userFound!=null) {
//             userObj = userFound;
//             Outlet.findOne({outletId:bookingObj.outletId}, function (err, outletFound) {
//                 if(!err && outletFound!=null){
//                     outletObj = outletFound;
//                     TableBooking.find({}, function (err, bookings) {
//                         if (!err && bookings) {
//                             var bookingid = 1;
//                             if (bookings.length > 0) {
//                                 bookingid = bookings[0].bookingId + 1;
//                             }
//                             tablebook.bookingId = bookingid;
//                             tablebook.time = bookingObj.time;
//                             tablebook.date = bookingObj.date;
//                             tablebook.name = userObj.name;
//                             tablebook.status = 'pending';
//                             tablebook.outletName = outletObj.locality;
//                             tablebook.phoneNumber = bookingObj.phoneNumber;
//                             tablebook.noOfPeople = bookingObj.noOfPeople;
//                             tablebook.userId = userFound.userId;
//                             tablebook.userGCM = userFound.gcmId;
//                             tablebook.userAgent = userFound.userAgent;
//                             tablebook.outletId = bookingObj.outletId;
//                             tablebook.created_at = newdate;
//                             tablebook.updated_at = newdate;
//                             tablebook.save(function (err, saved) {
//                                 if (!err && saved) {
//                                     res.json({
//                                         success: true,
//                                         data: {message: 'Table Booked!'},
//                                         error: null
//                                     });
//                                     User.findOneAndUpdate({token: token}, {
//                                         $push: {myBookings: bookingid},
//                                         phoneNumber: bookingObj.phoneNumber
//                                     }, {safe: true, upsert: true}, function (err, userUpdated) {
//                                         if (!err && userUpdated!=null) {

//                                         } else console.log(err);
//                                     });
//                                     Console.find({$or:[{accessType:'full'},{outletId:bookingObj.outletId}]}, function (err, consoles) {
//                                         if(!err && consoles){
//                                             for(var c=0;c<consoles.length;c++){
//                                                 var sender = new fcm(gcmSenderKeyAndroid);
//                                                 var message1 = {
//                                                     to: consoles[c].gcmId,
//                                                     collapse_key: 'admin',
//                                                     priority: 'high',
//                                                     contentAvailable: true,
//                                                     timeToLive: 3,
//                                                     message_type: 'bookingmade',
//                                                     //restrictedPackageName: "somePackageName",
//                                                     data: {
//                                                         type: "bookingmade",
//                                                         icon: "app_logo",
//                                                         title: "New Booking for "+ outletObj.locality,
//                                                         body: "Booking by-"+userObj.name+ " for "+bookingObj.noOfPeople+" on " + bookingObj.date + " at " + bookingObj.time
//                                                     }
//                                                 };
//                                                 sender.send(message1, function (err, response) {
//                                                     if (err) {
//                                                         console.log(err);
//                                                     } else {
//                                                         console.log("Successfully sent: ", response);
//                                                     }
//                                                 });
//                                             }
//                                         }else console.log(err);
//                                     });

//                                 } else {
//                                     res.json({
//                                         success: false,
//                                         data: null,
//                                         error: 'Error Booking Table'
//                                     });
//                                 }
//                             });
//                         }
//                         else {
//                             res.json({
//                                 success: false,
//                                 data: null,
//                                 error: 'Cant fetch bookings'
//                             });
//                         }
//                     }).sort({bookingId: -1}).limit(2).lean();
//                 }else{
//                     res.json({
//                         success:false,
//                         data:null,
//                         error:'Error finding outlet'
//                     });
//                 }
//             }).lean();
//         }
//         else {
//             res.json({
//                 success: false,
//                 data: null,
//                 error: 'No User'
//             });
//         }
//     }).lean();*/
// });
//User API to book a table
userRoutes.post('/booktable', function (req, res) {
    var token = req.headers['auth_token'];
    var tablebook = new TableBooking;
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var bookingObj = req.body;
    var userObj;
    var outletObj;
    User.findOne({ token: token }, function (err, userFound) {
        console.log(userFound)
        if (!err && userFound != null) {
            userObj = userFound;
            Outlet.findOne({ outletId: bookingObj.outletId }, function (err, outletFound) {
                if (!err && outletFound != null) {
                    outletObj = outletFound;
                    TableBooking.find({}, function (err, bookings) {

                        if (!err && bookings) {
                            var bookingid = 1;
                            if (bookings.length > 0) {
                                bookingid = bookings[0].bookingId + 1;
                            }
                            tablebook.bookingId = bookingid;
                            tablebook.time = bookingObj.time;
                            tablebook.date = bookingObj.date;
                            tablebook.name = userObj.name;
                            tablebook.status = 'pending';
                            tablebook.outletName = outletObj.locality;
                            tablebook.phoneNumber = bookingObj.phoneNumber;
                            tablebook.noOfPeople = bookingObj.noOfPeople;
                            tablebook.userId = userFound.userId;
                            tablebook.userGCM = userFound.gcmId;
                            tablebook.userAgent = userFound.userAgent;
                            tablebook.outletId = bookingObj.outletId;
                            tablebook.created_at = newdate;
                            tablebook.updated_at = newdate;
                            console.log(tablebook
                            )
                            tablebook.save(function (err, saved) {
                                if (!err && saved) {
                                    res.json({
                                        success: true,
                                        data: { message: '6 Booked!' },
                                        error: null
                                    });
                                    User.findOneAndUpdate({ token: token }, {
                                        $push: { myBookings: bookingid },
                                        phoneNumber: bookingObj.phoneNumber
                                    }, { safe: true, upsert: true }, function (err, userUpdated) {
                                        if (!err && userUpdated != null) {

                                        } else console.log(err);
                                    });
                                    Console.find({ $or: [{ accessType: 'full' }, { outletId: bookingObj.outletId }] }, function (err, consoles) {
                                        if (!err && consoles) {
                                            /*for (var c = 0; c < consoles.length; c++) {
                                                var sender = new fcm(gcmSenderKeyAndroid);
                                                var message1 = {
                                                    to: consoles[c].gcmId,
                                                    collapse_key: 'admin',
                                                    priority: 'high',
                                                    contentAvailable: true,
                                                    timeToLive: 3,
                                                    message_type: 'bookingmade',
                                                    //restrictedPackageName: "somePackageName",
                                                    data: {
                                                        type: "bookingmade",
                                                        icon: "app_logo",
                                                        title: "New Booking for " + outletObj.locality,
                                                        body: "Booking by-" + userObj.name + " for " + bookingObj.noOfPeople + " on " + bookingObj.date + " at " + bookingObj.time
                                                    }
                                                };
                                                sender.send(message1, function (err, response) {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        console.log("Successfully sent: ", response);
                                                    }
                                                });
                                            }*/
                                        } else console.log(err);
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
                } else {
                    res.json({
                        success: false,
                        data: null,
                        error: 'Error finding outlet'
                    });
                }
            }).lean();
        }
        else {
            res.json({
                success: false,
                data: null,
                error: 'No User'
            });
        }
    }).lean();
});
//APi to check ifuser has phoneNumber
userRoutes.get('/checkphno', function (req, res) {
    var token = req.headers['auth_token'];
    User.findOne({token: token}, function (err, userFound) {
        if (!err && userFound) {
            if (userFound.phoneNumber) {
                res.json({
                    success: true,
                    data: {phno: userFound.phoneNumber},
                    error: null
                });
            } else {
                res.json({
                    success: true,
                    data: {phno: '0'},
                    error: null
                });
            }
        }
    }).lean();
});

//API to get generated bill info
userRoutes.get('/billinfo', function (req, res) {
    var billid = req.query.billId;

    Bill.findOne({billId: billid}, function (err, billFound) {
        if (!err && billFound != null) {
            Order.find({}, function (err, orders) {
                if(!err && orders){
                    var obj = {};
                    obj.billId = billFound.billId;
                    obj.totalBill = billFound.totalBill;
                    obj.status = billFound.status;
                    obj.outletId = billFound.outletId;
                    obj.adminId = billFound.adminId;
                    obj.billDate = billFound.billDate;
                    obj.billTime = billFound.billTime;
                    obj.gst = billFound.gst;
                    obj.serviceChargeOnDrink = billFound.serviceChargeOnDrink;
                    obj.serviceChargeOnFood = billFound.serviceChargeOnFood;
                    obj.vatOnDrink = billFound.vatOnDrink;
                    obj.created_at = billFound.created_at;
                    obj.updated_at = billFound.updated_at;
                    obj.orders = [];
                    obj.tableNumber = billFound.tableNumber;
                    for (var i = 0; i < billFound.orderIds.length; i++) {
                        for (var j = 0; j < orders.length; j++) {
                            if (orders[j].orderId == billFound.orderIds[i].orderId) {
                                obj.orders.push(orders[j]);
                            }
                        }
                    }
                    if (i >= billFound.orderIds.length) {
                        res.json({
                            success: true,
                            data: {bill: obj},
                            error: null
                        });
                    }
                }else{

                }
            }).lean();

        } else {
            res.json({
                success: false,
                data: null,
                error: 'Error fetching bill'
            });
        }
    });
});

//API to get order history
userRoutes.get('/orderhistory', function (req, res) {
    var token = req.headers['auth_token'];
    var dates = [];

    var days = [];
    User.findOne({token:token}, function (err, userFound) {
        if(!err && userFound!=null){
            if(userFound.orders.length>0){
                Order.find({$and:[{orderId:{$in:userFound.orders}},{$or:[{status:'confirmed'},{status:'placed'},{status:'billed'}]},{userId:userFound.userId}]}, function (err, userOrders) {
                    if(!err && userOrders){
                        for(var d=0;d<userOrders.length;d++){
                            if(dates.indexOf(userOrders[d].orderDate)==-1){
                                dates.push(userOrders[d].orderDate);
                            }
                        }
                        if(d>=userOrders.length){
                            for(var date=0;date<dates.length;date++){
                                var dayObj={
                                    date:String,
                                    orders:[]
                                };
                                dayObj.date = dates[date];
                                dayObj.orders=[];
                                for(var o=0;o<userOrders.length;o++){
                                    if(userOrders[o].orderDate == dates[date]){
                                        dayObj.orders.push(userOrders[o]);
                                    }
                                }
                                if(o>=userOrders.length){
                                    days.push(dayObj);
                                }
                            }
                            if(date>=dates.length){
                                let userSavingOnGame= userFound.userSavingOnGame?userFound.userSavingOnGame:0
                                res.json({
                                    success: true,
                                    data: {
                                        days: days,
                                        userSavingOnGame: userSavingOnGame

                                    },
                                    error:null
                                });
                            }

                        }
                    }else{
                        res.json({
                            success:false,
                            data:null,
                            error:'Error fetching Orders'
                        });
                    }
                }).sort({orderDate:-1}).lean();
            }
            else{
                res.json({
                    success:true,
                    data:{days:[]},
                    error:null
                });
            }
        }else{
            res.json({
                success:false,
                data:null,
                error:'Error verifying user'
            });
        }
    }).lean();
});

//API to update FCM token
userRoutes.put('/updatefcm', function (req, res) {
    var token = req.headers['auth_token'];
    var newToken = req.query.gcmId;
    User.findOneAndUpdate({token: token}, {
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

//API for user to give feedback
userRoutes.post('/feedback', function (req, res) {
    var token = req.headers['auth_token'];
    var feedback = new Feedback;
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var feedbackid = 1;
    var ratingrec = req.query.rating;
    var cmmnt = req.query.comment;
    var user;

    User.findOne({token:token}, function (err, userFound) {
        if(!err && userFound!=null){
            user=userFound;
            Feedback.find({},{feedbackId:1}, function (err, feedbacks) {
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
                    feedback.comment = cmmnt;
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
            }).sort({feedbackId: -1}).limit(2).lean();

        }else{
            console.log(err);
        }
    });

});

//API to apply for offer
userRoutes.get('/offervalid', function (req, res) {
    var token = req.headers['auth_token'];
    User.findOne({token:token}, function (err, userFound) {
        if(!err && userFound!=null){
            if(userFound.freeDrink == false){
                res.json({
                    success:true,
                    data:{offervalid:true},
                    error:null
                });
            }else{
                res.json({
                    success:true,
                    data:{offervalid:false},
                    error:null
                });
            }
        }else{
            res.json({
                success:false,
                data:null,
                error:'Error finding user'
            });
        }
    }).lean();
});

//API for user to avail offer
userRoutes.post('/availoffer', function (req, res) {
    var token = req.headers['auth_token'];
    var date1 = moment.utc().add(330, 'minutes');
    var newdate = new Date(date1);
    var date = moment(date1).format('YYYY-MM-DD');
    var time = moment(date1).format('HH:mm:ss');
    User.findOne({token:token}, function (err, userFound) {
        if(!err && userFound!=null){
            Offeravail.findOne({loginId:userFound.loginId}, function (err, offerAvailed) {
                if(!err && offerAvailed!=null){
                    res.json({
                        success:true,
                        data:{message:'User Offer Availed'},
                        error:null
                    });
                }
                else{
                    var offerAvail = new Offeravail;
                    offerAvail.loginId = userFound.loginId;
                    offerAvail.userId = userFound.userId;
                    offerAvail.name = userFound.name;
                    offerAvail.profilePic = userFound.profilePic;
                    offerAvail.email = userFound.email;
                    offerAvail.created_at = newdate;
                    offerAvail.updated_at = newdate;
                    offerAvail.status = 'applied';
                    offerAvail.availDate = date;
                    offerAvail.availTime = time;
                    offerAvail.save(function (err, availed) {
                        if(!err && availed){
                            User.findOneAndUpdate({loginId:availed.loginId},{
                                freeDrink:true
                            },{safe:true,new:true}, function (err, userUpdated) {
                                if(!err && userUpdated){
                                    res.json({
                                        success:true,
                                        data:{message:'User Offer Availed'},
                                        error:null
                                    });
                                }else{
                                    console.log(err);
                                }
                            });
                        }
                    });
                }
            });

        }
        else{
            res.json({
                success:false,
                data:null,
                error:'Error finding user'
            });
        }
    });
});

userRoutes.get('/previoususer', function (req, res) {
    var token = req.headers['auth_token'];
    var obj = {};
    User.findOne({token: token}, function (err, userFound) {
        if (!err && userFound) {
            if (userFound.phoneNumber =="") {
                res.json({
                    success: false,
                    data: {auth_token: token},
                    error: null
                });
            }
            else {
                res.json({
                    success: true,
                    data: {auth_token: token},
                    error: null
                });
            }
        } else console.log(err);
    }).lean();
});

userRoutes.post('/Updateuser', function (req, res) {
    var token = req.headers['auth_token'];
    var userobj = req.body;
    var birthdate =userobj.birthdate;
    var convertbirthdate = new Date(birthdate); 
    function responseSuccess() {
        return res.json({
            success: true,
            data: {auth_token: token},
            error: null
        });
    }

    function responseFailure(error) {
        return res.json({
            success: false,
            data: {auth_token: token},
            error: error
        });
    }
   
    User.findOne({token: token}, function (err, userFound) {
        if (!err && userFound) {
            User.findOneAndUpdate({token: token}, {
                phoneNumber : userobj.phoneNumber,
                birthdate : convertbirthdate
            }, function (err) {
                if (err)  responseFailure(err);
            });
            responseSuccess();
        } else responseFailure(err);
    }).lean();
});


userRoutes.put('/UpdateProfile', upload('userProfiles').single("uploadfile"), function (req, res) {
    var token = req.headers['auth_token'];
    var userobj = req.body;
    console.log(userobj);
    var userId =  userobj.userId;
    //var birthdate = userobj.birthdate;
    //var convertbirthdate = new Date(birthdate);

    function responseSuccess(responseSuccess, message) {
        return res.json({
            success: true,
            data: { auth_token: token, user : message },
            error: null,
            message: responseSuccess
        });
    }

    function responseFailure(error) {
        return res.json({
            success: false,
            data: { auth_token: token },
            error: error
        });
    }
   
    if (req.file != undefined) {
        let file = req.file.filename.replace(/(?:\.(?![^.]+$)|[^\w.])+/g, "")
        var files = "/" + "userProfiles/" + file;
    }
    
    User.findOne({ userId: userId }, function (err, userFound) {
        if (!err && userFound) {
            if (userFound) {
                var name = req.body.name;
                //userFound.profilePic = files;
                
                User.findOneAndUpdate(
                    { userId: userId },
                    { $set: { name:name,gender: req.body.gender,profilePic:files} },        
                    { new: true },
                    function(err, updatedUser) {
                        if (!err && updatedUser ) {
                            responseSuccess("User information updated successfully.", updatedUser);
                        } else {
                            responseFailure(err); 
                        }
                    }
                );
            } else {
                responseFailure("User not found");
            }
        }
        else responseFailure(err);
    })
    .lean();
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Handle the error or log it
}); 


//API to get profile information
userRoutes.get('/getprofile', function (req, res) {
    var token = req.headers['auth_token'];
    User.findOne({ token: token }, { orders: 0, favourites: 0 }, function (err, userFound) {
        if (!err && userFound != null) {
            res.json({
                success: true,
                data: userFound,
                error: null
            })
        } else {
            res.json({
                success: false,
                data: null,
                error: 'Error finding user'
            });
        }
    }).lean();
});

userRoutes.get('/deactivateAccount', function (req, res) {
    var token = req.headers['auth_token'];
    var isDeletedval=1
    function responseSuccess() {
        return res.json({
            success: true,
            data:  token,
            error: null
        });
    }

    function responseFailure(error) {
        return res.json({
            success: false,
            data:  token,
            error: error
        });
    }
   
    User.findOneAndUpdate({token: token}, {
        isDeleted : isDeletedval,
    }, function (err) {
        if (err)  responseFailure(err);
    });
    responseSuccess();
});

module.exports = userRoutes;
