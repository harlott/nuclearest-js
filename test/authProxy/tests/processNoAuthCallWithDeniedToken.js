import chai, {expect, assert} from 'chai'
import chaiAsPromised from 'chai-as-promised'

import getConfigRefreshTokenByStorage from '../commons/getConfigRefreshTokenByStorage'
import authResponseHandler from '../commons/authResponseHandler'
import mockedApiCalls from '../commons/mockedApiCalls'

chai.use(chaiAsPromised)

const processNoAuthCallWithDeniedToken = () => {
  return it('expect to process no authorized call with denied token', async () => {
    let __filesystem2__ = {}
    const customConfigRefreshToken = getConfigRefreshTokenByStorage(__filesystem2__, 'fileSystem2')
    const mockedCalls = new mockedApiCalls(customConfigRefreshToken.getAuthData)
    customConfigRefreshToken.refreshTokenMethod = mockedCalls.refreshTokenNoAuth

    try {
      await authResponseHandler(customConfigRefreshToken, mockedCalls.fetchNoAuth)
    } catch (e) {
      if (e.ok === undefined){
        throw new Error(e)
      }
    }
  })
}

export default processNoAuthCallWithDeniedToken



