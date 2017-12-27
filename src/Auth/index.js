import { cloneDeep, isFunction, get, isEmpty } from 'lodash'

/**
 * This is an utility to handle refresh authentication token processing.
 * The first unauthorized call pauses all the following, waiting for receiving new token object
 * Using es7 async await
 * @type {Object}
 *
 * @example
 *
 *  import Storage, {STORAGE_TYPES} from 'nuclearest-js/Storage'
 *  import fetch from 'nuclearest-js/fetch'
 *  import Headers, {headersMap} from 'nuclearest-js/Headers'
 *
 *  // In a real world authData,CookieStorage, Headers and Auth instances are imported from a service
 *
 *  let authData = {
 *    tokenObject:{
 *      tokenType: 'Bearer',
 *      accessToken: 'a1b2-c3d4-e5f6-g7h8',
 *      refreshToken: 'k1k2-j3j4-l5l6-p7p8',
 *      expiresIn: '2000',
 *      scope: 'user.role'
 *    }
 *  }
 *
 *
 *
 *  const cookieStorage = new Storage(STORAGE_TYPES.COOKIE, window.cookie, undefined, {enabled: true, 'grantedProps':['country'], callbackOnDisabled: () => {alert('COOKIE DISABLED')}})
 *
 *  let headers = new Headers()
 *                   .add()
 *                   .oauthToken(authData.tokenObject)
 *                   .custom('x-application-id', clientData.applicationId)
 *                   .use()
 *
 *  const refreshTokenApiCall = () => {
 *    return fetch('/my-refresh-token', {
 *      headers: headers,
 *      method: 'POST',
 *      body: JSON.stringify({
 *          refreshToken: authData.tokenObject.refreshToken
 *      })
 *    })
 *  }
 *
 *  const confirmAuthenticationCallback = (tokenObject) => {
 *    cookieStorage.setItem('tokenObject', tokenObject)
 *    authData.tokenObject = Object.assign({}, tokenObject)
 *  }
 *
 *  const resetAuthenticationCallback = () => {
 *    cookieStorage.removeItem('tokenObject')
 *    location.href = '/login'
 *  }
 *
 *  const getAuthData = () => {
 *    return cookieStorage.getItem('tokenObject')
 *  }
 *
 *  const auth = new Auth(refreshTokenApiCall, confirmAuthenticationCallback, resetAuthenticationCallback)
 *
 *  const getContents = () => {
 *      return fetch('/contents', {
 *      headers: headers,
 *      method: 'GET'
 *    })
 *  }
 *
 *  const processContents = async () => {
 *     try {
 *        const contentsResult = await auth.proxy(getAuthData, getContents)
 *        // Do your staff here to handle response
 *        const jsonResult = await contentsResult.json()
 *        console.log(JSON.stringify(jsonResult))
 *     } catch(error){
 *        // Do your staff here to handle exceptions
 *     }
 *  }
 *
 *  processContents()
 *
 */
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
    this._resetAuthenticationCallback(reason)
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
        return Promise.reject(err)
      }
      return Promise.reject(error)
    }

  }
}

export default Auth
