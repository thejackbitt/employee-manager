const inquirer = require("inquirer");

const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123jack",
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

function bookendPrompt() {
    inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do next?",
        name: "finalOption",
        choices: [
          "Return to Main Menu",
          "Quit"
        ],
    }
])
.then((answer) => {
    const { finalOption } = answer;
    if (finalOption === "Return to Main Menu") {
        mainMenu();
    } else {
        process.exit();
    }
})
};

// Auxiliary Functions

function formatQuery(res) {
  const maxColumnWidth = {};
  Object.keys(res[0]).forEach((key) => {
    maxColumnWidth[key] = Math.max(
      ...res.map((row) => {
        return row[key] === null ? 4 : row[key].toString().length;
      }),
      key.length
    );
  });

  const colHeaders =
    Object.keys(maxColumnWidth)
      .map((key) => key.padEnd(maxColumnWidth[key], " "))
      .join(" | ") + "\n";

  const colDividers =
    Object.keys(maxColumnWidth)
      .map((key) => "-".repeat(maxColumnWidth[key]))
      .join("-+-") + "\n";

  const colValues = res
    .map((row) => {
      return Object.keys(row)
        .map((key) => {
          const value = row[key] === null ? "null" : row[key].toString();
          return value.padEnd(maxColumnWidth[key], " ");
        })
        .join(" | ");
    })
    .join("\n");

  const colTotal = colHeaders + colDividers + colValues;
  return colTotal;
}

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
    const [firstName, ...lastNameParts] = entry.split(" ");
    const lastName = lastNameParts.join(" ");
    const query = `SELECT id FROM employee WHERE first_name = '${firstName}' AND last_name = '${lastName}'`;

    db.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.length > 0) {
          resolve(results[0].id);
        } else {
          reject(new Error("No matching employee found"));
        }
      }
    });
  });
}

function getRoleIdFromTitle(entry) {
  return new Promise((resolve, reject) => {
    const query = `SELECT id FROM role WHERE title = '${entry}';`;

    db.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.length > 0) {
          resolve(results[0].id);
        } else {
          reject(new Error("No matching role found"));
        }
      }
    });
  });
}

function getDepartmentIdFromName(departmentName) {
    return new Promise((resolve, reject) => {
      const query = `SELECT id FROM department WHERE name = '${departmentName}';`;

      db.query(query, (err, results) => {
        if (err) {
          reject(err);
        } else if (results.length > 0) {
          resolve(results[0].id);
        } else {
          reject(new Error("No matching department found"));
        }
      });
    });
  }

function deleteReg(key, table) {
  const query = `DELETE FROM ${table} WHERE ID = ${key};`;
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
    bookendPrompt();
  });
}

function addEmployee() {
  queryRoles()
    .then((roleResults) => {
      const roleChoices = roleResults.map((role) => role.title);
      queryManagers()
        .then((managerResults) => {
          const managerChoices = managerResults.map(
            (employee) => `${employee.first_name} ${employee.last_name}`
          );
          managerChoices.push("null");
          inquirer
            .prompt([
              {
                type: "list",
                message: "Select the role of the employee",
                name: "role",
                choices: roleChoices,
              },
              {
                type: "list",
                message:
                  "Select a manager for the employee (if no manager, select 'None')",
                name: "mgr",
                choices: managerChoices,
              },
              {
                type: "input",
                message: "Enter the first name of the employee",
                name: "fname",
              },
              {
                type: "input",
                message: "Enter the last name of the employee",
                name: "lname",
              },
            ])
            .then((answers) => {
              const { lname, fname, mgr, role } = answers;
              getRoleIdFromTitle(role)
                .then((roleId) => {
                  let managerId = null;
                  if (mgr !== "null") {
                  }
                  const query = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
                  db.query(
                    query,
                    [fname, lname, roleId, managerId],
                    (err, results) => {
                      if (err) {
                        console.error("Failed to add employee:", err);
                        return;
                      }
                      console.log(
                        `${fname} ${lname} has successfully been added.`
                      );
                      bookendPrompt();
                    }
                  );
                })
                .catch((error) => {
                  console.error("Error getting role ID:", error);
                });
            })
            .catch((error) => {
              console.error("Error in prompts:", error);
            });
        })
        .catch((error) => {
          console.error("Error querying managers:", error);
        });
    })
    .catch((error) => {
      console.error("Error querying roles:", error);
    });
}

function updateEmployee() {
  queryManagers().then((empResults) => {
    const employeeChoices = empResults.map(
      (employee) => `${employee.first_name} ${employee.last_name}`
    );
    inquirer
      .prompt([
        {
          type: "list",
          message: "Select an employee to update:",
          name: "updateName",
          choices: employeeChoices,
        },
        {
          type: "list",
          message: `What would you like to do with this employee?`,
          name: "fate",
          choices: ["Edit", "Delete"],
        },
      ])
      .then((answers) => {
        const { updateName, fate } = answers;
        if (fate === "Edit") {
          inquirer
            .prompt([
              {
                type: "list",
                message: "What would you like to change?",
                name: "changeItem",
                choices: ["First Name", "Last Name", "Role", "Manager"],
              },
            ])
            .then((answers) => {
              const { changeItem } = answers;
              if (changeItem === "First Name") {
                inquirer
                  .prompt([
                    {
                      type: "input",
                      message: "Please enter the new first name.",
                      name: "newFName",
                    },
                  ])
                  .then((answers) => {
                    const { newFName } = answers;
                    getEmployeeIdFromName(updateName)
                      .then((id) => {
                        const query = `UPDATE employee SET first_name = '${newFName}' WHERE ID = ${id}`;
                        return new Promise((resolve, reject) => {
                          db.query(query, (err, results) => {
                            if (err) {
                              reject(err);
                            } else {
                              resolve(results);
                              console.log(
                                "Successfully changed employee's first name"
                              );
                              bookendPrompt();
                            }
                          });
                        });
                      })
                      .catch((error) => {
                        console.error("Error:", error.message);
                      });
                  })
                  .catch((error) => {
                    console.error("Error:", error.message);
                  });
              } else if (changeItem === "Last Name") {
                inquirer
                  .prompt([
                    {
                      type: "input",
                      message: "Please enter the new last name.",
                      name: "newLName",
                    },
                  ])
                  .then((answers) => {
                    const { newLName } = answers;
                    getEmployeeIdFromName(updateName)
                      .then((id) => {
                        const query = `UPDATE employee SET first_name = '${newLName}' WHERE ID = ${id}`;
                        return new Promise((resolve, reject) => {
                          db.query(query, (err, results) => {
                            if (err) {
                              reject(err);
                            } else {
                              resolve(results);
                              console.log(
                                "Successfully changed employee's last name"
                              );
                              bookendPrompt();
                            }
                          });
                        });
                      })
                      .catch((error) => {
                        console.error("Error:", error.message);
                      });
                  })
                  .catch((error) => {
                    console.error("Error:", error.message);
                  });
              } else if (changeItem === "Role") {
                queryRoles().then((roleResults) => {
                  const roleChoices = roleResults.map((role) => role.title);
                  inquirer
                    .prompt([
                      {
                        type: "list",
                        message: "Please enter the new first name.",
                        name: "newRole",
                        choices: roleChoices,
                      },
                    ])
                    .then((answers) => {
                      const { newRole } = answers;
                      getEmployeeIdFromName(updateName)
                        .then((role_id) => {
                          getRoleIdFromTitle(newRole)
                            .then((id) => {
                              const query = `UPDATE employee SET role_id = '${id}' WHERE ID = ${role_id}`;
                              return new Promise((resolve, reject) => {
                                db.query(query, (err, results) => {
                                  if (err) {
                                    reject(err);
                                  } else {
                                    resolve(results);
                                    console.log(
                                      "Successfully changed employee's role"
                                    );
                                    bookendPrompt();
                                  }
                                });
                              });
                            })
                            .catch((error) => {
                              console.error("Error:", error.message);
                            });
                        })
                        .catch((error) => {
                          console.error("Error:", error.message);
                        });
                    })
                    .catch((error) => {
                      console.error("Error: ", error.message);
                    });
                });
              } else {
                queryManagers().then((mgrResults) => {
                  const mgrChoices = mgrResults.map(
                    (employee) => `${employee.first_name} ${employee.last_name}`
                  );
                  inquirer
                    .prompt([
                      {
                        type: "list",
                        message: "Select an manager to assign to:",
                        name: "newMgr",
                        choices: mgrChoices,
                      },
                    ])
                    .then((answers) => {
                      const { newMgr } = answers;
                      getEmployeeIdFromName(updateName).then((ogId) => {
                        getEmployeeIdFromName(newMgr).then((mgrId) => {
                          const query = `UPDATE employee SET manager_id = '${mgrId}' WHERE ID = ${ogId}`;
                          return new Promise((resolve, reject) => {
                            db.query(query, (err, results) => {
                              if (err) {
                                reject(err);
                              } else {
                                resolve(results);
                                console.log(
                                  "Successfully changed employee's manager'"
                                );
                                bookendPrompt();
                              }
                            });
                          });
                        });
                      });
                    });
                });
              }
            });
        } else if (fate === "Delete") {
          inquirer
            .prompt([
              {
                type: "list",
                message: `Are you sure you want to fire ${updateName}?`,
                name: "employeeFired",
                choices: ["Yes", "No"],
              },
            ])
            .then((answers) => {
              const { employeeFired } = answers;
              if (employeeFired === "Yes") {
                getEmployeeIdFromName(updateName)
                  .then((id) => {
                    deleteReg(id, "employee");
                    console.log(
                      `Successfully removed ${updateName} from the employee registry.`
                    )
                    bookendPrompt();
                  })
                  .catch((error) => {
                    console.error("Error:", error.message);
                  });
              } else {
                mainMenu();
              }
            });
        }
      });
  });
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
    bookendPrompt();
  });
}

function addRole() {
    const query = `SELECT name FROM department;`;
  
    db.query(query, async (err, results) => {
      if (err) {
        console.error("Failed to retrieve departments:", err);
        return;
      }
      const departmentChoices = results.map(dept => dept.name);
  
      try {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'title',
            message: 'Enter the title of the new role:'
          },
          {
            type: 'input',
            name: 'salary',
            message: 'Enter the salary of the new role:',
            validate: input => !isNaN(parseFloat(input)) || 'Please enter a valid number'
          },
          {
            type: 'list',
            name: 'departmentName',
            message: 'Select the department for the new role:',
            choices: departmentChoices
          }
        ]);
  
        getDepartmentIdFromName(answers.departmentName).then((departmentId) => {
          const insertQuery = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?);`;
          db.query(insertQuery, [answers.title, answers.salary, departmentId], (err, results) => {
            if (err) {
              console.error("Failed to add new role:", err);
              return;
            }
            console.log(`New role ${answers.title} added successfully.`);
            bookendPrompt();
          });
        });
      } catch (error) {
        console.error("Error adding new role:", error);
      }
    });
  };
  


  function updateRole() {
    db.query('SELECT id, title FROM role', async (err, roles) => {
      if (err) {
        console.error('Error fetching roles:', err);
        return;
      }
  
      const roleChoices = roles.map(role => ({ name: role.title, value: role.id }));
      
      try {
        const { roleId } = await inquirer.prompt([
          {
            type: 'list',
            name: 'roleId',
            message: 'Which role would you like to update?',
            choices: roleChoices
          }
        ]);
  
        const { action } = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: 'What would you like to update?',
            choices: ['Name', 'Salary', 'Department']
          }
        ]);
  
        switch (action) {
          case 'Name':
            const { newName } = await inquirer.prompt([
              {
                type: 'input',
                name: 'newName',
                message: 'Enter the new name for the role:'
              }
            ]);
            db.query(`UPDATE role SET title = '${newName}' WHERE id = ${roleId}`, (err) => {
              if (err) console.error('Error updating role name:', err);
              else console.log('Role name updated successfully!');
              bookendPrompt();
            });
            break;
          case 'Salary':
            const { newSalary } = await inquirer.prompt([
              {
                type: 'input',
                name: 'newSalary',
                message: 'Enter the new salary for the role:',
                validate: input => !isNaN(parseFloat(input)) || 'Please enter a valid number'
              }
            ]);
            db.query(`UPDATE role SET salary = ${newSalary} WHERE id = ${roleId}`, (err) => {
              if (err) console.error('Error updating role salary:', err);
              else console.log('Role salary updated successfully!');
              bookendPrompt();
            });
            break;
          case 'Department':
            db.query('SELECT id, name FROM department', async (err, departments) => {
              if (err) {
                console.error('Error fetching departments:', err);
                return;
              }
              const departmentChoices = departments.map(dept => ({ name: dept.name, value: dept.id }));
              const { departmentId } = await inquirer.prompt([
                {
                  type: 'list',
                  name: 'departmentId',
                  message: 'Select the new department for the role:',
                  choices: departmentChoices
                }
              ]);
              db.query(`UPDATE role SET department_id = ${departmentId} WHERE id = ${roleId}`, (err) => {
                if (err) console.error('Error updating role department:', err);
                else console.log('Role department updated successfully!');
                bookendPrompt();
              });
            });
            break;
        }
      } catch (error) {
        console.error(error);
        bookendPrompt();
      }
    });
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
    bookendPrompt();
  });
}

function addDepartment() {
    inquirer.prompt([
      {
        type: 'input',
        name: 'departmentName',
        message: 'Enter the name of the new department:'
      }
    ]).then(({ departmentName }) => {
      const query = 'INSERT INTO department (name) VALUES (?)';
  
      db.query(query, [departmentName], (err, results) => {
        if (err) {
          console.error(err);
          bookendPrompt();
        }

        console.log(`The ${departmentName} department has successfully been added.`);
        bookendPrompt();
      });
    }).catch((error) => {
      console.error(error);
    });
  }
  

  function updateDepartment() {
    const query = `SELECT id, name FROM department;`;
    db.query(query, (err, results) => {
      if (err) {
        console.error("Failed to retrieve departments:", err);
        return;
      }
      if (results.length === 0) {
        console.log("No departments available to update.");
        return;
      }
      const departmentChoices = results.map(department => ({
        name: department.name,
        value: department.id
      }));
      inquirer.prompt([
        {
          type: 'list',
          name: 'departmentId',
          message: 'Which department would you like to edit?',
          choices: departmentChoices
        },
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do to this department?',
          choices: ['Edit', 'Delete']
        }
      ]).then(answers => {
        const { departmentId, action } = answers;
        if (action === 'Rename') {
          inquirer.prompt([
            {
              type: 'input',
              name: 'newName',
              message: 'What is the new name of the department?'
            }
          ]).then(({ newName }) => {
            const updateQuery = `UPDATE department SET name = ${newName} WHERE id = ${departmentId};`;
            db.query(updateQuery, (err, results) => {
              if (err) {
                console.error("Failed to update department name:", err);
                bookendPrompt();
              }
              console.log("Department name updated successfully.");
              bookendPrompt();
            });
          });
        } else if (action === 'Delete') {
          inquirer.prompt([
            {
              type: 'list',
              name: 'confirmDelete',
              message: 'Are you sure you want to initiate a mass layoff?',
              choices: ["No", "Yes"]
            }
          ]).then(({ confirmDelete }) => {
            if (confirmDelete === "Yes") {
              db.beginTransaction(err => {
                if (err) { throw err; }
                
                const deleteEmployeesQuery = `
                  DELETE employee FROM employee
                  JOIN role ON employee.role_id = role.id
                  WHERE role.department_id = ?;
                `;
                db.query(deleteEmployeesQuery, [departmentId], (err, results) => {
                  if (err) {
                    return db.rollback(() => {
                      throw err;
                    });
                  }
  
                  const deleteRolesQuery = `DELETE FROM role WHERE department_id = ?;`;
                  db.query(deleteRolesQuery, [departmentId], (err, results) => {
                    if (err) {
                      return db.rollback(() => {
                        throw err;
                      });
                    }
  
                    const deleteDepartmentQuery = `DELETE FROM department WHERE id = ?;`;
                    db.query(deleteDepartmentQuery, [departmentId], (err, results) => {
                      if (err) {
                        return db.rollback(() => {
                          throw err;
                        });
                      }
  
                      db.commit(err => {
                        if (err) {
                          return db.rollback(() => {
                            throw err;
                          });
                        }
                        console.log("Mass layoff executed successfully.  You're a monster.  They had families.");
                        bookendPrompt();
                      });
                    });
                  });
                });
              });
            } else {
              console.log("Mass layoff cancelled...  Phew!");
              bookendPrompt();
            }
          });
        }
      });
    });
  }