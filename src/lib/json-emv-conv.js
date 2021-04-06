const _ = require('lodash');
const {keyToIDMap} = require('./key-and-id-mapping');
const {crc16ccitt} = require('crc');

//Pads length string value when length is one digit
const padPayloadLength = (payload) =>{
    return payload.length < 10 ? `0${payload.length}` : payload.length;
}

const calculateAndFormatCRC = (input) =>{
    const crc = crc16ccitt(`${input}6304`).toString(16).toUpperCase(); //[KEY][LENGTH] of CRC part of CRC payload
    const paddedCrc = _.padStart(crc,4,'0');
    return transformToEMVFormat('crc',paddedCrc);
}

//EMV format: `[KEY][PAYLOAD LENGTH][PAYLOAD]`
const transformToEMVFormat = (key, payload) =>{
    if(typeof(payload) === 'string'){ //for simple string payload
        return `${keyToIDMap[key]}${padPayloadLength(payload)}${payload}`;
    }else if(_.isArray(payload)){ //for nested array payload
        const rootkey = keyToIDMap[key];
        let aggregatedChildArray;
        try {
            aggregatedChildArray = payload.reduce((acc,curr)=>{
                return `${acc}${transformToEMVFormat(curr[0],curr[1])}`;
            },'');
        } catch (error) {
            throw new Error('[JSONEMVLIB] payload: ( ' + payload + ' ) is not an array');
        }
        return `${rootkey}${padPayloadLength(aggregatedChildArray)}${aggregatedChildArray}`;
    }
}

const convertObjectToArray = (input)=>{ //transform object to array to guarantee order of fields
    const resultingArray = [];
    ['pfi','pim','mait','mcc','txCurrency','txAmt','cc','merName','merCity','additional'].forEach((key)=>{
        if(input[key]){
            if(key === 'mait' || key === 'additional'){
                const innerArray = [];
                const validInnerKeys = key==='mait' ? ['guid','acqid','merid','pnflags'] : ['guidContext', 'refLabel','termLabel']
                validInnerKeys.forEach((innerKey)=>{
                    if(input[key][innerKey]){
                        innerArray.push([innerKey, input[key][innerKey]]);
                    }
                });
                resultingArray.push([key, innerArray]);
            }else{
                resultingArray.push([key,input[key]]);
            }
        }
    });
    return resultingArray;
}

const convertObjectToEMVCode = (input) =>{
    if(_.isEmpty(input)) return '';
    let crcString = '';
    const inputArray = convertObjectToArray(input); //to guarantee input field order (this is crucial for crc), transform object to array
    const emvString = inputArray.reduce((acc, curr)=>{
        return `${acc}${transformToEMVFormat(curr[0],curr[1])}`
    },'');
    if(emvString) crcString = calculateAndFormatCRC(emvString);
    return emvString+crcString;
}

module.exports = {transformToEMVFormat, convertObjectToEMVCode, calculateAndFormatCRC};