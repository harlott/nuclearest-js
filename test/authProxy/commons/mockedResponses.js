const MOCKED_RESPONSES = {
  NOT_AUTH: {
    ok: false,
    status: 401,
    json: () => {
      return new Promise((jsonResolve, jsonReject) => {
        jsonReject({
          code: 'NOT_AUTHORIZED',
          message: 'Not authorized!'
        })
      })
    }
  },
  GENERIC_SUCCESS: {
    ok: true,
    status: 200,
    json: () => {
      return new Promise((jsonResolve) => {
        jsonResolve({
          a: 1
        })
      })
    }
  },
  GENERIC_ERROR: {
    ok: false,
    status: 405,
    json: () => {
      return Promise.reject({code: 'METHOD_NOT ALLOWED'})
    }
  },
  REFRESH_TOKEN_GRANTED: {
    ok: true,
    status: 200,
    json: () => {
      return new Promise((jsonResolve) => {
        jsonResolve({
          accessToken: '2222',
          refreshToken: '3333'
        })
      })
    }
  }
}

export default MOCKED_RESPONSES