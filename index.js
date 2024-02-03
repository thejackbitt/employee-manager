const inquirer = require("inquirer");
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '%4p1bh)@7',
    database: 'mgmt_db'
  });
  
  db.connect((err) => {
    if (err) {
      throw err;
    }
    console.log('Connected to the database.');
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
          __  __       |_|           |___/                                              
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

mainMenu();

function formatQuery(res) {
    const maxColumnWidth = {};
    Object.keys(res[0]).forEach(key => {
        maxColumnWidth[key] = Math.max(...res.map(row => {
            return row[key] === null ? 4 : row[key].toString().length;
        }), key.length);
    });
    
    const colHeaders = Object.keys(maxColumnWidth)
        .map(key => key.padEnd(maxColumnWidth[key], ' '))
        .join(' | ') + '\n';

    const colDividers = Object.keys(maxColumnWidth)
        .map(key => '-'.repeat(maxColumnWidth[key]))
        .join('-+-') + '\n';

    const colValues = res.map(row => {
        return Object.keys(row)
            .map(key => {
                const value = row[key] === null ? "null" : row[key].toString();
                return value.padEnd(maxColumnWidth[key], ' ');
            })
            .join(' | ');
    }).join('\n');

    const colTotal = colHeaders + colDividers + colValues;
    return colTotal;
}

function viewEmployee() {
    console.log('Here are all current employees:')
    const query = 'SELECT * FROM employee;';
  
    db.query(query, (err, results) => {
      if (err) {
        throw err;
      }
      console.log(formatQuery(results));
    });
}

function addEmployee() {
    console.log('Fill out all inputs to add an employee:')
}

function updateEmployee() {
    console.log('Select a registry to update:')
}

function viewRole() {
    console.log('Here are all current roles:')
}

function addRole() {
    console.log('Fill out all inputs to add an role:')
}

function viewDepartment() {
    console.log('Here are all current departments:')
}

function addDepartment() {
    console.log('Fill out all inputs to add an department:')
}


function mainMenu() {
    inquirer
    .prompt([
        {
            type: "list",
            message: "What would you like to do?",
            name: "userSelect",
            choices: [
                'View All Employees', 
                'Add Employee', 
                'Update Employee Role', 
                'View All Roles', 
                'Add Role', 
                'View All Departments', 
                'Add Department'
            ],
        },
    ])
    .then(({ userSelect }) => {
        const actionMap = {
            'View All Employees': viewEmployee,
            'Add Employee' : addEmployee,
            'Update Employee Role': updateEmployee,
            'View All Roles': viewRole,
            'Add Role': addRole,
            'View All Departments': viewDepartment,
            'Add Department': addDepartment,
        };
        const action = actionMap[userSelect];
        if (action) {
            action();
        } else {
            console.log('Option not recognized. Please try again.');
        }
    })
};