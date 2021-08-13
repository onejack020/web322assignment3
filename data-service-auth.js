const bcrypt = require('bcryptjs');
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var userSchema = new mongoose.Schema({
    "userName" : {
        "type" : String,
        "unique" : true 
    },
    "password" : String,
    "email" : String,
    "loginHistory" : [{
        "dateTime" : Date,
        "userAgent" : String
    }]
});


let User;

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://admin:admin@cluster0.igf3o.mongodb.net/web322?retryWrites=true&w=majority",{useNewUrlParser: true,useUnifiedTopology: true,useCreateIndex: true});
        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });
        db.once('open', () => {
           User = db.model("users", userSchema);
           resolve("connected to database!");
        });
    });
},

module.exports.registerUser = (userData) => {
    return new Promise((resolve, reject) => {
      if (userData.password !== userData.password2)
        reject('Passwords do not match');
      else {
        let newUser = User(userData);
        newUser.save()
          .then(() => {
            resolve();
          })
          .catch(err => {
            if (err.code == 11000)
              reject('user name already taken')
            if (err.code != 11000)
              reject(`There was an error creating the user: ${err}`);
          });
      }
    });
  }

module.exports.checkUser = (userData) => {
    console.log(userData)
    return new Promise((resolve, reject) => {
      User.find({ userName: userData.userName })
        .then(users => {
          bcrypt.compare(userData.password, users[0].password)
            .then((res) => {
              users[0].loginHistory.push({ dateTime: (new Date()).toString(), userAgent: userData.userAgent });
              User.update({ userName: users[0].userName },
                { $set: { loginHistory: users[0].loginHistory } },
                { multi: false })
                .exec()
                .then(() => {
                  resolve(users[0]);
                })
                .catch((err) => {
                  reject(`There was an error verifying the user: ${err}`);
                });
            })
            .catch((err) => {
              reject(`Incorrect Password for user: ${userData.userName}`);
            })
        })
        .catch(err => {
          reject(`Unable to find user: ${userData.userName}`);
        })
    });
  }

