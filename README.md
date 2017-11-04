NucleaRest JS v0.0.1-alpha
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

#### Next Releases
- fetch response object: no diff with original fetch   
- Authentication flow with refresh token
- Runtime Mocking System
