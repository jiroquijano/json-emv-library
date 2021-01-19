const {transformToEMVFormat, convertObjectToEMVCode, calculateAndFormatCRC} = require('../../src/lib/json-emv-conv');
const {keyToIDMap} = require('../../src/lib/key-and-id-mapping');
const {crc16ccitt} = require('crc');
const _ = require('lodash');

const padPayloadLength = (payload) =>{
    return payload.length < 10 ? `0${payload.length}` : payload.length;
}

test('should be able to process simple key-value pair strings to EMV format', ()=>{
    const keyValuePairArray = [
        ['pfi','test'], ['pim', 'test'], ['mait','test'], ['guid','testing'],
        ['acqid','test'], ['merid','jiro'], ['pnflags','pogi'], ['mcc','test'],
        ['txCurrency','test'], ['txAmt','test'], ['cc','test'], ['merName','test'],
        ['merCity','test'], ['additional','test'], ['refLabel','test'], ['termLabel','test'], ['crc','test']
    ];
    keyValuePairArray.forEach((pairItem)=>{
        const emvFormatString = transformToEMVFormat(pairItem[0], pairItem[1]);
        expect(emvFormatString).toEqual(`${keyToIDMap[pairItem[0]]}${padPayloadLength(pairItem[1])}${pairItem[1]}`);
    });
});

test('should calculate crc using CRC16 CCITT and format to EMV string',()=>{
    const samplePayload = '00020101021128500011pa.hil.pi020111PBTMNPHIXXX030989230765305031235204601653036085802PH5910MYFOODHALL6011MANDALUYONG624105253CF64D20941AAEFCE8C263A7A070800000000';
    const calculated = calculateAndFormatCRC(samplePayload);
    const expectedCRC = _.padStart(crc16ccitt(`${samplePayload}6304`).toString(16).toUpperCase(),4,'0');
    expect(calculated).toEqual(`6304${expectedCRC}`)
});

test('should be able to translate nested object payload to EMV formatted string',()=>{
    const nestedObject = {
        mait:{                  //28 32
            guid: '1234',           //00 04 1234
            acqid: '56789',         //01 05 56789
            merid: 'abcd',          //03 04 abcd
            pnflags: '310'          //05 03 310
        }
    };
    const generatedEMVCode = convertObjectToEMVCode(nestedObject);
    const expectedStringWithoutCrc = '2832000412340105567890304abcd0503310';
    const crc = _.padStart(crc16ccitt(`${expectedStringWithoutCrc}6304`).toString(16).toUpperCase(),4,'0');
    expect(generatedEMVCode).toEqual(`${expectedStringWithoutCrc}6304${crc}`);
});

test('should be able to translate complex object (simple + nested) input to EMV formatted string', ()=>{
    const complexObject = {
        pfi: 'hey',             //00 03 hey
        mait: {                 //28 36
            guid: 'black',          //00 05 black
            acqid: 'pink',          //01 04 pink
            merid: 'in.your',       //03 07 in.your
            pnflags: 'area'         //05 04 area
        }
    }
    const generatedEMVCode = convertObjectToEMVCode(complexObject);
    const expectedStringWithoutCrc = '0003hey28360005black0104pink0307in.your0504area';
    const crc = _.padStart(crc16ccitt(`${expectedStringWithoutCrc}6304`).toString(16).toUpperCase(),4,'0');
    expect(generatedEMVCode).toEqual(`${expectedStringWithoutCrc}6304${crc}`);
});