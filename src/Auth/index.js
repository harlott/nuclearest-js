import Emitter from '../services/Emitter'
import { cloneDeep, isFunction, get, isEmpty } from 'lodash'


const eventEmitter = new Emitter()

class Auth{
  constructor(refreshTokenApiCall, confirmAuthenticationCallback, resetAuthenticationCallback, options={beforeRefreshTokenCallback: () => {}}){
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

  async _refreshTokenMethod(){
    try {
      const result = await this._refreshTokenApiCall()
      return Promise.resolve(result)
    } catch(error){
      return Promise.reject(error)
    }
  }

  _authFailed(reason) {
    this._resetAuthenticationCallback()
    return Promise.reject(reason)
  }

  async _confirmRefreshToken(lastRefreshToken){
    try {
      this._confirmAuthenticationCallback({tokenObject:lastRefreshToken})
      this._lastRefreshToken = {}
      return Promise.resolve({status: 'SUCCESS'})
    } catch(error){
      this.init()
      return this._authFailed(error)
    }
  }

  async _refreshTokenProcess() {
    try {
      if (!isEmpty(this._lastRefreshToken)){
        return Promise.resolve({status: 'SUCCESS'})
      }

      if (isFunction(this._options.beforeRefreshTokenCallback)){
        this._options.beforeRefreshTokenCallback()
      }

      const refreshTokenResponse = await this._refreshTokenMethod()
      this._lastRefreshToken = await refreshTokenResponse.json()
      const confirmedRefreshToken = await this._confirmRefreshToken(this._lastRefreshToken)

      return Promise.resolve(confirmedRefreshToken)
    } catch(err){
      try {
        let errorProcessed = await err
        return Promise.reject(errorProcessed)
      } catch(errorFormRefresh){
        return Promise.reject(errorFormRefresh)
      }

      if (err.status === 401){
        return this._authFailed(this._lastRefreshToken)
      }
      return Promise.reject(err)
    }
  }

  async _checkAuth(response, getAuthData){
    try {
      if (get(response, 'status') === 401) {
        let _refreshTokenProcessed = await this._refreshTokenProcess()
        return _refreshTokenProcessed
      }
    } catch(err){
      return Promise.reject(response)
    }

    return new Promise.resolve(response)
  }

  async _proxyApi(getAuthData, apiMethod){
    try{
        const resApiMethod = await apiMethod(getAuthData())
        return Promise.resolve(resApiMethod)
    } catch(error) {
      let response = cloneDeep(error)
      const status = get(response, 'status')
      if (status === undefined) {
        throw new Error('Unexpected exception!!!')
      } else if (status === 401){
        try {
          const checkedAuth = await this._checkAuth(response, getAuthData)
          return apiMethod()
        } catch(err){
          return Promise.reject(err)
        }
      } else {
          return Promise.reject(response)
      }
    }
  }

  async proxy(getAuthData, apiMethod){
    try {
      const authData = getAuthData()
      if (get(authData, 'tokenObject.accessToken') === undefined && get(getAuthData(), 'tokenObject.refreshToken') === undefined) {
        return this._authFailed({
          code: 'TOKEN_OBJECT_NOT_DEFINED',
          message: 'tokenObject is undefined'
        })
      }

      const proxyApiProcessed = await this._proxyApi(getAuthData, apiMethod)
      return  Promise.resolve(proxyApiProcessed)
    } catch(error){
      try {
        const errorProcessed = await error
      } catch (err){
        return
      }
      return Promise.reject(error)
    }

  }
}

export default Auth
