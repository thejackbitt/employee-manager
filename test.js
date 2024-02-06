const inquirer = require("inquirer");

const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "%4p1bh)@7",
  database: "mgmt_db",
});

console.log(`
___________________________________________________________
      ______                 _                       
     |  ____|               | |                      
     | |__   _ __ ___  _ __ | | ___  _   _  ___  ___ 
     |  __| | '_ \` _ \\| '_ \\| |/ _ \\| | | |/ _ \\/ _ \\
     | |____| | | | | | |_) | | (_) | |_| |  __/  __/
     |______|_| |_| |_| .__/|_|\\___/ \\__, |\\___|\\___|
                       | |            __/ |          
         __  __        |_|           |___/                                              
        |  \\/  |                                  
        | \\  / | __ _ _ __   __ _  __ _  ___ _ __ 
        | |\\/| |/ _\` | '_ \\ / _\` |/ _\` |/ _ \\ '__|
        | |  | | (_| | | | | (_| | (_| |  __/ |   
        |_|  |_|\\__,_|_| |_|\\__,_|\\__, |\\___|_|   
                                   __/ |          
                                  |___/           
___________________________________________________________
`);

// NO TOUCH ASCII ART.  VERY SENSITIVE!!!

// Debug Features go here:
// End Debug Features

mainMenu();

function mainMenu() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        name: "userSelect",
        choices: [
          "View All Employees",
          "Add Employee",
          "Update Employee",
          "View All Roles",
          "Add Role",
          "Update Role",
          "View All Departments",
          "Add Department",
          "Update Department",
        ],
      },
    ])
    .then(({ userSelect }) => {
      const actionMap = {
        "View All Employees": viewEmployee,
        "Add Employee": addEmployee,
        "Update Employee": updateEmployee,
        "View All Roles": viewRole,
        "Add Role": addRole,
        "Update Role": updateRole,
        "View All Departments": viewDepartment,
        "Add Department": addDepartment,
        "Update Department": updateDepartment,
      };
      const action = actionMap[userSelect];
      if (action) {
        action();
      } else {
        console.log("Option not recognized. Please try again.");
      }
    });
}