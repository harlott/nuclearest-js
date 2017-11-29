import Headers, {headersMap, headersValuesMap} from '../src/Headers/index.js'

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
      expect(new Headers().add().custom('Accept', 'audio/base').use()).to.have.property(headersMap.ACCEPT).to.be.equal('audio/base')
    })

    it('should use accept application json header', function(){
      expect(new Headers().add().acceptApplicationJson().use()).to.have.property(headersMap.ACCEPT).to.be.equal(headersValuesMap.JSON)
    })

    it('should remove accept application json header', function(){
      expect(new Headers().add().acceptApplicationJson().remove().acceptApplicationJson().use()).to.be.empty
    })

    it('should use accept language header', function(){
      expect(new Headers().add().acceptLanguage('IT').use()).to.have.property(headersMap.ACCEPT_LANGUAGE).to.be.equal('IT')
    })

    it('should remove accept language header', function(){
      expect(new Headers().add().acceptLanguage('IT').remove().acceptLanguage().use()).to.be.empty
    })

    it('should use contentTypeJsonUtf8 header', function(){
      expect(new Headers().add().contentTypeJsonUtf8().use()).to.have.property(headersMap.CONTENT_TYPE).to.be.equal(headersValuesMap.JSON_UTF8)
    })

    it('should remove contentTypeJsonUtf8 header', function(){
      expect(new Headers().remove().contentTypeJsonUtf8().use()).to.be.empty
    })

    it('should use oauthClientAuthentication header', function(){
      expect(new Headers().add().oauthClientAuthentication().use()).to.have.property(headersMap.CONTENT_TYPE).to.be.equal(headersValuesMap.FORM_URL_ENCODED)
    })

    it('should remove oauthClientAuthentication header', function(){
      expect(new Headers().remove().oauthClientAuthentication().use()).to.be.empty
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
