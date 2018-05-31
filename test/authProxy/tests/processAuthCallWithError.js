import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

import getConfigRefreshTokenByStorage from '../commons/getConfigRefreshTokenByStorage'
import authResponseHandler from '../commons/authResponseHandler'
import mockedApiCalls from '../commons/mockedApiCalls'

chai.use(chaiAsPromised)

const processAuthCallWithError = () => {
  return it('expect to process auth call with error status', async () => {
    let __filesystem1__ = {}
    const customConfigRefreshToken = getConfigRefreshTokenByStorage(__filesystem1__ , 'fileSystem1')
    const mockedCalls = new mockedApiCalls(customConfigRefreshToken.getAuthData)

    try {
      await authResponseHandler(customConfigRefreshToken, mockedCalls.fetchError)
    } catch(e) {
      if (e.ok === undefined){
        throw new Error(e)
      }
    }
  })
}

export default processAuthCallWithError
