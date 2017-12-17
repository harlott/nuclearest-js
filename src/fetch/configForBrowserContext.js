const configForBrowserContext = () => {
  if (navigator !== undefined){
    const userAgent = get(navigator, 'userAgent')
    const isEdge =  /Edge\//.test(userAgent)
    if (isEdge) window.fetch = undefined
    if (isEdge === true){
        const fetchPonyfill = require('fetch-ponyfill')
        return fetchPonyfill().fetch
    }
  }
  return
}


export default configForBrowserContext
