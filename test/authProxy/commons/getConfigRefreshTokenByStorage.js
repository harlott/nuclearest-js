import MOCKED_RESPONSES from './mockedResponses'
import Storage, { buildCustomStorage, buildCustomStoragesMap} from '../../../src/Storage'

const getConfigRefreshTokenByStorage =  (customVariable, storageName) => {
  const refreshTokenAuth = () => {
    console.log('refreshTokenAuth => BEFORE REFRESH TOKEN POST')
    return new Promise((resolve)=>{
      resolve(MOCKED_RESPONSES.REFRESH_TOKEN_GRANTED)
    })
  }


  const createToken = (storageInstance) => {
    storageInstance.setItem('tokenObject', {accessToken: '11111', refreshToken: `2222`})
  }

  const createMockedStorage = (customVariable, storageName) => {
    const newStorage = buildCustomStorage(storageName, (p, v)=>{customVariable[p]=v}, (p)=>{return customVariable[p]}, (p)=>{customVariable[p] = undefined})
    const customStoragesMap = buildCustomStoragesMap(storageName, newStorage)
    return new Storage(storageName, undefined, customStoragesMap)
  }



  const storage = createMockedStorage(customVariable, storageName)

  createToken(storage)

  const getAuthData = () => {
    return {
      tokenObject: storage.getItem('tokenObject')
    }
  }

  const refreshTokenMethod = () => {
    return refreshTokenAuth()
  }

  const confirmAuthenticationCallback = (tokenObject) => {
    storage.setItem('tokenObject', tokenObject)
    console.log('CONFIRM AUTH')
  }

  const resetAuthenticationCallback = () => {
    storage.removeItem('tokenObject')
    console.log('RESET AUTH')
  }

  return {
    refreshTokenMethod,
    confirmAuthenticationCallback,
    resetAuthenticationCallback,
    getAuthData
  }
}

export default getConfigRefreshTokenByStorage