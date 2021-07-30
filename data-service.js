const Sequelize = require('sequelize');
var sequelize = new Sequelize('dc2ejf6gku753o', 'pouqsswvqaxhuo', '559af5b34c8de5447bf9933a5c102b162c18cc4fe3390d356a6e265fbd7c10ff', {
host: 'ec2-35-168-145-180.compute-1.amazonaws.com',
dialect: 'postgres',
port: 5432,
dialectOptions: {
ssl: { rejectUnauthorized: false }
}
});

var Employee = sequelize.define('Employee', {
    employeeNum: {
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.STRING,
    status: Sequelize.STRING,
    hireDate: Sequelize.STRING
});

var Department = sequelize.define('Department', {
    departmentId: {
        type:Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
});

Department.hasMany(Employee, {foreignKey: 'department'});


module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then((Employee)=>{
            resolve();
        }).then((Department)=>{
            resolve();
        }).catch((err)=>{
            reject('unable to sync the database');
            console.log(err);
        });
    });
};

module.exports.getAllEmployees = function(){
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Employee.findAll());
        }).catch((err) => {
            reject("no results returned");
        });
    });
}

module.exports.getEmployeeByNum = function (num) {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Employee.findAll({
                where:{
                    employeeNum: num
                }}));
        }).catch((err) => {
            reject("no results returned.");
        });
    });
}

module.exports.getEmployeesByStatus = function (status) {
        return new Promise((resolve, reject) => {
            sequelize.sync().then(() => {
                resolve(Employee.findAll({
                    where:{
                        status: status
                    }})
              );
            }).catch((err) => {
                reject("no results returned.",err);
            });
        });
    }


module.exports.getEmployeesByDepartment = function (department) {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Employee.findAll({
                where:{
                    department: department
            }}));
        }).catch((err) => {
            reject("no results returned.",err);
            console.log(err);
        });
    });
}

module.exports.getEmployeesByManager = function (manager) {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Employee.findAll({
                where:{
                    employeeManagerNum: manager
                }}
            ));
        }).catch((err) => {
            reject("no results returned.",err);
            console.log(err);
        });
    });
}

module.exports.deleteEmployeeByNum = function (empNum) {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Employee.destroy({
                where:{
                    employeeNum: empNum
                }}));
        }).catch((err) => {
            reject("deleted");
        });
    });
}

module.exports.getDepartments = function(){
    return new Promise((resolve, reject) => {
        Department.findAll().then(()=>{resolve()})
        .catch((err) => {
            reject("no results returned.");
            console.log(err);
        });
    });
}

module.exports.addEmployee = function (employeeData) {
    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for(let i in employeeData){
            if(employeeData[i]==""){
            employeeData[i]=null;
            }
        }
        Employee.create({
            employeeNum: employeeData.employeeNum,
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addressCity: employeeData.addressCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            maritalStatus: employeeData.maritalStatus,
            isManager: employeeData.isManager,
            employeeManagerNum: employeeData. employeeManagerNum,
            status: employeeData.status,
            hireDate: employeeData.hireDate
        }).then(()=>{
            resolve();
        }).catch((err)=>{
            reject("no results returned.",err);
        })
    });
};

module.exports.updateEmployee = function (employeeData) {
    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for(let i in employeeData){
            if(employeeData[i]==""){
            employeeData[i]=null;
            }
        }
        Employee.update({            
            employeeNum: employeeData.employeeNum,
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addressCity: employeeData.addressCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            maritalStatus: employeeData.maritalStatus,
            isManager: employeeData.isManager,
            employeeManagerNum: employeeData. employeeManagerNum,
            status: employeeData.status,
            hireDate: employeeData.hireDate
        }).then(()=>{
            resolve();
        }).catch((err)=>{
            reject("unable to update employee.",err);
            console.log(err);
        })
    });
};

module.exports.addDepartment = (departmentData) =>{
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(() => {
        for(let i in departmentData){
            if(departmentData[i]==""){
                departmentData[i]=null;
            }
        }
        Department.create({
            departmentId: departmentData.departmentId,
            departmentName: departmentData.departmentName
        }).then(()=>{
            resolve();
        }).catch((err)=>{
            reject("no results returned.",err);
        })
    });
})};

module.exports.updateDepartment = function (departmentData) {
    return new Promise(function (resolve, reject) {
        for(let i in departmentData){
            if(departmentData[i]==""){
                departmentData[i]=null;
            }
        }
        Department.update({
            departmentId: departmentData.departmentId,
            departmentName: departmentData.departmentName
        }).then(()=>{
            resolve();
        }).catch((err)=>{
            reject("unable to update department.",err);
        })
    });
};


module.exports.getDepartmentById = function (id) {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Department.findAll({
                where:{
                    departmentId: id
                }}
            ));
        }).catch((err) => {
            reject("no results returned.",err);
        });
    });
}

module.exports.deleteDepartmentById = function (id) {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve(Department.destroy({
                where:{
                    departmentId: id
                 }}
            ));
        }).catch((err) => {
            reject("deletion rejected.");
        });
    });
}