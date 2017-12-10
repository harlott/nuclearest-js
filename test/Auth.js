import Auth from '../src/Auth'
import chai, {expect, assert} from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
//const expect = require('chai').expect
//const assert = require('chai').assert
const debug = false

const logger = (msg) => {
  if (debug === true ){
      console.log(msg)
  }
}

describe('Auth', function(){

  const refreshTokenNoAuth = () => {
    logger('BEFORE REFRESH TOKEN POST')
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

  const refreshTokenAuth = () => {
    logger('BEFORE REFRESH TOKEN POST')
    return new Promise((resolve, reject)=>{
      resolve({
        ok: true,
        status: 200,
        json: () => {
          return new Promise((resolve) => {
            resolve({
              accessToken: '2222',
              refreshToken: '3333'
            })
          })
        }
      })
    })
  }

  const fetchNoAuth  = (authData) => {
      return new Promise((resolve, reject)=>{
        if (authData.tokenObject.accessToken === '11111'){
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
        } else {
          resolve({
            ok: true,
            status: 200,
            json: () => {
              return new Promise((resolve) => {
                resolve({
                  a: 1
                })
              })
            }
          })
        }

      })
  }

  const fetchAuth = () => {
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

  const fetchError = () => {
    return new Promise((resolve, reject)=>{
      reject({
        ok: false,
        status: 405,
        json: () => {
          return new Promise((resolve) => {
            resolve({code: 'METHOD_NOT ALLOWED'})
          })
        }
      })
    })
  }

  it('expect to execute api method with authorization granted', async () => {
    const successCallback = async (json, response) => {
      const res = await response
      const jsonRes = await res.json
      console.log(JSON.stringify(jsonRes))
      /*response.json().then((json) => {
        expect(response.ok).to.be.equal(true)

        logger(`JSON IS ${JSON.stringify(json)}`)
      })*/
    }

    const errorCallback = (json, status) => {
      expect(response.ok).to.be.equal(false)
      done()
      logger(status)
      logger('ERROR')

    }

    const auth = new Auth(() => {}, () => {}, () => {}, {})
    auth.proxy({tokenObject:{accessToken: '11111'}}, fetchAuth, successCallback, errorCallback)
  })

  it('expect to execute error callback with error status', (done) => {
    const successCallback = (json, response) => {
      response.json().then((json) => {
        expect(response.ok).to.be.equal(true)
        done()
        logger(`JSON IS ${JSON.stringify(json)}`)
      })
    }

    const errorCallback = (json, status) => {
      logger(status)
      done()

      expect(status).to.be.equal(405)
      logger(status)
      logger('ERROR')

    }

    const auth = new Auth(() => {}, () => {}, () => {}, {})
    auth.proxy({tokenObject:{accessToken: '11111'}}, fetchError, successCallback, errorCallback)
  })

  it('expect to process and fail refresh token with authorization failed', (done) => {
    const successCallback = (json, response) => {
      logger('SUCCESS CALLBACK')
      response.json().then((json) => {
        expect(response.ok).to.be.equal(true)
        done()
        logger(`JSON IS ${JSON.stringify(json)}`)
      })
    }

    const errorCallback = (json, status) => {
      logger(`ERROR IN REFRESH TOKEN${status}`)
      done()
      expect(status).to.be.equal(401)

      logger(status)
      logger('ERROR')

    }


    const resetAuthentication = () => {
      logger('RESET AUTHENTICATION - END')
      done()
    }

    const beforeRefreshTokenCallback = () => {
      logger('BEFORE REFRESH TOKEN PROCESS CALLBACK')
    }

    const auth = new Auth(refreshTokenNoAuth, () => {}, resetAuthentication, {beforeRefreshTokenCallback: beforeRefreshTokenCallback, debug: false})
    auth.proxy({tokenObject:{accessToken: '11111'}}, fetchNoAuth, successCallback, errorCallback)
  })

  it('expect to process and post refresh token', (done) => {
    const successCallback = (json, response) => {
      logger('SUCCESS CALLBACK')
      response.json().then((json) => {
        expect(response.ok).to.be.equal(true)
        done()
        logger(`JSON IS ${JSON.stringify(json)}`)
      })
    }

    const errorCallback = (json, status) => {
      logger(`ERROR IN REFRESH TOKEN${status}`)
      done()
      expect(status).to.be.equal(401)

      logger(status)
      logger('ERROR')

    }


    const resetAuthentication = () => {
      logger('RESET AUTHENTICATION - END')
      done()
    }

    const beforeRefreshTokenCallback = () => {
      logger('BEFORE REFRESH TOKEN PROCESS CALLBACK')
    }

    const auth = new Auth(refreshTokenAuth, () => {}, resetAuthentication, {beforeRefreshTokenCallback: beforeRefreshTokenCallback, debug: false})
    auth.proxy({tokenObject:{accessToken: '11111'}}, fetchNoAuth, successCallback, errorCallback)
  })

  it('expect to fail authentication, post refresh token and process multiple calls ', (done) => {
    let hasDone = false

    const processAsync = () => {
      if (hasDone === false){
        hasDone = true
        done()
      }
    }

    const successCallback = (json, response) => {
      logger('SUCCESS CALLBACK')
      response.json().then((json) => {
        expect(response.ok).to.be.equal(true)

        processAsync()
        logger(`JSON IS ${JSON.stringify(json)}`)
      })
    }

    const errorCallback = (json, status) => {
      logger(`ERROR IN REFRESH TOKEN${status}`)
      processAsync()
      expect(status).to.be.equal(401)

      logger(status)
      logger('ERROR')

    }

    const confirmAuthentication = (authData) => {
      logger(`CONFIRM AUTH WITH AUTH DATA => ${JSON.stringify(authData)}`)
    }
    const resetAuthentication = () => {
      logger('RESET AUTHENTICATION - END')
      processAsync()
    }

    const beforeRefreshTokenCallback = () => {
      logger('BEFORE REFRESH TOKEN PROCESS CALLBACK')
    }

    const auth = new Auth(refreshTokenAuth, confirmAuthentication, resetAuthentication, {beforeRefreshTokenCallback: beforeRefreshTokenCallback, debug: false})
    for (let i=0; i < 10; i += 1){
        auth.proxy({tokenObject:{accessToken: '11111'}}, fetchNoAuth, successCallback, errorCallback)
    }
  })

  it('expect to fail authentication, fail refresh token and process any call', (done) => {
    let hasDone = false

    const processAsync = () => {
      if (hasDone === false){
        hasDone = true
        done()
      }
    }

    const successCallback = (json, response) => {
      logger('SUCCESS CALLBACK')
      response.json().then((json) => {
        expect(response.ok).to.be.equal(true)

        processAsync()
        logger(`JSON IS ${JSON.stringify(json)}`)
      })
    }

    const errorCallback = (json, status) => {
      logger(`ERROR IN REFRESH TOKEN${status}`)
      processAsync()
      expect(status).to.be.equal(401)

      logger(status)
      logger('ERROR')

    }

    const resetAuthentication = () => {
      logger('RESET AUTHENTICATION - END')
      processAsync()
    }

    const beforeRefreshTokenCallback = () => {
      logger('BEFORE REFRESH TOKEN PROCESS CALLBACK')
      //done()
    }

    const auth = new Auth(refreshTokenNoAuth, () => {}, resetAuthentication, {beforeRefreshTokenCallback: beforeRefreshTokenCallback, debug: false})
    for (let i=0; i < 10; i += 1){
        auth.proxy({tokenObject:{accessToken: '11111'}}, fetchNoAuth, successCallback, errorCallback)
    }
  })

})
