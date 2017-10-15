const Promise = require('es6-promise').Promise;

import { serverErrorResponse, isServerError } from './Utils'
import has from 'lodash/has'
import isFunction from 'lodash/isFunction'

const isEdge = /Edge\//.test(navigator.userAgent);
if (isEdge) window.fetch = undefined; // ensure the polyfill runs

import isoFetch  from 'isomorphic-fetch';
import fetchPonyfill from 'fetch-ponyfill';

const localFetch = isEdge === true ? fetchPonyfill().fetch : isoFetch

export default function fetch(url, options, signature, xhrOptions) {
  let resPromise = () => (new Promise((resolve, reject) => {
    let abort = false;

    const tm = setTimeout(function () {
      abort = true;
      resolve(serverErrorResponse);
    }, 30000);

    return localFetch(url, options)
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
