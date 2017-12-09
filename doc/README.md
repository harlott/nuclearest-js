# fetch.js API documentation

<!-- div class="toc-container" -->

<!-- div -->

## `fetch`
* <a href="#fetch">`fetch`</a>

<!-- /div -->

<!-- /div -->

<!-- div class="doc-container" -->

<!-- div -->

## `fetch`

<!-- div -->

<h3 id="fetch"><a href="#fetch">#</a>&nbsp;<code>fetch(url, options)</code></h3>
[&#x24C8;](https://github.com/username/project/blob/master/my.js#L45 "View in source") [&#x24C9;][1]

This is a proxy method for standard fetch that use isomorphic-fetch
for all human browsers and fetch-ponyfill for other cases.
Features:<br>
1) fix Edge issues with HTTP methods response headers;
2) timeout handling;
3) all the responses with no content;
4) broken server response: if the server return HTTP `503` may be you need to handle the response without blocking the promises chain. This method force 'fetch' to return always a JSON response.

#### Arguments
1. `url` *(String)*: The request url
2. `options` *(Object)*: The standard fetch options object

#### Example
```js
fetch('/users', {
     method: 'POST',
     timeout: 40000,
     headers: {'Content-Type': 'application/json'},
     body: JSON.stringify({name: 'Jack'})
   }
)
```
---

<!-- /div -->

<!-- /div -->

<!-- /div -->

 [1]: #fetch "Jump back to the TOC."
