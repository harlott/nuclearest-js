import Emitter from '../services/Emitter'
import { cloneDeep, isFunction, get, isEmpty } from 'lodash'


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
    this._lastRefreshToken = {}
  }

  init(){
    this._lastRefreshToken = {}
  }

  logger(output){
    if (get(this._options, 'debug', false) === true){
      console.log(output)
    }
  }

  async _refreshTokenMethod(){
    try {
      const result = await this._refreshTokenApiCall()
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
    this._resetAuthenticationCallback()
    return new Promise((resolve, reject)=>{
      reject(reason)
    })
  }

  async _confirmRefreshToken(lastRefreshToken){
    this.logger('_confirmRefreshToken: prepare refreshToken confirmation...')
    try {
      this.logger(`_confirmRefreshToken: refresh token = ${JSON.stringify(lastRefreshToken)}`)
      this._confirmAuthenticationCallback({tokenObject:lastRefreshToken})
      this._lastRefreshToken = {}
      return new Promise((resolve) => {
        resolve({status: 'ok'})
      })
    } catch(error){
      this.init()
      return this._authFailed(error)
    }
  }

  async _refreshTokenProcess() {
    this.logger(`_refreshTokenProcess: this._lastRefreshToken = ${JSON.stringify(this._lastRefreshToken)}`)
    if (!isEmpty(this._lastRefreshToken)){
      this.logger('_refreshTokenProcess: already processed')
      return new Promise((resolve) => {
        resolve({status: 'ok'})
      })
    }
      this.logger('_refreshTokenProcess: prapare refresh token processing...')

      if (isFunction(this._options.beforeRefreshTokenCallback)){
        this._options.beforeRefreshTokenCallback()
      }

      try {
        const refreshTokenResponse = await this._refreshTokenMethod()
        this._lastRefreshToken = await refreshTokenResponse.json()
        this.logger(`_refreshTokenProcess: confirm with refresh token ${JSON.stringify(this._lastRefreshToken)}`)
        try {
          const confirmedRefreshToken = await this._confirmRefreshToken(this._lastRefreshToken)
          return new Promise((resolve) => {
            resolve(confirmedRefreshToken)
          })
        } catch(err){
          return new Promise((resolve, reject) => {
            reject(err)
          })
        }
      } catch(err){
        this.logger(`CATCH REFRESH TOKEN ${JSON.stringify(err)}` )
        try {
          let errorProcessed = await err
          this.logger(`_refreshTokenProcess: ERROR: errorProcessed = ${JSON.stringify(err)}`)
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
          return this._authFailed(this._lastRefreshToken)
        }
        return new Promise((resolve, reject) => {
          reject(err)
        })
      }
  }

  async _checkAuth(response, getAuthData){
    this.logger(`_checkAuth: response => ${JSON.stringify(response)}`)
    if (get(response, 'status') === 401) {
      try {
        let _refreshTokenProcessed = await this._refreshTokenProcess()
        this.logger(`_checkAuth: _refreshTokenProcessed = ${JSON.stringify(_refreshTokenProcessed)}`)
        return _refreshTokenProcessed
      } catch(err){
        console.log(`_checkAuth: REFRESH TOKEN ERROR => ${JSON.stringify(err)}`)
        return new Promise((resolve, reject) => {
          reject(response)
        })
      }
    }

    return new Promise((resolve) => {
      resolve(response)
    })
  }

  async _proxyApi(getAuthData, apiMethod){
    this.logger(`_proxyApi => appParams = ${JSON.stringify(getAuthData())}`)
    let resApiMethod
    try{
        resApiMethod = await apiMethod(getAuthData())
        this.logger(`_proxyApi: SUCCESS: resApiMethod = ${JSON.stringify(resApiMethod)}`)
        return new Promise((resolve) => {
          resolve(resApiMethod)
        })
    } catch(error) {
      let response = cloneDeep(error)
      this.logger(`_proxyApi: ERROR: response = ${JSON.stringify(response)}`)
      const status = get(response, 'status')
      if (status === 401){
        this.logger('_proxyApi: ERROR: calling this._checkAuth')
        try {
          const checkedAuth = await this._checkAuth(response, getAuthData)
          return apiMethod()
        } catch(err){
          return new Promise((resolve, reject) => {
            reject(err)
          })
        }

      }
      this.logger(`_proxyApi: ERROR: return apiMethod ${JSON.stringify(error)}`)
      return new Promise((resolve, reject) => {
        reject(response)
      })
    }
  }

  async proxy(getAuthData, apiMethod){
    const authData = getAuthData()
    this.logger(`proxy: calling _proxiApi with authData = ${JSON.stringify(getAuthData())}`)
    if (get(authData, 'tokenObject.accessToken') === undefined && get(getAuthData(), 'tokenObject.refreshToken') === undefined) {
      return this._authFailed({
        code: 'TOKEN_OBJECT_NOT_DEFINED',
        message: 'tokenObject is undefined'
      })
    }
    try {
      const proxyApiProcessed = await this._proxyApi(getAuthData, apiMethod)
      return new Promise((resolve) => {
        resolve(proxyApiProcessed)
      })
    } catch(error){
      return new Promise((resolve, reject) => {
        reject(error)
      })
    }

  }
}

export default Auth
