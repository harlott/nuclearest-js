import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

import getConfigRefreshTokenByStorage from '../commons/getConfigRefreshTokenByStorage'
import authResponseHandler from '../commons/authResponseHandler'
import mockedApiCalls from '../commons/mockedApiCalls'

chai.use(chaiAsPromised)

const processRefreshTokenGrantedMultipleCalls = () => {
  it('expect to fail authentication, post refresh token and process multiple calls ', async () => {
    let __filesystem3__ = {}
    const customConfigRefreshToken = getConfigRefreshTokenByStorage(__filesystem3__ , 'fileSystem3')
    const mockedCalls = new mockedApiCalls(customConfigRefreshToken.getAuthData)
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
      if (e.ok !== true){
        throw new Error(JSON.stringify(e))
      }
    }
  })
}

export default processRefreshTokenGrantedMultipleCalls