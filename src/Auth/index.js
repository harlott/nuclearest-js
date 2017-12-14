import Emitter from '../services/Emitter'
import { cloneDeep, isFunction, get } from 'lodash'

let __GLOBAL__REFRESH_TOKEN_OBJECT
let __GLOBAL__IS_REFRESHING_TOKEN

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

  initGlobals(){
    __GLOBAL__IS_REFRESHING_TOKEN = false
    __GLOBAL__REFRESH_TOKEN_OBJECT = undefined
  }

  logger(output){
    if (get(this._options, 'debug', false) === true){
      console.log(output)
    }
  }

  _refreshTokenMethod(){
    return this._refreshTokenApiCall()
  }

  _authFailed(reason) {
    __GLOBAL__IS_REFRESHING_TOKEN = false
    this._resetAuthenticationCallback()
    return Promise.reject(reason)
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

  async _refreshTokenProcess(apiCallMethod, authData) {
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
      let refreshTokenProcessed
      try {
        refreshTokenProcessed = await this._refreshTokenMethod()
        this.logger('CONFIRM REFRESH TOKEN ${refreshTokenProcessed}')
        return Promise.resolve(this._confirmRefreshToken(refreshTokenProcessed, apiCallMethod))
      } catch(err){
        this.logger(`CATCH REFRESH TOKEN ${JSON.stringify(err)}` )
        if (err.status === 401){
          this.logger('REFRESH TOKEN FAILS ')
          this._authFailed(refreshTokenProcessed)
        }
        return Promise.reject(err)
      }
  }

  async _checkAuth(response, authData, eventCallback){
    this.logger(`CHECK AUTH RESPONSE => ${JSON.stringify(response)}`)
    if (response.status === 401) {
      let _authData = cloneDeep(__GLOBAL__REFRESH_TOKEN_OBJECT) || cloneDeep(authData)
      this.logger(`CHECK AUTH => params = ${JSON.stringify(_authData)}`)
      if (__GLOBAL__IS_REFRESHING_TOKEN === true) {
          eventEmitter.on('REFRESH_TOKEN', eventCallback)
          return Promise.resolve({status: 'REFRESHING'})
      }
      __GLOBAL__IS_REFRESHING_TOKEN = true
      this.logger('PROCESSING REFRESH TOKEN')
      let _refreshTokenProcessed
      try {
        _refreshTokenProcessed = await this._refreshTokenProcess(eventCallback, _authData)
        return Promise.resolve(_refreshTokenProcessed)
      } catch(err){
        console.log(`_checkAut: REFRESH TOKEN ERROR => ${JSON.stringify(err)}`)
        return Promise.reject(err)
      }
    }

    return Promise.resolve(response)
  }

  async _proxyApi(authData, apiMethod, eventCallback){
    let _authData = __GLOBAL__REFRESH_TOKEN_OBJECT || authData
    this.logger(`_proxyApi => appParams = ${JSON.stringify(_authData)}`)
    let resApiMethod = undefined
    try{
        resApiMethod = await apiMethod(_authData)
        this.logger(`resApiMethod = ${JSON.stringify(resApiMethod)}`)
    } catch(error) {
      this.initGlobals()
      let response = cloneDeep(error)

      this.logger(`_proxyApi ERROR = ${JSON.stringify(response)}`)

      if (response.status === 401){
        this.logger('CHECK AUTH')
        return this._checkAuth(response, _authData, eventCallback)
      }
      return Promise.reject(response)

    }
    return Promise.resolve(resApiMethod)
  }

  proxy(authData, apiMethod){
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
