import Emitter from '../services/Emitter'
import { cloneDeep, isFunction, get } from 'lodash'

let __GLOBAL__REFRESH_TOKEN_OBJECT
let __GLOBAL__IS_REFRESHING_TOKEN
let _applicationParams = null

const eventEmitter = new Emitter()

class Auth{
  constructor(refreshTokenApiCall, confirmAuthenticationCallback, resetAuthenticationCallback, options={beforeRefreshTokenCallback: () => {}, debug: false}){

    if (isFunction(refreshTokenApiCall) === false){
      throw new Error('refreshTokenMethod parameter is required!')
    }
    this._refreshTokenApiCall = refreshTokenApiCall
    this._confirmAuthenticationCallback = confirmAuthenticationCallback
    this._resetAuthenticationCallback = resetAuthenticationCallback
    this._options = options
  }

  logger(output){
    if (get(this._options, 'debug', false) === true){
      console.log(output)
    }
  }

  async _refreshTokenMethod(){
    return await this._refreshTokenApiCall()
  }

  _authFailed(reason) {
    __GLOBAL__IS_REFRESHING_TOKEN = false
    this._resetAuthenticationCallback()
    return new Promise((resolve, reject) => {
        reject(reason)
    })
  }

  async _confirmRefreshToken(response, apiCallMethod){
    this.logger('INSIDE CONFIRM REFRESH TOKEN')
    this.logger(`CONFIRM REFRESH TOKEN => response is ${response}`)
    const jsonResult = response.json !== undefined ? await response.json() : undefined
    __GLOBAL__REFRESH_TOKEN_OBJECT = {}
    __GLOBAL__REFRESH_TOKEN_OBJECT.tokenObject = cloneDeep(json)
    __GLOBAL__IS_REFRESHING_TOKEN = false
    eventEmitter.emitGeneric('REFRESH_TOKEN')
    this._confirmAuthenticationCallback(jsonResult)
    return apiCallMethod()
  }

  async _refreshTokenProcess(apiCallMethod, promiseCallback, authData) {
      this.logger('IN REFRESH TOKEN PROCESS')
      if (get(authData, 'tokenObject.accessToken') === undefined && get(authData, 'tokenObject.refreshToken') === undefined) {
        return this._authFailed({
          code: 'TOKEN_OBJECT_NOT_DEFINED',
          message: 'tokenObject is undefined'
        })
      }
      this.logger('CALL REFRESH TOKEN METHOD')
      if (isFunction(this._options.beforeRefreshTokenCallback)){
        this._options.beforeRefreshTokenCallback()
      }
      const refreshTokenProcessed = this._refreshTokenMethod()
      this.logger(`REFRESH TOKEN PROMISE SOLVED: response.status is ${refreshTokenProcessed.status}`)
      this.logger(JSON.stringify(refreshTokenProcessed))
      if (refreshTokenProcessed.ok === false){
        this.logger('REFRESH TOKEN FAILS')
        return this._authFailed(refreshTokenProcessed)
      }
      this.logger('CONFIRM REFRESH TOKEN')
      return this._confirmRefreshToken(refreshTokenProcessed, apiCallMethod)
  }

  _checkAuth(json, statusCode, authData, eventCallback){
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

  async _proxyApi(authData, apiMethod, eventCallback){
    let _authData = __GLOBAL__REFRESH_TOKEN_OBJECT || authData
    this.logger(`_proxyApi => appParams = ${JSON.stringify(_authData)}`)
    let resApiMethod = undefined

    try{
        resApiMethod = await apiMethod(_authData)
        this.logger(`resApiMethod = ${JSON.stringify(resApiMethod)}`)
    } catch(err) {
      this.logger(`_proxyApi ERROR = ${JSON.stringify(err)}`)
      this.logger('CHECK AUTH')
      return this._checkAuth(response.json, response.status, _authData, eventCallback)

    }

    return new Promise((resolve, reject) => {

      if (get(resApiMethod, 'ok') === true){
        resolve(resApiMethod)
      } else {
        reject(resApiMethod)
      }
      console.log(`resApiMethod = ${JSON.stringify(resApiMethod)}`)
    })
  }

  async proxy(authData, apiMethod){
    __GLOBAL__REFRESH_TOKEN_OBJECT = undefined
    const eventCallback = () => {
        let _authData = cloneDeep(__GLOBAL__REFRESH_TOKEN_OBJECT) || cloneDeep(authData)
        return this._proxyApi(_authData, apiMethod, eventCallback)
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
