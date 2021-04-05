/*
**********************************Object structure of EMV************************************

    EMVTranslation:{
        pfi: <string[02]> M,              //[ID=00] Payload Format Indicator
        pim: <string[02]> O,              //[ID=01] Point of initiation method {11=static,12=dynamic}
        mait: <obj[0...99]> O             //[ID=28] P2M Merchant Account information template
        {    
            guid: <string[?1...20?]> M,      //[ID=00] Globally Unique Identifier
            acqid: <string[11]> M,           //[ID=01] Acquirer ID
            merid: <string[1...25]> C,       //[ID=03] Merchant ID
            pnflags: <string[3]> M           //[ID=05] Proxy notify flags {example: "310"}
        },
        mcc: <string[04]> M,              //[ID=52] Merchant Category Code
        txCurrency: <string[03]> M,       //[ID=53] Transaction currency
        txAmt: <string[0...13]> C,        //[ID=54] Transaction amount
        cc: <string[02]> M,               //[ID=58] Country code
        merName: <string[1...25]> M,      //[ID=59] Merchant name
        merCity: <string[1...15]> M,      //[ID=60] Merchant city
        additional: <obj[0...99]> O       //[ID=62] Additional data field template
        {
            refLabel: <string[1...25]> M,   //[ID=05] Reference label
            termLabel: <string[1...8]> C    //[ID=07] Terminal label
        },
        crc: <string[04]> M                //[ID=63] CRC16 CCITT (crc string should be up to crc length string `63 04`)
    }
*/

//Mapping of EMVTranslation Object keys to IDs
const keyToIDMap = {
    'pfi':'00', 'pim':'01', 'mait':'28',
    'guid':'00', 'acqid':'01', 'merid':'03', 'pnflags':'05',
    'mcc':'52', 'txCurrency':'53', 'txAmt':'54', 'cc':'58',
    'merName':'59', 'merCity':'60', 'additional':'62',
    'context':'00', 'refLabel':'05', 'termLabel':'07',
    'crc':'63'
};

const getKeyFromID = (id, keyShift=0) =>{
    const idToKeyMap = {
        '00':['pfi','guid'],
        '01':['pim','acqid'],
        '03':['','merid'],
        '05':['','pnflags|refLabel'],
        '07':['','termLabel'],
        '28':['mait'],
        '52':['mcc'],
        '53':['txCurrency'],
        '54':['txAmt'],
        '58':['cc'],
        '59':['merName'],
        '60':['merCity'],
        '62':['additional'],
        '63':['crc']
    }
    return idToKeyMap[id][keyShift];
}

module.exports={keyToIDMap, getKeyFromID};