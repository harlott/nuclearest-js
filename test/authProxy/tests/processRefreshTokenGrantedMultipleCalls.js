import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

import getConfigRefreshTokenByStorage from '../commons/getConfigRefreshTokenByStorage'
import authResponseHandler from '../commons/authResponseHandler'
import mockedApiCalls from '../commons/mockedApiCalls'

chai.use(chaiAsPromised)

const processRefreshTokenGrantedMultipleCalls = () => {
  it('expect to fail authentication, post refresh token and process multiple calls ', async () => {
    let __filesystem4__ = {}
    const customConfigRefreshToken = getConfigRefreshTokenByStorage(__filesystem4__ , 'fileSystem4')
    const mockedCalls = new mockedApiCalls(customConfigRefreshToken.getAuthData)
    try {
      await Promise.all(
          [
            authResponseHandler(customConfigRefreshToken, mockedCalls.fetchNoAuth),
            authResponseHandler(customConfigRefreshToken, mockedCalls.fetchNoAuth),
            authResponseHandler(customConfigRefreshToken, mockedCalls.fetchNoAuth),
            authResponseHandler(customConfigRefreshToken, mockedCalls.fetchNoAuth),
            authResponseHandler(customConfigRefreshToken, mockedCalls.fetchNoAuth)
          ]
      )
    } catch(e){
      console.log(customConfigRefreshToken.getAuthData().tokenObject)
      if (e.ok !== true){
        throw new Error(JSON.stringify(e))
      }
    }
  })
}

export default processRefreshTokenGrantedMultipleCalls