import isFunction from 'lodash/isFunction'
import get from 'lodash/get'
import timeoutWrapper from './timeoutWrapper'
import defaultResponseParser from './defaultResponseParser'
import configForBrowserContext from './configForBrowserContext'

const Promise = require('es6-promise').Promise;

import isoFetch from 'isomorphic-fetch';
let _fetch = isoFetch




/**
 * This is a proxy method for standard fetch that use isomorphic-fetch
 * for all human browsers and fetch-ponyfill for other cases.
 * Features:
 * 1) fix Edge issues with HTTP methods response headers;
 * 2) timeout handling;
 * 3) all the responses with no content;
 * 4) broken server response: if the server return HTTP 503 may be you need to handle
 *    the response without blocking the promises chain. This method force 'fetch'
 *    to return always a JSON response.
 *
 * @param  {String} url     The request url
 * @param  {Object} options The standard fetch options object
 * @return {Promise}        Returns a promise with original fetch response in 'originalResponse' property
 *
 * @example
 *
 * fetch('/users', {
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
    const _fetchResponse = await timeoutWrapper(_fetch, url, options, options.timeout || DEFAULT_TIMEOUT)
    if (options.parseResponse === false){
      return Promise.resolve(_fetchResponse)
    }
    
    if (isFunction(options.responseParser)){
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
