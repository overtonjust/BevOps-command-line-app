import { writeFileSync, readFileSync } from 'node:fs'

const readJsonFile = (path, fileName) => {
    const collection = readFileSync(`${path}/${fileName}`, 'utf8');
    return JSON.parse(collection) || [];
}

const writeJsonFile = (path, fileName, data) => {
    data = JSON.stringify(data, null, 2);
    writeFileSync(`${path}/${fileName}`, data, {encoding: 'utf-8'})
}




export {
    readJsonFile,
    writeJsonFile,
}