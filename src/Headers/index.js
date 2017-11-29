import { HEADERS_MAP, HEADERS_VALUES_MAP } from './headers'

import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'

export const headersMap = HEADERS_MAP
export const headersValuesMap = HEADERS_VALUES_MAP

class Headers {
  constructor(){
    this.headers = {}
    this.headersMap = cloneDeep(HEADERS_MAP)
  }

  default() {
    return this.headers
  }

  add(){
    this.operation = (obj) =>{
      this.headers[obj.header] = obj.value
    }
    return this
  }

  remove(){
    this.operation = (obj) =>{
      if (this.headers[obj.header] !== undefined){
        delete this.headers[obj.header]
      }
    }
    return this
  }

  custom(headerKey, value){
    this.operation({
      header: headerKey,
      value: value
    })
    return this
  }

  use(){
    return cloneDeep(this.headers)
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
    const tokenType = authData.tokenObject !== undefined ? authData.tokenObject.tokenType : undefined
    const accessToken = authData.tokenObject !== undefined ? authData.tokenObject.accessToken : undefined

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
