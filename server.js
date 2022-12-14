const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');




const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'employee_db'
    },

);

const departmentChoices = async () => {
    const departmentQuery = `SELECT id AS value, name FROM department;`;
    return await db.promise().query(departmentQuery);

};

const roleChoices = async () => {
    const roleQuery = `SELECT id AS value, title AS name FROM role;`;
    return await db.promise().query(roleQuery);
};

const empNames = async () => {
    const nameQuery = `SELECT id AS value, CONCAT(first_name, " ", last_name) AS name FROM employee`
    return await db.promise().query(nameQuery)
}


async function employee() {

    const departments = await departmentChoices();
    const roles = await roleChoices();
    const names = await empNames();



    await inquirer
        .prompt([

            {
                type: 'list',
                name: 'tasks',
                message: 'What would you like to do?',
                choices: ['View All Employees', 'View All Roles', 'View All Departments', 'Add Employee', 'Update Employee Role', 'Add Role', 'Add Department', 'Quit']
            },
            {
                type: 'input',
                name: 'first_name',
                message: 'Please enter the employees first name.',
                when: (answers) => answers.tasks === 'Add Employee'
            },

            {
                type: 'input',
                name: 'last_name',
                message: 'Please enter the employees last name.',
                when: (answers) => answers.tasks === 'Add Employee'
            },
            {
                type: 'list',
                name: 'addRoleToEmp',
                message: 'What is the employees role?',
                choices: roles[0],
                when: (answers) => answers.tasks === 'Add Employee'
            },
            {
                type: 'input',
                name: 'addRoleTitle',
                message: 'What is the name of the role?',
                when: (answers) => answers.tasks === 'Add Role'
            },
            {
                type: 'input',
                name: 'addRoleSalary',
                message: 'What is the salary for this role?',
                when: (answers) => answers.tasks === 'Add Role'
            },
            {
                type: 'list',
                name: 'addRoleDept',
                message: 'What department is this role in?',
                choices: departments[0],
                when: (answers) => answers.tasks === 'Add Role'
            },
            {
                type: 'input',
                name: 'addDept',
                message: 'What is the name of the department you would like to add?',
                when: (answers) => answers.tasks === 'Add Department'
            },
            {
                type: 'list',
                name: 'updateEmpName',
                message: 'Which employee would you like to update?',
                choices: names[0],
                when: (answers) => answers.tasks === 'Update Employee Role'
            },
            {
                type: 'list',
                name: 'updateRole',
                message: 'What is the employees new title?',
                choices: roles[0],
                when: (answers) => answers.tasks === 'Update Employee Role'
            },
            {
                type: 'confirm',
                name: 'hasManager',
                message: 'Does This employee have a manager?',
                when: (answers) => answers.tasks === 'Add Employee'
            },
            {
                type: 'confirm',
                name: 'hasManager2',
                message: 'Does This employee have a manager?',
                when: (answers) => answers.tasks === 'Update Employee Role'
            },
            {
                type: 'list',
                name: 'addManagerToEmp',
                message: 'Name of the manager for this employee?',
                choices: names[0],
                when: (answers) => answers.hasManager === true
            },
            {
                type: 'list',
                name: 'updateManagerToEmp',
                message: 'Name of the manager for this employee?',
                choices: names[0],
                when: (answers) => answers.hasManager2 === true
            },
        ])

        .then((data) => {


            switch (data.tasks) {

                case 'Add Department':
                    let dept = data.addDept
                    db.query("INSERT INTO department SET ?", {
                        name: dept
                    },
                        function (error) {
                            if (error) throw error;
                        })

                    restartApp()
                    break

                case 'Add Role':
                    let title = data.addRoleTitle
                    let salary = data.addRoleSalary
                    let name = data.addRoleDept

                    db.query("INSERT INTO role SET ?", {
                        title: title,
                        salary: salary,
                        department_id: name
                    },
                        function (error) {
                            if (error) throw error;
                        })

                    restartApp()
                    break

                case 'View All Employees':
                    db.query('SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name, manager.first_name AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id', function (err, result) {
                        console.table(result)

                    })

                    restartApp()
                    break

                case 'Add Employee':
                    let fName = data.first_name;
                    let lName = data.last_name;
                    let empRole = data.addRoleToEmp;
                    let managerID = data.addManagerToEmp;
                    db.query("INSERT INTO employee SET ?", {
                        first_name: fName,
                        last_name: lName,
                        role_id: empRole,
                        manager_id: managerID
                    },
                        function (error) {
                            if (error) throw error;
                        })
                    restartApp()
                    break

                case 'View All Roles':
                    db.query('SELECT role.title, role.salary, department.name FROM role LEFT JOIN department ON role.department_id = department.id;',
                        function (err, result) {
                            console.table(result)

                        })

                    restartApp()
                    break

                case 'View All Departments':
                    db.query('SELECT * FROM department;',
                        function (err, result) {
                            console.table(result)
                        })

                    restartApp()
                    break

                case 'Update Employee Role':
                    let newRole = data.updateRole;
                    let newID = data.updateEmpName;
                    var managerID2
                    if (!data.updateManagerToEmp) {
                        managerID2 = null

                    } else {
                        managerID2 = data.updateManagerToEmp
                    };

                    db.query(`UPDATE employee SET ? WHERE employee.id = ?`, [{
                        role_id: newRole,
                        manager_id: managerID2
                    }
                        , newID
                    ])

                    restartApp()
                    break


                case 'Quit':
                    process.exit();
            }
        })
};

async function restartApp() {
    await new Promise(resolve => setTimeout(resolve, 100));
    inquirer
        .prompt([
            {
                type: 'confirm',
                name: 'restart',
                message: 'Do you want to continue?'
            },
        ])
        .then((data) => {
            if (!data.restart) {
                process.exit()
            } else {
                data.hasManager = false
                employee()
            }
        })
};




employee()