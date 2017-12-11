import Auth from '../src/Auth'
import chai, {expect, assert} from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)

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

  function fetchError(){
    return Promise.reject(new Error({
      ok: false,
      status: 405,
      json: () => {
        return new Promise((resolve) => {
          resolve({code: 'METHOD_NOT ALLOWED'})
        })
      }
    })
    )

  }

  it('expect to execute api method with authorization granted', async () => {
    const auth = new Auth(() => {}, () => {}, () => {}, {beforeRefreshTokenCallback: () => {}, debug: false})
    const callRes = await auth.proxy({tokenObject:{accessToken: '11111'}}, fetchAuth)
    console.log(`CALL RES = ${JSON.stringify(callRes)}`)
    expect(callRes.ok).to.be.equal(true)
  })

  it('expect to execute error callback with error status', async () => {
    const auth = new Auth(() => {}, () => {}, () => {}, {beforeRefreshTokenCallback: () => {}, debug: true})
    let callRes
    callRes = await auth.proxy({tokenObject:{accessToken: '11111'}}, fetchError)
    console.log(`SUCCESS API CALL ERROR ${JSON.stringify(callRes)}`)
    expect(callRes.status).to.be.equal(405)
  })

  it('expect to process and fail refresh token with authorization failed', async () => {
    const resetAuthentication = () => {
      logger('RESET AUTHENTICATION - END')
    }

    const beforeRefreshTokenCallback = () => {
      logger('BEFORE REFRESH TOKEN PROCESS CALLBACK')
    }

    const auth = new Auth(refreshTokenNoAuth, () => {}, resetAuthentication, {beforeRefreshTokenCallback: beforeRefreshTokenCallback, debug: true})
    const callRes = await auth.proxy({tokenObject:{accessToken: '11111'}}, fetchNoAuth)
  })

  it('expect to process and post refresh token', async () => {
    const resetAuthentication = () => {
      logger('RESET AUTHENTICATION - END')
      done()
    }

    const beforeRefreshTokenCallback = () => {
      logger('BEFORE REFRESH TOKEN PROCESS CALLBACK')
    }

    const auth = new Auth(refreshTokenAuth, () => {}, resetAuthentication, {beforeRefreshTokenCallback: beforeRefreshTokenCallback, debug: false})
    const callRes = await auth.proxy({tokenObject:{accessToken: '11111'}}, fetchNoAuth)
  })

  it('expect to fail authentication, post refresh token and process multiple calls ', async () => {
    let hasDone = false

    const processAsync = () => {
      if (hasDone === false){
        hasDone = true
      }
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
        const callRes = await auth.proxy({tokenObject:{accessToken: '11111'}}, fetchNoAuth)
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

    const auth = new Auth(refreshTokenNoAuth, () => {}, resetAuthentication, {beforeRefreshTokenCallback: beforeRefreshTokenCallback, debug: false})
    for (let i=0; i < 10; i += 1){
        const callRes = await auth.proxy({tokenObject:{accessToken: '11111'}}, fetchNoAuth)
    }
  })

})
