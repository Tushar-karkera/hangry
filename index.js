const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require('dotenv').config();
const port = process.env.PORT || 3005

const saltRounds = 3;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect(`mongodb+srv://tushar1:${process.env.PASSWORD}@clusterhangry.gnumwml.mongodb.net/?retryWrites=true&w=majority`);
//mongoose.connect('mongodb://127.0.0.1:27017/hangry');

// creation of schemas for the hotel and the user

//orders schema (food ordered by customers)
const order = new mongoose.Schema({
    hotelName : String,
    customerName : String,
    orders : []
})

// single food item for hotels
const food = new mongoose.Schema({
    hotelName: String,
    foodName: String,
    price: String
})

//user details schema
const userSchema = new mongoose.Schema({
    userName: String,
    password: String
});

//hotel admin/manager details schema
const hotelUser = new mongoose.Schema({
    hotelName: String,
    password: String
});


//food model
const Food = mongoose.model("Food", food);

//hotel login
const HotelUser = mongoose.model("HotelUSer", hotelUser);

//user login
const User = mongoose.model("User", userSchema);

//orders model
const Order = mongoose.model("Order",order);


// routing for users 

app.route("/user")
    .get(function (req, res) {
        User.findOne({}, function (err, response) {
            if (err) {
                res.send(err);
            } else {
                res.send(response);
            }
        })
    })

    .post(function (req, res) {
        if (req.body.userName == "" || req.body.password == "") {
            res.send("error in json format");
        }
        var hashedPassword = "";
        bcrypt.genSalt(saltRounds, function (err1, salt) {
            if (err1) {
                console.log(err1);
            } else {
                bcrypt.hash(req.body.password, salt, function (err2, hash) {
                    if (err2) {
                        console.log(err2);
                    } else {
                        const user = new User({
                            userName: req.body.userName,
                            password: hash
                        });

                        user.save(function (err) {
                            if (err) {
                                obj = {
                                    "response": err
                                }
                                res.send(obj);
                            } else {
                                obj = {
                                    "response": "true"
                                }
                                res.send(obj);
                            }
                        })
                    }
                });
            }
        });

    })

    .delete(function (req, res) {
        User.deleteMany({}, function (err) {
            if (!err) {
                res.send("successfully deleted all Users");
            } else {
                res.send(err);
            }
        })
    })



// verify the users
app.post("/user/verify", function (req, res) {
    if (Object.keys(req.body).length === 0) {
        res.send("error in format ");
    }
    else if (req.body.userName == '' || req.body.password == '') {
        res.send("error in format")
    }
    else {

        User.findOne({ userName: req.body.userName }, function (err, result) {
            if (err) {
                obj = {
                    "response": "false"
                }
                res.send(obj);
                console.log("user was found");
            } else {
                if (result == null) {
                    obj = {
                        "response": "false"
                    }
                    res.send(obj);
                } else {
                    bcrypt.compare(req.body.password, result.password, function (err2, response) {
                        if (err2) {
                            console.log(err2);
                            console.log("error occurred");
                        } else {
                            obj = {
                                "response": response
                            }
                            res.send(obj);
                            console.log(response);
                        }
                    })
                }
            }

        })
    }
});


//routing for hotel owners

app.route("/hoteluser")
    .get(function (req, res) {
        HotelUser.find({}, function (err, response) {
            if (err) {
                res.send(err);
            } else {
                res.send(response);
            }
        })
    })

    .post(function (req, res) {
        if (req.body.hotelName == "" || req.body.password == "") {
            res.send("error in json format");
        }
        var hashedPassword = "";
        bcrypt.genSalt(saltRounds, function (err1, salt) {
            if (err1) {
                console.log(err1);
            } else {
                bcrypt.hash(req.body.password, salt, function (err2, hash) {
                    if (err2) {
                        console.log(err2);
                    } else {
                        const hoteluser = new HotelUser({
                            hotelName: req.body.hotelName,
                            password: hash
                        });

                        hoteluser.save(function (err) {
                            if (err) {
                                res.send(err);
                            } else {
                                res.send("hotel owner saved successfully");
                            }
                        })
                    }
                });
            }
        });

    })

    .delete(function (req, res) {
        HotelUser.deleteMany({}, function (err) {
            if (!err) {
                res.send("successfully deleted all Users");
            } else {
                res.send(err);
            }
        })
    })



// verify the hotel owners
app.post("/hoteluser/verify", function (req, res) {
    if (Object.keys(req.body).length === 0) {
        res.send("error in format ");
    }
    else if (req.body.hotelName == '' || req.body.password == '') {
        res.send("error in format")
    }
    else {

        HotelUser.findOne({ hotelName: req.body.hotelName }, function (err1, result) {
            if (err1) {
                res.send("hotel owner not found ");
            } else {
                console.log("result is " + result);
                if (result == null) {
                    obj = {
                        "response": "false"
                    }
                    res.send(obj);
                }
                else {
                    bcrypt.compare(req.body.password, result.password, function (err2, response) {
                        if (err2) {
                            console.log(err2);
                            console.log("error occurred");
                        } else {
                            obj = {
                                "response": response
                            }
                            res.send(obj);
                            console.log(response);
                        }
                    })
                }
            }

        })
    }
});


//food routing
app.route("/food/:hotelname")
    //get all food of a particular hotel
    .get(function (req, res) {
        Food.find({ hotelName: req.params.hotelname }, function (err, foundHotel) {
            if (err) {
                res.send(err);
            }
            if (foundHotel.length >0) {

                var obj = {
                    "foodItems" : foundHotel
                }
                res.send(obj);
            } else {
                res.send("No food found");
            }
        })
    })

    //delete a specifc food item of a hotel given a food name
    .delete(function (req, res) {
        Food.deleteOne({ hotelName: req.params.hotelname, foodName: req.body.foodName }, function (err) {
            if (!err) {
                res.send("deleted food successfully ");
            } else {
                res.send(err);
            }
        })
    });

//save the food items of hotels with their price
app.post("/food",function(req,res){
    const food = new Food({
        hotelName: req.body.hotelName,
        foodName : req.body.foodName,
        price:req.body.price
    })

    food.save(function(err){
        if(err){
            res.send(err)
        }else{
            res.send("food saved successfully")
        }
    });
})

//end point to save the posted order
app.post("/placeorder",function(req,res){
    const order = new Order({
        hotelName: req.body.hotelName,
        customerName: req.body.customerName,
        orders : req.body.orders
    })

    order.save(function(err){
        if(err){
            res.send("order couldn't be placed")
        }else{
            res.send("order placed successfully")
        }
    })
})

//end point for getting the records and searching particular orders of a specific hotel
app.route("/order")
    .get(function(req,res){
        Order.find({},function(err,orders){
            if(err){
                res.send("error occurred while searching orders")
            }else if(!orders.length){
                res.send("no orders found")
            }else{

                var obj = {
                    "orders" : orders
                }
                res.send(obj)
            }
        })
    })

    //end point to get all the orders of a particular hotel
    .post(function(req,res){
        var hotelName = req.body.hotelName
        Order.find({hotelName:hotelName},function(err,orders){
            if(err){
                res.send("error occurred while searching orders")
            }else if(!orders.length){
                res.send("no orders found")
            }else{
                res.send(orders)
            }
        })
    })

    //end point to delete a order of a particular hotel given a customer name 
    .delete(function (req, res) {
        Order.deleteOne({$and:[{ hotelName: req.body.hotelName}, {customerName: req.body.customerName }]}, function (err) {
            if (!err) {
                res.send("deleted order successfully ");
            } else {
                res.send(err);
            }
        })
    });



app.listen(port, function () {
    console.log("server has started on port " + port);
});