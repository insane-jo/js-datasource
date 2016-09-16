let {expect} = require('chai');
let DataSource = require('../index');

describe('02. Checking datasource is dirty', () => {

    it('Push', () => {
        let ds = new DataSource(global.sampleData);

        let newRow = {a: 1, b: 2, c: 3};
        ds.push(newRow);

        expect(ds.isDirty).equal(true);
    });

    it('Change by index', () => {
        let ds = new DataSource(global.sampleData);

        let newRow = {a: 1, b: 2, c: 3};
        ds[10] = newRow;

        expect(ds.isDirty).equal(true);
    });

    it('Objects in source not equals current data', () => {
        let ds = new DataSource(global.sampleData);

        let {length} = ds;
        for(let i = 0; i < length; i++) {
            expect(ds[i]).not.equal(ds._src[i]);
        }
    });

    describe('After change data - datasource becomes dirty', () => {
        it('Change existing property', () => {
            let ds = new DataSource(global.sampleData);
            expect(ds.isDirty).equal(false);
            // ds[0].rank = 'aabc';
            // expect(ds.isDirty).equal(true);
        });

        it('Change new property', () => {
            let ds = new DataSource(global.sampleData);
            expect(ds.isDirty).equal(false);
            ds[0].rank1 = 'aabc';
            expect(ds.isDirty).equal(true);
        });

        it('Rewrite existing element by index', () => {
            let ds = new DataSource(global.sampleData);

            expect(ds.isDirty).equal(false);
            let newRow = {a: 1, b: 2, c: 3};
            ds[0] = newRow;
            expect(ds.isDirty).equal(true);
        });

        it('Delete element by index', () => {
            let ds = new DataSource(global.sampleData);

            expect(ds.isDirty).equal(false);
            delete ds[0];
            expect(ds.isDirty).equal(true);
        });

        it('Splice makes datasource dirty', () => {
            let ds = new DataSource(global.sampleData);

            expect(ds.isDirty).equal(false);
            ds.splice(0,2);
            expect(ds.isDirty).equal(true);
        });

        it('On rewrite data datasource becomes dirty', () => {
            let ds = new DataSource(global.sampleData);

            let newData = [
                {a: 1, b: 1},
                {a: 2, b: 3},
                {a: 3, c: 4}
            ];

            expect(ds.isDirty).equal(false);
            ds.data(newData);
            expect(ds.isDirty).equal(true);
        })
    });

});