import { HEADERS_MAP, HEADERS_VALUES_MAP } from './headers'

import { get, cloneDeep, filter, includes } from 'lodash'

export const headersMap = HEADERS_MAP
export const headersValuesMap = HEADERS_VALUES_MAP

/**
 * Defines some basic methods to compose a headers map for using in fetch API.
 * Provide simple HTTP request headers keys map and OAUTH specific methods.
 *
 *
 * @example
 *
 * import fetch from 'nuclearest-js/fetch'
 * import Headers, {headersMap} from 'nuclearest-js/Headers'
 * import clientData from 'your/path/clientData'
 *
 * let headers = new Headers()
 *                   .addDefault()
 *                   .acceptApplicationJson()
 *                   .acceptLanguage(clientData.lang)
 *                   .add()
 *                   .oauthToken()
 *                   .custom('x-application-id', 'a1b2c3d4')
 *                   .use()
 *
 *
 */
class Headers {
  constructor(){
    this.headers = {}
    this.defaults = []
    this.headersMap = cloneDeep(HEADERS_MAP)
  }

  /**
   * Add default headers values. initAll() must be called to delete default values.
   *
   * @example
   *
   * let headers = new Headers()
   *     .addDefault()
   *     .acceptApplicationJson()
   *     .add()
   *     .acceptLanguage(clientData.lang)
   *     .use()
   *
   * //results: {'Accept': 'application/json', 'Accept-Language': 'EN'}
   *
   *  heders.init()
   *
   * //results: {'Accept': 'application/json'}
   *
   * headers.initAll()
   *
   * //results: {}
   *
   */
  addDefault(){
    this.operation = (obj) =>{
      this.defaults.push(obj.header)
      this.headers[obj.header] = obj.value
    }
    return this
  }
  /**
   * Add headers by basic methods or custom by custom(header, value)
   *
   * @example
   *
   * let authData = {
   *    tokenObject:{
   *      tokenType: 'Bearer',
   *      accessToken: 'a1b2-c3d4-e5f6-g7h8',
   *      refreshToken: 'k1k2-j3j4-l5l6-p7p8',
   *      expiresIn: '2000',
   *      scope: 'user.role'
   *    }
   * }
   *
   * let clientData = {
   *    lang: 'EN',
   *    applicationId: 'a1b2c3d4'
   * }
   *
   * let headers = new Headers()
   *                   .add()
   *                   .oauthToken(authData.tokenObject)
   *                   .custom('x-application-id', clientData.applicationId)
   *                   .use()
   *
   * //results: {'Authorization': 'Bearer a1b2-c3d4-e5f6-g7h8', 'x-application-id', 'a1b2c3d4'}
   */
  add(){
    this.operation = (obj) =>{
      this.headers[obj.header] = obj.value
    }
    return this
  }
  /**
   * Remove headers by basic or custom by custom(header, value)
   *
   * @example
   * let headers = new Headers()
   *                   .add()
   *                   .oauthToken()
   *                   .custom('x-application-id', 'a1b2c3d4')
   *                   .use()
   *
   * headers
   * .remove()
   * .oauthToken()
   * .use()
   *
   * //results: {'x-application-id', 'a1b2c3d4'}
   *
   */
  remove(){
    this.operation = (obj) =>{
      if (this.headers[obj.header] !== undefined){
        delete this.headers[obj.header]
      }
    }
    return this
  }

  /**
   * Add custom headers
   * @param  {string} headerKey The header key to set i.e: 'x-application-id'
   * @param  {string} value     The value to set i.e:   'a1b2c3d4'
   */
  custom(headerKey, value){
    this.operation({
      header: headerKey,
      value: value
    })
    return this
  }

  /**
   * Get the configured headers map
   * @return {object} headers map
   */
  use(){
    return cloneDeep(this.headers)
  }

  /**
   * Remove headers except defaults
   * @return {object} headers map
   */
  init(){
    let _props = Object.keys(this.headers)

    for(let i=0; i < _props.length; i++){
      if (!includes(this.defaults, _props[i])){
        delete this.headers[_props[i]]
      }
    }
    return this.headers
  }

  /**
   * Initialize all the headers map
   * @return {[type]} empty headers map
   */
  initAll(){
    this.headers = {}
    return this.headers
  }

  acceptApplicationJson(){
    this.operation({
      header: this.headersMap.ACCEPT,
      value: 'application/json'
    })
    return this
  }

  acceptLanguage(lang){
    this.operation({
      header: HEADERS_MAP.ACCEPT_LANGUAGE,
      value: lang
    })
    return this
  }

  contentTypeJsonUtf8(){
    this.operation({
      header: HEADERS_MAP.CONTENT_TYPE,
      value: 'application/json; charset=UTF-8'
    })
    return this
  }

  oauthClientAuthentication(){
    this.operation({
      header: HEADERS_MAP.CONTENT_TYPE,
      value: 'application/x-www-form-urlencoded'
    })
    return this
  }

  oauthBasicAuthentication(authData){
    if (get(authData, 'clientToken') !== undefined) {
      this.operation({
        header: HEADERS_MAP.AUTHORIZATION,
        value: `Basic ${get(authData, 'clientToken')}`
      })
    }
    return this
  }

  oauthToken(authData){
    const tokenType = get(authData, 'tokenObject') !== undefined ? get(authData, 'tokenObject.tokenType') : undefined
    const accessToken = get(authData, 'tokenObject') !== undefined ? get(authData, 'tokenObject.accessToken') : undefined

    if (tokenType !== null && tokenType !== undefined && accessToken !== null && accessToken !== undefined) {
      this.operation({
        header: HEADERS_MAP.AUTHORIZATION,
        value: `${tokenType} ${accessToken}`
      })
    }
    return this
  }
}

export default Headers
