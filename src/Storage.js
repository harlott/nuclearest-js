import isString from 'lodash/isString'
import isObject from 'lodash/isObject'
import isFunction from 'lodash/isFunction'
import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'

export const STORAGE_TYPES = {
  'LOCAL_STORAGE': 'storage',
  'COOKIE': 'cookie'
}

/**
 * STORAGES_MAP is a simple interface for WebStorages
 * @type {Object}
 */
export const STORAGES_MAP = {
    storage: {
        setValue: (storage, propertyName, value) => {
            storage.setItem(propertyName, JSON.stringify(value))
        },
        getValue: (storage, propertyName) => {
            return storage.getItem(propertyName)
        },
        removeValue: (storage, propertyName) => {
            storage.removeItem(propertyName)
        }
    },
    cookie: {
        setValue: (storage, propertyName, propertyValue, cookieExpiringDate) => {
            storage.save(propertyName, propertyValue, {
                path: '/',
                expires: cookieExpiringDate
            });
        },
        getValue: (storage, propertyName, cookieExpiringDate) => {
            return storage.load(propertyName, {
                path: '/',
                expires: cookieExpiringDate
            });
        },
        removeValue: (storage, propertyName, cookieExpiringDate) => {
            storage.removeValue(propertyName, {
                path: '/',
                expires: cookieExpiringDate
            });
        }
    }
}

/**
 * Validate the shape of a custom storage object
 * @param  {string} storageType The type of storage; i.e: sessionStorage
 * @param  {Object} storage     The custom storage map: i.e: {setValue: () => {}, getValue: () => {}, removeValue: () => {}}
 * @return {Boolean}            return true if valid
 */
const checkCustomStorage = (storageType, storage) => {
    if (!isString(storageType)) {
        throw new Error('storageType parameter must be a string i.e: sessionStorage')
    }
    if (!isObject(storage)) {
        throw new Error('storage parameter must be a object i.e: {setValue: () => {}, getValue: () => {}, removeValue: () => {}}')
    } else {
        if (!isFunction(get(storage[storageType], 'setValue'))) {
            throw new Error('storage parameter must have a function setValue')
        }

        if (!isFunction(get(storage[storageType], 'getValue'))) {
            throw new Error('storage parameter must have a function getValue')
        }

        if (!isFunction(get(storage[storageType], 'removeValue'))) {
            throw new Error('storage parameter must have a function removeValue')
        }
    }
    return true
}
/**
 * Build a custom storage object
 * @param  {string} type          The type of storage; i.e: tvFileSystem
 * @param  {Function} setValue    The function to set value in the storage
 * @param  {Function} getValue    The function to get value in the storage
 * @param  {Function} removeValue The function to remove value in the storage
 * @return {Object}               The custom storage map
 */
export const buildCustomStorage = (type, setValue, getValue, removeValue) => {
  let _storage = {}
  _storage[type] = {
    setValue: setValue,
    getValue: getValue,
    removeValue: removeValue
  }
  checkCustomStorage(type, _storage)
  return _storage
}
/**
 * Build new Storages Map adding custom storages
 * @param  {string} storageType [description]
 * @param  {[type]} storage     [description]
 * @return {[type]}             [description]
 */
export const buildCustomStoragesMap = (storageType, storage) => {
    if (STORAGES_MAP[storageType] !== undefined){
      console.warn('storageType is already defined! Its value will be overwrited!')
    }
    checkCustomStorage(storageType, storage)
    let _storageMap = cloneDeep(STORAGES_MAP)
    let _storage = cloneDeep(storage)
    _storageMap[storageType] = _storage
    return _storageMap
}

class Storage {
    constructor(storageType, storage, storagesMap) {
        this.STORAGE_TYPE = storageType
        this.STORAGE = cloneDeep(storage)
        this.STORAGES_MAP = cloneDeep(storagesMap) || cloneDeep(STORAGES_MAP)
    }

    getCookieExp() {
        var now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
    }

    getType() {
        return this.STORAGE_TYPE
    }

    getMethod() {
        return this.STORAGE
    }

    setValue(propertyName, propertyValue) {
        this.STORAGES_MAP[this.STORAGE_TYPE].setValue(this.STORAGE, propertyName, propertyValue, this.getCookieExp())
    }

    getValue(propertyName) {
        return this.STORAGES_MAP[this.STORAGE_TYPE].getValue(this.STORAGE, propertyName, this.getCookieExp())
    }

    removeValue(propertyName) {
        this.STORAGES_MAP[this.STORAGE_TYPE].removeValue(this.STORAGE, propertyName, this.getCookieExp())
    }
}

export default Storage
