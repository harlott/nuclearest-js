import fetch from './fetch'
import Headers from '.Headers'
import Emitter from '../../services/Emitter'
import isEmpty from 'lodash/isEmpty'

import cloneDeep from 'lodash/cloneDeep'
import isFunction from 'lodash/isFunction'

let globalRefreshTokenObject
let isRefreshingToken = false

const eventEmitter = new Emitter()


export function authProxy(dispatch, applicationParams, apiMethod, successCallback, errorCallback) {
    let passedFromApiCallback = false
    if (applicationParams.authData.tokenObject === undefined && (applicationParams.clientData.redirectWithNoAuthCallback !== undefined && isFunction(applicationParams.clientData.redirectWithNoAuthCallback))) {
        return applicationParams.clientData.redirectWithNoAuthCallback()
    }

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
        passedFromApiCallback = true
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
            passedFromApiCallback = false;

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

export function authCall(apiCallMethod, promiseCallback, clientData, xhrOptions, authData, authParams) {
    return dispatch => {
        var responseOk
        var authFailed = function (isRefreshTokenError) {
            var errObject = {
                "error_description": "Autenticazione fallita",
                "error_uri": "https://tools.ietf.org/html/rfc6749#section-5.2",
                "error": "invalid_grant"
            }
            let notApiResponse = {
                statusCode: 401,
                json: errObject
            }
            clientData.session.removeToken()
            clientData.session.removeUser()

            /*TODO: how to exec callback*/
            //dispatch(initUsers())
            //dispatch(invalidateAuthentication(errObject))

            const checkUser = setInterval(() => {
                let user = dispatch(getUser())
                if (isEmpty(user)){
                    stopCheckUser()

                    promiseCallback(undefined, notApiResponse)

                    if (isRefreshTokenError === true) {
                        if (isFunction(clientData.customRedirectToLoginCallback)) {
                            clientData.customRedirectToLoginCallback()
                        } else {
                            if (isFunction(clientData.redirectToLoginCallback)) {
                                clientData.redirectToLoginCallback()
                            }
                        }
                    }
                }
            }, 20);

            function stopCheckUser() {
                clearInterval(checkUser);
            }
        }

        if (authData.tokenObject !== undefined) {
            apiRefreshToken(clientData, xhrOptions, authData).then(function (response) {
                responseOk = response.ok
                if (responseOk === true) {
                    let refreshTokenObject = cloneDeep(response.json)
                    globalRefreshTokenObject = {}
                    globalRefreshTokenObject.clientData = clientData
                    globalRefreshTokenObject.xhrOptions = xhrOptions
                    globalRefreshTokenObject.authData = authData
                    globalRefreshTokenObject.authData.tokenObject = cloneDeep(refreshTokenObject)

                    isRefreshingToken = false
                    eventEmitter.emitGeneric('REFRESH_TOKEN')
                    apiCallMethod()

                    if (!!clientData.session) {
                        clientData.session.removeToken()
                        clientData.session.setToken(refreshTokenObject)
                    } else {
                        console.error("Please put a session instance in a clientData session property! Refresh Token unstable state!")
                    }
                } else {
                    let isRefreshTokenError = true
                    authFailed(isRefreshTokenError)
                }
            }).catch((err) => {
                console.warn("Error on refreshToken", err.message);
                console.error(err);
                return err;
            });
        } else {
            authFailed()
        }
    }
}



function apiRefreshToken(clientData, xhrOptions, authData) {
    var bodyData = 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(authData.tokenObject.refreshToken)
    return fetch(xhrOptions.API_HOST + AuthenticationServiceApi.endPoints.getToken(authData, clientData),
        {
            method: 'POST',
            headers: Headers.getHeadersWithBasicAuthentication(clientData, authData),
            timeout: xhrOptions.PROMISE_TIMEOUT,
            body: bodyData
        }
    )
}