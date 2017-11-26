import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'
import get from 'lodash/get'

const STORAGE_TYPES = {
  'STORAGE': 'storage',
  'COOKIE': 'cookie'
}

/**
 * This method check if storage is disabled and catch the exception.
 * Useful for safari private browsing or browser storage disabled.
 * Check custom storage implementation too.
 *
 * @param  {string} storageType             The type of storage; i.e: STORAGE_TYPES.STORAGE or 'tvFileSystem'
 * @param  {object} storage                 The storage you want to use i.e window.cookie or window.localStorage
 * @param  {STORAGES_MAP} customStoragesMap The custom storages map
 * @return {boolean}                        return true if storage is enabled or custom storage is correctly implemented
 */

export const canUseStorage = (storageType, storage, customStoragesMap) => {
    let key = 'test'
    try {
        let _storage = customStoragesMap[storageType] || STORAGES_MAP[storageType]
        _storage.setItem(key, '1', storage);
        _storage.getItem(key, storage);
        _storage.removeItem(key, storage);
        return true
    } catch (error) {
        return false;
    }
}

/**
 * The storages map that implements the WebStorage
 * @type {Object}
 */
export const STORAGES_MAP = {
    storage: {
        setItem: (propertyName, value, storage) => {
            storage.setItem(propertyName, JSON.stringify(value))
        },
        getItem: (propertyName, storage) => {
            return storage.getItem(propertyName)
        },
        removeItem: (propertyName, storage) => {
            storage.removeItem(propertyName)
        }
    },
    cookie: {
        setItem: (propertyName, value, cookieExpiringDate, storage) => {
            storage.save(propertyName, value, {
                path: '/',
                expires: cookieExpiringDate
            });
        },
        getItem: (propertyName, cookieExpiringDate, storage) => {
            return storage.load(propertyName, {
                path: '/',
                expires: cookieExpiringDate
            });
        },
        removeItem: (propertyName, cookieExpiringDate, storage) => {
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
 * @param  {Function} setItem    The function to set value in the storage
 * @param  {Function} getItem    The function to get value in the storage
 * @param  {Function} removeItem The function to remove value in the storage
 * @return {Object}               The custom storage map
 */
export const buildCustomStorage = (type, setItem, getItem, removeItem) => {
  let _storage = {}
  _storage[type] = {
    setItem: setItem,
    getItem: getItem,
    removeItem: removeItem
  }
  return _storage
}

/**
 * Build new Storages Map adding custom storages
 * @param  {string} storageType The type of storage; i.e: 'tvFileSystem'
 * @param  {Object} storage     The new storage object
 * @return {Object}             The new storages map
 */
export const buildCustomStoragesMap = (storageType, storage) => {
    let _storageMap = cloneDeep(STORAGES_MAP)
    let _storage = cloneDeep(storage)
    merge(_storageMap, _storage)
    return _storageMap
}

let __storage__fallback__ = {}
const _fallbackStorageType = 'fallbackStorage'
const _defaultFallbackStorage = buildCustomStorage(_fallbackStorageType, (p,v) => {__storage__fallback__[p] = v}, (p) => {return __storage__fallback__[p]}, (p) => {delete __storage__fallback__[p]})
const _defaultFallbackStoragesMap = buildCustomStoragesMap(_fallbackStorageType, _defaultFallbackStorage)

/**
 * This is a simple interface for WebStorages.
 * If the selected storage is disabled, Storage provides a default fallback.
 * @type {Storage}
 */

class Storage {
    /**
     * Create a Storage instance
     * @param  {string} storageType           The type of storage; i.e: 'tvFileSystem'
     * @param  {Object} storage               The storage to use; i.e: window.cookie
     * @param  {Object} storagesMap           The custom storage map to use
     * @param  {[type]} customFallbackStorage [description]
     */
    constructor(storageType, storage, storagesMap, customFallbackStorage) {
        this.STORAGE_TYPE = storageType
        this.STORAGE = cloneDeep(get(storagesMap, storageType)) || cloneDeep(storage)
        this.STORAGES_MAP = cloneDeep(storagesMap) || cloneDeep(STORAGES_MAP)
    }
    /**
     * [getTypesMap description]
     * @return {[type]} [description]
     */
    static getTypesMap(){
      return STORAGE_TYPES
    }
    /**
     * [getCookieExp description]
     * @return {[type]} [description]
     */
    getCookieExp() {
        var now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
    }
    /**
     * [getType description]
     * @return {[type]} [description]
     */
    getType() {
        return this.STORAGE_TYPE
    }
    /**
     * [getMethod description]
     * @return {[type]} [description]
     */
    getMethod() {
        return this.STORAGE
    }
    /**
     * [setItem description]
     * @param {[type]} propertyName  [description]
     * @param {[type]} propertyValue [description]
     * @param {[type]} cookieExpDate [description]
     */
    setItem(propertyName, propertyValue, cookieExpDate) {
        if (canUseStorage(this.STORAGE_TYPE, this.STORAGE, this.STORAGES_MAP) === true){
            this.STORAGES_MAP[this.STORAGE_TYPE].setItem(propertyName, propertyValue, cookieExpDate || this.getCookieExp(), this.STORAGE)
        } else {
            _defaultFallbackStoragesMap[_fallbackStorageType].setItem(propertyName, propertyValue, cookieExpDate || this.getCookieExp(), this.STORAGE)
        }
    }
    /**
     * [getItem description]
     * @param  {[type]} propertyName  [description]
     * @param  {[type]} cookieExpDate [description]
     * @return {[type]}               [description]
     */
    getItem(propertyName, cookieExpDate) {
      if (canUseStorage(this.STORAGE_TYPE, this.STORAGE, this.STORAGES_MAP) === true){
        return this.STORAGES_MAP[this.STORAGE_TYPE].getItem(propertyName, cookieExpDate || this.getCookieExp(), this.STORAGE)
      } else {
        return _defaultFallbackStoragesMap[_fallbackStorageType].getItem(propertyName, cookieExpDate || this.getCookieExp(), this.STORAGE)
      }
    }

    /**
     * [removeItem description]
     * @param  {[type]} propertyName  [description]
     * @param  {[type]} cookieExpDate [description]
     * @return {[type]}               [description]
     */
    removeItem(propertyName, cookieExpDate) {
      if (canUseStorage(this.STORAGE_TYPE, this.STORAGE, this.STORAGES_MAP) === true){
        this.STORAGES_MAP[this.STORAGE_TYPE].removeItem(propertyName, cookieExpDate || this.getCookieExp(), this.STORAGE)
      } else {
        _defaultFallbackStoragesMap[_fallbackStorageType].removeItem(propertyName, cookieExpDate || this.getCookieExp(), this.STORAGE)
      }
    }
}

export default Storage
