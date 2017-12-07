import Auth from '../src/Auth'
const fetchMock = require('fetch-mock');
import 'isomorphic-fetch'
const expect = require('chai').expect
const assert = require('chai').assert

describe('Auth', function(){
  it('expect to execute api method with authorization granted', (done) => {
    fetchMock.get("http://localhost/go", {status: 200, ok: true, body: {a: 1}});

    const action  = () => {
        return fetch('http://localhost/go', {method: 'GET'})
    }

    const successCallback = (json, response) => {
      response.json().then((json) => {
        expect(response.ok).to.be.equal(true)
        done()
        console.log(`JSON IS ${JSON.stringify(json)}`)
      })
    }

    const errorCallback = (json, status) => {
      expect(response.ok).to.be.equal(false)
      done()
      console.log(status)
      console.log('ERROR')

    }

    let auth = new Auth(() => {}, () => {}, () => {}, {})
    auth.proxy({authData:{tokenObject:{accessToken: '11111'}}}, action, successCallback, errorCallback)
    fetchMock.restore();
  })

  it('expect to  execute error callback with error status', (done) => {
    fetchMock.get("http://localhost/go", {status: 404, ok: false, body: {error: {code: 'NOT_FOUND', message: 'Not found!'}}});

    const action  = () => {
        return fetch('http://localhost/go', {method: 'GET'})
    }

    const successCallback = (json, response) => {
      response.json().then((json) => {
        expect(response.ok).to.be.equal(true)
        done()
        console.log(`JSON IS ${JSON.stringify(json)}`)
      })
    }

    const errorCallback = (json, status) => {
      console.log(status)
      done()
      expect(status).to.be.equal(401)

      console.log(status)
      console.log('ERROR')

    }

    let auth = new Auth(() => {}, () => {}, () => {}, {})
    auth.proxy({authData:{tokenObject:{accessToken: '11111'}}}, action, successCallback, errorCallback)
    fetchMock.restore();
  })

  it('expect to process and fail refresh token with authorization failed', (done) => {
    fetchMock.get("http://localhost/go", {status: 401, ok: false, body: {error: {code: 'NOT_AUTHORIZED', message: 'Not Authorized!'}}});
    fetchMock.mock('http://localhost/refresh-token', {status: 401, ok: false})

    const refreshToken = () => {
      return fetch('http://localhost/refresh-token', {method: 'POST'})
    }

    const action  = () => {
        return fetch('http://localhost/go', {method: 'GET'})
    }

    const successCallback = (json, response) => {
      response.json().then((json) => {
        expect(response.ok).to.be.equal(true)
        done()
        console.log(`JSON IS ${JSON.stringify(json)}`)
      })
    }

    const errorCallback = (json, status) => {
      console.log(`ERROR IN REFRESH TOKEN${status}`)
      done()
      expect(status).to.be.equal(401)

      console.log(status)
      console.log('ERROR')

    }

    const resetAuthentication = () => {
      console.log('RESET AUTHENTICATION - END')
      done()
    }

    let auth = new Auth(refreshToken, () => {}, resetAuthentication, {})
    auth.proxy({authData:{tokenObject:{accessToken: '11111'}}}, action, successCallback, errorCallback)
    fetchMock.restore();
  })
})
