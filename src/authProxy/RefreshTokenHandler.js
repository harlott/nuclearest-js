export default class RefreshTokenHandler {
    constructor(configRefreshTokentData) {
        this.configRefreshTokentData = Object.assign({}, configRefreshTokentData)

        if(!RefreshTokenHandler.instance){
            RefreshTokenHandler.instance = this;
            RefreshTokenHandler.instance.sem = require('semaphore')(1);
        }

        return RefreshTokenHandler.instance;
    }

    refreshToken(){
        const { refreshTokenMethod, confirmAuthenticationCallback, resetAuthenticationCallback } = this.configRefreshToken
        refreshTokenMethod().then((resp) => {
            confirmAuthenticationCallback(resp.jsonBody)
            let event = new Event('token');
            window.dispatchEvent(event);
            RefreshTokenHandler.instance.sem = require('semaphore')(1)
        })
        .catch((e) => {
            if (e.ok === false) {
                resetAuthenticationCallback(e)
            } else {
                throw e
            }
        })
    }
}

