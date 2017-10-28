const Promise = require('es6-promise').Promise;

import { serverErrorResponse, isServerError } from './Utils'
import has from 'lodash/has'
import isFunction from 'lodash/isFunction'

const isEdge = !!navigator ? /Edge\//.test(navigator.userAgent) : false;
if (isEdge) window.fetch = undefined;

import isoFetch  from 'isomorphic-fetch';
import fetchPonyfill from 'fetch-ponyfill';

const _fetch = isEdge === true ? fetchPonyfill().fetch : isoFetch
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


export default function fetch(url, options) {
  let resPromise = () => (new Promise((resolve, reject) => {
    let abort = false;

    const tm = setTimeout(function () {
      abort = true;
      resolve(serverErrorResponse);
    }, options.timeout || 30000);

    return _fetch(url, options)
      .then((response) => {
        clearTimeout(tm);
        return !isServerError(response) ? response : serverErrorResponse;
      })
      .then((response) => {
        if (!abort) {
          if (isFunction(response.text)){
            return response.text().then((text) => {
              let jsonBody
              let isJsonResponse = true
              try{
                jsonBody = JSON.parse(text)
              } catch(e){

              }
              if (!jsonBody){
                isJsonResponse = false
                jsonBody = {transformedValue: text}
              }
              return resolve({
                    json: jsonBody,
                    text: text,
                    isJson: isJsonResponse,
                    ok: response.ok,
                    status: response.status,
                    originalResponse: response,
                })
            }, (err) => {
              console.error("Error on converting from response into jSON", err);
              return resolve(serverErrorResponse)
            });
          } else {
            console.error("Generic Error on response");
            return resolve(serverErrorResponse )
          }

        }
      })
  }));

    return resPromise()
}
