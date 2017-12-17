import isFunction from 'lodash/isFunction'

const defaultResponseParser = (response) => {
  if (!abort) {
    if (isFunction(response.text)){
      return response.text().then((text) => {
        let jsonBody
        let isJsonResponse = true
        try{
          jsonBody = JSON.parse(text)
        } catch(e){

        }
        if (!jsonBody){
          isJsonResponse = false
          jsonBody = {transformedValue: text}
        }
        return Promise.resolve({
              json: jsonBody,
              text: text,
              isJson: isJsonResponse,
              ok: response.ok,
              status: response.status,
              originalResponse: response,
          })
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
}

export default defaultResponseParser
