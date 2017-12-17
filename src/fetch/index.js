import isFunction from 'lodash/isFunction'
import get from 'lodash/get'
import deafultResponseParser from './defaultResponseParser'
import configForBrowserContext from './configForBrowserContext'
import { serverErrorResponse, isServerError } from '../services/Utils'

const Promise = require('es6-promise').Promise;

import 'isomorphic-fetch';
let _fetch = fetch




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

const DEFAULT_TIMEOUT = 30000

export const tm = (ms, reject) => {
   return setTimeout(() => {reject({code: 'TIMEOUT'})}, ms)
}

const fetch = async (url, options) => {
  let _fetchResult
  _fetch = configForBrowserContext()

  let resPromise = Promise

  const wait = ms => new Promise(resolve, reject => tm(ms, reject));

  try {
    const timeoutProcessing = wait(options.timeout || DEFAULT_TIMEOUT)
    _fetchResponse = await _fetch(url, options)
    clearTimeout(tm);

    if (options.parseResponse === false){
      return resolve(_fetchResponse)
    }

    if (isFunction(options.responseParser)){
      return options.responseParser(_fetchResponse)
    } else {
      return defaultResponseParser(_fetchResponse)
    }
  } catch(err){
      return resPromise.reject(err)
  }
}

export default fetch
