import { nanoid } from 'nanoid'
import  inquirer  from 'inquirer' 
import { tableFramework, formatItems, formatDrinkObject } from './helpers/table.js'
import chalk from 'chalk'
import Table from 'cli-table3'


const log = console.log
const ingredientsList = [
    new inquirer.Separator(`${chalk.hex('#B574FF').underline.bold('Spirits')} 🥃`),
    'Bourbon', 
    'Gin', 
    'Light Rum', 
    'Dark Rum', 
    'Scotch', 
    'Vodka',
    'Whiskey',

    new inquirer.Separator(`${chalk.hex('#FFC46A').underline.bold('Citrus')} 🍊`),
    'Cranberry Juice', 
    'Lemon Juice', 
    'Lime Juice', 
    'Orange Juice', 
    'Pineapple Juice',

    new inquirer.Separator(`${chalk.hex('#FFFFFF').underline.bold('Sweeteners')} 🍬`),
    'Cinnamon Syrup', 
    'Ginger Syrup', 
    'Grenadine', 
    'Honey', 
    'Maple Syrup', 
    'Orgeat Syrup',
    'Passion Fruit Syrup', 
    'Simple Syrup', 

    new inquirer.Separator(`${chalk.hex('#5BBDFE').underline.bold('Liqueurs')} 🍸`),
    'Absinthe', 
    'Blue Curacao',
    'Creme de Cacao', 
    'Creme de menthe', 
    'Falernum', 
    'Jaegermeister', 
    'Lillet Blanc',
    'Peach Schnapps',
    
    new inquirer.Separator(`${chalk.hex('#5BBDFE').underline.bold('Extras')} 🌈`),
    'Coconut Cream',
    'Cucumbers', 
    'Egg Whites', 
    'Heavy Cream',
    'Hot Sauce',
    'Jalapenos', 
    'Maraschino Cherries', 
    'Orange Soda', 
    'Salt & Pepper', 
    'Seltzer', 
    'Tonic Water', 
    'Triple Sec', 
    'Worchestershire Sauce', 
];

const formatTable = (drinkObj, tableBase) => {
    let tableView;
    tableBase ? tableView = tableBase : tableView = new Table (tableFramework)

    const drinkItemsWithoutId = Object.values(drinkObj).slice(1);
    const tableArr = formatItems(drinkItemsWithoutId);
    const tableObj = formatDrinkObject(drinkObj.id, tableArr);
    tableView.push(tableObj);

    return tableView;
}

const index = (drinkList,login) => {
    const displayTable = new Table(tableFramework);
    
    if(login === 'Admin') {
        drinkList.forEach((drink) => {
            formatTable(drink, displayTable)
        });
    } else if (login === 'Customer') {
        const availableDrinks = drinkList.filter((drink) => drink.inStock);

        availableDrinks.forEach((drink) => {
            formatTable(drink, displayTable)
        });
    }

    return displayTable;
}
    

const create = async (drinkList) => {
  
    await inquirer
        .prompt([
            {
                name: "drinkName",
                type: "input",
                message: "What is the name of your drink?",
            },
            {
                name: "ingredients",
                type: "checkbox",
                message: "What do you need to make this drink?",
                choices: ingredientsList 
            },
            {
                name: "price",
                type: "input",
                message: "How much does this drink cost in cents?",
                filter: (value) => isNaN(value) ? '' : Number(value),
                validate(value) {
                    const pass = Number.isInteger(value) && Number(value) > 0;
                    if(pass) {
                        return true;
                    }
                    
                    return 'Please enter a positive Integer'
                }
            },
            {
                name: "inStock",
                type: "confirm",
                message: "Can you serve this drink now?"
            }
        ])
        .then((answer) => {

            const drink = {
                id: nanoid(5),
                name: answer.drinkName,
                ingredients: answer.ingredients,
                priceInCents: answer.price,
                inStock: answer.inStock
            }

            drinkList.push(drink);
            log(`You have successfully created the new drink ${drink.name} its id is ${drink.id}`)
        });
            
    return drinkList;
}

const update = async (drinkList) => {
    const drinkIds = drinkList.map((drink) => drink.id);
    let drinkIndex = -1;
    let drinkObj = {};
    let finalize = false;

    await inquirer
            .prompt([
                {
                    name: "drinkId",
                    type: "list",
                    message: "Which drink would you like to edit?",
                    choices: drinkIds
                }
            ])
            .then((answer) => {
                drinkObj = drinkList.find((drink) => drink.id === answer.drinkId)
                drinkIndex = drinkList.findIndex((drink) => drink.id === answer.drinkId)
            })
    await inquirer
            .prompt([
                {
                    name: "confirmChoice",
                    type: "confirm",
                    message: `You have picked "${drinkObj.name}" is that correct?`
                }
            ])
            .then((answer) => {
                if(!answer.confirmChoice) {
                    return update(drinkList)
                } else {
                    finalize = true;
                }
            })

    if(finalize) {
        drinkObj = await updateSelections(drinkObj);
        drinkList[drinkIndex] = drinkObj; 
        return drinkList;
    } else {
        return drinkList;
    }
}

const updateSelections = async(drinkObj) => { // Helper function for updating a drink handles updates once drink is chosen

    await inquirer
    .prompt([
        {
            name: "objectKey",
            type: "list",
            message: `What part of ${drinkObj.name} (${drinkObj.id}) would you like to edit?`,
            choices: Object.keys(drinkObj).slice(1)
        }
    ])
    .then(async (answer) => {
        switch(answer.objectKey) {
            case 'name':
                await inquirer
                    .prompt([
                        {
                            name: "drinkName",
                            type: "input",
                            message: `What would you like to change the name "${drinkObj.name}" to?`,
                        },
                    ])
                    .then((answer) => {
                        drinkObj.name = answer.drinkName;
                        })
                    break;
            case 'ingredients':
                await inquirer
                    .prompt([
                        {
                            name: "ingredients",
                            type: "checkbox",
                            message: "What do you need to make this drink?",
                            choices: ingredientsList
                        },
                    ])
                    .then((answer) => {
                        drinkObj.ingredients = answer.ingredients
                    })
                    break;
            case 'priceInCents':
                await inquirer
                    .prompt([
                        {
                            name: "price",
                            type: "input",
                            message: "How much does this drink cost in cents?",
                            filter: (value) => isNaN(value) ? '' : Number(value),
                            validate(value) {
                                const pass = Number.isInteger(value) && Number(value) > 0;
                                if(pass) {
                                    return true;
                                }
                                
                                return 'Please enter a positive Integer'
                            }
                        },
                    ])
                    .then((answer) => {
                        drinkObj.priceInCents = answer.price
                        
                    })
                    break;
            case 'inStock':
                await inquirer
                    .prompt([
                        {
                            name: "inStock",
                            type: "confirm",
                            message: "Can you serve this drink now?"
                        }
                    ])
                    .then((answer) => { 
                        drinkObj.inStock = answer.inStock
                        
                    })
                    break;
            default:
                return drinkObj;
        }
    })

    await inquirer
        .prompt([
            {
                name: 'confirmChanges',
                type: 'list',
                message: `Here is your new drink\n${formatTable(drinkObj).toString()}\n would you like to change anything else?`,
                choices: ['Confirm changes', 'Make another change']
            }
        ])
        .then((answer) => {
            if(answer.confirmChanges === 'Make another change') {
                return updateSelections(drinkObj);
            } else {
                log('Your drink has been updated!')
            }
        })

    return drinkObj;
}

const destroy = async (drinkList) => {
    const drinkIds = drinkList.map((drink) => drink.id);
    let drinkIndex = -1;
    let drinkName = '';
    let finalize = false;

    await inquirer
            .prompt([
                {
                    name: "drinkId",
                    type: "list",
                    message: "Which drink would you like to remove from the list?",
                    choices: drinkIds
                }
            ])
            .then((answer) => {
                drinkIndex = drinkList.findIndex((drink) => drink.id === answer.drinkId)
                drinkName = drinkList.find((drink) => drink.id === answer.drinkId).name
            })
    await inquirer
            .prompt([
                {
                    name: "confirmChoice",
                    type: "confirm",
                    message: `You have picked "${drinkName}" is that correct?`
                }
            ])
            .then((answer) => {
                if(!answer.confirmChoice) {
                    return destroy(drinkList)
                } else {
                    finalize = true;
                }
            })
        
    if(finalize) {
        drinkList.splice(drinkIndex,1);
        log(`"${drinkName}" has been removed from list`);   
        return drinkList;
    } else {
        return drinkList;
    }
}


export {
    index,
    create,
    update,
    destroy
}