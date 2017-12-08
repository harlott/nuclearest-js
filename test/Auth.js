import Auth from '../src/Auth'
import 'isomorphic-fetch'
const expect = require('chai').expect
const assert = require('chai').assert

describe('Auth', function(){

  it('expect to execute api method with authorization granted', (done) => {

    const action  = () => {
      return new Promise((resolve, reject)=>{
        reject({
          ok: true,
          status: 200,
          json: () => {
            return new Promise((resolve) => {
              resolve({a: 1})
            })
          }
        })
      })
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

    const auth = new Auth(() => {}, () => {}, () => {}, {})
    auth.proxy({authData:{tokenObject:{accessToken: '11111'}}}, action, successCallback, errorCallback)
  })

  it('expect to  execute error callback with error status', (done) => {
    const action  = () => {
    return new Promise((resolve, reject)=>{
      reject({
        ok: false,
        status: 405,
        json: () => {
          return new Promise((resolve) => {
            resolve({code: 'METHOD NOT ALLOWED'})
          })
        }
      })
    })
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

      expect(status).to.be.equal(405)
      console.log(status)
      console.log('ERROR')

    }

    const auth = new Auth(() => {}, () => {}, () => {}, {})
    auth.proxy({authData:{tokenObject:{accessToken: '11111'}}}, action, successCallback, errorCallback)
  })

  it('expect to process and fail refresh token with authorization failed', (done) => {
    const refreshToken = () => {
      console.log('BEFORE REFRESH TOKEN POST')

      return new Promise((resolve, reject)=>{
        reject({
          ok: false,
          status: 401,
          json: () => {
            return new Promise((resolve) => {
              resolve({
                code: 'NOT_AUTHORIZED',
                message: 'Not authorized!'
              })
            })
          }
        })
      })
    }

    const action  = () => {
        return new Promise((resolve, reject)=>{
          reject({
            ok: false,
            status: 401,
            json: () => {
              return new Promise((resolve) => {
                resolve({
                  code: 'NOT_AUTHORIZED',
                  message: 'Not authorized!'
                })
              })
            }
          })
        })
    }

    const successCallback = (json, response) => {
      console.log('SUCCESS CALLBACK')
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

    const beforeRefreshTokenCallback = () => {
      console.log('BEFORE REFRESH TOKEN PROCESS CALLBACK')
      //done()
    }

    const auth = new Auth(refreshToken, () => {}, resetAuthentication, {beforeRefreshTokenCallback: beforeRefreshTokenCallback, debug: false})
    auth.proxy({authData:{tokenObject:{accessToken: '11111'}}}, action, successCallback, errorCallback)
  })
})
