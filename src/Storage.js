import isString from 'lodash/isString'
import isObject from 'lodash/isObject'
import isFunction from 'lodash/isFunction'
import cloneDeep from 'lodash/cloneDeep'

export const STORAGES_MAP = {
	storage: {
		setValue: (method, propertyName, value) => {
			method.setItem(propertyName, JSON.stringify(value))
		},
		getValue: (method, propertyName) => {
			return method.getItem(propertyName)
		},
		removeValue: (method, propertyName) => {
			method.removeItem(propertyName)
		}
	},
	cookie: {
		setValue: (method, propertyName, propertyValue, cookieExpiringDate) => {
			method.save(propertyName, propertyValue, { path: '/', expires: cookieExpiringDate});
		},
		getValue: (method, propertyName, cookieExpiringDate) => {
			return method.load(propertyName, { path: '/', expires: cookieExpiringDate});
		},
		removeValue: (method, propertyName, cookieExpiringDate) => {
			method.removeValue(propertyName, { path: '/', expires: cookieExpiringDate});
		}
	}
}

const checkCustomStorageMap = (storageType, storage) => {
	if (!isString(storageType)){
		throw new Error('storageType parameter must be a string i.e: sessionStorage')
	}
	if (!isObject(storage)){
		throw new Error('storage parameter must be a object i.e: {setValue: () => {}, getValue: () => {}, removeValue: () => {}}')
	} else {
		if (!storage.setValue || !isFunction(storage.setValue)){
			throw new Error('storage parameter must have a function setValue')
		}

		if (!storage.getValue || !isFunction(storage.getValue)){
			throw new Error('storage parameter must have a function getValue')
		}

		if (!storage.removeValue || !isFunction(storage.removeValue)){
			throw new Error('storage parameter must have a function removeValue')
		}
	}
}

export const buildCustomStorageMap = (storageType, storage) => {
	checkCustomStorageMap(storageType, storage)
	let _storageMap = cloneDeep(STORAGES_MAP)
	let _storage = cloneDeep(storage)
	_storageMap[storageType] = _storage
	return _storageMap
}

class Storage{
	constructor(storageType, storage, storagesMap){
		this.STORAGE_TYPE = storageType
		this.STORAGE = cloneDeep(storage)
		this.STORAGES_MAP = cloneDeep(storagesMap) || cloneDeep(STORAGES_MAP)
	}

	getCookieExp(){
		var now = new Date();
		return new Date(now.getFullYear(), now.getMonth()+6, now.getDate());
	}

	getType(){
		return this.STORAGE_TYPE
	}

	getMethod(){
		return THIS.STORAGE
	}

  setValue(propertyName, propertyValue){
		this.STORAGES_MAP[this.STORAGE_TYPE].setValue(THIS.STORAGE, propertyName, propertyValue, this.getCookieExp())
	}

	getValue(propertyName){
		return this.STORAGES_MAP[this.STORAGE_TYPE].getValue(THIS.STORAGE, propertyName, this.getCookieExp())
	}

	removeValue(propertyName){
		this.STORAGES_MAP[this.STORAGE_TYPE].removeValue(THIS.STORAGE, propertyName, this.getCookieExp())
	}
}

export default Storage
