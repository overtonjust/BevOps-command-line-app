import Table from 'cli-table3';
import chalk from 'chalk';


const headers = ["Id", "Name", "Ingredients", "Price", "Stock"];
const cartHeaders = ['Name', 'Price'];
const formattedHeader = (headings) => headings.map((header) => chalk.yellowBright(header));
const convertCentsToDollars = ( cents ) => {
    cents = Number(cents);
    return `$${(cents / 100).toFixed(2)}`;
}

const formatItems = (arr) => {
    return arr.map((item) => {
        if(item.length === 0) {
            item = 'Nothing?'
        }
        if(typeof item === 'object') {
            item = item.join(', ')
        } else if (typeof item === 'number') {
            item = convertCentsToDollars(item)
        }
        if(item === true){
            return chalk.greenBright('In Stock')
        } else if (item === false) {
            return chalk.redBright('Out of Stock')
        } else {
            return chalk.yellow(item)
        }
    })
}

const formatDrinkObject = (id, ele)  => {
    const key = chalk.magenta(id);
    const drinkObj = {}
    drinkObj[key] = ele
    return drinkObj;
}



const tableFramework = { 
    head: formattedHeader(headers),
    colWidths: [10, 15, 30, 10, 10],
    wordWrap: true, 
    rowHeights: [1],
    style: {
        head:[]
    }
};

const cartFramework = {
    head: formattedHeader(cartHeaders),
    colWidths: [15, 15],
    wordWrap: true,
    rowHeights: [1],
    style: {
        head: []
    }
}


export {
    tableFramework,
    formatItems,
    formatDrinkObject,
    cartFramework,
    convertCentsToDollars
}

