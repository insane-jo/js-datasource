let deepEqual = require('deep-equal');
let deepCondition = require('deep-condition');

/**
 * @typedef {{}} DataSourceRow
 */

function deepCopyObject(obj) {
    if(obj == null || typeof obj != 'object') {
        return obj;
    }

    let result = {};
    Object.keys(obj).forEach((key) => {
        result[key] = deepCopyObject(obj[key]);
    });

    return result;
}

class DataSource extends Array {

    /**
     * @param {Array<{}>} data
     * @param {DataSourceOptions} [opts]
     */
    constructor(data, opts) {
        if (!Array.isArray(data)) {
            data = Array.prototype.slice.call(arguments);
            opts = undefined;
        }
        super(...data);

        this._src       = data.map(deepCopyObject);
        this._isDirty   = false;

        this.setOptions(opts);
    }

    /**
     * Changes current data or returns full current data
     * @param {Array<{}>} [newData]
     * @return {Array<{}>}
     */
    data(newData) {
        if (arguments.length) {
            Array.apply(this, ...newData);
            this._src = data.map(deepCopyObject);
            this._isDirty = false;
        }

        return this;
    }

    /**
     * Fully replaces options
     * @param {DataSourceOptions} opts
     */
    setOptions(opts) {
        this._opts = opts || {};
        this.filter(opts && opts.filter);
    }

    /**
     * @param {FilterSettings} filterSettings
     * @return {FilterSettings}
     */
    filter(filterSettings) {
        if (arguments.length) {
            this._filterSettings = filterSettings;
            this._opts.filter = filterSettings;
        }
        return this._filterSettings;
    }

    get isDirty() {
        if (this._isDirty) {
            return true;
        } else if (this.length !== this._src.length) {
            this._isDirty = true;
            return true;
        } else {

            //In deep equal - prototypes must be the same
            let thisArr = new Array(...this.slice(0, this.length));
            this._isDirty = !deepEqual(this._src, thisArr);

            return this._isDirty;
        }
    }

    /**
     * @return {Array}
     */
    view() {
        let result = new Array(...this);

        //Filtering
        if (this._filterSettings) {
            result = deepCondition(result, this._filterSettings);
        }

        return result;
    }
}

module.exports = DataSource;