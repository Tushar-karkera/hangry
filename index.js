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

// creation of schemas for the hotel and the user

const HotelSchema = new mongoose.Schema({
    name: String,
    food: {
        starters: {
            foodItem1: {
                foodname: String,
                price: Number
            },
            foodItem2: {
                foodname: String,
                price: Number
            }
        },
        meals: {
            meal1: {
                foodname: String,
                price: Number
            },
            meal2: {
                foodname: String,
                price: Number
            }
        },
        beverage: {
            drink1: {
                foodname: String,
                price: Number
            },
            drink2: {
                foodname: String,
                price: Number
            }
        }
    }
});

const userSchema = new mongoose.Schema({
    userName: String,
    password: String
});


// creation of models for the hotel and the user 
const Hotel = mongoose.model("Hotel", HotelSchema);

const User = mongoose.model("User", userSchema);

// routing for the hotels
app.route("/hotel")
    .get(function (req, res) {
        Hotel.find({}, function (err, foundArticles) {
            if (err) {
                res.send(err);
            }
            else {
                res.send(foundArticles)
            }
        });
    })
    .post(function (req, res) {

        const newHotel = new Hotel({
            name: req.body.name,
            food: {
                starters: {
                    foodItem1: {
                        foodname: req.body.food[0].starters.foodItem1.foodname,
                        price: req.body.food[0].starters.foodItem1.price
                    },
                    foodItem2: {
                        foodname: req.body.food[0].starters.foodItem2.foodname,
                        price: req.body.food[0].starters.foodItem2.price
                    }
                },
                meals: {
                    meal1: {
                        foodname: req.body.food[1].meals.meal1.foodname,
                        price: req.body.food[1].meals.meal1.price
                    },
                    meal2: {
                        foodname: req.body.food[1].meals.meal2.foodname,
                        price: req.body.food[1].meals.meal2.price
                    }
                },
                beverage: {
                    drink1: {
                        foodname: req.body.food[2].beverage.drink1.foodname,
                        price: req.body.food[2].beverage.drink1.price
                    },
                    drink2: {
                        foodname: req.body.food[2].beverage.drink1.foodname,
                        price: req.body.food[2].beverage.drink1.price
                    }
                }
            }
        })
        newHotel.save(function (err) {
            if (!err) {
                res.send("successfull");
            }
            else {
                res.send(err);
            }
        })

    })
    .delete(function (req, res) {
        Hotel.deleteMany({}, function (err) {
            if (!err) {
                res.send("successfully deleted all Hotels");
            } else {
                res.send(err);
            }
        })
    });


// routing for custom hotel name 
app.route("/hotel/:hotelname")
    .get(function (req, res) {
        Hotel.findOne({ name: req.params.hotelname }, function (err, foundHotel) {
            if (err) {
                res.send(err);
            }
            if (foundHotel) {
                res.send(foundHotel);
            } else {
                res.send("No Hotel found");
            }
        })
    })

    .put(function (req, res) {
        Hotel.updateOne(
            { name: req.params.hotelname },
            {
                name: req.body.name,
                food: {
                    starters: {
                        foodItem1: {
                            foodname: req.body.food[0].starters.foodItem1.foodname,
                            price: req.body.food[0].starters.foodItem1.price
                        },
                        foodItem2: {
                            foodname: req.body.food[0].starters.foodItem2.foodname,
                            price: req.body.food[0].starters.foodItem2.price
                        }
                    },
                    meals: {
                        meal1: {
                            foodname: req.body.food[1].meals.meal1.foodname,
                            price: req.body.food[1].meals.meal1.price
                        },
                        meal2: {
                            foodname: req.body.food[1].meals.meal2.foodname,
                            price: req.body.food[1].meals.meal2.price
                        }
                    },
                    beverage: {
                        drink1: {
                            foodname: req.body.food[2].beverage.drink1.foodname,
                            price: req.body.food[2].beverage.drink1.price
                        },
                        drink2: {
                            foodname: req.body.food[2].beverage.drink1.foodname,
                            price: req.body.food[2].beverage.drink1.price
                        }
                    }
                }
            },
            {
                upsert: true
            }, function (err) {
                if (!err) {
                    res.send("Update was successfull");
                }
                else {
                    console.log(err);
                    res.send(err);
                }
            })
    })

    .patch(function (req, res) {
        Hotel.updateOne({ name: req.params.hotelname },
            {
                $set: req.body
            }, function (err) {
                if (!err) {
                    res.send("successfully updated Hotel");
                } else {
                    res.send(err);
                }
            })
    })

    .delete(function (req, res) {
        Hotel.deleteOne({ name: req.params.hotelname }, function (err) {
            if (!err) {
                res.send("deleted successfully ");
            } else {
                res.send(err);
            }
        })
    });


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
                                res.send(err);
                            } else {
                                res.send("user saved successfully");
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
        res.send("error in format");
    }
    else {

        User.findOne({ userName: req.body.userName }, function (err, result) {
            if (err) {
                res.send("User not found ");
            } else {
                // res.send(result.password);
                bcrypt.compare(req.body.password, result.password, function (err, response) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.send(response);
                    }
                })
            }

        })
    }
});



app.listen(port, function () {
    console.log("server has started ");
});