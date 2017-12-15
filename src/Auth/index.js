import Emitter from '../services/Emitter'
import { cloneDeep, isFunction, get } from 'lodash'


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
    this._queue = []
    this._tokenRefreshing = false
    this._lastRefreshToken = {}
  }

  init(){
    this._tokenRefreshing = false
    this._lastRefreshToken = {}
  }

  logger(output){
    if (get(this._options, 'debug', false) === true){
      console.log(output)
    }
  }

  async _refreshTokenMethod(){
    try {
      let result = await this._refreshTokenApiCall()
      this.logger(`_refreshTokenMethod: SUCCESS: result = ${JSON.stringify(result)}`)
      return new Promise((resolve) => {
        resolve(result)
      })
    } catch(error){
      this.logger(`_refreshTokenMethod: ERROR: result = ${JSON.stringify(error)}`)
      return new Promise((resolve, reject) => {
        reject(error)
      })
    }
  }

  _authFailed(reason) {
    this._tokenRefreshing = false
    this._resetAuthenticationCallback()
    return new Promise((resolve, reject)=>{
      reject(reason)
    })
  }

  async _confirmRefreshToken(response){
    this.logger('INSIDE CONFIRM REFRESH TOKEN')
    this.logger(`CONFIRM REFRESH TOKEN => response is ${response}`)
    try {
      let jsonResultProcessed = response.json !== undefined ? await response.json() : undefined
      return new Promise((resolve) => {
        resolve(jsonResultProcessed)
      })
    } catch(error){
      this.init()
      return new Promise((resolve, reject)=>{
        reject(error)
      })
    }

    this._lastRefreshToken = {}
    this._lastRefreshToken.tokenObject = cloneDeep(json)
    this._tokenRefreshing = false
    this._confirmAuthenticationCallback(jsonResult)
    try{
      let apiCallMethodResult = await apiCallMethod()

      return new Promise((resolve) => {
        resolve({status: 'REFRESHING'})
      })
    } catch(error){
      this.init()
      return  new Promise((resolve, reject) => {
        reject(error)
      })
    }
  }

  async _refreshTokenProcess(authData) {
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
        return new Promise((resolve) => {
          resolve(this._confirmRefreshToken(refreshTokenProcessed, apiCallMethod))
        })
      } catch(err){
        this.logger(`CATCH REFRESH TOKEN ${JSON.stringify(err)}` )
        try {
          let errorProcessed = await err
          this.logger(`_refreshTokenProcess: ERROR: errorProcessed = ${JSON.stringify(errorProcessed)}`)
          return new Promise((resolve, reject) => {
            reject(errorProcessed)
          })
        } catch(errorFormRefresh){
          return new Promise((resolve, reject) => {
            reject(errorFormRefresh)
          })
        }

        if (err.status === 401){
          this.logger('REFRESH TOKEN FAILS ')
          return this._authFailed(refreshTokenProcessed)
        }
        return new Promise((resolve, reject) => {
          reject(err)
        })
      }
  }

  async _checkAuth(response, authData, eventCallback){
    this.logger(`CHECK AUTH RESPONSE => ${JSON.stringify(response)}`)
    if (response.status === 401) {
      let _authData = cloneDeep(this._lastRefreshToken) || cloneDeep(authData)
      this.logger(`CHECK AUTH => params = ${JSON.stringify(_authData)}`)
      if (this._tokenRefreshing === true) {
          eventEmitter.on('REFRESH_TOKEN', eventCallback)
          return new Promise((resolve) => {
            resolve({status: 'REFRESHING'})
          })
      }
      this._tokenRefreshing = true
      this.logger('PROCESSING REFRESH TOKEN')
      let _refreshTokenProcessed
      try {
        _refreshTokenProcessed = await this._refreshTokenProcess(eventCallback, _authData)
        this.logger(`_checkAuth: _refreshTokenProcessed = ${JSON.stringify(_refreshTokenProcessed)}`)
        return new Promise((resolve) => {
          resolve(_refreshTokenProcessed)
        })
      } catch(err){
        console.log(`_checkAuth: REFRESH TOKEN ERROR => ${JSON.stringify(err)}`)
        return new Promise((resolve, reject) => {
          reject(err)
        })
      }
    }

    return new Promise((resolve) => {
      resolve(response)
    })
  }

  async _proxyApi(authData, apiMethod){
    let _authData = this._lastRefreshToken || authData
    this.logger(`_proxyApi => appParams = ${JSON.stringify(_authData)}`)
    let resApiMethod
    try{
        resApiMethod = await apiMethod(_authData)
        this.logger(`resApiMethod = ${JSON.stringify(resApiMethod)}`)
        return new Promise((resolve) => {
          resolve(resApiMethod)
        })
    } catch(error) {
      this.init()
      let response = cloneDeep(error)
      this.logger(`_proxyApi ERROR = ${JSON.stringify(response)}`)
      if (get(response, 'status') === 401){
        this.logger('CHECK AUTH')
        return this._checkAuth(response, _authData)
      }
      return new Promise((resolve, reject) => {
        reject(response)
      })
    }
  }

  proxy(authData, apiMethod){
    this.logger(`proxy: in this._tokenRefreshing => ${this._tokenRefreshing}`)
    this.logger(`proxy: calling _proxiApi with authData = ${authData}`)

    let _authData = cloneDeep(this._lastRefreshToken) || cloneDeep(authData)
    return this._proxyApi(_authData, apiMethod)
  }
}

export default Auth
