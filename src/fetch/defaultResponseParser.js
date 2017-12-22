import isFunction from 'lodash/isFunction'
import cloneDeep from 'lodash/cloneDeep'

const defaultResponseParser = (response) => {
  if (isFunction(response.text)){
    let parsedResponse = cloneDeep(response)
    let jsonBody
    return response.text().then((text) => {
      try {
        jsonBody = JSON.parse(text)
        parsedResponse.json = () =>  {
          return Promise.resolve(jsonBody)
        }
      } catch(e){}
      if (!jsonBody){
        parsedResponse.isJson = false
        if (text !== ''){
          parsedResponse.isText = true
          parsedResponse.text = ''
        }
      }
      return Promise.resolve(parsedResponse)
    }, (err) => {
      if (err){
          Promise.reject(new Error(`Error on converting from response into jSON: ${err.stack}`))
      }
      return Promise.reject(serverErrorResponse)
    });
  } else {
    return Promise.reject(serverErrorResponse )
  }
}

export default defaultResponseParser
