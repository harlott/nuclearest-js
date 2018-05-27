export default class RefreshTokenHandler {
    constructor(clientData) {
        this.clientData = Object.assign({}, clientData)

        if(!RefreshTokenHandler.instance){
            RefreshTokenHandler.instance = this;
            RefreshTokenHandler.instance.sem = require('semaphore')(1);
        }

        return RefreshTokenHandler.instance;
    }

    refreshToken(){
            this.clientData.configRefreshToken.refreshTokenMethod().then((resp) => {
                this.clientData.configRefreshToken.confirmAuthenticationCallback(resp.jsonBody)
                let event = new Event('token');
                window.dispatchEvent(event);
                RefreshTokenHandler.instance.sem = require('semaphore')(1)
            }).catch((e) => {
                if (e.ok === false) {
                    this.clientData.configRefreshToken.resetAuthenticationCallback(e)
                } else {
                    throw e
                }
            })
    }
}

