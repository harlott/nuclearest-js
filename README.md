NucleaRest JS v0.0.1-alpha
===================


A modern Javascript Rest API toolbox!
----------


#### Why NucleaRest Js

NucleaRest will be a set of Javascript Rest utilities for SPA applications.

#### fetch


 This is a proxy method for standard fetch that use isomorphic-fetch
 for all human browsers and fetch-ponyfill for other cases.
 **Features:**
    - fix Edge issues with HTTP methods response headers;
    - timeout handling;
    - all the responses with no content;
    - broken server response: if the server return HTTP 503 may be you need to handle
       the response without blocking the promises chain. This method force 'fetch'
       to return always a JSON response.

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
