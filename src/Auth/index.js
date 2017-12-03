import Emitter from './services/Emitter'

import isEmpty from 'lodash/isEmpty'
import cloneDeep from 'lodash/cloneDeep'
import isFunction from 'lodash/isFunction'

let __global__RefreshTokenObject = null
let __global__isRefreshingToken = false
let _applicationParams = null

const eventEmitter = new Emitter()

class Auth{
  constructor(refreshTokenMethod, confirmAuthenticationCallback, resetAuthenticationCallback, options={}){
    this._refreshTokenMethod = refreshTokenMethod
    this._confirmAuthenticationCallback = confirmAuthenticationCallback
    this._resetAuthenticationCallback = resetAuthenticationCallback
    this._options = options
  }

  _redirectWithNoAuth(applicationParams){
    if (applicationParams.authData.tokenObject === undefined && (isFunction(applicationParams.clientData.redirectWithNoAuthCallback) === true)) {
        applicationParams.clientData.redirectWithNoAuthCallback()
        return
    }
  }

  _authFailed(isRefreshTokenError, promiseCallback) {
    var errObject = {
        "error_description": "Authentication failed",
        "error_uri": "https://tools.ietf.org/html/rfc6749#section-5.2",
        "error": "invalid_grant"
    }

    let notApiResponse = {
        statusCode: 401,
        json: errObject
    }

    this._resetAuthenticationCallback()

    if (isFunction(this._redirectWithNoAuth) === true){
      this._redirectWithNoAuth()
    }
  }

  _confirmRefreshToken(refreshTokenObject, apiCallMethod, clientData, xhrOptions, authData){
    __global__RefreshTokenObject = {}
    __global__RefreshTokenObject.clientData = clientData
    __global__RefreshTokenObject.xhrOptions = xhrOptions
    __global__RefreshTokenObject.authData = authData
    __global__RefreshTokenObject.authData.tokenObject = cloneDeep(refreshTokenObject)

    __global__isRefreshingToken = false
    eventEmitter.emitGeneric('REFRESH_TOKEN')
    apiCallMethod()

    this._confirmAuthenticationCallback(refreshTokenObject)
  }

  _refreshTokenProcess(apiCallMethod, promiseCallback, clientData, xhrOptions, authData) {
      if (authData.tokenObject === undefined) {
        authFailed(clientData, false, promiseCallback)
        return
      }
      this._refreshTokenMethod().then((response) => {
        if (response.ok === false) {
          let isRefreshTokenError = true
          this._authFailed(isRefreshTokenError, promiseCallback)
          return
        }
        this._confirmRefreshToken(response.json, apiCallMethod,clientData, xhrOptions, authData)
      }).catch((err) => {
          console.warn("Error on refreshToken", err.message);
          console.error(err);
          return err;
      });
  }

  _checkAuth(json, statusCode, applicationParams){
    if (statusCode === 401) {
      errorCallback(json, statusCode)
      return
    }
    _applicationParams = cloneDeep(__global__RefreshTokenObject) || cloneDeep(applicationParams)
    if (__global__isRefreshingToken === true) {
        eventEmitter.on('REFRESH_TOKEN', eventCallback)
        return
    }
    __global__isRefreshingToken = true
    dispatch(authCall(proxyApi.bind(this, _applicationParams), apiCallback, _applicationParams.clientData, _applicationParams.xhrOptions, _applicationParams.authData))
  }
}

export const authProxy = (dispatch, applicationParams, apiMethod, successCallback, errorCallback) => {
    redirectWithNoAuth()

    const eventCallback = () => {
        let newAppParams = cloneDeep(__global__RefreshTokenObject) || cloneDeep(applicationParams)
        proxyApi.bind(this, newAppParams)()
    }

    var errorProxyCallback = function (json, statusCode) {
        if (statusCode === 401) {
            let newAppParams = cloneDeep(__global__RefreshTokenObject) || cloneDeep(applicationParams)
            if (!__global__isRefreshingToken){
                __global__isRefreshingToken = true
                dispatch(authCall(proxyApi.bind(this, newAppParams), apiCallback, newAppParams.clientData, newAppParams.xhrOptions, newAppParams.authData))
            } else {
                eventEmitter.on('REFRESH_TOKEN', eventCallback)
            }
        } else {
            errorCallback(json, statusCode)
        }
    }

    var errorIeAuthCallback = function () {
        let newAppParams = cloneDeep(__global__RefreshTokenObject) || cloneDeep(applicationParams)
        dispatch(authCall(proxyApi.bind(this, newAppParams), apiCallback, newAppParams.clientData, newAppParams.xhrOptions, newAppParams.authData))
    }

    var apiCallback = (response, notApiResponse) => {
        let errorEvaluated = false
        if (!!response) {
            if (response.status === 204) {
                successCallback({})
            }
            else {
                if (response.ok === true) {
                    successCallback(response.json, response)
                }
                else {
                    errorProxyCallback(response.json, response.status, response)
                }
            }
        } else if (!!notApiResponse) {
            errorCallback(notApiResponse.json, notApiResponse.statusCode)
        } else {
            return null
        }
    }

    var proxyApi = function (applicationParams) {
        let appParams = __global__RefreshTokenObject || applicationParams
        const executeApiMethod =  (authData) => {
            return apiMethod(authData)
        }

        return executeApiMethod(appParams.authData).then(
            response => {
                eventEmitter.removeListener('REFRESH_TOKEN', eventCallback)
                return apiCallback(response)
            }

        ).catch((err) => {
            errorIeAuthCallback();
            console.warn("Error in authProxy", err.message);
            console.error(err);

            return err;
        });
    }
    let newAppParams = cloneDeep(__global__RefreshTokenObject) || cloneDeep(applicationParams)

    if (__global__isRefreshingToken === true){
        eventEmitter.on('REFRESH_TOKEN', eventCallback)
    } else {
        proxyApi.bind(this, newAppParams)()
    }
}
