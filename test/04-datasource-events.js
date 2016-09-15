let {expect} = require('chai');
let DataSource = require('../index');

describe('04. Datasource event emitter', () => {

    let ds = new DataSource(global.sampleData);

    it('On change data fires DataSource#change', (done) => {
        ds.once('change', () => {
            done();
        });

        let newData = [
            {a: 1, b: 1},
            {a: 2, b: 3},
            {a: 3, c: 4}
        ];

        ds.data(newData);
    });

    it('On change options fires DataSource#change-options', (done) => {
        ds.once('change-options', () => {
            done();
        });

        ds.filter({field: 'a', operator: 'gt', value: 1});
    });

});