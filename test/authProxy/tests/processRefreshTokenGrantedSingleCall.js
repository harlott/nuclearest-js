import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

import getConfigRefreshTokenByStorage from '../commons/getConfigRefreshTokenByStorage'
import authResponseHandler from '../commons/authResponseHandler'
import mockedApiCalls from '../commons/mockedApiCalls'

chai.use(chaiAsPromised)

const processRefreshTokenGrantedSingleCall = () => {
  return it('expect to process token granted single call', async () => {
    let __filesystem1__ = {}
    const customConfigRefreshToken = getConfigRefreshTokenByStorage(__filesystem1__ , 'fileSystem1')
    const mockedCalls = new mockedApiCalls(customConfigRefreshToken.getAuthData)
    try {
      await authResponseHandler(customConfigRefreshToken, mockedCalls.fetchNoAuth)
    } catch(e) {
      if (e.ok === undefined){
        throw new Error(e)
      }
    }
  })
}

export default processRefreshTokenGrantedSingleCall
