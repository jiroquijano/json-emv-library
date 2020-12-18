const {getKeyFromID} = require('./key-and-id-mapping');
const _ = require('lodash');


/* ===============================================EMV Parser===============================================
    A Class which parses EMV strings to JS objects

    Usage:
    1. instantiate class ---- e.g. const parser = new EMVParser(EMVString,keyshift,rootkey)
        constructor parameters:
            EMVString : the string which will be parsed into an object
            keyshift : defaults to 0, used for id-key mapping in case of nested EMV structure
            rootkey: empty by default. was added to address the collision of ID '05' on `mait` and `additional` keys
    2. get the constructed object ---- e.g. parser.getObjectEquivalent()
    3. carry on

    On Invalid EMV strings
    1. when EMV string is invalid, getObjectEquivalent() will return an object with an error parameter
        indicating which part of the string is problematic.
        e.g.
        Input = '0002hi9904helo'
        output = {error: ''0002hi[99]04helo'} //because 99 is not a valid key
    ========================================================================================================
*/
class EMVParser{
    constructor(EMVString, keyshift=0, rootkey=''){
        this.emvString = EMVString;
        this.keyshift=keyshift;
        this.rootkey = rootkey;
        this.cursor = 0;
        this.currentKey = '';
        this.currentPayloadLength='';
        this.currentPayload='';
        this.objectEquivalent = {};
        this.nestedObject = {};
        this.abort = false; //self destruct button
        this.triggerParsing();
    }

    getObjectEquivalent(){
        return this.objectEquivalent.error ? {error: this.objectEquivalent.error} : this.objectEquivalent;
    }

    generateProblematicString(problematicIndex){
        let errorMessage = '';
        if(+problematicIndex === 0){
            errorMessage = `[${this.emvString.slice(0,problematicIndex+2)}]${this.emvString.slice(problematicIndex+2)}`
        }else{
            errorMessage = `${this.emvString.slice(0,problematicIndex)}[${this.emvString.slice(problematicIndex,problematicIndex+2)}]${this.emvString.slice(problematicIndex+2)}`
        }
        return errorMessage;
    }

    parseKey(){
        try{
            const rawID = this.emvString.slice((+this.cursor),(+this.cursor)+2);
            let selectedKey = getKeyFromID(rawID, this.keyshift);
            if(rawID === '05'){ //there is a collision of ID '05' for 'mait' and 'additional' object structure (yes, this is a hack-y solution)
                selectedKey = this.rootkey === 'mait' ? selectedKey.split('|')[0] : selectedKey.split('|')[1];
            }
            this.currentKey = selectedKey;
            this.cursor += 2;
        }catch(error){
            this.abort = true;
            return this.objectEquivalent = {error: this.generateProblematicString(this.cursor)}
        }
    }

    parseLength(){
        this.currentPayloadLength = this.emvString.slice((+this.cursor), (+this.cursor)+2);
        if(isNaN(+this.currentPayloadLength)) {
            this.abort = true;
            return this.objectEquivalent = {error: this.generateProblematicString(this.cursor)}
        }
        this.cursor +=2;
    }

    parsePayload(){
        if(this.abort) return;
        this.currentPayload = this.emvString.slice(this.cursor, (+this.cursor)+ (+this.currentPayloadLength))
        if(['mait','additional'].includes(this.currentKey)){
            const subParser = new EMVParser(this.currentPayload, 1,this.currentKey); //keyshift is 1 because of id to key mapping
            if(subParser.abort){ //something went wrong inside nested parsing
                this.abort = true;
                const problematicIndex = +this.cursor + +subParser.cursor;
                return this.objectEquivalent = {error: this.generateProblematicString(problematicIndex)};
            }
            this.nestedObject = {...subParser.getObjectEquivalent()};
        }
        this.cursor+=(+this.currentPayloadLength);
    }

    updateEquivalentObject(){
        const newEntry = {};
        if(!_.isEmpty(this.nestedObject)){
            newEntry[this.currentKey] = {...this.nestedObject};
            this.nestedObject = {};
        }else{
            newEntry[this.currentKey] = this.currentPayload;
        }

        this.objectEquivalent = {
        ...this.objectEquivalent,
        ...newEntry
        }
    }

    triggerParsing(){
        while((this.cursor < this.emvString.length) && !this.abort){
            this.parseKey();
            this.parseLength();
            this.parsePayload();
            this.updateEquivalentObject();
        }
    }
}

module.exports = EMVParser;
