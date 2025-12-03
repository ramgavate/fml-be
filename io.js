/**
 * Created by ritej on 10/11/2017.
 */

const sio = require('socket.io');
var io = null;
const Outlet = require('./models/outlet');
const category = require('./models/category');
var Tvmenu = require('./models/tvmenu');
const Feed = require('./models/feed');

var socket_id=[];

exports.io = function () {
    return io;
};
var drinkObj = {
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
    priceVariable: Boolean,
    mainCategory: String
};
exports.initialize = function(server) {
    io = sio(server);

    io.on('connection', function(socket) {
        // Producer.startProducer();
        /*ditconsumer.start(function(value){
         io.emit('ditConsumer',value);
         });*/
        console.log("Connected successfully to the socket ...");
        var drinks;
        var mainArray = [];
        var catObj={
            arr:[]
        };

        var feedObj = {
            arr:[]
        };
        socket.on('outletId', function (data) {
            console.log(data);

            Outlet.findOne({outletId:parseInt(data)}, function (err, outletFound) {
                if(!err && outletFound){
                    var catObj={
                        arr:[]
                    };

                    var obj = {
                        arr:[]
                    };

                    drinks = outletFound.drinks;
                    category.find({}, function (err, categories) {
                        if(!err && categories){
                            for(var c=0;c<categories.length;c++){
                                var tempObj = {};
                                if(categories[c].name == 'VODKA'){
                                    tempObj.name =categories[c].name;
                                    tempObj.mainCategory = 'VODKA';
                                    catObj.arr.push(tempObj);
                                }
                                else if(categories[c].name == 'RUM' || categories[c].name == 'GIN' || categories[c].name == 'BRANDY'){
                                    tempObj.name =categories[c].name;
                                    tempObj.mainCategory = 'RUM BRANDY GIN';
                                    catObj.arr.push(tempObj);
                                }
                                else if(categories[c].name == 'SHOTS' || categories[c].name == 'LIQUERS'){
                                    tempObj.name =categories[c].name;
                                    tempObj.mainCategory = 'SHOTS';
                                    catObj.arr.push(tempObj);
                                }
                                else if(categories[c].name == 'BEERS' || categories[c].name == 'FRESH BEER' || categories[c].name == 'F.M.L. SPECIAL OFFERS'){
                                    tempObj.name =categories[c].name;
                                    tempObj.mainCategory = 'BEER';
                                    catObj.arr.push(tempObj);
                                }
                                else if(categories[c].name == 'CLASSIC COCKTAILS' || categories[c].name == 'SUMMER SPECIAL MOJITO' || categories[c].name == 'FRESH FRUIT COCKTAIL' || categories[c].name == 'MARTINI' || categories[c].name == 'HOUSE COCKTAILS'){
                                    tempObj.name =categories[c].name;
                                    tempObj.mainCategory = 'COCKTAILS';
                                    catObj.arr.push(tempObj);
                                }
                                else if(categories[c].name == 'SPECIAL OFFER'){
                                    tempObj.name =categories[c].name;
                                    tempObj.mainCategory = 'SHOTS';
                                    catObj.arr.push(tempObj);
                                }
                                else if(categories[c].name == 'CHAMPAGNE' || categories[c].name == 'WINES' || categories[c].name == 'IMPORTED WINES'){
                                    tempObj.name =categories[c].name;
                                    tempObj.mainCategory = 'WINE & CHAMPAGNE';
                                    catObj.arr.push(tempObj);
                                }
                                else if(categories[c].name == 'SINGLE MALTS' || categories[c].name == 'PREMIUM WHISKY' || categories[c].name == 'AMERICAN IRISH WHISKY' || categories[c].name == 'SCOTCH WHISKY' || categories[c].name == 'WHISKY'){
                                    tempObj.name =categories[c].name;
                                    tempObj.mainCategory = 'WHISKY';
                                    catObj.arr.push(tempObj);
                                }
                                else if(categories[c].name == 'MIXERS' || categories[c].name == 'NON ALCOHOLIC' || categories[c].name == 'MOCKTAILS'){
                                    tempObj.name =categories[c].name;
                                    tempObj.mainCategory = 'NON ALCOHOLIC';
                                    catObj.arr.push(tempObj);
                                }
                                else if(categories[c].name == 'BREEZERS'){
                                    tempObj.name =categories[c].name;
                                    tempObj.mainCategory = 'BEER';
                                    catObj.arr.push(tempObj);
                                }
                            }
                            for(var i=0;i<drinks.length;i++){
                                drinkObj = {};
                                drinkObj.available = drinks[i].available;
                                drinkObj.basePrice = drinks[i].basePrice;
                                drinkObj.capPrice = drinks[i].capPrice;
                                drinkObj.category = drinks[i].category;
                                drinkObj.categoryCode = drinks[i].categoryCode;
                                drinkObj.demandLevel = drinks[i].demandLevel;
                                drinkObj.demandRate = drinks[i].demandRate;
                                drinkObj.drinkId = drinks[i].drinkId;
                                drinkObj.drinkType = drinks[i].drinkType;
                                drinkObj.itemCode = drinks[i].itemCode;
                                drinkObj.name = drinks[i].name;
                                drinkObj.priceIncrementPerUnit = drinks[i].priceIncrementPerUnit;
                                drinkObj.priceVariable = drinks[i].priceVariable;
                                drinkObj.regularPrice = drinks[i].regularPrice;
                                drinkObj.runningPrice = drinks[i].runningPrice;
                                drinkObj.status = drinks[i].status;

                                if(drinks[i].category == 'VODKA'){
                                    drinkObj.mainCategory = 'VODKA';
                                }
                                else if(drinks[i].category == 'RUM' || drinks[i].category == 'GIN' || drinks[i].category == 'BRANDY'){
                                    drinkObj.mainCategory = 'RUM BRANDY GIN';
                                }
                                else if(drinks[i].category == 'SHOTS' || drinks[i].category == 'LIQUERS'){
                                    drinkObj.mainCategory = 'SHOTS';
                                }
                                else if(drinks[i].category == 'BEERS' || drinks[i].category == 'FRESH BEER'){
                                    drinkObj.mainCategory = 'BEER';
                                }
                                else if(drinks[i].category == 'CLASSIC COCKTAILS' || drinks[i].category == 'SUMMER SPECIAL MOJITO' || drinks[i].category == 'FRESH FRUIT COCKTAIL' || drinks[i].category == 'MARTINI' || drinks[i].category == 'HOUSE COCKTAILS'){
                                    drinkObj.mainCategory = 'COCKTAILS';
                                }
                                else if(drinks[i].category == 'SPECIAL OFFER'){
                                    drinkObj.mainCategory = 'SHOTS';
                                }
                                else if(drinks[i].category == 'CHAMPAGNE' || drinks[i].category == 'WINES' || drinks[i].category == 'IMPORTED WINES'){
                                    drinkObj.mainCategory = 'WINE & CHAMPAGNE';
                                }
                                else if(drinks[i].category == 'SINGLE MALTS' || drinks[i].category == 'PREMIUM WHISKY' || drinks[i].category == 'AMERICAN IRISH WHISKY' || drinks[i].category == 'SCOTCH WHISKY' || drinks[i].category == 'WHISKY'){
                                    drinkObj.mainCategory = 'WHISKY';
                                }
                                else if(drinks[i].category == 'MIXERS' || drinks[i].category == 'NON ALCOHOLIC' || drinks[i].category == 'MOCKTAILS'){
                                    drinkObj.mainCategory = 'NON ALCOHOLIC';
                                }
                                else if(drinks[i].category == 'BREEZERS'){
                                    drinkObj.mainCategory = 'BEER';
                                }
                                obj.arr.push(drinkObj);
                            }
                            if(c>=categories.length){
                                socket.emit("categories",catObj);
                            }
                            if(i>=drinks.length){
                                socket.emit("drinks",obj);
                            }
                        }
                    }).lean();
                }
            }).lean();

            Outlet.findOne({outletId:parseInt(data)}, function (err, outletFound) {
                if(!err && outletFound){
                    mainArray = [];
                    catObj={
                        arr:[]
                    };
                    var catObj={
                        arr:[
                            {
                                category:'VODKA',
                                category_icon: 'http://35.154.86.71:7777/menu/vodka.png',
                                drinks:[]
                            },
                            {
                                category:'RUM',
                                category_icon: 'http://35.154.86.71:7777/menu/rum.png',
                                drinks:[]
                            },
                            {
                                category:'BRANDY',
                                category_icon: 'http://35.154.86.71:7777/menu/brandy.png',
                                drinks:[]
                            },
                            {
                                category:'GIN',
                                category_icon: 'http://35.154.86.71:7777/menu/gin.png',
                                drinks:[]
                            },
                            {
                                category:'SHOTS',
                                category_icon: 'http://35.154.86.71:7777/menu/liquor.png',
                                drinks:[]
                            },
                            {
                                category:'BEER',
                                category_icon: 'http://35.154.86.71:7777/menu/beer.png',
                                drinks:[]
                            },
                            {
                                category:'FRESH BEER',
                                category_icon: 'http://35.154.86.71:7777/menu/freshbeer.png',
                                drinks:[]
                            },
                            {
                                category:'LIQUERS',
                                category_icon: 'http://35.154.86.71:7777/menu/liquor.png',
                                drinks:[]
                            },
                            {
                                category: 'COCKTAILS',
                                category_icon: 'http://35.154.86.71:7777/menu/cocktail.png',
                                drinks: []
                            },
                            {
                                category:'MARTINI',
                                category_icon: 'http://35.154.86.71:7777/menu/martini.png',
                                drinks:[]
                            },
                            {
                                category:'WINE',
                                category_icon: 'http://35.154.86.71:7777/menu/wine.png',
                                drinks:[]
                            },
                            {
                                category:'IMPORTED WINE',
                                category_icon: 'http://35.154.86.71:7777/menu/importedwine.png',
                                drinks:[]
                            },
                            {
                                category:'CHAMPAGNE',
                                category_icon: 'http://35.154.86.71:7777/menu/champagne.png',
                                drinks:[]
                            },
                            {
                                category:'SINGLE MALTS',
                                category_icon: 'http://35.154.86.71:7777/menu/singlemalt.png',
                                drinks:[]
                            },
                            {
                                category:'PREMIUM WHISKY',
                                category_icon: 'http://35.154.86.71:7777/menu/premiumwhiskey.png',
                                drinks:[]
                            },
                            {
                                category:'AMERICAN IRISH WHISKY',
                                category_icon: 'http://35.154.86.71:7777/menu/americanirish.png',
                                drinks:[]
                            },
                            {
                                category:'SCOTCH WHISKY',
                                category_icon: 'http://35.154.86.71:7777/menu/scotchwhiskey.png',
                                drinks:[]
                            },
                            {
                                category:'WHISKY',
                                category_icon: 'http://35.154.86.71:7777/menu/scotchwhiskey.png',
                                drinks:[]
                            },
                            {
                                category:'MIXERS',
                                category_icon: 'http://35.154.86.71:7777/menu/mixer.png',
                                drinks:[]
                            },
                            {
                                category:'MOCKTAIL',
                                category_icon: 'http://35.154.86.71:7777/menu/mocktail.png',
                                drinks:[]
                            },
                            {
                                category:'BREEZER',
                                category_icon: 'http://35.154.86.71:7777/menu/breezer.png',
                                drinks:[]
                            }
                        ]
                    };

                    var mainCategories=['VODKA','BRANDY', 'RUM', 'GIN','SHOTS','BEER','FRESH BEER','LIQUERS','COCKTAILS','MARTINI','WINE','IMPORTED WINE','CHAMPAGNE','SINGLE MALTS','PREMIUM WHISKY','AMERICAN IRISH WHISKY','SCOTCH WHISKY','WHISKY','MIXERS','MOCKTAIL','BREEZER'];
                    drinks = outletFound.drinks;
                    category.find({}, function (err, categories) {
                        if(!err && categories){
                            for(var i=0;i<drinks.length;i++){
                                drinkObj = {};
                                if(drinks[i].category == 'VODKA'){
                                    drinkObj.mainCategory = 'VODKA';
                                    drinkObj.available = drinks[i].available;
                                    drinkObj.basePrice = drinks[i].basePrice;
                                    drinkObj.capPrice = drinks[i].capPrice;
                                    drinkObj.category = drinks[i].category;
                                    drinkObj.categoryCode = drinks[i].categoryCode;
                                    drinkObj.demandLevel = drinks[i].demandLevel;
                                    drinkObj.demandRate = drinks[i].demandRate;
                                    drinkObj.drinkId = drinks[i].drinkId;
                                    drinkObj.drinkType = drinks[i].drinkType;
                                    drinkObj.itemCode = drinks[i].itemCode;
                                    drinkObj.name = drinks[i].name;
                                    drinkObj.priceIncrementPerUnit = drinks[i].priceIncrementPerUnit;
                                    drinkObj.priceVariable = drinks[i].priceVariable;
                                    drinkObj.regularPrice = drinks[i].regularPrice;
                                    drinkObj.runningPrice = drinks[i].runningPrice;
                                    drinkObj.status = drinks[i].status;
                                    catObj.arr[0].drinks.push(drinkObj);
                                }
                                else if(drinks[i].category == 'BRANDY'){
                                    drinkObj.mainCategory = 'BRANDY';
                                    drinkObj.available = drinks[i].available;
                                    drinkObj.basePrice = drinks[i].basePrice;
                                    drinkObj.capPrice = drinks[i].capPrice;
                                    drinkObj.category = drinks[i].category;
                                    drinkObj.categoryCode = drinks[i].categoryCode;
                                    drinkObj.demandLevel = drinks[i].demandLevel;
                                    drinkObj.demandRate = drinks[i].demandRate;
                                    drinkObj.drinkId = drinks[i].drinkId;
                                    drinkObj.drinkType = drinks[i].drinkType;
                                    drinkObj.itemCode = drinks[i].itemCode;
                                    drinkObj.name = drinks[i].name;
                                    drinkObj.priceIncrementPerUnit = drinks[i].priceIncrementPerUnit;
                                    drinkObj.priceVariable = drinks[i].priceVariable;
                                    drinkObj.regularPrice = drinks[i].regularPrice;
                                    drinkObj.runningPrice = drinks[i].runningPrice;
                                    drinkObj.status = drinks[i].status;
                                    catObj.arr[3].drinks.push(drinkObj);
                                }
                                else if(drinks[i].category == 'RUM'){
                                    drinkObj.mainCategory = 'RUM';
                                    drinkObj.available = drinks[i].available;
                                    drinkObj.basePrice = drinks[i].basePrice;
                                    drinkObj.capPrice = drinks[i].capPrice;
                                    drinkObj.category = drinks[i].category;
                                    drinkObj.categoryCode = drinks[i].categoryCode;
                                    drinkObj.demandLevel = drinks[i].demandLevel;
                                    drinkObj.demandRate = drinks[i].demandRate;
                                    drinkObj.drinkId = drinks[i].drinkId;
                                    drinkObj.drinkType = drinks[i].drinkType;
                                    drinkObj.itemCode = drinks[i].itemCode;
                                    drinkObj.name = drinks[i].name;
                                    drinkObj.priceIncrementPerUnit = drinks[i].priceIncrementPerUnit;
                                    drinkObj.priceVariable = drinks[i].priceVariable;
                                    drinkObj.regularPrice = drinks[i].regularPrice;
                                    drinkObj.runningPrice = drinks[i].runningPrice;
                                    drinkObj.status = drinks[i].status;
                                    catObj.arr[1].drinks.push(drinkObj);
                                }
                                else if(drinks[i].category == 'GIN'){
                                    drinkObj.mainCategory = 'GIN';
                                    drinkObj.available = drinks[i].available;
                                    drinkObj.basePrice = drinks[i].basePrice;
                                    drinkObj.capPrice = drinks[i].capPrice;
                                    drinkObj.category = drinks[i].category;
                                    drinkObj.categoryCode = drinks[i].categoryCode;
                                    drinkObj.demandLevel = drinks[i].demandLevel;
                                    drinkObj.demandRate = drinks[i].demandRate;
                                    drinkObj.drinkId = drinks[i].drinkId;
                                    drinkObj.drinkType = drinks[i].drinkType;
                                    drinkObj.itemCode = drinks[i].itemCode;
                                    drinkObj.name = drinks[i].name;
                                    drinkObj.priceIncrementPerUnit = drinks[i].priceIncrementPerUnit;
                                    drinkObj.priceVariable = drinks[i].priceVariable;
                                    drinkObj.regularPrice = drinks[i].regularPrice;
                                    drinkObj.runningPrice = drinks[i].runningPrice;
                                    drinkObj.status = drinks[i].status;
                                    catObj.arr[2].drinks.push(drinkObj);
                                }
                                else if(drinks[i].category == 'SHOTS'){
                                    drinkObj.mainCategory = 'SHOTS';
                                    drinkObj.available = drinks[i].available;
                                    drinkObj.basePrice = drinks[i].basePrice;
                                    drinkObj.capPrice = drinks[i].capPrice;
                                    drinkObj.category = drinks[i].category;
                                    drinkObj.categoryCode = drinks[i].categoryCode;
                                    drinkObj.demandLevel = drinks[i].demandLevel;
                                    drinkObj.demandRate = drinks[i].demandRate;
                                    drinkObj.drinkId = drinks[i].drinkId;
                                    drinkObj.drinkType = drinks[i].drinkType;
                                    drinkObj.itemCode = drinks[i].itemCode;
                                    drinkObj.name = drinks[i].name;
                                    drinkObj.priceIncrementPerUnit = drinks[i].priceIncrementPerUnit;
                                    drinkObj.priceVariable = drinks[i].priceVariable;
                                    drinkObj.regularPrice = drinks[i].regularPrice;
                                    drinkObj.runningPrice = drinks[i].runningPrice;
                                    drinkObj.status = drinks[i].status;
                                    catObj.arr[4].drinks.push(drinkObj);
                                }
                                else if(drinks[i].category == 'BEERS'){
                                    drinkObj.mainCategory = 'BEER';
                                    drinkObj.available = drinks[i].available;
                                    drinkObj.basePrice = drinks[i].basePrice;
                                    drinkObj.capPrice = drinks[i].capPrice;
                                    drinkObj.category = drinks[i].category;
                                    drinkObj.categoryCode = drinks[i].categoryCode;
                                    drinkObj.demandLevel = drinks[i].demandLevel;
                                    drinkObj.demandRate = drinks[i].demandRate;
                                    drinkObj.drinkId = drinks[i].drinkId;
                                    drinkObj.drinkType = drinks[i].drinkType;
                                    drinkObj.itemCode = drinks[i].itemCode;
                                    drinkObj.name = drinks[i].name;
                                    drinkObj.priceIncrementPerUnit = drinks[i].priceIncrementPerUnit;
                                    drinkObj.priceVariable = drinks[i].priceVariable;
                                    drinkObj.regularPrice = drinks[i].regularPrice;
                                    drinkObj.runningPrice = drinks[i].runningPrice;
                                    drinkObj.status = drinks[i].status;
                                    catObj.arr[5].drinks.push(drinkObj);
                                }
                                else if(drinks[i].category == 'FRESH BEER'){
                                    drinkObj.mainCategory = 'FRESH BEER';
                                    drinkObj.available = drinks[i].available;
                                    drinkObj.basePrice = drinks[i].basePrice;
                                    drinkObj.capPrice = drinks[i].capPrice;
                                    drinkObj.category = drinks[i].category;
                                    drinkObj.categoryCode = drinks[i].categoryCode;
                                    drinkObj.demandLevel = drinks[i].demandLevel;
                                    drinkObj.demandRate = drinks[i].demandRate;
                                    drinkObj.drinkId = drinks[i].drinkId;
                                    drinkObj.drinkType = drinks[i].drinkType;
                                    drinkObj.itemCode = drinks[i].itemCode;
                                    drinkObj.name = drinks[i].name;
                                    drinkObj.priceIncrementPerUnit = drinks[i].priceIncrementPerUnit;
                                    drinkObj.priceVariable = drinks[i].priceVariable;
                                    drinkObj.regularPrice = drinks[i].regularPrice;
                                    drinkObj.runningPrice = drinks[i].runningPrice;
                                    drinkObj.status = drinks[i].status;
                                    catObj.arr[6].drinks.push(drinkObj);
                                }
                                else if(drinks[i].category == 'LIQUERS'){
                                    drinkObj.mainCategory = 'LIQUERS';
                                    drinkObj.available = drinks[i].available;
                                    drinkObj.basePrice = drinks[i].basePrice;
                                    drinkObj.capPrice = drinks[i].capPrice;
                                    drinkObj.category = drinks[i].category;
                                    drinkObj.categoryCode = drinks[i].categoryCode;
                                    drinkObj.demandLevel = drinks[i].demandLevel;
                                    drinkObj.demandRate = drinks[i].demandRate;
                                    drinkObj.drinkId = drinks[i].drinkId;
                                    drinkObj.drinkType = drinks[i].drinkType;
                                    drinkObj.itemCode = drinks[i].itemCode;
                                    drinkObj.name = drinks[i].name;
                                    drinkObj.priceIncrementPerUnit = drinks[i].priceIncrementPerUnit;
                                    drinkObj.priceVariable = drinks[i].priceVariable;
                                    drinkObj.regularPrice = drinks[i].regularPrice;
                                    drinkObj.runningPrice = drinks[i].runningPrice;
                                    drinkObj.status = drinks[i].status;
                                    catObj.arr[7].drinks.push(drinkObj);
                                }
                                else if(drinks[i].category == 'CLASSIC COCKTAILS' || drinks[i].category == 'SUMMER SPECIAL MOJITO' || drinks[i].category == 'FRESH FRUIT COCKTAIL' || drinks[i].category == 'HOUSE COCKTAILS'){
                                    drinkObj.mainCategory = 'COCKTAILS';
                                    drinkObj.available = drinks[i].available;
                                    drinkObj.basePrice = drinks[i].basePrice;
                                    drinkObj.capPrice = drinks[i].capPrice;
                                    drinkObj.category = drinks[i].category;
                                    drinkObj.categoryCode = drinks[i].categoryCode;
                                    drinkObj.demandLevel = drinks[i].demandLevel;
                                    drinkObj.demandRate = drinks[i].demandRate;
                                    drinkObj.drinkId = drinks[i].drinkId;
                                    drinkObj.drinkType = drinks[i].drinkType;
                                    drinkObj.itemCode = drinks[i].itemCode;
                                    drinkObj.name = drinks[i].name;
                                    drinkObj.priceIncrementPerUnit = drinks[i].priceIncrementPerUnit;
                                    drinkObj.priceVariable = drinks[i].priceVariable;
                                    drinkObj.regularPrice = drinks[i].regularPrice;
                                    drinkObj.runningPrice = drinks[i].runningPrice;
                                    drinkObj.status = drinks[i].status;
                                    catObj.arr[8].drinks.push(drinkObj);
                                }
                                else if(drinks[i].category == 'MARTINI'){
                                    drinkObj.mainCategory = 'MARTINI';
                                    drinkObj.available = drinks[i].available;
                                    drinkObj.basePrice = drinks[i].basePrice;
                                    drinkObj.capPrice = drinks[i].capPrice;
                                    drinkObj.category = drinks[i].category;
                                    drinkObj.categoryCode = drinks[i].categoryCode;
                                    drinkObj.demandLevel = drinks[i].demandLevel;
                                    drinkObj.demandRate = drinks[i].demandRate;
                                    drinkObj.drinkId = drinks[i].drinkId;
                                    drinkObj.drinkType = drinks[i].drinkType;
                                    drinkObj.itemCode = drinks[i].itemCode;
                                    drinkObj.name = drinks[i].name;
                                    drinkObj.priceIncrementPerUnit = drinks[i].priceIncrementPerUnit;
                                    drinkObj.priceVariable = drinks[i].priceVariable;
                                    drinkObj.regularPrice = drinks[i].regularPrice;
                                    drinkObj.runningPrice = drinks[i].runningPrice;
                                    drinkObj.status = drinks[i].status;
                                    catObj.arr[9].drinks.push(drinkObj);
                                }
                                else if(drinks[i].category == 'SPECIAL OFFER'){
                                    drinkObj.mainCategory = 'SHOTS';
                                    drinkObj.available = drinks[i].available;
                                    drinkObj.basePrice = drinks[i].basePrice;
                                    drinkObj.capPrice = drinks[i].capPrice;
                                    drinkObj.category = drinks[i].category;
                                    drinkObj.categoryCode = drinks[i].categoryCode;
                                    drinkObj.demandLevel = drinks[i].demandLevel;
                                    drinkObj.demandRate = drinks[i].demandRate;
                                    drinkObj.drinkId = drinks[i].drinkId;
                                    drinkObj.drinkType = drinks[i].drinkType;
                                    drinkObj.itemCode = drinks[i].itemCode;
                                    drinkObj.name = drinks[i].name;
                                    drinkObj.priceIncrementPerUnit = drinks[i].priceIncrementPerUnit;
                                    drinkObj.priceVariable = drinks[i].priceVariable;
                                    drinkObj.regularPrice = drinks[i].regularPrice;
                                    drinkObj.runningPrice = drinks[i].runningPrice;
                                    drinkObj.status = drinks[i].status;
                                    catObj.arr[4].drinks.push(drinkObj);
                                }
                                else if(drinks[i].category == 'WINES'){
                                    drinkObj.mainCategory = 'WINE';
                                    drinkObj.available = drinks[i].available;
                                    drinkObj.basePrice = drinks[i].basePrice;
                                    drinkObj.capPrice = drinks[i].capPrice;
                                    drinkObj.category = drinks[i].category;
                                    drinkObj.categoryCode = drinks[i].categoryCode;
                                    drinkObj.demandLevel = drinks[i].demandLevel;
                                    drinkObj.demandRate = drinks[i].demandRate;
                                    drinkObj.drinkId = drinks[i].drinkId;
                                    drinkObj.drinkType = drinks[i].drinkType;
                                    drinkObj.itemCode = drinks[i].itemCode;
                                    drinkObj.name = drinks[i].name;
                                    drinkObj.priceIncrementPerUnit = drinks[i].priceIncrementPerUnit;
                                    drinkObj.priceVariable = drinks[i].priceVariable;
                                    drinkObj.regularPrice = drinks[i].regularPrice;
                                    drinkObj.runningPrice = drinks[i].runningPrice;
                                    drinkObj.status = drinks[i].status;
                                    catObj.arr[10].drinks.push(drinkObj);
                                }
                                else if(drinks[i].category == 'IMPORTED WINE'){
                                    drinkObj.mainCategory = 'IMPORTED WINE';
                                    drinkObj.available = drinks[i].available;
                                    drinkObj.basePrice = drinks[i].basePrice;
                                    drinkObj.capPrice = drinks[i].capPrice;
                                    drinkObj.category = drinks[i].category;
                                    drinkObj.categoryCode = drinks[i].categoryCode;
                                    drinkObj.demandLevel = drinks[i].demandLevel;
                                    drinkObj.demandRate = drinks[i].demandRate;
                                    drinkObj.drinkId = drinks[i].drinkId;
                                    drinkObj.drinkType = drinks[i].drinkType;
                                    drinkObj.itemCode = drinks[i].itemCode;
                                    drinkObj.name = drinks[i].name;
                                    drinkObj.priceIncrementPerUnit = drinks[i].priceIncrementPerUnit;
                                    drinkObj.priceVariable = drinks[i].priceVariable;
                                    drinkObj.regularPrice = drinks[i].regularPrice;
                                    drinkObj.runningPrice = drinks[i].runningPrice;
                                    drinkObj.status = drinks[i].status;
                                    catObj.arr[11].drinks.push(drinkObj);
                                }
                                else if(drinks[i].category == 'CHAMPAGNE'){
                                    drinkObj.mainCategory = 'CHAMPAGNE';
                                    drinkObj.available = drinks[i].available;
                                    drinkObj.basePrice = drinks[i].basePrice;
                                    drinkObj.capPrice = drinks[i].capPrice;
                                    drinkObj.category = drinks[i].category;
                                    drinkObj.categoryCode = drinks[i].categoryCode;
                                    drinkObj.demandLevel = drinks[i].demandLevel;
                                    drinkObj.demandRate = drinks[i].demandRate;
                                    drinkObj.drinkId = drinks[i].drinkId;
                                    drinkObj.drinkType = drinks[i].drinkType;
                                    drinkObj.itemCode = drinks[i].itemCode;
                                    drinkObj.name = drinks[i].name;
                                    drinkObj.priceIncrementPerUnit = drinks[i].priceIncrementPerUnit;
                                    drinkObj.priceVariable = drinks[i].priceVariable;
                                    drinkObj.regularPrice = drinks[i].regularPrice;
                                    drinkObj.runningPrice = drinks[i].runningPrice;
                                    drinkObj.status = drinks[i].status;
                                    catObj.arr[12].drinks.push(drinkObj);
                                }
                                else if(drinks[i].category == 'SINGLE MALTS'){
                                    drinkObj.mainCategory = 'SINGLE MALTS';
                                    drinkObj.available = drinks[i].available;
                                    drinkObj.basePrice = drinks[i].basePrice;
                                    drinkObj.capPrice = drinks[i].capPrice;
                                    drinkObj.category = drinks[i].category;
                                    drinkObj.categoryCode = drinks[i].categoryCode;
                                    drinkObj.demandLevel = drinks[i].demandLevel;
                                    drinkObj.demandRate = drinks[i].demandRate;
                                    drinkObj.drinkId = drinks[i].drinkId;
                                    drinkObj.drinkType = drinks[i].drinkType;
                                    drinkObj.itemCode = drinks[i].itemCode;
                                    drinkObj.name = drinks[i].name;
                                    drinkObj.priceIncrementPerUnit = drinks[i].priceIncrementPerUnit;
                                    drinkObj.priceVariable = drinks[i].priceVariable;
                                    drinkObj.regularPrice = drinks[i].regularPrice;
                                    drinkObj.runningPrice = drinks[i].runningPrice;
                                    drinkObj.status = drinks[i].status;
                                    catObj.arr[13].drinks.push(drinkObj);
                                }
                                else if(drinks[i].category == 'PREMIUM WHISKY'){
                                    drinkObj.mainCategory = 'PREMIUM WHISKY';
                                    drinkObj.available = drinks[i].available;
                                    drinkObj.basePrice = drinks[i].basePrice;
                                    drinkObj.capPrice = drinks[i].capPrice;
                                    drinkObj.category = drinks[i].category;
                                    drinkObj.categoryCode = drinks[i].categoryCode;
                                    drinkObj.demandLevel = drinks[i].demandLevel;
                                    drinkObj.demandRate = drinks[i].demandRate;
                                    drinkObj.drinkId = drinks[i].drinkId;
                                    drinkObj.drinkType = drinks[i].drinkType;
                                    drinkObj.itemCode = drinks[i].itemCode;
                                    drinkObj.name = drinks[i].name;
                                    drinkObj.priceIncrementPerUnit = drinks[i].priceIncrementPerUnit;
                                    drinkObj.priceVariable = drinks[i].priceVariable;
                                    drinkObj.regularPrice = drinks[i].regularPrice;
                                    drinkObj.runningPrice = drinks[i].runningPrice;
                                    drinkObj.status = drinks[i].status;
                                    catObj.arr[14].drinks.push(drinkObj);
                                }
                                else if(drinks[i].category == 'AMERICAN IRISH WHISKY'){
                                    drinkObj.mainCategory = 'AMERICAN IRISH WHISKY';
                                    drinkObj.available = drinks[i].available;
                                    drinkObj.basePrice = drinks[i].basePrice;
                                    drinkObj.capPrice = drinks[i].capPrice;
                                    drinkObj.category = drinks[i].category;
                                    drinkObj.categoryCode = drinks[i].categoryCode;
                                    drinkObj.demandLevel = drinks[i].demandLevel;
                                    drinkObj.demandRate = drinks[i].demandRate;
                                    drinkObj.drinkId = drinks[i].drinkId;
                                    drinkObj.drinkType = drinks[i].drinkType;
                                    drinkObj.itemCode = drinks[i].itemCode;
                                    drinkObj.name = drinks[i].name;
                                    drinkObj.priceIncrementPerUnit = drinks[i].priceIncrementPerUnit;
                                    drinkObj.priceVariable = drinks[i].priceVariable;
                                    drinkObj.regularPrice = drinks[i].regularPrice;
                                    drinkObj.runningPrice = drinks[i].runningPrice;
                                    drinkObj.status = drinks[i].status;
                                    catObj.arr[15].drinks.push(drinkObj);
                                }
                                else if(drinks[i].category == 'SCOTCH WHISKY'){
                                    drinkObj.mainCategory = 'SCOTCH WHISKY';
                                    drinkObj.available = drinks[i].available;
                                    drinkObj.basePrice = drinks[i].basePrice;
                                    drinkObj.capPrice = drinks[i].capPrice;
                                    drinkObj.category = drinks[i].category;
                                    drinkObj.categoryCode = drinks[i].categoryCode;
                                    drinkObj.demandLevel = drinks[i].demandLevel;
                                    drinkObj.demandRate = drinks[i].demandRate;
                                    drinkObj.drinkId = drinks[i].drinkId;
                                    drinkObj.drinkType = drinks[i].drinkType;
                                    drinkObj.itemCode = drinks[i].itemCode;
                                    drinkObj.name = drinks[i].name;
                                    drinkObj.priceIncrementPerUnit = drinks[i].priceIncrementPerUnit;
                                    drinkObj.priceVariable = drinks[i].priceVariable;
                                    drinkObj.regularPrice = drinks[i].regularPrice;
                                    drinkObj.runningPrice = drinks[i].runningPrice;
                                    drinkObj.status = drinks[i].status;
                                    catObj.arr[16].drinks.push(drinkObj);
                                }
                                else if(drinks[i].category == 'WHISKY'){
                                    drinkObj.mainCategory = 'WHISKY';
                                    drinkObj.available = drinks[i].available;
                                    drinkObj.basePrice = drinks[i].basePrice;
                                    drinkObj.capPrice = drinks[i].capPrice;
                                    drinkObj.category = drinks[i].category;
                                    drinkObj.categoryCode = drinks[i].categoryCode;
                                    drinkObj.demandLevel = drinks[i].demandLevel;
                                    drinkObj.demandRate = drinks[i].demandRate;
                                    drinkObj.drinkId = drinks[i].drinkId;
                                    drinkObj.drinkType = drinks[i].drinkType;
                                    drinkObj.itemCode = drinks[i].itemCode;
                                    drinkObj.name = drinks[i].name;
                                    drinkObj.priceIncrementPerUnit = drinks[i].priceIncrementPerUnit;
                                    drinkObj.priceVariable = drinks[i].priceVariable;
                                    drinkObj.regularPrice = drinks[i].regularPrice;
                                    drinkObj.runningPrice = drinks[i].runningPrice;
                                    drinkObj.status = drinks[i].status;
                                    catObj.arr[17].drinks.push(drinkObj);
                                }
                                else if(drinks[i].category == 'MIXERS' || drinks[i].category == 'NON ALCOHOLIC' || drinks[i].category == 'MOCKTAILS'){
                                    drinkObj.mainCategory = 'MIXERS';
                                    drinkObj.available = drinks[i].available;
                                    drinkObj.basePrice = drinks[i].basePrice;
                                    drinkObj.capPrice = drinks[i].capPrice;
                                    drinkObj.category = drinks[i].category;
                                    drinkObj.categoryCode = drinks[i].categoryCode;
                                    drinkObj.demandLevel = drinks[i].demandLevel;
                                    drinkObj.demandRate = drinks[i].demandRate;
                                    drinkObj.drinkId = drinks[i].drinkId;
                                    drinkObj.drinkType = drinks[i].drinkType;
                                    drinkObj.itemCode = drinks[i].itemCode;
                                    drinkObj.name = drinks[i].name;
                                    drinkObj.priceIncrementPerUnit = drinks[i].priceIncrementPerUnit;
                                    drinkObj.priceVariable = drinks[i].priceVariable;
                                    drinkObj.regularPrice = drinks[i].regularPrice;
                                    drinkObj.runningPrice = drinks[i].runningPrice;
                                    drinkObj.status = drinks[i].status;
                                    catObj.arr[18].drinks.push(drinkObj);
                                }
                                else if(drinks[i].category == 'MOCKTAILS'){
                                    drinkObj.mainCategory = 'MOCKTAIL';
                                    drinkObj.available = drinks[i].available;
                                    drinkObj.basePrice = drinks[i].basePrice;
                                    drinkObj.capPrice = drinks[i].capPrice;
                                    drinkObj.category = drinks[i].category;
                                    drinkObj.categoryCode = drinks[i].categoryCode;
                                    drinkObj.demandLevel = drinks[i].demandLevel;
                                    drinkObj.demandRate = drinks[i].demandRate;
                                    drinkObj.drinkId = drinks[i].drinkId;
                                    drinkObj.drinkType = drinks[i].drinkType;
                                    drinkObj.itemCode = drinks[i].itemCode;
                                    drinkObj.name = drinks[i].name;
                                    drinkObj.priceIncrementPerUnit = drinks[i].priceIncrementPerUnit;
                                    drinkObj.priceVariable = drinks[i].priceVariable;
                                    drinkObj.regularPrice = drinks[i].regularPrice;
                                    drinkObj.runningPrice = drinks[i].runningPrice;
                                    drinkObj.status = drinks[i].status;
                                    catObj.arr[18].drinks.push(drinkObj);
                                }
                                else if(drinks[i].category == 'BREEZERS'){
                                    drinkObj.mainCategory = 'BREEZER';
                                    drinkObj.available = drinks[i].available;
                                    drinkObj.basePrice = drinks[i].basePrice;
                                    drinkObj.capPrice = drinks[i].capPrice;
                                    drinkObj.category = drinks[i].category;
                                    drinkObj.categoryCode = drinks[i].categoryCode;
                                    drinkObj.demandLevel = drinks[i].demandLevel;
                                    drinkObj.demandRate = drinks[i].demandRate;
                                    drinkObj.drinkId = drinks[i].drinkId;
                                    drinkObj.drinkType = drinks[i].drinkType;
                                    drinkObj.itemCode = drinks[i].itemCode;
                                    drinkObj.name = drinks[i].name;
                                    drinkObj.priceIncrementPerUnit = drinks[i].priceIncrementPerUnit;
                                    drinkObj.priceVariable = drinks[i].priceVariable;
                                    drinkObj.regularPrice = drinks[i].regularPrice;
                                    drinkObj.runningPrice = drinks[i].runningPrice;
                                    drinkObj.status = drinks[i].status;
                                    catObj.arr[20].drinks.push(drinkObj);
                                }
                            }
                            if(i>=drinks.length){
                                socket.emit("drinks2",catObj);
                            }

                            Feed.find({}, function (err, feedsList) {
                                if (!err && feedsList) {
                                    feedsList = feedsList.reverse();
                                    feedObj.arr = feedsList;
                                    socket.emit("feeds2",feedObj);
                                } else console.log(err);
                            }).sort({feedId: -1}).lean().limit(10);
                        }
                    }).lean();

                }
            }).lean();

        });

/*
        Outlet.findOne({outletId:1}, function (err, outletFound) {
            if(!err && outletFound!=null){

                var socktObj = {
                    arr:[],
                    outletId: outletFound.outletId
                };
                var limit = 10;
                for(var sd=0;sd<limit;sd++){
                    socktObj.arr.push(outletFound.drinks[sd]);

                }
                if(sd>=limit){
                    io.emit('pricechanged', socktObj);
                }

            }else{
                console.log(err);
            }
        });
*/


/*
        socket.on('pricechange', function () {
            Outlet.findOne({outletId:1}, function (err, outletFound) {
                if(!err && outletFound!=null){

                    var socktObj = {
                        arr:[],
                        outletId: outletFound.outletId
                    };
                    var limit = 10;
                    for(var sd=0;sd<limit;sd++){
                            socktObj.arr.push(outletFound.drinks[sd]);

                    }
                    if(sd>=limit){
                        io.emit('pricechanged', socktObj);
                    }

                }else{
                    console.log(err);
                }
            });
        });
*/


    });
};
