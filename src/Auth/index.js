import Headers from '.Headers'
import Emitter from './services/Emitter'

import isEmpty from 'lodash/isEmpty'
import cloneDeep from 'lodash/cloneDeep'
import isFunction from 'lodash/isFunction'

let globalRefreshTokenObject = null
let _applicationParams = null
let isRefreshingToken = false
const eventEmitter = new Emitter()
let headers = new Headers()

class Auth{
  constructor(refreshTokenCallback, resetAuthenticationCallback, options={}){
    this._refreshTokenCallback = refreshTokenCallback
    this._resetAuthenticationCallback = resetAuthenticationCallback
    this._options = options
  }

  _redirectWithNoAuth(applicationParams){
    if (applicationParams.authData.tokenObject === undefined && (isFunction(applicationParams.clientData.redirectWithNoAuthCallback) === true)) {
        applicationParams.clientData.redirectWithNoAuthCallback()
        return
    }
  }

  _authFailed(clientData, isRefreshTokenError, promiseCallback) {
    var errObject = {
        "error_description": "Authentication failed",
        "error_uri": "https://tools.ietf.org/html/rfc6749#section-5.2",
        "error": "invalid_grant"
    }

    let notApiResponse = {
        statusCode: 401,
        json: errObject
    }

    clientData.session.removeToken()
    clientData.session.removeUser()

    this._resetAuthenticationCallback()

    if (isFunction(this._redirectWithNoAuth) === true){
      this._redirectWithNoAuth()
    }
  }

  _confirmRefreshToken(refreshTokenObject, apiCallMethod, clientData, xhrOptions, authData){
    globalRefreshTokenObject = {}
    globalRefreshTokenObject.clientData = clientData
    globalRefreshTokenObject.xhrOptions = xhrOptions
    globalRefreshTokenObject.authData = authData
    globalRefreshTokenObject.authData.tokenObject = cloneDeep(refreshTokenObject)

    isRefreshingToken = false
    eventEmitter.emitGeneric('REFRESH_TOKEN')
    apiCallMethod()

    if (clientData.session !== undefined) {
        clientData.session.removeToken()
        clientData.session.setToken(refreshTokenObject)
    } else {
        console.error("Please put a session instance in a clientData session property! Refresh Token unstable state!")
    }
  }

  _refreshTokenProcess(apiCallMethod, promiseCallback, clientData, xhrOptions, authData) {
      let responseOk = false
      if (authData.tokenObject === undefined) {
        authFailed(clientData, false, promiseCallback)
        return
      }
      this._refreshTokenCallback().then((response) => {
        responseOk = response.ok
        if (response.ok === false) {
          let isRefreshTokenError = true
          this._authFailed(clientData, isRefreshTokenError, promiseCallback)
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
        _applicationParams = cloneDeep(globalRefreshTokenObject) || cloneDeep(applicationParams)
        if (!isRefreshingToken){
            isRefreshingToken = true
            dispatch(authCall(proxyApi.bind(this, _applicationParams), apiCallback, _applicationParams.clientData, _applicationParams.xhrOptions, _applicationParams.authData))
        } else {
            eventEmitter.on('REFRESH_TOKEN', eventCallback)
        }
    } else {
        errorCallback(json, statusCode)
    }
  }

}

export const authProxy = (dispatch, applicationParams, apiMethod, successCallback, errorCallback) => {
    redirectWithNoAuth()

    const eventCallback = () => {
        let newAppParams = cloneDeep(globalRefreshTokenObject) || cloneDeep(applicationParams)
        proxyApi.bind(this, newAppParams)()
    }

    var errorProxyCallback = function (json, statusCode) {
        if (statusCode === 401) {
            let newAppParams = cloneDeep(globalRefreshTokenObject) || cloneDeep(applicationParams)
            if (!isRefreshingToken){
                isRefreshingToken = true
                dispatch(authCall(proxyApi.bind(this, newAppParams), apiCallback, newAppParams.clientData, newAppParams.xhrOptions, newAppParams.authData))
            } else {
                eventEmitter.on('REFRESH_TOKEN', eventCallback)
            }
        } else {
            errorCallback(json, statusCode)
        }
    }

    var errorIeAuthCallback = function () {
        let newAppParams = cloneDeep(globalRefreshTokenObject) || cloneDeep(applicationParams)
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
        let appParams = globalRefreshTokenObject || applicationParams
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
    let newAppParams = cloneDeep(globalRefreshTokenObject) || cloneDeep(applicationParams)

    if (isRefreshingToken === true){
        eventEmitter.on('REFRESH_TOKEN', eventCallback)
    } else {
        proxyApi.bind(this, newAppParams)()
    }
}
