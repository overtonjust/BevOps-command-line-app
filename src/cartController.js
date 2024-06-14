import  inquirer  from 'inquirer' 
import { cartFramework, convertCentsToDollars, formatDrinkObject} from './helpers/table.js'
import { writeJsonFile } from './helpers/helpers.js'
import Table from 'cli-table3'
import chalk from 'chalk'


const log = console.log


const handleCartSelection = async (drinkList, readiedCart=[]) => {
    let selectedDrink = ''
    let order = [];
    let readyToPush = false;
    let goAgain = false;

    await inquirer
                .prompt([
                    {
                        name: "drinkChoice",
                        type: "list",
                        message: "Which drink would you like?",
                        choices: drinkList
                    }
                ])
                .then((answer) => {
                    selectedDrink = answer.drinkChoice
                })

    await inquirer
    .prompt([
        {
            name: "drinkCount",
            type: "input",
            message: `How many ${selectedDrink}'s would you like?`,
            filter: (value) => isNaN(value) ? '' : Number(value),
            validate(value) {
            const pass = Number.isInteger(value) && Number(value) > 0;
                if(pass) {
                    return true;
                }
                    return 'Please enter a positive Integer'
            }
        }
    ])
    .then(async (answer) => {
        order = await addToCart(selectedDrink, answer.drinkCount, drinkList)
    })

    await inquirer
    .prompt([
        {
            name: "goAgain",
            type: "confirm",
            message: "Would you like to add anything else?"
        }
    ])
    .then( async (answer) => {
        if(answer.goAgain) {
            readiedCart.push(...order);
            await handleCartSelection(drinkList,readiedCart)
        } else {
            readiedCart.push(...order);
        }
    })

    readyToPush = true;
    
    if(readyToPush) {
        return readiedCart;
    } else return false;
}


const addToCart = async (chosenDrink, amount, drinkList,) => {
    const drinkObj = drinkList.find((drink) => drink.name === chosenDrink);
    let cart = []
    let count = 0;

    while(count < amount) {
        cart.push(drinkObj)
        count++;
    }

    return cart;
}


const showCartTotal = (cart) => {
    const cartDisplay = new Table(cartFramework);

    let total = 0;
    cart.forEach((drink) => {
        total += drink.priceInCents;
        const newObject = formatDrinkObject(drink.name, convertCentsToDollars(drink.priceInCents))
        cartDisplay.push(newObject)
    })
    total = chalk.green(convertCentsToDollars(total))
    const redTotal = chalk.red('Total')
    const totalObj = {}
    totalObj[redTotal] = total

    cartDisplay.push(totalObj)

    return cartDisplay
}

const confirmCheckOut = async (cart, drinkList) => {
    let readyToCheckOut = false;

    const answer =  await inquirer.prompt([
                {
                    name: "confirmPurchase",
                    type: "confirm",
                    message: `\n${showCartTotal(cart).toString()}\n Here is your total. Does everything look ok?`
                }
            ])

    if (answer.confirmPurchase) {
        readyToCheckOut = true;
    } else {
        const cartInquiryAnswer = await inquirer.prompt([
            {
                name: "cartInquiry",
                type: "list",
                message: "What would you like to change?",
                choices: ['Remove an item', 'Start over']
            }
        ]);

        switch (cartInquiryAnswer.cartInquiry) {
            case 'Start over':
                cart = await handleCartSelection(drinkList);
                await writeJsonFile('./data', 'drinkCart.json', cart);
                break;
            case 'Remove an item':
                cart = await handleCartRemoval(cart);
                await writeJsonFile('./data', 'drinkCart.json', cart);
                break;
        }

        readyToCheckOut = await confirmCheckOut(cart, drinkList);
    }

    return readyToCheckOut;
}
const handleCartRemoval = async (cart) => {
    
    const answer = await inquirer.prompt([
        {
            name: "removalChoice",
            type: "checkbox",
            message: "What would you like to remove?",
            choices: cart
        }
    ])

    const deleteArr = answer.removalChoice;

    deleteArr.forEach((drink) => {
        const index = cart.findIndex((cartDrink) => cartDrink.name  === drink)
        cart.splice(index, 1)
    })

    return cart;
}

export {
    handleCartSelection,
    showCartTotal,
    confirmCheckOut
}
