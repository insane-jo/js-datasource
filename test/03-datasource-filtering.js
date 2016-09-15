let {expect} = require('chai');
let DataSource = require('../index');

describe('03. Datasource filtering', () => {

    /**
     * @type {FilterSettings}
     */
    let filter = {
        logic: 'or',
        filters: [
            {
                logic: 'and',
                filters: [
                    {field: 'rating', operator: 'eq', value: 8.8},
                    {field: 'year', operator: 'gt', value: 2000}
                ]
            },
            {field: 'title', operator: 'contains', value: 'Godfather'}
        ]
    };

    let filterFunction = ((x, i) => {
        return x.rank > 5;
    });

    describe('Set up filtering with object', () => {
        it('Via constructor', () => {
            let ds = new DataSource(global.sampleData, {filter: filter});

            expect(ds._filterSettings).not.equal(undefined);
            expect(ds.isDirty).equal(false);
        });

        it('Change via DataSource~filter method', () => {
            let ds = new DataSource(global.sampleData);

            expect(ds._filterSettings).equal(undefined);
            ds.filter(filter);
            expect(ds._filterSettings).not.equal(undefined);
            expect(ds.isDirty).equal(false);
        });

        it('Change via DataSource~setOptions method', () => {
            let ds = new DataSource(global.sampleData);

            expect(ds._filterSettings).equal(undefined);
            ds.setOptions({filter: filter});
            expect(ds._filterSettings).not.equal(undefined);
            expect(ds.isDirty).equal(false);
        });
    });

    describe('Set up filtering with function', () => {

        it('Via constructor', () => {
            let ds = new DataSource(global.sampleData, {filter: filterFunction});

            expect(ds._filterSettings).not.equal(undefined);
            expect(ds.isDirty).equal(false);
        });

        it('Change via DataSource~filter method', () => {
            let ds = new DataSource(global.sampleData);

            expect(ds._filterSettings).equal(undefined);
            ds.filter(filterFunction);
            expect(ds._filterSettings).not.equal(undefined);
            expect(ds.isDirty).equal(false);
        });

        it('Change via DataSource~setOptions method', () => {
            let ds = new DataSource(global.sampleData);

            expect(ds._filterSettings).equal(undefined);
            ds.setOptions({filter: filterFunction});
            expect(ds._filterSettings).not.equal(undefined);
            expect(ds.isDirty).equal(false);
        });
    });

    it('Filtering with object changes view result', () => {
        let ds = new DataSource(global.sampleData, {filter: filter});

        let viewResult = ds.view();

        expect(ds.data().length).not.equal(viewResult.length);
        expect(viewResult.length).equal(4);
    });

    it('Filtering with function changes view result', () => {
        let ds = new DataSource(global.sampleData, {filter: filterFunction});

        let viewResult = ds.view();

        expect(ds.data().length).not.equal(viewResult.length);
        expect(viewResult.length).equal(4);
    });

});