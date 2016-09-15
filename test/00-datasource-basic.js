let {expect} = require('chai');
let DataSource = require('../index');

describe('00. DataSource basic functions', () => {

    describe('DataSource~data changes source and current data', () => {
        let ds = new DataSource(global.sampleData);

        it('Changing data', () => {
            delete ds[0];
            expect(ds.isDirty).equal(true);
        });

        it('Changing data in DataSource', () => {
            let newData = [
                {a: 1, b: 1},
                {a: 2, b: 3},
                {a: 3, c: 4}
            ];

            ds.data(newData);
            expect(ds.length).equal(3);
            expect(ds.isDirty).equal(false);
        });
    });

});