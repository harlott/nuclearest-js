import Emitter from '../services/Emitter'
import { cloneDeep, isFunction, get } from 'lodash'

let __GLOBAL__REFRESH_TOKEN_OBJECT
let __GLOBAL__IS_REFRESHING_TOKEN
let _applicationParams = null

const eventEmitter = new Emitter()

class Auth{
  constructor(refreshTokenMethod, confirmAuthenticationCallback, resetAuthenticationCallback, options={beforeRefreshTokenCallback: () => {}, debug: false}){

    if (isFunction(refreshTokenMethod) === false){
      throw new Error('refreshTokenMethod parameter is required!')
    }
    this._refreshTokenMethod = refreshTokenMethod
    this._confirmAuthenticationCallback = confirmAuthenticationCallback
    this._resetAuthenticationCallback = resetAuthenticationCallback
    this._options = options
  }

  logger(output){
    if (get(this._options, 'debug', false) === true){
      console.log(output)
    }
  }

  _authFailed(applicationParams) {
    __GLOBAL__IS_REFRESHING_TOKEN = false
    this._resetAuthenticationCallback()
  }

  _confirmRefreshToken(response, apiCallMethod){
    this.logger('INSIDE CONFIRM REFRESH TOKEN')
    response.json().then((json) => {
      __GLOBAL__REFRESH_TOKEN_OBJECT = {}
      __GLOBAL__REFRESH_TOKEN_OBJECT.tokenObject = cloneDeep(json)
      __GLOBAL__IS_REFRESHING_TOKEN = false
      eventEmitter.emitGeneric('REFRESH_TOKEN')
      apiCallMethod()

      this._confirmAuthenticationCallback(json)
    })
  }

  _refreshTokenProcess(apiCallMethod, promiseCallback, authData) {
      this.logger('IN REFRESH TOKEN PROCESS')
      if (authData.tokenObject === undefined) {
        return this._authFailed()
      }
      this.logger('CALL REFRESH TOKEN METHOD')
      if (isFunction(this._options.beforeRefreshTokenCallback)){
        this._options.beforeRefreshTokenCallback()
      }
      this._refreshTokenMethod()
      .then((response) => {
        this.logger(`REFRESH TOKEN PROMISE SOLVED: response.status is ${response.status}`)
        if (response.ok === false) {
          this.logger('REFRESH TOKEN FAILS')
          return this._authFailed()
        }
        this.logger('CONFIRM REFRESH TOKEN')
        this._confirmRefreshToken(response, apiCallMethod)
      })
      .catch(
        (err) => {
          this.logger(err)
          this.logger('ERROR IN REFRESH TOKEN')
          return this._authFailed({authData: authData})
        }
      ).then(()=>{
        this.logger('REFRESH TOKEN DONE')
      });
  }

  _checkAuth(json, statusCode, authData, eventCallback, errorCallback, apiCallback){
    if (statusCode === 401) {
      let _authData = cloneDeep(__GLOBAL__REFRESH_TOKEN_OBJECT) || cloneDeep(authData)
      this.logger(`CHECK AUTH => params = ${_authData}`)
      if (__GLOBAL__IS_REFRESHING_TOKEN === true) {
          return eventEmitter.on('REFRESH_TOKEN', eventCallback)
      }
      __GLOBAL__IS_REFRESHING_TOKEN = true
      this.logger('PROCESSING REFRESH TOKEN')
      return this._refreshTokenProcess(eventCallback, apiCallback, _authData)
    } else {
      return errorCallback(json, statusCode)
    }
  }

  _proxyApi(authData, apiCallback, apiMethod, eventCallback){
    let _authData = __GLOBAL__REFRESH_TOKEN_OBJECT || authData
    this.logger(`_proxyApi => appParams = ${JSON.stringify(_authData)}`)
    const executeApiMethod =  (nextAuthData) => {
        this.logger('EXECUTE API METHOD')
        return apiMethod(nextAuthData)
    }

    return executeApiMethod(_authData).then(
        response => {
            eventEmitter.removeListener('REFRESH_TOKEN', eventCallback)
            return apiCallback(response)
        }
    ).catch((err) => {
      this.logger(` CATCHING API METHOD WITH ERROR ${JSON.stringify(err)}`)
      return apiCallback(err)
    });
  }

  proxy(authData, apiMethod, successCallback, errorCallback){
    __GLOBAL__REFRESH_TOKEN_OBJECT = undefined
    const eventCallback = () => {
        let _authData = cloneDeep(__GLOBAL__REFRESH_TOKEN_OBJECT) || cloneDeep(authData)
        return this._proxyApi(_authData, apiCallback, apiMethod, eventCallback)
    }

    const apiCallback = (response, notApiResponse) => {
        this.logger('INSIDE API CALLBACK')
        let _authData = cloneDeep(__GLOBAL__REFRESH_TOKEN_OBJECT) || cloneDeep(authData)
        if (response !== undefined) {
            if (response.status === 204) {
                successCallback({})
            }
            else {
              if (response.ok === true) {
                  successCallback(response.json, response)
              }
              else {
                this.logger('CHECK AUTH')
                  return this._checkAuth(response.json, response.status, _authData, eventCallback, errorCallback, apiCallback)
              }
            }
        } else if (notApiResponse !== undefined) {
            errorCallback(notApiResponse.json, notApiResponse.statusCode)
        } else {
            return null
        }
    }

    this.logger(`APPLICATION PARAMS IN PROXY = ${JSON.stringify(authData)}`)
    if (__GLOBAL__IS_REFRESHING_TOKEN === true){
        this.logger(`in __GLOBAL__IS_REFRESHING_TOKEN => ${__GLOBAL__IS_REFRESHING_TOKEN}`)
        eventEmitter.on('REFRESH_TOKEN', eventCallback)
    } else {
        this.logger(`not in __GLOBAL__IS_REFRESHING_TOKEN => ${__GLOBAL__IS_REFRESHING_TOKEN}`)
        this.logger('CALLING _proxyApi')
        return eventCallback()
    }
  }
}

export default Auth
