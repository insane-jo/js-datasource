let {expect} = require('chai');
let DataSource = require('../index');

describe('01. Array functions', () => {

    it('Push', () => {
        let ds = new DataSource(global.sampleData);

        let newRow = {a: 1, b: 2, c: 3};
        let pushResult = ds.push(newRow);

        expect(pushResult).not.equal(undefined);
        expect(ds.length).equal(11);
        expect(ds._src.length).equal(10);
    });

    it('Change by index', () => {
        let ds = new DataSource(global.sampleData);

        let newRow = {a: 1, b: 2, c: 3};
        ds[10] = newRow;

        expect(ds.length).equal(11);
        expect(ds._src.length).equal(10);
    });

    it('Objects in source not equals current data', () => {
        let ds = new DataSource(global.sampleData);

        let {length} = ds;
        for(let i = 0; i < length; i++) {
            expect(ds[i]).not.equal(ds._src[i]);
        }
    });

});