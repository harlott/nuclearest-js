NucleaRest JS v0.3.0-alpha
===================


A modern Javascript Rest API toolbox!
----------


#### Why NucleaRest Js

NucleaRest will be a set of Javascript Rest utilities and practices for SPA applications.

#### fetch


 This is a simple proxy method for standard fetch that use [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch)
 for all human browsers and [fetch-ponyfill](https://github.com/qubyte/fetch-ponyfill) for other cases.


 **Features:**
- fix Edge issues with HTTP methods response headers;
- timeout handling;
- all the responses with no content;
- broken server response: if the server return HTTP 503 with HTML body may be you need to handle the response without blocking the promises chain. This method force 'fetch'
   to return always a JSON response.


**Warnings**
Like isomorphic-fetch, this method is added as a global, even when using fetch-ponyfill to fix edge issues.
Currently the response object shape diff from isomorphic-fetch response.

```
{
      json,
      text,
      isJson,
      ok,
      status,
      originalResponse,
  }

```

Example:

```
 fetch('/users', {
     method: 'POST',
     timeout: 40000,
     headers: {'Content-Type': 'application/json'},
     body: JSON.stringify({name: 'Jack'})
   }
 )


```

#### Storage

This is a simple interface for WebStorage. You can create different instances with different storage/cookie and use always the same methods.
You can also create and use your own.

 **Features:**

 - handle storage disabled by Browser settings and Safari private session issue;
 - provide fallback strategy for basic storage settings (you can disable it);
 - simplify your application code refactoring :)    


 **Warnings**
 In fallback mode, remember to use it only for simple settings, like 'country' or 'lang'. Don't use it to store user settings or sensible infos.


 Example:

 - Use standard browser cookie for authentication data.
 - Please look at the fallbackStorage configuration.
 - With grantedProps, you can set the 'white list' for storage items.
 - If the Browser has cookies disabled, your web application doesn't broke.
 - If Storage try to set not permitted property, will execute callbackOnDisabled().
 - Use callbackOnDisabled() to show a popup, an alert, or do what you think is better for your application
 - In this case, the 'country' item will be setted in the default fallback storage.
 - The 'accessToken' property is not granted, so will be not setted and the application will show an alert.
 - P.S. the default fallback storage is only a global variable: don't use it to store a lot of data.              

 ```
  import Storage, {STORAGE_TYPES} from 'nuclearest-js/Storage'

  const cookieStorage = new Storage(STORAGE_TYPES.COOKIE, window.cookie, undefined, {enabled: true, 'grantedProps':['country'], callbackOnDisabled: () => {alert('COOKIE DISABLED')}})
  cookieStorage.setItem('country', 'IT')
  cookieStorage.setItem('accessToken', 'aaaa-bbbb-cccc-dddd')

 ```


#### Headers

This is a simple centralized system to handle the request HTTP headers. Provide few basic methods for oauth authentication

To handle headers parameters, you can apply CXA (clientData, xhrOptionsData, authData) pattern:

a web application can provide 3 types of parameters:

  - clientData: handle some configurations like 'applicationId', or some default values for some properties like '{lang: 'EN'}'
  - xhrOptionsData: handle timeout value, cors options...
  - authData: handle authentication data i.e.(oauth) 'tokenObject: {tokenType: "Bearer", accessToken: "1111-2222-3333-4444"}'


Example:



```
 import fetch from 'nuclearest-js/fetch'
 import Headers, {headersMap} from 'nuclearest-js/Headers'
 import CLIENT_DATA from 'your/path/CLIENT_DATA'

 let headers = new Headers()
                   .add()
                   .acceptApplicationJson()
                   .acceptLanguage('EN')
                   .custom(headersMap.CONTENT_TYPE, 'audio/base')
                   .use()

 fetch('/users', {
     method: 'POST',
     timeout: 40000,
     headers: headers,
     body: JSON.stringify({name: 'Jack'})
   }
 )


 headers
 .remove()
 .custom(headersMap.CONTENT_TYPE, 'audio/base')
 .acceptLanguage()
 .use()


 fetch('/contents', {
      method: 'POST',
      timeout: 40000,
      headers: headers,
      body: JSON.stringify({name: 'Jack'})
    }
  )


```


#### Authentication: refresh token processing

This is an utility to handle refresh authentication token processing.
The first unauthorized call pauses all the following, waiting for receiving new token object
Using es7 async await

Example

```
   import Storage, {STORAGE_TYPES} from 'nuclearest-js/Storage'
   import fetch from 'nuclearest-js/fetch'
   import Headers, {headersMap} from 'nuclearest-js/Headers'

   // In a real world authData,CookieStorage, Headers and Auth instances are imported from a service

   let authData = {
     tokenObject:{
       tokenType: 'Bearer',
       accessToken: 'a1b2-c3d4-e5f6-g7h8',
       refreshToken: 'k1k2-j3j4-l5l6-p7p8',
       expiresIn: '2000',
       scope: 'user.role'
     }
   }



   const cookieStorage = new Storage(STORAGE_TYPES.COOKIE,
                                     window.cookie,
                                     undefined,
                                     {
                                       enabled: true,
                                       'grantedProps': ['country'],
                                       callbackOnDisabled: () => {alert('COOKIE DISABLED')}
                                     })

   let headers = new Headers()
                    .add()
                    .oauthToken(authData.tokenObject)
                    .custom('x-application-id', clientData.applicationId)
                    .use()

   const refreshTokenApiCall = () => {
     return fetch('/my-refresh-token', {
       headers: headers,
       method: 'POST',
       body: JSON.stringify({
           refreshToken: authData.tokenObject.refreshToken
       })
     })
   }

   const confirmAuthenticationCallback = (tokenObject) => {
     cookieStorage.setItem('tokenObject', tokenObject)
     authData.tokenObject = Object.assign({}, tokenObject)
   }

   const resetAuthenticationCallback = () => {
     cookieStorage.removeItem('tokenObject')
     location.href = '/login'
   }

   const getAuthData = () => {
     return cookieStorage.getItem('tokenObject')
   }

   const auth = new Auth(refreshTokenApiCall,
                         confirmAuthenticationCallback,
                         resetAuthenticationCallback)

   const getContents = () => {
       return fetch('/contents', {
       headers: headers,
       method: 'GET'
     })
   }

   const processContents = async () => {
      try {
         const contentsResult = await auth.proxy(getAuthData, getContents)
         // Do your staff here to handle response
         const jsonResult = await contentsResult.json()
         console.log(JSON.stringify(jsonResult))
      } catch(error){
         // Do your staff here to handle exceptions
      }
   }

   processContents()

```



#### Next Releases
- fetch response object: no diff with original fetch   
- Runtime Mocking System
