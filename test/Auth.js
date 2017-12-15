import Auth from '../src/Auth'
import chai, {expect, assert} from 'chai'
import chaiAsPromised from 'chai-as-promised'
import cloneDeep from 'lodash/cloneDeep'

chai.use(chaiAsPromised)

const debug = true

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
    logger('refreshTokenAuth => BEFORE REFRESH TOKEN POST')
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

  const fetchNoAuth  = () => {
      let authData = getAuthData()
      if (authData.tokenObject.accessToken === '11111'){
        return new Promise((resolve, reject) => {
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
      } else {
        return new Promise((resolve) => {
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
        })
      }
  }

  const fetchAuth = () => {

    return new Promise((resolve)=>{
      resolve({
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

    return Promise((resolve, reject) => {
      reject({
        ok: false,
        status: 405,
        json: () => {
          return new Promise((resolve) => {
            resolve({code: 'METHOD_NOT ALLOWED'})
          })
        }
      }
      )
    })

  }

  const getAuthData = () => {
    return tokenRefreshed
  }

  let tokenRefreshed = {tokenObject:{accessToken: '11111'}}

  const authConfirmCallback = (newTokenObject) => {
    return cloneDeep(newTokenObject)
  }

  it('expect to execute api method with authorization granted', async () => {
    const auth = new Auth(() => {}, () => {}, () => {}, {beforeRefreshTokenCallback: () => {}, debug: false})
    const callRes = await auth.proxy(getAuthData, fetchAuth)
    console.log(`CALL RES = ${JSON.stringify(callRes)}`)
    expect(callRes.ok).to.be.equal(true)
  })

  it('expect to execute error callback with error status', async () => {
    const auth = new Auth(() => {}, () => {}, () => {}, {beforeRefreshTokenCallback: () => {}, debug: false})
    let callRes
    try{
        callRes = await auth.proxy(getAuthData, fetchError)
        console.log(`TRY CALL RES => ${JSON.stringify(callRes)}`)
        expect(callRes.status).to.be.equal(405)
    } catch(err){
        console.log(`CATCH CALL RES => ${JSON.stringify(err)}`)
        return err
    }
  })

  it('expect to process and fail refresh token with authorization failed', async () => {
    const resetAuthentication = () => {
      logger('RESET AUTHENTICATION - END')
    }

    const beforeRefreshTokenCallback = () => {
      logger('BEFORE REFRESH TOKEN PROCESS CALLBACK')
    }

    const auth = new Auth(refreshTokenNoAuth, () => {}, resetAuthentication, {beforeRefreshTokenCallback: beforeRefreshTokenCallback, debug: false})
    let callRes
    try {

        callRes = await auth.proxy(getAuthData, fetchNoAuth)
        logger(`AUTH FAIL => TRY AUTH`)
        throw new Error('Test fails: resolve instead of reject')
    } catch(err){
        logger(`AUTH FAIL => ERROR ${JSON.stringify(err)}`)
        expect(err.status).to.be.equal(401)
        return err
    }

  })

  it('expect to process and post refresh token', async () => {


    const resetAuthentication = () => {
      logger('RESET AUTHENTICATION - END')
    }

    const beforeRefreshTokenCallback = () => {
      logger('BEFORE REFRESH TOKEN PROCESS CALLBACK')
    }

    const auth = new Auth(refreshTokenAuth, authConfirmCallback, resetAuthentication, {beforeRefreshTokenCallback: beforeRefreshTokenCallback, debug: false})
    let callRes
    try {
      callRes = await auth.proxy(getAuthData, fetchNoAuth)
      logger(`expect to process and post refresh token => TRY AUTH => ${JSON.stringify(callRes)}`)
    } catch(err){
      logger(`CATCH AUTH => ${JSON.stringify(err)}`)
      return err
    }
  })

  it('expect to fail authentication, post refresh token and process multiple calls ', async () => {
    let hasDone = false

    const processAsync = () => {
      if (hasDone === false){
        hasDone = true
      }
    }

    const resetAuthentication = () => {
      logger('RESET AUTHENTICATION - END')
      processAsync()
    }

    const beforeRefreshTokenCallback = () => {
      logger('BEFORE REFRESH TOKEN PROCESS CALLBACK')
    }

    const auth = new Auth(refreshTokenAuth, authConfirmCallback, resetAuthentication, {beforeRefreshTokenCallback: beforeRefreshTokenCallback, debug: true})
    for (let i=0; i < 10; i += 1){
        try {
          const callRes = await auth.proxy(getAuthData, fetchNoAuth)
        } catch(err){
          console.log('ERR')
        }

    }
  })

  it('expect to fail authentication, fail refresh token and process any call', async () => {
    let hasDone = false

    const processAsync = () => {
      if (hasDone === false){
        hasDone = true
        done()
      }
    }

    const resetAuthentication = () => {
      logger('RESET AUTHENTICATION - END')
      processAsync()
    }

    const beforeRefreshTokenCallback = () => {
      logger('BEFORE REFRESH TOKEN PROCESS CALLBACK')
    }

    const auth = new Auth(refreshTokenNoAuth, authConfirmCallback, resetAuthentication, {beforeRefreshTokenCallback: beforeRefreshTokenCallback, debug: true})
    for (let i=0; i < 10; i += 1){
        const callRes = await auth.proxy(getAuthData, fetchNoAuth)
    }
  })

})
