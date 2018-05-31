import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

import getConfigRefreshTokenByStorage from '../commons/getConfigRefreshTokenByStorage'
import authResponseHandler from '../commons/authResponseHandler'
import mockedApiCalls from '../commons/mockedApiCalls'

chai.use(chaiAsPromised)


const processRefreshTokenDeniedMultipleCalls = () => {
  return it('expect to fail authentication, fail refresh token and process any call', async () => {
    let __filesystem3__ = {}
    const customConfigRefreshToken = getConfigRefreshTokenByStorage(__filesystem3__ , 'fileSystem3')
    const mockedCalls = new mockedApiCalls(customConfigRefreshToken.getAuthData)
    customConfigRefreshToken.refreshTokenMethod = mockedCalls.refreshTokenNoAuth

    try {
      const {
        callRes1,
        callRes2,
        callRes3,
        callRes4,
        callRes5
      } = await Promise.all(
        [
          authResponseHandler(customConfigRefreshToken, mockedCalls.fetchNoAuth),
          authResponseHandler(customConfigRefreshToken, mockedCalls.fetchNoAuth),
          authResponseHandler(customConfigRefreshToken, mockedCalls.fetchNoAuth),
          authResponseHandler(customConfigRefreshToken, mockedCalls.fetchNoAuth),
          authResponseHandler(customConfigRefreshToken, mockedCalls.fetchNoAuth)
        ]
      )
    } catch(e){
      if (e === undefined){
        throw new Error(e)
      }
    }
  })
}

export default processRefreshTokenDeniedMultipleCalls