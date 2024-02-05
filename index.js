const inquirer = require("inquirer");

const mysql = require("mysql2");

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '%4p1bh)@7',
    database: 'mgmt_db'
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
                    'View All Employees',
                    'Add Employee',
                    'Update Employee',
                    'View All Roles',
                    'Add Role',
                    'Update Role',
                    'View All Departments',
                    'Add Department',
                    'Update Department'
                ],
            },
        ])
        .then(({ userSelect }) => {
            const actionMap = {
                'View All Employees': viewEmployee,
                'Add Employee': addEmployee,
                'Update Employee': updateEmployee,
                'View All Roles': viewRole,
                'Add Role': addRole,
                'Update Role': updateRole,
                'View All Departments': viewDepartment,
                'Add Department': addDepartment,
                'Update Department': updateDepartment,
            };
            const action = actionMap[userSelect];
            if (action) {
                action();
            } else {
                console.log('Option not recognized. Please try again.');
            }
        })
};

// Auxiliary Functions

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
};

function queryRoles() {
    const query = `SELECT title FROM role`;
    return new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

function queryManagers() {
    const query = `SELECT e.first_name, e.last_name FROM employee e`;
    return new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

function getEmployeeIdFromName(entry) {
    return new Promise((resolve, reject) => {
        const [firstName, ...lastNameParts] = entry.split(' ');
        const lastName = lastNameParts.join(' ');
        const query = `SELECT id FROM employee WHERE first_name = '${firstName}' AND last_name = '${lastName}' LIMIT 1;`

        db.query(query, (err, results) => {
            if (err) {
                reject(err);
            } else {
                if (results.length > 0) {
                    resolve(results[0].id);
                } else {
                    reject(new Error('No matching employee found'));
                }
            }
        });
    });
};

function getEmployeeRoleFromName(entry) {
    return new Promise((resolve, reject) => {
        const [firstName, ...lastNameParts] = entry.split(' ');
        const lastName = lastNameParts.join(' ');
        const query = `SELECT role_id FROM employee WHERE first_name = '${firstName}' AND last_name = '${lastName}' LIMIT 1;`

        db.query(query, (err, results) => {
            if (err) {
                reject(err);
            } else {
                if (results.length > 0) {
                    resolve(results[0].role_id);
                } else {
                    reject(new Error('No matching employee role found'));
                }
            }
        });
    });
};

function getRoleIdFromTitle(entry) {
    return new Promise((resolve, reject) => {
        const query = `SELECT id FROM role WHERE title = '${entry} LIMIT 1;`

        db.query(query, (err, results) => {
            if (err) {
                reject(err);
            } else {
                if (results.length > 0) {
                    resolve(results[0].id);
                } else {
                    reject(new Error('No matching role found'));
                }
            }
        });
    });
};

function deleteReg(key, table) {
    console.log(query);
    return new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        })
    })
};

// Primary Functions

function viewEmployee() {
    const query = `
    SELECT e.id, e.first_name, e.last_name, r.title AS title, d.name AS department, e.manager_id
    FROM employee e
    JOIN role r ON e.role_id = r.id
    JOIN department d ON r.department_id = d.id;    
    `;

    db.query(query, (err, results) => {
        if (err) {
            throw err;
        }
        console.log(formatQuery(results));
    })
};

function addEmployee() {
    queryRoles().then(roleResults => {
        const roleChoices = roleResults.map(role => role.title);
        queryManagers().then(managerResults => {
            const managerChoices = managerResults.map(employee => `${employee.first_name} ${employee.last_name}`);
            managerChoices.push('null');
            inquirer.prompt([
                {
                    type: 'list',
                    message: 'Select the role of the employee',
                    name: 'role',
                    choices: roleChoices,
                },
                {
                    type: 'list',
                    message: "Select a manager for the employee (if no manager, select 'None')",
                    name: "mgr",
                    choices: managerChoices,
                },
                {
                    type: "input",
                    message: "Enter the first name of the employee",
                    name: "fname",
                },
                {
                    type: 'input',
                    message: 'Enter the last name of the employee',
                    name: 'lname',
                }
            ])
                .then(answers => {
                    const { lname, fname, mgr, role } = answers;
                    getRoleID(role).then(roleId => {
                        let managerId = null;
                        if (mgr !== 'null') {
                        }
                        const query = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
                        db.query(query, [fname, lname, roleId, managerId], (err, results) => {
                            if (err) {
                                console.error('Failed to add employee:', err);
                                return;
                            }
                            console.log(`${fname} ${lname} has successfully been added.`);
                        });
                    }).catch(error => {
                        console.error('Error getting role ID:', error);
                    });
                })
                .catch(error => {
                    console.error('Error in prompts:', error);
                });
        }).catch(error => {
            console.error('Error querying managers:', error);
        });
    }).catch(error => {
        console.error('Error querying roles:', error);
    });
}


function updateEmployee() {
    queryManagers().then(empResults => {
        const employeeChoices = empResults.map(employee => `${employee.first_name} ${employee.last_name}`);
        inquirer
            .prompt([
                {
                    type: 'list',
                    message: "Select an employee to update:",
                    name: 'updateName',
                    choices: employeeChoices,
                },
                {
                    type: 'list',
                    message: `What would you like to do with this employee?`,
                    name: 'fate',
                    choices: ["Edit", "Delete"],
                }
            ]).then(answers => {
                const { updateName, fate } = answers;
                if (fate === "Edit") {
                    inquirer.prompt([
                        {
                            type: "list",
                            message: "What would you like to change?",
                            name: "changeItem",
                            choices: ["First Name", "Last Name", "Role", "Manager"],
                        }
                    ]).then(answers => {
                        const { changeItem } = answers;
                        if (changeItem === "First Name") {
                            inquirer.prompt([
                                {
                                    type: 'input',
                                    message: 'Please enter the new first name.',
                                    name: 'newFName'
                                }
                            ]).then(answers => {
                                const { newFName } = answers;
                                getEmployeeIdFromName(updateName).then(id => {
                                    const query = `UPDATE employee SET first_name = '${newFName}' WHERE ID = ${id}`
                                    return new Promise((resolve, reject) => {
                                        db.query(query, (err, results) => {
                                            if (err) {
                                                reject(err);
                                            } else {
                                                resolve(results);
                                                console.log("Successfully changed employee's first name")
                                            }
                                        })
                                    })
                                }).catch(error => {
                                    console.error('Error:', error.message);
                                });
                            }).catch(error => {
                                console.error('Error:', error.message);
                            });
                        } else if (changeItem === "Last Name") {
                            inquirer.prompt([
                                {
                                    type: 'input',
                                    message: 'Please enter the new last name.',
                                    name: 'newLName'
                                }
                            ]).then(answers => {
                                const { newLName } = answers;
                                getEmployeeIdFromName(updateName).then(id => {
                                    const query = `UPDATE employee SET first_name = '${newLName}' WHERE ID = ${id}`
                                    return new Promise((resolve, reject) => {
                                        db.query(query, (err, results) => {
                                            if (err) {
                                                reject(err);
                                            } else {
                                                resolve(results);
                                                console.log("Successfully changed employee's last name")
                                            }
                                        })
                                    })
                                }).catch(error => {
                                    console.error('Error:', error.message);
                                });
                            }).catch(error => {
                                console.error('Error:', error.message);
                            });
                        } else if (changeItem === "Role") {
                            queryRoles().then(roleResults => {
                                const roleChoices = roleResults.map(role => role.title);
                                inquirer.prompt([
                                    {
                                        type: 'list',
                                        message: 'Please enter the new first name.',
                                        name: 'newRole',
                                        choices: roleChoices
                                    }
                                ]).then(answers => {
                                    const { newRole } = answers;
                                    getEmployeeRoleFromName(updateName).then(role_id => {
                                        getRoleIdFromTitle(newRole).then(id => {
                                            const query = `UPDATE employee SET role_id = '${id}' WHERE ID = ${role_id}`
                                            return new Promise((resolve, reject) => {
                                                db.query(query, (err, results) => {
                                                    if (err) {
                                                        reject(err);
                                                    } else {
                                                        resolve(results);
                                                        console.log("Successfully changed employee's role")
                                                    }
                                                })
                                            })
                                        }).catch(error => {
                                            console.error('Error:', error.message);
                                        });
                                    }).catch(error => {
                                        console.error('Error:', error.message);
                                    })
                                }).catch(error => {
                                    console.error('Error: ', error.message);
                                })
                            });
                        } else {
                            console.log("Well, poop.");
                        }
                    })
                } else if (fate === "Delete") {
                    inquirer.prompt([
                        {
                            type: "list",
                            message: `Are you sure you want to fire ${updateName}?`,
                            name: "employeeFired",
                            choices: ["Yes", "No"],
                        }
                    ])
                        .then(answers => {
                            const { employeeFired } = answers;
                            if (employeeFired === "Yes") {
                                getEmployeeIdFromName(updateName).then(id => {
                                    deleteReg(id, 'employee');
                                    console.log(`Successfully removed ${updateName} from the employee registry.`)
                                }).catch(error => {
                                    console.error('Error:', error.message);
                                });
                            } else {
                                mainMenu();
                            }
                        })
                };
            })
    }
    )
}

function viewRole() {
    const query = `
    SELECT r.title AS  role
    FROM role r;    
    `;

    db.query(query, (err, results) => {
        if (err) {
            throw err;
        }
        console.log(formatQuery(results));
    })
};

function addRole() {
    console.log('Fill out all inputs to add an role:')
}

function updateRole() {
    console.log('Select a registry to update:')
}

function viewDepartment() {
    const query = `
    SELECT d.name AS department
    FROM department d;    
    `;

    db.query(query, (err, results) => {
        if (err) {
            throw err;
        }
        console.log(formatQuery(results));
    })
};

function addDepartment() {
    console.log('Fill out all inputs to add an department:')
}

function updateDepartment() {
    console.log('Select a registry to update:')
}