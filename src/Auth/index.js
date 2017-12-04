import Emitter from '../services/Emitter'
import cloneDeep from 'lodash/cloneDeep'
import isFunction from 'lodash/isFunction'

let __GLOBAL__REFRESH_TOKEN_OBJECT
let __GLOBAL__IS_REFRESHING_TOKEN
let _applicationParams = null

const eventEmitter = new Emitter()

class Auth{
  constructor(refreshTokenMethod, confirmAuthenticationCallback, resetAuthenticationCallback, options={}){
    if (isFunction(refreshTokenMethod) === false){
      throw new Error('refreshTokenMethod parameter is required!')
    }
    this._refreshTokenMethod = refreshTokenMethod
    this._confirmAuthenticationCallback = confirmAuthenticationCallback
    this._resetAuthenticationCallback = resetAuthenticationCallback
    this._options = options
  }

  _redirectWithNoAuth(applicationParams){
    if (applicationParams.authData.tokenObject === undefined && (isFunction(applicationParams.clientData.redirectWithNoAuthCallback) === true)) {
        return applicationParams.clientData.redirectWithNoAuthCallback()
    }
  }

  _authFailed() {
    this._resetAuthenticationCallback()

    if (isFunction(this._redirectWithNoAuth) === true){
      this._redirectWithNoAuth()
    }
  }

  _confirmRefreshToken(refreshTokenObject, apiCallMethod, clientData, xhrOptions, authData){
    __GLOBAL__REFRESH_TOKEN_OBJECT = {}
    __GLOBAL__REFRESH_TOKEN_OBJECT.clientData = clientData
    __GLOBAL__REFRESH_TOKEN_OBJECT.xhrOptions = xhrOptions
    __GLOBAL__REFRESH_TOKEN_OBJECT.authData = authData
    __GLOBAL__REFRESH_TOKEN_OBJECT.authData.tokenObject = cloneDeep(refreshTokenObject)
    __GLOBAL__IS_REFRESHING_TOKEN = false
    eventEmitter.emitGeneric('REFRESH_TOKEN')
    apiCallMethod()

    this._confirmAuthenticationCallback(refreshTokenObject)
  }

  _refreshTokenProcess(apiCallMethod, promiseCallback, clientData, xhrOptions, authData) {
      if (authData.tokenObject === undefined) {
        return this._authFailed()
      }
      this._refreshTokenMethod()
      .then((response) => {
        if (response.ok === false) {
          return this._authFailed()
        }
        this._confirmRefreshToken(response.json, apiCallMethod, clientData, xhrOptions, authData)
      })
      .catch(
        () => {
          return this._authFailed()
        }
      );
  }

  _checkAuth(json, statusCode, applicationParams, eventCallback, errorCallback, apiCallback){
    if (statusCode === 401) {
      return errorCallback(json, statusCode)
    }

    _applicationParams = cloneDeep(__GLOBAL__REFRESH_TOKEN_OBJECT) || cloneDeep(applicationParams)
    if (__GLOBAL__IS_REFRESHING_TOKEN === true) {
        return eventEmitter.on('REFRESH_TOKEN', eventCallback)
    }
    __GLOBAL__IS_REFRESHING_TOKEN = true
    this._refreshTokenProcess(this._proxyApi.bind(this, _applicationParams), apiCallback, _applicationParams.clientData, _applicationParams.xhrOptions, _applicationParams.authData)
  }

  _proxyApi(applicationParams, apiCallback, apiMethod, eventCallback){
    let appParams = __GLOBAL__REFRESH_TOKEN_OBJECT || applicationParams
    const executeApiMethod =  (authData) => {
        return apiMethod(authData)
    }

    return executeApiMethod(appParams.authData).then(
        response => {
            eventEmitter.removeListener('REFRESH_TOKEN', eventCallback)
            return apiCallback(response)
        }
    ).catch(() => {
      return
    });
  }

  proxy(applicationParams, apiMethod, successCallback, errorCallback){
    this._redirectWithNoAuth(applicationParams)

    const eventCallback = () => {
        let newAppParams = cloneDeep(__GLOBAL__REFRESH_TOKEN_OBJECT) || cloneDeep(applicationParams)
        this._proxyApi(newAppParams, apiCallback, apiMethod, eventCallback)()
    }

    const apiCallback = (response, notApiResponse) => {
        let newAppParams = cloneDeep(__GLOBAL__REFRESH_TOKEN_OBJECT) || cloneDeep(applicationParams)
        if (response !== undefined) {
            if (response.status === 204) {
                successCallback({})
            }
            else {
              if (response.ok === true) {
                  successCallback(response.json, response)
              }
              else {
                  this._checkAuth(response.json, response.status, newAppParams, eventCallback, errorCallback, apiCallback)
              }
            }
        } else if (notApiResponse !== undefined) {
            errorCallback(notApiResponse.json, notApiResponse.statusCode)
        } else {
            return null
        }
    }


    let newAppParams = cloneDeep(__GLOBAL__REFRESH_TOKEN_OBJECT) || cloneDeep(applicationParams)

    if (__GLOBAL__IS_REFRESHING_TOKEN === true){
        eventEmitter.on('REFRESH_TOKEN', eventCallback)
    } else {
        this._proxyApi.bind(this, newAppParams, apiCallback, apiMethod, eventCallback)()
    }
  }
}

export default Auth
