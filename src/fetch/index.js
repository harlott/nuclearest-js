import isFunction from 'lodash/isFunction'
import get from 'lodash/get'
import timeoutWrapper from './timeoutWrapper'
import defaultResponseParser from './defaultResponseParser'
import configForBrowserContext from './configForBrowserContext'

const Promise = require('es6-promise').Promise;

import isoFetch from 'isomorphic-fetch';
let _fetch = isoFetch




/**
 * This is a HOF (High Order Function) to enhance standard fetch.
 * 
 * Features:
 * 1) universal: use isomorphic-fetch 
 * 2) fix Edge issues with HTTP methods response headers in browser context using fetch-ponyfill;
 * 3) timeout handling;
 * 4) parsing body response: use it or not(default), use default (isEmpty, isJson, isText flags) or use your own
 * 5) Future: XHR abort handling
 *
 * @param  {String} url     The request url
 * @param  {Object} options The standard fetch options object plus: boolean parseResponse (default: false), function responseParser
 * @return {Promise}        Returns a promise with original fetch response in 'originalResponse' property
 *
 * @example
 *
 * //No Parsed Response:
 * 
 * fetch('/users', {
 *      method: 'POST',
 *      timeout: 40000,
 *      headers: {'Content-Type': 'application/json'},
 *      body: JSON.stringify({name: 'Jack'})
 *    }
 * )
 * 
 * //Parsed Response with default response parser function:
 * 
 * fetch('/users', {
 *      parseResponse: true,
 *      method: 'POST',
 *      timeout: 40000,
 *      headers: {'Content-Type': 'application/json'},
 *      body: JSON.stringify({name: 'Jack'})
 *    }
 * )
 *
 */

const DEFAULT_TIMEOUT = 10000

const fetch = async (url, options) => {
  try {
    _fetch = configForBrowserContext(_fetch)
    const _fetchResponse = await timeoutWrapper(_fetch, url, options, get(options, 'timeout') || DEFAULT_TIMEOUT)
    if (options.parseResponse === false){
      return Promise.resolve(_fetchResponse)
    }

    if (isFunction(get(options, 'responseParser'))){
      return options.responseParser(_fetchResponse)
    } else {
      return defaultResponseParser(_fetchResponse)
    }
  } catch(err){
      try {
        const errResponse = await err
        return Promise.reject(errResponse)
      } catch(errRes){
        return Promise.reject(errRes)
      }
  }
}

export default fetch
