import Headers from '../src/Headers'

const expect = require('chai').expect
const assert = require('chai').assert

describe('Headers', function(){
  it('#getHeadersDefault()', function(){
    expect(Headers.getHeadersDefault()).to.have.property('Accept').to.be.equal('application/json')
  })

  it('#getHeadersWithClientAuthentication()', function(){
    expect(Headers.getHeadersWithClientAuthentication()).to.have.property('Content-Type').to.be.equal('application/x-www-form-urlencoded')    
  })
})
