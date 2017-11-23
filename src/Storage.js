import isString from 'lodash/isString'
import isObject from 'lodash/isObject'
import isFunction from 'lodash/isFunction'
import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'
import merge from 'lodash/merge'

export const STORAGE_TYPES = {
  'LOCAL_STORAGE': 'storage',
  'COOKIE': 'cookie'
}

/**
 * The storages map that implements the WebStorage
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
  return _storage
}

/**
 * Build new Storages Map adding custom storages
 * @param  {string} storageType The type of storage; i.e: tvFileSystem
 * @param  {Object} storage     The new storage object
 * @return {Object}             The new storages map
 */
export const buildCustomStoragesMap = (storageType, storage) => {
    if (STORAGES_MAP[storageType] !== undefined){
      console.warn('storageType is already defined! Its value will be overwrited!')
    }
    let _storageMap = cloneDeep(STORAGES_MAP)
    let _storage = cloneDeep(storage)
    merge(_storageMap, _storage)
    return _storageMap
}
/**
 * This is a simple interface for WebStorages
 * @type {[type]}
 */
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

    setValue(propertyName, propertyValue, cookieExpDate) {
        this.STORAGES_MAP[this.STORAGE_TYPE].setValue(this.STORAGE, propertyName, propertyValue, cookieExpDate || this.getCookieExp())
    }

    getValue(propertyName, cookieExpDate) {
        return this.STORAGES_MAP[this.STORAGE_TYPE].getValue(this.STORAGE, propertyName, cookieExpDate || this.getCookieExp())
    }

    removeValue(propertyName, cookieExpDate) {
        this.STORAGES_MAP[this.STORAGE_TYPE].removeValue(this.STORAGE, propertyName, cookieExpDate || this.getCookieExp())
    }
}

export default Storage
