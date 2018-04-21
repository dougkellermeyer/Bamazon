var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    //Your username
    user: "root",

    //Your password
    password: "root",
    database: "bamazon",
    socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock"
});

connection.connect(function (err) {
    if (err) throw err;
});

// inquirer
//     .prompt({
//         name: "first-message",
//         type: "list",
//         message: "Here are all the items in the database"
//     });
console.log("===================== Here is a list of all the items for sale! =====================");
connection.query("SELECT * FROM products", function (err, items) {
    if (err) {
        throw err;
    }
    for (var i = 0; i < items.length; i++) {
        console.log(items[i].item_id + " " + items[i].product_name + " " + items.price);
        //not sure why it won't display price here....^
    }
});

userInterestID();

function userInterestID() {
    inquirer
        .prompt([
        {
            name: "id",
            type: "input",
            message: "What item(s) ID would you like to buy from the choices above?\n",
            validate: function (value) {
                // validation for answer not a number
                if (isNaN(value) === false) {
                    return true;
                } else {
                    console.log("\nNot a valid ID, please type the product ID for item you'd like to purchase: ");
                    return false;
                }
            }
        },

            {
                name: "quantity",
                type: "input",
                message: "How many units would you like to purchase?",

                validate: function(value){
                //function validation
                if (isNaN(value) === false) {
                    return true;
                } else {
                    console.log("\n Please enter a valid quantity:");
                    return false;
                    }   
                }   
            }
   
        ]).then(function (answer) {
            var query = "SELECT item_id, product_name, price FROM products WHERE ?";
            connection.query(query, [{item_id: answer.id}], function (err, res) {
                if (err){
                    console.log(err);
                }
                console.log(res);
                //see if answer is sufficient for number of product units
                if (res[0].stock_quantity < answer.quantity) {
                    console.log("That item is SOLD OUT! Please choose another item");
                    userInterestID();
                } else {
                    var newQuantity = res[0].stock_quantity - answer.quantity;
                    console.log(newQuantity);
                    var totalPrice = res[0].price * answer.id;

                    connection.query("UPDATE products SET stock_quantity=? WHERE item_id = ?", [newQuantity]);
                    if (err) {
                        throw err;
                    } else {
                        console.log("New quantity: " + newQuantity);
                        connection.end();
                    }
                }
            });
        });
}