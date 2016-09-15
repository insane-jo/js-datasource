let deepEqual = require('deep-equal');

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
     * @param opts
     */
    constructor(data, opts) {
        if (!Array.isArray(data)) {
            data = Array.prototype.slice.call(arguments);
        }
        super(...data);

        this._src       = data.map(deepCopyObject);
        this._opts      = opts;
        this._isDirty   = false;
    }

    /**
     * @override
     * @param {DataSourceRow} row
     * @returns {DataSourceRow}
     */
    push(row) {
        super.push(row);
        this._isDirty = true;

        return row;
    }

    get isDirty() {
        if (this._isDirty) {
            return true;
        } else if (this.length !== this._src.length) {
            return true;
        } else {

            //In deep equal - prototypes must be the same
            let thisArr = new Array(...this.slice(0, this.length));
            this._isDirty = !deepEqual(this._src, thisArr);

            return this._isDirty;
        }

    }
}

module.exports = DataSource;