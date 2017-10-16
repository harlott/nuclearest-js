const Headers = {
  getHeadersDefault: function (clientData) {
    const lang = clientData.session.getLang() || 'en'

    let headers = {
      'Accept': 'application/json',
      'Accept-Language': lang
    }

    return headers
  },
  getHeadersWithClientAuthentication: function (clientData) {
    let headers = this.getHeadersDefault(clientData)
    headers['Content-Type'] = 'application/x-www-form-urlencoded'

    return headers
  },
  getHeadersWithBasicAuthentication: function (clientData, authData) {
    let headers = this.getHeadersDefault(clientData)

    headers['Content-Type'] = 'application/x-www-form-urlencoded'

    if (!!authData.clientToken) {
      headers['Authorization'] = 'Basic ' + authData.clientToken
    }

    return headers
  },
  getHeadersWithToken: function (clientData, authData) {
    let headers = this.getHeadersDefault(clientData)

    const tokenType = !!authData.tokenObject ? authData.tokenObject.tokenType : undefined
    const accessToken = !!authData.tokenObject ? authData.tokenObject.accessToken : undefined

    if (tokenType !== null && typeof tokenType !== 'undefined' && accessToken !== null && typeof accessToken !== 'undefined') {
      headers['Authorization'] = tokenType + ' ' + accessToken
    }

    return headers
  },
  addContentTypeJSON: function (headers) {
    headers['Content-Type'] = 'application/json; charset=UTF-8'
    return headers
  }
}

export default Headers
