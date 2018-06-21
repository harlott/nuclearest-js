export default class RefreshTokenHandler {
    constructor(configRefreshToken) {
        this.configRefreshToken = Object.assign({}, configRefreshToken)

        if (!RefreshTokenHandler.instance){
            RefreshTokenHandler.instance = this;
            RefreshTokenHandler.instance.sem = require('semaphore')(1);
        }

        return RefreshTokenHandler.instance;
    }

    refreshToken(){
        const { refreshTokenMethod, confirmAuthenticationCallback, resetAuthenticationCallback } = this.configRefreshToken

        refreshTokenMethod().then((resp) => {
            console.log('refreshTokenMethod => resp.status => ', resp.status)
            resp
              .json()
              .then((json) => {
                confirmAuthenticationCallback(json)
                console.log(`REFRESH TOKEN GET AUTH DATA AFTER CONFIRM CALLBACK => ${JSON.stringify(this.configRefreshToken.getAuthData())}`)

                let event = new Event('token');
                window.dispatchEvent(event);
                RefreshTokenHandler.instance.sem = require('semaphore')(1)

              })
              .catch((jsonErr) => {
                console.error(jsonErr)
              })

          })
          .catch((e) => {
              if (e.ok === false) {
                RefreshTokenHandler.instance.sem = require('semaphore')(1)
                resetAuthenticationCallback(e)
              } else {
                  throw e
              }
        })
    }
}

