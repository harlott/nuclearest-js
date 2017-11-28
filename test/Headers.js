import Headers, {headersMap} from '../src/Headers/index.js'

const expect = require('chai').expect
const assert = require('chai').assert

describe('Headers', function(){
  describe('#default', function(){
    it('should be return defaults', function(){
      expect(new Headers().default()).to.be.empty
    })
  })
  describe('#use()', function(){
    it('should use custom header', function(){
      let _headers = new Headers()
      expect(_headers.add().custom('Accept', 'audio/base').use()).to.be.deep.equal({'Accept': 'audio/base'})
    })

    it('should use accept application json header', function(){
      let _headers = new Headers()
      expect(_headers.add().acceptApplicationJson().use()).to.be.deep.equal({'Accept': 'application/json'})
    })

    it('should remove accept application json header', function(){
      expect(new Headers().add().acceptApplicationJson().remove().acceptApplicationJson().use()).to.be.empty
    })

    it('should use accept language header', function(){
      let _langHeader = {}
      _langHeader[headersMap.ACCEPT_LANGUAGE] = 'IT'
      expect(new Headers().add().acceptLanguage('IT').use()).to.be.deep.equal(_langHeader)
    })

    it('should remove accept language header', function(){
      expect(new Headers().add().acceptLanguage('IT').remove().acceptLanguage().use()).to.be.empty
    })

  })
})

/*
describe('Headers', function(){

  const authKey = 'Authorization'
  const acceptKey = 'Accept'
  const acceptValue = 'application/json'
  const acceptLangKey = 'Accept-Language'
  const contentTypeKey = 'Content-Type'
  const contentTypeFormValue = 'application/x-www-form-urlencoded'
  const contentTypeJsonValue = 'application/json; charset=UTF-8'
  let clientData = {
    lang: 'IT'
  }
  let authData = {}
  authData.clientToken = '1111'
  authData.tokenObject = {
    tokenType: 'Bearer',
    accessToken: '2222'
  }
  describe('#getHeadersDefault()', function(){
    it('should get headers with clientData lang parameter', function(){
      expect(Headers.getHeadersDefault(clientData)).to.have.property(acceptKey).to.be.equal(acceptValue)
      expect(Headers.getHeadersDefault(clientData)).to.have.property(acceptLangKey).to.be.equal(clientData.lang)
    })
  })

  describe('#getHeadersWithClientAuthentication()', function(){
    it('should get headers with client authentication', function(){
      expect(Headers.getHeadersWithClientAuthentication()).to.have.property(contentTypeKey).to.be.equal(contentTypeFormValue)
    })
  })

  describe('#getHeadersWithBasicAuthentication()', function(){
    it('should get headers with client authentication', function(){
      expect(Headers.getHeadersWithBasicAuthentication(undefined, authData)).to.have.property(authKey).to.be.equal(`Basic ${authData.clientToken}`)
    })

  })

  describe('#getHeadersWithToken()', function(){
    it('should get headers with token', function(){
      expect(Headers.getHeadersWithToken(undefined, authData)).to.have.property(authKey).to.be.equal(`${authData.tokenObject.tokenType} ${authData.tokenObject.accessToken}`)
    })
  })

  describe('#addContentTypeJSON()', function(){
    it('should not get headers with json content type without headers object parameter', function(){
      try{
        expect(Headers.addContentTypeJSON())
      } catch(err){
        assert.ok(true);
      }
    })

    it('should get headers with json content type with headers object parameter', function(){
      expect(Headers.addContentTypeJSON(Headers.getHeadersDefault())).to.have.property(contentTypeKey).to.be.equal(contentTypeJsonValue)
    })
  })
})


*/
