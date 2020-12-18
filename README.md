# JSON-EMV-JSON Library
>#### Converts JSON input to EMV String and vice versa

## Installation
```
npm i json-emv-lib
```

## Usage
#### This library exports 2 methods
* convertEMVToObject(emvString)
* convertObjectToEMV(object)


### convertEMVToObject() as the name suggests, converts EMV format input to an Object

```javascript
const {convertEMVToObject} = require('json-emv-lib');
const objectFormat = convertEMVToObject(<your EMV string>);
```

### convertObjectToEMV() on the other hand, does the opposite
```javascript
const {convertObjectToEMV} = require('json-emv-lib');
const emvFormat = convertObjectToEMV(<your JSON input>);
```

