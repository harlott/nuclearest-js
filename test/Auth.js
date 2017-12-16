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
    console.log(`fetchNoAuth: authData = ${JSON.stringify(authData)}`)
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
    return Promise.reject({
        ok: false,
        status: 405,
        json: () => {
          return Promise.resolve({code: 'METHOD_NOT ALLOWED'})
        }
      }
      )
  }

  const getAuthData = () => {
    return tokenRefreshed
  }

  let tokenRefreshed = {tokenObject:{accessToken: '11111'}}

  const authConfirmCallback = (newTokenObject) => {
    tokenRefreshed = cloneDeep(newTokenObject)
  }

  it('expect to execute api method with authorization granted', async () => {
    tokenRefreshed = {tokenObject:{accessToken: '11111'}}
    let auth
    try {
      auth = new Auth(() => {}, () => {}, () => {}, {beforeRefreshTokenCallback: () => {}, debug: false})
      const callRes = await auth.proxy(getAuthData, fetchAuth)
      console.log(`CALL RES = ${JSON.stringify(callRes)}`)
      expect(callRes.ok).to.be.equal(true)
    } catch(err){
      return err
    }


  })

  it('expect to execute error callback with error status', async () => {
    tokenRefreshed = {tokenObject:{accessToken: '11111'}}

    try{
        const auth = new Auth(() => {}, () => {}, () => {}, {beforeRefreshTokenCallback: () => {}, debug: false})
        const callRes = await auth.proxy(getAuthData, fetchError)
        console.log(`TRY CALL RES => ${JSON.stringify(callRes)}`)

    } catch(err){
        try {
            const errorProcessed = await err
            console.log(`CATCH CALL RES ERROR PROCESSED => ${JSON.stringify(errorProcessed)}`)
        } catch(error){
          console.log(`ERR ${error}`)
          return error
        }

        console.log(`CATCH CALL RES => ${JSON.stringify(err)}`)
        return err
    }
  })

  it('expect to process and fail refresh token with authorization failed', async () => {
    tokenRefreshed = {tokenObject:{accessToken: '11111'}}
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
    tokenRefreshed = cloneDeep({tokenObject:{accessToken: '11111'}})

    const resetAuthentication = () => {
      logger('RESET AUTHENTICATION - END')
    }

    const beforeRefreshTokenCallback = () => {
      logger('BEFORE REFRESH TOKEN PROCESS CALLBACK')
    }

    let auth
    try {
      auth = new Auth(refreshTokenAuth, authConfirmCallback, resetAuthentication, {beforeRefreshTokenCallback: beforeRefreshTokenCallback, debug: false})
    } catch(err){
        return console.log(`ERROR ON INSTANCE ${JSON.stringify(err)}`)
    }

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
    tokenRefreshed = cloneDeep({tokenObject:{accessToken: '11111'}})
    const resetAuthentication = () => {
      logger('RESET AUTHENTICATION - END')
    }

    const beforeRefreshTokenCallback = () => {
      logger('BEFORE REFRESH TOKEN PROCESS CALLBACK')
    }

      try {
        const auth = new Auth(refreshTokenAuth, authConfirmCallback, resetAuthentication, {beforeRefreshTokenCallback: beforeRefreshTokenCallback, debug: true})
        const callRes = await auth.proxy(getAuthData, fetchNoAuth)
      } catch(err){
        console.log('ERR')
      }
  })

  it('expect to fail authentication, fail refresh token and process any call', async () => {
    let hasDone = false
    tokenRefreshed = cloneDeep({tokenObject:{accessToken: '11111'}})

    const resetAuthentication = () => {
      logger('RESET AUTHENTICATION - END')
    }

    const beforeRefreshTokenCallback = () => {
      logger('BEFORE REFRESH TOKEN PROCESS CALLBACK')
    }

    let auth
    try {
      auth = new Auth(refreshTokenNoAuth, authConfirmCallback, resetAuthentication, {beforeRefreshTokenCallback: beforeRefreshTokenCallback, debug: true})
    } catch(err){
      return err
    }



    try {
      const callRes1 = await auth.proxy(getAuthData, fetchNoAuth)
      const callRes2 = await auth.proxy(getAuthData, fetchNoAuth)
      const callRes3 = await auth.proxy(getAuthData, fetchNoAuth)
      const callRes4 = await auth.proxy(getAuthData, fetchNoAuth)
      const callRes5 = await auth.proxy(getAuthData, fetchNoAuth)
      const callRes6 = await auth.proxy(getAuthData, fetchNoAuth)
      const callRes7 = await auth.proxy(getAuthData, fetchNoAuth)
      const callRes8 = await auth.proxy(getAuthData, fetchNoAuth)
      const callRes9 = await auth.proxy(getAuthData, fetchNoAuth)
      const callRes10 = await auth.proxy(getAuthData, fetchNoAuth)
      const callRes11 = await auth.proxy(getAuthData, fetchNoAuth)
      const callRes12 = await auth.proxy(getAuthData, fetchNoAuth)
    } catch(err){
      console.log('ERR')
    }

  })

})
