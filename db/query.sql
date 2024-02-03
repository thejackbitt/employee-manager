SELECT employee.*, role.*, department.*
FROM employee
JOIN role ON employee.role = role.id
JOIN department ON role.department = department.id;