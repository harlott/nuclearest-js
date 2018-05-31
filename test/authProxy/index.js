import processAuthCallWithGrantedToken from './tests/processAuthCallWithGrantedToken'
import processNoAuthCallWithDeniedToken from './tests/processNoAuthCallWithDeniedToken'
import processAuthCallWithError from './tests/processAuthCallWithError'
import processRefreshTokenGrantedSingleCall from './tests/processRefreshTokenGrantedSingleCall'
import processRefreshTokenGrantedMultipleCalls from './tests/processRefreshTokenGrantedMultipleCalls'
import processRefreshTokenDeniedMultipleCalls from './tests/processRefreshTokenDeniedMultipleCalls'

describe('authProxy', () => {
  processAuthCallWithGrantedToken();
  processNoAuthCallWithDeniedToken();
  processAuthCallWithError();
  processRefreshTokenGrantedSingleCall();
  processRefreshTokenGrantedMultipleCalls();
  processRefreshTokenDeniedMultipleCalls();
})
