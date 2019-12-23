NucleaRest JS v0.7.1-alpha
===================

[![Build Status](https://travis-ci.org/harlott/nuclearest-js.svg?branch=master)](https://travis-ci.org/harlott/nuclearest-js)  [![Coverage Status](https://coveralls.io/repos/github/harlott/nuclearest-js/badge.svg?branch=master)](https://coveralls.io/github/harlott/nuclearest-js?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/harlott/nuclearest-js.svg)](https://greenkeeper.io/)


Personal Javascript Rest API toolbox
----------


#### Why NucleaRest Js

NucleaRest will be a set of Javascript Rest utilities and practices for SPA applications.

#### fetch (enhanced)


 This is a proxy method to enhance standard fetch.
  
 **Features:**
 - universal: use [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch) 
 - fix Edge issues with HTTP methods response headers in browser context using [fetch-ponyfill](https://github.com/qubyte/fetch-ponyfill)
 - timeout handling;
 - parsing body response: use it or not(default), use default (isEmpty, isJson, isText flags) or use your own
 - Future: XHR abort handling

 
**Warnings**
Like isomorphic-fetch, this method is added as a global, even when using fetch-ponyfill to fix edge issues.

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


Example:



```
 import fetch from 'nuclearest-js/fetch'
 import Headers, {headersMap} from 'nuclearest-js/Headers'

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

   // In a real world CookieStorage, Headers and Auth instances are imported from a service

   const cookieStorage = new Storage(STORAGE_TYPES.COOKIE,
                                     window.cookie,
                                     undefined,
                                     {
                                       enabled: true,
                                       'grantedProps': ['country'],
                                       callbackOnDisabled: () => {alert('COOKIE DISABLED')}
                                     })

   const getAuthData = () => {
     return cookieStorage.getItem('tokenObject')
   }

   let headers = new Headers()
                    .add()
                    .oauthToken(get(getAuthData(), 'tokenObject.accessToken'))
                    .custom('x-application-id', clientData.applicationId)
                    .use()

   const refreshTokenApiCall = () => {
     return fetch('/my-refresh-token', {
       headers: headers,
       method: 'POST',
       body: JSON.stringify({
           refreshToken: get(getAuthData(), 'tokenObject.refreshToken')
       })
     })
   }

   const confirmAuthenticationCallback = (tokenObject) => {
     cookieStorage.setItem('tokenObject', tokenObject)
   }

   const resetAuthenticationCallback = () => {
     cookieStorage.removeItem('tokenObject')
     location.href = '/login'
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
- fetch abort handling   
- Runtime Api Mocking System


#### Credits
- [harlott](https://github.com/harlott)
- [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch)
- [fetch-ponyfill](https://github.com/qubyte/fetch-ponyfill)

#### Refresh our knowledge

fetch
- [fetch response](https://fetch.spec.whatwg.org/#responses)
- [Abortable fetch](https://developers.google.com/web/updates/2017/09/abortable-fetch)

Exploring promises and ES7 async/await

- [Promises (Mozilla)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
- [Using promises to await triggered events](https://stackoverflow.com/questions/43084557/using-promises-to-await-triggered-events)
- [How to return values from an event handler in a promise?](https://stackoverflow.com/questions/43084557/using-promises-to-await-triggered-events)
