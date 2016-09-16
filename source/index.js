let deepEqual = require('deep-equal');
let deepCondition = require('deep-condition');

const DEFAULT_VALUES = {
    emitDelay: 10,
    strictMode: false
};

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
        /*SETTING UP ARRAY*/
        if (!Array.isArray(data)) {
            data = Array.prototype.slice.call(arguments);
            opts = undefined;
        }
        opts = opts || {};
        super(...data);

        /*SETTING UP PROPERTIES*/
        let srcData = data.map(deepCopyObject);
        Object.defineProperty(this, '_src', {
            enumerable: false,
            value: srcData,
            writable: true
        });

        Object.defineProperty(this, '_isDirty', {
            enumerable: false,
            value: false,
            writable: true
        });

        //Configures options
        Object.defineProperty(this, '_opts', {
            enumerable: false,
            writable: true
        });
        Object.defineProperty(this, '_filterSettings', {
            enumerable: false,
            writable: true
        });

        /*SETTING UP EVENT EMITTER*/
        let emitDelay, strictMode;

        if (opts.hasOwnProperty('emitDelay')) {
            emitDelay = opts.emitDelay;
        } else {
            emitDelay = DEFAULT_VALUES.emitDelay;
        }
        Object.defineProperty(this, '_emitDelay', {
            enumerable: false,
            writable: true,
            value: emitDelay
        });
        // this._emitDelay = emitDelay;

        if (opts.hasOwnProperty('strictMode')) {
            strictMode = opts.strictMode;
        } else {
            strictMode = DEFAULT_VALUES.strictMode;
        }
        Object.defineProperty(this, '_strictMode', {
            enumerable: false,
            writable: true,
            value: strictMode
        });
        // this._strictMode = strictMode;

        Object.defineProperty(this, '_listeners', {
            enumerable: false,
            writable: true,
            value: {}
        });
        // this._listeners = {};
        Object.defineProperty(this, 'events', {
            enumerable: false,
            writable: true,
            value: []
        });
        // this.events = [];

        /*SETTING UP OPTIONS*/
        this.setOptions(opts);
    }

    /**
     * Changes current data or returns full current data
     * @param {Array<{}>} [newData]
     * @return {Array<{}>}
     */
    data(newData) {
        if (arguments.length) {

            let length = Math.max(this.length, newData.length);
            for (let i = 0; i < length; i++) {
                if (i in this && i in newData) {
                    this[i] = deepCopyObject(newData[i]);
                } else if (i in newData) {
                    this[i] = deepCopyObject(newData[i]);
                } else if (i in this) {
                    delete this[i];
                }
            }
            this.length = newData.length;

            // this._src = newData.map(deepCopyObject);
            this._isDirty = true;

            this.emit('change', this);
        }

        return this;
    }

    /**
     * Fully replaces options
     * @param {DataSourceOptions} opts
     */
    setOptions(opts) {
        this._opts = opts || {};
        if (this._opts.hasOwnProperty('filter')) {
            this._filterSettings = this._opts.filter;
        }

        this.emit('change-options', this._opts);
    }

    /**
     * @param {FilterSettings} filterSettings
     * @return {FilterSettings}
     */
    filter(filterSettings) {
        if (arguments.length) {
            this.setOptions({filter: filterSettings});
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
            if (typeof this._filterSettings === 'function') {
                result = result.filter(this._filterSettings);
            } else {
                result = deepCondition(result, this._filterSettings);
            }
        }

        return result;
    }

    /**
     * EVENT EMITTER EVENTS
     */

    /**
     * @protected
     * @param {string} type
     * @param {function} listener
     * @param {boolean} [once = false]
     */
    _addListenner(type, listener, once) {
        if (typeof listener !== 'function') {
            throw TypeError('listener must be a function');
        }

        if (this.events.indexOf(type) === -1) {
            this._listeners[type] = [{
                once: once,
                fn: listener
            }];
            this.events.push(type);
        } else {
            this._listeners[type].push({
                once: once,
                fn: listener
            });
        }
    }

    /**
     * Subscribes on event type specified function
     * @param {string} type
     * @param {function} listener
     */
    on(type, listener) {
        this._addListenner(type, listener, false);
    }

    /**
     * Subscribes on event type specified function to fire only once
     * @param {string} type
     * @param {function} listener
     */
    once(type, listener) {
        this._addListenner(type, listener, true);
    }

    /**
     * Removes event with specified type. If specified listenerFunc - deletes only one listener of specified type
     * @param {string} eventType
     * @param {function} [listenerFunc]
     */
    off(eventType, listenerFunc) {
        let typeIndex = this.events.indexOf(eventType);
        let hasType = eventType && typeIndex !== -1;

        if (hasType) {
            if (!listenerFunc) {
                delete this._listeners[eventType];
                this.events.splice(typeIndex, 1);
            } else {
                let removedEvents = [];
                let typeListeners = this._listeners[eventType];

                typeListeners.forEach(
                    /**
                     * @param {EventEmitterListenerFunc} fn
                     * @param {number} idx
                     */
                    function (fn, idx) {
                        if (fn.fn === listenerFunc) {
                            removedEvents.unshift(idx);
                        }
                    }
                );

                removedEvents.forEach(function (idx) {
                    typeListeners.splice(idx,1);
                });

                if (!typeListeners.length) {
                    this.events.splice(typeIndex, 1);
                    delete this._listeners[eventType];
                }
            }
        }
    }

    /**
     * Applies arguments to specified event type
     * @param {string} eventType
     * @param {*[]} eventArguments
     * @protected
     */
    _applyEvents(eventType, eventArguments) {
        let typeListeners = this._listeners[eventType];

        if (!typeListeners || !typeListeners.length) {
            if (this._strictMode) {
                throw 'No listeners specified for event: ' + eventType;
            } else {
                return;
            }
        }

        let removableListeners = [];
        typeListeners.forEach(function (eeListener, idx) {
            eeListener.fn.apply(null, eventArguments);
            if (eeListener.once) {
                removableListeners.unshift(idx);
            }
        });

        removableListeners.forEach(function (idx) {
            typeListeners.splice(idx, 1);
        });
    }

    /**
     * Emits event with specified type and params.
     * @param {string} type
     * @param eventArgs
     */
    emit(type, ...eventArgs) {
        if (this._emitDelay) {
            setTimeout(() => {
                    this._applyEvents(type, eventArgs)
                }, this._emitDelay
            );
        } else {
            this._applyEvents(type, eventArgs);
        }
    }

    /**
     * Emits event with specified type and params synchronously.
     * @param {string} type
     * @param eventArgs
     */
    emitSync(type, ...eventArgs) {
        this._applyEvents(type, eventArgs);
    }

    /**
     * Destroys EventEmitter
     */
    destroy() {
        this._listeners = {};
        this.events = [];
    }
}

module.exports = DataSource;