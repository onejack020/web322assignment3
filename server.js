/*********************************************************************************
* WEB322 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: __Yijie Chen________ Student ID: __135405207__ Date: __2021.08.13______
*
* Online (Heroku) Link: ___https://yijiechenassignment3.herokuapp.com/_______________________
*
********************************************************************************/

const express = require("express");
const path = require("path");
const data = require("./data-service.js");
const dataServiceAuth = require("./data-service-auth.js");
const bodyParser = require('body-parser');
const fs = require("fs");
const multer = require("multer");
const app = express();
const exphbs = require("express-handlebars")
const clientSessions = require("client-sessions");

app.engine('.hbs', exphbs({
    extname: '.hbs',
    helpers: {
        navLink: function(url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));
app.set('view engine', '.hbs');
app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
    });
const HTTP_PORT = process.env.PORT || 8080;

// multer requires a few options to be setup to store files with file extensions
// by default it won't store extensions for security reasons
const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
      // we write the filename as the current date down to the millisecond
      // in a large web service this would possibly cause a problem if two people
      // uploaded an image at the exact same time. A better way would be to use GUID's for filenames.
      // this is a simple example.
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  
  // tell multer to use the diskStorage function for naming files instead of the default.
  const upload = multer({ storage: storage });


app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(clientSessions({
    cookieName: "session", 
    secret: "web322assignment_5secret", 
    duration: 2 * 60 * 1000, 
    activeDuration: 1000 * 60 
}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
    });


function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

app.get("/", (req, res) => {
    res.render('home');
});

app.get("/about", (req,res) => {
    res.render('about');
});

app.get("/images/add", (req,res) => {
    res.render('addImage');
});

app.get("/employees/add", (req,res) => {

    data.getDepartments().then((data)=>{
        res.render("addEmployee", {departments: data});
     }).catch((err) => {
       // set department list to empty array
       res.render("addEmployee", {departments: [] });
    }); 
  });


app.get("/images", (req,res) => {
    fs.readdir("./public/images/uploaded", function(err, items) {
        res.render("images",{images:items});
    });
});

app.get("/employees", (req, res) => {
    if (req.query.status) {
        data.getEmployeesByStatus(req.query.status).then((data) => {
            res.render("employees", { employees: data });
        }).catch((err) => {
            res.render("employees", { message: "no results" });
        });
    } else if (req.query.department) {
        data.getEmployeesByDepartment(req.query.department).then((data) => {
            res.render("employees", { employees: data });
        }).catch((err) => {
            res.render("employees", { message: "no results" });
        });
    }
    else {
        data.getAllEmployees().then((data) => {
            res.render("employees", { employees: data });
        }).catch((err) => {
            res.render("employees", { message: "no results" });
        });
    }
});


app.get("/employee/:empNum", (req, res) => {

    // initialize an empty object to store the values
    let viewData = {};

    data.getEmployeeByNum(req.params.empNum).then((data) => {
        if (data) {
            viewData.employee = data; //store employee data in the "viewData" object as "employee"
        } else {
            viewData.employee = null; // set employee to null none were returned
        }
    }).catch(() => {
        viewData.employee = null; // set employee to null if there was an error 
    }).then(data.getDepartments)
    .then((data) => {
        viewData.departments = data; // store department data in the "viewData" object as "departments"

        // loop through viewData.departments and once we have found the departmentId that matches
        // the employee's "department" value, add a "selected" property to the matching 
        // viewData.departments object

        for (let i = 0; i < viewData.departments.length; i++) {
            if (viewData.departments[i].departmentId == viewData.employee.department) {
                viewData.departments[i].selected = true;
            }
        }

    }).catch(() => {
        viewData.departments = []; // set departments to empty if there was an error
    }).then(() => {
        if (viewData.employee == null) { // if no employee - return an error
            res.status(404).send("Employee Not Found");
        } else {
            res.render("employee", { viewData: viewData }); // render the "employee" view
        }
    }).catch((err)=>{
        res.status(500).send("Unable to Show Employees");
      });;
});


app.get("/employees/delete/:empNum", (req,res)=>{
    data.deleteEmployeeByNum(req.params.empNum).then(()=>{
      res.redirect("/employees");
    }).catch((err)=>{
      res.status(500).send("Unable to Remove Employee / Employee Not Found");
    });
  });


app.get("/managers", (req,res) => {
    data.getManagers().then((data)=>{
        res.json(data);
    });
});

app.get("/departments", (req,res) => {
    data.getDepartments().then((data)=>{
        res.render("departments", (data.length > 0) ? {departments:data} : { message: "no results" });
    }).catch((err) => {
        res.render("departments",{message:"no results"});
    });
});

app.get("/departments/add", (req, res) => {
    res.render("addDepartment",{departments: data});
});

app.post("/departments/add", (req, res) => {
    data.addDepartment(req.body).then(()=>{
      res.redirect("/departments");
    }).catch((err)=>{
        res.status(500).send("Unable to Add the Department");
      });
  });

  app.post("/department/update", (req, res) => {
    data.updateDepartment(req.body).then(()=>{
    res.redirect("/departments");
  }).catch((err)=>{
      res.status(500).send("Unable to Update the Department");
  });
  
});

app.get("/department/:departmentId", (req, res) => {
  
    data.getDepartmentById(req.params.departmentId).then((data) => {
        if(data){
            res.render("department", { data: data });
        }else{
            res.status(404).send("Department Not Found");
        }
     
    }).catch((err) => {
      res.status(404).send("Department Not Found");
    });
  
  });
///departments/delete/:departmentId
app.get("/departments/delete/:depId", (req,res)=>{
    data.deleteDepartmentById(req.params.depId).then(()=>{
      res.redirect("/departments");
    }).catch((err)=>{
      res.status(500).send("Unable to Remove Department / Department Not Found");
    });
  });
app.post("/employees/add", (req, res) => {
    data.addEmployee(req.body).then(()=>{
      res.redirect("/employees"); 
    }).catch((err)=>{
        res.status(500).send("Unable to Add the Employee");
      });
  });

  app.post("/employee/update", (req, res) => {
    data.updateEmployee(req.body).then(()=>{
    res.redirect("/employees");
  }).catch((err)=>{
    res.status(500).send("Unable to Update the Employee");
  });
  
});

//Route for loginpage
app.get("/login", function(req, res) {
    res.render('login');
});

//Route for registerpage
app.get("/register", function(req, res) { 
    res.render('register');
});

//POST/register
app.post("/register", function(req, res) {
    dataServiceAuth.registerUser(req.body)
    .then(() => res.render('register', { successMsg: "User created!"}))
    .catch((err) => res.render('register', { errorMsg: err, userName: req.body.userName }));
});

//POST/login
app.post("/login", function(req, res) {
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUser(req.body)
    .then(function(user) { 
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        }

        res.redirect('/employees');
    })
    .catch(function(err) {
        console.log(err);
        res.render('login', { errorMsg: err, userName: req.body.userName });
    });
});

//GET/logout
app.get("/logout", function(req, res) {
    req.session.reset();
    res.redirect('/');
});

//GET/user history
app.get("/userHistory", ensureLogin, function (req, res) {
    res.render('userHistory');
}); 


app.use((req, res) => {
    res.status(404).send("Page Not Found");
  });

data.initialize()
    .then(dataServiceAuth.initialize)
    .then(function(){
        app.listen(HTTP_PORT, function(){
            console.log("app listening on: " + HTTP_PORT)
        });
    }).catch(function(err){
        console.log("unable to start server: " + err);
});