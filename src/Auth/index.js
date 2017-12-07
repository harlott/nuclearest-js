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

  _checkAccessToken(applicationParams){
    if (applicationParams.authData.tokenObject === undefined && (isFunction(applicationParams.clientData.redirectWithNoAuthCallback) === true)) {
        return applicationParams.clientData.redirectWithNoAuthCallback()
    }
  }

  _redirectWithNoAuth(applicationParams){
    if (isFunction(applicationParams.clientData.redirectWithNoAuthCallback) === true) {
        return applicationParams.clientData.redirectWithNoAuthCallback()
    }
  }

  _authFailed(applicationParams) {
    this._resetAuthenticationCallback()
  }

  _confirmRefreshToken(refreshTokenObject, apiCallMethod, clientData, xhrOptions, authData){
    console.log('INSIDE CONFIRM REFRESH TOKEN')
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
      console.log('IN REFRESH TOKEN PROCESS')
      if (authData.tokenObject === undefined) {
        return this._authFailed()
      }
      console.log('CALL REFRESH TOKEN METHOD')
      this._refreshTokenMethod()
      .then((response) => {
        console.log(`REFRESH TOKEN PROMISE SOLVED: response.status is ${response.status}`)
        if (response.ok === false) {
          console.log('REFRESH TOKEN FAILS')
          return this._authFailed()
        }
        console.log('CONFIRM REFRESH TOKEN')
        this._confirmRefreshToken(response.json, apiCallMethod, clientData, xhrOptions, authData)
      })
      .catch(
        (err) => {
          console.log(err)
          //console.log('ERROR IN REFRESH TOKEN')
          //return this._authFailed({authData: authData})
        }
      );
  }

  _checkAuth(json, statusCode, applicationParams, eventCallback, errorCallback, apiCallback){
    if (statusCode === 401) {

      _applicationParams = cloneDeep(__GLOBAL__REFRESH_TOKEN_OBJECT) || cloneDeep(applicationParams)
      console.log(`CHECK AUTH => params = ${_applicationParams}`)
      if (__GLOBAL__IS_REFRESHING_TOKEN === true) {
          return eventEmitter.on('REFRESH_TOKEN', eventCallback)
      }
      __GLOBAL__IS_REFRESHING_TOKEN = true
      console.log('PROCESSING REFRESH TOKEN')
      return this._refreshTokenProcess(this._proxyApi.bind(this, _applicationParams), apiCallback, _applicationParams.clientData, _applicationParams.xhrOptions, _applicationParams.authData)
    } else {
      return errorCallback(json, statusCode)
    }


  }

  _proxyApi(applicationParams, apiCallback, apiMethod, eventCallback){
    let appParams = __GLOBAL__REFRESH_TOKEN_OBJECT || applicationParams
    console.log(`_proxyApi => appParams = ${JSON.stringify(appParams)}`)
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
    this._redirectWithAuthenticationFailed = false
    this._checkAccessToken(applicationParams)

    const eventCallback = () => {
        let newAppParams = cloneDeep(__GLOBAL__REFRESH_TOKEN_OBJECT) || cloneDeep(applicationParams)
        this._proxyApi(newAppParams, apiCallback, apiMethod, eventCallback)()
    }

    const apiCallback = (response, notApiResponse) => {
        console.log('INSIDE API CALLBACK')
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
                console.log('CHECK AUTH')
                  return this._checkAuth(response.json, response.status, newAppParams, eventCallback, errorCallback, apiCallback)
              }
            }
        } else if (notApiResponse !== undefined) {
            errorCallback(notApiResponse.json, notApiResponse.statusCode)
        } else {
            return null
        }
    }


    let newAppParams = cloneDeep(__GLOBAL__REFRESH_TOKEN_OBJECT) || cloneDeep(applicationParams)
    console.log(`APPLICATION PARAMS IN PROXY = ${JSON.stringify(newAppParams)}`)
    if (__GLOBAL__IS_REFRESHING_TOKEN === true){
        eventEmitter.on('REFRESH_TOKEN', eventCallback)
    } else {
        console.log('CALLING _proxyApi')
        this._proxyApi(newAppParams, apiCallback, apiMethod, eventCallback)
    }
  }
}

export default Auth
