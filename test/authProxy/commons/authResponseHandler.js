import authProxy from '../../../src/authProxy'

function  authResponseHandler (configRefreshToken, apiMethod, successCallback, errorCallback) {
  return new Promise((resolve, reject) => {
    try {
      const standardSuccessCallback = (response) => {
        resolve(response);
      };

      const standardErrorCallback = (response) => {
        reject(response);
      };

      authProxy(configRefreshToken, apiMethod, successCallback || standardSuccessCallback, errorCallback || standardErrorCallback);
    } catch (e) {
      reject(e);
    }
  });
}

export default authResponseHandler