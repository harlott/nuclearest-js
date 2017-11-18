import has from 'lodash/has'
import isEmpty from 'lodash/isEmpty'
import clone from 'lodash/clone'
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
			setValue: (method, propertyName, value, cookieExpiringDate) => {
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

const checkNewStorageMap = (storageType, storageMethod) => {
	if (!isString(storageType)){
		return throw new Error('storageType parameter must be a string i.e: sessionStorage')
	}
	if (!isObject(storageMethod)){
		return throw new Error('storageMethod parameter must be a object i.e: {setValue: () => {}, getValue: () => {}, removeValue: () => {}}')
	} else {
		if (!storageMethod.setValue || !isFunction(storageMethod.setValue)){
			return throw new Error('storageMethod parameter must have a function setValue')
		}

		if (!storageMethod.getValue || !isFunction(storageMethod.getValue)){
			return throw new Error('storageMethod parameter must have a function getValue')
		}

		if (!storageMethod.removeValue || !isFunction(storageMethod.removeValue)){
			return throw new Error('storageMethod parameter must have a function removeValue')
		}
	}
}

export const buildNewStorageMap(storageType, storageMethod){
	checkNewStorage(storageType, storageMethod)
	let _storageMap = cloneDeep(STORAGES_MAP)
	let _storageMapMethod = cloneDeep(storageMethod)
	_storageMap[_storagetype] = _storageMapMethod
	return _storageMap
}

class Storage{
	constructor(storageType, storageMethod, storagesMap){
		this.STORAGE_TYPE = sessionType
		this.STORAGE_METHOD = sessionMethod
		this.STORAGES_MAP = storagesMap || STORAGES_MAP
	}

	getCookieExp(){
		var now = new Date();
		return new Date(now.getFullYear(), now.getMonth()+6, now.getDate());
	}

	getType(){
		return this.STORAGE_TYPE
	}

	getMethod(){
		return this.STORAGE_METHOD
	}

  setValue(propertyName, propertyValue){
		this.STORAGES_MAP[this.STORAGE_TYPE].setValue(this.STORAGE_METHOD, propertyName, propertyValue, this.getCookieExp())
	}

	getValue(propertyName){
		return this.STORAGES_MAP[this.STORAGE_TYPE].getValue(this.STORAGE_METHOD, propertyName, this.getCookieExp())
	}

	removeValue(propertyName){
		this.STORAGES_MAP[this.STORAGE_TYPE].removeValue(this.STORAGE_METHOD, propertyName, this.getCookieExp())
	}
}

export default Storage
