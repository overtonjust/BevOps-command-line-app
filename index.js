import { writeJsonFile, readJsonFile } from './src/helpers/helpers.js'
import { index, create, update, destroy } from './src/drinkController.js'
import { handleCartSelection, confirmCheckOut} from './src/cartController.js';
import inquirer from 'inquirer';
import figlet from 'figlet';
import chalk from 'chalk';
const log = console.log;


const run = async (login=false)  => {
    let writeToFile = false;
    let checkOutReady = false;
    let updatedDrinkList = [];
    let cart = []
    const drinkList = readJsonFile('./data', 'drinkList.json')

    if(!login) {
        await figlet('Bev Ops', function (err, data) { //Intro splash
            if(err) {
                log('Something went wrong...');
                console.dir(err);
                return;
            }
            log(data)
        })
        

        await inquirer // login choice
            .prompt([
                {
                    name: "loginChoice",
                    type: "list",
                    message: "Please select if you are an Admin or a Customer.",
                    choices: ["Admin", "Customer"]
                }
            ])
            .then((answer) => {
                login = answer.loginChoice;
            })
    }
    
        if(login === 'Admin') { // Tree for Admin
            await inquirer
                    .prompt([
                        {
                            name: "adminOption",
                            type: "list",
                            message: "What would you like to do today?",
                            choices: ['View Drink List', 'Add a new drink', 'Update an existing drink', 'Remove a drink from the list']
                        }
                    ])
                    .then(async (answer) => {
                        switch(answer.adminOption) {
                            case 'View Drink List': 
                                const drinksView = index(drinkList,login)
                                log(drinksView.toString())
                                break;
                            case 'Add a new drink': 
                                updatedDrinkList = await create(drinkList)
                                writeToFile = true;
                                break;
                            case 'Update an existing drink': 
                                updatedDrinkList = await update(drinkList)
                                writeToFile = true;
                                break;
                            case 'Remove a drink from the list': 
                                updatedDrinkList = await destroy(drinkList)
                                writeToFile = true;
                                break;
                            default :
                                log('Something went wrong...')
                                return;
                        }
    
                    })
                    if(writeToFile) {
                        writeJsonFile('./data', 'drinkList.json', updatedDrinkList);
                    }
           const repeat = await inquirer
                    .prompt([
                        {
                            name: "continueCheck",
                            type: "confirm",
                            message: "Would you like to do something else?"
                        }
                    ])
                if(repeat.continueCheck) {
                    run(login)
                }
        } else if(login === 'Customer') { // Tree for Customer
            const drinksView = index(drinkList,login)
            const filteredDrinkList = drinkList.filter((drink) => {
                if(drink.inStock) return drink.name
            });

            log(drinksView.toString())

            await inquirer
                .prompt([
                    {
                        name: "orderReady",
                        type: "list",
                        message: "Are you ready to order?",
                        choices: ["I'm ready (Continue)", "I've changed my mind (Exit)"]
                    }
                ])
                .then((answer) => {
                    if(answer.orderReady === "I've changed my mind (Exit)") {
                        login = false;
                    }
                })
            
                if(!login){
                    return
                } else {
                    cart =  await handleCartSelection(filteredDrinkList);
                    writeJsonFile('./data', 'drinkCart.json', cart);
                    checkOutReady = await confirmCheckOut(cart, filteredDrinkList)
                }

                if(checkOutReady){
                    log(chalk.green('Thank you for your purchase!'))  
                }
      

        }

}

run();
