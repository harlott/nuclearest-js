import get from 'lodash/get'

/**
 * This is an utility to handle refresh authentication token processing.
 * The first unauthorized call pauses all the following, waiting for receiving new token object
 * @type {Object}
 *
 * @example
 *
 *  MyHeadersHandler.js
 *
 *  import Headers, {headersMap} from 'nuclearest-js/Headers'
 *  import get from 'lodash/get'
 *
 *
 *  export default class MyHeadersHandler {
 *      constructor(configs){
 *          this.configs = configs
 *      }
 *
 *      withToken: (tokenObject) => {
 *          return new Headers()
 *                   .add()
 *                   .oauthToken(get(tokenObject, 'accessToken'))
 *                   .custom('x-application-id', this.configs.applicationId)
 *                   .use()
 *      }
 *
 * }
 *
 *  MyApp.js
 *
 *  import Storage, {STORAGE_TYPES} from 'nuclearest-js/Storage'
 *  import fetch from 'nuclearest-js/fetch'
 *  import MyHeadersHandler from './MyHeadersHandler'
 *  import get from 'lodash/get'
 *
 *  const cookieStorage = new Storage(STORAGE_TYPES.COOKIE, window.cookie, undefined, {enabled: true, 'grantedProps':['country'], callbackOnDisabled: () => {alert('COOKIE DISABLED')}})
 *
 *  const getAuthData = () => {
 *    return cookieStorage.getItem('tokenObject')
 *  }
 *
 *  const configs = {
 *      applicationId: 'abcd-1234-efgh-5678'
 *  }
 *
 *  export const myHeadersHandler = new MyHeadersHandler(configs)
 *  const refreshTokenMethod = () => {
 *    return fetch('/my-refresh-token', {
 *      headers: myHeadersHandler.withToken(getAuthData()),
 *      method: 'POST',
 *      body: JSON.stringify({
 *          refreshToken: get(getAuthData(), 'tokenObject.refreshToken')
 *      })
 *    })
 *  }
 *
 *  const confirmAuthenticationCallback = (tokenObject) => {
 *    cookieStorage.setItem('tokenObject', tokenObject)
 *  }
 *
 *  const resetAuthenticationCallback = () => {
 *    cookieStorage.removeItem('tokenObject')
 *    location.href = '/login'
 *  }
 *
 *  export const configRefreshToken = {
 *      refreshTokenMethod,
 *      confirmAuthenticationCallback,
 *      resetAuthenticationCallback,
 *      getAuthData
 *  }
 *
 *  MyContentsApiHandler.js
 *
 *  import { myHeadersHandler, configRefreshToken, configs } from './MyApp'
 *  import fetch from 'nuclearest-js/fetch'
 *  import authProxy from 'nuclearest-js/authProxy'
 *
 *  const getApiContents = () => {
 *      return fetch('/contents', {
 *      headers: myHeadersHandler.withToken(configRefreshToken.getAuthData()),
 *      method: 'GET'
 *    })
 *  }
 *
 *  export const getContents = () => {
        return new Promise((resolve, reject) => {
            try {
                const standardSuccessCallback = (response) => {
                    resolve(response);
                };

                const standardErrorCallback = (response) => {
                    reject(response);
                };

                authProxy(configRefreshToken, getApiContents, successCallback || standardSuccessCallback, errorCallback || standardErrorCallback);
            } catch (e) {
                reject(e);
            }
        });
 *  }
 *
 *  export default getContents
 *
 *  MyContentsComponent.js
 *
 *  import { getContents } from './MyContentsApiHandler'
 *
 *  const processContents = async () => {
 *      try {
 *          const contentsResponse = await getContents()
 *          const responseData = await contentResponse.json()
 *          console.log(`Content title: ${responseData.title}`)
 *      } catch (error) {
 *          // your error handler
 *      }
 *  }
 *
 *  processContents()
 *
 *
 */

import RefreshTokenHandler from './RefreshTokenHandler'

export default function authProxy(configRefreshToken, apiMethod, successCallback, errorCallback) {
    const { getAuthData, resetAuthenticationCallback } = configRefreshToken
    const refreshTokenHandler = new RefreshTokenHandler(configRefreshToken)

    if (!get(getAuthData(), 'tokenObject') && (!!resetAuthenticationCallback && typeof resetAuthenticationCallback === 'function')) {
        resetAuthenticationCallback()
        errorCallback({ok: false, status: 401});
        return;
    }

    let count = 0;

    const eventCallback = () => {
        apiMethod().then((response) => {
            count += 1;

            window.removeEventListener('token', eventCallback)
          if (count >= 3 ){

          }
          successCallback(response)
        })
        .catch((apiMethodError) => {
          count += 1;
            if (count >= 3 ){
                console.log('error ' + JSON.stringify(apiMethodError))

          }
            if (apiMethodError.ok === false && apiMethodError.status === 401){
                window.addEventListener('token', eventCallback)
                try {
                    const semExecuter = function(){
                        refreshTokenHandler.refreshToken()
                    }
                    refreshTokenHandler.sem.take(semExecuter)
                } catch (e) {
                    errorCallback(e)
                }
            } else {
                errorCallback(apiMethodError)
            }
        })
    }

    try {
        eventCallback()
    } catch (e) {
        errorCallback(e)
    }
}
