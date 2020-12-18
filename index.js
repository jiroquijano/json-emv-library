const EMVParser = require('./src/lib/EMVParser');
const {convertObjectToEMVCode} = require('./src/lib/json-emv-conv');

module.exports = {
    convertEMVToObject : (input) => {
        const emvParser = new EMVParser(input);
        const result = emvParser.getObjectEquivalent();
        return result;
    },
    convertObjectToEMVCode
}