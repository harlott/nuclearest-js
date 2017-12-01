import { cloneDeep, merge, get, includes } from 'lodash'

export const STORAGE_TYPES = {
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
            console.log('a' + propertyName)
            storage.setItem(propertyName, JSON.stringify(value))
        },
        getItem: (propertyName, storage) => {
          console.log('a' + propertyName)
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
     * @param  {Object} fallbackStorage       The fallback configuration options: i.e {'enabled': true, 'grantedProps':["selectedLanguage"], 'callbackOnDisabled': () => {alert('STORAGE DISABLED')}}.
     *                                        Warning: if 'grantedProps' is undefined, you can't use fallback storage. Don't use authentication or other user props.
     *                                        Fallback storage is intended only for static configurations like 'country', 'lang', 'hasAcceptedCookie'...
     */
    constructor(storageType, storage, storagesMap, fallbackStorage) {
        this.STORAGE_TYPE = storageType
        this.STORAGE = cloneDeep(get(storagesMap, storageType)) || cloneDeep(storage)
        this.STORAGES_MAP = cloneDeep(storagesMap) || cloneDeep(STORAGES_MAP)
        this.CUSTOM_FALLBACK_STORAGE = cloneDeep(fallbackStorage)
    }
    /**
     * This method return the storagesType to use on instanciating Storage
     * @return {Map} the storagesType map
     */
    static getTypesMap(){
      return STORAGE_TYPES
    }
    /**
     * This method return the default cookieExpiringDate
     * @return {date} default cookieExpiringDate
     */
    getCookieExp() {
        var now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
    }
    /**
    * This method return the storageType selected
    * @return {string} the storageType selected
     */
    getType() {
        return this.STORAGE_TYPE
    }
    /**
     * This method return the storage method selected; i.e: window.cookie
     * @return {Object} the storage method selected
     */
    getMethod() {
        return this.STORAGE
    }

    use(methodName, params){
      if (canUseStorage(this.STORAGE_TYPE, this.STORAGE, this.STORAGES_MAP) === true){
          return this.STORAGES_MAP[this.STORAGE_TYPE][methodName](...params)
      } else {
        if (this.CUSTOM_FALLBACK_STORAGE.enabled === false) {
          return
        }
          if (!includes(get(this.CUSTOM_FALLBACK_STORAGE, 'grantedProps'), params[0])){
            let callbackOnDisabled = get(this.CUSTOM_FALLBACK_STORAGE, 'callbackOnDisabled')
            if (callbackOnDisabled !== undefined){
              callbackOnDisabled()
            }
            throw new Error(`Cannot use property "'+${params[0]}+'" in fallback storage. You can use fallbackStorage "grantedProps" option to grant`)
          }
          return _defaultFallbackStoragesMap[_fallbackStorageType][methodName](...params, this.STORAGE)
      }
    }

    /**
     * This method set the storage item
     * @param {string} propertyName   the item name to set
     * @param {*} propertyValue       the item value
     * @param {date} [cookieExpDate]  the cookie expiring date if you want to use cookie
     */
    setItem(propertyName, propertyValue, cookieExpDate) {
        arguments[2] = cookieExpDate || this.getCookieExp()
        this.use('setItem', arguments)
    }
    /**
     * This method return the item value for item name
     * @param  {string} propertyName  the item name
     * @param  {date} [cookieExpDate] the cookie expiring date if you want to use cookie
     * @return {*}                    the item value
     */
    getItem(propertyName, cookieExpDate) {
      arguments[1] = cookieExpDate || this.getCookieExp()
      return this.use('getItem', arguments)
    }

    /**
     * This method delete the item for item name
     * @param  {string} propertyName  the item name
     * @param  {date} [cookieExpDate] the cookie expiring date if you want to use cookie
     */
    removeItem(propertyName, cookieExpDate) {
      arguments[1] = cookieExpDate || this.getCookieExp()
      this.use('removeItem', arguments)
    }
}

export default Storage
