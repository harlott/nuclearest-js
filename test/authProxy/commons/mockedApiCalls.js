import MOCKED_RESPONSES from './mockedResponses'
let getAuthData = null
class mockedApiCalls{
  constructor(getAuthDataParam){
    getAuthData = getAuthDataParam;
  }

  refreshTokenNoAuth(){
    return new Promise((resolve, reject)=> {
      reject(MOCKED_RESPONSES.NOT_AUTH)
    })
  }

  refreshTokenAuth() {
    return new Promise((resolve)=>{
      resolve(MOCKED_RESPONSES.REFRESH_TOKEN_GRANTED)
    })
  }

  fetchNoAuth() {
    console.log(`fetchNoAuth: current token = ${getAuthData().tokenObject.accessToken}`)
    if (getAuthData().tokenObject.accessToken === '11111'){
      return new Promise((resolve, reject) => {
        reject(MOCKED_RESPONSES.NOT_AUTH)
      })
    } else {
      return new Promise((resolve) => {
        resolve(MOCKED_RESPONSES.GENERIC_SUCCESS)
      })
    }
  }

  fetchAuth() {
    return new Promise((resolve)=>{
      resolve(MOCKED_RESPONSES.GENERIC_SUCCESS)
    })
  }

  fetchError() {
    return Promise.reject(MOCKED_RESPONSES.GENERIC_ERROR)
  }
}

 export default mockedApiCalls