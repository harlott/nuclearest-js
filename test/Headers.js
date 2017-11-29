import Headers, {headersMap, headersValuesMap} from '../src/Headers'

const expect = require('chai').expect
const assert = require('chai').assert

describe('Headers', function(){
  let authData = {}
  authData.clientToken = '1111'
  authData.tokenObject = {
    tokenType: 'Bearer',
    accessToken: '2222'
  }
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

    it('should use oauthBasicAuthentication header', function(){
      expect(new Headers().add().oauthBasicAuthentication(authData).use()).to.have.property(headersMap.AUTHORIZATION).to.be.equal(`Basic ${authData.clientToken}`)
    })

    it('should oauthBasicAuthentication header not defined if authData not passed ', function(){
      expect(new Headers().add().oauthBasicAuthentication().use()).to.not.have.property(headersMap.AUTHORIZATION)
    })

    it('should remove oauthBasicAuthentication header', function(){
      expect(new Headers().remove().oauthBasicAuthentication().use()).to.be.empty
    })

    it('should use oauthToken header', function(){
      expect(new Headers().add().oauthToken(authData).use()).to.have.property(headersMap.AUTHORIZATION).to.be.equal(`${authData.tokenObject.tokenType} ${authData.tokenObject.accessToken}`)
    })

    it('should remove oauthToken header', function(){
      expect(new Headers().remove().oauthToken().use()).to.be.empty
    })

    it('should oauthToken header not defined if authData not passed ', function(){
      expect(new Headers().add().oauthToken().use()).to.not.have.property(headersMap.AUTHORIZATION)
    })

    it('should add default header', function(){
      let _headers = new Headers()
      _headers
        .addDefault()
        .acceptApplicationJson()
        .add()
        .acceptLanguage('EN')
        .contentTypeJsonUtf8()
      expect(_headers.use()).to.have.property(headersMap.ACCEPT)
      expect(_headers.use()).to.have.property(headersMap.ACCEPT_LANGUAGE)
    })

    it('should init not defaults headers', function(){
      let _headers = new Headers()
      _headers
        .addDefault()
        .acceptApplicationJson()
        .add()
        .acceptLanguage('EN')
        .contentTypeJsonUtf8()

      expect(_headers.init()).to.have.property(headersMap.ACCEPT)
      expect(_headers.init()).to.not.have.property(headersMap.ACCEPT_LANGUAGE)
    })

    it('should init all headers', function(){
      let _headers = new Headers()
      _headers
        .addDefault()
        .acceptApplicationJson()
        .add()
        .acceptLanguage('EN')
        .contentTypeJsonUtf8()

      expect(_headers.initAll()).to.be.empty
    })
  })
})
