import chai, {expect, assert} from 'chai'
import chaiAsPromised from 'chai-as-promised'

import getConfigRefreshTokenByStorage from '../commons/getConfigRefreshTokenByStorage'
import authResponseHandler from '../commons/authResponseHandler'
import mockedApiCalls from '../commons/mockedApiCalls'

chai.use(chaiAsPromised)

const processAuthCallWithGrantedToken = () => {
  return it('expect to process auth call with granted token', async () => {
    let __filesystem1__ = {}
    const customConfigRefreshToken = getConfigRefreshTokenByStorage(__filesystem1__ , 'fileSystem1')
    const mockedCalls = new mockedApiCalls(customConfigRefreshToken.getAuthData)
    try {
      await authResponseHandler(customConfigRefreshToken, mockedCalls.fetchAuth)
    } catch (e) {
      if (e.ok !== true){
        throw new Error(e)
      }
    }
  })
}

export default processAuthCallWithGrantedToken

