import Headers from '../src/Headers'

const expect = require('chai').expect
const assert = require('chai').assert

describe('Headers', function(){
  it('#getHeadersDefault()', function(){
    let clientData = {
      lang: 'IT'
    }
    expect(Headers.getHeadersDefault(clientData)).to.have.property('Accept').to.be.equal('application/json')
    expect(Headers.getHeadersDefault(clientData)).to.have.property('Accept-Language').to.be.equal('IT')
  })

  it('#getHeadersWithClientAuthentication()', function(){
    expect(Headers.getHeadersWithClientAuthentication()).to.have.property('Content-Type').to.be.equal('application/x-www-form-urlencoded')
  })

  it('#getHeadersWithBasicAuthentication()', function(){
    let authData = {}
    authData.clientToken = '1111'
    expect(Headers.getHeadersWithBasicAuthentication(undefined, authData)).to.have.property('Authorization').to.be.equal('Basic 1111')
  })
})
