import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'

class Headers {
  static getHeadersDefault(clientData) {
    let headers = {
      'Accept': 'application/json'
    }
    if (get(clientData, 'lang') !== undefined){
      headers['Accept-Language'] = get(clientData, 'lang')
    }
    return headers
  }

  static getHeadersWithClientAuthentication(clientData) {
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
