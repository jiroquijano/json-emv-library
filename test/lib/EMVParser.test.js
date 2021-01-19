const EMVParser = require('../../src/lib/EMVParser');

test('simple EMV strings should be converted to objects properly',()=>{
    const simpleEMV = '0004simp';
    const parserUnderTest = new EMVParser(simpleEMV);
    expect(parserUnderTest.getObjectEquivalent()).toEqual({
        pfi: 'simp'
    });
});

test('EMV strings with multiple simple key data should be handled properly',()=>{
    const longSimpleEMV = '0004simp0102LE5203but6004many';
    const parserUnderTest = new EMVParser(longSimpleEMV);
    expect(parserUnderTest.getObjectEquivalent()).toEqual({
        pfi:'simp',
        pim:'LE',
        mcc:'but',
        merCity:'many'
    });
});

test('parser should be able to handle complex nested EMV string',()=>{
    const complexEMV = '28390007complex0106nested0306string0504test';
    const parserUnderTest = new EMVParser(complexEMV);
    expect(parserUnderTest.getObjectEquivalent()).toEqual({
        mait:{
            guid:'complex',
            acqid:'nested',
            merid:'string',
            pnflags:'test'
        }
    })
});

test('parser should be able to handle multiple complex nested EMV string', ()=>{
    const multipleComplexEMV = '28390007complex0106nested0306string0504test62180506please0704work';
    const parserUnderTest = new EMVParser(multipleComplexEMV);
    expect(parserUnderTest.getObjectEquivalent()).toEqual({
        mait:{
            guid:'complex',
            acqid:'nested',
            merid:'string',
            pnflags:'test'
        },
        additional:{
            refLabel:'please',
            termLabel:'work'
        }
    })
})

test('parser should be able to process a combination of simple and complex EMV string',()=>{
    const combinedEMV = '00020101021128500011pa.hil.pi020111PBTMNPHIXXX030989230765305031235204601653036085802PH5910MYFOODHALL6011MANDALUYONG624105253CF64D20941AAEFCE8C263A7A0708000000006304D458';
    const parserUnderTest = new EMVParser(combinedEMV);
    expect(parserUnderTest.getObjectEquivalent()).toEqual({
        pfi: '01',
        pim: '11',
        mait:{
            guid: 'pa.hil.pi02',
            acqid: 'PBTMNPHIXXX',
            merid: '892307653',
            pnflags: '123' 
        },
        mcc: '6016',
        txCurrency: '608',
        cc: 'PH',
        merCity: 'MANDALUYONG',
        merName: 'MYFOODHALL',
        additional:{
            refLabel: '3CF64D20941AAEFCE8C263A7A',
            termLabel: '00000000'
        },
        crc: 'D458'
    });
})

test('parser should reject invalid EMV string', ()=>{
    const invalidEMV = '000206280603aaa';
    const parserUnderTest = new EMVParser(invalidEMV);
    expect(parserUnderTest.getObjectEquivalent()).toEqual({error: '000206280603[aa]a'});
})