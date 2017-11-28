import { HEADERS_MAP } from './headers'

import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'

export const headersMap = HEADERS_MAP

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

  acceptApplicationJson(){
    this.operation({
      header: this.headersMap.ACCEPT,
      value: 'application/json'
    })
    return this
  }

  acceptLanguage(lang){
    this.operation({
      header: this.headersMap.ACCEPT_LANGUAGE,
      value: lang
    })
    return this
  }

  use(){
    return cloneDeep(this.headers)
  }

  withApplicationJson(){
    return this.headers['Accept'] = 'application/json'
  }

  withAcceptLanguage(lang){
    if (lang !== undefined){
      this.headers['Accept-Language'] = get(clientData, 'lang')
    }
    return this.headers
  }

  getHeadersWithClientAuthentication(clientData) {
    let headers = cloneDeep(this.getHeadersDefault(clientData))
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    return headers
  }

  static getHeadersWithBasicAuthentication(clientData, authData) {
    let headers = cloneDeep(this.getHeadersWithClientAuthentication(clientData))

    if (get(authData, 'clientToken') !== undefined) {
      headers.Authorization = `Basic ${get(authData, 'clientToken')}`
    }

    return headers
  }

  static getHeadersWithToken(clientData, authData) {
    let headers = cloneDeep(this.getHeadersDefault(clientData))

    const tokenType = authData.tokenObject !== undefined ? authData.tokenObject.tokenType : undefined
    const accessToken = authData.tokenObject !== undefined ? authData.tokenObject.accessToken : undefined

    if (tokenType !== null && tokenType !== undefined && accessToken !== null && accessToken !== undefined) {
      headers.Authorization = `${tokenType} ${accessToken}`
    }

    return headers
  }
  static addContentTypeJSON(headers) {
    if (headers === undefined){
      throw new Error('headers object parameter is required!')
    }
    headers['Content-Type'] = 'application/json; charset=UTF-8'
    return headers
  }
}

export default Headers
